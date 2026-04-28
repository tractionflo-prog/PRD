import Image from "next/image";
import { Section } from "@/components/landing/Section";
import { FadeUp } from "@/components/landing/FadeUp";
import { IconCheck } from "@/components/landing/icons";
import { portrait } from "@/lib/landing-portraits";

const people = [
  { name: "Marcus", status: "Ready", src: portrait("men", 32) },
  { name: "Rina", status: "Draft", src: portrait("women", 44) },
  { name: "Alex", status: "Sent", src: portrait("men", 67) },
  { name: "Jared", status: "Reply", src: portrait("men", 21) },
] as const;

export function ProductPreviewSection() {
  return (
    <Section id="preview" className="relative overflow-hidden bg-[linear-gradient(180deg,#fafafa_0%,#faf8ff_40%,#ffffff_100%)] py-16 sm:py-20 md:py-28">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-80 bg-[radial-gradient(ellipse_70%_50%_at_50%_0%,rgba(124,92,255,0.1),transparent_68%)]"
        aria-hidden
      />
      <div className="relative mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-14">
        <FadeUp className="relative">
          <div className="pointer-events-none absolute -inset-3 rounded-[1.75rem] bg-gradient-to-br from-violet-200/25 via-transparent to-indigo-200/20 blur-2xl" aria-hidden />
          <div className="relative rounded-[1.5rem] border border-slate-200/55 bg-white/65 p-1.5 shadow-[0_10px_30px_rgba(0,0,0,0.08),0_32px_64px_-40px_rgba(15,23,42,0.12)] ring-1 ring-white/80 backdrop-blur-xl transition-[transform,box-shadow] duration-300 ease-out [@media(hover:hover)]:hover:-translate-y-1 [@media(hover:hover)]:hover:shadow-[0_14px_36px_rgba(0,0,0,0.1),0_36px_72px_-36px_rgba(99,102,241,0.18)]">
            <div className="rounded-[1.25rem] border border-slate-200/45 bg-slate-50/50 p-3 sm:p-4">
              <div className="grid gap-3 sm:grid-cols-[minmax(0,0.32fr)_1fr]">
                <aside className="rounded-xl border border-white/80 bg-white/75 p-3 shadow-sm ring-1 ring-slate-200/35 backdrop-blur-md">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">Workspace</p>
                  <div className="mt-2 space-y-0.5">
                    {["Inbox", "Drafts", "Sent", "Skipped"].map((item) => (
                      <p
                        key={item}
                        className="rounded-lg px-2 py-1.5 text-[12px] font-medium text-slate-600 transition-colors [@media(hover:hover)]:hover:bg-slate-100/80"
                      >
                        {item}
                      </p>
                    ))}
                  </div>
                </aside>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-xl border border-white/80 bg-white/78 p-3 shadow-sm ring-1 ring-slate-200/35 backdrop-blur-md transition-shadow duration-200 [@media(hover:hover)]:hover:shadow-md">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">People</p>
                    <div className="mt-2.5 space-y-1.5">
                      {people.map((row) => (
                        <div
                          key={row.name}
                          className="flex items-center justify-between gap-2 rounded-lg border border-slate-100/90 bg-slate-50/60 px-2 py-1.5 transition-[background-color,transform] duration-200 [@media(hover:hover)]:hover:-translate-y-0.5 [@media(hover:hover)]:hover:bg-white/90 [@media(hover:hover)]:hover:shadow-sm"
                        >
                          <div className="flex min-w-0 items-center gap-2">
                            <Image
                              src={row.src}
                              alt=""
                              width={24}
                              height={24}
                              className="h-6 w-6 shrink-0 rounded-full object-cover ring-2 ring-white shadow-sm"
                              sizes="24px"
                            />
                            <p className="truncate text-[12px] font-semibold text-slate-900">{row.name}</p>
                          </div>
                          <span className="shrink-0 rounded-full bg-slate-200/90 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-slate-700">
                            {row.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="rounded-xl border border-white/80 bg-white/78 p-3 shadow-sm ring-1 ring-slate-200/35 backdrop-blur-md transition-shadow duration-200 [@media(hover:hover)]:hover:shadow-md">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">Draft</p>
                    <p className="mt-2 text-[12px] leading-relaxed text-slate-700">
                      Hey Marcus — saw your post on tenant tracking. Built something for this. Happy to share if useful.
                    </p>
                    <button
                      type="button"
                      className="mt-3 inline-flex h-8 items-center rounded-lg bg-[#7C5CFF] px-3 text-[11px] font-semibold text-white shadow-[0_8px_20px_-10px_rgba(124,92,255,0.5)] transition-[transform,box-shadow] duration-200 [@media(hover:hover)]:hover:-translate-y-px [@media(hover:hover)]:hover:shadow-[0_12px_24px_-10px_rgba(124,92,255,0.45)]"
                    >
                      Copy
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </FadeUp>
        <FadeUp delay={0.06} className="space-y-6">
          <div>
            <h2 className="text-balance text-[clamp(1.85rem,3vw,2.35rem)] font-semibold tracking-[-0.035em] text-slate-900 sm:leading-[1.1]">
              Everything ready.
              <span className="block text-slate-600">You just send.</span>
            </h2>
            <p className="mt-4 max-w-md text-[17px] leading-relaxed text-slate-600">
              One surface: who to reach, what to say, what came back.
            </p>
          </div>

          <div className="relative overflow-hidden rounded-2xl border border-slate-200/70 bg-gradient-to-br from-slate-50/90 via-white to-white/90 p-5 shadow-[0_10px_30px_rgba(0,0,0,0.06)] ring-1 ring-white/90">
            <div className="pointer-events-none absolute -right-8 top-0 h-32 w-32 rounded-full bg-violet-300/25 blur-2xl" aria-hidden />
            <div className="relative flex gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white/90 text-slate-600 shadow-sm ring-1 ring-slate-200/80">
                <IconCheck className="h-5 w-5" strokeWidth={2.25} />
              </span>
              <div>
                <p className="text-[13px] font-semibold text-slate-900">Tractionflo never auto-sends.</p>
                <p className="mt-1.5 text-[13px] leading-relaxed text-slate-600">
                  You approve, edit, copy, and send from your own account.
                </p>
              </div>
            </div>
          </div>
        </FadeUp>
      </div>
    </Section>
  );
}
