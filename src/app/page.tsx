import {
  BeliefShift,
  EmailCapture,
  FinalCta,
  Hero,
  HowItWorks,
  ProblemSection,
  ProductPreview,
  ValueSection,
  WhoItsFor,
} from "@/components/landing";

export default function Home() {
  return (
    <>
      <main className="relative min-h-screen bg-white text-[#0A0A0A] antialiased">
        <Hero />
        <ValueSection />
        <ProblemSection />
        <ProductPreview />
        <BeliefShift />
        <HowItWorks />
        <WhoItsFor />
        <FinalCta />
        <EmailCapture />
      </main>
    </>
  );
}
