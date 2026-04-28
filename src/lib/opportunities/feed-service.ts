import {
  explainDemandIntent,
  hardExcludeDemandPost,
  scoreDemandLead,
} from "@/lib/demand/intent-score";
import { getLeadProvider } from "@/lib/demand/providers/registry";
import type { ProviderSearchHit } from "@/lib/demand/providers/types";
import { getServiceSupabase } from "@/lib/supabase/server";
import { OFFLINE_OPPORTUNITY_SEED } from "./offline-seed";
import type { OpportunityItem, OpportunitySource } from "./feed-types";

const MAX_ITEMS = 16;
const MIN_SCORE = 44;
const HIGH_SCORE = 76;
const MIN_VISIBLE_ITEMS = 10;
const IS_DEV = process.env.NODE_ENV !== "production";
const IS_PROD = !IS_DEV;
const PER_QUERY_LIMIT = IS_PROD ? 24 : 60;
const FEED_TIMEOUT_MS = IS_PROD ? 6_500 : 8_500;
const CACHE_MAX_AGE_SEC = Math.max(
  30,
  Number(process.env.OPPORTUNITIES_CACHE_MAX_AGE_SEC ?? (IS_PROD ? 900 : 120)),
);
const CACHE_DISABLED = process.env.OPPORTUNITIES_DISABLE_CACHE === "1";
const OPPORTUNITIES_TABLE = "opportunities_feed_items";

const QUERY_SET_FULL = [
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
const QUERY_SET = IS_PROD ? QUERY_SET_FULL.slice(0, 7) : QUERY_SET_FULL;
const COMMUNITY_FALLBACK_API = "https://hn.algolia.com/api/v1/search_by_date";

type RejectedDebugItem = {
  source: OpportunitySource;
  title: string;
  url: string;
  intentScore: number;
  matchedTerms: string[];
  rejectedReason: string;
};

type OpportunityCacheRow = {
  item_id: string;
  post_text: string;
  source: OpportunitySource;
  source_url: string;
  source_label: string;
  created_utc: number | null;
  intent_label: "High" | "Medium";
  intent_score: number;
  suggested_reply: string;
  captured_at: string;
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
    u.search = "";
    u.hash = "";
    return u.toString();
  } catch {
    return url;
  }
}

