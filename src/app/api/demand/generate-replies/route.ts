import { generateDemandReplies } from "@/lib/demand/generate-replies-service";
import type { DemandRepliesResponse } from "@/lib/demand/types";
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
const MAX_LEADS = 12;
const CACHE_TTL_MS = 30 * 60 * 1000;

const TEMP_FAILURE_MESSAGE =
  "We couldn't fetch full results right now. Please try again shortly.";

export async function POST(request: Request) {
  const t0 = Date.now();
  const route = "generate-replies";
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

  const { product, leads } = body as {
    product?: unknown;
    leads?: unknown;
  };

  if (typeof product !== "string" || !sanitizeText(product, MAX_PRODUCT_TEXT_CHARS).trim()) {
    logApiRoute(route, Date.now() - t0, false, { errorType: "bad_request", httpStatus: 400 });
    return NextResponse.json(
      { error: "Describe what you built." },
      { status: 400 },
    );
  }

  if (!Array.isArray(leads) || leads.length === 0) {
    logApiRoute(route, Date.now() - t0, false, { errorType: "bad_request", httpStatus: 400 });
    return NextResponse.json(
      { error: "Provide leads to draft replies for." },
      { status: 400 },
    );
  }

  const normalized = leads
    .filter((l): l is Record<string, unknown> => l && typeof l === "object")
    .map((l) => ({
      id: typeof l.id === "string" ? sanitizeText(l.id, 120) : "",
      title: typeof l.title === "string" ? sanitizeText(l.title, 400) : "",
      snippet: typeof l.snippet === "string" ? sanitizeText(l.snippet, 800) : "",
      url: typeof l.url === "string" ? sanitizeText(l.url, 600) : "",
    }))
    .filter((l) => l.id && l.title && l.url)
    .slice(0, MAX_LEADS);

  if (normalized.length === 0) {
    logApiRoute(route, Date.now() - t0, false, { errorType: "bad_request", httpStatus: 400 });
    return NextResponse.json(
      { error: "No valid leads in payload." },
      { status: 400 },
    );
  }

  const trimmed = sanitizeText(product, MAX_PRODUCT_TEXT_CHARS);
  const cacheKey = JSON.stringify({
    p: normalizeCacheKeyPart(trimmed).slice(0, 500),
    ids: normalized.map((l) => l.id).join("|"),
  });

  const cached = memoryCacheGet<DemandRepliesResponse>("replies", cacheKey);
  if (cached?.replies?.length) {
    logApiRoute(route, Date.now() - t0, true, { resultCount: cached.replies.length });
    return NextResponse.json(cached);
  }

  const key = process.env.OPENAI_API_KEY?.trim();

  if (!key) {
    const payload: DemandRepliesResponse = {
      replies: normalized.map((l) => ({
        id: l.id,
        reply: [
          "That situation sounds familiar from what you described — messy in ways that are hard to explain in one line.",
          "What part has been eating the most time or stress for you lately?",
        ].join("\n\n"),
      })),
    };
    logApiRoute(route, Date.now() - t0, true, { resultCount: payload.replies.length });
    return NextResponse.json(payload);
  }

  try {
    const replies = await generateDemandReplies(trimmed, normalized, key);
    const payload: DemandRepliesResponse = { replies };
    memoryCacheSet("replies", cacheKey, payload, CACHE_TTL_MS);
    logApiRoute(route, Date.now() - t0, true, { resultCount: replies.length });
    return NextResponse.json(payload);
  } catch (err) {
    console.error("[api:generate-replies] unexpected", err instanceof Error ? err.message : err);
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
