import type { Metadata } from "next";
import {
  nexusPreviewWorkspaceAccess,
  nexusWorkspaceCanOpen,
} from "@/components/nexus-dashboard-shell/nexus-workspace-access";
import {
  NEXUS_MONITORING_RISET_HREF,
  nexusIndicatorEvaluation,
  nexusIndicatorIdFromSlug,
  nexusIndicatorSlug,
  nexusRisetEvaluations,
} from "@/components/nexus-monitoring/nexus-monitoring-evaluation";
import { NexusMonitoringIndicator } from "@/components/nexus-monitoring/nexus-monitoring-indicator";
import { buildIndicatorView } from "@/components/nexus-monitoring/nexus-monitoring-view";
import { NexusWorkspaceLinkButton } from "@/components/nexus-workspace-ui/nexus-workspace-elements";
import { NexusWorkspacePage } from "@/components/nexus-workspace-ui/nexus-workspace-page";
import {
  NexusWorkspaceNoAccess,
  NexusWorkspaceState,
} from "@/components/nexus-workspace-ui/nexus-workspace-state";

type NexusMonitoringIndicatorPageProps = {
  params: Promise<{ indikator: string }>;
};

export function generateStaticParams() {
  return nexusRisetEvaluations.map((evaluation) => ({
    indikator: nexusIndicatorSlug(evaluation.indicator.id),
  }));
}

export async function generateMetadata({
  params,
}: NexusMonitoringIndicatorPageProps): Promise<Metadata> {
  const { indikator } = await params;
  const indicatorId = nexusIndicatorIdFromSlug(indikator);
  const evaluation = indicatorId
    ? nexusIndicatorEvaluation(indicatorId)
    : undefined;

  return {
    title: evaluation
      ? `${evaluation.indicator.id} · Monitoring KM`
      : "Indikator tidak ditemukan · Monitoring KM",
    description: evaluation
      ? evaluation.definition
      : "Indikator KM yang diminta tidak tersedia pada pemantauan Riset.",
    robots: {
      follow: false,
      index: false,
    },
  };
}

export default async function NexusMonitoringIndicatorPage({
  params,
}: NexusMonitoringIndicatorPageProps) {
  const access = nexusPreviewWorkspaceAccess;
  const { indikator } = await params;

  if (!nexusWorkspaceCanOpen(access, "monitoring")) {
    return (
      <NexusWorkspacePage
        description="Rincian indikator KM kategori Riset."
        descriptionId="monitoring-indicator-no-access-description"
        title="Monitoring KM · Riset"
        titleId="monitoring-indicator-no-access-title"
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

  const indicatorId = nexusIndicatorIdFromSlug(indikator);
  const view = indicatorId ? buildIndicatorView(indicatorId) : undefined;

  if (!view) {
    return (
      <NexusWorkspacePage
        description="Rincian indikator KM kategori Riset."
        descriptionId="monitoring-indicator-not-found-description"
        title="Monitoring KM · Riset"
        titleId="monitoring-indicator-not-found-title"
      >
        <NexusWorkspaceState
          actions={
            <NexusWorkspaceLinkButton href={NEXUS_MONITORING_RISET_HREF}>
              Kembali ke pemantauan Riset
            </NexusWorkspaceLinkButton>
          }
          description="Alamat yang dibuka tidak menunjuk indikator Riset yang dipantau. Pilih indikator dari halaman pemantauan Riset agar konteksnya tetap benar."
          eyebrow="Indikator tidak ditemukan"
          title="Indikator KM ini tidak tersedia pada pemantauan Riset"
        />
      </NexusWorkspacePage>
    );
  }

  return <NexusMonitoringIndicator view={view} />;
}
