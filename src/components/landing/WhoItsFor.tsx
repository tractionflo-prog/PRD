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
    text: "are tired of doing outreach manually",
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
    <Section className="border-b border-[#ECECEC] bg-[#FAFAFA] py-20 sm:py-24 md:py-28 lg:py-32">
      <FadeUp>
        <h2 className="text-[1.75rem] font-semibold leading-tight tracking-tight text-[#0A0A0A] sm:text-3xl lg:text-[2rem]">
          Built for founders who
        </h2>
      </FadeUp>

      <ul className="mt-10 grid gap-3 sm:mt-12 sm:grid-cols-2 lg:grid-cols-4 lg:gap-4">
        {items.map((item, i) => {
          const Icon = item.Icon;
          return (
            <li key={item.text}>
              <FadeUp delay={0.04 * i}>
                <div className="flex h-full items-center gap-3 rounded-xl border border-[#E8E8E8] bg-white px-4 py-3.5 shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-shadow hover:shadow-md sm:px-5 sm:py-4">
                  <span
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border ${item.wrap}`}
                  >
                    <Icon className="h-5 w-5" />
                  </span>
                  <p className="text-[15px] font-medium leading-snug text-[#0A0A0A]">
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
