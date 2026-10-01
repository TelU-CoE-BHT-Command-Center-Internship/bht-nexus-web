"use client";

import type {
  ContractProposalCompletionFieldKey,
  NexusContractProposalView,
} from "@/components/nexus-contract-proposals/nexus-contract-proposals-content";
import {
  useNexusHouseCatalog,
  useNexusHouseDetail,
} from "@/components/nexus-official-records/nexus-house-records";
import {
  kmLinksFromCodes,
  metadataText,
  recordYear,
} from "@/components/nexus-official-records/nexus-record-metadata";
import { formatAuditTimestamp } from "@/components/nexus-workspace-ui/nexus-workspace-format";
import type { ActivityDetail, ActivitySummary } from "@/lib/api-activities";

/**
 * Satu-satunya penerjemah kontrak dan proposal server ke bentuk halamannya.
 * Jenis rekam mengikuti indikator KM yang tercatat; tanpa indikator, jenisnya
 * belum diklasifikasikan. Pihak, skema, pendana, masa kontrak, dan bukti
 * dibaca dari metadata rekam dengan nama kunci yang sama dengan nama bidang
 * halaman.
 */

type Kind = NexusContractProposalView["kind"];
type Group = NexusContractProposalView["group"];

const shapeByIndicator: Record<string, { group: Group; kind: Kind }> = {
  "KM-17": { group: "Kontrak", kind: "Kontrak Riset Nasional" },
  "KM-18": { group: "Kontrak", kind: "Kontrak Riset Internasional" },
  "KM-19": { group: "Kontrak", kind: "Kontrak Bisnis Komersialisasi" },
  "KM-37": { group: "Proposal", kind: "Proposal Riset Nasional" },
  "KM-38": { group: "Proposal", kind: "Proposal Riset Internasional" },
  "KM-39": { group: "Proposal", kind: "Proposal Non-Riset" },
};

const evidenceNotes = {
  internal:
    "Dokumen sumber tersimpan secara internal dan hanya dapat dibuka oleh pengguna yang berwenang.",
  public: "Dokumen sumber dapat dibuka melalui tautan yang tercatat.",
  unrecorded:
    "Sumber belum mencatat tautan atau lokasi dokumen untuk rekam ini.",
} as const;

const statusByActivity: Record<
  ActivitySummary["status"],
  NexusContractProposalView["recordStatus"]
> = {
  cancelled: "Tercatat",
  closed: "Tercatat",
  ongoing: "Aktif",
  planned: "Diajukan",
};

function isProposal(metadata: Record<string, unknown>) {
  const marker =
    metadataText(metadata, "category") ?? metadataText(metadata, "domain");
  return marker === "proposal";
}

function recordDate(metadata: Record<string, unknown>, key: string) {
  const value = metadataText(metadata, key);
  return value && /^\d{4}-\d{2}-\d{2}/.test(value)
    ? value.slice(0, 10)
    : undefined;
}

export function nexusContractProposalFromServer(
  summary: ActivitySummary,
  detail?: ActivityDetail,
): NexusContractProposalView {
  const metadata = summary.metadata ?? {};
  const kmLinks = kmLinksFromCodes(summary.kmIndicators);
  const indicatorId = kmLinks.find(
    (link) => shapeByIndicator[link.indicator.id],
  )?.indicator.id;
  const shaped = indicatorId ? shapeByIndicator[indicatorId] : undefined;
  const kind: Kind = shaped?.kind ?? "Belum diklasifikasikan";
  const group: Group =
    shaped?.group ?? (isProposal(metadata) ? "Proposal" : "Kontrak");
  const classified = shaped !== undefined;
  const title = summary.title.trim();
  const applicant = metadataText(metadata, "applicant");
  const scheme = metadataText(metadata, "scheme");
  const funder = metadataText(metadata, "funder");
  const contractStart = recordDate(metadata, "contractStart");
  const contractEnd = recordDate(metadata, "contractEnd");
  const evidenceUrl =
    metadataText(metadata, "evidenceUrl") ??
    metadataText(metadata, "documentUrl");
  const evidenceStatus = !evidenceUrl
    ? "unrecorded"
    : metadataText(metadata, "evidenceAccess") === "internal"
      ? "internal"
      : "public";
  const isBusiness = kind === "Kontrak Bisnis Komersialisasi";
  const missingFields: ContractProposalCompletionFieldKey[] = [
    ...(title ? [] : (["title"] as const)),
    ...(classified && !isBusiness && !applicant
      ? (["applicant"] as const)
      : []),
    ...(classified && !isBusiness && !scheme ? (["scheme"] as const) : []),
    ...(classified && group === "Proposal" && !funder
      ? (["funder"] as const)
      : []),
    ...(isBusiness && !contractStart ? (["contractStart"] as const) : []),
    ...(isBusiness && !contractEnd ? (["contractEnd"] as const) : []),
    ...(evidenceStatus === "unrecorded" ? (["evidenceUrl"] as const) : []),
  ];
  const year = recordYear(summary.periodStart);

  return {
    applicant,
    contractEnd,
    contractStart,
    evaluationPeriod: year ? String(year) : "",
    evidenceNote: evidenceNotes[evidenceStatus],
    evidenceStatus,
    evidenceUrl,
    funder,
    group,
    id: summary.publicId,
    kind,
    kmLinks,
    missingFields,
    ownerUnit: "CoE BHT",
    partner: metadataText(metadata, "partner"),
    provenance: [],
    publicId: summary.publicId,
    quality: missingFields.length > 0 ? "Perlu dilengkapi" : "Lengkap",
    recordStatus: statusByActivity[summary.status],
    referenceNumber: metadataText(metadata, "referenceNumber"),
    relatedMemberIds: (detail?.participants ?? []).flatMap((participant) =>
      participant.memberPublicId ? [participant.memberPublicId] : [],
    ),
    scheme,
    submittedOn: recordDate(metadata, "submittedOn"),
    title: summary.title,
    updatedAt: formatAuditTimestamp(summary.createdAt),
  };
}

function fromSummary(summary: ActivitySummary) {
  return nexusContractProposalFromServer(summary);
}

function fromDetail(detail: ActivityDetail) {
  return nexusContractProposalFromServer(detail, detail);
}

const catalogError = "Kontrak dan proposal resmi belum dapat dimuat.";
const detailError = "Rincian kontrak atau proposal belum dapat dimuat.";

export function useNexusContractProposalCatalog() {
  return useNexusHouseCatalog("contracts-proposals", fromSummary, catalogError);
}

export function useNexusContractProposalDetail(publicId: string | null) {
  return useNexusHouseDetail(
    "contracts-proposals",
    publicId,
    fromDetail,
    detailError,
  );
}
