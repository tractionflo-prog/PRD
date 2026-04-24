import {
  BeliefShift,
  EmailCapture,
  FinalCta,
  Hero,
  ProblemSection,
  ProductPreview,
  ValueSection,
  WhenDemandQuietSection,
  WhoItsFor,
} from "@/components/landing";

export default function Home() {
  return (
    <>
      <main className="relative min-h-screen w-full max-w-[100vw] min-w-0 overflow-x-clip bg-[#f8fafc] text-[#0f172a] antialiased">
        <Hero />
        <ValueSection />
        <ProblemSection />
        <WhenDemandQuietSection />
        <ProductPreview />
        <BeliefShift />
        <WhoItsFor />
        <FinalCta />
        <EmailCapture />
      </main>
    </>
  );
}
