import { buildPersonalizedOutreachDm } from "./context-aware-reply";
import { openaiJson } from "./openai-json";
import { isGenericProductInput } from "./generic-input";
import { dedupeQueries } from "./reddit-deterministic-queries";
import type { DemandLead } from "./types";

const MAX_INPUT = 2000;

/** Vague category-only input — force clarification without relying on the model alone. */
export function shouldForceClarification(rawInput: string): boolean {
  return isGenericProductInput(rawInput.trim());
}

export type ProblemInterpretationClarify = {
  kind: "clarify";
  clarifyingQuestion: string;
  suggestedRefinements: string[];
};

export type ProblemInterpretationRefinement = {
  kind: "refine";
  clarifyingQuestion: string;
  suggestedRefinements: string[];
  productCategory?: string;
  cleanProblem?: string;
  confidence: number;
};

export type ProblemInterpretationOk = {
  kind: "ok";
  cleanProblem: string;
  productCategory: string;
  audience: string[];
  pain: string;
  context: string;
  searchKeywords: string[];
  linkedinSearch: string;
  conversationAngle: string;
  confidence: number;
  /** One vivid “who + cadence/situation + pain cue” line for fallback outreach (never bare “students”). */
  whoLineSpecific: string;
  /** Short phrase after “a few …” in the DM — concrete, human. */
  outreachGroupPhrase: string;
  /** What they’re still doing under time pressure, e.g. “spending hours untangling handoffs”. */
  outreachActivityPhrase: string;
  /** Completes the middle line after “before” / “during” (may include leading before/during). */
  outreachSituationPhrase: string;
};

export type ProblemInterpretationResult =
  | ProblemInterpretationClarify
  | ProblemInterpretationRefinement
  | ProblemInterpretationOk;

function asTrimmedString(v: unknown, max: number): string {
  if (typeof v !== "string") return "";
  return v.replace(/\s+/g, " ").trim().slice(0, max);
}

function asStringArray(v: unknown, maxItems: number, itemMax: number): string[] {
  if (!Array.isArray(v)) return [];
  const out: string[] = [];
  const seen = new Set<string>();
  for (const x of v) {
    if (typeof x !== "string") continue;
    const s = x.replace(/\s+/g, " ").trim().slice(0, itemMax);
    if (s.length < 2) continue;
    const k = s.toLowerCase();
    if (seen.has(k)) continue;
    seen.add(k);
    out.push(s);
    if (out.length >= maxItems) break;
  }
  return out;
}

function dedupeCaseInsensitive(items: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const x of items) {
    const k = x.toLowerCase();
    if (seen.has(k)) continue;
    seen.add(k);
    out.push(x);
  }
  return out;
}

const TOKEN_STOP = new Set([
  "with",
  "from",
  "your",
  "what",
  "when",
  "have",
  "been",
  "that",
  "this",
  "they",
  "them",
  "their",
  "there",
  "about",
  "would",
  "could",
  "should",
  "other",
  "some",
  "just",
  "only",
  "very",
  "like",
  "more",
  "most",
  "also",
  "into",
  "help",
  "need",
  "want",
  "best",
  "good",
  "really",
  "people",
  "someone",
  "anyone",
  "thing",
  "things",
  "stuff",
  "issue",
  "issues",
]);

function tokensFromText(s: string, minLen: number): string[] {
  const raw = s.toLowerCase().match(new RegExp(`[a-z0-9]{${minLen},}`, "g")) ?? [];
  return [...new Set(raw.filter((w) => !TOKEN_STOP.has(w)))];
}

/**
 * Reddit search queries — only from interpreted fields (never raw user paste alone).
 */
export function redditQueriesFromInterpretation(i: ProblemInterpretationOk): string[] {
  const seeds: string[] = [];
  for (const kw of i.searchKeywords) {
    const t = kw.replace(/\s+/g, " ").trim();
    if (t.length >= 3) seeds.push(t.slice(0, 120));
  }
  const frag = [i.pain, i.cleanProblem, i.context].filter(Boolean).join(" ");
  for (const w of frag.split(/\s+/)) {
    if (w.length >= 5) seeds.push(w.slice(0, 80));
  }
  const prefixes = [
    "struggling with",
    "how are you handling",
    "problem with",
    "looking for help with",
    "dealing with",
    "frustrated with",
    "how do you handle",
    "anyone else with",
    "drowning in",
  ];
  const built: string[] = [];
  for (const s of dedupeCaseInsensitive(seeds).slice(0, 8)) {
    for (const p of prefixes) {
      built.push(`${p} ${s}`.replace(/\s+/g, " ").trim().slice(0, 200));
    }
    built.push(s.slice(0, 200));
  }
  return dedupeQueries(built).slice(0, 14);
}

