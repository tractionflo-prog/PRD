/** Apollo People API Search (net-new people; partial profiles until enrichment). */

export const APOLLO_MIXED_PEOPLE_API_SEARCH =
  "https://api.apollo.io/api/v1/mixed_people/api_search";

/** Enrichment: `api_search` often omits `linkedin_url`; bulk_match returns full profile fields (uses credits). */
export const APOLLO_PEOPLE_BULK_MATCH =
  "https://api.apollo.io/api/v1/people/bulk_match?reveal_personal_emails=false&reveal_phone_number=false";

export type ApolloApiPerson = {
  id?: string | null;
  name?: string | null;
  first_name?: string | null;
  last_name?: string | null;
  last_name_obfuscated?: string | null;
  title?: string | null;
  headline?: string | null;
  city?: string | null;
  state?: string | null;
  country?: string | null;
  organization?: { name?: string | null } | null;
  email?: string | null;
  linkedin_url?: string | null;
};

type ApolloSearchResponse = {
  people?: ApolloApiPerson[];
  contacts?: ApolloApiPerson[];
  /** Present on current People API Search responses (root). */
  total_entries?: number | null;
  pagination?: { total_entries?: number | null } | null;
  error?: string;
  error_code?: string;
};

export type ApolloAuthMode = "x-api-key" | "authorization_bearer";

function trimStr(s: string, max: number): string {
  return s.replace(/\0/g, "").trim().slice(0, max);
}

/** Prefer real `name` / `last_name`; never show obfuscated `***` segments in UI. */
export function displayNameFromApolloPerson(p: ApolloApiPerson): string {
  const first = typeof p.first_name === "string" ? trimStr(p.first_name, 80) : "";
  const lastReal =
    typeof p.last_name === "string" && p.last_name.trim() && !/\*+/.test(p.last_name)
      ? trimStr(p.last_name, 80)
      : "";
  const full = typeof p.name === "string" ? trimStr(p.name, 160) : "";
  if (full && !/\*+/.test(full)) return full;
  if (first && lastReal) return `${first} ${lastReal}`.trim();
  if (first) return first;

  const obf =
    typeof p.last_name_obfuscated === "string" ? trimStr(p.last_name_obfuscated, 80) : "";
  if (obf && !/\*+/.test(obf) && first) return `${first} ${obf}`.trim();

  if (full) {
    const cleaned = full.replace(/\*+/g, " ").replace(/\s+/g, " ").trim();
    if (cleaned.length >= 2) return cleaned;
  }
  return first || "Name unavailable";
}

export function locationFromApolloPerson(p: ApolloApiPerson): string {
  const parts = [p.city, p.state, p.country]
    .filter((x): x is string => typeof x === "string" && x.trim().length > 0)
    .map((x) => x.trim());
  return parts.join(", ").slice(0, 120);
}

function parseResponse(text: string): ApolloSearchResponse {
  try {
    return JSON.parse(text) as ApolloSearchResponse;
  } catch {
    return {};
  }
}

/** Rows to map as leads: union of `people` and `contacts` (both may be populated). */
export function apolloMergedPeopleAndContacts(data: ApolloSearchResponse): ApolloApiPerson[] {
  const fromPeople = Array.isArray(data.people) ? data.people : [];
  const fromContacts = Array.isArray(data.contacts) ? data.contacts : [];
  return [...fromPeople, ...fromContacts];
}

function totalEntriesFromApollo(data: ApolloSearchResponse): number | null {
  const a = data.total_entries;
  const b = data.pagination?.total_entries;
  return (typeof a === "number" && Number.isFinite(a) ? a : null) ??
    (typeof b === "number" && Number.isFinite(b) ? b : null);
}

function summarize(parsed: ApolloSearchResponse) {
  const peopleRows = Array.isArray(parsed.people) ? parsed.people : [];
  const contactRows = Array.isArray(parsed.contacts) ? parsed.contacts : [];
  const merged = apolloMergedPeopleAndContacts(parsed);
  const keys = parsed && typeof parsed === "object" ? Object.keys(parsed) : [];
  const totalEntries = totalEntriesFromApollo(parsed);
  const err =
    (typeof parsed.error === "string" && parsed.error) ||
    (typeof parsed.error_code === "string" && parsed.error_code) ||
    "";
  return { merged, peopleRows, contactRows, keys, totalEntries, err };
}

