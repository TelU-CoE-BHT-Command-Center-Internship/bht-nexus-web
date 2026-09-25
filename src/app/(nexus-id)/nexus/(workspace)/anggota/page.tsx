import type { Metadata } from "next";
import {
  memberIdFromSearchParams,
  type NexusMemberFilteredPageProps,
} from "@/components/nexus-members/nexus-member-route";
import { NexusMembers } from "@/components/nexus-members/nexus-members";
import { getNexusMembersContent } from "@/components/nexus-members/nexus-members-content";
import { getNexusWorkspaceAccess } from "@/components/nexus-session/nexus-workspace-access-server";

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
      capabilities={{
        ...(await getNexusWorkspaceAccess()).memberCapabilities,
        /* Direktori Anggota masih memakai data contoh sehingga ID-nya belum
           dikenali Administrasi; penautan akun dilakukan dari daftar akun. */
        canGrantAccess: false,
      }}
      content={content}
      initialMemberId={requestedMemberId}
    />
  );
}
