"use client";

import { cn } from "@/lib/cn";
import { formatDemandSignalLabel, signalBandForIntentScore } from "@/lib/demand/intent-score";
import type { ApolloPreviewLead, DemandLead } from "@/lib/demand/types";
import type { PersonalizedFallbackCard } from "@/lib/demand/problem-interpreter";
import { gaEvent } from "@/lib/analytics";
import type { EmailHint } from "@/lib/send-waitlist-email";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import type { FormEvent, ReactNode } from "react";
import { useCallback, useEffect, useRef, useState } from "react";

/** Calm, human-first easing — matches `FadeUp` */
const easePremium = [0.22, 1, 0.36, 1] as const;

const pressable =
  "motion-safe:transition-[transform,filter,box-shadow] motion-safe:duration-200 motion-safe:ease-out " +
  "motion-safe:hover:scale-[1.02] motion-safe:hover:brightness-[1.04] " +
  "motion-safe:active:scale-[0.98] motion-safe:active:brightness-[0.99]";

const pressableDisabled =
  "disabled:pointer-events-none disabled:opacity-45 disabled:motion-safe:hover:scale-100 " +
  "disabled:motion-safe:hover:brightness-100 disabled:motion-safe:active:scale-100";

/** Hero input command box — textarea and submit live together. */
const heroInputCard =
  "flex items-center gap-3 rounded-2xl border border-slate-200/90 bg-white px-4 py-3 " +
  "shadow-[0_1px_2px_rgba(15,23,42,0.04),0_10px_28px_-12px_rgba(15,23,42,0.1)] transition-[border-color,box-shadow] duration-200 " +
  "focus-within:border-indigo-400 focus-within:shadow-[0_0_0_1px_rgba(129,140,248,0.45),0_8px_28px_-8px_rgba(99,102,241,0.18),0_12px_36px_-18px_rgba(15,23,42,0.1)]";

/** Set to `true` locally to log landing-preview responses (off in production). */
const DEBUG_LANDING_PREVIEW = false;

function linkedInPeopleSearchUrl(keywords: string): string {
  const params = new URLSearchParams({
    keywords: keywords.trim().slice(0, 200),
  });
  return `https://www.linkedin.com/search/results/people/?${params.toString()}`;
}

function normalizeLinkedInOpenUrl(url: string): string {
  const t = url.trim();
  if (!t) return "";
  if (/^https?:\/\//i.test(t)) return t;
  return `https://${t.replace(/^\/+/, "")}`;
}

function linkedInPeopleSearchFallbackUrl(name: string, company: string): string {
  const q = [name, company]
    .map((s) => (typeof s === "string" ? s.trim() : ""))
    .filter(Boolean)
    .join(" ")
    .trim();
  if (!q) return "";
  return linkedInPeopleSearchUrl(q.slice(0, 220));
}

const MAILTO_SUBJECT_APOLLO = "Quick question";

function buildApolloMailtoHref(email: string, body: string): string {
  const e = email.trim();
  if (!e) return "";
  const params = new URLSearchParams();
  params.set("subject", MAILTO_SUBJECT_APOLLO);
  params.set("body", body.trim());
  return `mailto:${e}?${params.toString()}`;
}

function waitlistGateMessageForHint(hint: string | undefined): string {
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

/** Pick first non-empty array from common API shapes (Apollo / proxies). */
function firstPreviewPeopleRawArray(data: Record<string, unknown>): unknown[] | null {
  const nested =
    data.data && typeof data.data === "object" && !Array.isArray(data.data)
      ? (data.data as Record<string, unknown>)
      : null;

  const candidates: unknown[] = [
    data.apolloLeads,
    data.previewPeople,
    data.people,
    data.mergedRows,
    data.rows,
    data.items,
    data.results,
    nested?.people,
    nested?.leads,
    nested?.results,
    nested?.previewPeople,
    data.leads,
  ];

  for (const c of candidates) {
    if (Array.isArray(c) && c.length > 0) return c;
  }
  return null;
}

function rowToApolloPreviewLead(row: unknown): ApolloPreviewLead | null {
  if (!row || typeof row !== "object") return null;
  const r = row as Record<string, unknown>;
  /** Skip Reddit-shaped demand rows (have thread url + snippet, no company role). */
  if (typeof r.url === "string" && typeof r.snippet === "string" && typeof r.subreddit === "string") {
    return null;
  }
  const titleNorm =
    typeof r.title === "string"
      ? r.title
      : typeof r.headline === "string"
        ? r.headline
        : "";
  if (typeof r.id === "string" && typeof r.name === "string" && titleNorm.trim()) {
    return {
      id: r.id,
      name: r.name,
      title: titleNorm.replace(/\s+/g, " ").trim().slice(0, 200),
      company: typeof r.company === "string" ? r.company : "",
      location: typeof r.location === "string" ? r.location : "",
      email: typeof r.email === "string" ? r.email : "",
      linkedin_url: typeof r.linkedin_url === "string" ? r.linkedin_url : "",
      whyMatch: typeof r.whyMatch === "string" ? r.whyMatch : "",
      ...(typeof r.replyDraft === "string" && r.replyDraft.trim() ? { replyDraft: r.replyDraft.trim() } : {}),
    };
  }
  const org =
    r.organization && typeof r.organization === "object"
      ? (r.organization as Record<string, unknown>)
      : null;
  const company =
    org && typeof org.name === "string" ? org.name.replace(/\s+/g, " ").trim().slice(0, 200) : "";
  const first =
    typeof r.first_name === "string" ? r.first_name.trim() : typeof r.first_name_obfuscated === "string"
      ? String(r.first_name_obfuscated).trim()
      : "";
  const last =
    typeof r.last_name === "string" ? r.last_name.trim() : typeof r.last_name_obfuscated === "string"
      ? String(r.last_name_obfuscated).trim()
      : "";
  const name = [first, last].filter(Boolean).join(" ").trim();
  const titleRaw =
    typeof r.title === "string" ? r.title : typeof r.headline === "string" ? r.headline : "";
  const title = titleRaw.replace(/\s+/g, " ").trim().slice(0, 200);
  const linkedin_url = typeof r.linkedin_url === "string" ? r.linkedin_url.trim().slice(0, 500) : "";
  const explicitId = typeof r.id === "string" && r.id.trim() ? r.id.trim() : "";
  const fallbackId = linkedin_url || `${name.toLowerCase()}|${title.toLowerCase()}|${company.toLowerCase()}`;
  const id = explicitId || fallbackId.slice(0, 240);
  const email = typeof r.email === "string" ? r.email.trim().slice(0, 200) : "";
  if (!id || !name || !title) return null;
  return {
    id,
    name,
    title,
    company,
    location:
      typeof r.city === "string" || typeof r.state === "string"
        ? [typeof r.city === "string" ? r.city : "", typeof r.state === "string" ? r.state : ""]
            .map((s) => s.trim())
            .filter(Boolean)
            .join(", ")
        : "",
    email,
    linkedin_url,
    whyMatch: "",
  };
}

function extractApolloPreviewPeople(data: Record<string, unknown>): ApolloPreviewLead[] {
  const raw = firstPreviewPeopleRawArray(data);
  if (!raw) return [];
  const out: ApolloPreviewLead[] = [];
  for (const row of raw) {
    const mapped = rowToApolloPreviewLead(row);
    if (mapped) out.push(mapped);
  }
  return out;
}

type BlockerPayload = {
  type: "clarify" | "refine";
  clarifyingQuestion: string;
  suggestedRefinements: string[];
  productCategory?: string;
};

const leadCardContainer = {
  hidden: { opacity: 0, y: 8 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.34,
      ease: easePremium,
      staggerChildren: 0.1,
      delayChildren: 0.04,
    },
  },
} as const;

const leadCardItem = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: easePremium } },
} as const;

