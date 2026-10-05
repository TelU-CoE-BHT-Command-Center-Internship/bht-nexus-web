import {
  type MetadataCompletionFieldKey,
  type MetadataCompletionProposal,
  type MetadataCompletionResolutions,
  metadataCompletionAvailabilityLabel,
  metadataCompletionFieldLabels,
} from "@/components/nexus-metadata-completion/nexus-metadata-completion-model";
import type { NexusOfficialSourceMetadataItem } from "@/components/nexus-workspace-ui/nexus-official-source-metadata";
import {
  kmIndicator,
  type NexusKmIndicator,
} from "@/content/nexus-km-indicators";

export type ContractProposalGroup = "Kontrak" | "Proposal";

export type ContractProposalKind =
  | "Kontrak Riset Nasional"
  | "Kontrak Riset Internasional"
  | "Kontrak Bisnis Komersialisasi"
  | "Proposal Riset Nasional"
  | "Proposal Riset Internasional"
  | "Proposal Non-Riset"
  | "Belum diklasifikasikan";

type ContractProposalQuality = "Lengkap" | "Perlu dilengkapi";
type ContractProposalEvidenceStatus = "internal" | "public" | "unrecorded";

export type ContractProposalCompletionFieldKey = MetadataCompletionFieldKey;
export const contractProposalFieldLabels = metadataCompletionFieldLabels;
export type ContractProposalProposal = MetadataCompletionProposal;

type ContractProposalProvenance = {
  capturedAt: string;
  identifier: string;
  note?: string;
  source: string;
};

type ContractProposalKmLink = {
  indicator: NexusKmIndicator;
  note: string;
};

export type OfficialContractProposalRecord = {
  /** Tidak dimiliki kontrak bisnis pada struktur sumber KM-19. */
  applicant?: string;
  contractEnd?: string;
  contractStart?: string;
  evaluationPeriod: string;
  evidenceNote: string;
  evidenceStatus: ContractProposalEvidenceStatus;
  evidenceUrl?: string;
  funder?: string;
  group: ContractProposalGroup;
  id: string;
  kind: ContractProposalKind;
  kmLinks: ContractProposalKmLink[];
  kpiResolutionStatus?: "not_applicable" | "resolved" | "undetermined";
  missingFields: ContractProposalCompletionFieldKey[];
  ownerUnit: string;
  partner?: string;
  provenance: ContractProposalProvenance[];
  publicId: string;
  /**
   * Triwulan realisasi menurut pelapor atau auditor (1–4). Dipakai hanya bila
   * tanggal bisnis rekam belum tercatat; tanggal selalu lebih menentukan.
   */
  reportedQuarter?: 1 | 2 | 3 | 4;
  /** Asal nilai triwulan dilaporkan, misalnya sel workbook atau koreksi. */
  reportedQuarterSource?: string;
  quality: ContractProposalQuality;
  relatedMemberIds: string[];
  referenceNumber?: string;
  recordStatus: "Aktif" | "Diajukan" | "Tercatat";
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
  scheme?: string;
  /** Metadata khusus jenis yang berasal dari pengajuan dan tidak diwakili bidang kanonis di atas. */
  sourceMetadata?: NexusOfficialSourceMetadataItem[];
  /** Tanggal submit proposal; berbeda dari tanggal mulai kontrak. */
  submittedOn?: string;
  title: string;
  updatedAt: string;
};

/**
 * Rekam kontrak atau proposal sebagaimana ditampilkan halamannya. Rekam yang
 * dibaca dari server belum membawa keputusan tinjauannya, sehingga bagian itu
 * boleh kosong dan ditampilkan apa adanya.
 */
export type NexusContractProposalView = Omit<
  OfficialContractProposalRecord,
  "review"
> & {
  review?: OfficialContractProposalRecord["review"];
};

export type NexusContractProposalContent = {
  description: string;
  officialNote: string;
  title: string;
};

export function contractProposalDisplayTitle(
  record: NexusContractProposalView,
) {
  return record.title || `${record.kind} · judul belum tercatat`;
}

export function contractProposalEvidenceLabel(
  record: NexusContractProposalView,
) {
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

export function contractProposalKmLabel(record: NexusContractProposalView) {
  return record.kmLinks.map((link) => link.indicator.id).join(", ");
}

export function contractProposalPrimaryParty(
  record: NexusContractProposalView,
) {
  return record.applicant || record.partner || record.ownerUnit;
}

export function formatContractProposalDate(value?: string) {
  if (!value) return "Belum tercatat";
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    timeZone: "UTC",
    year: "numeric",
  }).format(new Date(`${value}T00:00:00Z`));
}

export const contractProposalIndicatorScope: readonly NexusKmIndicator[] = (
  ["KM-17", "KM-18", "KM-19", "KM-37", "KM-38", "KM-39"] as const
).map(kmIndicator);

/** Batas adapter yang dapat diganti respons server tanpa mengubah halaman. */
export function getNexusContractProposalContent(): NexusContractProposalContent {
  return {
    description:
      "Seluruh kontrak dan proposal resmi CoE BHT yang sudah lolos Tinjauan, beserta pihak terkait, skema, bukti, dan keterkaitan indikator KM.",
    officialNote:
      "Kontrak dan proposal tetap menjadi dua jenis rekam berbeda. Keduanya ditampilkan pada satu rumah data agar pemeriksaan konsisten tanpa menyatakan hubungan antar-rekam yang belum disediakan sumber.",
    title: "Kontrak & Proposal",
  };
}
