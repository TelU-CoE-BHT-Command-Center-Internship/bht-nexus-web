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
  inputKind: string;
  inputValue: string;
  kind?: string;
};

export function createJob(input: CreateJobInput): Promise<JobRecord> {
  return apiFetch("/jobs", {
    body: JSON.stringify(input),
    method: "POST",
  });
}

export function getJob(publicId: string): Promise<JobRecord> {
  return apiFetch(`/jobs/${publicId}`);
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

export function syncReviewCasesFromJob(
  publicId: string,
): Promise<{ createdCount: number }> {
  return apiFetch(`/reviews/cases/sync-from-job/${publicId}`, {
    method: "POST",
  });
}
