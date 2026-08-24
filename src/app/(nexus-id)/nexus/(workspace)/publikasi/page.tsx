import type { Metadata } from "next";
import {
  memberIdFromSearchParams,
  type NexusMemberFilteredPageProps,
} from "@/components/nexus-members/nexus-member-route";
import { NexusPublications } from "@/components/nexus-publications/nexus-publications";
import { getNexusPublicationsContent } from "@/components/nexus-publications/nexus-publications-content";

export const metadata: Metadata = {
  title: "Publikasi",
  description: "Koleksi publikasi resmi BHT Nexus.",
  robots: {
    follow: false,
    index: false,
  },
};

export default async function NexusPublicationsPage({
  searchParams,
}: NexusMemberFilteredPageProps) {
  const content = getNexusPublicationsContent();
  const initialMemberId = await memberIdFromSearchParams(searchParams);

  return (
    <NexusPublications content={content} initialMemberId={initialMemberId} />
  );
}
