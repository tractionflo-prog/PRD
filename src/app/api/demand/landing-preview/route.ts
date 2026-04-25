import { fetchDemandLeadsFromQueries } from "@/lib/demand/fetch-leads-service";
import { generateDemandReplies } from "@/lib/demand/generate-replies-service";
import {
  buildTemplatePersonalizedCard,
  cleanLeadTitle,
  clipSnippet,
  interpretUserProblem,
  interpretationToParsedIntent,
  interpretationToProductContext,
  interpretationToReplySlice,
  leadPassesRelevanceFilter,
  rankLandingPreviewLeads,
  redditQueriesFromInterpretation,
  type PersonalizedFallbackCard,
  type ProblemInterpretationOk,
} from "@/lib/demand/problem-interpreter";
import type { DemandLead } from "@/lib/demand/types";
import { NextResponse } from "next/server";

const MAX_RAW = 2000;

export type LandingPreviewClarifyResponse = {
  ok: true;
  needsClarification: true;
  clarifyingQuestion: string;
  suggestedRefinements: string[];
};

export type LandingPreviewRefinementResponse = {
  ok: true;
  needsRefinement: true;
  clarifyingQuestion: string;
  suggestedRefinements: string[];
  productCategory?: string;
  cleanProblem?: string;
  confidence: number;
};

export type LandingPreviewResultResponse = {
  ok: true;
  needsClarification: false;
  needsRefinement: false;
  interpreted: ProblemInterpretationOk;
  productCategory: string;
  confidence: number;
  redditLeads: DemandLead[];
  replyDrafts: { id: string; reply: string }[];
  personalizedFallback: PersonalizedFallbackCard | null;
};

export type LandingPreviewResponse =
  | LandingPreviewClarifyResponse
  | LandingPreviewRefinementResponse
  | LandingPreviewResultResponse;

function sanitizeLeadForPreview(lead: DemandLead): DemandLead {
  return {
    ...lead,
    title: cleanLeadTitle(lead.title),
    snippet: clipSnippet(lead.snippet, 52),
  };
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid payload." }, { status: 400 });
  }

  const { rawInput } = body as { rawInput?: unknown };
  if (typeof rawInput !== "string" || !rawInput.trim()) {
    return NextResponse.json(
      { error: "Describe your problem in a sentence or two." },
      { status: 400 },
    );
  }

  const key = process.env.OPENAI_API_KEY?.trim();
  if (!key) {
    return NextResponse.json(
      { error: "This preview is temporarily unavailable." },
      { status: 503 },
    );
  }

  const trimmed = rawInput.trim().slice(0, MAX_RAW);
  const result = await interpretUserProblem(trimmed, key);
  if (!result) {
    return NextResponse.json(
      {
        error:
          "We could not interpret that input. Try rephrasing with who it is for and what breaks.",
      },
      { status: 422 },
    );
  }

  if (result.kind === "clarify") {
    const payload: LandingPreviewClarifyResponse = {
      ok: true,
      needsClarification: true,
      clarifyingQuestion: result.clarifyingQuestion,
      suggestedRefinements: result.suggestedRefinements,
    };
    return NextResponse.json(payload);
  }

  if (result.kind === "refine") {
    const payload: LandingPreviewRefinementResponse = {
      ok: true,
      needsRefinement: true,
      clarifyingQuestion: result.clarifyingQuestion,
      suggestedRefinements: result.suggestedRefinements,
      ...(result.productCategory ? { productCategory: result.productCategory } : {}),
      ...(result.cleanProblem ? { cleanProblem: result.cleanProblem } : {}),
      confidence: result.confidence,
    };
    return NextResponse.json(payload);
  }

  const i: ProblemInterpretationOk = result;
  const baseContext = interpretationToProductContext(i);
  const hints = [...i.searchKeywords, ...i.audience].join(", ").slice(0, 800);
  const mergedProduct = `${baseContext}\n\nRelated search angles (implied demand — match loosely, not verbatim): ${hints}`;

  const queries = redditQueriesFromInterpretation(i);

  if (queries.length === 0) {
    const fb = buildTemplatePersonalizedCard(i);
    const payload: LandingPreviewResultResponse = {
      ok: true,
      needsClarification: false,
      needsRefinement: false,
      interpreted: i,
      productCategory: i.productCategory,
      confidence: i.confidence,
      redditLeads: [],
      replyDrafts: [],
      personalizedFallback: fb,
    };
    return NextResponse.json(payload);
  }

  const parsedIntent = interpretationToParsedIntent(i);
  const { leads } = await fetchDemandLeadsFromQueries(
    mergedProduct,
    queries,
    "reddit",
    parsedIntent,
  );

  const relevant = leads.filter((l) => leadPassesRelevanceFilter(l.title, l.snippet, i));
  const rankedLeads = rankLandingPreviewLeads(relevant, i).slice(0, 2).map(sanitizeLeadForPreview);

  const replyDrafts: { id: string; reply: string }[] = [];
  if (rankedLeads.length > 0) {
    const replies = await generateDemandReplies(
      baseContext,
      rankedLeads.map((l) => ({
        id: l.id,
        title: l.title,
        snippet: l.snippet,
        url: l.url,
      })),
      key,
      interpretationToReplySlice(i),
    );
    for (const r of replies) {
      if (r.reply?.trim()) replyDrafts.push({ id: r.id, reply: r.reply.trim() });
    }
  }

  const personalizedFallback =
    rankedLeads.length === 0 ? buildTemplatePersonalizedCard(i) : null;

  const payload: LandingPreviewResultResponse = {
    ok: true,
    needsClarification: false,
    needsRefinement: false,
    interpreted: i,
    productCategory: i.productCategory,
    confidence: i.confidence,
    redditLeads: rankedLeads,
    replyDrafts,
    personalizedFallback,
  };
  return NextResponse.json(payload);
}
