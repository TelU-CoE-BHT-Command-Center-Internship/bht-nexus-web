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
    profile?: string | string[];
    source?: string | string[];
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
  const profileUrl = firstValue(params.profile);
  const sourceValue = firstValue(params.source);
  const initialRequest: NexusCollectionRequest | undefined = memberId
    ? {
        memberId,
        memberName,
        profileUrl,
        source:
          sourceValue === "scholar" || sourceValue === "sinta"
            ? sourceValue
            : undefined,
      }
    : undefined;

  return (
    <NexusScraperSearch
      content={getNexusScraperSearchContent("en")}
      initialRequest={initialRequest}
    />
  );
}
