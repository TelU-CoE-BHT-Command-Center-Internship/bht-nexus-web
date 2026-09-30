import type { Metadata } from "next";
import { nexusWorkspaceCanOpen } from "@/components/nexus-dashboard-shell/nexus-workspace-access";
import { getNexusWorkspaceAccess } from "@/components/nexus-dashboard-shell/nexus-workspace-session";
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
  const access = await getNexusWorkspaceAccess();
  const { description, officialNote, title } = getNexusPublicationsContent();
  const initialMemberId = await memberIdFromSearchParams(searchParams);

  return (
    <NexusPublications
      canOpenReviews={nexusWorkspaceCanOpen(access, "reviews")}
      canReadMembers={nexusWorkspaceCanOpen(access, "members")}
      content={{ description, officialNote, title }}
      initialMemberId={initialMemberId}
    />
  );
}
