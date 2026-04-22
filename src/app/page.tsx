import {
  BeliefShift,
  EmailCapture,
  FinalCta,
  Hero,
  ProblemSection,
  ProductPreview,
  ValueSection,
  WhoItsFor,
} from "@/components/landing";

export default function Home() {
  return (
    <>
      <main className="relative min-h-screen w-full max-w-[100vw] min-w-0 overflow-x-clip bg-white text-[#0A0A0A] antialiased">
        <Hero />
        <ValueSection />
        <ProblemSection />
        <ProductPreview />
        <BeliefShift />
        <WhoItsFor />
        <FinalCta />
        <EmailCapture />
      </main>
    </>
  );
}
