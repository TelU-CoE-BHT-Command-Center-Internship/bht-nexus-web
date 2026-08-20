import {
  type AcademicProposal,
  academicDisplayTitle,
  academicMentorNames,
  type OfficialAcademicRecord,
} from "@/components/nexus-academic/nexus-academic-content";
import {
  type ActivityProposal,
  activityDisplayTitle,
  type OfficialActivityRecord,
} from "@/components/nexus-activities/nexus-activities-content";
import type {
  AuditReviewField,
  AuditReviewRecord,
  AuditReviewSource,
} from "@/components/nexus-audit-review/nexus-audit-review-content";
import {
  type ContractProposalProposal,
  contractProposalDisplayTitle,
  contractProposalPrimaryParty,
  type OfficialContractProposalRecord,
} from "@/components/nexus-contract-proposals/nexus-contract-proposals-content";
import type {
  IntellectualPropertyProposal,
  OfficialIntellectualProperty,
} from "@/components/nexus-intellectual-property/nexus-intellectual-property-content";
import { intellectualPropertyCreatorNames } from "@/components/nexus-intellectual-property/nexus-intellectual-property-content";
import { metadataCompletionFieldLabels } from "@/components/nexus-metadata-completion/nexus-metadata-completion-model";
import {
  type OfficialPublication,
  type PublicationCompletionFieldKey,
  type PublicationCompletionResolutions,
  type PublicationMetadataProposal,
  publicationAuthorNames,
  publicationCompletionFieldLabels,
  publicationDisplayTitle,
} from "@/components/nexus-publications/nexus-publications-content";
import type { NexusRagExtractionContent } from "@/components/nexus-rag-extraction/nexus-rag-extraction-content";
import type { CollectionJob } from "@/components/nexus-scraper-search/nexus-scraper-search-content";
import { formatAuditTimestamp } from "@/components/nexus-workspace-ui/nexus-workspace-format";

type FrontendActor = { name: string; roleLabel: string };

function actorLabel(actor: FrontendActor) {
  return `${actor.name} · ${actor.roleLabel}`;
}

function createBaseRecord(
  submittedBy: string,
  values: Pick<
    AuditReviewRecord,
    | "candidateKind"
    | "category"
    | "categoryLabel"
    | "discoveredAt"
    | "discoveredAtLabel"
    | "evidence"
    | "fields"
    | "id"
    | "kpiLinks"
    | "matches"
    | "owner"
    | "periodLabel"
    | "primaryPerson"
    | "provenance"
    | "signal"
    | "source"
    | "sourceLabel"
    | "subtitle"
    | "title"
    | "typeLabel"
  >,
): AuditReviewRecord {
  return {
    ...values,
    history: [
      {
        actor: submittedBy,
        id: `${values.id}-submitted`,
        label: "Kandidat masuk ke antrean",
        timeLabel: values.discoveredAtLabel,
      },
    ],
    status: "waiting",
    statusLabel: "Menunggu tinjauan",
    submittedBy,
    version: 1,
  };
}

function periodFromFields(fields: readonly AuditReviewField[]) {
  const periodValue = fields.find((field) =>
    /tahun|periode/i.test(field.label),
  )?.value;
  return periodValue?.match(/20\d{2}/)?.[0] ?? "2026";
}

function dateKey(value: Date) {
  const parts = new Intl.DateTimeFormat("en", {
    day: "2-digit",
    month: "2-digit",
    timeZone: "Asia/Jakarta",
    year: "numeric",
  }).formatToParts(value);
  const valueFor = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value ?? "";

  return `${valueFor("year")}${valueFor("month")}${valueFor("day")}`;
}

