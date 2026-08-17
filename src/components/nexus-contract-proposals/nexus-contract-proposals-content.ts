import type { MetadataCompletionProposal } from "@/components/nexus-metadata-completion/nexus-metadata-completion-form";
import {
  type MetadataCompletionFieldKey,
  metadataCompletionFieldLabels,
} from "@/components/nexus-metadata-completion/nexus-metadata-completion-model";
import {
  kmIndicator,
  type NexusKmIndicator,
} from "@/content/nexus-km-indicators";

type ContractProposalIndicatorId =
  | "KM-17"
  | "KM-18"
  | "KM-19"
  | "KM-37"
  | "KM-38"
  | "KM-39";

export type ContractProposalGroup = "Kontrak" | "Proposal";

export type ContractProposalKind =
  | "Kontrak Riset Nasional"
  | "Kontrak Riset Internasional"
  | "Kontrak Bisnis Komersialisasi"
  | "Proposal Riset Nasional"
  | "Proposal Riset Internasional"
  | "Proposal Non-Riset";

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
  applicant: string;
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
  missingFields: ContractProposalCompletionFieldKey[];
  ownerUnit: string;
  partner?: string;
  provenance: ContractProposalProvenance[];
  publicId: string;
  quality: ContractProposalQuality;
  recordStatus: "Aktif" | "Diajukan" | "Tercatat";
  review: {
    candidateId: string;
    decision: "Dihubungkan ke rekam resmi" | "Disetujui sebagai data baru";
    note: string;
    reviewedAt: string;
    reviewer: string;
  };
  scheme?: string;
  title: string;
  updatedAt: string;
};

export type NexusContractProposalContent = {
  description: string;
  officialNote: string;
  records: OfficialContractProposalRecord[];
  title: string;
  updatedAt: string;
};

const capturedAt = "14 Agu 2026";
const evaluationPeriod = "2026";

const indicatorNotes: Record<ContractProposalIndicatorId, string> = {
  "KM-17":
    "Kontrak riset nasional dihitung setelah hubungan kontraktual dan bukti pendukungnya dapat diperiksa.",
  "KM-18":
    "Kontrak riset internasional dihitung setelah hubungan kontraktual dan bukti pendukungnya dapat diperiksa.",
  "KM-19":
    "Kontrak bisnis dihitung ketika kontrak komersialisasi dan masa berlakunya dapat diperiksa.",
  "KM-37":
    "Proposal riset nasional dihitung ketika pengajuannya pada periode evaluasi dapat dibuktikan.",
  "KM-38":
    "Proposal riset internasional dihitung ketika pengajuannya pada periode evaluasi dapat dibuktikan.",
  "KM-39":
    "Proposal non-riset dihitung ketika bentuk program dan bukti pengajuannya dapat diperiksa.",
};

const evidenceNotes: Record<ContractProposalEvidenceStatus, string> = {
  internal:
    "Dokumen sumber tersimpan secara internal dan hanya dapat dibuka oleh pengguna yang berwenang.",
  public: "Dokumen sumber dapat dibuka melalui tautan yang tercatat.",
  unrecorded:
    "Sumber belum mencatat tautan atau lokasi dokumen untuk rekam ini.",
};

type ContractProposalSeed = {
  applicant?: string;
  contractEnd?: string;
  contractStart?: string;
  evidenceStatus: ContractProposalEvidenceStatus;
  evidenceUrl?: string;
  funder?: string;
  group: ContractProposalGroup;
  indicatorId: ContractProposalIndicatorId;
  kind: ContractProposalKind;
  partner?: string;
  publicId: string;
  recordStatus: OfficialContractProposalRecord["recordStatus"];
  scheme?: string;
  sources: readonly ContractProposalProvenance[];
  title?: string;
};

/**
 * Bentuk bidang mengikuti rumah data Kontrak dan Proposal pada workbook KM
 * 2026. Nilai operasional dibuat netral karena repository frontend bersifat
 * publik; server kelak menggantinya melalui batas adapter di bawah.
 */
