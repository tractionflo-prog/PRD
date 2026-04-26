import { FadeUp } from "./FadeUp";
import { IconCheck, IconRocket, IconUsers } from "./icons";
import { Section } from "./Section";

const items = [
  {
    title: "You’ve launched something",
    description: "But the right people haven’t seen it yet.",
    Icon: IconRocket,
  },
  {
    title: "You’re looking for first users",
    description: "Not vanity traffic — real people with the problem.",
    Icon: IconUsers,
  },
  {
    title: "You want signal before scaling",
    description: "Learn what resonates before spending more time or money.",
    Icon: IconCheck,
  },
] as const;

export function WhoItsFor() {
  return (
    <Section className="relative overflow-x-clip bg-gradient-to-b from-slate-50 to-slate-100/70 py-28 sm:py-28">
      <div
        className="pointer-events-none absolute right-1/4 top-0 h-56 w-72 rounded-full bg-indigo-100/25 blur-3xl"
        aria-hidden
      />
      <FadeUp className="relative">
        <h2 className="mx-auto max-w-2xl text-balance text-center text-4xl font-semibold leading-tight tracking-tight text-[#0f172a] sm:text-5xl">
          Built for founders who are still validating
        </h2>
        <p className="mx-auto mt-5 max-w-2xl text-center text-lg leading-8 text-slate-600">
          Fewer dashboards. More proof the problem is real — and who feels it.
        </p>
      </FadeUp>

      <div className="relative mx-auto mt-12 max-w-6xl">
        <ul className="grid grid-cols-1 gap-5 md:grid-cols-3">
          {items.map((item, i) => {
            const Icon = item.Icon;
            return (
              <li key={item.title}>
                <FadeUp delay={0.09 * i}>
                  <div className="group h-full rounded-2xl border border-slate-200/70 bg-white p-6 shadow-sm transition-[transform,box-shadow] duration-200 ease-out can-hover:-translate-y-0.5 can-hover:shadow-md">
                    <span className="mb-4 flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[rgba(99,91,255,0.08)] text-[#635bff] ring-1 ring-[#635bff]/10">
                      <Icon className="h-6 w-6" />
                    </span>
                    <p className="text-[18px] font-semibold leading-snug text-[#0f172a]">
                      {item.title}
                    </p>
                    <p className="mt-2 text-[15px] leading-7 text-slate-600">
                      {item.description}
                    </p>
                  </div>
                </FadeUp>
              </li>
            );
          })}
        </ul>
        <FadeUp delay={0.14}>
          <p className="mt-8 text-center text-sm font-medium text-slate-500">
            This is designed for that stage.
          </p>
        </FadeUp>
      </div>
    </Section>
  );
}
