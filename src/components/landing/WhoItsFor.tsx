import { FadeUp } from "./FadeUp";
import { IconCheck, IconRocket, IconUsers } from "./icons";
import { Section } from "./Section";

const items = [
  {
    text: "You’ve launched something",
    Icon: IconRocket,
  },
  {
    text: "You’re looking for your first users",
    Icon: IconUsers,
  },
  {
    text: "You want signal before scaling",
    Icon: IconCheck,
  },
] as const;

export function WhoItsFor() {
  return (
    <Section className="bg-[#f8fafc] py-20 sm:py-24 md:py-28">
      <FadeUp>
        <h2 className="max-w-[26rem] text-[2.1rem] font-semibold leading-[1.1] tracking-tight text-[#0f172a] sm:max-w-[30rem] sm:text-[2.3rem] lg:text-[2.45rem]">
          Built for founders who are still validating
        </h2>
      </FadeUp>

      <div className="mx-auto mt-10 max-w-[980px] sm:mt-14">
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5">
          {items.map((item, i) => {
            const Icon = item.Icon;
            return (
              <li key={item.text}>
                <FadeUp delay={0.09 * i}>
                  <div
                    className={`group flex h-full items-center gap-3.5 rounded-2xl border border-[#e2e8f0] bg-white px-5 py-4 shadow-[0_24px_80px_-52px_rgba(15,23,42,0.1)] transition-[transform,box-shadow] duration-200 ease-out can-hover:hover:-translate-y-0.5 can-hover:hover:shadow-[0_28px_80px_-48px_rgba(15,23,42,0.12)] sm:px-5 sm:py-4 ${
                      i === 1 || i === 2 ? "sm:scale-[1.02]" : ""
                    }`}
                  >
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[rgba(99,91,255,0.08)] text-[#635bff] ring-1 ring-[#635bff]/10 transition-transform duration-200 ease-out can-hover:group-hover:-translate-y-0.5">
                      <Icon className="h-6 w-6" />
                    </span>
                    <p className="text-[15px] font-semibold leading-snug text-[#0f172a] transition-colors duration-200 ease-out can-hover:group-hover:text-[#0f172a]">
                      {item.text}
                    </p>
                  </div>
                </FadeUp>
              </li>
            );
          })}
        </ul>
        <FadeUp delay={0.14}>
          <p className="mt-10 max-w-[36rem] text-pretty text-[15px] font-medium leading-relaxed text-[#64748b] sm:mt-12 sm:text-[16px]">
            This is designed for that stage.
          </p>
        </FadeUp>
      </div>
    </Section>
  );
}
