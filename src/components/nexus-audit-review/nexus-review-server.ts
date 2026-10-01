"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import type {
  AuditDecisionKind,
  AuditOfficialMatch,
  AuditReviewCategory,
  AuditReviewDecision,
  AuditReviewEvidence,
  AuditReviewField,
  AuditReviewHistory,
  AuditReviewRecord,
  AuditReviewSignal,
  AuditReviewSource,
  AuditReviewStatus,
} from "@/components/nexus-audit-review/nexus-audit-review-content";
import {
  type ManualSubmissionDomain,
  manualSubmissionDefinitions,
  manualSubtype,
} from "@/components/nexus-manual-submission/nexus-manual-submission-model";
import {
  type AuditCorrection,
  type AuditRuntimeState,
  initialAuditRuntimeState,
  type NexusRecordCapabilities,
  type NexusReviewActor,
  type NexusReviewCapabilities,
} from "@/components/nexus-review-session/nexus-review-session";
import {
  compareTimestamps,
  formatAuditTimestamp,
} from "@/components/nexus-workspace-ui/nexus-workspace-format";
import {
  ApiRequestError,
  apiErrorKind,
  apiErrorMessage,
} from "@/lib/api-client";
import {
  decideReviewCase,
  getReviewCase,
  getReviewComparison,
  listAllReviewCases,
  type ReviewCaseDetail,
  type ReviewCaseRecord,
  type ReviewCaseStatus,
  type ReviewComparison,
  type ReviewDecisionKind,
  type ReviewPromotionResult,
  submitReviewEdit,
} from "@/lib/api-reviews";
import { useLoadEffect } from "@/lib/use-load-effect";

/**
 * Satu-satunya penerjemah kasus tinjauan server ke bentuk ruang Tinjauan.
 * Status, riwayat, keputusan, dan perbaikan dibaca dari server; tampilan hanya
 * berubah setelah server mengonfirmasi tindakan. Bagian yang belum dicatat
 * server (pemetaan orang, keputusan indikator KM, catatan dasar perbaikan)
 * tidak pernah dikarang.
 */

type Payload = Record<string, unknown>;

type LoadState = "error" | "loading" | "ready";

type DetailEntry = {
  detail?: ReviewCaseDetail;
  errorMessage?: string;
  state: LoadState;
};

type ComparisonEntry = {
  comparison?: ReviewComparison;
  errorMessage?: string;
  state: LoadState;
};

/**
 * Daftar kasus dari server belum membawa judul kandidat, sehingga rincian
 * dibaca per kasus. Jumlahnya dibatasi agar satu kunjungan tidak menghabiskan
 * batas permintaan server; kasus lain dibaca ketika tampil atau dibuka.
 */
const DETAIL_PREFETCH_LIMIT = 40;
const DETAIL_CONCURRENCY = 4;

const reviewStatuses: readonly ReviewCaseStatus[] = [
  "pending",
  "needs_revision",
  "approved",
  "rejected",
];

const sourceLabels: Record<AuditReviewSource, string> = {
  document: "Dokumen",
  manual: "Manual",
  scholar: "Google Scholar",
  sinta: "SINTA",
  spreadsheet: "Impor lembar kerja",
};

const sourceSubmitters: Record<AuditReviewSource, string> = {
  document: "Ekstraksi dokumen",
  manual: "Pengajuan manual",
  scholar: "Pengumpulan Google Scholar",
  sinta: "Pengumpulan SINTA",
  spreadsheet: "Impor lembar kerja",
};

const statusFromServer: Record<ReviewCaseStatus, AuditReviewStatus> = {
  approved: "completed",
  needs_revision: "needs_fix",
  pending: "waiting",
  rejected: "completed",
};

const statusLabels: Record<AuditReviewStatus, string> = {
  completed: "Selesai ditinjau",
  needs_fix: "Perlu perbaikan",
  waiting: "Menunggu tinjauan",
};

const decisionKinds: Record<ReviewDecisionKind, AuditDecisionKind> = {
  approve: "approved_new",
  reject: "rejected",
  request_revision: "changes_requested",
};

const decisionLabels: Record<ReviewDecisionKind, string> = {
  approve: "Disetujui",
  reject: "Ditolak",
  request_revision: "Perbaikan diminta",
};