export function createCollectionReviewRecords(
  job: CollectionJob,
): AuditReviewRecord[] {
  const source = job.source satisfies AuditReviewSource;
  return job.candidates.map((candidate) =>
    createBaseRecord(job.submittedBy, {
      ...candidate,
      discoveredAt: job.submittedAt,
      discoveredAtLabel: job.submittedAtLabel,
      evidence: [
        {
          href: job.profileUrl,
          id: `${candidate.id}-profile`,
          label: `Profil publik ${job.sourceLabel}`,
          reference: `${job.id} · ${job.profileUrl}`,
          sourceLabel: job.sourceLabel,
        },
      ],
      provenance: {
        jobId: job.id,
        retrievedAt: job.submittedAt,
        sourceKey: `${job.source}:${candidate.id}`,
      },
      source,
      sourceLabel: job.sourceLabel,
    }),
  );
}

export function createExtractionReviewRecord(
  content: NexusRagExtractionContent,
  decisions: Record<string, "accepted" | "pending" | "rejected">,
  profileId: string,
  actor: FrontendActor,
): AuditReviewRecord {
  const discoveredAt = new Date();
  const discoveredDateKey = dateKey(discoveredAt);
  const id = `EXT-${profileId.toUpperCase()}-${discoveredDateKey}-001`;
  const acceptedFields = content.fields
    .filter((field) => decisions[field.id] === "accepted")
    .map(({ id: fieldId, label, value }) => ({ id: fieldId, label, value }));
  const evidence = content.fields.flatMap((field) =>
    decisions[field.id] === "accepted" && field.source
      ? [
          {
            id: `${id}-${field.id}-evidence`,
            label: field.label,
            reference: `Halaman ${field.source.page}: ${field.source.quote}`,
            sourceLabel: content.documentTitle,
          },
        ]
      : [],
  );

  return createBaseRecord(actorLabel(actor), {
    candidateKind: "new_record",
    category: "research_business",
    categoryLabel: "Riset & bisnis",
    discoveredAt: discoveredAt.toISOString(),
    discoveredAtLabel: formatAuditTimestamp(discoveredAt),
    evidence,
    fields: acceptedFields,
    id,
    kpiLinks: [],
    matches: [],
    owner: content.candidateOwner,
    periodLabel: periodFromFields(acceptedFields),
    primaryPerson: content.candidatePrimaryParty,
    provenance: {
      retrievedAt: discoveredAt.toISOString(),
      sourceKey: `document:${content.documentTitle}`,
    },
    signal: {
      primary: `${acceptedFields.length} bidang diterima dari dokumen`,
      secondary: `${content.fields.length - acceptedFields.length} bidang tidak diteruskan`,
      tone: "waiting",
    },
    source: "document",
    sourceLabel: "Dokumen",
    subtitle: `${content.documentTitle} · profil ${profileId}`,
    title:
      acceptedFields.find((field) => field.id === "activity_title")?.value ??
      content.documentTitle,
    typeLabel: "Kegiatan hasil ekstraksi",
  });
}

function resolutionValue(
  resolutions: PublicationCompletionResolutions,
  key: keyof PublicationCompletionResolutions,
) {
  const resolution = resolutions[key];
  if (!resolution) return "Belum diajukan";
  if (resolution.status === "provided") return resolution.value;
  return resolution.status === "not-applicable"
    ? `Tidak berlaku · ${resolution.reason}`
    : `Memang tidak tersedia · ${resolution.reason}`;
}

