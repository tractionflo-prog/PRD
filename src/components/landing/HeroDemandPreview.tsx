"use client";

import { cn } from "@/lib/cn";
import { formatDemandSignalLabel, signalBandForIntentScore } from "@/lib/demand/intent-score";
import type { DemandLead } from "@/lib/demand/types";
import type { PersonalizedFallbackCard } from "@/lib/demand/problem-interpreter";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import Link from "next/link";
import type { MouseEvent, ReactNode } from "react";
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

const inputShell =
  "relative rounded-3xl border border-[#e2e8f0] bg-white shadow-[0_24px_80px_rgba(15,23,42,0.12)] ring-1 ring-slate-900/[0.02] " +
  "motion-safe:transition-[transform,box-shadow] motion-safe:duration-200 motion-safe:ease-out " +
  "motion-safe:focus-within:scale-[1.01] motion-safe:focus-within:shadow-[0_0_0_3px_rgba(99,91,255,0.14),0_24px_80px_rgba(15,23,42,0.1)]";

/** Softer than hero prompt — same calm focus language */
function linkedInPeopleSearchUrl(keywords: string): string {
  const params = new URLSearchParams({
    keywords: keywords.trim().slice(0, 200),
  });
  return `https://www.linkedin.com/search/results/people/?${params.toString()}`;
}

