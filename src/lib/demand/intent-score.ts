import type { DemandSignalBand } from "./types";

/** Inputs for demand lead scoring (0–100, quality-first). */
export type DemandScoreInput = {
  title: string;
  snippet: string;
  createdUtc: number | null;
  numComments: number;
  /** Product description — weak match to post text lowers score (keyword spam). */
  productHint?: string;
};

const HOUR = 3600;
const DAY = 24 * HOUR;

/** Hard reject: generic / meta threads not worth a founder reply */
export function hardExcludeDemandPost(text: string): boolean {
  const t = text.toLowerCase();
  const patterns = [
    /\bjust curious\b/,
    /\bwhat do you think\b/,
    /\bdiscussion\b/,
    /\bopinions?\b/,
    /\bdebate\b/,
    /\bchange my mind\b/,
    /\bunpopular opinion\b/,
    /\bama\b/,
    /\bshare your story\b/,
    /\boff[\s-]?topic\b/,
    /\bis\s+.{0,50}\s+good\s*\?\s*$/i,
    /\bis\s+.{0,30}\s+worth it\s*\?\s*$/i,
    /\b(hiring|we are hiring|\[hiring\]|job opening|job listing|careers at|apply now|resume\b)/i,
    /\b(for hire|freelance gig|upwork|fiverr)\b/i,
    /\b(self[\s-]?promo|my startup|check out my (saas|product|course)|50% off|affiliate link)\b/i,
    /\b(promoted|sponsored by|giveaway)\b/i,
  ];
  return patterns.some((re) => re.test(t));
}

