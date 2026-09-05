"use client";

import { useState } from "react";
import styles from "@/components/nexus-workspace-ui/nexus-table-pagination.module.css";
import {
  type NexusSelectConfig,
  NexusWorkspaceSelect,
} from "@/components/nexus-workspace-ui/nexus-workspace-select";

type PaginationItem = number | "ellipsis-end" | "ellipsis-start";

type NexusTablePaginationProps = {
  currentPage: number;
  itemCount: number;
  navigationLabel: string;
  nextPageLabel: string;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (value: string) => void;
  pageLabel: string;
  pageSizeConfig?: NexusSelectConfig;
  pageSizeValue: string;
  previousPageLabel: string;
  rangePrefix: string;
  totalUnit: string;
};

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

export function NexusTablePagination({
  currentPage,
  itemCount,
  navigationLabel,
  nextPageLabel,
  onPageChange,
  onPageSizeChange,
  pageLabel,
  pageSizeConfig,
  pageSizeValue,
  previousPageLabel,
  rangePrefix,
  totalUnit,
}: NexusTablePaginationProps) {
  const [isPageSizeOpen, setIsPageSizeOpen] = useState(false);
  const pageSize = Number(pageSizeValue);
  const totalPages = Math.max(1, Math.ceil(itemCount / pageSize));
  const safeCurrentPage = Math.min(Math.max(currentPage, 1), totalPages);
  const startIndex = (safeCurrentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, itemCount);
  const paginationItems = getPaginationItems(safeCurrentPage, totalPages);
  const hasPageSizeControl = Boolean(pageSizeConfig && onPageSizeChange);

  const changePage = (page: number) => {
    onPageChange(Math.min(Math.max(page, 1), totalPages));
  };

  return (
    <footer className={styles.footer} data-has-page-size={hasPageSizeControl}>
      <p className={styles.range}>
        {rangePrefix} {itemCount === 0 ? 0 : startIndex + 1}–{endIndex} dari{" "}
        {itemCount} {totalUnit}
      </p>

      <nav aria-label={navigationLabel} className={styles.pagination}>
        <button
          aria-label={previousPageLabel}
          className={styles.arrow}
          disabled={safeCurrentPage === 1 || itemCount === 0}
          onClick={() => changePage(safeCurrentPage - 1)}
          suppressHydrationWarning
          type="button"
        >
          <ArrowIcon direction="left" />
        </button>
        <div className={styles.pageNumbers}>
          {paginationItems.map((item) =>
            typeof item !== "number" ? (
              <span aria-hidden="true" className={styles.ellipsis} key={item}>
                •••
              </span>
            ) : (
              <button
                aria-current={item === safeCurrentPage ? "page" : undefined}
                aria-label={`${pageLabel} ${item}`}
                className={styles.pageButton}
                disabled={itemCount === 0}
                key={item}
                onClick={() => changePage(item)}
                suppressHydrationWarning
                type="button"
              >
                {item}
              </button>
            ),
          )}
        </div>
        <button
          aria-label={nextPageLabel}
          className={styles.arrow}
          disabled={safeCurrentPage === totalPages || itemCount === 0}
          onClick={() => changePage(safeCurrentPage + 1)}
          suppressHydrationWarning
          type="button"
        >
          <ArrowIcon direction="right" />
        </button>
      </nav>

      {pageSizeConfig && onPageSizeChange ? (
        <div className={styles.pageSize}>
          <NexusWorkspaceSelect
            config={pageSizeConfig}
            isOpen={isPageSizeOpen}
            name={`workspace-${pageSizeConfig.id}`}
            onOpenChange={setIsPageSizeOpen}
            onValueChange={onPageSizeChange}
            placement="top"
            value={pageSizeValue}
          />
        </div>
      ) : null}
    </footer>
  );
}
