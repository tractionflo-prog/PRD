/**
 * Small-launch helpers: IP rate limits (in-memory), TTL cache, payload clamps, safe logs.
 * Not durable across serverless instances — sufficient for a modest public launch.
 */

export const MAX_PRODUCT_TEXT_CHARS = 1000;
export const MAX_WEBSITE_URL_CHARS = 300;
export const MAX_QUERIES_PER_REQUEST = 12;

const RATE_BUCKETS = new Map<string, { count: number; resetAt: number }>();

export function getRequestIp(request: Request): string {
  const xf = request.headers.get("x-forwarded-for");
  if (xf) {
    const first = xf.split(",")[0]?.trim();
    if (first) return first.slice(0, 64);
  }
  const xr = request.headers.get("x-real-ip")?.trim();
  if (xr) return xr.slice(0, 64);
  const cf = request.headers.get("cf-connecting-ip")?.trim();
  if (cf) return cf.slice(0, 64);
  return "unknown";
}

/** Returns true if the request is allowed (under limit). */
export function rateLimitAllow(
  routeKey: string,
  ip: string,
  max: number,
  windowMs: number,
): boolean {
  const key = `${routeKey}:${ip}`;
  const now = Date.now();
  const b = RATE_BUCKETS.get(key);
  if (!b || now >= b.resetAt) {
    RATE_BUCKETS.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (b.count < max) {
    b.count += 1;
    return true;
  }
  return false;
}

type CacheEntry<T> = { exp: number; val: T };
const CACHE_STORES: Record<string, Map<string, CacheEntry<unknown>>> = {
  genQueries: new Map(),
  fetchLeads: new Map(),
  replies: new Map(),
  starters: new Map(),
};

const MAX_ENTRIES_PER_STORE = 400;

function pruneStore(store: Map<string, CacheEntry<unknown>>) {
  if (store.size <= MAX_ENTRIES_PER_STORE) return;
  const now = Date.now();
  for (const [k, v] of store) {
    if (v.exp <= now || store.size <= MAX_ENTRIES_PER_STORE * 0.6) {
      store.delete(k);
      if (store.size <= MAX_ENTRIES_PER_STORE * 0.6) break;
    }
  }
}

export function memoryCacheGet<T>(storeId: keyof typeof CACHE_STORES, key: string): T | undefined {
  const store = CACHE_STORES[storeId];
  const e = store.get(key);
  if (!e) return undefined;
  if (Date.now() > e.exp) {
    store.delete(key);
    return undefined;
  }
  return e.val as T;
}

export function memoryCacheSet<T>(
  storeId: keyof typeof CACHE_STORES,
  key: string,
  value: T,
  ttlMs: number,
): void {
  const store = CACHE_STORES[storeId];
  store.set(key, { exp: Date.now() + ttlMs, val: value as unknown });
  pruneStore(store);
}

export function normalizeCacheKeyPart(s: string): string {
  return s.replace(/\0/g, "").replace(/\s+/g, " ").trim().toLowerCase();
}

export function sanitizeText(raw: string, max: number): string {
  return raw.replace(/\0/g, "").trim().slice(0, max);
}

export function logApiRoute(
  route: string,
  durationMs: number,
  ok: boolean,
  extra: { errorType?: string; resultCount?: number; httpStatus?: number } = {},
): void {
  const bits = [
    `[api:${route}]`,
    `${Math.round(durationMs)}ms`,
    ok ? "ok" : "fail",
  ];
  if (extra.errorType) bits.push(`errorType=${extra.errorType}`);
  if (typeof extra.resultCount === "number") bits.push(`n=${extra.resultCount}`);
  if (extra.httpStatus) bits.push(`status=${extra.httpStatus}`);
  console.info(bits.join(" "));
}
