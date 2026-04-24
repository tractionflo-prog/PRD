import type { CommunityLeadProvider, ProviderSearchHit } from "./types";

const REDDIT_SEARCH = "https://www.reddit.com/search.json";
const FETCH_TIMEOUT_MS = 7_000;
const USER_AGENT =
  "Tractionflo/1.0 (demand; +https://tractionflo.com; Reddit search only)";

function listingChildren(json: unknown): unknown[] {
  if (!json || typeof json !== "object") return [];
  const data = (json as { data?: { children?: unknown[] } }).data;
  return Array.isArray(data?.children) ? data.children! : [];
}

function parseHits(json: unknown, limit: number): ProviderSearchHit[] {
  const out: ProviderSearchHit[] = [];
  for (const child of listingChildren(json)) {
    if (out.length >= limit) break;
    if (!child || typeof child !== "object") continue;
    if ((child as { kind?: string }).kind !== "t3") continue;
    const d = (child as { data?: Record<string, unknown> }).data;
    if (!d) continue;
    if (d.stickied === true || d.promoted === true) continue;

    const title = typeof d.title === "string" ? d.title.trim() : "";
    const permalink = typeof d.permalink === "string" ? d.permalink.trim() : "";
    if (!title || !permalink) continue;

    const idRaw = d.id;
    const id =
      typeof idRaw === "string" && idRaw
        ? `reddit:${idRaw}`
        : `reddit:${permalink.replace(/\W/g, "").slice(0, 48)}`;

    const sub =
      typeof d.subreddit === "string"
        ? d.subreddit
        : typeof d.subreddit_name_prefixed === "string"
          ? String(d.subreddit_name_prefixed).replace(/^r\//, "")
          : "";

    const author = typeof d.author === "string" ? d.author : "[deleted]";
    const selftext = typeof d.selftext === "string" ? d.selftext.trim() : "";
    const snippet = (selftext || title).slice(0, 560);
    const url = permalink.startsWith("http")
      ? permalink
      : `https://www.reddit.com${permalink}`;

    let createdUtc: number | null = null;
    if (typeof d.created_utc === "number" && Number.isFinite(d.created_utc)) {
      createdUtc = d.created_utc;
    }

    let numComments = 0;
    if (typeof d.num_comments === "number" && Number.isFinite(d.num_comments)) {
      numComments = Math.max(0, Math.trunc(d.num_comments));
    }

    out.push({
      id,
      source: "reddit",
      title,
      subreddit: sub || "unknown",
      author,
      url,
      snippet,
      createdUtc,
      numComments,
    });
  }
  return out;
}

export const redditLeadProvider: CommunityLeadProvider = {
  id: "reddit",

  async search(query, opts) {
    const lim = Math.min(25, Math.max(1, opts.limit));
    const params = new URLSearchParams({
      q: query.slice(0, 512),
      limit: String(lim),
      sort: "new",
      t: "week",
      raw_json: "1",
    });
    const url = `${REDDIT_SEARCH}?${params.toString()}`;
    const ac = new AbortController();
    const timer = setTimeout(() => ac.abort(), FETCH_TIMEOUT_MS);
    try {
      const res = await fetch(url, {
        headers: {
          "User-Agent": USER_AGENT,
          Accept: "application/json",
        },
        signal: ac.signal,
      });
      if (!res.ok) {
        console.warn("[demand][reddit] HTTP", res.status);
        throw new Error(`reddit_http_${res.status}`);
      }
      const json: unknown = await res.json().catch(() => null);
      if (!json) throw new Error("reddit_json_empty");
      return parseHits(json, lim);
    } catch (e) {
      if (e instanceof Error && e.name === "AbortError") throw e;
      if (e instanceof Error && e.message.startsWith("reddit_")) throw e;
      console.warn(
        "[demand][reddit] fetch error",
        e instanceof Error ? e.message : e,
      );
      throw e instanceof Error ? e : new Error(String(e));
    } finally {
      clearTimeout(timer);
    }
  },
};
