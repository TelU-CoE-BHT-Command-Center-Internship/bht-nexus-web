import type {
  AuditKpiLink,
  AuditReviewField,
  AuditReviewRecord,
  AuditReviewSource,
} from "@/components/nexus-audit-review/nexus-audit-review-content";
import type {
  OfficialPublication,
  PublicationCompletionResolutions,
  PublicationMetadataProposal,
} from "@/components/nexus-publications/nexus-publications-content";
import { publicationCompletionFieldLabels } from "@/components/nexus-publications/nexus-publications-content";
import type { NexusRagExtractionContent } from "@/components/nexus-rag-extraction/nexus-rag-extraction-content";
import type { CollectionJob } from "@/components/nexus-scraper-search/nexus-scraper-search-content";
import { formatAuditTimestamp } from "@/components/nexus-workspace-ui/nexus-workspace-format";

type PreviewActor = { name: string; roleLabel: string };

function actorLabel(actor: PreviewActor) {
  return `${actor.name} · ${actor.roleLabel}`;
}

function createKpiLink(
  indicatorId: string,
  indicatorNumber: number,
  category: string,
  indicatorLabel: string,
  evidenceRule: string,
): AuditKpiLink {
  return {
    category,
    evidenceRule,
    indicatorId,
    indicatorLabel,
    indicatorNumber,
  };
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
        attempt: 1,
        fingerprint: `preview:${job.id}:${candidate.id}`,
        jobId: job.id,
        parser: `${job.source}-profile-adapter@1`,
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
  actor: PreviewActor,
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
            href: "/nexus/dokumen",
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
    kpiLinks: [
      createKpiLink(
        "KM-17",
        17,
        "Riset",
        "Kegiatan dan luaran riset",
        "Dokumen kegiatan, tim, periode pelaksanaan, dan luaran yang dapat diverifikasi.",
      ),
      createKpiLink(
        "KM-22",
        22,
        "Organisasi CoE",
        "Aktivitas yang mendukung layanan CoE",
        "Kegiatan, pihak terkait, waktu pelaksanaan, dan bukti dokumen.",
      ),
    ],
    matches: [],
    owner: content.candidateOwner,
    periodLabel: periodFromFields(acceptedFields),
    primaryPerson: content.candidatePrimaryParty,
    provenance: {
      attempt: 1,
      fingerprint: `preview:${id}:extraction`,
      jobId: `DOC-${profileId}-${discoveredDateKey}`,
      parser: `document-extraction-${profileId}@1`,
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
  actor: PreviewActor,
): AuditReviewRecord {
  const discoveredAt = new Date();
  const completionFields = publication.missingFields.map((key) => ({
    id: key,
    label: publicationCompletionFieldLabels[key],
    value: resolutionValue(proposal.resolutions, key),
  }));
  const fields: AuditReviewField[] = [
    { id: "title", label: "Judul publikasi", value: publication.title },
    { id: "authors", label: "Penulis", value: publication.authors.join("; ") },
    { id: "venue", label: "Jurnal / wadah terbit", value: publication.venue },
    { id: "year", label: "Tahun terbit", value: String(publication.year) },
    ...completionFields,
  ];
  const comparisons = completionFields.map((field) => ({
    candidateValue: field.value,
    fieldId: field.id,
    label: field.label,
    officialValue: "Belum tersedia",
    status: "missing" as const,
    statusLabel: "Diajukan",
  }));
  const evidenceHref =
    proposal.resolutions.publisherUrl?.value ||
    (proposal.resolutions.doi?.value
      ? `https://doi.org/${proposal.resolutions.doi.value}`
      : "/nexus/publikasi");

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
    kpiLinks: [
      createKpiLink(
        "KM-14",
        14,
        "Riset",
        "Publikasi dan konferensi",
        "Identitas karya, sumber penerbit, metadata bibliografis, dan kepemilikan CoE.",
      ),
    ],
    matches: [
      {
        comparisons,
        id: publication.publicId,
        score: 100,
        title: publication.title,
        verdict: "strong",
        verdictLabel: "Rekam tujuan",
      },
    ],
    owner: publication.owner.name,
    periodLabel: String(publication.year),
    primaryPerson: publication.authors[0] ?? publication.owner.name,
    provenance: {
      attempt: 1,
      fingerprint: `preview:${proposal.id}:proposal`,
      jobId: proposal.id,
      parser: "metadata-completion-form@1",
      retrievedAt: discoveredAt.toISOString(),
      sourceKey: `publication:${publication.publicId}`,
    },
    signal: {
      primary: `${completionFields.length} bidang diajukan`,
      secondary: `Melengkapi ${publication.publicId}`,
      tone: "info",
    },
    source: "manual",
    sourceLabel: "Usulan manual",
    subtitle: `${publication.publicId} · pelengkapan metadata`,
    title: publication.title,
    typeLabel: "Pelengkapan metadata publikasi",
  });
}
