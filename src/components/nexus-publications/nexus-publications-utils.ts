import type {
  OfficialPublication,
  PublicationSourceName,
} from "@/components/nexus-publications/nexus-publications-content";

export type PublicationSourceId = "all" | "google-scholar" | "manual" | "sinta";

export function getPublicationSourceId(
  source: PublicationSourceName,
): Exclude<PublicationSourceId, "all"> {
  return source.toLocaleLowerCase("id-ID").replaceAll(" ", "-") as Exclude<
    PublicationSourceId,
    "all"
  >;
}

export function getPrimaryPublicationSource(publication: OfficialPublication) {
  return publication.provenance[0]?.source ?? "Manual";
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

export function normalizePublicationSearch(value: string) {
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLocaleLowerCase("id-ID")
    .trim();
}
