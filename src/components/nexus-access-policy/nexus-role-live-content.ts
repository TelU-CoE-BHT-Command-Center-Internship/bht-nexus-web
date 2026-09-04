import type { RoleCategory } from "@/lib/api-roles";

export const roleCategoryLabels: Record<RoleCategory, string> = {
  coe_admin: "Admin CoE",
  coe_eksternal: "Mitra Eksternal",
  coe_internal: "Internal CoE",
  coe_member: "Anggota CoE",
};

export const roleCategoryOptions = (
  Object.entries(roleCategoryLabels) as Array<[RoleCategory, string]>
).map(([value, label]) => ({ label, value }));

export const nexusRoleLiveContent = {
  columns: {
    action: "Aksi",
    category: "Kategori",
    name: "Peran",
    priority: "Prioritas",
    type: "Tipe",
  },
  createLabel: "Tambah Peran",
  deleteConfirmLabel: "Ya, hapus",
  deleteConfirmPrompt: "Hapus peran ini? Tindakan ini tidak bisa dibatalkan.",
  description: "Atur peran dan hak akses bawaan untuk BHT Nexus.",
  drawerCloseLabel: "Tutup",
  editEyebrow: "Ubah Peran",
  emptyDescription: "Belum ada peran yang cocok dengan filter ini.",
  emptyTitle: "Tidak ada hasil",
  emptyTrueDescription:
    "Peran akan muncul di sini setelah peran pertama dibuat.",
  emptyTrueTitle: "Belum ada peran",
  fieldCategory: "Kategori",
  fieldDescriptionId: "Deskripsi",
  fieldDisplayNameId: "Nama tampilan",
  fieldName: "Nama peran (kode)",
  fieldPriority: "Prioritas",
  filterAllCategories: "Semua kategori",
  filterAllTypes: "Semua tipe",
  filterCustom: "Custom",
  filterSystem: "Sistem",
  namePattern: "Huruf kecil, angka, titik, atau garis bawah, diawali huruf",
  newEyebrow: "Peran Baru",
  noCategory: "—",
  permissionsCloseLabel: "Tutup",
  permissionsEmptyLabel: "Belum ada permission yang terdaftar.",
  permissionsEyebrow: "Hak Akses Peran",
  permissionsTitle: "Kelola permission",
  removeLabel: "Hapus",
  resultUnit: "peran",
  saveLabel: "Simpan",
  savingLabel: "Menyimpan…",
  searchLabel: "Cari peran",
  searchPlaceholder: "Cari nama peran",
  tableCaption: "Peran dan hak akses bawaan BHT Nexus",
} as const;
