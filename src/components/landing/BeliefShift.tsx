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
    <Section className="bg-[#F9FAFC] py-20 sm:py-24 md:py-28 lg:py-32">
      <FadeUp>
        <div className="mx-auto max-w-[980px] overflow-hidden rounded-[20px] border border-[#E7EDF5] bg-[#F8FAFC] px-7 py-12 shadow-[0_20px_60px_rgba(0,0,0,0.06)] sm:px-12 sm:py-14 md:px-[60px] md:py-[60px]">
          <h2 className="max-w-[34rem] text-balance text-[2.2rem] font-semibold leading-[1.07] tracking-tight text-[#0A0A0A] sm:text-[2.55rem] lg:text-[2.85rem]">
            <span className="block">You don&apos;t need more features.</span>
            <span className="mt-1 block sm:mt-1.5">You need conversations.</span>
          </h2>
          <p className="mt-5 max-w-[38rem] text-pretty text-[16px] leading-relaxed text-[#334155]/78 sm:text-[1.02rem]">
            <span className="block text-[14px] font-medium uppercase tracking-[0.08em] text-[#334155]/60">
              What early products actually need:
            </span>
            <span className="mt-2 block">
              Real users, real feedback, real momentum.
            </span>
          </p>

          <div className="mt-12 grid gap-5 sm:mt-14 sm:grid-cols-3 sm:gap-6">
            {points.map((item, i) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.title}
                  className={`flex flex-col rounded-2xl border border-transparent bg-white px-6 py-7 shadow-[0_10px_30px_rgba(0,0,0,0.05)] transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_20px_50px_rgba(0,0,0,0.08)] sm:px-7 sm:py-8 ${
                    i === 1 ? "sm:scale-[1.03] sm:shadow-[0_20px_60px_rgba(0,0,0,0.08)]" : ""
                  }`}
                >
                  <div className="mb-7 flex h-16 w-16 items-center justify-center rounded-xl bg-[rgba(59,130,246,0.08)] text-[#2563EB] shadow-[0_6px_20px_rgba(59,130,246,0.12)]">
                    <Icon className="h-[34px] w-[34px]" />
                  </div>
                  <p className="text-[1.0625rem] font-semibold leading-snug tracking-tight text-[#0A0A0A] sm:text-lg">
                    {item.title}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </FadeUp>
    </Section>
  );
}
