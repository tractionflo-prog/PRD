import { FadeUp } from "./FadeUp";
import { HeroBackdrop } from "./HeroBackdrop";
import { ScrollCta } from "./ScrollCta";

const OVERLAY =
  "linear-gradient(90deg, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.6) 40%, rgba(0,0,0,0.25) 70%, rgba(0,0,0,0.05) 100%)";

export function Hero() {
  return (
    <section
      id="overview"
      className="relative isolate flex min-h-screen w-full min-w-0 flex-col overflow-hidden bg-[#0A0A0A] scroll-mt-32 supports-[min-height:100svh]:min-h-[100svh] sm:scroll-mt-24"
    >
      <div
        className="pointer-events-none absolute inset-0 z-0 min-h-full w-full"
        aria-hidden
      >
        <HeroBackdrop />
        <div
          className="absolute inset-0 z-[1] min-h-full w-full"
          style={{ background: OVERLAY }}
        />
      </div>

      <div className="relative z-10 mx-auto flex w-full min-w-0 max-w-[1200px] flex-1 flex-col justify-start px-5 pb-[max(5rem,env(safe-area-inset-bottom,0px))] pt-[calc(env(safe-area-inset-top,0px)+8.25rem)] max-md:pb-12 sm:px-8 md:justify-center md:px-10 md:pb-28 md:pt-[calc(3.75rem+env(safe-area-inset-top,0px)+1.75rem)] lg:pb-32 lg:pt-24">
        <div className="max-w-[min(100%,36rem)] min-w-0 text-left md:max-w-[600px]">
          <FadeUp preset="hero">
            <h1 className="mt-1 max-w-[36rem] text-balance text-[2.125rem] font-semibold leading-[1.08] tracking-tight text-white [text-shadow:0_10px_30px_rgba(0,0,0,0.6)] sm:mt-2 sm:text-[2.5rem] sm:leading-[1.06] lg:text-[3.1rem] lg:leading-[1.05]">
              Find the people already looking for what you built
            </h1>
          </FadeUp>

          <FadeUp preset="hero" delay={0.12} className="mt-5 sm:mt-6">
            <p className="max-w-[34rem] text-pretty text-[16px] font-medium leading-snug text-white/90 [text-shadow:0_10px_30px_rgba(0,0,0,0.6)] sm:text-[1.24rem]">
              <span className="block">
                Most products don&apos;t fail because they&apos;re bad —
              </span>
              <span className="mt-1 block">
                they fail because the right people never see them.
              </span>
            </p>
            <div className="mt-4 max-w-[34rem] text-pretty text-[15px] leading-relaxed text-white/70 [text-shadow:0_10px_30px_rgba(0,0,0,0.6)] sm:mt-5 sm:text-[17px]">
              <span className="block">
                Tractionflo surfaces real conversations where your product is
                already relevant,
              </span>
              <span className="mt-1 block">
                so you can respond at the right moment.
              </span>
            </div>
          </FadeUp>

          <FadeUp
            preset="hero"
            delay={0.24}
            className="mt-12 flex flex-col gap-3 sm:mt-14"
          >
            <div className="w-full max-w-full rounded-full shadow-[0_10px_30px_rgba(59,130,246,0.35)] transition-[transform,box-shadow] duration-200 ease-out can-hover:hover:-translate-y-0.5 can-hover:hover:shadow-[0_14px_40px_rgba(59,130,246,0.45)] sm:w-fit">
              <ScrollCta
                href="/#join"
                className="h-[52px] w-full max-w-full min-w-0 rounded-full !shadow-none px-[22px] text-[15px] font-semibold transition-colors duration-200 can-hover:hover:bg-[#1D4ED8] sm:min-w-[12rem] sm:px-8"
              >
                Get early access
              </ScrollCta>
            </div>
            <p className="max-w-[28rem] text-[13px] leading-snug text-white/60 [text-shadow:0_10px_30px_rgba(0,0,0,0.6)] sm:text-[14px]">
              For founders validating ideas and looking for their first users
            </p>
          </FadeUp>
        </div>
      </div>
    </section>
  );
}
