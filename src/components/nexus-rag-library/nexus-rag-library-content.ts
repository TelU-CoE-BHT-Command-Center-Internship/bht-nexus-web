import {
  getNexusDocumentRecords,
  type NexusDocumentRecord,
} from "@/components/nexus-document-workspace/nexus-document-content";
import type { Locale } from "@/i18n/locales";

export type RagDocument = NexusDocumentRecord;

export type NexusRagLibraryContent = {
  columns: {
    document: string;
    owner: string;
    status: string;
    updatedAt: string;
  };
  description: string;
  documents: RagDocument[];
  fileErrorLabel: string;
  locale: Locale;
  title: string;
  uploadLabel: string;
  uploadNote: string;
  uploadSuccessLabel: string;
};

const libraryCopy = {
  id: {
    columns: {
      document: "Dokumen",
      owner: "Unit pemilik",
      status: "Status pemrosesan",
      updatedAt: "Diperbarui",
    },
    description:
      "Kelola dokumen yang diizinkan untuk pencarian bersitasi dan ekstraksi kandidat.",
    fileErrorLabel: "Pilih berkas PDF atau DOCX berukuran maksimal 25 MB.",
    title: "Dokumen",
    uploadLabel: "Pilih dokumen",
    uploadNote: "PDF atau DOCX, maksimal 25 MB",
    uploadSuccessLabel: "ditambahkan ke antrean pemrosesan.",
  },
  en: {
    columns: {
      document: "Document",
      owner: "Owning unit",
      status: "Processing status",
      updatedAt: "Updated",
    },
    description:
      "Manage documents authorised for cited search and candidate extraction.",
    fileErrorLabel: "Choose a PDF or DOCX file up to 25 MB.",
    title: "Documents",
    uploadLabel: "Choose document",
    uploadNote: "PDF or DOCX, up to 25 MB",
    uploadSuccessLabel: "was added to the processing queue.",
  },
} satisfies Record<
  Locale,
  Omit<NexusRagLibraryContent, "documents" | "locale">
>;

export function getNexusRagLibraryContent(
  locale: Locale,
): NexusRagLibraryContent {
  return {
    ...libraryCopy[locale],
    documents: getNexusDocumentRecords(locale),
    locale,
  };
}
