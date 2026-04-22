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
    wrap: "text-[#2563EB]",
  },
  {
    text: "struggled to get users",
    Icon: IconUsers,
    wrap: "text-[#7C3AED]",
  },
  {
    text: "are tired of outreach that goes nowhere",
    Icon: IconMessage,
    wrap: "text-[#2563EB]",
  },
  {
    text: "want a simpler way to validate ideas",
    Icon: IconCheck,
    wrap: "text-[#16A34A]",
  },
] as const;

export function WhoItsFor() {
  return (
    <Section className="bg-[#F8FAFC] py-20">
      <FadeUp>
        <h2 className="max-w-[26rem] text-[2.1rem] font-semibold leading-[1.1] tracking-tight text-[#0A0A0A] sm:max-w-[30rem] sm:text-[2.3rem] lg:text-[2.45rem]">
          Built for founders who
        </h2>
      </FadeUp>

      <div className="mx-auto mt-10 max-w-[980px] sm:mt-12">
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5">
          {items.map((item, i) => {
            const Icon = item.Icon;
            return (
              <li key={item.text}>
                <FadeUp delay={0.04 * i}>
                  <div
                    className={`group flex h-full items-center gap-3.5 rounded-[14px] border border-transparent bg-white px-5 py-4 shadow-[0_8px_25px_rgba(0,0,0,0.04)] transition-all duration-200 hover:-translate-y-[3px] hover:shadow-[0_15px_40px_rgba(0,0,0,0.08)] sm:px-5 sm:py-4 ${
                      i === 1 || i === 2 ? "sm:scale-[1.03]" : ""
                    }`}
                  >
                    <span
                      className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[rgba(59,130,246,0.08)] shadow-[0_6px_20px_rgba(59,130,246,0.12)] transition-transform duration-200 group-hover:-translate-y-0.5 ${item.wrap}`}
                    >
                      <Icon className="h-6 w-6" />
                    </span>
                    <p className="text-[15px] font-semibold leading-snug text-[#1E293B] transition-colors duration-200 group-hover:text-[#0F172A]">
                      {item.text}
                    </p>
                  </div>
                </FadeUp>
              </li>
            );
          })}
        </ul>
      </div>
    </Section>
  );
}
