/**
 * Reddit search.json — no Apify, no OAuth. Keep queries small and fast.
 * @see https://www.reddit.com/dev/api#GET_search
 */

export type RedditOrganic = {
  title: string;
  snippet: string;
  link: string;
};

const REDDIT_SEARCH = "https://www.reddit.com/search.json";
const FETCH_TIMEOUT_MS = 8_000;
const PER_QUERY_LIMIT = 10;

const USER_AGENT =
  "Tractionflo/1.0 (find-leads; contact: https://www.reddit.com/wiki/api)";

/** Fixed high-intent templates — no AI query generation */
export function buildRedditTemplateQueries(product: string): string[] {
  const p = product.trim().replace(/\s+/g, " ").slice(0, 140) || "software";
  return [
    `looking for ${p}`,
    `any tool for ${p}`,
    `how do you manage ${p}`,
    `recommend ${p}`,
    `what do you use for ${p}`,
  ];
}

function listingChildren(json: unknown): unknown[] {
  if (!json || typeof json !== "object") return [];
  const data = (json as { data?: { children?: unknown[] } }).data;
  const ch = data?.children;
  return Array.isArray(ch) ? ch : [];
}

function parseSearchListing(json: unknown): RedditOrganic[] {
  const out: RedditOrganic[] = [];
  for (const child of listingChildren(json)) {
    if (!child || typeof child !== "object") continue;
    const k = (child as { kind?: string }).kind;
    if (k !== "t3") continue;
    const d = (child as { data?: Record<string, unknown> }).data;
    if (!d) continue;
    if (d.stickied === true || d.promoted === true) continue;
    const title = typeof d.title === "string" ? d.title.trim() : "";
    const permalink = typeof d.permalink === "string" ? d.permalink.trim() : "";
    if (!title || !permalink) continue;
    const link = permalink.startsWith("http")
      ? permalink
      : `https://www.reddit.com${permalink}`;
    const selftext = typeof d.selftext === "string" ? d.selftext.trim() : "";
    const snippet = (selftext || title).slice(0, 520);
    out.push({ title, snippet, link });
  }
  return out;
}

export async function redditSearchJson(query: string): Promise<RedditOrganic[]> {
  const params = new URLSearchParams({
    q: query.slice(0, 512),
    limit: String(PER_QUERY_LIMIT),
    sort: "relevance",
    t: "year",
    raw_json: "1",
  });
  const url = `${REDDIT_SEARCH}?${params.toString()}`;
  const ac = new AbortController();
  const timer = setTimeout(() => ac.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      method: "GET",
      headers: {
        "User-Agent": USER_AGENT,
        Accept: "application/json",
      },
      signal: ac.signal,
      next: { revalidate: 0 },
    });
    if (!res.ok) {
      console.warn("[find-users][reddit.json] HTTP", res.status, query.slice(0, 60));
      return [];
    }
    const json: unknown = await res.json().catch(() => null);
    if (!json) return [];
    return parseSearchListing(json);
  } catch (e) {
    console.warn(
      "[find-users][reddit.json] fetch failed",
      query.slice(0, 50),
      e instanceof Error ? e.message : e,
    );
    return [];
  } finally {
    clearTimeout(timer);
  }
}

/** Parallel template searches; failures are isolated per query */
export async function redditSearchMany(queries: string[]): Promise<RedditOrganic[]> {
  console.info(`[find-users] reddit_json start queries=${queries.length}`);
  const settled = await Promise.allSettled(queries.map((q) => redditSearchJson(q)));
  const merged: RedditOrganic[] = [];
  let fails = 0;
  for (const s of settled) {
    if (s.status === "fulfilled") merged.push(...s.value);
    else fails += 1;
  }
  console.info(
    `[find-users] reddit_json done rows=${merged.length} fail_queries=${fails}`,
  );
  return merged;
}
