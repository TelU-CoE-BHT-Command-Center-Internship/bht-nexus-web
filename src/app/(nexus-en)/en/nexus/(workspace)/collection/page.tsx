import type { Metadata } from "next";
import type { NexusCollectionRequest } from "@/components/nexus-scraper-search/nexus-scraper-search";
import { NexusScraperSearch } from "@/components/nexus-scraper-search/nexus-scraper-search";
import { getNexusScraperSearchContent } from "@/components/nexus-scraper-search/nexus-scraper-search-content";

export const metadata: Metadata = {
  title: "Data Collection",
  description: "Manage public profile collection jobs in BHT Nexus.",
  robots: { follow: false, index: false },
};

type CollectionPageProps = {
  searchParams: Promise<{
    member?: string | string[];
    name?: string | string[];
    scholar?: string | string[];
    sinta?: string | string[];
  }>;
};

function firstValue(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function CollectionPage({
  searchParams,
}: CollectionPageProps) {
  const params = await searchParams;
  const memberId = firstValue(params.member);
  const memberName = firstValue(params.name);
  const sintaUrl = firstValue(params.sinta);
  const scholarUrl = firstValue(params.scholar);
  const initialRequest: NexusCollectionRequest | undefined = memberId
    ? { memberId, memberName, scholarUrl, sintaUrl }
    : undefined;

  return (
    <NexusScraperSearch
      content={getNexusScraperSearchContent("en")}
      initialRequest={initialRequest}
    />
  );
}
