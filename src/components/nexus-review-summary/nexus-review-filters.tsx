"use client";

import {
  type KeyboardEvent,
  useCallback,
  useDeferredValue,
  useEffect,
  useId,
  useMemo,
  useState,
} from "react";
import { NexusReviewDetail } from "@/components/nexus-review-summary/nexus-review-detail";
import styles from "@/components/nexus-review-summary/nexus-review-filters.module.css";
import type {
  NexusReviewFiltersContent,
  ReviewSelectFilter,
} from "@/components/nexus-review-summary/nexus-review-filters-content";
import { NexusReviewSelect } from "@/components/nexus-review-summary/nexus-review-select";
import { NexusReviewTable } from "@/components/nexus-review-summary/nexus-review-table";
import type {
  ReviewCandidateRow,
  ReviewCandidateStatus,
} from "@/components/nexus-review-summary/nexus-review-table-content";

type NexusReviewFiltersProps = {
  candidates: readonly ReviewCandidateRow[];
  content: NexusReviewFiltersContent;
  onReviewerNoteChange: (candidateId: string, note: string) => void;
  onStatusChange: (candidateId: string, status: ReviewCandidateStatus) => void;
};

type SourceTabKeyboardEvent = KeyboardEvent<HTMLButtonElement>;

function getInitialFilterValues(filters: readonly ReviewSelectFilter[]) {
  const values: Record<string, string> = {};

  for (const filter of filters) {
    values[filter.id] = filter.defaultValue;
  }

  return values;
}

function getAdjacentTabIndex(
  event: SourceTabKeyboardEvent,
  currentIndex: number,
  tabCount: number,
) {
  if (event.key === "Home") {
    return 0;
  }

  if (event.key === "End") {
    return tabCount - 1;
  }

  if (event.key === "ArrowRight" || event.key === "ArrowDown") {
    return (currentIndex + 1) % tabCount;
  }

  if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
    return (currentIndex - 1 + tabCount) % tabCount;
  }

  return null;
}

function normalizeSearchValue(value: string) {
  return value.toLocaleLowerCase("id-ID").trim();
}

function SearchIcon() {
  return (
    <svg aria-hidden="true" fill="none" viewBox="0 0 24 24">
      <circle cx="10.75" cy="10.75" r="6.75" />
      <path d="m16 16 4 4" />
    </svg>
  );
}

