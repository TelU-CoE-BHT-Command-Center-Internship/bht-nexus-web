"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import styles from "@/components/nexus-review-summary/nexus-review-detail.module.css";
import { nexusReviewOwnerPortraits } from "@/components/nexus-review-summary/nexus-review-owner-portraits";
import {
  type ReviewCandidateRow,
  type ReviewCandidateStatus,
  type ReviewRecordFieldKey,
  reviewComparisonLabels,
  reviewStatusLabels,
} from "@/components/nexus-review-summary/nexus-review-table-content";

type NexusReviewDetailProps = {
  candidate: ReviewCandidateRow;
  onClose: () => void;
  onReviewerNoteChange: (candidateId: string, note: string) => void;
  onStatusChange: (candidateId: string, status: ReviewCandidateStatus) => void;
};

const finalStatuses: readonly ReviewCandidateStatus[] = [
  "approved",
  "rejected",
];

function CloseIcon() {
  return (
    <svg aria-hidden="true" fill="none" viewBox="0 0 20 20">
      <path d="m5 5 10 10M15 5 5 15" />
    </svg>
  );
}

function ExternalLinkIcon() {
  return (
    <svg aria-hidden="true" fill="none" viewBox="0 0 16 16">
      <path d="M9 3h4v4M13 3 7.5 8.5" />
      <path d="M12 9.5V12a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1h2.5" />
    </svg>
  );
}

