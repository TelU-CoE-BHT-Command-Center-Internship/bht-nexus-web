import type { Quartile, WorkType } from "@/lib/api-publications";

export const workTypeLabels: Record<WorkType, string> = {
  book_chapter: "Bab Buku",
  conference_paper: "Makalah Konferensi",
  journal_article: "Artikel Jurnal",
  other: "Lainnya",
  patent: "Paten",
};

export const workTypeOptions = (
  Object.entries(workTypeLabels) as Array<[WorkType, string]>
).map(([value, label]) => ({ label, value }));

export const quartileLabels: Record<Quartile, string> = {
  Q1: "Q1",
  Q2: "Q2",
  Q3: "Q3",
  Q4: "Q4",
};

export const quartileOptions = (
  Object.entries(quartileLabels) as Array<[Quartile, string]>
).map(([value, label]) => ({ label, value }));

export const nexusPublicationsLiveContent = {
  columns: {
    citationCount: "Sitasi",
    doi: "DOI",
    quartile: "Kuartil",
    status: "Status",
    title: "Judul",
    venue: "Venue",
    workType: "Jenis",
    year: "Tahun",
  },
  createLabel: "Tambah Publikasi",
  deleteConfirmLabel: "Ya, hapus",
  deleteConfirmPrompt:
    "Hapus publikasi ini? Tindakan ini tidak bisa dibatalkan.",
  description: "Katalog publikasi resmi BHT Nexus.",
  drawerCloseLabel: "Tutup",
  editEyebrow: "Ubah Publikasi",
  emptyDescription: "Belum ada publikasi yang cocok dengan filter ini.",
  emptyTitle: "Tidak ada hasil",
  fieldCitationCount: "Jumlah sitasi",
  fieldDoi: "DOI",
  fieldIsOfficial: "Tandai sebagai publikasi resmi",
  fieldIssnL: "ISSN-L",
  fieldQuartile: "Kuartil Scimago",
  fieldSjr: "SJR",
  fieldTitle: "Judul",
  fieldVenue: "Venue",
  fieldWorkType: "Jenis karya",
  fieldYear: "Tahun terbit",
  filterAllQuartiles: "Semua kuartil",
  filterAllStatus: "Semua status",
  filterAllTypes: "Semua jenis",
  filterOfficial: "Resmi",
  filterUnofficial: "Belum resmi",
  noQuartile: "—",
  navigationLabel: "Navigasi halaman publikasi",
  newEyebrow: "Publikasi Baru",
  nextPageLabel: "Halaman berikutnya",
  official: "Resmi",
  pageLabel: "Halaman",
  pageSizeLabel: "Baris per halaman",
  previousPageLabel: "Halaman sebelumnya",
  rangePrefix: "Menampilkan",
  removeLabel: "Hapus",
  resultUnit: "publikasi",
  saveLabel: "Simpan",
  savingLabel: "Menyimpan…",
  searchLabel: "Cari publikasi",
  searchPlaceholder: "Cari judul publikasi",
  sortByLabel: "Urutkan",
  tableCaption: "Daftar publikasi resmi",
  title: "Publikasi",
  unofficial: "Belum resmi",
} as const;

export const sortOptions = [
  { label: "Terbaru dibuat", value: "createdAt" },
  { label: "Judul", value: "title" },
  { label: "Tahun terbit", value: "year" },
  { label: "Jumlah sitasi", value: "citationCount" },
] as const;
