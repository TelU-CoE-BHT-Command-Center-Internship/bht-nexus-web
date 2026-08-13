"use client";

import Image from "next/image";
import { nexusReviewOwnerPortraits } from "@/components/nexus-review-summary/nexus-review-owner-portraits";
import styles from "@/components/nexus-review-summary/nexus-review-table.module.css";
import {
  type NexusReviewTableContent,
  type ReviewCandidateRow,
  reviewDecisionLabels,
  reviewMatchVerdictLabels,
  reviewStatusLabels,
} from "@/components/nexus-review-summary/nexus-review-table-content";
import { NexusTablePagination } from "@/components/nexus-workspace-ui/nexus-table-pagination";
import { NexusWorkspaceTableSection } from "@/components/nexus-workspace-ui/nexus-workspace-table";

type NexusReviewTableProps = {
  activeSourceLabel: string;
  candidates: readonly ReviewCandidateRow[];
  content: NexusReviewTableContent;
  currentPage: number;
  hasActiveFilters: boolean;
  isLoading: boolean;
  onOpenCandidate: (candidateId: string) => void;
  onPageChange: (page: number) => void;
  onPageSizeChange: (value: string) => void;
  onResetFilters: () => void;
  pageSizeValue: string;
  sourceCandidateCount: number;
  totalCandidateCount: number;
};

const loadingRowIds = ["row-a", "row-b", "row-c", "row-d", "row-e", "row-f"];
const loadingCellIds = [
  "title",
  "type",
  "source",
  "risk",
  "owner",
  "date",
  "status",
  "action",
];
const mobileLoadingIds = ["mobile-a", "mobile-b", "mobile-c"];

function ArrowIcon({ direction }: { direction: "left" | "right" }) {
  return (
    <svg
      aria-hidden="true"
      data-direction={direction}
      fill="none"
      viewBox="0 0 20 20"
    >
      <path d="M4 10h12M10.5 4.5 16 10l-5.5 5.5" />
    </svg>
  );
}

function ReviewIcon() {
  return (
    <svg aria-hidden="true" fill="none" viewBox="0 0 20 20">
      <path d="M3 4.5h14v11H3zM6 8h8M6 11.5h5" />
      <path d="m13 14.5 2-2 1.5 1.5-2 2H13z" />
    </svg>
  );
}

function EmptyIcon() {
  return (
    <svg aria-hidden="true" fill="none" viewBox="0 0 32 32">
      <path d="M7 5.5h12l6 6v15H7z" />
      <path d="M19 5.5v6h6M11 17h10M11 21h7" />
    </svg>
  );
}

function MatchSignal({ candidate }: { candidate: ReviewCandidateRow }) {
  if (candidate.kind === "metadata-completion") {
    const affectedFieldCount =
      candidate.completionProposal?.affectedFields.length ?? 0;
    const revisionVersion =
      candidate.completionProposal?.latestRevision?.version;

    return (
      <div className={styles.proposalSignal}>
        <strong>Pelengkapan</strong>
        <span>
          {revisionVersion ? `${revisionVersion} · ` : ""}
          {affectedFieldCount} bidang diajukan
        </span>
      </div>
    );
  }

  const assessment = candidate.duplicateAssessment;
  const hasComparison = assessment.highestScore > 0;

  return (
    <div className={styles.duplicateSignal} data-tone={assessment.verdict}>
      <div className={styles.matchSignalMain}>
        <strong>{hasComparison ? `${assessment.highestScore}%` : "—"}</strong>
        <span>{reviewMatchVerdictLabels[assessment.verdict]}</span>
      </div>
      {hasComparison ? (
        <small>{assessment.matchCount} pembanding resmi</small>
      ) : null}
    </div>
  );
}

function ReviewStatus({ candidate }: { candidate: ReviewCandidateRow }) {
  return (
    <span className={styles.statusGroup}>
      <span className={styles.statusBadge} data-tone={candidate.status}>
        {reviewStatusLabels[candidate.status]}
      </span>
      {candidate.status === "completed" && candidate.decision ? (
        <small>{reviewDecisionLabels[candidate.decision]}</small>
      ) : null}
    </span>
  );
}

