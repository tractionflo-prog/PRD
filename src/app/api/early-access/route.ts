import { getRequestIp, logApiRoute, rateLimitAllow } from "@/lib/server/api-launch-guard";
import { sendWaitlistConfirmationEmail } from "@/lib/send-waitlist-email";
import { persistSubmission } from "@/lib/submissions";
import { NextResponse } from "next/server";

const EMAIL =
  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

const WINDOW_MS = 10 * 60 * 1000;
const MAX_REQ_PER_WINDOW = 3;

export async function POST(request: Request) {
  const t0 = Date.now();
  const route = "early-access";
  const ip = getRequestIp(request);

  if (!rateLimitAllow(route, ip, MAX_REQ_PER_WINDOW, WINDOW_MS)) {
    logApiRoute(route, Date.now() - t0, false, {
      errorType: "rate_limited",
      httpStatus: 429,
    });
    return NextResponse.json(
      { ok: false, error: "Too many requests. Please try again later." },
      { status: 429 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid payload." }, { status: 400 });
  }

  const { email, building, website } = body as {
    email?: unknown;
    building?: unknown;
    /** Honeypot — must be empty (bots often fill hidden fields). */
    website?: unknown;
  };

  if (
    website !== undefined &&
    website !== null &&
    typeof website === "string" &&
    website.trim() !== ""
  ) {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  if (typeof email !== "string" || !EMAIL.test(email.trim())) {
    return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
  }

  if (
    building !== undefined &&
    building !== null &&
    typeof building !== "string"
  ) {
    return NextResponse.json({ error: "Invalid optional field." }, { status: 400 });
  }

  const trimmed = email.trim();
  const note =
    typeof building === "string" ? building.trim().slice(0, 2000) : "";

  try {
    await persistSubmission({
      type: "early_access",
      email: trimmed,
      building: note || undefined,
    });
  } catch (err) {
    console.error("[early-access]", err);
    const msg =
      err instanceof Error ? err.message : "Could not save your signup.";
    logApiRoute(route, Date.now() - t0, false, {
      errorType: "temporary_failure",
      httpStatus: 503,
    });
    return NextResponse.json({ error: msg }, { status: 503 });
  }

  let confirmationEmailSent = false;
  let confirmationEmailHint: string | undefined;

  try {
    const emailResult = await sendWaitlistConfirmationEmail(
      trimmed,
      note || undefined,
    );
    confirmationEmailSent = emailResult.sent;
    if (!emailResult.sent) {
      confirmationEmailHint = emailResult.hint;
    }
  } catch (err) {
    console.error("[early-access] confirmation email", err);
    confirmationEmailHint = "send_failed";
  }

  logApiRoute(route, Date.now() - t0, true, {
    resultCount: confirmationEmailSent ? 1 : 0,
  });

  return NextResponse.json({
    ok: true,
    confirmationEmailSent,
    ...(confirmationEmailHint ? { confirmationEmailHint } : {}),
  });
}
