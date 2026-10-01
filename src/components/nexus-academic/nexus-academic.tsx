"use client";

import dynamic from "next/dynamic";
import { useDeferredValue, useMemo, useState } from "react";
import styles from "@/components/nexus-academic/nexus-academic.module.css";
import {
  academicDisplayTitle,
  academicEvidenceLabel,
  academicIndicatorScope,
  academicKmLabel,
  academicMentorNames,
  type NexusAcademicContent,
  type NexusAcademicView,
} from "@/components/nexus-academic/nexus-academic-content";
import { NexusAcademicIcon } from "@/components/nexus-academic/nexus-academic-icons";
import {
  useNexusAcademicCatalog,
  useNexusAcademicDetail,
} from "@/components/nexus-academic/nexus-academic-server";
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

const NexusAcademicDetail = dynamic(() =>
  import("@/components/nexus-academic/nexus-academic-detail").then(
    (module) => module.NexusAcademicDetail,
  ),
);

type NexusAcademicProps = {
  canReadMembers: boolean;
  content: NexusAcademicContent;
  initialMemberId?: string;
};

type FilterId = "activity" | "completeness" | "indicator" | "sort";
type FilterValues = Record<FilterId, string>;

const columns: readonly NexusWorkspaceRecordColumn[] = [
  { id: "primary", label: "Topik riset / kegiatan", primary: true },
  { id: "signal", label: "Indikator KM" },
  { id: "participant", label: "Mahasiswa" },
  { id: "programStudy", label: "Program studi" },
  { id: "evidence", label: "Bukti" },
  { id: "status", label: "Kelengkapan" },
  { id: "action", label: "Aksi" },
];

const defaultFilterValues: FilterValues = {
  activity: "all",
  completeness: "all",
  indicator: "all",
  sort: "activity",
};

const unlinkedIndicatorValue = "unlinked";

