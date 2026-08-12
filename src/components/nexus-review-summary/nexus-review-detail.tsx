"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import styles from "@/components/nexus-review-summary/nexus-review-detail.module.css";
import { nexusReviewOwnerPortraits } from "@/components/nexus-review-summary/nexus-review-owner-portraits";
import {
  type ReviewCandidateRow,
  type ReviewCandidateStatus,
  type ReviewDecision,
  type ReviewOfficialMatch,
  type ReviewRecordFieldKey,
  type ReviewStatusChangeContext,
  reviewComparisonLabels,
  reviewDecisionLabels,
  reviewMatchVerdictLabels,
  reviewStatusLabels,
} from "@/components/nexus-review-summary/nexus-review-table-content";

type NexusReviewDetailProps = {
  candidate: ReviewCandidateRow;
  onClose: () => void;
  onReviewerNoteChange: (candidateId: string, note: string) => void;
  onStatusChange: (
    candidateId: string,
    status: ReviewCandidateStatus,
    context?: ReviewStatusChangeContext,
  ) => void;
};

type ReviewDecisionMode = "create" | "merge";

const finalStatuses: readonly ReviewCandidateStatus[] = ["completed"];

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

function CheckIcon() {
  return (
    <svg aria-hidden="true" fill="none" viewBox="0 0 16 16">
      <path d="m3 8.5 3 3L13 4.8" />
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

function ProvenanceCard({
  officialUpdatedAt,
  source,
}: {
  officialUpdatedAt?: string;
  source: ReviewCandidateRow["provenance"][number];
}) {
  const kindLabel = {
    document: "Dokumen",
    manual: "Input manual",
    official: "Data resmi",
    scraper: "Scraper",
  }[source.kind];

  return (
    <article className={styles.provenanceCard}>
      <header>
        <div>
          <strong>{source.label}</strong>
          <span>{kindLabel}</span>
        </div>
        {officialUpdatedAt ? (
          <small>Diperbarui {officialUpdatedAt}</small>
        ) : null}
      </header>

      <dl>
        <div>
          <dt>Diambil</dt>
          <dd>{source.retrievedAt}</dd>
        </div>
        <div>
          <dt>Kunci sumber</dt>
          <dd>{source.sourceKey}</dd>
        </div>
      </dl>

      <div className={styles.sourceAccess}>
        {source.href ? (
          <a href={source.href} rel="noreferrer" target="_blank">
            Buka sumber <ExternalLinkIcon />
          </a>
        ) : (
          <span>Sumber internal tanpa tautan publik.</span>
        )}
      </div>

      <details className={styles.technicalDetails}>
        <summary>Detail teknis</summary>
        <dl>
          <div>
            <dt>Parser</dt>
            <dd>{source.parserVersion}</dd>
          </div>
          <div>
            <dt>Job / upaya</dt>
            <dd>
              {source.jobId} / {source.attemptId}
            </dd>
          </div>
          <div>
            <dt>Hash respons</dt>
            <dd>{source.responseHash}</dd>
          </div>
        </dl>
      </details>
    </article>
  );
}

function getVisibleValue(value: string | undefined, fallback: string) {
  return value?.trim() || fallback;
}

function ComparisonField({
  candidate,
  fieldKey,
  match,
}: {
  candidate: ReviewCandidateRow;
  fieldKey: ReviewRecordFieldKey;
  match: ReviewOfficialMatch;
}) {
  const comparison = match.comparisons.find((entry) => entry.key === fieldKey);

  if (!comparison) {
    return null;
  }

  return (
    <article className={styles.comparisonField} data-field={fieldKey}>
      <header>
        <h4>{comparison.label}</h4>
        <div>
          <span className={styles.fieldScore}>{comparison.score}%</span>
          <span
            className={styles.comparisonBadge}
            data-tone={comparison.status}
          >
            {reviewComparisonLabels[comparison.status]}
          </span>
        </div>
      </header>

      <div className={styles.valuePair}>
        <div>
          <span>Kandidat masuk</span>
          <p>
            {getVisibleValue(
              candidate.record[fieldKey],
              "Tidak tersedia dari kandidat",
            )}
          </p>
        </div>
        <div>
          <span>Rekam resmi terpilih</span>
          <p>
            {getVisibleValue(
              match.officialRecord[fieldKey],
              "Tidak tersedia pada rekam resmi",
            )}
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
  const [selectedMatchId, setSelectedMatchId] = useState(
    candidate.matches[0]?.id ?? "",
  );
  const [decisionMode, setDecisionMode] = useState<ReviewDecisionMode>(
    candidate.matches.length > 0 ? "merge" : "create",
  );
  const [showRejectConfirmation, setShowRejectConfirmation] = useState(false);
  const selectedMatch =
    candidate.matches.find((match) => match.id === selectedMatchId) ??
    candidate.matches[0];
  const isFinal = finalStatuses.includes(candidate.status);
  const hasReviewerNote = candidate.reviewerNote.trim().length > 0;
  const hasExactIdentifier =
    selectedMatch?.verdict === "exact" ||
    selectedMatch?.verdict === "same-identifier";
  const canCreateNew = !selectedMatch || !hasExactIdentifier;
  const comparisonSummary = selectedMatch
    ? selectedMatch.comparisons.reduce(
        (summary, comparison) => {
          if (comparison.status === "same") {
            summary.same += 1;
          } else if (
            comparison.status === "empty" ||
            comparison.status === "unavailable"
          ) {
            summary.missing += 1;
          } else {
            summary.changed += 1;
          }

          return summary;
        },
        { changed: 0, missing: 0, same: 0 },
      )
    : null;

  useEffect(() => {
    const previousFocusedElement =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
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
          'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), summary, [tabindex]:not([tabindex="-1"])',
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
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleDialogKeyboard);
      previousFocusedElement?.focus({ preventScroll: true });
    };
  }, [onClose]);

  const chooseMatch = (match: ReviewOfficialMatch) => {
    setSelectedMatchId(match.id);

    if (match.verdict === "exact" || match.verdict === "same-identifier") {
      setDecisionMode("merge");
    }
  };

  const finishDecision = (
    status: ReviewCandidateStatus,
    context: ReviewStatusChangeContext & { decision?: ReviewDecision },
  ) => {
    onStatusChange(candidate.id, status, context);
    onClose();
  };

  const requestRevision = () => {
    if (!hasReviewerNote) return;
    finishDecision("needs-fix", {
      detail: candidate.reviewerNote.trim(),
      label: "Perbaikan metadata diminta",
    });
  };

  const rejectCandidate = () => {
    if (!hasReviewerNote) return;
    finishDecision("completed", {
      decision: "rejected",
      detail: candidate.reviewerNote.trim(),
      label: "Kandidat ditolak",
    });
  };

  const approveCandidate = () => {
    if (!hasReviewerNote || (decisionMode === "merge" && !selectedMatch))
      return;

    if (decisionMode === "merge" && selectedMatch) {
      finishDecision("completed", {
        decision: "merged",
        detail: `Kandidat digabungkan ke ${selectedMatch.id}. ${candidate.reviewerNote.trim()}`,
        label: "Kandidat digabungkan",
      });
      return;
    }

    finishDecision("completed", {
      decision: "approved-new",
      detail: `Kandidat disetujui sebagai rekam baru. ${candidate.reviewerNote.trim()}`,
      label: "Data baru disetujui",
    });
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
            <h2 id="review-detail-title">Rincian kandidat</h2>
            <p id="review-detail-description">
              Periksa kandidat, rekam terkait, dan bukti sebelum menetapkan
              keputusan.
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

        <nav className={styles.workflow} aria-label="Tahapan tinjauan">
          <span data-active="true">
            <i>
              <CheckIcon />
            </i>
            Kandidat
          </span>
          <span data-active="true">
            <i>2</i>Kecocokan
          </span>
          <span data-active={isFinal ? "true" : undefined}>
            <i>3</i>Keputusan
          </span>
        </nav>

        <div className={styles.drawerBody}>
          <section
            aria-labelledby="candidate-overview-title"
            className={styles.overview}
          >
            <div className={styles.overviewTop}>
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
              <time dateTime={candidate.discoveredAtIso}>
                {candidate.discoveredAt}
              </time>
            </div>
            <h3 id="candidate-overview-title">{candidate.record.title}</h3>
            <p>{candidate.record.authors}</p>

            <dl className={styles.metaGrid}>
              <MetaItem label="Jenis" value={candidate.publicationType} />
              <MetaItem label="DOI" value={candidate.record.doi} />
              <MetaItem label="Pemilik" value={candidate.owner.name} />
              <MetaItem label="Tahun" value={candidate.record.year} />
            </dl>

            <div className={styles.relatedMembers}>
              <strong>Anggota BHT terkait</strong>
              <ul>
                {candidate.relatedMembers.map((member) => (
                  <li key={member.name}>
                    <Image
                      alt={`Foto ${member.name}`}
                      height={32}
                      sizes="2rem"
                      src={nexusReviewOwnerPortraits[member.portrait]}
                      width={32}
                    />
                    <span>
                      <b>{member.name}</b>
                      <small>{member.role}</small>
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          <section
            className={styles.assessment}
            data-tone={candidate.duplicateAssessment.verdict}
          >
            <div className={styles.assessmentScore}>
              <strong>
                {candidate.duplicateAssessment.highestScore > 0
                  ? `${candidate.duplicateAssessment.highestScore}%`
                  : "Baru"}
              </strong>
              <span>skor tertinggi</span>
            </div>
            <div>
              <span className={styles.assessmentLabel}>
                {
                  reviewMatchVerdictLabels[
                    candidate.duplicateAssessment.verdict
                  ]
                }
              </span>
              <h3>{candidate.duplicateAssessment.explanation}</h3>
              <p>{candidate.duplicateAssessment.basis}</p>
            </div>
          </section>

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
                {candidate.decision
                  ? reviewDecisionLabels[candidate.decision]
                  : "Keputusan akhir belum tersedia."}{" "}
                Rincian hanya dapat dibaca dan riwayat tetap tersimpan.
              </span>
            </div>
          ) : null}

          <section
            aria-labelledby="official-matches-title"
            className={styles.detailSection}
          >
            <div className={styles.sectionHeading}>
              <div>
                <span className={styles.sectionIndex}>01</span>
                <h3 id="official-matches-title">Rekam resmi terkait</h3>
              </div>
              <p>
                {candidate.matches.length > 0
                  ? `${candidate.matches.length} rekam untuk diperiksa`
                  : "Belum ada pembanding"}
              </p>
            </div>

            {candidate.matches.length > 0 ? (
              <div className={styles.matchList}>
                {candidate.matches.map((match, index) => {
                  const isSelected = selectedMatch?.id === match.id;
                  return (
                    <label
                      className={styles.matchCard}
                      data-selected={isSelected || undefined}
                      key={match.id}
                    >
                      <input
                        checked={isSelected}
                        name="official-match"
                        onChange={() => chooseMatch(match)}
                        type="radio"
                      />
                      <span className={styles.customRadio} />
                      <span className={styles.matchRank}>{index + 1}</span>
                      <span className={styles.matchCopy}>
                        <strong>{match.officialRecord.title}</strong>
                        <small>
                          {match.id} · {match.officialRecord.year} ·{" "}
                          {match.officialRecord.authors}
                        </small>
                        <em>{match.basis}</em>
                        <span className={styles.matchSources}>
                          {match.sources
                            .map((source) => source.label)
                            .join(" + ")}
                        </span>
                      </span>
                      <span
                        className={styles.matchScore}
                        data-tone={match.verdict}
                      >
                        <strong>{match.score}%</strong>
                        <small>{reviewMatchVerdictLabels[match.verdict]}</small>
                      </span>
                    </label>
                  );
                })}
              </div>
            ) : (
              <div className={styles.noMatch}>
                <strong>Belum ada rekam resmi pembanding</strong>
                <p>
                  Kondisi ini tidak otomatis berarti kandidat adalah data baru.
                  Periksa identitas, kelengkapan metadata, dan sumber sebelum
                  menentukan keputusan.
                </p>
              </div>
            )}
          </section>

          {selectedMatch ? (
            <section
              aria-labelledby="comparison-title"
              className={styles.detailSection}
            >
              <div className={styles.sectionHeading}>
                <div>
                  <span className={styles.sectionIndex}>02</span>
                  <h3 id="comparison-title">Bandingkan setiap bidang</h3>
                </div>
                <p>Kandidat masuk vs {selectedMatch.id}</p>
              </div>

              {comparisonSummary ? (
                <div
                  aria-live="polite"
                  className={styles.comparisonSummary}
                  data-clear={comparisonSummary.changed === 0 || undefined}
                >
                  <strong>
                    {comparisonSummary.changed === 0 &&
                    comparisonSummary.missing === 0
                      ? "Tidak ada perbedaan yang terlihat"
                      : `${comparisonSummary.changed} bidang berbeda atau serupa`}
                  </strong>
                  <span>
                    {comparisonSummary.same} sama · {comparisonSummary.missing}{" "}
                    tidak tersedia
                  </span>
                </div>
              ) : null}

              <div className={styles.comparisonList}>
                {selectedMatch.comparisons.map((comparison) => (
                  <ComparisonField
                    candidate={candidate}
                    fieldKey={comparison.key}
                    key={comparison.key}
                    match={selectedMatch}
                  />
                ))}
              </div>

              <details className={styles.scoreDetails}>
                <summary>Bagaimana sinyal kecocokan dibaca?</summary>
                <div>
                  <p>
                    Persentase merangkum sinyal pencocokan metadata yang
                    tersedia. Nilai ini membantu mengurutkan rekam terkait dan
                    tidak menetapkan bahwa dua rekam adalah duplikat.
                  </p>
                  <ul>
                    <li>
                      <strong>DOI sama</strong>
                      <span>
                        Periksa karya dan sumber; SRS mencegah dua publikasi
                        resmi memakai DOI yang sama.
                      </span>
                    </li>
                    <li>
                      <strong>Metadata serupa</strong>
                      <span>
                        Bandingkan judul, penulis, tahun, wadah terbit, dan
                        bukti sumber.
                      </span>
                    </li>
                    <li>
                      <strong>Tidak ada pembanding</strong>
                      <span>
                        Bukan bukti bahwa kandidat pasti merupakan data baru.
                      </span>
                    </li>
                  </ul>
                </div>
              </details>
            </section>
          ) : null}

          <section
            aria-labelledby="provenance-title"
            className={styles.detailSection}
          >
            <div className={styles.sectionHeading}>
              <div>
                <span className={styles.sectionIndex}>03</span>
                <h3 id="provenance-title">Sumber dan jejak data</h3>
              </div>
              <p>Waktu ambil, parser, dan kunci sumber dapat diaudit</p>
            </div>

            <div className={styles.provenanceColumns}>
              <div>
                <h4>Kandidat masuk</h4>
                {candidate.provenance.map((source) => (
                  <ProvenanceCard key={source.id} source={source} />
                ))}
              </div>

              <div>
                <h4>Rekam resmi terpilih</h4>
                {selectedMatch ? (
                  selectedMatch.sources.map((source) => (
                    <ProvenanceCard
                      key={source.id}
                      officialUpdatedAt={selectedMatch.updatedAt}
                      source={source}
                    />
                  ))
                ) : (
                  <div className={styles.provenanceEmpty}>
                    Belum ada rekam resmi terpilih.
                  </div>
                )}
              </div>
            </div>

            {candidate.evidence.length > 0 ? (
              <div className={styles.evidenceList}>
                <h4>Bukti dari dokumen</h4>
                {candidate.evidence.map((evidence) => (
                  <blockquote key={evidence.id}>
                    <p>“{evidence.quote}”</p>
                    <cite>
                      {evidence.documentName}, halaman {evidence.page}
                    </cite>
                  </blockquote>
                ))}
              </div>
            ) : null}
          </section>

          <section
            aria-labelledby="decision-title"
            className={styles.decisionSection}
          >
            <div className={styles.sectionHeading}>
              <div>
                <span className={styles.sectionIndex}>04</span>
                <h3 id="decision-title">Tetapkan keputusan</h3>
              </div>
              <p>Alasan disimpan pada riwayat tinjauan</p>
            </div>

            {!isFinal ? (
              <>
                <div className={styles.decisionChoices}>
                  {selectedMatch ? (
                    <label
                      data-selected={decisionMode === "merge" || undefined}
                    >
                      <input
                        checked={decisionMode === "merge"}
                        name="decision-mode"
                        onChange={() => setDecisionMode("merge")}
                        type="radio"
                      />
                      <span>
                        <strong>Hubungkan ke {selectedMatch.id}</strong>
                        <small>
                          Pilih hanya jika bukti menunjukkan karya yang sama.
                          Sumber kandidat dan riwayat asal tetap dipertahankan.
                        </small>
                      </span>
                    </label>
                  ) : null}
                  <label
                    data-disabled={!canCreateNew || undefined}
                    data-selected={decisionMode === "create" || undefined}
                  >
                    <input
                      checked={decisionMode === "create"}
                      disabled={!canCreateNew}
                      name="decision-mode"
                      onChange={() => setDecisionMode("create")}
                      type="radio"
                    />
                    <span>
                      <strong>Setujui sebagai data baru</strong>
                      <small>
                        {canCreateNew
                          ? "Buat rekam resmi baru dari kandidat ini."
                          : "Tidak tersedia karena DOI identik dengan rekam resmi terpilih."}
                      </small>
                    </span>
                  </label>
                </div>

                {candidate.previousIssue ? (
                  <div className={styles.previousIssue}>
                    <strong>Isu sebelumnya</strong>
                    <p>{candidate.previousIssue}</p>
                  </div>
                ) : null}

                <p className={styles.policyNote}>
                  Persetujuan hanya dapat dilakukan reviewer berwenang.
                  Perubahan yang ditetapkan sensitif tidak dapat disetujui oleh
                  pembuatnya sendiri.
                </p>

                <label className={styles.noteField}>
                  <span>
                    Alasan keputusan <em>wajib</em>
                  </span>
                  <textarea
                    maxLength={600}
                    onChange={(event) =>
                      onReviewerNoteChange(
                        candidate.id,
                        event.currentTarget.value,
                      )
                    }
                    placeholder="Catat bukti yang diperiksa, perbedaan penting, dan alasan keputusan."
                    rows={4}
                    value={candidate.reviewerNote}
                  />
                  <small>{candidate.reviewerNote.length} / 600 karakter</small>
                </label>

                {!hasReviewerNote ? (
                  <p className={styles.noteRequired}>
                    Tambahkan alasan sebelum menyimpan keputusan.
                  </p>
                ) : null}

                {showRejectConfirmation ? (
                  <div aria-live="polite" className={styles.rejectConfirmation}>
                    <div>
                      <strong>Tolak kandidat ini?</strong>
                      <span>Kandidat tetap tersimpan pada riwayat audit.</span>
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
                        Ya, tolak
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
                      Minta perbaikan
                    </button>
                    <button
                      className={styles.approveButton}
                      disabled={
                        !hasReviewerNote ||
                        (decisionMode === "merge" && !selectedMatch)
                      }
                      onClick={approveCandidate}
                      type="button"
                    >
                      {decisionMode === "merge"
                        ? "Hubungkan kandidat"
                        : "Setujui data baru"}
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className={styles.readOnlyDecision}>
                <strong>
                  {candidate.decision
                    ? reviewDecisionLabels[candidate.decision]
                    : reviewStatusLabels[candidate.status]}
                </strong>
                <p>{candidate.reviewerNote || "Tidak ada catatan tambahan."}</p>
              </div>
            )}
          </section>

          <details className={styles.timelineSection}>
            <summary>Riwayat tinjauan ({candidate.timeline.length})</summary>
            <ol className={styles.timeline}>
              {candidate.timeline.map((entry) => (
                <li data-tone={entry.tone} key={entry.id}>
                  <span aria-hidden="true" className={styles.timelineMarker} />
                  <div>
                    <strong>{entry.label}</strong>
                    <p>{entry.detail}</p>
                    <small>
                      {entry.actor} · Kandidat {entry.candidateVersion}
                    </small>
                    <time>{entry.timeLabel}</time>
                  </div>
                </li>
              ))}
            </ol>
          </details>
        </div>
      </aside>
    </div>
  );
}
