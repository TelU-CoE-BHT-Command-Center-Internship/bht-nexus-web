"use client";

import { useState } from "react";
import styles from "@/components/nexus-review-summary/nexus-metadata-completion-review.module.css";
import {
  type ReviewCandidateRow,
  type ReviewCandidateStatus,
  type ReviewCompletionResolution,
  type ReviewStatusChangeContext,
  reviewCompletionFieldLabels,
  reviewDecisionLabels,
  reviewStatusLabels,
} from "@/components/nexus-review-summary/nexus-review-table-content";
import { NexusWorkspaceDrawer } from "@/components/nexus-workspace-ui/nexus-workspace-drawer";

type CompletionDecision = "approve" | "needs-fix" | "reject";

type NexusMetadataCompletionReviewProps = {
  candidate: ReviewCandidateRow;
  onClose: () => void;
  onReviewerNoteChange: (candidateId: string, note: string) => void;
  onStatusChange: (
    candidateId: string,
    status: ReviewCandidateStatus,
    context?: ReviewStatusChangeContext,
  ) => void;
};

const resolutionLabels = {
  "not-applicable": "Tidak berlaku",
  "not-available": "Memang tidak tersedia",
  provided: "Nilai diajukan",
} as const;

function ReviewDocumentIcon() {
  return (
    <svg aria-hidden="true" fill="none" viewBox="0 0 24 24">
      <path d="M6 3.5h8l4 4v13H6z" />
      <path d="M14 3.5v4h4M9 12h6M9 16h4" />
    </svg>
  );
}

function getResolutionDisplay(resolution?: ReviewCompletionResolution) {
  if (!resolution) return "Belum ada usulan";
  if (resolution.status === "provided") return resolution.value;
  return resolutionLabels[resolution.status];
}

