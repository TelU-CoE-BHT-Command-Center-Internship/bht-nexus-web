import type { NexusMemberId } from "@/components/nexus-members/nexus-member-identity";
import {
  type MetadataCompletionFieldKey,
  type MetadataCompletionProposal,
  type MetadataCompletionResolutions,
  metadataCompletionAvailabilityLabel,
  metadataCompletionFieldLabels,
} from "@/components/nexus-metadata-completion/nexus-metadata-completion-model";
import { officialKpiEmptyCopy } from "@/components/nexus-workspace-ui/nexus-official-kpi";
import type { NexusOfficialSourceMetadataItem } from "@/components/nexus-workspace-ui/nexus-official-source-metadata";
import {
  kmIndicator,
  type NexusKmIndicator,
} from "@/content/nexus-km-indicators";

type AcademicActivity =
  | "Bimbingan Doktor"
  | "Bimbingan Magister"
  | "Magang Mahasiswa"
  | "Kompetisi Mahasiswa"
  | "Riset Tugas Akhir"
  | "Kegiatan Akademik Lainnya";

type AcademicQuality = "Lengkap" | "Perlu dilengkapi";

export type AcademicCompletionFieldKey = MetadataCompletionFieldKey;

export const academicFieldLabels = metadataCompletionFieldLabels;

export type AcademicProposal = MetadataCompletionProposal;

type AcademicMentor = {
  id: string;
  initials: string;
  memberId?: NexusMemberId;
  name: string;
};

type AcademicProvenance = {
  capturedAt: string;
  identifier: string;
  note?: string;
  source: string;
};

type AcademicKmLink = {
  indicator: NexusKmIndicator;
  note: string;
};

/**
 * Bukti internal ada, tetapi URL-nya tidak boleh dipublikasikan. Keadaan itu
 * berbeda dari bukti yang memang belum tercatat.
 */
type AcademicEvidenceStatus = "internal" | "public" | "unrecorded";

export type OfficialAcademicRecord = {
  activity: AcademicActivity;
  /** Lama kegiatan hanya relevan untuk magang. */
  duration?: string;
  /** Periode evaluasi KM, bukan tahun kegiatan. */
  evaluationPeriod: string;
  evidenceNote: string;
  evidenceStatus: AcademicEvidenceStatus;
  evidenceUrl?: string;
  id: string;
  kmLinks: AcademicKmLink[];
  kpiResolutionStatus?: "not_applicable" | "resolved" | "undetermined";
  mentors: AcademicMentor[];
  missingFields: AcademicCompletionFieldKey[];
  /** Penanda netral; identitas mahasiswa disediakan server sesuai hak akses. */
  participantCode: string;
  programStudy?: string;
  provenance: AcademicProvenance[];
  publicId: string;
  /**
   * Triwulan realisasi menurut pelapor atau auditor (1–4). Dipakai hanya bila
   * tanggal bisnis rekam belum tercatat; tanggal selalu lebih menentukan.
   */
  reportedQuarter?: 1 | 2 | 3 | 4;
  /** Asal nilai triwulan dilaporkan, misalnya sel workbook atau koreksi. */
  reportedQuarterSource?: string;
  quality: AcademicQuality;
  /** Nilai atau pengecualian pelengkapan yang sudah disetujui. */
  resolvedMetadata?: MetadataCompletionResolutions;
  review: {
    candidateId: string;
    decision:
      | "Dihubungkan ke rekam resmi"
      | "Disetujui sebagai data baru"
      | "Rekam resmi diperbarui"
      | "Pelengkapan metadata disetujui";
    note: string;
    reviewedAt: string;
    reviewer: string;
  };
  /** Metadata khusus jenis yang berasal dari pengajuan dan tidak diwakili bidang kanonis di atas. */
  sourceMetadata?: NexusOfficialSourceMetadataItem[];
  title: string;
  updatedAt: string;
  /** `undefined` ketika sumber belum mencatat tahun kegiatan. */
  year?: number;
};

/**
 * Rekam akademik sebagaimana ditampilkan halamannya. Rekam yang dibaca dari
 * server belum membawa keputusan tinjauannya, sehingga bagian itu boleh kosong
 * dan ditampilkan apa adanya.
 */
export type NexusAcademicView = Omit<OfficialAcademicRecord, "review"> & {
  /** `false` bila rekam dibaca dari daftar server yang belum memuat peserta. */
  mentorsKnown?: boolean;
  review?: OfficialAcademicRecord["review"];
};

export type NexusAcademicContent = {
  description: string;
  officialNote: string;
  title: string;
};

export function academicMentorNames(record: NexusAcademicView) {
  if (record.mentors.length === 0) {
    return record.mentorsKnown === false ? "" : "Pembimbing belum tercatat";
  }
  return record.mentors.map((mentor) => mentor.name).join("; ");
}

export function academicEvidenceLabel(record: NexusAcademicView) {
  const availableLabel =
    record.evidenceStatus === "internal"
      ? "Tersimpan internal"
      : "Tautan tersedia";
  return metadataCompletionAvailabilityLabel(
    record.resolvedMetadata,
    "evidenceUrl",
    record.missingFields.includes("evidenceUrl"),
    availableLabel,
  );
}

export function academicDisplayTitle(record: NexusAcademicView) {
  return record.title || `${record.activity} · nama kegiatan belum tercatat`;
}

export function academicKmLabel(record: NexusAcademicView) {
  if (record.kmLinks.length === 0)
    return officialKpiEmptyCopy(record.kpiResolutionStatus).label;
  return record.kmLinks.map((link) => link.indicator.id).join(", ");
}

export const academicIndicatorScope: readonly NexusKmIndicator[] = (
  ["KM-28", "KM-29", "KM-30", "KM-31", "KM-32"] as const
).map(kmIndicator);

/** Batas adapter yang dapat diganti layanan server tanpa mengubah halaman. */
export function getNexusAcademicContent(): NexusAcademicContent {
  return {
    description:
      "Seluruh kegiatan akademik resmi CoE BHT yang sudah lolos Tinjauan, mulai dari bimbingan doktor dan magister sampai magang mahasiswa, beserta pembimbing dan bukti kegiatannya.",
    officialNote:
      "Daftar ini hanya memuat rekam resmi. Kegiatan yang sama dengan beberapa pembimbing tetap satu rekam. Baris peserta magang menjadi bukti operasional; nilai KM-30 tetap ditetapkan sebagai kapasitas magang.",
    title: "Akademik",
  };
}
