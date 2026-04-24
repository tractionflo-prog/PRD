import { fetchDemandLeadsFromQueries } from "@/lib/demand/fetch-leads-service";
import { parseDemandParsedIntentBody } from "@/lib/demand/parse-demand-intent";
import type { CommunitySourceId, DemandFetchResponse } from "@/lib/demand/types";
import {
  getRequestIp,
  logApiRoute,
  MAX_PRODUCT_TEXT_CHARS,
  MAX_QUERIES_PER_REQUEST,
  memoryCacheGet,
  memoryCacheSet,
  normalizeCacheKeyPart,
  rateLimitAllow,
  sanitizeText,
} from "@/lib/server/api-launch-guard";
import { NextResponse } from "next/server";

const WINDOW_MS = 10 * 60 * 1000;
const MAX_REQ_PER_WINDOW = 5;
const MAX_HINTS = 1200;
const CACHE_TTL_MS = 15 * 60 * 1000;

const TEMP_FAILURE_MESSAGE =
  "We couldn't fetch full results right now. Please try again shortly.";

function isSource(v: unknown): v is CommunitySourceId {
  return v === "reddit";
}

function cacheKeyForFetch(
  product: string,
  queries: string[],
  source: CommunitySourceId,
  hints: string,
  parsedFingerprint: string,
): string {
  return JSON.stringify({
    p: normalizeCacheKeyPart(product).slice(0, 800),
    q: queries.map((x) => normalizeCacheKeyPart(x)).join("|"),
    s: source,
    h: normalizeCacheKeyPart(hints).slice(0, 400),
    pi: parsedFingerprint,
  });
}

function parsedIntentFingerprint(parsed: ReturnType<typeof parseDemandParsedIntentBody>): string {
  if (!parsed) return "";
  return [
    normalizeCacheKeyPart(parsed.pain).slice(0, 120),
    normalizeCacheKeyPart(parsed.audience).slice(0, 120),
    normalizeCacheKeyPart(parsed.context).slice(0, 80),
  ].join("::");
}

export async function POST(request: Request) {
  const t0 = Date.now();
  const route = "fetch-leads";
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

  const { product, queries, source, intentHintsForScoring, parsedIntent } = body as {
    product?: unknown;
    queries?: unknown;
    source?: unknown;
    intentHintsForScoring?: unknown;
    parsedIntent?: unknown;
  };

  if (typeof product !== "string" || !sanitizeText(product, MAX_PRODUCT_TEXT_CHARS).trim()) {
    logApiRoute(route, Date.now() - t0, false, { errorType: "bad_request", httpStatus: 400 });
    return NextResponse.json(
      { error: "Describe what you built." },
      { status: 400 },
    );
  }

  if (!Array.isArray(queries) || queries.length === 0) {
    logApiRoute(route, Date.now() - t0, false, { errorType: "bad_request", httpStatus: 400 });
    return NextResponse.json(
      { error: "Provide search queries from the previous step." },
      { status: 400 },
    );
  }

  const qList = queries
    .filter((x): x is string => typeof x === "string" && x.trim() !== "")
    .map((x) => sanitizeText(x, 200))
    .slice(0, MAX_QUERIES_PER_REQUEST);

  if (qList.length === 0) {
    logApiRoute(route, Date.now() - t0, false, { errorType: "bad_request", httpStatus: 400 });
    return NextResponse.json(
      { error: "No valid queries to search." },
      { status: 400 },
    );
  }

  const src: CommunitySourceId = isSource(source) ? source : "reddit";
  const trimmed = sanitizeText(product, MAX_PRODUCT_TEXT_CHARS);
  const hints =
    typeof intentHintsForScoring === "string" && intentHintsForScoring.trim()
      ? sanitizeText(intentHintsForScoring, MAX_HINTS)
      : "";
  const mergedProduct = hints
    ? `${trimmed}\n\nRelated search angles (implied demand — match loosely, not verbatim): ${hints}`
    : trimmed;

  const structured = parseDemandParsedIntentBody(parsedIntent);
  const ck = cacheKeyForFetch(mergedProduct, qList, src, hints, parsedIntentFingerprint(structured));

  const cached = memoryCacheGet<DemandFetchResponse & { ok: true }>("fetchLeads", ck);
  if (cached && cached.ok === true && Array.isArray(cached.leads)) {
    logApiRoute(route, Date.now() - t0, true, { resultCount: cached.leads.length });
    return NextResponse.json(cached);
  }

  try {
    const { leads, usedMock, notice, transportFailed } = await fetchDemandLeadsFromQueries(
      mergedProduct,
      qList,
      src,
      structured,
    );

    if (transportFailed) {
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

    const payload: DemandFetchResponse & { ok: true } = {
      ok: true,
      leads,
      usedMock,
      ...(notice ? { notice } : {}),
    };
    memoryCacheSet("fetchLeads", ck, payload, CACHE_TTL_MS);
    logApiRoute(route, Date.now() - t0, true, { resultCount: leads.length });
    return NextResponse.json(payload);
  } catch (err) {
    console.error("[api:fetch-leads] unexpected", err instanceof Error ? err.message : err);
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
