import { apiFetch, apiFetchPaginated } from "@/lib/api-client";

export type LocalizedText = { en?: string | null; id: string };

export type PermissionRecord = {
  createdAt: string;
  description: LocalizedText | null;
  name: string;
  origin: "custom" | "system_managed";
  publicId: string;
  updatedAt: string;
};

export function listPermissions(
  params: { limit?: number; page?: number } = {},
): Promise<{ data: PermissionRecord[]; meta: { total: number } }> {
  const search = new URLSearchParams();
  if (params.limit !== undefined) search.set("limit", String(params.limit));
  if (params.page !== undefined) search.set("page", String(params.page));
  return apiFetchPaginated(`/permissions?${search.toString()}`);
}

export function createPermission(input: {
  description?: LocalizedText;
  name: string;
}): Promise<PermissionRecord> {
  return apiFetch("/permissions", {
    body: JSON.stringify(input),
    method: "POST",
  });
}
