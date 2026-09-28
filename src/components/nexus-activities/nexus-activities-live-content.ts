import type { ActivityStatus, ActivityType } from "@/lib/api-activities";

export const typeLabels: Record<ActivityType, string> = {
  collaboration: "Kolaborasi",
  community_service: "Pengabdian Masyarakat",
  internship: "Magang",
  other: "Lainnya",
  research: "Riset",
};

export const typeOptions = (
  Object.entries(typeLabels) as Array<[ActivityType, string]>
).map(([value, label]) => ({ label, value }));

export const statusLabels: Record<ActivityStatus, string> = {
  cancelled: "Dibatalkan",
  closed: "Selesai",
  ongoing: "Berjalan",
  planned: "Direncanakan",
};

export const statusOptions = (
  Object.entries(statusLabels) as Array<[ActivityStatus, string]>
).map(([value, label]) => ({ label, value }));

export type ActivitySortValue = "createdAt-desc" | "periodStart-desc";

export const sortOptions: Array<{ label: string; value: ActivitySortValue }> = [
  { label: "Mulai terbaru", value: "periodStart-desc" },
  { label: "Baru ditambahkan", value: "createdAt-desc" },
];

export function parseSortValue(value: ActivitySortValue) {
  const [sortBy, sortOrder] = value.split("-") as [
    "createdAt" | "periodStart",
    "asc" | "desc",
  ];
  return { sortBy, sortOrder };
}

export const nexusActivitiesLiveContent = {
  columns: {
    period: "Periode",
    status: "Status",
    title: "Kegiatan",
    type: "Jenis",
    visibility: "Visibilitas",
  },
  description: "Kegiatan dan pengabdian resmi CoE BHT tercatat pada BHT Nexus.",
  detail: {
    close: "Tutup",
    description: "Rincian kegiatan atau pengabdian.",
    descriptionLabel: "Deskripsi",
    eyebrow: "Kegiatan & Pengabdian",
    participants: "Peserta",
    period: "Periode",
    status: "Status",
    type: "Jenis",
    visibility: "Visibilitas",
  },
  emptyDescription: "Belum ada kegiatan yang cocok dengan filter ini.",
  emptyTitle: "Tidak ada hasil",
  emptyTrueDescription:
    "Belum ada kegiatan atau pengabdian resmi yang tercatat.",
  emptyTrueTitle: "Belum ada kegiatan",
  errorLabel: "Gagal memuat data kegiatan.",
  filterAllStatus: "Semua status",
  filterAllType: "Semua jenis",
  resultUnit: "kegiatan",
  searchLabel: "Cari kegiatan",
  searchPlaceholder: "Cari judul kegiatan",
  tableCaption: "Kegiatan dan pengabdian resmi CoE BHT",
  title: "Kegiatan & Pengabdian",
  visibilityPrivate: "Internal",
  visibilityPublic: "Publik",
} as const;
