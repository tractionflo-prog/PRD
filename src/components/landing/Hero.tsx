import { FadeUp } from "./FadeUp";
import { HeroMockup } from "./HeroMockup";
import { ScrollCta } from "./ScrollCta";
import { Section } from "./Section";

export function Hero() {
  return (
    <Section
      id="overview"
      className="scroll-mt-14 border-b border-[#ECECEC] bg-white pb-20 pt-14 sm:pb-24 sm:pt-16 md:pb-28 md:pt-20 lg:pb-32 lg:pt-24"
    >
      <div className="grid items-center gap-12 lg:grid-cols-[minmax(0,1.02fr)_minmax(0,1fr)] lg:gap-16 xl:gap-20">
        <div className="max-w-[32rem]">
          <FadeUp>
            <p className="inline-flex max-w-full items-center rounded-full border border-[#EDE9FE] bg-[#F5F3FF] px-3 py-1.5 text-[12px] font-medium tracking-wide text-[#7C3AED] sm:text-[13px]">
              Tractionflo · early access for founders
            </p>
            <h1 className="mt-4 text-balance text-[1.75rem] font-semibold leading-[1.12] tracking-tight text-[#0A0A0A] sm:mt-5 sm:text-[2.5rem] sm:leading-[1.1] lg:text-[3.25rem] lg:leading-[1.06]">
              Get your{" "}
              <span className="text-[#2563EB]">first users</span>
              {" "}— without doing all the outreach.
            </h1>
          </FadeUp>

          <FadeUp
            delay={0.05}
            className="mt-8 space-y-4 text-[17px] leading-relaxed text-[#6B7280] sm:text-lg"
          >
            <p className="text-pretty text-[#0A0A0A]">You built something.</p>
            <p className="text-pretty">
              But reaching users is slow, repetitive, and easy to quit.
            </p>
            <p className="text-pretty">
              We’re building a{" "}
              <span className="font-medium text-[#0A0A0A]">simpler way</span>{" "}
              to get your first users — without doing all the repetitive work
              yourself.
            </p>
          </FadeUp>

          <FadeUp
            delay={0.1}
            className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center"
          >
            <ScrollCta>Get early access</ScrollCta>
            <p className="text-[15px] text-[#6B7280] sm:pl-1">
              Free • No spam • For founders
            </p>
          </FadeUp>
        </div>

        <div className="w-full lg:justify-self-stretch">
          <HeroMockup />
        </div>
      </div>
    </Section>
  );
}
