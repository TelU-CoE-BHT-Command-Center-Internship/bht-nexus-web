import {
  type OfficialPublication,
  type PublicationSourceName,
  publicationSourceNames,
} from "@/components/nexus-publications/nexus-publications-content";

export type PublicationSourceId =
  | "all"
  | "google-scholar"
  | "manual"
  | "sinta"
  | "workbook-km-2026";

const sourceIds: Record<PublicationSourceName, PublicationSourceId> = {
  "Google Scholar": "google-scholar",
  Manual: "manual",
  SINTA: "sinta",
  "Workbook KM 2026": "workbook-km-2026",
};

export function getPublicationSourceId(source: PublicationSourceName) {
  return sourceIds[source];
}

export function publicationHasSource(
  publication: OfficialPublication,
  sourceId: PublicationSourceId,
) {
  return (
    sourceId === "all" ||
    publication.provenance.some(
      (source) => getPublicationSourceId(source.source) === sourceId,
    )
  );
}

/** Tab sumber hanya memuat sumber yang benar-benar membentuk rekam resmi. */
export function getPublicationSourceTabs(
  publications: readonly OfficialPublication[],
) {
  return [
    { count: publications.length, id: "all", label: "Semua sumber" },
    ...publicationSourceNames
      .map((source) => ({
        count: publications.filter((publication) =>
          publicationHasSource(publication, getPublicationSourceId(source)),
        ).length,
        id: getPublicationSourceId(source),
        label: source,
      }))
      .filter((tab) => tab.count > 0),
  ];
}

export function normalizePublicationSearch(value: string) {
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLocaleLowerCase("id-ID")
    .trim();
}
