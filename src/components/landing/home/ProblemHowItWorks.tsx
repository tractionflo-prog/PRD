import { Fragment, type ComponentType, type ReactNode, type SVGProps } from "react";
import { Section } from "@/components/landing/Section";
import { FadeUp } from "@/components/landing/FadeUp";
import {
  IconArrowRight,
  IconChat,
  IconDoc,
  IconMenu,
  IconRadar,
  IconSend,
  IconTimer,
  IconUsers,
} from "@/components/landing/icons";

type SvgIcon = ComponentType<SVGProps<SVGSVGElement> & { className?: string }>;

const messyTabs = ["CRM", "Sheets", "Inbox", "Ads", "Slack", "Docs"] as const;

const walkthroughSteps: readonly {
  title: string;
  subtitle: string;
  Icon: SvgIcon;
  preview: ReactNode;
  expanded: ReactNode;
}[] = [
  {
    title: "Tell us what you built",
    subtitle: "One sentence is enough.",
    Icon: IconDoc,
    preview: (
      <div className="rounded-md border border-slate-100 bg-white px-2 py-1.5">
        <p className="text-[9px] font-medium leading-tight text-slate-700">&ldquo;Lease reminders for small landlords&rdquo;</p>
      </div>
    ),
    expanded: (
      <div className="mt-2 space-y-1.5 border-t border-slate-100 pt-2">
        <p className="text-[8px] leading-snug text-slate-600">We map who you help — not generic ICP slides.</p>
      </div>
    ),
  },
  {
    title: "We find where people are asking",
    subtitle: "Real conversations from Reddit, X, and communities.",
    Icon: IconRadar,
    preview: (
      <div className="flex flex-wrap gap-1">
        {["r/landlords", "Indie Hackers", "X"].map((label) => (
          <span key={label} className="rounded-full border border-indigo-100/90 bg-indigo-50/80 px-2 py-0.5 text-[8px] font-semibold text-indigo-900">
            {label}
          </span>
        ))}
      </div>
    ),
    expanded: (
      <div className="mt-2 space-y-1 border-t border-slate-100 pt-2">
        <p className="text-[8px] text-slate-600">Fresh threads where your product fits the pain.</p>
      </div>
    ),
  },
  {
    title: "You start the conversation",
    subtitle: "You approve, edit, copy, and send.",
    Icon: IconSend,
    preview: (
      <div className="rounded-md border border-indigo-100/80 bg-indigo-50/50 px-2 py-1.5">
        <p className="text-[8px] leading-snug text-slate-700">&ldquo;Saw your post — built something for this.&rdquo;</p>
      </div>
    ),
    expanded: (
      <div className="mt-2 border-t border-slate-100 pt-2">
        <p className="text-[8px] text-slate-600">Nothing auto-sends. You tap send when it feels right.</p>
      </div>
    ),
  },
];

function MessyToolbarIcon({ Icon, drift }: { Icon: SvgIcon; drift: "a" | "b" | "c" }) {
  const driftClass =
    drift === "a" ? "compare-messy-drift" : drift === "b" ? "compare-messy-drift-slow" : "compare-messy-drift-fast";
  return (
    <span
      className={`inline-flex h-8 w-8 items-center justify-center rounded-lg bg-slate-300/50 text-slate-500 ring-1 ring-slate-400/40 ${driftClass}`}
    >
      <Icon className="h-4 w-4" />
    </span>
  );
}

