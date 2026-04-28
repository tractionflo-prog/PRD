import {
  explainDemandIntent,
  hardExcludeDemandPost,
  scoreDemandLead,
} from "@/lib/demand/intent-score";
import { getLeadProvider } from "@/lib/demand/providers/registry";
import type { ProviderSearchHit } from "@/lib/demand/providers/types";
import type { OpportunityItem, OpportunitySource } from "./feed-types";

const MAX_ITEMS = 16;
const PER_QUERY_LIMIT = 60;
const MIN_SCORE = 44;
const HIGH_SCORE = 76;
const MIN_VISIBLE_ITEMS = 10;

const QUERY_SET = [
  "how do you manage",
  "what do you use for",
  "anyone using",
  "struggling with",
  "tired of",
  "spreadsheet",
  "manual process",
  "follow up",
  "client management",
  "crm",
  "workflow",
] as const;

const IS_DEV = process.env.NODE_ENV !== "production";

type RejectedDebugItem = {
  source: OpportunitySource;
  title: string;
  url: string;
  intentScore: number;
  matchedTerms: string[];
  rejectedReason: string;
};

export type OpportunitiesProviderDebug = {
  name: string;
  status: "ok" | "partial" | "error";
  rawCount: number;
  afterFilterCount: number;
  finalCount: number;
  error?: string;
};

export type OpportunitiesDebugSnapshot = {
  providers: OpportunitiesProviderDebug[];
  sampleItems: RejectedDebugItem[];
};

function normalizeUrl(url: string): string {
  try {
    const u = new URL(url);
    u.hash = "";
    return u.toString();
  } catch {
    return url;
  }
}

function byRecencyDesc(a: ProviderSearchHit, b: ProviderSearchHit): number {
  const ta = a.createdUtc ?? 0;
  const tb = b.createdUtc ?? 0;
  return tb - ta;
}

function sourceFromHit(hit: ProviderSearchHit): OpportunitySource {
  if (hit.source === "reddit") return "Reddit";
  return "Community";
}

