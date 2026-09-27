import type { OfficialAcademicRecord } from "@/components/nexus-academic/nexus-academic-content";
import type { OfficialActivityRecord } from "@/components/nexus-activities/nexus-activities-content";
import type { OfficialContractProposalRecord } from "@/components/nexus-contract-proposals/nexus-contract-proposals-content";
import type { OfficialIntellectualProperty } from "@/components/nexus-intellectual-property/nexus-intellectual-property-content";
import type { MetadataCompletionFieldKey } from "@/components/nexus-metadata-completion/nexus-metadata-completion-model";
import type { NexusMonitoringSourceFamily } from "@/components/nexus-monitoring/nexus-monitoring-evaluation";
import type { OfficialPublication } from "@/components/nexus-publications/nexus-publications-content";
import { formatAuditTimestamp } from "@/components/nexus-workspace-ui/nexus-workspace-format";
import {
  kmIndicator,
  type NexusKmIndicatorId,
} from "@/content/nexus-km-indicators";

export type OfficialRecordQuarter = 1 | 2 | 3 | 4;

/**
 * Bidang rekam resmi yang dapat dikoreksi langsung dari Monitoring KM. Hanya
 * bidang yang menentukan apakah dan kapan sebuah rekam dihitung yang tersedia;
 * metadata lain tetap disunting melalui rumah Data Resmi dan Tinjauan.
 *
 * Bidang yang tidak disertakan berarti tidak diubah. Nilai `null` atau string
 * kosong berarti bidangnya dikosongkan dengan sengaja.
 */
export type OfficialRecordCorrectionValues = {
  /** Tanggal bisnis `YYYY-MM-DD` pada bidang tanggal milik rumah datanya. */
  businessDate?: string;
  kmIds?: NexusKmIndicatorId[];
  protection?: OfficialIntellectualProperty["protection"];
  publicationType?: OfficialPublication["type"];
  quartile?: NonNullable<OfficialPublication["quartile"]> | null;
  registrationNumber?: string;
  reportedQuarter?: OfficialRecordQuarter | null;
  year?: number | null;
};

export type OfficialRecordCorrectionField =
  keyof OfficialRecordCorrectionValues;

export type OfficialRecordCorrectionChange = {
  after: string;
  before: string;
  field: OfficialRecordCorrectionField;
  label: string;
};

/** Satu koreksi yang diterapkan langsung pada rekam resmi dari Monitoring KM. */
export type OfficialRecordCorrection = {
  actorId: string;
  actorName: string;
  actorRoleLabel: string;
  /** Instant mesin; format WIB baru dibuat ketika ditampilkan. */
  appliedAt: string;
  changes: readonly OfficialRecordCorrectionChange[];
  family: NexusMonitoringSourceFamily;
  id: string;
  reason: string;
  recordPublicId: string;
  values: OfficialRecordCorrectionValues;
};

/** Koreksi per rekam resmi, berurutan dari yang pertama diterapkan. */
export type OfficialRecordCorrectionMap = Record<
  string,
  readonly OfficialRecordCorrection[]
>;

export const officialRecordCorrectionLabels: Record<
  OfficialRecordCorrectionField,
  string
> = {
  businessDate: "Tanggal bisnis",
  kmIds: "Kaitan indikator KM",
  protection: "Bentuk perlindungan",
  publicationType: "Bentuk karya",
  quartile: "Kuartil jurnal",
  registrationNumber: "Nomor pencatatan",
  reportedQuarter: "Triwulan dilaporkan",
  year: "Tahun",
};

type CorrectableRecord =
  | OfficialAcademicRecord
  | OfficialActivityRecord
  | OfficialContractProposalRecord
  | OfficialIntellectualProperty
  | OfficialPublication;

