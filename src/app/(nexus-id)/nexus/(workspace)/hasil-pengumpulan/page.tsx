import type { Metadata } from "next";
import { NexusScraperResults } from "@/components/nexus-scraper-results/nexus-scraper-results";
import { getNexusScraperResultsContent } from "@/components/nexus-scraper-results/nexus-scraper-results-content";

export const metadata: Metadata = {
  title: "Hasil Pengumpulan",
  description: "Tinjauan kandidat staging hasil pengumpulan data BHT Nexus.",
  robots: {
    follow: false,
    index: false,
  },
};

export default function IndonesianNexusCollectionResultsPage() {
  return <NexusScraperResults content={getNexusScraperResultsContent("id")} />;
}
