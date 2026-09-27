import type { Metadata } from "next";
import { NexusBroadcast } from "@/components/nexus-broadcast/nexus-broadcast";
import {
  nexusPreviewWorkspaceAccess,
  nexusWorkspaceCanOpen,
} from "@/components/nexus-dashboard-shell/nexus-workspace-access";
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

export default function NexusBroadcastPage() {
  const access = nexusPreviewWorkspaceAccess;

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
          returnHref="/nexus/dashboard"
          returnLabel="Kembali ke Dashboard"
          title="Broadcast / Newsletter tidak tersedia untuk akun Anda"
        />
      </NexusWorkspacePage>
    );
  }

  return <NexusBroadcast capabilities={access.broadcastCapabilities} />;
}
