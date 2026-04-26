import {
  apolloBulkMatchEnrichPeople,
  apolloMixedPeopleApiSearch,
  displayNameFromApolloPerson,
  locationFromApolloPerson,
  type ApolloApiPerson,
} from "./apollo-mixed-search";
import type { ProblemInterpretationOk } from "./problem-interpreter";
import { openaiJson } from "./openai-json";
import type { ApolloPreviewLead } from "./types";

/** Apollo returns up to this many rows per call; we rank down to TOP_N. */
const APOLLO_PER_PAGE = 15;
const TOP_N = 3;
/** Max unique mappable people to collect before ranking. */
const PROGRESSIVE_ACCUM_CAP = 8;
/** Max alternate titles to try (each runs kw+title → kw-only → title-only). */
const MAX_TITLE_CYCLES = 2;

export type ApolloPreviewSearchLevel = "kw_plus_title" | "kw_only" | "title_only";

export type ApolloPreviewSearchMeta = {
  searchLevelUsed: ApolloPreviewSearchLevel | null;
  apolloTotalFound: number;
  fallbackUsed: boolean;
  lastHttpStatus: number;
};

type SearchParamsOut = {
  /** 2–4 word recruiter-style Apollo `q_keywords` (never long AI prose). */
  q_keywords: string;
  /** Ordered titles: first is primary; later entries are fallback cycles only. */
  titles: string[];
};

const SIMPLE_FALLBACK_TITLES = ["Product Manager", "Operations Manager"] as const;

const HEURISTIC_STOP = new Set([
  "the",
  "and",
  "for",
  "with",
  "that",
  "this",
  "from",
  "into",
  "about",
  "your",
  "their",
  "best",
  "top",
  "app",
  "tool",
  "using",
  "teams",
  "team",
  "people",
  "users",
  "user",
  "customer",
  "customers",
  "software",
  "platform",
  "solution",
  "digital",
  "online",
  "free",
  "easy",
]);

function normalizeSpace(s: string): string {
  return s.replace(/\s+/g, " ").trim();
}

function clampRecruiterQ(s: string): string {
  const words = normalizeSpace(s)
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 4);
  return words.join(" ").slice(0, 48);
}

