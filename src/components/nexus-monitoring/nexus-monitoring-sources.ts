import {
  academicDisplayTitle,
  academicEvidenceLabel,
  type OfficialAcademicRecord,
} from "@/components/nexus-academic/nexus-academic-content";
import {
  activityDisplayTitle,
  activityEvidenceLabel,
  type OfficialActivityRecord,
} from "@/components/nexus-activities/nexus-activities-content";
import {
  contractProposalDisplayTitle,
  contractProposalEvidenceLabel,
  contractProposalPrimaryParty,
  type OfficialContractProposalRecord,
} from "@/components/nexus-contract-proposals/nexus-contract-proposals-content";
import type { OfficialIntellectualProperty } from "@/components/nexus-intellectual-property/nexus-intellectual-property-content";
import { metadataCompletionAvailabilityLabel } from "@/components/nexus-metadata-completion/nexus-metadata-completion-model";
import {
  type NexusMonitoringSourceFamily,
  type NexusMonitoringSourceHouse,
  nexusMonitoringSourceHouses,
} from "@/components/nexus-monitoring/nexus-monitoring-evaluation";
import {
  type NexusBusinessDatePrecision,
  type NexusEvaluationQuarter,
  parseBusinessDate,
} from "@/components/nexus-monitoring/nexus-monitoring-quarter";
import { activityUsesSubmissionDate } from "@/components/nexus-official-records/nexus-official-record-corrections";
import type { NexusOfficialRecordSet } from "@/components/nexus-official-records/nexus-official-records";
import {
  type OfficialPublication,
  publicationDisplayTitle,
} from "@/components/nexus-publications/nexus-publications-content";
import type { NexusKmIndicatorId } from "@/content/nexus-km-indicators";

export type NexusMonitoringEvidenceState = "internal" | "public" | "unrecorded";

export type NexusMonitoringContributor = {
  id: string;
  /** Terisi hanya ketika sumber memang menunjuk anggota kanonis. */
  memberId?: string;
  name: string;
};

/**
 * Tanggal bisnis yang menentukan triwulan sebuah rekam. Waktu pembaruan,
 * waktu tinjauan, dan waktu pengambilan sumber tidak pernah dipakai untuk ini
 * karena ketiganya menerangkan pencatatan, bukan peristiwanya.
 */
export type NexusMonitoringBusinessDate =
  | {
      available: true;
      field: string;
      iso: string;
      label: string;
      /** Sebagian sumber hanya mencatat bulannya; harinya tidak pernah dikarang. */
      precision: NexusBusinessDatePrecision;
      quarter: NexusEvaluationQuarter;
      year: number;
    }
  | { available: false; field: string; reason: string };

/**
 * Apakah sebuah rekam resmi termasuk periode evaluasi yang sedang diukur.
 *
 * Urutan pertimbangannya mengikuti ketelitian sumbernya: tanggal peristiwa
 * lebih menentukan daripada tahun rekam, dan tahun rekam lebih menentukan
 * daripada periode evaluasi tempat rekam itu dicatat. Rekam yang tahunnya
 * diketahui berbeda dari periode tidak pernah ikut terhitung walaupun kolom
 * periode evaluasinya menyebut periode berjalan.
 */
export type NexusMonitoringPeriodMembership =
  | {
      basis: "periode evaluasi" | "tahun rekam" | "tanggal peristiwa";
      state: "in-period";
    }
  | { reason: string; state: "out-of-period" };

export function resolveRecordPeriod(
  record: NexusMonitoringRecord,
  period: string,
): NexusMonitoringPeriodMembership {
  const date = record.businessDate;

  if (date.available) {
    return date.year === Number(period)
      ? { basis: "tanggal peristiwa", state: "in-period" }
      : {
          reason: `${date.field} rekam ini jatuh pada ${date.year}, di luar periode evaluasi ${period}.`,
          state: "out-of-period",
        };
  }

  if (record.sourceYear !== undefined) {
    return record.sourceYear === Number(period)
      ? { basis: "tahun rekam", state: "in-period" }
      : {
          reason: `Sumber mencatat rekam ini pada tahun ${record.sourceYear}, di luar periode evaluasi ${period}.`,
          state: "out-of-period",
        };
  }

  return record.evaluationPeriod === period
    ? { basis: "periode evaluasi", state: "in-period" }
    : {
        reason: `Rekam ini tercatat pada periode evaluasi ${record.evaluationPeriod}.`,
        state: "out-of-period",
      };
}

