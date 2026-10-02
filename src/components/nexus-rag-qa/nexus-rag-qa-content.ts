import type { Locale } from "@/i18n/locales";

export type RagPassage = {
  chunkId?: string;
  documentVersion?: number;
  href?: string;
  id: string;
  page: number;
  quote: string;
};

export type RagSource = {
  answer: string;
  documentTitle: string;
  id: string;
  keywords: string[];
  passages: RagPassage[];
};

export type RagExchange = {
  answer: string;
  askedAt: string;
  askedAtLabel: string;
  id: string;
  question: string;
  questionLanguageLabel: string;
  sources: RagSource[];
  supported: boolean;
};

export type NexusRagQaContent = {
  askLabel: string;
  citationsTitle: string;
  description: string;
  emptyQuestionLabel: string;
  exchanges: RagExchange[];
  historyEmptyLabel: string;
  historyTitle: string;
  locale: Locale;
  pageLabel: string;
  queryLabel: string;
  queryPlaceholder: string;
  title: string;
  unsupportedLabel: string;
};

const copy = {
  id: {
    askLabel: "Ajukan pertanyaan",
    citationsTitle: "Sumber",
    description:
      "Cari jawaban hanya dari dokumen yang sudah selesai diproses; setiap jawaban yang didukung menyertakan kutipan.",
    emptyQuestionLabel: "Tulis pertanyaan sebelum mengirim.",
    historyEmptyLabel: "Belum ada pertanyaan.",
    historyTitle: "Riwayat pertanyaan",
    pageLabel: "Halaman",
    queryLabel: "Pertanyaan dokumen",
    queryPlaceholder: "Contoh: Bagaimana kandidat publikasi diperiksa?",
    title: "Tanya Jawab Dokumen",
    unsupportedLabel: "Tidak didukung sumber",
  },
  en: {
    askLabel: "Ask question",
    citationsTitle: "Sources",
    description:
      "Find answers only in processed documents; every supported answer includes quoted evidence.",
    emptyQuestionLabel: "Enter a question before submitting.",
    historyEmptyLabel: "No questions yet.",
    historyTitle: "Question history",
    pageLabel: "Page",
    queryLabel: "Document question",
    queryPlaceholder: "Example: How are publication candidates checked?",
    title: "Document Q&A",
    unsupportedLabel: "Not supported by sources",
  },
} satisfies Record<Locale, Omit<NexusRagQaContent, "exchanges" | "locale">>;

export function getNexusRagQaContent(locale: Locale): NexusRagQaContent {
  return { ...copy[locale], exchanges: [], locale };
}