export function createMetadataCompletionReviewRecord(
  publication: OfficialPublication,
  proposal: PublicationMetadataProposal,
  actor: FrontendActor,
): AuditReviewRecord {
  const discoveredAt = new Date();
  const displayTitle = publicationDisplayTitle(publication);
  /**
   * Nilai resmi yang sekarang tersimpan pada rekam publikasi. Dipakai sebagai
   * pembanding, bukan sebagai nilai kandidat.
   */
  const officialValues: Partial<Record<PublicationCompletionFieldKey, string>> =
    {
      doi: publication.doi,
      issue: publication.issue,
      pages: publication.pages,
      publisherUrl: publication.publisherUrl,
      quartile: publication.quartile,
      title: publication.title,
      type: publication.type,
      year: publication.year ? String(publication.year) : undefined,
    };
  const proposedValues = new Map<string, string>(
    publication.missingFields.map((key) => [
      key,
      resolutionValue(proposal.resolutions, key),
    ]),
  );
  /**
   * Satu bidang bisnis wajib memiliki tepat satu `fieldId`. Tinjauan membaca
   * nilai dengan `fields.find(id)`, sehingga bidang ganda akan membuat nilai
   * usulan tertutup oleh nilai resmi yang lama. Karena judul dan tahun kini
   * dapat menjadi bidang pelengkapan, keduanya dibangun sekali saja dengan
   * nilai usulan bila memang sedang diusulkan.
   */
  const canonicalFields: readonly { id: string; label: string }[] = [
    { id: "title", label: "Judul publikasi" },
    { id: "authors", label: "Penulis" },
    { id: "venue", label: "Jurnal / wadah terbit" },
    { id: "type", label: "Jenis publikasi" },
    { id: "year", label: "Tahun terbit" },
  ];
  const canonicalIds = new Set(canonicalFields.map((field) => field.id));
  const canonicalValues: Record<string, string> = {
    authors: publicationAuthorNames(publication),
    title: publication.title,
    type: publication.type,
    venue: publication.venue,
    year: officialValues.year ?? "",
  };
  const fields: AuditReviewField[] = [
    ...canonicalFields.map((field) => ({
      ...field,
      value: proposedValues.get(field.id) ?? canonicalValues[field.id] ?? "",
    })),
    ...publication.missingFields
      .filter((key) => !canonicalIds.has(key))
      .map((key) => ({
        id: key,
        label: publicationCompletionFieldLabels[key],
        value: proposedValues.get(key) ?? "",
      })),
  ];
  const comparisons = publication.missingFields.map((key) => ({
    candidateValue: proposedValues.get(key) ?? "",
    fieldId: key,
    label: publicationCompletionFieldLabels[key],
    officialValue: officialValues[key] || "Belum tersedia",
    status: "missing" as const,
    statusLabel: "Diajukan",
  }));
  const evidenceHref: string | undefined =
    proposal.resolutions.publisherUrl?.value ||
    (proposal.resolutions.doi?.value
      ? `https://doi.org/${proposal.resolutions.doi.value}`
      : undefined);

  return createBaseRecord(proposal.submittedBy || actorLabel(actor), {
    candidateKind: "metadata_completion",
    category: "publication_conference",
    categoryLabel: "Publikasi & konferensi",
    discoveredAt: discoveredAt.toISOString(),
    discoveredAtLabel: formatAuditTimestamp(discoveredAt),
    evidence: [
      {
        href: evidenceHref,
        id: `${proposal.id}-source`,
        label: "Dasar usulan pelengkapan",
        reference: proposal.note,
        sourceLabel: "Usulan pengelola",
      },
    ],
    fields,
    id: proposal.id,
    kpiLinks: publication.kmLinks.map((link) => ({
      evidenceRule:
        "Metadata resmi perlu lengkap sebelum rekam dihitung pada indikator ini.",
      indicator: link.indicator,
    })),
    matches: [
      {
        comparisons,
        id: publication.publicId,
        score: 100,
        title: displayTitle,
        verdict: "strong",
        verdictLabel: "Rekam tujuan",
      },
    ],
    // Pemilik data belum ditetapkan oleh kebijakan peran; penulis pertama
    // bukan pemilik data, dan keberadaan rekam di registry CoE BHT belum
    // membuktikan kepemilikannya.
    owner: "Belum ditetapkan",
    periodLabel: publication.evaluationPeriod,
    primaryPerson: publication.authors[0]?.name ?? "Belum ditetapkan",
    provenance: {
      retrievedAt: discoveredAt.toISOString(),
      sourceKey: `publication:${publication.publicId}`,
    },
    signal: {
      primary: `${publication.missingFields.length} bidang diajukan`,
      secondary: `Melengkapi ${publication.publicId}`,
      tone: "info",
    },
    source: "manual",
    sourceLabel: "Usulan manual",
    subtitle: `${publication.publicId} · pelengkapan metadata`,
    title: displayTitle,
    typeLabel: "Pelengkapan metadata publikasi",
  });
}

