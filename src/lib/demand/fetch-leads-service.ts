import {
  explainDemandIntent,
  hardExcludeDemandPost,
  leadPassesFetchRelevanceGate,
  scoreDemandLead,
  signalBandForIntentScore,
} from "./intent-score";
import { getLeadProvider } from "./providers/registry";
import type {
  CommunitySourceId,
  DemandLead,
  DemandLeadType,
  DemandParsedIntent,
} from "./types";
import type { ProviderSearchHit } from "./providers/types";

const DAY = 86400;
const HOUR = 3600;
const MIN_SCORE = 62;
const MAX_LEADS = 8;
const MIN_CONTENT_WORDS = 18;

function postWordCount(hit: ProviderSearchHit): number {
  const blob = `${hit.title}\n${hit.snippet}`.trim();
  return blob.split(/\s+/).filter(Boolean).length;
}

function normalizeUrl(url: string): string {
  try {
    const u = new URL(url);
    u.hash = "";
    return u.toString();
  } catch {
    return url;
  }
}

function maxAgeSeconds(createdUtc: number | null, now: number): number | null {
  if (createdUtc == null || !Number.isFinite(createdUtc)) return null;
  return now - createdUtc;
}

/** Never surface Reddit hits older than 7 days. */
function withinMaxAge(utc: number | null, now: number): boolean {
  const age = maxAgeSeconds(utc, now);
  if (age == null) return false;
  return age >= 0 && age <= 7 * DAY;
}

function withinHours(utc: number | null, now: number, hours: number): boolean {
  const age = maxAgeSeconds(utc, now);
  if (age == null) return false;
  return age >= 0 && age <= hours * HOUR;
}

function withinDays(utc: number | null, now: number, days: number): boolean {
  const age = maxAgeSeconds(utc, now);
  if (age == null) return false;
  return age >= 0 && age <= days * DAY;
}

/** Prefer last 72h; if fewer than 3 hits, widen to full 7d pool (still ≤7d). */
function applyTimeWindow(hits: ProviderSearchHit[], now: number): ProviderSearchHit[] {
  const max7 = hits.filter((h) => withinMaxAge(h.createdUtc, now));
  const fresh72 = max7.filter((h) => withinHours(h.createdUtc, now, 72));
  if (fresh72.length >= 3) return fresh72;
  const week = max7.filter((h) => withinDays(h.createdUtc, now, 7));
  return week;
}

function leadTypeForScore(score: number): DemandLeadType {
  return score >= 75 ? "high_intent" : "problem";
}

function toDemandLead(hit: ProviderSearchHit, product: string): DemandLead {
  const intentScore = scoreDemandLead({
    title: hit.title,
    snippet: hit.snippet,
    createdUtc: hit.createdUtc,
    numComments: hit.numComments,
    productHint: product,
  });
  const whyMatch = explainDemandIntent(hit.title, hit.snippet, intentScore);
  return {
    ...hit,
    leadType: leadTypeForScore(intentScore),
    signalBand: signalBandForIntentScore(intentScore),
    intentScore,
    whyMatch,
    replyDraft: "",
  };
}

/** High-intent first, then problem tier; cap length while keeping a mix when both exist. */
function orderAndCapLeads(leads: DemandLead[]): DemandLead[] {
  const highs = leads.filter((l) => l.intentScore >= 75);
  const probs = leads.filter((l) => l.intentScore < 75);
  if (highs.length === 0) {
    return probs.slice(0, MAX_LEADS).map((l) => ({ ...l, leadType: "problem" as const }));
  }
  if (probs.length === 0) {
    return highs.slice(0, MAX_LEADS).map((l) => ({ ...l, leadType: "high_intent" as const }));
  }
  const highPick = highs.slice(0, 7);
  const room = MAX_LEADS - highPick.length;
  const probPick = probs.slice(0, Math.min(7, room));
  let merged = [...highPick, ...probPick];
  if (merged.length < MAX_LEADS) {
    const moreHigh = highs.slice(highPick.length, highPick.length + (MAX_LEADS - merged.length));
    merged = [...merged, ...moreHigh];
  }
  return merged.slice(0, MAX_LEADS).map((l) => ({
    ...l,
    leadType: leadTypeForScore(l.intentScore),
  }));
}

/**
 * Dedupe → max 7d → time window (72h if enough, else 7d) → hard excludes
 * → score → keep score ≥ MIN_SCORE → strict keyword + parsed-intent relevance gate
 * → sort → cap (mixed tiers).
 * No mock leads — empty list is preferred over weak or off-topic matches.
 */
export async function fetchDemandLeadsFromQueries(
  product: string,
  queries: string[],
  source: CommunitySourceId,
  parsedIntent?: DemandParsedIntent | null,
): Promise<{
  leads: DemandLead[];
  usedMock: boolean;
  notice?: string;
  transportFailed?: boolean;
}> {
  const provider = getLeadProvider(source);
  const perQueryLimit = 25;
  const settled = await Promise.allSettled(
    queries.map((q) => provider.search(q, { limit: perQueryLimit })),
  );

  const allRejected =
    settled.length > 0 && settled.every((s) => s.status === "rejected");

  const merged: ProviderSearchHit[] = [];
  const seen = new Set<string>();

  for (const s of settled) {
    if (s.status !== "fulfilled") continue;
    for (const hit of s.value) {
      const key = normalizeUrl(hit.url);
      if (seen.has(key)) continue;
      seen.add(key);
      merged.push(hit);
    }
  }

  const now = Date.now() / 1000;

  const notTooOld = merged.filter((h) => withinMaxAge(h.createdUtc, now));
  const noStale = notTooOld.filter(
    (h) => !hardExcludeDemandPost(`${h.title}\n${h.snippet}`),
  );

  const timeScoped = applyTimeWindow(noStale, now).filter(
    (h) => postWordCount(h) >= MIN_CONTENT_WORDS,
  );

  const scored = timeScoped
    .map((h) => toDemandLead(h, product))
    .filter((l) => l.intentScore >= MIN_SCORE)
    .filter((l) => leadPassesFetchRelevanceGate(l.title, l.snippet, product, parsedIntent));

  scored.sort((a, b) => {
    const tierA = a.intentScore >= 75 ? 1 : 0;
    const tierB = b.intentScore >= 75 ? 1 : 0;
    if (tierA !== tierB) return tierB - tierA;
    if (b.intentScore !== a.intentScore) return b.intentScore - a.intentScore;
    const ta = a.createdUtc ?? 0;
    const tb = b.createdUtc ?? 0;
    return tb - ta;
  });

  const top = orderAndCapLeads(scored);

  const notice = top.length === 0 ? "no_direct_conversations" : undefined;

  return {
    leads: top,
    usedMock: false,
    ...(notice ? { notice } : {}),
    ...(allRejected ? { transportFailed: true as const } : {}),
  };
}