/**
 * Require a problem signal (pain or search keyword) plus supporting signal
 * (audience, context, or second problem hit) so unrelated threads drop out.
 */
export function leadPassesRelevanceFilter(
  title: string,
  snippet: string,
  i: ProblemInterpretationOk,
): boolean {
  const blob = `${title}\n${snippet}`.toLowerCase();

  const painToks = tokensFromText(i.pain, 5);
  const kwHits = i.searchKeywords
    .map((k) => k.trim().toLowerCase())
    .filter((k) => k.length >= 3);
  let problemHits = 0;
  for (const t of painToks) {
    if (blob.includes(t)) problemHits++;
  }
  for (const k of kwHits) {
    if (k.length >= 10 && blob.includes(k)) problemHits += 2;
    else if (blob.includes(k)) problemHits++;
  }

  const audToks = i.audience.flatMap((a) => tokensFromText(a, 4));
  const ctxToks = tokensFromText(i.context, 4);
  let supportHits = 0;
  for (const t of [...audToks, ...ctxToks]) {
    if (blob.includes(t)) supportHits++;
  }

  const hasProblem = problemHits >= 1;
  const hasSupport = supportHits >= 1 || problemHits >= 2;
  return hasProblem && hasSupport;
}

/** Numeric relevance for ranking (not a hard gate). */
export function landingRelevanceWeight(
  title: string,
  snippet: string,
  i: ProblemInterpretationOk,
): number {
  const blob = `${title}\n${snippet}`.toLowerCase();
  let w = 0;
  for (const t of tokensFromText(i.pain, 4)) {
    if (blob.includes(t)) w += 2;
  }
  for (const k of i.searchKeywords.map((x) => x.trim().toLowerCase()).filter((k) => k.length >= 3)) {
    if (k.length >= 10 && blob.includes(k)) w += 3;
    else if (blob.includes(k)) w += 1;
  }
  for (const t of i.audience.flatMap((a) => tokensFromText(a, 3))) {
    if (blob.includes(t)) w += 1;
  }
  for (const t of tokensFromText(i.context, 3)) {
    if (blob.includes(t)) w += 1;
  }
  return w;
}

/** Prefer strict relevance + intent; still surfaces medium-intent when ranked fairly. */
export function rankLandingPreviewLeads(
  leads: DemandLead[],
  i: ProblemInterpretationOk,
): DemandLead[] {
  return [...leads].sort((a, b) => {
    const strictA = leadPassesRelevanceFilter(a.title, a.snippet, i) ? 45 : 0;
    const strictB = leadPassesRelevanceFilter(b.title, b.snippet, i) ? 45 : 0;
    const ra = landingRelevanceWeight(a.title, a.snippet, i);
    const rb = landingRelevanceWeight(b.title, b.snippet, i);
    const scoreA = strictA + ra * 2.5 + a.intentScore;
    const scoreB = strictB + rb * 2.5 + b.intentScore;
    return scoreB - scoreA;
  });
}

export function interpretationToProductContext(i: ProblemInterpretationOk): string {
  const aud = i.audience.join(", ");
  return [
    `Category: ${i.productCategory}`,
    `Problem (clean): ${i.cleanProblem}`,
    `Audience: ${aud}`,
    `Pain: ${i.pain}`,
    ...(i.context.trim() ? [`Context: ${i.context.trim()}`] : []),
    `Angle: ${i.conversationAngle}`,
    `Who line: ${i.whoLineSpecific}`,
    `Outreach group: ${i.outreachGroupPhrase}`,
    `Outreach activity: ${i.outreachActivityPhrase}`,
    `Outreach situation: ${i.outreachSituationPhrase}`,
  ]
    .join("\n")
    .slice(0, 1800);
}

export function interpretationToParsedIntent(i: ProblemInterpretationOk): {
  audience: string;
  pain: string;
  context: string;
} {
  return {
    audience: i.audience.join(", ").slice(0, 500),
    pain: i.pain.slice(0, 500),
    context: [i.context, i.productCategory, i.cleanProblem].filter(Boolean).join(" · ").slice(0, 500),
  };
}

export type PersonalizedFallbackCard = {
  whoToTalkTo: string;
  credibilityLine: string;
  /** Why this audience fits (context / cadence). */
  likelyReasonLine: string;
  tags: string[];
  linkedInSearch: string;
  message: string;
  followUp: string;
};

const CREDIBILITY_FALLBACK_LINE = "Based on patterns from similar conversations";