function kmLinksFrom<T extends CorrectableRecord>(
  record: T,
  kmIds: readonly NexusKmIndicatorId[],
  reason: string,
): T["kmLinks"] {
  return kmIds.map((id) => {
    const existing = record.kmLinks.find((link) => link.indicator.id === id);
    return (
      existing ?? {
        indicator: kmIndicator(id),
        note: `Kaitan ditetapkan melalui koreksi Monitoring KM: ${reason}`,
      }
    );
  }) as T["kmLinks"];
}

function withoutMissing(
  missingFields: readonly MetadataCompletionFieldKey[],
  resolved: readonly MetadataCompletionFieldKey[],
) {
  return missingFields.filter((field) => !resolved.includes(field));
}

/** Bidang umum yang berlaku sama pada kelima rumah data. */
function applyCommon<T extends CorrectableRecord>(
  record: T,
  correction: OfficialRecordCorrection,
): T {
  const { values } = correction;
  const next = { ...record } as T;

  if (values.reportedQuarter !== undefined) {
    next.reportedQuarter = values.reportedQuarter ?? undefined;
    next.reportedQuarterSource =
      values.reportedQuarter === null
        ? undefined
        : `Koreksi Monitoring KM · ${correction.actorName}`;
  }
  if (values.kmIds !== undefined) {
    next.kmLinks = kmLinksFrom(record, values.kmIds, correction.reason);
    next.kpiResolutionStatus =
      values.kmIds.length > 0 ? "resolved" : "not_applicable";
  }
  next.updatedAt = formatAuditTimestamp(correction.appliedAt);
  return next;
}

function correctPublication(
  record: OfficialPublication,
  correction: OfficialRecordCorrection,
): OfficialPublication {
  const { values } = correction;
  const next = applyCommon(record, correction);

  if (values.businessDate !== undefined) {
    next.publishedOn = values.businessDate || undefined;
  }
  if (values.year !== undefined) next.year = values.year ?? undefined;
  if (values.publicationType !== undefined) next.type = values.publicationType;
  if (values.quartile !== undefined) {
    next.quartile = values.quartile ?? undefined;
    next.quartileSource = values.quartile
      ? `Koreksi Monitoring KM · ${correction.actorName}`
      : undefined;
  }

  const quartileApplies = next.type === "Artikel Jurnal";
  const quartile = quartileApplies ? next.quartile : undefined;
  const recomputed: MetadataCompletionFieldKey[] = ["quartile", "type"];
  if (values.year !== undefined) recomputed.push("year");
  const missingFields = withoutMissing(next.missingFields, recomputed);
  if (next.type === "Belum diklasifikasikan") missingFields.push("type");
  if (quartileApplies && !quartile) missingFields.push("quartile");
  if (values.year !== undefined && !next.year) missingFields.push("year");

  return {
    ...next,
    missingFields,
    quality: missingFields.length > 0 ? "Perlu dilengkapi" : "Lengkap",
    quartile,
    quartileApplies,
  };
}

function correctIntellectualProperty(
  record: OfficialIntellectualProperty,
  correction: OfficialRecordCorrection,
): OfficialIntellectualProperty {
  const { values } = correction;
  const next = applyCommon(record, correction);

  if (values.businessDate !== undefined) {
    next.filedOn = values.businessDate || undefined;
  }
  if (values.year !== undefined) next.year = values.year ?? undefined;
  if (values.protection !== undefined) next.protection = values.protection;
  if (values.registrationNumber !== undefined) {
    next.registrationNumber = values.registrationNumber.trim() || undefined;
  }

  const missingFields = withoutMissing(next.missingFields, [
    "protectionType",
    "registrationNumber",
  ]);
  if (next.protection === "Belum diklasifikasikan") {
    missingFields.push("protectionType");
  }
  if (!next.registrationNumber) missingFields.push("registrationNumber");

  return {
    ...next,
    missingFields,
    quality: missingFields.length > 0 ? "Perlu dilengkapi" : "Lengkap",
  };
}

