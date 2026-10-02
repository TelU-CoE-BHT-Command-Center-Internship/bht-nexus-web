"use client";

import dynamic from "next/dynamic";
import { useDeferredValue, useMemo, useState } from "react";
import styles from "@/components/nexus-contract-proposals/nexus-contract-proposals.module.css";
import {
  contractProposalDisplayTitle,
  contractProposalEvidenceLabel,
  contractProposalIndicatorScope,
  contractProposalKmLabel,
  contractProposalPrimaryParty,
  type NexusContractProposalContent,
  type NexusContractProposalView,
} from "@/components/nexus-contract-proposals/nexus-contract-proposals-content";
import { NexusContractProposalIcon } from "@/components/nexus-contract-proposals/nexus-contract-proposals-icons";
import { useNexusContractProposalCatalog } from "@/components/nexus-contract-proposals/nexus-contract-proposals-server";
import { NexusManualSubmissionLink } from "@/components/nexus-manual-submission/nexus-manual-submission-link";
import { NexusMemberContextFilter } from "@/components/nexus-members/nexus-member-context";
import type { MetadataCompletionResolutions } from "@/components/nexus-metadata-completion/nexus-metadata-completion-model";
import { toCompletionProposals } from "@/components/nexus-metadata-completion/nexus-metadata-completion-proposals";
import { useNexusMemberName } from "@/components/nexus-publications/nexus-publication-server";
import { useOptionalNexusReviewSession } from "@/components/nexus-review-session/nexus-review-session";
import { officialKpiTableSignal } from "@/components/nexus-workspace-ui/nexus-official-kpi";
import { NexusTablePagination } from "@/components/nexus-workspace-ui/nexus-table-pagination";
import {
  NexusWorkspaceSearch,
  NexusWorkspaceToolbar,
} from "@/components/nexus-workspace-ui/nexus-workspace-controls";
import {
  NexusWorkspaceEmptyState,
  NexusWorkspaceLoadError,
  NexusWorkspaceNotice,
  NexusWorkspaceResultMeta,
} from "@/components/nexus-workspace-ui/nexus-workspace-elements";
import {
  formatPageUpdatedLabel,
  normalizeWorkspaceSearch,
} from "@/components/nexus-workspace-ui/nexus-workspace-format";
import {
  NexusWorkspaceMetrics,
  NexusWorkspacePage,
} from "@/components/nexus-workspace-ui/nexus-workspace-page";
import {
  NexusWorkspaceCatalog,
  NexusWorkspaceMobileAction,
  NexusWorkspaceMobileCard,
  NexusWorkspaceMobileSubtitle,
  type NexusWorkspaceRecordColumn,
  NexusWorkspaceRecordTable,
  NexusWorkspaceTableAction,
  NexusWorkspaceTableBadge,
  NexusWorkspaceTablePrimary,
  NexusWorkspaceTableSignal,
  NexusWorkspaceTableText,
} from "@/components/nexus-workspace-ui/nexus-workspace-records";
import {
  type NexusSelectConfig,
  type NexusSelectOption,
  NexusWorkspaceSelect,
} from "@/components/nexus-workspace-ui/nexus-workspace-select";
import { NexusWorkspaceTableSection } from "@/components/nexus-workspace-ui/nexus-workspace-table";
import { apiErrorMessage } from "@/lib/api-client";
import { requestHouseRecordCompletion } from "@/lib/api-house-records";

const NexusContractProposalDetail = dynamic(() =>
  import(
    "@/components/nexus-contract-proposals/nexus-contract-proposals-detail"
  ).then((module) => module.NexusContractProposalDetail),
);

type NexusContractProposalsProps = {
  canReadMembers: boolean;
  content: NexusContractProposalContent;
  initialMemberId?: string;
};

type FilterId = "completeness" | "group" | "indicator" | "sort";
type FilterValues = Record<FilterId, string>;

const columns: readonly NexusWorkspaceRecordColumn[] = [
  { id: "primary", label: "Kontrak / proposal", primary: true },
  { id: "signal", label: "Indikator KM" },
  { id: "kind", label: "Jenis" },
  { id: "scheme", label: "Skema / program" },
  { id: "party", label: "Pihak utama" },
  { id: "evidence", label: "Bukti" },
  { id: "status", label: "Kelengkapan" },
  { id: "action", label: "Aksi" },
];