function leadSignalLabel(lead: DemandLead): string {
  const band = lead.signalBand ?? signalBandForIntentScore(lead.intentScore);
  return formatDemandSignalLabel(band);
}

function LeadMatchCard({
  lead,
  draft,
  reduceMotion,
  copied,
  onOpenThread,
  onCopyMessage,
}: {
  lead: DemandLead;
  draft: string;
  reduceMotion: boolean;
  copied: boolean;
  onOpenThread: () => void;
  onCopyMessage: () => void | Promise<void>;
}) {
  const signalLine = leadSignalLabel(lead);
  const cardShell =
    "rounded-xl border border-emerald-200/80 bg-white p-4 sm:p-5 md:p-6";
  const actions = (
    <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
      <a
        href={lead.url}
        target="_blank"
        rel="noopener noreferrer"
        onClick={onOpenThread}
        className={`inline-flex min-h-[48px] w-full items-center justify-center rounded-full bg-indigo-600 px-6 text-[14px] font-medium text-white shadow-lg shadow-indigo-600/20 transition-colors hover:bg-indigo-500 sm:w-auto sm:min-w-[10.5rem] ${pressable}`}
      >
        Open thread
      </a>
      {draft ? (
        <button
          type="button"
          onClick={() => void onCopyMessage()}
          className={`inline-flex min-h-[48px] w-full items-center justify-center rounded-md border border-slate-200 bg-white px-5 text-[14px] font-medium text-slate-800 transition-colors hover:bg-slate-50 sm:w-auto sm:min-w-[10.5rem] ${pressable}`}
        >
          {copied ? "Copied" : "Copy message"}
        </button>
      ) : null}
    </div>
  );
  if (reduceMotion) {
    return (
      <div className={cardShell}>
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-emerald-700 max-md:tracking-[0.14em] md:text-[11px]">
          {signalLine}
        </p>
        <h3 className="mt-1.5 line-clamp-3 text-[16px] font-semibold leading-snug tracking-tight text-slate-900 max-md:text-[15px] md:mt-2 md:line-clamp-none sm:text-lg">
          {lead.title}
        </h3>
        <p className="mt-1.5 line-clamp-3 text-[13px] leading-snug text-slate-700 max-md:font-medium md:mt-2 md:line-clamp-none md:text-[14px] md:leading-relaxed md:text-slate-600">
          {lead.snippet}
        </p>
        <p className="mt-2 text-[12px] font-semibold leading-snug text-emerald-900 max-md:rounded-lg max-md:bg-emerald-50/90 max-md:px-2 max-md:py-1.5 md:mt-3 md:bg-transparent md:px-0 md:py-0 md:text-[13px] md:font-medium md:text-emerald-800">
          <span className="md:hidden">Problem match—open Reddit while the thread is still warm.</span>
          <span className="hidden md:inline">
            From Reddit — open the thread and reply while it is still active.
          </span>
        </p>
        {actions}
        {draft ? (
          <>
            <p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">
              Suggested message
            </p>
            <p className="mt-1.5 max-h-40 overflow-y-auto whitespace-pre-wrap rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-[13px] leading-relaxed text-slate-800 md:mt-2 md:py-3 md:text-[14px]">
              {draft}
            </p>
          </>
        ) : (
          <p className="mt-3 text-[12px] text-slate-500 md:mt-4 md:text-[13px]">
            No draft this time — open the thread and say hi in your own words.
          </p>
        )}
        <p className="mt-3 text-[11px] leading-relaxed text-slate-500 md:mt-4">
          Nothing sends automatically — you stay in control.
        </p>
      </div>
    );
  }

  return (
    <motion.div
      className={cardShell}
      variants={leadCardContainer}
      initial="hidden"
      animate="visible"
    >
      <motion.p
        className="text-[10px] font-semibold uppercase tracking-[0.18em] text-emerald-700 max-md:tracking-[0.14em] md:text-[11px]"
        variants={leadCardItem}
      >
        {signalLine}
      </motion.p>
      <motion.h3
        className="mt-1.5 line-clamp-3 text-[16px] font-semibold leading-snug tracking-tight text-slate-900 max-md:text-[15px] md:mt-2 md:line-clamp-none sm:text-lg"
        variants={leadCardItem}
      >
        {lead.title}
      </motion.h3>
      <motion.p
        className="mt-1.5 line-clamp-3 text-[13px] leading-snug text-slate-700 max-md:font-medium md:mt-2 md:line-clamp-none md:text-[14px] md:leading-relaxed md:text-slate-600"
        variants={leadCardItem}
      >
        {lead.snippet}
      </motion.p>
      <motion.p
        className="mt-2 text-[12px] font-semibold leading-snug text-emerald-900 max-md:rounded-lg max-md:bg-emerald-50/90 max-md:px-2 max-md:py-1.5 md:mt-3 md:bg-transparent md:px-0 md:py-0 md:text-[13px] md:font-medium md:text-emerald-800"
        variants={leadCardItem}
      >
        <span className="md:hidden">Problem match—open Reddit while the thread is still warm.</span>
        <span className="hidden md:inline">
          From Reddit — open the thread and reply while it is still active.
        </span>
      </motion.p>
      <motion.div variants={leadCardItem}>
        {actions}
      </motion.div>
      {draft ? (
        <motion.div variants={leadCardItem}>
          <p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">
            Suggested message
          </p>
          <p className="mt-1.5 max-h-40 overflow-y-auto whitespace-pre-wrap rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-[13px] leading-relaxed text-slate-800 md:mt-2 md:py-3 md:text-[14px]">
            {draft}
          </p>
        </motion.div>
      ) : (
        <motion.p
          className="mt-3 text-[12px] text-slate-500 md:mt-4 md:text-[13px]"
          variants={leadCardItem}
        >
          No draft this time — open the thread and say hi in your own words.
        </motion.p>
      )}
      <motion.p
        className="mt-3 text-[11px] leading-relaxed text-slate-500 md:mt-4"
        variants={leadCardItem}
      >
        Nothing sends automatically — you stay in control.
      </motion.p>
    </motion.div>
  );
}

