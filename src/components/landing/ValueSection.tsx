import { FadeUp } from "./FadeUp";
import { IconCheck, IconDoc, IconUsers } from "./icons";
import { Section } from "./Section";
import { SurfaceCard } from "./SurfaceCard";

const cards = [
  {
    n: "01",
    title: "Tell us what you built",
    text: "A short description is enough.",
    icon: IconDoc,
  },
  {
    n: "02",
    title: "We surface relevant conversations",
    text: "Across places where people are actively asking.",
    icon: IconUsers,
  },
  {
    n: "03",
    title: "You choose when to engage",
    text: "Nothing is sent without your approval.",
    icon: IconCheck,
  },
] as const;

export function ValueSection() {
  return (
    <Section
      id="process"
      className="scroll-mt-24 bg-[#F9FBFD] py-20 sm:scroll-mt-20 sm:py-24 md:py-28 lg:py-32"
    >
      <FadeUp>
        <h2 className="max-w-[40rem] text-balance text-[2rem] font-semibold leading-[1.12] tracking-tight text-[#0A0A0A] sm:text-[2.35rem] lg:text-[2.65rem]">
          A simple way to connect with real demand
        </h2>
      </FadeUp>

      <div className="mt-6 h-px w-full bg-gradient-to-r from-transparent via-[#CBD5E1]/50 to-transparent" />

      <div className="relative mt-6 grid gap-6 sm:grid-cols-3 sm:gap-7">
        <div
          className="pointer-events-none absolute left-[16%] right-[16%] top-12 hidden h-px bg-gradient-to-r from-[#BFDBFE]/0 via-[#93C5FD]/55 to-[#BFDBFE]/0 lg:block"
          aria-hidden
        />
        {cards.map((card, i) => {
          const Icon = card.icon;
          const isFirst = i === 0;
          return (
            <FadeUp key={card.n} delay={0.08 * i}>
              <SurfaceCard
                className={`group relative z-[1] flex h-full flex-col overflow-hidden border-transparent p-0 shadow-[0_10px_30px_rgba(0,0,0,0.04)] transition-[transform,box-shadow] duration-200 ease-out can-hover:hover:-translate-y-1 can-hover:hover:shadow-[0_20px_50px_rgba(0,0,0,0.08)] ${
                  isFirst ? "bg-white" : "bg-[#F8FAFC]"
                }`}
              >
                <div
                  className={`px-10 pb-8 pt-10 sm:px-11 sm:pb-9 sm:pt-11 ${
                    isFirst
                      ? "bg-gradient-to-br from-[#EFF6FF] via-[#F8FBFF] to-white"
                      : "bg-gradient-to-br from-[#F3F7FC] via-[#F8FAFC] to-[#F8FAFC]"
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-[rgba(59,130,246,0.08)] text-[#2563EB] shadow-[0_6px_20px_rgba(59,130,246,0.15)]">
                      <Icon className="h-9 w-9" />
                    </div>
                    <span className="pt-1 text-[12px] font-medium tabular-nums tracking-[0.12em] text-[#64748B]/45">
                      {card.n}
                    </span>
                  </div>
                </div>
                <div className="px-10 pb-11 pt-8 sm:px-11 sm:pb-12">
                  <h3 className="text-[1.18rem] font-bold leading-snug tracking-tight text-[#0A0A0A] sm:text-[1.24rem]">
                    {card.title}
                  </h3>
                  <p className="mt-2.5 text-[16px] leading-relaxed text-[#475569]/80">
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
