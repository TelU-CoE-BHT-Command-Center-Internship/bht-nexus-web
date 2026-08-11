import type { Locale } from "@/i18n/locales";

export type ExtractionProfileOption = {
  id: string;
  label: string;
  version: string;
};

export type ExtractionFieldSource = {
  chunkLabel: string;
  page: number;
  quote: string;
};

export type ExtractionFieldDecision = "accepted" | "pending" | "rejected";

export type ExtractionField = {
  decision: ExtractionFieldDecision;
  decisionLabel: string;
  id: string;
  label: string;
  source: ExtractionFieldSource | null;
  value: string;
};

export type NexusRagExtractionContent = {
  acceptLabel: string;
  candidateNote: string;
  description: string;
  documentMeta: string;
  documentTitle: string;
  fields: ExtractionField[];
  fieldsSubtitle: string;
  fieldsTitle: string;
  notFoundLabel: string;
  pageLabel: string;
  profileLabel: string;
  profileOptions: ExtractionProfileOption[];
  rejectLabel: string;
  selectedProfileId: string;
  sourceLabel: string;
  title: string;
};

const extractionCopy = {
  id: {
    acceptLabel: "Terima",
    candidateNote: "Data resmi berubah hanya setelah kandidat diterima.",
    description: "Kandidat isian dari satu dokumen.",
    documentMeta: "PDF · 12 halaman · job_01J8K2R4 · diproses 2026-08-08 09:12",
    documentTitle: "Perjanjian Penugasan Hibah Penelitian 2026",
    fields: [
      {
        decision: "accepted",
        decisionLabel: "Diterima",
        id: "activity_title",
        label: "Judul Kegiatan",
        source: {
          chunkLabel: "chunk 8",
          page: 1,
          quote:
            "Pelaksanaan penelitian dengan judul Sistem Pemantauan Biosinyal Terintegrasi untuk Layanan Primer.",
        },
        value: "Sistem Pemantauan Biosinyal Terintegrasi untuk Layanan Primer",
      },
      {
        decision: "pending",
        decisionLabel: "Menunggu tinjauan",
        id: "leader_name",
        label: "Nama Ketua",
        source: {
          chunkLabel: "chunk 14",
          page: 2,
          quote:
            "PIHAK KEDUA: Suksmandhira Harimurti, selaku ketua pelaksana penelitian.",
        },
        value: "Suksmandhira Harimurti",
      },
      {
        decision: "pending",
        decisionLabel: "Menunggu tinjauan",
        id: "funding_amount",
        label: "Besar Dana yang Diterima",
        source: {
          chunkLabel: "chunk 37",
          page: 4,
          quote:
            "PIHAK PERTAMA memberikan dana penelitian kepada PIHAK KEDUA sebesar Rp 185.000.000,00.",
        },
        value: "Rp 185.000.000",
      },
      {
        decision: "pending",
        decisionLabel: "Menunggu tinjauan",
        id: "implementation_period",
        label: "Periode Pelaksanaan",
        source: {
          chunkLabel: "chunk 22",
          page: 3,
          quote:
            "Jangka waktu pelaksanaan terhitung sejak 1 Maret 2026 sampai dengan 30 November 2026.",
        },
        value: "1 Maret 2026 – 30 November 2026",
      },
      {
        decision: "rejected",
        decisionLabel: "Ditolak",
        id: "grant_scheme",
        label: "Nama Skema Hibah",
        source: {
          chunkLabel: "chunk 6",
          page: 1,
          quote: "Skema Penelitian Terapan Unggulan Tahun Anggaran 2026.",
        },
        value: "Penelitian Terapan Unggulan 2026",
      },
      {
        decision: "pending",
        decisionLabel: "Menunggu tinjauan",
        id: "member_names",
        label: "Nama Anggota",
        source: null,
        value: "-",
      },
    ],
    fieldsSubtitle: "Enam isian",
    fieldsTitle: "Kandidat Isian",
    notFoundLabel: "Tidak ditemukan pada dokumen",
    pageLabel: "Halaman",
    profileLabel: "Profil ekstraksi",
    profileOptions: [
      { id: "hibah", label: "Hibah", version: "v1" },
      { id: "funding", label: "Pendanaan", version: "v1" },
      {
        id: "community_service",
        label: "Pengabdian Masyarakat",
        version: "v1",
      },
      { id: "pengumuman", label: "Pengumuman", version: "v1" },
    ],
    rejectLabel: "Tolak",
    selectedProfileId: "hibah",
    sourceLabel: "Potongan sumber",
    title: "Tinjauan Ekstraksi",
  },
  en: {
    acceptLabel: "Accept",
    candidateNote: "Official data changes only after a candidate is accepted.",
    description: "Field candidates from one document.",
    documentMeta: "PDF · 12 pages · job_01J8K2R4 · processed 2026-08-08 09:12",
    documentTitle: "Perjanjian Penugasan Hibah Penelitian 2026",
    fields: [
      {
        decision: "accepted",
        decisionLabel: "Accepted",
        id: "activity_title",
        label: "Activity Title",
        source: {
          chunkLabel: "chunk 8",
          page: 1,
          quote:
            "Pelaksanaan penelitian dengan judul Sistem Pemantauan Biosinyal Terintegrasi untuk Layanan Primer.",
        },
        value: "Sistem Pemantauan Biosinyal Terintegrasi untuk Layanan Primer",
      },
      {
        decision: "pending",
        decisionLabel: "Awaiting review",
        id: "leader_name",
        label: "Leader Name",
        source: {
          chunkLabel: "chunk 14",
          page: 2,
          quote:
            "PIHAK KEDUA: Suksmandhira Harimurti, selaku ketua pelaksana penelitian.",
        },
        value: "Suksmandhira Harimurti",
      },
      {
        decision: "pending",
        decisionLabel: "Awaiting review",
        id: "funding_amount",
        label: "Grant Amount Received",
        source: {
          chunkLabel: "chunk 37",
          page: 4,
          quote:
            "PIHAK PERTAMA memberikan dana penelitian kepada PIHAK KEDUA sebesar Rp 185.000.000,00.",
        },
        value: "Rp 185,000,000",
      },
      {
        decision: "pending",
        decisionLabel: "Awaiting review",
        id: "implementation_period",
        label: "Implementation Period",
        source: {
          chunkLabel: "chunk 22",
          page: 3,
          quote:
            "Jangka waktu pelaksanaan terhitung sejak 1 Maret 2026 sampai dengan 30 November 2026.",
        },
        value: "1 March 2026 – 30 November 2026",
      },
      {
        decision: "rejected",
        decisionLabel: "Rejected",
        id: "grant_scheme",
        label: "Grant Scheme Name",
        source: {
          chunkLabel: "chunk 6",
          page: 1,
          quote: "Skema Penelitian Terapan Unggulan Tahun Anggaran 2026.",
        },
        value: "Penelitian Terapan Unggulan 2026",
      },
      {
        decision: "pending",
        decisionLabel: "Awaiting review",
        id: "member_names",
        label: "Member Names",
        source: null,
        value: "-",
      },
    ],
    fieldsSubtitle: "Six fields",
    fieldsTitle: "Field Candidates",
    notFoundLabel: "Not found in the document",
    pageLabel: "Page",
    profileLabel: "Extraction profile",
    profileOptions: [
      { id: "hibah", label: "Grant agreement", version: "v1" },
      { id: "funding", label: "Funding", version: "v1" },
      { id: "community_service", label: "Community service", version: "v1" },
      { id: "pengumuman", label: "Announcement", version: "v1" },
    ],
    rejectLabel: "Reject",
    selectedProfileId: "hibah",
    sourceLabel: "Source chunk",
    title: "Extraction Review",
  },
} satisfies Record<Locale, Omit<NexusRagExtractionContent, "previewLabel">>;

/**
 * Presentation-ready extraction candidates. A server adapter can replace the
 * seeded fields without changing the component contract.
 */
export function getNexusRagExtractionContent(
  locale: Locale,
): NexusRagExtractionContent {
  return {
    ...extractionCopy[locale],
  };
}
