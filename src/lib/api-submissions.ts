import { apiFetch } from "@/lib/api-client";

/** Pengajuan manual sebagaimana diterima server. */
export type ManualSubmissionInput = {
  domain:
    | "academic"
    | "activity"
    | "contract"
    | "intellectual-property"
    | "publication";
  evaluationPeriod?: string;
  evidenceUrl?: string;
  note?: string;
  recordType: string;
  values: Record<string, string>;
};

/** Tanda terima pengajuan yang sudah masuk ke antrean Tinjauan. */
export type ManualSubmissionReceipt = {
  domain: string;
  publicId: string;
  receiptNumber: string;
  recordType: string;
  reviewCasePublicId: string;
  status: string;
  submittedAt: string;
};

export function submitManualSubmission(
  input: ManualSubmissionInput,
): Promise<ManualSubmissionReceipt> {
  return apiFetch("/submissions/manual", {
    body: JSON.stringify(input),
    method: "POST",
  });
}
