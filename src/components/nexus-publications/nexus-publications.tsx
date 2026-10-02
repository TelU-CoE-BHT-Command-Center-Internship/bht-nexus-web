"use client";

import dynamic from "next/dynamic";
import { useDeferredValue, useMemo, useState } from "react";
import { NexusHouseRecordActions } from "@/components/nexus-import/nexus-house-record-actions";
import { NexusMemberContextFilter } from "@/components/nexus-members/nexus-member-context";
import { toCompletionProposals } from "@/components/nexus-metadata-completion/nexus-metadata-completion-proposals";
import {
  useNexusMemberName,
  useNexusPublicationCatalog,
  useNexusPublicationDetail,
} from "@/components/nexus-publications/nexus-publication-server";
import styles from "@/components/nexus-publications/nexus-publications.module.css";
import {
  type NexusPublicationsContent,
  type NexusPublicationView,
  type PublicationCompletionResolutions,
  type PublicationIndicatorId,
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
import { useOptionalNexusReviewSession } from "@/components/nexus-review-session/nexus-review-session";
import { officialKpiEmptyCopy } from "@/components/nexus-workspace-ui/nexus-official-kpi";
import { NexusTablePagination } from "@/components/nexus-workspace-ui/nexus-table-pagination";
import {
  NexusWorkspaceSearch,
  NexusWorkspaceTabs,
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
import { requestPublicationCompletion } from "@/lib/api-publications";

const NexusPublicationDetail = dynamic(() =>
  import("@/components/nexus-publications/nexus-publication-detail").then(
    (module) => module.NexusPublicationDetail,
  ),
);

type NexusPublicationsProps = {
  /** Antrean Tinjauan dapat dibuka oleh akun ini. */
  canOpenReviews: boolean;
  /** Direktori anggota dapat dibaca, sehingga filter anggota menampilkan nama. */
  canReadMembers: boolean;
  content: Pick<
    NexusPublicationsContent,
    "description" | "officialNote" | "title"
  >;
  initialMemberId?: string;
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

function isTopQuartile(publication: NexusPublicationView) {
  return publication.quartile === "Q1" || publication.quartile === "Q2";
}

function matchesIndicatorFilter(
  publication: NexusPublicationView,
  value: string,
) {
  if (value === "all") return true;
  if (value === unlinkedIndicatorValue) return publication.kmLinks.length === 0;
  return publication.kmLinks.some((link) => link.indicator.id === value);
}

function matchesQuartileFilter(
  publication: NexusPublicationView,
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

function matchesYearFilter(publication: NexusPublicationView, value: string) {
  if (value === "all") return true;
  if (value === unknownYearValue) return publication.year === undefined;
  return publication.year === Number(value);
}

function searchableText(publication: NexusPublicationView) {
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
  publications: readonly NexusPublicationView[],
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
  publications: readonly NexusPublicationView[],
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
function KmLinkCell({ publication }: { publication: NexusPublicationView }) {
  const [firstLink, ...otherLinks] = publication.kmLinks;

  if (!firstLink) {
    /* Kolom ini sempit: penanda ringkas di tabel, kalimat lengkap di rincian. */
    const emptyCopy = officialKpiEmptyCopy(publication.kpiResolutionStatus);
    return (
      <span className={styles.kmCell} title={emptyCopy.label}>
        <strong data-empty="true">{emptyCopy.shortLabel}</strong>
        <small>{publication.type}</small>
      </span>
    );
  }

  return (
    <span className={styles.kmCell}>
      <strong>
        {otherLinks.length > 0
          ? `${firstLink.indicator.id} +${otherLinks.length}`
          : firstLink.indicator.id}
      </strong>
      <small>{publication.type}</small>
    </span>
  );
}

function QuartileCell({ publication }: { publication: NexusPublicationView }) {
  const state = publicationQuartileState(publication);
  if (state !== "available" && state !== "unresolved") {
    return (
      <NexusWorkspaceTableText>
        {publicationQuartileLabel(publication)}
      </NexusWorkspaceTableText>
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

export function NexusPublications({
  canOpenReviews,
  canReadMembers,
  content,
  initialMemberId,
}: NexusPublicationsProps) {
  const catalog = useNexusPublicationCatalog(initialMemberId);
  const reviewSession = useOptionalNexusReviewSession();
  const [completionError, setCompletionError] = useState("");
  const records = catalog.records;
  const isCatalogLoading = catalog.state === "loading";
  const memberName = useNexusMemberName(initialMemberId, canReadMembers);
  const [activeSourceId, setActiveSourceId] =
    useState<PublicationSourceId>("all");
  const [currentPage, setCurrentPage] = useState(1);
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
  /* Filter anggota sudah diterapkan server lewat `memberPublicId`. */
  const contextRecords = records;

  const sourceTabs = useMemo(
    () => getPublicationSourceTabs(contextRecords),
    [contextRecords],
  );
  const indicatorConfig = useMemo(
    () => createIndicatorConfig(contextRecords),
    [contextRecords],
  );
  const yearConfig = useMemo(
    () => createYearConfig(contextRecords),
    [contextRecords],
  );
  const activeSource =
    sourceTabs.find((source) => source.id === activeSourceId) ?? sourceTabs[0];

  const filteredPublications = useMemo(() => {
    const needle = normalizeWorkspaceSearch(deferredSearchQuery);
    const matching = contextRecords.filter(
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
  }, [activeSource.id, contextRecords, deferredSearchQuery, filterValues]);

  const evaluationPeriods = Array.from(
    new Set(
      (contextRecords.length > 0 ? contextRecords : records).map(
        (publication) => publication.evaluationPeriod,
      ),
    ),
  )
    .toSorted()
    .join(", ");
  const topQuartileCount = contextRecords.filter(isTopQuartile).length;
  const needsCompletionCount = contextRecords.filter(
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
  const publicationDetail = useNexusPublicationDetail(selectedPublicationId);
  const selectedSummary = contextRecords.find(
    (publication) => publication.id === selectedPublicationId,
  );
  const selectedPublication = publicationDetail.record ?? selectedSummary;
  const activeFilterCount = Object.entries(defaultFilterValues).filter(
    ([filterId, defaultValue]) =>
      filterValues[filterId as PublicationFilterId] !== defaultValue,
  ).length;
  // REQ-FUNC-026: filter aktif, periode, satuan, sumber, dan waktu pembaruan
  // harus terbaca pada hasil, bukan hanya pada kontrolnya.
  const resultSummary = [
    `Sumber ${activeSource.label}`,
    ...(evaluationPeriods ? [`periode evaluasi ${evaluationPeriods}`] : []),
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
    if (!reviewSession) return;
    setCompletionError("");
    requestPublicationCompletion(publicationId, {
      note,
      proposals: toCompletionProposals(resolutions),
    })
      .then(() => {
        reviewSession.createCompletionProposal(
          "PLG-2026",
          publicationId,
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

  const rows = visiblePublications.map((publication) => {
    const title = publicationDisplayTitle(publication);
    const primarySource =
      publication.provenance.find(
        (item) => getPublicationSourceId(item.source) === activeSource.id,
      )?.source ?? publication.provenance[0]?.source;
    const subtitle = [publicationAuthorNames(publication), publication.venue]
      .filter(Boolean)
      .join(" · ");
    // Glaukoma punya dua baris workbook dari SATU sistem sumber. Badge +N
    // harus menghitung sistem sumber yang berbeda, bukan jumlah jejaknya.
    const extraSourceCount =
      new Set(publication.provenance.map((item) => item.source)).size - 1;
    const open = () => setSelectedPublicationId(publication.id);
    const sourceBadge = primarySource ? (
      <NexusWorkspaceTableBadge
        key={`${publication.id}-source`}
        tone={sourceTone(primarySource)}
      >
        {primarySource}
        {extraSourceCount > 0 ? ` +${extraSourceCount}` : ""}
      </NexusWorkspaceTableBadge>
    ) : (
      <NexusWorkspaceTableBadge key={`${publication.id}-source`}>
        Belum tercatat
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
                : publication.citationProvider
                  ? `${publication.citationProvider} · berkala`
                  : "sitasi tercatat"
            }
            tone={publication.citations === null ? "neutral" : "info"}
          />
        ),
        primary: (
          <NexusWorkspaceTablePrimary
            onClick={open}
            subtitle={subtitle || undefined}
            title={title}
          />
        ),
        quartile: <QuartileCell publication={publication} />,
        signal: <KmLinkCell publication={publication} />,
        source: sourceBadge,
        status: qualityBadge,
        year: (
          <NexusWorkspaceTableText>
            {publication.year ?? "Belum tercatat"}
          </NexusWorkspaceTableText>
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
              {/* Tanpa judul kolom, penanda "Belum tercatat" tidak menjelaskan apa pun. */}
              {primarySource ? sourceBadge : null}
              {qualityBadge}
            </>
          }
          meta={
            <dl>
              <div>
                <dt>Indikator</dt>
                <dd>
                  {publication.kmLinks.length === 0
                    ? officialKpiEmptyCopy(publication.kpiResolutionStatus)
                        .label
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
                    : publication.citationProvider
                      ? `${publication.citations} · ${publication.citationProvider}`
                      : publication.citations}
                </dd>
              </div>
            </dl>
          }
          title={title}
        >
          {subtitle ? (
            <NexusWorkspaceMobileSubtitle>
              {subtitle}
            </NexusWorkspaceMobileSubtitle>
          ) : null}
        </NexusWorkspaceMobileCard>
      ),
    };
  });

  return (
    <NexusWorkspacePage
      clusterScope
      actions={
        <NexusHouseRecordActions
          domain="publication"
          label="Ajukan publikasi"
        />
      }
      description={content.description}
      descriptionId="publications-description"
      meta={
        catalog.loadedAt ? formatPageUpdatedLabel(catalog.loadedAt) : undefined
      }
      title={content.title}
      titleId="publications-title"
    >
      {completionError ? (
        <NexusWorkspaceNotice tone="danger">
          {completionError}
        </NexusWorkspaceNotice>
      ) : null}
      <NexusMemberContextFilter
        clearHref="/nexus/publikasi"
        memberId={initialMemberId}
        memberName={memberName}
      />
      <NexusWorkspaceMetrics
        metrics={[
          {
            icon: <NexusPublicationsIcon name="book" />,
            id: "official-publications",
            label: "Publikasi Resmi",
            tone: "completed",
            unit: "data",
            value: isCatalogLoading ? null : contextRecords.length,
          },
          {
            icon: <NexusPublicationsIcon name="quartile" />,
            id: "top-quartile",
            label: "Setara Q1/Q2",
            tone: "waiting",
            unit: "data",
            value: isCatalogLoading ? null : topQuartileCount,
          },
          {
            icon: <NexusPublicationsIcon name="alert" />,
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
        labelledBy="official-publications-title"
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

        <NexusWorkspaceToolbar id="publication-source-panel" role="tabpanel">
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
        </NexusWorkspaceToolbar>

        {catalog.state === "error" ? null : (
          <NexusWorkspaceResultMeta
            isUpdating={isSearchUpdating}
            onResetFilters={hasActiveFilters ? resetFilters : undefined}
            resultLabel={`${filteredPublications.length} publikasi ditemukan`}
            updatingLabel="Memperbarui hasil pencarian"
          />
        )}

        <NexusWorkspaceTableSection
          guidance={content.officialNote}
          summary={catalog.state === "error" ? undefined : resultSummary}
          title="Daftar publikasi resmi"
          titleId="official-publications-title"
        >
          <NexusWorkspaceRecordTable
            caption="Publikasi resmi CoE BHT beserta metadata karya, kuartil, dan keterkaitan indikator KM"
            columns={columns}
            empty={
              <NexusWorkspaceEmptyState
                description={
                  records.length > 0
                    ? "Ubah kata kunci atau filter untuk melihat rekam resmi lain."
                    : initialMemberId
                      ? "Anggota ini belum tercatat sebagai penulis pada publikasi resmi."
                      : "Publikasi akan muncul setelah kandidat disetujui melalui proses Tinjauan."
                }
                onResetFilters={hasActiveFilters ? resetFilters : undefined}
                title={
                  records.length > 0
                    ? "Tidak ada publikasi yang cocok"
                    : initialMemberId
                      ? "Belum ada publikasi untuk anggota ini"
                      : "Belum ada publikasi resmi"
                }
              />
            }
            error={
              catalog.state === "error" ? (
                <NexusWorkspaceLoadError
                  description={
                    catalog.errorMessage ??
                    "Publikasi resmi belum dapat dimuat."
                  }
                  onRetry={catalog.retry}
                  title="Publikasi resmi belum dapat dimuat"
                />
              ) : undefined
            }
            isLoading={isSearchUpdating || isCatalogLoading}
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
      </NexusWorkspaceCatalog>

      {selectedPublication ? (
        <NexusPublicationDetail
          authorsState={
            publicationDetail.state === "error"
              ? "error"
              : publicationDetail.record
                ? "ready"
                : "loading"
          }
          canOpenReviews={canOpenReviews}
          onClose={() => setSelectedPublicationId(null)}
          onRetryAuthors={publicationDetail.retry}
          onSubmitCompletionProposal={
            reviewSession ? submitCompletionProposal : undefined
          }
          proposal={reviewSession?.completionProposals[selectedPublication.id]}
          publication={selectedPublication}
        />
      ) : null}
    </NexusWorkspacePage>
  );
}