function buildLikelyReasonLine(i: ProblemInterpretationOk): string {
  const ctx = collapseOutreach(i.context);
  const tail =
    ctx ||
    collapseOutreach(i.conversationAngle).slice(0, 140) ||
    collapseOutreach(i.cleanProblem).slice(0, 120);
  if (!tail) return "Likely dealing with this from how similar threads read.";
  const t = tail.charAt(0).toLowerCase() + tail.slice(1);
  return `Likely dealing with this due to ${t}`.slice(0, 220);
}

const GENERIC_ROLE_ALONE =
  /^(students?|undergrads?|business owners?|small business owners?|users?|people|teams?|managers?|founders?|companies|startups?)$/i;

function collapseOutreach(s: string): string {
  return s.replace(/\s+/g, " ").trim();
}

function firstNonGenericAudience(audience: string[]): string {
  for (const a of audience) {
    const t = a.trim();
    if (t && !GENERIC_ROLE_ALONE.test(t)) return t;
  }
  return audience[0]?.trim() || "People in this workflow";
}

function deriveOutreachFields(i: {
  audience: string[];
  pain: string;
  context: string;
  cleanProblem: string;
  conversationAngle: string;
  whoLineSpecific: string;
  outreachGroupPhrase: string;
  outreachActivityPhrase: string;
  outreachSituationPhrase: string;
}): Pick<
  ProblemInterpretationOk,
  "whoLineSpecific" | "outreachGroupPhrase" | "outreachActivityPhrase" | "outreachSituationPhrase"
> {
  const pain = collapseOutreach(i.pain) || collapseOutreach(i.cleanProblem);
  const ctx = collapseOutreach(i.context);
  const angle = collapseOutreach(i.conversationAngle);
  const role = firstNonGenericAudience(i.audience);

  let whoLineSpecific = collapseOutreach(i.whoLineSpecific);
  if (!whoLineSpecific || whoLineSpecific.length < 28) {
    const cadence =
      /\b(daily|weekly|nightly|every day|each week|most days|every sprint)\b/i.exec(ctx)?.[0] || "";
    const pressure =
      /\b(time-?consuming|repetitive|manual|chaotic|last-?minute|late nights|back-?to-?back)\b/i.exec(
        `${pain} ${ctx} ${angle}`,
      )?.[0] || "";
    const situ = ctx
      ? ctx.length > 90
        ? `${ctx.slice(0, 87)}…`
        : ctx
      : angle.slice(0, 80);
    whoLineSpecific = [
      role,
      cadence && `${cadence}`,
      pressure && `— ${pressure}`,
      situ && `— ${situ.charAt(0).toLowerCase()}${situ.slice(1)}`,
      pain && `around ${pain.charAt(0).toLowerCase()}${pain.slice(1)}`,
    ]
      .filter(Boolean)
      .join(" ")
      .replace(/\s+/g, " ")
      .slice(0, 220);
  }

  let outreachGroupPhrase = collapseOutreach(i.outreachGroupPhrase);
  if (!outreachGroupPhrase || GENERIC_ROLE_ALONE.test(outreachGroupPhrase)) {
    const hook = pain ? pain.slice(0, 56) : angle.slice(0, 56);
    outreachGroupPhrase = `${role} dealing with ${hook}`.slice(0, 120);
  }

  let outreachActivityPhrase = collapseOutreach(i.outreachActivityPhrase);
  if (!outreachActivityPhrase) {
    const p = pain.toLowerCase();
    if (/^(i|we)\s/.test(p)) outreachActivityPhrase = pain.slice(0, 130);
    else if (/\b\w+ing\b/.test(pain) && pain.split(/\s+/).length <= 14)
      outreachActivityPhrase = pain.slice(0, 130);
    else outreachActivityPhrase = `dealing with ${pain.charAt(0).toLowerCase()}${pain.slice(1)}`.slice(0, 140);
  }

  let outreachSituationPhrase = collapseOutreach(i.outreachSituationPhrase);
  if (!outreachSituationPhrase) {
    if (ctx && /^(before|during|while|after)\b/i.test(ctx)) outreachSituationPhrase = ctx.slice(0, 100);
    else if (ctx)
      outreachSituationPhrase = `before ${ctx.charAt(0).toLowerCase()}${ctx.slice(1)}`.slice(0, 100);
    else outreachSituationPhrase = "before deadlines and handoffs stack up";
  }

  return {
    whoLineSpecific,
    outreachGroupPhrase,
    outreachActivityPhrase,
    outreachSituationPhrase,
  };
}

