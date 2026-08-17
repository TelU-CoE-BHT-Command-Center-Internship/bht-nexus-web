"use client";

import dynamic from "next/dynamic";
import { useDeferredValue, useMemo, useState } from "react";
import styles from "@/components/nexus-contract-proposals/nexus-contract-proposals.module.css";
import {
  type ContractProposalProposal,
  contractProposalDisplayTitle,
  contractProposalEvidenceLabel,
  contractProposalIndicatorScope,
  contractProposalKmLabel,
  type NexusContractProposalContent,
  type OfficialContractProposalRecord,
} from "@/components/nexus-contract-proposals/nexus-contract-proposals-content";
import { NexusContractProposalIcon } from "@/components/nexus-contract-proposals/nexus-contract-proposals-icons";
import type { MetadataCompletionResolutions } from "@/components/nexus-metadata-completion/nexus-metadata-completion-model";
import { createContractProposalCompletionReviewRecord } from "@/components/nexus-review-session/nexus-review-record-factory";
import { useNexusReviewSession } from "@/components/nexus-review-session/nexus-review-session";
import { NexusTablePagination } from "@/components/nexus-workspace-ui/nexus-table-pagination";
import { NexusWorkspaceSearch } from "@/components/nexus-workspace-ui/nexus-workspace-controls";
import {
  NexusWorkspaceEmptyState,
  NexusWorkspaceResultMeta,
} from "@/components/nexus-workspace-ui/nexus-workspace-elements";
import { normalizeWorkspaceSearch } from "@/components/nexus-workspace-ui/nexus-workspace-format";
import {
  NexusWorkspaceMetrics,
  NexusWorkspacePage,
} from "@/components/nexus-workspace-ui/nexus-workspace-page";
import {
  NexusWorkspaceMobileAction,
  NexusWorkspaceMobileCard,
  type NexusWorkspaceRecordColumn,
  NexusWorkspaceRecordTable,
  NexusWorkspaceTableAction,
  NexusWorkspaceTableBadge,
  NexusWorkspaceTablePrimary,
  NexusWorkspaceTableSignal,
} from "@/components/nexus-workspace-ui/nexus-workspace-records";
import {
  type NexusSelectConfig,
  type NexusSelectOption,
  NexusWorkspaceSelect,
} from "@/components/nexus-workspace-ui/nexus-workspace-select";
import { NexusWorkspaceTableSection } from "@/components/nexus-workspace-ui/nexus-workspace-table";

const NexusContractProposalDetail = dynamic(() =>
  import(
    "@/components/nexus-contract-proposals/nexus-contract-proposals-detail"
  ).then((module) => module.NexusContractProposalDetail),
);

