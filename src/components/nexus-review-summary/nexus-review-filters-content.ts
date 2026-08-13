import {
  getNexusReviewTableContent,
  type NexusReviewTableContent,
} from "@/components/nexus-review-summary/nexus-review-table-content";
import type {
  NexusSelectConfig,
  NexusSelectOption,
} from "@/components/nexus-workspace-ui/nexus-workspace-select";

export type ReviewSourceFilter = {
  id: string;
  label: string;
};

export type ReviewFilterOption = NexusSelectOption;
export type ReviewSelectFilter = NexusSelectConfig;

export type NexusReviewFiltersContent = {
  defaultSourceId: string;
  searchLabel: string;
  searchPlaceholder: string;
  sourceNavigationLabel: string;
  sources: readonly ReviewSourceFilter[];
  table: NexusReviewTableContent;
  filters: readonly ReviewSelectFilter[];
};

const sources: readonly ReviewSourceFilter[] = [
  { id: "all", label: "Semua" },
  { id: "sinta", label: "SINTA" },
  { id: "google-scholar", label: "Google Scholar" },
  { id: "dokumen", label: "Dokumen" },
  { id: "manual", label: "Manual" },
];

const filters: readonly ReviewSelectFilter[] = [
  {
    defaultValue: "waiting",
    id: "status",
    label: "Status tinjauan",
    options: [
      { label: "Semua status", tone: "neutral", value: "all" },
      {
        label: "Menunggu Tinjauan",
        tone: "waiting",
        value: "waiting",
      },
      { label: "Perlu Perbaikan", tone: "needs-fix", value: "needs-fix" },
      {
        label: "Selesai Ditinjau",
        tone: "completed",
        value: "completed",
      },
    ],
  },
  {
    defaultValue: "all",
    id: "publication-type",
    label: "Jenis publikasi",
    options: [
      { label: "Jenis publikasi", value: "all" },
      { label: "Artikel jurnal", value: "journal-article" },
      { label: "Prosiding", value: "proceeding" },
      { label: "Buku / monograf", value: "book" },
    ],
  },
  {
    defaultValue: "all",
    id: "year",
    label: "Tahun publikasi",
    options: [
      { label: "Tahun", value: "all" },
      { label: "2026", value: "2026" },
      { label: "2025", value: "2025" },
      { label: "2024", value: "2024" },
    ],
  },
  {
    defaultValue: "newest",
    id: "sort",
    label: "Urutan kandidat",
    options: [
      { label: "Urutan: Terbaru", value: "newest" },
      { label: "Urutan: Terlama", value: "oldest" },
      { label: "Judul: A–Z", value: "title-ascending" },
    ],
  },
];

/**
 * Serializable filter contract for the frontend. A server adapter can replace
 * these values later without changing the interactive layout.
 */
export function getNexusReviewFiltersContent(): NexusReviewFiltersContent {
  return {
    defaultSourceId: "all",
    filters,
    searchLabel: "Cari kandidat tinjauan",
    searchPlaceholder: "Cari judul, DOI, penulis, atau pemilik...",
    sourceNavigationLabel: "Filter kandidat berdasarkan sumber data",
    sources,
    table: getNexusReviewTableContent(),
  };
}
