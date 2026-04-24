import { generateQueriesFromInput } from "@/lib/demand/generate-queries-from-input";
import { isGenericProductInput } from "@/lib/demand/generic-input";
import type { DemandQueryResponse } from "@/lib/demand/types";
import {
  getRequestIp,
  logApiRoute,
  MAX_PRODUCT_TEXT_CHARS,
  MAX_WEBSITE_URL_CHARS,
  memoryCacheGet,
  memoryCacheSet,
  normalizeCacheKeyPart,
  rateLimitAllow,
  sanitizeText,
} from "@/lib/server/api-launch-guard";
import { NextResponse } from "next/server";

const WINDOW_MS = 10 * 60 * 1000;
const MAX_REQ_PER_WINDOW = 5;
const CACHE_TTL_MS = 30 * 60 * 1000;

const TEMP_FAILURE_MESSAGE =
  "We couldn't fetch full results right now. Please try again shortly.";

export async function POST(request: Request) {
  const t0 = Date.now();
  const route = "generate-queries";
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

  const { product, website, expandGeneric } = body as {
    product?: unknown;
    website?: unknown;
    expandGeneric?: unknown;
  };

  const productStr =
    typeof product === "string" ? sanitizeText(product, MAX_PRODUCT_TEXT_CHARS) : "";
  const websiteStr =
    typeof website === "string" ? sanitizeText(website, MAX_WEBSITE_URL_CHARS) : "";
  const expand = expandGeneric === true;

  if (!productStr && !websiteStr) {
    logApiRoute(route, Date.now() - t0, false, { errorType: "bad_request", httpStatus: 400 });
    return NextResponse.json(
      { error: "Describe what you built or paste a website URL." },
      { status: 400 },
    );
  }

  if (!websiteStr && isGenericProductInput(productStr) && !expand) {
    logApiRoute(route, Date.now() - t0, true, { httpStatus: 422 });
    return NextResponse.json(
      {
        error:
          "This looks like a broad category. Add a specific problem or task, or use “Continue with expanded searches” on the demand page.",
        code: "GENERIC_INPUT",
      },
      { status: 422 },
    );
  }

  const cacheKey = JSON.stringify({
    p: normalizeCacheKeyPart(productStr).slice(0, 600),
    w: normalizeCacheKeyPart(websiteStr).slice(0, 400),
    e: expand,
  });

  const cached = memoryCacheGet<DemandQueryResponse>("genQueries", cacheKey);
  if (cached && Array.isArray(cached.queries) && cached.queries.length > 0) {
    logApiRoute(route, Date.now() - t0, true, { resultCount: cached.queries.length });
    return NextResponse.json(cached);
  }

  const key = process.env.OPENAI_API_KEY?.trim();

  try {
    const {
      queries,
      productSummary,
      intentHintsForScoring,
      expandedUseCases,
      parsedIntent,
    } = await generateQueriesFromInput(productStr, websiteStr || undefined, key, {
      expandGeneric: expand,
    });

    if (!Array.isArray(queries) || queries.length === 0) {
      logApiRoute(route, Date.now() - t0, true, { resultCount: 0 });
      return NextResponse.json(
        {
          error:
            "Could not generate queries — try a different URL or add a short description.",
        },
        { status: 422 },
      );
    }

    const payload: DemandQueryResponse = {
      queries,
      ...(productSummary ? { productSummary } : {}),
      ...(intentHintsForScoring ? { intentHintsForScoring } : {}),
      ...(expandedUseCases?.length ? { expandedUseCases } : {}),
      ...(parsedIntent ? { parsedIntent } : {}),
    };
    memoryCacheSet("genQueries", cacheKey, payload, CACHE_TTL_MS);
    logApiRoute(route, Date.now() - t0, true, { resultCount: queries.length });
    return NextResponse.json(payload);
  } catch (err) {
    console.error("[api:generate-queries] unexpected", err instanceof Error ? err.message : err);
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
