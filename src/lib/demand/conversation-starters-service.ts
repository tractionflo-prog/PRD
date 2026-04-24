import { openaiJson } from "./openai-json";

export type ConversationStarterRow = {
  /** ICP: who likely feels the problem */
  role: string;
  /** Paste into LinkedIn → People search */
  linkedInSearch: string;
  /** Short, question-first DM — no pitch */
  opener: string;
};

const ROW_COUNT = 5;

export function linkedInPeopleSearchUrl(keywords: string): string {
  const q = keywords.trim().slice(0, 200);
  const params = new URLSearchParams({ keywords: q });
  return `https://www.linkedin.com/search/results/people/?${params.toString()}`;
}

function topicFromProduct(product: string, hints?: string): string {
  const p = product.trim().split(/\n+/)[0]?.trim() ?? "";
  if (p.length >= 12) return p.slice(0, 140);
  const h = (hints ?? "").trim().replace(/\s+/g, " ");
  return (h.slice(0, 140) || p || "your product space").trim();
}

function padRows(rows: ConversationStarterRow[], topic: string): ConversationStarterRow[] {
  const fb = fallbackRows(topic);
  const out = [...rows];
  let i = 0;
  while (out.length < ROW_COUNT && i < fb.length) {
    const cand = fb[i++];
    if (!out.some((r) => r.role === cand.role)) out.push(cand);
  }
  while (out.length < ROW_COUNT) {
    out.push(fb[out.length % fb.length]);
  }
  return out.slice(0, ROW_COUNT);
}

function normalizeRow(o: unknown): ConversationStarterRow | null {
  if (!o || typeof o !== "object") return null;
  const r = o as Record<string, unknown>;
  const role = typeof r.role === "string" ? r.role.trim() : "";
  const linkedInSearch =
    typeof r.linkedInSearch === "string"
      ? r.linkedInSearch.trim()
      : typeof r.linkedinSearch === "string"
        ? r.linkedinSearch.trim()
        : "";
  const opener =
    typeof r.opener === "string"
      ? r.opener.trim()
      : typeof r.message === "string"
        ? r.message.trim()
        : "";
  if (role.length < 8 || linkedInSearch.length < 4 || opener.length < 12) return null;
  if (opener.length > 320) return null;
  return { role, linkedInSearch, opener };
}

export function fallbackRows(topic: string): ConversationStarterRow[] {
  const t = topic.replace(/\s+/g, " ").slice(0, 80) || "your space";
  return [
    {
      role: `Operations or COO-level owner of messy workflows tied to “${t}”`,
      linkedInSearch: `operations manager ${t.split(" ").slice(0, 3).join(" ")}`,
      opener:
        "When this kind of work backs up, what breaks first for your team — speed, accuracy, or visibility?",
    },
    {
      role: `Team lead who inherited spreadsheets or legacy tools around “${t}”`,
      linkedInSearch: `team lead ${t.split(" ").slice(0, 3).join(" ")}`,
      opener:
        "What’s the most manual step you still can’t automate — and how often does it actually hurt delivery?",
    },
    {
      role: `Founder or GM evaluating better tooling (not shopping for vendors yet)`,
      linkedInSearch: `founder ${t.split(" ").slice(0, 3).join(" ")}`,
      opener:
        "How do you decide whether a problem is ‘good enough’ today vs worth changing tools for?",
    },
    {
      role: `Senior IC who lives in the day-to-day pain (support, ops, or rev ops)`,
      linkedInSearch: `senior specialist ${t.split(" ").slice(0, 3).join(" ")}`,
      opener:
        "If you had one hour back per week from this workflow, where would you actually spend it?",
    },
    {
      role: `Program or project owner coordinating cross-functional handoffs`,
      linkedInSearch: `program manager ${t.split(" ").slice(0, 3).join(" ")}`,
      opener:
        "What signal tells you early that a handoff is going wrong — before customers or execs notice?",
    },
  ];
}

/**
 * Reddit-independent: five ICP rows with LinkedIn people-search strings and question-only openers.
 */
export async function generateConversationStarters(
  product: string,
  intentHintsForScoring: string | undefined,
  apiKey: string | undefined,
): Promise<ConversationStarterRow[]> {
  const topic = topicFromProduct(product, intentHintsForScoring);

  if (!apiKey) {
    return padRows([], topic);
  }

  const system = `You output JSON only with this exact shape:
{ "rows": [ { "role": string, "linkedInSearch": string, "opener": string }, ... ] }

Rules:
- Exactly ${ROW_COUNT} rows.
- role: one line, a plausible job title / situation for someone who has the problem described (no company names).
- linkedInSearch: 3–8 words to paste into LinkedIn People search — concrete role + domain words from the user context (no quotes, no site: operators).
- opener: ONE short first message for LinkedIn or email. Must be a genuine question about their work. No product mention, no “I built”, no pitch, no “happy to show a demo”, no links.
- Vary the five openers (different angles: process, metrics, tradeoffs, mistakes, priorities).`;

  const user = `Product / context:\n${product.trim().slice(0, 1800)}\n\nExtra hints:\n${(intentHintsForScoring ?? "").trim().slice(0, 600)}`;

  const parsed = await openaiJson<{ rows?: unknown }>(apiKey, system, user, 0.45);
  const raw = Array.isArray(parsed?.rows) ? parsed!.rows : [];
  const cleaned: ConversationStarterRow[] = [];
  const seen = new Set<string>();
  for (const item of raw) {
    const row = normalizeRow(item);
    if (!row) continue;
    const k = row.role.toLowerCase();
    if (seen.has(k)) continue;
    seen.add(k);
    cleaned.push(row);
    if (cleaned.length >= ROW_COUNT) break;
  }

  return padRows(cleaned, topic);
}
