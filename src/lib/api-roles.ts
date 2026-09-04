import { apiFetch, apiFetchPaginated } from "@/lib/api-client";
import type { LocalizedText } from "@/lib/api-permissions";

export type RoleCategory =
  | "coe_admin"
  | "coe_eksternal"
  | "coe_internal"
  | "coe_member";

export type RoleRecord = {
  category: RoleCategory | null;
  createdAt: string;
  description: LocalizedText | null;
  displayName: LocalizedText | null;
  name: string;
  priority: number;
  publicId: string;
  type: "custom" | "system";
  updatedAt: string;
};

export type CreateRoleInput = {
  category?: RoleCategory | null;
  description?: LocalizedText;
  displayName?: LocalizedText;
  name: string;
  priority?: number;
};

export type UpdateRoleInput = Partial<CreateRoleInput>;

export function listRoles(
  params: { limit?: number; page?: number } = {},
): Promise<{ data: RoleRecord[]; meta: { total: number } }> {
  const search = new URLSearchParams();
  if (params.limit !== undefined) search.set("limit", String(params.limit));
  if (params.page !== undefined) search.set("page", String(params.page));
  return apiFetchPaginated(`/roles?${search.toString()}`);
}

export function getRole(publicId: string): Promise<RoleRecord> {
  return apiFetch(`/roles/${publicId}`);
}

export function createRole(input: CreateRoleInput): Promise<RoleRecord> {
  return apiFetch("/roles", { body: JSON.stringify(input), method: "POST" });
}

export function updateRole(
  publicId: string,
  input: UpdateRoleInput,
): Promise<RoleRecord> {
  return apiFetch(`/roles/${publicId}`, {
    body: JSON.stringify(input),
    method: "PATCH",
  });
}

export function deleteRole(publicId: string): Promise<void> {
  return apiFetch(`/roles/${publicId}`, { method: "DELETE" });
}

export type PermissionGrantEntry = {
  description: LocalizedText | null;
  granted: boolean;
  name: string;
  permissionPublicId: string;
};

export function listRolePermissionGrants(
  rolePublicId: string,
  params: { limit?: number; page?: number } = {},
): Promise<{ data: PermissionGrantEntry[]; meta: { total: number } }> {
  const search = new URLSearchParams();
  if (params.limit !== undefined) search.set("limit", String(params.limit));
  if (params.page !== undefined) search.set("page", String(params.page));
  return apiFetchPaginated(
    `/roles/${rolePublicId}/permissions?${search.toString()}`,
  );
}

export function grantRolePermission(
  rolePublicId: string,
  permissionPublicId: string,
): Promise<void> {
  return apiFetch(`/roles/${rolePublicId}/permissions`, {
    body: JSON.stringify({ permissionPublicId }),
    method: "POST",
  });
}

export function revokeRolePermission(
  rolePublicId: string,
  permissionPublicId: string,
): Promise<void> {
  return apiFetch(`/roles/${rolePublicId}/permissions/${permissionPublicId}`, {
    method: "DELETE",
  });
}
