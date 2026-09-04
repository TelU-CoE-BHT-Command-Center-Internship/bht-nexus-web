import Image from "next/image";
import type { ReactNode } from "react";
import constructionImage from "@/assets/nexus-monitoring-under-construction.webp";
import styles from "@/components/nexus-monitoring/nexus-monitoring.module.css";
import type { NexusMonitoringDomain } from "@/components/nexus-monitoring/nexus-monitoring-domains";
import { MonitoringIcon } from "@/components/nexus-monitoring/nexus-monitoring-ui";
import {
  NexusWorkspaceButton,
  NexusWorkspaceLinkButton,
} from "@/components/nexus-workspace-ui/nexus-workspace-elements";
import { COE_BHT_LINKS } from "@/content/coe-bht";
import type { NexusKmIndicatorCategory } from "@/content/nexus-km-indicators";

const sourceHrefs: Partial<Record<NexusKmIndicatorCategory, string>> = {
  Akademik: "/nexus/akademik",
  Bisnis: "/nexus/kontrak-proposal",
  Inovasi: "/nexus/kekayaan-intelektual",
  "Pengabdian Masyarakat": "/nexus/kegiatan",
  Proposal: "/nexus/kontrak-proposal",
};

/**
 * Keadaan "sedang disiapkan" pada Monitoring KM. Bentuknya satu supaya domain
 * yang halamannya belum ada dan indikator yang rinciannya belum ada memakai
 * bahasa visual yang sama, sedangkan isinya ditentukan pemanggilnya.
 */
export function MonitoringConstructionState({
  actions,
  compact = false,
  description,
  note,
  title,
  titleId,
}: {
  actions: ReactNode;
  /** Susunan yang lebih rapat untuk pesan pendek pada satu alamat indikator. */
  compact?: boolean;
  description: string;
  note?: ReactNode;
  title: string;
  titleId: string;
}) {
  return (
    <section
      aria-labelledby={titleId}
      className={styles.constructionState}
      data-compact={compact}
    >
      <div aria-hidden="true" className={styles.constructionVisual}>
        <Image
          alt=""
          placeholder="blur"
          priority
          sizes="(max-width: 48rem) 92vw, 44rem"
          src={constructionImage}
        />
      </div>
      <div className={styles.constructionCopy}>
        <span className={styles.constructionEyebrow}>
          Halaman sedang disiapkan
        </span>
        <h3 id={titleId}>{title}</h3>
        <p>{description}</p>
      </div>
      <div className={styles.constructionActions}>{actions}</div>
      {note ? <div className={styles.constructionNote}>{note}</div> : null}
    </section>
  );
}

export function NexusMonitoringUnderConstruction({
  domain,
  onBack,
  periodLabel,
}: {
  domain: NexusMonitoringDomain;
  onBack: () => void;
  periodLabel: string;
}) {
  const sourceHref = domain.category ? sourceHrefs[domain.category] : undefined;
  const hasRecords = domain.records > 0;

  return (
    <MonitoringConstructionState
      actions={
        <>
          <NexusWorkspaceButton onClick={onBack} tone="primary" type="button">
            Kembali ke Ringkasan
          </NexusWorkspaceButton>
          {sourceHref ? (
            <NexusWorkspaceLinkButton href={sourceHref} tone="secondary">
              Lihat Data Resmi
            </NexusWorkspaceLinkButton>
          ) : null}
          <NexusWorkspaceLinkButton
            href={`${COE_BHT_LINKS.email}?subject=Monitoring%20KM%20BHT%20Nexus`}
            tone="secondary"
          >
            Hubungi pengelola
          </NexusWorkspaceLinkButton>
        </>
      }
      description={`Kami sedang menyiapkan pemantauan ${domain.indicators} indikator ${domain.label} untuk ${periodLabel}.`}
      note={
        <>
          <span aria-hidden="true">
            <MonitoringIcon name={hasRecords ? "database" : "alert"} />
          </span>
          <p>
            <strong>
              {hasRecords
                ? `${domain.records} rekam resmi sudah terkait.`
                : "Sumber realisasi belum tersedia."}
            </strong>{" "}
            {hasRecords
              ? "Data tetap dapat dibuka melalui rumah Data Resmi terkait."
              : "Pemantauan akan terisi setelah sumber resminya terhubung."}
          </p>
        </>
      }
      title={`Monitoring ${domain.label} sedang dibangun`}
      titleId="monitoring-construction-title"
    />
  );
}
