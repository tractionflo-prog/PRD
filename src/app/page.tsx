import {
  BeforeAfterSection,
  DemandSection,
  FeatureStrip,
  FinalCTASection,
  FounderSection,
  HeroSection,
  ProblemHowItWorks,
  ProductPreviewSection,
  WorkflowCard,
} from "@/components/landing/home";

export default function Home() {
  return (
    <main className="relative min-h-screen w-full max-w-[100vw] min-w-0 overflow-x-clip bg-[linear-gradient(180deg,#fafafa_0%,#ffffff_35%,#f5f3ff_55%,#f6f7fb_100%)] text-slate-900 antialiased">
      <HeroSection />
      <FeatureStrip />
      <BeforeAfterSection />
      <ProblemHowItWorks />
      <DemandSection />
      <WorkflowCard />
      <ProductPreviewSection />
      <FounderSection />
      <FinalCTASection />
    </main>
  );
}