const defaultFilterValues: FilterValues = {
  completeness: "all",
  group: "all",
  indicator: "all",
  sort: "kind",
};

const kindOrder: Record<string, number> = {
  "Kontrak Riset Nasional": 0,
  "Kontrak Riset Internasional": 1,
  "Kontrak Bisnis Komersialisasi": 2,
  "Proposal Riset Nasional": 3,
  "Proposal Riset Internasional": 4,
  "Proposal Non-Riset": 5,
};

const groupConfig: NexusSelectConfig = {
  defaultValue: "all",
  id: "group",
  label: "Filter kelompok rekam",
  options: [
    { label: "Semua kelompok", value: "all" },
    { label: "Kontrak", value: "Kontrak" },
    { label: "Proposal", value: "Proposal" },
  ],
};

const completenessConfig: NexusSelectConfig = {
  defaultValue: "all",
  id: "completeness",
  label: "Filter kelengkapan metadata",
  options: [
    { label: "Semua kelengkapan", value: "all" },
    { label: "Lengkap", tone: "completed", value: "Lengkap" },
    { label: "Perlu dilengkapi", tone: "needs-fix", value: "Perlu dilengkapi" },
  ],
};

const sortConfig: NexusSelectConfig = {
  defaultValue: "kind",
  id: "sort",
  label: "Urutkan kontrak dan proposal",
  options: [
    { label: "Urutan: Jenis", value: "kind" },
    { label: "Urutan: Judul A–Z", value: "title" },
    { label: "Urutan: Pihak A–Z", value: "party" },
  ],
};

const pageSizeConfig: NexusSelectConfig = {
  defaultValue: "10",
  id: "contract-proposal-page-size",
  label: "Jumlah data per halaman",
  options: [
    { label: "10 per halaman", value: "10" },
    { label: "20 per halaman", value: "20" },
    { label: "50 per halaman", value: "50" },
  ],
};

function searchableText(record: NexusContractProposalView) {
  return normalizeWorkspaceSearch(
    [
      record.title,
      record.publicId,
      record.applicant,
      record.kind,
      record.group,
      record.scheme ?? "",
      record.partner ?? "",
      record.funder ?? "",
      record.kmLinks.flatMap((link) => [
        link.indicator.id,
        link.indicator.label,
      ]),
    ]
      .flat()
      .join(" "),
  );
}

function createIndicatorConfig(
  records: readonly NexusContractProposalView[],
): NexusSelectConfig {
  const indicators = records
    .flatMap((record) => record.kmLinks)
    .map((link) => link.indicator)
    .filter(
      (indicator, index, list) =>
        list.findIndex((item) => item.id === indicator.id) === index,
    )
    .toSorted((first, second) => first.number - second.number);
  const options: [NexusSelectOption, ...NexusSelectOption[]] = [
    { label: "Semua indikator KM", value: "all" },
    ...indicators.map((indicator) => ({
      label: `${indicator.id} · ${indicator.label}`,
      value: indicator.id,
    })),
  ];

  return {
    defaultValue: "all",
    id: "indicator",
    label: "Filter indikator KM",
    options,
  };
}

