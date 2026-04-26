import { createHmac, timingSafeEqual } from "node:crypto";
import { MAX_DEMO_INPUT_LENGTH } from "@/lib/demand/landing-demo-constants";

export { MAX_DEMO_INPUT_LENGTH };

/** Max successful demo searches per client IP per UTC calendar day. */
export const DEMO_IP_DAILY_LIMIT = 5;

/** Max demo searches per browser (signed cookie) before waitlist. */
export const DEMO_SESSION_LIMIT = 3;

/** Minimum milliseconds between demo searches for the same browser. */
export const DEMO_COOLDOWN_MS = 10_000;

const COOKIE_NAME = "tf_lpdemo";

export type CookiePayload = {
  v: 1;
  /** Successful demo searches in this browser session. */
  sc: number;
  /** Last successful search completion time (ms). */
  last: number;
};

const ipDayCounts = new Map<string, { day: string; count: number }>();

let globalOpenAiDay = "";
let globalOpenAiCount = 0;

function utcDay(): string {
  return new Date().toISOString().slice(0, 10);
}

export function getClientIp(request: Request): string {
  const xff = request.headers.get("x-forwarded-for");
  if (xff) {
    const first = xff.split(",")[0]?.trim();
    if (first) return first.slice(0, 128);
  }
  const realIp = request.headers.get("x-real-ip")?.trim();
  if (realIp) return realIp.slice(0, 128);
  return "unknown";
}

function demoSecret(): string {
  return (
    process.env.LANDING_PREVIEW_DEMO_SECRET?.trim() ||
    process.env.LANDING_RATE_SECRET?.trim() ||
    "dev-only-landing-demo-secret-change-in-production"
  );
}

function signPayload(payload: CookiePayload): string {
  const body = Buffer.from(JSON.stringify(payload), "utf8").toString("base64url");
  const sig = createHmac("sha256", demoSecret()).update(body).digest("base64url");
  return `${body}.${sig}`;
}

function verifyCookie(raw: string | undefined): CookiePayload | null {
  if (!raw || typeof raw !== "string") return null;
  const i = raw.lastIndexOf(".");
  if (i <= 0) return null;
  const body = raw.slice(0, i);
  const sig = raw.slice(i + 1);
  const expected = createHmac("sha256", demoSecret()).update(body).digest("base64url");
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  try {
    const parsed = JSON.parse(Buffer.from(body, "base64url").toString("utf8")) as CookiePayload;
    if (parsed?.v !== 1 || typeof parsed.sc !== "number" || typeof parsed.last !== "number") {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function readDemoCookie(request: Request): CookiePayload {
  const raw = request.headers.get("cookie")?.split(";").find((c) => c.trim().startsWith(`${COOKIE_NAME}=`));
  const value = raw?.split("=")[1]?.trim();
  return verifyCookie(value) ?? { v: 1, sc: 0, last: 0 };
}

export function buildDemoCookieHeader(payload: CookiePayload): string {
  const signed = signPayload(payload);
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  return `${COOKIE_NAME}=${signed}; Path=/; HttpOnly; SameSite=Lax; Max-Age=604800${secure}`;
}

export { COOKIE_NAME };

export function getIpDayCount(ip: string): number {
  const day = utcDay();
  const row = ipDayCounts.get(ip);
  if (!row || row.day !== day) return 0;
  return row.count;
}

export function incrementIpDayCount(ip: string): void {
  const day = utcDay();
  let row = ipDayCounts.get(ip);
  if (!row || row.day !== day) {
    row = { day, count: 0 };
    ipDayCounts.set(ip, row);
  }
  row.count += 1;
}

/** Max OpenAI-backed interpreter + reply units per UTC day (global). */
export function getOpenAiDailyCap(): number {
  const raw = process.env.LANDING_PREVIEW_OPENAI_DAILY_CAP?.trim();
  const n = raw ? parseInt(raw, 10) : 2000;
  return Number.isFinite(n) && n > 0 ? n : 2000;
}

/** Reserve `units` toward the global daily OpenAI budget. Returns false if cap already reached. */
export function tryConsumeOpenAiGlobal(units: number): boolean {
  const day = utcDay();
  if (globalOpenAiDay !== day) {
    globalOpenAiDay = day;
    globalOpenAiCount = 0;
  }
  const cap = getOpenAiDailyCap();
  if (globalOpenAiCount + units > cap) return false;
  globalOpenAiCount += units;
  return true;
}
