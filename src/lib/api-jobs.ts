import { apiFetch, apiFetchPaginated } from "@/lib/api-client";

export type JobStatus =
  | "failed"
  | "failed_permanently"
  | "queued"
  | "retrying"
  | "running"
  | "succeeded";

export type JobRecord = {
  availableAt: string;
  createdAt: string;
  inputKind: string;
  inputValue: string;
  kind: string;
  leaseUntil: string | null;
  normalizedName: string | null;
  progress: number;
  progressMessage: string;
  publicId: string;
  retryCount: number;
  status: JobStatus;
};

export type CreateJobInput = {
  kind?: string;
  name: string;
  scholarUrl: string;
  sintaUrl: string;
};

export function createJob(input: CreateJobInput): Promise<JobRecord> {
  return apiFetch("/jobs", {
    body: JSON.stringify(input),
    method: "POST",
  });
}

export function getJob(publicId: string): Promise<JobRecord> {
  return apiFetch(`/jobs/${encodeURIComponent(publicId)}`);
}

/** Menjadwalkan ulang pekerjaan yang gagal. */
export function retryJob(publicId: string): Promise<JobRecord> {
  return apiFetch(`/jobs/${encodeURIComponent(publicId)}/retry`, {
    method: "POST",
  });
}

export function listJobs(
  params: { limit?: number; page?: number } = {},
): Promise<{ data: JobRecord[]; meta: { total: number } }> {
  const search = new URLSearchParams();
  if (params.limit !== undefined) search.set("limit", String(params.limit));
  if (params.page !== undefined) search.set("page", String(params.page));
  search.set("sortBy", "createdAt");
  search.set("sortOrder", "desc");
  return apiFetchPaginated(`/jobs?${search.toString()}`);
}

export type JobReviewSyncResult = {
  createdCount: number;
  jobPublicId: string;
  reviewCases: Array<{ publicId: string; targetEntityType: string }>;
};

/** Membuat kasus tinjauan untuk kandidat pekerjaan yang belum ditinjau. */
export function syncReviewCasesFromJob(
  publicId: string,
): Promise<JobReviewSyncResult> {
  return apiFetch(
    `/reviews/cases/sync-from-job/${encodeURIComponent(publicId)}`,
    { method: "POST" },
  );
}

export type JobAttemptRecord = {
  completedAt: string | null;
  createdAt: string;
  errorMessage: string | null;
  publicId: string;
  requestUrl: string | null;
  source: string;
  status: string;
};

export function listJobAttempts(
  publicId: string,
): Promise<{ data: JobAttemptRecord[]; meta: { total: number } }> {
  return apiFetchPaginated(
    `/jobs/${encodeURIComponent(publicId)}/attempts?limit=50`,
  );
}
