import type {
  ImportEntity,
  ImportIssue,
  ImportRow,
  ImportRowAction,
  ImportSheetSummary,
} from "@/lib/api-imports";

type Tone = "danger" | "info" | "neutral" | "success" | "waiting";

export const importHouseLabels: Record<ImportEntity, string> = {
  publication: "Publikasi",
  "intellectual-property": "Kekayaan Intelektual",
  contract: "Kontrak & Proposal",
  academic: "Akademik",
  activity: "Kegiatan & Pengabdian",
};

export const importHouseOptions = (
  Object.entries(importHouseLabels) as [ImportEntity, string][]
).map(([value, label]) => ({ label, value }));

export const importActionCopy: Record<
  ImportRowAction,
  { label: string; tone: Tone }
> = {
  duplicate: { label: "Dilewati, sudah ada", tone: "neutral" },
  new: { label: "Siap dikirim", tone: "success" },
  skip: { label: "Perlu diperbaiki", tone: "danger" },
  update: { label: "Usulan perubahan", tone: "waiting" },
};

export const importSheetStatusCopy: Record<
  ImportSheetSummary["status"],
  { label: string; tone: Tone }
> = {
  context: { label: "Acuan evaluasi", tone: "info" },
  data: { label: "Dibaca", tone: "success" },
  empty: { label: "Tidak berisi data", tone: "neutral" },
  unsupported: { label: "Tidak diimpor", tone: "waiting" },
};

const issueTone: Record<ImportIssue["kind"], Tone> = {
  change: "waiting",
  duplicate: "neutral",
  error: "danger",
  warning: "waiting",
};

const issuePriority: Record<ImportIssue["kind"], number> = {
  error: 0,
  duplicate: 1,
  change: 2,
  warning: 3,
};

export function importIssuesByPriority(issues: readonly ImportIssue[]) {
  return issues.toSorted(
    (first, second) => issuePriority[first.kind] - issuePriority[second.kind],
  );
}

export function importIssueTone(issue: ImportIssue): Tone {
  return issueTone[issue.kind];
}

/** Label bidang isian; kunci yang sama dengan formulir Ajukan. */
export const importFieldLabels: Record<string, string> = {
  activityYear: "Tahun kegiatan",
  applicants: "Pengusul / tim",
  applicationNumber: "Nomor pencatatan",
  authors: "Daftar penulis",
  creators: "Pencipta / inventor",
  delegationLead: "Ketua rombongan",
  doi: "DOI",
  duration: "Lama kegiatan",
  endDate: "Tanggal selesai",
  eventDate: "Tanggal kegiatan",
  eventName: "Nama acara",
  faculty: "Fakultas",
  funder: "Instansi pemberi hibah",
  funding: "Dana",
  identifier: "DOI / ISBN",
  institution: "Institusi",
  issn: "ISSN",
  journalVolume: "Volume jurnal",
  lecturer: "Dosen pembimbing",
  location: "Tempat",
  mbkmProgram: "Program MBKM",
  mentorId: "NIDN pembimbing",
  mentors: "Pembimbing",
  organization: "Unit bisnis / komunitas",
  organizer: "Penyelenggara",
  ownerUnit: "Nama / unit terkait",
  participantRef: "Mahasiswa",
  partner: "Mitra",
  primaryParty: "Dosen / pengelola",
  programStudy: "Program studi",
  publicationDate: "Tanggal publikasi",
  publicationFrequency: "Frekuensi terbit",
  publicationYear: "Tahun terbit",
  publisher: "Penerbit",
  quartile: "Kuartil",
  referenceNumber: "Nomor kontrak / proposal",
  registrationYear: "Tahun pencatatan",
  reportedQuarter: "Triwulan dilaporkan",
  role: "Peran",
  scheme: "Skema",
  sintaRank: "Peringkat SINTA",
  speakerName: "Nama pembicara",
  startDate: "Tanggal mulai",
  studentNumber: "NIM",
  studentTeam: "Tim mahasiswa",
  submissionDate: "Tanggal pengajuan",
  targetGroup: "Mitra / masyarakat sasaran",
  team: "Dosen / tim pelaksana",
  venue: "Nama jurnal / forum",
  year: "Tahun",
};

const hiddenValueKeys = new Set([
  "title",
  "year",
  "record_type",
  "record_type_label",
  "evidence_url",
]);

export function importRowTitle(row: ImportRow) {
  const title = row.values.title;
  return typeof title === "string" && title.trim()
    ? title
    : "Judul belum tercatat";
}

export function importRowYear(row: ImportRow) {
  const year = row.values.year;
  return typeof year === "number" || (typeof year === "string" && year)
    ? String(year)
    : "Belum tercatat";
}

export function importRowSource(row: ImportRow) {
  return `${row.sheetName ?? "Berkas"} · baris ${row.sourceRowNumber ?? row.rowNumber}`;
}

export function importRowRecordType(row: ImportRow) {
  const label = row.values.record_type_label;
  return typeof label === "string" && label ? label : undefined;
}

export function importRowEvidence(row: ImportRow) {
  const url = row.values.evidence_url ?? row.values.evidenceUrl;
  return typeof url === "string" && url ? url : undefined;
}

/** Isian yang akan dikirim ke Tinjauan, tanpa nilai dana yang bersifat rahasia. */
export function importRowFields(row: ImportRow) {
  return Object.entries(row.values).flatMap(([key, value]) => {
    if (hiddenValueKeys.has(key) || value === null || value === undefined) {
      return [];
    }
    const text = Array.isArray(value) ? value.join("; ") : String(value);
    if (!text) return [];
    return [
      {
        key,
        label: importFieldLabels[key] ?? key,
        value:
          key === "funding" ? "Tercatat (nilai dana tidak ditampilkan)" : text,
      },
    ];
  });
}

export function importRowSearchText(row: ImportRow) {
  return [
    importRowTitle(row),
    importRowSource(row),
    importRowRecordType(row) ?? "",
    ...row.issues.map((issue) => issue.reason),
    ...importRowFields(row).map((field) => field.value),
  ]
    .join(" ")
    .toLocaleLowerCase("id-ID");
}

/** Nama kolom pada catatan pemeriksaan; kunci isian diganti labelnya. */
export function importIssueColumn(issue: ImportIssue) {
  return importFieldLabels[issue.column] ?? issue.column;
}
