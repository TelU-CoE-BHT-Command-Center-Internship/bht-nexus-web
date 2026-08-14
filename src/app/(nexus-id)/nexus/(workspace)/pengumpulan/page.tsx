import type { Metadata } from "next";
import { NexusScraperSearch } from "@/components/nexus-scraper-search/nexus-scraper-search";
import { getNexusScraperSearchContent } from "@/components/nexus-scraper-search/nexus-scraper-search-content";

export const metadata: Metadata = {
  title: "Pengumpulan Data",
  description: "Kelola pekerjaan pengumpulan profil publik untuk BHT Nexus.",
  robots: { follow: false, index: false },
};

export default function CollectionPage() {
  return <NexusScraperSearch content={getNexusScraperSearchContent("id")} />;
}
