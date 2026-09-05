import { apiFetch } from "@/lib/api-client";

export type PermissionDenialEntry = {
  count: number;
  permission: string | null;
};

export function listPermissionDenials(
  minutes = 60,
): Promise<{ data: PermissionDenialEntry[]; sinceMinutes: number }> {
  return apiFetch(`/audit/permission-denials?minutes=${minutes}`);
}
