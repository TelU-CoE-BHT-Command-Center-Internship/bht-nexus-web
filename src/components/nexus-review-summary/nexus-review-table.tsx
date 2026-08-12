"use client";

import Image from "next/image";
import { useState } from "react";
import { nexusReviewOwnerPortraits } from "@/components/nexus-review-summary/nexus-review-owner-portraits";
import { NexusReviewSelect } from "@/components/nexus-review-summary/nexus-review-select";
import styles from "@/components/nexus-review-summary/nexus-review-table.module.css";
import {
  type NexusReviewTableContent,
  type ReviewCandidateRow,
  reviewDecisionLabels,
  reviewMatchVerdictLabels,
  reviewStatusLabels,
} from "@/components/nexus-review-summary/nexus-review-table-content";

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

type PaginationItem = number | "ellipsis-end" | "ellipsis-start";

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

function getPaginationItems(
  currentPage: number,
  totalPages: number,
): PaginationItem[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  if (currentPage <= 3) {
    return [1, 2, 3, 4, "ellipsis-end", totalPages];
  }

  if (currentPage >= totalPages - 2) {
    return [
      1,
      "ellipsis-start",
      totalPages - 3,
      totalPages - 2,
      totalPages - 1,
      totalPages,
    ];
  }

  return [
    1,
    "ellipsis-start",
    currentPage - 1,
    currentPage,
    currentPage + 1,
    "ellipsis-end",
    totalPages,
  ];
}

function MatchSignal({ candidate }: { candidate: ReviewCandidateRow }) {
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
  const [isPageSizeOpen, setIsPageSizeOpen] = useState(false);
  const pageSize = Number(pageSizeValue);
  const totalPages = Math.max(1, Math.ceil(candidates.length / pageSize));
  const safeCurrentPage = Math.min(Math.max(currentPage, 1), totalPages);
  const startIndex = (safeCurrentPage - 1) * pageSize;
  const visibleRows = candidates.slice(startIndex, startIndex + pageSize);
  const endIndex = Math.min(startIndex + visibleRows.length, candidates.length);
  const paginationItems = getPaginationItems(safeCurrentPage, totalPages);

  const changePage = (page: number) => {
    onPageChange(Math.min(Math.max(page, 1), totalPages));
  };

  return (
    <section aria-labelledby="review-queue-title" className={styles.section}>
      <header className={styles.sectionHeader}>
        <div>
          <h3 id="review-queue-title">Antrean tinjauan</h3>
          <p>
            {activeSourceLabel}: {candidates.length} sesuai filter dari{" "}
            {sourceCandidateCount} kandidat sumber
          </p>
        </div>
        <p className={styles.guidance}>
          Sinyal membantu menemukan rekam terkait; reviewer tetap memeriksa
          metadata, sumber, dan bukti sebelum mengambil keputusan.
        </p>
      </header>

      <div className={styles.tableShell}>
        <div className={styles.desktopTable}>
          <table>
            <caption className={styles.visuallyHidden}>
              {content.caption}
            </caption>
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
                ? visibleRows.map((row) => (
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
                          aria-label={`${content.openCandidateLabel}: ${row.record.title}`}
                          className={styles.actionButton}
                          onClick={() => onOpenCandidate(row.id)}
                          type="button"
                        >
                          <ReviewIcon />
                          <span>Tinjau</span>
                        </button>
                      </td>
                    </tr>
                  ))
                : null}
            </tbody>
          </table>
        </div>

        {!isLoading ? (
          <div className={styles.mobileList}>
            {visibleRows.map((row) => (
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
                  className={styles.mobileReviewButton}
                  onClick={() => onOpenCandidate(row.id)}
                  type="button"
                >
                  Tinjau kandidat <ArrowIcon direction="right" />
                </button>
              </article>
            ))}
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

        <footer className={styles.tableFooter}>
          <p className={styles.range}>
            {content.rangePrefix}{" "}
            {visibleRows.length === 0 ? 0 : startIndex + 1}–{endIndex} dari{" "}
            {candidates.length} {content.totalUnit}
          </p>

          <nav
            aria-label="Navigasi halaman kandidat"
            className={styles.pagination}
          >
            <button
              aria-label={content.previousPageLabel}
              className={styles.paginationArrow}
              disabled={safeCurrentPage === 1 || candidates.length === 0}
              onClick={() => changePage(safeCurrentPage - 1)}
              type="button"
            >
              <ArrowIcon direction="left" />
            </button>

            <div className={styles.pageNumbers}>
              {paginationItems.map((item) =>
                typeof item !== "number" ? (
                  <span
                    aria-hidden="true"
                    className={styles.ellipsis}
                    key={item}
                  >
                    •••
                  </span>
                ) : (
                  <button
                    aria-current={item === safeCurrentPage ? "page" : undefined}
                    aria-label={`${content.pageLabel} ${item}`}
                    className={styles.pageButton}
                    disabled={candidates.length === 0}
                    key={item}
                    onClick={() => changePage(item)}
                    type="button"
                  >
                    {item}
                  </button>
                ),
              )}
            </div>

            <button
              aria-label={content.nextPageLabel}
              className={styles.paginationArrow}
              disabled={
                safeCurrentPage === totalPages || candidates.length === 0
              }
              onClick={() => changePage(safeCurrentPage + 1)}
              type="button"
            >
              <ArrowIcon direction="right" />
            </button>
          </nav>

          <div className={styles.pageSize}>
            <NexusReviewSelect
              filter={content.pageSizeFilter}
              isOpen={isPageSizeOpen}
              onOpenChange={setIsPageSizeOpen}
              onValueChange={onPageSizeChange}
              placement="top"
              value={pageSizeValue}
            />
          </div>
        </footer>
      </div>
    </section>
  );
}
