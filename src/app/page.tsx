import dynamic from "next/dynamic";
import { Hero } from "@/components/landing/Hero";

const CoreIdeaSection = dynamic(() =>
  import("@/components/landing/CoreIdeaSection").then((m) => ({ default: m.CoreIdeaSection })),
);
const ValueSection = dynamic(() =>
  import("@/components/landing/ValueSection").then((m) => ({ default: m.ValueSection })),
);
const DemandLoudQuietSection = dynamic(() =>
  import("@/components/landing/DemandLoudQuietSection").then((m) => ({
    default: m.DemandLoudQuietSection,
  })),
);
const ProductPreview = dynamic(() =>
  import("@/components/landing/ProductPreview").then((m) => ({ default: m.ProductPreview })),
);
const PositioningSection = dynamic(() =>
  import("@/components/landing/PositioningSection").then((m) => ({
    default: m.PositioningSection,
  })),
);
const FounderFitSection = dynamic(() =>
  import("@/components/landing/FounderFitSection").then((m) => ({ default: m.FounderFitSection })),
);
const EmailCapture = dynamic(() =>
  import("@/components/landing/EmailCapture").then((m) => ({ default: m.EmailCapture })),
);

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
