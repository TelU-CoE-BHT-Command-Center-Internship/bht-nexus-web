import { apiFetch, apiFetchPaginated } from "@/lib/api-client";
import type { CompletionProposalItem } from "@/lib/api-publications";

export type ActivityType =
  | "collaboration"
  | "community_service"
  | "internship"
  | "other"
  | "research";

export type ActivityStatus = "cancelled" | "closed" | "ongoing" | "planned";

export type ActivitySummary = {
  amount?: number | null;
  createdAt: string;
  /** Waktu pembaruan terakhir, termasuk pelengkapan dan koreksi. */
  updatedAt?: string;
  isPublic: boolean;
  kmIndicators?: string[];
  metadata?: Record<string, unknown>;
  periodEnd: string | null;
  periodStart: string;
  publicId: string;
  reportedQuarter?: 1 | 2 | 3 | 4 | null;
  status: ActivityStatus;
  title: string;
  type: ActivityType;
};

export type ActivityParticipantEntry = {
  joinedAt: string;
  leftAt: string | null;
  memberPublicId: string | null;
  roleInActivity: string;
};

export type ActivityDetail = ActivitySummary & {
  description: string | null;
  participants: ActivityParticipantEntry[];
};

export type ListActivitiesParams = {
  divisionPublicId?: string;
  isPublic?: boolean;
  limit?: number;
  page?: number;
  search?: string;
  sortBy?: "createdAt" | "periodStart";
  sortOrder?: "asc" | "desc";
  status?: ActivityStatus;
  type?: ActivityType;
};

function buildQuery(params: Record<string, unknown>): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined) {
      search.set(key, String(value));
    }
  }
  const query = search.toString();
  return query === "" ? "" : `?${query}`;
}

export function listActivities(
  params: ListActivitiesParams = {},
): Promise<{ data: ActivitySummary[]; meta: { total: number } }> {
  return apiFetchPaginated(`/activities${buildQuery(params)}`);
}

/** Seluruh kegiatan resmi, dibaca per halaman sebanyak yang diizinkan server. */
export async function listAllActivities(
  params: Pick<ListActivitiesParams, "divisionPublicId"> = {},
): Promise<ActivitySummary[]> {
  const activities: ActivitySummary[] = [];
  for (let page = 1; ; page += 1) {
    const result = await listActivities({
      ...params,
      limit: 100,
      page,
      sortBy: "periodStart",
      sortOrder: "desc",
    });
    activities.push(...result.data);
    if (result.data.length === 0 || activities.length >= result.meta.total) {
      return activities;
    }
  }
}

export function getActivity(publicId: string): Promise<ActivityDetail> {
  return apiFetch(`/activities/${encodeURIComponent(publicId)}`);
}

export function requestActivityCompletion(
  publicId: string,
  body: { note?: string; proposals: Record<string, CompletionProposalItem> },
): Promise<{ reviewCasePublicId: string; status: string }> {
  return apiFetch(
    `/activities/${encodeURIComponent(publicId)}/completion-request`,
    { body: JSON.stringify(body), method: "POST" },
  );
}
