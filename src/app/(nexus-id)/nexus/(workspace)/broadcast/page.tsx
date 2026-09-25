import type { Metadata } from "next";
import { NexusBroadcast } from "@/components/nexus-broadcast/nexus-broadcast";
import { nexusWorkspaceHomeHref } from "@/components/nexus-dashboard-shell/nexus-dashboard-shell-content";
import { nexusWorkspaceCanOpen } from "@/components/nexus-dashboard-shell/nexus-workspace-access";
import { getNexusWorkspaceAccess } from "@/components/nexus-session/nexus-workspace-access-server";
import { NexusWorkspacePage } from "@/components/nexus-workspace-ui/nexus-workspace-page";
import { NexusWorkspaceNoAccess } from "@/components/nexus-workspace-ui/nexus-workspace-state";

export const metadata: Metadata = {
  title: "Broadcast / Newsletter",
  description:
    "Penyusunan broadcast email untuk anggota CoE BHT beserta tampilan emailnya.",
  robots: {
    follow: false,
    index: false,
  },
};

export default async function NexusBroadcastPage() {
  const access = await getNexusWorkspaceAccess();

  if (!nexusWorkspaceCanOpen(access, "broadcast")) {
    return (
      <NexusWorkspacePage
        description="Penyusunan broadcast email untuk anggota CoE BHT."
        descriptionId="broadcast-no-access-description"
        title="Broadcast / Newsletter"
        titleId="broadcast-no-access-title"
      >
        <NexusWorkspaceNoAccess
          description="Akun Anda belum memiliki izin untuk membuka Broadcast / Newsletter. Silakan kembali ke Dashboard atau hubungi pengelola jika akses tersebut diperlukan."
          returnHref={nexusWorkspaceHomeHref(access)}
          returnLabel="Kembali ke ruang kerja"
          title="Broadcast / Newsletter tidak tersedia untuk akun Anda"
        />
      </NexusWorkspacePage>
    );
  }

  return <NexusBroadcast capabilities={access.broadcastCapabilities} />;
}