/**
 * Dasar triwulan sebuah rekam: tanggal bisnisnya, atau triwulan yang
 * dilaporkan ketika tanggalnya belum tercatat. Tanggal selalu lebih
 * menentukan; triwulan dilaporkan tidak pernah menimpa tanggal yang ada.
 */
export type NexusMonitoringQuarterBasis = "dilaporkan" | "tanggal";

/**
 * Triwulan sebuah rekam pada periode yang sedang diukur. Rekam di luar periode
 * dan rekam yang tanggal maupun triwulan dilaporkannya belum tercatat tidak
 * pernah dialokasikan ke TW mana pun; keduanya tetap terbaca sebagai keadaan
 * yang berbeda pada tampilan.
 */
export function monitoringRecordQuarterBasis(
  record: NexusMonitoringRecord,
  period: string,
): {
  basis: NexusMonitoringQuarterBasis;
  quarter: NexusEvaluationQuarter;
} | null {
  if (resolveRecordPeriod(record, period).state !== "in-period") return null;
  if (record.businessDate.available) {
    return { basis: "tanggal", quarter: record.businessDate.quarter };
  }
  if (record.reportedQuarter !== undefined) {
    return { basis: "dilaporkan", quarter: record.reportedQuarter };
  }
  return null;
}

export function monitoringRecordQuarter(
  record: NexusMonitoringRecord,
  period: string,
) {
  return monitoringRecordQuarterBasis(record, period)?.quarter ?? null;
}

type NexusMonitoringRecordCore = {
  businessDate: NexusMonitoringBusinessDate;
  contributors: readonly NexusMonitoringContributor[];
  evaluationPeriod: string;
  evidenceLabel: string;
  evidenceState: NexusMonitoringEvidenceState;
  house: NexusMonitoringSourceHouse;
  id: string;
  kmIds: readonly NexusKmIndicatorId[];
  /** Catatan sumber yang menerangkan keterbatasan atau perbedaan antar-sumber. */
  notes: readonly string[];
  publicId: string;
  quality: "Lengkap" | "Perlu dilengkapi";
  /** Triwulan menurut pelapor; dipakai hanya bila tanggal bisnis belum tercatat. */
  reportedQuarter?: NexusEvaluationQuarter;
  /** Asal nilai triwulan dilaporkan. */
  reportedQuarterSource?: string;
  /**
   * Tahun rekam menurut sumbernya, terpisah dari periode evaluasi tempat rekam
   * dicatat. Terisi hanya pada rumpun yang memang mencatatnya; ketiadaannya
   * berarti sumber tidak mencatat tahun, bukan tahun nol.
   */
  sourceYear?: number;
  /** Ringkas satu baris untuk konteks domain pada daftar data pembentuk. */
  subtitle: string;
  title: string;
  updatedAt: string;
};

/**
 * Rekam resmi yang dibaca Monitoring. Rekam aslinya ikut dibawa supaya modul
 * per rumpun dapat memakai bidang domainnya sendiri tanpa Monitoring menyalin
 * data resmi menjadi koleksi kedua.
 */
export type NexusMonitoringRecord =
  | (NexusMonitoringRecordCore & {
      academic: OfficialAcademicRecord;
      family: "academic";
    })
  | (NexusMonitoringRecordCore & {
      activity: OfficialActivityRecord;
      family: "activities";
    })
  | (NexusMonitoringRecordCore & {
      contract: OfficialContractProposalRecord;
      family: "contracts";
    })
  | (NexusMonitoringRecordCore & {
      family: "intellectual-property";
      intellectualProperty: OfficialIntellectualProperty;
    })
  | (NexusMonitoringRecordCore & {
      family: "publications";
      publication: OfficialPublication;
    });

const evidenceStateLabels: Record<NexusMonitoringEvidenceState, string> = {
  internal: "Tersimpan internal",
  public: "Tautan tersedia",
  unrecorded: "Belum tercatat",
};

function unavailableDate(
  field: string,
  reason: string,
): NexusMonitoringBusinessDate {
  return { available: false, field, reason };
}

function provenanceNotes(
  provenance: readonly { note?: string }[],
): readonly string[] {
  return [
    ...new Set(
      provenance
        .map((entry) => entry.note?.trim())
        .filter((note): note is string => Boolean(note)),
    ),
  ];
}

