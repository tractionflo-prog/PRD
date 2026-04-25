"use client";

import { cn } from "@/lib/cn";
import { ScrollCta } from "@/components/landing/ScrollCta";
import type {
  DemandFetchResponse,
  DemandLead,
  DemandParsedIntent,
  DemandQueryResponse,
} from "@/lib/demand/types";
import { formatDemandSignalLabel, signalBandForIntentScore } from "@/lib/demand/intent-score";
import type { ConversationStarterRow } from "@/lib/demand/conversation-starters-service";
import { isGenericProductInput } from "@/lib/demand/generic-input";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

/** Stat label + “Best match” badge only at or above this score. */
const BEST_MATCH_MIN = 75;
const HIGH_INTENT_MIN = 75;

function isDemandParsedIntent(v: unknown): v is DemandParsedIntent {
  if (!v || typeof v !== "object") return false;
  const o = v as Record<string, unknown>;
  return (
    typeof o.audience === "string" &&
    typeof o.pain === "string" &&
    typeof o.context === "string"
  );
}

const RATE_LIMIT_DEFAULT = "Too many requests. Please try again later.";
const TEMP_FAILURE_DEFAULT =
  "We couldn't fetch full results right now. Please try again shortly.";

function demandApiFailureMessage(
  res: Response,
  json: Record<string, unknown>,
  fallback: string,
): string {
  if (res.status === 429) {
    const err = json.error;
    return typeof err === "string" && err.trim() ? err : RATE_LIMIT_DEFAULT;
  }
  if (json.errorType === "temporary_failure") {
    const msg = json.message;
    return typeof msg === "string" && msg.trim() ? msg : TEMP_FAILURE_DEFAULT;
  }
  const plain = json.error;
  if (typeof plain === "string" && plain.trim()) return plain;
  return fallback;
}

function linkedInPeopleSearchUrl(keywords: string): string {
  const params = new URLSearchParams({
    keywords: keywords.trim().slice(0, 200),
  });
  return `https://www.linkedin.com/search/results/people/?${params.toString()}`;
}

