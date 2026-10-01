import type { Metadata } from "next";
import { NexusAcademic } from "@/components/nexus-academic/nexus-academic";
import { getNexusAcademicContent } from "@/components/nexus-academic/nexus-academic-content";
import { nexusWorkspaceCanOpen } from "@/components/nexus-dashboard-shell/nexus-workspace-access";
import { getNexusWorkspaceAccess } from "@/components/nexus-dashboard-shell/nexus-workspace-session";
import {
  memberIdFromSearchParams,
  type NexusMemberFilteredPageProps,
} from "@/components/nexus-members/nexus-member-route";

export const metadata: Metadata = {
  title: "Akademik",
  description: "Kegiatan akademik resmi CoE BHT pada BHT Nexus.",
  robots: {
    follow: false,
    index: false,
  },
};

export default async function NexusAcademicPage({
  searchParams,
}: NexusMemberFilteredPageProps) {
  const access = await getNexusWorkspaceAccess();
  const content = getNexusAcademicContent();
  const initialMemberId = await memberIdFromSearchParams(searchParams);

  return (
    <NexusAcademic
      canReadMembers={nexusWorkspaceCanOpen(access, "members")}
      content={content}
      initialMemberId={initialMemberId}
    />
  );
}
