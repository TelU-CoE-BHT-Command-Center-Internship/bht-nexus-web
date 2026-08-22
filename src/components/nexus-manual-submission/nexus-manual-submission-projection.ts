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

type StructuredSubmission = NonNullable<
  OfficialRecordDecisionProjection["candidate"]["manualSubmission"]
>;

const recordTypeByKm: Partial<Record<string, string>> = {
  "KM-9": "invited-speaker",
  "KM-10": "international-institution-visit",
  "KM-11": "international-conference",
  "KM-12": "national-journal",
  "KM-13": "international-journal",
  "KM-14": "international-journal",
  "KM-15": "other-ip",
  "KM-16": "patent",
  "KM-17": "national-research-contract",
  "KM-18": "international-research-contract",
  "KM-19": "commercial-contract",
  "KM-20": "business-unit",
  "KM-21": "community-coaching",
  "KM-22": "international-conference-management",
  "KM-23": "non-research-service",
  "KM-24": "community-service",
  "KM-25": "drtpm-proposal",
  "KM-26": "sdg-proposal",
  "KM-27": "journal-accreditation",
  "KM-28": "doctoral-mentoring",
  "KM-29": "master-mentoring",
  "KM-30": "student-internship",
  "KM-31": "final-project",
  "KM-32": "student-competition",
  "KM-33": "book",
  "KM-37": "national-research-proposal",
  "KM-38": "international-research-proposal",
  "KM-39": "non-research-proposal",
};

function domainForKm(kmId: string): StructuredSubmission["domain"] | null {
  const number = Number(kmId.replace("KM-", ""));
  if ([11, 12, 13, 14, 33].includes(number)) return "publication";
  if ([15, 16].includes(number)) return "intellectual-property";
  if ([17, 18, 19, 37, 38, 39].includes(number)) return "contract";
  if (number >= 28 && number <= 32) return "academic";
  if ((number >= 9 && number <= 10) || (number >= 20 && number <= 27)) {
    return "activity";
  }
  return null;
}

function domainForCandidate(
  candidate: OfficialRecordDecisionProjection["candidate"],
) {
  if (candidate.manualSubmission) return candidate.manualSubmission.domain;
  const kmId = candidate.kpiLinks[0]?.indicator.id;
  if (kmId === "KM-33") return "publication" as const;
  if (candidate.category === "academic_hr") return "academic" as const;
  if (
    candidate.category === "activity_governance" ||
    candidate.category === "community_service"
  ) {
    return "activity" as const;
  }
  if (candidate.category === "innovation_ip") {
    return "intellectual-property" as const;
  }
  if (candidate.category === "publication_conference") {
    return "publication" as const;
  }
  return "contract" as const;
}