export function createAcademicCompletionReviewRecord(
  record: OfficialAcademicRecord,
  proposal: AcademicProposal,
  actor: FrontendActor,
): AuditReviewRecord {
  const discoveredAt = new Date();
  const displayTitle = academicDisplayTitle(record);
  const officialValues: Partial<Record<string, string>> = {
    duration: record.duration,
    evidenceUrl: record.evidenceUrl,
    programStudy: record.programStudy,
    title: record.title ?? "",
    year: record.year ? String(record.year) : undefined,
  };
  const proposedValues = new Map<string, string>(
    record.missingFields.map((key) => [
      key,
      resolutionValue(proposal.resolutions, key),
    ]),
  );

  // Satu bidang bisnis tetap satu fieldId, sama seperti pelengkapan Publikasi.
  const canonicalFields: readonly { id: string; label: string }[] = [
    { id: "title", label: "Topik riset / nama kegiatan" },
    { id: "mentors", label: "Pembimbing" },
    { id: "activity", label: "Bentuk kegiatan" },
    { id: "programStudy", label: "Program studi" },
    ...(record.activity === "Magang Mahasiswa"
      ? [
          { id: "duration", label: "Lama kegiatan" },
          { id: "year", label: "Tahun kegiatan" },
        ]
      : []),
  ];
  const canonicalIds = new Set(canonicalFields.map((field) => field.id));
  const canonicalValues: Record<string, string> = {
    activity: record.activity,
    duration: record.duration ?? "",
    mentors: academicMentorNames(record),
    programStudy: record.programStudy ?? "",
    title: record.title ?? "",
    year: officialValues.year ?? "",
  };
  const fields: AuditReviewField[] = [
    ...canonicalFields.map((field) => ({
      ...field,
      value: proposedValues.get(field.id) ?? canonicalValues[field.id] ?? "",
    })),
    ...record.missingFields
      .filter((key) => !canonicalIds.has(key))
      .map((key) => ({
        id: key,
        label: metadataCompletionFieldLabels[key],
        value: proposedValues.get(key) ?? "",
      })),
  ];
  const comparisons = record.missingFields.map((key) => ({
    candidateValue: proposedValues.get(key) ?? "",
    fieldId: key,
    label: metadataCompletionFieldLabels[key],
    officialValue: officialValues[key] || "Belum tersedia",
    status: "missing" as const,
    statusLabel: "Diajukan",
  }));

  return createBaseRecord(proposal.submittedBy || actorLabel(actor), {
    candidateKind: "metadata_completion",
    category: "academic_hr",
    categoryLabel: "Akademik & SDM",
    discoveredAt: discoveredAt.toISOString(),
    discoveredAtLabel: formatAuditTimestamp(discoveredAt),
    evidence: [
      {
        href: proposal.resolutions.evidenceUrl?.value || undefined,
        id: `${proposal.id}-source`,
        label: "Dasar usulan pelengkapan",
        reference: proposal.note,
        sourceLabel: "Usulan pengelola",
      },
    ],
    fields,
    id: proposal.id,
    kpiLinks: record.kmLinks.map((link) => ({
      evidenceRule:
        link.indicator.id === "KM-30"
          ? "Rekam peserta menjadi bukti operasional. Nilai indikator tetap berupa kapasitas magang yang ditetapkan dari sumber daya tampung, bukan jumlah peserta aktif."
          : "Kegiatan baru dihitung pada indikator ini setelah bukti kegiatannya dapat diperiksa.",
      indicator: link.indicator,
    })),
    matches: [
      {
        comparisons,
        id: record.publicId,
        score: 100,
        title: displayTitle,
        verdict: "strong",
        verdictLabel: "Rekam tujuan",
      },
    ],
    owner: "Belum ditetapkan",
    periodLabel: record.evaluationPeriod,
    // Mahasiswa tidak dipakai sebagai pihak utama karena identitasnya tidak
    // dipublikasikan; pembimbing pertama adalah pihak yang dapat dihubungi.
    primaryPerson: record.mentors[0]?.name ?? "Belum ditetapkan",
    provenance: {
      retrievedAt: discoveredAt.toISOString(),
      sourceKey: `academic:${record.publicId}`,
    },
    signal: {
      primary: `${record.missingFields.length} bidang diajukan`,
      secondary: `Melengkapi ${record.publicId}`,
      tone: "info",
    },
    source: "manual",
    sourceLabel: "Usulan manual",
    subtitle: `${record.publicId} · pelengkapan metadata`,
    title: displayTitle,
    typeLabel: "Pelengkapan metadata kegiatan akademik",
  });
}

