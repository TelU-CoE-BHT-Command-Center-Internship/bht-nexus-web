"use client";

import Link from "next/link";
import { MonitoringIcon } from "@/components/nexus-monitoring/nexus-monitoring-ui";
import type { MonitoringRecordView } from "@/components/nexus-monitoring/nexus-monitoring-view";
import badgeStyles from "@/components/nexus-workspace-ui/nexus-workspace-badges.module.css";
import detail from "@/components/nexus-workspace-ui/nexus-workspace-detail.module.css";
import { NexusWorkspaceDrawer } from "@/components/nexus-workspace-ui/nexus-workspace-drawer";

function ArrowIcon() {
  return (
    <svg aria-hidden="true" fill="none" viewBox="0 0 16 16">
      <path d="M3 8h10M9 4l4 4-4 4" />
    </svg>
  );
}

function ExternalIcon() {
  return (
    <svg aria-hidden="true" fill="none" viewBox="0 0 16 16">
      <path d="M6.5 3.5H3.5v9h9v-3M9.5 3.5h3v3M12.5 3.5 7 9" />
    </svg>
  );
}

function MetaItem({ label, value }: { label: string; value: string }) {
  return (
    <div className={detail.metaItem}>
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}

function DetailField({
  label,
  value,
  wide = false,
}: {
  label: string;
  value: string;
  wide?: boolean;
}) {
  return (
    <div className={wide ? detail.wideMetadata : undefined}>
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}

/**
 * Keterangan keadaan eviden sebuah rekam. Kalimatnya menyebut apa yang memang
 * diketahui rekam resmi, tanpa menjanjikan tautan yang belum ada.
 */
function evidenceExplanation(record: MonitoringRecordView) {
  if (record.evidenceUrl) {
    return "Eviden rekam ini dapat dibuka langsung dari sumber penerbitnya.";
  }
  if (record.evidenceTone === "waiting") {
    return "Eviden rekam ini belum tercatat. Lengkapi melalui rumah Data Resmi agar realisasi indikator dapat ditelusuri sampai buktinya.";
  }
  return "Eviden rekam ini tersimpan internal, sehingga tidak tersedia tautan publik yang dapat dibuka dari sini.";
}

/**
 * Rincian satu rekam resmi pembentuk realisasi. Bentuknya mengikuti kerangka
 * rincian ruang kerja yang sama dengan Publikasi dan Tinjauan: ringkasan,
 * bagian bernomor, kartu sumber, lalu keputusan tinjauan.
 *
 * Proyeksi ini hanya membaca. Penyuntingan rekam tetap dimiliki rumah Data
 * Resmi asalnya, dan tautannya disediakan pada bagian pertama.
 */
export function MonitoringRecordDetail({
  businessDateLabel,
  indicatorId,
  onClose,
  record,
}: {
  /** Nama tanggal yang menentukan triwulan, mengikuti aturan indikatornya. */
  businessDateLabel: string;
  indicatorId: string;
  onClose: () => void;
  record: MonitoringRecordView;
}) {
  const isComplete = record.quality === "Lengkap";

  return (
    <NexusWorkspaceDrawer
      closeLabel="Tutup rincian rekam"
      description="Telusuri kaitan rekam dengan indikator, eviden, asal data, dan keputusan tinjauannya."
      eyebrow={`${record.publicId} · ${indicatorId}`}
      onClose={onClose}
      title="Rekam pembentuk realisasi"
    >
      <section
        aria-labelledby="monitoring-record-overview-title"
        className={detail.overview}
      >
        <div className={detail.overviewTop}>
          <div>
            <span className={badgeStyles.officialBadge}>
              <MonitoringIcon name="check" />
              Data resmi
            </span>
            <span
              className={badgeStyles.qualityBadge}
              data-quality={record.quality}
            >
              {record.quality}
            </span>
          </div>
          <time>Diperbarui {record.updatedAt}</time>
        </div>
        <h3 id="monitoring-record-overview-title">{record.title}</h3>
        <p>{record.subtitle}</p>

        <dl className={detail.metaGrid}>
          <MetaItem label="Indikator KM" value={indicatorId} />
          <MetaItem label="Rumah data" value={record.houseLabel} />
          <MetaItem
            label={businessDateLabel}
            value={record.businessDateLabel ?? "Belum tercatat"}
          />
          <MetaItem
            label="Triwulan"
            value={record.quarterLabel ?? "Belum terpetakan"}
          />
        </dl>
      </section>

      {isComplete ? null : (
        <aside className={detail.completenessNotice}>
          <MonitoringIcon name="alert" />
          <div>
            <strong>Metadata rekam masih perlu dilengkapi</strong>
            <p>
              Rekam tetap dihitung sebagai realisasi indikator, tetapi sebagian
              bidangnya belum selesai diperiksa pada rumah Data Resmi.
            </p>
          </div>
        </aside>
      )}

      <section
        aria-labelledby="monitoring-record-metadata-title"
        className={detail.detailSection}
      >
        <div className={detail.sectionHeading}>
          <div>
            <span className={detail.sectionIndex}>01</span>
            <h3 id="monitoring-record-metadata-title">Metadata rekam</h3>
          </div>
          <p>Bidang penting menurut {record.houseLabel}</p>
        </div>

        <dl aria-label="Metadata rekam" className={detail.metadataDetails}>
          <DetailField label="ID rekam" value={record.publicId} />
          <DetailField label="Kelengkapan" value={record.quality} />
          {record.metadata.map((field) => (
            <DetailField
              key={field.label}
              label={field.label}
              value={field.value}
              wide={field.wide}
            />
          ))}
        </dl>
      </section>

      <section
        aria-labelledby="monitoring-record-link-title"
        className={detail.detailSection}
      >
        <div className={detail.sectionHeading}>
          <div>
            <span className={detail.sectionIndex}>02</span>
            <h3 id="monitoring-record-link-title">Kaitan dengan indikator</h3>
          </div>
          <p>Alasan rekam dihitung pada indikator ini</p>
        </div>

        <p className={detail.explanation}>{record.linkNote}</p>

        <dl
          aria-label="Kaitan rekam dengan indikator"
          className={detail.metadataDetails}
        >
          <DetailField
            label={`Dasar triwulan (${businessDateLabel.toLocaleLowerCase("id-ID")})`}
            value={
              record.businessDateLabel
                ? `${record.businessDateLabel} · ${record.quarterLabel}`
                : "Belum tercatat, sehingga rekam tidak masuk triwulan mana pun"
            }
            wide
          />
        </dl>

        <Link
          className={detail.reviewLink}
          href={record.houseHref}
          prefetch={false}
        >
          Buka {record.houseLabel} <ArrowIcon />
        </Link>
      </section>

      <section
        aria-labelledby="monitoring-record-evidence-title"
        className={detail.detailSection}
      >
        <div className={detail.sectionHeading}>
          <div>
            <span className={detail.sectionIndex}>03</span>
            <h3 id="monitoring-record-evidence-title">Eviden</h3>
          </div>
          <p>Bukti pendukung rekam resmi</p>
        </div>

        <p className={detail.explanation}>{evidenceExplanation(record)}</p>

        <dl aria-label="Eviden rekam" className={detail.metadataDetails}>
          <DetailField
            label="Status eviden"
            value={record.evidenceLabel}
            wide={!record.evidenceNote}
          />
          {record.evidenceNote ? (
            <DetailField label="Catatan eviden" value={record.evidenceNote} />
          ) : null}
        </dl>

        {record.evidenceUrl ? (
          <a
            className={detail.reviewLink}
            href={record.evidenceUrl}
            rel="noreferrer"
            target="_blank"
          >
            Buka eviden di sumbernya <ExternalIcon />
          </a>
        ) : null}
      </section>

      <section
        aria-labelledby="monitoring-record-sources-title"
        className={detail.detailSection}
      >
        <div className={detail.sectionHeading}>
          <div>
            <span className={detail.sectionIndex}>04</span>
            <h3 id="monitoring-record-sources-title">Sumber dan jejak data</h3>
          </div>
          <p>Asal-usul rekam tetap dapat diaudit</p>
        </div>

        {record.provenance.length === 0 ? (
          <dl aria-label="Asal data rekam" className={detail.metadataDetails}>
            <DetailField
              label="Asal data"
              value="Belum tercatat pada rekam resmi"
              wide
            />
          </dl>
        ) : (
          <div className={detail.provenanceGrid}>
            {record.provenance.map((source) => (
              <article
                className={detail.provenanceCard}
                key={`${source.source}-${source.identifier}`}
              >
                <header>
                  <span className={detail.sourceIcon}>
                    <MonitoringIcon name="database" />
                  </span>
                  <div>
                    <strong>{source.source}</strong>
                    <span className={badgeStyles.sourceBadge}>
                      Sumber pembentuk
                    </span>
                  </div>
                </header>
                <dl>
                  <div>
                    <dt>Lokasi sumber</dt>
                    <dd>{source.identifier}</dd>
                  </div>
                  <div>
                    <dt>Diambil</dt>
                    <dd>{source.capturedAt}</dd>
                  </div>
                </dl>
                {source.note ? (
                  <p className={detail.provenanceNote}>{source.note}</p>
                ) : null}
              </article>
            ))}
          </div>
        )}
      </section>

      <section
        aria-labelledby="monitoring-record-review-title"
        className={detail.reviewSection}
      >
        <div className={detail.sectionHeading}>
          <div>
            <span className={detail.sectionIndex}>05</span>
            <h3 id="monitoring-record-review-title">Keputusan tinjauan</h3>
          </div>
          <p>Riwayat keputusan tersimpan</p>
        </div>

        <div className={detail.reviewDecision}>
          <span className={detail.reviewCheck}>
            <MonitoringIcon name="check" />
          </span>
          <div>
            <strong>{record.review.decision}</strong>
            <p>{record.review.note}</p>
            <small>
              {record.review.reviewer} · {record.review.reviewedAt}
            </small>
          </div>
        </div>

        <Link
          className={detail.reviewLink}
          href="/nexus/tinjauan"
          prefetch={false}
        >
          Buka antrean Tinjauan <ArrowIcon />
        </Link>
      </section>
    </NexusWorkspaceDrawer>
  );
}
