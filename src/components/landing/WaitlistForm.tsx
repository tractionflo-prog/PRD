"use client";

import { gaEvent } from "@/lib/analytics";
import type { EmailHint } from "@/lib/send-waitlist-email";
import { useState } from "react";
import { cn } from "@/lib/cn";
import { PrimaryButton } from "./PrimaryButton";

type WaitlistFormProps = {
  source: string;
  compact?: boolean;
  submitLabel?: string;
  /** Stronger focus ring + outer glow (e.g. final CTA) */
  prominentFocus?: boolean;
  /** Extra classes for the submit button (visual only; same submit behavior) */
  submitButtonClassName?: string;
};

function waitlistMessageForHint(hint: string | undefined): string {
  const h = hint as EmailHint | undefined;
  switch (h) {
    case "missing_api_key":
      return "You're on the list. Confirmation email is not enabled yet, but your signup is saved.";
    case "resend_test_recipient_only":
      return "You're on the list. Confirmation email is limited while mail setup is in test mode.";
    case "verify_domain_required":
      return "You're on the list. Email delivery setup still needs a verified domain.";
    case "invalid_api_key":
      return "You're on the list. Email delivery is temporarily unavailable.";
    case "send_failed":
      return "You're on the list. Email delivery had an issue, but your signup is saved.";
    default:
      return "You're on the list. We couldn't send a confirmation right now, but your signup is saved.";
  }
}

const fieldBase =
  "h-12 w-full rounded-xl border border-slate-200/80 bg-white px-4 text-[15px] text-slate-900 placeholder:text-slate-400 shadow-[0_1px_2px_rgba(15,23,42,0.04)] outline-none transition-[border-color,box-shadow] focus:border-indigo-400 focus:shadow-[0_0_0_3px_rgba(99,102,241,0.15)]";

const fieldProminent =
  "focus:border-indigo-500 focus:shadow-[0_0_0_3px_rgba(124,92,255,0.22),0_0_28px_-6px_rgba(124,92,255,0.2)]";

const areaBase =
  "w-full resize-none rounded-xl border border-slate-200/80 bg-white px-4 py-3 text-[15px] text-slate-900 placeholder:text-slate-400 shadow-[0_1px_2px_rgba(15,23,42,0.04)] outline-none transition-[border-color,box-shadow] focus:border-indigo-400 focus:shadow-[0_0_0_3px_rgba(99,102,241,0.15)]";

const areaProminent =
  "focus:border-indigo-500 focus:shadow-[0_0_0_3px_rgba(124,92,255,0.22),0_0_28px_-6px_rgba(124,92,255,0.2)]";

export function WaitlistForm({
  source,
  compact = false,
  submitLabel = "Join early access",
  prominentFocus = false,
  submitButtonClassName,
}: WaitlistFormProps) {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    const email = String(fd.get("email") ?? "").trim();
    const building = String(fd.get("building") ?? "").trim();
    const honeypot = String(fd.get("website") ?? "").trim();

    if (!email) {
      setStatus("error");
      setMessage("Add your email so we can send your invite.");
      return;
    }

    if (honeypot) {
      setStatus("success");
      setMessage("You're on the list. We'll be in touch.");
      return;
    }

    setStatus("loading");
    setMessage("");

    try {
      const res = await fetch("/api/early-access", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, building: building || undefined }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        error?: string;
        confirmationEmailSent?: boolean;
        confirmationEmailHint?: string;
      };

      if (!res.ok) {
        setStatus("error");
        setMessage(data.error ?? "Something went wrong. Try again.");
        return;
      }

      setStatus("success");
      setMessage(
        data.confirmationEmailSent
          ? "You're on the list. Check your inbox for confirmation."
          : waitlistMessageForHint(data.confirmationEmailHint),
      );
      gaEvent("waitlist_signup", { method: source });
      form.reset();
    } catch {
      setStatus("error");
      setMessage("Network error. Check your connection and try again.");
    }
  }

  return (
    <div>
      {status === "success" ? (
        <p
          className="rounded-xl border border-emerald-200/80 bg-emerald-50 px-4 py-3 text-[14px] font-medium text-emerald-900"
          role="status"
          aria-live="polite"
        >
          {message}
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-3">
          <label htmlFor={`waitlist-email-${source}`} className="sr-only">
            Email address
          </label>
          <div className={compact ? "flex flex-col gap-2 sm:flex-row" : "space-y-3"}>
            <input
              id={`waitlist-email-${source}`}
              name="email"
              type="email"
              autoComplete="email"
              required
              placeholder="you@company.com"
              className={`${fieldBase} ${prominentFocus ? fieldProminent : ""}`}
            />
            <PrimaryButton
              type="submit"
              disabled={status === "loading"}
              className={cn(compact ? "h-12 shrink-0 px-5 sm:w-auto" : "h-12 w-full", submitButtonClassName)}
            >
              {status === "loading" ? "Joining..." : submitLabel}
            </PrimaryButton>
          </div>
          {!compact ? (
            <textarea
              id={`waitlist-building-${source}`}
              name="building"
              rows={3}
              placeholder="Optional: what are you building?"
              className={`${areaBase} ${prominentFocus ? areaProminent : ""}`}
            />
          ) : null}
          <input
            type="text"
            name="website"
            tabIndex={-1}
            autoComplete="off"
            aria-hidden="true"
            className="pointer-events-none absolute left-[-9999px] h-px w-px opacity-0"
          />
          {status === "error" && message ? (
            <p className="text-[14px] font-medium text-red-600" role="alert">
              {message}
            </p>
          ) : null}
        </form>
      )}
    </div>
  );
}
