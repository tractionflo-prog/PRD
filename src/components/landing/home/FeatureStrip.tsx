import { Section } from "@/components/landing/Section";
import { FadeUp } from "@/components/landing/FadeUp";

const timeline = [
  {
    time: "Just now",
    body: "Found 12 people talking about tenant tracking",
    tone: "purple" as const,
  },
  {
    time: "4 min ago",
    body: "Drafted a message for a Reddit thread",
    tone: "slate" as const,
  },
  {
    time: "18 min ago",
    body: "Reply came in: “Interested”",
    tone: "green" as const,
  },
  {
    time: "32 min ago",
    body: "Follow-up reminder created",
    tone: "slate" as const,
  },
] as const;

function Dot({ tone }: { tone: (typeof timeline)[number]["tone"] }) {
  if (tone === "green") {
    return (
      <span className="relative mt-1 flex h-2 w-2 shrink-0">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400/45 opacity-75" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_0_3px_rgba(16,185,129,0.2)]" />
      </span>
    );
  }
  if (tone === "purple") {
    return <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-violet-500 shadow-[0_0_0_3px_rgba(139,92,246,0.2)]" />;
  }
  return <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-slate-300 ring-2 ring-slate-200/80" />;
}

export function FeatureStrip() {
  return (
    <Section className="border-y border-slate-200/40 bg-[linear-gradient(180deg,#fafafa_0%,#ffffff_45%,#f8f7fc_100%)] py-20 sm:py-24 md:py-28">
      <FadeUp className="mx-auto max-w-6xl px-1 sm:px-0">
        <div className="mx-auto max-w-2xl text-center lg:mx-0 lg:max-w-xl lg:text-left">
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-500">Live activity</p>
          <h2 className="mt-4 text-balance text-[clamp(1.45rem,3vw,2rem)] font-semibold leading-[1.12] tracking-[-0.03em] text-slate-900">
            This is what happens when you show up daily.
          </h2>
          <p className="mt-4 text-[16px] leading-relaxed text-slate-600 sm:text-[17px]">
            Tractionflo keeps the boring distribution work moving — finding people, drafting messages, and tracking replies.
          </p>
        </div>

        <div className="relative mx-auto mt-14 max-w-3xl lg:ml-[max(0px,calc(50%-22rem)))] lg:mr-0 lg:mt-16">
          <div
            className="pointer-events-none absolute left-[11px] top-3 bottom-3 w-px bg-gradient-to-b from-slate-200/0 via-slate-200/80 to-slate-200/0 sm:left-[13px]"
            aria-hidden
          />
          <ul className="relative space-y-5 sm:space-y-6">
            {timeline.map((item, idx) => (
              <li
                key={item.time}
                className={`relative flex gap-4 pl-1 sm:gap-5 ${idx % 2 === 1 ? "lg:translate-x-4" : ""}`}
              >
                <Dot tone={item.tone} />
                <div className="min-w-0 flex-1 rounded-2xl border border-slate-200/60 bg-white/80 px-4 py-4 shadow-[0_16px_40px_-28px_rgba(15,23,42,0.1)] ring-1 ring-white/90 backdrop-blur-md sm:px-5 sm:py-4">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">{item.time}</p>
                    {item.tone === "green" ? (
                      <span className="rounded-full border border-emerald-200/70 bg-emerald-50/90 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-900">
                        Inbox
                      </span>
                    ) : null}
                    {item.tone === "purple" ? (
                      <span className="rounded-full border border-violet-200/70 bg-violet-50/90 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-violet-900">
                        Discovery
                      </span>
                    ) : null}
                    {item.tone === "slate" && idx === 1 ? (
                      <span className="rounded-full border border-slate-200/80 bg-slate-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-700">
                        Draft
                      </span>
                    ) : null}
                    {item.tone === "slate" && idx === 3 ? (
                      <span className="rounded-full border border-slate-200/80 bg-slate-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-700">
                        System
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-2 text-[15px] font-medium leading-snug text-slate-800 sm:text-[16px]">{item.body}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </FadeUp>
    </Section>
  );
}