function structuredSubmission(
  projection: OfficialRecordDecisionProjection,
): StructuredSubmission | null {
  if (projection.candidate.manualSubmission) {
    return projection.candidate.manualSubmission;
  }

  const candidate = projection.candidate;
  const resolvedKmIds =
    projection.kpiResolution?.status === "changed" ||
    projection.kpiResolution?.status === "confirmed"
      ? projection.kpiResolution.indicatorIds
      : [];
  const kmId =
    resolvedKmIds[0] ??
    (projection.kpiResolution
      ? undefined
      : candidate.kpiLinks[0]?.indicator.id);
  const domain = (kmId && domainForKm(kmId)) || domainForCandidate(candidate);
  const fieldValues = Object.fromEntries(
    candidate.fields.map((field) => [field.id, field.rawValue ?? field.value]),
  );
  const defaultRecordType =
    (kmId ? recordTypeByKm[kmId] : undefined) ??
    {
      academic: "other-academic",
      activity: "other-activity",
      contract: "non-research-proposal",
      "intellectual-property": "other-ip",
      publication: "other-publication",
    }[domain];
  const ipType = (fieldValues.ip_type ?? "").toLocaleLowerCase("id-ID");
  const recordType =
    kmId === "KM-15"
      ? ipType.includes("hak cipta")
        ? "copyright"
        : ipType.includes("desain")
          ? "industrial-design"
          : ipType.includes("merek")
            ? "trademark"
            : defaultRecordType
      : defaultRecordType;
  const evidenceUrl =
    candidate.evidence.find((item) => item.href?.startsWith("https://"))
      ?.href ??
    candidate.evidence.find((item) => item.reference.startsWith("https://"))
      ?.reference ??
    "";
  const submissionDateSource =
    fieldValues.submissionDate ?? fieldValues.submission_date;
  const fullSubmissionDate = /^\d{4}-\d{2}-\d{2}$/.test(
    submissionDateSource ?? "",
  )
    ? submissionDateSource
    : undefined;
  const startDateSource = fieldValues.startDate ?? fieldValues.start_date;
  const endDateSource = fieldValues.endDate ?? fieldValues.end_date;
  const fullStartDate = /^\d{4}-\d{2}-\d{2}$/.test(startDateSource ?? "")
    ? startDateSource
    : undefined;
  const fullEndDate = /^\d{4}-\d{2}-\d{2}$/.test(endDateSource ?? "")
    ? endDateSource
    : undefined;
  const submissionYear = /^\d{4}$/.test(submissionDateSource ?? "")
    ? submissionDateSource
    : undefined;
  const values: Record<string, string> = {
    ...fieldValues,
    evaluationPeriod: candidate.evaluationPeriodLabel ?? "",
    evidenceUrl,
    note: "",
    recordType,
    title: fieldValues.title ?? candidate.title,
  };
  const aliases: Record<string, string | undefined> = {
    applicants:
      fieldValues.applicants ?? fieldValues.applicant ?? fieldValues.team,
    applicationNumber:
      fieldValues.applicationNumber ??
      fieldValues.registration_number ??
      fieldValues.patent_number,
    authors: fieldValues.authors ?? fieldValues.writers,
    creators:
      fieldValues.creators ??
      fieldValues.inventors ??
      fieldValues.creator ??
      fieldValues.name,
    eventDate: fieldValues.eventDate ?? fieldValues.date,
    eventName: fieldValues.eventName ?? fieldValues.event,
    funder: fieldValues.funder ?? fieldValues.grantor,
    funding: fieldValues.funding ?? fieldValues.amount,
    mentors:
      fieldValues.mentors ?? fieldValues.supervisor ?? fieldValues.lecturer,
    ownerUnit: fieldValues.ownerUnit ?? fieldValues.coe ?? fieldValues.name,
    participantRef: fieldValues.participantRef ?? fieldValues.student,
    publicationYear: fieldValues.publicationYear ?? fieldValues.year,
    registrationYear:
      fieldValues.registrationYear ?? fieldValues.year ?? submissionYear,
    scheme: fieldValues.scheme,
    startDate: fullStartDate,
    endDate: fullEndDate,
    submissionDate: fullSubmissionDate,
    team: fieldValues.team ?? fieldValues.applicants,
    venue: fieldValues.venue ?? fieldValues.journal ?? fieldValues.event,
  };
  for (const [key, value] of Object.entries(aliases)) {
    if (value) values[key] = value;
  }

  return {
    domain,
    recordType,
    values,
  };
}

type ProjectableOfficialRecord = {
  id: string;
  kmLinks: Array<{
    indicator: { id: string };
    note: string;
  }>;
  kpiResolutionStatus?: "not_applicable" | "resolved" | "undetermined";
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
      | "Rekam resmi diperbarui"
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
    kpiResolutionStatus:
      linksByIndicator.size > 0 ? "resolved" : projected.kpiResolutionStatus,
    provenance: [...target.provenance, ...projected.provenance],
    review: projected.review,
    updatedAt: projected.updatedAt,
  } as T;
}

