"use client";

import { useDeferredValue, useEffect, useState } from "react";
import {
  candidateTypeLabels,
  candidateTypeOptions,
  nexusReviewLiveContent as content,
  decisionLabels,
  decisionOptions,
  statusLabels,
  statusOptions,
} from "@/components/nexus-audit-review/nexus-review-live-content";
import { NexusTablePagination } from "@/components/nexus-workspace-ui/nexus-table-pagination";
import { NexusWorkspaceSearch } from "@/components/nexus-workspace-ui/nexus-workspace-controls";
import { NexusWorkspaceDrawer } from "@/components/nexus-workspace-ui/nexus-workspace-drawer";
import {
  NexusWorkspaceButton,
  NexusWorkspaceEmptyState,
  NexusWorkspaceNotice,
} from "@/components/nexus-workspace-ui/nexus-workspace-elements";
import { NexusWorkspaceFormField } from "@/components/nexus-workspace-ui/nexus-workspace-form-field";
import { formatTimestamp } from "@/components/nexus-workspace-ui/nexus-workspace-format";
import { NexusWorkspacePage } from "@/components/nexus-workspace-ui/nexus-workspace-page";
import {
  type NexusWorkspaceRecordColumn,
  NexusWorkspaceRecordTable,
  NexusWorkspaceTableAction,
  NexusWorkspaceTableBadge,
  NexusWorkspaceTablePrimary,
} from "@/components/nexus-workspace-ui/nexus-workspace-records";
import {
  type NexusSelectConfig,
  NexusWorkspaceSelect,
} from "@/components/nexus-workspace-ui/nexus-workspace-select";
import { ApiRequestError } from "@/lib/api-client";
import {
  decideReviewCase,
  getReviewCase,
  listReviewCases,
  type ReviewCaseDetail,
  type ReviewCaseRecord,
  type ReviewDecisionKind,
} from "@/lib/api-reviews";

function humanizeKey(key: string): string {
  const spaced = key.replace(/([a-z0-9])([A-Z])/g, "$1 $2");
  return spaced.charAt(0).toUpperCase() + spaced.slice(1);
}