/** Deterministic outreach copy — only from interpreted fields (no LLM). */
export function buildTemplatePersonalizedCard(i: ProblemInterpretationOk): PersonalizedFallbackCard {
  const rawPain = collapseOutreach(i.pain) || collapseOutreach(i.cleanProblem);
  const painForLine = rawPain
    ? rawPain.charAt(0).toLowerCase() + rawPain.slice(1).slice(0, 78)
    : undefined;

  const message = buildPersonalizedOutreachDm(
    {
      outreachGroupPhrase: i.outreachGroupPhrase,
      outreachActivityPhrase: i.outreachActivityPhrase,
      outreachSituationPhrase: i.outreachSituationPhrase,
      ...(painForLine ? { painForDealingLine: painForLine } : {}),
    },
    0,
  );

  const followUp = [
    "Hey — just following up.",
    "",
    "Still curious how you're handling it these days?",
  ].join("\n");

  return {
    whoToTalkTo: i.whoLineSpecific.trim().slice(0, 220),
    credibilityLine: CREDIBILITY_FALLBACK_LINE,
    likelyReasonLine: buildLikelyReasonLine(i),
    tags: i.audience.slice(0, 6),
    linkedInSearch: i.linkedinSearch.trim().slice(0, 200),
    message,
    followUp,
  };
}

export function cleanLeadTitle(title: string): string {
  return title.replace(/\s+/g, " ").trim();
}

export function clipSnippet(snippet: string, maxWords = 52): string {
  const w = snippet.replace(/\s+/g, " ").trim().split(/\s+/);
  if (w.length <= maxWords) return w.join(" ");
  return `${w.slice(0, maxWords).join(" ")}…`;
}

const REFINE_PAD = [
  "Who feels the pain first (role or team)?",
  "What breaks today if nothing changes?",
  "What would a good week look like instead?",
];

/**
 * Single OpenAI call → structured intent. Raw input is never passed to search/query builders;
 * only fields on `ProblemInterpretationOk` are used downstream.
 */
