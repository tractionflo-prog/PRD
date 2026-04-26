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
import { buildStaticLandingDemo } from "@/lib/demand/landing-preview-static-demo";
import { MAX_DEMO_INPUT_LENGTH } from "@/lib/demand/landing-demo-constants";
import {
  buildDemoCookieHeader,
  DEMO_COOLDOWN_MS,
  DEMO_IP_DAILY_LIMIT,
  DEMO_SESSION_LIMIT,
  getClientIp,
  getIpDayCount,
  incrementIpDayCount,
  readDemoCookie,
  tryConsumeOpenAiGlobal,
  type CookiePayload,
} from "@/lib/demand/landing-preview-rate-limit";
import type { ApolloPreviewLead, DemandLead } from "@/lib/demand/types";
import { NextResponse } from "next/server";

const ERR_IP_DAILY =
  "Demo limit reached for today. Join the waitlist and we'll notify you when full access opens.";
const ERR_SESSION =
  "You've reached the preview limit for this browser. Join the waitlist and we'll notify you when full access opens.";
const ERR_COOLDOWN = "Please wait a few seconds before searching again.";

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
  /** Present when Reddit had no matches and Apollo returned people. */
  apolloLeads?: ApolloPreviewLead[];
  apolloCopyDraft?: string;
  apolloFallbackUsed?: boolean;
  staticDemo?: true;
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

function demoSuccessHeaders(ip: string, prev: CookiePayload): HeadersInit {
  incrementIpDayCount(ip);
  const next: CookiePayload = { v: 1, sc: prev.sc + 1, last: Date.now() };
  return { "Set-Cookie": buildDemoCookieHeader(next) };
}

export async function POST(request: Request) {
  const ip = getClientIp(request);
  const demoCookie = readDemoCookie(request);

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid payload." }, { status: 400 });
  }

  if (getIpDayCount(ip) >= DEMO_IP_DAILY_LIMIT) {
    return NextResponse.json({ error: ERR_IP_DAILY, code: "ip_daily" }, { status: 429 });
  }
  if (demoCookie.sc >= DEMO_SESSION_LIMIT) {
    return NextResponse.json({ error: ERR_SESSION, code: "session_limit" }, { status: 429 });
  }
  if (demoCookie.last > 0 && Date.now() - demoCookie.last < DEMO_COOLDOWN_MS) {
    return NextResponse.json(
      { error: ERR_COOLDOWN, code: "cooldown" },
      { status: 429, headers: { "Retry-After": "10" } },
    );
  }

  const { rawInput } = body as { rawInput?: unknown };
  if (typeof rawInput !== "string" || !rawInput.trim()) {
    return NextResponse.json(
      { error: "Describe your problem in a sentence or two." },
      { status: 400 },
    );
  }

  if (rawInput.length > MAX_DEMO_INPUT_LENGTH) {
    return NextResponse.json(
      {
        error: `Keep your description under ${MAX_DEMO_INPUT_LENGTH} characters for the demo.`,
      },
      { status: 400 },
    );
  }

  const trimmed = rawInput.trim();

  const openAiKey = process.env.OPENAI_API_KEY?.trim();

  /** Live OpenAI path: no Apollo on waitlist demo. Static fallback when no key or global cap is full. */
  const serveStaticDemo = () => {
    const payload = buildStaticLandingDemo(trimmed);
    return NextResponse.json(payload, {
      status: 200,
      headers: demoSuccessHeaders(ip, demoCookie),
    });
  };

  if (!openAiKey) {
    return serveStaticDemo();
  }

  if (!tryConsumeOpenAiGlobal(1)) {
    return serveStaticDemo();
  }

  let result: Awaited<ReturnType<typeof interpretUserProblem>>;
  try {
    result = await interpretUserProblem(trimmed, openAiKey);
  } catch (e) {
    console.warn("[landing-preview] interpretUserProblem failed", {
      message: e instanceof Error ? e.message : String(e),
    });
    return serveStaticDemo();
  }

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
    return NextResponse.json(payload, { headers: demoSuccessHeaders(ip, demoCookie) });
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
    return NextResponse.json(payload, { headers: demoSuccessHeaders(ip, demoCookie) });
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
    return NextResponse.json(payload, { headers: demoSuccessHeaders(ip, demoCookie) });
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
    if (tryConsumeOpenAiGlobal(1)) {
      try {
        const replies = await generateDemandReplies(
          baseContext,
          rankedLeads.map((l) => ({
            id: l.id,
            title: l.title,
            snippet: l.snippet,
            url: l.url,
          })),
          openAiKey,
          interpretationToReplySlice(i),
        );
        for (const r of replies) {
          if (r.reply?.trim()) replyDrafts.push({ id: r.id, reply: r.reply.trim() });
        }
      } catch (e) {
        console.warn("[landing-preview] generateDemandReplies failed", {
          message: e instanceof Error ? e.message : String(e),
        });
      }
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
  return NextResponse.json(payload, { headers: demoSuccessHeaders(ip, demoCookie) });
}
