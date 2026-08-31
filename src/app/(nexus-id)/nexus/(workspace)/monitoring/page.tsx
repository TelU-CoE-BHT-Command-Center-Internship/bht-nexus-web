import type { Metadata } from "next";
import {
  nexusPreviewWorkspaceAccess,
  nexusWorkspaceCanOpen,
} from "@/components/nexus-dashboard-shell/nexus-workspace-access";
import { getNexusMonitoringCategories } from "@/components/nexus-monitoring/nexus-monitoring-categories";
import { NexusMonitoringLanding } from "@/components/nexus-monitoring/nexus-monitoring-landing";
import { NexusWorkspacePage } from "@/components/nexus-workspace-ui/nexus-workspace-page";
import { NexusWorkspaceNoAccess } from "@/components/nexus-workspace-ui/nexus-workspace-state";

export const metadata: Metadata = {
  title: "Monitoring KM",
  description:
    "Pemantauan indikator KM CoE BHT berdasarkan data resmi BHT Nexus.",
  robots: {
    follow: false,
    index: false,
  },
};

export default function NexusMonitoringPage() {
  const access = nexusPreviewWorkspaceAccess;

  if (!nexusWorkspaceCanOpen(access, "monitoring")) {
    return (
      <NexusWorkspacePage
        description="Pemantauan indikator KM CoE BHT."
        descriptionId="monitoring-no-access-description"
        title="Monitoring KM"
        titleId="monitoring-no-access-title"
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

  return <NexusMonitoringLanding categories={getNexusMonitoringCategories()} />;
}
