import { ApiRequestError, apiFetch } from "@/lib/api-client";

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

/** Draf isian formulir pengajuan milik pengguna, satu untuk setiap domain. */
export type ManualSubmissionDraft = {
  domain: ManualSubmissionInput["domain"];
  updatedAt: string;
  values: Record<string, string>;
};

export async function getManualSubmissionDraft(
  domain: ManualSubmissionInput["domain"],
): Promise<ManualSubmissionDraft | null> {
  try {
    return await apiFetch<ManualSubmissionDraft>(
      `/submissions/drafts/${domain}`,
    );
  } catch (error) {
    if (error instanceof ApiRequestError && error.status === 404) return null;
    throw error;
  }
}

export function saveManualSubmissionDraft(
  domain: ManualSubmissionInput["domain"],
  values: Record<string, string>,
): Promise<ManualSubmissionDraft> {
  return apiFetch(`/submissions/drafts/${domain}`, {
    body: JSON.stringify({ values }),
    method: "PUT",
  });
}

export async function deleteManualSubmissionDraft(
  domain: ManualSubmissionInput["domain"],
): Promise<void> {
  await apiFetch(`/submissions/drafts/${domain}`, { method: "DELETE" });
}

export function submitManualSubmission(
  input: ManualSubmissionInput,
): Promise<ManualSubmissionReceipt> {
  return apiFetch("/submissions/manual", {
    body: JSON.stringify(input),
    method: "POST",
  });
}
