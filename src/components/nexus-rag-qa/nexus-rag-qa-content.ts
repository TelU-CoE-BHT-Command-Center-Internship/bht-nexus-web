import { formatTimestamp } from "@/components/nexus-workspace-ui/nexus-workspace-format";
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
  historyTitle: string;
  locale: Locale;
  pageLabel: string;
  queryLabel: string;
  queryPlaceholder: string;
  supportedAnswer: string;
  supportedSources: RagSource[];
  title: string;
  unsupportedAnswer: string;
  unsupportedLabel: string;
};

const guideSource: Record<Locale, RagSource> = {
  id: {
    documentTitle: "Pedoman Metadata Publikasi",
    id: "pedoman-metadata",
    passages: [
      {
        id: "pedoman-metadata-p6",
        page: 6,
        quote:
          "Kandidat metadata diperiksa oleh pengurus sebelum dipromosikan menjadi data resmi.",
      },
      {
        id: "pedoman-metadata-p9",
        page: 9,
        quote:
          "DOI dinormalisasi dan dibandingkan untuk mencegah duplikasi publikasi.",
      },
    ],
  },
  en: {
    documentTitle: "Publication Metadata Guide",
    id: "metadata-guide",
    passages: [
      {
        id: "metadata-guide-p6",
        page: 6,
        quote:
          "Metadata candidates are checked by an administrator before promotion to official data.",
      },
      {
        id: "metadata-guide-p9",
        page: 9,
        quote:
          "DOIs are normalised and compared to prevent duplicate publications.",
      },
    ],
  },
};

const copy = {
  id: {
    askLabel: "Ajukan pertanyaan",
    citationsTitle: "Sumber",
    description:
      "Cari jawaban hanya dari dokumen yang sudah selesai diproses; setiap jawaban yang didukung menyertakan kutipan.",
    emptyQuestionLabel: "Tulis pertanyaan sebelum mengirim.",
    historyTitle: "Riwayat pertanyaan",
    pageLabel: "Halaman",
    queryLabel: "Pertanyaan dokumen",
    queryPlaceholder: "Contoh: Bagaimana kandidat publikasi diperiksa?",
    supportedAnswer:
      "Pedoman menyatakan bahwa kandidat metadata harus ditinjau pengurus sebelum menjadi data resmi. DOI juga dinormalisasi untuk membantu mencegah duplikasi.",
    title: "Tanya Jawab Dokumen",
    unsupportedAnswer:
      "Tidak ditemukan dukungan yang cukup pada dokumen yang tersedia. Coba gunakan istilah tentang metadata, publikasi, DOI, atau tinjauan.",
    unsupportedLabel: "Tidak didukung sumber",
  },
  en: {
    askLabel: "Ask question",
    citationsTitle: "Sources",
    description:
      "Find answers only in processed documents; every supported answer includes quoted evidence.",
    emptyQuestionLabel: "Enter a question before submitting.",
    historyTitle: "Question history",
    pageLabel: "Page",
    queryLabel: "Document question",
    queryPlaceholder: "Example: How are publication candidates checked?",
    supportedAnswer:
      "The guide says administrators must review metadata candidates before they become official data. DOIs are also normalised to help prevent duplicates.",
    title: "Document Q&A",
    unsupportedAnswer:
      "The available documents do not provide enough support. Try terms about metadata, publications, DOI, or review.",
    unsupportedLabel: "Not supported by sources",
  },
} satisfies Record<
  Locale,
  Omit<NexusRagQaContent, "exchanges" | "locale" | "supportedSources">
>;

const questionSeed: Record<Locale, Omit<RagExchange, "askedAtLabel">> = {
  id: {
    answer: copy.id.supportedAnswer,
    askedAt: "2026-08-12T09:35",
    id: "publication-review-question",
    question:
      "Bagaimana kandidat publikasi diperiksa sebelum menjadi data resmi?",
    questionLanguageLabel: "Bahasa Indonesia",
    sources: [guideSource.id],
    supported: true,
  },
  en: {
    answer: copy.en.supportedAnswer,
    askedAt: "2026-08-12T09:35",
    id: "publication-review-question",
    question:
      "How are publication candidates checked before becoming official data?",
    questionLanguageLabel: "English",
    sources: [guideSource.en],
    supported: true,
  },
};

export function getNexusRagQaContent(locale: Locale): NexusRagQaContent {
  const seed = questionSeed[locale];

  return {
    ...copy[locale],
    exchanges: [{ ...seed, askedAtLabel: formatTimestamp(seed.askedAt) }],
    locale,
    supportedSources: [guideSource[locale]],
  };
}
