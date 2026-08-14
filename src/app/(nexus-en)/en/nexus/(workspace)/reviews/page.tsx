import type { Metadata } from "next";
import { NexusReviewWorkspace } from "@/components/nexus-review-workspace/nexus-review-workspace";
import { getNexusScraperResultsContent } from "@/components/nexus-scraper-results/nexus-scraper-results-content";

export const metadata: Metadata = {
  title: "Data Reviews",
  description: "Review data candidates before they become official.",
  robots: { follow: false, index: false },
};

export default function ReviewsPage() {
  return (
    <NexusReviewWorkspace
      crossDomainContent={getNexusScraperResultsContent("en")}
      locale="en"
    />
  );
}
