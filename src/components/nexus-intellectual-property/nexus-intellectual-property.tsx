"use client";

import dynamic from "next/dynamic";
import { useDeferredValue, useMemo, useState } from "react";
import styles from "@/components/nexus-intellectual-property/nexus-intellectual-property.module.css";
import {
  type IntellectualPropertyProposal,
  intellectualPropertyCreatorNames,
  intellectualPropertyKmLabel,
  type NexusIntellectualPropertyContent,
  normalizeProjectedIntellectualProperty,
  type OfficialIntellectualProperty,
} from "@/components/nexus-intellectual-property/nexus-intellectual-property-content";
import { NexusIntellectualPropertyIcon } from "@/components/nexus-intellectual-property/nexus-intellectual-property-icons";
import { NexusManualSubmissionLink } from "@/components/nexus-manual-submission/nexus-manual-submission-link";
import { projectOfficialIntellectualProperties } from "@/components/nexus-manual-submission/nexus-manual-submission-projection";
import { NexusMemberContextFilter } from "@/components/nexus-members/nexus-member-context";
import {
  type MetadataCompletionResolutions,
  metadataCompletionAvailabilityLabel,
} from "@/components/nexus-metadata-completion/nexus-metadata-completion-model";
import { projectOfficialMetadataRecords } from "@/components/nexus-review-session/nexus-official-record-projection";
import { createIntellectualPropertyCompletionReviewRecord } from "@/components/nexus-review-session/nexus-review-record-factory";
import { useNexusReviewSession } from "@/components/nexus-review-session/nexus-review-session";
import { NexusTablePagination } from "@/components/nexus-workspace-ui/nexus-table-pagination";
import {
  NexusWorkspaceSearch,
  NexusWorkspaceToolbar,
} from "@/components/nexus-workspace-ui/nexus-workspace-controls";
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

const NexusIntellectualPropertyDetail = dynamic(() =>
  import(
    "@/components/nexus-intellectual-property/nexus-intellectual-property-detail"
  ).then((module) => module.NexusIntellectualPropertyDetail),
);

type NexusIntellectualPropertyProps = {
  content: NexusIntellectualPropertyContent;
  initialMemberId?: string;
};

type FilterId = "completeness" | "indicator" | "protection" | "sort";
type FilterValues = Record<FilterId, string>;

const columns: readonly NexusWorkspaceRecordColumn[] = [
  { id: "primary", label: "Kekayaan intelektual", primary: true },
  { id: "signal", label: "Indikator KM" },
  { id: "registration", label: "Nomor pencatatan" },
  { id: "year", label: "Tahun" },
  { id: "document", label: "Dokumen" },
  { id: "status", label: "Kelengkapan" },
  { id: "action", label: "Aksi" },
];

const defaultFilterValues: FilterValues = {
  completeness: "all",
  indicator: "all",
  protection: "all",
  sort: "newest",
};

const unlinkedIndicatorValue = "unlinked";

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
  defaultValue: "newest",
  id: "sort",
  label: "Urutkan kekayaan intelektual",
  options: [
    { label: "Urutan: Tahun terbaru", value: "newest" },
    { label: "Urutan: Tahun terlama", value: "oldest" },
    { label: "Urutan: Judul A–Z", value: "title" },
  ],
};

const pageSizeConfig: NexusSelectConfig = {
  defaultValue: "10",
  id: "intellectual-property-page-size",
  label: "Jumlah data per halaman",
  options: [
    { label: "10 per halaman", value: "10" },
    { label: "20 per halaman", value: "20" },
    { label: "50 per halaman", value: "50" },
  ],
};

/** Dokumen internal bukan metadata yang hilang, jadi nadanya bukan peringatan. */
function documentLabel(record: OfficialIntellectualProperty) {
  const availableLabel =
    record.documentAccess === "internal"
      ? "Penyimpanan internal"
      : "Tautan publik";
  return metadataCompletionAvailabilityLabel(
    record.resolvedMetadata,
    "documentUrl",
    record.missingFields.includes("documentUrl"),
    availableLabel,
  );
}

