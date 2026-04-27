import Image from "next/image";
import { Section } from "@/components/landing/Section";
import { FadeUp } from "@/components/landing/FadeUp";
import { portrait } from "@/lib/landing-portraits";

const cards = [
  {
    headline: "New people found",
    detail: "10 matches · r/landlords, r/SaaS, Indie Hackers",
    expandHint: "Fresh demand from overnight scans",
    avatar: portrait("women", 33),
    status: "New" as const,
    time: "Just now",
  },
  {
    headline: "Message drafted",
    detail: "Ready to send to Kate from yesterday's r/SaaS thread",
    expandHint: "Follow-up needed on 2 threads tomorrow",
    avatar: portrait("men", 45),
    status: "Likely fit" as const,
    time: "4m ago",
  },
  {
    headline: "Reply came in",
    detail: "Elena replied on LinkedIn",
    expandHint: "Suggested next step: send a short demo link",
    avatar: portrait("women", 62),
    status: "Interested" as const,
    time: "18m ago",
  },
] as const;

function StatusTag({ status }: { status: (typeof cards)[number]["status"] }) {
  const styles =
    status === "Interested"
      ? "border-emerald-200/80 bg-emerald-50/80 text-emerald-900/90"
      : status === "New"
        ? "border-indigo-200/70 bg-indigo-50/70 text-indigo-950/85"
        : "border-violet-200/80 bg-violet-50/75 text-violet-950/85";

  return (
    <span
      className={`inline-flex shrink-0 items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide backdrop-blur-sm ${styles}`}
    >
      {status}
    </span>
  );
}

export function FeatureStrip() {
  return (
    <Section className="border-y border-slate-200/45 bg-[linear-gradient(180deg,#fafafa_0%,#ffffff_50%,#f3f1ff_100%)] py-16 sm:py-20 md:py-28">
      <FadeUp className="mx-auto max-w-6xl">
        <div className="mb-8 max-w-2xl">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400/50 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </span>
            <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-slate-500">Live activity</p>
          </div>
          <p className="mt-2 text-[clamp(1.2rem,2.4vw,1.5rem)] font-semibold leading-snug tracking-[-0.025em] text-slate-900">
            This is what happens when you show up daily.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-3 sm:gap-5 lg:gap-6">
          {cards.map((item, idx) => (
            <article
              key={item.headline}
              tabIndex={0}
              className="group relative flex flex-col overflow-hidden rounded-[1.125rem] border border-white/85 bg-white/58 p-4 shadow-[0_10px_30px_rgba(0,0,0,0.08),0_0_0_1px_rgba(255,255,255,0.8)_inset] outline-none ring-1 ring-slate-200/25 backdrop-blur-sm backdrop-saturate-150 transition-[transform,box-shadow,background-color,border-color] duration-200 ease-out focus-visible:ring-2 focus-visible:ring-indigo-400/70 sm:rounded-2xl sm:p-5 sm:backdrop-blur-xl [@media(hover:hover)]:hover:-translate-y-1 [@media(hover:hover)]:hover:border-indigo-200/45 [@media(hover:hover)]:hover:bg-white/82 [@media(hover:hover)]:hover:shadow-[0_18px_40px_-24px_rgba(99,102,241,0.18)]"
            >
              <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-[inherit] opacity-[0.35]" aria-hidden>
                <div
                  className="strip-card-shimmer absolute -inset-y-4 left-0 w-[42%] bg-gradient-to-r from-transparent via-white/60 to-transparent"
                  style={{ animationDelay: `${idx * 0.85}s` }}
                />
              </div>
              <div className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-violet-400/12 blur-2xl" aria-hidden />
              <div className="pointer-events-none absolute -bottom-12 -left-8 h-32 w-32 rounded-full bg-indigo-400/10 blur-2xl" aria-hidden />

              <p className="relative text-[13px] font-semibold tracking-tight text-slate-900 sm:text-[14px]">{item.headline}</p>

              <div className="relative mt-4 flex items-start justify-between gap-2">
                <div className="flex min-w-0 items-start gap-2.5">
                  <Image
                    src={item.avatar}
                    alt=""
                    width={40}
                    height={40}
                    className="h-10 w-10 shrink-0 rounded-full object-cover shadow-[0_4px_14px_rgba(0,0,0,0.1)] ring-2 ring-white"
                    sizes="40px"
                  />
                  <div className="min-w-0">
                    <p className="text-[12px] leading-snug text-slate-600">{item.detail}</p>
                  </div>
                </div>
                <StatusTag status={item.status} />
              </div>

              <div className="relative mt-4 flex items-center justify-between gap-2 border-t border-slate-200/50 pt-3">
                <p className="text-[11px] font-medium tabular-nums text-slate-400">{item.time}</p>
                <span className="text-[10px] font-semibold text-indigo-600 opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus-within:opacity-100">
                  Open →
                </span>
              </div>

              <div className="relative mt-1 grid grid-rows-[0fr] transition-[grid-template-rows,padding-top] duration-200 ease-out group-hover:grid-rows-[1fr] group-hover:pt-2.5 group-focus-within:grid-rows-[1fr] group-focus-within:pt-2.5">
                <div className="min-h-0 overflow-hidden">
                  <div className="rounded-lg bg-slate-50/85 px-2.5 py-2 text-[10px] leading-snug text-slate-600 ring-1 ring-slate-200/45 backdrop-blur-sm">
                    {item.expandHint}
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </FadeUp>
    </Section>
  );
}
