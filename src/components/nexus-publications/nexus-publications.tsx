"use client";

import { useCallback, useDeferredValue, useMemo, useState } from "react";
import { NexusPublicationDetail } from "@/components/nexus-publications/nexus-publication-detail";
import styles from "@/components/nexus-publications/nexus-publications.module.css";
import type {
  NexusPublicationsContent,
  OfficialPublication,
  PublicationCompletionResolutions,
  PublicationMetadataProposal,
} from "@/components/nexus-publications/nexus-publications-content";
import { NexusPublicationsIcon } from "@/components/nexus-publications/nexus-publications-icons";
import { NexusPublicationsTable } from "@/components/nexus-publications/nexus-publications-table";
import {
  normalizePublicationSearch,
  type PublicationSourceId,
  publicationHasSource,
} from "@/components/nexus-publications/nexus-publications-utils";
import {
  NexusWorkspaceSearch,
  NexusWorkspaceTabs,
} from "@/components/nexus-workspace-ui/nexus-workspace-controls";
import {
  NexusWorkspaceMetrics,
  NexusWorkspacePage,
} from "@/components/nexus-workspace-ui/nexus-workspace-page";
import {
  type NexusSelectConfig,
  type NexusSelectOption,
  NexusWorkspaceSelect,
} from "@/components/nexus-workspace-ui/nexus-workspace-select";

type NexusPublicationsProps = {
  content: NexusPublicationsContent;
};

type PublicationFilterId = "publication-type" | "quality" | "sort" | "year";
type PublicationFilterValues = Record<PublicationFilterId, string>;

const defaultFilterValues: PublicationFilterValues = {
  "publication-type": "all",
  quality: "all",
  sort: "newest",
  year: "all",
};

const sourceTabs = [
  { id: "all", label: "Semua" },
  { id: "sinta", label: "SINTA" },
  { id: "google-scholar", label: "Google Scholar" },
  { id: "manual", label: "Manual" },
] as const satisfies readonly {
  id: PublicationSourceId;
  label: string;
}[];

function toNonEmptyOptions(
  firstOption: NexusSelectOption,
  remainingOptions: readonly NexusSelectOption[],
): NexusSelectConfig["options"] {
  return [firstOption, ...remainingOptions];
}

function createFilterConfigs(content: NexusPublicationsContent) {
  const years = Array.from(
    new Set(content.records.map((publication) => publication.year)),
  ).sort((first, second) => second - first);
  const publicationTypes = Array.from(
    new Set(content.records.map((publication) => publication.type)),
  ).sort((first, second) => first.localeCompare(second, "id-ID"));

  return [
    {
      defaultValue: "all",
      id: "publication-type",
      label: "Jenis publikasi",
      options: toNonEmptyOptions(
        { label: "Semua jenis", value: "all" },
        publicationTypes.map((type) => ({ label: type, value: type })),
      ),
    },
    {
      defaultValue: "all",
      id: "year",
      label: "Tahun terbit",
      options: toNonEmptyOptions(
        { label: "Semua tahun", value: "all" },
        years.map((year) => ({ label: String(year), value: String(year) })),
      ),
    },
    {
      defaultValue: "all",
      id: "quality",
      label: "Kelengkapan metadata",
      options: [
        { label: "Semua kelengkapan", value: "all" },
        { label: "Lengkap", tone: "completed", value: "Lengkap" },
        {
          label: "Perlu dilengkapi",
          tone: "needs-fix",
          value: "Perlu dilengkapi",
        },
      ],
    },
    {
      defaultValue: "newest",
      id: "sort",
      label: "Urutan publikasi",
      options: [
        { label: "Urutan: Terbaru", value: "newest" },
        { label: "Urutan: Terlama", value: "oldest" },
        { label: "Judul A–Z", value: "title" },
      ],
    },
  ] as const satisfies readonly NexusSelectConfig[];
}

function sortPublications(
  publications: readonly OfficialPublication[],
  sortValue: string,
) {
  return publications.toSorted((first, second) => {
    if (sortValue === "title") {
      return first.title.localeCompare(second.title, "id-ID");
    }
    if (sortValue === "oldest") {
      return (
        first.year - second.year || first.title.localeCompare(second.title)
      );
    }
    return second.year - first.year || first.title.localeCompare(second.title);
  });
}

