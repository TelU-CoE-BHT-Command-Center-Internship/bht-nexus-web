import { apiFetch, apiFetchPaginated } from "@/lib/api-client";
import type { ProfileAccountStatus } from "@/lib/api-profile";

/** Ringkasan akun pada daftar Administrasi, sebagaimana dijawab server. */
export type AccountSummary = {
  createdAt: string;
  email: string;
  emailVerified: boolean;
  linkedMember: { publicId: string } | null;
  name: string;
  publicId: string;
  roles: { name: string; publicId: string }[];
  status: ProfileAccountStatus;
};

const MAX_PAGE_SIZE = 100;

export function listAccounts(
  params: { limit?: number; page?: number } = {},
): Promise<{ data: AccountSummary[]; meta: { total: number } }> {
  const search = new URLSearchParams({ sortOrder: "asc" });
  if (params.limit !== undefined) search.set("limit", String(params.limit));
  if (params.page !== undefined) search.set("page", String(params.page));
  return apiFetchPaginated(`/admin/accounts?${search.toString()}`);
}

/**
 * Seluruh akun terdaftar. Direktori akun CoE berukuran kecil, sehingga
 * pencarian dan filter dilakukan di halaman tanpa kehilangan hitungan ringkasan.
 */
export async function listAllAccounts(): Promise<AccountSummary[]> {
  const accounts: AccountSummary[] = [];
  for (let page = 1; ; page += 1) {
    const result = await listAccounts({ limit: MAX_PAGE_SIZE, page });
    accounts.push(...result.data);
    if (result.data.length === 0 || accounts.length >= result.meta.total) {
      return accounts;
    }
  }
}

/**
 * Satu izin pada akun: berasal dari peran (`isInherited`), lalu dapat ditambah
 * atau dibatasi khusus untuk akun itu.
 */
export type AccountPermissionEntry = {
  isEffective: boolean;
  isInherited: boolean;
  name: string;
  overrideStatus: "granted_override" | "inherited" | "revoked_override";
  publicId: string;
  reason: string | null;
};

/** Seluruh izin pada satu akun beserta penyesuaian khususnya. */
export function getAccountPermissions(
  publicId: string,
): Promise<{ permissions: AccountPermissionEntry[]; userPublicId: string }> {
  return apiFetch(
    `/admin/accounts/${encodeURIComponent(publicId)}/permissions`,
  );
}
