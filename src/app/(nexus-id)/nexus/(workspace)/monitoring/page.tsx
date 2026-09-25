import type { Metadata } from "next";
import { nexusWorkspaceHomeHref } from "@/components/nexus-dashboard-shell/nexus-dashboard-shell-content";
import { nexusWorkspaceCanOpen } from "@/components/nexus-dashboard-shell/nexus-workspace-access";
import { NexusMonitoringLanding } from "@/components/nexus-monitoring/nexus-monitoring-landing";
import { nexusMonitoringPeriodParam } from "@/components/nexus-monitoring/nexus-monitoring-period";
import { getNexusWorkspaceAccess } from "@/components/nexus-session/nexus-workspace-access-server";
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

type NexusMonitoringPageProps = {
  searchParams: Promise<{ periode?: string | string[] }>;
};

export default async function NexusMonitoringPage({
  searchParams,
}: NexusMonitoringPageProps) {
  const access = await getNexusWorkspaceAccess();
  const { periode } = await searchParams;

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
          returnHref={nexusWorkspaceHomeHref(access)}
          returnLabel="Kembali ke ruang kerja"
          title="Monitoring KM tidak tersedia untuk akun Anda"
        />
      </NexusWorkspacePage>
    );
  }

  return (
    <NexusMonitoringLanding
      capabilities={access.monitoringCapabilities}
      requestedPeriodId={nexusMonitoringPeriodParam(periode)}
    />
  );
}
