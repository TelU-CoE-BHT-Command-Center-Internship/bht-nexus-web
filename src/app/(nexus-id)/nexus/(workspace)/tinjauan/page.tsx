import type { Metadata } from "next";
import { NexusReviewSummary } from "@/components/nexus-review-summary/nexus-review-summary";
import { getNexusReviewSummaryContent } from "@/components/nexus-review-summary/nexus-review-summary-content";

export const metadata: Metadata = {
  title: "Tinjauan Data",
  description: "Tinjau kandidat data sebelum menjadi data resmi BHT Nexus.",
  robots: {
    follow: false,
    index: false,
  },
};

export default function NexusReviewPage() {
  const content = getNexusReviewSummaryContent();

  return <NexusReviewSummary content={content} />;
}
