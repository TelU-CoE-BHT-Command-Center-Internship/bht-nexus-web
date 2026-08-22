import type { OfficialAcademicRecord } from "@/components/nexus-academic/nexus-academic-content";
import type { OfficialActivityRecord } from "@/components/nexus-activities/nexus-activities-content";
import type { OfficialContractProposalRecord } from "@/components/nexus-contract-proposals/nexus-contract-proposals-content";
import type { OfficialIntellectualProperty } from "@/components/nexus-intellectual-property/nexus-intellectual-property-content";
import { manualSubtype } from "@/components/nexus-manual-submission/nexus-manual-submission-model";
import type { OfficialPublication } from "@/components/nexus-publications/nexus-publications-content";
import type {
  OfficialRecordDecisionProjection,
  OfficialRecordDecisionProjectionMap,
} from "@/components/nexus-review-session/nexus-official-record-projection";
import type { NexusOfficialSourceMetadataItem } from "@/components/nexus-workspace-ui/nexus-official-source-metadata";
import {
  formatAuditTimestamp,
  personInitials,
} from "@/components/nexus-workspace-ui/nexus-workspace-format";
import { kmIndicator } from "@/content/nexus-km-indicators";

type ProjectableOfficialRecord = {
  id: string;
  kmLinks: Array<{
    indicator: { id: string };
    note: string;
  }>;
  provenance: Array<{
    capturedAt: string;
    identifier: string;
    note?: string;
    source: string;
    sourceUrl?: string;
  }>;
  publicId: string;
  review: {
    candidateId: string;
    decision:
      | "Dihubungkan ke rekam resmi"
      | "Disetujui sebagai data baru"
      | "Pelengkapan metadata disetujui";
    note: string;
    reviewedAt: string;
    reviewer: string;
  };
  updatedAt: string;
};

function mergeProjectedRecord<T extends ProjectableOfficialRecord>(
  target: T,
  projected: T,
): T {
  const merged: Record<string, unknown> = { ...target };
  const protectedKeys = new Set([
    "id",
    "kmLinks",
    "provenance",
    "publicId",
    "review",
    "updatedAt",
  ]);

  for (const [key, value] of Object.entries(projected)) {
    if (protectedKeys.has(key) || value === undefined || value === null) {
      continue;
    }
    const current = merged[key];
    const currentIsEmpty =
      current === undefined ||
      current === null ||
      current === "" ||
      (Array.isArray(current) && current.length === 0);
    if (currentIsEmpty) merged[key] = value;
  }

  const linksByIndicator = new Map(
    [...target.kmLinks, ...projected.kmLinks].map((link) => [
      link.indicator.id,
      link,
    ]),
  );

  return {
    ...merged,
    kmLinks: [...linksByIndicator.values()],
    provenance: [...target.provenance, ...projected.provenance],
    review: projected.review,
    updatedAt: projected.updatedAt,
  } as T;
}

