import { getWorkspacePreviewLabel } from "@/components/nexus-workspace-page/nexus-workspace-page-content";
import type { Locale } from "@/i18n/locales";

export type RagCitation = {
  chunkLabel: string;
  documentTitle: string;
  id: string;
  page: number;
  quote: string;
  versionLabel: string;
};

export type RagExchange = {
  answer: string;
  askedAtLabel: string;
  citations: RagCitation[];
  id: string;
  question: string;
  questionLanguageLabel: string;
  supported: boolean;
};

export type NexusRagQaContent = {
  askLabel: string;
  citationsTitle: string;
  description: string;
  exchanges: RagExchange[];
  eyebrow: string;
  historySubtitle: string;
  historyTitle: string;
  pageLabel: string;
  previewLabel: string;
  queryLabel: string;
  queryPlaceholder: string;
  title: string;
  unsupportedLabel: string;
};

const qaCopy = {
  id: {
    askLabel: "Ajukan pertanyaan",
    citationsTitle: "Sumber",
    description:
      "Pertanyaan bahasa Indonesia atau Inggris atas dokumen internal CoE BHT.",
    exchanges: [
      {
        answer:
          "Besar dana yang diterima untuk skema Penelitian Terapan Unggulan 2026 adalah Rp 185.000.000, dicairkan dalam dua termin.",
        askedAtLabel: "2026-08-11 09:41",
        citations: [
          {
            chunkLabel: "chunk 37",
            documentTitle: "Perjanjian Penugasan Hibah Penelitian 2026",
            id: "hibah-2026-p4",
            page: 4,
            quote:
              "PIHAK PERTAMA memberikan dana penelitian kepada PIHAK KEDUA sebesar Rp 185.000.000,00 (seratus delapan puluh lima juta rupiah).",
            versionLabel: "v1",
          },
          {
            chunkLabel: "chunk 41",
            documentTitle: "Perjanjian Penugasan Hibah Penelitian 2026",
            id: "hibah-2026-p5",
            page: 5,
            quote:
              "Pencairan dilakukan dalam 2 (dua) termin, yaitu 70% pada tahap pertama dan 30% setelah laporan akhir diterima.",
            versionLabel: "v1",
          },
        ],
        id: "funding-amount-question",
        question:
          "Berapa besar dana yang diterima untuk skema Penelitian Terapan Unggulan 2026?",
        questionLanguageLabel: "Bahasa Indonesia",
        supported: true,
      },
      {
        answer:
          "Artikel telemedisin layanan primer terbit di Journal of Medical Internet Research dengan DOI 10.2196/48213.",
        askedAtLabel: "2026-08-11 09:35",
        citations: [
          {
            chunkLabel: "chunk 12",
            documentTitle: "Laporan Akhir Telemedisin Layanan Primer",
            id: "telemedicine-report-p31",
            page: 31,
            quote:
              "Luaran utama berupa artikel pada Journal of Medical Internet Research, DOI 10.2196/48213, terbit Maret 2026.",
            versionLabel: "v2",
          },
        ],
        id: "publication-doi-question",
        question:
          "Which journal published the primary care telemedicine paper, and what is the DOI?",
        questionLanguageLabel: "English",
        supported: true,
      },
      {
        answer:
          "Tidak ditemukan pada dokumen yang tersedia. Jumlah pasien uji klinis tidak tercantum pada dokumen mana pun.",
        askedAtLabel: "2026-08-11 09:28",
        citations: [],
        id: "clinical-trial-question",
        question:
          "Berapa jumlah pasien yang mengikuti uji klinis perangkat pemantauan biosinyal?",
        questionLanguageLabel: "Bahasa Indonesia",
        supported: false,
      },
    ],
    eyebrow: "Tanya Jawab Dokumen",
    historySubtitle: "Tiga pertanyaan terakhir",
    historyTitle: "Riwayat Pertanyaan",
    pageLabel: "Halaman",
    queryLabel: "Pertanyaan",
    queryPlaceholder: "Contoh: Siapa ketua kegiatan hibah PkM 2026?",
    title: "Tanya Dokumen",
    unsupportedLabel: "Tidak ditemukan",
  },
  en: {
    askLabel: "Ask question",
    citationsTitle: "Sources",
    description:
      "Questions in Indonesian or English about internal CoE BHT documents.",
    exchanges: [
      {
        answer:
          "The grant received under the 2026 Applied Research scheme is Rp 185,000,000, disbursed in two instalments.",
        askedAtLabel: "2026-08-11 09:41",
        citations: [
          {
            chunkLabel: "chunk 37",
            documentTitle: "Perjanjian Penugasan Hibah Penelitian 2026",
            id: "hibah-2026-p4",
            page: 4,
            quote:
              "PIHAK PERTAMA memberikan dana penelitian kepada PIHAK KEDUA sebesar Rp 185.000.000,00 (seratus delapan puluh lima juta rupiah).",
            versionLabel: "v1",
          },
          {
            chunkLabel: "chunk 41",
            documentTitle: "Perjanjian Penugasan Hibah Penelitian 2026",
            id: "hibah-2026-p5",
            page: 5,
            quote:
              "Pencairan dilakukan dalam 2 (dua) termin, yaitu 70% pada tahap pertama dan 30% setelah laporan akhir diterima.",
            versionLabel: "v1",
          },
        ],
        id: "funding-amount-question",
        question:
          "Berapa besar dana yang diterima untuk skema Penelitian Terapan Unggulan 2026?",
        questionLanguageLabel: "Indonesian",
        supported: true,
      },
      {
        answer:
          "The primary care telemedicine paper appeared in the Journal of Medical Internet Research, DOI 10.2196/48213.",
        askedAtLabel: "2026-08-11 09:35",
        citations: [
          {
            chunkLabel: "chunk 12",
            documentTitle: "Laporan Akhir Telemedisin Layanan Primer",
            id: "telemedicine-report-p31",
            page: 31,
            quote:
              "Luaran utama berupa artikel pada Journal of Medical Internet Research, DOI 10.2196/48213, terbit Maret 2026.",
            versionLabel: "v2",
          },
        ],
        id: "publication-doi-question",
        question:
          "Which journal published the primary care telemedicine paper, and what is the DOI?",
        questionLanguageLabel: "English",
        supported: true,
      },
      {
        answer:
          "Not found in the available documents. No document states the clinical trial patient count.",
        askedAtLabel: "2026-08-11 09:28",
        citations: [],
        id: "clinical-trial-question",
        question:
          "Berapa jumlah pasien yang mengikuti uji klinis perangkat pemantauan biosinyal?",
        questionLanguageLabel: "Indonesian",
        supported: false,
      },
    ],
    eyebrow: "Document Q&A",
    historySubtitle: "Three most recent questions",
    historyTitle: "Question History",
    pageLabel: "Page",
    queryLabel: "Question",
    queryPlaceholder: "Example: Who leads the 2026 community service grant?",
    title: "Ask Documents",
    unsupportedLabel: "Not found",
  },
} satisfies Record<Locale, Omit<NexusRagQaContent, "previewLabel">>;

/**
 * Presentation-ready question history. A server adapter can replace the seeded
 * exchanges without changing the component contract.
 */
export function getNexusRagQaContent(locale: Locale): NexusRagQaContent {
  return { ...qaCopy[locale], previewLabel: getWorkspacePreviewLabel(locale) };
}
