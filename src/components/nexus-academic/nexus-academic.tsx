"use client";

import dynamic from "next/dynamic";
import { useDeferredValue, useMemo, useState } from "react";
import styles from "@/components/nexus-academic/nexus-academic.module.css";
import {
  type AcademicProposal,
  academicDisplayTitle,
  academicEvidenceLabel,
  academicIndicatorScope,
  academicKmLabel,
  academicMentorNames,
  type NexusAcademicContent,
  type OfficialAcademicRecord,
} from "@/components/nexus-academic/nexus-academic-content";
import { NexusAcademicIcon } from "@/components/nexus-academic/nexus-academic-icons";
import type { MetadataCompletionResolutions } from "@/components/nexus-metadata-completion/nexus-metadata-completion-model";
import { projectOfficialMetadataRecords } from "@/components/nexus-review-session/nexus-official-record-projection";
import { createAcademicCompletionReviewRecord } from "@/components/nexus-review-session/nexus-review-record-factory";
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

const NexusAcademicDetail = dynamic(() =>
  import("@/components/nexus-academic/nexus-academic-detail").then(
    (module) => module.NexusAcademicDetail,
  ),
);

type NexusAcademicProps = {
  content: NexusAcademicContent;
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

function searchableText(record: OfficialAcademicRecord) {
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
  records: readonly OfficialAcademicRecord[],
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
  records: readonly OfficialAcademicRecord[],
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

export function NexusAcademic({ content }: NexusAcademicProps) {
  const reviewSession = useNexusReviewSession();
  const records = useMemo(
    () =>
      projectOfficialMetadataRecords(
        content.records,
        reviewSession.officialMetadataByRecordId,
      ),
    [content.records, reviewSession.officialMetadataByRecordId],
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

  const indicatorConfig = useMemo(
    () => createIndicatorConfig(records),
    [records],
  );
  const activityConfig = useMemo(
    () => createActivityConfig(records),
    [records],
  );

  const filtered = useMemo(() => {
    const needle = normalizeWorkspaceSearch(deferredSearchQuery);
    const matching = records.filter(
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
  }, [deferredSearchQuery, filterValues, records]);

  const coveredIndicatorCount = academicIndicatorScope.filter((indicator) =>
    records.some((record) =>
      record.kmLinks.some((link) => link.indicator.id === indicator.id),
    ),
  ).length;
  const needsCompletionCount = records.filter(
    (record) => record.quality === "Perlu dilengkapi",
  ).length;
  const pageSize = Number(pageSizeValue);
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(Math.max(currentPage, 1), totalPages);
  const visible = filtered.slice(
    (safePage - 1) * pageSize,
    safePage * pageSize,
  );
  const selected = records.find((record) => record.id === selectedId);
  const activeFilterCount = Object.entries(defaultFilterValues).filter(
    ([filterId, defaultValue]) =>
      filterValues[filterId as FilterId] !== defaultValue,
  ).length;
  const hasActiveFilters = activeFilterCount > 0 || searchQuery.length > 0;
  const evaluationPeriods = Array.from(
    new Set(records.map((record) => record.evaluationPeriod)),
  )
    .toSorted()
    .join(", ");
  const resultSummary = [
    `Periode evaluasi ${evaluationPeriods}`,
    `${filtered.length} dari ${records.length} rekam sesuai filter`,
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

    const proposal: AcademicProposal = reviewSession.createCompletionProposal(
      "PLG-AKD-2026",
      recordId,
      resolutions,
      note,
    );
    reviewSession.submitRecord(
      createAcademicCompletionReviewRecord(record, proposal),
    );
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
          <span className={styles.plainCell}>
            {academicEvidenceLabel(record)}
          </span>
        ),
        participant: (
          <span className={styles.plainCell}>{record.participantCode}</span>
        ),
        primary: (
          <NexusWorkspaceTablePrimary
            onClick={open}
            subtitle={academicMentorNames(record)}
            title={displayTitle}
          />
        ),
        programStudy: (
          <span className={styles.plainCell}>
            {record.programStudy ?? "Belum tercatat"}
          </span>
        ),
        signal: (
          <NexusWorkspaceTableSignal
            primary={academicKmLabel(record)}
            secondary={record.activity}
            tone={record.kmLinks.length === 0 ? "neutral" : "info"}
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
          <p className={styles.mobileSubtitle}>{academicMentorNames(record)}</p>
        </NexusWorkspaceMobileCard>
      ),
    };
  });

  return (
    <NexusWorkspacePage
      description={content.description}
      descriptionId="academic-description"
      meta={content.updatedAt}
      title={content.title}
      titleId="academic-title"
    >
      <NexusWorkspaceMetrics
        metrics={[
          {
            icon: <NexusAcademicIcon name="mentoring" />,
            id: "official-records",
            label: "Rekam Resmi",
            tone: "completed",
            unit: "data",
            value: records.length,
          },
          {
            icon: <NexusAcademicIcon name="indicator" />,
            id: "covered-indicators",
            label: "Indikator Terisi",
            tone: "waiting",
            unit: `dari ${academicIndicatorScope.length} indikator akademik`,
            value: coveredIndicatorCount,
          },
          {
            icon: <NexusAcademicIcon name="alert" />,
            id: "needs-completion",
            label: "Perlu Dilengkapi",
            tone: "needs-fix",
            unit: "data",
            value: needsCompletionCount,
          },
        ]}
      />

      <section
        aria-labelledby="official-academic-title"
        className={styles.catalog}
      >
        <div className={styles.toolbar}>
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
          title="Daftar kegiatan akademik resmi"
          titleId="official-academic-title"
        >
          <NexusWorkspaceRecordTable
            caption="Kegiatan akademik resmi CoE BHT beserta pembimbing, bukti kegiatan, dan keterkaitan indikator KM"
            columns={columns}
            empty={
              <NexusWorkspaceEmptyState
                description={
                  records.length === 0
                    ? "Rekam akan muncul setelah kegiatan disetujui melalui proses Tinjauan."
                    : "Ubah kata kunci atau filter untuk melihat rekam resmi lain."
                }
                onResetFilters={hasActiveFilters ? resetFilters : undefined}
                title={
                  records.length === 0
                    ? "Belum ada kegiatan akademik resmi"
                    : "Tidak ada rekam yang cocok"
                }
              />
            }
            isLoading={isSearchUpdating}
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
      </section>

      {selected ? (
        <NexusAcademicDetail
          onClose={() => setSelectedId(null)}
          onSubmitProposal={submitProposal}
          proposal={proposals[selected.id]}
          record={selected}
        />
      ) : null}
    </NexusWorkspacePage>
  );
}
