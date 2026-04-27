import Image from "next/image";
import type { ReactNode } from "react";
import { Section } from "@/components/landing/Section";
import { FadeUp } from "@/components/landing/FadeUp";
import { portrait } from "@/lib/landing-portraits";

const leads = [
  { name: "Jordan K.", status: "Drafted", tone: "done" as const, src: portrait("men", 12) },
  { name: "Samira L.", status: "Drafted", tone: "done" as const, src: portrait("women", 23) },
  { name: "Marcus T.", status: "Drafted", tone: "done" as const, src: portrait("men", 32) },
  { name: "Elena V.", status: "Drafted", tone: "done" as const, src: portrait("women", 41) },
  { name: "Priya N.", status: "Drafted", tone: "done" as const, src: portrait("women", 52) },
  { name: "Tom W.", status: "Drafted", tone: "done" as const, src: portrait("men", 61) },
  { name: "Nina R.", status: "Drafted", tone: "done" as const, src: portrait("women", 68) },
  { name: "Chris P.", status: "Drafted", tone: "done" as const, src: portrait("men", 71) },
  { name: "Diego M.", status: "Ready", tone: "next" as const, src: portrait("men", 84) },
  { name: "Kate F.", status: "Ready", tone: "next" as const, src: portrait("women", 91) },
] as const;

const replies = [
  {
    name: "Elena V.",
    snippet: "Interested — can we chat Tuesday?",
    tag: "Interested",
    time: "12m ago",
    tone: "positive" as const,
    src: portrait("women", 41),
  },
  {
    name: "Tom W.",
    snippet: "Sounds useful for our ops stack.",
    tag: "Warm",
    time: "1h ago",
    tone: "warm" as const,
    src: portrait("men", 61),
  },
  {
    name: "Noah C.",
    snippet: "Not right now, thanks.",
    tag: "Pass",
    time: "2h ago",
    tone: "pass" as const,
    src: portrait("men", 88),
  },
] as const;

const drafted = leads.filter((l) => l.tone === "done").length;
const total = leads.length;
const pct = Math.round((drafted / total) * 100);

function PanelShell({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={`relative rounded-2xl border border-slate-200/50 bg-white/45 p-5 shadow-[0_10px_30px_rgba(0,0,0,0.07),0_1px_0_rgba(255,255,255,0.72)_inset] ring-1 ring-slate-900/[0.04] backdrop-blur-xl backdrop-saturate-150 sm:p-6 ${className}`}
    >
      {children}
    </div>
  );
}

