import type { NexusMemberId } from "@/components/nexus-members/nexus-member-identity";
import {
  type MetadataCompletionFieldKey,
  type MetadataCompletionProposal,
  type MetadataCompletionResolutions,
  metadataCompletionFieldLabels,
} from "@/components/nexus-metadata-completion/nexus-metadata-completion-model";
import { officialKpiEmptyCopy } from "@/components/nexus-workspace-ui/nexus-official-kpi";
import {
  kmIndicator,
  type NexusKmIndicator,
} from "@/content/nexus-km-indicators";

type IntellectualPropertyIndicatorId = "KM-15" | "KM-16";

type IntellectualPropertyProtection =
  | "Belum diklasifikasikan"
  | "Desain Industri"
  | "Hak Cipta"
  | "Merek"
  | "Paten";

type IntellectualPropertyQuality = "Lengkap" | "Perlu dilengkapi";

export type IntellectualPropertyCompletionFieldKey = MetadataCompletionFieldKey;

export const intellectualPropertyFieldLabels = metadataCompletionFieldLabels;

export type IntellectualPropertyProposal = MetadataCompletionProposal;

type IntellectualPropertyCreator = {
  id: string;
  initials: string;
  memberId?: NexusMemberId;
  name: string;
};

type IntellectualPropertyProvenance = {
  capturedAt: string;
  identifier: string;
  note?: string;
  source: string;
};

type IntellectualPropertyKmLink = {
  indicator: NexusKmIndicator;
  note: string;
};

type IntellectualPropertyDocumentAccess = "internal" | "public" | "unrecorded";

export type OfficialIntellectualProperty = {
  creators: IntellectualPropertyCreator[];
  documentAccess: IntellectualPropertyDocumentAccess;
  documentNote?: string;
  documentUrl?: string;
  /** Periode evaluasi KM, bukan tahun pengajuan. */
  evaluationPeriod: string;
  filedOn?: string;
  id: string;
  kmLinks: IntellectualPropertyKmLink[];
  kpiResolutionStatus?: "not_applicable" | "resolved" | "undetermined";
  missingFields: IntellectualPropertyCompletionFieldKey[];
  protection: IntellectualPropertyProtection;
  provenance: IntellectualPropertyProvenance[];
  publicId: string;
  /**
   * Triwulan realisasi menurut pelapor atau auditor (1–4). Dipakai hanya bila
   * tanggal bisnis rekam belum tercatat; tanggal selalu lebih menentukan.
   */
  reportedQuarter?: 1 | 2 | 3 | 4;
  /** Asal nilai triwulan dilaporkan, misalnya sel workbook atau koreksi. */
  reportedQuarterSource?: string;
  quality: IntellectualPropertyQuality;
  registrationNumber?: string;
  registry: string;
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
  title: string;
  updatedAt: string;
  /** `undefined` ketika sumber belum mencatat tahun pengajuan. */
  year?: number;
};

/**
 * Rekam kekayaan intelektual sebagaimana ditampilkan halamannya. Rekam yang
 * dibaca dari server belum membawa keputusan tinjauannya, sehingga bagian itu
 * boleh kosong dan ditampilkan apa adanya.
 */
export type NexusIntellectualPropertyView = Omit<
  OfficialIntellectualProperty,
  "review"
> & {
  review?: OfficialIntellectualProperty["review"];
};

export type NexusIntellectualPropertyContent = {
  description: string;
  officialNote: string;
  title: string;
};

const kmLinkNotes: Record<IntellectualPropertyIndicatorId, string> = {
  "KM-15":
    "Pengajuan HKI tahun berjalan sampai pendaftaran ke Kemenkumham melalui klinik HKI, dihitung setelah memperoleh nomor registrasi.",
  "KM-16":
    "Pengajuan paten tahun berjalan sampai pendaftaran ke Kemenkumham, dihitung setelah memperoleh nomor registrasi.",
};

/**
 * Kaitan KM baru dibentuk setelah keputusan pelengkapan menghasilkan jenis
 * perlindungan yang jelas dan nomor registrasi yang benar-benar tersedia.
 * Pengecualian atas nomor registrasi tetap menyelesaikan metadata, tetapi tidak
 * cukup untuk menyatakan rekam memenuhi bukti indikator.
 */
export function normalizeProjectedIntellectualProperty<
  Record extends NexusIntellectualPropertyView,
>(record: Record): Record {
  if (record.kmLinks.length > 0) return record;
  if (
    record.protection === "Belum diklasifikasikan" ||
    !record.registrationNumber ||
    record.missingFields.includes("protectionType") ||
    record.missingFields.includes("registrationNumber")
  ) {
    return record;
  }

  const indicatorId: IntellectualPropertyIndicatorId =
    record.protection === "Paten" ? "KM-16" : "KM-15";
  return {
    ...record,
    kmLinks: [
      {
        indicator: kmIndicator(indicatorId),
        note: kmLinkNotes[indicatorId],
      },
    ],
  };
}

export function intellectualPropertyCreatorNames(
  record: NexusIntellectualPropertyView,
) {
  return record.creators.map((creator) => creator.name).join("; ");
}

export function intellectualPropertyKmLabel(
  record: NexusIntellectualPropertyView,
) {
  if (record.kmLinks.length === 0)
    return officialKpiEmptyCopy(record.kpiResolutionStatus).label;
  return record.kmLinks.map((link) => link.indicator.id).join(", ");
}

/** Batas adapter yang dapat diganti layanan server tanpa mengubah halaman. */
export function getNexusIntellectualPropertyContent(): NexusIntellectualPropertyContent {
  return {
    description:
      "Seluruh kekayaan intelektual resmi CoE BHT yang sudah lolos Tinjauan, mulai dari hak cipta sampai paten, beserta nomor pencatatan dan dokumen pendaftarannya.",
    officialNote:
      "Daftar ini hanya memuat rekam resmi. Pengajuan yang belum selesai diperiksa tetap berada di Tinjauan.",
    title: "Kekayaan Intelektual",
  };
}