export async function interpretUserProblem(
  rawInput: string,
  apiKey: string,
): Promise<ProblemInterpretationResult | null> {
  const input = rawInput.trim().slice(0, MAX_INPUT);
  if (!input) return null;

  const system = `You are a product analyst. Convert messy user input into structured intent.

Return JSON only with this exact shape:
{
  "cleanProblem": string,
  "productCategory": string,
  "audience": string[],
  "pain": string,
  "context": string,
  "searchKeywords": string[],
  "linkedinSearch": string,
  "conversationAngle": string,
  "whoLineSpecific": string,
  "outreachGroupPhrase": string,
  "outreachActivityPhrase": string,
  "outreachSituationPhrase": string,
  "confidence": number,
  "needsClarification": boolean,
  "clarifyingQuestion": string | null,
  "suggestedRefinements": string[]
}

Rules:
- Infer meaning when the user is telegraphic or messy.
- If input is too vague (e.g. only "SaaS", "AI tools", "CRM", "software", category with no concrete task), set needsClarification = true and fill clarifyingQuestion + suggestedRefinements (3–5 short example refinements the user could pick or paste). Omit or empty other fields as needed.
- If you can infer a concrete problem, set needsClarification = false and fill all fields.
- productCategory: short human label (e.g. "Property operations", "Document workflows").
- audience: 3–6 lines. Each must be a concrete slice (role + situation/cadence/workflow), NOT bare labels like "students", "business owners", "users", "founders", "managers", "teams". Good: "Graduate students reviewing 20+ papers weekly", "Consultants summarizing large PDFs before client meetings".
- pain: one short phrase — the hurt; include time pressure or repetition when plausible (e.g. "time-consuming manual handoffs").
- context: when/where it shows up — cadence (daily/weekly/sprints), moment (before client meetings, during on-call), or channel. Make it usable in a sentence ("before board prep", "during release week").
- searchKeywords: 8–14 phrases people actually complain about on forums (no "recommend a tool", no generic "best SaaS").
- linkedinSearch: one string, 4–10 words, pasteable into LinkedIn People search — must match THIS problem only.
- conversationAngle: one clear, relatable sentence (no pitch, no "I built").
- whoLineSpecific: ONE vivid line for outreach targeting — concrete role + typical load or rhythm + pain cue (like the audience examples). Never a generic noun alone.
- outreachGroupPhrase: Short phrase that fits after "I've been talking to a few ___" — same specificity as audience lines (max ~12 words), lowercase start OK.
- outreachActivityPhrase: What they are still doing under pressure — phrase for "Are you still ___?" e.g. "spending hours reconciling spreadsheets", "juggling last-minute deck edits". No "we built", no product pitch.
- outreachSituationPhrase: Tail for timing — either starts with before/during/while/after OR is a short noun phrase we can put after "before" (e.g. "client meetings", "deadline week", "during nightly deploys").
- confidence: 0.0–1.0 for how sure you are that the interpretation matches what they meant.
- suggestedRefinements: when needsClarification is false but you are unsure, still suggest 2–4 optional refinements; when needsClarification is true, use 3–5 refinements.`;

  const user = `User input:\n${input}`;

  const parsed = await openaiJson<Record<string, unknown>>(apiKey, system, user, 0.25);
  if (!parsed) return null;

  let needsClarification = parsed.needsClarification === true;
  if (shouldForceClarification(input)) {
    needsClarification = true;
  }

  const clarifyingQuestion = asTrimmedString(parsed.clarifyingQuestion, 320);
  let suggestedRefinements = asStringArray(parsed.suggestedRefinements, 8, 140);
  if (suggestedRefinements.length === 0) {
    suggestedRefinements = asStringArray(parsed.examples, 8, 140);
  }
  while (suggestedRefinements.length < 3) {
    suggestedRefinements.push(REFINE_PAD[suggestedRefinements.length % REFINE_PAD.length]!);
  }

  if (needsClarification) {
    const q =
      clarifyingQuestion ||
      "What specific problem are you solving, and who feels it day to day?";
    return {
      kind: "clarify",
      clarifyingQuestion: q,
      suggestedRefinements: suggestedRefinements.slice(0, 5),
    };
  }

  const cleanProblem = asTrimmedString(parsed.cleanProblem, 400);
  const productCategory = asTrimmedString(parsed.productCategory, 120);
  const audience = asStringArray(parsed.audience, 8, 80);
  const pain = asTrimmedString(parsed.pain, 300);
  const context = asTrimmedString(parsed.context, 300);
  let searchKeywords = asStringArray(parsed.searchKeywords, 16, 100);
  const linkedinSearch = asTrimmedString(parsed.linkedinSearch, 200);
  const conversationAngle = asTrimmedString(parsed.conversationAngle, 400);
  const confidence =
    typeof parsed.confidence === "number" && Number.isFinite(parsed.confidence)
      ? Math.min(1, Math.max(0, parsed.confidence))
      : 0.65;

  if (!cleanProblem || audience.length === 0 || !pain) {
    return {
      kind: "clarify",
      clarifyingQuestion:
        clarifyingQuestion ||
        "What is going wrong today, and for which kind of customer or team?",
      suggestedRefinements: suggestedRefinements.slice(0, 5),
    };
  }

  if (confidence < 0.55) {
    return {
      kind: "refine",
      clarifyingQuestion:
        clarifyingQuestion ||
        "Which part of this is most urgent — who is affected and what breaks first?",
      suggestedRefinements: suggestedRefinements.slice(0, 5),
      productCategory: productCategory || undefined,
      cleanProblem: cleanProblem || undefined,
      confidence,
    };
  }

  if (searchKeywords.length < 6) {
    const seed = [pain, cleanProblem, context].join(" ").toLowerCase();
    const extra = tokensFromText(seed, 5).slice(0, 8);
    searchKeywords = dedupeCaseInsensitive([...searchKeywords, ...extra]).slice(0, 14);
  }

  const linkedinResolved =
    linkedinSearch ||
    [audience[0], pain].filter(Boolean).join(" ").replace(/\s+/g, " ").trim().slice(0, 200);
  if (!linkedinResolved) return null;

  const whoLineSpecificRaw = asTrimmedString(parsed.whoLineSpecific, 240);
  const outreachGroupPhraseRaw = asTrimmedString(parsed.outreachGroupPhrase, 140);
  const outreachActivityPhraseRaw = asTrimmedString(parsed.outreachActivityPhrase, 160);
  const outreachSituationPhraseRaw = asTrimmedString(parsed.outreachSituationPhrase, 120);

  const outreach = deriveOutreachFields({
    audience,
    pain,
    context,
    cleanProblem,
    conversationAngle: conversationAngle || cleanProblem,
    whoLineSpecific: whoLineSpecificRaw,
    outreachGroupPhrase: outreachGroupPhraseRaw,
    outreachActivityPhrase: outreachActivityPhraseRaw,
    outreachSituationPhrase: outreachSituationPhraseRaw,
  });

  return {
    kind: "ok",
    cleanProblem,
    productCategory: productCategory || "Your space",
    audience,
    pain,
    context,
    searchKeywords: dedupeCaseInsensitive(searchKeywords).slice(0, 14),
    linkedinSearch: linkedinResolved,
    conversationAngle: conversationAngle || cleanProblem,
    confidence,
    ...outreach,
  };
}
