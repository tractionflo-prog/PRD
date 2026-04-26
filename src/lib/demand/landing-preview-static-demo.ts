import type { PersonalizedFallbackCard } from "@/lib/demand/problem-interpreter";
import type { ProblemInterpretationOk } from "@/lib/demand/problem-interpreter";
import type { DemandLead } from "@/lib/demand/types";

export type LandingPreviewResultShape = {
  ok: true;
  needsClarification: false;
  needsRefinement: false;
  interpreted: ProblemInterpretationOk;
  productCategory: string;
  confidence: number;
  redditLeads: DemandLead[];
  replyDrafts: { id: string; reply: string }[];
  personalizedFallback: PersonalizedFallbackCard | null;
  apolloLeads?: undefined;
  apolloCopyDraft?: undefined;
  apolloFallbackUsed?: undefined;
  /** When true, UI may show that results are illustrative (optional). */
  staticDemo?: true;
};

function baseInterpreted(trimmed: string): ProblemInterpretationOk {
  const short = trimmed.slice(0, 200).replace(/\s+/g, " ").trim() || "your product";
  return {
    kind: "ok",
    cleanProblem: short,
    productCategory: "B2B software",
    audience: ["founders", "operators"],
    pain: "manual workflows and noisy tools",
    context: "early traction and validation",
    searchKeywords: ["workflow", "spreadsheet", "operations"],
    linkedinSearch: "founder operations workflow",
    conversationAngle: "Ask what they tried last quarter before buying another seat.",
    confidence: 0.62,
    whoLineSpecific: "operators still stitching tools together by hand",
    outreachGroupPhrase: "small teams shipping weekly",
    outreachActivityPhrase: "juggling handoffs between tools",
    outreachSituationPhrase: "before they can justify another seat",
  };
}

/**
 * Deterministic “offline” demo when OpenAI is unavailable or global safety cap is hit.
 * No external APIs — Reddit-shaped leads only (no Apollo).
 */
export function buildStaticLandingDemo(trimmed: string): LandingPreviewResultShape {
  const interpreted = baseInterpreted(trimmed);
  const d1 =
    "Hey — saw your post about ops before hiring. We're building something for teams that want signal without another heavy stack. If you're open to it, what's the noisiest part of your week right now?";
  const d2 =
    "Hi — your thread on lightweight CRMs resonated. We're focused on founders who want fewer tabs, not more. Curious what you tried last that almost worked?";
  const lead1: DemandLead = {
    id: "static-demo-1",
    source: "reddit",
    leadType: "problem",
    signalBand: "medium",
    title: "Anyone else drowning in ops before they hire?",
    subreddit: "SaaS",
    author: "preview_demo",
    url: "https://www.reddit.com/r/SaaS/comments/static-demo-1/",
    snippet:
      "We're a tiny team and the tooling sprawl is real—looking for one calm place to see who did what without another enterprise contract.",
    createdUtc: null,
    numComments: 4,
    intentScore: 72,
    whyMatch: "Matches your problem space for the landing preview (illustrative thread).",
    replyDraft: d1,
  };
  const lead2: DemandLead = {
    id: "static-demo-2",
    source: "reddit",
    leadType: "high_intent",
    signalBand: "strong",
    title: "Lightweight CRM that doesn't add overhead?",
    subreddit: "startups",
    author: "preview_demo",
    url: "https://www.reddit.com/r/startups/comments/static-demo-2/",
    snippet:
      "Evaluating a few options for tracking warm leads—something my cofounder can actually use without a training week.",
    createdUtc: null,
    numComments: 9,
    intentScore: 81,
    whyMatch: "High-intent phrasing aligned with common founder searches (illustrative).",
    replyDraft: d2,
  };
  return {
    ok: true,
    needsClarification: false,
    needsRefinement: false,
    interpreted,
    productCategory: interpreted.productCategory,
    confidence: interpreted.confidence,
    redditLeads: [lead1, lead2],
    replyDrafts: [
      { id: lead1.id, reply: d1 },
      { id: lead2.id, reply: d2 },
    ],
    personalizedFallback: null,
    staticDemo: true,
  };
}
