import type { Metadata } from "next";
import {
  nexusPreviewWorkspaceAccess,
  nexusWorkspaceCanOpen,
} from "@/components/nexus-dashboard-shell/nexus-workspace-access";
import { NexusMonitoringRiset } from "@/components/nexus-monitoring/nexus-monitoring-riset";
import { buildRisetView } from "@/components/nexus-monitoring/nexus-monitoring-view";
import { NexusWorkspacePage } from "@/components/nexus-workspace-ui/nexus-workspace-page";
import { NexusWorkspaceNoAccess } from "@/components/nexus-workspace-ui/nexus-workspace-state";

export const metadata: Metadata = {
  title: "Monitoring KM · Riset",
  description:
    "Capaian indikator KM kategori Riset berdasarkan data resmi BHT Nexus.",
  robots: {
    follow: false,
    index: false,
  },
};

export default function NexusMonitoringRisetPage() {
  const access = nexusPreviewWorkspaceAccess;

  if (!nexusWorkspaceCanOpen(access, "monitoring")) {
    return (
      <NexusWorkspacePage
        description="Capaian indikator KM kategori Riset."
        descriptionId="monitoring-riset-no-access-description"
        title="Monitoring KM · Riset"
        titleId="monitoring-riset-no-access-title"
      >
        <NexusWorkspaceNoAccess
          description="Akun Anda belum memiliki izin untuk membuka pemantauan indikator KM. Silakan kembali ke ruang kerja atau hubungi pengelola jika akses tersebut diperlukan."
          returnHref="/nexus/dashboard"
          returnLabel="Kembali ke Dashboard"
          title="Monitoring KM tidak tersedia untuk akun Anda"
        />
      </NexusWorkspacePage>
    );
  }

  return <NexusMonitoringRiset view={buildRisetView()} />;
}
