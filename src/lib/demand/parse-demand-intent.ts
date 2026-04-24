import { openaiJson } from "./openai-json";
import type { DemandParsedIntent } from "./types";

const MAX_BODY_FIELD = 500;

/** Validate JSON body `parsedIntent` from the client (API routes). */
export function parseDemandParsedIntentBody(v: unknown): DemandParsedIntent | undefined {
  if (!v || typeof v !== "object") return undefined;
  const o = v as Record<string, unknown>;
  if (
    typeof o.audience !== "string" ||
    typeof o.pain !== "string" ||
    typeof o.context !== "string"
  ) {
    return undefined;
  }
  return {
    audience: o.audience.trim().slice(0, MAX_BODY_FIELD),
    pain: o.pain.trim().slice(0, MAX_BODY_FIELD),
    context: o.context.trim().slice(0, MAX_BODY_FIELD),
  };
}

const MAX_FIELD = 500;

function collapseWs(s: string): string {
  return s.replace(/\s+/g, " ").trim();
}

function clampField(s: string): string {
  return collapseWs(s).slice(0, MAX_FIELD);
}

const TOKEN_STOP = new Set([
  "that",
  "this",
  "with",
  "from",
  "your",
  "what",
  "when",
  "have",
  "been",
  "will",
  "into",
  "about",
  "their",
  "there",
  "would",
  "could",
  "should",
  "other",
  "some",
  "than",
  "then",
  "them",
  "these",
  "those",
  "were",
  "also",
  "just",
  "only",
  "very",
  "like",
  "more",
  "most",
  "such",
  "here",
  "make",
  "help",
  "need",
  "want",
  "best",
  "good",
  "really",
  "they",
  "people",
  "someone",
  "anyone",
]);

function significantTokens(s: string, minLen: number, cap = 24): string[] {
  const raw = s.toLowerCase().match(new RegExp(`[a-z0-9]{${minLen},}`, "g")) ?? [];
  const out: string[] = [];
  for (const w of raw) {
    if (TOKEN_STOP.has(w)) continue;
    out.push(w);
  }
  return [...new Set(out)].slice(0, cap);
}

/** Multiline blob for scoring hints — not raw user input alone. */
export function formatParsedIntentForScoring(parsed: DemandParsedIntent): string {
  const a = clampField(parsed.audience);
  const p = clampField(parsed.pain);
  const c = clampField(parsed.context);
  const parts = [
    a ? `Audience: ${a}` : "",
    p ? `Core problem: ${p}` : "",
    c ? `Context: ${c}` : "",
  ].filter(Boolean);
  return parts.join("\n").slice(0, 800);
}

/** Heuristic structured split when OpenAI is unavailable. */
export function parseDemandIntentHeuristic(notes: string): DemandParsedIntent {
  const raw = collapseWs(notes.replace(/["'`]/g, " "));
  if (!raw) {
    return { audience: "", pain: "", context: "" };
  }

  let audience = "";
  const forM = raw.match(/\bfor\s+([^.;\n]+?)(?:\.|;|$)/i);
  if (forM?.[1]) audience = clampField(forM[1]);

  const imA = raw.match(/\b(?:i'?m|i am)\s+(?:a|an)\s+([^.;\n]+?)(?:\.|;|$)/i);
  if (!audience && imA?.[1]) audience = clampField(imA[1]);

  const split = raw.split(/[.;\n]+/).map((s) => collapseWs(s)).filter(Boolean);
  const pain = clampField(split[0] ?? raw.slice(0, 200));
  const rest = split.slice(1).join(" ").trim();
  const context = clampField(
    rest || (audience && raw.length > pain.length ? raw.replace(pain, "").trim() : ""),
  );

  return {
    audience,
    pain: pain || clampField(raw.slice(0, 200)),
    context,
  };
}

type ParsedJson = {
  audience?: unknown;
  pain?: unknown;
  context?: unknown;
};

function normalizeParsed(j: ParsedJson | null): DemandParsedIntent | null {
  if (!j) return null;
  const audience = typeof j.audience === "string" ? clampField(j.audience) : "";
  const pain = typeof j.pain === "string" ? clampField(j.pain) : "";
  const context = typeof j.context === "string" ? clampField(j.context) : "";
  if (!pain && !audience) return null;
  return {
    audience,
    pain: pain || audience,
    context,
  };
}

/**
 * Extract audience / pain / context before search or scoring.
 * Uses OpenAI when `apiKey` is set; otherwise deterministic heuristics on the same text.
 */
export async function parseDemandIntentFromNotes(
  notes: string,
  apiKey?: string,
): Promise<DemandParsedIntent> {
  const trimmed = notes.trim().slice(0, 2000);
  if (!trimmed) {
    return { audience: "", pain: "", context: "" };
  }

  if (apiKey) {
    const system = [
      "You extract structured demand intent from the user's notes.",
      "Return JSON only with keys: audience, pain, context.",
      "audience: who has the problem (role, segment, situation). Short phrase.",
      "pain: the core problem in plain language — what hurts, what breaks, what's too slow or expensive. One sentence.",
      "context: optional constraints (industry, channel, geography, workflow). Empty string if unknown.",
      "Do not invent product names. If unclear, infer minimally from wording.",
    ].join(" ");

    const user = `Notes:\n${trimmed}`;

    const parsed = await openaiJson<ParsedJson>(apiKey, system, user, 0.25);
    const norm = normalizeParsed(parsed);
    if (norm && (norm.pain || norm.audience)) {
      return norm;
    }
  }

  return parseDemandIntentHeuristic(trimmed);
}

/** For expanded generic use cases: one line becomes pain; audience inherited from main parse. */
export function parsedIntentFromPainLine(
  painLine: string,
  audienceFromMain: string,
): DemandParsedIntent {
  return {
    audience: clampField(audienceFromMain),
    pain: clampField(painLine),
    context: "",
  };
}

/**
 * Keyword gate: post must echo pain terms and (when audience is specific) audience terms.
 * Returns true when we should not filter out (or when we lack enough signal to gate).
 */
export function leadMatchesParsedIntent(
  title: string,
  snippet: string,
  parsed: DemandParsedIntent,
): boolean {
  const blob = `${title}\n${snippet}`.toLowerCase();
  const painToks = significantTokens(parsed.pain, 4, 20);
  const audToks = significantTokens(parsed.audience, 4, 16);

  const painPhrase = collapseWs(parsed.pain).toLowerCase();
  if (painPhrase.length >= 14) {
    const chunk = painPhrase.slice(0, 28);
    if (chunk.length >= 12 && blob.includes(chunk)) return true;
  }

  let painHits = 0;
  for (const t of painToks) {
    if (blob.includes(t)) painHits++;
  }
  if (painToks.length === 0) {
    const words = painPhrase.split(" ").filter((w) => w.length >= 5);
    if (words.some((w) => blob.includes(w))) painHits = 1;
  }
  if (painHits < 1) return false;

  if (parsed.audience.trim().length >= 10 && audToks.length > 0) {
    const audHits = audToks.filter((t) => blob.includes(t)).length;
    if (audHits < 1) return false;
  }

  return true;
}
