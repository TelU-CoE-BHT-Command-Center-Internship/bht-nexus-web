import { getNexusDocumentRecords } from "@/components/nexus-document-workspace/nexus-document-content";
import type { Locale } from "@/i18n/locales";

export type ExtractionProfileOption = {
  id: string;
  label: string;
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
  fields: ExtractionField[];
  fieldsTitle: string;
  locale: Locale;
  notFoundLabel: string;
  pageLabel: string;
  pendingDecisionLabel: string;
  profileLabel: string;
  profileOptions: ExtractionProfileOption[];
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

const fields = {
  id: [
    {
      decision: "pending",
      id: "activity_title",
      label: "Judul kegiatan",
      source: {
        page: 1,
        quote:
          "Kegiatan berfokus pada evaluasi penerapan telemedisin untuk mendukung layanan primer.",
      },
      value: "Evaluasi Penerapan Telemedisin untuk Layanan Primer",
    },
    {
      decision: "pending",
      id: "activity_team",
      label: "Tim pelaksana",
      source: {
        page: 2,
        quote: "Kegiatan dilaksanakan oleh tim riset Telemedisin CoE BHT.",
      },
      value: "Tim Riset Telemedisin CoE BHT",
    },
    {
      decision: "pending",
      id: "implementation_period",
      label: "Periode pelaksanaan",
      source: {
        page: 3,
        quote: "Evaluasi dilaksanakan pada Maret sampai November 2026.",
      },
      value: "Maret–November 2026",
    },
    {
      decision: "pending",
      id: "primary_output",
      label: "Luaran utama",
      source: {
        page: 8,
        quote:
          "Luaran kegiatan berupa ringkasan evaluasi implementasi dan rekomendasi tindak lanjut.",
      },
      value: "Ringkasan evaluasi dan rekomendasi tindak lanjut",
    },
    {
      decision: "pending",
      id: "external_identifier",
      label: "Pengenal eksternal",
      source: null,
      value: "",
    },
  ],
  en: [
    {
      decision: "pending",
      id: "activity_title",
      label: "Activity title",
      source: {
        page: 1,
        quote:
          "The activity focuses on evaluating telemedicine adoption in support of primary care.",
      },
      value: "Evaluating Telemedicine Adoption for Primary Care",
    },
    {
      decision: "pending",
      id: "activity_team",
      label: "Delivery team",
      source: {
        page: 2,
        quote: "The activity is delivered by the CoE BHT Telemedicine team.",
      },
      value: "CoE BHT Telemedicine Research Team",
    },
    {
      decision: "pending",
      id: "implementation_period",
      label: "Delivery period",
      source: {
        page: 3,
        quote: "The evaluation runs from March through November 2026.",
      },
      value: "March–November 2026",
    },
    {
      decision: "pending",
      id: "primary_output",
      label: "Primary output",
      source: {
        page: 8,
        quote:
          "The activity produces an implementation evaluation summary and follow-up recommendations.",
      },
      value: "Evaluation summary and follow-up recommendations",
    },
    {
      decision: "pending",
      id: "external_identifier",
      label: "External identifier",
      source: null,
      value: "",
    },
  ],
} satisfies Record<Locale, ExtractionField[]>;

const copy = {
  id: {
    acceptLabel: "Sertakan",
    acceptedLabel: "Disertakan",
    candidateOwner: "Belum ditetapkan",
    candidatePrimaryParty: "Tim Riset Telemedisin CoE BHT",
    description:
      "Periksa setiap kandidat isian beserta potongan sumber sebelum mengirimkannya ke antrean Tinjauan.",
    fieldsTitle: "Kandidat isian",
    notFoundLabel: "Tidak ditemukan pada dokumen",
    pageLabel: "Halaman",
    pendingDecisionLabel: "Menunggu keputusan",
    profileLabel: "Profil ekstraksi",
    profileOptions: [
      { id: "activity", label: "Kegiatan riset", version: "v1" },
    ],
    rejectLabel: "Jangan sertakan",
    rejectedLabel: "Tidak disertakan",
    reviewHref: "/nexus/tinjauan",
    reviewUnavailableLabel: "",
    selectedProfileId: "activity",
    sendLabel: "Kirim kandidat ke Tinjauan",
    sourceLabel: "Potongan sumber",
    title: "Ekstraksi Dokumen",
  },
  en: {
    acceptLabel: "Include",
    acceptedLabel: "Included",
    candidateOwner: "Not assigned",
    candidatePrimaryParty: "CoE BHT Telemedicine Research Team",
    description:
      "Check every candidate field and its source passage. Candidate submission is currently completed in the Indonesian workspace.",
    fieldsTitle: "Candidate fields",
    notFoundLabel: "Not found in the document",
    pageLabel: "Page",
    pendingDecisionLabel: "Awaiting decision",
    profileLabel: "Extraction profile",
    profileOptions: [
      { id: "activity", label: "Research activity", version: "v1" },
    ],
    rejectLabel: "Exclude",
    rejectedLabel: "Excluded",
    reviewUnavailableLabel:
      "Continue in Indonesian to review extracted fields and submit a candidate.",
    selectedProfileId: "activity",
    sendLabel: "Send candidates for review",
    sourceLabel: "Source passage",
    title: "Document Extraction",
  },
} satisfies Record<
  Locale,
  Omit<
    NexusRagExtractionContent,
    | "documentId"
    | "documentMeta"
    | "documentTitle"
    | "fields"
    | "locale"
    | "requestError"
  >
>;

export function getNexusRagExtractionContent(
  locale: Locale,
  requestedDocumentId?: string,
): NexusRagExtractionContent {
  const documents = getNexusDocumentRecords(locale);
  const requestedDocument = documents.find(
    (document) =>
      document.id === requestedDocumentId &&
      document.status === "succeeded" &&
      document.capabilities.includes("extraction"),
  );
  const document =
    requestedDocument ??
    documents.find(
      (item) =>
        item.status === "succeeded" && item.capabilities.includes("extraction"),
    );

  if (!document) {
    throw new Error("No processed document is available for extraction");
  }

  return {
    ...copy[locale],
    documentId: document.id,
    documentMeta: `${document.fileLabel} · ${document.statusLabel}`,
    documentTitle: document.title,
    fields: fields[locale],
    locale,
    requestError:
      requestedDocumentId && !requestedDocument
        ? locale === "id"
          ? "Dokumen yang diminta tidak tersedia atau belum siap diekstrak. Pilih dokumen berstatus selesai dari pustaka dokumen."
          : "The requested document is unavailable or not ready for extraction. Choose a processed document from the document library."
        : undefined,
  };
}