function scrollToJoinSection(e: MouseEvent<HTMLAnchorElement>) {
  const el = document.getElementById("join");
  if (el && window.location.pathname === "/") {
    e.preventDefault();
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

/** Rotating prompts: type forward → pause → delete → next line (Copilot-style bar). */
const HERO_ROTATING_PLACEHOLDERS = [
  "Describe who feels the pain — and what breaks for them week to week…",
  "Try: consultants pulling late nights before board reviews…",
  "Who it’s for, what breaks today, and what you’re trying instead…",
];

function AnimatedHeroPlaceholder({ active }: { active: boolean }) {
  const reduceMotion = useReducedMotion();
  const [shown, setShown] = useState("");
  const timeoutRef = useRef<number | null>(null);
  const cancelledRef = useRef(false);

  useEffect(() => {
    cancelledRef.current = false;
    const clear = () => {
      if (timeoutRef.current != null) {
        window.clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
    const schedule = (fn: () => void, ms: number) => {
      clear();
      timeoutRef.current = window.setTimeout(() => {
        timeoutRef.current = null;
        if (!cancelledRef.current) fn();
      }, ms);
    };

    if (!active || reduceMotion) {
      clear();
      setShown("");
      return () => {
        cancelledRef.current = true;
        clear();
      };
    }

    let promptIndex = 0;
    const text = () => HERO_ROTATING_PLACEHOLDERS[promptIndex % HERO_ROTATING_PLACEHOLDERS.length]!;
    let len = 0;
    let phase: "in" | "pauseFull" | "out" | "pauseEmpty" = "in";

    const step = () => {
      if (cancelledRef.current) return;
      const t = text();

      if (phase === "in") {
        if (len < t.length) {
          len += 1;
          setShown(t.slice(0, len));
          schedule(step, 38 + (len % 5) * 6);
          return;
        }
        phase = "pauseFull";
        schedule(() => {
          phase = "out";
          step();
        }, 1400);
        return;
      }

      if (phase === "out") {
        if (len > 0) {
          len -= 1;
          setShown(t.slice(0, len));
          schedule(step, 26 + (len % 4) * 4);
          return;
        }
        phase = "pauseEmpty";
        schedule(() => {
          promptIndex += 1;
          len = 0;
          setShown("");
          phase = "in";
          step();
        }, 900);
      }
    };

    len = 0;
    promptIndex = 0;
    setShown("");
    phase = "in";
    schedule(step, 600);

    return () => {
      cancelledRef.current = true;
      clear();
    };
  }, [active, reduceMotion]);

  if (!active || reduceMotion) return null;

  return (
    <div
      className="pointer-events-none absolute left-0 top-0 z-0 max-w-[calc(100%-5.5rem)] px-4 pt-4 text-left text-[15px] leading-relaxed text-[#94a3b8] sm:max-w-[calc(100%-13rem)] sm:px-5 sm:pt-5"
      aria-hidden
    >
      <span>{shown}</span>
      <span className="ml-px inline-block h-[1.1em] w-[2px] translate-y-px animate-pulse bg-[#635bff]/45 align-middle motion-reduce:hidden" />
    </div>
  );
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
  copied,
  reduceMotion,
  onCopy,
}: {
  lead: DemandLead;
  draft: string;
  copied: boolean;
  reduceMotion: boolean;
  onCopy: () => void;
}) {
  const signalLine = leadSignalLabel(lead);
  const cardShell =
    "rounded-2xl border border-emerald-200/90 bg-white p-4 shadow-xl shadow-slate-900/10 sm:p-5 md:p-6";
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
        <div className="mt-4 flex flex-col gap-2 max-md:w-full md:mt-5 md:flex-row md:flex-wrap">
          <a
            href={lead.url}
            target="_blank"
            rel="noopener noreferrer"
            className={`inline-flex min-h-[48px] w-full items-center justify-center rounded-xl bg-[#4338ca] px-5 text-[15px] font-semibold text-white shadow-md ring-1 ring-black/5 transition-colors hover:bg-[#3730a3] md:h-11 md:min-h-0 md:w-auto md:min-w-[10.5rem] md:bg-[#635bff] md:text-[14px] md:hover:bg-[#5851ea] ${pressable}`}
          >
            Open thread
          </a>
          {draft ? (
            <button
              type="button"
              onClick={onCopy}
              className={`inline-flex min-h-[48px] w-full items-center justify-center rounded-xl border border-slate-200 bg-white px-5 text-[14px] font-semibold text-slate-800 shadow-sm transition-colors hover:bg-slate-50 md:h-11 md:min-h-0 md:w-auto md:min-w-[10.5rem] ${pressable}`}
            >
              {copied ? "Copied" : "Copy message to send"}
            </button>
          ) : null}
        </div>
        {draft ? (
          <p className="mt-3 line-clamp-4 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-[13px] leading-relaxed text-slate-800 md:mt-4 md:line-clamp-none md:py-3 md:text-[14px]">
            {draft}
          </p>
        ) : (
          <p className="mt-3 text-[12px] text-slate-500 md:mt-4 md:text-[13px]">
            No draft this time — open the thread and say hi in your own words.
          </p>
        )}
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
      <motion.div
        className="mt-4 flex flex-col gap-2 max-md:w-full md:mt-5 md:flex-row md:flex-wrap"
        variants={leadCardItem}
      >
        <a
          href={lead.url}
          target="_blank"
          rel="noopener noreferrer"
          className={`inline-flex min-h-[48px] w-full items-center justify-center rounded-xl bg-[#4338ca] px-5 text-[15px] font-semibold text-white shadow-md ring-1 ring-black/5 transition-colors hover:bg-[#3730a3] md:h-11 md:min-h-0 md:w-auto md:min-w-[10.5rem] md:bg-[#635bff] md:text-[14px] md:hover:bg-[#5851ea] ${pressable}`}
        >
          Open thread
        </a>
        {draft ? (
          <button
            type="button"
            onClick={onCopy}
            className={`inline-flex min-h-[48px] w-full items-center justify-center rounded-xl border border-slate-200 bg-white px-5 text-[14px] font-semibold text-slate-800 shadow-sm transition-colors hover:bg-slate-50 md:h-11 md:min-h-0 md:w-auto md:min-w-[10.5rem] ${pressable}`}
          >
            {copied ? "Copied" : "Copy message to send"}
          </button>
        ) : null}
      </motion.div>
      {draft ? (
        <motion.p
          className="mt-3 line-clamp-4 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-[13px] leading-relaxed text-slate-800 md:mt-4 md:line-clamp-none md:py-3 md:text-[14px]"
          variants={leadCardItem}
        >
          {draft}
        </motion.p>
      ) : (
        <motion.p
          className="mt-3 text-[12px] text-slate-500 md:mt-4 md:text-[13px]"
          variants={leadCardItem}
        >
          No draft this time — open the thread and say hi in your own words.
        </motion.p>
      )}
    </motion.div>
  );
}

function PersonalizedLandingCard({
  card,
  copiedMessage,
  copiedFollowUp,
  onCopyMessage,
  onCopyFollowUp,
}: {
  card: PersonalizedFallbackCard;
  copiedMessage: boolean;
  copiedFollowUp: boolean;
  onCopyMessage: () => void;
  onCopyFollowUp: () => void;
}) {
  const reduceMotion = useReducedMotion();
  return (
    <motion.div
      className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-xl shadow-slate-900/10 sm:p-5 md:p-6"
      initial={reduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={
        reduceMotion ? { duration: 0 } : { duration: 0.3, ease: easePremium, delay: 0.08 }
      }
    >
      <h3 className="text-base font-semibold tracking-tight text-slate-900 sm:text-lg md:text-xl">
        A few concrete places to start this week
      </h3>
      <p className="mt-1.5 line-clamp-2 text-[13px] leading-snug text-slate-600 md:mt-2 md:line-clamp-none md:text-[14px] md:leading-relaxed">
        Starting points from your problem — not live thread matches.
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
      <a
        href={linkedInPeopleSearchUrl(card.linkedInSearch)}
        target="_blank"
        rel="noopener noreferrer"
        className={`mt-2 inline-flex min-h-[48px] w-full items-center justify-center rounded-full bg-[#4338ca] px-5 text-[15px] font-semibold text-white shadow-md ring-1 ring-black/10 transition-colors hover:bg-[#3730a3] md:h-11 md:min-h-0 md:w-auto md:min-w-[12rem] md:bg-[#635bff] md:text-[14px] md:hover:bg-[#5851ea] ${pressable}`}
      >
        Open LinkedIn search
      </a>
      <p className="mt-1 line-clamp-1 text-[11px] text-slate-500 md:line-clamp-none md:text-[12px]">
        People search · paste:{" "}
        <span className="font-mono text-slate-700">{card.linkedInSearch}</span>
      </p>
      <p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500 md:mt-6">
        Message
      </p>
      <p className="mt-1.5 line-clamp-4 whitespace-pre-wrap rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-left text-[13px] leading-relaxed text-slate-800 md:mt-2 md:line-clamp-none md:py-3 md:text-[14px]">
        {card.message}
      </p>
      <div className="mt-3 flex flex-col gap-2 md:mt-4 md:flex-row md:flex-wrap">
        <button
          type="button"
          onClick={onCopyMessage}
          className={`inline-flex min-h-[48px] w-full items-center justify-center rounded-full border border-slate-200 bg-white px-5 text-[14px] font-semibold text-slate-800 shadow-sm transition-colors hover:bg-slate-50 md:h-11 md:min-h-0 md:w-auto md:min-w-[10.5rem] ${pressable}`}
        >
          {copiedMessage ? "Copied" : "Copy message to send"}
        </button>
      </div>
      <p className="mt-5 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500 md:mt-8">
        Follow-up
      </p>
      <p className="mt-1.5 line-clamp-3 whitespace-pre-wrap rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-left text-[13px] leading-relaxed text-slate-800 md:mt-2 md:line-clamp-none md:py-3 md:text-[14px]">
        {card.followUp}
      </p>
      <div className="mt-3 md:mt-4">
        <button
          type="button"
          onClick={onCopyFollowUp}
          className={`inline-flex min-h-[48px] w-full items-center justify-center rounded-full border border-slate-200 bg-white px-5 text-[14px] font-semibold text-slate-800 shadow-sm transition-colors hover:bg-slate-50 md:h-11 md:min-h-0 md:w-auto md:min-w-[10.5rem] ${pressable}`}
        >
          {copiedFollowUp ? "Copied" : "Copy follow-up"}
        </button>
      </div>
    </motion.div>
  );
}

function UnlockTeaseSkeletons({ reduceMotion }: { reduceMotion: boolean }) {
  return (
    <div
      className={`w-full space-y-2 max-md:space-y-2 md:space-y-3 ${reduceMotion ? "opacity-75" : "opacity-[0.78] saturate-[0.95]"}`}
      aria-hidden
    >
      {[0, 1].map((i) => (
        <div
          key={i}
          className={`w-full rounded-xl border border-slate-200/80 bg-gradient-to-b from-slate-50 to-slate-100/90 px-3 py-3 shadow-sm max-md:rounded-lg md:rounded-2xl md:px-5 md:py-6 ${
            reduceMotion ? "" : "blur-[3px] motion-safe:transition-[filter,opacity] motion-safe:duration-500"
          }`}
        >
          <div className="h-2.5 max-w-[10rem] rounded-full bg-slate-200/95" />
          <div className="mt-3.5 h-2 w-full rounded-full bg-slate-200/70" />
          <div className="mt-2 h-2 w-[92%] rounded-full bg-slate-200/55" />
          <div className="mt-2 h-2 w-[68%] rounded-full bg-slate-200/45" />
        </div>
      ))}
    </div>
  );
}

/** Inline unlock moment: value first, then tease + full-width card — no modals or overlapping overlays. */
function UnlockMoreMoment({
  previewConsumed,
  dismissed,
  onDismiss,
  reduceMotion,
  children,
}: {
  previewConsumed: boolean;
  dismissed: boolean;
  onDismiss: () => void;
  reduceMotion: boolean;
  children: ReactNode;
}) {
  const showUnlock = previewConsumed && !dismissed;

  return (
    <div className="w-full min-w-0 space-y-0">
      <div className="w-full min-w-0">{children}</div>
      {showUnlock ? (
        <div className="mt-4 w-full min-w-0 space-y-3 sm:mt-8 md:space-y-4">
          <p className="text-center text-[13px] font-semibold text-slate-600 md:hidden">
            More people found — not shown here
          </p>
          <p className="hidden text-center text-[12px] font-medium tracking-wide text-slate-500 sm:text-left sm:text-[13px] md:block">
            More conversations being found…
          </p>
          <UnlockTeaseSkeletons reduceMotion={reduceMotion} />
          {/* Mobile: one line + CTA only */}
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: reduceMotion ? 0 : 0.45,
              ease: easePremium,
              delay: reduceMotion ? 0 : 0.14,
            }}
            className="w-full min-w-0 pt-0 md:hidden"
          >
            <Link
              href="/#join"
              aria-label="Get more people like this — continue to signup"
              onClick={scrollToJoinSection}
              className={`flex min-h-[52px] w-full items-center justify-center rounded-full bg-[#4338ca] px-4 text-[15px] font-semibold text-white shadow-[0_14px_36px_-18px_rgba(67,56,202,0.55)] ring-1 ring-black/10 transition-colors duration-200 hover:bg-[#3730a3] ${pressable}`}
            >
              Get more people like this →
            </Link>
            <button
              type="button"
              onClick={onDismiss}
              className="mt-3 w-full min-w-0 text-center text-[12px] font-medium text-slate-500 underline-offset-4 transition-colors hover:text-slate-700 hover:underline"
            >
              Continue with this result
            </button>
          </motion.div>
          {/* Desktop: full unlock card */}
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: reduceMotion ? 0 : 0.45,
              ease: easePremium,
              delay: reduceMotion ? 0 : 0.14,
            }}
            className="hidden w-full min-w-0 pt-1 md:block"
          >
            <div className="w-full rounded-2xl bg-slate-100/90 px-6 py-8 shadow-[0_22px_56px_-32px_rgba(15,23,42,0.22)] ring-1 ring-slate-900/[0.04] sm:px-8 sm:py-9">
              <h3 className="text-[17px] font-semibold leading-snug tracking-tight text-slate-900 sm:text-lg">
                Always something to act on
              </h3>
              <p className="mt-4 max-w-prose text-[15px] font-semibold leading-snug tracking-tight text-slate-800 sm:text-[16px]">
                Real conversations when they exist.
                <br />
                People to reach when they don&apos;t.
              </p>
              <p className="mt-5 text-[13px] leading-relaxed text-slate-500 sm:text-[14px]">
                We check for demand daily — so you never get stuck waiting.
              </p>
              <Link
                href="/#join"
                aria-label="Get people to reach — continue to signup"
                onClick={scrollToJoinSection}
                className={`mt-8 inline-flex h-11 w-full min-w-0 items-center justify-center rounded-full bg-[#635bff] px-5 text-[13px] font-medium tracking-tight text-white shadow-[0_12px_32px_-16px_rgba(99,91,255,0.35)] transition-colors duration-200 hover:bg-[#5851ea] ${pressable}`}
              >
                Get people to reach →
              </Link>
              <button
                type="button"
                onClick={onDismiss}
                className="mt-4 w-full min-w-0 text-center text-[12px] font-medium text-slate-500 underline-offset-4 transition-colors hover:text-slate-700 hover:underline sm:text-[13px]"
              >
                Continue with this result
              </button>
              <p className="mt-6 text-center text-[11px] leading-relaxed text-slate-500 sm:text-[12px]">
                No spam • Nothing is sent automatically • You stay in control
              </p>
            </div>
          </motion.div>
        </div>
      ) : null}
    </div>
  );
}