export function NexusContractProposals({
  canReadMembers,
  content,
  initialMemberId,
}: NexusContractProposalsProps) {
  const catalog = useNexusContractProposalCatalog(initialMemberId);
  const memberName = useNexusMemberName(initialMemberId, canReadMembers);
  const reviewSession = useOptionalNexusReviewSession();
  const [completionError, setCompletionError] = useState("");
  const records = catalog.records;
  const isCatalogLoading = catalog.state === "loading";
  const [currentPage, setCurrentPage] = useState(1);
  const [filterValues, setFilterValues] =
    useState<FilterValues>(defaultFilterValues);
  const [openFilterId, setOpenFilterId] = useState<string | null>(null);
  const [pageSizeValue, setPageSizeValue] = useState("10");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const deferredSearchQuery = useDeferredValue(searchQuery);
  const isSearchUpdating = searchQuery !== deferredSearchQuery;
  /* Filter anggota sudah diterapkan server lewat `memberPublicId`. */
  const contextRecords = records;

  const indicatorConfig = useMemo(
    () => createIndicatorConfig(contextRecords),
    [contextRecords],
  );

  const filtered = useMemo(() => {
    const needle = normalizeWorkspaceSearch(deferredSearchQuery);
    const matching = contextRecords.filter(
      (record) =>
        (filterValues.indicator === "all" ||
          record.kmLinks.some(
            (link) => link.indicator.id === filterValues.indicator,
          )) &&
        (filterValues.group === "all" || record.group === filterValues.group) &&
        (filterValues.completeness === "all" ||
          record.quality === filterValues.completeness) &&
        (needle.length === 0 || searchableText(record).includes(needle)),
    );

    return matching.toSorted((first, second) => {
      if (filterValues.sort === "party") {
        return contractProposalPrimaryParty(first).localeCompare(
          contractProposalPrimaryParty(second),
          "id-ID",
        );
      }
      if (filterValues.sort === "title") {
        return contractProposalDisplayTitle(first).localeCompare(
          contractProposalDisplayTitle(second),
          "id-ID",
        );
      }
      const byKind =
        (kindOrder[first.kind] ?? 0) - (kindOrder[second.kind] ?? 0);
      return byKind !== 0
        ? byKind
        : contractProposalDisplayTitle(first).localeCompare(
            contractProposalDisplayTitle(second),
            "id-ID",
          );
    });
  }, [contextRecords, deferredSearchQuery, filterValues]);

  const coveredIndicatorCount = contractProposalIndicatorScope.filter(
    (indicator) =>
      contextRecords.some((record) =>
        record.kmLinks.some((link) => link.indicator.id === indicator.id),
      ),
  ).length;
  const needsCompletionCount = contextRecords.filter(
    (record) => record.quality === "Perlu dilengkapi",
  ).length;
  const pageSize = Number(pageSizeValue);
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(Math.max(currentPage, 1), totalPages);
  const visible = filtered.slice(
    (safePage - 1) * pageSize,
    safePage * pageSize,
  );
  const selected = contextRecords.find((record) => record.id === selectedId);
  const activeFilterCount = Object.entries(defaultFilterValues).filter(
    ([filterId, defaultValue]) =>
      filterValues[filterId as FilterId] !== defaultValue,
  ).length;
  const hasActiveFilters = activeFilterCount > 0 || searchQuery.length > 0;
  const evaluationPeriods = Array.from(
    new Set(
      (contextRecords.length > 0 ? contextRecords : records).map(
        (record) => record.evaluationPeriod,
      ),
    ),
  )
    .toSorted()
    .join(", ");
  const resultSummary = [
    ...(evaluationPeriods ? [`Periode evaluasi ${evaluationPeriods}`] : []),
    `${filtered.length} dari ${contextRecords.length} rekam sesuai filter`,
    activeFilterCount > 0
      ? `${activeFilterCount} filter aktif`
      : "tanpa filter tambahan",
  ].join(" · ");

  const resetFilters = () => {
    setFilterValues(defaultFilterValues);
    setSearchQuery("");
    setCurrentPage(1);
  };

  const submitProposal = (
    recordId: string,
    resolutions: MetadataCompletionResolutions,
    note: string,
  ) => {
    if (!reviewSession) return;
    setCompletionError("");
    requestHouseRecordCompletion("contracts-proposals", recordId, {
      note,
      proposals: toCompletionProposals(resolutions),
    })
      .then(() => {
        reviewSession.createCompletionProposal(
          "PLG-KPR-2026",
          recordId,
          resolutions,
          note,
        );
      })
      .catch((error: unknown) => {
        setCompletionError(
          apiErrorMessage(error, "Usulan pelengkapan belum dapat dikirim."),
        );
      });
  };

  const rows = visible.map((record) => {
    const open = () => setSelectedId(record.id);
    const displayTitle = contractProposalDisplayTitle(record);
    const qualityBadge = (
      <NexusWorkspaceTableBadge
        key={`${record.id}-quality`}
        tone={record.quality === "Lengkap" ? "success" : "danger"}
      >
        {record.quality}
      </NexusWorkspaceTableBadge>
    );
    const groupBadge = (
      <NexusWorkspaceTableBadge
        key={`${record.id}-group`}
        tone={record.group === "Kontrak" ? "info" : "waiting"}
      >
        {record.group}
      </NexusWorkspaceTableBadge>
    );

    return {
      cells: {
        action: (
          <NexusWorkspaceTableAction
            label={`Lihat rincian kontrak atau proposal: ${displayTitle}`}
            onClick={open}
          >
            Rincian
          </NexusWorkspaceTableAction>
        ),
        evidence: (
          <NexusWorkspaceTableText>
            {contractProposalEvidenceLabel(record)}
          </NexusWorkspaceTableText>
        ),
        kind: (
          <span className={styles.stackedCell}>
            <strong>{record.kind}</strong>
            <small>{record.recordStatus}</small>
          </span>
        ),
        party: (
          <NexusWorkspaceTableText>
            {contractProposalPrimaryParty(record)}
          </NexusWorkspaceTableText>
        ),
        primary: (
          <NexusWorkspaceTablePrimary
            onClick={open}
            subtitle={
              record.applicant && record.partner
                ? `${record.applicant} · ${record.partner}`
                : contractProposalPrimaryParty(record)
            }
            title={displayTitle}
          />
        ),
        scheme: (
          <NexusWorkspaceTableText>
            {record.kind === "Kontrak Bisnis Komersialisasi"
              ? "Tidak berlaku"
              : (record.scheme ?? "Belum tercatat")}
          </NexusWorkspaceTableText>
        ),
        signal: (
          <NexusWorkspaceTableSignal
            {...officialKpiTableSignal(
              record.kmLinks,
              record.kpiResolutionStatus,
            )}
            secondary={record.group}
          />
        ),
        status: qualityBadge,
      },
      id: record.id,
      mobile: (
        <NexusWorkspaceMobileCard
          action={
            <NexusWorkspaceMobileAction
              label={`Lihat rincian kontrak atau proposal: ${displayTitle}`}
              onClick={open}
            >
              Lihat rincian
            </NexusWorkspaceMobileAction>
          }
          eyebrow={
            <>
              {groupBadge}
              {qualityBadge}
            </>
          }
          meta={
            <dl>
              <div>
                <dt>Indikator</dt>
                <dd>{contractProposalKmLabel(record)}</dd>
              </div>
              <div>
                <dt>Jenis</dt>
                <dd>{record.kind}</dd>
              </div>
              <div>
                <dt>Pihak utama</dt>
                <dd>{contractProposalPrimaryParty(record)}</dd>
              </div>
              <div>
                <dt>Bukti</dt>
                <dd>{contractProposalEvidenceLabel(record)}</dd>
              </div>
            </dl>
          }
          title={displayTitle}
        >
          <NexusWorkspaceMobileSubtitle>
            {record.kind === "Kontrak Bisnis Komersialisasi"
              ? "Masa kontrak diperiksa pada rincian"
              : (record.scheme ?? "Skema belum tercatat")}
          </NexusWorkspaceMobileSubtitle>
        </NexusWorkspaceMobileCard>
      ),
    };
  });

  return (
    <NexusWorkspacePage
      clusterScope
      actions={
        <NexusManualSubmissionLink
          domain="contract"
          label="Ajukan kontrak / proposal"
        />
      }
      description={content.description}
      descriptionId="contract-proposals-description"
      meta={
        catalog.loadedAt ? formatPageUpdatedLabel(catalog.loadedAt) : undefined
      }
      title={content.title}
      titleId="contract-proposals-title"
    >
      {completionError ? (
        <NexusWorkspaceNotice tone="danger">
          {completionError}
        </NexusWorkspaceNotice>
      ) : null}
      <NexusMemberContextFilter
        clearHref="/nexus/kontrak-proposal"
        memberId={initialMemberId}
        memberName={memberName}
      />
      <NexusWorkspaceMetrics
        metrics={[
          {
            icon: <NexusContractProposalIcon name="contract" />,
            id: "official-records",
            label: "Rekam Resmi",
            tone: "completed",
            unit: "data",
            value: isCatalogLoading ? null : contextRecords.length,
          },
          {
            icon: <NexusContractProposalIcon name="indicator" />,
            id: "covered-indicators",
            label: "Indikator Terisi",
            tone: "waiting",
            unit: `dari ${contractProposalIndicatorScope.length} indikator`,
            value: isCatalogLoading ? null : coveredIndicatorCount,
          },
          {
            icon: <NexusContractProposalIcon name="alert" />,
            id: "needs-completion",
            label: "Perlu Dilengkapi",
            tone: "needs-fix",
            unit: "data",
            value: isCatalogLoading ? null : needsCompletionCount,
          },
        ]}
        unavailable={catalog.state === "error"}
      />

      <NexusWorkspaceCatalog
        className={styles.catalog}
        labelledBy="official-contract-proposals-title"
      >
        <NexusWorkspaceToolbar>
          <NexusWorkspaceSearch
            label="Cari kontrak dan proposal resmi"
            name="contract-proposals-search"
            onValueChange={(value) => {
              setSearchQuery(value);
              setCurrentPage(1);
            }}
            placeholder="Cari judul, pihak, mitra, skema, atau indikator"
            value={searchQuery}
          />
          {[indicatorConfig, groupConfig, completenessConfig, sortConfig].map(
            (config) => (
              <NexusWorkspaceSelect
                config={config}
                isOpen={openFilterId === config.id}
                key={config.id}
                name={`contract-proposals-${config.id}`}
                onOpenChange={(isOpen) =>
                  setOpenFilterId(isOpen ? config.id : null)
                }
                onValueChange={(value) => {
                  setFilterValues((current) => ({
                    ...current,
                    [config.id as FilterId]: value,
                  }));
                  setCurrentPage(1);
                }}
                placement="top-on-narrow"
                value={
                  filterValues[config.id as FilterId] ?? config.defaultValue
                }
              />
            ),
          )}
        </NexusWorkspaceToolbar>

        {catalog.state === "error" ? null : (
          <NexusWorkspaceResultMeta
            isUpdating={isSearchUpdating}
            onResetFilters={hasActiveFilters ? resetFilters : undefined}
            resultLabel={`${filtered.length} rekam ditemukan`}
            updatingLabel="Memperbarui hasil pencarian"
          />
        )}

        <NexusWorkspaceTableSection
          guidance={content.officialNote}
          summary={catalog.state === "error" ? undefined : resultSummary}
          title="Daftar kontrak dan proposal resmi"
          titleId="official-contract-proposals-title"
        >
          <NexusWorkspaceRecordTable
            caption="Kontrak dan proposal resmi CoE BHT beserta skema, pihak terkait, bukti, dan indikator KM"
            columns={columns}
            empty={
              <NexusWorkspaceEmptyState
                description={
                  records.length > 0
                    ? "Ubah kata kunci atau filter untuk melihat rekam resmi lain."
                    : initialMemberId
                      ? "Anggota ini belum tercatat pada kontrak atau proposal resmi."
                      : "Rekam akan muncul setelah kontrak atau proposal disetujui melalui proses Tinjauan."
                }
                onResetFilters={hasActiveFilters ? resetFilters : undefined}
                title={
                  records.length > 0
                    ? "Tidak ada rekam yang cocok"
                    : initialMemberId
                      ? "Belum ada kontrak atau proposal untuk anggota ini"
                      : "Belum ada kontrak atau proposal resmi"
                }
              />
            }
            error={
              catalog.state === "error" ? (
                <NexusWorkspaceLoadError
                  description={
                    catalog.errorMessage ??
                    "Kontrak dan proposal resmi belum dapat dimuat."
                  }
                  onRetry={catalog.retry}
                  title="Kontrak dan proposal resmi belum dapat dimuat"
                />
              ) : undefined
            }
            isLoading={isSearchUpdating || isCatalogLoading}
            pagination={
              <NexusTablePagination
                currentPage={safePage}
                itemCount={filtered.length}
                navigationLabel="Navigasi halaman kontrak dan proposal"
                nextPageLabel="Halaman berikutnya"
                onPageChange={setCurrentPage}
                onPageSizeChange={(value) => {
                  setPageSizeValue(value);
                  setCurrentPage(1);
                }}
                pageLabel="Halaman"
                pageSizeConfig={pageSizeConfig}
                pageSizeValue={pageSizeValue}
                previousPageLabel="Halaman sebelumnya"
                rangePrefix="Menampilkan"
                totalUnit="data"
              />
            }
            rows={rows}
          />
        </NexusWorkspaceTableSection>
      </NexusWorkspaceCatalog>

      {selected ? (
        <NexusContractProposalDetail
          onClose={() => setSelectedId(null)}
          onSubmitProposal={reviewSession ? submitProposal : undefined}
          proposal={reviewSession?.completionProposals[selected.id]}
          record={selected}
        />
      ) : null}
    </NexusWorkspacePage>
  );
}
