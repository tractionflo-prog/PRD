import { defaultWhyForOrganic, orderOrganicsByIntent } from "./find-users-intent-filter";
import { getFallbackLeads } from "./find-users-fallback";
import { passesRedditPrefilter } from "./find-users-reddit-prefilter";
import {
  buildRedditTemplateQueries,
  redditSearchMany,
  type RedditOrganic,
} from "./find-users-reddit-json";
import type { FindLead, FindUsersResponse } from "./find-users-types";

type Organic = RedditOrganic;

function normalizeUrl(url: string): string {
  try {
    const u = new URL(url);
    u.hash = "";
    if (u.pathname.length > 1 && u.pathname.endsWith("/")) {
      u.pathname = u.pathname.slice(0, -1);
    }
    return u.toString();
  } catch {
    return url;
  }
}

function hostOf(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "").toLowerCase();
  } catch {
    return "";
  }
}

function isRedditPostUrl(url: string): boolean {
  const h = hostOf(url);
  return h === "reddit.com" || h.endsWith(".reddit.com");
}

function dedupeOrganics(rows: Organic[]): Organic[] {
  const seen = new Set<string>();
  const out: Organic[] = [];
  for (const o of rows) {
    if (!isRedditPostUrl(o.link)) continue;
    const k = normalizeUrl(o.link);
    if (seen.has(k)) continue;
    seen.add(k);
    out.push(o);
  }
  return out;
}

async function openaiJson<T>(
  apiKey: string,
  system: string,
  user: string,
  temperature = 0.25,
): Promise<T | null> {
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      temperature,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
    }),
  });
  if (!res.ok) {
    const t = await res.text().catch(() => "");
    console.error("[find-users] OpenAI HTTP", res.status, t.slice(0, 400));
    return null;
  }
  const data = (await res.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const content = data.choices?.[0]?.message?.content;
  if (!content) return null;
  try {
    return JSON.parse(content) as T;
  } catch {
    return null;
  }
}

type PickRow = { i: number; why: string; reply: string };

/**
 * Single OpenAI call: pick 1–3 best Reddit leads and write why + reply.
 * Do not pad with weak leads; empty picks is allowed (caller uses basic/fallback).
 */
async function pickOneToThreeLeads(
  product: string,
  candidates: Organic[],
  apiKey: string,
): Promise<FindLead[]> {
  const compact = candidates.map((c, i) => ({
    i,
    url: c.link,
    title: c.title.slice(0, 200),
    snippet: (c.snippet || "").slice(0, 280),
  }));
  const system = `You are helping a founder reply to Reddit threads. Output JSON only.

You will receive Reddit posts (index i, url, title, snippet). All are already filtered for tool-seeking intent.

Tasks:
1. Pick the best 1 to 3 posts to engage with. If only one or two are genuinely strong, return only those — do NOT pad with weaker posts to reach three.
2. If nothing is worth engaging, return an empty picks array.
3. Each pick must reference a valid index i from the candidates list.

Return JSON: { "picks": [ { "i": number, "why": string, "reply": string } ] }
- At most 3 picks; may be 0, 1, or 2.

For "why" (label in product: "Why this is a good lead"):
- One or two short sentences, specific to their ask or pain
- No vague filler ("strong signal", "aligned with your wedge")

For "reply":
- Short, natural, helpful, founder-to-founder; no hard sell; no fake metrics`;

  const user = `Product the founder built:\n${product.slice(0, 2000)}\n\nCandidates (JSON):\n${JSON.stringify(compact)}`;
  const parsed = await openaiJson<{ picks?: unknown }>(apiKey, system, user, 0.2);
  const picks = Array.isArray(parsed?.picks) ? parsed.picks : [];
  const rows: PickRow[] = [];
  for (const p of picks) {
    if (!p || typeof p !== "object") continue;
    const o = p as Record<string, unknown>;
    const rawI = o.i;
    const i =
      typeof rawI === "number" && Number.isFinite(rawI)
        ? Math.trunc(rawI)
        : parseInt(String(rawI ?? ""), 10);
    const why = typeof o.why === "string" ? o.why.trim() : "";
    const reply = typeof o.reply === "string" ? o.reply.trim() : "";
    if (!Number.isInteger(i) || i < 0 || i >= candidates.length) continue;
    if (!why || !reply) continue;
    rows.push({ i, why, reply });
  }
  const used = new Set<number>();
  const leads: FindLead[] = [];
  for (const row of rows) {
    if (leads.length >= 3) break;
    if (used.has(row.i)) continue;
    used.add(row.i);
    const c = candidates[row.i];
    leads.push({
      source: "Reddit",
      title: c.title,
      snippet: c.snippet || "—",
      url: c.link,
      why: row.why,
      reply: row.reply,
    });
  }
  return leads;
}

function basicLeadsFromPool(
  pool: Organic[],
  product: string,
  max: number,
): FindLead[] {
  const n = Math.max(1, Math.min(max, pool.length));
  return pool.slice(0, n).map((c) => ({
    source: "Reddit" as const,
    title: c.title,
    snippet: c.snippet || "—",
    url: c.link,
    why: defaultWhyForOrganic(c),
    reply: `Hey — saw your post and it sounded like you’re trying to solve something concrete. I’ve been building around ${product.slice(0, 80)} — happy to share a short note if it helps.`,
  }));
}

export async function findLeadsForProduct(
  product: string,
): Promise<FindUsersResponse> {
  const openai = process.env.OPENAI_API_KEY?.trim();
  if (!openai) {
    console.info("[find-users] OPENAI_API_KEY missing — fallback leads");
    return getFallbackLeads(product);
  }

  try {
    const queries = buildRedditTemplateQueries(product);
    const raw = await redditSearchMany(queries);
    const deduped = dedupeOrganics(raw);
    const filtered = deduped.filter(passesRedditPrefilter);
    console.info(
      `[find-users] prefilter rows_in=${deduped.length} rows_after=${filtered.length}`,
    );

    if (filtered.length === 0) {
      console.warn("[find-users] no Reddit rows after prefilter — fallback");
      return getFallbackLeads(product);
    }

    const pool = orderOrganicsByIntent(filtered).slice(0, 20);
    const enriched = await pickOneToThreeLeads(product, pool, openai);

    if (enriched.length >= 1) {
      console.info(
        `[find-users] pool_mix reddit=${pool.length} picks=${enriched.length} source=reddit_json`,
      );
      return { leads: enriched };
    }

    if (pool.length >= 1) {
      const basic = basicLeadsFromPool(pool, product, Math.min(2, pool.length));
      console.info(
        `[find-users] openai_no_picks using_basic leads=${basic.length}`,
      );
      return { leads: basic };
    }

    return getFallbackLeads(product);
  } catch (e) {
    console.error("[find-users] pipeline", e);
    return getFallbackLeads(product);
  }
}
