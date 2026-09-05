"use client";

import { useDeferredValue, useEffect, useState } from "react";
import { NexusAcademicIdentifierValue } from "@/components/nexus-members/nexus-member-academic";
import {
  nexusMembersLiveContent as content,
  statusLabels,
  statusOptions,
} from "@/components/nexus-members/nexus-members-live-content";
import { NexusTablePagination } from "@/components/nexus-workspace-ui/nexus-table-pagination";
import {
  NexusWorkspaceSearch,
  NexusWorkspaceToolbar,
} from "@/components/nexus-workspace-ui/nexus-workspace-controls";
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
} from "@/components/nexus-workspace-ui/nexus-workspace-records";
import {
  type NexusSelectConfig,
  NexusWorkspaceSelect,
} from "@/components/nexus-workspace-ui/nexus-workspace-select";
import { ApiRequestError } from "@/lib/api-client";
import { listMembers, type MemberSummary } from "@/lib/api-members";

const columns: readonly NexusWorkspaceRecordColumn[] = [
  { id: "name", label: content.columns.name, primary: true },
  { id: "status", label: content.columns.status },
  { id: "profiles", label: content.columns.profiles },
  { id: "joinedAt", label: content.columns.joinedAt },
];

const pageSizeConfig: NexusSelectConfig = {
  defaultValue: "10",
  id: "member-page-size",
  label: "Baris per halaman",
  options: [
    { label: "10", value: "10" },
    { label: "25", value: "25" },
    { label: "50", value: "50" },
  ],
};

const statusFilterConfig: NexusSelectConfig = {
  defaultValue: "all",
  id: "member-status",
  label: content.columns.status,
  options: [{ label: content.filterAllStatus, value: "all" }, ...statusOptions],
};

function statusTone(status: MemberSummary["status"]) {
  if (status === "active") return "success" as const;
  if (status === "on_leave") return "waiting" as const;
  return "neutral" as const;
}

function errorMessage(error: unknown): string {
  return error instanceof ApiRequestError ? error.message : content.errorLabel;
}

export function NexusMembersLive() {
  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search);
  const [statusFilter, setStatusFilter] = useState("all");
  const [isStatusOpen, setIsStatusOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSizeValue, setPageSizeValue] = useState("10");

  const [members, setMembers] = useState<MemberSummary[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    setPage(1);
  }, []);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setLoadError(null);
    listMembers({
      limit: Number(pageSizeValue),
      page,
      search: deferredSearch.trim() === "" ? undefined : deferredSearch.trim(),
      status:
        statusFilter === "all"
          ? undefined
          : (statusFilter as MemberSummary["status"]),
    })
      .then((result) => {
        if (cancelled) return;
        setMembers(result.data);
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
  }, [deferredSearch, statusFilter, page, pageSizeValue]);

  const hasActiveFilters = search.length > 0 || statusFilter !== "all";

  function resetFilters() {
    setSearch("");
    setStatusFilter("all");
    setPage(1);
  }

  const rows = members.map((member) => ({
    id: member.publicId,
    cells: {
      joinedAt: member.joinedAt,
      name: <NexusWorkspaceTablePrimary title={member.name} />,
      profiles: (
        // nexusAcademicProfileUrl's "googleScholar" branch expects an
        // already-complete URL (the fixture stored it that way); the real
        // API's googleScholarId is a bare id, so it's built into a URL here.
        <>
          <NexusAcademicIdentifierValue
            fallback="—"
            identifier="sintaId"
            value={member.sintaId ?? undefined}
          />
          {" · "}
          <NexusAcademicIdentifierValue
            fallback="—"
            identifier="scopusAuthorId"
            value={member.scopusId ?? undefined}
          />
          {" · "}
          <NexusAcademicIdentifierValue
            fallback="—"
            identifier="googleScholar"
            value={
              member.googleScholarId
                ? `https://scholar.google.com/citations?user=${member.googleScholarId}`
                : undefined
            }
          />
        </>
      ),
      status: (
        <NexusWorkspaceTableBadge tone={statusTone(member.status)}>
          {statusLabels[member.status]}
        </NexusWorkspaceTableBadge>
      ),
    },
    mobile: (
      <article>
        <strong>{member.name}</strong>
        <p>{statusLabels[member.status]}</p>
      </article>
    ),
  }));

  return (
    <NexusWorkspacePage
      description={content.description}
      descriptionId="members-description"
      title={content.title}
      titleId="members-title"
    >
      {loadError !== null ? (
        <NexusWorkspaceNotice tone="danger">{loadError}</NexusWorkspaceNotice>
      ) : null}

      <NexusWorkspaceCatalog labelledBy="members-title">
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
              navigationLabel="Navigasi halaman anggota"
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
    </NexusWorkspacePage>
  );
}