const categoryLabels: Record<AuditReviewCategory, string> = {
  academic_hr: "Akademik & SDM",
  activity_governance: "Kegiatan & tata kelola",
  community_service: "Pengabdian masyarakat",
  innovation_ip: "HKI, paten & inovasi",
  publication_conference: "Publikasi & konferensi",
  research_business: "Riset & bisnis",
};

const workTypeLabels: Record<string, string> = {
  book: "Buku",
  book_chapter: "Buku / bab buku",
  community_service: "Pengabdian masyarakat",
  conference_paper: "Makalah konferensi",
  contract: "Kontrak",
  intellectual_property: "HKI",
  journal_article: "Artikel jurnal",
  patent: "Paten",
  research: "Riset",
};

type FieldSpec = Pick<AuditReviewField, "id" | "input" | "label">;

const publicationFields: readonly FieldSpec[] = [
  { id: "title", input: { required: true, type: "text" }, label: "Judul" },
  {
    id: "authors",
    input: { required: false, type: "textarea" },
    label: "Penulis",
  },
  {
    id: "venue",
    input: { required: false, type: "text" },
    label: "Jurnal / prosiding",
  },
  {
    id: "year",
    input: { min: "1900", required: true, type: "number" },
    label: "Tahun terbit",
  },
  { id: "doi", input: { required: false, type: "text" }, label: "DOI" },
  { id: "quartile", label: "Kuartil" },
  {
    id: "evidence_url",
    input: { required: false, type: "url" },
    label: "Tautan bukti",
  },
  {
    id: "evaluation_period",
    input: { required: false, type: "text" },
    label: "Periode evaluasi",
  },
  { id: "note", label: "Catatan pengaju" },
];

const activityFields: readonly FieldSpec[] = [
  {
    id: "title",
    input: { required: true, type: "text" },
    label: "Judul kegiatan",
  },
  {
    id: "authors",
    input: { required: false, type: "textarea" },
    label: "Pihak terkait",
  },
  {
    id: "year",
    input: { min: "1900", required: true, type: "number" },
    label: "Tahun",
  },
  {
    id: "evidence_url",
    input: { required: false, type: "url" },
    label: "Tautan bukti",
  },
  {
    id: "evaluation_period",
    input: { required: false, type: "text" },
    label: "Periode evaluasi",
  },
  { id: "note", label: "Catatan pengaju" },
];

function text(value: unknown): string {
  if (typeof value === "string") return value.trim();
  if (typeof value === "number" && Number.isFinite(value)) return String(value);
  if (Array.isArray(value)) {
    return value
      .flatMap((item) =>
        typeof item === "string" && item.trim() ? [item.trim()] : [],
      )
      .join("; ");
  }
  return "";
}

/** Hanya alamat web yang boleh menjadi tautan; nilai lain tampil sebagai teks. */
function webUrl(value: unknown): string | undefined {
  const candidate = text(value);
  if (!candidate) return undefined;
  try {
    const url = new URL(candidate);
    return url.protocol === "https:" || url.protocol === "http:"
      ? url.toString()
      : undefined;
  } catch {
    return undefined;
  }
}

function people(value: unknown) {
  return text(value)
    .split(";")
    .map((item) => item.trim())
    .filter(Boolean);
}

/**
 * Sumber kandidat. Kandidat hasil pengumpulan yang belum dibaca rinciannya
 * mengikuti bawaan server (SINTA) sampai rinciannya terbaca.
 */
function sourceOf(summary: ReviewCaseRecord, payload?: Payload) {
  if (summary.candidateType === "import_row") return "spreadsheet" as const;
  if (summary.candidateType === "rag_extraction_candidate") {
    return "document" as const;
  }
  const source = text(payload?.source).toLowerCase();
  if (source === "manual") return "manual" as const;
  if (source === "spreadsheet_import") return "spreadsheet" as const;
  if (source === "google_scholar" || source === "scholar") {
    return "scholar" as const;
  }
  return "sinta" as const;
}

/**
 * Jenis rekam pengajuan manual. Formulir pengajuan dan antrean memakai
 * definisi yang sama, sehingga nama jenis, kelompok evaluasi, dan label isian
 * yang dilihat pemeriksa sama dengan yang diisi pengaju.
 */
function manualRecordType(payload?: Payload) {
  const domain = text(payload?.domain);
  if (!Object.hasOwn(manualSubmissionDefinitions, domain)) return undefined;
  const definition =
    manualSubmissionDefinitions[domain as ManualSubmissionDomain];
  const subtype = manualSubtype(
    domain as ManualSubmissionDomain,
    text(payload?.record_type ?? payload?.work_type),
  );
  return subtype ? { definition, subtype } : undefined;
}