function TractionfloFlowPath() {
  return (
    <div className="relative mt-5 rounded-xl border border-indigo-100/80 bg-white/50 px-3 py-4 backdrop-blur-sm">
      <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-xl opacity-50" aria-hidden>
        <div className="compare-flow-shimmer-bar absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-transparent via-violet-200/40 to-transparent" />
      </div>
      <div className="relative flex min-w-0 flex-wrap items-center justify-center gap-x-1 gap-y-3 sm:flex-nowrap sm:justify-between sm:gap-2">
        <div className="compare-flow-step-pulse flex min-w-[4.5rem] flex-1 flex-col items-center gap-1.5 text-center sm:min-w-0">
          <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 text-white shadow-lg ring-2 ring-white/80">
            <IconUsers className="h-4 w-4" strokeWidth={2.25} />
          </span>
          <p className="text-[9px] font-semibold text-slate-800">10 people</p>
        </div>
        <svg
          className="mx-0.5 hidden h-2 w-[12%] min-w-[1.25rem] shrink-0 sm:mx-0 sm:block sm:w-[18%]"
          viewBox="0 0 40 4"
          preserveAspectRatio="none"
          aria-hidden
        >
          <line
            x1="0"
            y1="2"
            x2="40"
            y2="2"
            stroke="#818cf8"
            strokeWidth="2"
            strokeDasharray="4 5"
            strokeLinecap="round"
            className="walkthrough-line-dash"
          />
        </svg>
        <div className="compare-flow-step-pulse-2 flex min-w-[4.5rem] flex-1 flex-col items-center gap-1.5 text-center sm:min-w-0">
          <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 text-white shadow-lg ring-2 ring-white/80">
            <IconSend className="h-4 w-4" strokeWidth={2.25} />
          </span>
          <p className="text-[9px] font-semibold text-slate-800">10 messages</p>
        </div>
        <svg
          className="mx-0.5 hidden h-2 w-[12%] min-w-[1.25rem] shrink-0 sm:mx-0 sm:block sm:w-[18%]"
          viewBox="0 0 40 4"
          preserveAspectRatio="none"
          aria-hidden
        >
          <line
            x1="0"
            y1="2"
            x2="40"
            y2="2"
            stroke="#a5b4fc"
            strokeWidth="2"
            strokeDasharray="4 5"
            strokeLinecap="round"
            className="walkthrough-line-dash"
          />
        </svg>
        <div className="compare-flow-step-pulse-3 flex min-w-[4.5rem] flex-1 flex-col items-center gap-1.5 text-center sm:min-w-0">
          <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg ring-2 ring-white/80">
            <IconChat className="h-4 w-4" strokeWidth={2.25} />
          </span>
          <p className="text-[9px] font-semibold text-slate-800">3 replies</p>
        </div>
      </div>
      <p className="relative mt-3 text-center text-[10px] font-semibold text-indigo-700">Done in 10 minutes</p>
    </div>
  );
}

function WalkthroughConnector({ variant, gradId }: { variant: "horizontal" | "vertical"; gradId: string }) {
  if (variant === "horizontal") {
    return (
      <div className="relative hidden min-h-[2px] min-w-[1rem] shrink-0 grow basis-0 items-center self-start pt-[1.35rem] md:flex">
        <svg className="h-4 w-full" viewBox="0 0 100 8" preserveAspectRatio="none" aria-hidden>
          <defs>
            <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#ddd6fe" />
              <stop offset="45%" stopColor="#7c5cff" />
              <stop offset="100%" stopColor="#a5b4fc" />
            </linearGradient>
          </defs>
          <line
            x1="0"
            y1="4"
            x2="100"
            y2="4"
            stroke={`url(#${gradId})`}
            strokeWidth="3"
            strokeLinecap="round"
            className="walkthrough-line-dash"
            style={{ strokeDasharray: "10 14" }}
          />
        </svg>
        <IconArrowRight className="pointer-events-none absolute right-0 top-[0.85rem] h-3.5 w-3.5 text-indigo-400 drop-shadow-sm" />
      </div>
    );
  }
  return (
    <div className="relative flex h-12 w-full shrink-0 items-center justify-center py-1 md:hidden">
      <svg className="h-full w-5" viewBox="0 0 8 100" preserveAspectRatio="none" aria-hidden>
        <defs>
          <linearGradient id={gradId} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#ddd6fe" />
            <stop offset="50%" stopColor="#7c5cff" />
            <stop offset="100%" stopColor="#a5b4fc" />
          </linearGradient>
        </defs>
        <line
          x1="4"
          y1="0"
          x2="4"
          y2="100"
          stroke={`url(#${gradId})`}
          strokeWidth="3"
          strokeLinecap="round"
          className="walkthrough-line-dash"
          style={{ strokeDasharray: "10 14" }}
        />
      </svg>
      <IconArrowRight className="absolute bottom-0.5 h-3.5 w-3.5 rotate-90 text-indigo-400" />
    </div>
  );
}

