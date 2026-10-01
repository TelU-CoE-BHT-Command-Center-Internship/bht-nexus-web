"use client";

import {
  type IntellectualPropertyCompletionFieldKey,
  type NexusIntellectualPropertyView,
  normalizeProjectedIntellectualProperty,
} from "@/components/nexus-intellectual-property/nexus-intellectual-property-content";
import {
  useNexusHouseCatalog,
  useNexusHouseDetail,
} from "@/components/nexus-official-records/nexus-house-records";
import {
  formatRecordDate,
  kmLinksFromCodes,
} from "@/components/nexus-official-records/nexus-record-metadata";
import {
  formatAuditTimestamp,
  personInitials,
} from "@/components/nexus-workspace-ui/nexus-workspace-format";
import type {
  IntellectualPropertyDetail,
  IntellectualPropertySummary,
} from "@/lib/api-house-records";

/**
 * Satu-satunya penerjemah kekayaan intelektual server ke bentuk halamannya.
 * Server menyajikan jenis perlindungan, nomor pencatatan, tanggal pengajuan,
 * registri, tautan dokumen, dan pencipta sebagai bidang tersendiri.
 */

type Protection = NexusIntellectualPropertyView["protection"];

const protectionLabels: Record<
  IntellectualPropertySummary["protection"],
  Protection
> = {
  copyright: "Hak Cipta",
  industrial_design: "Desain Industri",
  patent: "Paten",
  trademark: "Merek",
  unclassified: "Belum diklasifikasikan",
};

const documentNotes = {
  public: "Dokumen pendaftaran dapat dibuka melalui tautan yang tercatat.",
  unrecorded: "Sumber belum mencatat dokumen pendaftaran untuk rekam ini.",
} as const;

export function nexusIntellectualPropertyFromServer(
  summary: IntellectualPropertySummary,
  detail?: IntellectualPropertyDetail,
): NexusIntellectualPropertyView {
  const protection = protectionLabels[summary.protection];
  const year = summary.year ?? undefined;
  const registrationNumber = summary.registrationNumber ?? undefined;
  const documentUrl = summary.evidenceUrl ?? undefined;
  const documentAccess = documentUrl ? "public" : "unrecorded";
  const creators = [...(detail?.creators ?? [])]
    .sort((a, b) => a.creatorOrder - b.creatorOrder)
    .map((creator) => ({
      id: `${summary.publicId}-creator-${creator.creatorOrder}`,
      initials: personInitials(creator.creatorNameRaw),
      memberId: creator.memberPublicId ?? undefined,
      name: creator.creatorNameRaw,
    }));
  const missingFields: IntellectualPropertyCompletionFieldKey[] = [
    ...(protection === "Belum diklasifikasikan"
      ? (["protectionType"] as const)
      : []),
    ...(year === undefined ? (["year"] as const) : []),
    ...(registrationNumber ? [] : (["registrationNumber"] as const)),
    ...(documentAccess === "unrecorded" ? (["documentUrl"] as const) : []),
  ];

  return normalizeProjectedIntellectualProperty({
    creators,
    documentAccess,
    documentNote: documentNotes[documentAccess],
    documentUrl,
    evaluationPeriod: year ? String(year) : "",
    filedOn: summary.filedOn ? formatRecordDate(summary.filedOn) : undefined,
    id: summary.publicId,
    kmLinks: kmLinksFromCodes(summary.kmIndicators),
    missingFields,
    protection,
    provenance: [],
    publicId: summary.publicId,
    quality: missingFields.length > 0 ? "Perlu dilengkapi" : "Lengkap",
    registrationNumber,
    registry: summary.registry || "Belum tercatat",
    title: summary.title,
    updatedAt: formatAuditTimestamp(summary.createdAt),
    year,
  });
}

function fromSummary(summary: IntellectualPropertySummary) {
  return nexusIntellectualPropertyFromServer(summary);
}

function fromDetail(detail: IntellectualPropertyDetail) {
  return nexusIntellectualPropertyFromServer(detail, detail);
}

const catalogError = "Kekayaan intelektual resmi belum dapat dimuat.";
const detailError = "Rincian kekayaan intelektual belum dapat dimuat.";

export function useNexusIntellectualPropertyCatalog(memberPublicId?: string) {
  return useNexusHouseCatalog(
    "intellectual-properties",
    fromSummary,
    catalogError,
    memberPublicId,
  );
}

export function useNexusIntellectualPropertyDetail(publicId: string | null) {
  return useNexusHouseDetail(
    "intellectual-properties",
    publicId,
    fromDetail,
    detailError,
  );
}
