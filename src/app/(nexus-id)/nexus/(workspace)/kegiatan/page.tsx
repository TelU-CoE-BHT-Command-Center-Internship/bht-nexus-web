import type { Metadata } from "next";
import { NexusActivities } from "@/components/nexus-activities/nexus-activities";
import { getNexusActivitiesContent } from "@/components/nexus-activities/nexus-activities-content";
import {
  memberIdFromSearchParams,
  type NexusMemberFilteredPageProps,
} from "@/components/nexus-members/nexus-member-route";

export const metadata: Metadata = {
  title: "Kegiatan & Pengabdian",
  description: "Kegiatan dan pengabdian resmi CoE BHT pada BHT Nexus.",
  robots: {
    follow: false,
    index: false,
  },
};

export default async function NexusActivitiesPage({
  searchParams,
}: NexusMemberFilteredPageProps) {
  const content = getNexusActivitiesContent();
  const initialMemberId = await memberIdFromSearchParams(searchParams);

  return (
    <NexusActivities content={content} initialMemberId={initialMemberId} />
  );
}