export function NexusPublications({ content }: NexusPublicationsProps) {
  const filterConfigs = useMemo(() => createFilterConfigs(content), [content]);
  const [activeSourceId, setActiveSourceId] =
    useState<PublicationSourceId>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [completionProposals, setCompletionProposals] = useState<
    Record<string, PublicationMetadataProposal>
  >({});
  const [filterValues, setFilterValues] =
    useState<PublicationFilterValues>(defaultFilterValues);
  const [openFilterId, setOpenFilterId] = useState<string | null>(null);
  const [pageSizeValue, setPageSizeValue] = useState("10");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPublicationId, setSelectedPublicationId] = useState<
    string | null
  >(null);
  const deferredSearchQuery = useDeferredValue(searchQuery);
  const normalizedSearch = normalizePublicationSearch(deferredSearchQuery);
  const activeSource =
    sourceTabs.find((source) => source.id === activeSourceId) ?? sourceTabs[0];
  const sourceCounts = useMemo(() => {
    const counts: Record<PublicationSourceId, number> = {
      all: content.records.length,
      "google-scholar": 0,
      manual: 0,
      sinta: 0,
    };

    for (const publication of content.records) {
      for (const source of sourceTabs.slice(1)) {
        if (publicationHasSource(publication, source.id)) {
          counts[source.id] += 1;
        }
      }
    }

    return counts;
  }, [content.records]);
  const tabs = sourceTabs.map((source) => ({
    count: sourceCounts[source.id],
    id: source.id,
    label: source.label,
  }));
  const filteredPublications = useMemo(() => {
    const matchingPublications = content.records.filter((publication) => {
      const searchableContent = normalizePublicationSearch(
        [
          publication.title,
          publication.publicId,
          publication.owner.name,
          publication.authors.join(" "),
          publication.doi ?? "",
          publication.venue,
          publication.provenance.map((source) => source.source).join(" "),
        ].join(" "),
      );

      return (
        publicationHasSource(publication, activeSource.id) &&
        (filterValues["publication-type"] === "all" ||
          publication.type === filterValues["publication-type"]) &&
        (filterValues.year === "all" ||
          publication.year === Number(filterValues.year)) &&
        (filterValues.quality === "all" ||
          publication.quality === filterValues.quality) &&
        (normalizedSearch.length === 0 ||
          searchableContent.includes(normalizedSearch))
      );
    });

    return sortPublications(matchingPublications, filterValues.sort);
  }, [activeSource.id, content.records, filterValues, normalizedSearch]);
  const selectedPublication = content.records.find(
    (publication) => publication.id === selectedPublicationId,
  );
  const latestPublicationYear = content.records.reduce<number | null>(
    (latestYear, publication) =>
      latestYear === null
        ? publication.year
        : Math.max(latestYear, publication.year),
    null,
  );
  const latestYearCount = content.records.filter(
    (publication) => publication.year === latestPublicationYear,
  ).length;
  const needsCompletionCount = content.records.filter(
    (publication) => publication.quality === "Perlu dilengkapi",
  ).length;
  const metrics = [
    {
      icon: <NexusPublicationsIcon name="book" />,
      id: "official-publications",
      label: "Publikasi Resmi",
      tone: "completed" as const,
      unit: "data",
      value: content.records.length,
    },
    {
      icon: <NexusPublicationsIcon name="calendar" />,
      id: "latest-year",
      label:
        latestPublicationYear === null
          ? "Tahun Terbaru"
          : `Terbit ${latestPublicationYear}`,
      tone: "waiting" as const,
      unit: "data",
      value: latestYearCount,
    },
    {
      icon: <NexusPublicationsIcon name="alert" />,
      id: "needs-completion",
      label: "Perlu Dilengkapi",
      tone: "needs-fix" as const,
      unit: "data",
      value: needsCompletionCount,
    },
  ];
  const isSearchUpdating = searchQuery !== deferredSearchQuery;
  const hasActiveFilters =
    activeSource.id !== "all" ||
    searchQuery.length > 0 ||
    Object.entries(defaultFilterValues).some(
      ([filterId, defaultValue]) =>
        filterValues[filterId as PublicationFilterId] !== defaultValue,
    );

  const closeDetail = useCallback(() => setSelectedPublicationId(null), []);

  const submitCompletionProposal = (
    publicationId: string,
    resolutions: PublicationCompletionResolutions,
    note: string,
  ) => {
    setCompletionProposals((currentProposals) => ({
      ...currentProposals,
      [publicationId]: {
        id: `PLG-2026-${String(Object.keys(currentProposals).length + 1).padStart(5, "0")}`,
        note,
        publicationId,
        status: "waiting-review",
        submittedAt: "Baru saja",
        submittedBy: "Muhammad Ammar Asyraf",
        resolutions,
      },
    }));
  };

  const changeFilterValue = (filterId: string, value: string) => {
    setFilterValues((currentValues) => ({
      ...currentValues,
      [filterId as PublicationFilterId]: value,
    }));
    setCurrentPage(1);
  };

  const resetFilters = () => {
    setActiveSourceId("all");
    setFilterValues(defaultFilterValues);
    setSearchQuery("");
    setCurrentPage(1);
  };

  return (
    <NexusWorkspacePage
      description={content.description}
      descriptionId="publications-description"
      meta={content.updatedAt}
      title={content.title}
      titleId="publications-title"
    >
      <NexusWorkspaceMetrics metrics={metrics} />

      <div className={styles.filters}>
        <NexusWorkspaceTabs
          activeId={activeSource.id}
          label="Filter publikasi berdasarkan sumber data"
          onActiveChange={(sourceId) => {
            setActiveSourceId(sourceId as PublicationSourceId);
            setCurrentPage(1);
          }}
          panelId="publication-source-panel"
          tabs={tabs}
        />

        <div
          aria-label={`Sumber ${activeSource.label}`}
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
            placeholder="Cari judul, DOI, penulis, atau pemilik..."
            value={searchQuery}
          />

          {filterConfigs.map((filter) => (
            <NexusWorkspaceSelect
              config={filter}
              isOpen={openFilterId === filter.id}
              key={filter.id}
              name={`publication-${filter.id}`}
              onOpenChange={(isOpen) =>
                setOpenFilterId(isOpen ? filter.id : null)
              }
              onValueChange={(value) => changeFilterValue(filter.id, value)}
              placement="top-on-narrow"
              value={
                filterValues[filter.id as PublicationFilterId] ??
                filter.defaultValue
              }
            />
          ))}
        </div>

        <div aria-live="polite" className={styles.resultMeta}>
          <p>
            {isSearchUpdating
              ? "Memperbarui hasil pencarian..."
              : `${filteredPublications.length} publikasi ditemukan`}
          </p>
          {hasActiveFilters ? (
            <button
              className={styles.resetButton}
              onClick={resetFilters}
              type="button"
            >
              Atur ulang filter
            </button>
          ) : null}
        </div>

        <NexusPublicationsTable
          activeSourceLabel={activeSource.label}
          activeSourceId={activeSource.id}
          currentPage={currentPage}
          guidance={content.officialNote}
          completionProposalIds={Object.keys(completionProposals)}
          hasActiveFilters={hasActiveFilters}
          isLoading={isSearchUpdating}
          onOpenPublication={setSelectedPublicationId}
          onPageChange={setCurrentPage}
          onPageSizeChange={(value) => {
            setPageSizeValue(value);
            setCurrentPage(1);
          }}
          onResetFilters={resetFilters}
          pageSizeValue={pageSizeValue}
          publications={filteredPublications}
          sourcePublicationCount={sourceCounts[activeSource.id]}
          totalPublicationCount={content.records.length}
        />
      </div>

      {selectedPublication ? (
        <NexusPublicationDetail
          onClose={closeDetail}
          onSubmitCompletionProposal={submitCompletionProposal}
          proposal={completionProposals[selectedPublication.id]}
          publication={selectedPublication}
        />
      ) : null}
    </NexusWorkspacePage>
  );
}
