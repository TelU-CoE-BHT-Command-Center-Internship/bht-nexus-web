"use client";

import dynamic from "next/dynamic";
import { useDeferredValue, useMemo, useState } from "react";
import { NexusManualSubmissionLink } from "@/components/nexus-manual-submission/nexus-manual-submission-link";
import { projectManualPublications } from "@/components/nexus-manual-submission/nexus-manual-submission-projection";
import styles from "@/components/nexus-publications/nexus-publications.module.css";
import {
  type NexusPublicationsContent,
  normalizeProjectedPublication,
  type OfficialPublication,
  type PublicationCompletionResolutions,
  type PublicationIndicatorId,
  type PublicationMetadataProposal,
  publicationAuthorNames,
  publicationDisplayTitle,
  publicationIndicatorShortLabels,
  publicationQuartileLabel,
  publicationQuartileState,
} from "@/components/nexus-publications/nexus-publications-content";
import { NexusPublicationsIcon } from "@/components/nexus-publications/nexus-publications-icons";
import {
  getPublicationSourceId,
  getPublicationSourceTabs,
  type PublicationSourceId,
  publicationHasSource,
} from "@/components/nexus-publications/nexus-publications-utils";
import { projectOfficialMetadataRecords } from "@/components/nexus-review-session/nexus-official-record-projection";
import { createMetadataCompletionReviewRecord } from "@/components/nexus-review-session/nexus-review-record-factory";
import { useNexusReviewSession } from "@/components/nexus-review-session/nexus-review-session";
import { NexusTablePagination } from "@/components/nexus-workspace-ui/nexus-table-pagination";
import {
  NexusWorkspaceSearch,
  NexusWorkspaceTabs,
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

const NexusPublicationDetail = dynamic(() =>
  import("@/components/nexus-publications/nexus-publication-detail").then(
    (module) => module.NexusPublicationDetail,
  ),
);

type NexusPublicationsProps = {
  content: NexusPublicationsContent;
};

type PublicationFilterId =
  | "completeness"
  | "indicator"
  | "quartile"
  | "sort"
  | "year";
type PublicationFilterValues = Record<PublicationFilterId, string>;

const columns: readonly NexusWorkspaceRecordColumn[] = [
  { id: "primary", label: "Publikasi", primary: true },
  { id: "signal", label: "Indikator KM" },
  { id: "quartile", label: "Kuartil" },
  { id: "year", label: "Tahun" },
  { id: "source", label: "Sumber" },
  { id: "citations", label: "Sitasi" },
  { id: "status", label: "Kelengkapan" },
  { id: "action", label: "Aksi" },
];

const defaultFilterValues: PublicationFilterValues = {
  completeness: "all",
  indicator: "all",
  quartile: "all",
  sort: "newest",
  year: "all",
};

const unknownYearValue = "unknown";
const unlinkedIndicatorValue = "unlinked";

const quartileConfig: NexusSelectConfig = {
  defaultValue: "all",
  id: "quartile",
  label: "Filter kuartil jurnal",
  options: [
    { label: "Semua kuartil", value: "all" },
    { label: "Setara Q1/Q2", tone: "completed", value: "q1-q2" },
    { label: "Q1", value: "Q1" },
    { label: "Q2", value: "Q2" },
    { label: "Q3", value: "Q3" },
    { label: "Q4", value: "Q4" },
    { label: "Tidak tersedia", value: "not-available" },
    { label: "Belum diverifikasi", tone: "needs-fix", value: "unverified" },
    { label: "Tidak berlaku / belum dapat dinilai", value: "not-applicable" },
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
  defaultValue: "newest",
  id: "sort",
  label: "Urutkan publikasi",
  options: [
    { label: "Urutan: Tahun terbaru", value: "newest" },
    { label: "Urutan: Tahun terlama", value: "oldest" },
    { label: "Urutan: Kuartil tertinggi", value: "quartile" },
    { label: "Urutan: Judul A–Z", value: "title" },
  ],
};

const pageSizeConfig: NexusSelectConfig = {
  defaultValue: "10",
  id: "publication-page-size",
  label: "Jumlah data per halaman",
  options: [
    { label: "10 per halaman", value: "10" },
    { label: "20 per halaman", value: "20" },
    { label: "50 per halaman", value: "50" },
  ],
};

const quartileRank: Record<string, number> = { Q1: 1, Q2: 2, Q3: 3, Q4: 4 };

function sourceTone(source: string) {
  if (source === "SINTA") return "success" as const;
  if (source === "Google Scholar") return "info" as const;
  if (source === "Workbook KM 2026") return "waiting" as const;
  return "neutral" as const;
}

function isTopQuartile(publication: OfficialPublication) {
  return publication.quartile === "Q1" || publication.quartile === "Q2";
}

function matchesIndicatorFilter(
  publication: OfficialPublication,
  value: string,
) {
  if (value === "all") return true;
  if (value === unlinkedIndicatorValue) return publication.kmLinks.length === 0;
  return publication.kmLinks.some((link) => link.indicator.id === value);
}

function matchesQuartileFilter(
  publication: OfficialPublication,
  value: string,
) {
  const state = publicationQuartileState(publication);
  if (value === "all") return true;
  if (value === "not-applicable")
    return state === "not_applicable" || state === "pending_type";
  if (value === "not-available") return state === "not_available";
  if (value === "unverified") return state === "unresolved";
  if (value === "q1-q2") return isTopQuartile(publication);
  return publication.quartile === value;
}

function matchesYearFilter(publication: OfficialPublication, value: string) {
  if (value === "all") return true;
  if (value === unknownYearValue) return publication.year === undefined;
  return publication.year === Number(value);
}

function searchableText(publication: OfficialPublication) {
  return normalizeWorkspaceSearch(
    [
      publicationDisplayTitle(publication),
      publication.publicId,
      publicationAuthorNames(publication),
      publication.venue,
      publication.type,
      publication.doi ?? "",
      publication.quartile ?? "",
      publication.kmLinks.flatMap((link) => [
        link.indicator.id,
        link.indicator.label,
      ]),
      publication.provenance.map((source) => source.source).join(" "),
    ]
      .flat()
      .join(" "),
  );
}

function createIndicatorConfig(
  publications: readonly OfficialPublication[],
): NexusSelectConfig {
  const indicators = publications
    .flatMap((publication) => publication.kmLinks)
    .map((link) => link.indicator)
    .filter(
      (indicator, index, list) =>
        list.findIndex((item) => item.id === indicator.id) === index,
    )
    .toSorted((first, second) => first.number - second.number);
  const hasUnlinked = publications.some(
    (publication) => publication.kmLinks.length === 0,
  );
  const options: [NexusSelectOption, ...NexusSelectOption[]] = [
    { label: "Semua indikator KM", value: "all" },
    ...indicators.map((indicator) => ({
      label: `${indicator.id} · ${
        publicationIndicatorShortLabels[
          indicator.id as PublicationIndicatorId
        ] ?? indicator.label
      }`,
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

function createYearConfig(
  publications: readonly OfficialPublication[],
): NexusSelectConfig {
  const years = Array.from(
    new Set(
      publications.flatMap((publication) =>
        publication.year === undefined ? [] : [publication.year],
      ),
    ),
  ).toSorted((first, second) => second - first);
  const hasUnknownYear = publications.some(
    (publication) => publication.year === undefined,
  );
  const options: [NexusSelectOption, ...NexusSelectOption[]] = [
    { label: "Semua tahun terbit", value: "all" },
    ...years.map((year) => ({ label: String(year), value: String(year) })),
    ...(hasUnknownYear
      ? [
          {
            label: "Tahun belum tercatat",
            tone: "needs-fix" as const,
            value: unknownYearValue,
          },
        ]
      : []),
  ];

  return {
    defaultValue: "all",
    id: "year",
    label: "Filter tahun terbit",
    options,
  };
}

/**
 * Sengaja memakai teks tenang, bukan `NexusWorkspaceTableSignal`. Indikator KM
 * hanyalah klasifikasi pelaporan sehingga tidak boleh tampil lebih berat
 * daripada identitas karyanya sendiri.
 */
function KmLinkCell({ publication }: { publication: OfficialPublication }) {
  const [firstLink, ...otherLinks] = publication.kmLinks;

  return (
    <span className={styles.kmCell}>
      <strong>
        {firstLink
          ? otherLinks.length > 0
            ? `${firstLink.indicator.id} +${otherLinks.length}`
            : firstLink.indicator.id
          : "Belum dikaitkan"}
      </strong>
      <small>{publication.type}</small>
    </span>
  );
}

function QuartileCell({ publication }: { publication: OfficialPublication }) {
  const state = publicationQuartileState(publication);
  if (state !== "available" && state !== "unresolved") {
    return (
      <span className={styles.plainCell}>
        {publicationQuartileLabel(publication)}
      </span>
    );
  }
  if (state === "unresolved") {
    return (
      <NexusWorkspaceTableBadge tone="danger">
        Belum diverifikasi
      </NexusWorkspaceTableBadge>
    );
  }

  return (
    <NexusWorkspaceTableBadge
      tone={isTopQuartile(publication) ? "success" : "info"}
    >
      {publication.quartile}
    </NexusWorkspaceTableBadge>
  );
}

export function NexusPublications({ content }: NexusPublicationsProps) {
  const reviewSession = useNexusReviewSession();
  const records = useMemo(
    () =>
      projectManualPublications(
        projectOfficialMetadataRecords(
          content.records,
          reviewSession.officialMetadataByRecordId,
          normalizeProjectedPublication,
        ),
        reviewSession.officialRecordDecisions,
      ),
    [
      content.records,
      reviewSession.officialMetadataByRecordId,
      reviewSession.officialRecordDecisions,
    ],
  );
  const [activeSourceId, setActiveSourceId] =
    useState<PublicationSourceId>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const completionProposals = reviewSession.completionProposals;
  const [filterValues, setFilterValues] =
    useState<PublicationFilterValues>(defaultFilterValues);
  const [openFilterId, setOpenFilterId] = useState<string | null>(null);
  const [pageSizeValue, setPageSizeValue] = useState("10");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPublicationId, setSelectedPublicationId] = useState<
    string | null
  >(null);
  const deferredSearchQuery = useDeferredValue(searchQuery);
  const isSearchUpdating = searchQuery !== deferredSearchQuery;

  const sourceTabs = useMemo(
    () => getPublicationSourceTabs(records),
    [records],
  );
  const indicatorConfig = useMemo(
    () => createIndicatorConfig(records),
    [records],
  );
  const yearConfig = useMemo(() => createYearConfig(records), [records]);
  const activeSource =
    sourceTabs.find((source) => source.id === activeSourceId) ?? sourceTabs[0];

  const filteredPublications = useMemo(() => {
    const needle = normalizeWorkspaceSearch(deferredSearchQuery);
    const matching = records.filter(
      (publication) =>
        publicationHasSource(
          publication,
          activeSource.id as PublicationSourceId,
        ) &&
        matchesIndicatorFilter(publication, filterValues.indicator) &&
        matchesQuartileFilter(publication, filterValues.quartile) &&
        matchesYearFilter(publication, filterValues.year) &&
        (filterValues.completeness === "all" ||
          publication.quality === filterValues.completeness) &&
        (needle.length === 0 || searchableText(publication).includes(needle)),
    );

    return matching.toSorted((first, second) => {
      if (filterValues.sort === "title") {
        return publicationDisplayTitle(first).localeCompare(
          publicationDisplayTitle(second),
          "id-ID",
        );
      }
      if (filterValues.sort === "quartile") {
        return (
          (quartileRank[first.quartile ?? ""] ?? 9) -
          (quartileRank[second.quartile ?? ""] ?? 9)
        );
      }
      // Rekam tanpa tahun terbit selalu ditempatkan paling akhir.
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
  }, [activeSource.id, deferredSearchQuery, filterValues, records]);

  const evaluationPeriods = Array.from(
    new Set(records.map((publication) => publication.evaluationPeriod)),
  )
    .toSorted()
    .join(", ");
  const topQuartileCount = records.filter(isTopQuartile).length;
  const needsCompletionCount = records.filter(
    (publication) => publication.quality === "Perlu dilengkapi",
  ).length;
  const pageSize = Number(pageSizeValue);
  const totalPages = Math.max(
    1,
    Math.ceil(filteredPublications.length / pageSize),
  );
  const safePage = Math.min(Math.max(currentPage, 1), totalPages);
  const visiblePublications = filteredPublications.slice(
    (safePage - 1) * pageSize,
    safePage * pageSize,
  );
  const selectedPublication = records.find(
    (publication) => publication.id === selectedPublicationId,
  );
  const activeFilterCount = Object.entries(defaultFilterValues).filter(
    ([filterId, defaultValue]) =>
      filterValues[filterId as PublicationFilterId] !== defaultValue,
  ).length;
  // REQ-FUNC-026: filter aktif, periode, satuan, sumber, dan waktu pembaruan
  // harus terbaca pada hasil, bukan hanya pada kontrolnya.
  const resultSummary = [
    `Sumber ${activeSource.label}`,
    `periode evaluasi ${evaluationPeriods}`,
    `${filteredPublications.length} dari ${activeSource.count} publikasi sesuai filter`,
    activeFilterCount > 0
      ? `${activeFilterCount} filter aktif`
      : "tanpa filter tambahan",
  ].join(" · ");

  const hasActiveFilters =
    activeSource.id !== "all" ||
    searchQuery.length > 0 ||
    Object.entries(defaultFilterValues).some(
      ([filterId, defaultValue]) =>
        filterValues[filterId as PublicationFilterId] !== defaultValue,
    );

  const resetFilters = () => {
    setActiveSourceId("all");
    setFilterValues(defaultFilterValues);
    setSearchQuery("");
    setCurrentPage(1);
  };

  const changeFilterValue = (filterId: string, value: string) => {
    setFilterValues((currentValues) => ({
      ...currentValues,
      [filterId as PublicationFilterId]: value,
    }));
    setCurrentPage(1);
  };

  const submitCompletionProposal = (
    publicationId: string,
    resolutions: PublicationCompletionResolutions,
    note: string,
  ) => {
    const publication = records.find((record) => record.id === publicationId);
    if (!publication) return;

    const proposal: PublicationMetadataProposal =
      reviewSession.createCompletionProposal(
        "PLG-2026",
        publicationId,
        resolutions,
        note,
      );
    reviewSession.submitRecord(
      createMetadataCompletionReviewRecord(publication, proposal),
    );
  };

  const rows = visiblePublications.map((publication) => {
    const title = publicationDisplayTitle(publication);
    const primarySource =
      publication.provenance.find(
        (item) => getPublicationSourceId(item.source) === activeSource.id,
      )?.source ??
      publication.provenance[0]?.source ??
      "Manual";
    // Glaukoma punya dua baris workbook dari SATU sistem sumber. Badge +N
    // harus menghitung sistem sumber yang berbeda, bukan jumlah jejaknya.
    const extraSourceCount =
      new Set(publication.provenance.map((item) => item.source)).size - 1;
    const open = () => setSelectedPublicationId(publication.id);
    const sourceBadge = (
      <NexusWorkspaceTableBadge
        key={`${publication.id}-source`}
        tone={sourceTone(primarySource)}
      >
        {primarySource}
        {extraSourceCount > 0 ? ` +${extraSourceCount}` : ""}
      </NexusWorkspaceTableBadge>
    );
    const qualityBadge = (
      <NexusWorkspaceTableBadge
        key={`${publication.id}-quality`}
        tone={publication.quality === "Lengkap" ? "success" : "danger"}
      >
        {publication.quality}
      </NexusWorkspaceTableBadge>
    );

    return {
      cells: {
        action: (
          <NexusWorkspaceTableAction
            label={`Lihat rincian publikasi: ${title}`}
            onClick={open}
          >
            Rincian
          </NexusWorkspaceTableAction>
        ),
        citations: (
          <NexusWorkspaceTableSignal
            primary={publication.citations ?? "—"}
            secondary={
              publication.citations === null
                ? "belum tersinkron"
                : `${publication.citationProvider} · berkala`
            }
            tone={publication.citations === null ? "neutral" : "info"}
          />
        ),
        primary: (
          <NexusWorkspaceTablePrimary
            onClick={open}
            subtitle={`${publicationAuthorNames(publication)} · ${publication.venue}`}
            title={title}
          />
        ),
        quartile: <QuartileCell publication={publication} />,
        signal: <KmLinkCell publication={publication} />,
        source: sourceBadge,
        status: qualityBadge,
        year: (
          <span className={styles.plainCell}>
            {publication.year ?? "Belum tercatat"}
          </span>
        ),
      },
      id: publication.id,
      mobile: (
        <NexusWorkspaceMobileCard
          action={
            <NexusWorkspaceMobileAction
              label={`Lihat rincian publikasi: ${title}`}
              onClick={open}
            >
              Lihat rincian
            </NexusWorkspaceMobileAction>
          }
          eyebrow={
            <>
              {sourceBadge}
              {qualityBadge}
            </>
          }
          meta={
            <dl>
              <div>
                <dt>Indikator</dt>
                <dd>
                  {publication.kmLinks.length === 0
                    ? "Belum dikaitkan"
                    : publication.kmLinks
                        .map((link) => link.indicator.id)
                        .join(", ")}{" "}
                  · {publication.type}
                </dd>
              </div>
              <div>
                <dt>Kuartil</dt>
                <dd>{publicationQuartileLabel(publication)}</dd>
              </div>
              <div>
                <dt>Tahun</dt>
                <dd>{publication.year ?? "Belum tercatat"}</dd>
              </div>
              <div>
                <dt>Sitasi</dt>
                <dd>
                  {publication.citations === null
                    ? "Belum tersinkron"
                    : `${publication.citations} · ${publication.citationProvider}`}
                </dd>
              </div>
            </dl>
          }
          title={title}
        >
          <p className={styles.mobileSubtitle}>
            {publicationAuthorNames(publication)} · {publication.venue}
          </p>
        </NexusWorkspaceMobileCard>
      ),
    };
  });

  return (
    <NexusWorkspacePage
      actions={
        <NexusManualSubmissionLink
          domain="publication"
          label="Ajukan publikasi"
        />
      }
      description={content.description}
      descriptionId="publications-description"
      meta={content.updatedAt}
      title={content.title}
      titleId="publications-title"
    >
      <NexusWorkspaceMetrics
        metrics={[
          {
            icon: <NexusPublicationsIcon name="book" />,
            id: "official-publications",
            label: "Publikasi Resmi",
            tone: "completed",
            unit: "data",
            value: records.length,
          },
          {
            icon: <NexusPublicationsIcon name="quartile" />,
            id: "top-quartile",
            label: "Setara Q1/Q2",
            tone: "waiting",
            unit: "data",
            value: topQuartileCount,
          },
          {
            icon: <NexusPublicationsIcon name="alert" />,
            id: "needs-completion",
            label: "Perlu Dilengkapi",
            tone: "needs-fix",
            unit: "data",
            value: needsCompletionCount,
          },
        ]}
      />

      <section
        aria-labelledby="official-publications-title"
        className={styles.catalog}
      >
        <NexusWorkspaceTabs
          activeId={activeSource.id}
          label="Filter publikasi berdasarkan sumber pembentuk"
          onActiveChange={(sourceId) => {
            setActiveSourceId(sourceId as PublicationSourceId);
            setCurrentPage(1);
          }}
          panelId="publication-source-panel"
          tabs={sourceTabs}
        />

        <div
          className={styles.toolbar}
          id="publication-source-panel"
          role="tabpanel"
        >
          <NexusWorkspaceSearch
            label="Cari publikasi resmi"
            name="publication-search"
            onValueChange={(value) => {
              setSearchQuery(value);
              setCurrentPage(1);
            }}
            placeholder="Cari judul, penulis, jurnal, DOI, atau indikator"
            value={searchQuery}
          />
          {[
            indicatorConfig,
            quartileConfig,
            yearConfig,
            completenessConfig,
            sortConfig,
          ].map((config) => (
            <NexusWorkspaceSelect
              config={config}
              isOpen={openFilterId === config.id}
              key={config.id}
              name={`publication-${config.id}`}
              onOpenChange={(isOpen) =>
                setOpenFilterId(isOpen ? config.id : null)
              }
              onValueChange={(value) => changeFilterValue(config.id, value)}
              placement="top-on-narrow"
              value={
                filterValues[config.id as PublicationFilterId] ??
                config.defaultValue
              }
            />
          ))}
        </div>

        <NexusWorkspaceResultMeta
          isUpdating={isSearchUpdating}
          onResetFilters={hasActiveFilters ? resetFilters : undefined}
          resultLabel={`${filteredPublications.length} publikasi ditemukan`}
          updatingLabel="Memperbarui hasil pencarian"
        />

        <NexusWorkspaceTableSection
          guidance={content.officialNote}
          summary={resultSummary}
          title="Daftar publikasi resmi"
          titleId="official-publications-title"
        >
          <NexusWorkspaceRecordTable
            caption="Publikasi resmi CoE BHT beserta metadata karya, kuartil, dan keterkaitan indikator KM"
            columns={columns}
            empty={
              <NexusWorkspaceEmptyState
                description={
                  records.length === 0
                    ? "Publikasi akan muncul setelah kandidat disetujui melalui proses Tinjauan."
                    : "Ubah kata kunci atau filter untuk melihat rekam resmi lain."
                }
                onResetFilters={hasActiveFilters ? resetFilters : undefined}
                title={
                  records.length === 0
                    ? "Belum ada publikasi resmi"
                    : "Tidak ada publikasi yang cocok"
                }
              />
            }
            isLoading={isSearchUpdating}
            pagination={
              <NexusTablePagination
                currentPage={safePage}
                itemCount={filteredPublications.length}
                navigationLabel="Navigasi halaman publikasi"
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

      {selectedPublication ? (
        <NexusPublicationDetail
          onClose={() => setSelectedPublicationId(null)}
          onSubmitCompletionProposal={submitCompletionProposal}
          proposal={completionProposals[selectedPublication.id]}
          publication={selectedPublication}
        />
      ) : null}
    </NexusWorkspacePage>
  );
}
