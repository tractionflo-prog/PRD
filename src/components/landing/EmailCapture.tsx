"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useState } from "react";
import { gaEvent } from "@/lib/analytics";
import type { EmailHint } from "@/lib/send-waitlist-email";
import { PrimaryButton } from "./PrimaryButton";
import { Section } from "./Section";

function waitlistMessageForHint(hint: string | undefined): string {
  const h = hint as EmailHint | undefined;
  switch (h) {
    case "missing_api_key":
      return "You’re on the list. Confirmation email isn’t turned on yet (add RESEND_API_KEY where the app runs, e.g. Vercel env). Your signup is saved.";
    case "resend_test_recipient_only":
      return "You’re on the list. With Resend’s test sender (onboarding@resend.dev), confirmations only go to the email on your Resend account — sign up with that address, or verify a domain in Resend and set RESEND_FROM_EMAIL. Your signup is saved.";
    case "verify_domain_required":
      return "You’re on the list. Resend needs a verified sending domain before it can email arbitrary addresses. Add a domain at resend.com/domains, then set RESEND_FROM_EMAIL. Your signup is saved.";
    case "invalid_api_key":
      return "You’re on the list. Resend rejected the API key — create a new key in the Resend dashboard and update RESEND_API_KEY. Your signup is saved.";
    case "send_failed":
      return "You’re on the list. The mail service hit an error while sending — check the server logs and your Resend dashboard. Your signup is saved; try again after fixing Resend (often: verify a domain and set RESEND_FROM_EMAIL, or use your Resend login email while testing).";
    default:
      return "You’re on the list. We couldn’t send a confirmation email right now. Your signup is saved — check spam or try again after email is fixed.";
  }
}

export function EmailCapture() {
  const reduceMotion = useReducedMotion();
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
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
      setMessage("Add your email so we can reach you.");
      return;
    }

    if (honeypot) {
      setStatus("success");
      setMessage("You’re on the list. We’ll be in touch.");
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
      if (data.confirmationEmailSent) {
        setMessage(
          "You’re on the list. We sent a confirmation to your inbox — check spam if you don’t see it.",
        );
      } else {
        setMessage(waitlistMessageForHint(data.confirmationEmailHint));
      }
      gaEvent("waitlist_signup", { method: "early_access_form" });
      form.reset();
    } catch {
      setStatus("error");
      setMessage("Network error. Check your connection and try again.");
    }
  }

  return (
    <Section
      id="join"
      className="relative scroll-mt-24 overflow-hidden border-t border-slate-200/60 bg-[#f4f6fb] py-24 sm:scroll-mt-20 sm:py-28 md:py-32"
    >
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_0%,rgba(99,102,241,0.14),transparent_55%),radial-gradient(circle_at_100%_100%,rgba(168,85,247,0.08),transparent_42%)]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -left-24 bottom-0 h-72 w-72 rounded-full bg-indigo-300/20 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -right-16 top-12 h-64 w-64 rounded-full bg-violet-300/15 blur-3xl"
        aria-hidden
      />

      <div className="relative mx-auto max-w-xl px-1 sm:px-0">
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-12%" }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="text-center"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-600/90">Early access</p>
          <h2 className="mt-4 text-balance text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
            Start your first real conversation
          </h2>
          <p className="mx-auto mt-4 max-w-md text-[15px] leading-relaxed text-slate-600 sm:text-base">
            Join the waitlist — early invites only, no spam.
          </p>
        </motion.div>

        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 22 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-8%" }}
          transition={{ duration: 0.58, delay: reduceMotion ? 0 : 0.08, ease: [0.22, 1, 0.36, 1] }}
          className="relative mt-10"
        >
          <div
            className="pointer-events-none absolute -inset-3 rounded-[1.75rem] bg-gradient-to-br from-white/80 via-indigo-100/30 to-violet-100/25 opacity-90 blur-xl"
            aria-hidden
          />
          <div className="relative overflow-hidden rounded-2xl bg-white/85 p-6 shadow-[0_24px_60px_-32px_rgba(15,23,42,0.18),0_0_0_1px_rgba(255,255,255,0.9)_inset] ring-1 ring-slate-200/60 backdrop-blur-xl sm:p-8">
            {status === "success" ? (
              <p
                className="rounded-xl border border-emerald-200/80 bg-emerald-50/90 px-4 py-3.5 text-[15px] font-medium leading-relaxed text-emerald-900"
                role="status"
                aria-live="polite"
              >
                {message}
              </p>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label htmlFor="email" className="block text-sm font-semibold text-slate-800">
                    Email address
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    placeholder="you@company.com"
                    className="mt-2 h-12 w-full rounded-xl border border-slate-200/80 bg-white/90 px-4 text-[15px] text-slate-900 placeholder:text-slate-400 shadow-[0_1px_2px_rgba(15,23,42,0.04)] outline-none ring-0 transition-[border-color,box-shadow] focus:border-indigo-400 focus:shadow-[0_0_0_3px_rgba(99,102,241,0.15)]"
                  />
                </div>
                <div>
                  <label htmlFor="building" className="block text-sm font-semibold text-slate-800">
                    Optional: What are you building?
                  </label>
                  <textarea
                    id="building"
                    name="building"
                    rows={3}
                    placeholder="A sentence is enough."
                    className="mt-2 w-full resize-none rounded-xl border border-slate-200/80 bg-white/90 px-4 py-3 text-[15px] text-slate-900 placeholder:text-slate-400 shadow-[0_1px_2px_rgba(15,23,42,0.04)] outline-none transition-[border-color,box-shadow] focus:border-indigo-400 focus:shadow-[0_0_0_3px_rgba(99,102,241,0.15)]"
                  />
                </div>

                <input
                  type="text"
                  name="website"
                  tabIndex={-1}
                  autoComplete="off"
                  aria-hidden="true"
                  className="pointer-events-none absolute left-[-9999px] h-px w-px opacity-0"
                />

                {status === "error" && message && (
                  <p className="text-[15px] font-medium text-red-600" role="alert">
                    {message}
                  </p>
                )}

                <PrimaryButton
                  type="submit"
                  className="h-12 w-full text-[15px] shadow-[0_12px_28px_-12px_rgba(99,91,255,0.45)]"
                  disabled={status === "loading"}
                >
                  {status === "loading" ? "Joining..." : "Join early access"}
                </PrimaryButton>
              </form>
            )}
          </div>
        </motion.div>
      </div>
    </Section>
  );
}