function resolveBusinessDate(
  field: string,
  value: string | undefined,
  missingReason: string,
): NexusMonitoringBusinessDate {
  const parsed = parseBusinessDate(value);
  if (!parsed) return unavailableDate(field, missingReason);

  return {
    available: true,
    field,
    iso: parsed.iso,
    label: parsed.label,
    precision: parsed.precision,
    quarter: parsed.quarter,
    year: parsed.year,
  };
}

function publicationRecord(
  publication: OfficialPublication,
): NexusMonitoringRecord {
  return {
    businessDate: resolveBusinessDate(
      "Tanggal terbit",
      publication.publishedOn,
      publication.year
        ? "Worksheet asal rekam ini tidak memuat kolom tanggal terbit, baru tahun terbitnya."
        : "Sumber belum mencatat tahun maupun tanggal terbit.",
    ),
    contributors: publication.authors.map((author) => ({
      id: author.id,
      memberId: author.memberId,
      name: author.name,
    })),
    evaluationPeriod: publication.evaluationPeriod,
    evidenceLabel: publication.publisherUrl
      ? "Tautan penerbit tersedia"
      : evidenceStateLabels.unrecorded,
    evidenceState: publication.publisherUrl ? "public" : "unrecorded",
    family: "publications",
    house: nexusMonitoringSourceHouses.publications,
    id: publication.id,
    kmIds: publication.kmLinks.map((link) => link.indicator.id),
    notes: provenanceNotes(publication.provenance),
    publicId: publication.publicId,
    publication,
    quality: publication.quality,
    reportedQuarter: publication.reportedQuarter,
    reportedQuarterSource: publication.reportedQuarterSource,
    sourceYear: publication.year,
    subtitle: publication.venue,
    title: publicationDisplayTitle(publication),
    updatedAt: publication.updatedAt,
  };
}

function activityRecord(
  activity: OfficialActivityRecord,
): NexusMonitoringRecord {
  return {
    activity,
    businessDate: activityUsesSubmissionDate(activity)
      ? resolveBusinessDate(
          "Tanggal pengajuan",
          activity.submittedOn,
          "Sumber belum mencatat tanggal pengajuan proposalnya.",
        )
      : resolveBusinessDate(
          "Tanggal kegiatan",
          activity.eventDate,
          "Sumber belum mencatat tanggal pelaksanaannya.",
        ),
    contributors: activity.primaryParty
      ? [{ id: `${activity.id}-pihak`, name: activity.primaryParty }]
      : [],
    evaluationPeriod: activity.evaluationPeriod,
    evidenceLabel: activityEvidenceLabel(activity),
    evidenceState: activity.evidenceStatus,
    family: "activities",
    house: nexusMonitoringSourceHouses.activities,
    id: activity.id,
    kmIds: activity.kmLinks.map((link) => link.indicator.id),
    notes: provenanceNotes(activity.provenance),
    publicId: activity.publicId,
    quality: activity.quality,
    reportedQuarter: activity.reportedQuarter,
    reportedQuarterSource: activity.reportedQuarterSource,
    subtitle: activity.kind,
    title: activityDisplayTitle(activity),
    updatedAt: activity.updatedAt,
  };
}

function intellectualPropertyRecord(
  record: OfficialIntellectualProperty,
): NexusMonitoringRecord {
  return {
    businessDate: resolveBusinessDate(
      "Tanggal pengajuan",
      record.filedOn,
      "Sumber belum mencatat tanggal pengajuannya.",
    ),
    contributors: record.creators.map((creator) => ({
      id: creator.id,
      memberId: creator.memberId,
      name: creator.name,
    })),
    evaluationPeriod: record.evaluationPeriod,
    evidenceLabel: metadataCompletionAvailabilityLabel(
      record.resolvedMetadata,
      "documentUrl",
      record.missingFields.includes("documentUrl"),
      record.documentAccess === "internal"
        ? evidenceStateLabels.internal
        : evidenceStateLabels.public,
    ),
    evidenceState: record.documentAccess,
    family: "intellectual-property",
    house: nexusMonitoringSourceHouses["intellectual-property"],
    id: record.id,
    intellectualProperty: record,
    kmIds: record.kmLinks.map((link) => link.indicator.id),
    notes: provenanceNotes(record.provenance),
    publicId: record.publicId,
    quality: record.quality,
    reportedQuarter: record.reportedQuarter,
    reportedQuarterSource: record.reportedQuarterSource,
    sourceYear: record.year,
    subtitle: record.protection,
    title: record.title,
    updatedAt: record.updatedAt,
  };
}

