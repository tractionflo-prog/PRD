import { FadeUp } from "./FadeUp";
import { ScrollCta } from "./ScrollCta";
import { Section } from "./Section";

export function FinalCta() {
  return (
    <Section className="relative overflow-hidden border-b border-[#ECECEC] bg-white py-24 sm:py-28 md:py-32">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_90%_70%_at_50%_0%,rgba(37,99,235,0.06),transparent_55%)]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.35]"
        style={{
          backgroundImage: `radial-gradient(circle at center, #D4D4D4 1px, transparent 1px)`,
          backgroundSize: "24px 24px",
        }}
        aria-hidden
      />

      <div className="relative mx-auto max-w-2xl text-center">
        <FadeUp>
          <h2 className="text-balance text-[1.75rem] font-semibold leading-tight tracking-tight text-[#0A0A0A] sm:text-3xl lg:text-[2.125rem]">
            Before you give up on another idea…
          </h2>
        </FadeUp>
        <FadeUp
          delay={0.05}
          className="mt-5 text-[17px] leading-relaxed text-[#6B7280] sm:mt-6 sm:text-lg"
        >
          Let the system help you get your{" "}
          <span className="font-medium text-[#2563EB]">first users</span>.
        </FadeUp>
        <FadeUp
          delay={0.1}
          className="mt-10 flex flex-col items-center gap-4 sm:gap-5"
        >
          <ScrollCta>Get early access</ScrollCta>
          <p className="text-[15px] text-[#6B7280]">
            Be one of the first founders to try it
          </p>
        </FadeUp>
      </div>
    </Section>
  );
}
