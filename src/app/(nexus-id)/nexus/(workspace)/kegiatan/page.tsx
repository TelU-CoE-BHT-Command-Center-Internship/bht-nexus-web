import type { Metadata } from "next";
import { NexusActivities } from "@/components/nexus-activities/nexus-activities";
import { getNexusActivitiesContent } from "@/components/nexus-activities/nexus-activities-content";
import { nexusWorkspaceCanOpen } from "@/components/nexus-dashboard-shell/nexus-workspace-access";
import { getNexusWorkspaceAccess } from "@/components/nexus-dashboard-shell/nexus-workspace-session";
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
  const access = await getNexusWorkspaceAccess();
  const { description, officialNote, title } = getNexusActivitiesContent();
  const initialMemberId = await memberIdFromSearchParams(searchParams);

  return (
    <NexusActivities
      canOpenReviews={nexusWorkspaceCanOpen(access, "reviews")}
      canReadMembers={nexusWorkspaceCanOpen(access, "members")}
      content={{ description, officialNote, title }}
      initialMemberId={initialMemberId}
    />
  );
}