function WalkthroughStepCard({
  step,
  title,
  subtitle,
  Icon,
  preview,
  expanded,
}: {
  step: number;
  title: string;
  subtitle: string;
  Icon: SvgIcon;
  preview: ReactNode;
  expanded: ReactNode;
}) {
  return (
    <article
      tabIndex={0}
      className="group relative z-10 flex w-full max-w-[17.5rem] flex-col rounded-2xl border border-indigo-100/70 bg-white/90 p-3 shadow-[0_12px_40px_-28px_rgba(79,70,229,0.35)] ring-1 ring-white/90 outline-none transition-[transform,box-shadow,border-color] duration-300 ease-out focus-visible:ring-2 focus-visible:ring-indigo-400/80 md:max-w-none md:flex-1 md:p-3.5 [@media(hover:hover)]:hover:z-20 [@media(hover:hover)]:hover:-translate-y-1 [@media(hover:hover)]:hover:border-indigo-200 [@media(hover:hover)]:hover:shadow-[0_28px_56px_-24px_rgba(99,102,241,0.38)]"
    >
      <div
        className="pointer-events-none absolute -inset-px rounded-2xl opacity-0 blur-md transition-opacity duration-300 group-hover:opacity-100 group-focus-within:opacity-100"
        style={{
          background: "radial-gradient(ellipse 80% 70% at 50% 0%, rgba(124,92,255,0.22), transparent 65%)",
        }}
        aria-hidden
      />
      <div className="relative flex items-start gap-2.5">
        <div className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 via-indigo-500 to-indigo-700 text-white shadow-[0_10px_22px_-8px_rgba(124,92,255,0.55)] ring-2 ring-white/70">
          <Icon className="h-[1.15rem] w-[1.15rem]" strokeWidth={2.25} />
        </div>
        <div className="min-w-0 pt-0.5">
          <h3 className="text-left text-[11px] font-semibold leading-snug tracking-tight text-slate-900 sm:text-[12px]">
            <span className="tabular-nums text-indigo-600">{String(step).padStart(2, "0")}</span>
            <span className="text-slate-400"> — </span>
            {title}
          </h3>
          <p className="mt-1 text-left text-[10px] font-medium leading-snug text-slate-600">{subtitle}</p>
          <p className="mt-0.5 text-[9px] font-medium uppercase tracking-[0.12em] text-indigo-500/80 opacity-70 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
            Hover to expand
          </p>
        </div>
      </div>

      <div className="relative mt-3 overflow-hidden rounded-xl border border-slate-100/90 bg-gradient-to-b from-slate-50/80 to-white p-2.5 transition-[padding] duration-300 group-hover:pb-3 group-focus-within:pb-3">
        {preview}
        <div className="grid grid-rows-[0fr] transition-[grid-template-rows] duration-300 ease-out group-hover:grid-rows-[1fr] group-focus-within:grid-rows-[1fr]">
          <div className="min-h-0 overflow-hidden opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus-within:opacity-100">
            {expanded}
          </div>
        </div>
      </div>
    </article>
  );
}

