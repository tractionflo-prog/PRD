import { FadeUp } from "./FadeUp";
import { ScrollCta } from "./ScrollCta";
import { Section } from "./Section";

export function FinalCta() {
  return (
    <Section className="relative overflow-hidden bg-gradient-to-b from-white to-[#F7FAFF] py-20 sm:py-24 md:py-28 lg:py-32">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_0%,rgba(37,99,235,0.07),transparent_58%)]"
        aria-hidden
      />

      <div className="relative mx-auto max-w-2xl rounded-2xl bg-white/80 px-6 py-10 shadow-[0_16px_40px_-26px_rgba(15,23,42,0.28)] ring-1 ring-[#2563EB]/6 backdrop-blur-[1px] sm:px-8 sm:py-12 md:px-10 md:py-14">
        <FadeUp>
          <p className="text-[12px] font-semibold tracking-[0.16em] text-[#2563EB]">
            EARLY ACCESS
          </p>
          <h2 className="mt-4 text-balance text-[2rem] font-semibold leading-[1.12] tracking-tight text-[#0A0A0A] sm:text-[2.35rem] lg:text-[2.6rem]">
            We&apos;re rolling this out to early founders.
          </h2>
        </FadeUp>

        <FadeUp delay={0.05} className="mt-7">
          <p className="text-pretty text-[17px] leading-relaxed text-[#374151] sm:text-lg">
            If you built something and no one is using it yet — this is for
            you.
          </p>
        </FadeUp>

        <FadeUp
          delay={0.1}
          className="mt-11 flex flex-col items-start gap-2.5 sm:mt-12"
        >
          <ScrollCta className="h-[52px] px-10 text-[15px] font-semibold shadow-[0_12px_28px_-14px_rgba(37,99,235,0.62)]">
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
