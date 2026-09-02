import {
  academicDisplayTitle,
  academicEvidenceLabel,
  getNexusAcademicContent,
  type OfficialAcademicRecord,
} from "@/components/nexus-academic/nexus-academic-content";
import {
  activityDisplayTitle,
  activityEvidenceLabel,
  getNexusActivitiesContent,
  type OfficialActivityRecord,
} from "@/components/nexus-activities/nexus-activities-content";
import {
  contractProposalDisplayTitle,
  contractProposalEvidenceLabel,
  contractProposalPrimaryParty,
  getNexusContractProposalContent,
  type OfficialContractProposalRecord,
} from "@/components/nexus-contract-proposals/nexus-contract-proposals-content";
import {
  getNexusIntellectualPropertyContent,
  type OfficialIntellectualProperty,
} from "@/components/nexus-intellectual-property/nexus-intellectual-property-content";
import { metadataCompletionAvailabilityLabel } from "@/components/nexus-metadata-completion/nexus-metadata-completion-model";
import {
  type NexusMonitoringSourceFamily,
  type NexusMonitoringSourceHouse,
  nexusMonitoringSourceHouses,
} from "@/components/nexus-monitoring/nexus-monitoring-evaluation";
import {
  type NexusEvaluationQuarter,
  parseBusinessDate,
} from "@/components/nexus-monitoring/nexus-monitoring-quarter";
import {
  getNexusPublicationsContent,
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
      quarter: NexusEvaluationQuarter;
    }
  | { available: false; field: string; reason: string };

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
    quarter: parsed.quarter,
  };
}

function publicationRecord(
  publication: OfficialPublication,
): NexusMonitoringRecord {
  return {
    businessDate: unavailableDate(
      "Tanggal terbit",
      publication.year
        ? "Sumber baru mencatat tahun terbit, belum tanggal terbitnya."
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
    businessDate: resolveBusinessDate(
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
    subtitle: record.protection,
    title: record.title,
    updatedAt: record.updatedAt,
  };
}

function contractRecord(
  contract: OfficialContractProposalRecord,
): NexusMonitoringRecord {
  const party = contractProposalPrimaryParty(contract);

  return {
    businessDate: resolveBusinessDate(
      "Tanggal mulai kontrak",
      contract.contractStart,
      "Sumber belum mencatat tanggal mulai kontraknya.",
    ),
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
    subtitle: academic.activity,
    title: academicDisplayTitle(academic),
    updatedAt: academic.updatedAt,
  };
}

/**
 * Satu pintu baca rekam resmi untuk Monitoring. Fungsi ini tidak menyimpan
 * salinan: setiap pemanggilan membaca ulang rumah data resmi yang sama dengan
 * halaman Data Resmi, sehingga tidak ada dua kebenaran untuk satu rekam.
 */
export function getNexusMonitoringRecords(): readonly NexusMonitoringRecord[] {
  return [
    ...getNexusPublicationsContent().records.map(publicationRecord),
    ...getNexusActivitiesContent().records.map(activityRecord),
    ...getNexusIntellectualPropertyContent().records.map(
      intellectualPropertyRecord,
    ),
    ...getNexusContractProposalContent().records.map(contractRecord),
    ...getNexusAcademicContent().records.map(academicRecord),
  ];
}

export function nexusMonitoringRecordsByFamily(
  family: NexusMonitoringSourceFamily,
  records: readonly NexusMonitoringRecord[] = getNexusMonitoringRecords(),
) {
  return records.filter((record) => record.family === family);
}
