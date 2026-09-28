"use client";

import { useDeferredValue, useEffect, useState } from "react";
import {
  type ActivitySortValue,
  nexusActivitiesLiveContent as content,
  parseSortValue,
  sortOptions,
  statusLabels,
  statusOptions,
  typeLabels,
  typeOptions,
} from "@/components/nexus-activities/nexus-activities-live-content";
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
import {
  type ActivityDetail,
  type ActivityStatus,
  type ActivitySummary,
  type ActivityType,
  getActivity,
  listActivities,
} from "@/lib/api-activities";
import { ApiRequestError } from "@/lib/api-client";

const columns: readonly NexusWorkspaceRecordColumn[] = [
  { id: "title", label: content.columns.title, primary: true },
  { id: "type", label: content.columns.type },
  { id: "period", label: content.columns.period },
  { id: "status", label: content.columns.status },
];

const pageSizeConfig: NexusSelectConfig = {
  defaultValue: "10",
  id: "activity-page-size",
  label: "Baris per halaman",
  options: [
    { label: "10", value: "10" },
    { label: "25", value: "25" },
    { label: "50", value: "50" },
  ],
};

const typeFilterConfig: NexusSelectConfig = {
  defaultValue: "all",
  id: "activity-type",
  label: content.columns.type,
  options: [{ label: content.filterAllType, value: "all" }, ...typeOptions],
};

const statusFilterConfig: NexusSelectConfig = {
  defaultValue: "all",
  id: "activity-status",
  label: content.columns.status,
  options: [{ label: content.filterAllStatus, value: "all" }, ...statusOptions],
};

const sortConfig: NexusSelectConfig = {
  defaultValue: "periodStart-desc",
  id: "activity-sort",
  label: "Urutkan",
  options: sortOptions as [NexusSelectOption, ...NexusSelectOption[]],
};

function errorMessage(error: unknown): string {
  return error instanceof ApiRequestError ? error.message : content.errorLabel;
}

function statusTone(status: ActivityStatus) {
  if (status === "ongoing") return "success" as const;
  if (status === "planned") return "waiting" as const;
  if (status === "cancelled") return "danger" as const;
  return "neutral" as const;
}

function formatPeriod(
  record: Pick<ActivitySummary, "periodEnd" | "periodStart">,
) {
  const start = new Date(record.periodStart).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  if (!record.periodEnd) return start;
  const end = new Date(record.periodEnd).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  return `${start} – ${end}`;
}

export function NexusActivitiesLive() {
  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search);
  const [typeFilter, setTypeFilter] = useState("all");
  const [isTypeOpen, setIsTypeOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [isStatusOpen, setIsStatusOpen] = useState(false);
  const [sortValue, setSortValue] =
    useState<ActivitySortValue>("periodStart-desc");
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSizeValue, setPageSizeValue] = useState("10");

  const [activities, setActivities] = useState<ActivitySummary[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detail, setDetail] = useState<ActivityDetail | null>(null);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setLoadError(null);
    const { sortBy, sortOrder } = parseSortValue(sortValue);
    listActivities({
      limit: Number(pageSizeValue),
      page,
      search: deferredSearch.trim() === "" ? undefined : deferredSearch.trim(),
      sortBy,
      sortOrder,
      status:
        statusFilter === "all" ? undefined : (statusFilter as ActivityStatus),
      type: typeFilter === "all" ? undefined : (typeFilter as ActivityType),
    })
      .then((result) => {
        if (cancelled) return;
        setActivities(result.data);
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
    typeFilter,
    statusFilter,
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
    getActivity(selectedId)
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
    search.length > 0 || typeFilter !== "all" || statusFilter !== "all";

  function resetFilters() {
    setSearch("");
    setTypeFilter("all");
    setStatusFilter("all");
    setPage(1);
  }

  const rows = activities.map((activity) => ({
    id: activity.publicId,
    cells: {
      period: (
        <NexusWorkspaceTableText>
          {formatPeriod(activity)}
        </NexusWorkspaceTableText>
      ),
      status: (
        <NexusWorkspaceTableBadge tone={statusTone(activity.status)}>
          {statusLabels[activity.status]}
        </NexusWorkspaceTableBadge>
      ),
      title: (
        <NexusWorkspaceTablePrimary
          onClick={() => setSelectedId(activity.publicId)}
          subtitle={
            activity.isPublic
              ? content.visibilityPublic
              : content.visibilityPrivate
          }
          title={activity.title}
        />
      ),
      type: (
        <NexusWorkspaceTableText>
          {typeLabels[activity.type]}
        </NexusWorkspaceTableText>
      ),
    },
    mobile: (
      <article>
        <strong>{activity.title}</strong>
        <p>
          {typeLabels[activity.type]} · {statusLabels[activity.status]}
        </p>
      </article>
    ),
  }));

  return (
    <NexusWorkspacePage
      description={content.description}
      descriptionId="activities-description"
      title={content.title}
      titleId="activities-title"
    >
      {loadError !== null ? (
        <NexusWorkspaceNotice tone="danger">{loadError}</NexusWorkspaceNotice>
      ) : null}

      <NexusWorkspaceCatalog labelledBy="activities-title">
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
            config={typeFilterConfig}
            isOpen={isTypeOpen}
            name="filter-type"
            onOpenChange={setIsTypeOpen}
            onValueChange={(value) => {
              setTypeFilter(value);
              setPage(1);
            }}
            value={typeFilter}
          />
          <NexusWorkspaceSelect
            config={statusFilterConfig}
            isOpen={isStatusOpen}
            name="filter-status"
            onOpenChange={setIsStatusOpen}
            onValueChange={(value) => {
              setStatusFilter(value);
              setPage(1);
            }}
            value={statusFilter}
          />
          <NexusWorkspaceSelect
            config={sortConfig}
            isOpen={isSortOpen}
            name="sort"
            onOpenChange={setIsSortOpen}
            onValueChange={(value) => setSortValue(value as ActivitySortValue)}
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
              navigationLabel="Navigasi halaman kegiatan"
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
                <dt>{content.detail.type}</dt>
                <dd>{typeLabels[detail.type]}</dd>
              </div>
              <div>
                <dt>{content.detail.status}</dt>
                <dd>{statusLabels[detail.status]}</dd>
              </div>
              <div>
                <dt>{content.detail.period}</dt>
                <dd>{formatPeriod(detail)}</dd>
              </div>
              <div>
                <dt>{content.detail.visibility}</dt>
                <dd>
                  {detail.isPublic
                    ? content.visibilityPublic
                    : content.visibilityPrivate}
                </dd>
              </div>
              <div>
                <dt>{content.detail.descriptionLabel}</dt>
                <dd>{detail.description ?? "—"}</dd>
              </div>
              <div>
                <dt>{content.detail.participants}</dt>
                <dd>
                  {detail.participants.length === 0
                    ? "—"
                    : detail.participants
                        .map((participant) => participant.roleInActivity)
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
