import type {
  MetadataCompletionFieldKey,
  MetadataCompletionResolutions,
} from "@/components/nexus-metadata-completion/nexus-metadata-completion-model";

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

type ProjectableOfficialRecord = {
  missingFields: MetadataCompletionFieldKey[];
  publicId: string;
  quality: "Lengkap" | "Perlu dilengkapi";
  resolvedMetadata?: MetadataCompletionResolutions;
  review: {
    candidateId: string;
    decision: "Dihubungkan ke rekam resmi" | "Disetujui sebagai data baru";
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
      decision: "Dihubungkan ke rekam resmi",
      note: projection.note,
      reviewedAt: projection.appliedAt,
      reviewer: projection.reviewer,
    },
    updatedAt: projection.appliedAt,
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
>(records: readonly T[], projections: OfficialMetadataProjectionMap): T[] {
  return records.map((record) =>
    projectOfficialMetadataRecord(record, projections[record.publicId]),
  );
}
