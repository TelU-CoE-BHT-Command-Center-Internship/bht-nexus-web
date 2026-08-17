"use client";

import dynamic from "next/dynamic";
import { useDeferredValue, useMemo, useState } from "react";
import styles from "@/components/nexus-activities/nexus-activities.module.css";
import {
  type ActivityProposal,
  activityContextLabel,
  activityDisplayTitle,
  activityEvidenceLabel,
  activityIndicatorScope,
  activityKmLabel,
  type NexusActivitiesContent,
  type OfficialActivityRecord,
} from "@/components/nexus-activities/nexus-activities-content";
import { NexusActivitiesIcon } from "@/components/nexus-activities/nexus-activities-icons";
import type { MetadataCompletionResolutions } from "@/components/nexus-metadata-completion/nexus-metadata-completion-model";
import { createActivityCompletionReviewRecord } from "@/components/nexus-review-session/nexus-review-record-factory";
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

const NexusActivityDetail = dynamic(() =>
  import("@/components/nexus-activities/nexus-activity-detail").then(
    (module) => module.NexusActivityDetail,
  ),
);

type NexusActivitiesProps = {
  content: NexusActivitiesContent;
};

type FilterId = "completeness" | "group" | "indicator" | "sort";
type FilterValues = Record<FilterId, string>;

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

function searchableText(record: OfficialActivityRecord) {
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
  records: readonly OfficialActivityRecord[],
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

export function NexusActivities({ content }: NexusActivitiesProps) {
  const reviewSession = useNexusReviewSession();
  const [currentPage, setCurrentPage] = useState(1);
  const [filterValues, setFilterValues] =
    useState<FilterValues>(defaultFilterValues);
  const [openFilterId, setOpenFilterId] = useState<string | null>(null);
  const [pageSizeValue, setPageSizeValue] = useState("10");
  const [proposals, setProposals] = useState<Record<string, ActivityProposal>>(
    {},
  );
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
        return first.primaryParty.localeCompare(second.primaryParty, "id-ID");
      }
      if (filterValues.sort === "title") {
        return activityDisplayTitle(first).localeCompare(
          activityDisplayTitle(second),
          "id-ID",
        );
      }
      return (
        first.kmLinks[0].indicator.number - second.kmLinks[0].indicator.number
      );
    });
  }, [content.records, deferredSearchQuery, filterValues]);

  const coveredIndicatorCount = activityIndicatorScope.filter((indicator) =>
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
  const resultSummary = [
    `Periode evaluasi ${content.records[0]?.evaluationPeriod ?? "—"}`,
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

    const proposal: ActivityProposal = {
      id: `PLG-KGT-2026-${String(Object.keys(proposals).length + 1).padStart(5, "0")}`,
      note,
      recordId,
      resolutions,
      status: "waiting-review",
      submittedAt: "Baru saja",
      submittedBy: reviewSession.actor.name,
    };

    setProposals((current) => ({ ...current, [recordId]: proposal }));
    reviewSession.submitRecord(
      createActivityCompletionReviewRecord(
        record,
        proposal,
        reviewSession.actor,
      ),
    );
  };

  const rows = visible.map((record) => {
    const open = () => setSelectedId(record.id);
    const displayTitle = activityDisplayTitle(record);
    const context = activityContextLabel(record) || "Belum tercatat";
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
        context: <span className={styles.plainCell}>{context}</span>,
        evidence: (
          <span className={styles.plainCell}>
            {activityEvidenceLabel(record)}
          </span>
        ),
        kind: (
          <span className={styles.stackedCell}>
            <strong>{record.kind}</strong>
            <small>{record.recordStatus}</small>
          </span>
        ),
        party: <span className={styles.plainCell}>{record.primaryParty}</span>,
        primary: (
          <NexusWorkspaceTablePrimary
            onClick={open}
            subtitle={`${record.primaryParty} · ${record.group}`}
            title={displayTitle}
          />
        ),
        signal: (
          <NexusWorkspaceTableSignal
            primary={activityKmLabel(record)}
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
                <dd>{record.primaryParty}</dd>
              </div>
              <div>
                <dt>Bukti</dt>
                <dd>{activityEvidenceLabel(record)}</dd>
              </div>
            </dl>
          }
          title={displayTitle}
        >
          <p className={styles.mobileSubtitle}>{context}</p>
        </NexusWorkspaceMobileCard>
      ),
    };
  });

  return (
    <NexusWorkspacePage
      description={content.description}
      descriptionId="activities-description"
      meta={content.updatedAt}
      title={content.title}
      titleId="activities-title"
    >
      <NexusWorkspaceMetrics
        metrics={[
          {
            icon: <NexusActivitiesIcon name="activity" />,
            id: "official-records",
            label: "Rekam Resmi",
            tone: "completed",
            unit: "data",
            value: content.records.length,
          },
          {
            icon: <NexusActivitiesIcon name="indicator" />,
            id: "covered-indicators",
            label: "Indikator Terisi",
            tone: "waiting",
            unit: `dari ${activityIndicatorScope.length} indikator`,
            value: coveredIndicatorCount,
          },
          {
            icon: <NexusActivitiesIcon name="alert" />,
            id: "needs-completion",
            label: "Perlu Dilengkapi",
            tone: "needs-fix",
            unit: "data",
            value: needsCompletionCount,
          },
        ]}
      />

      <section
        aria-labelledby="official-activities-title"
        className={styles.catalog}
      >
        <div className={styles.toolbar}>
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
          title="Daftar kegiatan dan pengabdian resmi"
          titleId="official-activities-title"
        >
          <NexusWorkspaceRecordTable
            caption="Kegiatan dan pengabdian resmi CoE BHT beserta pihak, konteks, bukti, dan indikator KM"
            columns={columns}
            empty={
              <NexusWorkspaceEmptyState
                description={
                  content.records.length === 0
                    ? "Rekam akan muncul setelah kegiatan atau program disetujui melalui proses Tinjauan."
                    : "Ubah kata kunci atau filter untuk melihat rekam resmi lain."
                }
                onResetFilters={hasActiveFilters ? resetFilters : undefined}
                title={
                  content.records.length === 0
                    ? "Belum ada kegiatan atau pengabdian resmi"
                    : "Tidak ada rekam yang cocok"
                }
              />
            }
            isLoading={isSearchUpdating}
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
      </section>

      {selected ? (
        <NexusActivityDetail
          onClose={() => setSelectedId(null)}
          onSubmitProposal={submitProposal}
          proposal={proposals[selected.id]}
          record={selected}
        />
      ) : null}
    </NexusWorkspacePage>
  );
}
