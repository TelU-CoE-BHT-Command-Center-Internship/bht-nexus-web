import type {
  AuditDecisionKind,
  AuditKpiResolution,
  AuditReviewRecord,
} from "@/components/nexus-audit-review/nexus-audit-review-content";
import type {
  MetadataCompletionFieldKey,
  MetadataCompletionResolutions,
} from "@/components/nexus-metadata-completion/nexus-metadata-completion-model";
import { formatAuditTimestamp } from "@/components/nexus-workspace-ui/nexus-workspace-format";

export type OfficialMetadataProjection = {
  appliedAt: string;
  note: string;
  resolutions: MetadataCompletionResolutions;
  reviewRecordId: string;
  reviewer: string;
};

export type OfficialMetadataProjectionMap = Record<
  string,
  OfficialMetadataProjection
>;

export type OfficialRecordDecisionProjection = {
  appliedAt: string;
  candidate: AuditReviewRecord;
  decisionKind: Extract<
    AuditDecisionKind,
    "approved_new" | "approved_update" | "merged"
  >;
  kpiResolution?: AuditKpiResolution;
  note: string;
  reviewer: string;
  targetRecordId?: string;
};

export type OfficialRecordDecisionProjectionMap = Record<
  string,
  OfficialRecordDecisionProjection
>;

type ProjectableOfficialRecord = {
  missingFields: MetadataCompletionFieldKey[];
  publicId: string;
  quality: "Lengkap" | "Perlu dilengkapi";
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
  updatedAt: string;
};

const propertyByField: Partial<Record<MetadataCompletionFieldKey, string>> = {
  protectionType: "protection",
};

/**
 * Proyeksi sesi membuat hasil persetujuan pelengkapan langsung terbaca pada
 * rumah data resminya. Server tetap menjadi sumber otoritatif setelah
 * integrasi; fungsi kecil ini hanya menggantikan sumber state, bukan bentuk UI.
 */
export function projectOfficialMetadataRecord<
  T extends ProjectableOfficialRecord,
>(record: T, projection?: OfficialMetadataProjection): T {
  if (!projection) return record;

  const resolvedKeys = new Set(
    Object.entries(projection.resolutions).flatMap(([key, resolution]) =>
      resolution ? [key] : [],
    ),
  );
  const missingFields = record.missingFields.filter(
    (key) => !resolvedKeys.has(key),
  );
  const next: T = {
    ...record,
    missingFields,
    quality: missingFields.length > 0 ? "Perlu dilengkapi" : "Lengkap",
    resolvedMetadata: {
      ...record.resolvedMetadata,
      ...projection.resolutions,
    },
    review: {
      candidateId: projection.reviewRecordId,
      decision: "Pelengkapan metadata disetujui",
      note: projection.note,
      reviewedAt: formatAuditTimestamp(projection.appliedAt),
      reviewer: projection.reviewer,
    },
    updatedAt: formatAuditTimestamp(projection.appliedAt),
  };
  const writable = next as unknown as Record<string, unknown>;

  for (const [key, resolution] of Object.entries(projection.resolutions)) {
    if (!resolution || resolution.status !== "provided") continue;
    const fieldKey = key as MetadataCompletionFieldKey;
    const property = propertyByField[fieldKey] ?? fieldKey;
    writable[property] =
      fieldKey === "year" ? Number(resolution.value) : resolution.value;

    if (fieldKey === "documentUrl" && "documentAccess" in writable) {
      writable.documentAccess = "public";
    }
    if (fieldKey === "evidenceUrl" && "evidenceStatus" in writable) {
      writable.evidenceStatus = "public";
    }
  }

  return next;
}

export function projectOfficialMetadataRecords<
  T extends ProjectableOfficialRecord,
>(
  records: readonly T[],
  projections: OfficialMetadataProjectionMap,
  normalize?: (record: T, projection?: OfficialMetadataProjection) => T,
): T[] {
  return records.map((record) => {
    const projection = projections[record.publicId];
    const projected = projectOfficialMetadataRecord(record, projection);
    return normalize ? normalize(projected, projection) : projected;
  });
}
