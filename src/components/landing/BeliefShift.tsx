import { FadeUp } from "./FadeUp";
import { IconChat, IconRadar, IconTrend } from "./icons";
import { Section } from "./Section";

const points = [
  {
    label: "You need conversations",
    icon: IconChat,
    wrap: "border-[#BFDBFE] bg-[#EFF6FF] text-[#2563EB]",
  },
  {
    label: "You need feedback",
    icon: IconRadar,
    wrap: "border-[#EDE9FE] bg-[#F5F3FF] text-[#7C3AED]",
  },
  {
    label: "You need momentum",
    icon: IconTrend,
    wrap: "border-[#BBF7D0] bg-[#F0FDF4] text-[#16A34A]",
  },
] as const;

export function BeliefShift() {
  return (
    <Section className="border-b border-[#ECECEC] bg-[#FAFAFA] py-20 sm:py-24 md:py-28 lg:py-32">
      <FadeUp>
        <div className="overflow-hidden rounded-2xl border border-[#E8E8E8] bg-white px-6 py-12 shadow-[0_1px_2px_rgba(0,0,0,0.04)] sm:px-10 sm:py-14 lg:px-14 lg:py-16">
          <h2 className="max-w-xl text-balance text-[1.75rem] font-semibold leading-tight tracking-tight text-[#0A0A0A] sm:text-3xl lg:text-[2.125rem]">
            You don’t need more{" "}
            <span className="text-[#7C3AED]">features</span>.
          </h2>

          <div className="mt-12 grid gap-6 sm:grid-cols-3 sm:gap-8 lg:mt-14">
            {points.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.label}
                  className="rounded-xl border border-[#F0F0F0] bg-[#FAFAFA] p-6 transition-shadow hover:shadow-md sm:p-7"
                >
                  <div
                    className={`mb-5 flex h-12 w-12 items-center justify-center rounded-full border shadow-sm ${item.wrap}`}
                  >
                    <Icon className="h-6 w-6" />
                  </div>
                  <p className="text-[1.125rem] font-semibold leading-snug tracking-tight text-[#0A0A0A] sm:text-xl">
                    {item.label}
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