function formatPayloadValue(value: unknown): string {
  if (value === null || value === undefined || value === "") return "—";
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

const pageSizeConfig: NexusSelectConfig = {
  defaultValue: "10",
  id: "review-page-size",
  label: "Baris per halaman",
  options: [
    { label: "10", value: "10" },
    { label: "25", value: "25" },
    { label: "50", value: "50" },
  ],
};

const statusFilterConfig: NexusSelectConfig = {
  defaultValue: "all",
  id: "status",
  label: content.columns.status,
  options: [{ label: content.filterAllStatus, value: "all" }, ...statusOptions],
};

const candidateTypeFilterConfig: NexusSelectConfig = {
  defaultValue: "all",
  id: "candidate-type",
  label: content.columns.candidateType,
  options: [
    { label: content.filterAllCandidateTypes, value: "all" },
    ...candidateTypeOptions,
  ],
};

const columns: readonly NexusWorkspaceRecordColumn[] = [
  { id: "candidateType", label: content.columns.candidateType, primary: true },
  { id: "status", label: content.columns.status },
  { id: "submitted", label: content.columns.submitted },
  { id: "actions", label: content.columns.action },
];

function errorMessage(error: unknown): string {
  if (error instanceof ApiRequestError) {
    return error.message;
  }
  return "Terjadi kesalahan. Coba lagi.";
}

function StatusBadge({ record }: { record: ReviewCaseRecord }) {
  const tone =
    record.status === "approved"
      ? "success"
      : record.status === "rejected"
        ? "danger"
        : record.status === "needs_revision"
          ? "info"
          : "waiting";
  return (
    <NexusWorkspaceTableBadge tone={tone}>
      {statusLabels[record.status]}
    </NexusWorkspaceTableBadge>
  );
}

export function NexusReviewLive() {
  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search);
  const isSearchUpdating = search !== deferredSearch;
  const [statusFilter, setStatusFilter] = useState("all");
  const [candidateTypeFilter, setCandidateTypeFilter] = useState("all");
  const [openSelectId, setOpenSelectId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [pageSizeValue, setPageSizeValue] = useState("10");

  const [records, setRecords] = useState<ReviewCaseRecord[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [reloadToken, setReloadToken] = useState(0);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detail, setDetail] = useState<ReviewCaseDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);
  const [reason, setReason] = useState("");
  const [decidingAs, setDecidingAs] = useState<ReviewDecisionKind | null>(null);

  // biome-ignore lint/correctness/useExhaustiveDependencies: resets page to 1 whenever a filter changes, deps aren't read in the body
  useEffect(() => {
    setPage(1);
  }, [deferredSearch, statusFilter, candidateTypeFilter]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: reloadToken is a manual refetch trigger, not read in the body
  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setLoadError(null);
    listReviewCases({
      candidateType:
        candidateTypeFilter === "all"
          ? undefined
          : (candidateTypeFilter as ReviewCaseRecord["candidateType"]),
      limit: Number(pageSizeValue),
      page,
      status:
        statusFilter === "all"
          ? undefined
          : (statusFilter as ReviewCaseRecord["status"]),
    })
      .then((result) => {
        if (cancelled) return;
        const needle = deferredSearch.trim().toLocaleLowerCase();
        const filtered =
          needle === ""
            ? result.data
            : result.data.filter((record) =>
                `${candidateTypeLabels[record.candidateType]} ${statusLabels[record.status]}`
                  .toLocaleLowerCase()
                  .includes(needle),
              );
        setRecords(filtered);
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
    statusFilter,
    candidateTypeFilter,
    page,
    pageSizeValue,
    reloadToken,
  ]);

  function reload() {
    setReloadToken((token) => token + 1);
  }

  function openDetail(publicId: string) {
    setSelectedId(publicId);
    setReason("");
    setDetailError(null);
    setDetailLoading(true);
    getReviewCase(publicId)
      .then(setDetail)
      .catch((error: unknown) => setDetailError(errorMessage(error)))
      .finally(() => setDetailLoading(false));
  }

  function closeDetail() {
    setSelectedId(null);
    setDetail(null);
    setDetailError(null);
    setReason("");
  }

  async function submitDecision(decision: ReviewDecisionKind) {
    if (selectedId === null) return;
    setDecidingAs(decision);
    setDetailError(null);
    try {
      await decideReviewCase(selectedId, {
        decision,
        reason: reason.trim() === "" ? undefined : reason.trim(),
      });
      closeDetail();
      reload();
    } catch (error) {
      setDetailError(errorMessage(error));
    } finally {
      setDecidingAs(null);
    }
  }

  const hasActiveFilters =
    search.length > 0 ||
    statusFilter !== "all" ||
    candidateTypeFilter !== "all";

  function resetFilters() {
    setSearch("");
    setStatusFilter("all");
    setCandidateTypeFilter("all");
    setPage(1);
  }

  const rows = records.map((record) => ({
    cells: {
      actions: (
        <NexusWorkspaceTableAction
          label={`Lihat rincian kandidat ${record.publicId}`}
          onClick={() => openDetail(record.publicId)}
        >
          Rincian
        </NexusWorkspaceTableAction>
      ),
      candidateType: (
        <NexusWorkspaceTablePrimary
          onClick={() => openDetail(record.publicId)}
          title={candidateTypeLabels[record.candidateType]}
        />
      ),
      status: <StatusBadge record={record} />,
      submitted: (
        <time dateTime={record.createdAt}>
          {formatTimestamp(record.createdAt)}
        </time>
      ),
    },
    id: record.publicId,
    mobile: (
      <NexusWorkspaceTableAction
        label={`Lihat rincian kandidat ${record.publicId}`}
        onClick={() => openDetail(record.publicId)}
      >
        {candidateTypeLabels[record.candidateType]}
      </NexusWorkspaceTableAction>
    ),
  }));

  return (
    <NexusWorkspacePage
      description={content.description}
      descriptionId="review-description"
      title={content.title}
      titleId="review-title"
    >
      {loadError !== null ? (
        <NexusWorkspaceNotice tone="danger">{loadError}</NexusWorkspaceNotice>
      ) : null}

      <NexusWorkspaceSearch
        label={content.searchLabel}
        name="search"
        onValueChange={setSearch}
        placeholder={content.searchPlaceholder}
        value={search}
      />
      <NexusWorkspaceSelect
        config={statusFilterConfig}
        isOpen={openSelectId === "status"}
        name="filter-status"
        onOpenChange={(open) => setOpenSelectId(open ? "status" : null)}
        onValueChange={setStatusFilter}
        value={statusFilter}
      />
      <NexusWorkspaceSelect
        config={candidateTypeFilterConfig}
        isOpen={openSelectId === "candidate-type"}
        name="filter-candidate-type"
        onOpenChange={(open) => setOpenSelectId(open ? "candidate-type" : null)}
        onValueChange={setCandidateTypeFilter}
        value={candidateTypeFilter}
      />

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
        isLoading={isLoading || isSearchUpdating}
        pagination={
          <NexusTablePagination
            currentPage={page}
            itemCount={total}
            navigationLabel="Navigasi halaman kandidat"
            nextPageLabel="Halaman berikutnya"
            onPageChange={setPage}
            onPageSizeChange={setPageSizeValue}
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

      {selectedId !== null ? (
        <NexusWorkspaceDrawer
          closeLabel={content.drawerCloseLabel}
          description={content.description}
          eyebrow={content.title}
          onClose={closeDetail}
          title={detail ? candidateTypeLabels[detail.candidateType] : "Memuat…"}
        >
          <div>
            {detailError !== null ? (
              <NexusWorkspaceNotice tone="danger">
                {detailError}
              </NexusWorkspaceNotice>
            ) : null}

            {detailLoading || detail === null ? (
              <p>{content.savingLabel}</p>
            ) : (
              <>
                {detail.duplicateOfPublicId ? (
                  <NexusWorkspaceNotice tone="danger">
                    {content.duplicateNoticeLabel}
                  </NexusWorkspaceNotice>
                ) : null}

                <section aria-labelledby="review-payload-title">
                  <h3 id="review-payload-title">{content.payloadTitle}</h3>
                  {Object.keys(detail.payload).length === 0 ? (
                    <p>{content.payloadEmptyLabel}</p>
                  ) : (
                    <dl>
                      {Object.entries(detail.payload).map(([key, value]) => (
                        <div key={key}>
                          <dt>{humanizeKey(key)}</dt>
                          <dd>{formatPayloadValue(value)}</dd>
                        </div>
                      ))}
                    </dl>
                  )}
                </section>

                {detail.status === "pending" ? (
                  <section aria-labelledby="review-decide-title">
                    <h3 id="review-decide-title">{content.decideLabel}</h3>
                    <NexusWorkspaceFormField
                      id="review-reason"
                      label={content.fieldReason}
                      name="reason"
                      onChange={(event) => setReason(event.target.value)}
                      type="textarea"
                      value={reason}
                      wide
                    />
                    <div>
                      {decisionOptions.map((option) => (
                        <NexusWorkspaceButton
                          disabled={decidingAs !== null}
                          key={option.value}
                          onClick={() =>
                            submitDecision(option.value as ReviewDecisionKind)
                          }
                          tone={
                            option.value === "approve"
                              ? "primary"
                              : option.value === "reject"
                                ? "danger"
                                : undefined
                          }
                          type="button"
                        >
                          {decidingAs === option.value
                            ? content.savingLabel
                            : option.label}
                        </NexusWorkspaceButton>
                      ))}
                    </div>
                  </section>
                ) : null}

                <section aria-labelledby="review-decisions-title">
                  <h3 id="review-decisions-title">
                    {content.decisionHistoryTitle}
                  </h3>
                  {detail.decisions.length === 0 ? (
                    <p>{content.decisionHistoryEmptyLabel}</p>
                  ) : (
                    <ul>
                      {detail.decisions.map((entry) => (
                        <li key={entry.publicId}>
                          <strong>{decisionLabels[entry.decision]}</strong>{" "}
                          <time dateTime={entry.decidedAt}>
                            {formatTimestamp(entry.decidedAt)}
                          </time>
                          {entry.reason ? <p>{entry.reason}</p> : null}
                        </li>
                      ))}
                    </ul>
                  )}
                </section>

                <section aria-labelledby="review-edits-title">
                  <h3 id="review-edits-title">{content.editHistoryTitle}</h3>
                  {detail.edits.length === 0 ? (
                    <p>{content.editHistoryEmptyLabel}</p>
                  ) : (
                    <ul>
                      {detail.edits.map((edit) => (
                        <li key={edit.publicId}>
                          <time dateTime={edit.editedAt}>
                            {formatTimestamp(edit.editedAt)}
                          </time>
                          <p>
                            {edit.changedFields.map(humanizeKey).join(", ")}
                          </p>
                        </li>
                      ))}
                    </ul>
                  )}
                </section>
              </>
            )}
          </div>
        </NexusWorkspaceDrawer>
      ) : null}
    </NexusWorkspacePage>
  );
}
