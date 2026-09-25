import type { Metadata } from "next";
import { nexusWorkspaceHomeHref } from "@/components/nexus-dashboard-shell/nexus-dashboard-shell-content";
import { nexusWorkspaceCanOpen } from "@/components/nexus-dashboard-shell/nexus-workspace-access";
import {
  NEXUS_MONITORING_HREF,
  nexusCategoryFromDomainSlug,
  nexusDomainSlug,
  nexusEvaluations,
  nexusIndicatorEvaluation,
  nexusIndicatorIdFromSlug,
  nexusIndicatorSlug,
} from "@/components/nexus-monitoring/nexus-monitoring-evaluation";
import { NexusMonitoringIndicatorScreen } from "@/components/nexus-monitoring/nexus-monitoring-indicator-screen";
import { nexusMonitoringPeriodParam } from "@/components/nexus-monitoring/nexus-monitoring-period";
import { getNexusWorkspaceAccess } from "@/components/nexus-session/nexus-workspace-access-server";
import { NexusWorkspaceLinkButton } from "@/components/nexus-workspace-ui/nexus-workspace-elements";
import { NexusWorkspacePage } from "@/components/nexus-workspace-ui/nexus-workspace-page";
import {
  NexusWorkspaceNoAccess,
  NexusWorkspaceState,
} from "@/components/nexus-workspace-ui/nexus-workspace-state";

type NexusMonitoringIndicatorPageProps = {
  params: Promise<{ domain: string; indikator: string }>;
  searchParams: Promise<{ periode?: string | string[] }>;
};

export function generateStaticParams() {
  return nexusEvaluations.map((evaluation) => ({
    domain: nexusDomainSlug(evaluation.indicator.category),
    indikator: nexusIndicatorSlug(evaluation.indicator.id),
  }));
}

/**
 * Indikator yang benar-benar berada pada domain tersebut. Kecocokan domain
 * ikut diperiksa supaya alamat seperti `riset/km-20` tidak pernah membuka
 * indikator milik domain lain.
 */
function resolveIndicator(domain: string, indikator: string) {
  const category = nexusCategoryFromDomainSlug(domain);
  if (!category) return undefined;

  const indicatorId = nexusIndicatorIdFromSlug(indikator);
  const evaluation = indicatorId
    ? nexusIndicatorEvaluation(indicatorId)
    : undefined;
  if (!evaluation || evaluation.indicator.category !== category) {
    return undefined;
  }

  return evaluation;
}

export async function generateMetadata({
  params,
}: NexusMonitoringIndicatorPageProps): Promise<Metadata> {
  const { domain, indikator } = await params;
  const evaluation = resolveIndicator(domain, indikator);

  return {
    title: evaluation
      ? `${evaluation.indicator.id} · Monitoring KM`
      : "Indikator tidak ditemukan · Monitoring KM",
    description: evaluation
      ? `Target, realisasi, sebaran triwulan, dan rekam resmi pembentuk ${evaluation.indicator.id} pada pemantauan ${evaluation.indicator.category}.`
      : "Indikator KM yang diminta tidak tersedia pada Monitoring KM.",
    robots: {
      follow: false,
      index: false,
    },
  };
}

/**
 * Rincian satu indikator KM: target periode, realisasi dari rekam resmi,
 * selisihnya, sebaran triwulan, aturan pengukuran, catatan workbook, dan
 * daftar rekam yang membentuk angkanya.
 */
export default async function NexusMonitoringIndicatorPage({
  params,
  searchParams,
}: NexusMonitoringIndicatorPageProps) {
  const access = await getNexusWorkspaceAccess();
  const { domain, indikator } = await params;
  const { periode } = await searchParams;

  if (!nexusWorkspaceCanOpen(access, "monitoring")) {
    return (
      <NexusWorkspacePage
        description="Rincian indikator KM."
        descriptionId="monitoring-indicator-no-access-description"
        title="Monitoring KM"
        titleId="monitoring-indicator-no-access-title"
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

  const evaluation = resolveIndicator(domain, indikator);

  if (!evaluation) {
    return (
      <NexusWorkspacePage
        description="Rincian indikator KM."
        descriptionId="monitoring-indicator-not-found-description"
        title="Monitoring KM"
        titleId="monitoring-indicator-not-found-title"
      >
        <NexusWorkspaceState
          actions={
            <NexusWorkspaceLinkButton href={NEXUS_MONITORING_HREF}>
              Kembali ke Ringkasan
            </NexusWorkspaceLinkButton>
          }
          description="Alamat yang dibuka tidak menunjuk indikator KM yang dipantau pada domain tersebut. Pilih indikator dari ikhtisar domainnya agar konteksnya tetap benar."
          eyebrow="Indikator tidak ditemukan"
          title="Indikator KM ini tidak tersedia pada domain tersebut"
        />
      </NexusWorkspacePage>
    );
  }

  return (
    <NexusMonitoringIndicatorScreen
      capabilities={access.monitoringCapabilities}
      indicatorId={evaluation.indicator.id}
      key={evaluation.indicator.id}
      requestedPeriodId={nexusMonitoringPeriodParam(periode)}
    />
  );
}