export function ProblemHowItWorks() {
  return (
    <Section id="process" className="relative overflow-hidden scroll-mt-[calc(5.5rem+env(safe-area-inset-top,0px))] bg-[#f1f3fa] py-16 sm:py-20 md:py-28">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-80 bg-[radial-gradient(ellipse_70%_50%_at_50%_0%,rgba(124,92,255,0.1),transparent_70%)]" aria-hidden />
      <div className="relative mx-auto max-w-6xl px-1 sm:px-0">
        <FadeUp>
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-[clamp(1.35rem,3.2vw,1.85rem)] font-semibold leading-[1.12] tracking-[-0.03em] text-slate-900">
              You don&apos;t need more tools.
            </p>
            <p className="mt-1 text-[clamp(1.35rem,3.2vw,1.85rem)] font-semibold leading-[1.12] tracking-[-0.03em] text-indigo-700">
              You need a system.
            </p>
          </div>
        </FadeUp>

        <FadeUp className="mx-auto mt-8 max-w-2xl text-center" delay={0.05}>
          <p className="text-[15px] leading-relaxed text-slate-600 sm:text-[16px]">
            Most founders know what to do: find people, reach out, follow up.
          </p>
          <p className="mt-3 text-[15px] leading-relaxed text-slate-600 sm:text-[16px]">
            But it doesn&apos;t happen consistently. Because it&apos;s repetitive.
          </p>
          <p className="mt-5 text-[15px] font-semibold leading-relaxed text-slate-800 sm:text-[16px]">
            Tractionflo does the setup.
            <span className="font-normal text-slate-600"> You just show up and send.</span>
          </p>
        </FadeUp>

        <div className="mt-12 grid gap-8 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:items-stretch lg:gap-10">
          <FadeUp className="flex min-h-[280px] flex-col">
            <p className="mb-3 text-center text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400 lg:text-left">Typical day</p>
            <div className="compare-messy-drift-slow relative flex min-h-[280px] flex-1 flex-col overflow-hidden rounded-2xl border border-slate-300/60 bg-gradient-to-br from-slate-200/85 via-slate-100 to-slate-200/75 p-3 opacity-[0.92] shadow-[0_10px_30px_rgba(0,0,0,0.06)] ring-1 ring-slate-300/35 grayscale sm:p-4">
              <div className="compare-messy-drift flex gap-0 border-b border-slate-400/25 pb-2">
                {messyTabs.map((t, i) => (
                  <span
                    key={t}
                    className={`shrink-0 rounded-t-md px-2 py-1.5 text-left text-[10px] font-medium text-slate-500 ring-1 ring-slate-400/35 first:ml-0 sm:text-[11px] ${i === 2 ? "bg-slate-100/80 text-slate-600" : "bg-slate-300/40"}`}
                    style={{ marginLeft: i > 0 ? -6 : 0, zIndex: messyTabs.length - i }}
                  >
                    {t}
                  </span>
                ))}
              </div>

              <div className="compare-messy-drift-fast mt-3 flex flex-wrap items-center gap-2 border-b border-slate-400/20 pb-3">
                <MessyToolbarIcon Icon={IconMenu} drift="a" />
                <MessyToolbarIcon Icon={IconDoc} drift="b" />
                <MessyToolbarIcon Icon={IconTimer} drift="c" />
                <MessyToolbarIcon Icon={IconChat} drift="a" />
                <MessyToolbarIcon Icon={IconUsers} drift="b" />
                <span className="ml-auto rounded-md bg-slate-400/30 px-2 py-1 text-[9px] font-medium text-slate-500">9+ tools</span>
              </div>

              <div className="relative mt-4 min-h-[8rem] flex-1">
                <div className="compare-messy-drift absolute left-0 top-0 w-[92%] rounded-xl bg-white/45 p-2.5 shadow-sm ring-1 ring-slate-400/35">
                  <div className="h-1.5 w-1/3 rounded-full bg-slate-400/50" />
                  <div className="mt-2 space-y-1.5">
                    <div className="h-1 w-full rounded-full bg-slate-400/35" />
                    <div className="h-1 w-4/5 rounded-full bg-slate-400/25" />
                    <div className="h-1 w-2/3 rounded-full bg-slate-400/20" />
                  </div>
                </div>
                <div className="compare-messy-drift-slow absolute left-[10%] top-12 w-[88%] rotate-[1.2deg] rounded-xl bg-white/35 p-2.5 ring-1 ring-slate-400/30">
                  <div className="flex gap-1">
                    <div className="h-6 w-6 rounded bg-slate-400/40" />
                    <div className="flex-1 space-y-1 pt-0.5">
                      <div className="h-1 w-full rounded-full bg-slate-400/30" />
                      <div className="h-1 w-3/5 rounded-full bg-slate-400/22" />
                    </div>
                  </div>
                </div>
              </div>
              <div className="relative z-10 mt-auto border-t border-slate-400/25 bg-slate-300/25 px-3 py-2.5 text-center">
                <p className="text-[11px] font-semibold text-slate-600">9+ tabs open</p>
                <p className="text-[10px] font-medium text-slate-500">Nothing moving</p>
              </div>
            </div>
          </FadeUp>

          <FadeUp className="flex min-h-[280px] flex-col" delay={0.06}>
            <p className="mb-3 text-center text-[11px] font-semibold uppercase tracking-[0.18em] text-indigo-600/90 lg:text-left">Tractionflo</p>
            <div className="compare-clean-panel relative flex min-h-[280px] flex-1 flex-col overflow-hidden rounded-2xl border border-indigo-200/55 bg-[linear-gradient(175deg,#ffffff_0%,#f9f8ff_42%,#f1efff_100%)] p-4 shadow-[0_10px_30px_rgba(0,0,0,0.06),0_24px_56px_-36px_rgba(124,92,255,0.28)] ring-1 ring-white/90 sm:p-5">
              <div className="pointer-events-none absolute -right-20 top-1/4 h-56 w-56 rounded-full bg-violet-400/14 blur-3xl" aria-hidden />
              <div className="pointer-events-none absolute -left-16 bottom-0 h-44 w-44 rounded-full bg-indigo-400/12 blur-2xl" aria-hidden />

              <div className="relative rounded-xl border border-indigo-100/90 bg-white/70 px-4 py-3 text-center shadow-sm backdrop-blur-sm">
                <p className="text-[13px] font-semibold tracking-tight text-slate-900">10 people · 10 messages · 3 replies</p>
                <p className="mt-0.5 text-[12px] font-semibold text-indigo-700">Done in 10 minutes</p>
              </div>

              <TractionfloFlowPath />
            </div>
          </FadeUp>
        </div>

        <FadeUp className="mx-auto mt-20 max-w-3xl text-center" delay={0.04}>
          <h2 className="text-[clamp(1.25rem,2.8vw,1.65rem)] font-semibold tracking-[-0.02em] text-slate-900">How it works</h2>
          <p className="mt-2 text-[15px] text-slate-600">Three steps. One daily workflow.</p>
        </FadeUp>

        <FadeUp className="relative mx-auto mt-10 min-w-0 max-w-6xl" delay={0.08}>
          <div className="pointer-events-none absolute left-1/2 top-1/2 h-48 w-[min(100%,28rem)] -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-200/15 blur-3xl" aria-hidden />
          <div className="relative flex min-w-0 flex-col items-stretch rounded-[1.35rem] border border-indigo-100/60 bg-white/40 p-4 shadow-[0_10px_30px_rgba(0,0,0,0.05)] ring-1 ring-slate-200/40 backdrop-blur-md sm:p-5 md:flex-row md:items-start md:justify-between md:gap-1">
            {walkthroughSteps.map(({ title, subtitle, Icon, preview, expanded }, idx) => (
              <Fragment key={title}>
                <WalkthroughStepCard
                  step={idx + 1}
                  title={title}
                  subtitle={subtitle}
                  Icon={Icon}
                  preview={preview}
                  expanded={expanded}
                />
                {idx < walkthroughSteps.length - 1 ? (
                  <>
                    <WalkthroughConnector variant="vertical" gradId={`walk-v2-${idx}`} />
                    <WalkthroughConnector variant="horizontal" gradId={`walk-h2-${idx}`} />
                  </>
                ) : null}
              </Fragment>
            ))}
          </div>
        </FadeUp>
      </div>
    </Section>
  );
}
