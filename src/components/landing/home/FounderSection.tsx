import Image from "next/image";
import { Section } from "@/components/landing/Section";
import { FadeUp } from "@/components/landing/FadeUp";
import { IconRadar, IconSend, IconTimer } from "@/components/landing/icons";
import { portrait } from "@/lib/landing-portraits";

const founderFit = [
  {
    title: "You launched something and need first users",
    text: "A product, a beta, or a wedge that needs real traction.",
    Icon: IconRadar,
    faces: [portrait("men", 15), portrait("women", 28), portrait("men", 42)] as const,
  },
  {
    title: "You want real conversations, not vanity traffic",
    text: "You care about replies and learning, not empty clicks.",
    Icon: IconSend,
    faces: [portrait("women", 33), portrait("men", 55), portrait("women", 62)] as const,
  },
  {
    title: "You struggle to stay consistent with outreach",
    text: "You know the steps, but product work keeps pushing it back.",
    Icon: IconTimer,
    faces: [portrait("men", 72), portrait("women", 81), portrait("men", 19)] as const,
  },
] as const;

export function FounderSection() {
  return (
    <Section className="relative overflow-hidden bg-white py-16 sm:py-20 md:py-28">
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-64 bg-[radial-gradient(ellipse_80%_60%_at_50%_100%,rgba(124,92,255,0.08),transparent_70%)]"
        aria-hidden
      />
      <FadeUp className="relative mx-auto max-w-6xl rounded-[1.5rem] border border-slate-200/50 bg-[linear-gradient(180deg,#ffffff_0%,#fafbff_100%)] p-6 shadow-[0_10px_30px_rgba(0,0,0,0.05)] ring-1 ring-slate-100/80 sm:p-8">
        <h2 className="text-center text-[clamp(1.45rem,3vw,1.9rem)] font-semibold tracking-[-0.03em] text-slate-900">
          Built for founders
        </h2>
        <p className="mx-auto mt-2 max-w-lg text-center text-[15px] text-slate-600">
          Still validating — and ready for real signal.
        </p>
        <div className="mt-8 grid gap-4 sm:grid-cols-3 sm:gap-5">
          {founderFit.map((item) => (
            <article
              key={item.title}
              className="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-200/50 bg-gradient-to-b from-white to-slate-50/80 p-4 shadow-[0_10px_30px_rgba(0,0,0,0.04)] ring-1 ring-white/90 transition-[transform,box-shadow,border-color] duration-200 [@media(hover:hover)]:hover:-translate-y-1 [@media(hover:hover)]:hover:border-slate-300/80 [@media(hover:hover)]:hover:shadow-[0_16px_40px_-24px_rgba(15,23,42,0.1)]"
            >
              <div className="pointer-events-none absolute -right-12 -top-12 h-28 w-28 rounded-full bg-violet-200/20 blur-2xl transition-opacity duration-300 group-hover:opacity-100" aria-hidden />
              <div className="relative flex items-start justify-between gap-2">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 text-white shadow-md ring-2 ring-white/80">
                  <item.Icon className="h-[1.1rem] w-[1.1rem]" strokeWidth={2.25} />
                </span>
                <div className="flex -space-x-1.5 pt-0.5">
                  {item.faces.map((src, i) => (
                    <Image
                      key={i}
                      src={src}
                      alt=""
                      width={26}
                      height={26}
                      className="h-[26px] w-[26px] rounded-full border-2 border-white object-cover shadow-sm ring-1 ring-slate-200/40"
                      sizes="26px"
                    />
                  ))}
                </div>
              </div>
              <h3 className="relative mt-4 text-[14px] font-semibold leading-snug tracking-tight text-slate-900">{item.title}</h3>
              <p className="relative mt-2 text-[13px] leading-relaxed text-slate-600">{item.text}</p>
            </article>
          ))}
        </div>
      </FadeUp>
    </Section>
  );
}
