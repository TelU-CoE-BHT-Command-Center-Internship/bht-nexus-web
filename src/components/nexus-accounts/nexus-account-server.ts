import type { NexusRoleRecord } from "@/components/nexus-access-policy/nexus-access-policy";
import type { NexusAccountRemote } from "@/components/nexus-account-session/nexus-account-session";
import {
  type NexusAccountDirectoryRecord,
  nexusAccountRelationshipMemberId,
} from "@/components/nexus-accounts/nexus-account-directory";
import { nexusServerRoleLabel } from "@/components/nexus-dashboard-shell/nexus-workspace-access";
import type { NexusMemberRecord } from "@/components/nexus-members/nexus-members-content";
import { formatAuditTimestamp } from "@/components/nexus-workspace-ui/nexus-workspace-format";
import {
  type AccountSummary,
  assignAccountRole,
  inviteAccount,
  linkAccountMember,
  listAllAccounts,
  revokeAccountRole,
  updateAccountStatus,
} from "@/lib/api-accounts";
import { ApiRequestError, apiErrorMessage } from "@/lib/api-client";

/**
 * Satu-satunya penerjemah akun server ke direktori akun halaman Administrasi
 * dan Akses Khusus. Bidang yang tidak ikut dijawab daftar akun ditandai tidak
 * tersedia, tidak pernah dianggap kosong.
 */

const UNAVAILABLE = "Belum tersedia";

const accountStatuses = {
  active: "ACTIVE",
  invited: "INVITED",
  suspended: "SUSPENDED",
} as const;

/** ID peran akun pada halaman; akun berperan ganda memakai satu ID gabungan. */
export function nexusAccountRoleId(account: AccountSummary) {
  return account.roles.length > 0
    ? account.roles.map((role) => role.publicId).join("+")
    : undefined;
}

/** Seluruh peran yang dipegang satu akun pada direktori akun halaman. */
export function nexusAccountRoleIds(account: { roleId?: string }) {
  return account.roleId?.split("+") ?? [];
}

export function nexusAccountFromServer(
  account: AccountSummary,
  membersKnown: boolean,
): NexusAccountDirectoryRecord {
  return {
    createdAt: formatAuditTimestamp(account.createdAt),
    createdBy: UNAVAILABLE,
    displayName: account.name,
    email: account.email,
    id: account.publicId,
    personalProfile: { fullName: account.name },
    /* Rincian profil hanya diketahui untuk akun yang rekam anggotanya terbaca. */
    personalProfileKnown: membersKnown && account.linkedMember !== null,
    /* Server hanya mengenal akun yang tertaut ke anggota atau tidak; akun
       tanpa tautan diperlakukan sebagai akun non-anggota. */
    relationship: account.linkedMember
      ? { kind: "LINKED", memberId: account.linkedMember.publicId }
      : { kind: "NON_MEMBER" },
    roleId: nexusAccountRoleId(account),
    status: accountStatuses[account.status],
    updatedAt: UNAVAILABLE,
  };
}

/**
 * Rekam anggota untuk akun yang terhubung ketika direktori anggota tidak boleh
 * dibaca: pemilik akun dan anggotanya orang yang sama, sehingga namanya dipakai.
 */
export function nexusLinkedMemberFromAccount(
  account: AccountSummary,
): NexusMemberRecord[] {
  if (!account.linkedMember) return [];
  return [
    {
      academic: {},
      affiliation: { institution: "", primaryUnit: "" },
      biography: "",
      coeAssignment: "",
      contact: {},
      expertise: { secondary: [] },
      id: account.linkedMember.publicId,
      identity: { preferredName: account.name },
      membership: { publicProfile: false, status: "active" },
      name: account.name,
    },
  ];
}

/**
 * Peran untuk direktori akun. Katalog peran dipakai bila terbaca; peran yang
 * hanya dikenal dari daftar akun tetap diberi nama. Akun berperan ganda
 * mendapat satu rekam gabungan supaya seluruh perannya tampil.
 */