function getCandidateAction(
  candidate: ReviewCandidateRow,
  openCandidateLabel: string,
) {
  if (candidate.kind === "metadata-completion") {
    if (candidate.status === "needs-fix") {
      return {
        ariaLabel: `Perbaiki usulan pelengkapan: ${candidate.record.title}`,
        desktopLabel: "Perbaiki usulan",
        mobileLabel: "Perbaiki usulan",
      };
    }

    if (candidate.status === "waiting") {
      return {
        ariaLabel: `Tinjau usulan pelengkapan: ${candidate.record.title}`,
        desktopLabel: "Tinjau usulan",
        mobileLabel: "Tinjau usulan",
      };
    }

    return {
      ariaLabel: `Lihat hasil usulan pelengkapan: ${candidate.record.title}`,
      desktopLabel: "Lihat hasil",
      mobileLabel: "Lihat hasil usulan",
    };
  }

  if (candidate.status === "needs-fix") {
    return {
      ariaLabel: `Perbaiki kandidat: ${candidate.record.title}`,
      desktopLabel: "Perbaiki",
      mobileLabel: "Perbaiki kandidat",
    };
  }

  if (candidate.status === "completed") {
    return {
      ariaLabel: `Lihat hasil kandidat: ${candidate.record.title}`,
      desktopLabel: "Lihat hasil",
      mobileLabel: "Lihat hasil",
    };
  }

  return {
    ariaLabel: `${openCandidateLabel}: ${candidate.record.title}`,
    desktopLabel: "Tinjau",
    mobileLabel: "Tinjau kandidat",
  };
}

