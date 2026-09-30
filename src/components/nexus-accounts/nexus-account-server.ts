import type { NexusRoleRecord } from "@/components/nexus-access-policy/nexus-access-policy";
import type { NexusAccountDirectoryRecord } from "@/components/nexus-accounts/nexus-account-directory";
import { nexusServerRoleLabel } from "@/components/nexus-dashboard-shell/nexus-workspace-access";
import type { NexusMemberRecord } from "@/components/nexus-members/nexus-members-content";
import { formatAuditTimestamp } from "@/components/nexus-workspace-ui/nexus-workspace-format";
import type { AccountSummary } from "@/lib/api-accounts";

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
    relationship: account.linkedMember
      ? { kind: "LINKED", memberId: account.linkedMember.publicId }
      : { kind: "UNLINKED" },
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