const seeds: readonly ContractProposalSeed[] = [
  {
    applicant: "Tim Riset A",
    evidenceStatus: "internal",
    group: "Kontrak",
    indicatorId: "KM-17",
    kind: "Kontrak Riset Nasional",
    publicId: "KPR-2026-0001",
    recordStatus: "Tercatat",
    scheme: "Skema Riset Nasional A",
    sources: [
      {
        capturedAt,
        identifier: "KPR-SRC-001",
        source: "Data kontrak",
      },
    ],
    title: "Program Riset Nasional A",
  },
  {
    applicant: "Tim Riset B",
    evidenceStatus: "unrecorded",
    group: "Kontrak",
    indicatorId: "KM-18",
    kind: "Kontrak Riset Internasional",
    partner: "Mitra Riset Internasional A",
    publicId: "KPR-2026-0002",
    recordStatus: "Tercatat",
    scheme: "Skema Riset Internasional A",
    sources: [
      {
        capturedAt,
        identifier: "KPR-SRC-002",
        note: "Identitas kontrak tersedia, tetapi lokasi dokumen belum tercatat pada sumber.",
        source: "Data kontrak",
      },
    ],
    title: "Program Riset Internasional A",
  },
  {
    applicant: "Penanggung Jawab A",
    contractStart: "2026-02-01",
    evidenceStatus: "internal",
    group: "Kontrak",
    indicatorId: "KM-19",
    kind: "Kontrak Bisnis Komersialisasi",
    partner: "Mitra Industri A",
    publicId: "KPR-2026-0003",
    recordStatus: "Aktif",
    sources: [
      {
        capturedAt,
        identifier: "KPR-SRC-003",
        note: "Tanggal selesai kontrak belum tercatat pada sumber.",
        source: "Data kontrak",
      },
    ],
    title: "Kontrak Komersialisasi A",
  },
  {
    applicant: "Pengusul A",
    evidenceStatus: "internal",
    funder: "Pemberi Hibah A",
    group: "Proposal",
    indicatorId: "KM-37",
    kind: "Proposal Riset Nasional",
    partner: "Mitra Riset Nasional A",
    publicId: "PPL-2026-0001",
    recordStatus: "Diajukan",
    scheme: "Program Hibah Nasional A",
    sources: [
      {
        capturedAt,
        identifier: "PPL-SRC-001",
        source: "Data proposal",
      },
    ],
    title: "Proposal Riset Nasional A",
  },
  {
    applicant: "Pengusul B",
    evidenceStatus: "unrecorded",
    funder: "Pemberi Hibah Internasional A",
    group: "Proposal",
    indicatorId: "KM-38",
    kind: "Proposal Riset Internasional",
    partner: "Mitra Internasional B",
    publicId: "PPL-2026-0002",
    recordStatus: "Diajukan",
    scheme: "Program Hibah Internasional A",
    sources: [
      {
        capturedAt,
        identifier: "PPL-SRC-002",
        note: "Bukti pengajuan belum tercatat pada sumber.",
        source: "Data proposal",
      },
    ],
    title: "Proposal Riset Internasional A",
  },
  {
    applicant: "Pengusul C",
    evidenceStatus: "internal",
    funder: "Pemberi Program A",
    group: "Proposal",
    indicatorId: "KM-39",
    kind: "Proposal Non-Riset",
    publicId: "PPL-2026-0003",
    recordStatus: "Diajukan",
    sources: [
      {
        capturedAt,
        identifier: "PPL-SRC-003",
        note: "Judul dan skema program belum tercatat pada sumber.",
        source: "Data proposal",
      },
    ],
  },
];

function createRecord(
  seed: ContractProposalSeed,
): OfficialContractProposalRecord {
  const title = seed.title ?? "";
  const applicant = seed.applicant ?? "";
  const requiresScheme = seed.kind !== "Kontrak Bisnis Komersialisasi";
  const requiresFunder = seed.group === "Proposal";
  const requiresContractDates = seed.kind === "Kontrak Bisnis Komersialisasi";
  const missingFields: ContractProposalCompletionFieldKey[] = [
    ...(title ? [] : (["title"] as const)),
    ...(applicant ? [] : (["applicant"] as const)),
    ...(requiresScheme && !seed.scheme ? (["scheme"] as const) : []),
    ...(requiresFunder && !seed.funder ? (["funder"] as const) : []),
    ...(requiresContractDates && !seed.contractStart
      ? (["contractStart"] as const)
      : []),
    ...(requiresContractDates && !seed.contractEnd
      ? (["contractEnd"] as const)
      : []),
    ...(seed.evidenceStatus === "unrecorded" ? (["evidenceUrl"] as const) : []),
  ];

  return {
    applicant,
    contractEnd: seed.contractEnd,
    contractStart: seed.contractStart,
    evaluationPeriod,
    evidenceNote: evidenceNotes[seed.evidenceStatus],
    evidenceStatus: seed.evidenceStatus,
    evidenceUrl: seed.evidenceUrl,
    funder: seed.funder,
    group: seed.group,
    id: seed.publicId.toLocaleLowerCase("id-ID"),
    kind: seed.kind,
    kmLinks: [
      {
        indicator: kmIndicator(seed.indicatorId),
        note: indicatorNotes[seed.indicatorId],
      },
    ],
    missingFields,
    ownerUnit: "CoE BHT",
    partner: seed.partner,
    provenance: [...seed.sources],
    publicId: seed.publicId,
    quality: missingFields.length > 0 ? "Perlu dilengkapi" : "Lengkap",
    recordStatus: seed.recordStatus,
    review: {
      candidateId: `KPR-CAND-${seed.publicId.slice(-4)}`,
      decision: "Disetujui sebagai data baru",
      note: "Jenis rekam, pihak terkait, indikator, dan kelengkapan dokumen diperiksa sebelum rekam disetujui.",
      reviewedAt: capturedAt,
      reviewer: "Pemeriksa A",
    },
    scheme: seed.scheme,
    title,
    updatedAt: capturedAt,
  };
}

const records = seeds.map(createRecord);

export function contractProposalDisplayTitle(
  record: OfficialContractProposalRecord,
) {
  return record.title || `${record.kind} · judul belum tercatat`;
}

export function contractProposalEvidenceLabel(
  record: OfficialContractProposalRecord,
) {
  if (record.evidenceStatus === "internal") return "Tersimpan internal";
  if (record.evidenceStatus === "public") return "Tautan tersedia";
  return "Belum tercatat";
}

export function contractProposalKmLabel(
  record: OfficialContractProposalRecord,
) {
  return record.kmLinks.map((link) => link.indicator.id).join(", ");
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
      "Kontrak dan proposal tetap menjadi dua jenis rekam berbeda. Keduanya disatukan pada satu rumah data agar hubungan dari pengajuan menuju kontrak dapat ditelusuri tanpa mencampur statusnya.",
    records,
    title: "Kontrak & Proposal",
    updatedAt: "Diperbarui 17 Agustus 2026 · 09.30 WIB",
  };
}
