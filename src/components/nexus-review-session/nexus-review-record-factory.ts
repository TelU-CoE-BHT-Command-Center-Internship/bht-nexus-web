import type {
  AuditReviewField,
  AuditReviewRecord,
  AuditReviewSource,
} from "@/components/nexus-audit-review/nexus-audit-review-content";
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