function log401Body(auth: ApolloAuthMode, status: number, text: string) {
  if (status === 401) {
    console.warn("[apollo-mixed-search] 401 response body (truncated, no key)", {
      authMethod: auth,
      bodyPreview: text.slice(0, 800),
    });
  }
}

async function postJson(
  jsonBody: Record<string, unknown>,
  apiKey: string,
  auth: ApolloAuthMode,
): Promise<{ status: number; text: string }> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
  };
  if (auth === "x-api-key") headers["x-api-key"] = apiKey;
  else headers.Authorization = `Bearer ${apiKey}`;

  const res = await fetch(APOLLO_MIXED_PEOPLE_API_SEARCH, {
    method: "POST",
    headers,
    body: JSON.stringify(jsonBody),
  });
  const text = await res.text();
  log401Body(auth, res.status, text);
  return { status: res.status, text };
}

async function postForm(
  form: URLSearchParams,
  apiKey: string,
  auth: ApolloAuthMode,
): Promise<{ status: number; text: string }> {
  const headers: Record<string, string> = {
    "Content-Type": "application/x-www-form-urlencoded",
    Accept: "application/json",
  };
  if (auth === "x-api-key") headers["x-api-key"] = apiKey;
  else headers.Authorization = `Bearer ${apiKey}`;

  const res = await fetch(APOLLO_MIXED_PEOPLE_API_SEARCH, {
    method: "POST",
    headers,
    body: form.toString(),
  });
  const text = await res.text();
  log401Body(auth, res.status, text);
  return { status: res.status, text };
}

/**
 * Try x-api-key first; if not HTTP 200, try Authorization Bearer.
 * Does not log the API key.
 */
async function postJsonWithDualAuth(
  jsonBody: Record<string, unknown>,
  apiKey: string,
): Promise<{ status: number; text: string; authUsed: ApolloAuthMode }> {
  const primary = await postJson(jsonBody, apiKey, "x-api-key");
  if (primary.status === 200) {
    return { ...primary, authUsed: "x-api-key" };
  }
  const fallback = await postJson(jsonBody, apiKey, "authorization_bearer");
  return { ...fallback, authUsed: "authorization_bearer" };
}

async function postJsonBulkMatch(
  jsonBody: Record<string, unknown>,
  apiKey: string,
  auth: ApolloAuthMode,
): Promise<{ status: number; text: string }> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
  };
  if (auth === "x-api-key") headers["x-api-key"] = apiKey;
  else headers.Authorization = `Bearer ${apiKey}`;

  const res = await fetch(APOLLO_PEOPLE_BULK_MATCH, {
    method: "POST",
    headers,
    body: JSON.stringify(jsonBody),
  });
  const text = await res.text();
  log401Body(auth, res.status, text);
  return { status: res.status, text };
}

async function postJsonBulkMatchDualAuth(
  jsonBody: Record<string, unknown>,
  apiKey: string,
): Promise<{ status: number; text: string; authUsed: ApolloAuthMode }> {
  const primary = await postJsonBulkMatch(jsonBody, apiKey, "x-api-key");
  if (primary.status === 200) {
    return { ...primary, authUsed: "x-api-key" };
  }
  const fallback = await postJsonBulkMatch(jsonBody, apiKey, "authorization_bearer");
  return { ...fallback, authUsed: "authorization_bearer" };
}

/**
 * Merge `linkedin_url` / `email` from People Bulk Match into rows returned by `api_search`.
 * Up to 10 Apollo `id`s per request. Non-200 or parse errors leave `people` unchanged.
 */
