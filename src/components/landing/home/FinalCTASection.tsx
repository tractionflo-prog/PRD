import Image from "next/image";
import { Section } from "@/components/landing/Section";
import { WaitlistForm } from "@/components/landing/WaitlistForm";
import { FadeUp } from "@/components/landing/FadeUp";
import { portrait } from "@/lib/landing-portraits";

const faces = [portrait("women", 33), portrait("men", 45), portrait("women", 62), portrait("men", 12)] as const;

export function FinalCTASection() {
  return (
    <Section
      id="join"
      className="relative overflow-hidden scroll-mt-[calc(5.5rem+env(safe-area-inset-top,0px))] bg-[linear-gradient(180deg,#fafafa_0%,#f3f0ff_38%,#f8fafc_100%)] py-20 sm:py-24 md:py-32 lg:py-36"
    >
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-[min(72%,30rem)] bg-[radial-gradient(ellipse_80%_55%_at_50%_-5%,rgba(124,92,255,0.18),transparent_58%)]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute bottom-0 left-1/2 h-72 w-[min(100%,42rem)] -translate-x-1/2 bg-[radial-gradient(ellipse_at_50%_100%,rgba(99,102,241,0.14),transparent_68%)]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-300/12 blur-3xl"
        aria-hidden
      />

      <FadeUp className="relative mx-auto max-w-2xl px-1 text-center sm:px-0">
        <div className="mx-auto flex justify-center -space-x-2.5">
          {faces.map((src, i) => (
            <Image
              key={i}
              src={src}
              alt=""
              width={44}
              height={44}
              className="relative h-11 w-11 rounded-full border-[3px] border-white object-cover shadow-[0_4px_14px_rgba(0,0,0,0.1)] first:z-20"
              sizes="(max-width: 640px) 12vw, 44px"
            />
          ))}
        </div>

        <p className="mt-6 text-[11px] font-semibold uppercase tracking-[0.18em] text-indigo-600/90">Early access</p>
        <h2 className="mt-2 text-balance text-[clamp(1.45rem,4.2vw+0.5rem,2.2rem)] font-semibold leading-[1.12] tracking-[-0.035em] text-slate-900">
          Start your first real conversation today.
        </h2>

        <p className="mx-auto mt-5 max-w-md px-1 text-[16px] leading-relaxed text-slate-600 sm:mt-6 sm:px-0 sm:text-[17px] md:text-[18px]">
          10 people are already waiting.
        </p>
        <p className="mx-auto mt-2 max-w-md px-1 text-[16px] font-medium leading-relaxed text-slate-800 sm:px-0 sm:text-[17px] md:text-[18px]">
          You just need to show up.
        </p>

        <div className="final-cta-form-wrap group relative mx-auto mt-10 max-w-lg">
          <div
            className="pointer-events-none absolute -inset-4 rounded-[1.4rem] bg-gradient-to-r from-violet-400/30 via-indigo-400/22 to-violet-400/30 opacity-75 blur-2xl transition-opacity duration-500 ease-out group-focus-within:opacity-100 [@media(hover:hover)]:group-hover:opacity-95"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute -inset-px rounded-2xl bg-gradient-to-b from-white/55 to-transparent opacity-90"
            aria-hidden
          />
          <div className="relative rounded-2xl border border-slate-200/65 bg-white/78 p-1 shadow-[0_28px_56px_-32px_rgba(15,23,42,0.14),0_0_0_1px_rgba(255,255,255,0.88)_inset] ring-1 ring-slate-900/[0.04] backdrop-blur-xl transition-[box-shadow,border-color,background-color] duration-300 ease-out group-focus-within:border-indigo-300/55 group-focus-within:bg-white/92 group-focus-within:shadow-[0_32px_64px_-30px_rgba(99,102,241,0.22),0_0_0_1px_rgba(255,255,255,0.92)_inset,0_0_56px_-18px_rgba(124,92,255,0.2)] [@media(hover:hover)]:group-hover:border-indigo-200/65"
          >
            <div className="rounded-[0.9rem] bg-white/55 p-4 sm:p-5">
              <WaitlistForm
                source="final_cta"
                submitLabel="Join early access"
                prominentFocus
                submitButtonClassName="!h-[3.25rem] w-full !min-w-0 !px-5 !text-[15px] sm:!h-14 sm:!min-w-[12.5rem] sm:!w-auto sm:!px-10 sm:!text-[16px]"
              />
            </div>
          </div>
        </div>

        <p className="mt-6 text-[12px] font-medium tracking-wide text-slate-500">No spam · Early invites only · You send every message</p>
      </FadeUp>
    </Section>
  );
}
