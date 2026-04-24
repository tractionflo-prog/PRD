import { FadeUp } from "./FadeUp";
import { Section } from "./Section";

export function WhenDemandQuietSection() {
  return (
    <Section
      id="when-demand-quiet"
      className="scroll-mt-24 border-y border-[#e2e8f0] bg-white py-20 sm:scroll-mt-20 sm:py-24 md:py-28"
    >
      <div className="mx-auto max-w-[42rem]">
        <FadeUp>
          <div className="rounded-2xl border border-[#e2e8f0] bg-white p-8 shadow-[0_24px_80px_-40px_rgba(15,23,42,0.1)] ring-1 ring-[#635bff]/10 sm:p-10">
            <h2 className="text-balance text-[1.85rem] font-semibold leading-[1.12] tracking-tight text-[#0f172a] sm:text-[2.1rem]">
              When demand isn&apos;t visible
            </h2>
            <p className="mt-5 text-pretty text-[17px] leading-relaxed text-[#64748b] sm:text-[1.05rem]">
              Not every problem shows up publicly. When we don&apos;t find strong conversations,
              Tractionflo still helps you move forward.
            </p>
            <ul className="mt-8 list-none space-y-3.5 pl-0 text-[16px] leading-relaxed text-[#64748b] sm:text-[1.02rem]">
              <li className="flex gap-3">
                <span
                  className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#635bff]"
                  aria-hidden
                />
                <span>Identify people likely facing the problem</span>
              </li>
              <li className="flex gap-3">
                <span
                  className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#635bff]"
                  aria-hidden
                />
                <span>Suggest thoughtful conversation starters</span>
              </li>
              <li className="flex gap-3">
                <span
                  className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#635bff]"
                  aria-hidden
                />
                <span>Keep every message human and manual</span>
              </li>
            </ul>
            <p className="mt-8 text-[15px] font-semibold leading-relaxed text-[#0f172a] sm:text-[16px]">
              No spam. No auto-send. No mass campaigns.
            </p>
          </div>
        </FadeUp>
      </div>
    </Section>
  );
}