export function NexusMetadataCompletionReview({
  candidate,
  onClose,
  onReviewerNoteChange,
  onStatusChange,
}: NexusMetadataCompletionReviewProps) {
  const proposal = candidate.completionProposal;
  const [decision, setDecision] = useState<CompletionDecision | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);

  if (!proposal) return null;

  const isWaiting = candidate.status === "waiting";
  const hasReviewerNote = candidate.reviewerNote.trim().length > 0;

  const chooseDecision = (nextDecision: CompletionDecision) => {
    setDecision(nextDecision);
    setShowConfirmation(false);
  };

  const prepareDecision = () => {
    if (!decision || !hasReviewerNote) return;
    setShowConfirmation(true);
  };

  const confirmDecision = () => {
    if (!decision || !hasReviewerNote) return;

    if (decision === "approve") {
      onStatusChange(candidate.id, "completed", {
        decision: "approved-completion",
        detail: `Usulan ${proposal.id} disetujui. ${candidate.reviewerNote.trim()}`,
        label: "Pelengkapan metadata disetujui",
      });
    } else if (decision === "needs-fix") {
      onStatusChange(candidate.id, "needs-fix", {
        detail: candidate.reviewerNote.trim(),
        label: "Perbaikan usulan diminta",
      });
    } else {
      onStatusChange(candidate.id, "completed", {
        decision: "rejected",
        detail: `Usulan ${proposal.id} ditolak. ${candidate.reviewerNote.trim()}`,
        label: "Usulan pelengkapan ditolak",
      });
    }

    onClose();
  };

  const selectedConsequence =
    decision === "approve"
      ? "Nilai dan pengecualian yang disetujui menjadi bagian rekam resmi. Setelah seluruh bidang wajib terselesaikan, kelengkapan dihitung ulang."
      : decision === "needs-fix"
        ? "Rekam resmi tidak berubah. Usulan dikembalikan kepada pengaju bersama catatan pemeriksa."
        : decision === "reject"
          ? "Rekam resmi tidak berubah. Usulan ditutup, sedangkan riwayat keputusan tetap tersimpan."
          : "Pilih satu keputusan untuk melihat akibatnya sebelum disimpan.";

  return (
    <NexusWorkspaceDrawer
      closeLabel="Tutup tinjauan pelengkapan metadata"
      description="Periksa nilai atau pengecualian yang diajukan untuk publikasi resmi sebelum menetapkan keputusan."
      eyebrow={`${proposal.id} · ${proposal.publicationId}`}
      onClose={onClose}
      steps={[
        { active: true, complete: true, label: "Rekam resmi", number: 1 },
        {
          active: true,
          complete: true,
          label: "Usulan",
          number: 2,
        },
        {
          active: !isWaiting || showConfirmation,
          complete: !isWaiting,
          label: "Keputusan",
          number: 3,
        },
      ]}
      title="Tinjau pelengkapan metadata"
    >
      <section className={styles.proposalHero}>
        <span className={styles.proposalIcon}>
          <ReviewDocumentIcon />
        </span>
        <div>
          <span className={styles.proposalEyebrow}>
            Usulan untuk publikasi resmi
          </span>
          <h3>{candidate.record.title}</h3>
          <p>{candidate.record.authors}</p>
          <dl>
            <div className={styles.proposalMetaItem}>
              <dt>ID publikasi</dt>
              <dd>{proposal.publicationId}</dd>
            </div>
            <div className={styles.proposalMetaItem}>
              <dt>Jenis</dt>
              <dd>{candidate.publicationType}</dd>
            </div>
            <div className={styles.proposalMetaItem}>
              <dt>Pengaju</dt>
              <dd>{proposal.submittedBy}</dd>
            </div>
            <div className={styles.proposalMetaItem}>
              <dt>Dikirim</dt>
              <dd>{proposal.submittedAt}</dd>
            </div>
          </dl>
        </div>
      </section>

      <section
        aria-labelledby="official-record-title"
        className={styles.section}
      >
        <header className={styles.sectionHeading}>
          <div className={styles.officialSummaryItem}>
            <span>01</span>
            <h3 id="official-record-title">Kondisi rekam resmi</h3>
          </div>
          <p>{proposal.affectedFields.length} bidang belum selesai</p>
        </header>
        <p className={styles.sectionIntro}>
          Publikasi ini sudah resmi. Usulan hanya menyelesaikan bidang berikut
          dan tidak membuat publikasi baru.
        </p>
        <dl className={styles.officialSummary}>
          <div className={styles.officialSummaryItem}>
            <dt>DOI</dt>
            <dd>{candidate.record.doi || "Belum tersedia"}</dd>
          </div>
          <div className={styles.officialSummaryItem}>
            <dt>Jurnal / wadah terbit</dt>
            <dd>{candidate.record.journal}</dd>
          </div>
          <div className={styles.officialSummaryItem}>
            <dt>Tahun</dt>
            <dd>{candidate.record.year}</dd>
          </div>
          <div>
            <dt>Kelengkapan saat ini</dt>
            <dd className={styles.incompleteValue}>Perlu dilengkapi</dd>
          </div>
        </dl>
      </section>

      <section
        aria-labelledby="proposal-fields-title"
        className={styles.section}
      >
        <header className={styles.sectionHeading}>
          <div>
            <span>02</span>
            <h3 id="proposal-fields-title">Bandingkan usulan</h3>
          </div>
          <p>Nilai resmi saat ini vs usulan</p>
        </header>
        <div className={styles.proposalFields}>
          {proposal.affectedFields.map((fieldKey) => {
            const resolution = proposal.resolutions[fieldKey];
            const currentValue = proposal.officialValues[fieldKey];

            return (
              <article key={fieldKey}>
                <header>
                  <h4>{reviewCompletionFieldLabels[fieldKey]}</h4>
                  <span data-tone={resolution?.status}>
                    {resolution
                      ? resolutionLabels[resolution.status]
                      : "Belum ada usulan"}
                  </span>
                </header>
                <div className={styles.valueComparison}>
                  <div>
                    <span className={styles.valueLabel}>
                      Nilai resmi saat ini
                    </span>
                    <strong>{currentValue || "Belum tersedia"}</strong>
                  </div>
                  <div>
                    <span className={styles.valueLabel}>Usulan</span>
                    <strong>{getResolutionDisplay(resolution)}</strong>
                  </div>
                </div>
                <p>
                  <b>Alasan:</b>{" "}
                  {resolution?.reason || "Alasan belum diberikan."}
                </p>
              </article>
            );
          })}
        </div>
        <aside className={styles.sourceNote}>
          <strong>Sumber atau dasar usulan</strong>
          <p>{proposal.sourceNote}</p>
        </aside>
      </section>

      <section
        aria-labelledby="completion-decision-title"
        className={styles.section}
      >
        <header className={styles.sectionHeading}>
          <div>
            <span>03</span>
            <h3 id="completion-decision-title">Tetapkan keputusan</h3>
          </div>
          <p>Rekam resmi aman sampai usulan disetujui</p>
        </header>

        {isWaiting ? (
          <>
            <fieldset className={styles.decisionChoices}>
              <legend className={styles.visuallyHidden}>
                Keputusan usulan pelengkapan metadata
              </legend>
              <label data-selected={decision === "approve" || undefined}>
                <input
                  checked={decision === "approve"}
                  name="completion-decision"
                  onChange={() => chooseDecision("approve")}
                  type="radio"
                />
                <span className={styles.decisionCopy}>
                  <strong>Setujui pelengkapan</strong>
                  <small>
                    Terapkan nilai dan pengecualian yang terbukti, lalu hitung
                    ulang kelengkapan.
                  </small>
                </span>
              </label>
              <label data-selected={decision === "needs-fix" || undefined}>
                <input
                  checked={decision === "needs-fix"}
                  name="completion-decision"
                  onChange={() => chooseDecision("needs-fix")}
                  type="radio"
                />
                <span className={styles.decisionCopy}>
                  <strong>Minta perbaikan usulan</strong>
                  <small>
                    Kembalikan usulan; data resmi tetap tidak berubah.
                  </small>
                </span>
              </label>
              <label data-selected={decision === "reject" || undefined}>
                <input
                  checked={decision === "reject"}
                  name="completion-decision"
                  onChange={() => chooseDecision("reject")}
                  type="radio"
                />
                <span className={styles.decisionCopy}>
                  <strong>Tolak usulan</strong>
                  <small>
                    Tutup usulan tanpa menerapkan nilai atau pengecualian.
                  </small>
                </span>
              </label>
            </fieldset>

            <div aria-live="polite" className={styles.consequence}>
              <strong>Akibat keputusan</strong>
              <p>{selectedConsequence}</p>
            </div>

            <label className={styles.noteField}>
              <span className={styles.noteLabel}>
                Alasan keputusan <em>wajib</em>
              </span>
              <textarea
                maxLength={600}
                onChange={(event) => {
                  onReviewerNoteChange(candidate.id, event.currentTarget.value);
                  setShowConfirmation(false);
                }}
                placeholder="Catat sumber yang diperiksa dan alasan keputusan."
                rows={4}
                value={candidate.reviewerNote}
              />
              <small>{candidate.reviewerNote.length} / 600 karakter</small>
            </label>

            {showConfirmation ? (
              <div aria-live="polite" className={styles.confirmation}>
                <div className={styles.confirmationCopy}>
                  <strong>Simpan keputusan ini?</strong>
                  <p>{selectedConsequence}</p>
                </div>
                <div className={styles.confirmationActions}>
                  <button
                    className={styles.secondaryButton}
                    onClick={() => setShowConfirmation(false)}
                    type="button"
                  >
                    Kembali periksa
                  </button>
                  <button
                    className={styles.primaryButton}
                    onClick={confirmDecision}
                    type="button"
                  >
                    Ya, simpan keputusan
                  </button>
                </div>
              </div>
            ) : (
              <div className={styles.actionRow}>
                <p>
                  Pilihan belum mengubah rekam resmi sebelum keputusan
                  dikonfirmasi.
                </p>
                <button
                  className={styles.primaryButton}
                  disabled={!decision || !hasReviewerNote}
                  onClick={prepareDecision}
                  type="button"
                >
                  Periksa sebelum simpan
                </button>
              </div>
            )}
          </>
        ) : (
          <div className={styles.readOnlyDecision}>
            <strong>
              {candidate.status === "needs-fix"
                ? "Perbaikan usulan diminta"
                : candidate.decision
                  ? reviewDecisionLabels[candidate.decision]
                  : reviewStatusLabels[candidate.status]}
            </strong>
            <p>{candidate.reviewerNote || "Tidak ada catatan tambahan."}</p>
            <small>
              {candidate.status === "needs-fix"
                ? "Rekam resmi belum berubah dan usulan menunggu perbaikan pengaju."
                : candidate.decision === "approved-completion"
                  ? "Nilai atau pengecualian yang disetujui dapat diterapkan ke rekam resmi dan kelengkapan dihitung ulang."
                  : "Rekam resmi tidak berubah; riwayat keputusan tetap disimpan."}
            </small>
          </div>
        )}
      </section>

      <details className={styles.timeline}>
        <summary>Riwayat usulan ({candidate.timeline.length})</summary>
        <ol>
          {candidate.timeline.map((entry) => (
            <li key={entry.id}>
              <strong>{entry.label}</strong>
              <p>{entry.detail}</p>
              <small>
                {entry.actor} · {entry.timeLabel}
              </small>
            </li>
          ))}
        </ol>
      </details>
    </NexusWorkspaceDrawer>
  );
}