function LoadingRows() {
  return (
    <>
      {loadingRowIds.map((rowId) => (
        <tr className={styles.loadingRow} key={rowId}>
          {loadingCellIds.map((cellId) => (
            <td key={`${rowId}-${cellId}`}>
              <span />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

export function NexusReviewTable({
  activeSourceLabel,
  candidates,
  content,
  currentPage,
  hasActiveFilters,
  isLoading,
  onOpenCandidate,
  onPageChange,
  onPageSizeChange,
  onResetFilters,
  pageSizeValue,
  sourceCandidateCount,
  totalCandidateCount,
}: NexusReviewTableProps) {
  const pageSize = Number(pageSizeValue);
  const totalPages = Math.max(1, Math.ceil(candidates.length / pageSize));
  const safeCurrentPage = Math.min(Math.max(currentPage, 1), totalPages);
  const startIndex = (safeCurrentPage - 1) * pageSize;
  const visibleRows = candidates.slice(startIndex, startIndex + pageSize);

  const changePage = (page: number) => {
    onPageChange(Math.min(Math.max(page, 1), totalPages));
  };

  return (
    <NexusWorkspaceTableSection
      guidance="Sinyal membantu menemukan rekam terkait; reviewer tetap memeriksa metadata, sumber, dan bukti sebelum mengambil keputusan."
      summary={
        <>
          {activeSourceLabel}: {candidates.length} sesuai filter dari{" "}
          {sourceCandidateCount} data sumber
        </>
      }
      title="Antrean tinjauan"
      titleId="review-queue-title"
    >
      <div className={styles.desktopTable}>
        <table>
          <caption className={styles.visuallyHidden}>{content.caption}</caption>
          <thead>
            <tr>
              <th>{content.columns.title}</th>
              <th>{content.columns.publicationType}</th>
              <th>{content.columns.source}</th>
              <th>{content.columns.duplicateRisk}</th>
              <th>{content.columns.owner}</th>
              <th>{content.columns.discoveredAt}</th>
              <th>{content.columns.status}</th>
              <th className={styles.actionHeading} scope="col">
                {content.columns.action}
              </th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? <LoadingRows /> : null}
            {!isLoading && visibleRows.length > 0
              ? visibleRows.map((row) => {
                  const action = getCandidateAction(
                    row,
                    content.openCandidateLabel,
                  );

                  return (
                    <tr key={row.id}>
                      <td className={styles.titleCell}>
                        <button
                          onClick={() => onOpenCandidate(row.id)}
                          type="button"
                        >
                          <strong>{row.record.title}</strong>
                          <span>{row.record.authors}</span>
                        </button>
                      </td>
                      <td>
                        <span className={styles.publicationType}>
                          {row.publicationType}
                        </span>
                      </td>
                      <td>
                        <span
                          className={styles.sourceBadge}
                          data-source={row.source.toLowerCase()}
                        >
                          {row.source}
                        </span>
                      </td>
                      <td>
                        <MatchSignal candidate={row} />
                      </td>
                      <td>
                        <span className={styles.owner}>
                          <Image
                            alt=""
                            height={32}
                            sizes="2rem"
                            src={nexusReviewOwnerPortraits[row.owner.portrait]}
                            width={32}
                          />
                          <span>{row.owner.name}</span>
                        </span>
                      </td>
                      <td>
                        <time
                          className={styles.date}
                          dateTime={row.discoveredAtIso}
                        >
                          {row.discoveredAt}
                        </time>
                      </td>
                      <td>
                        <ReviewStatus candidate={row} />
                      </td>
                      <td className={styles.actionCell}>
                        <button
                          aria-label={action.ariaLabel}
                          className={styles.actionButton}
                          onClick={() => onOpenCandidate(row.id)}
                          type="button"
                        >
                          <ReviewIcon />
                          <span>{action.desktopLabel}</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              : null}
          </tbody>
        </table>
      </div>

      {!isLoading ? (
        <div className={styles.mobileList}>
          {visibleRows.map((row) => {
            const action = getCandidateAction(row, content.openCandidateLabel);

            return (
              <article className={styles.mobileCard} key={row.id}>
                <div className={styles.mobileCardTop}>
                  <span
                    className={styles.sourceBadge}
                    data-source={row.source.toLowerCase()}
                  >
                    {row.source}
                  </span>
                  <ReviewStatus candidate={row} />
                </div>
                <h4>{row.record.title}</h4>
                <p className={styles.mobileAuthors}>{row.record.authors}</p>
                <MatchSignal candidate={row} />
                <dl className={styles.mobileMeta}>
                  <div>
                    <dt>Jenis</dt>
                    <dd>{row.publicationType}</dd>
                  </div>
                  <div>
                    <dt>Ditemukan</dt>
                    <dd>{row.discoveredAt}</dd>
                  </div>
                  <div>
                    <dt>Pemilik</dt>
                    <dd>{row.owner.name}</dd>
                  </div>
                </dl>
                <button
                  aria-label={action.ariaLabel}
                  className={styles.mobileReviewButton}
                  onClick={() => onOpenCandidate(row.id)}
                  type="button"
                >
                  {action.mobileLabel} <ArrowIcon direction="right" />
                </button>
              </article>
            );
          })}
        </div>
      ) : (
        <output aria-label="Memuat kandidat" className={styles.mobileLoading}>
          {mobileLoadingIds.map((loadingId) => (
            <span key={loadingId} />
          ))}
        </output>
      )}

      {!isLoading && visibleRows.length === 0 ? (
        <div className={styles.emptyState}>
          <EmptyIcon />
          <strong>
            {totalCandidateCount === 0
              ? "Belum ada kandidat untuk ditinjau"
              : "Tidak ada kandidat yang cocok"}
          </strong>
          <p>
            {totalCandidateCount === 0
              ? "Kandidat baru akan muncul setelah proses ingest atau input terkelola menghasilkan data untuk diperiksa."
              : "Ubah kata kunci atau filter untuk melihat kandidat lain."}
          </p>
          {hasActiveFilters ? (
            <button onClick={onResetFilters} type="button">
              Atur ulang filter
            </button>
          ) : null}
        </div>
      ) : null}

      <NexusTablePagination
        currentPage={safeCurrentPage}
        itemCount={candidates.length}
        navigationLabel="Navigasi halaman kandidat"
        nextPageLabel={content.nextPageLabel}
        onPageChange={changePage}
        onPageSizeChange={onPageSizeChange}
        pageLabel={content.pageLabel}
        pageSizeConfig={content.pageSizeFilter}
        pageSizeValue={pageSizeValue}
        previousPageLabel={content.previousPageLabel}
        rangePrefix={content.rangePrefix}
        totalUnit={content.totalUnit}
      />
    </NexusWorkspaceTableSection>
  );
}