/** Isian pengajuan yang sudah tampil lewat bidang kandidat bersama. */
const manualFieldAliases: Record<string, string> = {
  activityYear: "year",
  creators: "authors",
  identifier: "doi",
  publicationYear: "year",
  registrationYear: "year",
};

/** Isian khusus jenis rekam yang tidak punya bidang kandidat bersama. */
function manualDetailFields(
  payload: Payload,
  shownFieldIds: ReadonlySet<string>,
): AuditReviewField[] {
  const manual = manualRecordType(payload);
  if (!manual) return [];
  return manual.subtype.fields.flatMap((field) => {
    const value = text(payload[field.key]);
    if (
      !value ||
      shownFieldIds.has(field.key) ||
      shownFieldIds.has(manualFieldAliases[field.key] ?? "")
    ) {
      return [];
    }
    return [
      {
        id: field.key,
        label: field.label,
        value:
          field.choices?.find((choice) => choice.value === value)?.label ??
          value,
      },
    ];
  });
}

/** Pihak utama pengajuan manual, mengikuti isian utama jenis rekamnya. */
function manualPrimaryPerson(payload: Payload) {
  const manual = manualRecordType(payload);
  const key =
    manual?.subtype.primaryFieldKey ?? manual?.definition.primaryFieldKey;
  return key && key !== "title" ? people(payload[key])[0] : undefined;
}

function categoryOf(target: string, payload?: Payload): AuditReviewCategory {
  const manual = manualRecordType(payload);
  if (manual) return manual.subtype.category ?? manual.definition.category;
  if (target === "publication") return "publication_conference";
  const domain = text(payload?.domain);
  const workType = text(payload?.work_type ?? payload?.record_type);
  if (domain === "academic") return "academic_hr";
  if (
    domain === "intellectual-property" ||
    workType === "intellectual_property"
  )
    return "innovation_ip";
  if (domain === "contract" || workType === "research") {
    return "research_business";
  }
  if (workType === "community_service") return "community_service";
  return "activity_governance";
}

function typeLabelOf(target: string, payload?: Payload) {
  const workType = text(payload?.record_type ?? payload?.work_type);
  return (
    manualRecordType(payload)?.subtype.typeLabel ??
    workTypeLabels[workType] ??
    (target === "publication" ? "Publikasi" : "Kegiatan")
  );
}

function evidenceOf(
  payload: Payload,
  sourceLabel: string,
): AuditReviewEvidence[] {
  const evidence: AuditReviewEvidence[] = [];
  const evidenceUrl = text(payload.evidence_url);
  if (evidenceUrl) {
    evidence.push({
      href: webUrl(evidenceUrl),
      id: "evidence-url",
      label: "Tautan bukti pengaju",
      reference: evidenceUrl,
      sourceLabel,
    });
  }
  const sourceUrl = text(payload.source_url);
  if (sourceUrl) {
    evidence.push({
      href: webUrl(sourceUrl),
      id: "source-url",
      label: "Halaman sumber",
      reference: sourceUrl,
      sourceLabel,
    });
  }
  const doi = text(payload.doi);
  if (doi) {
    evidence.push({
      href: webUrl(
        `https://doi.org/${doi.replace(/^https?:\/\/(?:dx\.)?doi\.org\//i, "")}`,
      ),
      id: "doi",
      label: "DOI",
      reference: doi,
      sourceLabel,
    });
  }
  return evidence;
}

function signalOf(
  detail: ReviewCaseDetail | undefined,
  evidence: readonly AuditReviewEvidence[],
): AuditReviewSignal {
  if (!detail) {
    return {
      primary: "Rincian belum dimuat",
      secondary: "Sinyal tampil setelah rincian terbaca",
      tone: "neutral",
    };
  }
  if (detail.duplicateOfPublicId) {
    return {
      primary: "Kemungkinan duplikat",
      secondary: "Kandidat serupa sudah ada di antrean",
      tone: "danger",
    };
  }
  const doi = text(detail.payload.doi);
  if (doi) return { primary: "DOI tercatat", secondary: doi, tone: "info" };
  if (evidence.length === 0) {
    return {
      primary: "Bukti belum dilampirkan",
      secondary: "Periksa sumber sebelum memutuskan",
      tone: "waiting",
    };
  }
  return {
    primary: "Tautan bukti tercatat",
    secondary: "Periksa isi bukti sebelum memutuskan",
    tone: "neutral",
  };
}