export async function apolloBulkMatchEnrichPeople(
  people: ApolloApiPerson[],
  apiKey: string,
): Promise<ApolloApiPerson[]> {
  const ids = [
    ...new Set(people.map((p) => (typeof p.id === "string" ? p.id.trim() : "")).filter(Boolean)),
  ].slice(0, 10);
  if (ids.length === 0) return people;

  const { status, text, authUsed } = await postJsonBulkMatchDualAuth(
    { details: ids.map((id) => ({ id })) },
    apiKey,
  );

  if (status !== 200) {
    console.warn("[apollo-mixed-search] bulk_match failed", { httpStatus: status, authMethod: authUsed });
    return people;
  }

  let parsed: {
    matches?: Array<{ id?: string; linkedin_url?: string | null; email?: string | null }>;
  };
  try {
    parsed = JSON.parse(text) as typeof parsed;
  } catch {
    return people;
  }

  const matches = Array.isArray(parsed.matches) ? parsed.matches : [];
  const byId = new Map<string, { linkedin_url?: string; email?: string }>();
  for (const m of matches) {
    if (typeof m.id !== "string" || !m.id.trim()) continue;
    const li = typeof m.linkedin_url === "string" && m.linkedin_url.trim() ? m.linkedin_url.trim() : undefined;
    const em = typeof m.email === "string" && m.email.trim() ? m.email.trim() : undefined;
    byId.set(m.id.trim(), { linkedin_url: li, email: em });
  }

  console.info("[apollo-mixed-search] bulk_match merged", {
    authMethod: authUsed,
    httpStatus: status,
    requestedIds: ids.length,
    matchRows: matches.length,
  });

  return people.map((p) => {
    const id = typeof p.id === "string" ? p.id.trim() : "";
    const row = id ? byId.get(id) : undefined;
    if (!row) return p;
    return {
      ...p,
      linkedin_url: row.linkedin_url || p.linkedin_url,
      email: row.email || p.email,
    };
  });
}

/**
 * Dev-only: minimal requests to verify auth + response shape (logs only).
 * 1) q_keywords only  2) person_titles[] + q_keywords
 * Each: x-api-key first; Bearer only if status !== 200.
 */
export async function apolloMixedPeopleApiSearchAuthSmokeTest(apiKey: string): Promise<
  Array<{
    label: string;
    attempts: Array<{
      authMethod: ApolloAuthMode;
      status: number;
      responseKeys: string[];
      peopleLength: number;
      contactsLength: number;
      totalEntries: number | null;
    }>;
  }>
> {
  const tests: Array<{ label: string; body: Record<string, unknown> }> = [
    {
      label: "minimal_q_keywords",
      body: { q_keywords: "property management", page: 1, per_page: 3 },
    },
    {
      label: "titles_plus_q_keywords",
      body: {
        "person_titles[]": ["Property Manager"],
        q_keywords: "property management",
        page: 1,
        per_page: 3,
      },
    },
  ];

  const out: Array<{
    label: string;
    attempts: Array<{
      authMethod: ApolloAuthMode;
      status: number;
      responseKeys: string[];
      peopleLength: number;
      contactsLength: number;
      totalEntries: number | null;
    }>;
  }> = [];

  for (const t of tests) {
    const attempts: Array<{
      authMethod: ApolloAuthMode;
      status: number;
      responseKeys: string[];
      peopleLength: number;
      contactsLength: number;
      totalEntries: number | null;
    }> = [];

    console.info("[apollo-mixed-search] smoke test endpoint", APOLLO_MIXED_PEOPLE_API_SEARCH);
    console.info("[apollo-mixed-search] smoke test body", t.body);

    let r = await postJson(t.body, apiKey, "x-api-key");
    let parsed = parseResponse(r.text);
    let sum = summarize(parsed);
    attempts.push({
      authMethod: "x-api-key",
      status: r.status,
      responseKeys: sum.keys,
      peopleLength: sum.peopleRows.length,
      contactsLength: sum.contactRows.length,
      totalEntries: sum.totalEntries,
    });
    console.info("[apollo-mixed-search] smoke attempt", {
      label: t.label,
      authMethod: "x-api-key",
      status: r.status,
      responseKeys: sum.keys,
      peopleLength: sum.peopleRows.length,
      contactsLength: sum.contactRows.length,
      totalEntries: sum.totalEntries,
    });

    if (r.status !== 200) {
      r = await postJson(t.body, apiKey, "authorization_bearer");
      parsed = parseResponse(r.text);
      sum = summarize(parsed);
      attempts.push({
        authMethod: "authorization_bearer",
        status: r.status,
        responseKeys: sum.keys,
        peopleLength: sum.peopleRows.length,
        contactsLength: sum.contactRows.length,
        totalEntries: sum.totalEntries,
      });
      console.info("[apollo-mixed-search] smoke attempt", {
        label: t.label,
        authMethod: "authorization_bearer",
        status: r.status,
        responseKeys: sum.keys,
        peopleLength: sum.peopleRows.length,
        contactsLength: sum.contactRows.length,
        totalEntries: sum.totalEntries,
      });
    }

    out.push({ label: t.label, attempts });
  }

  return out;
}

