import { FadeUp } from "./FadeUp";
import { ScrollCta } from "./ScrollCta";
import { Section } from "./Section";

export function FinalCta() {
  return (
    <Section className="relative overflow-hidden border-b border-[#ECECEC] bg-white py-16 sm:py-20 md:py-24">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_0%,rgba(37,99,235,0.07),transparent_58%)]"
        aria-hidden
      />

      <div className="relative mx-auto max-w-xl">
        <FadeUp>
          <p className="text-[12px] font-semibold tracking-[0.16em] text-[#2563EB]">
            EARLY ACCESS
          </p>
          <h2 className="mt-4 text-balance text-[1.875rem] font-semibold leading-[1.15] tracking-tight text-[#0A0A0A] sm:text-[2.125rem] lg:text-[2.25rem]">
            We&apos;re rolling this out to early founders.
          </h2>
        </FadeUp>

        <FadeUp delay={0.05} className="mt-6">
          <p className="text-pretty text-[17px] leading-relaxed text-[#374151] sm:text-lg">
            If you built something and no one is using it yet — this is for
            you.
          </p>
        </FadeUp>

        <FadeUp
          delay={0.1}
          className="mt-10 flex flex-col items-start gap-2 sm:mt-11"
        >
          <ScrollCta className="h-12 px-8 text-[15px] font-semibold shadow-[0_4px_14px_rgba(37,99,235,0.35)]">
            Get early access
          </ScrollCta>
          <p className="text-[14px] text-[#64748B] sm:text-[15px]">
            Free • No spam • For founders
          </p>
        </FadeUp>
      </div>
    </Section>
  );
}