/** Urutan kegiatan mengikuti jenjangnya, bukan abjad. */
const activityOrder: Record<string, number> = {
  "Bimbingan Doktor": 0,
  "Bimbingan Magister": 1,
  "Magang Mahasiswa": 2,
  "Riset Tugas Akhir": 3,
  "Kompetisi Mahasiswa": 4,
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

/**
 * Sebagian besar kegiatan bimbingan tidak mempunyai kolom tahun pada workbook,
 * sehingga urutan tahun tidak dipakai. Urutan bawaannya mengelompokkan jenjang
 * kegiatan lalu judul.
 */
const sortConfig: NexusSelectConfig = {
  defaultValue: "activity",
  id: "sort",
  label: "Urutkan kegiatan akademik",
  options: [
    { label: "Urutan: Jenjang", value: "activity" },
    { label: "Urutan: Judul A–Z", value: "title" },
    { label: "Urutan: Pembimbing A–Z", value: "mentor" },
  ],
};

const pageSizeConfig: NexusSelectConfig = {
  defaultValue: "10",
  id: "academic-page-size",
  label: "Jumlah data per halaman",
  options: [
    { label: "10 per halaman", value: "10" },
    { label: "20 per halaman", value: "20" },
    { label: "50 per halaman", value: "50" },
  ],
};

function searchableText(record: NexusAcademicView) {
  return normalizeWorkspaceSearch(
    [
      record.title,
      record.publicId,
      record.participantCode,
      academicMentorNames(record),
      record.activity,
      record.programStudy ?? "",
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
  records: readonly NexusAcademicView[],
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

function createActivityConfig(
  records: readonly NexusAcademicView[],
): NexusSelectConfig {
  const activities = Array.from(
    new Set(records.map((record) => record.activity)),
  ).toSorted(
    (first, second) =>
      (activityOrder[first] ?? 0) - (activityOrder[second] ?? 0),
  );
  const options: [NexusSelectOption, ...NexusSelectOption[]] = [
    { label: "Semua kegiatan", value: "all" },
    ...activities.map((activity) => ({ label: activity, value: activity })),
  ];

  return {
    defaultValue: "all",
    id: "activity",
    label: "Filter bentuk kegiatan",
    options,
  };
}

export function NexusAcademic({
  canReadMembers,
  content,
  initialMemberId,
}: NexusAcademicProps) {
  const catalog = useNexusAcademicCatalog(initialMemberId);
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
  const activityConfig = useMemo(
    () => createActivityConfig(contextRecords),
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
        (filterValues.activity === "all" ||
          record.activity === filterValues.activity) &&
        (filterValues.completeness === "all" ||
          record.quality === filterValues.completeness) &&
        (needle.length === 0 || searchableText(record).includes(needle)),
    );

    return matching.toSorted((first, second) => {
      if (filterValues.sort === "mentor") {
        return academicMentorNames(first).localeCompare(
          academicMentorNames(second),
          "id-ID",
        );
      }
      if (filterValues.sort === "title") {
        return academicDisplayTitle(first).localeCompare(
          academicDisplayTitle(second),
          "id-ID",
        );
      }
      const byActivity =
        (activityOrder[first.activity] ?? 0) -
        (activityOrder[second.activity] ?? 0);
      return byActivity !== 0
        ? byActivity
        : academicDisplayTitle(first).localeCompare(
            academicDisplayTitle(second),
            "id-ID",
          );
    });
  }, [contextRecords, deferredSearchQuery, filterValues]);

  const coveredIndicatorCount = academicIndicatorScope.filter((indicator) =>
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
  const recordDetail = useNexusAcademicDetail(selectedId);
  const selectedSummary = contextRecords.find(
    (record) => record.id === selectedId,
  );
  const selected = recordDetail.record ?? selectedSummary;
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
    requestHouseRecordCompletion("academics", recordId, {
      note,
      proposals: toCompletionProposals(resolutions),
    })
      .then(() => {
        reviewSession.createCompletionProposal(
          "PLG-AKD-2026",
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
    const displayTitle = academicDisplayTitle(record);
    const qualityBadge = (
      <NexusWorkspaceTableBadge
        key={`${record.id}-quality`}
        tone={record.quality === "Lengkap" ? "success" : "danger"}
      >
        {record.quality}
      </NexusWorkspaceTableBadge>
    );
    const activityBadge = (
      <NexusWorkspaceTableBadge key={`${record.id}-activity`} tone="info">
        {record.activity}
      </NexusWorkspaceTableBadge>
    );

    return {
      cells: {
        action: (
          <NexusWorkspaceTableAction
            label={`Lihat rincian kegiatan akademik: ${displayTitle}`}
            onClick={open}
          >
            Rincian
          </NexusWorkspaceTableAction>
        ),
        evidence: (
          <NexusWorkspaceTableText>
            {academicEvidenceLabel(record)}
          </NexusWorkspaceTableText>
        ),
        participant: (
          <NexusWorkspaceTableText>
            {record.participantCode}
          </NexusWorkspaceTableText>
        ),
        primary: (
          <NexusWorkspaceTablePrimary
            onClick={open}
            subtitle={academicMentorNames(record)}
            title={displayTitle}
          />
        ),
        programStudy: (
          <NexusWorkspaceTableText>
            {record.programStudy ?? "Belum tercatat"}
          </NexusWorkspaceTableText>
        ),
        signal: (
          <NexusWorkspaceTableSignal
            {...officialKpiTableSignal(
              record.kmLinks,
              record.kpiResolutionStatus,
            )}
            secondary={record.activity}
          />
        ),
        status: qualityBadge,
      },
      id: record.id,
      mobile: (
        <NexusWorkspaceMobileCard
          action={
            <NexusWorkspaceMobileAction
              label={`Lihat rincian kegiatan akademik: ${displayTitle}`}
              onClick={open}
            >
              Lihat rincian
            </NexusWorkspaceMobileAction>
          }
          eyebrow={
            <>
              {activityBadge}
              {qualityBadge}
            </>
          }
          meta={
            <dl>
              <div>
                <dt>Indikator</dt>
                <dd>{academicKmLabel(record)}</dd>
              </div>
              <div>
                <dt>Mahasiswa</dt>
                <dd>{record.participantCode}</dd>
              </div>
              <div>
                <dt>Program studi</dt>
                <dd>{record.programStudy ?? "Belum tercatat"}</dd>
              </div>
              <div>
                <dt>Bukti</dt>
                <dd>{academicEvidenceLabel(record)}</dd>
              </div>
            </dl>
          }
          title={displayTitle}
        >
          <NexusWorkspaceMobileSubtitle>
            {academicMentorNames(record)}
          </NexusWorkspaceMobileSubtitle>
        </NexusWorkspaceMobileCard>
      ),
    };
  });

  return (
    <NexusWorkspacePage
      actions={
        <NexusManualSubmissionLink
          domain="academic"
          label="Ajukan kegiatan akademik"
        />
      }
      description={content.description}
      descriptionId="academic-description"
      meta={
        catalog.loadedAt ? formatPageUpdatedLabel(catalog.loadedAt) : undefined
      }
      title={content.title}
      titleId="academic-title"
    >
      {completionError ? (
        <NexusWorkspaceNotice tone="danger">
          {completionError}
        </NexusWorkspaceNotice>
      ) : null}
      <NexusMemberContextFilter
        clearHref="/nexus/akademik"
        memberId={initialMemberId}
        memberName={memberName}
      />
      <NexusWorkspaceMetrics
        metrics={[
          {
            icon: <NexusAcademicIcon name="mentoring" />,
            id: "official-records",
            label: "Rekam Resmi",
            tone: "completed",
            unit: "data",
            value: isCatalogLoading ? null : contextRecords.length,
          },
          {
            icon: <NexusAcademicIcon name="indicator" />,
            id: "covered-indicators",
            label: "Indikator Terisi",
            tone: "waiting",
            unit: `dari ${academicIndicatorScope.length} indikator akademik`,
            value: isCatalogLoading ? null : coveredIndicatorCount,
          },
          {
            icon: <NexusAcademicIcon name="alert" />,
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
        labelledBy="official-academic-title"
      >
        <NexusWorkspaceToolbar>
          <NexusWorkspaceSearch
            label="Cari kegiatan akademik resmi"
            name="academic-search"
            onValueChange={(value) => {
              setSearchQuery(value);
              setCurrentPage(1);
            }}
            placeholder="Cari topik, pembimbing, mahasiswa, atau indikator"
            value={searchQuery}
          />
          {[
            indicatorConfig,
            activityConfig,
            completenessConfig,
            sortConfig,
          ].map((config) => (
            <NexusWorkspaceSelect
              config={config}
              isOpen={openFilterId === config.id}
              key={config.id}
              name={`academic-${config.id}`}
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
          title="Daftar kegiatan akademik resmi"
          titleId="official-academic-title"
        >
          <NexusWorkspaceRecordTable
            caption="Kegiatan akademik resmi CoE BHT beserta pembimbing, bukti kegiatan, dan keterkaitan indikator KM"
            columns={columns}
            empty={
              <NexusWorkspaceEmptyState
                description={
                  records.length > 0
                    ? "Ubah kata kunci atau filter untuk melihat rekam resmi lain."
                    : initialMemberId
                      ? "Anggota ini belum tercatat sebagai pembimbing pada kegiatan akademik resmi."
                      : "Rekam akan muncul setelah kegiatan disetujui melalui proses Tinjauan."
                }
                onResetFilters={hasActiveFilters ? resetFilters : undefined}
                title={
                  records.length > 0
                    ? "Tidak ada rekam yang cocok"
                    : initialMemberId
                      ? "Belum ada kegiatan akademik untuk anggota ini"
                      : "Belum ada kegiatan akademik resmi"
                }
              />
            }
            error={
              catalog.state === "error" ? (
                <NexusWorkspaceLoadError
                  description={
                    catalog.errorMessage ??
                    "Kegiatan akademik resmi belum dapat dimuat."
                  }
                  onRetry={catalog.retry}
                  title="Kegiatan akademik resmi belum dapat dimuat"
                />
              ) : undefined
            }
            isLoading={isSearchUpdating || isCatalogLoading}
            pagination={
              <NexusTablePagination
                currentPage={safePage}
                itemCount={filtered.length}
                navigationLabel="Navigasi halaman kegiatan akademik"
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
        <NexusAcademicDetail
          mentorsState={
            recordDetail.state === "error"
              ? "error"
              : recordDetail.record
                ? "ready"
                : "loading"
          }
          onClose={() => setSelectedId(null)}
          onSubmitProposal={reviewSession ? submitProposal : undefined}
          proposal={reviewSession?.completionProposals[selected.id]}
          record={selected}
        />
      ) : null}
    </NexusWorkspacePage>
  );
}
