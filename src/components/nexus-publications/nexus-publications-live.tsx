"use client";

import { useDeferredValue, useEffect, useState } from "react";
import {
  nexusPublicationsLiveContent as content,
  type PublicationSortValue,
  parseSortValue,
  quartileOptions,
  sortOptions,
  workTypeLabels,
  workTypeOptions,
} from "@/components/nexus-publications/nexus-publications-live-content";
import { NexusTablePagination } from "@/components/nexus-workspace-ui/nexus-table-pagination";
import {
  NexusWorkspaceSearch,
  NexusWorkspaceToolbar,
} from "@/components/nexus-workspace-ui/nexus-workspace-controls";
import { NexusWorkspaceDrawer } from "@/components/nexus-workspace-ui/nexus-workspace-drawer";
import {
  NexusWorkspaceEmptyState,
  NexusWorkspaceNotice,
} from "@/components/nexus-workspace-ui/nexus-workspace-elements";
import { NexusWorkspacePage } from "@/components/nexus-workspace-ui/nexus-workspace-page";
import {
  NexusWorkspaceCatalog,
  type NexusWorkspaceRecordColumn,
  NexusWorkspaceRecordTable,
  NexusWorkspaceTableBadge,
  NexusWorkspaceTablePrimary,
  NexusWorkspaceTableText,
} from "@/components/nexus-workspace-ui/nexus-workspace-records";
import {
  type NexusSelectConfig,
  type NexusSelectOption,
  NexusWorkspaceSelect,
} from "@/components/nexus-workspace-ui/nexus-workspace-select";
import { ApiRequestError } from "@/lib/api-client";
import {
  getPublication,
  listPublications,
  type PublicationDetail,
  type PublicationSummary,
  type Quartile,
} from "@/lib/api-publications";

const columns: readonly NexusWorkspaceRecordColumn[] = [
  { id: "title", label: content.columns.title, primary: true },
  { id: "workType", label: content.columns.workType },
  { id: "quartile", label: content.columns.quartile },
  { id: "year", label: content.columns.year },
  { id: "citations", label: content.columns.citations },
];

const pageSizeConfig: NexusSelectConfig = {
  defaultValue: "10",
  id: "publication-page-size",
  label: "Baris per halaman",
  options: [
    { label: "10", value: "10" },
    { label: "25", value: "25" },
    { label: "50", value: "50" },
  ],
};

const workTypeFilterConfig: NexusSelectConfig = {
  defaultValue: "all",
  id: "publication-work-type",
  label: content.columns.workType,
  options: [
    { label: content.filterAllWorkType, value: "all" },
    ...workTypeOptions,
  ],
};

const quartileFilterConfig: NexusSelectConfig = {
  defaultValue: "all",
  id: "publication-quartile",
  label: content.columns.quartile,
  options: [
    { label: content.filterAllQuartile, value: "all" },
    ...quartileOptions,
  ],
};

const sortConfig: NexusSelectConfig = {
  defaultValue: "year-desc",
  id: "publication-sort",
  label: "Urutkan",
  options: sortOptions as [NexusSelectOption, ...NexusSelectOption[]],
};

function errorMessage(error: unknown): string {
  return error instanceof ApiRequestError ? error.message : content.errorLabel;
}

function quartileTone(quartile: PublicationSummary["quartile"]) {
  if (quartile === "Q1" || quartile === "Q2") return "success" as const;
  if (quartile === null) return "neutral" as const;
  return "info" as const;
}

