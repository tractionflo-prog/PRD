import {
  CoreIdeaSection,
  DemandLoudQuietSection,
  EmailCapture,
  FounderFitSection,
  Hero,
  PositioningSection,
  ProductPreview,
  ValueSection,
} from "@/components/landing";

export default function Home() {
  return (
    <>
      <main className="relative min-h-screen w-full max-w-[100vw] min-w-0 overflow-x-clip bg-[#fafafa] text-slate-900 antialiased">
        <Hero />
        <CoreIdeaSection />
        <ValueSection />
        <DemandLoudQuietSection />
        <ProductPreview />
        <PositioningSection />
        <FounderFitSection />
        <EmailCapture />
      </main>
    </>
  );
}
