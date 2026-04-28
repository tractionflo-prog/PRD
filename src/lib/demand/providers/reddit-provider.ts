import type { CommunityLeadProvider, ProviderSearchHit } from "./types";

const REDDIT_SEARCH = "https://www.reddit.com/search.json";
const REDDIT_SEARCH_RSS = "https://www.reddit.com/search.rss";
const FETCH_TIMEOUT_MS = process.env.NODE_ENV === "production" ? 4_000 : 7_000;
const USER_AGENT =
  "Tractionflo/1.0 (demand; +https://tractionflo.com; Reddit search only)";
const FALLBACK_SUBREDDITS = [
  "SaaS",
  "smallbusiness",
  "Entrepreneur",
  "startups",
  "marketing",
  "sales",
] as const;
const BASELINE_TERMS = [
  "crm",
  "lead",
  "client",
  "workflow",
  "automation",
  "follow up",
  "spreadsheet",
  "process",
  "tool",
];

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

function decodeXmlEntities(text: string): string {
  return text
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

function stripTags(text: string): string {
  return decodeXmlEntities(text.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim());
}

function parseRssTag(block: string, tag: string): string {
  const re = new RegExp(`<${tag}>([\\s\\S]*?)<\\/${tag}>`, "i");
  const match = block.match(re);
  return match?.[1]?.trim() ?? "";
}

function parseRssHits(xml: string, limit: number): ProviderSearchHit[] {
  const out: ProviderSearchHit[] = [];
  const itemBlocks = xml.match(/<item>[\s\S]*?<\/item>/gi) ?? [];
  for (const block of itemBlocks) {
    if (out.length >= limit) break;
    const rawTitle = parseRssTag(block, "title");
    const rawLink = parseRssTag(block, "link");
    if (!rawTitle || !rawLink) continue;
    const title = stripTags(rawTitle);
    const url = stripTags(rawLink);
    const guid = stripTags(parseRssTag(block, "guid")) || url;
    const id = `reddit:rss:${guid.replace(/\W/g, "").slice(0, 64)}`;
    const category = stripTags(parseRssTag(block, "category"));
    const authorRaw = stripTags(parseRssTag(block, "author"));
    const author = authorRaw || "[deleted]";
    const description = stripTags(parseRssTag(block, "description"));
    const snippet = (description || title).slice(0, 560);
    let createdUtc: number | null = null;
    const pubDate = stripTags(parseRssTag(block, "pubDate"));
    if (pubDate) {
      const ts = Date.parse(pubDate);
      if (Number.isFinite(ts)) createdUtc = Math.floor(ts / 1000);
    }
    out.push({
      id,
      source: "reddit",
      title,
      subreddit: category.replace(/^r\//i, "") || "unknown",
      author,
      url,
      snippet,
      createdUtc,
      numComments: 0,
    });
  }
  return out;
}

function queryTerms(query: string): string[] {
  const stop = new Set(["how", "do", "you", "use", "for", "anyone", "with", "the", "and", "what"]);
  return query
    .toLowerCase()
    .split(/\s+/)
    .map((x) => x.trim())
    .filter((x) => x.length > 2 && !stop.has(x));
}

function relevanceScore(hit: ProviderSearchHit, query: string): number {
  const hay = `${hit.title}\n${hit.snippet}`.toLowerCase();
  const qTerms = queryTerms(query);
  let score = 0;
  for (const t of qTerms) {
    if (hay.includes(t)) score += 2;
  }
  for (const t of BASELINE_TERMS) {
    if (hay.includes(t)) score += 1;
  }
  if (/\b(help|recommend|suggest|alternative|how do you|what tool)\b/i.test(hay)) score += 2;
  return score;
}

async function subredditRssFallback(
  query: string,
  limit: number,
  signal: AbortSignal,
): Promise<ProviderSearchHit[]> {
  const urls = FALLBACK_SUBREDDITS.map(
    (sub) => `https://www.reddit.com/r/${sub}/new.rss?limit=${Math.max(12, Math.min(40, limit))}`,
  );
  const settled = await Promise.allSettled(
    urls.map((url) =>
      fetch(url, {
        headers: {
          "User-Agent": USER_AGENT,
          Accept: "application/rss+xml, application/xml, text/xml",
        },
        cache: "no-store",
        signal,
      }),
    ),
  );
  const merged: ProviderSearchHit[] = [];
  for (const res of settled) {
    if (res.status !== "fulfilled") continue;
    if (!res.value.ok) continue;
    const xml = await res.value.text().catch(() => "");
    if (!xml) continue;
    merged.push(...parseRssHits(xml, limit));
  }
  const uniq = new Map<string, ProviderSearchHit>();
  for (const hit of merged) {
    if (!uniq.has(hit.url)) uniq.set(hit.url, hit);
  }
  return Array.from(uniq.values())
    .map((hit) => ({ hit, rank: relevanceScore(hit, query) }))
    .filter((x) => x.rank > 0)
    .sort((a, b) => {
      if (b.rank !== a.rank) return b.rank - a.rank;
      return (b.hit.createdUtc ?? 0) - (a.hit.createdUtc ?? 0);
    })
    .slice(0, limit)
    .map((x) => x.hit);
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
    const rssParams = new URLSearchParams({
      q: query.slice(0, 512),
      sort: "new",
      t: "week",
    });
    const rssUrl = `${REDDIT_SEARCH_RSS}?${rssParams.toString()}`;
    const ac = new AbortController();
    const timer = setTimeout(() => ac.abort(), FETCH_TIMEOUT_MS);
    try {
      console.info("[demand][reddit] search start", {
        endpoint: REDDIT_SEARCH,
        query: query.slice(0, 80),
        limit: lim,
      });
      const res = await fetch(url, {
        headers: {
          "User-Agent": USER_AGENT,
          Accept: "application/json",
        },
        cache: "no-store",
        signal: ac.signal,
      });
      if (!res.ok) {
        const errText = await res.text().catch(() => "");
        console.warn("[demand][reddit] HTTP", {
          status: res.status,
          statusText: res.statusText,
          body: errText.slice(0, 220),
        });
        if (res.status === 403) {
          console.info("[demand][reddit] attempting RSS fallback", {
            query: query.slice(0, 80),
          });
          const rssRes = await fetch(rssUrl, {
            headers: {
              "User-Agent": USER_AGENT,
              Accept: "application/rss+xml, application/xml, text/xml",
            },
            cache: "no-store",
            signal: ac.signal,
          });
          if (!rssRes.ok) {
            const rssErrText = await rssRes.text().catch(() => "");
            console.warn("[demand][reddit] RSS HTTP", {
              status: rssRes.status,
              statusText: rssRes.statusText,
              body: rssErrText.slice(0, 220),
            });
            throw new Error(`reddit_rss_http_${rssRes.status}`);
          }
          const rssText = await rssRes.text().catch(() => "");
          if (!rssText) throw new Error("reddit_rss_empty");
          const rssParsed = parseRssHits(rssText, lim);
          if (rssParsed.length === 0) {
            const subParsed = await subredditRssFallback(query, lim, ac.signal);
            console.info("[demand][reddit] subreddit RSS fallback end", {
              query: query.slice(0, 80),
              count: subParsed.length,
            });
            return subParsed;
          }
          console.info("[demand][reddit] RSS fallback end", {
            query: query.slice(0, 80),
            count: rssParsed.length,
          });
          return rssParsed;
        }
        throw new Error(`reddit_http_${res.status}`);
      }
      const json: unknown = await res.json().catch(() => null);
      if (!json) throw new Error("reddit_json_empty");
      const parsed = parseHits(json, lim);
      console.info("[demand][reddit] search end", {
        query: query.slice(0, 80),
        count: parsed.length,
      });
      return parsed;
    } catch (e) {
      if (e instanceof Error && e.name === "AbortError") {
        console.warn("[demand][reddit] timeout", { query: query.slice(0, 80) });
        throw e;
      }
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
