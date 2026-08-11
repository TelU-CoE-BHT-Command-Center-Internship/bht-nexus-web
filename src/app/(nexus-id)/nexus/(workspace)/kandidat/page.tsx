import type { Metadata } from "next";
import { NexusScraperResults } from "@/components/nexus-scraper-results/nexus-scraper-results";
import { getNexusScraperResultsContent } from "@/components/nexus-scraper-results/nexus-scraper-results-content";

export const metadata: Metadata = {
  title: "Kandidat",
  description: "Kandidat peneliti yang menunggu tinjauan.",
  robots: {
    follow: false,
    index: false,
  },
};

export default function IndonesianNexusCollectionResultsPage() {
  return <NexusScraperResults content={getNexusScraperResultsContent("id")} />;
}