export function WorkflowCard() {
  return (
    <Section className="relative overflow-hidden bg-[linear-gradient(180deg,#f7f7f5_0%,#faf9ff_50%,#f5f4fb_100%)] py-16 sm:py-20 md:py-28">
      <FadeUp className="mx-auto max-w-6xl">
        <div className="relative rounded-[1.75rem] p-[1px] shadow-[0_32px_64px_-48px_rgba(15,23,42,0.28),0_0_0_1px_rgba(255,255,255,0.8)_inset] ring-1 ring-slate-200/60">
          <article className="relative overflow-hidden rounded-[1.7rem] bg-[linear-gradient(168deg,#f3f0ff_0%,#f8f9fc_38%,#fafafa_100%)]">
            <div
              className="pointer-events-none absolute -left-32 top-0 h-72 w-72 rounded-full bg-violet-300/25 blur-3xl"
              aria-hidden
            />
            <div
              className="pointer-events-none absolute -right-24 bottom-0 h-80 w-80 rounded-full bg-indigo-200/20 blur-3xl"
              aria-hidden
            />
            <div
              className="pointer-events-none absolute left-1/2 top-24 h-48 w-[min(90%,28rem)] -translate-x-1/2 rounded-full bg-white/40 blur-2xl"
              aria-hidden
            />
            <div
              className="pointer-events-none absolute left-1/2 top-1/2 h-[min(24rem,50%)] w-[min(90%,32rem)] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(124,92,255,0.12),transparent_68%)] blur-2xl"
              aria-hidden
            />

            <div className="relative z-10 px-5 pb-6 pt-6 sm:px-7 sm:pb-8 sm:pt-7 md:px-8 md:pb-9 md:pt-8">
              {/* Top: layered header card */}
              <div className="relative">
                <div
                  className="pointer-events-none absolute inset-x-4 top-3 h-full rounded-2xl bg-slate-900/[0.02] blur-md"
                  aria-hidden
                />
                <div className="relative rounded-2xl border border-white/60 bg-white/55 px-5 py-5 shadow-[0_1px_0_rgba(255,255,255,0.9)_inset,0_18px_40px_-28px_rgba(79,70,229,0.18)] ring-1 ring-slate-900/[0.05] backdrop-blur-2xl backdrop-saturate-150 sm:px-6 sm:py-6">
                  <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                    <div className="max-w-xl space-y-2">
                      <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-slate-500">Workflow</p>
                      <h2 className="text-balance text-[clamp(1.5rem,2.5vw+1rem,1.9rem)] font-semibold tracking-[-0.03em] text-slate-900 sm:leading-[1.12]">
                        You log in.
                        <span className="block">Everything is already waiting.</span>
                      </h2>
                      <p className="text-[15px] leading-relaxed text-slate-600 sm:text-[15.5px]">
                        Your reach list, drafts, and replies are lined up — you show up and send.
                      </p>
                    </div>
                    <div className="flex shrink-0 flex-col items-start gap-2 sm:items-end">
                      <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200/70 bg-emerald-50/80 px-3.5 py-1.5 text-[12px] font-semibold text-emerald-900 shadow-sm backdrop-blur-sm transition-shadow duration-200 [@media(hover:hover)]:hover:shadow-md">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_0_3px_rgba(16,185,129,0.25)]" />
                        {drafted}/{total} drafted
                      </span>
                    </div>
                  </div>

                  <div className="mt-6 border-t border-slate-200/60 pt-5">
                    <div className="flex items-baseline justify-between gap-3">
                      <span className="text-[12px] font-medium text-slate-500">Today&apos;s run</span>
                      <span className="text-[12px] font-semibold tabular-nums tracking-tight text-slate-900">{pct}%</span>
                    </div>
                    <div className="mt-2.5 h-2 overflow-hidden rounded-full bg-slate-200/70 p-px shadow-[inset_0_1px_2px_rgba(15,23,42,0.06)] ring-1 ring-slate-900/[0.04]">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-violet-500 via-[#7C5CFF] to-indigo-500 shadow-[0_0_16px_rgba(124,92,255,0.35)] transition-[width] duration-700 ease-out"
                        style={{ width: `${pct}%` }}
                        role="progressbar"
                        aria-valuenow={drafted}
                        aria-valuemin={0}
                        aria-valuemax={total}
                        aria-label={`${drafted} of ${total} messages drafted`}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Columns: floating glass panels */}
              <div className="mt-6 grid min-w-0 gap-5 lg:mt-8 lg:grid-cols-12 lg:gap-6">
                {/* Leads */}
                <div className="lg:col-span-5">
                  <PanelShell>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">Reach list</p>
                    <p className="mt-0.5 text-[13px] font-medium text-slate-800">10 people</p>
                    <div className="mt-5 max-h-[min(52vh,21rem)] space-y-2 overflow-y-auto overscroll-contain pr-0.5 sm:max-h-[23rem]">
                      {leads.map((lead) => (
                        <div
                          key={lead.name}
                          className={`group/lead flex cursor-default items-center gap-3 rounded-xl border px-3 py-2.5 shadow-[0_10px_30px_rgba(0,0,0,0.04)] transition-[transform,box-shadow,background-color,border-color] duration-200 ease-out [@media(hover:hover)]:hover:-translate-y-1 [@media(hover:hover)]:hover:shadow-md ${
                            lead.tone === "done"
                              ? "border-slate-200/70 bg-white/55 backdrop-blur-sm [@media(hover:hover)]:hover:border-slate-300/90 [@media(hover:hover)]:hover:bg-white/85"
                              : "border-amber-200/55 bg-amber-50/35 backdrop-blur-sm ring-1 ring-amber-100/40 [@media(hover:hover)]:hover:border-amber-300/70 [@media(hover:hover)]:hover:bg-amber-50/55"
                          }`}
                        >
                          <Image
                            src={lead.src}
                            alt=""
                            width={32}
                            height={32}
                            className="h-8 w-8 shrink-0 rounded-full object-cover ring-2 ring-white shadow-[0_2px_8px_-2px_rgba(15,23,42,0.15)] transition-transform duration-200 [@media(hover:hover)]:group-hover/lead:scale-[1.04]"
                            sizes="32px"
                          />
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-[13px] font-medium tracking-[-0.01em] text-slate-900">{lead.name}</p>
                            <p className="mt-0.5 truncate text-[12px] leading-snug text-slate-500">
                              {lead.tone === "done" ? "Message drafted · ready to send" : "Who to message next"}
                            </p>
                          </div>
                          <span
                            className={`shrink-0 rounded-md px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.06em] transition-colors duration-200 ${
                              lead.tone === "done"
                                ? "bg-slate-900/[0.06] text-slate-700 ring-1 ring-slate-900/[0.06] [@media(hover:hover)]:group-hover/lead:bg-indigo-50 [@media(hover:hover)]:group-hover/lead:text-indigo-900 [@media(hover:hover)]:group-hover/lead:ring-indigo-100"
                                : "bg-amber-100/90 text-amber-950 ring-1 ring-amber-200/60"
                            }`}
                          >
                            {lead.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </PanelShell>
                </div>

                {/* Message — layered card stack */}
                <div className="lg:col-span-4">
                  <PanelShell className="flex min-h-0 flex-col">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">Message</p>
                    <p className="mt-0.5 text-[13px] font-medium text-slate-800">Preview</p>

                    <div className="relative mt-5 flex-1">
                      <div
                        className="pointer-events-none absolute inset-x-3 top-2.5 h-[calc(100%-0.5rem)] rounded-2xl border border-slate-200/40 bg-white/30 shadow-sm backdrop-blur-sm"
                        aria-hidden
                      />
                      <div
                        className="pointer-events-none absolute inset-x-1.5 top-1.5 h-[calc(100%-0.25rem)] rounded-2xl border border-slate-200/30 bg-white/20"
                        aria-hidden
                      />
                      <div className="relative flex h-full min-h-[14rem] flex-col rounded-2xl border border-slate-200/60 bg-white/70 p-4 shadow-[0_20px_40px_-28px_rgba(15,23,42,0.14),0_1px_0_rgba(255,255,255,0.9)_inset] ring-1 ring-white/80 backdrop-blur-xl transition-[transform,box-shadow,border-color] duration-300 ease-out [@media(hover:hover)]:hover:-translate-y-0.5 [@media(hover:hover)]:hover:border-slate-300/80 [@media(hover:hover)]:hover:shadow-[0_28px_56px_-32px_rgba(99,102,241,0.2)] sm:min-h-[15rem] sm:p-5">
                        <div className="flex items-center gap-3 border-b border-slate-200/60 pb-3">
                          <Image
                            src={leads[2].src}
                            alt=""
                            width={36}
                            height={36}
                            className="h-9 w-9 rounded-full object-cover ring-2 ring-white shadow-sm"
                            sizes="36px"
                          />
                          <div className="min-w-0">
                            <p className="text-[13px] font-semibold tracking-[-0.02em] text-slate-900">To Marcus T.</p>
                            <p className="mt-0.5 text-[12px] text-slate-500">From your voice · editable</p>
                          </div>
                        </div>
                        <p className="mt-4 flex-1 text-[13px] leading-[1.65] text-slate-600">
                          Hey Marcus — saw your thread on landlord follow-ups. We built something that cuts the
                          spreadsheet back-and-forth. Happy to share if useful.
                        </p>
                        <div className="mt-5 flex flex-wrap gap-2">
                          <button
                            type="button"
                            className="rounded-lg bg-[#7C5CFF] px-3.5 py-2 text-[12px] font-semibold text-white shadow-[0_1px_0_rgba(255,255,255,0.2)_inset,0_8px_20px_-8px_rgba(124,92,255,0.55)] transition-[transform,box-shadow,filter] duration-200 [@media(hover:hover)]:hover:-translate-y-px [@media(hover:hover)]:hover:shadow-[0_12px_28px_-10px_rgba(124,92,255,0.5)] active:translate-y-0"
                          >
                            Copy message
                          </button>
                          <button
                            type="button"
                            className="rounded-lg border border-slate-200/90 bg-white/60 px-3.5 py-2 text-[12px] font-medium text-slate-700 shadow-sm backdrop-blur-sm transition-[transform,background-color,border-color] duration-200 [@media(hover:hover)]:hover:-translate-y-px [@media(hover:hover)]:hover:border-slate-300 [@media(hover:hover)]:hover:bg-white/90"
                          >
                            Edit in app
                          </button>
                        </div>
                      </div>
                    </div>
                  </PanelShell>
                </div>

                {/* Replies */}
                <div className="lg:col-span-3">
                  <PanelShell className="flex flex-col">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-emerald-700/90">Live replies coming in</p>
                    <p className="mt-0.5 text-[13px] font-medium text-slate-800">Inbox</p>

                    <div className="mt-5 flex flex-1 flex-col gap-2.5">
                      {replies.map((r) => (
                        <div
                          key={r.name + r.time}
                          className="group/re flex gap-2.5 rounded-xl border border-slate-200/55 bg-white/50 px-3 py-2.5 shadow-sm backdrop-blur-sm transition-[transform,box-shadow,background-color,border-color] duration-200 [@media(hover:hover)]:hover:-translate-y-1 [@media(hover:hover)]:hover:border-slate-300/70 [@media(hover:hover)]:hover:bg-white/85 [@media(hover:hover)]:hover:shadow-md"
                        >
                          <Image
                            src={r.src}
                            alt=""
                            width={32}
                            height={32}
                            className="mt-0.5 h-8 w-8 shrink-0 rounded-full object-cover ring-2 ring-white shadow-sm"
                            sizes="32px"
                          />
                          <div className="min-w-0 flex-1">
                            <div className="flex items-start justify-between gap-2">
                              <p className="truncate text-[12px] font-semibold tracking-[-0.01em] text-slate-900">{r.name}</p>
                              <span className="shrink-0 text-[11px] font-medium tabular-nums text-slate-400">{r.time}</span>
                            </div>
                            <div className="mt-1 flex flex-wrap items-center gap-1.5">
                              <span
                                className={`inline-flex rounded-md px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.05em] ${
                                  r.tone === "positive"
                                    ? "bg-emerald-50 text-emerald-900 ring-1 ring-emerald-200/70"
                                    : r.tone === "warm"
                                      ? "bg-amber-50 text-amber-950 ring-1 ring-amber-200/70"
                                      : "bg-slate-100/95 text-slate-600 ring-1 ring-slate-200/80"
                                }`}
                              >
                                {r.tag}
                              </span>
                            </div>
                            <p className="mt-1.5 line-clamp-2 text-[12px] leading-snug text-slate-600">{r.snippet}</p>
                          </div>
                        </div>
                      ))}
                      <p className="mt-auto pt-1 text-center text-[11px] font-medium text-slate-400">Live as replies land</p>
                    </div>
                  </PanelShell>
                </div>
              </div>
            </div>
          </article>
        </div>
      </FadeUp>
    </Section>
  );
}
