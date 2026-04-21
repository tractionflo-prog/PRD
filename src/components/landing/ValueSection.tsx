import { FadeUp } from "./FadeUp";
import { IconCheck, IconDoc, IconUsers } from "./icons";
import { Section } from "./Section";
import { SurfaceCard } from "./SurfaceCard";

const cards = [
  {
    n: "01",
    title: "Tell us what you built",
    text: "One sentence is enough.",
    icon: IconDoc,
  },
  {
    n: "02",
    title: "We find people already looking",
    text: "Communities, conversations, real intent.",
    icon: IconUsers,
  },
  {
    n: "03",
    title: "You approve the outreach",
    text: "Nothing sends without you.",
    icon: IconCheck,
  },
] as const;

export function ValueSection() {
  return (
    <Section
      id="process"
      className="scroll-mt-14 border-b border-[#ECECEC] bg-white py-16 sm:py-20 md:py-24"
    >
      <FadeUp>
        <h2 className="max-w-[38rem] text-balance text-[1.875rem] font-semibold leading-[1.14] tracking-tight text-[#0A0A0A] sm:text-[2.125rem] lg:text-[2.375rem]">
          You build. We find users. You approve.
        </h2>
        <p className="mt-4 max-w-[40rem] text-pretty text-[17px] font-normal leading-relaxed text-[#374151] sm:text-lg">
          No cold outreach. No guessing. No waiting months for feedback.
        </p>
      </FadeUp>

      <div className="mt-10 grid gap-5 sm:grid-cols-3 sm:gap-6 lg:mt-12">
        {cards.map((card, i) => {
          const Icon = card.icon;
          return (
            <FadeUp key={card.n} delay={0.04 * i}>
              <SurfaceCard className="group relative flex h-full flex-col overflow-hidden border-[#E5E7EB] p-0 shadow-[0_1px_3px_rgba(15,23,42,0.06)] transition-shadow duration-300 hover:border-[#E0E7FF] hover:shadow-[0_20px_48px_-24px_rgba(37,99,235,0.2)]">
                <div className="bg-gradient-to-br from-[#EFF6FF] via-white to-white px-8 pb-6 pt-8 sm:px-9 sm:pb-7 sm:pt-9">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-[#BFDBFE] bg-white text-[#2563EB] shadow-[0_4px_12px_-4px_rgba(37,99,235,0.35)]">
                      <Icon className="h-7 w-7" />
                    </div>
                    <span className="pt-1 text-[12px] font-bold tabular-nums tracking-[0.12em] text-[#93C5FD]">
                      {card.n}
                    </span>
                  </div>
                </div>
                <div className="border-t border-[#F3F4F6] px-8 pb-9 pt-7 sm:px-9 sm:pb-10">
                  <h3 className="text-[1.0625rem] font-semibold leading-snug tracking-tight text-[#0A0A0A] sm:text-lg">
                    {card.title}
                  </h3>
                  <p className="mt-3 text-[16px] leading-relaxed text-[#4B5563]">
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
