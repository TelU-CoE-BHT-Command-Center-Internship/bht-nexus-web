import type { Metadata } from "next";
import { NexusProfile } from "@/components/nexus-profile/nexus-profile";

export const metadata: Metadata = {
  title: "Profil Saya",
  description: "Informasi pribadi dan akun BHT Nexus yang Anda gunakan.",
  robots: {
    follow: false,
    index: false,
  },
};

export default function NexusProfilePage() {
  return (
    <NexusProfile
      content={{
        description:
          "Kelola informasi pribadi Anda dan tinjau akun BHT Nexus yang Anda gunakan.",
        title: "Profil Saya",
      }}
    />
  );
}