/**
 * POST api_search. Returns parsed people array (empty on hard failure).
 * Caller handles entitlement / logging.
 */
export async function apolloMixedPeopleApiSearch(
  body: Record<string, unknown>,
  apiKey: string,
): Promise<{
  status: number;
  people: ApolloApiPerson[];
  errorText: string;
  peopleCount: number;
  contactsCount: number;
  totalEntries: number | null;
  responseKeys: string[];
  authUsed: ApolloAuthMode;
}> {
  const titlesArray = Array.isArray(body["person_titles[]"])
    ? body["person_titles[]"]
    : Array.isArray(body.person_titles)
      ? body.person_titles
      : [];
  const normalizedTitles = titlesArray
    .filter((x): x is string => typeof x === "string" && x.trim().length > 0)
    .map((x) => x.trim())
    .slice(0, 12);

  const qKeywords =
    typeof body.q_keywords === "string" ? body.q_keywords.trim().slice(0, 240) : "";
  const page =
    typeof body.page === "number" && Number.isFinite(body.page) && body.page >= 1
      ? Math.floor(body.page)
      : 1;
  const perPage =
    typeof body.per_page === "number" && Number.isFinite(body.per_page) && body.per_page >= 1
      ? Math.floor(body.per_page)
      : 5;

  const jsonBody: Record<string, unknown> = {
    ...(normalizedTitles.length > 0 ? { "person_titles[]": normalizedTitles } : {}),
    ...(qKeywords ? { q_keywords: qKeywords } : {}),
    page,
    per_page: perPage,
  };

  console.info("[apollo-mixed-search] endpoint", APOLLO_MIXED_PEOPLE_API_SEARCH);
  console.info("[apollo-mixed-search] request json body", jsonBody);

  const { status, text, authUsed } = await postJsonWithDualAuth(jsonBody, apiKey);
  const parsed = parseResponse(text);
  const summary = summarize(parsed);

  console.info("[apollo-mixed-search] response parse (json)", {
    authMethod: authUsed,
    httpStatus: status,
    topLevelKeys: summary.keys,
    totalEntries: summary.totalEntries,
    peopleCount: summary.peopleRows.length,
    contactsCount: summary.contactRows.length,
    mergedRowCount: summary.merged.length,
  });

  if (status === 200 && summary.merged.length === 0) {
    const form = new URLSearchParams();
    for (const t of normalizedTitles) form.append("person_titles[]", t);
    if (qKeywords) form.set("q_keywords", qKeywords);
    form.set("page", String(page));
    form.set("per_page", String(perPage));

    console.info("[apollo-mixed-search] request form params", form.toString());

    const resForm = await postForm(form, apiKey, authUsed);
    const parsedForm = parseResponse(resForm.text);
    const formSummary = summarize(parsedForm);
    console.info("[apollo-mixed-search] response parse (form)", {
      authMethod: authUsed,
      httpStatus: resForm.status,
      topLevelKeys: formSummary.keys,
      totalEntries: formSummary.totalEntries,
      peopleCount: formSummary.peopleRows.length,
      contactsCount: formSummary.contactRows.length,
      mergedRowCount: formSummary.merged.length,
    });
    return {
      status: resForm.status,
      people: formSummary.merged,
      errorText: formSummary.err || summary.err,
      peopleCount: formSummary.peopleRows.length,
      contactsCount: formSummary.contactRows.length,
      totalEntries: formSummary.totalEntries,
      responseKeys: formSummary.keys,
      authUsed,
    };
  }

  return {
    status,
    people: summary.merged,
    errorText: summary.err,
    peopleCount: summary.peopleRows.length,
    contactsCount: summary.contactRows.length,
    totalEntries: summary.totalEntries,
    responseKeys: summary.keys,
    authUsed,
  };
}
