import type { Metadata } from "next";
import { NexusAdministration } from "@/components/nexus-administration/nexus-administration";
import { getNexusAdministrationContent } from "@/components/nexus-administration/nexus-administration-content";
import { nexusPreviewWorkspaceAccess } from "@/components/nexus-dashboard-shell/nexus-workspace-access";

export const metadata: Metadata = {
  title: "Administrasi",
  description: "Kelola akun dan akses pengguna BHT Nexus.",
  robots: {
    follow: false,
    index: false,
  },
};

export default function NexusAdministrationPage() {
  return (
    <NexusAdministration
      capabilities={nexusPreviewWorkspaceAccess.administrationCapabilities}
      content={getNexusAdministrationContent()}
    />
  );
}
