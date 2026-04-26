import { apolloMixedPeopleApiSearch, type ApolloApiPerson } from "@/lib/demand/apollo-mixed-search";
import {
  getRequestIp,
  logApiRoute,
  memoryCacheGet,
  memoryCacheSet,
  normalizeCacheKeyPart,
  rateLimitAllow,
  sanitizeText,
} from "@/lib/server/api-launch-guard";
import { NextResponse } from "next/server";

const WINDOW_MS = 10 * 60 * 1000;
const MAX_REQ_PER_WINDOW = 20;
const CACHE_TTL_MS = 20 * 60 * 1000;
const MAX_ROLES = 8;
const MAX_RESULTS = 5;

const ENTITLEMENT_MESSAGE =
  "Apollo API key does not have People API Search / master API access. Endpoint is correct, but workspace entitlement is blocked.";

type LeadOut = {
  name: string;
  title: string;
  company: string;
  email: string;
  linkedin_url: string;
};

function asNonEmpty(v: unknown, max = 180): string {
  return typeof v === "string" ? sanitizeText(v, max) : "";
}

function displayNameFromPerson(p: ApolloApiPerson): string {
  const full = asNonEmpty(p.name, 160);
  if (full) return full;
  const first = asNonEmpty(p.first_name, 80);
  const last =
    asNonEmpty(p.last_name_obfuscated, 80) || asNonEmpty(p.last_name, 80);
  const combined = `${first} ${last}`.trim();
  return combined;
}

function mapPersonToLead(p: ApolloApiPerson): LeadOut | null {
  const name = displayNameFromPerson(p);
  const title = asNonEmpty(p.title, 140);
  const company = asNonEmpty(p.organization?.name, 120);
  if (!name || !title || !company) return null;
  const email = asNonEmpty(p.email, 180);
  const linkedin_url = asNonEmpty(p.linkedin_url, 220);
  return { name, title, company, email, linkedin_url };
}

export async function POST(request: Request) {
  const t0 = Date.now();
  const route = "leads-search";
  const ip = getRequestIp(request);

  if (!rateLimitAllow(route, ip, MAX_REQ_PER_WINDOW, WINDOW_MS)) {
    logApiRoute(route, Date.now() - t0, false, { errorType: "rate_limited", httpStatus: 429 });
    return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429 });
  }

  const apiKey = process.env.APOLLO_API_KEY?.trim();
  console.info("[api:leads-search] APOLLO_API_KEY present:", Boolean(apiKey));
  console.info("[api:leads-search] Apollo endpoint: new (mixed_people/api_search)");
  if (!apiKey) {
    logApiRoute(route, Date.now() - t0, false, { errorType: "misconfigured", httpStatus: 503 });
    return NextResponse.json({ error: "Leads search is temporarily unavailable." }, { status: 503 });
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

  const { query, roles } = body as { query?: unknown; roles?: unknown };
  const q = asNonEmpty(query, 220);
  const roleList = Array.isArray(roles)
    ? roles
        .filter((x): x is string => typeof x === "string" && x.trim().length > 0)
        .map((x) => sanitizeText(x, 80))
        .slice(0, MAX_ROLES)
    : [];

  if (!q) {
    logApiRoute(route, Date.now() - t0, false, { errorType: "bad_request", httpStatus: 400 });
    return NextResponse.json({ error: "Query is required." }, { status: 400 });
  }

  const cacheKey = JSON.stringify({
    v: "api_search_v1",
    q: normalizeCacheKeyPart(q),
    r: roleList.map((r) => normalizeCacheKeyPart(r)).join("|"),
  });
  const cached = memoryCacheGet<{ leads: LeadOut[] }>("leadsSearch", cacheKey);
  if (cached) {
    console.info("[api:leads-search] cache hit", { leadsReturned: cached.leads.length });
    logApiRoute(route, Date.now() - t0, true, { resultCount: cached.leads.length });
    return NextResponse.json(cached);
  }

  try {
    const {
      status: upstreamStatus,
      people,
      errorText,
      peopleCount,
      contactsCount,
      totalEntries,
      authUsed,
    } = await apolloMixedPeopleApiSearch(
      {
        q_keywords: q,
        "person_titles[]": roleList,
        per_page: MAX_RESULTS,
        page: 1,
      },
      apiKey,
    );

    if (upstreamStatus !== 200) {
      const upstreamError =
        asNonEmpty(errorText, 260) || `HTTP ${upstreamStatus}`;
      console.warn("[api:leads-search] Apollo error message:", upstreamError);

      const apiInaccessible =
        upstreamStatus === 403 &&
        (/API_INACCESSIBLE/i.test(upstreamError) ||
          /inaccessible|not accessible/i.test(upstreamError));

      const entitlementBlocked =
        upstreamStatus === 401 ||
        apiInaccessible ||
        /invalid access credentials|entitlement|workspace/i.test(upstreamError);

      if (entitlementBlocked) {
        logApiRoute(route, Date.now() - t0, true, { resultCount: 0 });
        const message =
          upstreamStatus === 403 && apiInaccessible
            ? ENTITLEMENT_MESSAGE
            : "Real lead data is not enabled yet. Please enable Apollo Search API access.";
        return NextResponse.json({
          ok: false,
          errorType: "apollo_not_enabled" as const,
          message,
          leads: [] as LeadOut[],
        });
      }
      logApiRoute(route, Date.now() - t0, false, {
        errorType: "upstream_failed",
        httpStatus: 503,
      });
      return NextResponse.json({ error: "Could not fetch Apollo leads right now." }, { status: 503 });
    }

    const leads: LeadOut[] = people
      .map((p) => mapPersonToLead(p))
      .filter((x): x is LeadOut => !!x)
      .slice(0, MAX_RESULTS);

    console.info("[api:leads-search] Apollo parse summary", {
      authMethod: authUsed,
      httpStatus: upstreamStatus,
      totalEntries,
      peopleCount,
      contactsCount,
      leadsReturned: leads.length,
    });
    if (leads[0]) {
      console.info("[api:leads-search] Sample lead:", {
        name: leads[0].name,
        title: leads[0].title,
        company: leads[0].company,
        hasEmail: Boolean(leads[0].email),
        hasLinkedIn: Boolean(leads[0].linkedin_url),
      });
    }

    const out = { leads };
    memoryCacheSet("leadsSearch", cacheKey, out, CACHE_TTL_MS);
    logApiRoute(route, Date.now() - t0, true, { resultCount: leads.length });
    return NextResponse.json(out);
  } catch (err) {
    console.error("[api:leads-search] unexpected", err instanceof Error ? err.message : err);
    logApiRoute(route, Date.now() - t0, false, { errorType: "temporary_failure", httpStatus: 503 });
    return NextResponse.json({ error: "Could not fetch Apollo leads right now." }, { status: 503 });
  }
}
