import type { Metadata } from "next";
import { NexusMembersLive } from "@/components/nexus-members/nexus-members-live";

export const metadata: Metadata = {
  title: "Anggota",
  description: "Direktori dan profil anggota CoE BHT di BHT Nexus.",
  robots: {
    follow: false,
    index: false,
  },
};

export default function NexusMembersPage() {
  return <NexusMembersLive />;
}