function sortedByTime<T>(items: readonly T[], time: (item: T) => string) {
  return items.toSorted((first, second) =>
    compareTimestamps(time(first), time(second)),
  );
}

/** Nilai sebelum dan sesudah seluruh penyuntingan kandidat. */
function correctionOf(detail: ReviewCaseDetail): AuditCorrection | undefined {
  const edits = sortedByTime(detail.edits, (edit) => edit.editedAt);
  if (edits.length === 0) return undefined;
  const fieldIds = Array.from(
    new Set(edits.flatMap((edit) => edit.changedFields)),
  );
  return {
    after: Object.fromEntries(
      fieldIds.map((fieldId) => [fieldId, text(detail.payload[fieldId])]),
    ),
    before: Object.fromEntries(
      fieldIds.map((fieldId) => {
        const firstEdit = edits.find((edit) =>
          edit.changedFields.includes(fieldId),
        );
        return [fieldId, text(firstEdit?.previousValueJson[fieldId])];
      }),
    ),
    evidenceNote: "",
    fieldIds,
    version: edits.length + 1,
  };
}

function matchesOf(
  comparison: ReviewComparison | undefined,
): AuditOfficialMatch[] {
  if (!comparison) return [];
  const candidateTitle = comparison.candidate.title.trim();
  const candidateDoi = comparison.candidate.identifier?.trim() ?? "";
  const compare = (candidateValue: string, officialValue: string) => {
    if (!candidateValue) {
      return { status: "missing" as const, statusLabel: "Belum tersedia" };
    }
    return candidateValue.toLocaleLowerCase("id-ID") ===
      officialValue.toLocaleLowerCase("id-ID")
      ? { status: "same" as const, statusLabel: "Sama" }
      : { status: "different" as const, statusLabel: "Berbeda" };
  };

  return comparison.matches.map((match) => {
    const sameIdentifier = match.matchFields.includes("doi");
    const officialDoi = match.identifier?.trim() ?? "";
    return {
      comparisons: [
        {
          candidateValue: candidateTitle,
          fieldId: "title",
          label: "Judul",
          officialValue: match.title,
          ...compare(candidateTitle, match.title),
        },
        {
          candidateValue: candidateDoi,
          fieldId: "doi",
          label: "DOI",
          officialValue: officialDoi || "Belum tercatat",
          ...compare(candidateDoi, officialDoi),
        },
      ],
      id: match.publicId,
      score: Math.round(match.similarity * 100),
      title: match.title,
      verdict: sameIdentifier
        ? ("same_identifier" as const)
        : ("strong" as const),
      verdictLabel: sameIdentifier ? "DOI identik" : "Judul identik",
    };
  });
}

type RecordContext = {
  actorLabel: (publicId: string) => string;
  comparison?: ReviewComparison;
  promotion?: ReviewPromotionResult;
};

function promotionNote(promotion: ReviewPromotionResult | undefined) {
  if (promotion === undefined) {
    return "Keputusan tercatat pada riwayat tinjauan. Rekam resmi yang terbentuk dapat diperiksa pada halaman Publikasi atau Kegiatan & Pengabdian.";
  }
  if (promotion === null) {
    return "Keputusan tercatat, tetapi Data Resmi belum terbentuk karena metadata kandidat belum memenuhi syarat promosi.";
  }
  return promotion.created
    ? "Kandidat menjadi rekam resmi baru pada Data Resmi."
    : "Kandidat ditautkan ke rekam resmi yang sudah ada tanpa membuat duplikat.";
}