function wordCount(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

const HINT_STOP = new Set([
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
]);

/** Match literal product words + adjacent intent tokens; softer miss penalty so implied demand can still score. */
function productRelevanceAdjust(blob: string, productHint?: string): number {
  const hint = productHint?.trim();
  if (!hint) return 0;
  const low = blob.toLowerCase();

  const marker = /\n\nrelated search angles\b/i;
  const parts = hint.split(marker);
  const base = (parts[0] ?? hint).toLowerCase();
  const angles = parts.length > 1 ? parts.slice(1).join(" ").toLowerCase() : "";

  const tokenize = (s: string, minLen: number): string[] => {
    const raw = s.match(new RegExp(`[a-z0-9]{${minLen},}`, "g")) ?? [];
    const out: string[] = [];
    for (const w of raw) {
      if (w.length < minLen) continue;
      if (HINT_STOP.has(w)) continue;
      out.push(w);
    }
    return [...new Set(out)].slice(0, 48);
  };

  const tokens4 = tokenize(base, 4);
  const tokens3 = angles ? tokenize(angles, 3) : [];

  for (const w of tokens4) {
    if (low.includes(w)) return 4;
  }
  for (const w of tokens3) {
    if (w.length >= 4 && low.includes(w)) return 4;
    if (low.includes(w)) return 3;
  }

  const docSpace =
    /\b(pdf|summar|document|paper|article|research|read|notes|study|long form|journal|textbook|report|deck|slides)\b/i.test(
      base + angles,
    );
  if (
    docSpace &&
    /\b(read|skim|summar|pdf|document|paper|article|research|notes|study|long|pages|wall of text|information overload|too much to read)\b/i.test(
      low,
    )
  ) {
    return 2;
  }

  return -6;
}

const manualWorkflow =
  /\b(manually|by hand|one by one|in a spreadsheet|google sheets?|excel|copy[\s-]?paste|double (entry|work)|too many steps|every single time)\b/i;

const inefficiency =
  /\b(takes forever|takes too long|waste of time|redundant|repeatedly|always (re-?doing|redoing)|keeps falling apart|doesn't scale|not scalable)\b/i;

const frustrationExtra =
  /\b(stressed|annoying|nightmare|exhausting|tired of|sick of|hate (that|how)|always forgetting|can't keep up|losing track|falling behind)\b/i;

const problemSignal =
  /\b(frustrated|overwhelmed|drowning|messy|chaos|stuck|broken process|inefficient|painful|disorganized)\b/i;

export function signalBandForIntentScore(score: number): DemandSignalBand {
  if (score >= 72) return "strong";
  if (score >= 52) return "medium";
  return "early";
}

export function formatDemandSignalLabel(band: DemandSignalBand): string {
  if (band === "strong") return "🔥 Strong signal";
  if (band === "medium") return "⚡ Medium signal";
  return "🌱 Early signal";
}

/**
 * Intent score 0–100. Caller keeps score ≥ ~52; ≥75 = high_intent tier, 65–74 = problem tier.
 */
export function scoreDemandLead(input: DemandScoreInput): number {
  const blob = `${input.title}\n${input.snippet}`;
  const t = blob.toLowerCase();
  let s = 0;

  const strongNeed =
    /\b(looking for|need help|any recommendations?|what should i use|struggling with|need a better way|need a better tool|can't find a good|cannot find a good)\b/i;
  if (strongNeed.test(t)) s += 32;

  const pain =
    /\b(drowning in spreadsheets?|this (isn't|is not) working|too expensive|hard to manage|frustrated|overwhelmed|overwhelming|messy|chaos|doesn't work|is not working|inefficient|fed up|burned out|waste of time)\b/i;
  if (pain.test(t)) s += 26;

  if (frustrationExtra.test(t)) s += 10;
  if (manualWorkflow.test(t)) s += 12;
  if (inefficiency.test(t)) s += 8;

  const toolAsk =
    /\b(recommend|suggestions?|which (app|tool|software)|any tool|any app|software for|alternative to|best tool|what do you use|is there a tool|switch(ing)? from|replace|instead of)\b/i;
  if (toolAsk.test(t)) s += 18;

  const words = wordCount(blob);
  if (words > 100) s += 8;
  if (words > 40 && words < 90) s += 3;
  if (input.numComments > 3) s += 8;
  if (input.numComments === 0 && words < 55) s -= 18;

  const genericNoise =
    /\b(just curious|what do you think|purely theoretical|random question|shower thought|thoughts\?|poll:|vote:)\b/i;
  if (genericNoise.test(t)) s -= 35;

  const storyish =
    /\b(years ago|when i was|i used to|back in \d{4}|my journey|i started|i quit my job)\b/i;
  if (storyish.test(t) && !toolAsk.test(t) && !strongNeed.test(t)) s -= 22;

  const hasClearAsk =
    /\?/.test(blob) ||
    strongNeed.test(t) ||
    toolAsk.test(t) ||
    /\b(need|want|trying to find|can't figure out|cannot figure out|help me)\b/i.test(t) ||
    pain.test(t) ||
    manualWorkflow.test(t) ||
    problemSignal.test(t) ||
    inefficiency.test(t);
  if (!hasClearAsk) s -= 28;

  const softLengthFloor = pain.test(t) || manualWorkflow.test(t) || problemSignal.test(t);
  if (words < 28) {
    s -= softLengthFloor ? 12 : 24;
  }
  if (words > 200 && !/\?/.test(blob) && !strongNeed.test(t)) s -= 16;

  const now = Date.now() / 1000;
  if (input.createdUtc != null && Number.isFinite(input.createdUtc)) {
    const ageSec = now - input.createdUtc;
    if (ageSec < 0) s -= 22;
    else {
      const days = ageSec / DAY;
      const hours = ageSec / HOUR;
      if (hours <= 72) s += 6;
      else if (days <= 5) s -= 4;
      else s -= 12;
    }
  } else {
    s -= 18;
  }

  s += productRelevanceAdjust(blob, input.productHint);

  return Math.max(0, Math.min(100, Math.round(s)));
}

function leadBullets(lines: [string, string, string]): string {
  return lines.map((line) => `• ${line}`).join("\n");
}

/** Only for score ≥ 48; otherwise empty string (UI hides block). */
export function explainDemandIntent(
  title: string,
  snippet: string,
  score: number,
): string {
  if (score < 48) return "";
  const t = `${title} ${snippet}`.toLowerCase();
  const picks: string[] = [];

  if (
    /\b(looking for|need help|recommend|suggestions?|what should i use|any recommendations?|alternative to|what do you use)\b/i.test(
      t,
    )
  ) {
    picks.push("Explicitly asking for recommendations");
  }
  if (
    /\b(frustrat|drowning|not working|messy|chaos|hard to manage|overwhelming|pain|stuck|broken workflow|too expensive)\b/i.test(
      t,
    )
  ) {
    picks.push("Describing a real problem");
  }
  if (
    /\b(alternative|switch|struggling|evaluating|comparing|replace|instead of|moving off|need a better way)\b/i.test(
      t,
    )
  ) {
    picks.push("Actively looking for alternatives");
  }
  if (
    /\b(manually|spreadsheet|excel|google sheets|copy paste|double work|too many steps)\b/i.test(
      t,
    )
  ) {
    picks.push("Describing a manual or fragile workflow");
  }

  const defaults: [string, string, string] = [
    "Explicitly asking for recommendations",
    "Describing a real problem",
    "Actively looking for alternatives",
  ];
  const out: string[] = [];
  for (const line of picks) {
    if (!out.includes(line)) out.push(line);
  }
  for (const d of defaults) {
    if (out.length >= 3) break;
    if (!out.includes(d)) out.push(d);
  }
  if (out.length === 0) return leadBullets(defaults);
  let i = 0;
  while (out.length < 3 && i < 6) {
    const d = defaults[i % 3];
    if (!out.includes(d)) out.push(d);
    i += 1;
  }
  while (out.length < 3) out.push(defaults[0]);
  return leadBullets([out[0], out[1], out[2]] as [string, string, string]);
}
