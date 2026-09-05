export const windowOptions = [
  { label: "15 menit terakhir", value: "15" },
  { label: "1 jam terakhir", value: "60" },
  { label: "4 jam terakhir", value: "240" },
  { label: "24 jam terakhir", value: "1440" },
] as const;

export const nexusAuditDenialsContent = {
  columns: { count: "Jumlah", permission: "Permission" },
  description:
    "Permission yang paling sering ditolak sistem, dikelompokkan per nama permission.",
  emptyDescription: "Tidak ada penolakan akses pada rentang waktu ini.",
  emptyTitle: "Tidak ada penolakan",
  errorLabel: "Gagal memuat data penolakan akses.",
  tableCaption: "Jumlah penolakan akses per permission",
  title: "Penolakan Akses",
  unknownPermissionLabel: "Tidak diketahui",
  windowLabel: "Rentang waktu",
} as const;
