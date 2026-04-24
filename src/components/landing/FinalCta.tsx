import { FadeUp } from "./FadeUp";
import { ScrollCta } from "./ScrollCta";
import { Section } from "./Section";

export function FinalCta() {
  return (
    <Section className="relative overflow-hidden bg-white py-20 sm:py-24 md:py-28 lg:py-32">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_85%_0%,rgba(99,91,255,0.06),transparent_55%),radial-gradient(ellipse_60%_40%_at_100%_40%,rgba(59,130,246,0.04),transparent_50%)]"
        aria-hidden
      />

      <div className="relative mx-auto max-w-2xl rounded-2xl border border-[#e2e8f0] bg-white px-6 py-10 shadow-[0_24px_80px_-40px_rgba(15,23,42,0.1)] sm:px-8 sm:py-12 md:px-10 md:py-14">
        <FadeUp>
          <p className="text-[12px] font-semibold tracking-[0.16em] text-[#635bff]">EARLY ACCESS</p>
          <h2 className="mt-4 text-balance text-[2rem] font-semibold leading-[1.12] tracking-tight text-[#0f172a] sm:text-[2.35rem] lg:text-[2.6rem]">
            Start with real conversations
          </h2>
        </FadeUp>

        <FadeUp delay={0.05} className="mt-7">
          <p className="text-pretty text-[17px] leading-relaxed text-[#64748b] sm:text-lg">
            Try the preview above. If it finds signal, you&apos;ll see who&apos;s already asking. If
            not, we&apos;ll show who to talk to next.
          </p>
        </FadeUp>

        <FadeUp delay={0.1} className="mt-11 flex flex-col items-start gap-2.5 sm:mt-12">
          <ScrollCta
            href="/#join"
            variant="primary"
            className="h-[52px] border border-[#5249e6]/15 bg-[#635bff] px-10 text-[15px] font-semibold shadow-[0_12px_28px_-14px_rgba(99,91,255,0.45)] can-hover:hover:bg-[#5851ea]"
          >
            Join early access
          </ScrollCta>
          <p className="text-[13px] text-[#94a3b8] sm:text-[14px]">
            Founder waitlist · we&apos;ll email when invites open
          </p>
        </FadeUp>
      </div>
    </Section>
  );
}
