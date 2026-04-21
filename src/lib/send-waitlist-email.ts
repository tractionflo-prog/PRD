/**
 * Sends a confirmation email when someone joins the waitlist (Resend).
 *
 * Env:
 * - `RESEND_API_KEY` — required (https://resend.com/api-keys)
 * - `RESEND_FROM_EMAIL` — optional; must use a **verified domain** address to mail arbitrary signups.
 *
 * **Test sender:** With `from: onboarding@resend.dev`, Resend only allows sending to **your Resend
 * account email** until you verify a domain. See: https://resend.com/docs/knowledge-base/what-email-addresses-to-use-for-testing
 */

import { getSiteUrl } from "./site";

const RESEND_API = "https://api.resend.com/emails";

export type EmailHint =
  | "missing_api_key"
  | "resend_test_recipient_only"
  | "verify_domain_required"
  | "invalid_api_key"
  | "send_failed";

export type WaitlistEmailResult =
  | { sent: true; id: string }
  | { sent: false; hint: EmailHint; detail?: string };

function classifyResendFailure(status: number, raw: string): EmailHint {
  const t = raw.toLowerCase();
  if (status === 401 || t.includes("invalid api key") || t.includes("unauthorized")) {
    return "invalid_api_key";
  }
  if (
    t.includes("only send testing emails to your own email") ||
    t.includes("only send testing emails") ||
    t.includes("testing emails to your own") ||
    (t.includes("testing") && t.includes("own email"))
  ) {
    return "resend_test_recipient_only";
  }
  if (t.includes("verify a domain")) {
    return "verify_domain_required";
  }
  return "send_failed";
}

function extractResendId(parsed: unknown): string | undefined {
  if (!parsed || typeof parsed !== "object") return undefined;
  const o = parsed as { id?: string; data?: { id?: string } };
  if (typeof o.id === "string" && o.id.length > 0) return o.id;
  if (typeof o.data?.id === "string" && o.data.id.length > 0) return o.data.id;
  return undefined;
}

