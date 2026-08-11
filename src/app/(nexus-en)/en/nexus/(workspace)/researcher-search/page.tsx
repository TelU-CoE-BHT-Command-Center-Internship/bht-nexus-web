import type { Metadata } from "next";
import { NexusScraperSearch } from "@/components/nexus-scraper-search/nexus-scraper-search";
import { getNexusScraperSearchContent } from "@/components/nexus-scraper-search/nexus-scraper-search-content";

export const metadata: Metadata = {
  title: "Researcher Search",
  description:
    "Submit researcher collection jobs against SINTA and Google Scholar.",
  robots: {
    follow: false,
    index: false,
  },
};

export default function EnglishNexusResearcherSearchPage() {
  return <NexusScraperSearch content={getNexusScraperSearchContent("en")} />;
}
