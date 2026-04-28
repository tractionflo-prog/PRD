import { Section } from "@/components/landing/Section";
import { FadeUp } from "@/components/landing/FadeUp";

const beforeItems = [
  "Searching manually",
  "Forgetting follow-ups",
  "Sending cold generic messages",
  "No idea what is working",
] as const;

const afterItems = [
  "Leads ready every day",
  "Human messages drafted",
  "Replies tracked",
  "Momentum visible",
] as const;

function ListCard({
  title,
  tone,
  items,
}: {
  title: string;
  tone: "before" | "after";
  items: readonly string[];
}) {
  const isAfter = tone === "after";
  return (
    <div
      className={`relative flex flex-col overflow-hidden rounded-[1.5rem] border p-6 shadow-[0_24px_48px_-28px_rgba(15,23,42,0.12)] ring-1 ring-white/80 backdrop-blur-sm sm:rounded-[1.75rem] sm:p-8 ${
        isAfter
          ? "border-violet-200/50 bg-gradient-to-b from-white via-white to-violet-50/40"
          : "border-slate-200/70 bg-gradient-to-b from-slate-50/90 to-white/95"
      }`}
    >
      <div
        className={`pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full blur-3xl ${
          isAfter ? "bg-violet-400/15" : "bg-slate-400/10"
        }`}
        aria-hidden
      />
      <p
        className={`relative text-[11px] font-semibold uppercase tracking-[0.2em] ${
          isAfter ? "text-violet-700/90" : "text-slate-500"
        }`}
      >
        {title}
      </p>
      <ul className="relative mt-6 space-y-4">
        {items.map((line) => (
          <li key={line} className="flex gap-3 text-[15px] leading-snug text-slate-700 sm:text-[16px]">
            <span
              className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${
                isAfter ? "bg-violet-500 shadow-[0_0_0_4px_rgba(139,92,246,0.15)]" : "bg-slate-300 ring-2 ring-slate-200/80"
              }`}
              aria-hidden
            />
            <span className="min-w-0">{line}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function BeforeAfterSection() {
  return (
    <Section className="relative overflow-hidden bg-white py-20 sm:py-24 md:py-32">
      <div
        className="pointer-events-none absolute inset-x-0 top-1/2 h-[min(70%,28rem)] -translate-y-1/2 bg-[radial-gradient(ellipse_80%_60%_at_50%_50%,rgba(124,92,255,0.06),transparent_70%)]"
        aria-hidden
      />
      <FadeUp className="relative mx-auto max-w-6xl px-1 sm:px-0">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-balance text-[clamp(1.5rem,3.5vw,2.25rem)] font-semibold leading-[1.12] tracking-[-0.03em] text-slate-900">
            Before Tractionflo, distribution feels random.
            <span className="mt-2 block text-slate-700">After Tractionflo, it becomes a daily system.</span>
          </h2>
        </div>

        <div className="mt-14 grid gap-6 md:mt-16 md:grid-cols-2 md:gap-8 lg:gap-10">
          <ListCard title="Before" tone="before" items={beforeItems} />
          <ListCard title="After" tone="after" items={afterItems} />
        </div>
      </FadeUp>
    </Section>
  );
}