export async function sendWaitlistConfirmationEmail(
  toEmail: string,
  building?: string,
): Promise<WaitlistEmailResult> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) {
    console.warn(
      "[waitlist-email] RESEND_API_KEY is not set — confirmation email skipped.",
    );
    return { sent: false, hint: "missing_api_key" };
  }

  const from =
    process.env.RESEND_FROM_EMAIL?.trim() || "onboarding@resend.dev";

  const siteUrl = getSiteUrl();
  const escapedBuilding = building?.length
    ? escapeHtml(building.slice(0, 500))
    : "";

  const buildingBlock =
    escapedBuilding.length > 0
      ? `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:28px 0 0;">
  <tr><td style="background:#F9FAFB;border:1px solid #E5E7EB;border-radius:12px;padding:18px 20px;">
    <p style="margin:0 0 8px;font-size:11px;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;color:#9CA3AF;">You shared</p>
    <p style="margin:0;font-size:15px;line-height:1.6;color:#374151;">${escapedBuilding}</p>
  </td></tr>
</table>`
      : "";

  const html = `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Tractionflo — early access</title>
</head>
<body style="margin:0;padding:0;background-color:#F4F4F5;-webkit-font-smoothing:antialiased;">
  <span style="display:none !important;visibility:hidden;mso-hide:all;font-size:1px;line-height:1px;color:#F4F4F5;max-height:0;max-width:0;opacity:0;overflow:hidden;">
    You’re confirmed for early access. Here’s what happens next — and a link back to the site.
  </span>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#F4F4F5;padding:40px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background-color:#FFFFFF;border:1px solid #E5E7EB;border-radius:16px;overflow:hidden;box-shadow:0 1px 2px rgba(0,0,0,0.04),0 24px 48px -28px rgba(15,23,42,0.12);">
          <tr>
            <td style="height:4px;background-color:#2563EB;font-size:0;line-height:0;">&nbsp;</td>
          </tr>
          <tr>
            <td style="padding:32px 36px 28px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td>
                    <p style="margin:0;font-size:13px;font-weight:600;letter-spacing:0.06em;text-transform:uppercase;color:#2563EB;">Early access</p>
                    <p style="margin:10px 0 0;font-size:26px;font-weight:700;letter-spacing:-0.03em;line-height:1.2;color:#0A0A0A;font-family:system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">You’re on the list</p>
                    <p style="margin:14px 0 0;font-size:16px;line-height:1.6;color:#6B7280;font-family:system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
                      Thanks for raising your hand for <strong style="color:#0A0A0A;font-weight:600;">Tractionflo</strong>. We’re building something we wish we’d had for shipping narrative, traction, and clarity — and you’ll be among the first to try it.
                    </p>
                  </td>
                </tr>
              </table>
              ${buildingBlock}
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:28px 0 0;">
                <tr>
                  <td style="background-color:#FAFAFA;border:1px solid #E8E8E8;border-radius:12px;padding:20px 22px;">
                    <p style="margin:0 0 14px;font-size:12px;font-weight:600;letter-spacing:0.06em;text-transform:uppercase;color:#9CA3AF;">What happens next</p>
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="font-size:15px;line-height:1.55;color:#4B5563;font-family:system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
                      <tr><td style="padding:0 0 10px 0;"><span style="color:#2563EB;font-weight:700;">1.</span>&nbsp; We’ll keep this address on the early-access list.</td></tr>
                      <tr><td style="padding:0 0 10px 0;"><span style="color:#2563EB;font-weight:700;">2.</span>&nbsp; When invites open, you’ll get a short note here — no spam cadence.</td></tr>
                      <tr><td style="padding:0;"><span style="color:#2563EB;font-weight:700;">3.</span>&nbsp; Optional: reply to that email if you have a specific workflow in mind.</td></tr>
                    </table>
                  </td>
                </tr>
              </table>
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:28px 0 0;">
                <tr>
                  <td style="border-radius:10px;background-color:#2563EB;">
                    <a href="${escapeAttr(siteUrl)}" style="display:inline-block;padding:14px 26px;font-size:15px;font-weight:600;color:#FFFFFF;text-decoration:none;border-radius:10px;font-family:system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">Back to Tractionflo</a>
                  </td>
                </tr>
              </table>
              <p style="margin:28px 0 0;font-size:13px;line-height:1.55;color:#9CA3AF;font-family:system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
                You’re receiving this because someone submitted this address on the Tractionflo early-access form. If that wasn’t you, you can ignore this message.
              </p>
            </td>
          </tr>
        </table>
        <p style="margin:20px 0 0;font-size:12px;color:#9CA3AF;font-family:system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
          <a href="${escapeAttr(siteUrl)}" style="color:#6B7280;text-decoration:underline;">${escapeHtml(siteUrl.replace(/^https?:\/\//, ""))}</a>
        </p>
      </td>
    </tr>
  </table>
</body>
</html>`;

  const text = [
    "You’re on the Tractionflo early access list",
    "",
    "Thanks for joining. We’re building tools for clearer narrative and traction — you’ll be among the first to try them.",
    "",
    building
      ? `You shared:\n${building.slice(0, 500)}\n`
      : "",
    "What happens next:",
    "1. We’ll keep this address on the early-access list.",
    "2. When invites open, we’ll email you here.",
    "3. You can reply to that note with workflow ideas if you like.",
    "",
    `Site: ${siteUrl}`,
    "",
    "If you didn’t sign up, you can ignore this message.",
  ].join("\n");

  const res = await fetch(RESEND_API, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [toEmail],
      subject: "You’re in — Tractionflo early access",
      html,
      text,
    }),
  });

  const raw = await res.text();
  let parsed: unknown;
  try {
    parsed = raw ? JSON.parse(raw) : {};
  } catch {
    parsed = {};
  }

  if (!res.ok) {
    const detail =
      typeof parsed === "object" &&
      parsed !== null &&
      "message" in parsed &&
      typeof (parsed as { message: string }).message === "string"
        ? (parsed as { message: string }).message
        : raw.slice(0, 400) || `HTTP ${res.status}`;
    const hint = classifyResendFailure(res.status, raw + detail);
    console.error("[waitlist-email] Resend rejected send:", res.status, detail);
    return { sent: false, hint, detail };
  }

  const id = extractResendId(parsed);
  if (!id) {
    console.warn("[waitlist-email] Resend 200 but no id in body:", raw);
    return { sent: true, id: "unknown" };
  }

  console.info("[waitlist-email] Sent confirmation", { id, to: toEmail });
  return { sent: true, id };
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Minimal attribute escaping for URLs in href="" */
function escapeAttr(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
}
