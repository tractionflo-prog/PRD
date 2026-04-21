import { FadeUp } from "./FadeUp";
import {
  IconCheck,
  IconMessage,
  IconRocket,
  IconUsers,
} from "./icons";
import { Section } from "./Section";

const items = [
  {
    text: "have launched before",
    Icon: IconRocket,
    wrap: "border-[#BFDBFE] bg-[#EFF6FF] text-[#2563EB]",
  },
  {
    text: "struggled to get users",
    Icon: IconUsers,
    wrap: "border-[#EDE9FE] bg-[#F5F3FF] text-[#7C3AED]",
  },
  {
    text: "are tired of outreach that goes nowhere",
    Icon: IconMessage,
    wrap: "border-[#BFDBFE] bg-[#EFF6FF] text-[#2563EB]",
  },
  {
    text: "want a simpler way to validate ideas",
    Icon: IconCheck,
    wrap: "border-[#BBF7D0] bg-[#F0FDF4] text-[#16A34A]",
  },
] as const;

export function WhoItsFor() {
  return (
    <Section className="border-b border-[#ECECEC] bg-[#FAFAFA] py-14 sm:py-16 md:py-20">
      <FadeUp>
        <h2 className="text-[1.875rem] font-semibold leading-tight tracking-tight text-[#0A0A0A] sm:text-[2rem] lg:text-[2.125rem]">
          Built for founders who
        </h2>
      </FadeUp>

      <ul className="mt-8 grid gap-3 sm:mt-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-4">
        {items.map((item, i) => {
          const Icon = item.Icon;
          return (
            <li key={item.text}>
              <FadeUp delay={0.04 * i}>
                <div className="flex h-full items-center gap-3.5 rounded-xl border border-[#E5E7EB] bg-white px-4 py-4 shadow-[0_1px_3px_rgba(15,23,42,0.05)] transition-shadow hover:border-[#E0E7FF] hover:shadow-[0_8px_24px_-16px_rgba(37,99,235,0.12)] sm:px-5 sm:py-4">
                  <span
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border ${item.wrap}`}
                  >
                    <Icon className="h-5 w-5" />
                  </span>
                  <p className="text-[15px] font-semibold leading-snug text-[#0F172A]">
                    {item.text}
                  </p>
                </div>
              </FadeUp>
            </li>
          );
        })}
      </ul>
    </Section>
  );
}
