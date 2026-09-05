import { apiFetch, apiFetchPaginated } from "@/lib/api-client";

export type MembershipStatus = "active" | "inactive" | "on_leave";

export type MemberSummary = {
  googleScholarId: string | null;
  isPublic: boolean;
  joinedAt: string;
  name: string;
  publicId: string;
  scopusId: string | null;
  sintaId: string | null;
  status: MembershipStatus;
};

export type ListMembersParams = {
  isPublic?: boolean;
  limit?: number;
  page?: number;
  search?: string;
  sortBy?: "createdAt" | "joinedAt";
  sortOrder?: "asc" | "desc";
  status?: MembershipStatus;
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

export function listMembers(
  params: ListMembersParams = {},
): Promise<{ data: MemberSummary[]; meta: { total: number } }> {
  return apiFetchPaginated(`/members${buildQuery(params)}`);
}

export function getMember(publicId: string): Promise<MemberSummary> {
  return apiFetch(`/members/${publicId}`);
}
