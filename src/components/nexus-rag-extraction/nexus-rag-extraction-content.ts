import type { AuditReviewCategory } from "@/components/nexus-audit-review/nexus-audit-review-content";
import type { Locale } from "@/i18n/locales";

export type ExtractionProfileDefinition = {
  category: AuditReviewCategory;
  categoryLabel: string;
  fieldIds: readonly string[];
  id: string;
  label: string;
  titleFieldId: string;
  typeLabel: string;
  version: string;
};

export type ExtractionFieldSource = {
  page: number;
  quote: string;
};

export type ExtractionFieldDecision = "accepted" | "pending" | "rejected";

export type ExtractionField = {
  decision: ExtractionFieldDecision;
  id: string;
  label: string;
  source: ExtractionFieldSource | null;
  value: string;
};

export type NexusRagExtractionContent = {
  acceptLabel: string;
  acceptedLabel: string;
  candidateOwner: string;
  candidatePrimaryParty: string;
  description: string;
  documentId: string;
  documentMeta: string;
  documentTitle: string;
  /** Identitas proses ekstraksi; satu run hanya boleh membentuk satu kandidat. */
  extractionRunId: string;
  fields: ExtractionField[];
  fieldsTitle: string;
  locale: Locale;
  notFoundLabel: string;
  pageLabel: string;
  pendingDecisionLabel: string;
  profileLabel: string;
  profileOptions: ExtractionProfileDefinition[];
  rejectLabel: string;
  rejectedLabel: string;
  requestError?: string;
  reviewHref?: string;
  reviewUnavailableLabel: string;
  selectedProfileId: string;
  sendLabel: string;
  sourceLabel: string;
  title: string;
};

const pageCopy = {
  id: {
    description:
      "Periksa setiap kandidat isian beserta potongan sumber sebelum mengirimkannya ke antrean Tinjauan.",
    title: "Ekstraksi Dokumen",
  },
  en: {
    description:
      "Check every candidate field and its source passage before it goes to the Review queue.",
    title: "Document Extraction",
  },
} satisfies Record<Locale, { description: string; title: string }>;

export function getExtractionPageCopy(locale: Locale) {
  return pageCopy[locale];
}
