import type {
  ReviewCandidateType,
  ReviewCaseStatus,
  ReviewDecisionKind,
} from "@/lib/api-reviews";

export const candidateTypeLabels: Record<ReviewCandidateType, string> = {
  import_row: "Baris Impor",
  rag_extraction_candidate: "Ekstraksi Dokumen",
  staging_candidate: "Pengumpulan Otomatis",
};

export const candidateTypeOptions = (
  Object.entries(candidateTypeLabels) as Array<[ReviewCandidateType, string]>
).map(([value, label]) => ({ label, value }));

export const statusLabels: Record<ReviewCaseStatus, string> = {
  approved: "Disetujui",
  needs_revision: "Perlu Revisi",
  pending: "Menunggu",
  rejected: "Ditolak",
};

export const statusOptions = (
  Object.entries(statusLabels) as Array<[ReviewCaseStatus, string]>
).map(([value, label]) => ({ label, value }));

export const decisionLabels: Record<ReviewDecisionKind, string> = {
  approve: "Setujui",
  reject: "Tolak",
  request_revision: "Minta Revisi",
};

export const decisionOptions = (
  Object.entries(decisionLabels) as Array<[ReviewDecisionKind, string]>
).map(([value, label]) => ({ label, value }));

export const nexusReviewLiveContent = {
  candidateReadyLabel: "Kandidat siap diputuskan",
  columns: {
    action: "Aksi",
    candidateType: "Sumber",
    status: "Status",
    submitted: "Diajukan",
  },
  decideLabel: "Putuskan",
  decisionHistoryEmptyLabel: "Belum ada riwayat keputusan.",
  decisionHistoryTitle: "Riwayat Keputusan",
  description: "Tinjau kandidat data sebelum menjadi data resmi BHT Nexus.",
  drawerCloseLabel: "Tutup",
  duplicateNoticeLabel: "Kandidat ini ditandai duplikat dari rekam lain.",
  editHistoryEmptyLabel: "Belum ada riwayat penyuntingan.",
  editHistoryTitle: "Riwayat Penyuntingan",
  emptyDescription: "Belum ada kandidat yang cocok dengan filter ini.",
  emptyTitle: "Tidak ada hasil",
  emptyTrueDescription:
    "Kandidat akan muncul di sini setelah pekerjaan pengumpulan atau ekstraksi menghasilkan data.",
  emptyTrueTitle: "Belum ada kandidat",
  fieldReason: "Alasan",
  filterAllCandidateTypes: "Semua sumber",
  filterAllStatus: "Semua status",
  payloadEmptyLabel: "Data kandidat kosong.",
  payloadTitle: "Data Kandidat",
  resultUnit: "kandidat",
  savingLabel: "Menyimpan…",
  searchLabel: "Cari kandidat",
  searchPlaceholder: "Cari berdasarkan status atau sumber",
  tableCaption: "Kandidat data menunggu keputusan reviewer",
  title: "Tinjauan Data",
} as const;
