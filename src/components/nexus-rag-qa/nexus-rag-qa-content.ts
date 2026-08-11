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
  languageNote: string;
  pageLabel: string;
  queryLabel: string;
  queryPlaceholder: string;
  scopeItems: string[];
  scopeTitle: string;
  title: string;
  unsupportedLabel: string;
};

const qaCopy = {
  id: {
    askLabel: "Ajukan pertanyaan",
    citationsTitle: "Sumber",
    description:
      "Pertanyaan bahasa Indonesia maupun Inggris dijawab dari dokumen yang sudah terindeks, dengan sitasi dokumen dan halaman.",
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
          "Tidak ditemukan pada dokumen yang terindeks. Jumlah pasien uji klinis tidak tercantum pada dokumen mana pun yang saat ini diizinkan untuk diindeks.",
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
    languageNote:
      "Jawaban hanya disusun dari potongan dokumen yang terambil. Bila bukti tidak cukup, sistem menyatakan tidak menemukan jawaban dan tidak menyusun jawaban sendiri.",
    pageLabel: "Halaman",
    queryLabel: "Pertanyaan",
    queryPlaceholder: "Contoh: Siapa ketua kegiatan hibah PkM 2026?",
    scopeItems: [
      "Pendanaan dan skema hibah",
      "Judul proyek dan penelitian",
      "Keterlibatan anggota",
      "Tanggal pelaksanaan",
      "Luaran kegiatan",
      "Judul paper dan nama jurnal",
      "DOI",
      "Ringkasan dokumen",
    ],
    scopeTitle: "Cakupan Pertanyaan",
    title: "Tanya Dokumen",
    unsupportedLabel: "Tanpa dukungan dokumen",
  },
  en: {
    askLabel: "Ask question",
    citationsTitle: "Sources",
    description:
      "Questions in Indonesian or English are answered from indexed documents, with a document and page citation.",
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
          "Not found in indexed sources. No document currently authorised for indexing states the clinical trial patient count.",
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
    languageNote:
      "Answers are built only from retrieved document chunks. When the evidence is insufficient the system says it found no answer instead of composing one.",
    pageLabel: "Page",
    queryLabel: "Question",
    queryPlaceholder: "Example: Who leads the 2026 community service grant?",
    scopeItems: [
      "Funding and grant schemes",
      "Project and research titles",
      "Member involvement",
      "Activity dates",
      "Activity outputs",
      "Paper titles and journal names",
      "DOI",
      "Document summaries",
    ],
    scopeTitle: "Question Coverage",
    title: "Ask Documents",
    unsupportedLabel: "No document support",
  },
} satisfies Record<Locale, NexusRagQaContent>;

/**
 * Presentation-ready question history. A server adapter can replace the seeded
 * exchanges without changing the component contract.
 */
export function getNexusRagQaContent(locale: Locale): NexusRagQaContent {
  return qaCopy[locale];
}
