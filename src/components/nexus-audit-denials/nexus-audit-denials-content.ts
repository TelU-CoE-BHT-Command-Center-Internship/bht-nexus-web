export const windowOptions = [
  { label: "15 menit terakhir", value: "15" },
  { label: "1 jam terakhir", value: "60" },
  { label: "4 jam terakhir", value: "240" },
  { label: "24 jam terakhir", value: "1440" },
] as const;

export const nexusAuditDenialsContent = {
  description:
    "Tinjau tindakan yang paling sering ditolak sistem untuk menemukan peran yang hak aksesnya perlu disesuaikan.",
  errorLabel: "Catatan penolakan akses belum dapat dimuat.",
  guidance:
    "Penolakan dicatat setiap kali sebuah akun mencoba tindakan di luar hak aksesnya. Hak akses peran disetel melalui Peran & Hak Akses.",
  searchLabel: "Cari modul atau tindakan yang ditolak",
  searchPlaceholder: "Cari modul atau tindakan",
  tableCaption:
    "Jumlah penolakan akses per modul dan tindakan pada rentang waktu yang dipilih",
  tableTitle: "Penolakan per hak akses",
  title: "Penolakan Akses",
  unknownPermissionLabel: "Hak akses tidak dikenali",
  windowLabel: "Rentang waktu penolakan akses",
} as const;
