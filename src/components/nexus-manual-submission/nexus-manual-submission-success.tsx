import { useState } from "react";
import type { AuditReviewRecord } from "@/components/nexus-audit-review/nexus-audit-review-content";
import styles from "@/components/nexus-manual-submission/nexus-manual-submission.module.css";
import type { ManualKmSuggestion } from "@/components/nexus-manual-submission/nexus-manual-submission-model";
import { NexusWorkspaceLinkButton } from "@/components/nexus-workspace-ui/nexus-workspace-elements";

type NexusManualSubmissionSuccessProps = {
  kmSuggestion: ManualKmSuggestion | null;
  noun: string;
  officialHref: string;
  officialLabel: string;
  onReset: () => void;
  record: AuditReviewRecord;
  subtypeLabel: string;
  titleLabel: string;
};

type SuccessGlyphName =
  | "calendar"
  | "check"
  | "copy"
  | "document"
  | "evidence"
  | "info"
  | "km"
  | "person"
  | "plus"
  | "review"
  | "send"
  | "team"
  | "type";

function SuccessGlyph({ name }: { name: SuccessGlyphName }) {
  return (
    <svg aria-hidden="true" fill="none" viewBox="0 0 24 24">
      {name === "calendar" ? (
        <>
          <rect height="16" rx="2" width="18" x="3" y="5" />
          <path d="M7 3v4M17 3v4M3 9h18M7 13h3M7 17h3M14 13h3" />
        </>
      ) : name === "check" ? (
        <>
          <circle cx="12" cy="12" r="9" />
          <path d="m8 12.3 2.6 2.6 5.7-6" />
        </>
      ) : name === "copy" ? (
        <>
          <rect height="13" rx="2" width="11" x="9" y="8" />
          <path d="M15 8V5a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h3" />
        </>
      ) : name === "document" ? (
        <>
          <path d="M6 3h8l4 4v14H6zM14 3v5h4" />
          <path d="M9 12h6M9 16h6" />
        </>
      ) : name === "evidence" ? (
        <path d="m9.5 12.5 5.8-5.8a3.2 3.2 0 0 1 4.5 4.5l-8.2 8.2a5 5 0 0 1-7.1-7.1l8.1-8.1M7.8 15.8l7.6-7.6" />
      ) : name === "info" ? (
        <>
          <circle cx="12" cy="12" r="9" />
          <path d="M12 10v6M12 7h.01" />
        </>
      ) : name === "km" ? (
        <>
          <path d="M8.2 14.7a7 7 0 1 1 7.6 0c-.7.5-.8 1.1-.8 1.3H9c0-.2-.1-.8-.8-1.3Z" />
          <path d="M9 19h6M10.5 22h3" />
        </>
      ) : name === "person" ? (
        <>
          <circle cx="12" cy="8" r="3.5" />
          <path d="M5 21c.3-4 2.6-6 7-6s6.7 2 7 6" />
        </>
      ) : name === "plus" ? (
        <path d="M12 5v14M5 12h14" />
      ) : name === "review" ? (
        <>
          <rect height="16" rx="2" width="15" x="4.5" y="4" />
          <path d="M9 4V2.5h6V4M8.5 9h7M8.5 13h5M8.5 17h3" />
        </>
      ) : name === "send" ? (
        <path d="m3 10 18-7-6.5 18-3-7.5zM11.5 13.5 21 3" />
      ) : name === "team" ? (
        <>
          <circle cx="8" cy="8" r="3" />
          <circle cx="17" cy="9" r="2.5" />
          <path d="M2.5 20c.3-4 2-6 5.5-6s5.2 2 5.5 6M14 15c3.8-.5 6 1.2 6.5 4.5" />
        </>
      ) : name === "type" ? (
        <>
          <path d="M6 3h8l4 4v14H6zM14 3v5h4" />
          <rect height="5" rx="1" width="6" x="9" y="11" />
        </>
      ) : null}
    </svg>
  );
}

function evidenceSummary(record: AuditReviewRecord) {
  const evidence = record.evidence[0];
  if (!evidence) return "Belum ada tautan bukti";

  try {
    const hostname = new URL(evidence.href ?? evidence.reference).hostname;
    return `1 tautan HTTPS · ${hostname.replace(/^www\./, "")}`;
  } catch {
    return "1 tautan HTTPS";
  }
}

function SuccessSummaryItem({
  icon,
  label,
  tone,
  value,
}: {
  icon: SuccessGlyphName;
  label: string;
  tone?: "blue" | "green" | "orange" | "purple";
  value: string;
}) {
  return (
    <div className={styles.successSummaryItem}>
      <span className={styles.successSummaryIcon} data-tone={tone ?? "blue"}>
        <SuccessGlyph name={icon} />
      </span>
      <div>
        <dt>{label}</dt>
        <dd>{value}</dd>
      </div>
    </div>
  );
}

