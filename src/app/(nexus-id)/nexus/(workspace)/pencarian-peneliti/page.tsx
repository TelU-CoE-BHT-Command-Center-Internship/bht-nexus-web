import type { Metadata } from "next";
import { NexusScraperSearch } from "@/components/nexus-scraper-search/nexus-scraper-search";
import { getNexusScraperSearchContent } from "@/components/nexus-scraper-search/nexus-scraper-search-content";

export const metadata: Metadata = {
  title: "Pencarian Peneliti",
  description:
    "Pengiriman job pengumpulan data peneliti dari SINTA dan Google Scholar.",
  robots: {
    follow: false,
    index: false,
  },
};

export default function IndonesianNexusResearcherSearchPage() {
  return <NexusScraperSearch content={getNexusScraperSearchContent("id")} />;
}
