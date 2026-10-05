import type { ImageProps } from "next/image";
import type { NexusMemberAvatarPosition } from "@/components/nexus-members/nexus-member-avatar";

export type NexusAccountStatus = "ACTIVE" | "INVITED" | "SUSPENDED";

/**
 * Informasi pribadi yang dimiliki akun sendiri. Dipakai ketika akun tidak
 * terhubung ke profil anggota, sehingga akun non-anggota tetap mempunyai
 * identitas personal tanpa membuat salinan kedua dari profil anggota.
 */
export type NexusAccountPersonalProfile = {
  alternateEmail?: string;
  avatarOriginalSrc?: ImageProps["src"];
  avatarPosition?: NexusMemberAvatarPosition;
  avatarSrc?: ImageProps["src"];
  biography?: string;
  fullName?: string;
  phone?: string;
  preferredName?: string;
};

export type NexusAccountMemberRelationship =
  | { kind: "LINKED"; memberId: string }
  | { kind: "NON_MEMBER" }
  | { kind: "UNLINKED" }
  | {
      conflictingAccountId?: string;
      kind: "CONFLICT";
      memberId?: string;
    };

export type NexusAccountDirectoryRecord = {
  createdAt: string;
  createdBy: string;
  createdByActorId?: string;
  displayName: string;
  email: string;
  id: string;
  invitedAt?: string;
  lastActiveAt?: string;
  lastInvitationAt?: string;
  personalProfile?: NexusAccountPersonalProfile;
  /**
   * `false` ketika informasi pribadi akun tidak ikut terbaca bersama daftar
   * akun, sehingga tidak boleh disimpulkan kosong.
   */
  personalProfileKnown?: boolean;
  relationship: NexusAccountMemberRelationship;
  roleId?: string;
  status: NexusAccountStatus;
  updatedAt: string;
};

export type NexusAccountInvitationInput = {
  displayName: string;
  email: string;
  relationship: NexusAccountMemberRelationship;
  roleId: string;
};

export const nexusAccountStatusLabels: Record<NexusAccountStatus, string> = {
  ACTIVE: "Aktif",
  INVITED: "Menunggu aktivasi",
  SUSPENDED: "Ditangguhkan",
};

export function nexusAccountRelationshipMemberId(
  relationship: NexusAccountMemberRelationship,
) {
  return relationship.kind === "LINKED" || relationship.kind === "CONFLICT"
    ? relationship.memberId
    : undefined;
}

/**
 * Menormalkan konflik yang dapat ditentukan hanya dari direktori akun. Dua
 * akun tidak boleh sama-sama dianggap terhubung secara sah ke satu anggota.
 */
export function resolveNexusAccountRelationship(
  account: NexusAccountDirectoryRecord,
  accounts: readonly NexusAccountDirectoryRecord[],
): NexusAccountMemberRelationship {
  const relationship = account.relationship;
  if (relationship.kind !== "LINKED") return { ...relationship };

  const conflictingAccount = accounts.find(
    (candidate) =>
      candidate.id !== account.id &&
      nexusAccountRelationshipMemberId(candidate.relationship) ===
        relationship.memberId,
  );

  return conflictingAccount
    ? {
        conflictingAccountId: conflictingAccount.id,
        kind: "CONFLICT",
        memberId: relationship.memberId,
      }
    : { ...relationship };
}
