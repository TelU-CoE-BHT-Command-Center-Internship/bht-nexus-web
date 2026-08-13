"use client";

import Image from "next/image";
import { useState } from "react";
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
  reviewRecordFieldLabels,
  reviewRecordFieldOrder,
  reviewStatusLabels,
} from "@/components/nexus-review-summary/nexus-review-table-content";
import { NexusWorkspaceDrawer } from "@/components/nexus-workspace-ui/nexus-workspace-drawer";

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
  const unavailableSourceLabel = {
    document: "Dokumen internal tanpa tautan publik.",
    manual: "Input manual tidak memiliki tautan sumber.",
    official: "Sumber internal tanpa tautan publik.",
    scraper: "Tautan rekam sumber belum tersedia.",
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
          <span>{unavailableSourceLabel}</span>
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

function normalizeDoi(value: string) {
  return value
    .trim()
    .toLocaleLowerCase("en-US")
    .replace(/^doi:\s*/, "")
    .replace(/^https?:\/\/(?:dx\.)?doi\.org\//, "");
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
  const [selectedMatchId, setSelectedMatchId] = useState(
    candidate.matches[0]?.id ?? "",
  );
  const [decisionMode, setDecisionMode] = useState<ReviewDecisionMode | null>(
    null,
  );
  const [requestedCorrectionFields, setRequestedCorrectionFields] = useState<
    ReviewRecordFieldKey[]
  >([...(candidate.requestedCorrectionFields ?? [])]);
  const [showRejectConfirmation, setShowRejectConfirmation] = useState(false);
  const selectedMatch =
    candidate.matches.find((match) => match.id === selectedMatchId) ??
    candidate.matches[0];
  const sectionIndexes = selectedMatch
    ? {
        comparison: "03",
        decision: "05",
        matches: "02",
        metadata: "01",
        provenance: "04",
      }
    : {
        comparison: "",
        decision: "04",
        matches: "02",
        metadata: "01",
        provenance: "03",
      };
  const availableCandidateFieldCount = reviewRecordFieldOrder.filter(
    (key) => candidate.record[key].trim().length > 0,
  ).length;
  const isFinal = candidate.status === "completed";
  const hasReviewerNote = candidate.reviewerNote.trim().length > 0;
  const candidateDoi = normalizeDoi(candidate.record.doi);
  const exactDoiMatch =
    candidateDoi.length > 0
      ? candidate.matches.find(
          (match) => normalizeDoi(match.officialRecord.doi) === candidateDoi,
        )
      : undefined;
  const hasBlockingIdentifier = Boolean(exactDoiMatch);
  const canCreateNew = !hasBlockingIdentifier;
  const isSelectedLinkTargetValid = Boolean(
    selectedMatch && (!exactDoiMatch || selectedMatch.id === exactDoiMatch.id),
  );
  const selectedEnrichmentFields = selectedMatch
    ? selectedMatch.comparisons
        .filter(
          (comparison) =>
            comparison.status !== "same" &&
            candidate.record[comparison.key].trim().length > 0,
        )
        .map((comparison) => comparison.key)
    : [];
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

  const chooseMatch = (match: ReviewOfficialMatch) => {
    setSelectedMatchId(match.id);
    setDecisionMode(null);
  };

  const toggleCorrectionField = (fieldKey: ReviewRecordFieldKey) => {
    setRequestedCorrectionFields((currentFields) =>
      currentFields.includes(fieldKey)
        ? currentFields.filter((key) => key !== fieldKey)
        : [...currentFields, fieldKey],
    );
  };

  const finishDecision = (
    status: ReviewCandidateStatus,
    context: ReviewStatusChangeContext & { decision?: ReviewDecision },
  ) => {
    onStatusChange(candidate.id, status, context);
    onClose();
  };

  const requestRevision = () => {
    if (!hasReviewerNote || requestedCorrectionFields.length === 0) return;
    finishDecision("needs-fix", {
      detail: candidate.reviewerNote.trim(),
      label: "Perbaikan metadata diminta",
      requestedCorrectionFields,
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
    if (
      !hasReviewerNote ||
      !decisionMode ||
      (decisionMode === "merge" && !isSelectedLinkTargetValid)
    )
      return;

    if (decisionMode === "merge" && selectedMatch) {
      finishDecision("completed", {
        decision: "merged",
        detail: `Kandidat dihubungkan ke ${selectedMatch.id}. ${candidate.reviewerNote.trim()}`,
        label: "Dihubungkan ke rekam resmi",
        linkedTargetId: selectedMatch.id,
        proposedEnrichmentFields: selectedEnrichmentFields,
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
    <NexusWorkspaceDrawer
      closeLabel="Tutup rincian kandidat"
      description="Periksa kandidat, rekam terkait, dan bukti sebelum menetapkan keputusan."
      eyebrow={candidate.id}
      onClose={onClose}
      steps={[
        { active: true, complete: true, label: "Kandidat", number: 1 },
        { active: true, label: "Kecocokan", number: 2 },
        { active: isFinal, label: "Keputusan", number: 3 },
      ]}
      title="Rincian kandidat"
    >
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
            <span className={styles.statusBadge} data-tone={candidate.status}>
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
          <MetaItem
            label="DOI"
            value={candidate.record.doi || "Belum tersedia"}
          />
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
                <span className={styles.relatedMemberCopy}>
                  <b>{member.name}</b>
                  <small>{member.role}</small>
                </span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {candidate.latestRevision ? (
        <section
          aria-labelledby="latest-revision-title"
          className={styles.revisionSummary}
        >
          <header className={styles.revisionHeader}>
            <div className={styles.revisionTitleGroup}>
              <span className={styles.revisionCheck} aria-hidden="true">
                ✓
              </span>
              <div className={styles.revisionTitle}>
                <span className={styles.revisionEyebrow}>
                  {candidate.status === "waiting"
                    ? "Dikirim ulang untuk ditinjau"
                    : "Perbaikan yang telah diperiksa"}
                </span>
                <h3 id="latest-revision-title">
                  {candidate.latestRevision.version} memuat{" "}
                  {candidate.latestRevision.changes.length} perubahan
                </h3>
              </div>
            </div>
            <small className={styles.revisionMeta}>
              {candidate.latestRevision.submittedBy} ·{" "}
              {candidate.latestRevision.submittedAt}
            </small>
          </header>
          <p className={styles.revisionNote}>
            <strong className={styles.revisionNoteLabel}>
              Dasar perubahan:
            </strong>{" "}
            {candidate.latestRevision.note}
          </p>
          <ul className={styles.revisionList}>
            {candidate.latestRevision.changes.map((change) => (
              <li className={styles.revisionItem} key={change.key}>
                <strong className={styles.revisionFieldLabel}>
                  {change.label}
                </strong>
                <div className={styles.revisionValues}>
                  <span className={styles.revisionBefore}>
                    Sebelum
                    <b className={styles.revisionValue}>
                      {change.previousValue || "Belum tersedia"}
                    </b>
                  </span>
                  <span className={styles.revisionAfter}>
                    Sesudah
                    <b className={styles.revisionValue}>
                      {change.currentValue || "Dikosongkan"}
                    </b>
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section
        aria-labelledby="candidate-metadata-title"
        className={styles.detailSection}
      >
        <div className={styles.sectionHeading}>
          <div>
            <span className={styles.sectionIndex}>
              {sectionIndexes.metadata}
            </span>
            <h3 id="candidate-metadata-title">Metadata kandidat</h3>
          </div>
          <p>
            {availableCandidateFieldCount} dari {reviewRecordFieldOrder.length}{" "}
            bidang tersedia
          </p>
        </div>

        <p className={styles.candidateMetadataExplanation}>
          Seluruh metadata kandidat tetap ditampilkan meskipun belum ada rekam
          resmi pembanding. “Tidak ada pembanding” hanya berarti belum ada data
          resmi untuk disandingkan, bukan berarti metadata kandidat boleh
          dilewati.
        </p>

        <dl className={styles.candidateMetadataGrid}>
          {reviewRecordFieldOrder.map((key) => {
            const value = candidate.record[key].trim();
            const isWide = [
              "abstract",
              "authors",
              "keywords",
              "title",
            ].includes(key);

            return (
              <div
                data-available={value ? "true" : "false"}
                data-wide={isWide || undefined}
                key={key}
              >
                <dt className={styles.candidateMetadataLabel}>
                  <span>{reviewRecordFieldLabels[key]}</span>
                  <span>{value ? "Tersedia" : "Belum tersedia"}</span>
                </dt>
                <dd>{value || "Belum tersedia dari kandidat"}</dd>
              </div>
            );
          })}
        </dl>
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
            {reviewMatchVerdictLabels[candidate.duplicateAssessment.verdict]}
          </span>
          <h3>{candidate.duplicateAssessment.explanation}</h3>
          <p>{candidate.duplicateAssessment.basis}</p>
        </div>
      </section>

      {isFinal ? (
        <>
          <div
            aria-live="polite"
            className={styles.finalState}
            data-tone={candidate.status}
          >
            <strong>Status: {reviewStatusLabels[candidate.status]}</strong>
            <span>
              Hasil:{" "}
              {candidate.decision
                ? reviewDecisionLabels[candidate.decision]
                : "Keputusan akhir belum tersedia."}{" "}
              Rincian hanya dapat dibaca dan riwayat tetap tersimpan.
            </span>
          </div>
          {candidate.linkOutcome ? (
            <div className={styles.linkOutcomeFinal}>
              <strong>
                Rekam resmi {candidate.linkOutcome.targetId} tetap menjadi acuan
              </strong>
              <p>
                Metadata resminya tidak ditimpa. Sumber kandidat sudah
                dihubungkan dan{" "}
                {candidate.linkOutcome.proposedEnrichmentFields.length} bidang
                berbeda disimpan sebagai usulan pelengkapan terpisah.
              </p>
            </div>
          ) : null}
        </>
      ) : null}

      <section
        aria-labelledby="official-matches-title"
        className={styles.detailSection}
      >
        <div className={styles.sectionHeading}>
          <div>
            <span className={styles.sectionIndex}>
              {sectionIndexes.matches}
            </span>
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
              const isExactDoiTarget = exactDoiMatch?.id === match.id;
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
                      {match.sources.map((source) => source.label).join(" + ")}
                      {isExactDoiTarget ? (
                        <b className={styles.requiredTargetBadge}>
                          Target DOI identik
                        </b>
                      ) : null}
                    </span>
                  </span>
                  <span className={styles.matchScore} data-tone={match.verdict}>
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
              <span className={styles.sectionIndex}>
                {sectionIndexes.comparison}
              </span>
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
                Persentase merangkum sinyal pencocokan metadata yang tersedia.
                Nilai ini membantu mengurutkan rekam terkait dan tidak
                menetapkan bahwa dua rekam adalah duplikat.
              </p>
              <ul>
                <li>
                  <strong>DOI sama</strong>
                  <span>
                    Periksa karya dan sumber; SRS mencegah dua publikasi resmi
                    memakai DOI yang sama.
                  </span>
                </li>
                <li>
                  <strong>Metadata serupa</strong>
                  <span>
                    Bandingkan judul, penulis, tahun, wadah terbit, dan bukti
                    sumber.
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
            <span className={styles.sectionIndex}>
              {sectionIndexes.provenance}
            </span>
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
            <span className={styles.sectionIndex}>
              {sectionIndexes.decision}
            </span>
            <h3 id="decision-title">Tetapkan keputusan</h3>
          </div>
          <p>Alasan disimpan pada riwayat tinjauan</p>
        </div>

        {!isFinal ? (
          <>
            {exactDoiMatch && selectedMatch?.id !== exactDoiMatch.id ? (
              <div className={styles.identifierTargetGuard} role="alert">
                <div>
                  <strong>Target hubungan harus {exactDoiMatch.id}</strong>
                  <p>
                    DOI kandidat identik dengan rekam tersebut. Pembanding yang
                    sedang dibuka tetap dapat diperiksa, tetapi tidak dapat
                    dipilih sebagai target hubungan.
                  </p>
                </div>
                <button
                  onClick={() => chooseMatch(exactDoiMatch)}
                  type="button"
                >
                  Gunakan target DOI sama
                </button>
              </div>
            ) : null}

            <div className={styles.decisionChoices}>
              {selectedMatch ? (
                <label
                  data-disabled={!isSelectedLinkTargetValid || undefined}
                  data-selected={decisionMode === "merge" || undefined}
                >
                  <input
                    checked={decisionMode === "merge"}
                    disabled={!isSelectedLinkTargetValid}
                    name="decision-mode"
                    onChange={() => setDecisionMode("merge")}
                    type="radio"
                  />
                  <span>
                    <strong>Hubungkan ke {selectedMatch.id}</strong>
                    <small>
                      {isSelectedLinkTargetValid
                        ? "Pilih hanya jika bukti menunjukkan karya yang sama. Metadata resmi tidak ditimpa."
                        : `Tidak tersedia karena DOI identik mengarah ke ${exactDoiMatch?.id}.`}
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
                      : "Tidak tersedia karena DOI identik ditemukan pada salah satu rekam resmi terkait."}
                  </small>
                </span>
              </label>
            </div>

            {decisionMode === "merge" && selectedMatch ? (
              <section
                aria-labelledby="link-consequence-title"
                className={styles.linkConsequence}
              >
                <header>
                  <div>
                    <span>Hasil jika dihubungkan</span>
                    <h4 id="link-consequence-title">
                      {selectedMatch.id} tetap menjadi rekam resmi
                    </h4>
                  </div>
                  <b>Tidak ada penimpaan otomatis</b>
                </header>
                <ul className={styles.linkConsequencePrinciples}>
                  <li>
                    Sumber kandidat dan jejak asal ditambahkan ke rekam resmi.
                  </li>
                  <li>
                    Nilai resmi yang ada tetap dipertahankan pada keputusan ini.
                  </li>
                  <li>
                    Nilai kandidat yang berbeda disimpan sebagai usulan
                    pelengkapan terpisah untuk tinjauan berikutnya.
                  </li>
                </ul>

                {selectedEnrichmentFields.length > 0 ? (
                  <div className={styles.linkFieldResults}>
                    {selectedEnrichmentFields.map((fieldKey) => (
                      <article key={fieldKey}>
                        <strong>{reviewRecordFieldLabels[fieldKey]}</strong>
                        <p>
                          <span>Resmi tetap</span>
                          {getVisibleValue(
                            selectedMatch.officialRecord[fieldKey],
                            "Belum tersedia",
                          )}
                        </p>
                        <p>
                          <span>Usulan disimpan</span>
                          {candidate.record[fieldKey]}
                        </p>
                      </article>
                    ))}
                  </div>
                ) : (
                  <p className={styles.linkNoDifferences}>
                    Tidak ada nilai kandidat berbeda yang perlu dijadikan usulan
                    pelengkapan.
                  </p>
                )}
              </section>
            ) : null}

            {candidate.previousIssue ? (
              <div className={styles.previousIssue}>
                <strong>Isu sebelumnya</strong>
                <p>{candidate.previousIssue}</p>
              </div>
            ) : null}

            <p className={styles.policyNote}>
              Persetujuan hanya dapat dilakukan reviewer berwenang. Perubahan
              yang ditetapkan sensitif tidak dapat disetujui oleh pembuatnya
              sendiri.
            </p>

            <label className={styles.noteField}>
              <span>
                Alasan keputusan <em>wajib</em>
              </span>
              <textarea
                maxLength={600}
                onChange={(event) =>
                  onReviewerNoteChange(candidate.id, event.currentTarget.value)
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

            <fieldset className={styles.correctionFieldPicker}>
              <legend>Bidang jika meminta perbaikan</legend>
              <p>
                Pilih hanya bidang yang perlu dikoreksi. Bidang lain akan tetap
                dapat dibaca, tetapi tidak dapat diubah oleh pengaju.
              </p>
              <div>
                {reviewRecordFieldOrder.map((fieldKey) => (
                  <label key={fieldKey}>
                    <input
                      checked={requestedCorrectionFields.includes(fieldKey)}
                      onChange={() => toggleCorrectionField(fieldKey)}
                      type="checkbox"
                    />
                    <span>{reviewRecordFieldLabels[fieldKey]}</span>
                  </label>
                ))}
              </div>
              {requestedCorrectionFields.length === 0 ? (
                <small>
                  Pilih sedikitnya satu bidang untuk mengaktifkan “Minta
                  perbaikan”.
                </small>
              ) : (
                <small>
                  {requestedCorrectionFields.length} bidang akan ditandai pada
                  formulir perbaikan.
                </small>
              )}
            </fieldset>

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
                  disabled={
                    !hasReviewerNote || requestedCorrectionFields.length === 0
                  }
                  onClick={requestRevision}
                  type="button"
                >
                  Minta perbaikan
                </button>
                <button
                  className={styles.approveButton}
                  disabled={
                    !hasReviewerNote ||
                    !decisionMode ||
                    (decisionMode === "merge" && !isSelectedLinkTargetValid)
                  }
                  onClick={approveCandidate}
                  type="button"
                >
                  {decisionMode === "merge"
                    ? "Hubungkan ke rekam resmi"
                    : decisionMode === "create"
                      ? "Setujui data baru"
                      : "Pilih keputusan"}
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
    </NexusWorkspaceDrawer>
  );
}
