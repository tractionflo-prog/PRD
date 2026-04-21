/**
 * Sends a confirmation email when someone joins the waitlist (Resend).
 *
 * Env:
 * - `RESEND_API_KEY` — required to send (https://resend.com/api-keys)
 * - `RESEND_FROM_EMAIL` — optional, e.g. `Tractionflo <hello@yourdomain.com>`
 *   (must be a verified sender/domain in Resend). Defaults to Resend’s test sender.
 *
 * If `RESEND_API_KEY` is missing, the function no-ops (signup still succeeds).
 */

const RESEND_API = "https://api.resend.com/emails";

export async function sendWaitlistConfirmationEmail(
  toEmail: string,
  building?: string,
): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) {
    if (process.env.NODE_ENV === "development") {
      console.warn("[waitlist-email] RESEND_API_KEY not set; skipping confirmation email.");
    }
    return;
  }

  const from =
    process.env.RESEND_FROM_EMAIL?.trim() ??
    "Tractionflo <onboarding@resend.dev>";

  const safeBuilding =
    building && building.length > 0
      ? `<p style="margin:16px 0 0;color:#4B5563;font-size:15px;line-height:1.5;">You mentioned: ${escapeHtml(building.slice(0, 500))}</p>`
      : "";

  const html = `<!DOCTYPE html>
<html><body style="font-family:system-ui,-apple-system,sans-serif;background:#fafafa;padding:24px;">
  <table width="100%" cellpadding="0" cellspacing="0" role="presentation"><tr><td align="center">
    <table width="100%" style="max-width:480px;background:#fff;border:1px solid #ececec;border-radius:12px;padding:28px 24px;text-align:left;">
      <tr><td>
        <p style="margin:0;font-size:15px;color:#0A0A0A;">You’re on the list.</p>
        <p style="margin:12px 0 0;font-size:15px;color:#6B7280;line-height:1.55;">Thanks for joining early access for <strong style="color:#0A0A0A;">tractionflo</strong>. We’ll email you when invites go out.</p>
        ${safeBuilding}
        <p style="margin:24px 0 0;font-size:13px;color:#9CA3AF;">If you didn’t sign up, you can ignore this message.</p>
      </td></tr>
    </table>
  </td></tr></table>
</body></html>`;

  const text = [
    "You’re on the list.",
    "",
    "Thanks for joining early access for tractionflo. We’ll email you when invites go out.",
    building ? `\nYou mentioned: ${building.slice(0, 500)}` : "",
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
      subject: "You’re on the tractionflo waitlist",
      html,
      text,
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    console.error("[waitlist-email] Resend error:", res.status, body);
  }
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
