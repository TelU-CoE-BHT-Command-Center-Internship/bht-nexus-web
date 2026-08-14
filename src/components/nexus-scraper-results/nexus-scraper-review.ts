import type { Locale } from "@/i18n/locales";

/**
 * How one field of a candidate compares against the same field on an official
 * record. Ported from the Tinjauan implementation, generalised to work over any
 * candidate type rather than only publications.
 */
export type ComparisonStatus =
  | "different"
  | "empty"
  | "same"
  | "similar"
  | "unavailable";

export type CandidateDecision =
  | "approved_new"
  | "changes_requested"
  | "merged"
  | "rejected";

const comparisonLabels = {
  id: {
    different: "Berbeda",
    empty: "Kosong",
    same: "Sama",
    similar: "Serupa",
    unavailable: "Tidak tersedia",
  },
  en: {
    different: "Different",
    empty: "Empty",
    same: "Same",
    similar: "Similar",
    unavailable: "Unavailable",
  },
} satisfies Record<Locale, Record<ComparisonStatus, string>>;

const decisionLabels = {
  id: {
    approved_new: "Diterima sebagai data baru",
    changes_requested: "Perbaikan diminta",
    merged: "Dihubungkan ke data resmi",
    rejected: "Ditolak",
  },
  en: {
    approved_new: "Accepted as new record",
    changes_requested: "Changes requested",
    merged: "Linked to an official record",
    rejected: "Rejected",
  },
} satisfies Record<Locale, Record<CandidateDecision, string>>;

export function getComparisonLabel(
  locale: Locale,
  status: ComparisonStatus,
): string {
  return comparisonLabels[locale][status];
}

export function getDecisionLabel(
  locale: Locale,
  decision: CandidateDecision,
): string {
  return decisionLabels[locale][decision];
}

/** Strips `doi:` and resolver prefixes so two spellings of one DOI compare equal. */
export function normalizeDoi(value: string): string {
  return value
    .trim()
    .toLocaleLowerCase("en-US")
    .replace(/^doi:\s*/, "")
    .replace(/^https?:\/\/(?:dx\.)?doi\.org\//, "");
}

/**
 * Fields whose wording varies between sources without the meaning changing, so
 * an inexact match reads as `similar` rather than `different`.
 */
const proseFields = new Set(["authors", "title", "venue", "partner", "scheme"]);

export function getComparisonStatus(
  fieldId: string,
  candidateValue: string,
  officialValue: string,
): ComparisonStatus {
  if (!candidateValue) {
    return "unavailable";
  }

  if (!officialValue) {
    return "empty";
  }

  const normalize = (value: string) =>
    fieldId === "doi"
      ? normalizeDoi(value)
      : value.trim().toLocaleLowerCase("id-ID");

  if (normalize(candidateValue) === normalize(officialValue)) {
    return "same";
  }

  return proseFields.has(fieldId) ? "similar" : "different";
}