export function createActivityCompletionReviewRecord(
  record: OfficialActivityRecord,
  proposal: ActivityProposal,
  actor: FrontendActor,
): AuditReviewRecord {
  const discoveredAt = new Date();
  const displayTitle = activityDisplayTitle(record);
  const officialValues: Partial<Record<string, string>> = {
    evidenceUrl: record.evidenceUrl,
    title: record.title,
  };
  const proposedValues = new Map<string, string>(
    record.missingFields.map((key) => [
      key,
      resolutionValue(proposal.resolutions, key),
    ]),
  );
  const canonicalFields: readonly { id: string; label: string }[] = [
    ...(record.kind === "Keterlibatan Unit Bisnis" ||
    record.kind === "Pembinaan UMKM / Komunitas"
      ? []
      : [{ id: "title", label: "Nama kegiatan / program" }]),
    { id: "kind", label: "Jenis rekam" },
    { id: "primaryParty", label: "Pihak utama" },
    ...(record.organization
      ? [{ id: "organization", label: "Unit bisnis / komunitas" }]
      : []),
    ...(record.role ? [{ id: "role", label: "Keterlibatan sebagai" }] : []),
    ...(record.scheme ? [{ id: "scheme", label: "Skema / program" }] : []),
    ...(record.team ? [{ id: "team", label: "Tim pelaksana" }] : []),
    ...(record.targetGroup
      ? [{ id: "targetGroup", label: "Masyarakat / mitra sasaran" }]
      : []),
    ...(record.funding ? [{ id: "funding", label: "Dana tercatat" }] : []),
    ...(record.eventDate
      ? [{ id: "eventDate", label: "Tanggal kegiatan" }]
      : []),
    ...(record.location ? [{ id: "location", label: "Tempat" }] : []),
    ...(record.journalVolume
      ? [{ id: "journalVolume", label: "Volume pada periode sumber" }]
      : []),
    ...(record.issn ? [{ id: "issn", label: "ISSN" }] : []),
    ...(record.publicationFrequency
      ? [{ id: "publicationFrequency", label: "Frekuensi terbit" }]
      : []),
  ];
  const canonicalIds = new Set(canonicalFields.map((field) => field.id));
  const canonicalValues: Record<string, string> = {
    eventDate: record.eventDate ?? "",
    funding: record.funding ?? "",
    issn: record.issn ?? "",
    journalVolume: record.journalVolume ?? "",
    kind: record.kind,
    location: record.location ?? "",
    organization: record.organization ?? "",
    primaryParty: record.primaryParty,
    publicationFrequency: record.publicationFrequency ?? "",
    role: record.role ?? "",
    scheme: record.scheme ?? "",
    targetGroup: record.targetGroup ?? "",
    team: record.team ?? "",
    title: record.title ?? "",
  };
  const fields: AuditReviewField[] = [
    ...canonicalFields.map((field) => ({
      ...field,
      value: proposedValues.get(field.id) ?? canonicalValues[field.id] ?? "",
    })),
    ...record.missingFields
      .filter((key) => !canonicalIds.has(key))
      .map((key) => ({
        id: key,
        label: metadataCompletionFieldLabels[key],
        value: proposedValues.get(key) ?? "",
      })),
  ];
  const comparisons = record.missingFields.map((key) => ({
    candidateValue: proposedValues.get(key) ?? "",
    fieldId: key,
    label: metadataCompletionFieldLabels[key],
    officialValue: officialValues[key] || "Belum tersedia",
    status: "missing" as const,
    statusLabel: "Diajukan",
  }));

  return createBaseRecord(proposal.submittedBy || actorLabel(actor), {
    candidateKind: "metadata_completion",
    category:
      record.group === "Bisnis" ? "research_business" : "community_service",
    categoryLabel:
      record.group === "Bisnis" ? "Riset & bisnis" : "Pengabdian masyarakat",
    discoveredAt: discoveredAt.toISOString(),
    discoveredAtLabel: formatAuditTimestamp(discoveredAt),
    evidence: [
      {
        href: proposal.resolutions.evidenceUrl?.value || undefined,
        id: `${proposal.id}-source`,
        label: "Dasar usulan pelengkapan",
        reference: proposal.note,
        sourceLabel: "Usulan pengelola",
      },
    ],
    fields,
    id: proposal.id,
    kpiLinks: record.kmLinks.map((link) => ({
      evidenceRule:
        "Kegiatan baru dihitung setelah jenis, pihak terkait, dan bukti pelaksanaannya dapat diperiksa.",
      indicator: link.indicator,
    })),
    matches: [
      {
        comparisons,
        id: record.publicId,
        score: 100,
        title: displayTitle,
        verdict: "strong",
        verdictLabel: "Rekam tujuan",
      },
    ],
    owner: record.ownerUnit,
    periodLabel: record.evaluationPeriod,
    primaryPerson: record.primaryParty,
    provenance: {
      retrievedAt: discoveredAt.toISOString(),
      sourceKey: `activity:${record.publicId}`,
    },
    signal: {
      primary: `${record.missingFields.length} bidang diajukan`,
      secondary: `Melengkapi ${record.publicId}`,
      tone: "info",
    },
    source: "manual",
    sourceLabel: "Usulan manual",
    subtitle: `${record.publicId} · pelengkapan metadata`,
    title: displayTitle,
    typeLabel: "Pelengkapan metadata kegiatan atau pengabdian",
  });
}

