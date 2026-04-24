import type { DemandParsedIntent } from "./types";

/**
 * Pain-first Reddit search prefixes — problem language, not generic “recommend a tool”.
 * Combined with a short seed from parsed pain (+ audience when present).
 */
const PAIN_INTENT_PREFIXES = [
  "struggling with",
  "need help with",
  "how do you handle",
  "how do you deal with",
  "drowning in",
  "too many",
  "can't keep up with",
  "dealing with",
  "anyone else dealing with",
  "frustrated with",
  "is there a way to",
  "workflow for",
  "burned out from",
  "spending hours on",
] as const;

function collapseWs(s: string): string {
  return s.replace(/\s+/g, " ").trim();
}

/** Pull a short searchable phrase from notes or noisy website context. */
export function extractSeedPhrase(context: string): string {
  const raw = collapseWs(context.replace(/["'`]/g, " "));
  if (!raw) return "";

  const lines = raw
    .split(/\n+/)
    .map((l) => collapseWs(l))
    .filter((l) => {
      if (l.length < 3) return false;
      if (/^(website|page excerpt|company\/site|product \(from website\)|target user|main use cases|keywords)/i.test(l))
        return false;
      if (/^\([^)]{0,80}\)$/i.test(l)) return false;
      return true;
    });

  const first = lines[0] ?? raw;
  const cleaned = first.replace(/^[-•*]\s*/, "").slice(0, 100).trim();
  return cleaned || raw.slice(0, 80).trim();
}

export function dedupeQueries(queries: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const q of queries) {
    const k = q.toLowerCase();
    if (!k || seen.has(k)) continue;
    seen.add(k);
    out.push(q);
  }
  return out;
}

/**
 * Deterministic Reddit-shaped queries (no LLM). Same patterns for everyone — only the seed changes.
 * Produces 10–12 strings suitable for `reddit.com/search.json?q=`.
 */
function seedsFromParsed(parsed: DemandParsedIntent): string[] {
  const pain = collapseWs(parsed.pain.replace(/["'`]/g, " ")).slice(0, 100);
  const aud = collapseWs(parsed.audience.replace(/["'`]/g, " ")).slice(0, 72);
  const ctx = collapseWs(parsed.context.replace(/["'`]/g, " ")).slice(0, 60);
  const out: string[] = [];
  if (pain) out.push(pain);
  if (pain && aud) out.push(collapseWs(`${pain} ${aud}`).slice(0, 120));
  if (pain && ctx && ctx.length >= 8) out.push(collapseWs(`${pain} ${ctx}`).slice(0, 120));
  if (aud && pain) out.push(collapseWs(`${aud} ${pain}`).slice(0, 120));
  return dedupeQueries(out).filter((s) => s.length >= 4);
}

/** Deterministic queries from structured intent (preferred over raw notes). */
export function buildRedditSearchQueriesFromParsed(parsed: DemandParsedIntent): string[] {
  const seeds = seedsFromParsed(parsed);
  if (seeds.length === 0) return [];

  const built: string[] = [];
  for (const seed of seeds) {
    for (const pref of PAIN_INTENT_PREFIXES) {
      built.push(collapseWs(`${pref} ${seed}`).slice(0, 200));
    }
    built.push(collapseWs(`why is ${seed} so hard`).slice(0, 200));
    built.push(collapseWs(`${seed} overwhelming`).slice(0, 200));
  }

  return dedupeQueries(built).slice(0, 14);
}

export function buildRedditSearchQueries(context: string): string[] {
  const seed = extractSeedPhrase(context);
  if (!seed || seed.length < 2) return [];

  const built: string[] = [];

  for (const pref of PAIN_INTENT_PREFIXES) {
    built.push(collapseWs(`${pref} ${seed}`).slice(0, 200));
  }

  built.push(collapseWs(`why is ${seed} so hard`).slice(0, 200));
  built.push(collapseWs(`${seed} overwhelming`).slice(0, 200));

  return dedupeQueries(built).slice(0, 14);
}