export function NexusPublicationsLive() {
  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search);
  const [workTypeFilter, setWorkTypeFilter] = useState("all");
  const [isWorkTypeOpen, setIsWorkTypeOpen] = useState(false);
  const [quartileFilter, setQuartileFilter] = useState("all");
  const [isQuartileOpen, setIsQuartileOpen] = useState(false);
  const [sortValue, setSortValue] = useState<PublicationSortValue>("year-desc");
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSizeValue, setPageSizeValue] = useState("10");

  const [publications, setPublications] = useState<PublicationSummary[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detail, setDetail] = useState<PublicationDetail | null>(null);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setLoadError(null);
    const { sortBy, sortOrder } = parseSortValue(sortValue);
    listPublications({
      limit: Number(pageSizeValue),
      page,
      quartile:
        quartileFilter === "all" ? undefined : (quartileFilter as Quartile),
      search: deferredSearch.trim() === "" ? undefined : deferredSearch.trim(),
      sortBy,
      sortOrder,
      workType:
        workTypeFilter === "all"
          ? undefined
          : (workTypeFilter as PublicationSummary["workType"]),
    })
      .then((result) => {
        if (cancelled) return;
        setPublications(result.data);
        setTotal(result.meta.total);
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        setLoadError(errorMessage(error));
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [
    deferredSearch,
    workTypeFilter,
    quartileFilter,
    sortValue,
    page,
    pageSizeValue,
  ]);

  useEffect(() => {
    if (!selectedId) {
      setDetail(null);
      return;
    }
    let cancelled = false;
    setIsDetailLoading(true);
    setDetailError(null);
    getPublication(selectedId)
      .then((result) => {
        if (!cancelled) setDetail(result);
      })
      .catch((error: unknown) => {
        if (!cancelled) setDetailError(errorMessage(error));
      })
      .finally(() => {
        if (!cancelled) setIsDetailLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [selectedId]);

  const hasActiveFilters =
    search.length > 0 || workTypeFilter !== "all" || quartileFilter !== "all";

  function resetFilters() {
    setSearch("");
    setWorkTypeFilter("all");
    setQuartileFilter("all");
    setPage(1);
  }

  const rows = publications.map((publication) => ({
    id: publication.publicId,
    cells: {
      citations: (
        <NexusWorkspaceTableText>
          {publication.citationCount}
        </NexusWorkspaceTableText>
      ),
      quartile: publication.quartile ? (
        <NexusWorkspaceTableBadge tone={quartileTone(publication.quartile)}>
          {publication.quartile}
        </NexusWorkspaceTableBadge>
      ) : (
        <NexusWorkspaceTableText>—</NexusWorkspaceTableText>
      ),
      title: (
        <NexusWorkspaceTablePrimary
          onClick={() => setSelectedId(publication.publicId)}
          subtitle={publication.venue ?? undefined}
          title={publication.title}
        />
      ),
      workType: (
        <NexusWorkspaceTableText>
          {workTypeLabels[publication.workType]}
        </NexusWorkspaceTableText>
      ),
      year: (
        <NexusWorkspaceTableText>{publication.year}</NexusWorkspaceTableText>
      ),
    },
    mobile: (
      <article>
        <strong>{publication.title}</strong>
        <p>
          {workTypeLabels[publication.workType]} · {publication.year}
        </p>
      </article>
    ),
  }));

  return (
    <NexusWorkspacePage
      description={content.description}
      descriptionId="publications-description"
      title={content.title}
      titleId="publications-title"
    >
      {loadError !== null ? (
        <NexusWorkspaceNotice tone="danger">{loadError}</NexusWorkspaceNotice>
      ) : null}

      <NexusWorkspaceCatalog labelledBy="publications-title">
        <NexusWorkspaceToolbar>
          <NexusWorkspaceSearch
            label={content.searchLabel}
            name="search"
            onValueChange={(value) => {
              setSearch(value);
              setPage(1);
            }}
            placeholder={content.searchPlaceholder}
            value={search}
          />
          <NexusWorkspaceSelect
            config={workTypeFilterConfig}
            isOpen={isWorkTypeOpen}
            name="filter-work-type"
            onOpenChange={setIsWorkTypeOpen}
            onValueChange={(value) => {
              setWorkTypeFilter(value);
              setPage(1);
            }}
            value={workTypeFilter}
          />
          <NexusWorkspaceSelect
            config={quartileFilterConfig}
            isOpen={isQuartileOpen}
            name="filter-quartile"
            onOpenChange={setIsQuartileOpen}
            onValueChange={(value) => {
              setQuartileFilter(value);
              setPage(1);
            }}
            value={quartileFilter}
          />
          <NexusWorkspaceSelect
            config={sortConfig}
            isOpen={isSortOpen}
            name="sort"
            onOpenChange={setIsSortOpen}
            onValueChange={(value) =>
              setSortValue(value as PublicationSortValue)
            }
            value={sortValue}
          />
        </NexusWorkspaceToolbar>

        <NexusWorkspaceRecordTable
          caption={content.tableCaption}
          columns={columns}
          empty={
            <NexusWorkspaceEmptyState
              description={
                hasActiveFilters
                  ? content.emptyDescription
                  : content.emptyTrueDescription
              }
              onResetFilters={hasActiveFilters ? resetFilters : undefined}
              title={
                hasActiveFilters ? content.emptyTitle : content.emptyTrueTitle
              }
            />
          }
          isLoading={isLoading}
          pagination={
            <NexusTablePagination
              currentPage={page}
              itemCount={total}
              navigationLabel="Navigasi halaman publikasi"
              nextPageLabel="Halaman berikutnya"
              onPageChange={setPage}
              onPageSizeChange={(value) => {
                setPageSizeValue(value);
                setPage(1);
              }}
              pageLabel="Halaman"
              pageSizeConfig={pageSizeConfig}
              pageSizeValue={pageSizeValue}
              previousPageLabel="Halaman sebelumnya"
              rangePrefix="Menampilkan"
              totalUnit={content.resultUnit}
            />
          }
          rows={rows}
        />
      </NexusWorkspaceCatalog>

      {selectedId ? (
        <NexusWorkspaceDrawer
          closeLabel={content.detail.close}
          description={content.detail.description}
          eyebrow={content.detail.eyebrow}
          onClose={() => setSelectedId(null)}
          title={detail?.title ?? "…"}
        >
          {isDetailLoading ? (
            <p>Memuat…</p>
          ) : detailError ? (
            <NexusWorkspaceNotice tone="danger">
              {detailError}
            </NexusWorkspaceNotice>
          ) : detail ? (
            <dl>
              <div>
                <dt>{content.detail.workType}</dt>
                <dd>{workTypeLabels[detail.workType]}</dd>
              </div>
              <div>
                <dt>{content.detail.venue}</dt>
                <dd>{detail.venue ?? "—"}</dd>
              </div>
              <div>
                <dt>{content.detail.year}</dt>
                <dd>{detail.year}</dd>
              </div>
              <div>
                <dt>{content.detail.quartile}</dt>
                <dd>{detail.quartile ?? "—"}</dd>
              </div>
              <div>
                <dt>{content.detail.citations}</dt>
                <dd>{detail.citationCount}</dd>
              </div>
              <div>
                <dt>{content.detail.doi}</dt>
                <dd>{detail.doi ?? "—"}</dd>
              </div>
              <div>
                <dt>{content.detail.issnL}</dt>
                <dd>{detail.issnL ?? "—"}</dd>
              </div>
              <div>
                <dt>{content.detail.authors}</dt>
                <dd>
                  {detail.authors.length === 0
                    ? "—"
                    : detail.authors
                        .toSorted(
                          (first, second) =>
                            first.authorOrder - second.authorOrder,
                        )
                        .map((author) => author.authorNameRaw)
                        .join("; ")}
                </dd>
              </div>
            </dl>
          ) : null}
        </NexusWorkspaceDrawer>
      ) : null}
    </NexusWorkspacePage>
  );
}