function correctContract(
  record: OfficialContractProposalRecord,
  correction: OfficialRecordCorrection,
): OfficialContractProposalRecord {
  const { values } = correction;
  const next = applyCommon(record, correction);
  if (values.businessDate === undefined) return next;

  if (next.group === "Proposal") {
    next.submittedOn = values.businessDate || undefined;
    return next;
  }

  next.contractStart = values.businessDate || undefined;
  if (next.contractStart) {
    next.missingFields = withoutMissing(next.missingFields, ["contractStart"]);
    next.quality =
      next.missingFields.length > 0 ? "Perlu dilengkapi" : "Lengkap";
  }
  return next;
}

/** Proposal abdimas mencatat tanggal pengajuan, kegiatan lain tanggal pelaksanaan. */
export function activityUsesSubmissionDate(activity: OfficialActivityRecord) {
  return activity.kind.startsWith("Proposal");
}

function correctActivity(
  record: OfficialActivityRecord,
  correction: OfficialRecordCorrection,
): OfficialActivityRecord {
  const { values } = correction;
  const next = applyCommon(record, correction);
  if (values.businessDate === undefined) return next;

  if (activityUsesSubmissionDate(next)) {
    next.submittedOn = values.businessDate || undefined;
    return next;
  }

  next.eventDate = values.businessDate || undefined;
  if (next.eventDate) {
    next.missingFields = withoutMissing(next.missingFields, ["eventDate"]);
    next.quality =
      next.missingFields.length > 0 ? "Perlu dilengkapi" : "Lengkap";
  }
  return next;
}

function correctAcademic(
  record: OfficialAcademicRecord,
  correction: OfficialRecordCorrection,
): OfficialAcademicRecord {
  const next = applyCommon(record, correction);
  if (correction.values.year !== undefined) {
    next.year = correction.values.year ?? undefined;
  }
  return next;
}

type CorrectionByFamily = {
  academic: OfficialAcademicRecord;
  activities: OfficialActivityRecord;
  contracts: OfficialContractProposalRecord;
  "intellectual-property": OfficialIntellectualProperty;
  publications: OfficialPublication;
};

const correctors: {
  [Family in NexusMonitoringSourceFamily]: (
    record: CorrectionByFamily[Family],
    correction: OfficialRecordCorrection,
  ) => CorrectionByFamily[Family];
} = {
  academic: correctAcademic,
  activities: correctActivity,
  contracts: correctContract,
  "intellectual-property": correctIntellectualProperty,
  publications: correctPublication,
};

/**
 * Menerapkan koreksi Monitoring pada rekam resmi satu rumah data. Koreksi
 * diterapkan berurutan dan setelah keputusan Tinjauan, sehingga nilai yang
 * dikoreksi auditor terlihat sama di Monitoring dan di rumah Data Resmi.
 */
export function projectOfficialRecordCorrections<
  Family extends NexusMonitoringSourceFamily,
>(
  family: Family,
  records: readonly CorrectionByFamily[Family][],
  corrections: OfficialRecordCorrectionMap,
): CorrectionByFamily[Family][] {
  const correct = correctors[family];
  return records.map((record) =>
    (corrections[record.publicId] ?? []).reduce(
      (current, correction) =>
        correction.family === family ? correct(current, correction) : current,
      record,
    ),
  );
}

/**
 * Baris rincian "Triwulan dilaporkan" untuk rumah Data Resmi. Muncul hanya
 * bila rekam memang membawa triwulan dilaporkan, beserta asal nilainya.
 */
export function officialReportedQuarterItems(record: {
  reportedQuarter?: OfficialRecordQuarter;
  reportedQuarterSource?: string;
}) {
  if (!record.reportedQuarter) return [];
  return [
    {
      key: "reportedQuarter",
      label: "Triwulan dilaporkan",
      value: `TW${record.reportedQuarter}${record.reportedQuarterSource ? ` · ${record.reportedQuarterSource}` : ""}`,
    },
  ];
}
