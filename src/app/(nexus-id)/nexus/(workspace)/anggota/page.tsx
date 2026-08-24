import type { Metadata } from "next";
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

export default function NexusMembersPage() {
  const content = getNexusMembersContent();

  return <NexusMembers content={content} />;
}