function splitPeople(value?: string) {
  return (value ?? "")
    .split(/[;/]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLocaleLowerCase("id-ID")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function manualOfficialPublicId(
  projection: OfficialRecordDecisionProjection,
) {
  const values = projection.candidate.manualSubmission?.values;
  const year = values?.year || "0000";
  const suffix = projection.candidate.id.split("-").at(-1) ?? "00000";
  const prefix =
    projection.candidate.manualSubmission?.domain === "publication"
      ? "PUB"
      : projection.candidate.manualSubmission?.domain ===
          "intellectual-property"
        ? "KI"
        : projection.candidate.manualSubmission?.domain === "contract"
          ? "KPR"
          : projection.candidate.manualSubmission?.domain === "academic"
            ? "AKD"
            : "KGT";
  return `${prefix}-${year}-M${suffix.slice(-4)}`;
}

function manualSourceMetadata(
  projection: OfficialRecordDecisionProjection,
  representedKeys: ReadonlySet<string>,
): NexusOfficialSourceMetadataItem[] {
  const submission = projection.candidate.manualSubmission;
  if (!submission) return [];
  const subtype = manualSubtype(submission.domain, submission.recordType);
  if (!subtype) return [];

  return subtype.fields.flatMap((field) => {
    const rawValue = submission.values[field.key]?.trim();
    if (!rawValue || representedKeys.has(field.key)) return [];
    const choiceLabel = field.choices?.find(
      (choice) => choice.value === rawValue,
    )?.label;
    const value =
      choiceLabel ??
      (field.type === "date"
        ? new Intl.DateTimeFormat("id-ID", {
            day: "numeric",
            month: "short",
            timeZone: "UTC",
            year: "numeric",
          }).format(new Date(`${rawValue}T00:00:00Z`))
        : field.type === "number" && Number.isFinite(Number(rawValue))
          ? Number(rawValue).toLocaleString("id-ID")
          : rawValue);

    return [
      {
        key: field.key,
        label: field.label.replace(/\s+\(opsional\)$/i, ""),
        value,
        wide: field.wide,
      },
    ];
  });
}

function projectionLinks(projection: OfficialRecordDecisionProjection) {
  const resolution = projection.kpiResolution;
  if (!resolution || !["changed", "confirmed"].includes(resolution.status)) {
    return [];
  }
  return resolution.indicatorIds.map((indicatorId) => ({
    indicator: kmIndicator(indicatorId),
    note:
      resolution.status === "confirmed"
        ? "Keterkaitan indikator dikonfirmasi reviewer dari saran sistem dan bukti kandidat."
        : "Keterkaitan indikator ditetapkan reviewer setelah memeriksa metadata dan bukti kandidat.",
  }));
}

function commonProjection(projection: OfficialRecordDecisionProjection) {
  const evidenceUrl =
    projection.candidate.manualSubmission?.values.evidenceUrl ?? "";
  const reviewedAt = formatAuditTimestamp(projection.appliedAt);
  const publicId = manualOfficialPublicId(projection);
  return {
    id: publicId.toLocaleLowerCase("id-ID"),
    provenance: [
      {
        capturedAt: reviewedAt,
        identifier: projection.candidate.id,
        note: "Diajukan melalui formulir Data Resmi dan disetujui pada Tinjauan.",
        source: "Manual" as const,
        sourceUrl: evidenceUrl || undefined,
      },
    ],
    publicId,
    review: {
      candidateId: projection.candidate.id,
      decision:
        projection.decisionKind === "merged"
          ? ("Dihubungkan ke rekam resmi" as const)
          : ("Disetujui sebagai data baru" as const),
      note: projection.note,
      reviewedAt,
      reviewer: projection.reviewer,
    },
    updatedAt: reviewedAt,
  };
}

function applyProjections<T extends ProjectableOfficialRecord>(
  records: readonly T[],
  projections: OfficialRecordDecisionProjectionMap,
  domain: NonNullable<
    OfficialRecordDecisionProjection["candidate"]["manualSubmission"]
  >["domain"],
  createRecord: (projection: OfficialRecordDecisionProjection) => T | null,
) {
  const next = [...records];
  const relevant = Object.values(projections).filter(
    (projection) => projection.candidate.manualSubmission?.domain === domain,
  );

  for (const projection of relevant) {
    const projected = createRecord(projection);
    if (!projected) continue;

    if (projection.decisionKind === "approved_new") {
      if (
        !next.some(
          (record) => record.review.candidateId === projection.candidate.id,
        )
      ) {
        next.unshift(projected);
      }
      continue;
    }

    const targetIndex = next.findIndex(
      (record) =>
        record.id === projection.targetRecordId ||
        record.publicId === projection.targetRecordId,
    );
    if (targetIndex < 0) continue;
    const target = next[targetIndex];
    next[targetIndex] =
      projection.decisionKind === "approved_update"
        ? {
            ...projected,
            id: target.id,
            provenance: [...target.provenance, ...projected.provenance],
            publicId: target.publicId,
          }
        : {
            ...mergeProjectedRecord(target, projected),
          };
  }

  return next;
}

function createPublication(
  projection: OfficialRecordDecisionProjection,
): OfficialPublication | null {
  const submission = projection.candidate.manualSubmission;
  if (!submission) return null;
  const { recordType, values } = submission;
  const type =
    recordType === "book"
      ? ("Buku / Book Chapter" as const)
      : recordType === "international-conference"
        ? ("Makalah Konferensi" as const)
        : recordType === "national-journal" ||
            recordType === "international-journal"
          ? ("Artikel Jurnal" as const)
          : ("Belum diklasifikasikan" as const);
  const quartile = ["Q1", "Q2", "Q3", "Q4"].includes(values.quartile)
    ? (values.quartile as "Q1" | "Q2" | "Q3" | "Q4")
    : undefined;
  const quartileApplies = type === "Artikel Jurnal";
  const missingFields = [
    ...(type === "Belum diklasifikasikan" ? (["type"] as const) : []),
    ...(quartileApplies && !quartile && recordType === "international-journal"
      ? (["quartile"] as const)
      : []),
  ];
  const identifier = (values.identifier ?? "").trim();
  const doi = /^(?:https?:\/\/(?:dx\.)?doi\.org\/|doi:\s*)?10\./i.test(
    identifier,
  )
    ? identifier
        .replace(/^https?:\/\/(?:dx\.)?doi\.org\//i, "")
        .replace(/^doi:\s*/i, "")
    : undefined;

  return {
    ...commonProjection(projection),
    authors: splitPeople(values.authors).map((name) => ({
      id: slugify(name),
      initials: personInitials(name),
      name,
    })),
    citations: null,
    doi,
    evaluationPeriod: values.year,
    identifier: identifier || undefined,
    kmLinks: projectionLinks(projection),
    missingFields: [...missingFields],
    publisherUrl: values.evidenceUrl,
    quality: missingFields.length > 0 ? "Perlu dilengkapi" : "Lengkap",
    quartile,
    quartileApplies,
    quartileSource: quartile ? "Diverifikasi pada Tinjauan" : undefined,
    sourceReportedQuartile: quartile,
    sourceMetadata: manualSourceMetadata(
      projection,
      new Set(["authors", "identifier", "publisher", "quartile", "venue"]),
    ),
    title: projection.candidate.title,
    type,
    venue: values.venue || values.publisher || "Belum tercatat",
    year: Number(values.year),
  };
}

function createIntellectualProperty(
  projection: OfficialRecordDecisionProjection,
): OfficialIntellectualProperty | null {
  const submission = projection.candidate.manualSubmission;
  if (!submission) return null;
  const { recordType, values } = submission;
  const protection =
    recordType === "patent"
      ? ("Paten" as const)
      : recordType === "copyright"
        ? ("Hak Cipta" as const)
        : recordType === "industrial-design"
          ? ("Desain Industri" as const)
          : recordType === "trademark"
            ? ("Merek" as const)
            : ("Belum diklasifikasikan" as const);
  const registrationNumber = values.applicationNumber || undefined;
  const missingFields = [
    ...(protection === "Belum diklasifikasikan"
      ? (["protectionType"] as const)
      : []),
    ...(registrationNumber ? [] : (["registrationNumber"] as const)),
  ];

  return {
    ...commonProjection(projection),
    creators: splitPeople(values.creators).map((name) => ({
      id: slugify(name),
      initials: personInitials(name),
      name,
    })),
    documentAccess: "public",
    documentNote: "Bukti utama dapat dibuka melalui tautan yang tercatat.",
    documentUrl: values.evidenceUrl,
    evaluationPeriod: values.year,
    filedOn: values.submissionDate || undefined,
    kmLinks: projectionLinks(projection),
    missingFields: [...missingFields],
    protection,
    quality: missingFields.length > 0 ? "Perlu dilengkapi" : "Lengkap",
    registrationNumber,
    registry: "Kemenkumham melalui klinik HKI Telkom University",
    title: projection.candidate.title,
    year: Number(values.year),
  };
}

function createContractProposal(
  projection: OfficialRecordDecisionProjection,
): OfficialContractProposalRecord | null {
  const submission = projection.candidate.manualSubmission;
  if (!submission) return null;
  const { recordType, values } = submission;
  const config = {
    "commercial-contract": {
      group: "Kontrak" as const,
      kind: "Kontrak Bisnis Komersialisasi" as const,
      status: "Aktif" as const,
    },
    "international-research-contract": {
      group: "Kontrak" as const,
      kind: "Kontrak Riset Internasional" as const,
      status: "Tercatat" as const,
    },
    "international-research-proposal": {
      group: "Proposal" as const,
      kind: "Proposal Riset Internasional" as const,
      status: "Diajukan" as const,
    },
    "national-research-contract": {
      group: "Kontrak" as const,
      kind: "Kontrak Riset Nasional" as const,
      status: "Tercatat" as const,
    },
    "national-research-proposal": {
      group: "Proposal" as const,
      kind: "Proposal Riset Nasional" as const,
      status: "Diajukan" as const,
    },
    "non-research-proposal": {
      group: "Proposal" as const,
      kind: "Proposal Non-Riset" as const,
      status: "Diajukan" as const,
    },
  }[recordType];
  if (!config) return null;

  return {
    ...commonProjection(projection),
    applicant: values.applicants || undefined,
    contractEnd: values.endDate || undefined,
    contractStart: values.startDate || undefined,
    evaluationPeriod: values.year,
    evidenceNote: "Bukti utama dapat dibuka melalui tautan yang tercatat.",
    evidenceStatus: "public",
    evidenceUrl: values.evidenceUrl,
    funder: values.funder || undefined,
    group: config.group,
    kind: config.kind,
    kmLinks: projectionLinks(projection),
    missingFields: [],
    ownerUnit: "CoE BHT",
    partner: values.partner || undefined,
    quality: "Lengkap",
    referenceNumber: values.referenceNumber || undefined,
    recordStatus: config.status,
    scheme: values.scheme || undefined,
    sourceMetadata: manualSourceMetadata(
      projection,
      new Set([
        "applicants",
        "endDate",
        "funder",
        "partner",
        "referenceNumber",
        "scheme",
        "startDate",
        "submissionDate",
      ]),
    ),
    submittedOn: values.submissionDate || undefined,
    title: projection.candidate.title,
  };
}

function createAcademic(
  projection: OfficialRecordDecisionProjection,
): OfficialAcademicRecord | null {
  const submission = projection.candidate.manualSubmission;
  if (!submission) return null;
  const { recordType, values } = submission;
  const activity = {
    "doctoral-mentoring": "Bimbingan Doktor" as const,
    "final-project": "Riset Tugas Akhir" as const,
    "master-mentoring": "Bimbingan Magister" as const,
    "student-competition": "Kompetisi Mahasiswa" as const,
    "student-internship": "Magang Mahasiswa" as const,
  }[recordType];
  if (!activity) return null;
  const mentorNames = splitPeople(values.mentors || values.lecturer);
  const participantCode =
    [values.studentNumber, values.participantRef].filter(Boolean).join(" · ") ||
    values.studentTeam ||
    "Tidak dicantumkan pada sumber";

  return {
    ...commonProjection(projection),
    activity,
    duration: values.duration || undefined,
    evaluationPeriod: values.year,
    evidenceNote: "Bukti utama dapat dibuka melalui tautan yang tercatat.",
    evidenceStatus: "public",
    evidenceUrl: values.evidenceUrl,
    kmLinks: projectionLinks(projection),
    mentors: mentorNames.map((name) => ({
      id: slugify(name),
      initials: personInitials(name),
      name,
    })),
    missingFields: [],
    participantCode,
    programStudy: values.programStudy || undefined,
    quality: "Lengkap",
    sourceMetadata: manualSourceMetadata(
      projection,
      new Set([
        "duration",
        "lecturer",
        "mentors",
        "participantRef",
        "programStudy",
        "studentNumber",
        "studentTeam",
      ]),
    ),
    title: projection.candidate.title,
    year: recordType === "student-internship" ? Number(values.year) : undefined,
  };
}

function createActivity(
  projection: OfficialRecordDecisionProjection,
): OfficialActivityRecord | null {
  const submission = projection.candidate.manualSubmission;
  if (!submission) return null;
  const { recordType, values } = submission;
  const config = {
    "business-unit": {
      group: "Bisnis" as const,
      kind: "Keterlibatan Unit Bisnis" as const,
      status: "Aktif" as const,
    },
    "community-coaching": {
      group: "Bisnis" as const,
      kind: "Pembinaan UMKM / Komunitas" as const,
      status: "Tercatat" as const,
    },
    "community-service": {
      group: "Pengabdian masyarakat" as const,
      kind: "Community Services" as const,
      status: "Tercatat" as const,
    },
    "drtpm-proposal": {
      group: "Pengabdian masyarakat" as const,
      kind: "Proposal Abdimas DRTPM" as const,
      status: "Diajukan" as const,
    },
    "international-conference-management": {
      group: "Pengabdian masyarakat" as const,
      kind: "Pengelolaan Konferensi Internasional" as const,
      status: "Dikelola" as const,
    },
    "international-institution-visit": {
      group: "Riset & jejaring" as const,
      kind: "Kunjungan Lembaga Internasional" as const,
      status: "Tercatat" as const,
    },
    "invited-speaker": {
      group: "Riset & jejaring" as const,
      kind: "Pembicara Undangan Internasional" as const,
      status: "Tercatat" as const,
    },
    "journal-accreditation": {
      group: "Pengabdian masyarakat" as const,
      kind: "Pengelolaan Jurnal Ilmiah" as const,
      status: "Dikelola" as const,
    },
    "non-research-service": {
      group: "Pengabdian masyarakat" as const,
      kind: "Kontrak Non-Riset" as const,
      status: "Aktif" as const,
    },
    "sdg-proposal": {
      group: "Pengabdian masyarakat" as const,
      kind: "Proposal Abdimas SDGs" as const,
      status: "Diajukan" as const,
    },
  }[recordType];
  if (!config) return null;
  const primaryParty =
    values.primaryParty ||
    values.team ||
    values.speakerName ||
    values.delegationLead ||
    values.institution;
  const title =
    values.title || values.eventName || values.institution || undefined;

  return {
    ...commonProjection(projection),
    evaluationPeriod: values.year,
    eventDate: values.eventDate || undefined,
    evidenceNote: "Bukti utama dapat dibuka melalui tautan yang tercatat.",
    evidenceStatus: "public",
    evidenceUrl: values.evidenceUrl,
    funding: values.funding
      ? `Rp${Number(values.funding).toLocaleString("id-ID")}`
      : undefined,
    group: config.group,
    issn: values.issn || undefined,
    journalVolume: values.journalVolume || undefined,
    kind: config.kind,
    kmLinks: projectionLinks(projection),
    location: values.location || undefined,
    missingFields: [],
    organization: values.organization || values.institution || undefined,
    ownerUnit: "CoE BHT",
    primaryParty,
    publicationFrequency: values.publicationFrequency || undefined,
    quality: "Lengkap",
    referenceNumber: values.referenceNumber || undefined,
    recordStatus: config.status,
    role: values.role || undefined,
    scheme: values.scheme || undefined,
    sourceMetadata: manualSourceMetadata(
      projection,
      new Set([
        "delegationLead",
        "eventDate",
        "eventName",
        "funding",
        "institution",
        "issn",
        "journalVolume",
        "location",
        "organization",
        "primaryParty",
        "publicationFrequency",
        "referenceNumber",
        "role",
        "scheme",
        "speakerName",
        "submissionDate",
        "targetGroup",
        "team",
      ]),
    ),
    submittedOn: values.submissionDate || undefined,
    targetGroup: values.targetGroup || undefined,
    team: values.team || undefined,
    title,
  };
}

export function projectManualPublications(
  records: readonly OfficialPublication[],
  projections: OfficialRecordDecisionProjectionMap,
) {
  return applyProjections(
    records,
    projections,
    "publication",
    createPublication,
  );
}

export function projectManualIntellectualProperties(
  records: readonly OfficialIntellectualProperty[],
  projections: OfficialRecordDecisionProjectionMap,
) {
  return applyProjections(
    records,
    projections,
    "intellectual-property",
    createIntellectualProperty,
  );
}

export function projectManualContractProposals(
  records: readonly OfficialContractProposalRecord[],
  projections: OfficialRecordDecisionProjectionMap,
) {
  return applyProjections(
    records,
    projections,
    "contract",
    createContractProposal,
  );
}

export function projectManualAcademics(
  records: readonly OfficialAcademicRecord[],
  projections: OfficialRecordDecisionProjectionMap,
) {
  return applyProjections(records, projections, "academic", createAcademic);
}

export function projectManualActivities(
  records: readonly OfficialActivityRecord[],
  projections: OfficialRecordDecisionProjectionMap,
) {
  return applyProjections(records, projections, "activity", createActivity);
}
