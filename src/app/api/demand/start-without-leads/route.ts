import {
  generateConversationStarters,
  type ConversationStarterRow,
} from "@/lib/demand/conversation-starters-service";
import {
  formatParsedIntentForScoring,
  parseDemandParsedIntentBody,
} from "@/lib/demand/parse-demand-intent";
import {
  getRequestIp,
  logApiRoute,
  MAX_PRODUCT_TEXT_CHARS,
  memoryCacheGet,
  memoryCacheSet,
  normalizeCacheKeyPart,
  rateLimitAllow,
  sanitizeText,
} from "@/lib/server/api-launch-guard";
import { NextResponse } from "next/server";

const WINDOW_MS = 10 * 60 * 1000;
const MAX_REQ_PER_WINDOW = 5;
const MAX_HINTS = 800;
const CACHE_TTL_MS = 30 * 60 * 1000;

const TEMP_FAILURE_MESSAGE =
  "We couldn't fetch full results right now. Please try again shortly.";

export type StartWithoutLeadsResponse = { rows: ConversationStarterRow[] };

export async function POST(request: Request) {
  const t0 = Date.now();
  const route = "start-without-leads";
  const ip = getRequestIp(request);

  if (!rateLimitAllow(route, ip, MAX_REQ_PER_WINDOW, WINDOW_MS)) {
    logApiRoute(route, Date.now() - t0, false, {
      errorType: "rate_limited",
      httpStatus: 429,
    });
    return NextResponse.json(
      { ok: false, error: "Too many requests. Please try again later." },
      { status: 429 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    logApiRoute(route, Date.now() - t0, false, { errorType: "bad_request", httpStatus: 400 });
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  if (!body || typeof body !== "object") {
    logApiRoute(route, Date.now() - t0, false, { errorType: "bad_request", httpStatus: 400 });
    return NextResponse.json({ error: "Invalid payload." }, { status: 400 });
  }

  const { product, intentHintsForScoring, parsedIntent } = body as {
    product?: unknown;
    intentHintsForScoring?: unknown;
    parsedIntent?: unknown;
  };

  const productStr =
    typeof product === "string" ? sanitizeText(product, MAX_PRODUCT_TEXT_CHARS) : "";
  if (!productStr.trim()) {
    logApiRoute(route, Date.now() - t0, false, { errorType: "bad_request", httpStatus: 400 });
    return NextResponse.json(
      { error: "Add a short product description first." },
      { status: 400 },
    );
  }

  const structured = parseDemandParsedIntentBody(parsedIntent);
  const intentBlock = structured ? formatParsedIntentForScoring(structured) : "";
  const hintsBase =
    typeof intentHintsForScoring === "string"
      ? sanitizeText(intentHintsForScoring, MAX_HINTS)
      : "";
  const hintsStr = [intentBlock, hintsBase].filter(Boolean).join("\n\n").slice(0, MAX_HINTS);

  const cacheKey = JSON.stringify({
    p: normalizeCacheKeyPart(productStr).slice(0, 600),
    h: normalizeCacheKeyPart(hintsStr).slice(0, 400),
  });

  const cached = memoryCacheGet<StartWithoutLeadsResponse>("starters", cacheKey);
  if (cached?.rows && cached.rows.length >= 5) {
    logApiRoute(route, Date.now() - t0, true, { resultCount: cached.rows.length });
    return NextResponse.json(cached);
  }

  const apiKey = process.env.OPENAI_API_KEY?.trim();

  try {
    const rows = await generateConversationStarters(
      productStr,
      hintsStr || undefined,
      apiKey,
    );
    const payload: StartWithoutLeadsResponse = { rows };
    memoryCacheSet("starters", cacheKey, payload, CACHE_TTL_MS);
    logApiRoute(route, Date.now() - t0, true, { resultCount: rows.length });
    return NextResponse.json(payload);
  } catch (err) {
    console.error("[api:start-without-leads] unexpected", err instanceof Error ? err.message : err);
    logApiRoute(route, Date.now() - t0, false, { errorType: "temporary_failure", httpStatus: 503 });
    return NextResponse.json(
      {
        ok: false,
        errorType: "temporary_failure" as const,
        message: TEMP_FAILURE_MESSAGE,
      },
      { status: 503 },
    );
  }
}
