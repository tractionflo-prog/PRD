import { Hero } from "@/components/landing/Hero";
import { Section } from "@/components/landing/Section";

export default function DemoPage() {
  return (
    <main className="relative min-h-screen w-full max-w-[100vw] min-w-0 overflow-x-clip bg-[#fafafa] text-slate-900 antialiased">
      <Section className="border-b border-slate-200/70 bg-white pb-8 pt-[calc(env(safe-area-inset-top,0px)+6.5rem)] sm:pt-[calc(env(safe-area-inset-top,0px)+7rem)]">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-600/90">See how it works</p>
          <h1 className="mt-4 text-balance text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
            Try the live preview
          </h1>
        </div>
      </Section>
      <Hero />
    </main>
  );
}