function ApolloPreviewPersonCard({
  lead,
  fallbackDraft,
  reduceMotion,
  copied,
  linkedInOpenUrl,
  mailtoHref,
  onOpenLinkedIn,
  onCopyMessage,
  onEmailPerson,
}: {
  lead: ApolloPreviewLead;
  fallbackDraft: string;
  reduceMotion: boolean;
  copied: boolean;
  linkedInOpenUrl: string;
  mailtoHref: string;
  onOpenLinkedIn: () => void;
  onCopyMessage: () => void | Promise<void>;
  onEmailPerson: () => void;
}) {
  const fullMessage = (lead.replyDraft ?? fallbackDraft).trim();

  const shell =
    "rounded-xl border border-slate-200 bg-white p-4 sm:p-5 md:p-6";
  const reason =
    lead.whyMatch?.trim() ||
    [lead.title, lead.company].filter((x) => x?.trim()).join(" — ") ||
    "Suggested match from your input.";

  const inner = (
    <>
      <p className="text-[16px] font-semibold tracking-tight text-slate-900 md:text-[17px]">{lead.name}</p>
      <p className="mt-1 text-[13px] font-medium leading-snug text-slate-800 md:text-[14px]">
        {lead.title}
        {lead.company ? ` — ${lead.company}` : ""}
      </p>
      {lead.location ? (
        <p className="mt-1 text-[12px] text-slate-500">{lead.location}</p>
      ) : null}
      <p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">
        Why this matters
      </p>
      <p className="mt-1.5 text-[13px] leading-relaxed text-slate-700">{reason}</p>
      {fullMessage ? (
        <>
          <p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">
            Suggested message
          </p>
          <p className="mt-1.5 max-h-40 overflow-y-auto whitespace-pre-wrap rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-[13px] leading-relaxed text-slate-800 md:text-[14px]">
            {fullMessage}
          </p>
        </>
      ) : (
        <p className="mt-3 text-[12px] text-slate-500">No suggested wording — say hi in your own words.</p>
      )}
      <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
        <button
          type="button"
          disabled={!linkedInOpenUrl}
          onClick={() => {
            if (!linkedInOpenUrl) return;
            onOpenLinkedIn();
            window.open(linkedInOpenUrl, "_blank", "noopener,noreferrer");
          }}
          className={`inline-flex min-h-[48px] w-full items-center justify-center rounded-full bg-indigo-600 px-6 text-[14px] font-medium text-white shadow-lg shadow-indigo-600/20 transition-colors hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-45 sm:w-auto sm:min-w-[10.5rem] ${pressable}`}
        >
          Open LinkedIn
        </button>
        {fullMessage ? (
          <button
            type="button"
            onClick={() => void onCopyMessage()}
            className={`inline-flex min-h-[48px] w-full items-center justify-center rounded-md border border-slate-200 bg-white px-5 text-[14px] font-medium text-slate-800 transition-colors hover:bg-slate-50 sm:w-auto sm:min-w-[10.5rem] ${pressable}`}
          >
            {copied ? "Copied" : "Copy message"}
          </button>
        ) : null}
        {mailtoHref ? (
          <button
            type="button"
            onClick={() => {
              onEmailPerson();
              window.open(mailtoHref, "_blank", "noopener,noreferrer");
            }}
            className={`inline-flex min-h-[48px] w-full items-center justify-center rounded-md border border-slate-200 bg-white px-5 text-[14px] font-medium text-slate-800 transition-colors hover:bg-slate-50 sm:w-auto sm:min-w-[10.5rem] ${pressable}`}
          >
            Email this person
          </button>
        ) : null}
      </div>
      <p className="mt-3 text-[11px] leading-relaxed text-slate-500">
        Nothing sends automatically — you stay in control.
      </p>
    </>
  );

  if (reduceMotion) return <div className={shell}>{inner}</div>;
  return (
    <motion.div
      className={shell}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: easePremium }}
    >
      {inner}
    </motion.div>
  );
}

function LockedLeadPreviewCard({ onRequestAccess }: { onRequestAccess: () => void }) {
  return (
    <button
      type="button"
      onClick={onRequestAccess}
      className="group relative w-full overflow-hidden rounded-xl border border-slate-200/80 bg-slate-50/90 px-4 py-10 text-left shadow-sm transition-[box-shadow,transform] hover:shadow-md motion-safe:hover:-translate-y-0.5 sm:py-12"
    >
      <div className="pointer-events-none select-none space-y-2 opacity-[0.2] blur-[3px] sm:blur-sm">
        <div className="h-3 w-36 rounded bg-slate-300" />
        <div className="h-3 w-full max-w-md rounded bg-slate-200" />
        <div className="h-3 w-[80%] max-w-sm rounded bg-slate-200" />
      </div>
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-white/35 px-4 backdrop-blur-[2px]">
        <p className="text-center text-[13px] font-semibold leading-snug text-slate-800 sm:text-[14px]">
          Unlock more people like this
        </p>
        <span
          className={`inline-flex items-center justify-center rounded-full border border-indigo-200/80 bg-white px-5 py-2 text-[13px] font-semibold text-indigo-700 shadow-sm ${pressable}`}
        >
          Join early access →
        </span>
      </div>
    </button>
  );
}

