import { getAutomationStatusLabel } from "@/components/nexus-automation-status/nexus-automation-status-content";
import type { AutomationJobStatus } from "@/components/nexus-automation-status/nexus-automation-status-types";
import { formatTimestamp } from "@/components/nexus-workspace-page/nexus-workspace-format";
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
  title: string;
  uploadLabel: string;
  uploadNote: string;
};

type DocumentSeed = Omit<
  RagDocument,
  "fileLabel" | "indexedLabel" | "ownerUnit" | "statusLabel"
> & {
  fileLabel: Record<Locale, string>;
  ownerUnit: Record<Locale, string>;
};

const documentSeeds: DocumentSeed[] = [
  {
    fileLabel: { en: "PDF · 12 pages", id: "PDF · 12 halaman" },
    id: "perjanjian-hibah-penelitian-2026",
    indexedAt: "2026-08-08T09:12",
    ownerUnit: { en: "Research & Grants", id: "Riset & Hibah" },
    status: "succeeded",
    title: "Perjanjian Penugasan Hibah Penelitian 2026",
  },
  {
    fileLabel: { en: "PDF · 6 pages", id: "PDF · 6 halaman" },
    id: "pengumuman-kelulusan-proposal-pkm-2026",
    indexedAt: "2026-08-07T15:40",
    ownerUnit: { en: "Community Service", id: "Pengabdian Masyarakat" },
    status: "succeeded",
    title: "Pengumuman Kelulusan Proposal PkM 2026",
  },
  {
    fileLabel: { en: "PDF · 38 pages", id: "PDF · 38 halaman" },
    id: "laporan-akhir-telemedisin-2026",
    indexedAt: "2026-08-11T08:05",
    ownerUnit: { en: "Research & Grants", id: "Riset & Hibah" },
    status: "running",
    title: "Laporan Akhir Telemedisin Layanan Primer",
  },
  {
    fileLabel: { en: "DOCX · 9 pages", id: "DOCX · 9 halaman" },
    id: "kontrak-kerja-sama-rshs-2026",
    indexedAt: "2026-08-11T08:03",
    ownerUnit: { en: "Partnerships", id: "Kerja Sama" },
    status: "queued",
    title: "Kontrak Kerja Sama RSHS 2026",
  },
  {
    fileLabel: { en: "PDF · 54 pages", id: "PDF · 54 halaman" },
    id: "rekap-publikasi-2025",
    indexedAt: "2026-08-10T19:22",
    ownerUnit: { en: "Data & Analytics", id: "Data & Analytics" },
    status: "retrying",
    title: "Rekap Publikasi CoE BHT 2025",
  },
  {
    fileLabel: { en: "PDF · 17 pages", id: "PDF · 17 halaman" },
    id: "notulensi-audit-mutu-2026",
    indexedAt: "2026-08-09T11:48",
    ownerUnit: { en: "Administration", id: "Administrasi" },
    status: "failed_permanently",
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
    title: "Document Library",
    uploadLabel: "Upload document",
    uploadNote: "PDF or DOCX, up to 25 MB",
  },
} satisfies Record<Locale, Omit<NexusRagLibraryContent, "documents">>;

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
      indexedAt: seed.indexedAt,
      indexedLabel: formatTimestamp(seed.indexedAt),
      ownerUnit: seed.ownerUnit[locale],
      status: seed.status,
      statusLabel: getAutomationStatusLabel(locale, seed.status),
      title: seed.title,
    })),
  };
}
