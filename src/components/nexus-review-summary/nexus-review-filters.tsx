"use client";

import { useCallback, useDeferredValue, useMemo, useState } from "react";
import { NexusReviewDetail } from "@/components/nexus-review-summary/nexus-review-detail";
import styles from "@/components/nexus-review-summary/nexus-review-filters.module.css";
import type {
  NexusReviewFiltersContent,
  ReviewSelectFilter,
} from "@/components/nexus-review-summary/nexus-review-filters-content";
import { NexusReviewTable } from "@/components/nexus-review-summary/nexus-review-table";
import type {
  ReviewCandidateRow,
  ReviewCandidateStatus,
  ReviewStatusChangeContext,
} from "@/components/nexus-review-summary/nexus-review-table-content";
import {
  NexusWorkspaceSearch,
  NexusWorkspaceTabs,
} from "@/components/nexus-workspace-ui/nexus-workspace-controls";
import { NexusWorkspaceSelect } from "@/components/nexus-workspace-ui/nexus-workspace-select";

type NexusReviewFiltersProps = {
  candidates: readonly ReviewCandidateRow[];
  content: NexusReviewFiltersContent;
  onReviewerNoteChange: (candidateId: string, note: string) => void;
  onStatusChange: (
    candidateId: string,
    status: ReviewCandidateStatus,
    context?: ReviewStatusChangeContext,
  ) => void;
};

function getInitialFilterValues(filters: readonly ReviewSelectFilter[]) {
  const values: Record<string, string> = {};

  for (const filter of filters) {
    values[filter.id] = filter.defaultValue;
  }

  return values;
}

function normalizeSearchValue(value: string) {
  return value.toLocaleLowerCase("id-ID").trim();
}

function getSourceId(source: ReviewCandidateRow["source"]) {
  return source.toLocaleLowerCase("id-ID").replaceAll(" ", "-");
}

export function NexusReviewFilters({
  candidates,
  content,
  onReviewerNoteChange,
  onStatusChange,
}: NexusReviewFiltersProps) {
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
  const [openFilterId, setOpenFilterId] = useState<string | null>(null);
  const [pageSizeValue, setPageSizeValue] = useState(
    content.table.defaultPageSize,
  );
  const [searchQuery, setSearchQuery] = useState("");
  const deferredSearchQuery = useDeferredValue(searchQuery);
  const activeSource = content.sources[activeSourceIndex];
  const normalizedQuery = normalizeSearchValue(deferredSearchQuery);
  const sourceCounts = useMemo(() => {
    const counts: Record<string, number> = { all: candidates.length };

    for (const candidate of candidates) {
      const sourceId = getSourceId(candidate.source);
      counts[sourceId] = (counts[sourceId] ?? 0) + 1;
    }

    return counts;
  }, [candidates]);
  const sourceTabs = content.sources.map((source) => ({
    count: sourceCounts[source.id] ?? 0,
    id: source.id,
    label: source.label,
  }));
  const filteredCandidates = useMemo(() => {
    const nextCandidates = candidates.filter((candidate) => {
      const matchesSource =
        activeSource.id === "all" ||
        getSourceId(candidate.source) === activeSource.id;
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

  const closeDetail = useCallback(() => setActiveCandidateId(null), []);

  const selectSource = (index: number) => {
    setActiveSourceIndex(index);
    setCurrentPage(1);
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
      <NexusWorkspaceTabs
        activeId={activeSource.id}
        label={content.sourceNavigationLabel}
        onActiveChange={(sourceId) => {
          const nextIndex = content.sources.findIndex(
            (source) => source.id === sourceId,
          );
          if (nextIndex >= 0) selectSource(nextIndex);
        }}
        panelId="review-source-panel"
        tabs={sourceTabs}
      />

      <div
        aria-label={`Sumber ${activeSource.label}`}
        className={styles.toolbar}
        id="review-source-panel"
        role="tabpanel"
      >
        <NexusWorkspaceSearch
          label={content.searchLabel}
          name="review-search"
          onValueChange={(value) => {
            setSearchQuery(value);
            setCurrentPage(1);
          }}
          placeholder={content.searchPlaceholder}
          value={searchQuery}
        />

        {content.filters.map((filter) => (
          <NexusWorkspaceSelect
            config={filter}
            isOpen={openFilterId === filter.id}
            key={filter.id}
            name={`review-${filter.id}`}
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
        isLoading={isSearchUpdating}
        onOpenCandidate={setActiveCandidateId}
        onPageChange={setCurrentPage}
        onPageSizeChange={(value) => {
          setPageSizeValue(value);
          setCurrentPage(1);
        }}
        onResetFilters={resetFilters}
        pageSizeValue={pageSizeValue}
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
