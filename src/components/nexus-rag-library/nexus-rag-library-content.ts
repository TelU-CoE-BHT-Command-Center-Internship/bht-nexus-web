import type { NexusDocumentRecord } from "@/components/nexus-document-workspace/nexus-document-content";
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
  fileErrorLabel: string;
  loadErrorTitle: string;
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
      owner: "Pemilik",
      status: "Status pemrosesan",
      updatedAt: "Diunggah",
    },
    description:
      "Kelola dokumen yang diizinkan untuk pencarian bersitasi dan ekstraksi kandidat.",
    fileErrorLabel: "Pilih berkas PDF atau DOCX berukuran maksimal 10 MB.",
    loadErrorTitle: "Dokumen belum dapat dimuat",
    title: "Dokumen",
    uploadLabel: "Pilih dokumen",
    uploadNote: "PDF atau DOCX, maksimal 10 MB",
    uploadSuccessLabel: "tersimpan di server dan menunggu pemrosesan.",
  },
  en: {
    columns: {
      document: "Document",
      owner: "Owner",
      status: "Processing status",
      updatedAt: "Uploaded",
    },
    description:
      "Manage documents authorised for cited search and candidate extraction.",
    fileErrorLabel: "Choose a PDF or DOCX file up to 10 MB.",
    loadErrorTitle: "Documents could not be loaded",
    title: "Documents",
    uploadLabel: "Choose document",
    uploadNote: "PDF or DOCX, up to 10 MB",
    uploadSuccessLabel:
      "was stored on the server and is waiting to be processed.",
  },
} satisfies Record<Locale, Omit<NexusRagLibraryContent, "locale">>;

export function getNexusRagLibraryContent(
  locale: Locale,
): NexusRagLibraryContent {
  return { ...libraryCopy[locale], locale };
}
