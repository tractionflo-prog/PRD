import { FadeUp } from "./FadeUp";
import { IconChat, IconRadar, IconTrend } from "./icons";
import { Section } from "./Section";

const points = [
  {
    title: "Real users",
    icon: IconChat,
  },
  {
    title: "Real feedback",
    icon: IconRadar,
  },
  {
    title: "Real momentum",
    icon: IconTrend,
  },
] as const;

export function BeliefShift() {
  return (
    <Section className="bg-white py-20 sm:py-24 md:py-28 lg:py-32">
      <FadeUp>
        <h2 className="max-w-[36rem] text-balance text-[2.2rem] font-semibold leading-[1.07] tracking-tight text-[#0f172a] sm:text-[2.55rem] lg:text-[2.85rem]">
          Early growth comes from conversations, not features
        </h2>
        <div className="mt-6 max-w-[38rem] text-pretty text-[16px] leading-relaxed text-[#64748b] sm:text-[1.02rem]">
          <p className="font-normal">Before scaling:</p>
          <ul className="mt-3 list-none space-y-2 pl-0">
            <li className="flex gap-2">
              <span className="text-[#cbd5e1]" aria-hidden>
                —
              </span>
              <span>you need clarity</span>
            </li>
            <li className="flex gap-2">
              <span className="text-[#cbd5e1]" aria-hidden>
                —
              </span>
              <span>you need feedback</span>
            </li>
            <li className="flex gap-2">
              <span className="text-[#cbd5e1]" aria-hidden>
                —
              </span>
              <span>you need signal</span>
            </li>
          </ul>
          <p className="mt-6 font-medium text-[#0f172a]">Tractionflo helps you get that sooner.</p>
        </div>

        <div className="mt-14 grid gap-5 sm:mt-16 sm:grid-cols-3 sm:gap-6">
          {points.map((item, i) => {
            const Icon = item.icon;
            return (
              <FadeUp key={item.title} delay={0.09 * i} className="h-full">
                <div
                  className={`flex h-full flex-col rounded-2xl border border-[#e2e8f0] bg-white px-6 py-8 shadow-[0_24px_80px_-52px_rgba(15,23,42,0.12)] transition-[transform,box-shadow] duration-200 ease-out can-hover:hover:-translate-y-0.5 can-hover:hover:shadow-[0_28px_80px_-48px_rgba(15,23,42,0.14)] sm:px-7 sm:py-9 ${
                    i === 1 ? "sm:scale-[1.02]" : ""
                  }`}
                >
                  <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-xl bg-[rgba(99,91,255,0.08)] text-[#635bff] ring-1 ring-[#635bff]/10">
                    <Icon className="h-[34px] w-[34px]" />
                  </div>
                  <p className="text-[1.0625rem] font-semibold leading-snug tracking-tight text-[#0f172a] sm:text-lg">
                    {item.title}
                  </p>
                </div>
              </FadeUp>
            );
          })}
        </div>
      </FadeUp>
    </Section>
  );
}
