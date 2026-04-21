"use client";

import { FadeUp } from "./FadeUp";
import { IconCheck, IconDoc, IconSend, IconUsers } from "./icons";
import { Section } from "./Section";

const steps = [
  {
    n: "1",
    title: "Describe your product",
    Icon: IconDoc,
    ring: "border-[#BFDBFE] bg-[#EFF6FF] text-[#2563EB]",
  },
  {
    n: "2",
    title: "We find your users",
    Icon: IconUsers,
    ring: "border-[#EDE9FE] bg-[#F5F3FF] text-[#7C3AED]",
  },
  {
    n: "3",
    title: "We prepare outreach",
    Icon: IconSend,
    ring: "border-[#BFDBFE] bg-white text-[#2563EB]",
  },
  {
    n: "4",
    title: "You approve → conversations start",
    Icon: IconCheck,
    ring: "border-[#BBF7D0] bg-[#F0FDF4] text-[#16A34A]",
  },
] as const;

export function HowItWorks() {
  return (
    <Section
      id="process"
      className="scroll-mt-14 border-b border-[#ECECEC] bg-white py-20 sm:py-24 md:py-28 lg:py-32"
    >
      <FadeUp>
        <h2 className="text-[1.75rem] font-semibold leading-tight tracking-tight text-[#0A0A0A] sm:text-3xl lg:text-[2rem]">
          How it works
        </h2>
      </FadeUp>

      <div className="relative mt-14 lg:mt-16">
        <div
          className="absolute bottom-6 left-[1.125rem] top-6 w-px bg-[#E5E7EB] lg:hidden"
          aria-hidden
        />
        <div
          className="absolute left-[8%] right-[8%] top-[1.125rem] hidden h-px bg-[#E5E7EB] lg:block"
          aria-hidden
        />

        <ol className="relative flex flex-col lg:flex-row lg:justify-between lg:gap-4">
          {steps.map((step, i) => {
            const Icon = step.Icon;
            return (
              <li key={step.n} className="lg:w-[23%]">
                <FadeUp delay={0.05 * i}>
                  <div className="flex gap-4 pb-10 last:pb-0 lg:flex-col lg:items-center lg:pb-0 lg:text-center">
                    <div
                      className={`relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border shadow-sm transition-transform hover:scale-105 lg:mx-auto ${step.ring}`}
                    >
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="pt-0.5 lg:pt-4">
                      <span className="text-[12px] font-semibold tabular-nums text-[#9CA3AF]">
                        Step {step.n}
                      </span>
                      <p className="mt-1 text-[16px] font-semibold leading-snug text-[#0A0A0A] lg:text-[15px]">
                        {step.title}
                      </p>
                    </div>
                  </div>
                </FadeUp>
              </li>
            );
          })}
        </ol>
      </div>
    </Section>
  );
}
