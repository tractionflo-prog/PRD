import { apolloMixedPeopleApiSearchAuthSmokeTest } from "@/lib/demand/apollo-mixed-search";
import { NextResponse } from "next/server";

/**
 * Dev/diagnostic: runs minimal Apollo `mixed_people/api_search` smoke tests
 * (x-api-key first, Bearer if not 200). Logs shape; never logs API keys.
 */
export async function GET() {
  const apiKey = process.env.APOLLO_API_KEY?.trim();
  console.info("[api:apollo-test] endpoint: POST /api/v1/mixed_people/api_search");
  console.info("[api:apollo-test] APOLLO_API_KEY present:", Boolean(apiKey));

  if (!apiKey) {
    return NextResponse.json(
      { ok: false, error: "APOLLO_API_KEY is not set." },
      { status: 503 },
    );
  }

  try {
    const smoke = await apolloMixedPeopleApiSearchAuthSmokeTest(apiKey);

    const lastAttempt = (label: string) => {
      const block = smoke.find((s) => s.label === label);
      const a = block?.attempts[block.attempts.length - 1];
      return a
        ? {
            authMethod: a.authMethod,
            status: a.status,
            responseKeys: a.responseKeys,
            peopleLength: a.peopleLength,
            contactsLength: a.contactsLength,
            totalEntries: a.totalEntries,
          }
        : null;
    };

    return NextResponse.json({
      ok: true,
      endpoint: "POST https://api.apollo.io/api/v1/mixed_people/api_search",
      smokeTests: smoke,
      summary: {
        minimal_q_keywords: lastAttempt("minimal_q_keywords"),
        titles_plus_q_keywords: lastAttempt("titles_plus_q_keywords"),
      },
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("[api:apollo-test] smoke error:", msg);
    return NextResponse.json(
      {
        ok: false,
        endpoint: "POST https://api.apollo.io/api/v1/mixed_people/api_search",
        error: "Smoke test failed.",
        detail: msg,
      },
      { status: 503 },
    );
  }
}
