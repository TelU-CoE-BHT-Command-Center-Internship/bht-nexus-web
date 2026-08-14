import type { Metadata } from "next";
import { getNexusReviewSummaryContent } from "@/components/nexus-review-summary/nexus-review-summary-content";
import { NexusReviewWorkspace } from "@/components/nexus-review-workspace/nexus-review-workspace";
import { getNexusScraperResultsContent } from "@/components/nexus-scraper-results/nexus-scraper-results-content";

export const metadata: Metadata = {
  title: "Tinjauan Data",
  description: "Tinjau kandidat data sebelum menjadi data resmi BHT Nexus.",
  robots: {
    follow: false,
    index: false,
  },
};

export default function NexusReviewPage() {
  const publicationContent = getNexusReviewSummaryContent();
  const crossDomainContent = getNexusScraperResultsContent("id");

  return (
    <NexusReviewWorkspace
      crossDomainContent={crossDomainContent}
      locale="id"
      publicationContent={publicationContent}
    />
  );
}