export function NexusReviewFilters({
  candidates,
  content,
  onReviewerNoteChange,
  onStatusChange,
}: NexusReviewFiltersProps) {
  const idPrefix = useId();
  const defaultSourceIndex = Math.max(
    content.sources.findIndex(
      (source) => source.id === content.defaultSourceId,
    ),
    0,
  );
  const [activeSourceIndex, setActiveSourceIndex] =
    useState(defaultSourceIndex);
  const [activeCandidateId, setActiveCandidateId] = useState<string | null>(
    null,
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [filterValues, setFilterValues] = useState(() =>
    getInitialFilterValues(content.filters),
  );
  const [isLoading, setIsLoading] = useState(true);
  const [openFilterId, setOpenFilterId] = useState<string | null>(null);
  const [pageSizeValue, setPageSizeValue] = useState(
    content.table.defaultPageSize,
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState<ReadonlySet<string>>(
    () => new Set(),
  );
  const deferredSearchQuery = useDeferredValue(searchQuery);
  const activeSource = content.sources[activeSourceIndex];
  const normalizedQuery = normalizeSearchValue(deferredSearchQuery);
  const sourceCounts = useMemo(() => {
    const counts: Record<string, number> = { all: candidates.length };

    for (const candidate of candidates) {
      const sourceId = candidate.source.toLocaleLowerCase("id-ID");
      counts[sourceId] = (counts[sourceId] ?? 0) + 1;
    }

    return counts;
  }, [candidates]);
  const filteredCandidates = useMemo(() => {
    const nextCandidates = candidates.filter((candidate) => {
      const matchesSource =
        activeSource.id === "all" ||
        candidate.source.toLocaleLowerCase("id-ID") === activeSource.id;
      const matchesStatus =
        filterValues.status === "all" ||
        candidate.status === filterValues.status;
      const matchesType =
        filterValues["publication-type"] === "all" ||
        candidate.publicationTypeId === filterValues["publication-type"];
      const matchesYear =
        filterValues.year === "all" ||
        candidate.record.year === filterValues.year;
      const searchableContent = normalizeSearchValue(
        [
          candidate.record.title,
          candidate.record.doi,
          candidate.record.authors,
          candidate.owner.name,
        ].join(" "),
      );
      const matchesQuery =
        normalizedQuery.length === 0 ||
        searchableContent.includes(normalizedQuery);

      return (
        matchesSource &&
        matchesStatus &&
        matchesType &&
        matchesYear &&
        matchesQuery
      );
    });

    return nextCandidates.toSorted((firstCandidate, secondCandidate) => {
      if (filterValues.sort === "oldest") {
        return firstCandidate.discoveredAtIso.localeCompare(
          secondCandidate.discoveredAtIso,
        );
      }

      if (filterValues.sort === "title-ascending") {
        return firstCandidate.record.title.localeCompare(
          secondCandidate.record.title,
          "id-ID",
        );
      }

      return secondCandidate.discoveredAtIso.localeCompare(
        firstCandidate.discoveredAtIso,
      );
    });
  }, [activeSource.id, candidates, filterValues, normalizedQuery]);
  const activeCandidate = candidates.find(
    (candidate) => candidate.id === activeCandidateId,
  );
  const hasActiveFilters =
    searchQuery.length > 0 ||
    activeSource.id !== content.defaultSourceId ||
    content.filters.some(
      (filter) => filterValues[filter.id] !== filter.defaultValue,
    );
  const isSearchUpdating = searchQuery !== deferredSearchQuery;

  useEffect(() => {
    const loadingTimer = window.setTimeout(() => setIsLoading(false), 420);

    return () => window.clearTimeout(loadingTimer);
  }, []);

  const closeDetail = useCallback(() => setActiveCandidateId(null), []);

  const selectSource = (index: number) => {
    setActiveSourceIndex(index);
    setCurrentPage(1);
  };

  const selectAdjacentSource = (
    event: SourceTabKeyboardEvent,
    currentIndex: number,
  ) => {
    const nextIndex = getAdjacentTabIndex(
      event,
      currentIndex,
      content.sources.length,
    );

    if (nextIndex === null) {
      return;
    }

    event.preventDefault();
    selectSource(nextIndex);

    const tabs =
      event.currentTarget.parentElement?.querySelectorAll<HTMLButtonElement>(
        '[role="tab"]',
      );
    tabs?.[nextIndex]?.focus();
  };

  const changeFilterValue = (filterId: string, value: string) => {
    setFilterValues((currentValues) => ({
      ...currentValues,
      [filterId]: value,
    }));
    setCurrentPage(1);
  };

  const resetFilters = () => {
    setActiveSourceIndex(defaultSourceIndex);
    setFilterValues(getInitialFilterValues(content.filters));
    setSearchQuery("");
    setCurrentPage(1);
  };

  return (
    <div className={styles.filters}>
      <div
        aria-label={content.sourceNavigationLabel}
        className={styles.sourceTabs}
        role="tablist"
      >
        {content.sources.map((source, index) => {
          const isActive = index === activeSourceIndex;

          return (
            <button
              aria-controls={`${idPrefix}-source-panel`}
              aria-selected={isActive}
              className={styles.sourceTab}
              id={`${idPrefix}-source-${source.id}`}
              key={source.id}
              onClick={() => selectSource(index)}
              onKeyDown={(event) => selectAdjacentSource(event, index)}
              role="tab"
              tabIndex={isActive ? 0 : -1}
              type="button"
            >
              <span>{source.label}</span>
              <span className={styles.sourceCount}>
                {sourceCounts[source.id] ?? 0}
              </span>
            </button>
          );
        })}
      </div>

      <div
        aria-labelledby={`${idPrefix}-source-${activeSource.id}`}
        className={styles.toolbar}
        id={`${idPrefix}-source-panel`}
        role="tabpanel"
      >
        <label className={styles.searchField}>
          <span className={styles.visuallyHidden}>{content.searchLabel}</span>
          <SearchIcon />
          <input
            autoComplete="off"
            name="review-search"
            onChange={(event) => {
              setSearchQuery(event.currentTarget.value);
              setCurrentPage(1);
            }}
            placeholder={content.searchPlaceholder}
            type="search"
            value={searchQuery}
          />
        </label>

        {content.filters.map((filter) => (
          <NexusReviewSelect
            filter={filter}
            isOpen={openFilterId === filter.id}
            key={filter.id}
            onOpenChange={(isOpen) =>
              setOpenFilterId(isOpen ? filter.id : null)
            }
            onValueChange={(value) => changeFilterValue(filter.id, value)}
            value={filterValues[filter.id] ?? filter.defaultValue}
          />
        ))}
      </div>

      <div aria-live="polite" className={styles.resultMeta}>
        <p>
          {isSearchUpdating
            ? "Memperbarui hasil pencarian..."
            : `${filteredCandidates.length} kandidat ditemukan`}
        </p>
        {hasActiveFilters ? (
          <button
            className={styles.resetButton}
            onClick={resetFilters}
            type="button"
          >
            Atur ulang filter
          </button>
        ) : null}
      </div>

      <NexusReviewTable
        activeSourceLabel={activeSource.label}
        candidates={filteredCandidates}
        content={content.table}
        currentPage={currentPage}
        hasActiveFilters={hasActiveFilters}
        isLoading={isLoading}
        onOpenCandidate={setActiveCandidateId}
        onPageChange={setCurrentPage}
        onPageSizeChange={(value) => {
          setPageSizeValue(value);
          setCurrentPage(1);
        }}
        onResetFilters={resetFilters}
        onSelectedIdsChange={setSelectedIds}
        pageSizeValue={pageSizeValue}
        selectedIds={selectedIds}
        sourceCandidateCount={sourceCounts[activeSource.id] ?? 0}
        totalCandidateCount={candidates.length}
      />

      {activeCandidate ? (
        <NexusReviewDetail
          candidate={activeCandidate}
          onClose={closeDetail}
          onReviewerNoteChange={onReviewerNoteChange}
          onStatusChange={onStatusChange}
        />
      ) : null}
    </div>
  );
}
