import type { Locale } from "@/i18n/locales";

export type RagPassage = {
  id: string;
  page: number;
  quote: string;
};

export type RagSource = {
  documentTitle: string;
  id: string;
  passages: RagPassage[];
};

export type RagExchange = {
  answer: string;
  askedAt: string;
  askedAtLabel: string;
  citationCount: number;
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
  historyEmptyLabel: string;
  historyLoadErrorLabel: string;
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
    historyLoadErrorLabel: "Riwayat pertanyaan belum dapat dimuat.",
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
    historyLoadErrorLabel: "Question history could not be loaded.",
    historyTitle: "Question history",
    pageLabel: "Page",
    queryLabel: "Document question",
    queryPlaceholder: "Example: How are publication candidates checked?",
    title: "Document Q&A",
    unsupportedLabel: "Not supported by sources",
  },
} satisfies Record<Locale, Omit<NexusRagQaContent, "locale">>;

export function getNexusRagQaContent(locale: Locale): NexusRagQaContent {
  return { ...copy[locale], locale };
}
