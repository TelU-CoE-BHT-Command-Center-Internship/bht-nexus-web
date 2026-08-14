import { getAutomationStatusLabel } from "@/components/nexus-automation-status/nexus-automation-status-content";
import type { AutomationJobStatus } from "@/components/nexus-automation-status/nexus-automation-status-types";
import { formatTimestamp } from "@/components/nexus-workspace-ui/nexus-workspace-format";
import type { Locale } from "@/i18n/locales";

export type RagDocument = {
  fileLabel: string;
  id: string;
  indexedAt: string;
  indexedLabel: string;
  ownerUnit: string;
  status: AutomationJobStatus;
  statusLabel: string;
  title: string;
};

export type NexusRagLibraryContent = {
  columns: {
    document: string;
    indexedAt: string;
    owner: string;
    status: string;
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

const documentSeeds = [
  {
    fileLabel: { en: "PDF · 18 pages", id: "PDF · 18 halaman" },
    id: "pedoman-metadata-publikasi",
    indexedAt: "2026-08-12T09:12",
    ownerUnit: { en: "Data Management", id: "Pengelolaan Data" },
    status: "succeeded",
    title: {
      en: "Publication Metadata Guide",
      id: "Pedoman Metadata Publikasi",
    },
  },
  {
    fileLabel: { en: "PDF · 10 pages", id: "PDF · 10 halaman" },
    id: "ringkasan-kegiatan-telemedisin",
    indexedAt: "2026-08-12T08:05",
    ownerUnit: { en: "Research", id: "Riset" },
    status: "running",
    title: {
      en: "Primary Care Telemedicine Activity Summary",
      id: "Ringkasan Kegiatan Telemedisin Layanan Primer",
    },
  },
  {
    fileLabel: { en: "DOCX · 7 pages", id: "DOCX · 7 halaman" },
    id: "profil-riset-laboratorium",
    indexedAt: "2026-08-12T08:03",
    ownerUnit: { en: "Research", id: "Riset" },
    status: "queued",
    title: {
      en: "Laboratory Research Profile",
      id: "Profil Riset Laboratorium",
    },
  },
  {
    fileLabel: { en: "PDF · 24 pages", id: "PDF · 24 halaman" },
    id: "rekap-publikasi-tahunan",
    indexedAt: "2026-08-11T19:22",
    ownerUnit: { en: "Data Management", id: "Pengelolaan Data" },
    status: "retrying",
    title: {
      en: "Annual Publication Summary",
      id: "Rekap Publikasi Tahunan",
    },
  },
] satisfies Array<{
  fileLabel: Record<Locale, string>;
  id: string;
  indexedAt: string;
  ownerUnit: Record<Locale, string>;
  status: AutomationJobStatus;
  title: Record<Locale, string>;
}>;

const libraryCopy = {
  id: {
    columns: {
      document: "Dokumen",
      indexedAt: "Diperbarui",
      owner: "Unit pemilik",
      status: "Status pemrosesan",
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
      indexedAt: "Updated",
      owner: "Owning unit",
      status: "Processing status",
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
    documents: documentSeeds.map((seed) => ({
      fileLabel: seed.fileLabel[locale],
      id: seed.id,
      indexedAt: seed.indexedAt,
      indexedLabel: formatTimestamp(seed.indexedAt),
      ownerUnit: seed.ownerUnit[locale],
      status: seed.status,
      statusLabel: getAutomationStatusLabel(locale, seed.status),
      title: seed.title[locale],
    })),
    locale,
  };
}