function PersonalizedLandingCard({
  card,
  copied,
  onOpenLinkedInSearch,
  onCopyMessage,
}: {
  card: PersonalizedFallbackCard;
  copied: boolean;
  onOpenLinkedInSearch: () => void;
  onCopyMessage: () => void | Promise<void>;
}) {
  const reduceMotion = useReducedMotion();
  const searchUrl = linkedInPeopleSearchUrl(card.linkedInSearch);
  return (
    <motion.div
      className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5 md:p-6"
      initial={reduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={
        reduceMotion ? { duration: 0 } : { duration: 0.3, ease: easePremium, delay: 0.08 }
      }
    >
      <h3 className="text-base font-semibold tracking-tight text-slate-900 sm:text-lg md:text-xl">
        Today&apos;s starting point
      </h3>
      <p className="mt-1.5 line-clamp-2 text-[13px] leading-snug text-slate-600 md:mt-2 md:line-clamp-none md:text-[14px] md:leading-relaxed">
        Pick one angle, review the suggested message, and reach out yourself.
      </p>
      <p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500 md:mt-6">
        Who to talk to
      </p>
      <p className="mt-1 line-clamp-2 text-[15px] font-semibold leading-snug text-slate-900 md:mt-1.5 md:line-clamp-none md:text-[16px]">
        {card.whoToTalkTo}
      </p>
      {card.credibilityLine ? (
        <p className="mt-1.5 line-clamp-2 text-[11px] leading-snug text-slate-500 md:mt-2 md:line-clamp-none md:text-[12px] md:leading-relaxed">
          {card.credibilityLine}
        </p>
      ) : null}
      {card.likelyReasonLine ? (
        <p className="mt-1.5 line-clamp-2 text-[12px] font-medium leading-snug text-slate-600 md:mt-2 md:line-clamp-none md:text-[13px] md:leading-relaxed">
          {card.likelyReasonLine}
        </p>
      ) : null}
      <p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500 md:mt-6">
        Tags
      </p>
      <div className="mt-1.5 flex flex-wrap gap-1.5 md:mt-2 md:gap-2">
        {card.tags.map((t) => (
          <span
            key={t}
            className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[11px] font-medium text-slate-800 md:px-2.5 md:py-1 md:text-[12px]"
          >
            {t}
          </span>
        ))}
      </div>
      <p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500 md:mt-6">
        LinkedIn search
      </p>
      <p className="mt-1 line-clamp-2 text-[12px] text-slate-600 md:text-[13px]">
        Starting point: <span className="font-mono text-slate-800">{card.linkedInSearch}</span>
      </p>
      <p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500 md:mt-5">
        Suggested message
      </p>
      <p className="mt-1.5 max-h-40 overflow-y-auto whitespace-pre-wrap rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-left text-[13px] leading-relaxed text-slate-800 md:mt-2 md:py-3 md:text-[14px]">
        {card.message.trim()}
      </p>
      <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
        <button
          type="button"
          onClick={() => {
            onOpenLinkedInSearch();
            window.open(searchUrl, "_blank", "noopener,noreferrer");
          }}
          className={`inline-flex min-h-[48px] w-full items-center justify-center rounded-full bg-indigo-600 px-6 text-[14px] font-medium text-white shadow-lg shadow-indigo-600/20 transition-colors hover:bg-indigo-500 sm:w-auto sm:min-w-[10.5rem] ${pressable}`}
        >
          Open LinkedIn
        </button>
        <button
          type="button"
          onClick={() => void onCopyMessage()}
          className={`inline-flex min-h-[48px] w-full items-center justify-center rounded-md border border-slate-200 bg-white px-5 text-[14px] font-medium text-slate-800 transition-colors hover:bg-slate-50 sm:w-auto sm:min-w-[10.5rem] ${pressable}`}
        >
          {copied ? "Copied" : "Copy message"}
        </button>
      </div>
      <p className="mt-3 text-[11px] leading-relaxed text-slate-500">
        Nothing sends automatically — you stay in control.
      </p>
    </motion.div>
  );
}

function EarlyAccessGateModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!open) {
      setStatus("idle");
      setMessage("");
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
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
        setMessage(waitlistGateMessageForHint(data.confirmationEmailHint));
      }
      gaEvent("waitlist_signup", { method: "hero_gate_modal" });
      form.reset();
    } catch {
      setStatus("error");
      setMessage("Network error. Check your connection and try again.");
    }
  }

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[80] flex items-end justify-center p-4 sm:items-center sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="hero-gate-title"
    >
      <button
        type="button"
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-[2px]"
        aria-label="Close"
        onClick={onClose}
      />
      <div className="relative z-[1] w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl sm:p-8">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-3 top-3 rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
          aria-label="Close"
        >
          <span aria-hidden className="text-lg leading-none">
            ×
          </span>
        </button>
        <h2 id="hero-gate-title" className="pr-8 text-xl font-semibold tracking-tight text-slate-900">
          You&apos;ve unlocked your first conversation
        </h2>
        <p className="mt-3 text-[15px] leading-relaxed text-slate-600">
          Want more people like this? Join early access.
        </p>

        {status === "success" ? (
          <div className="mt-6 space-y-3">
            <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-[14px] font-medium text-emerald-900">
              {message}
            </p>
            <button
              type="button"
              onClick={onClose}
              className="w-full rounded-full border border-slate-200 py-2.5 text-[14px] font-semibold text-slate-800 transition-colors hover:bg-slate-50"
            >
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label htmlFor="hero-gate-email" className="block text-sm font-semibold text-slate-800">
                Email
              </label>
              <input
                id="hero-gate-email"
                name="email"
                type="email"
                autoComplete="email"
                required
                placeholder="you@company.com"
                className="mt-2 h-11 w-full rounded-xl border border-slate-200 px-3 text-[15px] text-slate-900 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
            <input type="text" name="website" tabIndex={-1} autoComplete="off" className="sr-only" aria-hidden />
            {status === "error" && message ? (
              <p className="text-[14px] font-medium text-red-600" role="alert">
                {message}
              </p>
            ) : null}
            <button
              type="submit"
              disabled={status === "loading"}
              className={`flex h-11 w-full items-center justify-center rounded-full bg-indigo-600 text-[15px] font-semibold text-white shadow-lg shadow-indigo-600/25 transition-colors hover:bg-indigo-500 disabled:opacity-50 ${pressable}`}
            >
              {status === "loading" ? "Joining…" : "Join waitlist"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

/** After preview: secondary path to early access — no fake loading chrome. */
function UnlockMoreMoment({
  previewConsumed,
  dismissed,
  onDismiss,
  reduceMotion,
  onJoinEarlyAccess,
  children,
}: {
  previewConsumed: boolean;
  dismissed: boolean;
  onDismiss: () => void;
  reduceMotion: boolean;
  onJoinEarlyAccess: () => void;
  children: ReactNode;
}) {
  const showUnlock = previewConsumed && !dismissed;

  return (
    <div className="w-full min-w-0 space-y-0">
      <div className="w-full min-w-0">{children}</div>
      {showUnlock ? (
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: reduceMotion ? 0 : 0.3, ease: easePremium }}
          className="mt-8 w-full border-t border-slate-200 pt-8"
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between sm:gap-8">
            <p className="max-w-md text-[14px] leading-relaxed text-slate-600">
              More matches in the full experience. We&apos;re rolling this out in small batches.
            </p>
            <div className="flex shrink-0 flex-col gap-2 sm:items-end">
              <button
                type="button"
                onClick={onJoinEarlyAccess}
                className={`inline-flex h-11 w-full items-center justify-center rounded-full bg-indigo-600 px-6 text-[14px] font-medium text-white shadow-lg shadow-indigo-600/20 transition-colors hover:bg-indigo-500 sm:w-auto ${pressable}`}
              >
                Join early access →
              </button>
              <button
                type="button"
                onClick={onDismiss}
                className="text-[13px] font-medium text-slate-500 underline-offset-4 transition-colors hover:text-slate-700 hover:underline sm:text-right"
              >
                Continue with this result
              </button>
            </div>
          </div>
        </motion.div>
      ) : null}
    </div>
  );
}

export function HeroDemandPreview({ ambient = "light" }: { ambient?: "light" | "dark" }) {
  const [problem, setProblem] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [blocker, setBlocker] = useState<BlockerPayload | null>(null);
  const [resultHint, setResultHint] = useState<string | null>(null);
  const [hasResult, setHasResult] = useState(false);
  const [redditLeads, setRedditLeads] = useState<DemandLead[]>([]);
  const [replyDraftById, setReplyDraftById] = useState<Record<string, string>>({});
  const [personalizedFallback, setPersonalizedFallback] =
    useState<PersonalizedFallbackCard | null>(null);
  const [apolloPreviewLeads, setApolloPreviewLeads] = useState<ApolloPreviewLead[]>([]);
  const [apolloCopyDraft, setApolloCopyDraft] = useState("");
  const [apolloFallbackUsed, setApolloFallbackUsed] = useState(false);
  /** After first successful preview — drives soft “more results” unlock moment. */
  const [previewConsumed, setPreviewConsumed] = useState(false);
  const [unlockMomentDismissed, setUnlockMomentDismissed] = useState(false);
  /** User used copy / LinkedIn / email on the first preview lead (client-only signal). */
  const [firstLeadInteractionUsed, setFirstLeadInteractionUsed] = useState(false);
  const [gateModalOpen, setGateModalOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [loadingStep, setLoadingStep] = useState(0);
  const [noConversationsPhase, setNoConversationsPhase] = useState<"idle" | "message" | "full">(
    "idle",
  );

  const resultsRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const mobileScrollYRef = useRef(0);
  const reduceMotion = useReducedMotion();
  const [mobileStickyJoinVisible, setMobileStickyJoinVisible] = useState(true);

  useEffect(() => {
    if (!hasResult || loading) {
      setMobileStickyJoinVisible(true);
      return;
    }
    const isMobile = () => typeof window !== "undefined" && window.matchMedia("(max-width: 768px)").matches;
    const onScroll = () => {
      if (!isMobile()) return;
      const y = window.scrollY;
      const prev = mobileScrollYRef.current;
      if (y < 96) {
        setMobileStickyJoinVisible(true);
        mobileScrollYRef.current = y;
        return;
      }
      if (y + 12 < prev) setMobileStickyJoinVisible(false);
      else if (y > prev + 12) setMobileStickyJoinVisible(true);
      mobileScrollYRef.current = y;
    };
    mobileScrollYRef.current = window.scrollY;
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [hasResult, loading]);

  useEffect(() => {
    if (!loading) {
      setLoadingStep(0);
      return;
    }
    if (reduceMotion) return;
    setLoadingStep(0);
    const t1 = window.setTimeout(() => setLoadingStep(1), 300);
    const t2 = window.setTimeout(() => setLoadingStep(2), 600);
    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
    };
  }, [loading, reduceMotion]);

  useEffect(() => {
    const noLead =
      hasResult && redditLeads.length === 0 && personalizedFallback && apolloPreviewLeads.length === 0;
    if (!noLead) {
      setNoConversationsPhase("idle");
      return;
    }
    if (reduceMotion) {
      setNoConversationsPhase("full");
      return;
    }
    setNoConversationsPhase("message");
    const t = window.setTimeout(() => setNoConversationsPhase("full"), 420);
    return () => window.clearTimeout(t);
  }, [hasResult, redditLeads.length, personalizedFallback, apolloPreviewLeads.length, reduceMotion]);

  const scrollToResults = useCallback(() => {
    requestAnimationFrame(() => {
      resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }, []);

  const runPreview = useCallback(
    async (rawText: string) => {
      const trimmed = rawText.trim();
      if (!trimmed || loading) return;

      setLoading(true);
      setError(null);
      setBlocker(null);
      setResultHint(null);
      setHasResult(false);
      setRedditLeads([]);
      setReplyDraftById({});
      setPersonalizedFallback(null);
      setApolloPreviewLeads([]);
      setApolloCopyDraft("");
      setApolloFallbackUsed(false);
      setPreviewConsumed(false);
      setUnlockMomentDismissed(false);
      setFirstLeadInteractionUsed(false);
      setGateModalOpen(false);
      setToast(null);
      setCopiedKey(null);

      try {
        const res = await fetch("/api/demand/landing-preview", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ rawInput: trimmed }),
        });
        const data = (await res.json()) as Record<string, unknown>;

        if (DEBUG_LANDING_PREVIEW) {
          console.info("[landing-preview client] response", {
            httpStatus: res.status,
            keys: Object.keys(data),
            redditLen: Array.isArray(data.redditLeads) ? data.redditLeads.length : null,
            apolloLen: Array.isArray(data.apolloLeads) ? data.apolloLeads.length : null,
            payload: data,
          });
        }

        if (!res.ok) {
          setError(
            typeof data.error === "string"
              ? data.error
              : "Could not prepare your preview. Try a bit more detail.",
          );
          return;
        }

        if (data.needsClarification === true) {
          const q =
            typeof data.clarifyingQuestion === "string" ? data.clarifyingQuestion.trim() : "";
          const chips = Array.isArray(data.suggestedRefinements)
            ? data.suggestedRefinements.filter(
                (x): x is string => typeof x === "string" && x.trim() !== "",
              )
            : [];
          if (q && chips.length > 0) {
            setBlocker({ type: "clarify", clarifyingQuestion: q, suggestedRefinements: chips });
          } else {
            setError("We need a bit more detail to tailor results. Try describing who it is for.");
          }
          return;
        }

        if (data.needsRefinement === true) {
          const q =
            typeof data.clarifyingQuestion === "string" ? data.clarifyingQuestion.trim() : "";
          const chips = Array.isArray(data.suggestedRefinements)
            ? data.suggestedRefinements.filter(
                (x): x is string => typeof x === "string" && x.trim() !== "",
              )
            : [];
          const productCategory =
            typeof data.productCategory === "string" ? data.productCategory.trim() : undefined;
          if (q && chips.length > 0) {
            setBlocker({
              type: "refine",
              clarifyingQuestion: q,
              suggestedRefinements: chips,
              ...(productCategory ? { productCategory } : {}),
            });
          } else {
            setError("We need a bit more detail to tailor results. Try one of the refinements.");
          }
          return;
        }

        const productCategory =
          typeof data.productCategory === "string" ? data.productCategory.trim() : "";
        const confidence =
          typeof data.confidence === "number" && Number.isFinite(data.confidence)
            ? data.confidence
            : 0;

        const leadsRaw = Array.isArray(data.redditLeads) ? data.redditLeads : [];
        const leads: DemandLead[] = [];
        for (const item of leadsRaw) {
          if (!item || typeof item !== "object") continue;
          const L = item as Record<string, unknown>;
          if (
            typeof L.id === "string" &&
            typeof L.title === "string" &&
            typeof L.snippet === "string" &&
            typeof L.url === "string"
          ) {
            const intent =
              typeof L.intentScore === "number" && Number.isFinite(L.intentScore) ? L.intentScore : 0;
            const sb = L.signalBand;
            const signalBand =
              sb === "strong" || sb === "medium" || sb === "early"
                ? sb
                : signalBandForIntentScore(intent);
            leads.push({
              id: L.id,
              source: "reddit",
              leadType: L.leadType === "high_intent" || L.leadType === "problem" ? L.leadType : "problem",
              signalBand,
              title: L.title,
              subreddit: typeof L.subreddit === "string" ? L.subreddit : "",
              author: typeof L.author === "string" ? L.author : "",
              url: L.url,
              snippet: L.snippet,
              createdUtc: typeof L.createdUtc === "number" ? L.createdUtc : null,
              numComments: typeof L.numComments === "number" ? L.numComments : 0,
              intentScore: intent,
              whyMatch: typeof L.whyMatch === "string" ? L.whyMatch : "",
              replyDraft: typeof L.replyDraft === "string" ? L.replyDraft : "",
            });
          }
        }

        const drafts: Record<string, string> = {};
        const rd = data.replyDrafts;
        if (Array.isArray(rd)) {
          for (const row of rd) {
            if (!row || typeof row !== "object") continue;
            const o = row as Record<string, unknown>;
            if (typeof o.id === "string" && typeof o.reply === "string" && o.reply.trim()) {
              drafts[o.id] = o.reply.trim();
            }
          }
        }

        const fbRaw =
          data.personalizedFallback && typeof data.personalizedFallback === "object"
            ? (data.personalizedFallback as Record<string, unknown>)
            : null;
        const fb =
          fbRaw &&
          typeof fbRaw.whoToTalkTo === "string" &&
          Array.isArray(fbRaw.tags) &&
          typeof fbRaw.linkedInSearch === "string" &&
          typeof fbRaw.message === "string" &&
          typeof fbRaw.followUp === "string"
            ? ({
                ...fbRaw,
                credibilityLine:
                  typeof fbRaw.credibilityLine === "string" && fbRaw.credibilityLine.trim()
                    ? fbRaw.credibilityLine.trim()
                    : "Based on patterns from similar conversations",
                likelyReasonLine:
                  typeof fbRaw.likelyReasonLine === "string" && fbRaw.likelyReasonLine.trim()
                    ? fbRaw.likelyReasonLine.trim()
                    : "Likely dealing with this from how similar threads read.",
              } as PersonalizedFallbackCard)
            : null;

        let apolloList: ApolloPreviewLead[] = [];
        if (Array.isArray(data.apolloLeads)) {
          for (const item of data.apolloLeads) {
            const m = rowToApolloPreviewLead(item);
            if (m) apolloList.push(m);
          }
        }
        if (apolloList.length === 0) {
          apolloList = extractApolloPreviewPeople(data);
        }

        const apolloDraft =
          typeof data.apolloCopyDraft === "string" ? data.apolloCopyDraft.trim() : "";
        const apolloFb = data.apolloFallbackUsed === true;

        const hasAnyPreview = leads.length > 0 || Boolean(fb) || apolloList.length > 0;

        if (!hasAnyPreview) {
          setError("No people found for this yet. Try a simpler problem or broader audience.");
          return;
        }

        if (productCategory && confidence >= 0.55) {
          setResultHint(
            `Today's starting point: ${productCategory}. Refine if this is not quite right.`,
          );
        } else {
          setResultHint(null);
        }

        setRedditLeads(leads.slice(0, 1));
        setReplyDraftById(drafts);
        setPersonalizedFallback(fb);
        setApolloPreviewLeads(apolloList.slice(0, 3));
        setApolloCopyDraft(apolloDraft);
        setApolloFallbackUsed(apolloFb);
        setHasResult(true);
        setPreviewConsumed(true);
        scrollToResults();
      } catch {
        setError("Network issue. Check your connection and try again.");
      } finally {
        setLoading(false);
      }
    },
    [loading, scrollToResults],
  );

  const onShowPeople = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      await runPreview(problem);
    },
    [problem, runPreview],
  );

  const applyRefinementChip = useCallback(
    (chip: string) => {
      const base = problem.trim();
      const next = base ? `${base}\n\n${chip.trim()}` : chip.trim();
      setProblem(next);
      void runPreview(next);
    },
    [problem, runPreview],
  );

  const openGateModal = useCallback(() => {
    setGateModalOpen(true);
  }, []);

  const showCopyToast = useCallback(() => {
    setToast("Message copied — send it from your LinkedIn or email.");
  }, []);

  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(null), 4500);
    return () => window.clearTimeout(t);
  }, [toast]);

  return (
    <>
      <div
        id="hero-form"
        className={cn(
          "mx-auto w-full min-w-0 max-w-3xl",
          hasResult && !loading && "max-md:pb-[5.5rem]",
        )}
      >
      <form onSubmit={onShowPeople} className="w-full text-left">
        <label htmlFor="hero-problem" className="sr-only">
          Describe the problem you solve
        </label>
        <div className="relative mx-auto mt-10 w-full max-w-3xl">
          <div className={heroInputCard}>
            <textarea
              ref={inputRef}
              id="hero-problem"
              rows={2}
              value={problem}
              onChange={(e) => setProblem(e.target.value)}
              disabled={loading}
              placeholder="landlords struggling to track rent payments"
              className="min-h-[2.75rem] max-h-32 flex-1 resize-y border-0 bg-transparent p-0 text-base leading-relaxed text-slate-900 placeholder:text-slate-400 outline-none ring-0 focus:ring-0 disabled:opacity-60"
            />
            <button
              type="submit"
              disabled={loading || !problem.trim()}
              aria-label={loading ? "Working on preview" : "Find people"}
              className={`inline-flex h-11 shrink-0 items-center justify-center whitespace-nowrap rounded-full bg-indigo-600 px-6 text-[14px] font-medium text-white shadow-lg shadow-indigo-600/20 transition-colors hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50 ${pressableDisabled}`}
            >
              {loading ? (
                <>
                  <span
                    className="mr-2 block h-4 w-4 shrink-0 animate-spin rounded-full border-2 border-white/30 border-t-white"
                    aria-hidden
                  />
                  <span>Working…</span>
                </>
              ) : (
                <>Find people →</>
              )}
            </button>
          </div>
        </div>

        <p
          className={cn(
            "mt-4 text-center text-sm leading-relaxed sm:text-left",
            ambient === "dark" ? "text-white/60" : "text-slate-500",
          )}
        >
          Real people from real sources — you choose who to message.
        </p>
        <p
          className={cn(
            "mt-1.5 text-center text-sm font-medium sm:text-left",
            ambient === "dark" ? "text-white/55" : "text-slate-500",
          )}
        >
          Nothing sends automatically — you stay in control.
        </p>

        <div className="mt-2 min-h-[1.25rem] text-center sm:min-h-[1.5rem] sm:text-left">
          <AnimatePresence mode="wait">
            {loading ? (
              <motion.p
                key={reduceMotion ? "loading-static" : `loading-${loadingStep}`}
                initial={reduceMotion ? false : { opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduceMotion ? undefined : { opacity: 0, y: -3 }}
                transition={{ duration: 0.22, ease: easePremium }}
                className={cn(
                  "text-[13px] font-medium leading-snug",
                  ambient === "dark" ? "text-white/55" : "text-[#64748b]",
                )}
              >
                {reduceMotion
                  ? "Working on your preview…"
                  : loadingStep === 0
                    ? "Scanning real conversations…"
                    : loadingStep === 1
                      ? "Checking Reddit and sources…"
                      : "Finding the best fits…"}
              </motion.p>
            ) : null}
          </AnimatePresence>
        </div>
      </form>

      <div
        ref={resultsRef}
        id="landing-demand-results"
        data-first-lead-used={firstLeadInteractionUsed ? "true" : "false"}
        className="mt-6 scroll-mt-28 text-left max-md:mt-5 sm:scroll-mt-24 md:mt-10"
      >
        {error ? (
          <motion.p
            className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-[14px] leading-relaxed text-amber-950 shadow-sm"
            role="alert"
            initial={reduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: reduceMotion ? 0 : 0.3, ease: easePremium }}
          >
            {error}
          </motion.p>
        ) : null}

        {resultHint && hasResult ? (
          <motion.p
            className="mb-4 line-clamp-3 rounded-xl border border-emerald-200 bg-emerald-50/95 px-3 py-2.5 text-[12px] leading-snug text-emerald-950 shadow-sm max-md:mb-3 md:mb-6 md:line-clamp-none md:px-4 md:py-3 md:text-[13px] md:leading-relaxed"
            role="status"
            initial={reduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: reduceMotion ? 0 : 0.3, ease: easePremium }}
          >
            {resultHint}
          </motion.p>
        ) : null}

        {blocker ? (
          <motion.div
            className="rounded-2xl border border-amber-200 bg-white/95 p-5 shadow-xl shadow-slate-900/10 backdrop-blur-sm sm:p-6"
            role="region"
            aria-label={blocker.type === "refine" ? "Refine your input" : "More detail needed"}
            initial={reduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: reduceMotion ? 0 : 0.3, ease: easePremium }}
          >
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-amber-700">
              {blocker.type === "refine" ? "Quick check" : "A bit more specificity"}
            </p>
            {blocker.type === "refine" && blocker.productCategory ? (
              <p className="mt-2 text-[13px] text-slate-600">
                Tentative read:{" "}
                <span className="font-medium text-slate-900">{blocker.productCategory}</span>
              </p>
            ) : null}
            <p className="mt-3 text-[15px] font-medium leading-relaxed text-slate-900">
              {blocker.clarifyingQuestion}
            </p>
            <p className="mt-5 text-[12px] font-semibold uppercase tracking-[0.12em] text-slate-500">
              Tap a refinement
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {blocker.suggestedRefinements.map((chip) => (
                <button
                  key={chip}
                  type="button"
                  disabled={loading}
                  onClick={() => applyRefinementChip(chip)}
                  className={`rounded-full border border-slate-200 bg-slate-50 px-3.5 py-2 text-left text-[13px] font-medium leading-snug text-slate-800 transition-colors hover:border-amber-300 hover:bg-amber-50/80 disabled:opacity-50 ${pressable}`}
                >
                  {chip}
                </button>
              ))}
            </div>
            <p className="mt-4 text-[12px] text-slate-600">
              Or edit the box above and run again — we only search after this looks specific enough.
            </p>
          </motion.div>
        ) : null}

        {hasResult && (Boolean(redditLeads[0]) || apolloPreviewLeads.length > 0) ? (
          <div className="mb-8 sm:mb-10">
            <h2 className="text-[1.35rem] font-semibold leading-tight tracking-tight text-slate-900 sm:text-[1.5rem]">
              Someone you can talk to — right now
            </h2>
            <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-slate-600 sm:text-[16px]">
              {redditLeads[0] ? (
                <>
                  We found a real conversation that matches your problem.
                  <span className="text-slate-500"> This is a preview.</span>
                </>
              ) : (
                <>
                  We found a real person likely dealing with your problem.
                  <span className="text-slate-500"> This is a preview.</span>
                </>
              )}
            </p>
          </div>
        ) : null}

        {hasResult && redditLeads[0]
          ? (() => {
              const lead = redditLeads[0];
              if (!lead) return null;
              const draft = replyDraftById[lead.id] ?? "";
              const rk = `reddit-${lead.id}`;
              return (
                <UnlockMoreMoment
                  previewConsumed={previewConsumed}
                  dismissed={unlockMomentDismissed}
                  onDismiss={() => setUnlockMomentDismissed(true)}
                  reduceMotion={!!reduceMotion}
                  onJoinEarlyAccess={openGateModal}
                >
                  <LeadMatchCard
                    lead={lead}
                    draft={draft}
                    reduceMotion={!!reduceMotion}
                    copied={copiedKey === rk}
                    onOpenThread={() => setFirstLeadInteractionUsed(true)}
                    onCopyMessage={async () => {
                      if (!draft.trim()) return;
                      try {
                        await navigator.clipboard.writeText(draft);
                        setCopiedKey(rk);
                        setFirstLeadInteractionUsed(true);
                        showCopyToast();
                        window.setTimeout(() => setCopiedKey((k) => (k === rk ? null : k)), 2500);
                      } catch {
                        setCopiedKey(null);
                      }
                    }}
                  />
                  <div className="mt-4 grid gap-3 sm:grid-cols-2 sm:gap-4">
                    <LockedLeadPreviewCard onRequestAccess={openGateModal} />
                    <LockedLeadPreviewCard onRequestAccess={openGateModal} />
                  </div>
                </UnlockMoreMoment>
              );
            })()
          : null}

        {hasResult && apolloPreviewLeads.length > 0 && redditLeads.length === 0 ? (
          <div className="mt-5 text-left max-md:mt-4 md:mt-8">
            <UnlockMoreMoment
              previewConsumed={previewConsumed}
              dismissed={unlockMomentDismissed}
              onDismiss={() => setUnlockMomentDismissed(true)}
              reduceMotion={!!reduceMotion}
              onJoinEarlyAccess={openGateModal}
            >
              <div className="space-y-4 md:space-y-5">
                {apolloFallbackUsed ? (
                  <p className="text-[13px] text-slate-500">We broadened the search to find relevant people.</p>
                ) : null}
                {apolloPreviewLeads[0]
                  ? (() => {
                      const lead0 = apolloPreviewLeads[0];
                      const fullMsg = (lead0.replyDraft ?? apolloCopyDraft).trim();
                      const mailto =
                        lead0.email?.trim() && fullMsg
                          ? buildApolloMailtoHref(lead0.email, fullMsg)
                          : "";
                      const liUrl =
                        normalizeLinkedInOpenUrl(lead0.linkedin_url || "") ||
                        linkedInPeopleSearchFallbackUrl(lead0.name, lead0.company);
                      const ck = `apollo-${lead0.id}`;
                      return (
                        <ApolloPreviewPersonCard
                          lead={lead0}
                          fallbackDraft={apolloCopyDraft}
                          reduceMotion={!!reduceMotion}
                          copied={copiedKey === ck}
                          linkedInOpenUrl={liUrl}
                          mailtoHref={mailto}
                          onOpenLinkedIn={() => setFirstLeadInteractionUsed(true)}
                          onCopyMessage={async () => {
                            if (!fullMsg) return;
                            try {
                              await navigator.clipboard.writeText(fullMsg);
                              setCopiedKey(ck);
                              setFirstLeadInteractionUsed(true);
                              showCopyToast();
                              window.setTimeout(() => setCopiedKey((k) => (k === ck ? null : k)), 2500);
                            } catch {
                              setCopiedKey(null);
                            }
                          }}
                          onEmailPerson={() => setFirstLeadInteractionUsed(true)}
                        />
                      );
                    })()
                  : null}
                <div className="grid gap-3 sm:grid-cols-2 sm:gap-4">
                  <LockedLeadPreviewCard onRequestAccess={openGateModal} />
                  <LockedLeadPreviewCard onRequestAccess={openGateModal} />
                </div>
              </div>
            </UnlockMoreMoment>
          </div>
        ) : null}

        {hasResult && personalizedFallback && redditLeads.length === 0 ? (
          <div className="mt-5 text-left max-md:mt-4 md:mt-8">
            {noConversationsPhase === "message" ? (
              <motion.div
                key="no-conv-message"
                className="rounded-xl border border-slate-200 bg-white px-4 py-6 text-center sm:px-8 md:py-10"
                initial={reduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: reduceMotion ? 0 : 0.3, ease: easePremium }}
              >
                <p className="text-[17px] font-semibold leading-snug tracking-tight text-slate-900 sm:text-lg">
                  No public demand right now
                </p>
                <p className="mx-auto mt-2 line-clamp-4 max-w-md text-[13px] leading-snug text-slate-600 max-md:text-[13px] md:line-clamp-none md:text-[14px] md:leading-relaxed">
                  That&apos;s normal. Not every problem shows up publicly every day. You can still keep
                  moving.
                </p>
              </motion.div>
            ) : null}

            {noConversationsPhase === "full" ? (
              <motion.div
                key="no-conv-full"
                className="space-y-3 md:space-y-5"
                initial={reduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: reduceMotion ? 0 : 0.32, ease: easePremium }}
              >
                <div className="rounded-xl border border-slate-200 bg-white px-4 py-4 sm:px-6 md:py-5">
                  <h3 className="text-[16px] font-semibold leading-snug tracking-tight text-slate-900 sm:text-lg md:text-[17px]">
                    No public demand right now
                  </h3>
                  <p className="mt-1.5 line-clamp-4 text-[13px] leading-snug text-slate-600 md:mt-2 md:line-clamp-none md:text-[14px] md:leading-relaxed">
                    That&apos;s normal. Not every problem shows up publicly every day. You can still keep
                    moving.
                  </p>
                </div>
                <UnlockMoreMoment
                  previewConsumed={previewConsumed}
                  dismissed={unlockMomentDismissed}
                  onDismiss={() => setUnlockMomentDismissed(true)}
                  reduceMotion={!!reduceMotion}
                  onJoinEarlyAccess={openGateModal}
                >
                  <PersonalizedLandingCard
                    card={personalizedFallback}
                    copied={copiedKey === "personalized"}
                    onOpenLinkedInSearch={() => setFirstLeadInteractionUsed(true)}
                    onCopyMessage={async () => {
                      const text = personalizedFallback.message.trim();
                      if (!text) return;
                      try {
                        await navigator.clipboard.writeText(text);
                        setCopiedKey("personalized");
                        setFirstLeadInteractionUsed(true);
                        showCopyToast();
                        window.setTimeout(
                          () => setCopiedKey((k) => (k === "personalized" ? null : k)),
                          2500,
                        );
                      } catch {
                        setCopiedKey(null);
                      }
                    }}
                  />
                  <div className="mt-4 grid gap-3 sm:grid-cols-2 sm:gap-4">
                    <LockedLeadPreviewCard onRequestAccess={openGateModal} />
                    <LockedLeadPreviewCard onRequestAccess={openGateModal} />
                  </div>
                </UnlockMoreMoment>
              </motion.div>
            ) : null}
          </div>
        ) : null}

      </div>
      </div>

      {hasResult && !loading ? (
        <div
          className={cn(
            "fixed inset-x-0 bottom-0 z-[60] hidden border-t border-slate-200 bg-white/95 px-3 pb-[max(0.65rem,env(safe-area-inset-bottom))] pt-2 backdrop-blur-md transition-[transform,opacity] duration-300 ease-out max-md:block md:hidden",
            mobileStickyJoinVisible
              ? "translate-y-0 opacity-100"
              : "pointer-events-none translate-y-[110%] opacity-0",
          )}
        >
          <button
            type="button"
            aria-label="Join early access"
            onClick={openGateModal}
            className={`flex min-h-[52px] w-full items-center justify-center rounded-full bg-indigo-600 px-6 text-[15px] font-medium text-white shadow-lg shadow-indigo-600/20 transition-colors hover:bg-indigo-500 ${pressable}`}
          >
            Join early access →
          </button>
        </div>
      ) : null}

      <EarlyAccessGateModal open={gateModalOpen} onClose={() => setGateModalOpen(false)} />

      <AnimatePresence>
        {toast ? (
          <motion.div
            key="hero-toast"
            role="status"
            aria-live="polite"
            initial={reduceMotion ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduceMotion ? undefined : { opacity: 0, y: 8 }}
            transition={{ duration: 0.25, ease: easePremium }}
            className="pointer-events-none fixed bottom-[max(5.5rem,env(safe-area-inset-bottom,0px)+4.5rem)] left-1/2 z-[85] w-[min(92vw,24rem)] -translate-x-1/2 rounded-xl border border-slate-200 bg-slate-900 px-4 py-3 text-center text-[13px] font-medium leading-snug text-white shadow-xl sm:bottom-8"
          >
            {toast}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
