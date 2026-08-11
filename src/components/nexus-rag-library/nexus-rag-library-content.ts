import { getAutomationStatusLabel } from "@/components/nexus-automation-status/nexus-automation-status-content";
import type { AutomationJobStatus } from "@/components/nexus-automation-status/nexus-automation-status-types";
import { getWorkspacePreviewLabel } from "@/components/nexus-workspace-page/nexus-workspace-page-content";
import type { Locale } from "@/i18n/locales";

export type RagDocument = {
  fileLabel: string;
  id: string;
  indexedLabel: string;
  jobId: string;
  ownerUnit: string;
  status: AutomationJobStatus;
  statusDetail: string;
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
  eyebrow: string;
  previewLabel: string;
  tableSubtitle: string;
  tableTitle: string;
  title: string;
  uploadLabel: string;
  uploadNote: string;
};

type DocumentSeed = Omit<
  RagDocument,
  "fileLabel" | "ownerUnit" | "statusDetail" | "statusLabel"
> & {
  fileLabel: Record<Locale, string>;
  ownerUnit: Record<Locale, string>;
  statusDetail: Record<Locale, string>;
};

const documentSeeds: DocumentSeed[] = [
  {
    fileLabel: { en: "PDF · 12 pages", id: "PDF · 12 halaman" },
    id: "perjanjian-hibah-penelitian-2026",
    indexedLabel: "2026-08-08 09:12",
    jobId: "job_01J8K2R4",
    ownerUnit: { en: "Research & Grants", id: "Riset & Hibah" },
    status: "succeeded",
    statusDetail: { en: "", id: "" },
    title: "Perjanjian Penugasan Hibah Penelitian 2026",
  },
  {
    fileLabel: { en: "PDF · 6 pages", id: "PDF · 6 halaman" },
    id: "pengumuman-kelulusan-proposal-pkm-2026",
    indexedLabel: "2026-08-07 15:40",
    jobId: "job_01J8H9M1",
    ownerUnit: { en: "Community Service", id: "Pengabdian Masyarakat" },
    status: "succeeded",
    statusDetail: { en: "", id: "" },
    title: "Pengumuman Kelulusan Proposal PkM 2026",
  },
  {
    fileLabel: { en: "PDF · 38 pages", id: "PDF · 38 halaman" },
    id: "laporan-akhir-telemedisin-2026",
    indexedLabel: "2026-08-11 08:05",
    jobId: "job_01J9C3T7",
    ownerUnit: { en: "Research & Grants", id: "Riset & Hibah" },
    status: "running",
    statusDetail: {
      en: "Page 21 of 38",
      id: "Halaman 21 dari 38",
    },
    title: "Laporan Akhir Telemedisin Layanan Primer",
  },
  {
    fileLabel: { en: "DOCX · 9 pages", id: "DOCX · 9 halaman" },
    id: "kontrak-kerja-sama-rshs-2026",
    indexedLabel: "2026-08-11 08:03",
    jobId: "job_01J9C3T9",
    ownerUnit: { en: "Partnerships", id: "Kerja Sama" },
    status: "queued",
    statusDetail: {
      en: "Waiting to be processed",
      id: "Menunggu diproses",
    },
    title: "Kontrak Kerja Sama RSHS 2026",
  },
  {
    fileLabel: { en: "PDF · 54 pages", id: "PDF · 54 halaman" },
    id: "rekap-publikasi-2025",
    indexedLabel: "2026-08-10 19:22",
    jobId: "job_01J92B8D",
    ownerUnit: { en: "Data & Analytics", id: "Data & Analytics" },
    status: "retrying",
    statusDetail: {
      en: "Attempt 2 of 3 · OCR timeout",
      id: "Percobaan 2 dari 3 · OCR melewati batas waktu",
    },
    title: "Rekap Publikasi CoE BHT 2025",
  },
  {
    fileLabel: { en: "PDF · 17 pages", id: "PDF · 17 halaman" },
    id: "notulensi-audit-mutu-2026",
    indexedLabel: "2026-08-09 11:48",
    jobId: "job_01J8Y5W2",
    ownerUnit: { en: "Administration", id: "Administrasi" },
    status: "failed_permanently",
    statusDetail: {
      en: "Scanned file unreadable after 3 attempts",
      id: "Berkas hasil pindai tidak terbaca setelah 3 percobaan",
    },
    title: "Notulensi Audit Mutu Internal 2026",
  },
];

const libraryCopy = {
  id: {
    columns: {
      document: "Dokumen",
      indexedAt: "Diproses",
      owner: "Unit Pemilik",
      status: "Status",
    },
    description: "Dokumen internal CoE BHT dan status pemrosesannya.",
    eyebrow: "Tanya Jawab Dokumen",
    tableSubtitle: "Enam terbaru",
    tableTitle: "Dokumen",
    title: "Pustaka Dokumen",
    uploadLabel: "Unggah dokumen",
    uploadNote: "PDF atau DOCX, maksimal 25 MB",
  },
  en: {
    columns: {
      document: "Document",
      indexedAt: "Processed",
      owner: "Owning Unit",
      status: "Status",
    },
    description: "Internal CoE BHT documents and their processing status.",
    eyebrow: "Document Q&A",
    tableSubtitle: "Six most recent",
    tableTitle: "Documents",
    title: "Document Library",
    uploadLabel: "Upload document",
    uploadNote: "PDF or DOCX, up to 25 MB",
  },
} satisfies Record<
  Locale,
  Omit<NexusRagLibraryContent, "documents" | "previewLabel">
>;

/**
 * Presentation-ready document library. A server adapter can replace the seeded
 * documents without changing the component contract.
 */
export function getNexusRagLibraryContent(
  locale: Locale,
): NexusRagLibraryContent {
  return {
    ...libraryCopy[locale],
    documents: documentSeeds.map((seed) => ({
      fileLabel: seed.fileLabel[locale],
      id: seed.id,
      indexedLabel: seed.indexedLabel,
      jobId: seed.jobId,
      ownerUnit: seed.ownerUnit[locale],
      status: seed.status,
      statusDetail: seed.statusDetail[locale],
      statusLabel: getAutomationStatusLabel(locale, seed.status),
      title: seed.title,
    })),
    previewLabel: getWorkspacePreviewLabel(locale),
  };
}
