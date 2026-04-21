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
    <Section className="border-b border-[#ECECEC] bg-[#FAFAFA] py-14 sm:py-16 md:py-20">
      <FadeUp>
        <div className="overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white px-6 py-10 shadow-[0_1px_3px_rgba(15,23,42,0.05)] sm:px-10 sm:py-12 md:px-12 md:py-14">
          <h2 className="max-w-[36rem] text-balance text-[1.875rem] font-semibold leading-[1.12] tracking-tight text-[#0A0A0A] sm:text-[2.125rem] lg:text-[2.25rem]">
            <span className="block">You don&apos;t need more features.</span>
            <span className="mt-1 block sm:mt-1.5">You need conversations.</span>
          </h2>
          <p className="mt-4 max-w-[40rem] text-pretty text-[17px] leading-relaxed text-[#374151] sm:text-lg">
            <span className="block font-medium text-[#0F172A]">
              What early products actually need:
            </span>
            <span className="mt-1 block">
              Real users, real feedback, real momentum.
            </span>
          </p>

          <div className="mt-8 grid gap-4 sm:mt-10 sm:grid-cols-3 sm:gap-5">
            {points.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.title}
                  className="flex flex-col rounded-xl border border-[#E8E8E8] bg-[#FAFAFA] px-5 py-6 transition-shadow hover:border-[#E0E7FF] hover:shadow-[0_12px_32px_-20px_rgba(37,99,235,0.15)] sm:px-6 sm:py-7"
                >
                  <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-[#BFDBFE] bg-white text-[#2563EB] shadow-[0_4px_12px_-4px_rgba(37,99,235,0.25)]">
                    <Icon className="h-7 w-7" />
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