function clip(text: string, max = 280): string {
  const t = text.trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max - 1).trimEnd()}…`;
}

function composeSuggestedReply(hit: ProviderSearchHit, score: number): string {
  const context = explainDemandIntent(hit.title, hit.snippet, score)
    .split("\n")
    .map((line) => line.replace(/^•\s*/, "").trim())
    .filter(Boolean)[0];
  const opener = context
    ? `Saw your post and this stood out: ${context.toLowerCase()}.`
    : "Saw your post and thought this might help.";
  return `${opener} Built a simple workflow that removes spreadsheet follow-ups and keeps replies in one place. Want a quick walkthrough?`;
}

function getMatchedTerms(title: string, snippet: string, score: number): string[] {
  return explainDemandIntent(title, snippet, score)
    .split("\n")
    .map((line) => line.replace(/^•\s*/, "").trim())
    .filter(Boolean)
    .slice(0, 3);
}

function hasHighIntentAsk(text: string): boolean {
  return /\b(recommend|suggest|what do you use|how do you manage|anyone using|which tool|what tool|alternatives?)\b/i.test(
    text,
  );
}

function hasMediumIntentPain(text: string): boolean {
  return /\b(struggling with|tired of|manual process|spreadsheet|messy|chaos|workflow pain|follow up|follow-up|not scalable|frustrated)\b/i.test(
    text,
  );
}

function toOpportunity(
  hit: ProviderSearchHit,
  minScore: number,
): { item: OpportunityItem | null; rejected?: RejectedDebugItem } {
  const body = `${hit.title}\n${hit.snippet}`.trim();
  if (hardExcludeDemandPost(body)) {
    return {
      item: null,
      rejected: {
        source: sourceFromHit(hit),
        title: clip(hit.title, 180),
        url: hit.url,
        intentScore: 0,
        matchedTerms: [],
        rejectedReason: "hard_exclude_noise",
      },
    };
  }
  const score = scoreDemandLead({
    title: hit.title,
    snippet: hit.snippet,
    createdUtc: hit.createdUtc,
    numComments: hit.numComments,
  });
  if (score < minScore) {
    return {
      item: null,
      rejected: {
        source: sourceFromHit(hit),
        title: clip(hit.title, 180),
        url: hit.url,
        intentScore: score,
        matchedTerms: getMatchedTerms(hit.title, hit.snippet, score),
        rejectedReason: `score_below_threshold_${minScore}`,
      },
    };
  }

  const signalText = `${hit.title}\n${hit.snippet}`;
  const highAsk = hasHighIntentAsk(signalText);
  const mediumPain = hasMediumIntentPain(signalText);
  if (!highAsk && !mediumPain) {
    return {
      item: null,
      rejected: {
        source: sourceFromHit(hit),
        title: clip(hit.title, 180),
        url: hit.url,
        intentScore: score,
        matchedTerms: getMatchedTerms(hit.title, hit.snippet, score),
        rejectedReason: "no_intent_signal",
      },
    };
  }
  const postText = hit.snippet && hit.snippet !== hit.title ? `${hit.title} — ${hit.snippet}` : hit.title;
  return {
    item: {
      id: hit.id,
      postText: clip(postText),
      source: sourceFromHit(hit),
      sourceUrl: hit.url,
      sourceLabel: hit.source === "reddit" ? `r/${hit.subreddit}` : "Community",
      createdUtc: hit.createdUtc,
      intentLabel: highAsk && score >= HIGH_SCORE ? "High" : "Medium",
      intentScore: score,
      suggestedReply: composeSuggestedReply(hit, score),
    },
  };
}

function mergeUniqueById(items: OpportunityItem[]): OpportunityItem[] {
  const out: OpportunityItem[] = [];
  const seen = new Set<string>();
  for (const item of items) {
    if (seen.has(item.id)) continue;
    seen.add(item.id);
    out.push(item);
  }
  return out;
}

function summarizeProviderStatus(settled: PromiseSettledResult<ProviderSearchHit[]>[]): {
  status: "ok" | "partial" | "error";
  error?: string;
} {
  const rejected = settled.filter((s) => s.status === "rejected");
  if (rejected.length === 0) return { status: "ok" };
  if (rejected.length === settled.length) {
    const first = rejected[0];
    const err =
      first && first.status === "rejected"
        ? first.reason instanceof Error
          ? first.reason.message
          : String(first.reason)
        : "all_queries_failed";
    return { status: "error", error: err };
  }
  const first = rejected[0];
  const err =
    first && first.status === "rejected"
      ? first.reason instanceof Error
        ? first.reason.message
        : String(first.reason)
      : "partial_query_failures";
  return { status: "partial", error: err };
}

async function runFeedPipeline(options?: {
  minScore?: number;
  rejectedSampleLimit?: number;
}): Promise<{
  items: OpportunityItem[];
  unavailable?: true;
  debug: OpportunitiesDebugSnapshot;
}> {
  const minScore = options?.minScore ?? MIN_SCORE;
  const rejectedSampleLimit = options?.rejectedSampleLimit ?? 5;
  const provider = getLeadProvider("reddit");
  console.info("[opportunities] provider start", {
    provider: provider.id,
    queryCount: QUERY_SET.length,
    perQueryLimit: PER_QUERY_LIMIT,
    minScore,
  });
  const settled = await Promise.allSettled(
    QUERY_SET.map((q) => provider.search(q, { limit: PER_QUERY_LIMIT })),
  );
  const allRejected = settled.length > 0 && settled.every((s) => s.status === "rejected");
  const statusInfo = summarizeProviderStatus(settled);

  const merged: ProviderSearchHit[] = [];
  const seen = new Set<string>();
  let rawCount = 0;
  for (const res of settled) {
    if (res.status !== "fulfilled") continue;
    const hits = [...res.value].sort(byRecencyDesc);
    rawCount += hits.length;
    for (const hit of hits) {
      const key = normalizeUrl(hit.url);
      if (seen.has(key)) continue;
      seen.add(key);
      merged.push(hit);
    }
  }

  console.info("[opportunities] provider end", {
    provider: provider.id,
    rawCount,
    dedupedCount: merged.length,
    status: statusInfo.status,
    error: statusInfo.error,
  });

  const rejectedSamples: RejectedDebugItem[] = [];
  const strict = merged
    .map((hit) => toOpportunity(hit, minScore))
    .map((entry) => {
      if (!entry.item && entry.rejected && rejectedSamples.length < rejectedSampleLimit) {
        rejectedSamples.push(entry.rejected);
      }
      return entry.item;
    })
    .filter((x): x is OpportunityItem => Boolean(x));

  const fallback48 = merged
    .map((hit) => toOpportunity(hit, 48))
    .map((entry) => entry.item)
    .filter((x): x is OpportunityItem => Boolean(x));

  const fallback42 = merged
    .map((hit) => toOpportunity(hit, 42))
    .map((entry) => entry.item)
    .filter((x): x is OpportunityItem => Boolean(x));

  const fallback42NoGate = merged
    .map((hit) => toOpportunity(hit, 42))
    .map((entry) => entry.item)
    .filter((x): x is OpportunityItem => Boolean(x));

  const fallback30NoGate = merged
    .map((hit) => toOpportunity(hit, 30))
    .map((entry) => entry.item)
    .filter((x): x is OpportunityItem => Boolean(x));

  const filtered = mergeUniqueById([
    ...strict,
    ...fallback48,
    ...fallback42,
    ...(strict.length < MIN_VISIBLE_ITEMS ? fallback42NoGate : []),
    ...(strict.length < MIN_VISIBLE_ITEMS ? fallback30NoGate : []),
  ]);

  console.info("[opportunities] after scoring/filter", {
    threshold: minScore,
    afterFilterCount: filtered.length,
    strictCount: strict.length,
    fallback48: fallback48.length,
    fallback42: fallback42.length,
    fallback42NoGate: fallback42NoGate.length,
    fallback30NoGate: fallback30NoGate.length,
  });

  const highCount = filtered.filter((x) => x.intentLabel === "High").length;
  const mediumCount = filtered.filter((x) => x.intentLabel === "Medium").length;
  const final = filtered
    .sort((a, b) => {
      if (b.intentScore !== a.intentScore) return b.intentScore - a.intentScore;
      return (b.createdUtc ?? 0) - (a.createdUtc ?? 0);
    })
    .slice(0, MAX_ITEMS);

  console.info("[opportunities] final count", {
    finalCount: final.length,
    highCount,
    mediumCount,
  });

  if (IS_DEV && filtered.length === 0 && rejectedSamples.length > 0) {
    console.info(
      "[opportunities][dev] top rejected samples",
      rejectedSamples.map((s) => ({
        score: s.intentScore,
        rejectedReason: s.rejectedReason,
        matchedTerms: s.matchedTerms,
        title: s.title,
      })),
    );
  }

  return {
    items: final,
    ...(allRejected ? { unavailable: true as const } : {}),
    debug: {
      providers: [
        {
          name: provider.id,
          status: statusInfo.status,
          rawCount,
          afterFilterCount: filtered.length,
          finalCount: final.length,
          ...(statusInfo.error ? { error: statusInfo.error } : {}),
        },
      ],
      sampleItems: rejectedSamples,
    },
  };
}

/**
 * Public feed source pipeline.
 * - Uses live provider data only (no synthetic/fallback rows).
 * - Adapters can be extended with X/community providers later.
 */
export async function getPublicOpportunitiesFeed(): Promise<{
  items: OpportunityItem[];
  updatedAt: string;
  unavailable?: true;
  debugEmptyReason?: string;
}> {
  const out = await runFeedPipeline();
  return {
    items: out.items,
    updatedAt: new Date().toISOString(),
    ...(out.unavailable ? { unavailable: true as const } : {}),
    ...(IS_DEV && out.items.length === 0
      ? { debugEmptyReason: out.unavailable ? "provider_unavailable" : "filtered_out_by_quality" }
      : {}),
  };
}

export async function getPublicOpportunitiesFeedDebug(): Promise<OpportunitiesDebugSnapshot> {
  const out = await runFeedPipeline({ minScore: 62, rejectedSampleLimit: 5 });
  return out.debug;
}
