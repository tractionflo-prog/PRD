import type { Metadata } from "next";
import { DemandMvpClient } from "./DemandMvpClient";

export const metadata: Metadata = {
  title: "Find demand",
  description:
    "Generate Reddit search queries, surface high-intent threads, and draft natural replies — manual posting only.",
};

export default function DemandPage() {
  return <DemandMvpClient />;
}
