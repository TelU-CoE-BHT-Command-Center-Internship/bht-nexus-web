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
  /* Urutan bawaan server: akun terbaru lebih dahulu. */
  const search = new URLSearchParams();
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

/** Akun sebagaimana dijawab server setelah sebuah perubahan. */
export type AccountDetail = Omit<AccountSummary, "createdAt">;

function accountPath(publicId: string, suffix: string) {
  return `/admin/accounts/${encodeURIComponent(publicId)}${suffix}`;
}

/**
 * Membuat akun berstatus menunggu aktivasi. Pemilik akun mengaktifkannya saat
 * masuk pertama kali dengan kode yang dikirim ke emailnya.
 */
export function inviteAccount(input: {
  email: string;
  memberPublicId?: string;
  name: string;
  rolePublicId: string;
}): Promise<AccountDetail> {
  return apiFetch("/admin/accounts/invite", {
    body: JSON.stringify(input),
    method: "POST",
  });
}

/** Menambahkan satu peran pada akun; peran lain yang sudah ada tidak dicabut. */
export function assignAccountRole(
  publicId: string,
  rolePublicId: string,
): Promise<AccountDetail> {
  return apiFetch(accountPath(publicId, "/role"), {
    body: JSON.stringify({ rolePublicId }),
    method: "PATCH",
  });
}

/** Mencabut satu peran dari akun. */
export function revokeAccountRole(
  publicId: string,
  rolePublicId: string,
): Promise<void> {
  return apiFetch(
    `/users/${encodeURIComponent(publicId)}/roles/${encodeURIComponent(rolePublicId)}`,
    { method: "DELETE" },
  );
}

export function updateAccountStatus(
  publicId: string,
  status: "active" | "suspended",
): Promise<AccountDetail> {
  return apiFetch(accountPath(publicId, "/status"), {
    body: JSON.stringify({ status }),
    method: "PATCH",
  });
}

/** Menautkan akun ke satu anggota, atau melepas tautannya dengan `null`. */
export function linkAccountMember(
  publicId: string,
  memberPublicId: string | null,
): Promise<AccountDetail> {
  return apiFetch(accountPath(publicId, "/link-member"), {
    body: JSON.stringify({ memberPublicId }),
    method: "PATCH",
  });
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

export type AccountPermissions = {
  permissions: AccountPermissionEntry[];
  userPublicId: string;
};

/** Seluruh izin pada satu akun beserta penyesuaian khususnya. */
export function getAccountPermissions(
  publicId: string,
): Promise<AccountPermissions> {
  return apiFetch(accountPath(publicId, "/permissions"));
}

/**
 * Menyetel penyesuaian izin khusus akun. `isGranted: null` menghapus
 * penyesuaian sehingga izin itu kembali mengikuti peran.
 */
export function overrideAccountPermissions(
  publicId: string,
  overrides: readonly {
    isGranted: boolean | null;
    permissionPublicId: string;
  }[],
): Promise<AccountPermissions> {
  return apiFetch(accountPath(publicId, "/permissions/override"), {
    body: JSON.stringify({ overrides }),
    method: "PUT",
  });
}
