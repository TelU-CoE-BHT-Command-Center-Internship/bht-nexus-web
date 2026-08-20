import { getNexusDocumentRecords } from "@/components/nexus-document-workspace/nexus-document-content";
import { formatTimestamp } from "@/components/nexus-workspace-ui/nexus-workspace-format";
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
  historyTitle: string;
  invalidDocumentLabel: string;
  locale: Locale;
  pageLabel: string;
  queryLabel: string;
  queryPlaceholder: string;
  supportedSources: RagSource[];
  title: string;
  unsupportedAnswer: string;
  unsupportedLabel: string;
};

const guideSource: Record<Locale, RagSource> = {
  id: {
    answer:
      "Pedoman menyatakan bahwa kandidat metadata harus ditinjau pengurus sebelum menjadi data resmi. DOI juga dinormalisasi untuk membantu mencegah duplikasi.",
    documentTitle: "Pedoman Metadata Publikasi",
    id: "pedoman-metadata-publikasi",
    keywords: ["metadata", "publikasi", "doi", "tinjau", "kandidat"],
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
    answer:
      "The guide says administrators must review metadata candidates before they become official data. DOIs are also normalised to help prevent duplicates.",
    documentTitle: "Publication Metadata Guide",
    id: "pedoman-metadata-publikasi",
    keywords: ["metadata", "publication", "doi", "review", "candidate"],
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

const telemedicineSource: Record<Locale, RagSource> = {
  id: {
    answer:
      "Ringkasan mencatat evaluasi penerapan telemedisin untuk layanan primer pada Maret–November 2026, dengan luaran berupa ringkasan evaluasi dan rekomendasi tindak lanjut.",
    documentTitle: "Ringkasan Kegiatan Telemedisin Layanan Primer",
    id: "ringkasan-kegiatan-telemedisin",
    keywords: [
      "telemedisin",
      "layanan primer",
      "maret",
      "november",
      "luaran",
      "kegiatan",
    ],
    passages: [
      {
        id: "telemedisin-p1",
        page: 1,
        quote:
          "Kegiatan berfokus pada evaluasi penerapan telemedisin untuk mendukung layanan primer.",
      },
      {
        id: "telemedisin-p3",
        page: 3,
        quote: "Evaluasi dilaksanakan pada Maret sampai November 2026.",
      },
    ],
  },
  en: {
    answer:
      "The summary records a primary-care telemedicine evaluation running from March through November 2026, producing an evaluation summary and follow-up recommendations.",
    documentTitle: "Primary Care Telemedicine Activity Summary",
    id: "ringkasan-kegiatan-telemedisin",
    keywords: [
      "telemedicine",
      "primary care",
      "march",
      "november",
      "output",
      "activity",
    ],
    passages: [
      {
        id: "telemedicine-p1",
        page: 1,
        quote:
          "The activity focuses on evaluating telemedicine adoption in support of primary care.",
      },
      {
        id: "telemedicine-p3",
        page: 3,
        quote: "The evaluation runs from March through November 2026.",
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
    invalidDocumentLabel:
      "Dokumen yang diminta tidak tersedia atau belum siap ditanya. Pilih dokumen siap dari daftar cakupan.",
    pageLabel: "Halaman",
    queryLabel: "Pertanyaan dokumen",
    queryPlaceholder: "Contoh: Bagaimana kandidat publikasi diperiksa?",
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
    invalidDocumentLabel:
      "The requested document is unavailable or not ready for questions. Choose a ready document from the scope list.",
    pageLabel: "Page",
    queryLabel: "Document question",
    queryPlaceholder: "Example: How are publication candidates checked?",
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
    answer: guideSource.id.answer,
    askedAt: "2026-08-12T09:35",
    id: "publication-review-question",
    question:
      "Bagaimana kandidat publikasi diperiksa sebelum menjadi data resmi?",
    questionLanguageLabel: "Bahasa Indonesia",
    sources: [guideSource.id],
    supported: true,
  },
  en: {
    answer: guideSource.en.answer,
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
  const readyQaDocuments = new Map(
    getNexusDocumentRecords(locale)
      .filter(
        (document) =>
          document.status === "succeeded" &&
          document.capabilities.includes("qa"),
      )
      .map((document) => [document.id, document]),
  );
  const supportedSources = [
    guideSource[locale],
    telemedicineSource[locale],
  ].flatMap((source) => {
    const document = readyQaDocuments.get(source.id);
    return document ? [{ ...source, documentTitle: document.title }] : [];
  });

  return {
    ...copy[locale],
    exchanges: [{ ...seed, askedAtLabel: formatTimestamp(seed.askedAt) }],
    locale,
    supportedSources,
  };
}
