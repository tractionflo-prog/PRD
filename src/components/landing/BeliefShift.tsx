import { FadeUp } from "./FadeUp";
import { IconChat, IconRadar, IconTrend } from "./icons";
import { Section } from "./Section";

export function BeliefShift() {
  return (
    <Section className="relative overflow-x-clip bg-white py-28 sm:py-28">
      <div
        className="pointer-events-none absolute left-0 top-1/2 h-64 w-64 -translate-y-1/2 rounded-full bg-slate-200/30 blur-3xl"
        aria-hidden
      />
      <div className="relative grid items-start gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:gap-14">
        <FadeUp>
          <h2 className="max-w-[34rem] text-balance text-4xl font-semibold leading-tight tracking-tight text-slate-950 sm:text-5xl">
            Early growth comes from conversations, not features
          </h2>
          <div className="mt-6 max-w-[34rem] text-pretty text-base leading-8 text-slate-600 sm:text-lg">
            <p>Before scaling, you need:</p>
            <p className="mt-3 font-medium text-slate-950">
              clarity
              <br />
              feedback
              <br />
              signal
            </p>
            <p className="mt-6 font-medium text-slate-950">Real conversations get you there faster.</p>
          </div>
        </FadeUp>

        <div className="grid gap-4">
          {[
            {
              title: "Real users",
              description: "Find people close enough to the problem to care.",
              icon: IconChat,
            },
            {
              title: "Real feedback",
              description: "Start conversations that teach you what to build next.",
              icon: IconRadar,
            },
            {
              title: "Real momentum",
              description: "Turn silent launches into visible progress.",
              icon: IconTrend,
            },
          ].map((item, i) => {
            const Icon = item.icon;
            return (
              <FadeUp key={item.title} delay={0.08 * i} className="h-full">
                <div className="flex h-full rounded-2xl border border-slate-200/70 bg-white p-6 shadow-sm transition-[transform,box-shadow] duration-200 ease-out can-hover:-translate-y-0.5 can-hover:shadow-md">
                  <div className="mr-4 flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[rgba(99,91,255,0.08)] text-[#635bff] ring-1 ring-[#635bff]/10">
                    <Icon className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-lg font-semibold leading-snug tracking-tight text-[#0f172a]">
                      {item.title}
                    </p>
                    <p className="mt-1.5 text-[15px] leading-7 text-[#64748b]">
                      {item.description}
                    </p>
                  </div>
                </div>
              </FadeUp>
            );
          })}
        </div>
      </div>
    </Section>
  );
}
