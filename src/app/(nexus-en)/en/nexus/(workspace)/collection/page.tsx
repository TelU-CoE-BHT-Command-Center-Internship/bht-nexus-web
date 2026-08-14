import type { Metadata } from "next";
import { NexusScraperSearch } from "@/components/nexus-scraper-search/nexus-scraper-search";
import { getNexusScraperSearchContent } from "@/components/nexus-scraper-search/nexus-scraper-search-content";

export const metadata: Metadata = {
  title: "Data Collection",
  description: "Manage public profile collection jobs in BHT Nexus.",
  robots: { follow: false, index: false },
};

export default function CollectionPage() {
  return <NexusScraperSearch content={getNexusScraperSearchContent("en")} />;
}
