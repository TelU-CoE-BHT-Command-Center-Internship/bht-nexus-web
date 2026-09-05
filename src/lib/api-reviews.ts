import { apiFetch, apiFetchPaginated } from "@/lib/api-client";

export type ReviewCandidateType =
  | "import_row"
  | "rag_extraction_candidate"
  | "staging_candidate";

export type ReviewCaseStatus =
  | "approved"
  | "needs_revision"
  | "pending"
  | "rejected";

export type ReviewDecisionKind = "approve" | "reject" | "request_revision";

export type ReviewCaseRecord = {
  candidateType: ReviewCandidateType;
  createdAt: string;
  publicId: string;
  status: ReviewCaseStatus;
  targetEntityType: string;
};

export type ReviewCaseEdit = {
  changedFields: string[];
  editedAt: string;
  editedByPublicId: string;
  nextValueJson: Record<string, unknown>;
  previousValueJson: Record<string, unknown>;
  publicId: string;
};

export type ReviewCaseDecisionEntry = {
  decidedAt: string;
  decidedByPublicId: string;
  decision: ReviewDecisionKind;
  publicId: string;
  reason: string | null;
};

export type ReviewCaseDetail = {
  candidateType: ReviewCandidateType;
  decisions: ReviewCaseDecisionEntry[];
  duplicateOfPublicId?: string;
  edits: ReviewCaseEdit[];
  payload: Record<string, unknown>;
  publicId: string;
  status: ReviewCaseStatus;
};

export type ReviewDecisionResult = {
  decidedAt: string;
  decision: ReviewDecisionKind;
  publicId: string;
  reason: string | null;
  reviewCaseStatus: ReviewCaseStatus;
};

export function listReviewCases(
  params: {
    candidateType?: ReviewCandidateType;
    limit?: number;
    page?: number;
    status?: ReviewCaseStatus;
  } = {},
): Promise<{ data: ReviewCaseRecord[]; meta: { total: number } }> {
  const search = new URLSearchParams();
  if (params.limit !== undefined) search.set("limit", String(params.limit));
  if (params.page !== undefined) search.set("page", String(params.page));
  if (params.status !== undefined) search.set("status", params.status);
  if (params.candidateType !== undefined) {
    search.set("candidateType", params.candidateType);
  }
  return apiFetchPaginated(`/reviews/cases?${search.toString()}`);
}

export function getReviewCase(publicId: string): Promise<ReviewCaseDetail> {
  return apiFetch(`/reviews/cases/${publicId}`);
}

export function decideReviewCase(
  publicId: string,
  input: { decision: ReviewDecisionKind; reason?: string },
): Promise<ReviewDecisionResult> {
  return apiFetch(`/reviews/cases/${publicId}/decision`, {
    body: JSON.stringify(input),
    method: "POST",
  });
}

export function submitReviewEdit(
  publicId: string,
  fieldChanges: Record<string, unknown>,
): Promise<ReviewCaseDetail> {
  return apiFetch(`/reviews/cases/${publicId}/candidate`, {
    body: JSON.stringify({ fieldChanges }),
    method: "PATCH",
  });
}

export function restoreReviewCandidate(
  publicId: string,
): Promise<ReviewCaseDetail> {
  return apiFetch(`/reviews/cases/${publicId}/restore`, { method: "POST" });
}