/**
 * Tanggal bisnis sebuah rekam Kontrak & Proposal bergantung pada bentuknya.
 * Proposal diukur dari tanggal pengajuannya—sebuah proposal belum mempunyai
 * kontrak yang dimulai—sedangkan kontrak diukur dari tanggal mulainya.
 */
function contractBusinessDate(contract: OfficialContractProposalRecord) {
  if (contract.group === "Proposal") {
    return resolveBusinessDate(
      "Tanggal pengajuan",
      contract.submittedOn,
      "Sumber belum mencatat tanggal pengajuan proposalnya.",
    );
  }

  return resolveBusinessDate(
    "Tanggal mulai kontrak",
    contract.contractStart,
    "Sumber belum mencatat tanggal mulai kontraknya.",
  );
}

function contractRecord(
  contract: OfficialContractProposalRecord,
): NexusMonitoringRecord {
  const party = contractProposalPrimaryParty(contract);

  return {
    businessDate: contractBusinessDate(contract),
    contract,
    contributors: party ? [{ id: `${contract.id}-pihak`, name: party }] : [],
    evaluationPeriod: contract.evaluationPeriod,
    evidenceLabel: contractProposalEvidenceLabel(contract),
    evidenceState: contract.evidenceStatus,
    family: "contracts",
    house: nexusMonitoringSourceHouses.contracts,
    id: contract.id,
    kmIds: contract.kmLinks.map((link) => link.indicator.id),
    notes: provenanceNotes(contract.provenance),
    publicId: contract.publicId,
    quality: contract.quality,
    reportedQuarter: contract.reportedQuarter,
    reportedQuarterSource: contract.reportedQuarterSource,
    subtitle: contract.kind,
    title: contractProposalDisplayTitle(contract),
    updatedAt: contract.updatedAt,
  };
}

function academicRecord(
  academic: OfficialAcademicRecord,
): NexusMonitoringRecord {
  return {
    academic,
    businessDate: unavailableDate(
      "Tanggal kegiatan",
      academic.year
        ? "Sumber baru mencatat tahun kegiatan, belum tanggalnya."
        : "Sumber belum mencatat tahun maupun tanggal kegiatan.",
    ),
    contributors: academic.mentors.map((mentor) => ({
      id: mentor.id,
      memberId: mentor.memberId,
      name: mentor.name,
    })),
    evaluationPeriod: academic.evaluationPeriod,
    evidenceLabel: academicEvidenceLabel(academic),
    evidenceState: academic.evidenceStatus,
    family: "academic",
    house: nexusMonitoringSourceHouses.academic,
    id: academic.id,
    kmIds: academic.kmLinks.map((link) => link.indicator.id),
    notes: provenanceNotes(academic.provenance),
    publicId: academic.publicId,
    quality: academic.quality,
    reportedQuarter: academic.reportedQuarter,
    reportedQuarterSource: academic.reportedQuarterSource,
    sourceYear: academic.year,
    subtitle: academic.activity,
    title: academicDisplayTitle(academic),
    updatedAt: academic.updatedAt,
  };
}

/**
 * Satu pintu baca rekam resmi untuk Monitoring. Fungsi ini tidak menyimpan
 * salinan: rekamnya adalah set yang sama dengan yang ditampilkan halaman Data
 * Resmi pada sesi berjalan, sehingga tidak ada dua kebenaran untuk satu rekam.
 */
export function nexusMonitoringRecordsFrom(
  set: NexusOfficialRecordSet,
): readonly NexusMonitoringRecord[] {
  return [
    ...set.publications.map(publicationRecord),
    ...set.activities.map(activityRecord),
    ...set.intellectualProperty.map(intellectualPropertyRecord),
    ...set.contracts.map(contractRecord),
    ...set.academic.map(academicRecord),
  ];
}

export function nexusMonitoringRecordsByFamily(
  family: NexusMonitoringSourceFamily,
  records: readonly NexusMonitoringRecord[],
) {
  return records.filter((record) => record.family === family);
}