function searchableText(record: OfficialIntellectualProperty) {
  return normalizeWorkspaceSearch(
    [
      record.title,
      record.publicId,
      intellectualPropertyCreatorNames(record),
      record.protection,
      record.registrationNumber ?? "",
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
  records: readonly OfficialIntellectualProperty[],
): NexusSelectConfig {
  const indicators = records
    .flatMap((record) => record.kmLinks)
    .map((link) => link.indicator)
    .filter(
      (indicator, index, list) =>
        list.findIndex((item) => item.id === indicator.id) === index,
    )
    .toSorted((first, second) => first.number - second.number);
  const hasUnlinked = records.some((record) => record.kmLinks.length === 0);
  const options: [NexusSelectOption, ...NexusSelectOption[]] = [
    { label: "Semua indikator KM", value: "all" },
    ...indicators.map((indicator) => ({
      label: `${indicator.id} · ${indicator.label}`,
      value: indicator.id,
    })),
    ...(hasUnlinked
      ? [{ label: "Belum dikaitkan", value: unlinkedIndicatorValue }]
      : []),
  ];

  return {
    defaultValue: "all",
    id: "indicator",
    label: "Filter indikator KM",
    options,
  };
}

function createProtectionConfig(
  records: readonly OfficialIntellectualProperty[],
): NexusSelectConfig {
  const protections = Array.from(
    new Set(records.map((record) => record.protection)),
  ).toSorted((first, second) => first.localeCompare(second, "id-ID"));
  const options: [NexusSelectOption, ...NexusSelectOption[]] = [
    { label: "Semua jenis perlindungan", value: "all" },
    ...protections.map((protection) => ({
      label: protection,
      value: protection,
    })),
  ];

  return {
    defaultValue: "all",
    id: "protection",
    label: "Filter jenis perlindungan",
    options,
  };
}

export function NexusIntellectualProperty({
  content,
  initialMemberId,
}: NexusIntellectualPropertyProps) {
  const reviewSession = useNexusReviewSession();
  const records = useMemo(
    () =>
      projectOfficialIntellectualProperties(
        projectOfficialMetadataRecords(
          content.records,
          reviewSession.officialMetadataByRecordId,
          normalizeProjectedIntellectualProperty,
        ),
        reviewSession.officialRecordDecisions,
      ),
    [
      content.records,
      reviewSession.officialMetadataByRecordId,
      reviewSession.officialRecordDecisions,
    ],
  );
  const [currentPage, setCurrentPage] = useState(1);
  const proposals = reviewSession.completionProposals;
  const [filterValues, setFilterValues] =
    useState<FilterValues>(defaultFilterValues);
  const [openFilterId, setOpenFilterId] = useState<string | null>(null);
  const [pageSizeValue, setPageSizeValue] = useState("10");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const deferredSearchQuery = useDeferredValue(searchQuery);
  const isSearchUpdating = searchQuery !== deferredSearchQuery;
  const contextRecords = useMemo(
    () =>
      initialMemberId
        ? records.filter((record) =>
            record.creators.some(
              (creator) => creator.memberId === initialMemberId,
            ),
          )
        : records,
    [initialMemberId, records],
  );

  const indicatorConfig = useMemo(
    () => createIndicatorConfig(contextRecords),
    [contextRecords],
  );
  const protectionConfig = useMemo(
    () => createProtectionConfig(contextRecords),
    [contextRecords],
  );

  const filtered = useMemo(() => {
    const needle = normalizeWorkspaceSearch(deferredSearchQuery);
    const matching = contextRecords.filter(
      (record) =>
        (filterValues.indicator === "all" ||
          (filterValues.indicator === unlinkedIndicatorValue
            ? record.kmLinks.length === 0
            : record.kmLinks.some(
                (link) => link.indicator.id === filterValues.indicator,
              ))) &&
        (filterValues.protection === "all" ||
          record.protection === filterValues.protection) &&
        (filterValues.completeness === "all" ||
          record.quality === filterValues.completeness) &&
        (needle.length === 0 || searchableText(record).includes(needle)),
    );

    return matching.toSorted((first, second) => {
      if (filterValues.sort === "title") {
        return first.title.localeCompare(second.title, "id-ID");
      }
      // Rekam tanpa tahun pengajuan selalu ditempatkan paling akhir.
      if (first.year === undefined || second.year === undefined) {
        return (
          (first.year === undefined ? 1 : 0) -
          (second.year === undefined ? 1 : 0)
        );
      }
      return filterValues.sort === "oldest"
        ? first.year - second.year
        : second.year - first.year;
    });
  }, [contextRecords, deferredSearchQuery, filterValues]);

  const registeredCount = contextRecords.filter(
    (record) => record.registrationNumber,
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
    `Periode evaluasi ${evaluationPeriods}`,
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
    const record = records.find((item) => item.id === recordId);
    if (!record) return;

    const proposal: IntellectualPropertyProposal =
      reviewSession.createCompletionProposal(
        "PLG-KI-2026",
        recordId,
        resolutions,
        note,
      );
    reviewSession.submitRecord(
      createIntellectualPropertyCompletionReviewRecord(record, proposal),
    );
  };

  const rows = visible.map((record) => {
    const open = () => setSelectedId(record.id);
    const qualityBadge = (
      <NexusWorkspaceTableBadge
        key={`${record.id}-quality`}
        tone={record.quality === "Lengkap" ? "success" : "danger"}
      >
        {record.quality}
      </NexusWorkspaceTableBadge>
    );
    const protectionBadge = (
      <NexusWorkspaceTableBadge key={`${record.id}-protection`} tone="info">
        {record.protection}
      </NexusWorkspaceTableBadge>
    );

    return {
      cells: {
        action: (
          <NexusWorkspaceTableAction
            label={`Lihat rincian kekayaan intelektual: ${record.title}`}
            onClick={open}
          >
            Rincian
          </NexusWorkspaceTableAction>
        ),
        document: (
          <NexusWorkspaceTableText>
            {documentLabel(record)}
          </NexusWorkspaceTableText>
        ),
        primary: (
          <NexusWorkspaceTablePrimary
            onClick={open}
            subtitle={`${intellectualPropertyCreatorNames(record)} · ${record.protection}`}
            title={record.title}
          />
        ),
        registration: (
          <NexusWorkspaceTableText>
            {record.registrationNumber ?? "Belum tercatat"}
          </NexusWorkspaceTableText>
        ),
        signal: (
          <NexusWorkspaceTableSignal
            primary={intellectualPropertyKmLabel(record)}
            secondary={record.protection}
            tone={record.kmLinks.length === 0 ? "neutral" : "info"}
          />
        ),
        status: qualityBadge,
        year: (
          <NexusWorkspaceTableText>
            {record.year ?? "Belum tercatat"}
          </NexusWorkspaceTableText>
        ),
      },
      id: record.id,
      mobile: (
        <NexusWorkspaceMobileCard
          action={
            <NexusWorkspaceMobileAction
              label={`Lihat rincian kekayaan intelektual: ${record.title}`}
              onClick={open}
            >
              Lihat rincian
            </NexusWorkspaceMobileAction>
          }
          eyebrow={
            <>
              {protectionBadge}
              {qualityBadge}
            </>
          }
          meta={
            <dl>
              <div>
                <dt>Indikator</dt>
                <dd>{intellectualPropertyKmLabel(record)}</dd>
              </div>
              <div>
                <dt>Nomor</dt>
                <dd>{record.registrationNumber ?? "Belum tercatat"}</dd>
              </div>
              <div>
                <dt>Tahun</dt>
                <dd>{record.year ?? "Belum tercatat"}</dd>
              </div>
              <div>
                <dt>Dokumen</dt>
                <dd>{documentLabel(record)}</dd>
              </div>
            </dl>
          }
          title={record.title}
        >
          <NexusWorkspaceMobileSubtitle>
            {intellectualPropertyCreatorNames(record)}
          </NexusWorkspaceMobileSubtitle>
        </NexusWorkspaceMobileCard>
      ),
    };
  });

  return (
    <NexusWorkspacePage
      actions={
        <NexusManualSubmissionLink
          domain="intellectual-property"
          label="Ajukan kekayaan intelektual"
        />
      }
      description={content.description}
      descriptionId="intellectual-property-description"
      meta={content.updatedAt}
      title={content.title}
      titleId="intellectual-property-title"
    >
      <NexusMemberContextFilter
        clearHref="/nexus/kekayaan-intelektual"
        memberId={initialMemberId}
      />
      <NexusWorkspaceMetrics
        metrics={[
          {
            icon: <NexusIntellectualPropertyIcon name="shield" />,
            id: "official-records",
            label: "Rekam Resmi",
            tone: "completed",
            unit: "data",
            value: contextRecords.length,
          },
          {
            icon: <NexusIntellectualPropertyIcon name="certificate" />,
            id: "registered",
            label: "Bernomor Registrasi",
            tone: "waiting",
            unit: "data",
            value: registeredCount,
          },
          {
            icon: <NexusIntellectualPropertyIcon name="alert" />,
            id: "needs-completion",
            label: "Perlu Dilengkapi",
            tone: "needs-fix",
            unit: "data",
            value: needsCompletionCount,
          },
        ]}
      />

      <NexusWorkspaceCatalog
        className={styles.catalog}
        labelledBy="official-intellectual-property-title"
      >
        <NexusWorkspaceToolbar>
          <NexusWorkspaceSearch
            label="Cari kekayaan intelektual resmi"
            name="intellectual-property-search"
            onValueChange={(value) => {
              setSearchQuery(value);
              setCurrentPage(1);
            }}
            placeholder="Cari judul, pencipta, nomor, atau indikator"
            value={searchQuery}
          />
          {[
            indicatorConfig,
            protectionConfig,
            completenessConfig,
            sortConfig,
          ].map((config) => (
            <NexusWorkspaceSelect
              config={config}
              isOpen={openFilterId === config.id}
              key={config.id}
              name={`intellectual-property-${config.id}`}
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
              value={filterValues[config.id as FilterId] ?? config.defaultValue}
            />
          ))}
        </NexusWorkspaceToolbar>

        <NexusWorkspaceResultMeta
          isUpdating={isSearchUpdating}
          onResetFilters={hasActiveFilters ? resetFilters : undefined}
          resultLabel={`${filtered.length} rekam ditemukan`}
          updatingLabel="Memperbarui hasil pencarian"
        />

        <NexusWorkspaceTableSection
          guidance={content.officialNote}
          summary={resultSummary}
          title="Daftar kekayaan intelektual resmi"
          titleId="official-intellectual-property-title"
        >
          <NexusWorkspaceRecordTable
            caption="Kekayaan intelektual resmi CoE BHT beserta nomor pencatatan dan keterkaitan indikator KM"
            columns={columns}
            empty={
              <NexusWorkspaceEmptyState
                description={
                  records.length === 0
                    ? "Rekam akan muncul setelah pengajuan disetujui melalui proses Tinjauan."
                    : "Ubah kata kunci atau filter untuk melihat rekam resmi lain."
                }
                onResetFilters={hasActiveFilters ? resetFilters : undefined}
                title={
                  records.length === 0
                    ? "Belum ada kekayaan intelektual resmi"
                    : "Tidak ada rekam yang cocok"
                }
              />
            }
            isLoading={isSearchUpdating}
            pagination={
              <NexusTablePagination
                currentPage={safePage}
                itemCount={filtered.length}
                navigationLabel="Navigasi halaman kekayaan intelektual"
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
        <NexusIntellectualPropertyDetail
          onClose={() => setSelectedId(null)}
          onSubmitProposal={submitProposal}
          proposal={proposals[selected.id]}
          record={selected}
        />
      ) : null}
    </NexusWorkspacePage>
  );
}
