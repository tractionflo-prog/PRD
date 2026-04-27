import { FadeUp } from "@/components/landing/FadeUp";
import { Section } from "@/components/landing/Section";

const feed = [
  { person: "Marcus", action: "replied to your message", time: "1m ago" },
  { person: "Rina", action: "opened your follow-up", time: "4m ago" },
  { person: "Alex", action: "asked for details", time: "9m ago" },
] as const;

export function SocialProofSection() {
  return (
    <Section className="bg-white py-4 sm:py-6">
      <FadeUp className="mx-auto max-w-6xl rounded-[24px] bg-[#f8f9ff] p-4 ring-1 ring-slate-200/70 sm:p-5">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-[1.4rem] font-semibold tracking-tight text-slate-900 sm:text-[1.6rem]">Live activity</h2>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-600 ring-1 ring-slate-200/70">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
            now
          </span>
        </div>
        <div className="mt-3 grid gap-2.5 sm:grid-cols-3">
          {feed.map((item) => (
            <article key={item.person} className="rounded-2xl bg-white px-3 py-2.5 ring-1 ring-slate-200/70">
              <p className="text-[13px] font-semibold text-slate-900">{item.person}</p>
              <p className="mt-1 text-[12px] text-slate-600">{item.action}</p>
              <p className="mt-1 text-[11px] font-medium text-slate-500">{item.time}</p>
            </article>
          ))}
        </div>
      </FadeUp>
    </Section>
  );
}