export function reviewRecordFromServer(
  summary: ReviewCaseRecord,
  detail: ReviewCaseDetail | undefined,
  context: RecordContext,
): AuditReviewRecord {
  const payload = detail?.payload ?? {};
  const target = summary.targetEntityType;
  const source = sourceOf(summary, detail?.payload);
  const sourceLabel = sourceLabels[source];
  const category = categoryOf(target, detail?.payload);
  const specs = target === "publication" ? publicationFields : activityFields;
  const sharedFields: AuditReviewField[] = specs.map((spec) => ({
    ...spec,
    value: text(
      spec.id === "title" ? (payload.title ?? payload.name) : payload[spec.id],
    ),
  }));
  const fields = [
    ...sharedFields,
    ...manualDetailFields(
      payload,
      new Set(sharedFields.map((field) => field.id)),
    ),
  ];
  const status = statusFromServer[detail?.status ?? summary.status];
  const title =
    fields.find((field) => field.id === "title")?.value ||
    (detail ? "Kandidat tanpa judul" : "Memuat rincian kandidat");
  const authors = people(payload.authors);
  const owner =
    text(payload.owner_name) ||
    authors[0] ||
    manualPrimaryPerson(payload) ||
    "Belum tercatat";
  const evidence = evidenceOf(payload, sourceLabel);
  const edits = sortedByTime(detail?.edits ?? [], (edit) => edit.editedAt);
  const decisions = sortedByTime(
    detail?.decisions ?? [],
    (decision) => decision.decidedAt,
  );
  const versionAt = (instant: string) =>
    1 +
    edits.filter((edit) => compareTimestamps(edit.editedAt, instant) <= 0)
      .length;
  const history: AuditReviewHistory[] = sortedByTime(
    [
      {
        actor: sourceSubmitters[source],
        id: `${summary.publicId}-submitted`,
        kind: "submitted" as const,
        label: "Kandidat masuk ke antrean",
        occurredAt: summary.createdAt,
        version: 1,
      },
      ...edits.map((edit, index) => ({
        actor: context.actorLabel(edit.editedByPublicId),
        actorId: edit.editedByPublicId,
        changes: edit.changedFields.map((fieldId) => ({
          after: text(edit.nextValueJson[fieldId]),
          before: text(edit.previousValueJson[fieldId]),
          fieldId,
        })),
        id: edit.publicId,
        kind: "correction_submitted" as const,
        label: `Kandidat versi ${index + 2} disimpan`,
        occurredAt: edit.editedAt,
        version: index + 2,
      })),
      ...decisions.map((decision) => ({
        actor: context.actorLabel(decision.decidedByPublicId),
        actorId: decision.decidedByPublicId,
        decisionKind: decisionKinds[decision.decision],
        id: decision.publicId,
        kind: "decision" as const,
        label: decisionLabels[decision.decision],
        note: decision.reason ?? undefined,
        occurredAt: decision.decidedAt,
        version: versionAt(decision.decidedAt),
      })),
    ],
    (entry) => entry.occurredAt,
  );
  const finalDecision =
    status === "completed"
      ? decisions.findLast(
          (decision) =>
            decision.decision ===
            (detail?.status === "rejected" ? "reject" : "approve"),
        )
      : undefined;
  const decision: AuditReviewDecision | undefined = finalDecision
    ? {
        actor: context.actorLabel(finalDecision.decidedByPublicId),
        actorId: finalDecision.decidedByPublicId,
        appliedNote:
          finalDecision.decision === "approve"
            ? promotionNote(context.promotion)
            : undefined,
        kind: decisionKinds[finalDecision.decision],
        label: decisionLabels[finalDecision.decision],
        note: finalDecision.reason ?? "",
        occurredAt: finalDecision.decidedAt,
        targetRecordId: context.promotion?.targetEntityPublicId,
      }
    : undefined;
  const revisionRequest =
    status === "needs_fix"
      ? decisions.findLast((entry) => entry.decision === "request_revision")
      : undefined;
  const version = edits.length + 1;
  const subtitle = [
    authors.length > 1 ? `${authors[0]} dkk.` : authors[0],
    text(payload.venue),
    text(payload.year),
  ]
    .filter(Boolean)
    .join(" · ");

  return {
    candidateKind: "new_record",
    category,
    categoryLabel: categoryLabels[category],
    decision,
    discoveredAt: summary.createdAt,
    discoveredAtLabel: formatAuditTimestamp(summary.createdAt),
    evaluationPeriodLabel: text(payload.evaluation_period) || undefined,
    evidence,
    fields,
    fixRequest: revisionRequest
      ? {
          fieldIds: fields
            .filter((field) => field.input)
            .map((field) => field.id),
          reason: revisionRequest.reason ?? "Perbaikan diminta tanpa catatan.",
        }
      : undefined,
    history,
    id: summary.publicId,
    kpiLinks: [],
    matches: matchesOf(context.comparison),
    matchingStatus: context.comparison ? "current" : "pending",
    matchingVersion: version,
    owner,
    primaryPerson: owner,
    provenance: {
      sourceKey:
        text(payload.external_id) || text(payload.receipt_number) || undefined,
    },
    signal: signalOf(detail, evidence),
    source,
    sourceLabel,
    status,
    statusLabel: statusLabels[status],
    submittedBy: sourceSubmitters[source],
    subtitle: detail
      ? subtitle || sourceLabel
      : "Rincian kandidat sedang dimuat",
    title,
    typeLabel: typeLabelOf(target, detail?.payload),
    version,
  };
}

