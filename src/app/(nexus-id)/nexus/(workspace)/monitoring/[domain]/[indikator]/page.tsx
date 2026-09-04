import type { Metadata } from "next";
import {
  nexusPreviewWorkspaceAccess,
  nexusWorkspaceCanOpen,
} from "@/components/nexus-dashboard-shell/nexus-workspace-access";
import {
  NEXUS_EVALUATION_PERIOD,
  NEXUS_MONITORING_HREF,
  nexusCategoryFromDomainSlug,
  nexusDomainHref,
  nexusDomainSlug,
  nexusEvaluations,
  nexusIndicatorEvaluation,
  nexusIndicatorIdFromSlug,
  nexusIndicatorSlug,
} from "@/components/nexus-monitoring/nexus-monitoring-evaluation";
import { monitoringStyles } from "@/components/nexus-monitoring/nexus-monitoring-ui";
import { MonitoringConstructionState } from "@/components/nexus-monitoring/nexus-monitoring-under-construction";
import { NexusWorkspaceBreadcrumb } from "@/components/nexus-workspace-ui/nexus-workspace-breadcrumb";
import { NexusWorkspaceLinkButton } from "@/components/nexus-workspace-ui/nexus-workspace-elements";
import { NexusWorkspacePage } from "@/components/nexus-workspace-ui/nexus-workspace-page";
import {
  NexusWorkspaceNoAccess,
  NexusWorkspaceState,
} from "@/components/nexus-workspace-ui/nexus-workspace-state";

type NexusMonitoringIndicatorPageProps = {
  params: Promise<{ domain: string; indikator: string }>;
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
      ? `Rincian indikator ${evaluation.indicator.id} pada pemantauan ${evaluation.indicator.category} sedang disiapkan.`
      : "Indikator KM yang diminta tidak tersedia pada Monitoring KM.",
    robots: {
      follow: false,
      index: false,
    },
  };
}

/**
 * Alamat satu indikator KM. Identitas indikator tetap kanonis dan setiap
 * alamat indikator terpantau tetap sah, sedangkan penyajian rinciannya
 * disiapkan pada paket kerja tersendiri.
 */
export default async function NexusMonitoringIndicatorPage({
  params,
}: NexusMonitoringIndicatorPageProps) {
  const access = nexusPreviewWorkspaceAccess;
  const { domain, indikator } = await params;

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
          returnHref="/nexus/dashboard"
          returnLabel="Kembali ke Dashboard"
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

  const { category, id, label } = evaluation.indicator;
  const domainHref = nexusDomainHref(category);

  return (
    <NexusWorkspacePage
      description={evaluation.definition}
      descriptionId="monitoring-indicator-description"
      meta={`Periode evaluasi ${NEXUS_EVALUATION_PERIOD}`}
      title={`${id} · ${label}`}
      titleId="monitoring-indicator-title"
    >
      <div className={monitoringStyles.indicatorTrail}>
        <NexusWorkspaceBreadcrumb
          current={id}
          trail={[
            { href: NEXUS_MONITORING_HREF, label: "Monitoring KM" },
            { href: domainHref, label: category },
          ]}
        />
      </div>

      <MonitoringConstructionState
        actions={
          <NexusWorkspaceLinkButton href={domainHref} tone="primary">
            {`Kembali ke ${category}`}
          </NexusWorkspaceLinkButton>
        }
        compact
        description={`Kami sedang menyiapkan halaman rincian ${id}. Target, realisasi, dan statusnya sudah dapat dibaca pada pemantauan ${category}.`}
        title={`Rincian ${id} sedang disiapkan`}
        titleId="monitoring-indicator-construction-title"
      />
    </NexusWorkspacePage>
  );
}