type NexusContractProposalsProps = {
  content: NexusContractProposalContent;
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

function searchableText(record: OfficialContractProposalRecord) {
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
  records: readonly OfficialContractProposalRecord[],
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
  content,
}: NexusContractProposalsProps) {
  const reviewSession = useNexusReviewSession();
  const [currentPage, setCurrentPage] = useState(1);
  const [filterValues, setFilterValues] =
    useState<FilterValues>(defaultFilterValues);
  const [openFilterId, setOpenFilterId] = useState<string | null>(null);
  const [pageSizeValue, setPageSizeValue] = useState("10");
  const [proposals, setProposals] = useState<
    Record<string, ContractProposalProposal>
  >({});
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const deferredSearchQuery = useDeferredValue(searchQuery);
  const isSearchUpdating = searchQuery !== deferredSearchQuery;

  const indicatorConfig = useMemo(
    () => createIndicatorConfig(content.records),
    [content.records],
  );

  const filtered = useMemo(() => {
    const needle = normalizeWorkspaceSearch(deferredSearchQuery);
    const matching = content.records.filter(
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
        return first.applicant.localeCompare(second.applicant, "id-ID");
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
  }, [content.records, deferredSearchQuery, filterValues]);

  const coveredIndicatorCount = contractProposalIndicatorScope.filter(
    (indicator) =>
      content.records.some((record) =>
        record.kmLinks.some((link) => link.indicator.id === indicator.id),
      ),
  ).length;
  const needsCompletionCount = content.records.filter(
    (record) => record.quality === "Perlu dilengkapi",
  ).length;
  const pageSize = Number(pageSizeValue);
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(Math.max(currentPage, 1), totalPages);
  const visible = filtered.slice(
    (safePage - 1) * pageSize,
    safePage * pageSize,
  );
  const selected = content.records.find((record) => record.id === selectedId);
  const activeFilterCount = Object.entries(defaultFilterValues).filter(
    ([filterId, defaultValue]) =>
      filterValues[filterId as FilterId] !== defaultValue,
  ).length;
  const hasActiveFilters = activeFilterCount > 0 || searchQuery.length > 0;
  const evaluationPeriods = Array.from(
    new Set(content.records.map((record) => record.evaluationPeriod)),
  )
    .toSorted()
    .join(", ");
  const resultSummary = [
    `Periode evaluasi ${evaluationPeriods}`,
    `${filtered.length} dari ${content.records.length} rekam sesuai filter`,
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
    const record = content.records.find((item) => item.id === recordId);
    if (!record) return;

    const proposal: ContractProposalProposal = {
      id: `PLG-KPR-2026-${String(Object.keys(proposals).length + 1).padStart(5, "0")}`,
      note,
      recordId,
      resolutions,
      status: "waiting-review",
      submittedAt: "Baru saja",
      submittedBy: reviewSession.actor.name,
    };

    setProposals((current) => ({ ...current, [recordId]: proposal }));
    reviewSession.submitRecord(
      createContractProposalCompletionReviewRecord(
        record,
        proposal,
        reviewSession.actor,
      ),
    );
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
          <span className={styles.plainCell}>
            {contractProposalEvidenceLabel(record)}
          </span>
        ),
        kind: (
          <span className={styles.stackedCell}>
            <strong>{record.kind}</strong>
            <small>{record.recordStatus}</small>
          </span>
        ),
        party: <span className={styles.plainCell}>{record.applicant}</span>,
        primary: (
          <NexusWorkspaceTablePrimary
            onClick={open}
            subtitle={
              record.partner
                ? `${record.applicant} · ${record.partner}`
                : record.applicant
            }
            title={displayTitle}
          />
        ),
        scheme: (
          <span className={styles.plainCell}>
            {record.kind === "Kontrak Bisnis Komersialisasi"
              ? "Tidak berlaku"
              : (record.scheme ?? "Belum tercatat")}
          </span>
        ),
        signal: (
          <NexusWorkspaceTableSignal
            primary={contractProposalKmLabel(record)}
            secondary={record.group}
            tone="info"
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
                <dd>{record.applicant}</dd>
              </div>
              <div>
                <dt>Bukti</dt>
                <dd>{contractProposalEvidenceLabel(record)}</dd>
              </div>
            </dl>
          }
          title={displayTitle}
        >
          <p className={styles.mobileSubtitle}>
            {record.kind === "Kontrak Bisnis Komersialisasi"
              ? "Masa kontrak diperiksa pada rincian"
              : (record.scheme ?? "Skema belum tercatat")}
          </p>
        </NexusWorkspaceMobileCard>
      ),
    };
  });

  return (
    <NexusWorkspacePage
      description={content.description}
      descriptionId="contract-proposals-description"
      meta={content.updatedAt}
      title={content.title}
      titleId="contract-proposals-title"
    >
      <NexusWorkspaceMetrics
        metrics={[
          {
            icon: <NexusContractProposalIcon name="contract" />,
            id: "official-records",
            label: "Rekam Resmi",
            tone: "completed",
            unit: "data",
            value: content.records.length,
          },
          {
            icon: <NexusContractProposalIcon name="indicator" />,
            id: "covered-indicators",
            label: "Indikator Terisi",
            tone: "waiting",
            unit: `dari ${contractProposalIndicatorScope.length} indikator`,
            value: coveredIndicatorCount,
          },
          {
            icon: <NexusContractProposalIcon name="alert" />,
            id: "needs-completion",
            label: "Perlu Dilengkapi",
            tone: "needs-fix",
            unit: "data",
            value: needsCompletionCount,
          },
        ]}
      />

      <section
        aria-labelledby="official-contract-proposals-title"
        className={styles.catalog}
      >
        <div className={styles.toolbar}>
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
        </div>

        <NexusWorkspaceResultMeta
          isUpdating={isSearchUpdating}
          onResetFilters={hasActiveFilters ? resetFilters : undefined}
          resultLabel={`${filtered.length} rekam ditemukan`}
          updatingLabel="Memperbarui hasil pencarian"
        />

        <NexusWorkspaceTableSection
          guidance={content.officialNote}
          summary={resultSummary}
          title="Daftar kontrak dan proposal resmi"
          titleId="official-contract-proposals-title"
        >
          <NexusWorkspaceRecordTable
            caption="Kontrak dan proposal resmi CoE BHT beserta skema, pihak terkait, bukti, dan indikator KM"
            columns={columns}
            empty={
              <NexusWorkspaceEmptyState
                description={
                  content.records.length === 0
                    ? "Rekam akan muncul setelah kontrak atau proposal disetujui melalui proses Tinjauan."
                    : "Ubah kata kunci atau filter untuk melihat rekam resmi lain."
                }
                onResetFilters={hasActiveFilters ? resetFilters : undefined}
                title={
                  content.records.length === 0
                    ? "Belum ada kontrak atau proposal resmi"
                    : "Tidak ada rekam yang cocok"
                }
              />
            }
            isLoading={isSearchUpdating}
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
      </section>

      {selected ? (
        <NexusContractProposalDetail
          onClose={() => setSelectedId(null)}
          onSubmitProposal={submitProposal}
          proposal={proposals[selected.id]}
          record={selected}
        />
      ) : null}
    </NexusWorkspacePage>
  );
}