function runtimeFromServer(
  record: AuditReviewRecord,
  detail: ReviewCaseDetail | undefined,
  actorLabel: RecordContext["actorLabel"],
): AuditRuntimeState {
  const latestEdit = detail
    ? sortedByTime(detail.edits, (edit) => edit.editedAt).at(-1)
    : undefined;
  return {
    ...initialAuditRuntimeState(record),
    correction: detail ? correctionOf(detail) : undefined,
    latestSubmittedBy: latestEdit
      ? actorLabel(latestEdit.editedByPublicId)
      : record.submittedBy,
    latestSubmittedByActorId: latestEdit?.editedByPublicId,
  };
}

/**
 * Kemampuan pada satu kasus. Server menolak keputusan dari pembuat pekerjaan
 * pengumpulan dan menolak keputusan kedua dari akun yang sama; keduanya
 * dijelaskan dari jawaban server karena daftar kasus belum menyebut pembuatnya.
 */
export function serverReviewCapabilities(
  capabilities: NexusReviewCapabilities,
  state: AuditRuntimeState,
): NexusRecordCapabilities {
  const canReview = capabilities.canReview && state.status === "waiting";
  return {
    canApprove: canReview,
    canReject: canReview,
    canRequestChanges: canReview,
    canReview,
    canSubmitCorrection:
      capabilities.canSubmitCorrection && state.status === "needs_fix",
    reviewBlockReason: capabilities.canReview ? undefined : "not_authorized",
    selfReview: false,
  };
}

/**
 * Keputusan server untuk pilihan reviewer. Menghubungkan ke rekam resmi hanya
 * didukung bila DOI identik, karena persetujuan server menautkan kandidat ke
 * rekam ber-DOI sama; pilihan lain belum tersedia.
 */
export function serverDecisionFor(
  kind: AuditDecisionKind,
  target?: AuditOfficialMatch,
): ReviewDecisionKind | undefined {
  if (kind === "approved_new") return "approve";
  if (kind === "merged") {
    return target?.verdict === "same_identifier" ? "approve" : undefined;
  }
  if (kind === "changes_requested") return "request_revision";
  if (kind === "rejected") return "reject";
  return undefined;
}

/** Alasan permintaan perbaikan beserta bidang yang dipilih reviewer. */
export function revisionReason(note: string, fieldLabels: readonly string[]) {
  return fieldLabels.length > 0
    ? `${note}\n\nBidang yang perlu diperbaiki: ${fieldLabels.join(", ")}.`
    : note;
}

/**
 * Perubahan bidang untuk server. Jenis nilai asal dipertahankan: daftar tetap
 * daftar (dipisah titik koma) dan angka tetap angka.
 */
export function candidateFieldChanges(
  payload: Payload,
  record: AuditReviewRecord,
  values: Record<string, string>,
): Record<string, unknown> {
  const changes: Record<string, unknown> = {};
  for (const field of record.fields) {
    if (!field.input || values[field.id] === undefined) continue;
    const next = values[field.id].trim();
    if (next === field.value) continue;
    const original = payload[field.id];
    if (Array.isArray(original)) {
      changes[field.id] = people(next);
    } else if (field.input.type === "number" || typeof original === "number") {
      const number = Number(next);
      changes[field.id] =
        next === "" ? null : Number.isFinite(number) ? number : next;
    } else {
      changes[field.id] = next === "" ? null : next;
    }
  }
  return changes;
}