export function nexusAccountRoles(
  accounts: readonly AccountSummary[],
  catalogue: readonly NexusRoleRecord[] = [],
): NexusRoleRecord[] {
  const roles = new Map(catalogue.map((role) => [role.id, role]));
  for (const account of accounts) {
    for (const role of account.roles) {
      if (roles.has(role.publicId)) continue;
      roles.set(role.publicId, {
        description: "",
        id: role.publicId,
        kind: "SYSTEM",
        label: nexusServerRoleLabel(role.name),
        permissions: [],
        status: "ACTIVE",
      });
    }
    const combinedId = nexusAccountRoleId(account);
    if (account.roles.length < 2 || !combinedId || roles.has(combinedId)) {
      continue;
    }
    const parts = account.roles.flatMap(
      (role) => roles.get(role.publicId) ?? [],
    );
    roles.set(combinedId, {
      combinedRoleIds: account.roles.map((role) => role.publicId),
      description: `Gabungan ${parts.length} peran pada akun ini.`,
      id: combinedId,
      kind: "SYSTEM",
      label: parts.map((role) => role.label).join(", "),
      permissions: [...new Set(parts.flatMap((role) => role.permissions))],
      status: "ACTIVE",
    });
  }
  return [...roles.values()];
}

/**
 * Pesan produk untuk penolakan server pada pengelolaan akun. Server menjawab
 * dengan istilah teknis; halaman menjelaskan apa yang perlu dilakukan.
 */
function accountActionError(error: unknown, fallback: string): Error {
  if (error instanceof ApiRequestError) {
    if (error.status === 409 && /sudah terdaftar/i.test(error.message)) {
      return new Error("Email ini sudah digunakan oleh akun lain.");
    }
    if (/akun sendiri/i.test(error.message)) {
      return new Error(
        "Peran dan status akun Anda sendiri hanya dapat diubah oleh pengelola akses lain.",
      );
    }
    if (error.status === 409 && /terakhir/i.test(error.message)) {
      return new Error(
        "Peran lama belum dicabut karena akun ini pemegang terakhir kewenangan mengelola peran akun. Tetapkan kewenangan itu pada akun lain lebih dahulu.",
      );
    }
    if (error.status === 404 && /member/i.test(error.message)) {
      return new Error(
        "Anggota yang dipilih sudah tidak tersedia. Muat ulang halaman lalu pilih kembali.",
      );
    }
    if (error.status === 404 && /role/i.test(error.message)) {
      return new Error(
        "Peran yang dipilih sudah tidak tersedia. Muat ulang halaman lalu pilih kembali.",
      );
    }
  }
  return new Error(apiErrorMessage(error, fallback));
}

/**
 * Penyimpan direktori akun di server. Mengubah peran berarti mengganti: server
 * hanya menambahkan peran, sehingga peran lama dicabut setelah peran baru
 * berlaku supaya akun tidak pernah tanpa peran di tengah perubahan.
 */
export function nexusAccountRemote(membersKnown: boolean): NexusAccountRemote {
  return {
    createInvitation: async (input) => {
      try {
        const memberPublicId = nexusAccountRelationshipMemberId(
          input.relationship,
        );
        const created = await inviteAccount({
          email: input.email,
          name: input.displayName,
          rolePublicId: input.roleId,
          ...(memberPublicId ? { memberPublicId } : {}),
        });
        return created.publicId;
      } catch (error) {
        throw accountActionError(error, "Undangan belum dapat dibuat.");
      }
    },
    list: async () =>
      (await listAllAccounts()).map((account) =>
        nexusAccountFromServer(account, membersKnown),
      ),
    updateRelationship: async (account, relationship) => {
      try {
        await linkAccountMember(
          account.id,
          nexusAccountRelationshipMemberId(relationship) ?? null,
        );
      } catch (error) {
        throw accountActionError(error, "Hubungan akun belum dapat disimpan.");
      }
    },
    updateRole: async (account, roleId) => {
      const currentRoleIds = nexusAccountRoleIds(account);
      try {
        if (!currentRoleIds.includes(roleId)) {
          await assignAccountRole(account.id, roleId);
        }
        for (const staleRoleId of currentRoleIds) {
          if (staleRoleId !== roleId) {
            await revokeAccountRole(account.id, staleRoleId);
          }
        }
      } catch (error) {
        throw accountActionError(error, "Peran akun belum dapat disimpan.");
      }
    },
    updateStatus: async (account, status) => {
      try {
        await updateAccountStatus(
          account.id,
          status === "SUSPENDED" ? "suspended" : "active",
        );
      } catch (error) {
        throw accountActionError(error, "Status akun belum dapat diubah.");
      }
    },
  };
}