export function createContractProposalCompletionReviewRecord(
  record: OfficialContractProposalRecord,
  proposal: ContractProposalProposal,
  actor: FrontendActor,
): AuditReviewRecord {
  const discoveredAt = new Date();
  const displayTitle = contractProposalDisplayTitle(record);
  const officialValues: Partial<Record<string, string>> = {
    applicant: record.applicant,
    contractEnd: record.contractEnd,
    contractStart: record.contractStart,
    evidenceUrl: record.evidenceUrl,
    funder: record.funder,
    scheme: record.scheme,
    title: record.title,
  };
  const proposedValues = new Map<string, string>(
    record.missingFields.map((key) => [
      key,
      resolutionValue(proposal.resolutions, key),
    ]),
  );
  const canonicalFields: readonly { id: string; label: string }[] = [
    { id: "title", label: "Judul kontrak / proposal" },
    { id: "kind", label: "Jenis rekam" },
    ...(record.kind === "Kontrak Bisnis Komersialisasi"
      ? []
      : [{ id: "applicant", label: "Pengusul / penanggung jawab" }]),
    ...(record.kind === "Kontrak Bisnis Komersialisasi"
      ? []
      : [{ id: "scheme", label: "Skema / program" }]),
    { id: "partner", label: "Mitra" },
    ...(record.group === "Proposal"
      ? [{ id: "funder", label: "Instansi pemberi hibah" }]
      : []),
    ...(record.kind === "Kontrak Bisnis Komersialisasi"
      ? [
          { id: "contractStart", label: "Tanggal mulai kontrak" },
          { id: "contractEnd", label: "Tanggal selesai kontrak" },
        ]
      : []),
  ];
  const canonicalIds = new Set(canonicalFields.map((field) => field.id));
  const canonicalValues: Record<string, string> = {
    applicant: record.applicant ?? "",
    contractEnd: record.contractEnd ?? "",
    contractStart: record.contractStart ?? "",
    funder: record.funder ?? "",
    kind: record.kind,
    partner: record.partner ?? "",
    scheme: record.scheme ?? "",
    title: record.title,
  };
  const fields: AuditReviewField[] = [
    ...canonicalFields.map((field) => ({
      ...field,
      value: proposedValues.get(field.id) ?? canonicalValues[field.id] ?? "",
    })),
    ...record.missingFields
      .filter((key) => !canonicalIds.has(key))
      .map((key) => ({
        id: key,
        label: metadataCompletionFieldLabels[key],
        value: proposedValues.get(key) ?? "",
      })),
  ];
  const comparisons = record.missingFields.map((key) => ({
    candidateValue: proposedValues.get(key) ?? "",
    fieldId: key,
    label: metadataCompletionFieldLabels[key],
    officialValue: officialValues[key] || "Belum tersedia",
    status: "missing" as const,
    statusLabel: "Diajukan",
  }));

  return createBaseRecord(proposal.submittedBy || actorLabel(actor), {
    candidateKind: "metadata_completion",
    category: "research_business",
    categoryLabel: "Riset & bisnis",
    discoveredAt: discoveredAt.toISOString(),
    discoveredAtLabel: formatAuditTimestamp(discoveredAt),
    evidence: [
      {
        href: proposal.resolutions.evidenceUrl?.value || undefined,
        id: `${proposal.id}-source`,
        label: "Dasar usulan pelengkapan",
        reference: proposal.note,
        sourceLabel: "Usulan pengelola",
      },
    ],
    fields,
    id: proposal.id,
    kpiLinks: record.kmLinks.map((link) => ({
      evidenceRule:
        "Rekam baru dihitung pada indikator ini setelah jenis, pihak terkait, dan bukti pengajuan atau kontraknya dapat diperiksa.",
      indicator: link.indicator,
    })),
    matches: [
      {
        comparisons,
        id: record.publicId,
        score: 100,
        title: displayTitle,
        verdict: "strong",
        verdictLabel: "Rekam tujuan",
      },
    ],
    owner: record.ownerUnit,
    periodLabel: record.evaluationPeriod,
    primaryPerson: contractProposalPrimaryParty(record),
    provenance: {
      retrievedAt: discoveredAt.toISOString(),
      sourceKey: `contract-proposal:${record.publicId}`,
    },
    signal: {
      primary: `${record.missingFields.length} bidang diajukan`,
      secondary: `Melengkapi ${record.publicId}`,
      tone: "info",
    },
    source: "manual",
    sourceLabel: "Usulan manual",
    subtitle: `${record.publicId} · pelengkapan metadata`,
    title: displayTitle,
    typeLabel: "Pelengkapan metadata kontrak atau proposal",
  });
}

