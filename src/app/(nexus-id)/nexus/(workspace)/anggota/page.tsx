import type { Metadata } from "next";
import { nexusPreviewWorkspaceAccess } from "@/components/nexus-dashboard-shell/nexus-workspace-access";
import {
  memberIdFromSearchParams,
  type NexusMemberFilteredPageProps,
} from "@/components/nexus-members/nexus-member-route";
import { NexusMembers } from "@/components/nexus-members/nexus-members";
import { getNexusMembersContent } from "@/components/nexus-members/nexus-members-content";

export const metadata: Metadata = {
  title: "Anggota",
  description: "Direktori dan profil anggota CoE BHT di BHT Nexus.",
  robots: {
    follow: false,
    index: false,
  },
};

export default async function NexusMembersPage({
  searchParams,
}: NexusMemberFilteredPageProps) {
  const content = getNexusMembersContent();
  const requestedMemberId = await memberIdFromSearchParams(searchParams);

  return (
    <NexusMembers
      capabilities={nexusPreviewWorkspaceAccess.memberCapabilities}
      content={content}
      initialMemberId={requestedMemberId}
    />
  );
}
