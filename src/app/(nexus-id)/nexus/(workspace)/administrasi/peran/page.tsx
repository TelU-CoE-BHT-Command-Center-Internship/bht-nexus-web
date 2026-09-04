import type { Metadata } from "next";
import { NexusRoleManagementLive } from "@/components/nexus-access-policy/nexus-role-management-live";

export const metadata: Metadata = {
  title: "Peran & Hak Akses",
  description: "Atur hak akses bawaan untuk setiap peran pengguna BHT Nexus.",
  robots: {
    follow: false,
    index: false,
  },
};

export default function NexusRolePage() {
  return <NexusRoleManagementLive />;
}