function reviewActionError(error: unknown, action: "correction" | "decision") {
  if (error instanceof ApiRequestError) {
    if (error.status === 403 && /milik sendiri/i.test(error.message)) {
      return action === "decision"
        ? "Kandidat ini berasal dari pekerjaan yang Anda ajukan sendiri. Keputusan perlu ditetapkan pemeriksa lain yang berwenang."
        : "Kandidat ini berasal dari pekerjaan yang Anda ajukan sendiri. Perbaikan perlu dilakukan pengelola data lain yang berwenang.";
    }
    if (
      error.status === 409 &&
      /sudah memberikan keputusan/i.test(error.message)
    ) {
      return "Anda sudah memberikan keputusan untuk kandidat ini. Keputusan berikutnya perlu ditetapkan pemeriksa lain yang berwenang.";
    }
    if (error.status === 409 || error.status === 404) {
      return "Status kandidat sudah berubah sejak rincian dibuka. Rincian dimuat ulang dengan keadaan terbaru.";
    }
  }
  return apiErrorMessage(
    error,
    action === "decision"
      ? "Keputusan belum dapat disimpan. Coba lagi."
      : "Perbaikan belum dapat disimpan. Coba lagi.",
  );
}

/** Antrean Tinjauan dari server, termasuk rincian, pembanding, dan tindakan. */
export function useNexusReviewQueue(viewer: NexusReviewActor) {
  const [summaries, setSummaries] = useState<ReviewCaseRecord[]>([]);
  const [queueState, setQueueState] = useState<LoadState>("loading");
  const [queueError, setQueueError] = useState<string>();
  const [loadedAt, setLoadedAt] = useState<Date>();
  const [details, setDetails] = useState<Record<string, DetailEntry>>({});
  const [comparisons, setComparisons] = useState<
    Record<string, ComparisonEntry>
  >({});
  const [promotions, setPromotions] = useState<
    Record<string, ReviewPromotionResult>
  >({});
  const generation = useRef(0);
  const requestedDetails = useRef(new Set<string>());
  const requestedComparisons = useRef(new Set<string>());

  const loadDetails = useCallback(
    async (ids: readonly string[], forGeneration: number) => {
      const pending = ids.filter((id) => !requestedDetails.current.has(id));
      if (pending.length === 0) return;
      for (const id of pending) requestedDetails.current.add(id);
      setDetails((current) => ({
        ...current,
        ...Object.fromEntries(
          pending.map((id) => [
            id,
            { ...current[id], state: "loading" as const },
          ]),
        ),
      }));
      let cursor = 0;
      const worker = async () => {
        while (cursor < pending.length) {
          const id = pending[cursor];
          cursor += 1;
          try {
            const detail = await getReviewCase(id);
            if (forGeneration !== generation.current) return;
            setDetails((current) => ({
              ...current,
              [id]: { detail, state: "ready" },
            }));
          } catch (error) {
            if (forGeneration !== generation.current) return;
            requestedDetails.current.delete(id);
            setDetails((current) => ({
              ...current,
              [id]: {
                ...current[id],
                errorMessage: apiErrorMessage(
                  error,
                  "Rincian kandidat belum dapat dimuat.",
                ),
                state: "error",
              },
            }));
          }
        }
      };
      await Promise.all(
        Array.from(
          { length: Math.min(DETAIL_CONCURRENCY, pending.length) },
          worker,
        ),
      );
    },
    [],
  );

  const load = useCallback(() => {
    const current = ++generation.current;
    requestedDetails.current = new Set();
    requestedComparisons.current = new Set();
    // Cache dikosongkan saat mulai, bukan saat daftar tiba, supaya rincian
    // yang diminta sementara daftar dimuat tidak ikut terhapus.
    setDetails({});
    setComparisons({});
    setQueueState("loading");
    setQueueError(undefined);
    Promise.all(reviewStatuses.map((status) => listAllReviewCases(status)))
      .then(async (lists) => {
        if (current !== generation.current) return;
        const cases = lists
          .flat()
          .toSorted((first, second) =>
            compareTimestamps(first.createdAt, second.createdAt, "descending"),
          );
        setSummaries(cases);
        await loadDetails(
          cases
            .slice(0, DETAIL_PREFETCH_LIMIT)
            .map((reviewCase) => reviewCase.publicId),
          current,
        );
        if (current !== generation.current) return;
        setLoadedAt(new Date());
        setQueueState("ready");
      })
      .catch((error: unknown) => {
        if (current !== generation.current) return;
        setQueueError(
          apiErrorMessage(error, "Antrean tinjauan belum dapat dimuat."),
        );
        setQueueState("error");
      });
  }, [loadDetails]);

  useLoadEffect(load);

  const ensureDetails = useCallback(
    (ids: readonly string[]) => {
      void loadDetails(ids, generation.current);
    },
    [loadDetails],
  );

  const loadComparison = useCallback((id: string, force = false) => {
    if (!force && requestedComparisons.current.has(id)) return;
    requestedComparisons.current.add(id);
    const forGeneration = generation.current;
    setComparisons((current) => ({
      ...current,
      [id]: { ...current[id], state: "loading" },
    }));
    getReviewComparison(id)
      .then((comparison) => {
        if (forGeneration !== generation.current) return;
        setComparisons((current) => ({
          ...current,
          [id]: { comparison, state: "ready" },
        }));
      })
      .catch((error: unknown) => {
        if (forGeneration !== generation.current) return;
        requestedComparisons.current.delete(id);
        setComparisons((current) => ({
          ...current,
          [id]: {
            errorMessage: apiErrorMessage(
              error,
              "Pembanding Data Resmi belum dapat dimuat.",
            ),
            state: "error",
          },
        }));
      });
  }, []);

  const applyDetail = useCallback((id: string, detail: ReviewCaseDetail) => {
    setDetails((current) => ({ ...current, [id]: { detail, state: "ready" } }));
    setSummaries((current) =>
      current.map((reviewCase) =>
        reviewCase.publicId === id
          ? { ...reviewCase, status: detail.status }
          : reviewCase,
      ),
    );
  }, []);

  const refreshCase = useCallback(
    async (id: string) => {
      try {
        applyDetail(id, await getReviewCase(id));
      } catch {
        // Rincian lama tetap tampil; tindakan berikutnya membaca ulang server.
      }
    },
    [applyDetail],
  );

  const decide = useCallback(
    async (
      id: string,
      input: { decision: ReviewDecisionKind; reason: string },
    ): Promise<string | undefined> => {
      try {
        const result = await decideReviewCase(id, input);
        if (input.decision === "approve") {
          setPromotions((current) => ({
            ...current,
            [id]: result.promotion ?? null,
          }));
        }
        await refreshCase(id);
        return undefined;
      } catch (error) {
        const kind = apiErrorKind(error);
        if (kind === "conflict" || kind === "not-found") {
          await refreshCase(id);
        }
        return reviewActionError(error, "decision");
      }
    },
    [refreshCase],
  );

  const actorLabel = useCallback(
    (publicId: string) =>
      publicId === viewer.id
        ? `${viewer.name} · ${viewer.roleLabel}`
        : `Akun lain · ${publicId.slice(0, 8)}`,
    [viewer.id, viewer.name, viewer.roleLabel],
  );

  const records = useMemo(
    () =>
      summaries.map((summary) =>
        reviewRecordFromServer(summary, details[summary.publicId]?.detail, {
          actorLabel,
          comparison: comparisons[summary.publicId]?.comparison,
          promotion: Object.hasOwn(promotions, summary.publicId)
            ? promotions[summary.publicId]
            : undefined,
        }),
      ),
    [actorLabel, comparisons, details, promotions, summaries],
  );

  const runtime = useMemo(
    () =>
      Object.fromEntries(
        records.map((record) => [
          record.id,
          runtimeFromServer(record, details[record.id]?.detail, actorLabel),
        ]),
      ) as Record<string, AuditRuntimeState>,
    [actorLabel, details, records],
  );

  const correct = useCallback(
    async (
      record: AuditReviewRecord,
      values: Record<string, string>,
    ): Promise<string | undefined> => {
      const detail = details[record.id]?.detail;
      if (!detail) return "Rincian kandidat belum dimuat. Coba lagi.";
      const changes = candidateFieldChanges(detail.payload, record, values);
      if (Object.keys(changes).length === 0) {
        return "Belum ada bidang yang berubah.";
      }
      try {
        applyDetail(record.id, await submitReviewEdit(record.id, changes));
        loadComparison(record.id, true);
        return undefined;
      } catch (error) {
        const kind = apiErrorKind(error);
        if (kind === "conflict" || kind === "not-found") {
          await refreshCase(record.id);
        }
        return reviewActionError(error, "correction");
      }
    },
    [applyDetail, details, loadComparison, refreshCase],
  );

  return {
    comparisons,
    correct,
    decide,
    details,
    ensureDetails,
    errorMessage: queueError,
    loadComparison,
    loadedAt,
    records,
    retry: load,
    runtime,
    state: queueState,
  };
}