function updateProjectedRecord<T extends ProjectableOfficialRecord>(
  target: T,
  projected: T,
  projection: OfficialRecordDecisionProjection,
): T {
  const next: Record<string, unknown> = { ...target };
  const submission = structuredSubmission(projection);
  const values = submission?.values ?? {};
  const writableKeys = new Set([
    "evaluationPeriod",
    "kpiResolutionStatus",
    "kmLinks",
    "missingFields",
    "quality",
    "sourceMetadata",
  ]);
  const addWhenPresent = (targetKey: string, ...valueKeys: string[]) => {
    if (valueKeys.some((key) => Boolean(values[key]?.trim()))) {
      writableKeys.add(targetKey);
    }
  };
  addWhenPresent("applicant", "applicants", "ownerUnit");
  addWhenPresent("authors", "authors");
  addWhenPresent("contractEnd", "endDate");
  addWhenPresent("contractStart", "startDate");
  addWhenPresent("creators", "creators");
  addWhenPresent("doi", "identifier");
  addWhenPresent("documentUrl", "evidenceUrl");
  addWhenPresent("documentAccess", "evidenceUrl");
  addWhenPresent("documentNote", "evidenceUrl");
  addWhenPresent("duration", "duration");
  addWhenPresent("eventDate", "eventDate");
  addWhenPresent("evidenceUrl", "evidenceUrl");
  addWhenPresent("evidenceNote", "evidenceUrl");
  addWhenPresent("evidenceStatus", "evidenceUrl");
  addWhenPresent("filedOn", "submissionDate");
  addWhenPresent("funder", "funder");
  addWhenPresent("funding", "funding");
  addWhenPresent("identifier", "identifier");
  addWhenPresent("issn", "issn");
  addWhenPresent("journalVolume", "journalVolume");
  addWhenPresent("location", "location");
  addWhenPresent("mentors", "mentors", "lecturer");
  addWhenPresent("organization", "organization", "institution");
  addWhenPresent("ownerUnit", "ownerUnit");
  addWhenPresent(
    "participantCode",
    "studentNumber",
    "participantRef",
    "studentTeam",
  );
  addWhenPresent("partner", "partner");
  addWhenPresent(
    "primaryParty",
    "primaryParty",
    "team",
    "speakerName",
    "delegationLead",
    "institution",
  );
  addWhenPresent("programStudy", "programStudy");
  addWhenPresent("publicationFrequency", "publicationFrequency");
  addWhenPresent("publisherUrl", "evidenceUrl");
  addWhenPresent("quartile", "quartile");
  addWhenPresent("referenceNumber", "referenceNumber");
  addWhenPresent("registrationNumber", "applicationNumber");
  addWhenPresent("role", "role");
  addWhenPresent("scheme", "scheme");
  addWhenPresent("submittedOn", "submissionDate");
  addWhenPresent("targetGroup", "targetGroup");
  addWhenPresent("team", "team");
  addWhenPresent("title", "title", "eventName", "institution");
  addWhenPresent("venue", "venue", "publisher");
  addWhenPresent(
    "year",
    "publicationYear",
    "publicationDate",
    "registrationYear",
    "submissionDate",
    "activityYear",
  );
  if (values.recordType) {
    for (const key of [
      "activity",
      "group",
      "kind",
      "protection",
      "quartileApplies",
      "recordStatus",
      "type",
    ]) {
      writableKeys.add(key);
    }
  }
  const protectedKeys = new Set([
    "id",
    "provenance",
    "publicId",
    "review",
    "updatedAt",
  ]);

  for (const [key, value] of Object.entries(projected)) {
    if (
      protectedKeys.has(key) ||
      !writableKeys.has(key) ||
      value === undefined ||
      value === null
    ) {
      continue;
    }
    if (value === "" || (Array.isArray(value) && value.length === 0)) continue;
    next[key] = value;
  }

  return {
    ...next,
    id: target.id,
    kmLinks: projected.kmLinks,
    kpiResolutionStatus: projected.kpiResolutionStatus,
    provenance: [...target.provenance, ...projected.provenance],
    publicId: target.publicId,
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

export function officialProjectionPublicId(
  projection: OfficialRecordDecisionProjection,
) {
  const submission = structuredSubmission(projection);
  const year = submission?.values.evaluationPeriod || "0000";
  const suffix = projection.candidate.id.split("-").at(-1) ?? "00000";
  const prefix =
    submission?.domain === "publication"
      ? "PUB"
      : submission?.domain === "intellectual-property"
        ? "KI"
        : submission?.domain === "contract"
          ? "KPR"
          : submission?.domain === "academic"
            ? "AKD"
            : "KGT";
  return `${prefix}-${year}-M${suffix.slice(-4)}`;
}

/** Dipertahankan sementara untuk pemanggil lama selama migrasi nama adapter. */
export const manualOfficialPublicId = officialProjectionPublicId;

function projectionSourceMetadata(
  projection: OfficialRecordDecisionProjection,
  representedKeys: ReadonlySet<string>,
): NexusOfficialSourceMetadataItem[] {
  const submission = projection.candidate.manualSubmission;
  if (!submission) {
    return projection.candidate.fields.flatMap((field) =>
      representedKeys.has(field.id) || !field.value.trim()
        ? []
        : [
            {
              key: field.id,
              label: field.label,
              value: field.value,
            },
          ],
    );
  }
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

function officialEvidence(evidenceUrl?: string) {
  const url = evidenceUrl?.startsWith("https://") ? evidenceUrl : undefined;
  return {
    note: url
      ? "Bukti utama dapat dibuka melalui tautan yang tercatat."
      : "Bukti tercatat pada sumber internal dan tidak memiliki tautan publik.",
    status: url ? ("public" as const) : ("internal" as const),
    url,
  };
}

function formatFunding(value?: string) {
  const raw = value?.trim();
  if (!raw) return undefined;
  const numeric = Number(raw);
  return Number.isFinite(numeric)
    ? `Rp${numeric.toLocaleString("id-ID")}`
    : raw;
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

function projectionKpiStatus(projection: OfficialRecordDecisionProjection) {
  if (
    projection.kpiResolution?.status === "confirmed" ||
    projection.kpiResolution?.status === "changed"
  ) {
    return "resolved" as const;
  }
  if (projection.kpiResolution?.status === "removed") {
    return "not_applicable" as const;
  }
  return "undetermined" as const;
}

function officialSourceLabel(
  source: OfficialRecordDecisionProjection["candidate"]["source"],
) {
  if (source === "spreadsheet") return "Workbook KM 2026" as const;
  if (source === "scholar") return "Google Scholar" as const;
  if (source === "sinta") return "SINTA" as const;
  if (source === "document") return "Dokumen" as const;
  return "Manual" as const;
}

function commonProjection(projection: OfficialRecordDecisionProjection) {
  const submission = structuredSubmission(projection);
  const evidenceUrl = submission?.values.evidenceUrl?.startsWith("https://")
    ? submission.values.evidenceUrl
    : "";
  const reviewedAt = formatAuditTimestamp(projection.appliedAt);
  const publicId = officialProjectionPublicId(projection);
  return {
    id: publicId.toLocaleLowerCase("id-ID"),
    provenance: [
      {
        capturedAt: reviewedAt,
        identifier: projection.candidate.id,
        note: `${projection.candidate.sourceLabel} disetujui pada Tinjauan dan diproyeksikan ke Data Resmi.`,
        source: officialSourceLabel(projection.candidate.source),
        sourceUrl: evidenceUrl || undefined,
      },
    ],
    kpiResolutionStatus: projectionKpiStatus(projection),
    publicId,
    review: {
      candidateId: projection.candidate.id,
      decision:
        projection.decisionKind === "merged"
          ? ("Dihubungkan ke rekam resmi" as const)
          : projection.decisionKind === "approved_update"
            ? ("Rekam resmi diperbarui" as const)
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
  domain: StructuredSubmission["domain"],
  createRecord: (projection: OfficialRecordDecisionProjection) => T | null,
) {
  const next = [...records];
  const relevant = Object.values(projections).filter(
    (projection) => structuredSubmission(projection)?.domain === domain,
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
        ? updateProjectedRecord(target, projected, projection)
        : {
            ...mergeProjectedRecord(target, projected),
          };
  }

  return next;
}

function createPublication(
  projection: OfficialRecordDecisionProjection,
): OfficialPublication | null {
  const submission = structuredSubmission(projection);
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
    evaluationPeriod: values.evaluationPeriod,
    identifier: identifier || undefined,
    kmLinks: projectionLinks(projection),
    missingFields: [...missingFields],
    publisherUrl: values.evidenceUrl,
    quality: missingFields.length > 0 ? "Perlu dilengkapi" : "Lengkap",
    quartile,
    quartileApplies,
    quartileSource: quartile ? "Diverifikasi pada Tinjauan" : undefined,
    sourceReportedQuartile: quartile,
    sourceMetadata: projectionSourceMetadata(
      projection,
      new Set(["authors", "identifier", "publisher", "quartile", "venue"]),
    ),
    title: projection.candidate.title,
    type,
    venue: values.venue || values.publisher || "Belum tercatat",
    year: values.publicationYear
      ? Number(values.publicationYear)
      : values.publicationDate
        ? Number(values.publicationDate.slice(0, 4))
        : undefined,
  };
}

function createIntellectualProperty(
  projection: OfficialRecordDecisionProjection,
): OfficialIntellectualProperty | null {
  const submission = structuredSubmission(projection);
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
  const evidence = officialEvidence(values.evidenceUrl);
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
    documentAccess: evidence.status,
    documentNote: evidence.note,
    documentUrl: evidence.url,
    evaluationPeriod: values.evaluationPeriod,
    filedOn: values.submissionDate || undefined,
    kmLinks: projectionLinks(projection),
    missingFields: [...missingFields],
    protection,
    quality: missingFields.length > 0 ? "Perlu dilengkapi" : "Lengkap",
    registrationNumber,
    registry: "Kemenkumham melalui klinik HKI Telkom University",
    title: projection.candidate.title,
    year: values.registrationYear
      ? Number(values.registrationYear)
      : values.submissionDate
        ? Number(values.submissionDate.slice(0, 4))
        : undefined,
  };
}

function createContractProposal(
  projection: OfficialRecordDecisionProjection,
): OfficialContractProposalRecord | null {
  const submission = structuredSubmission(projection);
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
  const evidence = officialEvidence(values.evidenceUrl);
  const requiresApplicant =
    config.group === "Proposal" || recordType !== "commercial-contract";
  const requiresScheme = recordType !== "commercial-contract";
  const requiresFunder = config.group === "Proposal";
  const missingFields = [
    ...(requiresApplicant && !values.applicants && !values.ownerUnit
      ? (["applicant"] as const)
      : []),
    ...(requiresScheme && !values.scheme ? (["scheme"] as const) : []),
    ...(requiresFunder && !values.funder ? (["funder"] as const) : []),
    ...(recordType === "commercial-contract" && !values.startDate
      ? (["contractStart"] as const)
      : []),
    ...(recordType === "commercial-contract" && !values.endDate
      ? (["contractEnd"] as const)
      : []),
  ];

  return {
    ...commonProjection(projection),
    applicant: values.applicants || values.ownerUnit || undefined,
    contractEnd: values.endDate || undefined,
    contractStart: values.startDate || undefined,
    evaluationPeriod: values.evaluationPeriod,
    evidenceNote: evidence.note,
    evidenceStatus: evidence.status,
    evidenceUrl: evidence.url,
    funder: values.funder || undefined,
    group: config.group,
    kind: config.kind,
    kmLinks: projectionLinks(projection),
    missingFields: [...missingFields],
    ownerUnit: "CoE BHT",
    partner: values.partner || undefined,
    quality: missingFields.length > 0 ? "Perlu dilengkapi" : "Lengkap",
    referenceNumber: values.referenceNumber || undefined,
    recordStatus: config.status,
    scheme: values.scheme || undefined,
    sourceMetadata: projectionSourceMetadata(
      projection,
      new Set([
        "applicants",
        "endDate",
        "funder",
        "ownerUnit",
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
  const submission = structuredSubmission(projection);
  if (!submission) return null;
  const { recordType, values } = submission;
  const activity = {
    "doctoral-mentoring": "Bimbingan Doktor" as const,
    "final-project": "Riset Tugas Akhir" as const,
    "master-mentoring": "Bimbingan Magister" as const,
    "student-competition": "Kompetisi Mahasiswa" as const,
    "student-internship": "Magang Mahasiswa" as const,
    "other-academic": "Kegiatan Akademik Lainnya" as const,
  }[recordType];
  if (!activity) return null;
  const mentorNames = splitPeople(values.mentors || values.lecturer);
  const participantCode =
    [values.studentNumber, values.participantRef].filter(Boolean).join(" · ") ||
    values.studentTeam ||
    "Tidak dicantumkan pada sumber";
  const evidence = officialEvidence(values.evidenceUrl);
  const programStudyApplies = [
    "doctoral-mentoring",
    "final-project",
    "master-mentoring",
    "student-internship",
  ].includes(recordType);
  const missingFields = [
    ...(programStudyApplies && !values.programStudy
      ? (["programStudy"] as const)
      : []),
  ];

  return {
    ...commonProjection(projection),
    activity,
    duration: values.duration || undefined,
    evaluationPeriod: values.evaluationPeriod,
    evidenceNote: evidence.note,
    evidenceStatus: evidence.status,
    evidenceUrl: evidence.url,
    kmLinks: projectionLinks(projection),
    mentors: mentorNames.map((name) => ({
      id: slugify(name),
      initials: personInitials(name),
      name,
    })),
    missingFields: [...missingFields],
    participantCode,
    programStudy: values.programStudy || undefined,
    quality: missingFields.length > 0 ? "Perlu dilengkapi" : "Lengkap",
    sourceMetadata: projectionSourceMetadata(
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
    year:
      recordType === "student-internship"
        ? values.activityYear
          ? Number(values.activityYear)
          : undefined
        : undefined,
  };
}

function createActivity(
  projection: OfficialRecordDecisionProjection,
): OfficialActivityRecord | null {
  const submission = structuredSubmission(projection);
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
    "other-activity": {
      group: "Pengabdian masyarakat" as const,
      kind: "Kegiatan Lainnya" as const,
      status: "Tercatat" as const,
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
  const fundingApplies = [
    "community-service",
    "drtpm-proposal",
    "non-research-service",
    "sdg-proposal",
  ].includes(recordType);
  const missingFields: OfficialActivityRecord["missingFields"] = [
    ...(fundingApplies && !values.funding ? (["funding"] as const) : []),
    ...([
      "non-research-service",
      "community-service",
      "drtpm-proposal",
      "sdg-proposal",
    ].includes(recordType) && !values.scheme
      ? (["scheme"] as const)
      : []),
    ...([
      "non-research-service",
      "community-service",
      "drtpm-proposal",
      "sdg-proposal",
    ].includes(recordType) && !values.team
      ? (["team"] as const)
      : []),
    ...([
      "non-research-service",
      "community-service",
      "drtpm-proposal",
      "sdg-proposal",
    ].includes(recordType) && !values.targetGroup
      ? (["targetGroup"] as const)
      : []),
    ...([
      "invited-speaker",
      "international-conference-management",
      "international-institution-visit",
    ].includes(recordType) && !values.eventDate
      ? (["eventDate"] as const)
      : []),
    ...([
      "invited-speaker",
      "international-conference-management",
      "international-institution-visit",
    ].includes(recordType) && !values.location
      ? (["location"] as const)
      : []),
    ...(["business-unit"].includes(recordType) && !values.role
      ? (["role"] as const)
      : []),
    ...([
      "business-unit",
      "community-coaching",
      "international-institution-visit",
    ].includes(recordType) &&
    !values.organization &&
    !values.institution
      ? (["organization"] as const)
      : []),
    ...(["business-unit", "community-coaching"].includes(recordType) &&
    !values.primaryParty
      ? (["primaryParty"] as const)
      : []),
    ...(recordType === "journal-accreditation" && !values.journalVolume
      ? (["journalVolume"] as const)
      : []),
    ...(recordType === "journal-accreditation" && !values.issn
      ? (["issn"] as const)
      : []),
    ...(recordType === "journal-accreditation" && !values.publicationFrequency
      ? (["publicationFrequency"] as const)
      : []),
  ];
  const evidence = officialEvidence(values.evidenceUrl);

  return {
    ...commonProjection(projection),
    evaluationPeriod: values.evaluationPeriod,
    eventDate: values.eventDate || undefined,
    evidenceNote: evidence.note,
    evidenceStatus: evidence.status,
    evidenceUrl: evidence.url,
    funding: formatFunding(values.funding),
    group: config.group,
    issn: values.issn || undefined,
    journalVolume: values.journalVolume || undefined,
    kind: config.kind,
    kmLinks: projectionLinks(projection),
    location: values.location || undefined,
    missingFields: [...missingFields],
    organization: values.organization || values.institution || undefined,
    ownerUnit: "CoE BHT",
    primaryParty,
    publicationFrequency: values.publicationFrequency || undefined,
    quality: missingFields.length > 0 ? "Perlu dilengkapi" : "Lengkap",
    referenceNumber: values.referenceNumber || undefined,
    recordStatus: config.status,
    role: values.role || undefined,
    scheme: values.scheme || undefined,
    sourceMetadata: projectionSourceMetadata(
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

export function projectOfficialPublications(
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

export function projectOfficialIntellectualProperties(
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

export function projectOfficialContractProposals(
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

export function projectOfficialAcademics(
  records: readonly OfficialAcademicRecord[],
  projections: OfficialRecordDecisionProjectionMap,
) {
  return applyProjections(records, projections, "academic", createAcademic);
}

export function projectOfficialActivities(
  records: readonly OfficialActivityRecord[],
  projections: OfficialRecordDecisionProjectionMap,
) {
  return applyProjections(records, projections, "activity", createActivity);
}

export const projectManualPublications = projectOfficialPublications;
export const projectManualIntellectualProperties =
  projectOfficialIntellectualProperties;
export const projectManualContractProposals = projectOfficialContractProposals;
export const projectManualAcademics = projectOfficialAcademics;
export const projectManualActivities = projectOfficialActivities;
