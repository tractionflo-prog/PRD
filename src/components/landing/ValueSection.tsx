import { FadeUp } from "./FadeUp";
import { IconCheck, IconDoc, IconUsers } from "./icons";
import { Section } from "./Section";
import { SurfaceCard } from "./SurfaceCard";
import { ValueWorkflow } from "./ValueWorkflow";

const cards = [
  {
    n: "01",
    title: "Tell us what you built",
    text: "One line. No complexity.",
    icon: IconDoc,
    iconWrap: "border-[#BFDBFE] bg-[#EFF6FF] text-[#2563EB]",
    numClass: "text-[#93C5FD]",
  },
  {
    n: "02",
    title: "We prepare outreach",
    text: "Right people. Ready messages.",
    icon: IconUsers,
    iconWrap: "border-[#EDE9FE] bg-[#F5F3FF] text-[#7C3AED]",
    numClass: "text-[#C4B5FD]",
  },
  {
    n: "03",
    title: "You approve",
    text: "No repetition. No burnout.",
    icon: IconCheck,
    iconWrap: "border-[#BBF7D0] bg-[#F0FDF4] text-[#16A34A]",
    numClass: "text-[#86EFAC]",
  },
] as const;

export function ValueSection() {
  return (
    <Section className="border-b border-[#ECECEC] bg-white py-20 sm:py-24 md:py-28 lg:py-32">
      <FadeUp>
        <h2 className="max-w-[44rem] text-balance text-[1.75rem] font-semibold leading-[1.2] tracking-tight text-[#0A0A0A] sm:text-3xl lg:text-[2.125rem]">
          Tell us what you built → We help you get{" "}
          <span className="text-[#2563EB]">users</span> → You just approve
        </h2>
      </FadeUp>

      <div className="mt-14 grid gap-5 sm:grid-cols-3 sm:gap-6 lg:mt-16">
        {cards.map((card, i) => {
          const Icon = card.icon;
          return (
            <FadeUp key={card.n} delay={0.04 * i}>
              <SurfaceCard className="group relative flex h-full flex-col overflow-hidden border-[#E8E8E8] p-0 shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-shadow hover:shadow-[0_20px_48px_-28px_rgba(37,99,235,0.1)]">
                <div className="flex items-start justify-between gap-4 p-7 sm:p-8">
                  <div
                    className={`flex h-11 w-11 items-center justify-center rounded-xl border transition-colors ${card.iconWrap}`}
                  >
                    <Icon className="h-[22px] w-[22px]" />
                  </div>
                  <span
                    className={`text-[13px] font-semibold tabular-nums tracking-wide ${card.numClass}`}
                  >
                    {card.n}
                  </span>
                </div>
                <div className="border-t border-[#F0F0F0] px-7 pb-7 pt-0 sm:px-8 sm:pb-8">
                  <h3 className="text-lg font-semibold tracking-tight text-[#0A0A0A]">
                    {card.title}
                  </h3>
                  <p className="mt-2 text-[15px] leading-relaxed text-[#6B7280]">
                    {card.text}
                  </p>
                </div>
              </SurfaceCard>
            </FadeUp>
          );
        })}
      </div>

      <ValueWorkflow />
    </Section>
  );
}
