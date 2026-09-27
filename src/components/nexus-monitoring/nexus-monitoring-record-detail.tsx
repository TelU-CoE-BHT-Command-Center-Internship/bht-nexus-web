"use client";

import Link from "next/link";
import { useState } from "react";
import styles from "@/components/nexus-monitoring/nexus-monitoring.module.css";
import { MonitoringRecordCorrection } from "@/components/nexus-monitoring/nexus-monitoring-record-correction";
import { MonitoringIcon } from "@/components/nexus-monitoring/nexus-monitoring-ui";
import type { MonitoringRecordView } from "@/components/nexus-monitoring/nexus-monitoring-view";
import type {
  OfficialRecordCorrection,
  OfficialRecordCorrectionChange,
  OfficialRecordCorrectionValues,
} from "@/components/nexus-official-records/nexus-official-record-corrections";
import badgeStyles from "@/components/nexus-workspace-ui/nexus-workspace-badges.module.css";
import { NexusWorkspaceConfirmDialog } from "@/components/nexus-workspace-ui/nexus-workspace-confirm-dialog";
import detail from "@/components/nexus-workspace-ui/nexus-workspace-detail.module.css";
import { NexusWorkspaceDrawer } from "@/components/nexus-workspace-ui/nexus-workspace-drawer";
import {
  NexusWorkspaceButton,
  NexusWorkspaceNotice,
} from "@/components/nexus-workspace-ui/nexus-workspace-elements";
import { formatAuditTimestamp } from "@/components/nexus-workspace-ui/nexus-workspace-format";

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
    return "Eviden rekam ini dapat dibuka langsung dari sumber publik yang tercatat pada rekam resmi.";
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
 * Auditor yang berwenang dapat mengoreksi bidang penentu perhitungan langsung
 * dari sini tanpa berpindah halaman. Koreksi ditulis ke rekam resmi yang sama,
 * sehingga rumah Data Resmi dan angka Monitoring selalu sepakat.
 */
