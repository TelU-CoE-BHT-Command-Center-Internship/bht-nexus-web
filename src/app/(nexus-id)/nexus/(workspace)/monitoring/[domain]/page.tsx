import type { Metadata } from "next";
import {
  nexusPreviewWorkspaceAccess,
  nexusWorkspaceCanOpen,
} from "@/components/nexus-dashboard-shell/nexus-workspace-access";
import {
  NEXUS_MONITORING_HREF,
  nexusCategoryFromDomainSlug,
  nexusDomainSlug,
} from "@/components/nexus-monitoring/nexus-monitoring-evaluation";
import { NexusMonitoringLanding } from "@/components/nexus-monitoring/nexus-monitoring-landing";
import { getNexusMonitoringLandingData } from "@/components/nexus-monitoring/nexus-monitoring-landing-data";
import { NexusWorkspaceLinkButton } from "@/components/nexus-workspace-ui/nexus-workspace-elements";
import { NexusWorkspacePage } from "@/components/nexus-workspace-ui/nexus-workspace-page";
import {
  NexusWorkspaceNoAccess,
  NexusWorkspaceState,
} from "@/components/nexus-workspace-ui/nexus-workspace-state";
import { nexusKmIndicatorCategories } from "@/content/nexus-km-indicators";

type NexusMonitoringDomainPageProps = {
  params: Promise<{ domain: string }>;
};

export function generateStaticParams() {
  return nexusKmIndicatorCategories.map((category) => ({
    domain: nexusDomainSlug(category),
  }));
}

export async function generateMetadata({
  params,
}: NexusMonitoringDomainPageProps): Promise<Metadata> {
  const { domain } = await params;
  const category = nexusCategoryFromDomainSlug(domain);

  return {
    title: category
      ? `Monitoring KM · ${category}`
      : "Domain tidak ditemukan · Monitoring KM",
    description: category
      ? `Capaian indikator KM domain ${category} berdasarkan data resmi BHT Nexus.`
      : "Domain KM yang diminta tidak tersedia pada Monitoring KM.",
    robots: {
      follow: false,
      index: false,
    },
  };
}

/**
 * Alamat tetap untuk satu domain KM. Halaman ini memakai kerangka Monitoring
 * yang sama dengan Ringkasan dan hanya menyalakan domainnya sejak awal,
 * sehingga tautan domain tetap sah tanpa membuat susunan kedua.
 */
export default async function NexusMonitoringDomainPage({
  params,
}: NexusMonitoringDomainPageProps) {
  const access = nexusPreviewWorkspaceAccess;
  const { domain } = await params;

  if (!nexusWorkspaceCanOpen(access, "monitoring")) {
    return (
      <NexusWorkspacePage
        description="Capaian indikator KM per domain."
        descriptionId="monitoring-domain-no-access-description"
        title="Monitoring KM"
        titleId="monitoring-domain-no-access-title"
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

  const category = nexusCategoryFromDomainSlug(domain);

  if (!category) {
    return (
      <NexusWorkspacePage
        description="Capaian indikator KM per domain."
        descriptionId="monitoring-domain-not-found-description"
        title="Monitoring KM"
        titleId="monitoring-domain-not-found-title"
      >
        <NexusWorkspaceState
          actions={
            <NexusWorkspaceLinkButton href={NEXUS_MONITORING_HREF}>
              Kembali ke Ringkasan
            </NexusWorkspaceLinkButton>
          }
          description="Alamat yang dibuka tidak menunjuk domain KM yang dipantau. Pilih domain dari Ringkasan Monitoring KM agar konteksnya tetap benar."
          eyebrow="Domain tidak ditemukan"
          title="Domain KM ini tidak tersedia pada Monitoring KM"
        />
      </NexusWorkspacePage>
    );
  }

  return (
    <NexusMonitoringLanding
      {...getNexusMonitoringLandingData()}
      initialDomain={category}
    />
  );
}
