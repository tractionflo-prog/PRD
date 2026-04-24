import type { OrganicLite } from "./find-users-intent-filter";

/** Listicle / article / comparison noise — reject before AI */
const LISTICLE_OR_ARTICLE = [
  /\bbest tools\b/i,
  /\btop tools\b/i,
  /\btop \d+\b/i,
  /\bcomparison\b/i,
  /\bcompared to\b/i,
  /\branked\b/i,
  /\branking\b/i,
  /\bguide to\b/i,
  /\bultimate guide\b/i,
  /\breviews?\s+of\b/i,
  /\bproduct review\b/i,
  /\blist of\b/i,
  /\b\d+\s+tools?\b/i,
  /\bpros and cons\b/i,
  /\broundup\b/i,
  /\bmust-have tools\b/i,
  /\btools you need\b/i,
  /\b\w+\s+vs\s+\w+\b/i,
  /\bversus\b/i,
] as const;

const STRATEGY_OR_GENERIC = [
  /\bhow to grow\b/i,
  /\bget users\b/i,
  /\bfirst 10 users\b/i,
  /\bdistribution strategy\b/i,
  /\bvalidate before\b/i,
  /\bstartup advice\b/i,
  /\bfounder motivation\b/i,
  /\bgo to market\b/i,
  /\bgtm\b/i,
  /\bmarketing tips\b/i,
  /\bgrowth hack\b/i,
] as const;

const ASKING_OR_PAIN = [
  "looking for",
  "look for",
  "any tool",
  "any tools",
  "any app",
  "what do you use",
  "what are you using",
  "how do you manage",
  "how do you handle",
  "how do you track",
  "is there a tool",
  "is there any tool",
  "need something",
  "need a tool",
  "struggling with",
  "recommend",
  "recommendation",
  "please recommend",
  "suggestions for",
  "suggest a",
  "what tool",
  "which tool",
  "which app",
  "alternative to",
  "replacement for",
  "anyone know",
  "any one know",
  "help with",
  "software for",
  "app for",
  "tool for",
] as const;

function blob(o: OrganicLite): string {
  return `${o.title}\n${o.snippet}`.toLowerCase();
}

function hasAskingOrPain(t: string): boolean {
  return ASKING_OR_PAIN.some((p) => t.includes(p));
}

function looksLongForm(t: string): boolean {
  if (t.length > 2400) return true;
  const words = t.split(/\s+/).length;
  return words > 320;
}

/**
 * Aggressive pre-AI filter: drop listicles, comparisons, strategy threads,
 * and long informational posts; keep likely question / tool-seeking threads.
 */
export function passesRedditPrefilter(o: OrganicLite): boolean {
  const t = blob(o);
  if (!t.trim()) return false;
  if (looksLongForm(t)) return false;
  for (const rx of LISTICLE_OR_ARTICLE) {
    if (rx.test(t)) return false;
  }
  for (const rx of STRATEGY_OR_GENERIC) {
    if (rx.test(t)) return false;
  }
  if (!hasAskingOrPain(t)) return false;
  return true;
}
