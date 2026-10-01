"use client";

import type {
  ContractProposalCompletionFieldKey,
  NexusContractProposalView,
} from "@/components/nexus-contract-proposals/nexus-contract-proposals-content";
import {
  useNexusHouseCatalog,
  useNexusHouseDetail,
} from "@/components/nexus-official-records/nexus-house-records";
import { kmLinksFromCodes } from "@/components/nexus-official-records/nexus-record-metadata";
import { formatAuditTimestamp } from "@/components/nexus-workspace-ui/nexus-workspace-format";
import type {
  ContractProposalDetail,
  ContractProposalSummary,
} from "@/lib/api-house-records";

/**
 * Satu-satunya penerjemah kontrak dan proposal server ke bentuk halamannya.
 * Server menyajikan kelompok, jenis, status, pihak, skema, pendana, masa
 * kontrak, tanggal pengajuan, dan tautan bukti sebagai bidang tersendiri.
 */

type Kind = NexusContractProposalView["kind"];
type Group = NexusContractProposalView["group"];
type RecordStatus = NexusContractProposalView["recordStatus"];

const kindLabels: Record<ContractProposalSummary["kind"], Kind> = {
  commercialization_business_contract: "Kontrak Bisnis Komersialisasi",
  international_research_contract: "Kontrak Riset Internasional",
  international_research_proposal: "Proposal Riset Internasional",
  national_research_contract: "Kontrak Riset Nasional",
  national_research_proposal: "Proposal Riset Nasional",
  non_research_proposal: "Proposal Non-Riset",
};

const indicatorByKind: Record<ContractProposalSummary["kind"], string> = {
  commercialization_business_contract: "KM-19",
  international_research_contract: "KM-18",
  international_research_proposal: "KM-38",
  national_research_contract: "KM-17",
  national_research_proposal: "KM-37",
  non_research_proposal: "KM-39",
};

const groupLabels: Record<ContractProposalSummary["group"], Group> = {
  contract: "Kontrak",
  proposal: "Proposal",
};

const statusLabels: Record<
  ContractProposalSummary["recordStatus"],
  RecordStatus
> = {
  active: "Aktif",
  recorded: "Tercatat",
  submitted: "Diajukan",
};

const evidenceNotes = {
  public: "Dokumen sumber dapat dibuka melalui tautan yang tercatat.",
  unrecorded:
    "Sumber belum mencatat tautan atau lokasi dokumen untuk rekam ini.",
} as const;

export function nexusContractProposalFromServer(
  summary: ContractProposalSummary,
  detail?: ContractProposalDetail,
): NexusContractProposalView {
  const kind = kindLabels[summary.kind];
  const group = groupLabels[summary.group];
  const title = summary.title.trim();
  const applicant = summary.applicant ?? undefined;
  const scheme = summary.scheme ?? undefined;
  const funder = summary.funder ?? undefined;
  const contractStart = summary.contractStart ?? undefined;
  const contractEnd = summary.contractEnd ?? undefined;
  const evidenceUrl = summary.evidenceUrl ?? undefined;
  const evidenceStatus = evidenceUrl ? "public" : "unrecorded";
  const isBusiness = kind === "Kontrak Bisnis Komersialisasi";
  const missingFields: ContractProposalCompletionFieldKey[] = [
    ...(title ? [] : (["title"] as const)),
    ...(!isBusiness && !applicant ? (["applicant"] as const) : []),
    ...(!isBusiness && !scheme ? (["scheme"] as const) : []),
    ...(group === "Proposal" && !funder ? (["funder"] as const) : []),
    ...(isBusiness && !contractStart ? (["contractStart"] as const) : []),
    ...(isBusiness && !contractEnd ? (["contractEnd"] as const) : []),
    ...(evidenceStatus === "unrecorded" ? (["evidenceUrl"] as const) : []),
  ];
  const yearSource =
    summary.contractStart ?? summary.submittedOn ?? summary.createdAt;
  const year = Number(yearSource.slice(0, 4));

  return {
    applicant,
    contractEnd,
    contractStart,
    evaluationPeriod: Number.isInteger(year) ? String(year) : "",
    evidenceNote: evidenceNotes[evidenceStatus],
    evidenceStatus,
    evidenceUrl,
    funder,
    group,
    id: summary.publicId,
    kind,
    kmLinks: kmLinksFromCodes(
      summary.kmIndicators.length > 0
        ? summary.kmIndicators
        : [indicatorByKind[summary.kind]],
    ),
    missingFields,
    ownerUnit: summary.ownerUnit,
    partner: summary.partner ?? undefined,
    provenance: [],
    publicId: summary.publicId,
    quality: missingFields.length > 0 ? "Perlu dilengkapi" : "Lengkap",
    recordStatus: statusLabels[summary.recordStatus],
    referenceNumber: summary.referenceNumber ?? undefined,
    relatedMemberIds: (detail?.relatedMembers ?? []).map(
      (member) => member.memberPublicId,
    ),
    scheme,
    submittedOn: summary.submittedOn ?? undefined,
    title: summary.title,
    updatedAt: formatAuditTimestamp(summary.createdAt),
  };
}

function fromSummary(summary: ContractProposalSummary) {
  return nexusContractProposalFromServer(summary);
}

function fromDetail(detail: ContractProposalDetail) {
  return nexusContractProposalFromServer(detail, detail);
}

const catalogError = "Kontrak dan proposal resmi belum dapat dimuat.";
const detailError = "Rincian kontrak atau proposal belum dapat dimuat.";

export function useNexusContractProposalCatalog(memberPublicId?: string) {
  return useNexusHouseCatalog(
    "contracts-proposals",
    fromSummary,
    catalogError,
    memberPublicId,
  );
}

export function useNexusContractProposalDetail(publicId: string | null) {
  return useNexusHouseDetail(
    "contracts-proposals",
    publicId,
    fromDetail,
    detailError,
  );
}
