/** Snippets of public posts — title, snippet, link. */
export type OrganicLite = { title: string; snippet: string; link: string };

const HIGH_INTENT = [
  "looking for",
  "look for",
  "any tool",
  "any tools",
  "any app",
  "is there a tool",
  "is there any tool",
  "what tool",
  "which tool",
  "best tool",
  "recommend",
  "recommendation",
  "suggest a",
  "suggestions for",
  "how do you manage",
  "how do you handle",
  "how do you track",
  "what do you use",
  "what are you using",
  "what should i use",
  "alternative to",
  "replacement for",
  "easier way",
  "without spreadsheet",
  "without excel",
  "without manual",
  "software for",
  "app for",
  "tool for",
  "need a tool",
  "need a way",
  "need something",
  "platform for",
  "workaround",
  "solution for",
  "anyone know",
  "any one know",
  "please recommend",
  "options for",
  "help with",
  "which app",
  "which software",
  "better than",
  "instead of",
] as const;

const LOW_INTENT = [
  "tips",
  "strategy",
  "strategies",
  "ideas for",
  "discussion",
  "what works",
  "growth hack",
  "marketing tips",
  "audience",
  "launch advice",
  "distribution",
  "first 10 users",
  "first users",
  "validation strategy",
  "how to grow",
  "how to get users",
  "how do you get users",
  "where do you find",
  "startup advice",
  "founder advice",
  "motivation",
  "validate before",
  "spending on ads",
  "cold email",
  "go to market",
  "gtm",
] as const;

/** Positive = more solution-seeking; negative = more generic / strategy noise. */
export function intentScore(title: string, snippet: string): number {
  const t = `${title} ${snippet}`.toLowerCase();
  let s = 0;
  for (const h of HIGH_INTENT) {
    if (t.includes(h)) s += 2;
  }
  for (const l of LOW_INTENT) {
    if (t.includes(l)) s -= 3;
  }
  return s;
}

/** True if this row looks like someone asking for a tool or concrete solution. */
export function passesIntentFilter(o: OrganicLite): boolean {
  const t = `${o.title} ${o.snippet}`.toLowerCase();
  const hasHigh = HIGH_INTENT.some((h) => t.includes(h));
  if (!hasHigh) return false;
  const s = intentScore(o.title, o.snippet);
  // Reject clear strategy threads even if they borrowed one high word
  if (s < 0) return false;
  // Strong reject: generic distribution / validation threads
  const hardReject =
    /first\s*10\s*users|where\s+do\s+you\s+find|validate\s+before|how\s+to\s+get\s+users|how\s+to\s+grow|distribution\s+strategy|startup\s+commentary/i.test(
      t,
    );
  if (hardReject && s < 4) return false;
  return true;
}

/** Prefer passing rows first, then by intent score (desc). Keeps all items for downstream use. */
export function orderOrganicsByIntent(items: OrganicLite[]): OrganicLite[] {
  const rows = items.map((o) => ({
    o,
    s: intentScore(o.title, o.snippet),
    pass: passesIntentFilter(o),
  }));
  rows.sort((a, b) => {
    if (a.pass !== b.pass) return a.pass ? -1 : 1;
    return b.s - a.s;
  });
  return rows.map((r) => r.o);
}

/** For basicLeads fallback copy when we skip OpenAI enrich. */
export function defaultWhyForOrganic(o: OrganicLite): string {
  const t = `${o.title} ${o.snippet}`.toLowerCase();
  if (t.includes("looking for") || t.includes("recommend")) {
    return "They are explicitly asking for options or a recommendation, not just discussing theory.";
  }
  if (t.includes("tool") || t.includes("software") || t.includes("app")) {
    return "They are asking about a tool or workflow, which is something you can answer with a concrete suggestion.";
  }
  if (t.includes("how do you manage") || t.includes("how do you handle")) {
    return "They describe an ongoing operational pain and want to know how others handle it — a natural place to offer what you built.";
  }
  return "The wording points to someone trying to solve a practical problem right now, not a generic strategy thread.";
}