function MetaItem({ label, value }: { label: string; value: string }) {
  return (
    <div className={styles.metaItem}>
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}

function getVisibleValue(
  value: string | undefined,
  fallback: "Belum ada" | "Kosong",
) {
  return value?.trim() || fallback;
}

function ComparisonField({
  candidate,
  fieldKey,
}: {
  candidate: ReviewCandidateRow;
  fieldKey: ReviewRecordFieldKey;
}) {
  const comparison = candidate.comparisons.find(
    (entry) => entry.key === fieldKey,
  );

  if (!comparison) {
    return null;
  }

  return (
    <article className={styles.comparisonField} data-field={fieldKey}>
      <header>
        <h4>{comparison.label}</h4>
        <span className={styles.comparisonBadge} data-tone={comparison.status}>
          {reviewComparisonLabels[comparison.status]}
        </span>
      </header>

      <div className={styles.valuePair}>
        <div>
          <span>Kandidat</span>
          <p>{getVisibleValue(candidate.record[fieldKey], "Kosong")}</p>
        </div>
        <div>
          <span>Data resmi BHT Nexus</span>
          <p>
            {candidate.officialRecord
              ? getVisibleValue(candidate.officialRecord[fieldKey], "Kosong")
              : "Belum ada"}
          </p>
        </div>
      </div>
    </article>
  );
}

export function NexusReviewDetail({
  candidate,
  onClose,
  onReviewerNoteChange,
  onStatusChange,
}: NexusReviewDetailProps) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLElement>(null);
  const [showRejectConfirmation, setShowRejectConfirmation] = useState(false);
  const isFinal = finalStatuses.includes(candidate.status);
  const hasReviewerNote = candidate.reviewerNote.trim().length > 0;

  useEffect(() => {
    const previousFocusedElement =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
    closeButtonRef.current?.focus({ preventScroll: true });

    const handleDialogKeyboard = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }

      if (event.key !== "Tab" || !dialogRef.current) {
        return;
      }

      const focusableElements = Array.from(
        dialogRef.current.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ),
      ).filter((element) => !element.hasAttribute("hidden"));
      const firstElement = focusableElements[0];
      const lastElement = focusableElements.at(-1);

      if (!firstElement || !lastElement) {
        return;
      }

      if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      } else if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    };

    document.addEventListener("keydown", handleDialogKeyboard);

    return () => {
      document.removeEventListener("keydown", handleDialogKeyboard);
      previousFocusedElement?.focus({ preventScroll: true });
    };
  }, [onClose]);

  const requestRevision = () => {
    if (!hasReviewerNote) {
      return;
    }

    onStatusChange(candidate.id, "needs-fix");
  };

  const rejectCandidate = () => {
    if (!hasReviewerNote) {
      return;
    }

    onStatusChange(candidate.id, "rejected");
  };

  return (
    <div className={styles.layer}>
      <button
        aria-label="Tutup rincian kandidat"
        className={styles.backdrop}
        onClick={onClose}
        type="button"
      />

      <aside
        aria-describedby="review-detail-description"
        aria-labelledby="review-detail-title"
        aria-modal="true"
        className={styles.drawer}
        ref={dialogRef}
        role="dialog"
      >
        <header className={styles.drawerHeader}>
          <div>
            <span className={styles.eyebrow}>{candidate.id}</span>
            <h2 id="review-detail-title">Rincian Kandidat</h2>
            <p id="review-detail-description">
              Bandingkan kandidat dengan data resmi sebelum mengambil keputusan.
            </p>
          </div>

          <button
            aria-label="Tutup rincian"
            className={styles.closeButton}
            onClick={onClose}
            ref={closeButtonRef}
            type="button"
          >
            <CloseIcon />
          </button>
        </header>

        <div className={styles.drawerBody}>
          <section
            aria-labelledby="candidate-overview-title"
            className={styles.overview}
          >
            <div className={styles.overviewHeading}>
              <div>
                <span
                  className={styles.sourceBadge}
                  data-source={candidate.source.toLowerCase()}
                >
                  {candidate.source}
                </span>
                <span
                  className={styles.statusBadge}
                  data-tone={candidate.status}
                >
                  {reviewStatusLabels[candidate.status]}
                </span>
              </div>
              <h3 id="candidate-overview-title">{candidate.record.title}</h3>
              <p>{candidate.record.authors}</p>
            </div>

            {isFinal ? (
              <div
                aria-live="polite"
                className={styles.finalState}
                data-tone={candidate.status}
              >
                <strong>
                  Keputusan final: {reviewStatusLabels[candidate.status]}
                </strong>
                <span>
                  Kandidat ini hanya dapat dibaca setelah keputusan final
                  ditetapkan.
                </span>
              </div>
            ) : null}

            <dl className={styles.metaGrid}>
              <MetaItem label="Sumber" value={candidate.source} />
              <MetaItem label="Jenis" value={candidate.publicationType} />
              <MetaItem label="DOI" value={candidate.record.doi} />
              <MetaItem label="Ditemukan" value={candidate.discoveredAt} />
              <MetaItem label="Pemilik" value={candidate.owner.name} />
              <MetaItem label="Tahun" value={candidate.record.year} />
            </dl>

            {candidate.sourceHref ? (
              <a
                className={styles.sourceLink}
                href={candidate.sourceHref}
                rel="noreferrer"
                target="_blank"
              >
                Buka di {candidate.source}
                <ExternalLinkIcon />
              </a>
            ) : (
              <p className={styles.manualSource}>
                Sumber manual internal; tidak ada tautan publik yang aman.
              </p>
            )}
          </section>

          <section
            aria-labelledby="comparison-title"
            className={styles.detailSection}
          >
            <div className={styles.sectionHeading}>
              <div>
                <h3 id="comparison-title">Perbandingan Data</h3>
                <p>
                  Label menunjukkan kesamaan isi secara kualitatif untuk
                  membantu reviewer membandingkan kedua versi.
                </p>
              </div>
            </div>

            <div className={styles.comparisonList}>
              {candidate.comparisons.map((comparison) => (
                <ComparisonField
                  candidate={candidate}
                  fieldKey={comparison.key}
                  key={comparison.key}
                />
              ))}
            </div>
          </section>

          <section
            aria-labelledby="related-members-title"
            className={styles.detailSection}
          >
            <div className={styles.sectionHeading}>
              <div>
                <h3 id="related-members-title">Anggota BHT Terkait</h3>
                <p>
                  Pemilik dan anggota yang terhubung dengan kandidat publikasi
                  ini.
                </p>
              </div>
            </div>

            <ul className={styles.memberList}>
              {candidate.relatedMembers.map((member) => (
                <li key={member.name}>
                  <Image
                    alt=""
                    height={40}
                    sizes="2.5rem"
                    src={nexusReviewOwnerPortraits[member.portrait]}
                    width={40}
                  />
                  <span>
                    <strong>{member.name}</strong>
                    <small>{member.role}</small>
                  </span>
                </li>
              ))}
            </ul>
          </section>

          <section
            aria-labelledby="review-note-title"
            className={styles.detailSection}
          >
            <div className={styles.sectionHeading}>
              <div>
                <h3 id="review-note-title">Catatan Reviewer</h3>
                <p>
                  Catatan menjadi bagian dari dasar keputusan dan riwayat
                  tinjauan.
                </p>
              </div>
            </div>

            {candidate.previousIssue ? (
              <div className={styles.previousIssue}>
                <strong>Catatan atau isu sebelumnya</strong>
                <p>{candidate.previousIssue}</p>
              </div>
            ) : null}

            {isFinal ? (
              <div className={styles.readOnlyNote}>
                <span>Catatan keputusan</span>
                <p>{candidate.reviewerNote || "Tidak ada catatan tambahan."}</p>
              </div>
            ) : (
              <label className={styles.noteField}>
                <span>
                  Tuliskan temuan, alasan, atau perbaikan yang dibutuhkan
                </span>
                <textarea
                  maxLength={600}
                  onChange={(event) =>
                    onReviewerNoteChange(
                      candidate.id,
                      event.currentTarget.value,
                    )
                  }
                  placeholder="Contoh: DOI belum sesuai dengan halaman sumber dan afiliasi penulis kedua perlu dilengkapi."
                  rows={5}
                  value={candidate.reviewerNote}
                />
                <small>{candidate.reviewerNote.length} / 600 karakter</small>
              </label>
            )}

            {!isFinal ? (
              <div className={styles.decisionArea}>
                {!hasReviewerNote ? (
                  <p className={styles.noteRequired}>
                    Tambahkan catatan sebelum menolak atau meminta perbaikan.
                  </p>
                ) : null}

                {showRejectConfirmation ? (
                  <div aria-live="polite" className={styles.rejectConfirmation}>
                    <div>
                      <strong>Tolak kandidat ini?</strong>
                      <span>
                        Keputusan ini akan menetapkan status kandidat sebagai
                        Ditolak.
                      </span>
                    </div>
                    <div>
                      <button
                        className={styles.secondaryButton}
                        onClick={() => setShowRejectConfirmation(false)}
                        type="button"
                      >
                        Batal
                      </button>
                      <button
                        className={styles.rejectButton}
                        onClick={rejectCandidate}
                        type="button"
                      >
                        Ya, Tolak
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className={styles.actionButtons}>
                    <button
                      className={styles.rejectButton}
                      disabled={!hasReviewerNote}
                      onClick={() => setShowRejectConfirmation(true)}
                      type="button"
                    >
                      Tolak
                    </button>
                    <button
                      className={styles.secondaryButton}
                      disabled={!hasReviewerNote}
                      onClick={requestRevision}
                      type="button"
                    >
                      Minta Perbaikan
                    </button>
                    <button
                      className={styles.approveButton}
                      onClick={() => onStatusChange(candidate.id, "approved")}
                      type="button"
                    >
                      Setujui
                    </button>
                  </div>
                )}
              </div>
            ) : null}
          </section>

          <section
            aria-labelledby="review-timeline-title"
            className={styles.detailSection}
          >
            <div className={styles.sectionHeading}>
              <div>
                <h3 id="review-timeline-title">Riwayat Tinjauan</h3>
                <p>
                  Urutan singkat sejak kandidat ditemukan sampai keputusan
                  terakhir.
                </p>
              </div>
            </div>

            <ol className={styles.timeline}>
              {candidate.timeline.map((entry) => (
                <li data-tone={entry.tone} key={entry.id}>
                  <span aria-hidden="true" className={styles.timelineMarker} />
                  <div>
                    <strong>{entry.label}</strong>
                    <p>{entry.detail}</p>
                    <time>{entry.timeLabel}</time>
                  </div>
                </li>
              ))}
            </ol>
          </section>
        </div>
      </aside>
    </div>
  );
}