function formatCreated(utc: number | null): string {
  if (utc == null || !Number.isFinite(utc)) return "—";
  try {
    return new Intl.DateTimeFormat(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(new Date(utc * 1000));
  } catch {
    return "—";
  }
}

const SEC_48H = 48 * 3600;

/** Relative "Posted … ago" for the live status line (UI only). */
function formatPostedAgo(ageSec: number): string {
  const s = Math.max(0, ageSec);
  const mins = Math.floor(s / 60);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} minute${mins === 1 ? "" : "s"} ago`;
  const hrs = Math.floor(s / 3600);
  if (hrs < 24) return `${hrs} hour${hrs === 1 ? "" : "s"} ago`;
  const days = Math.floor(s / 86400);
  return `${days} day${days === 1 ? "" : "s"} ago`;
}

function leadLiveStatusLine(createdUtc: number | null): {
  text: string;
  className: string;
} {
  if (createdUtc == null || !Number.isFinite(createdUtc)) {
    return {
      text: "🟡 Recent · Posted date unknown",
      className: "text-amber-800/90",
    };
  }
  const ageSec = Date.now() / 1000 - createdUtc;
  if (ageSec <= SEC_48H) {
    return {
      text: `🟢 Active now · Posted ${formatPostedAgo(ageSec)}`,
      className: "text-emerald-800/90",
    };
  }
  const days = Math.max(2, Math.floor(ageSec / 86400));
  return {
    text: `🟡 Recent · Posted ${days} days ago`,
    className: "text-amber-800/90",
  };
}

function InsightIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <path
        d="M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M12 3v2M12 19v2M3 12h2M19 12h2"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.35"
      />
    </svg>
  );
}

function StatCard({
  label,
  value,
  sub,
}: {
  label: string;
  value: string | number;
  sub?: string;
}) {
  return (
    <div className="group rounded-2xl border border-slate-200/90 bg-slate-50/90 px-4 py-4 shadow-sm transition-[border-color,box-shadow] duration-200 hover:border-slate-300 hover:shadow-md">
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
        {label}
      </p>
      <p className="mt-2 text-2xl font-semibold tabular-nums tracking-tight text-slate-900">
        {value}
      </p>
      {sub ? (
        <p className="mt-1 text-[11px] leading-snug text-slate-500">{sub}</p>
      ) : null}
    </div>
  );
}

function SectionShell({
  id,
  eyebrow,
  title,
  description,
  children,
  className,
}: {
  id?: string;
  eyebrow: string;
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      id={id}
      className={cn(
        "rounded-[1.75rem] border border-slate-200/90 bg-white p-5 shadow-sm transition-shadow duration-300 max-md:rounded-[1.35rem] sm:p-6 md:p-8",
        className,
      )}
    >
      <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-indigo-600/90 max-md:tracking-[0.14em] md:text-[11px]">
        {eyebrow}
      </p>
      <h2 className="mt-1.5 text-base font-semibold tracking-tight text-slate-900 sm:text-lg md:mt-2 md:text-xl">
        {title}
      </h2>
      {description ? (
        <p className="mt-1.5 line-clamp-4 max-w-2xl text-[13px] leading-snug text-slate-600 max-md:mt-1.5 md:mt-2 md:line-clamp-none md:text-[14px] md:leading-relaxed">
          {description}
        </p>
      ) : null}
      <div className="mt-5 md:mt-8">{children}</div>
    </section>
  );
}

function LeadCard({
  lead,
  showBestMatch,
  copiedId,
  onReplyChange,
  onCopy,
}: {
  lead: DemandLead;
  showBestMatch: boolean;
  copiedId: string | null;
  onReplyChange: (id: string, text: string) => void;
  onCopy: (id: string, text: string) => void;
}) {
  const live = leadLiveStatusLine(lead.createdUtc);
  const isProblemTier = lead.leadType === "problem";
  const signalBand = lead.signalBand ?? signalBandForIntentScore(lead.intentScore);
  return (
    <article
      className={cn(
        "relative overflow-hidden rounded-[1.5rem] border bg-white p-4 transition-[box-shadow,border-color] duration-200 max-md:rounded-[1.25rem] sm:p-5 md:p-6",
        showBestMatch
          ? "border-indigo-300 shadow-md ring-1 ring-indigo-100"
          : isProblemTier
            ? "border-slate-200/90 bg-slate-50/40 shadow-sm hover:border-slate-300 hover:shadow-md"
            : "border-slate-200/90 shadow-sm hover:border-slate-300 hover:shadow-md",
      )}
    >
      {showBestMatch ? (
        <div className="absolute right-0 top-0 rounded-bl-xl border-b border-l border-emerald-200 bg-emerald-50 px-3 py-1.5 text-[11px] font-bold tracking-wide text-emerald-900">
          <span aria-hidden>🟢</span> Best match
        </div>
      ) : null}
      {showBestMatch ? (
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-indigo-200 to-transparent"
          aria-hidden
        />
      ) : null}

      <div className="flex flex-wrap items-center gap-2 pr-16 sm:pr-28">
        <span className="rounded-full bg-orange-50 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-orange-800 ring-1 ring-orange-100">
          Reddit
        </span>
        <span
          className={cn(
            "rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ring-1",
            isProblemTier
              ? "border-slate-200 bg-white text-slate-600 ring-slate-200"
              : "border-emerald-200 bg-emerald-50/90 text-emerald-900 ring-emerald-100",
          )}
        >
          {isProblemTier ? "Problem" : "High intent"}
        </span>
        <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-0.5 text-[11px] font-medium text-slate-700">
          r/{lead.subreddit}
        </span>
        <span className="text-[11px] text-slate-500">u/{lead.author}</span>
        <span className="ml-auto inline-flex flex-wrap items-center justify-end gap-1.5">
          <span className="inline-flex items-center gap-1 rounded-full border border-violet-200 bg-violet-50/90 px-2.5 py-0.5 text-[10px] font-semibold text-violet-900">
            {formatDemandSignalLabel(signalBand)}
          </span>
          <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-[11px] font-semibold tabular-nums text-emerald-900">
            Intent <span className="text-emerald-950">{lead.intentScore}</span>
          </span>
        </span>
      </div>

      <h3 className="mt-3 line-clamp-3 text-[16px] font-semibold leading-snug tracking-tight text-slate-900 sm:text-[17px] md:mt-4 md:line-clamp-none md:text-[18px]">
        {lead.title}
      </h3>
      <p className={cn("mt-1 text-[11px] font-medium leading-snug max-md:line-clamp-1 md:mt-1.5 md:line-clamp-none md:text-[12px]", live.className)}>
        {live.text}
      </p>
      <p className="mt-1.5 line-clamp-3 text-[13px] leading-snug text-slate-600 max-md:font-medium md:mt-2 md:line-clamp-4 md:text-[14px] md:leading-relaxed">
        {lead.snippet}
      </p>
      <p className="mt-2 text-[12px] text-slate-500">
        {formatCreated(lead.createdUtc)}
        <span className="mx-1.5 text-slate-400">·</span>
        {lead.numComments} comments
      </p>
      {lead.numComments > 5 ? (
        <p className="mt-2 text-[12px] font-medium leading-snug text-slate-700">
          <span aria-hidden>💬</span> People are actively discussing this
        </p>
      ) : null}

      {lead.intentScore >= 48 && lead.whyMatch.trim() ? (
        <div className="relative mt-4 overflow-hidden rounded-xl border border-indigo-100 bg-indigo-50/80 p-3 max-md:rounded-lg sm:p-4 md:mt-5 md:rounded-2xl md:p-5">
          <div className="flex gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-indigo-600 ring-1 ring-indigo-100">
              <InsightIcon className="h-[18px] w-[18px]" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-indigo-800">
                Why this is a good lead
              </p>
              <ul className="mt-2 list-none space-y-2 pl-0 max-md:space-y-1.5 md:mt-3 md:space-y-2.5">
                {lead.whyMatch
                  .split("\n")
                  .map((line) => line.trim())
                  .filter(Boolean)
                  .map((line, idx) => (
                    <li
                      key={idx}
                      className="flex gap-2 text-[13px] leading-snug text-slate-800 max-md:line-clamp-2 md:gap-3 md:text-[14px] md:leading-relaxed md:line-clamp-none"
                    >
                      <span
                        className="mt-0.5 shrink-0 font-semibold text-indigo-600"
                        aria-hidden
                      >
                        •
                      </span>
                      <span>{line.replace(/^[•\u2022]\s*/, "")}</span>
                    </li>
                  ))}
              </ul>
            </div>
          </div>
        </div>
      ) : null}

      <div className="mt-4 md:mt-5">
        <label className="block">
          <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-500 max-md:tracking-[0.08em] md:text-[11px]">
            Your reply <span className="font-normal normal-case text-slate-500">— editable</span>
          </span>
          <textarea
            value={lead.replyDraft}
            onChange={(e) => onReplyChange(lead.id, e.target.value)}
            rows={3}
            placeholder="Use “Draft my replies” above, then make it sound like you — you post it yourself on Reddit."
            className="mt-1.5 w-full resize-y rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-[13px] leading-snug text-slate-900 placeholder:text-slate-400 outline-none ring-0 transition-[border-color,box-shadow] duration-200 focus:border-indigo-400 focus:shadow-[0_0_0_3px_rgba(99,102,241,0.15)] max-md:min-h-[5.5rem] md:mt-2 md:px-3.5 md:py-3 md:text-[14px] md:leading-relaxed md:min-h-0"
          />
          <p className="mt-2 line-clamp-2 text-[12px] leading-snug text-slate-600 max-md:hidden md:mt-2.5 md:line-clamp-none md:text-[13px]">
            <span aria-hidden>💡</span> Post this reply to start a conversation — don’t
            pitch, just help.
          </p>
        </label>
      </div>

      <div className="mt-4 flex flex-col gap-2 max-md:w-full md:mt-6 md:flex-row md:flex-wrap md:gap-3">
        <button
          type="button"
          onClick={() => onCopy(lead.id, lead.replyDraft)}
          className={cn(
            "inline-flex min-h-[48px] w-full items-center justify-center rounded-full px-5 text-[15px] font-semibold transition-all duration-200 md:h-10 md:min-h-0 md:w-auto md:min-w-[8.5rem] md:text-[14px]",
            copiedId === lead.id
              ? "border border-emerald-300 bg-emerald-50 text-emerald-900"
              : "bg-[#4338ca] text-white shadow-md ring-1 ring-black/10 hover:bg-[#3730a3] md:bg-indigo-600 md:shadow-sm md:ring-0 md:hover:bg-indigo-500",
          )}
        >
          {copiedId === lead.id ? "Copied" : "Copy reply"}
        </button>
        <a
          href={lead.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-[48px] w-full items-center justify-center rounded-full border border-slate-200 bg-white px-5 text-[14px] font-semibold text-slate-800 transition-colors duration-200 hover:border-slate-300 hover:bg-slate-50 md:h-10 md:min-h-0 md:w-auto"
        >
          Open post
        </a>
      </div>
    </article>
  );
}

const LOCKED_PIPELINE_ROWS = [
  "🔒 6 potential matches found",
  "🔒 3 conversations under review",
  "🔒 2 high-intent leads incoming",
  "🔒 Latest threads syncing…",
  "🔒 Quality bar applied to new posts",
];

/** Pipeline + locked preview (no real post data — UI only). */
function OpportunityPipelineTeaser() {
  return (
    <div className="mt-6 rounded-2xl border border-indigo-100 bg-gradient-to-b from-indigo-50/90 to-white p-4 shadow-sm max-md:mt-5 max-md:rounded-xl sm:p-5 md:mt-10 md:p-6">
      <h3 className="text-[11px] font-bold uppercase tracking-[0.16em] text-indigo-800 max-md:tracking-[0.12em] md:text-[12px]">
        More opportunities being found
      </h3>
      <ul className="mt-3 list-none space-y-2 p-0 text-[12px] leading-snug text-slate-800 max-md:space-y-1.5 md:mt-4 md:space-y-2.5 md:text-[13px]">
        <li className="flex items-start gap-2.5">
          <span aria-hidden>🔄</span>
          <span>Scanning new conversations…</span>
        </li>
        <li className="flex items-start gap-2.5">
          <span aria-hidden>🧠</span>
          <span>Identifying high-intent posts…</span>
        </li>
        <li className="flex items-start gap-2.5">
          <span aria-hidden>⏳</span>
          <span>New matches expected soon</span>
        </li>
      </ul>

      <div className="relative mt-4 space-y-1.5 rounded-xl border border-slate-200/90 bg-slate-100/40 p-2.5 max-md:mt-3 md:mt-6 md:space-y-2 md:p-3">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
          Preview locked
        </p>
        {LOCKED_PIPELINE_ROWS.map((line, i) => (
          <div
            key={i}
            className="select-none rounded-lg border border-dashed border-slate-300/80 bg-white/70 px-3 py-2.5 text-[13px] text-slate-500 opacity-90 blur-[1.5px]"
          >
            {line}
          </div>
        ))}
      </div>

      <p className="mt-3 line-clamp-2 text-center text-[11px] leading-snug text-slate-600 max-md:mt-2 sm:text-left md:mt-4 md:line-clamp-none md:text-[12px] md:leading-relaxed">
        We don&apos;t show everything — only conversations worth replying to
      </p>
    </div>
  );
}

const ACCESS_CTA = "Get access to all opportunities as they appear";

function OpportunitiesAccessPromo() {
  return (
    <div className="relative mt-8 overflow-hidden rounded-[1.75rem] border border-slate-200 bg-slate-50/80 p-5 text-center shadow-sm max-md:mt-6 max-md:rounded-2xl max-md:p-5 sm:p-8 md:mt-14 md:p-10">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(99,102,241,0.06),transparent_55%)]"
        aria-hidden
      />
      <h3 className="relative text-base font-semibold text-slate-900 sm:text-lg md:text-xl">
        The full stream is ahead
      </h3>
      <p className="relative mx-auto mt-2 line-clamp-3 max-w-md text-[13px] leading-snug text-slate-600 max-md:mt-2 md:mt-3 md:line-clamp-none md:text-[14px] md:leading-relaxed">
        More conversations clear the bar every day — unlock the list as new matches land.
      </p>
      <p className="relative mx-auto mt-2 hidden max-w-lg text-[13px] leading-relaxed text-slate-500 md:mt-4 md:block">
        Same strict filtering you see here — just more of it, the moment it qualifies.
      </p>
      <div className="relative mt-5 flex w-full flex-col items-stretch gap-2 md:mt-8 md:items-center md:gap-3">
        <ScrollCta
          href="/#join"
          className="min-h-[52px] w-full px-6 text-[15px] font-semibold shadow-md ring-1 ring-slate-200/80 max-md:border-0 max-md:bg-[#4338ca] max-md:text-white max-md:ring-black/10 max-md:hover:bg-[#3730a3] md:h-12 md:w-auto md:px-8"
          variant="primary"
          aria-label={ACCESS_CTA}
        >
          {ACCESS_CTA}
        </ScrollCta>
        <p className="text-center text-[11px] text-slate-500 max-md:line-clamp-2 md:text-[12px]">
          We&apos;re onboarding a small group to keep quality high.
        </p>
      </div>
    </div>
  );
}

function LoadingBlock({ label }: { label: string }) {
  return (
    <div
      className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3.5 shadow-sm"
      role="status"
      aria-live="polite"
    >
      <span className="relative flex h-2.5 w-2.5">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-indigo-400 opacity-40" />
        <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-indigo-500" />
      </span>
      <span className="text-[13px] font-medium text-slate-700">{label}</span>
    </div>
  );
}

type InputMode = "describe" | "website";

export function DemandMvpClient() {
  const [inputMode, setInputMode] = useState<InputMode>("describe");
  const [product, setProduct] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [queries, setQueries] = useState<string[]>([]);
  const [leads, setLeads] = useState<DemandLead[]>([]);
  const [loading, setLoading] = useState<null | "queries" | "leads" | "replies">(
    null,
  );
  const [error, setError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showNoLeads, setShowNoLeads] = useState(false);
  const [intentHintsForScoring, setIntentHintsForScoring] = useState("");
  const [expandedUseCases, setExpandedUseCases] = useState<string[]>([]);
  const [parsedIntent, setParsedIntent] = useState<DemandParsedIntent | null>(null);
  const [outreachRows, setOutreachRows] = useState<ConversationStarterRow[]>([]);
  const [outreachLoading, setOutreachLoading] = useState(false);
  const [outreachError, setOutreachError] = useState<string | null>(null);
  const outreachLastKeyRef = useRef<string | null>(null);

  const solutionReadyLeads = useMemo(
    () => leads.filter((l) => l.leadType === "high_intent"),
    [leads],
  );
  const problemContextLeads = useMemo(
    () => leads.filter((l) => l.leadType === "problem"),
    [leads],
  );
  const repliesDraftedCount = useMemo(
    () => leads.filter((l) => l.replyDraft.trim().length > 0).length,
    [leads],
  );

  const describeGenericBlocked = useMemo(
    () =>
      inputMode === "describe" &&
      product.trim().length > 0 &&
      isGenericProductInput(product.trim()),
    [inputMode, product],
  );

  const runQueries = useCallback(
    async (opts?: { expandGeneric?: boolean }) => {
      const canRun =
        inputMode === "describe"
          ? product.trim().length > 0
          : websiteUrl.trim().length > 0;
      if (!canRun || loading) return;
      const expand =
        inputMode === "describe" && opts?.expandGeneric === true && describeGenericBlocked;
      if (inputMode === "describe" && describeGenericBlocked && !expand) return;

      setLoading("queries");
      setError(null);
      setQueries([]);
      setLeads([]);
      setShowNoLeads(false);
      setIntentHintsForScoring("");
      setExpandedUseCases([]);
      setParsedIntent(null);
      setOutreachRows([]);
      setOutreachError(null);
      outreachLastKeyRef.current = null;
      try {
        const body =
          inputMode === "website"
            ? { website: websiteUrl.trim(), product: product.trim() }
            : {
                product: product.trim(),
                ...(expand ? { expandGeneric: true } : {}),
              };
        const res = await fetch("/api/demand/generate-queries", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        const json = (await res.json()) as DemandQueryResponse & {
          error?: string;
          code?: string;
          ok?: boolean;
          errorType?: string;
          message?: string;
        };
        if (!res.ok) {
          setError(
            demandApiFailureMessage(
              res,
              json as Record<string, unknown>,
              typeof json.error === "string" ? json.error : "Could not generate queries.",
            ),
          );
          return;
        }
        const qs = Array.isArray(json.queries)
          ? json.queries.filter(
              (q): q is string => typeof q === "string" && q.trim() !== "",
            )
          : [];
        setQueries(qs);
        if (typeof json.intentHintsForScoring === "string" && json.intentHintsForScoring.trim()) {
          setIntentHintsForScoring(json.intentHintsForScoring.trim());
        } else {
          setIntentHintsForScoring("");
        }
        if (Array.isArray(json.expandedUseCases) && json.expandedUseCases.length > 0) {
          setExpandedUseCases(
            json.expandedUseCases.filter(
              (x): x is string => typeof x === "string" && x.trim() !== "",
            ),
          );
        }
        if (isDemandParsedIntent(json.parsedIntent)) {
          setParsedIntent(json.parsedIntent);
        } else {
          setParsedIntent(null);
        }
        if (typeof json.productSummary === "string" && json.productSummary.trim()) {
          setProduct(json.productSummary.trim());
        } else if (inputMode === "website" && qs.length > 0 && !product.trim()) {
          setProduct(`Context from: ${websiteUrl.trim()}`);
        }
      } catch {
        setError("Network error while generating queries.");
      } finally {
        setLoading(null);
      }
    },
    [product, websiteUrl, inputMode, loading, describeGenericBlocked],
  );

  const runLeads = useCallback(async () => {
    const t = product.trim();
    if (!t || queries.length === 0 || loading) return;
    setLoading("leads");
    setError(null);
    setLeads([]);
    setShowNoLeads(false);
    setOutreachRows([]);
    setOutreachError(null);
    outreachLastKeyRef.current = null;
    try {
      const res = await fetch("/api/demand/fetch-leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product: t,
          queries,
          source: "reddit",
          ...(intentHintsForScoring.trim()
            ? { intentHintsForScoring: intentHintsForScoring.trim() }
            : {}),
          ...(parsedIntent ? { parsedIntent } : {}),
        }),
      });
      const json = (await res.json()) as DemandFetchResponse & {
        error?: string;
        ok?: boolean;
        errorType?: string;
        message?: string;
      };
      if (!res.ok) {
        setError(
          demandApiFailureMessage(
            res,
            json as Record<string, unknown>,
            typeof json.error === "string" ? json.error : "Could not fetch leads.",
          ),
        );
        setShowNoLeads(false);
        return;
      }
      const list = Array.isArray(json.leads) ? json.leads : [];
      setLeads(list);
      setShowNoLeads(list.length === 0);
    } catch {
      setError("Network error while fetching Reddit.");
      setShowNoLeads(false);
    } finally {
      setLoading(null);
    }
  }, [product, queries, intentHintsForScoring, parsedIntent, loading]);

  useEffect(() => {
    if (!showNoLeads || loading !== null || error || !product.trim()) return;
    const intentKey = parsedIntent
      ? `${parsedIntent.pain.slice(0, 120)}|${parsedIntent.audience.slice(0, 80)}`
      : "";
    const key = `${product.trim().slice(0, 280)}__${queries.slice(0, 8).join("||").slice(0, 400)}__${intentKey}`;
    if (outreachLastKeyRef.current === key) return;

    let cancelled = false;
    (async () => {
      setOutreachLoading(true);
      setOutreachError(null);
      try {
        const res = await fetch("/api/demand/start-without-leads", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            product: product.trim(),
            ...(intentHintsForScoring.trim()
              ? { intentHintsForScoring: intentHintsForScoring.trim() }
              : {}),
            ...(parsedIntent ? { parsedIntent } : {}),
          }),
        });
        const json = (await res.json()) as {
          rows?: unknown;
          error?: string;
          ok?: boolean;
          errorType?: string;
          message?: string;
        };
        if (!res.ok) {
          if (!cancelled) {
            setOutreachError(
              demandApiFailureMessage(
                res,
                json as Record<string, unknown>,
                typeof json.error === "string" ? json.error : "Could not load starters.",
              ),
            );
          }
          return;
        }
        const raw = Array.isArray(json.rows) ? json.rows : [];
        const rows: ConversationStarterRow[] = [];
        for (const item of raw) {
          if (!item || typeof item !== "object") continue;
          const o = item as Record<string, unknown>;
          const role = typeof o.role === "string" ? o.role.trim() : "";
          const linkedInSearch =
            typeof o.linkedInSearch === "string" ? o.linkedInSearch.trim() : "";
          const opener = typeof o.opener === "string" ? o.opener.trim() : "";
          if (!role || !linkedInSearch || !opener) continue;
          rows.push({ role, linkedInSearch, opener });
          if (rows.length >= 5) break;
        }
        if (!cancelled) {
          if (rows.length === 5) {
            setOutreachRows(rows);
            outreachLastKeyRef.current = key;
          } else {
            setOutreachError("Could not load five conversation starters.");
            setOutreachRows([]);
          }
        }
      } catch {
        if (!cancelled) setOutreachError("Network error while loading starters.");
      } finally {
        if (!cancelled) setOutreachLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [showNoLeads, loading, error, product, queries, intentHintsForScoring, parsedIntent]);

  const runReplies = useCallback(async () => {
    const t = product.trim();
    if (!t || leads.length === 0 || loading) return;
    const top = leads.slice(0, 8);
    setLoading("replies");
    setError(null);
    try {
      const res = await fetch("/api/demand/generate-replies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product: t,
          leads: top.map((l) => ({
            id: l.id,
            title: l.title,
            snippet: l.snippet,
            url: l.url,
          })),
        }),
      });
      const json = (await res.json()) as {
        replies?: { id: string; reply: string }[];
        error?: string;
        ok?: boolean;
        errorType?: string;
        message?: string;
      };
      if (!res.ok) {
        setError(
          demandApiFailureMessage(
            res,
            json as Record<string, unknown>,
            typeof json.error === "string" ? json.error : "Could not draft replies.",
          ),
        );
        return;
      }
      const map = new Map(
        (Array.isArray(json.replies) ? json.replies : []).map((r) => [r.id, r.reply]),
      );
      setLeads((prev) =>
        prev.map((l) => {
          const r = map.get(l.id);
          return r ? { ...l, replyDraft: r } : l;
        }),
      );
    } catch {
      setError("Network error while drafting replies.");
    } finally {
      setLoading(null);
    }
  }, [product, leads, loading]);

  const setReplyDraft = (id: string, text: string) => {
    setLeads((prev) =>
      prev.map((l) => (l.id === id ? { ...l, replyDraft: text } : l)),
    );
  };

  const copyReply = async (id: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      window.setTimeout(() => setCopiedId((c) => (c === id ? null : c)), 2000);
    } catch {
      setCopiedId(null);
    }
  };

  return (
    <main className="relative isolate min-h-screen overflow-x-clip bg-slate-50 pb-28 pt-10 text-slate-900 sm:pt-14">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-[320px] bg-[radial-gradient(ellipse_70%_50%_at_50%_-10%,rgba(99,102,241,0.08),transparent_60%)]"
        aria-hidden
      />

      <div className="relative z-[1] mx-auto max-w-4xl px-4 sm:px-6">
        <header className="text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-indigo-600">
            Tractionflo
          </p>
          <h1 className="mt-3 text-balance text-[1.7rem] font-semibold tracking-[-0.02em] text-slate-900 sm:text-[2.15rem]">
            Find people already looking for what you built
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-[15px] leading-relaxed text-slate-600">
            Real conversations. Real intent. You reach out manually — we never post for
            you — so every hello stays human.
          </p>
          <Link
            href="/"
            className="mt-4 inline-block text-[13px] font-medium text-indigo-600 underline-offset-4 transition-colors hover:text-indigo-800 hover:underline"
          >
            ← Back to home
          </Link>
        </header>

        <div className="mt-14 space-y-14">
          <SectionShell
            id="demand-input"
            eyebrow="Step 1"
            title="Tell us about your product"
            description={
              inputMode === "describe"
                ? "We turn your words into 8–12 Reddit searches people actually type when they’re hunting for a fix — not generic keywords."
                : "We fetch your homepage, extract what you do, then build searches in real user language — with your notes as backup if the page is thin."
            }
          >
            <div
              className="flex rounded-full border border-slate-200 bg-slate-100/90 p-1 shadow-inner"
              role="tablist"
              aria-label="Input mode"
            >
              <button
                type="button"
                role="tab"
                aria-selected={inputMode === "describe"}
                onClick={() => {
                  setInputMode("describe");
                  setQueries([]);
                  setLeads([]);
                  setShowNoLeads(false);
                  setIntentHintsForScoring("");
                  setExpandedUseCases([]);
                  setError(null);
                }}
                className={cn(
                  "min-h-[2.75rem] flex-1 rounded-full px-3 text-[13px] font-semibold transition-all duration-200",
                  inputMode === "describe"
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-600 hover:text-slate-900",
                )}
              >
                Describe product
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={inputMode === "website"}
                onClick={() => {
                  setInputMode("website");
                  setQueries([]);
                  setLeads([]);
                  setShowNoLeads(false);
                  setIntentHintsForScoring("");
                  setExpandedUseCases([]);
                  setError(null);
                }}
                className={cn(
                  "min-h-[2.75rem] flex-1 rounded-full px-3 text-[13px] font-semibold transition-all duration-200",
                  inputMode === "website"
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-600 hover:text-slate-900",
                )}
              >
                Paste website
              </button>
            </div>

            {inputMode === "describe" ? (
              <>
                <label htmlFor="demand-product" className="sr-only">
                  What you built
                </label>
                <textarea
                  id="demand-product"
                  rows={3}
                  value={product}
                  onChange={(e) => setProduct(e.target.value)}
                  disabled={Boolean(loading)}
                  placeholder="Describe the problem (e.g., missing renter calls, too many support emails)"
                  className="mt-6 w-full resize-none rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-[15px] leading-relaxed text-slate-900 placeholder:text-slate-400 outline-none transition-[border-color,box-shadow] duration-200 focus:border-indigo-400 focus:shadow-[0_0_0_3px_rgba(99,102,241,0.12)] disabled:opacity-50"
                />
                {describeGenericBlocked ? (
                  <div
                    className="mt-5 rounded-2xl border border-amber-200/90 bg-amber-50/90 px-4 py-4 sm:px-5"
                    role="status"
                  >
                    <p className="text-[13px] font-semibold text-amber-950">
                      Describe a specific use case
                    </p>
                    <p className="mt-2 text-[14px] leading-relaxed text-amber-950/90">
                      This looks like a broad category. Try describing the problem or task your
                      product solves.
                    </p>
                    <p className="mt-3 text-[12px] font-semibold text-amber-900/90">
                      Examples
                    </p>
                    <ul className="mt-1.5 list-inside list-disc space-y-1 text-[13px] leading-relaxed text-amber-950/85">
                      <li>&quot;automate customer support replies&quot;</li>
                      <li>&quot;summarize PDFs&quot;</li>
                      <li>&quot;track tenant inquiries&quot;</li>
                    </ul>
                  </div>
                ) : null}
              </>
            ) : (
              <div className="mt-6 space-y-4">
                <label htmlFor="demand-website" className="sr-only">
                  Website URL
                </label>
                <input
                  id="demand-website"
                  type="url"
                  inputMode="url"
                  autoComplete="url"
                  placeholder="https://yourproduct.com"
                  value={websiteUrl}
                  onChange={(e) => setWebsiteUrl(e.target.value)}
                  disabled={Boolean(loading)}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-[15px] leading-relaxed text-slate-900 placeholder:text-slate-400 outline-none transition-[border-color,box-shadow] duration-200 focus:border-indigo-400 focus:shadow-[0_0_0_3px_rgba(99,102,241,0.12)] disabled:opacity-50"
                />
                <div>
                  <label
                    htmlFor="demand-website-notes"
                    className="text-[12px] font-semibold text-slate-600"
                  >
                    Optional notes{" "}
                    <span className="font-normal text-slate-500">
                      — if the site is vague or we can&apos;t fetch it, we fall back to this
                    </span>
                  </label>
                  <textarea
                    id="demand-website-notes"
                    rows={2}
                    value={product}
                    onChange={(e) => setProduct(e.target.value)}
                    disabled={Boolean(loading)}
                    placeholder="e.g. B2B property managers in the UK; main job is rent reminders"
                    className="mt-2 w-full resize-y rounded-2xl border border-slate-200 bg-white px-4 py-3 text-[14px] leading-relaxed text-slate-900 placeholder:text-slate-400 outline-none transition-[border-color,box-shadow] duration-200 focus:border-indigo-400 focus:shadow-[0_0_0_3px_rgba(99,102,241,0.12)] disabled:opacity-50"
                  />
                </div>
              </div>
            )}

            <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-3">
                <button
                  type="button"
                  onClick={() => runQueries()}
                  disabled={
                    loading !== null ||
                    (inputMode === "describe" ? !product.trim() : !websiteUrl.trim()) ||
                    describeGenericBlocked
                  }
                  className={cn(
                    "inline-flex h-12 items-center justify-center rounded-full px-8 text-[14px] font-semibold transition-all duration-200",
                    loading ||
                      (inputMode === "describe" ? !product.trim() : !websiteUrl.trim()) ||
                      describeGenericBlocked
                      ? "cursor-not-allowed bg-slate-200 text-slate-500"
                      : "bg-indigo-600 text-white shadow-sm hover:bg-indigo-500 active:scale-[0.99]",
                  )}
                >
                  {loading === "queries" ? "Generating queries…" : "Generate my search queries"}
                </button>
                {describeGenericBlocked ? (
                  <button
                    type="button"
                    onClick={() => runQueries({ expandGeneric: true })}
                    disabled={loading !== null}
                    className={cn(
                      "inline-flex h-12 items-center justify-center rounded-full border px-6 text-[14px] font-semibold transition-all duration-200",
                      loading !== null
                        ? "cursor-not-allowed border-slate-200 bg-slate-100 text-slate-400"
                        : "border-amber-300 bg-white text-amber-950 hover:border-amber-400 hover:bg-amber-50/80",
                    )}
                  >
                    Continue with expanded searches
                  </button>
                ) : null}
              </div>
              {loading === "queries" ? (
                <LoadingBlock
                  label={
                    inputMode === "website"
                      ? "Reading your site and generating searches…"
                      : "Scanning conversations…"
                  }
                />
              ) : (
                <p className="text-[13px] text-slate-500">
                  {inputMode === "website"
                    ? "We pull public homepage text only — then match Reddit the same way as describe mode."
                    : "One quick AI pass · Then you choose where to look next"}
                </p>
              )}
            </div>

            {queries.length === 0 &&
            !loading &&
            (inputMode === "describe" ? product.trim() : websiteUrl.trim()) ? (
              <p className="mt-6 rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-3 text-[13px] text-slate-600">
                When you&apos;re ready, generate queries — that&apos;s the first step toward
                people you can actually talk to.
              </p>
            ) : null}

            {queries.length > 0 ? (
              <div className="mt-10 border-t border-slate-200 pt-10">
                <p className="text-[13px] font-semibold text-slate-800">Your search queries</p>
                {expandedUseCases.length > 0 ? (
                  <div className="mt-3 rounded-xl border border-indigo-100 bg-indigo-50/60 px-4 py-3 text-left">
                    <p className="text-[12px] font-semibold text-indigo-900">
                      Anchored to concrete problems (from your broad input)
                    </p>
                    <ul className="mt-2 space-y-1.5 text-[13px] leading-snug text-indigo-950/90">
                      {expandedUseCases.map((line) => (
                        <li key={line} className="flex gap-2">
                          <span className="text-indigo-400" aria-hidden>
                            ·
                          </span>
                          <span>{line}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}
                <ul className="mt-4 flex flex-wrap gap-2">
                  {queries.map((q) => (
                    <li
                      key={q}
                      className="rounded-full border border-slate-200 bg-slate-50 px-3.5 py-1.5 text-[13px] leading-snug text-slate-800 transition-colors duration-200 hover:border-indigo-200 hover:bg-indigo-50/60"
                    >
                      {q}
                    </li>
                  ))}
                </ul>
                <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <button
                    type="button"
                    onClick={runLeads}
                    disabled={loading !== null}
                    className={cn(
                      "inline-flex h-12 items-center justify-center rounded-full border px-8 text-[14px] font-semibold transition-all duration-200",
                      loading
                        ? "cursor-not-allowed border-slate-200 bg-slate-100 text-slate-400"
                        : "border-indigo-200 bg-white text-indigo-700 hover:border-indigo-300 hover:bg-indigo-50/50",
                    )}
                  >
                    {loading === "leads" ? "Searching Reddit…" : "Find people to reach"}
                  </button>
                  {loading === "leads" ? (
                    <LoadingBlock label="Filtering Reddit for conversations worth replying to…" />
                  ) : (
                    <p className="text-[13px] text-slate-500">
                      Step 2 · Live threads only — heavily filtered, not a raw search dump
                    </p>
                  )}
                </div>
              </div>
            ) : null}

            {error ? (
              <p
                className="mt-8 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3.5 text-[14px] text-amber-950"
                role="alert"
              >
                {error}
              </p>
            ) : null}
          </SectionShell>

          {showNoLeads && queries.length > 0 && !loading && !error ? (
            <section
              className="rounded-[1.75rem] border border-slate-200 bg-white p-8 shadow-sm sm:p-10"
              aria-labelledby="no-leads-heading"
            >
              <div className="text-center">
                <h2
                  id="no-leads-heading"
                  className="text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl"
                >
                  No strong public conversations found.
                </h2>
                <p className="mx-auto mt-3 max-w-lg text-[15px] leading-relaxed text-slate-600">
                  But people are still dealing with this.
                </p>
                <p className="mx-auto mt-2 max-w-lg text-[15px] font-medium leading-relaxed text-slate-800">
                  Here are high-likelihood matches.
                </p>
                <p className="mx-auto mt-6 max-w-md text-left text-[14px] leading-relaxed text-slate-600">
                  We only show threads that clearly echo your problem — so an empty list means we
                  didn&apos;t find safe matches on Reddit right now, not that nobody cares.
                </p>
              </div>

              <div
                className="mt-10 border-t border-slate-200 pt-10 text-left"
                role="region"
                aria-label="When Reddit has no strong matches"
              >
                <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                  So here&apos;s how to move forward
                </p>
                <h3
                  id="start-conversations-heading"
                  className="mt-2 text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl"
                >
                  People likely facing this problem
                </h3>
                <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-slate-600">
                  This is not Reddit — we couldn&apos;t surface live threads that cleared the bar.
                  Below are starting points from your description: plausible roles, LinkedIn
                  people-search phrases, and a short question you can send. Edit before you send;
                  there are no guarantees anyone replies.
                </p>

                {outreachLoading ? (
                  <div className="mt-6">
                    <LoadingBlock label="Drafting outreach ideas from your problem…" />
                  </div>
                ) : null}
                {outreachError ? (
                  <p
                    className="mt-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-[14px] text-amber-950"
                    role="alert"
                  >
                    {outreachError}
                  </p>
                ) : null}

                {outreachRows.length === 5 ? (
                  <ol className="mt-8 list-none space-y-6 p-0">
                    {outreachRows.map((row, i) => {
                      const liUrl = linkedInPeopleSearchUrl(row.linkedInSearch);
                      const searchCopied = copiedId === `outreach-q-${i}`;
                      const msgCopied = copiedId === `outreach-m-${i}`;
                      return (
                        <li
                          key={`outreach-${i}-${row.role.slice(0, 24)}`}
                          className="rounded-2xl border border-slate-200/90 bg-slate-50/80 p-5 sm:p-6"
                        >
                          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500">
                            Suggestion {i + 1} · Likely role
                          </p>
                          <p className="mt-2 text-[16px] font-semibold leading-snug text-slate-900">
                            {row.role}
                          </p>

                          <div className="mt-5">
                            <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-slate-500">
                              Where to find them
                            </p>
                            <p className="mt-1.5 text-[13px] leading-relaxed text-slate-600">
                              LinkedIn → Search → People → paste:
                            </p>
                            <p className="mt-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 font-mono text-[13px] leading-relaxed text-slate-800">
                              {row.linkedInSearch}
                            </p>
                            <div className="mt-3 flex flex-wrap gap-2">
                              <a
                                href={liUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex h-9 items-center justify-center rounded-full bg-[#0A66C2] px-4 text-[13px] font-semibold text-white shadow-sm transition-colors hover:bg-[#095196]"
                              >
                                Open LinkedIn search
                              </a>
                              <button
                                type="button"
                                onClick={() => copyReply(`outreach-q-${i}`, row.linkedInSearch)}
                                className="inline-flex h-9 items-center justify-center rounded-full border border-slate-200 bg-white px-4 text-[13px] font-semibold text-slate-800 transition-colors hover:border-slate-300"
                              >
                                {searchCopied ? "Copied" : "Copy keywords"}
                              </button>
                            </div>
                          </div>

                          <div className="mt-5">
                            <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-slate-500">
                              Message (question only)
                            </p>
                            <p className="mt-2 whitespace-pre-wrap rounded-xl border border-indigo-100 bg-white px-3 py-3 text-[14px] leading-relaxed text-slate-800">
                              {row.opener}
                            </p>
                            <button
                              type="button"
                              onClick={() => copyReply(`outreach-m-${i}`, row.opener)}
                              className="mt-3 inline-flex h-9 items-center justify-center rounded-full border border-indigo-200 bg-indigo-50 px-4 text-[13px] font-semibold text-indigo-900 transition-colors hover:border-indigo-300"
                            >
                              {msgCopied ? "Copied" : "Copy message"}
                            </button>
                          </div>
                        </li>
                      );
                    })}
                  </ol>
                ) : null}
              </div>
            </section>
          ) : null}

          {leads.length > 0 ? (
            <div className="space-y-10">
              <section
                className="rounded-[1.75rem] border border-slate-200/90 bg-white p-6 shadow-sm sm:p-8"
                aria-labelledby="results-heading"
              >
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-indigo-600/90">
                  Results
                </p>
                <h2
                  id="results-heading"
                  className="mt-2 max-w-2xl text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl"
                >
                  We found people already looking for what you built
                </h2>
                <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-slate-600">
                  From real Reddit conversations — filtered for intent, not volume.
                  <span className="mt-1 block">No cold outreach. No guessing.</span>
                </p>

                <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5 sm:gap-4">
                  <StatCard label="Queries generated" value={queries.length} />
                  <StatCard label="Leads found" value={leads.length} />
                  <StatCard
                    label="Ready for a solution"
                    value={solutionReadyLeads.length}
                    sub={`Score ≥ ${HIGH_INTENT_MIN}`}
                  />
                  <StatCard
                    label="Experiencing the problem"
                    value={problemContextLeads.length}
                    sub="Score 65–74"
                  />
                  <StatCard label="Replies drafted" value={repliesDraftedCount} />
                </div>
                <p className="mt-4 text-center text-[12px] font-medium tracking-tight text-slate-500 sm:text-left">
                  Updated just now
                </p>
              </section>

              <section aria-labelledby="opportunities-heading">
                <div className="flex flex-col gap-6 border-b border-slate-200 pb-8 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-indigo-600/85">
                      Step 3
                    </p>
                    <h2
                      id="opportunities-heading"
                      className="mt-2 text-xl font-semibold tracking-tight text-slate-900"
                    >
                      People you can reach right now
                    </h2>
                    <p className="mt-2 max-w-xl text-[14px] text-slate-600">
                      High-intent threads first, then people describing the pain without asking for
                      a tool yet — both can be worth a thoughtful reply. We never auto-post.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={runReplies}
                    disabled={loading !== null}
                    className={cn(
                      "h-12 shrink-0 rounded-full px-7 text-[14px] font-semibold transition-all duration-200",
                      loading
                        ? "cursor-not-allowed bg-slate-200 text-slate-500"
                        : "border border-slate-200 bg-slate-900 text-white shadow-sm hover:bg-slate-800",
                    )}
                  >
                    {loading === "replies" ? "Drafting…" : "Draft my replies (top 8)"}
                  </button>
                </div>
                {loading === "replies" ? (
                  <div className="mt-6">
                    <LoadingBlock label="Preparing replies…" />
                  </div>
                ) : null}

                {solutionReadyLeads.length > 0 ? (
                  <div className="mt-10">
                    <h3
                      id="solution-ready-heading"
                      className="text-[13px] font-bold uppercase tracking-[0.14em] text-emerald-800"
                    >
                      People ready for a solution
                    </h3>
                    <p className="mt-2 max-w-2xl text-[14px] leading-relaxed text-slate-600">
                      Asking for tools, apps, alternatives, or clear recommendations — strongest fit
                      for a helpful reply.
                    </p>
                    <ul className="mt-6 space-y-6">
                      {solutionReadyLeads.map((lead) => (
                        <li key={lead.id}>
                          <LeadCard
                            lead={lead}
                            showBestMatch={lead.intentScore >= BEST_MATCH_MIN}
                            copiedId={copiedId}
                            onReplyChange={setReplyDraft}
                            onCopy={copyReply}
                          />
                        </li>
                      ))}
                    </ul>
                    {solutionReadyLeads.length >= 2 ? (
                      <div className="mt-6">
                        <OpportunityPipelineTeaser />
                      </div>
                    ) : null}
                    {solutionReadyLeads.length > 3 ? (
                      <div className="mt-10">
                        <OpportunitiesAccessPromo />
                      </div>
                    ) : null}
                  </div>
                ) : null}

                {problemContextLeads.length > 0 ? (
                  <div
                    className={cn(solutionReadyLeads.length > 0 ? "mt-14 border-t border-slate-200 pt-12" : "mt-10")}
                  >
                    <h3
                      id="problem-context-heading"
                      className="text-[13px] font-bold uppercase tracking-[0.14em] text-slate-600"
                    >
                      People experiencing the problem
                    </h3>
                    <p className="mt-2 max-w-2xl text-[14px] leading-relaxed text-slate-600">
                      Frustration, manual workflows, or inefficiency — they may not be shopping for
                      software yet; lead with empathy, not a pitch.
                    </p>
                    <ul className="mt-6 space-y-6">
                      {problemContextLeads.map((lead) => (
                        <li key={lead.id}>
                          <LeadCard
                            lead={lead}
                            showBestMatch={false}
                            copiedId={copiedId}
                            onReplyChange={setReplyDraft}
                            onCopy={copyReply}
                          />
                        </li>
                      ))}
                    </ul>
                    {solutionReadyLeads.length === 0 && problemContextLeads.length >= 2 ? (
                      <div className="mt-6">
                        <OpportunityPipelineTeaser />
                      </div>
                    ) : null}
                    {solutionReadyLeads.length === 0 && problemContextLeads.length > 3 ? (
                      <div className="mt-10">
                        <OpportunitiesAccessPromo />
                      </div>
                    ) : null}
                  </div>
                ) : null}

                {solutionReadyLeads.length > 0 &&
                solutionReadyLeads.length <= 3 &&
                problemContextLeads.length === 0 ? (
                  <div className="mt-10">
                    <OpportunitiesAccessPromo />
                  </div>
                ) : null}
              </section>
            </div>
          ) : null}
        </div>

        <footer className="mx-auto mt-20 max-w-lg border-t border-slate-200 pt-10 text-center">
          <p className="text-[12px] leading-relaxed text-slate-600">
            <strong className="font-semibold text-slate-800">You stay in control.</strong>{" "}
            Copy your reply, open the thread, and say hi like a human — we never post on your
            behalf.
          </p>
        </footer>
      </div>
    </main>
  );
}