export function HeroDemandPreview() {
  const [problem, setProblem] = useState("");
  const [heroInputFocused, setHeroInputFocused] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [blocker, setBlocker] = useState<BlockerPayload | null>(null);
  const [resultHint, setResultHint] = useState<string | null>(null);
  const [hasResult, setHasResult] = useState(false);
  const [redditLeads, setRedditLeads] = useState<DemandLead[]>([]);
  const [replyDraftById, setReplyDraftById] = useState<Record<string, string>>({});
  const [personalizedFallback, setPersonalizedFallback] =
    useState<PersonalizedFallbackCard | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  /** After first successful preview — drives soft “more results” unlock moment. */
  const [previewConsumed, setPreviewConsumed] = useState(false);
  const [unlockMomentDismissed, setUnlockMomentDismissed] = useState(false);
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
    const noLead = hasResult && redditLeads.length === 0 && personalizedFallback;
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
  }, [hasResult, redditLeads.length, personalizedFallback, reduceMotion]);

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
      setPreviewConsumed(false);
      setUnlockMomentDismissed(false);

      try {
        const res = await fetch("/api/demand/landing-preview", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ rawInput: trimmed }),
        });
        const data = (await res.json()) as Record<string, unknown>;

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

        if (leads.length === 0 && !fb) {
          setError("We could not build a tailored preview from that input. Try rephrasing.");
          return;
        }

        if (productCategory && confidence >= 0.55) {
          setResultHint(
            `Showing results for ${productCategory} — refine if this is not quite right.`,
          );
        } else {
          setResultHint(null);
        }

        setRedditLeads(leads.slice(0, 1));
        setReplyDraftById(drafts);
        setPersonalizedFallback(fb);
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

  const copyText = async (key: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(key);
      window.setTimeout(() => setCopied((c) => (c === key ? null : c)), 2000);
    } catch {
      setCopied(null);
    }
  };

  return (
    <>
      <div
        className={cn(
          "w-full min-w-0 max-w-2xl",
          hasResult && !loading && "max-md:pb-[5.5rem]",
        )}
      >
      <form onSubmit={onShowPeople} className="w-full text-left">
        <label htmlFor="hero-problem" className="sr-only">
          Describe the problem you solve
        </label>
        <div className={inputShell}>
          <AnimatedHeroPlaceholder
            active={
              !problem.trim() &&
              !heroInputFocused &&
              !loading &&
              !reduceMotion
            }
          />
          <textarea
            ref={inputRef}
            id="hero-problem"
            rows={3}
            value={problem}
            onChange={(e) => setProblem(e.target.value)}
            onFocus={() => setHeroInputFocused(true)}
            onBlur={() => setHeroInputFocused(false)}
            disabled={loading}
            placeholder={
              reduceMotion
                ? "Who it’s for, what breaks today, and what you’re trying instead…"
                : " "
            }
            className="relative z-[1] min-h-[102px] w-full resize-y rounded-3xl border-0 bg-transparent px-4 pb-[3.85rem] pr-4 pt-3.5 text-[15px] leading-snug text-[#0f172a] placeholder:text-[#64748b] outline-none ring-0 transition-[opacity] duration-200 focus:ring-0 disabled:opacity-60 max-md:leading-snug md:min-h-[150px] md:px-5 md:pb-[4.75rem] md:pr-52 md:pt-5 md:leading-relaxed"
          />
          <div className="pointer-events-none absolute bottom-2.5 left-3 right-3 z-[2] flex flex-col gap-2 md:bottom-3.5 md:left-5 md:right-5 md:flex-row md:justify-end">
            <button
              type="submit"
              disabled={loading || !problem.trim()}
              aria-label={loading ? "Working on preview" : "Find conversations"}
              className={`pointer-events-auto inline-flex min-h-[48px] w-full shrink-0 items-center justify-center gap-2 rounded-full bg-[#4338ca] px-4 text-[15px] font-semibold tracking-tight text-white shadow-lg shadow-[#4338ca]/35 ring-1 ring-black/10 transition-colors duration-200 hover:bg-[#3730a3] disabled:cursor-not-allowed disabled:opacity-55 md:h-12 md:min-h-12 md:w-auto md:bg-[#635bff] md:px-5 md:text-[14px] md:shadow-[#635bff]/30 md:ring-0 md:hover:bg-[#5851ea] ${pressable} ${pressableDisabled}`}
            >
              {loading ? (
                <>
                  <span
                    className="block h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white"
                    aria-hidden
                  />
                  <span>Working…</span>
                </>
              ) : (
                <>Find conversations →</>
              )}
            </button>
          </div>
        </div>

        <div className="mt-2 min-h-[1.25rem] text-center max-md:min-h-0 md:mt-3 md:min-h-[1.5rem] md:text-left">
          <AnimatePresence mode="wait">
            {loading ? (
              <motion.p
                key={reduceMotion ? "loading-static" : `loading-${loadingStep}`}
                initial={reduceMotion ? false : { opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduceMotion ? undefined : { opacity: 0, y: -3 }}
                transition={{ duration: 0.22, ease: easePremium }}
                className="text-[13px] font-medium leading-snug text-[#64748b]"
              >
                {reduceMotion
                  ? "Working on your preview…"
                  : loadingStep === 0
                    ? "Scanning real conversations…"
                    : loadingStep === 1
                      ? "Checking Reddit and sources…"
                      : "Matching demand signals…"}
              </motion.p>
            ) : null}
          </AnimatePresence>
        </div>
      </form>

      <div
        ref={resultsRef}
        id="landing-demand-results"
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

        {hasResult && redditLeads[0]
          ? (() => {
              const lead = redditLeads[0];
              if (!lead) return null;
              const draft = replyDraftById[lead.id] ?? "";
              const copyKey = `reply-${lead.id}`;
              return (
                <UnlockMoreMoment
                  previewConsumed={previewConsumed}
                  dismissed={unlockMomentDismissed}
                  onDismiss={() => setUnlockMomentDismissed(true)}
                  reduceMotion={!!reduceMotion}
                >
                  <LeadMatchCard
                    lead={lead}
                    draft={draft}
                    copied={copied === copyKey}
                    reduceMotion={!!reduceMotion}
                    onCopy={() => void copyText(copyKey, draft)}
                  />
                </UnlockMoreMoment>
              );
            })()
          : null}

        {hasResult && personalizedFallback && redditLeads.length === 0 ? (
          <div className="mt-5 text-left max-md:mt-4 md:mt-8">
            {noConversationsPhase === "message" ? (
              <motion.div
                key="no-conv-message"
                className="rounded-2xl border border-slate-200/90 bg-white px-4 py-6 text-center shadow-lg max-md:rounded-xl sm:px-8 md:py-10"
                initial={reduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: reduceMotion ? 0 : 0.3, ease: easePremium }}
              >
                <p className="text-[17px] font-semibold leading-snug tracking-tight text-slate-900 sm:text-lg">
                  No strong public conversations found
                </p>
                <p className="mx-auto mt-2 line-clamp-3 max-w-md text-[13px] leading-snug text-slate-600 max-md:text-[13px] md:line-clamp-none md:text-[14px] md:leading-relaxed">
                  But people are still dealing with this. Here are high-likelihood matches based on
                  similar patterns.
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
                <div className="rounded-2xl border border-slate-200/90 bg-white px-4 py-4 shadow-lg max-md:rounded-xl sm:px-6 md:py-5">
                  <h3 className="text-[16px] font-semibold leading-snug tracking-tight text-slate-900 sm:text-lg md:text-[17px]">
                    No strong public conversations found
                  </h3>
                  <p className="mt-1.5 line-clamp-3 text-[13px] leading-snug text-slate-600 md:mt-2 md:line-clamp-none md:text-[14px] md:leading-relaxed">
                    But people are still dealing with this. Here are high-likelihood matches based on
                    similar patterns.
                  </p>
                </div>
                <UnlockMoreMoment
                  previewConsumed={previewConsumed}
                  dismissed={unlockMomentDismissed}
                  onDismiss={() => setUnlockMomentDismissed(true)}
                  reduceMotion={!!reduceMotion}
                >
                  <PersonalizedLandingCard
                    card={personalizedFallback}
                    copiedMessage={copied === "msg"}
                    copiedFollowUp={copied === "follow"}
                    onCopyMessage={() => void copyText("msg", personalizedFallback.message)}
                    onCopyFollowUp={() => void copyText("follow", personalizedFallback.followUp)}
                  />
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
            "fixed inset-x-0 bottom-0 z-[60] hidden border-t border-slate-200/90 bg-white/95 px-3 pb-[max(0.65rem,env(safe-area-inset-bottom))] pt-2 shadow-[0_-10px_40px_-12px_rgba(15,23,42,0.18)] backdrop-blur-md transition-[transform,opacity] duration-300 ease-out max-md:block md:hidden",
            mobileStickyJoinVisible
              ? "translate-y-0 opacity-100"
              : "pointer-events-none translate-y-[110%] opacity-0",
          )}
        >
          <Link
            href="/#join"
            aria-label="Get more people like this — go to signup"
            onClick={scrollToJoinSection}
            className={`flex min-h-[52px] w-full items-center justify-center rounded-full bg-[#4338ca] px-4 text-[15px] font-semibold text-white shadow-[0_12px_32px_-14px_rgba(67,56,202,0.55)] ring-1 ring-black/10 transition-colors hover:bg-[#3730a3] ${pressable}`}
          >
            Get more people like this →
          </Link>
        </div>
      ) : null}
    </>
  );
}
