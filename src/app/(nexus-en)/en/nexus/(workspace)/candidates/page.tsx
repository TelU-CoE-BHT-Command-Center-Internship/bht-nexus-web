import type { Metadata } from "next";
import { NexusScraperResults } from "@/components/nexus-scraper-results/nexus-scraper-results";
import { getNexusScraperResultsContent } from "@/components/nexus-scraper-results/nexus-scraper-results-content";

export const metadata: Metadata = {
  title: "Candidates",
  description: "Researcher candidates awaiting review.",
  robots: {
    follow: false,
    index: false,
  },
};

export default function EnglishNexusCollectionResultsPage() {
  return <NexusScraperResults content={getNexusScraperResultsContent("en")} />;
}
