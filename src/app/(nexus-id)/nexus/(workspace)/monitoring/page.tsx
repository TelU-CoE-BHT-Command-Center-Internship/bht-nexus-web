import type { Metadata } from "next";
import {
  nexusPreviewWorkspaceAccess,
  nexusWorkspaceCanOpen,
} from "@/components/nexus-dashboard-shell/nexus-workspace-access";
import { getNexusMonitoringCategories } from "@/components/nexus-monitoring/nexus-monitoring-categories";
import { NEXUS_EVALUATION_PERIOD } from "@/components/nexus-monitoring/nexus-monitoring-evaluation";
import { nexusMonitoringIndicatorProgress } from "@/components/nexus-monitoring/nexus-monitoring-indicator-progress";
import { NexusMonitoringLanding } from "@/components/nexus-monitoring/nexus-monitoring-landing";
import { summarizeRiset } from "@/components/nexus-monitoring/nexus-monitoring-measurement";
import { getNexusMonitoringRecords } from "@/components/nexus-monitoring/nexus-monitoring-sources";
import { nexusMonitoringUpdates } from "@/components/nexus-monitoring/nexus-monitoring-updates";
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

  const records = getNexusMonitoringRecords();
  const targetSummary = summarizeRiset(NEXUS_EVALUATION_PERIOD, records);
  const indicatorProgress = nexusMonitoringIndicatorProgress(records);
  const updates = nexusMonitoringUpdates(records);

  return (
    <NexusMonitoringLanding
      categories={getNexusMonitoringCategories(records)}
      indicatorProgress={indicatorProgress}
      targetSummary={{
        notComputable: targetSummary.notComputable,
        notReached: targetSummary.notReached,
        period: targetSummary.period,
        reached: targetSummary.reached,
      }}
      updates={updates}
    />
  );
}
