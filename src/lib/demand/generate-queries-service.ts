import { formatParsedIntentForScoring } from "./parse-demand-intent";
import {
  buildRedditSearchQueries,
  buildRedditSearchQueriesFromParsed,
  dedupeQueries,
} from "./reddit-deterministic-queries";
import type { DemandParsedIntent } from "./types";

export type GeneratedQueriesPack = {
  queries: string[];
  /** Comma-style expansion of the same context for lead relevance scoring */
  intentHintsForScoring?: string;
};

/** Merge packs from multiple concrete use cases (deduped, capped for Reddit fetch load). */
export function mergeDemandQueryPacks(
  packs: GeneratedQueriesPack[],
  maxQueries = 40,
): GeneratedQueriesPack {
  const all: string[] = [];
  const hintParts: string[] = [];
  for (const p of packs) {
    if (p.queries.length) all.push(...p.queries);
    if (p.intentHintsForScoring?.trim()) hintParts.push(p.intentHintsForScoring.trim());
  }
  const queries = dedupeQueries(all).slice(0, maxQueries);
  const intentHintsForScoring = hintParts.length
    ? hintParts.join(" · ").replace(/\s+/g, " ").trim().slice(0, 800)
    : undefined;
  return {
    queries,
    ...(intentHintsForScoring ? { intentHintsForScoring } : {}),
  };
}

function intentHintsFromContext(context: string): string {
  const t = context.trim().slice(0, 800).replace(/\s+/g, " ");
  return t.replace(/["'`]/g, "").trim();
}

export type GenerateDemandQueriesOptions = {
  /** When set, queries are built from pain + audience (not generic tool asks). */
  parsed?: DemandParsedIntent;
};

/**
 * Reddit-only demand: deterministic search queries (no query LLM).
 * Prefer `options.parsed` so search strings follow structured pain, not raw paste.
 * `apiKey` is unused; kept for call-site compatibility with website flows that still use OpenAI elsewhere.
 */
export async function generateDemandQueries(
  productContext: string,
  apiKey?: string,
  options?: GenerateDemandQueriesOptions,
): Promise<GeneratedQueriesPack> {
  void apiKey;
  const queries = options?.parsed
    ? buildRedditSearchQueriesFromParsed(options.parsed)
    : buildRedditSearchQueries(productContext);
  const hintSource = options?.parsed
    ? formatParsedIntentForScoring(options.parsed)
    : productContext;
  const hints = intentHintsFromContext(hintSource);
  if (queries.length < 8) {
    return { queries: [], ...(hints ? { intentHintsForScoring: hints } : {}) };
  }
  return {
    queries,
    ...(hints ? { intentHintsForScoring: hints } : {}),
  };
}
