import type { AuditReviewRecord } from "@/components/nexus-audit-review/nexus-audit-review-content";
import {
  createManualSubmissionReviewRecord,
  type ManualSubmissionDomain,
  type ManualSubmissionValues,
  manualSubtype,
} from "@/components/nexus-manual-submission/nexus-manual-submission-model";
import type { NexusReviewActor } from "@/components/nexus-review-session/nexus-review-session";
import { formatAuditTimestamp } from "@/components/nexus-workspace-ui/nexus-workspace-format";
import { ApiRequestError } from "@/lib/api-client";
import { submitManualSubmission } from "@/lib/api-submissions";

/**
 * Pengirim pengajuan manual ke server. Isian formulir dikirim apa adanya;
 * server membentuk kandidat dan kasus Tinjauan lalu menjawab tanda terimanya.
 */

/** Jenis data yang pengajuannya diterima server dan masuk ke antrean Tinjauan. */
const serverSubmissionDomains: ReadonlySet<ManualSubmissionDomain> = new Set([
  "academic",
  "activity",
  "contract",
  "intellectual-property",
  "publication",
]);

export function manualSubmissionAvailable(domain: ManualSubmissionDomain) {
  return serverSubmissionDomains.has(domain);
}

/** Bidang yang dikirim pada badan pengajuan, bukan di dalam isian rekam. */
const envelopeKeys = new Set([
  "evaluationPeriod",
  "evidenceUrl",
  "note",
  "recordType",
]);

export type NexusManualSubmissionResult = {
  /** Ringkasan pengajuan untuk halaman tanda terima. */
  record: AuditReviewRecord;
  /** Kasus Tinjauan yang dibentuk dari pengajuan ini. */
  reviewHref: string;
};

export async function submitNexusManualSubmission({
  actor,
  domain,
  values,
}: {
  actor: NexusReviewActor;
  domain: ManualSubmissionDomain;
  values: ManualSubmissionValues;
}): Promise<NexusManualSubmissionResult> {
  const summary = createManualSubmissionReviewRecord({
    actor,
    comparisonCandidates: [],
    domain,
    id: "",
    values,
  });
  const recordValues = Object.fromEntries(
    Object.entries(values).flatMap(([key, value]) => {
      const trimmed = value.trim();
      return envelopeKeys.has(key) || trimmed === "" ? [] : [[key, trimmed]];
    }),
  );
  /* Jenis rekam tanpa isian judul memakai judul tampilan yang sama dengan
     yang terlihat pengaju, supaya kandidatnya dapat dikenali di antrean. */
  if (
    !recordValues.title &&
    manualSubtype(domain, values.recordType)?.titleRequired === false
  ) {
    recordValues.title = summary.title;
  }

  const receipt = await submitManualSubmission({
    domain,
    evaluationPeriod: values.evaluationPeriod.trim(),
    evidenceUrl: summary.evidence[0]?.href,
    note: values.note.trim() || undefined,
    recordType: values.recordType,
    values: recordValues,
  });

  return {
    record: {
      ...summary,
      discoveredAt: receipt.submittedAt,
      discoveredAtLabel: formatAuditTimestamp(receipt.submittedAt),
      id: receipt.receiptNumber,
    },
    reviewHref: `/nexus/tinjauan?record=${encodeURIComponent(receipt.reviewCasePublicId)}`,
  };
}

/** Kesalahan per bidang dari jawaban validasi server, bila ada. */
export function manualSubmissionFieldErrors(
  error: unknown,
): Record<string, string> {
  if (!(error instanceof ApiRequestError)) return {};
  const details = error.errors;
  const fields =
    typeof details === "object" && details !== null && "errors" in details
      ? (details as { errors: unknown }).errors
      : details;
  if (typeof fields !== "object" || fields === null) return {};
  return Object.fromEntries(
    Object.entries(fields).flatMap(([key, message]) =>
      typeof message === "string" ? [[key, message]] : [],
    ),
  );
}