function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .replace(/https?:\/\/\S+/g, " ")
    .replace(/[^\w\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function contentFingerprint(title: string, snippet: string): string {
  const combined = normalizeText(`${title} ${snippet}`.trim());
  if (!combined) return "";
  // Keep enough signal words while allowing tiny copy variations.
  const tokens = combined.split(" ").filter((token) => token.length > 2);
  return tokens.slice(0, 24).join(" ");
}

function tokenSet(text: string): Set<string> {
  return new Set(
    normalizeText(text)
      .split(" ")
      .filter((token) => token.length > 2),
  );
}

function jaccardSimilarity(a: Set<string>, b: Set<string>): number {
  if (a.size === 0 || b.size === 0) return 0;
  let intersection = 0;
  for (const t of a) {
    if (b.has(t)) intersection += 1;
  }
  const union = a.size + b.size - intersection;
  return union > 0 ? intersection / union : 0;
}

function isNearDuplicatePostText(a: string, b: string): boolean {
  const na = normalizeText(a);
  const nb = normalizeText(b);
  if (!na || !nb) return false;
  if (na === nb) return true;
  if (na.length > 100 && nb.length > 100 && (na.includes(nb) || nb.includes(na))) return true;
  const sim = jaccardSimilarity(tokenSet(na), tokenSet(nb));
  return sim >= 0.78;
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

function toCacheRow(item: OpportunityItem): Omit<OpportunityCacheRow, "captured_at"> {
  return {
    item_id: item.id,
    post_text: item.postText,
    source: item.source,
    source_url: item.sourceUrl,
    source_label: item.sourceLabel,
    created_utc: item.createdUtc,
    intent_label: item.intentLabel,
    intent_score: item.intentScore,
    suggested_reply: item.suggestedReply,
  };
}

function fromCacheRow(row: OpportunityCacheRow): OpportunityItem {
  return {
    id: row.item_id,
    postText: row.post_text,
    source: row.source,
    sourceUrl: row.source_url,
    sourceLabel: row.source_label,
    createdUtc: row.created_utc,
    intentLabel: row.intent_label,
    intentScore: row.intent_score,
    suggestedReply: row.suggested_reply,
  };
}

async function readOpportunitiesCache(): Promise<{
  items: OpportunityItem[];
  capturedAt: string | null;
}> {
  const supabase = getServiceSupabase();
  if (!supabase) return { items: [], capturedAt: null };
  const { data, error } = await supabase
    .from(OPPORTUNITIES_TABLE)
    .select(
      "item_id, post_text, source, source_url, source_label, created_utc, intent_label, intent_score, suggested_reply, captured_at",
    )
    .order("intent_score", { ascending: false })
    .order("created_utc", { ascending: false })
    .limit(Math.max(MAX_ITEMS, MIN_VISIBLE_ITEMS));
  if (error) {
    console.warn("[opportunities] cache read failed", error.message);
    return { items: [], capturedAt: null };
  }
  const rows = (data ?? []) as OpportunityCacheRow[];
  const capturedAt = rows[0]?.captured_at ?? null;
  return {
    items: mergeUniqueOpportunities(rows.map(fromCacheRow)).slice(
      0,
      Math.max(MAX_ITEMS, MIN_VISIBLE_ITEMS),
    ),
    capturedAt,
  };
}

function isCacheFresh(capturedAt: string | null): boolean {
  if (!capturedAt) return false;
  const ts = Date.parse(capturedAt);
  if (!Number.isFinite(ts)) return false;
  return Date.now() - ts <= CACHE_MAX_AGE_SEC * 1000;
}

async function writeOpportunitiesCache(items: OpportunityItem[]): Promise<void> {
  const supabase = getServiceSupabase();
  if (!supabase) return;
  const kept = mergeUniqueOpportunities(items).slice(0, Math.max(MAX_ITEMS, MIN_VISIBLE_ITEMS));
  const stamp = new Date().toISOString();
  const rows = kept.map((item) => ({
    ...toCacheRow(item),
    captured_at: stamp,
  }));
  const { error: deleteError } = await supabase
    .from(OPPORTUNITIES_TABLE)
    .delete()
    .neq("item_id", "__none__");
  if (deleteError) {
    console.warn("[opportunities] cache clear failed", deleteError.message);
    return;
  }
  if (rows.length === 0) return;
  const { error: insertError } = await supabase.from(OPPORTUNITIES_TABLE).insert(rows);
  if (insertError) {
    console.warn("[opportunities] cache write failed", insertError.message);
  }
}

type CommunityFallbackHit = {
  objectID?: string;
  title?: string | null;
  story_title?: string | null;
  story_text?: string | null;
  comment_text?: string | null;
  url?: string | null;
  story_url?: string | null;
  created_at_i?: number | null;
};

type CommunityFallbackResponse = {
  hits?: CommunityFallbackHit[];
};

async function fetchCommunityFallbackItems(): Promise<OpportunityItem[]> {
  const query = "crm OR lead OR client OR workflow OR automate OR spreadsheet";
  const params = new URLSearchParams({
    query,
    tags: "story",
    hitsPerPage: "24",
  });
  const url = `${COMMUNITY_FALLBACK_API}?${params.toString()}`;
  const res = await fetch(url, {
    headers: { Accept: "application/json" },
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`community_fallback_http_${res.status}`);
  const json = (await res.json().catch(() => null)) as CommunityFallbackResponse | null;
  const hits = Array.isArray(json?.hits) ? json.hits : [];
  const out: OpportunityItem[] = [];
  for (const h of hits) {
    const urlValue = (h.url || h.story_url || "").trim();
    const titleValue = (h.title || h.story_title || "").trim();
    const snippetValue = (h.story_text || h.comment_text || "").trim();
    if (!urlValue || !titleValue) continue;
    const postText = snippetValue ? `${titleValue} — ${snippetValue}` : titleValue;
    const score = scoreDemandLead({
      title: titleValue,
      snippet: snippetValue || titleValue,
      createdUtc: typeof h.created_at_i === "number" ? h.created_at_i : null,
      numComments: 0,
    });
    out.push({
      id: `community:${h.objectID || normalizeUrl(urlValue)}`,
      postText: clip(postText),
      source: "Community",
      sourceUrl: urlValue,
      sourceLabel: "Hacker News",
      createdUtc: typeof h.created_at_i === "number" ? h.created_at_i : null,
      intentLabel: score >= HIGH_SCORE ? "High" : "Medium",
      intentScore: Math.max(44, score),
      suggestedReply:
        "Saw your thread and can share a practical workflow that reduces manual follow-ups and keeps client conversations organized. Want the short version?",
    });
    if (out.length >= MAX_ITEMS) break;
  }
  return mergeUniqueOpportunities(out);
}

function getOfflineSeedItems(): OpportunityItem[] {
  return OFFLINE_OPPORTUNITY_SEED.map((row, index) => ({
    id: `offline:${index + 1}`,
    postText: clip(row.postText),
    source: row.source,
    sourceUrl: row.sourceUrl,
    sourceLabel: row.sourceLabel,
    createdUtc: row.createdUtc,
    intentLabel: row.intentLabel,
    intentScore: row.intentScore,
    suggestedReply: row.suggestedReply,
  }));
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

function hasBusinessContext(text: string): boolean {
  return /\b(crm|lead|pipeline|follow up|follow-up|client|customer|prospect|sales|outreach|inbound|conversion|agency|founder|startup|saas|team|ops|operations|workflow|automation|onboarding|retention|revenue|invoic|billing)\b/i.test(
    text,
  );
}

function hasDisallowedPersonalContext(text: string): boolean {
  return /\b(relationship|dating|boyfriend|girlfriend|husband|wife|partner|sexual|sex|hookup|body count|pregnan|family drama|roommate drama|mental health|depress|anxiety|aita|am i overreacting)\b/i.test(
    text,
  );
}

function hasDisallowedLowIntentContext(text: string): boolean {
  return /\b(onlyfans|of model|playtester|minecraft|mod launcher|army|battalion|74d|airbnb host|youtube outlier|facebook post|join our agency|new models|we are onboarding)\b/i.test(
    text,
  );
}

function hasRelevantSubredditContext(subreddit: string): boolean {
  return /\b(saas|startups?|smallbusiness|entrepreneur|sales|marketing|agency|freelance|notion|productivity|crm|business|founder|solopreneur)\b/i.test(
    subreddit,
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
  if (!hasRelevantSubredditContext(hit.subreddit || "")) {
    return {
      item: null,
      rejected: {
        source: sourceFromHit(hit),
        title: clip(hit.title, 180),
        url: hit.url,
        intentScore: score,
        matchedTerms: getMatchedTerms(hit.title, hit.snippet, score),
        rejectedReason: "subreddit_not_relevant",
      },
    };
  }
  if (hasDisallowedLowIntentContext(signalText)) {
    return {
      item: null,
      rejected: {
        source: sourceFromHit(hit),
        title: clip(hit.title, 180),
        url: hit.url,
        intentScore: score,
        matchedTerms: getMatchedTerms(hit.title, hit.snippet, score),
        rejectedReason: "low_intent_context_filtered",
      },
    };
  }
  if (hasDisallowedPersonalContext(signalText)) {
    return {
      item: null,
      rejected: {
        source: sourceFromHit(hit),
        title: clip(hit.title, 180),
        url: hit.url,
        intentScore: score,
        matchedTerms: getMatchedTerms(hit.title, hit.snippet, score),
        rejectedReason: "personal_context_filtered",
      },
    };
  }
  const highAsk = hasHighIntentAsk(signalText);
  const mediumPain = hasMediumIntentPain(signalText);
  const businessContext = hasBusinessContext(signalText);
  if (!businessContext) {
    return {
      item: null,
      rejected: {
        source: sourceFromHit(hit),
        title: clip(hit.title, 180),
        url: hit.url,
        intentScore: score,
        matchedTerms: getMatchedTerms(hit.title, hit.snippet, score),
        rejectedReason: "missing_business_context",
      },
    };
  }
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

function mergeUniqueOpportunities(items: OpportunityItem[]): OpportunityItem[] {
  const out: OpportunityItem[] = [];
  const seenIds = new Set<string>();
  const seenUrls = new Set<string>();
  const seenFingerprints = new Set<string>();
  const seenBySource: Array<{ source: OpportunitySource; postText: string }> = [];
  for (const item of items) {
    const normalizedItemUrl = normalizeUrl(item.sourceUrl);
    const itemFingerprint = contentFingerprint(item.postText, "");
    const hasNearDuplicate = seenBySource.some(
      (seenItem) => seenItem.source === item.source && isNearDuplicatePostText(seenItem.postText, item.postText),
    );
    if (seenIds.has(item.id)) continue;
    if (seenUrls.has(normalizedItemUrl)) continue;
    if (itemFingerprint && seenFingerprints.has(itemFingerprint)) continue;
    if (hasNearDuplicate) continue;
    seenIds.add(item.id);
    seenUrls.add(normalizedItemUrl);
    if (itemFingerprint) seenFingerprints.add(itemFingerprint);
    seenBySource.push({ source: item.source, postText: item.postText });
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

  const filtered = mergeUniqueOpportunities([
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

  let finalItems = final;
  if (finalItems.length === 0) {
    try {
      const communityFallback = await fetchCommunityFallbackItems();
      if (communityFallback.length > 0) {
        console.info("[opportunities] community fallback used", {
          count: communityFallback.length,
        });
        finalItems = communityFallback.slice(0, MAX_ITEMS);
      }
    } catch (error) {
      console.warn(
        "[opportunities] community fallback failed",
        error instanceof Error ? error.message : String(error),
      );
    }
  }
  if (finalItems.length < MIN_VISIBLE_ITEMS) {
    const seeded = getOfflineSeedItems();
    finalItems = mergeUniqueOpportunities([...finalItems, ...seeded]).slice(
      0,
      Math.max(MAX_ITEMS, MIN_VISIBLE_ITEMS),
    );
    console.info("[opportunities] offline seed fallback used", {
      count: finalItems.length,
    });
  }

  console.info("[opportunities] final count", {
    finalCount: finalItems.length,
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
    items: finalItems,
    ...(allRejected ? { unavailable: true as const } : {}),
    debug: {
      providers: [
        {
          name: provider.id,
          status: statusInfo.status,
          rawCount,
          afterFilterCount: filtered.length,
          finalCount: finalItems.length,
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
  try {
    const cached = await readOpportunitiesCache();
    if (!CACHE_DISABLED && cached.items.length >= MIN_VISIBLE_ITEMS && isCacheFresh(cached.capturedAt)) {
      console.info("[opportunities] serve path", {
        path: "cache_fresh",
        finalCount: cached.items.length,
        cacheCapturedAt: cached.capturedAt,
        cacheDisabled: CACHE_DISABLED,
      });
      return {
        items: cached.items,
        updatedAt: cached.capturedAt ?? new Date().toISOString(),
      };
    }
    const out = await Promise.race([
      runFeedPipeline(),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("feed_timeout")), FEED_TIMEOUT_MS),
      ),
    ]);
    const liveItems = out.items;
    const chosenItems =
      liveItems.length >= MIN_VISIBLE_ITEMS
        ? liveItems
        : mergeUniqueOpportunities([...cached.items, ...liveItems]).slice(
            0,
            Math.max(MAX_ITEMS, MIN_VISIBLE_ITEMS),
          );
    if (chosenItems.length > 0) {
      await writeOpportunitiesCache(chosenItems);
    }
    const updatedAt = new Date().toISOString();
    console.info("[opportunities] serve path", {
      path: liveItems.length >= MIN_VISIBLE_ITEMS ? "live_refresh" : "cache_live_merge",
      finalCount: chosenItems.length,
      liveCount: liveItems.length,
      cacheCount: cached.items.length,
      cacheDisabled: CACHE_DISABLED,
    });
    return {
      items: chosenItems,
      updatedAt,
      ...(out.unavailable ? { unavailable: true as const } : {}),
      ...(IS_DEV && chosenItems.length === 0
        ? { debugEmptyReason: out.unavailable ? "provider_unavailable" : "filtered_out_by_quality" }
        : {}),
    };
  } catch (error) {
    console.warn("[opportunities] feed fallback", error instanceof Error ? error.message : String(error));
    const cached = await readOpportunitiesCache();
    if (cached.items.length > 0) {
      console.info("[opportunities] serve path", {
        path: "cache_on_error",
        finalCount: cached.items.length,
        cacheCapturedAt: cached.capturedAt,
        cacheDisabled: CACHE_DISABLED,
      });
      return {
        items: cached.items,
        updatedAt: cached.capturedAt ?? new Date().toISOString(),
      };
    }
    console.info("[opportunities] serve path", {
      path: "empty_on_error",
      finalCount: 0,
      cacheDisabled: CACHE_DISABLED,
    });
    return {
      items: [],
      updatedAt: new Date().toISOString(),
      unavailable: true,
      ...(IS_DEV ? { debugEmptyReason: "pipeline_error_or_timeout" } : {}),
    };
  }
}

export async function getPublicOpportunitiesFeedDebug(): Promise<OpportunitiesDebugSnapshot> {
  const out = await runFeedPipeline({ minScore: 62, rejectedSampleLimit: 5 });
  return out.debug;
}