export function NexusManualSubmissionSuccess({
  kmSuggestion,
  noun,
  officialHref,
  officialLabel,
  onReset,
  record,
  subtypeLabel,
  titleLabel,
}: NexusManualSubmissionSuccessProps) {
  const [copyStatus, setCopyStatus] = useState<"copied" | "failed" | "idle">(
    "idle",
  );
  const kmLabel = kmSuggestion
    ? `${kmSuggestion.indicator.id} — ${kmSuggestion.indicator.label}`
    : "Belum tersedia — akan ditentukan reviewer";

  async function copySubmissionCode() {
    try {
      await navigator.clipboard.writeText(record.id);
      setCopyStatus("copied");
    } catch {
      setCopyStatus("failed");
    }
  }

  return (
    <section
      aria-labelledby="manual-submission-page-title"
      className={`${styles.page} ${styles.successPage}`}
    >
      <header className={styles.successHero}>
        <span className={styles.successIcon}>
          <SuccessGlyph name="check" />
        </span>
        <h2 id="manual-submission-page-title">Pengajuan berhasil dikirim</h2>
        <p>
          Terima kasih. Pengajuan {noun} Anda sudah masuk ke antrean dan sedang
          menunggu tinjauan.
        </p>
      </header>

      <div className={styles.submissionReceipt}>
        <div className={styles.receiptCode}>
          <span>Kode pengajuan</span>
          <div>
            <strong>{record.id}</strong>
            <button
              aria-label={`Salin kode pengajuan ${record.id}`}
              onClick={copySubmissionCode}
              title="Salin kode pengajuan"
              type="button"
            >
              <SuccessGlyph name="copy" />
            </button>
          </div>
          <p className={styles.receiptTime}>
            Waktu pengajuan · {record.discoveredAtLabel}
          </p>
        </div>
        <output aria-live="polite" className={styles.copyFeedback}>
          {copyStatus === "copied"
            ? "Kode pengajuan berhasil disalin."
            : copyStatus === "failed"
              ? "Kode belum dapat disalin. Salin kode secara manual."
              : ""}
        </output>
      </div>

      <section className={styles.nextSteps}>
        <h3>Apa yang terjadi selanjutnya?</h3>
        <ol>
          <li>
            <span className={styles.stepNumber}>1</span>
            <span className={styles.stepIcon}>
              <SuccessGlyph name="team" />
            </span>
            <div>
              <h4>Ditinjau oleh tim</h4>
              <p>Reviewer memeriksa kelengkapan metadata dan bukti.</p>
            </div>
          </li>
          <li>
            <span className={styles.stepNumber}>2</span>
            <span className={styles.stepIcon}>
              <SuccessGlyph name="review" />
            </span>
            <div>
              <h4>Evaluasi & klarifikasi</h4>
              <p>Anda akan diminta melengkapi informasi bila diperlukan.</p>
            </div>
          </li>
          <li>
            <span className={styles.stepNumber}>3</span>
            <span className={styles.stepIcon}>
              <SuccessGlyph name="check" />
            </span>
            <div>
              <h4>Hasil tinjauan</h4>
              <p>Keputusan reviewer akan tercatat di BHT Nexus.</p>
            </div>
          </li>
        </ol>
      </section>

      <section className={styles.receiptSummary}>
        <h3>Ringkasan pengajuan</h3>
        <dl>
          <SuccessSummaryItem
            icon="document"
            label={titleLabel}
            value={record.title}
          />
          <SuccessSummaryItem icon="type" label="Jenis" value={subtypeLabel} />
          <SuccessSummaryItem
            icon="calendar"
            label="Periode evaluasi"
            tone="orange"
            value={record.evaluationPeriodLabel ?? "Belum ditetapkan"}
          />
          <SuccessSummaryItem
            icon="person"
            label="Diajukan oleh"
            value={record.submittedBy}
          />
          <SuccessSummaryItem
            icon="evidence"
            label="Bukti pendukung"
            tone="green"
            value={evidenceSummary(record)}
          />
          <SuccessSummaryItem
            icon="km"
            label="Indikator KM yang disarankan"
            tone="purple"
            value={kmLabel}
          />
        </dl>
      </section>

      <div className={styles.successActions}>
        <NexusWorkspaceLinkButton
          href={`/nexus/tinjauan?record=${encodeURIComponent(record.id)}`}
          tone="primary"
        >
          <SuccessGlyph name="review" />
          Buka di Tinjauan
        </NexusWorkspaceLinkButton>
        <NexusWorkspaceLinkButton href={officialHref}>
          Kembali ke {officialLabel}
        </NexusWorkspaceLinkButton>
        <button className={styles.successReset} onClick={onReset} type="button">
          <SuccessGlyph name="plus" />
          Ajukan {noun} lain
        </button>
      </div>

      <p className={styles.successHint}>
        <SuccessGlyph name="info" />
        Cari kandidat di Tinjauan menggunakan judul atau kode pengajuan.
      </p>
      <p className={styles.successHint}>
        <SuccessGlyph name="info" />
        Keputusan tinjauan untuk pengajuan ini belum tersambung ke daftar{" "}
        {officialLabel}.
      </p>
    </section>
  );
}