/** Strip marketing / sentence patterns; keep a short domain phrase. */
function recruiterKeywordsHeuristic(i: ProblemInterpretationOk): string {
  let blob = normalizeSpace(
    [i.productCategory, i.searchKeywords[0] ?? "", i.searchKeywords[1] ?? ""].join(" "),
  );
  blob = blob
    .replace(/\b(best|top|leading)\s+[\w'-]+\s+for\b/gi, " ")
    .replace(/\bneed for an?\b/gi, " ")
    .replace(/\b(looking|trying) to (find|get)\b/gi, " ")
    .replace(/\b(tailored|built|designed) for\b/gi, " ")
    .replace(/\btime[- ]?consuming\b/gi, " ")
    .replace(/\bsoftware for\b/gi, " ")
    .replace(/[?.!,;:]+/g, " ");

  const words = blob
    .toLowerCase()
    .split(/\s+/)
    .filter((w) => w.length > 2 && !HEURISTIC_STOP.has(w))
    .slice(0, 3);
  let q = words.join(" ");
  if (q.length < 4) {
    const catFirst = normalizeSpace(i.productCategory)
      .split(/\s+/)
      .filter((w) => w.length > 2)[0];
    const sk = (i.searchKeywords[0] ?? "").toLowerCase().split(/\s+/).filter((w) => w.length > 2)[0];
    q = normalizeSpace([catFirst, sk].filter(Boolean).join(" ")).slice(0, 48);
  }
  return clampRecruiterQ(q || normalizeSpace(i.productCategory).slice(0, 40));
}

function looksLikeBadRecruiterQ(q: string): boolean {
  return (
    q.length > 52 ||
    q.split(/\s+/).length > 5 ||
    /\b(best|looking for|tailored|need for|time[- ]?consuming|software for)\b/i.test(q) ||
    /[.?!]/.test(q)
  );
}

async function deriveRecruiterSearchFromOpenAI(
  userInput: string,
  i: ProblemInterpretationOk,
  apiKey: string,
): Promise<{ titles: string[]; recruiter_q: string }> {
  const system = `You build Apollo.io People Search parameters (recruiter-style).

Return JSON only: { "roles": string[], "recruiter_q": string }

roles:
- Exactly 3 short job titles: buyers, builders, or deciders.
- Not end users (avoid student, customer, user, tenant, shopper, patient, guest).
- Each title 2–4 words, common phrasing.

recruiter_q:
- Exactly 2 to 4 words. Industry or domain ONLY for keyword search.
- Examples: "property management", "sales operations", "corporate events"
- Never sentences, questions, or marketing ("best … for …", "need for an effective …").

Grounding:
productCategory: ${i.productCategory}
searchKeywords: ${i.searchKeywords.slice(0, 4).join("; ")}`;

  const parsed = await openaiJson<Record<string, unknown>>(apiKey, system, userInput.slice(0, 300), 0.2);
  const rolesRaw = parsed?.roles;
  const roles = Array.isArray(rolesRaw)
    ? rolesRaw
        .filter((x): x is string => typeof x === "string")
        .map((x) => normalizeSpace(x).slice(0, 80))
        .filter((x) => x.length >= 4)
        .filter(
          (x) => !/\b(student|customer|users?|tenant|consumer|patient|shopper|traveler|guest)\b/i.test(x),
        )
        .slice(0, 3)
    : [];

  let recruiter_q =
    typeof parsed?.recruiter_q === "string" ? clampRecruiterQ(normalizeSpace(parsed.recruiter_q)) : "";
  if (!recruiter_q || looksLikeBadRecruiterQ(recruiter_q)) {
    recruiter_q = recruiterKeywordsHeuristic(i);
  }

  const mergedTitles = [...roles, ...SIMPLE_FALLBACK_TITLES].slice(0, MAX_TITLE_CYCLES + 1);
  const titles = dedupeTitlesCaseInsensitive(mergedTitles).slice(0, MAX_TITLE_CYCLES + 1);

  return {
    titles: titles.length ? titles : ["Product Manager", "Operations Manager"],
    recruiter_q: recruiter_q || recruiterKeywordsHeuristic(i),
  };
}

function isPropertyRentalInput(i: ProblemInterpretationOk): boolean {
  const blob = normalizeSpace([i.cleanProblem, i.pain, i.context, i.productCategory, ...i.searchKeywords].join(" "))
    .toLowerCase();
  return /\b(property|rental|rent|tenant|leasing|lease|real estate|apartment|landlord)\b/.test(blob);
}

function tokenize(s: string, minLen: number): string[] {
  const raw = s.toLowerCase().match(new RegExp(`[a-z0-9]{${minLen},}`, "g")) ?? [];
  return [...new Set(raw)].slice(0, 40);
}

function overlapScore(hay: string, needles: string[]): number {
  let n = 0;
  for (const t of needles) {
    if (t.length >= 4 && hay.includes(t)) n += 1;
  }
  return n;
}

/** Heuristic ranking: title / keywords / category / seniority / company vs interpretation. */
export function scoreApolloPersonForInterpretation(
  p: {
    title: string;
    company: string;
    haystack: string;
  },
  i: ProblemInterpretationOk,
  qKeywords: string,
): number {
  const titleLow = p.title.toLowerCase();
  const companyLow = p.company.toLowerCase();
  const blob = p.haystack.toLowerCase();

  const kw = tokenize(
    [i.cleanProblem, i.pain, i.context, i.productCategory, qKeywords, ...i.searchKeywords].join(
      " ",
    ),
    4,
  );
  const aud = tokenize(i.audience.join(" "), 4);

  let s = 0;
  s += overlapScore(titleLow, kw) * 5;
  s += overlapScore(titleLow, aud) * 4;
  s += overlapScore(blob, kw) * 2;
  s += overlapScore(companyLow, tokenize(i.productCategory, 4)) * 3;
  s += overlapScore(companyLow, kw) * 2;

  const senior = /\b(founder|co-?founder|ceo|cto|cfo|cpo|vp|vice president|director|head of|lead|manager|principal)\b/i;
  if (senior.test(p.title)) s += 4;

  return s;
}

async function deriveApolloSearchWithOpenAI(
  i: ProblemInterpretationOk,
  apiKey: string,
): Promise<SearchParamsOut> {
  if (isPropertyRentalInput(i)) {
    return {
      q_keywords: "property management",
      titles: ["Property Manager", "Leasing Manager"],
    };
  }

  const userInput = normalizeSpace(i.cleanProblem || i.pain || i.productCategory).slice(0, 220);
  const { titles, recruiter_q } = await deriveRecruiterSearchFromOpenAI(userInput, i, apiKey);
  return { titles, q_keywords: recruiter_q };
}

function fallbackSearchParams(i: ProblemInterpretationOk): SearchParamsOut {
  if (isPropertyRentalInput(i)) {
    return { q_keywords: "property management", titles: ["Property Manager", "Leasing Manager"] };
  }
  return {
    q_keywords: recruiterKeywordsHeuristic(i) || "operations",
    titles: [...SIMPLE_FALLBACK_TITLES],
  };
}

function mapPersonToPreview(p: ApolloApiPerson): ApolloPreviewLead | null {
  const explicitId = typeof p.id === "string" && p.id.trim() ? p.id.trim() : "";
  const name = displayNameFromApolloPerson(p);
  const titleRaw = typeof p.title === "string" ? p.title : typeof p.headline === "string" ? p.headline : "";
  const title = titleRaw.replace(/\s+/g, " ").trim().slice(0, 200);
  const company =
    typeof p.organization?.name === "string"
      ? p.organization.name.replace(/\s+/g, " ").trim().slice(0, 200)
      : "";
  const linkedin_url = typeof p.linkedin_url === "string" ? p.linkedin_url.trim().slice(0, 500) : "";
  const fallbackId = linkedin_url || `${name.toLowerCase()}|${title.toLowerCase()}|${company.toLowerCase()}`;
  const id = explicitId || fallbackId.slice(0, 240);
  if (!id || !name || !title) return null;
  const location = locationFromApolloPerson(p);
  const email = typeof p.email === "string" ? p.email.trim().slice(0, 200) : "";
  return {
    id,
    name,
    title,
    company,
    location,
    email,
    linkedin_url,
    whyMatch: "",
  };
}

function apolloPersonDedupeKey(p: ApolloApiPerson): string {
  const li =
    typeof p.linkedin_url === "string" && p.linkedin_url.trim()
      ? p.linkedin_url.trim().toLowerCase()
      : "";
  if (li) return `li:${li}`;
  const name = displayNameFromApolloPerson(p).toLowerCase().trim();
  const org =
    typeof p.organization?.name === "string" && p.organization.name.trim()
      ? p.organization.name.trim().toLowerCase()
      : "";
  return `nc:${name}|${org}`;
}

function dedupeTitlesCaseInsensitive(titles: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const t of titles) {
    const x = t.replace(/\s+/g, " ").trim().slice(0, 80);
    if (x.length < 4) continue;
    const k = x.toLowerCase();
    if (seen.has(k)) continue;
    seen.add(k);
    out.push(x);
  }
  return out;
}

type SearchStep = { level: ApolloPreviewSearchLevel; sendQ: boolean; sendTitle: boolean };

const RECRUITER_STEPS: SearchStep[] = [
  { level: "kw_plus_title", sendQ: true, sendTitle: true },
  { level: "kw_only", sendQ: true, sendTitle: false },
  { level: "title_only", sendQ: false, sendTitle: true },
];

/**
 * Recruiter-style Apollo search: one title per request, short q_keywords.
 * Per title: q+title → q only → title only. Repeats with next title if still sparse.
 */
async function recruiterStyleApolloPeopleSearch(
  base: SearchParamsOut,
  apolloApiKey: string,
): Promise<{
  people: ApolloApiPerson[];
  searchLevelUsed: ApolloPreviewSearchLevel | null;
  apolloTotalFound: number;
  fallbackUsed: boolean;
  lastHttpStatus: number;
}> {
  const q = clampRecruiterQ(base.q_keywords);
  const titles = dedupeTitlesCaseInsensitive(base.titles).slice(0, MAX_TITLE_CYCLES + 1);

  const bucket: ApolloApiPerson[] = [];
  const seenKeys = new Set<string>();
  let apolloTotalFound = 0;
  let lastHttpStatus = 0;
  let deepestLevelWithAdds: ApolloPreviewSearchLevel | null = null;

  outer: for (const title of titles) {
    for (const step of RECRUITER_STEPS) {
      if (step.sendTitle && !title) continue;
      if (step.sendQ && q.length < 2) continue;
      if (step.level === "kw_plus_title" && (!title || q.length < 2)) continue;

      const requestBody: Record<string, unknown> = {
        page: 1,
        per_page: APOLLO_PER_PAGE,
      };
      if (step.sendQ && q.length >= 2) requestBody.q_keywords = q;
      if (step.sendTitle && title) requestBody["person_titles[]"] = [title];

      const {
        status,
        people,
        errorText,
        peopleCount,
        contactsCount,
        totalEntries,
        responseKeys,
      } = await apolloMixedPeopleApiSearch(requestBody, apolloApiKey);

      lastHttpStatus = status;
      apolloTotalFound += people.length;

      console.info("[apollo-landing-preview] Apollo recruiter search", {
        step: step.level,
        titleUsed: step.sendTitle ? title : null,
        finalKeyword: step.sendQ ? q : null,
        resultCount: people.length,
        peopleCount,
        contactsCount,
        totalEntries,
        httpStatus: status,
        responseKeys,
        apolloError: errorText ? errorText.slice(0, 200) : undefined,
      });

      if (status !== 200) continue;

      let addedThisLevel = 0;
      for (const p of people) {
        if (!mapPersonToPreview(p)) continue;
        const k = apolloPersonDedupeKey(p);
        if (seenKeys.has(k)) continue;
        seenKeys.add(k);
        bucket.push(p);
        addedThisLevel++;
        if (bucket.length >= PROGRESSIVE_ACCUM_CAP) break;
      }

      if (addedThisLevel > 0) {
        deepestLevelWithAdds = step.level;
      }

      if (bucket.length >= TOP_N) break outer;
      if (bucket.length >= PROGRESSIVE_ACCUM_CAP) break outer;
    }
    if (bucket.length >= TOP_N) break;
  }

  const fallbackUsed = deepestLevelWithAdds !== null && deepestLevelWithAdds !== "kw_plus_title";

  return {
    people: bucket,
    searchLevelUsed: deepestLevelWithAdds,
    apolloTotalFound,
    fallbackUsed,
    lastHttpStatus,
  };
}

/** Copy block for Apollo preview — uses interpretation only (no Apollo row text). */
function buildApolloReplyDraft(i: ProblemInterpretationOk): string {
  const problem =
    normalizeSpace(i.cleanProblem || i.productCategory).slice(0, 140) || "this challenge";
  const role = normalizeSpace(i.audience[0] ?? i.outreachGroupPhrase ?? "people in your space").slice(
    0,
    90,
  );
  const pain = normalizeSpace(i.pain).slice(0, 160) || "similar pain points";
  return `Hey — quick question.

Are you still dealing with ${problem}?

I've been speaking with a few ${role} and many mentioned ${pain}.

Curious if that's something you're dealing with?`;
}

/** One line under each lead — trust cue from interpretation, not fabricated Apollo fields. */
function buildLikelyHandlesLine(i: ProblemInterpretationOk, variant: number): string {
  const verbs = ["handles", "manages", "oversees"] as const;
  const verb = verbs[variant % verbs.length];

  const kws = i.searchKeywords
    .map((k) => normalizeSpace(k))
    .filter((k) => k.length > 2)
    .slice(0, 2);
  if (kws.length >= 2) {
    const a = kws[0].toLowerCase().slice(0, 44);
    const b = kws[1].toLowerCase().slice(0, 44);
    return `Likely ${verb} ${a} and ${b}`;
  }

  let frag = normalizeSpace(
    i.outreachActivityPhrase || i.pain || i.cleanProblem || i.productCategory,
  );
  frag = frag
    .replace(/^[.,"'\s]+/, "")
    .replace(/\s+/g, " ")
    .replace(/[.?!]+$/, "")
    .slice(0, 80);
  if (frag.length < 12) {
    frag = normalizeSpace(`${i.productCategory} workflows`).slice(0, 80);
  }
  const tail = frag.charAt(0).toLowerCase() + frag.slice(1);
  return `Likely ${verb} ${tail}`;
}

/**
 * When Reddit returns no leads: fetch real people from Apollo, score, return top 3.
 * Names and titles come only from Apollo responses.
 */
export async function fetchRankedApolloPreviewLeads(
  i: ProblemInterpretationOk,
  openaiApiKey: string,
  apolloApiKey: string,
): Promise<{ leads: ApolloPreviewLead[]; copyDraft: string } & ApolloPreviewSearchMeta> {
  let params: SearchParamsOut;
  try {
    params = await deriveApolloSearchWithOpenAI(i, openaiApiKey);
  } catch (e) {
    console.warn("[apollo-landing-preview] derive search failed, heuristic fallback", {
      message: e instanceof Error ? e.message : String(e),
    });
    params = fallbackSearchParams(i);
  }

  const {
    people: peopleRaw,
    searchLevelUsed,
    apolloTotalFound,
    fallbackUsed,
    lastHttpStatus,
  } = await recruiterStyleApolloPeopleSearch(params, apolloApiKey);

  let people = peopleRaw;
  try {
    people = await apolloBulkMatchEnrichPeople(peopleRaw, apolloApiKey);
  } catch (e) {
    console.warn("[apollo-landing-preview] bulk_match enrich failed", {
      message: e instanceof Error ? e.message : String(e),
    });
  }

  const q_keywords = params.q_keywords;

  if (people.length === 0) {
    console.info("[apollo-landing-preview] Apollo recruiter flow: no mappable people", {
      lastHttpStatus,
      apolloTotalFound,
      searchLevelUsed,
    });
    return {
      leads: [],
      copyDraft: buildApolloReplyDraft(i),
      searchLevelUsed,
      apolloTotalFound,
      fallbackUsed,
      lastHttpStatus,
    };
  }

  const scored = people
    .map((p) => {
      const mapped = mapPersonToPreview(p);
      if (!mapped) return null;
      const hay = `${mapped.title} ${mapped.company} ${mapped.location}`.toLowerCase();
      const score = scoreApolloPersonForInterpretation(
        { title: mapped.title, company: mapped.company, haystack: hay },
        i,
        q_keywords,
      );
      return { mapped, score };
    })
    .filter((x): x is NonNullable<typeof x> => !!x)
    .sort((a, b) => b.score - a.score)
    .slice(0, TOP_N)
    .map((x) => x.mapped);

  const staticDraft = buildApolloReplyDraft(i);
  const enriched = scored.map((l, idx) => ({
    ...l,
    replyDraft: staticDraft,
    whyMatch: buildLikelyHandlesLine(i, idx),
  }));
  const copyDraft = staticDraft;

  return {
    leads: enriched,
    copyDraft,
    searchLevelUsed,
    apolloTotalFound,
    fallbackUsed,
    lastHttpStatus,
  };
}
