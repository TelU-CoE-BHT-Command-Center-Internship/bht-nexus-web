import type { Metadata } from "next";
import { NexusIntellectualProperty } from "@/components/nexus-intellectual-property/nexus-intellectual-property";
import { getNexusIntellectualPropertyContent } from "@/components/nexus-intellectual-property/nexus-intellectual-property-content";
import {
  memberIdFromSearchParams,
  type NexusMemberFilteredPageProps,
} from "@/components/nexus-members/nexus-member-route";

export const metadata: Metadata = {
  title: "Kekayaan Intelektual",
  description: "Kekayaan intelektual resmi CoE BHT pada BHT Nexus.",
  robots: {
    follow: false,
    index: false,
  },
};

export default async function NexusIntellectualPropertyPage({
  searchParams,
}: NexusMemberFilteredPageProps) {
  const content = getNexusIntellectualPropertyContent();
  const initialMemberId = await memberIdFromSearchParams(searchParams);

  return (
    <NexusIntellectualProperty
      content={content}
      initialMemberId={initialMemberId}
    />
  );
}
