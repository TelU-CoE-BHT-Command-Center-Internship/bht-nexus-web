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

export type ActivityGroup =
  | "Bisnis"
  | "Pengabdian masyarakat"
  | "Riset & jejaring";

export type ActivityKind =
  | "Kunjungan Lembaga Internasional"
  | "Pembicara Undangan Internasional"
  | "Keterlibatan Unit Bisnis"
  | "Pembinaan UMKM / Komunitas"
  | "Pengelolaan Konferensi Internasional"
  | "Kontrak Non-Riset"
  | "Community Services"
  | "Proposal Abdimas DRTPM"
  | "Proposal Abdimas SDGs"
  | "Pengelolaan Jurnal Ilmiah"
  | "Kegiatan Lainnya";

type ActivityQuality = "Lengkap" | "Perlu dilengkapi";
type ActivityEvidenceStatus = "internal" | "public" | "unrecorded";

export type ActivityCompletionFieldKey = MetadataCompletionFieldKey;
export const activityFieldLabels = metadataCompletionFieldLabels;
export type ActivityProposal = MetadataCompletionProposal;

type ActivityProvenance = {
  capturedAt: string;
  identifier: string;
  note?: string;
  source: string;
};

type ActivityKmLink = {
  indicator: NexusKmIndicator;
  note: string;
};

export type OfficialActivityRecord = {
  evaluationPeriod: string;
  eventDate?: string;
  evidenceNote: string;
  evidenceStatus: ActivityEvidenceStatus;
  evidenceUrl?: string;
  funding?: string;
  group: ActivityGroup;
  id: string;
  issn?: string;
  journalVolume?: string;
  kind: ActivityKind;
  kmLinks: ActivityKmLink[];
  kpiResolutionStatus?: "not_applicable" | "resolved" | "undetermined";
  location?: string;
  missingFields: ActivityCompletionFieldKey[];
  organization?: string;
  ownerUnit: string;
  primaryParty: string;
  provenance: ActivityProvenance[];
  publicId: string;
  /**
   * Triwulan realisasi menurut pelapor atau auditor (1–4). Dipakai hanya bila
   * tanggal bisnis rekam belum tercatat; tanggal selalu lebih menentukan.
   */
  reportedQuarter?: 1 | 2 | 3 | 4;
  /** Asal nilai triwulan dilaporkan, misalnya sel workbook atau koreksi. */
  reportedQuarterSource?: string;
  publicationFrequency?: string;
  quality: ActivityQuality;
  relatedMemberIds: string[];
  referenceNumber?: string;
  recordStatus: "Aktif" | "Diajukan" | "Dikelola" | "Tercatat";
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
  role?: string;
  scheme?: string;
  /** Metadata khusus jenis yang berasal dari pengajuan dan tidak diwakili bidang kanonis di atas. */
  sourceMetadata?: NexusOfficialSourceMetadataItem[];
  /** Tanggal submit untuk subtype proposal; bukan tanggal pelaksanaan. */
  submittedOn?: string;
  targetGroup?: string;
  team?: string;
  /** Tidak dimiliki worksheet KM-20 dan KM-21. */
  title?: string;
  updatedAt: string;
};

/**
 * Rekam kegiatan sebagaimana ditampilkan halaman Kegiatan & Pengabdian. Rekam
 * yang dibaca dari server membawa status kegiatannya sendiri, periode
 * pelaksanaan, dan waktu pencatatan, tetapi belum membawa keputusan tinjauan.
 */
export type NexusActivityView = Omit<
  OfficialActivityRecord,
  "recordStatus" | "review"
> & {
  /** Periode pelaksanaan, dipakai sebagai konteks bila bidang khusus jenis kosong. */
  periodLabel?: string;
  recordStatus:
    | OfficialActivityRecord["recordStatus"]
    | "Berjalan"
    | "Dibatalkan"
    | "Direncanakan"
    | "Selesai";
  /** Waktu rekam resmi dicatat, dipakai bila waktu pembaruan belum tercatat. */
  recordedAt?: string;
  review?: OfficialActivityRecord["review"];
};

export type NexusActivitiesContent = {
  description: string;
  officialNote: string;
  title: string;
};

export function activityDisplayTitle(record: NexusActivityView) {
  if (record.title) return record.title;
  if (
    record.kind === "Keterlibatan Unit Bisnis" ||
    record.kind === "Pembinaan UMKM / Komunitas"
  ) {
    return `${record.kind} · ${
      record.organization || record.primaryParty || "pihak belum tercatat"
    }`;
  }
  return `${record.kind} · judul belum tercatat`;
}

export function activityEvidenceLabel(record: NexusActivityView) {
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

export function activityKmLabel(record: NexusActivityView) {
  if (record.kmLinks.length === 0)
    return officialKpiEmptyCopy(record.kpiResolutionStatus).label;
  return record.kmLinks.map((link) => link.indicator.id).join(", ");
}

function formatActivityDate(value: string) {
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    timeZone: "UTC",
    year: "numeric",
  }).format(new Date(`${value}T00:00:00Z`));
}

export function activityContextLabel(record: NexusActivityView) {
  return activityKindContextLabel(record) || record.periodLabel || "";
}

function activityKindContextLabel(record: NexusActivityView) {
  if (record.kind === "Keterlibatan Unit Bisnis") {
    return [record.role, record.organization].filter(Boolean).join(" · ");
  }
  if (record.kind === "Pembinaan UMKM / Komunitas") {
    return record.organization ?? "Komunitas belum tercatat";
  }
  if (record.kind === "Pengelolaan Konferensi Internasional") {
    return [
      record.eventDate ? formatActivityDate(record.eventDate) : undefined,
      record.location,
    ]
      .filter(Boolean)
      .join(" · ");
  }
  if (record.kind === "Pengelolaan Jurnal Ilmiah") {
    return [record.journalVolume, record.issn].filter(Boolean).join(" · ");
  }
  return [record.scheme, record.targetGroup].filter(Boolean).join(" · ");
}

export const activityIndicatorScope: readonly NexusKmIndicator[] = (
  [
    "KM-9",
    "KM-10",
    "KM-20",
    "KM-21",
    "KM-22",
    "KM-23",
    "KM-24",
    "KM-25",
    "KM-26",
    "KM-27",
  ] as const
).map(kmIndicator);

/** Batas adapter yang dapat diganti respons server tanpa mengubah halaman. */
export function getNexusActivitiesContent(): NexusActivitiesContent {
  return {
    description:
      "Seluruh keterlibatan bisnis, kegiatan, dan pengabdian resmi CoE BHT yang sudah lolos Tinjauan, beserta pihak, sasaran, bukti, dan keterkaitan indikator KM.",
    officialNote:
      "Setiap indikator mempertahankan bidang kerjanya sendiri. Keterlibatan bisnis, pembinaan komunitas, konferensi, pengabdian, proposal, dan pengelolaan jurnal tidak dilebur menjadi satu bentuk kegiatan generik.",
    title: "Kegiatan & Pengabdian",
  };
}
