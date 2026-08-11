import { getAutomationStatusLabel } from "@/components/nexus-automation-status/nexus-automation-status-content";
import type {
  AutomationJobStatus,
  AutomationStatusSummary,
} from "@/components/nexus-automation-status/nexus-automation-status-types";
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
  indexNote: string;
  statusSummary: AutomationStatusSummary[];
  summaryTitle: string;
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
    statusDetail: {
      en: "48 chunks indexed",
      id: "48 potongan terindeks",
    },
    title: "Perjanjian Penugasan Hibah Penelitian 2026",
  },
  {
    fileLabel: { en: "PDF · 6 pages", id: "PDF · 6 halaman" },
    id: "pengumuman-kelulusan-proposal-pkm-2026",
    indexedLabel: "2026-08-07 15:40",
    jobId: "job_01J8H9M1",
    ownerUnit: { en: "Community Service", id: "Pengabdian Masyarakat" },
    status: "succeeded",
    statusDetail: {
      en: "23 chunks indexed",
      id: "23 potongan terindeks",
    },
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
      en: "Waiting for a worker",
      id: "Menunggu worker",
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
      status: "Status Indeks",
    },
    description:
      "Dokumen yang diizinkan untuk diindeks beserta status job pengindeksannya.",
    eyebrow: "Tanya Jawab Dokumen",
    indexNote:
      "Pengindeksan berjalan sebagai job asinkron. Dokumen baru masuk karantina lebih dulu dan belum dapat dijawab oleh RAG sampai jobnya berhasil.",
    summaryTitle: "Status Job Pengindeksan",
    tableSubtitle: "Enam dokumen terbaru",
    tableTitle: "Dokumen Terindeks",
    title: "Pustaka Dokumen",
    uploadLabel: "Unggah dokumen",
    uploadNote: "PDF atau DOCX, maksimal 25 MB",
  },
  en: {
    columns: {
      document: "Document",
      indexedAt: "Processed",
      owner: "Owning Unit",
      status: "Index Status",
    },
    description:
      "Documents authorised for indexing, with the status of each indexing job.",
    eyebrow: "Document Q&A",
    indexNote:
      "Indexing runs as an asynchronous job. A new document is quarantined first and stays outside RAG answers until its job succeeds.",
    summaryTitle: "Indexing Job Status",
    tableSubtitle: "Six most recent documents",
    tableTitle: "Indexed Documents",
    title: "Document Library",
    uploadLabel: "Upload document",
    uploadNote: "PDF or DOCX, up to 25 MB",
  },
} satisfies Record<
  Locale,
  Omit<NexusRagLibraryContent, "documents" | "statusSummary">
>;

function summariseStatuses(locale: Locale): AutomationStatusSummary[] {
  const counted = new Map<AutomationJobStatus, number>();

  for (const seed of documentSeeds) {
    counted.set(seed.status, (counted.get(seed.status) ?? 0) + 1);
  }

  return [...counted.entries()].map(([status, count]) => ({
    count,
    label: getAutomationStatusLabel(locale, status),
    status,
  }));
}

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
    statusSummary: summariseStatuses(locale),
  };
}