export function createIntellectualPropertyCompletionReviewRecord(
  record: OfficialIntellectualProperty,
  proposal: IntellectualPropertyProposal,
  actor: FrontendActor,
): AuditReviewRecord {
  const discoveredAt = new Date();
  const officialValues: Partial<Record<string, string>> = {
    documentUrl: record.documentUrl,
    protectionType: record.protection,
    registrationNumber: record.registrationNumber,
    title: record.title,
    year: record.year ? String(record.year) : undefined,
  };
  const proposedValues = new Map<string, string>(
    record.missingFields.map((key) => [
      key,
      resolutionValue(proposal.resolutions, key),
    ]),
  );
  const proposedDocumentUrl = proposal.resolutions.documentUrl;

  // Satu bidang bisnis tetap satu fieldId, sama seperti pelengkapan Publikasi.
  const canonicalFields: readonly { id: string; label: string }[] = [
    { id: "title", label: "Judul karya" },
    { id: "creators", label: "Pencipta / inventor" },
    { id: "protectionType", label: "Jenis perlindungan" },
    { id: "registrationNumber", label: "Nomor pencatatan" },
    { id: "year", label: "Tahun pengajuan" },
  ];
  const canonicalIds = new Set(canonicalFields.map((field) => field.id));
  const canonicalValues: Record<string, string> = {
    creators: intellectualPropertyCreatorNames(record),
    protectionType: record.protection,
    registrationNumber: record.registrationNumber ?? "",
    title: record.title,
    year: officialValues.year ?? "",
  };
  const fields: AuditReviewField[] = [
    ...canonicalFields.map((field) => ({
      ...field,
      value: proposedValues.get(field.id) ?? canonicalValues[field.id] ?? "",
    })),
    ...record.missingFields
      .filter((key) => !canonicalIds.has(key))
      .map((key) => ({
        id: key,
        label: metadataCompletionFieldLabels[key],
        value: proposedValues.get(key) ?? "",
      })),
  ];
  const comparisons = record.missingFields.map((key) => ({
    candidateValue: proposedValues.get(key) ?? "",
    fieldId: key,
    label: metadataCompletionFieldLabels[key],
    officialValue: officialValues[key] || "Belum tersedia",
    status: "missing" as const,
    statusLabel: "Diajukan",
  }));

  return createBaseRecord(proposal.submittedBy || actorLabel(actor), {
    candidateKind: "metadata_completion",
    category: "innovation_ip",
    categoryLabel: "Inovasi & HKI",
    discoveredAt: discoveredAt.toISOString(),
    discoveredAtLabel: formatAuditTimestamp(discoveredAt),
    evidence: [
      {
        id: `${proposal.id}-source`,
        label: "Dasar usulan pelengkapan",
        reference: proposal.note,
        sourceLabel: "Usulan pengelola",
      },
      ...(proposedDocumentUrl?.status === "provided"
        ? [
            {
              href: proposedDocumentUrl.value,
              id: `${proposal.id}-document`,
              label: "Dokumen pendaftaran yang diajukan",
              reference:
                "Tautan dokumen disertakan sebagai bukti audit pelengkapan metadata.",
              sourceLabel: "Usulan pengelola",
            },
          ]
        : []),
    ],
    fields,
    id: proposal.id,
    kpiLinks: record.kmLinks.map((link) => ({
      evidenceRule:
        "Indikator menghitung pengajuan setelah memperoleh nomor registrasi. Dokumen pendaftaran diperiksa sebagai bukti audit yang terpisah.",
      indicator: link.indicator,
    })),
    matches: [
      {
        comparisons,
        id: record.publicId,
        score: 100,
        title: record.title,
        verdict: "strong",
        verdictLabel: "Rekam tujuan",
      },
    ],
    owner: "Belum ditetapkan",
    periodLabel: record.evaluationPeriod,
    primaryPerson: record.creators[0]?.name ?? "Belum ditetapkan",
    provenance: {
      retrievedAt: discoveredAt.toISOString(),
      sourceKey: `intellectual-property:${record.publicId}`,
    },
    signal: {
      primary: `${record.missingFields.length} bidang diajukan`,
      secondary: `Melengkapi ${record.publicId}`,
      tone: "info",
    },
    source: "manual",
    sourceLabel: "Usulan manual",
    subtitle: `${record.publicId} · pelengkapan metadata`,
    title: record.title,
    typeLabel: "Pelengkapan metadata kekayaan intelektual",
  });
}
