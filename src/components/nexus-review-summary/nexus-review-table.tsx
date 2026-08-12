"use client";

import Image from "next/image";
import {
  type Dispatch,
  type MouseEvent,
  type SetStateAction,
  useEffect,
  useRef,
  useState,
} from "react";
import { nexusReviewOwnerPortraits } from "@/components/nexus-review-summary/nexus-review-owner-portraits";
import { NexusReviewSelect } from "@/components/nexus-review-summary/nexus-review-select";
import styles from "@/components/nexus-review-summary/nexus-review-table.module.css";
import {
  type NexusReviewTableContent,
  type ReviewCandidateRow,
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
  onSelectedIdsChange: Dispatch<SetStateAction<ReadonlySet<string>>>;
  pageSizeValue: string;
  selectedIds: ReadonlySet<string>;
  sourceCandidateCount: number;
  totalCandidateCount: number;
};

type ReviewSelectionCheckboxProps = {
  checked: boolean;
  indeterminate?: boolean;
  label: string;
  onChange: (checked: boolean) => void;
};

type PaginationItem = number | "ellipsis-end" | "ellipsis-start";

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

function MoreIcon() {
  return (
    <svg aria-hidden="true" fill="currentColor" viewBox="0 0 20 20">
      <circle cx="10" cy="4" r="1.35" />
      <circle cx="10" cy="10" r="1.35" />
      <circle cx="10" cy="16" r="1.35" />
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

function ReviewSelectionCheckbox({
  checked,
  indeterminate = false,
  label,
  onChange,
}: ReviewSelectionCheckboxProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.indeterminate = indeterminate;
    }
  }, [indeterminate]);

  return (
    <label className={styles.checkbox}>
      <input
        aria-label={label}
        checked={checked}
        onChange={(event) => onChange(event.currentTarget.checked)}
        ref={inputRef}
        type="checkbox"
      />
      <span aria-hidden="true" />
    </label>
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

const loadingRowIds = [
  "loading-row-1",
  "loading-row-2",
  "loading-row-3",
  "loading-row-4",
  "loading-row-5",
  "loading-row-6",
] as const;

function LoadingRows() {
  return loadingRowIds.map((rowId) => (
    <tr className={styles.loadingRow} key={rowId}>
      <td>
        <span className={styles.loadingCheckbox} />
      </td>
      <td>
        <span className={styles.loadingLine} data-width="long" />
        <span className={styles.loadingLine} data-width="medium" />
      </td>
      <td>
        <span className={styles.loadingLine} data-width="short" />
      </td>
      <td>
        <span className={styles.loadingPill} />
      </td>
      <td>
        <span className={styles.loadingLine} data-width="medium" />
      </td>
      <td>
        <span className={styles.loadingLine} data-width="short" />
      </td>
      <td>
        <span className={styles.loadingPill} />
      </td>
      <td>
        <span className={styles.loadingDot} />
      </td>
    </tr>
  ));
}

function EmptyTableState({
  activeSourceLabel,
  hasActiveFilters,
  onResetFilters,
  sourceCandidateCount,
  totalCandidateCount,
}: Pick<
  NexusReviewTableProps,
  | "activeSourceLabel"
  | "hasActiveFilters"
  | "onResetFilters"
  | "sourceCandidateCount"
  | "totalCandidateCount"
>) {
  const isDatasetEmpty = totalCandidateCount === 0;
  const isSourceEmpty = !isDatasetEmpty && sourceCandidateCount === 0;
  const title = isDatasetEmpty
    ? "Belum ada kandidat tinjauan"
    : isSourceEmpty
      ? `Belum ada kandidat dari ${activeSourceLabel}`
      : "Tidak ada hasil yang cocok";
  const description = isDatasetEmpty
    ? "Kandidat dari sumber eksternal atau input manual akan muncul di sini."
    : isSourceEmpty
      ? "Sumber ini belum memiliki kandidat yang perlu ditinjau."
      : "Coba ubah kata pencarian atau longgarkan filter yang sedang aktif.";

  return (
    <tr>
      <td className={styles.emptyCell} colSpan={8}>
        <div className={styles.emptyState}>
          <span aria-hidden="true" className={styles.emptyIcon}>
            <EmptyIcon />
          </span>
          <strong>{title}</strong>
          <p>{description}</p>
          {hasActiveFilters ? (
            <button onClick={onResetFilters} type="button">
              Atur ulang filter
            </button>
          ) : null}
        </div>
      </td>
    </tr>
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
  onSelectedIdsChange,
  pageSizeValue,
  selectedIds,
  sourceCandidateCount,
  totalCandidateCount,
}: NexusReviewTableProps) {
  const [isPageSizeOpen, setIsPageSizeOpen] = useState(false);
  const pageSize = Number.parseInt(pageSizeValue, 10);
  const totalPages = Math.max(1, Math.ceil(candidates.length / pageSize));
  const safeCurrentPage = Math.min(Math.max(currentPage, 1), totalPages);
  const startIndex = (safeCurrentPage - 1) * pageSize;
  const visibleRows = candidates.slice(startIndex, startIndex + pageSize);
  const endIndex = Math.min(startIndex + visibleRows.length, candidates.length);
  const visibleIds = visibleRows.map((row) => row.id);
  const selectedVisibleCount = visibleIds.reduce(
    (count, id) => count + (selectedIds.has(id) ? 1 : 0),
    0,
  );
  const allVisibleSelected =
    visibleIds.length > 0 && selectedVisibleCount === visibleIds.length;
  const someVisibleSelected = selectedVisibleCount > 0 && !allVisibleSelected;
  const paginationItems = getPaginationItems(safeCurrentPage, totalPages);
  const selectedCount = candidates.reduce(
    (count, candidate) => count + (selectedIds.has(candidate.id) ? 1 : 0),
    0,
  );

  const toggleVisibleRows = (checked: boolean) => {
    onSelectedIdsChange((currentIds) => {
      const nextIds = new Set(currentIds);

      for (const id of visibleIds) {
        if (checked) {
          nextIds.add(id);
        } else {
          nextIds.delete(id);
        }
      }

      return nextIds;
    });
  };

  const toggleRow = (id: string, checked: boolean) => {
    onSelectedIdsChange((currentIds) => {
      const nextIds = new Set(currentIds);

      if (checked) {
        nextIds.add(id);
      } else {
        nextIds.delete(id);
      }

      return nextIds;
    });
  };

  const changePage = (page: number) => {
    onPageChange(Math.min(Math.max(page, 1), totalPages));
  };

  const openRowFromPointer = (
    event: MouseEvent<HTMLTableRowElement>,
    candidateId: string,
  ) => {
    if (
      event.target instanceof HTMLElement &&
      event.target.closest("button, input, label, a")
    ) {
      return;
    }

    onOpenCandidate(candidateId);
  };

  return (
    <section
      aria-busy={isLoading}
      aria-label={content.caption}
      className={styles.tableSection}
    >
      <p aria-live="polite" className={styles.visuallyHidden}>
        {isLoading ? "Menyiapkan data tinjauan" : "Data tinjauan siap"}
      </p>
      <div className={styles.tableFrame}>
        <div className={styles.tableScroll}>
          <table>
            <caption>{content.caption}</caption>
            <colgroup>
              <col className={styles.selectionColumn} />
              <col className={styles.titleColumn} />
              <col className={styles.typeColumn} />
              <col className={styles.sourceColumn} />
              <col className={styles.ownerColumn} />
              <col className={styles.dateColumn} />
              <col className={styles.statusColumn} />
              <col className={styles.actionColumn} />
            </colgroup>
            <thead>
              <tr>
                <th scope="col">
                  <ReviewSelectionCheckbox
                    checked={allVisibleSelected}
                    indeterminate={someVisibleSelected}
                    label={content.selectAllLabel}
                    onChange={toggleVisibleRows}
                  />
                </th>
                <th scope="col">{content.columns.title}</th>
                <th scope="col">{content.columns.publicationType}</th>
                <th scope="col">{content.columns.source}</th>
                <th scope="col">{content.columns.owner}</th>
                <th scope="col">{content.columns.discoveredAt}</th>
                <th scope="col">{content.columns.status}</th>
                <th className={styles.actionHeading} scope="col">
                  {content.columns.action}
                </th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? <LoadingRows /> : null}
              {!isLoading && visibleRows.length === 0 ? (
                <EmptyTableState
                  activeSourceLabel={activeSourceLabel}
                  hasActiveFilters={hasActiveFilters}
                  onResetFilters={onResetFilters}
                  sourceCandidateCount={sourceCandidateCount}
                  totalCandidateCount={totalCandidateCount}
                />
              ) : null}
              {!isLoading
                ? visibleRows.map((row) => {
                    const isSelected = selectedIds.has(row.id);

                    return (
                      <tr
                        data-selected={isSelected}
                        key={row.id}
                        onClick={(event) => openRowFromPointer(event, row.id)}
                      >
                        <td>
                          <ReviewSelectionCheckbox
                            checked={isSelected}
                            label={`${content.selectRowLabel}: ${row.record.title}`}
                            onChange={(checked) => toggleRow(row.id, checked)}
                          />
                        </td>
                        <td>
                          <button
                            className={styles.titleButton}
                            onClick={() => onOpenCandidate(row.id)}
                            type="button"
                          >
                            <span className={styles.titleCell}>
                              <strong>{row.record.title}</strong>
                              <span>{row.record.authors}</span>
                            </span>
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
                            data-source={row.source.toLocaleLowerCase("id-ID")}
                          >
                            {row.source}
                          </span>
                        </td>
                        <td>
                          <span className={styles.owner}>
                            <Image
                              alt=""
                              height={32}
                              sizes="2rem"
                              src={
                                nexusReviewOwnerPortraits[row.owner.portrait]
                              }
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
                          <span
                            className={styles.statusBadge}
                            data-tone={row.status}
                          >
                            {reviewStatusLabels[row.status]}
                          </span>
                        </td>
                        <td className={styles.actionCell}>
                          <button
                            aria-label={`${content.openCandidateLabel}: ${row.record.title}`}
                            className={styles.actionButton}
                            onClick={() => onOpenCandidate(row.id)}
                            title={content.openCandidateLabel}
                            type="button"
                          >
                            <MoreIcon />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                : null}
            </tbody>
          </table>
        </div>

        <footer className={styles.tableFooter}>
          <div className={styles.rangeGroup}>
            <p className={styles.range}>
              {content.rangePrefix}{" "}
              {visibleRows.length === 0 ? 0 : startIndex + 1}–{endIndex} dari{" "}
              {candidates.length} {content.totalUnit}
            </p>
            {selectedCount > 0 ? (
              <button
                className={styles.clearSelection}
                onClick={() => onSelectedIdsChange(new Set())}
                type="button"
              >
                {selectedCount} dipilih · Bersihkan
              </button>
            ) : null}
          </div>

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
              {paginationItems.map((item) => {
                if (typeof item !== "number") {
                  return (
                    <span
                      aria-hidden="true"
                      className={styles.ellipsis}
                      key={item}
                    >
                      •••
                    </span>
                  );
                }

                return (
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
                );
              })}
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
