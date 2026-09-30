import { apiFetch, apiFetchPaginated } from "@/lib/api-client";

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
  isPublic: boolean;
  kmIndicators?: string[];
  metadata?: Record<string, unknown>;
  periodEnd: string | null;
  periodStart: string;
  publicId: string;
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
export async function listAllActivities(): Promise<ActivitySummary[]> {
  const activities: ActivitySummary[] = [];
  for (let page = 1; ; page += 1) {
    const result = await listActivities({
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
