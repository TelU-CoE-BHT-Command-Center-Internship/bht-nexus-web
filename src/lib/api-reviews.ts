import { apiFetch, apiFetchPaginated } from "@/lib/api-client";

export type ReviewCandidateType =
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
  /** Isi kandidat; cukup untuk baris antrean tanpa membaca rincian. */
  payload?: Record<string, unknown>;
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
  /** Catatan bukti yang menjadi dasar perbaikan; kosong pada versi lama. */
  reason: string | null;
};

export type ReviewKmResolution = {
  indicators: string[];
  status: "changed" | "confirmed" | "removed" | "undetermined";
};

export type ReviewCaseDecisionEntry = {
  decidedAt: string;
  decidedByPublicId: string;
  decision: ReviewDecisionKind;
  /** Keputusan indikator KM pemeriksa; null pada keputusan tanpa pilihan KM. */
  kmResolution?: ReviewKmResolution | null;
  publicId: string;
  reason: string | null;
};

/** Kesiapan kandidat menjadi rekam resmi beserta saran indikator KM sistem. */
export type ReviewCasePromotionPreview = {
  promotable: boolean;
  reason: string | null;
  systemKmIndicators: string[] | null;
};

export type ReviewCaseDetail = {
  candidateType: ReviewCandidateType;
  decisions: ReviewCaseDecisionEntry[];
  duplicateOfPublicId?: string;
  edits: ReviewCaseEdit[];
  payload: Record<string, unknown>;
  promotion?: ReviewCasePromotionPreview | null;
  publicId: string;
  status: ReviewCaseStatus;
  /** Rekam resmi yang dibentuk, ditautkan, atau dilengkapi kasus ini. */
  targetEntityPublicId?: string | null;
};

export type ReviewPromotionResult = {
  created: boolean;
  targetEntityPublicId: string;
  targetEntityType: string;
} | null;

export type ReviewDecisionResult = {
  decidedAt: string;
  decision: ReviewDecisionKind;
  /** Rekam resmi yang dibentuk atau ditautkan; null bila tidak ada promosi. */
  promotion?: ReviewPromotionResult;
  publicId: string;
  reason: string | null;
  reviewCaseStatus: ReviewCaseStatus;
};

export type ReviewComparisonMatch = {
  identifier: string | null;
  matchFields: string[];
  publicId: string;
  similarity: number;
  targetEntityType: string;
  title: string;
};

export type ReviewComparison = {
  candidate: {
    authors: string[] | null;
    identifier: string | null;
    title: string;
    year: number | null;
  };
  matches: ReviewComparisonMatch[];
  reviewCasePublicId: string;
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

/**
 * Seluruh kasus tinjauan pada satu status, dibaca per halaman. Server
 * memakai status menunggu bila status tidak dikirim, jadi status selalu
 * disebutkan.
 */
export async function listAllReviewCases(
  status: ReviewCaseStatus,
): Promise<ReviewCaseRecord[]> {
  const cases: ReviewCaseRecord[] = [];
  for (let page = 1; ; page += 1) {
    const result = await listReviewCases({ limit: 100, page, status });
    cases.push(...result.data);
    if (result.data.length === 0 || cases.length >= result.meta.total) {
      return cases;
    }
  }
}

export function getReviewCase(publicId: string): Promise<ReviewCaseDetail> {
  return apiFetch(`/reviews/cases/${encodeURIComponent(publicId)}`);
}

/** Rekam resmi yang mirip kandidat, berdasarkan DOI atau judul. */
export function getReviewComparison(
  publicId: string,
): Promise<ReviewComparison> {
  return apiFetch(`/reviews/cases/${encodeURIComponent(publicId)}/comparison`);
}

/**
 * Keputusan pemeriksa. `linkTargetPublicId` menautkan kandidat publikasi ke
 * rekam resmi pilihan pemeriksa alih-alih membuat rekam baru.
 */
export function decideReviewCase(
  publicId: string,
  input: {
    decision: ReviewDecisionKind;
    kmResolution?: ReviewKmResolution;
    linkTargetPublicId?: string;
    reason?: string;
  },
): Promise<ReviewDecisionResult> {
  return apiFetch(`/reviews/cases/${encodeURIComponent(publicId)}/decision`, {
    body: JSON.stringify(input),
    method: "POST",
  });
}

export function submitReviewEdit(
  publicId: string,
  fieldChanges: Record<string, unknown>,
  reason: string,
): Promise<ReviewCaseDetail> {
  return apiFetch(`/reviews/cases/${encodeURIComponent(publicId)}/candidate`, {
    body: JSON.stringify({ fieldChanges, reason }),
    method: "PATCH",
  });
}

export function restoreReviewCandidate(
  publicId: string,
): Promise<ReviewCaseDetail> {
  return apiFetch(`/reviews/cases/${encodeURIComponent(publicId)}/restore`, {
    method: "POST",
  });
}
