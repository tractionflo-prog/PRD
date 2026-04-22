import Image from "next/image";
import { FadeUp } from "./FadeUp";
import { ScrollCta } from "./ScrollCta";

const OVERLAY =
  "linear-gradient(90deg, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.6) 40%, rgba(0,0,0,0.25) 70%, rgba(0,0,0,0.05) 100%)";

export function Hero() {
  return (
    <section
      id="overview"
      className="relative isolate flex min-h-screen w-full min-w-0 flex-col overflow-hidden bg-[#0A0A0A] scroll-mt-24 supports-[min-height:100svh]:min-h-[100svh] sm:scroll-mt-20"
    >
      {/* Full-bleed background: relative box required for next/image fill on mobile WebKit */}
      <div
        className="pointer-events-none absolute inset-0 z-0 min-h-full w-full"
        aria-hidden
      >
        <div className="relative flex h-full min-h-screen w-full min-w-0 items-center justify-center bg-[#0A0A0A] supports-[min-height:100svh]:min-h-[100svh]">
          <Image
            src="/hero-mobile.png"
            alt=""
            fill
            priority
            sizes="100vw"
            quality={85}
            className="object-cover object-[right_center] md:hidden"
            decoding="async"
          />
          <Image
            src="/hero.png"
            alt=""
            fill
            priority
            sizes="100vw"
            quality={85}
            className="hidden object-cover object-[right_center] md:block lg:object-[center_22%]"
            decoding="async"
          />
        </div>
        <div
          className="absolute inset-0 z-[1] min-h-full w-full"
          style={{ background: OVERLAY }}
        />
      </div>

      <div className="relative z-10 mx-auto flex w-full min-w-0 max-w-[1200px] flex-1 flex-col justify-start px-5 pb-[max(5rem,env(safe-area-inset-bottom,0px))] pt-[calc(3.5rem+env(safe-area-inset-top,0px)+1.25rem)] sm:px-8 sm:pb-24 md:justify-center md:px-10 md:pb-28 md:pt-[calc(3.5rem+env(safe-area-inset-top,0px)+1.8rem)] lg:pb-32 lg:pt-24">
        <div className="max-w-[600px] min-w-0 text-left">
          <FadeUp>
            <h1 className="mt-5 max-w-[36rem] text-balance text-[1.9rem] font-semibold leading-[1.06] tracking-tight text-white [text-shadow:0_10px_30px_rgba(0,0,0,0.6)] sm:mt-6 sm:text-[2.6rem] sm:leading-[1.06] lg:text-[3.1rem] lg:leading-[1.05]">
              <span className="block">Your launch didn&apos;t fail.</span>
              <span className="mt-1 block sm:mt-0">It was ignored.</span>
            </h1>
          </FadeUp>

          <FadeUp delay={0.05} className="mt-5 sm:mt-6">
            <p className="text-pretty text-[1.13rem] font-medium leading-snug text-white/90 [text-shadow:0_10px_30px_rgba(0,0,0,0.6)] sm:text-[1.24rem]">
              Get your first real users — without cold outreach or guessing.
            </p>
          </FadeUp>

          <FadeUp
            delay={0.08}
            className="mt-4 space-y-2.5 text-[15px] leading-relaxed text-white/70 [text-shadow:0_10px_30px_rgba(0,0,0,0.6)] sm:text-[17px]"
          >
            <p className="text-pretty">
              We find people already looking for what you built.
            </p>
            <p className="text-pretty">
              You just approve the message. We handle the rest.
            </p>
          </FadeUp>

          <FadeUp delay={0.11} className="mt-11 flex flex-col gap-2.5 sm:mt-12">
            <div className="w-full max-w-full rounded-full shadow-[0_10px_30px_rgba(59,130,246,0.35)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_14px_40px_rgba(59,130,246,0.45)] sm:w-fit">
              <ScrollCta
                href="/#join"
                className="h-[52px] w-full max-w-full min-w-0 rounded-full !shadow-none px-[22px] text-[15px] font-semibold transition hover:bg-[#1D4ED8] sm:min-w-[12rem] sm:px-8"
              >
                Get my first users →
              </ScrollCta>
            </div>
            <p className="mt-1 text-[13px] text-white/60 [text-shadow:0_10px_30px_rgba(0,0,0,0.6)] sm:text-[14px]">
              Free • No spam • For early founders
            </p>
          </FadeUp>
        </div>
      </div>
    </section>
  );
}
