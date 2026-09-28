import type { Quartile, WorkType } from "@/lib/api-publications";

export const workTypeLabels: Record<WorkType, string> = {
  book_chapter: "Buku / Book Chapter",
  conference_paper: "Makalah Konferensi",
  journal_article: "Artikel Jurnal",
  other: "Lainnya",
  patent: "Paten",
};

export const workTypeOptions = (
  Object.entries(workTypeLabels) as Array<[WorkType, string]>
).map(([value, label]) => ({ label, value }));

export const quartileOptions: Array<{ label: string; value: Quartile }> = [
  { label: "Q1", value: "Q1" },
  { label: "Q2", value: "Q2" },
  { label: "Q3", value: "Q3" },
  { label: "Q4", value: "Q4" },
];

export type PublicationSortValue =
  | "citationCount-desc"
  | "createdAt-desc"
  | "title-asc"
  | "year-desc";

export const sortOptions: Array<{
  label: string;
  value: PublicationSortValue;
}> = [
  { label: "Tahun terbaru", value: "year-desc" },
  { label: "Sitasi terbanyak", value: "citationCount-desc" },
  { label: "Judul A-Z", value: "title-asc" },
  { label: "Baru ditambahkan", value: "createdAt-desc" },
];

export function parseSortValue(value: PublicationSortValue) {
  const [sortBy, sortOrder] = value.split("-") as [
    "citationCount" | "createdAt" | "title" | "year",
    "asc" | "desc",
  ];
  return { sortBy, sortOrder };
}

export const nexusPublicationsLiveContent = {
  columns: {
    citations: "Sitasi",
    quartile: "Kuartil",
    title: "Publikasi",
    workType: "Jenis",
    year: "Tahun",
  },
  description: "Publikasi resmi CoE BHT tercatat pada BHT Nexus.",
  detail: {
    authors: "Penulis",
    citations: "Sitasi",
    close: "Tutup",
    description: "Rincian publikasi resmi.",
    doi: "DOI",
    eyebrow: "Publikasi",
    issnL: "ISSN-L",
    loadError: "Gagal memuat rincian publikasi.",
    quartile: "Kuartil",
    venue: "Wadah terbit",
    workType: "Jenis karya",
    year: "Tahun terbit",
  },
  emptyDescription: "Belum ada publikasi yang cocok dengan filter ini.",
  emptyTitle: "Tidak ada hasil",
  emptyTrueDescription: "Belum ada publikasi resmi yang tercatat.",
  emptyTrueTitle: "Belum ada publikasi",
  errorLabel: "Gagal memuat data publikasi.",
  filterAllQuartile: "Semua kuartil",
  filterAllWorkType: "Semua jenis",
  resultUnit: "publikasi",
  searchLabel: "Cari publikasi",
  searchPlaceholder: "Cari judul, wadah terbit, atau DOI",
  tableCaption: "Publikasi resmi CoE BHT",
  title: "Publikasi",
} as const;
