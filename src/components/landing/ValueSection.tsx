import { FadeUp } from "./FadeUp";
import { IconCheck, IconDoc, IconUsers } from "./icons";
import { Section } from "./Section";
import { SurfaceCard } from "./SurfaceCard";

const cards = [
  {
    n: "01",
    title: "Tell us what you built",
    text: "Describe your product, website, or the problem you solve.",
    icon: IconDoc,
  },
  {
    n: "02",
    title: "We find demand signals",
    text: "We surface real conversations when people are already asking — and show people likely facing the problem when demand is quiet.",
    icon: IconUsers,
  },
  {
    n: "03",
    title: "You start the conversation",
    text: "We draft thoughtful conversation starters. You approve, edit, and send manually.",
    icon: IconCheck,
  },
] as const;

export function ValueSection() {
  return (
    <Section
      id="process"
      className="scroll-mt-24 bg-white py-20 sm:scroll-mt-20 sm:py-24 md:py-28 lg:py-32"
    >
      <FadeUp>
        <h2 className="max-w-[40rem] text-balance text-[2rem] font-semibold leading-[1.12] tracking-tight text-[#0f172a] sm:text-[2.35rem] lg:text-[2.65rem]">
          You find conversations — or you create them
        </h2>
      </FadeUp>

      <div className="mt-8 h-px w-full max-w-[40rem] bg-[#e2e8f0]" />

      <div className="relative mt-10 grid gap-6 sm:grid-cols-3 sm:gap-7">
        {cards.map((card, i) => {
          const Icon = card.icon;
          return (
            <FadeUp key={card.n} delay={0.08 * i}>
              <SurfaceCard className="group relative z-[1] flex h-full flex-col overflow-hidden border-[#e2e8f0] p-0 shadow-[0_24px_80px_-48px_rgba(15,23,42,0.12)] transition-[transform,box-shadow] duration-200 ease-out can-hover:hover:-translate-y-0.5 can-hover:hover:shadow-[0_28px_90px_-44px_rgba(15,23,42,0.14)]">
                <div className="px-8 pb-9 pt-9 sm:px-9 sm:pb-10 sm:pt-10">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-[rgba(99,91,255,0.08)] text-[#635bff] ring-1 ring-[#635bff]/10">
                      <Icon className="h-8 w-8" />
                    </div>
                    <span className="pt-1 text-[12px] font-medium tabular-nums tracking-[0.12em] text-[#94a3b8]">
                      {card.n}
                    </span>
                  </div>
                  <h3 className="mt-8 text-[1.125rem] font-semibold leading-snug tracking-tight text-[#0f172a] sm:text-[1.2rem]">
                    {card.title}
                  </h3>
                  <p className="mt-2.5 text-[15px] leading-relaxed text-[#64748b] sm:text-[16px]">
                    {card.text}
                  </p>
                </div>
              </SurfaceCard>
            </FadeUp>
          );
        })}
      </div>
    </Section>
  );
}
