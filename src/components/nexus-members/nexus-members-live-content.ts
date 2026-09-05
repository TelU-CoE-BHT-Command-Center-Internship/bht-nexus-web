import type { MembershipStatus } from "@/lib/api-members";

export const statusLabels: Record<MembershipStatus, string> = {
  active: "Aktif",
  inactive: "Tidak aktif",
  on_leave: "Cuti",
};

export const statusOptions = (
  Object.entries(statusLabels) as Array<[MembershipStatus, string]>
).map(([value, label]) => ({ label, value }));

export const nexusMembersLiveContent = {
  columns: {
    joinedAt: "Bergabung",
    name: "Nama",
    profiles: "Profil Akademik",
    status: "Status",
  },
  description:
    "Direktori anggota CoE BHT beserta identitas SINTA, Scopus, dan Google Scholar.",
  emptyDescription: "Belum ada anggota yang cocok dengan filter ini.",
  emptyTitle: "Tidak ada hasil",
  emptyTrueDescription: "Belum ada anggota yang tercatat.",
  emptyTrueTitle: "Belum ada anggota",
  errorLabel: "Gagal memuat data anggota.",
  filterAllStatus: "Semua status",
  resultUnit: "anggota",
  searchLabel: "Cari anggota",
  searchPlaceholder: "Cari nama anggota",
  tableCaption: "Direktori anggota CoE BHT",
  title: "Anggota",
} as const;
