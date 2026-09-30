"use client";

import dynamic from "next/dynamic";
import { useDeferredValue, useMemo, useState } from "react";
import styles from "@/components/nexus-activities/nexus-activities.module.css";
import {
  activityContextLabel,
  activityDisplayTitle,
  activityEvidenceLabel,
  activityIndicatorScope,
  activityKmLabel,
  type NexusActivitiesContent,
  type NexusActivityView,
} from "@/components/nexus-activities/nexus-activities-content";
import { NexusActivitiesIcon } from "@/components/nexus-activities/nexus-activities-icons";
import {
  useNexusActivityCatalog,
  useNexusActivityDetail,
} from "@/components/nexus-activities/nexus-activity-server";
import { NexusManualSubmissionLink } from "@/components/nexus-manual-submission/nexus-manual-submission-link";
import { NexusMemberContextFilter } from "@/components/nexus-members/nexus-member-context";
import { useNexusMemberName } from "@/components/nexus-publications/nexus-publication-server";
import { officialKpiTableSignal } from "@/components/nexus-workspace-ui/nexus-official-kpi";
import { NexusTablePagination } from "@/components/nexus-workspace-ui/nexus-table-pagination";
import {
  NexusWorkspaceSearch,
  NexusWorkspaceToolbar,
} from "@/components/nexus-workspace-ui/nexus-workspace-controls";
import {
  NexusWorkspaceButton,
  NexusWorkspaceEmptyState,
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
import { NexusWorkspaceState } from "@/components/nexus-workspace-ui/nexus-workspace-state";
import { NexusWorkspaceTableSection } from "@/components/nexus-workspace-ui/nexus-workspace-table";

const NexusActivityDetail = dynamic(() =>
  import("@/components/nexus-activities/nexus-activity-detail").then(
    (module) => module.NexusActivityDetail,
  ),
);

type NexusActivitiesProps = {
  /** Antrean Tinjauan dapat dibuka oleh akun ini. */
  canOpenReviews: boolean;
  /** Direktori anggota dapat dibaca, sehingga kartu filter menampilkan nama. */
  canReadMembers: boolean;
  content: Pick<
    NexusActivitiesContent,
    "description" | "officialNote" | "title"
  >;
  initialMemberId?: string;
};

type FilterId = "completeness" | "group" | "indicator" | "sort";
type FilterValues = Record<FilterId, string>;

const unlinkedIndicatorValue = "unlinked";

const columns: readonly NexusWorkspaceRecordColumn[] = [
  { id: "primary", label: "Kegiatan / program", primary: true },
  { id: "signal", label: "Indikator KM" },
  { id: "kind", label: "Jenis" },
  { id: "party", label: "Pihak utama" },
  { id: "context", label: "Konteks" },
  { id: "evidence", label: "Bukti" },
  { id: "status", label: "Kelengkapan" },
  { id: "action", label: "Aksi" },
];

const defaultFilterValues: FilterValues = {
  completeness: "all",
  group: "all",
  indicator: "all",
  sort: "indicator",
};

const groupConfig: NexusSelectConfig = {
  defaultValue: "all",
  id: "group",
  label: "Filter kelompok kegiatan",
  options: [
    { label: "Semua kelompok", value: "all" },
    { label: "Bisnis", value: "Bisnis" },
    { label: "Pengabdian masyarakat", value: "Pengabdian masyarakat" },
    { label: "Riset & jejaring", value: "Riset & jejaring" },
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
  defaultValue: "indicator",
  id: "sort",
  label: "Urutkan kegiatan dan pengabdian",
  options: [
    { label: "Urutan: Indikator", value: "indicator" },
    { label: "Urutan: Judul A–Z", value: "title" },
    { label: "Urutan: Pihak A–Z", value: "party" },
  ],
};

const pageSizeConfig: NexusSelectConfig = {
  defaultValue: "10",
  id: "activities-page-size",
  label: "Jumlah data per halaman",
  options: [
    { label: "10 per halaman", value: "10" },
    { label: "20 per halaman", value: "20" },
    { label: "50 per halaman", value: "50" },
  ],
};

function searchableText(record: NexusActivityView) {
  return normalizeWorkspaceSearch(
    [
      record.title,
      record.publicId,
      record.primaryParty,
      record.kind,
      record.group,
      record.organization ?? "",
      record.role ?? "",
      record.scheme ?? "",
      record.targetGroup ?? "",
      record.location ?? "",
      record.issn ?? "",
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
  records: readonly NexusActivityView[],
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
    ...(records.some((record) => record.kmLinks.length === 0)
      ? [
          {
            label: "Belum dikaitkan dengan indikator",
            value: unlinkedIndicatorValue,
          },
        ]
      : []),
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

export function NexusActivities({
  canOpenReviews,
  canReadMembers,
  content,
  initialMemberId,
}: NexusActivitiesProps) {
  const catalog = useNexusActivityCatalog();
  const records = catalog.records;
  const isCatalogLoading = catalog.state === "loading";
  const memberName = useNexusMemberName(initialMemberId, canReadMembers);
  const [currentPage, setCurrentPage] = useState(1);
  const [filterValues, setFilterValues] =
    useState<FilterValues>(defaultFilterValues);
  const [openFilterId, setOpenFilterId] = useState<string | null>(null);
  const [pageSizeValue, setPageSizeValue] = useState("10");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const deferredSearchQuery = useDeferredValue(searchQuery);
  const isSearchUpdating = searchQuery !== deferredSearchQuery;
  /* Daftar kegiatan server belum dapat disaring per anggota; kartu filter
     menjelaskannya dan daftar tetap memuat seluruh rekam resmi. */
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
          (filterValues.indicator === unlinkedIndicatorValue
            ? record.kmLinks.length === 0
            : record.kmLinks.some(
                (link) => link.indicator.id === filterValues.indicator,
              ))) &&
        (filterValues.group === "all" || record.group === filterValues.group) &&
        (filterValues.completeness === "all" ||
          record.quality === filterValues.completeness) &&
        (needle.length === 0 || searchableText(record).includes(needle)),
    );

    return matching.toSorted((first, second) => {
      if (filterValues.sort === "party") {
        return first.primaryParty.localeCompare(second.primaryParty, "id-ID");
      }
      if (filterValues.sort === "title") {
        return activityDisplayTitle(first).localeCompare(
          activityDisplayTitle(second),
          "id-ID",
        );
      }
      const firstIndicator =
        first.kmLinks[0]?.indicator.number ?? Number.MAX_SAFE_INTEGER;
      const secondIndicator =
        second.kmLinks[0]?.indicator.number ?? Number.MAX_SAFE_INTEGER;
      return firstIndicator - secondIndicator;
    });
  }, [contextRecords, deferredSearchQuery, filterValues]);

  const coveredIndicatorCount = activityIndicatorScope.filter((indicator) =>
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
  const activityDetail = useNexusActivityDetail(selectedId);
  const selected =
    activityDetail.record ??
    contextRecords.find((record) => record.id === selectedId);
  const activeFilterCount = Object.entries(defaultFilterValues).filter(
    ([filterId, defaultValue]) =>
      filterValues[filterId as FilterId] !== defaultValue,
  ).length;
  const hasActiveFilters = activeFilterCount > 0 || searchQuery.length > 0;
  const evaluationPeriod =
    contextRecords.find((record) => record.evaluationPeriod)
      ?.evaluationPeriod ?? "";
  const resultSummary = [
    ...(evaluationPeriod ? [`Periode evaluasi ${evaluationPeriod}`] : []),
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

  const rows = visible.map((record) => {
    const open = () => setSelectedId(record.id);
    const displayTitle = activityDisplayTitle(record);
    const context = activityContextLabel(record) || "Belum tercatat";
    const party = record.primaryParty || "Belum tercatat";
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
        tone={record.group === "Bisnis" ? "info" : "waiting"}
      >
        {record.group}
      </NexusWorkspaceTableBadge>
    );

    return {
      cells: {
        action: (
          <NexusWorkspaceTableAction
            label={`Lihat rincian kegiatan: ${displayTitle}`}
            onClick={open}
          >
            Rincian
          </NexusWorkspaceTableAction>
        ),
        context: <NexusWorkspaceTableText>{context}</NexusWorkspaceTableText>,
        evidence: (
          <NexusWorkspaceTableText>
            {activityEvidenceLabel(record)}
          </NexusWorkspaceTableText>
        ),
        kind: (
          <span className={styles.stackedCell}>
            <strong>{record.kind}</strong>
            <small>{record.recordStatus}</small>
          </span>
        ),
        party: <NexusWorkspaceTableText>{party}</NexusWorkspaceTableText>,
        primary: (
          <NexusWorkspaceTablePrimary
            onClick={open}
            subtitle={[record.primaryParty, record.group]
              .filter(Boolean)
              .join(" · ")}
            title={displayTitle}
          />
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
              label={`Lihat rincian kegiatan: ${displayTitle}`}
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
                <dd>{activityKmLabel(record)}</dd>
              </div>
              <div>
                <dt>Jenis</dt>
                <dd>{record.kind}</dd>
              </div>
              <div>
                <dt>Pihak utama</dt>
                <dd>{party}</dd>
              </div>
              <div>
                <dt>Bukti</dt>
                <dd>{activityEvidenceLabel(record)}</dd>
              </div>
            </dl>
          }
          title={displayTitle}
        >
          <NexusWorkspaceMobileSubtitle>{context}</NexusWorkspaceMobileSubtitle>
        </NexusWorkspaceMobileCard>
      ),
    };
  });

  return (
    <NexusWorkspacePage
      actions={
        <NexusManualSubmissionLink
          available={false}
          domain="activity"
          label="Ajukan kegiatan / pengabdian"
        />
      }
      description={content.description}
      descriptionId="activities-description"
      meta={
        catalog.loadedAt ? formatPageUpdatedLabel(catalog.loadedAt) : undefined
      }
      title={content.title}
      titleId="activities-title"
    >
      <NexusMemberContextFilter
        clearHref="/nexus/kegiatan"
        memberId={initialMemberId}
        memberName={memberName}
        unsupportedDescription="Kegiatan belum dapat disaring per anggota, sehingga daftar di bawah memuat seluruh rekam resmi."
      />
      <NexusWorkspaceMetrics
        metrics={[
          {
            icon: <NexusActivitiesIcon name="activity" />,
            id: "official-records",
            label: "Rekam Resmi",
            tone: "completed",
            unit: "data",
            value: isCatalogLoading ? null : contextRecords.length,
          },
          {
            icon: <NexusActivitiesIcon name="indicator" />,
            id: "covered-indicators",
            label: "Indikator Terisi",
            tone: "waiting",
            unit: `dari ${activityIndicatorScope.length} indikator`,
            value: isCatalogLoading ? null : coveredIndicatorCount,
          },
          {
            icon: <NexusActivitiesIcon name="alert" />,
            id: "needs-completion",
            label: "Perlu Dilengkapi",
            tone: "needs-fix",
            unit: "data",
            value: isCatalogLoading ? null : needsCompletionCount,
          },
        ]}
      />

      <NexusWorkspaceCatalog
        className={styles.catalog}
        labelledBy="official-activities-title"
      >
        <NexusWorkspaceToolbar>
          <NexusWorkspaceSearch
            label="Cari kegiatan dan pengabdian resmi"
            name="activities-search"
            onValueChange={(value) => {
              setSearchQuery(value);
              setCurrentPage(1);
            }}
            placeholder="Cari judul, pihak, sasaran, jenis, atau indikator"
            value={searchQuery}
          />
          {[indicatorConfig, groupConfig, completenessConfig, sortConfig].map(
            (config) => (
              <NexusWorkspaceSelect
                config={config}
                isOpen={openFilterId === config.id}
                key={config.id}
                name={`activities-${config.id}`}
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

        <NexusWorkspaceResultMeta
          isUpdating={isSearchUpdating}
          onResetFilters={hasActiveFilters ? resetFilters : undefined}
          resultLabel={`${filtered.length} rekam ditemukan`}
          updatingLabel="Memperbarui hasil pencarian"
        />

        <NexusWorkspaceTableSection
          guidance={content.officialNote}
          summary={resultSummary}
          title="Daftar kegiatan dan pengabdian resmi"
          titleId="official-activities-title"
        >
          {catalog.state === "error" ? (
            <NexusWorkspaceState
              actions={
                <NexusWorkspaceButton onClick={catalog.retry} type="button">
                  Coba lagi
                </NexusWorkspaceButton>
              }
              description={
                catalog.errorMessage ?? "Kegiatan resmi belum dapat dimuat."
              }
              eyebrow="Gagal memuat"
              title="Kegiatan resmi belum dapat dimuat"
              tone="danger"
            />
          ) : null}
          <NexusWorkspaceRecordTable
            caption="Kegiatan dan pengabdian resmi CoE BHT beserta pihak, konteks, bukti, dan indikator KM"
            columns={columns}
            empty={
              <NexusWorkspaceEmptyState
                description={
                  records.length === 0
                    ? "Rekam akan muncul setelah kegiatan atau program disetujui melalui proses Tinjauan."
                    : "Ubah kata kunci atau filter untuk melihat rekam resmi lain."
                }
                onResetFilters={hasActiveFilters ? resetFilters : undefined}
                title={
                  records.length === 0
                    ? "Belum ada kegiatan atau pengabdian resmi"
                    : "Tidak ada rekam yang cocok"
                }
              />
            }
            isLoading={isSearchUpdating || isCatalogLoading}
            pagination={
              <NexusTablePagination
                currentPage={safePage}
                itemCount={filtered.length}
                navigationLabel="Navigasi halaman kegiatan dan pengabdian"
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
        <NexusActivityDetail
          canOpenReviews={canOpenReviews}
          onClose={() => setSelectedId(null)}
          record={selected}
        />
      ) : null}
    </NexusWorkspacePage>
  );
}
