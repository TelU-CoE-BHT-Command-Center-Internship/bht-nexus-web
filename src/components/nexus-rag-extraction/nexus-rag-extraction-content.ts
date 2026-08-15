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
  reviewHref: string;
  reviewLinkLabel: string;
  selectedProfileId: string;
  sendLabel: string;
  sentLabel: string;
  sourceLabel: string;
  title: string;
};

const fields = {
  id: [
    {
      decision: "accepted",
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
      decision: "accepted",
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
    acceptLabel: "Terima",
    acceptedLabel: "Diterima",
    candidateOwner: "Belum ditetapkan",
    candidatePrimaryParty: "Tim Riset Telemedisin CoE BHT",
    description:
      "Periksa setiap kandidat isian beserta potongan sumber sebelum mengirimkannya ke antrean Tinjauan.",
    documentMeta: "PDF · 10 halaman · selesai diproses",
    documentTitle: "Ringkasan Kegiatan Telemedisin Layanan Primer",
    fieldsTitle: "Kandidat isian",
    notFoundLabel: "Tidak ditemukan pada dokumen",
    pageLabel: "Halaman",
    pendingDecisionLabel: "Menunggu keputusan",
    profileLabel: "Profil ekstraksi",
    profileOptions: [
      { id: "activity", label: "Kegiatan riset", version: "v1" },
      { id: "publication", label: "Publikasi", version: "v1" },
      {
        id: "community_service",
        label: "Pengabdian masyarakat",
        version: "v1",
      },
    ],
    rejectLabel: "Tolak",
    rejectedLabel: "Ditolak",
    reviewHref: "/nexus/tinjauan",
    reviewLinkLabel: "Buka Tinjauan",
    selectedProfileId: "activity",
    sendLabel: "Kirim kandidat ke Tinjauan",
    sentLabel:
      "Kandidat ekstraksi sudah ditambahkan ke antrean Tinjauan pada sesi ini.",
    sourceLabel: "Potongan sumber",
    title: "Ekstraksi Dokumen",
  },
  en: {
    acceptLabel: "Accept",
    acceptedLabel: "Accepted",
    candidateOwner: "Not assigned",
    candidatePrimaryParty: "CoE BHT Telemedicine Research Team",
    description:
      "Check every candidate field and its source passage before sending it to the Reviews queue.",
    documentMeta: "PDF · 10 pages · processing complete",
    documentTitle: "Primary Care Telemedicine Activity Summary",
    fieldsTitle: "Candidate fields",
    notFoundLabel: "Not found in the document",
    pageLabel: "Page",
    pendingDecisionLabel: "Awaiting decision",
    profileLabel: "Extraction profile",
    profileOptions: [
      { id: "activity", label: "Research activity", version: "v1" },
      { id: "publication", label: "Publication", version: "v1" },
      { id: "community_service", label: "Community service", version: "v1" },
    ],
    rejectLabel: "Reject",
    rejectedLabel: "Rejected",
    reviewHref: "/en/nexus/reviews",
    reviewLinkLabel: "Open Reviews",
    selectedProfileId: "activity",
    sendLabel: "Send candidates to Reviews",
    sentLabel:
      "The extracted candidates were added to the Reviews queue for this session.",
    sourceLabel: "Source passage",
    title: "Document Extraction",
  },
} satisfies Record<
  Locale,
  Omit<NexusRagExtractionContent, "fields" | "locale">
>;

export function getNexusRagExtractionContent(
  locale: Locale,
): NexusRagExtractionContent {
  return { ...copy[locale], fields: fields[locale], locale };
}
