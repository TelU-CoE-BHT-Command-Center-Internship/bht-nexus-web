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
  metadataText,
  recordYear,
} from "@/components/nexus-official-records/nexus-record-metadata";
import {
  formatAuditTimestamp,
  personInitials,
} from "@/components/nexus-workspace-ui/nexus-workspace-format";
import type { ActivityDetail, ActivitySummary } from "@/lib/api-activities";

/**
 * Satu-satunya penerjemah kekayaan intelektual server ke bentuk halamannya.
 * Server menyajikan HKI sebagai kegiatan berlabel domain; jenis perlindungan,
 * nomor pencatatan, tanggal pengajuan, dokumen, dan registri dibaca dari
 * metadata rekam dengan nama kunci yang sama dengan nama bidang halaman.
 */

type Protection = NexusIntellectualPropertyView["protection"];

const protectionByCategory: Record<string, Protection> = {
  copyright: "Hak Cipta",
  industrial_design: "Desain Industri",
  patent: "Paten",
  trademark: "Merek",
};

const protectionLabels: ReadonlySet<string> = new Set([
  "Desain Industri",
  "Hak Cipta",
  "Merek",
  "Paten",
]);

const documentNotes = {
  internal:
    "Dokumen pendaftaran tersimpan pada penyimpanan internal dan hanya tersedia untuk pengguna yang berwenang.",
  public: "Dokumen pendaftaran dapat dibuka melalui tautan publik.",
  unrecorded: "Sumber belum mencatat dokumen pendaftaran untuk rekam ini.",
} as const;

function protectionOf(metadata: Record<string, unknown>): Protection {
  const declared = metadataText(metadata, "protection");
  if (declared && protectionLabels.has(declared)) return declared as Protection;
  const category = metadataText(metadata, "category");
  return (
    (category && protectionByCategory[category]) || "Belum diklasifikasikan"
  );
}

export function nexusIntellectualPropertyFromServer(
  summary: ActivitySummary,
  detail?: ActivityDetail,
  names: ReadonlyMap<string, string> = new Map(),
): NexusIntellectualPropertyView {
  const metadata = summary.metadata ?? {};
  const year = recordYear(summary.periodStart);
  const protection = protectionOf(metadata);
  const registrationNumber = metadataText(metadata, "registrationNumber");
  const documentUrl =
    metadataText(metadata, "documentUrl") ??
    metadataText(metadata, "evidenceUrl");
  const documentAccess = !documentUrl
    ? "unrecorded"
    : metadataText(metadata, "documentAccess") === "public"
      ? "public"
      : "internal";
  const filedOn = metadataText(metadata, "filedOn");
  const creators = (detail?.participants ?? []).flatMap(
    (participant, index) => {
      const name = participant.memberPublicId
        ? names.get(participant.memberPublicId)
        : undefined;
      return name
        ? [
            {
              id: `${summary.publicId}-creator-${index + 1}`,
              initials: personInitials(name),
              memberId: participant.memberPublicId ?? undefined,
              name,
            },
          ]
        : [];
    },
  );
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
    filedOn: filedOn ? formatRecordDate(filedOn) : undefined,
    id: summary.publicId,
    kmLinks: kmLinksFromCodes(summary.kmIndicators),
    missingFields,
    protection,
    provenance: [],
    publicId: summary.publicId,
    quality: missingFields.length > 0 ? "Perlu dilengkapi" : "Lengkap",
    registrationNumber,
    registry: metadataText(metadata, "registry") ?? "Belum tercatat",
    title: summary.title,
    updatedAt: formatAuditTimestamp(summary.createdAt),
    year,
  });
}

function fromSummary(summary: ActivitySummary) {
  return nexusIntellectualPropertyFromServer(summary);
}

function fromDetail(
  detail: ActivityDetail,
  names: ReadonlyMap<string, string>,
) {
  return nexusIntellectualPropertyFromServer(detail, detail, names);
}

const catalogError = "Kekayaan intelektual resmi belum dapat dimuat.";
const detailError = "Rincian kekayaan intelektual belum dapat dimuat.";

export function useNexusIntellectualPropertyCatalog() {
  return useNexusHouseCatalog(
    "intellectual-properties",
    fromSummary,
    catalogError,
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