export function MonitoringRecordDetail({
  businessDateLabel,
  canCorrect,
  corrections,
  indicatorId,
  onClose,
  onCorrect,
  record,
}: {
  /** Nama tanggal yang menentukan triwulan, mengikuti aturan indikatornya. */
  businessDateLabel: string;
  canCorrect: boolean;
  corrections: readonly OfficialRecordCorrection[];
  indicatorId: string;
  onClose: () => void;
  onCorrect: (input: {
    changes: readonly OfficialRecordCorrectionChange[];
    reason: string;
    values: OfficialRecordCorrectionValues;
  }) => void;
  record: MonitoringRecordView;
}) {
  const isComplete = record.quality === "Lengkap";
  const [mode, setMode] = useState<"correct" | "read">("read");
  const [correctionDirty, setCorrectionDirty] = useState(false);
  const [discardTarget, setDiscardTarget] = useState<"close" | "read" | null>(
    null,
  );
  const [savedNotice, setSavedNotice] = useState("");

  function requestLeave(target: "close" | "read") {
    if (mode === "correct" && correctionDirty) {
      setDiscardTarget(target);
      return;
    }
    if (target === "close") onClose();
    else setMode("read");
  }

  if (mode === "correct") {
    return (
      <>
        <NexusWorkspaceDrawer
          closeLabel="Tutup koreksi rekam"
          description="Perbaiki bidang yang menentukan apakah dan kapan rekam ini dihitung."
          eyebrow={`${record.publicId} · ${indicatorId}`}
          onClose={() => requestLeave("close")}
          title="Koreksi data rekam"
        >
          <MonitoringRecordCorrection
            onCancel={() => requestLeave("read")}
            onDirtyChange={setCorrectionDirty}
            onSubmit={(input) => {
              onCorrect(input);
              setCorrectionDirty(false);
              setMode("read");
              setSavedNotice(
                "Koreksi tersimpan pada rekam resmi. Angka indikator sudah dihitung ulang.",
              );
            }}
            record={record}
          />
        </NexusWorkspaceDrawer>
        {discardTarget ? (
          <NexusWorkspaceConfirmDialog
            cancelLabel="Lanjutkan mengoreksi"
            confirmLabel="Buang koreksi"
            description="Isian koreksi yang belum disimpan akan dihapus."
            onCancel={() => setDiscardTarget(null)}
            onConfirm={() => {
              const target = discardTarget;
              setDiscardTarget(null);
              setCorrectionDirty(false);
              if (target === "close") onClose();
              else setMode("read");
            }}
            title="Buang koreksi rekam?"
            tone="warning"
          />
        ) : null}
      </>
    );
  }

  return (
    <NexusWorkspaceDrawer
      closeLabel="Tutup rincian rekam"
      description="Telusuri kaitan rekam dengan indikator, eviden, asal data, dan keputusan tinjauannya."
      eyebrow={`${record.publicId} · ${indicatorId}`}
      onClose={onClose}
      title="Rekam pembentuk realisasi"
    >
      {savedNotice ? (
        <NexusWorkspaceNotice tone="success">
          {savedNotice}
        </NexusWorkspaceNotice>
      ) : null}
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

        {canCorrect ? (
          <div className={styles.recordCorrectAction}>
            <NexusWorkspaceButton
              onClick={() => {
                setSavedNotice("");
                setMode("correct");
              }}
              tone="primary"
              type="button"
            >
              Koreksi data
            </NexusWorkspaceButton>
            <span>
              Perbaiki tanggal, triwulan, kaitan KM, atau bidang penentu lain
              tanpa meninggalkan Monitoring.
            </span>
          </div>
        ) : null}
      </section>

      {isComplete ? null : (
        <aside className={detail.completenessNotice}>
          <MonitoringIcon name="alert" />
          <div>
            <strong>Metadata rekam masih perlu dilengkapi</strong>
            <p>
              Sebagian bidang rekam ini belum selesai diperiksa pada rumah Data
              Resmi. Kelengkapan metadata dinilai terpisah dari ketentuan
              perhitungan indikator, sehingga keduanya dapat berbeda.
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
          <p>Kaitan rekam dan keadaan perhitungannya</p>
        </div>

        <p className={detail.explanation}>{record.linkNote}</p>

        <dl
          aria-label="Kaitan rekam dengan indikator"
          className={detail.metadataDetails}
        >
          <DetailField
            label="Perhitungan realisasi"
            value={record.counting.label}
          />
          <DetailField
            label="Dasar triwulan"
            value={
              record.quarterBasis === "tanggal"
                ? `${businessDateLabel} ${record.businessDateLabel} · ${record.quarterLabel}`
                : record.quarterBasis === "dilaporkan"
                  ? `${record.quarterLabel}${record.reportedQuarterSource ? ` (${record.reportedQuarterSource})` : ""}`
                  : record.businessDateLabel
                    ? `${businessDateLabel} ${record.businessDateLabel} · ${record.quarterLabel}`
                    : "Tanggal maupun triwulan dilaporkan belum tercatat, sehingga rekam tidak masuk triwulan mana pun"
            }
          />
          {record.counting.reason ? (
            <DetailField
              label="Alasan"
              value={
                canCorrect && record.counting.state !== "counted"
                  ? `${record.counting.reason} Bila datanya keliru, gunakan Koreksi data.`
                  : record.counting.reason
              }
              wide
            />
          ) : null}
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

      {corrections.length > 0 ? (
        <section
          aria-labelledby="monitoring-record-corrections-title"
          className={detail.detailSection}
        >
          <div className={detail.sectionHeading}>
            <div>
              <span className={detail.sectionIndex}>05</span>
              <h3 id="monitoring-record-corrections-title">Riwayat koreksi</h3>
            </div>
            <p>Koreksi langsung dari Monitoring KM</p>
          </div>
          <ol className={styles.correctionHistory}>
            {[...corrections].reverse().map((correction) => (
              <li key={correction.id}>
                <strong>
                  {correction.actorName} · {correction.actorRoleLabel}
                </strong>
                <span>{formatAuditTimestamp(correction.appliedAt)}</span>
                <ul>
                  {correction.changes.map((change) => (
                    <li key={change.field}>
                      {change.label}: {change.before} → {change.after}
                    </li>
                  ))}
                </ul>
                <p>{correction.reason}</p>
              </li>
            ))}
          </ol>
        </section>
      ) : null}

      <section
        aria-labelledby="monitoring-record-review-title"
        className={detail.reviewSection}
      >
        <div className={detail.sectionHeading}>
          <div>
            <span className={detail.sectionIndex}>
              {corrections.length > 0 ? "06" : "05"}
            </span>
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
