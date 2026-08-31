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

/**
 * Akun yang sedang diwakili ruang kerja. Satu pengenal akun yang stabil dipakai
 * bersama oleh identitas pada header, halaman Profil Saya, dan proyeksi profil
 * di Administrasi, sehingga tidak ada permukaan yang menebak penggunanya
 * sendiri. Sesi masuk yang sebenarnya akan menggantikan pemilihan ini.
 */
export const NEXUS_CURRENT_ACCOUNT_ID = "ACC-BHT-0024";

const accounts: readonly NexusAccountDirectoryRecord[] = [
  {
    createdAt: "12 Mei 2026, 09.18 WIB",
    createdBy: "Administrator Sistem",
    displayName: "Lintang Maheswari",
    email: "lintang.maheswari@example.org",
    id: "ACC-BHT-0014",
    lastActiveAt: "28 Agustus 2026, 08.42 WIB",
    relationship: { kind: "UNLINKED" },
    roleId: "pimpinan",
    status: "ACTIVE",
    updatedAt: "26 Agustus 2026, 14.10 WIB",
  },
  {
    createdAt: "18 Mei 2026, 13.04 WIB",
    createdBy: "Administrator Sistem",
    displayName: "Reza Adiwangsa",
    email: "reza.adiwangsa@example.org",
    id: "ACC-BHT-0019",
    lastActiveAt: "27 Agustus 2026, 17.26 WIB",
    relationship: { kind: "UNLINKED" },
    roleId: "admin",
    status: "ACTIVE",
    updatedAt: "18 Mei 2026, 13.04 WIB",
  },
  {
    createdAt: "22 Agustus 2026, 10.15 WIB",
    createdBy: "Administrator Sistem",
    displayName: "Maya Kirana",
    email: "maya.kirana@example.org",
    id: "ACC-BHT-0033",
    invitedAt: "22 Agustus 2026, 10.15 WIB",
    lastInvitationAt: "26 Agustus 2026, 09.30 WIB",
    relationship: { kind: "NON_MEMBER" },
    roleId: "partner_eksternal",
    status: "INVITED",
    updatedAt: "26 Agustus 2026, 09.30 WIB",
  },
  {
    createdAt: "02 Juni 2026, 08.00 WIB",
    createdBy: "Administrator Sistem",
    displayName: "Dimas Arya Pradana",
    email: "dimas.pradana@example.org",
    id: "ACC-BHT-0024",
    lastActiveAt: "28 Agustus 2026, 07.55 WIB",
    personalProfile: {
      alternateEmail: "dimas.pradana.alt@example.net",
      biography:
        "Operator audit yang membantu pemeriksaan kelengkapan data capaian CoE.",
      fullName: "Dimas Arya Pradana",
      preferredName: "Dimas",
    },
    relationship: { kind: "NON_MEMBER" },
    roleId: "auditor",
    status: "ACTIVE",
    updatedAt: "21 Agustus 2026, 16.20 WIB",
  },
  {
    createdAt: "07 Juni 2026, 11.24 WIB",
    createdBy: "Administrator Sistem",
    displayName: "Galang Saputra",
    email: "galang.saputra@example.org",
    id: "ACC-BHT-0027",
    lastActiveAt: "14 Agustus 2026, 15.08 WIB",
    relationship: { kind: "UNLINKED" },
    roleId: "auditor",
    status: "SUSPENDED",
    updatedAt: "19 Agustus 2026, 09.12 WIB",
  },
  {
    createdAt: "10 Juni 2026, 09.40 WIB",
    createdBy: "Administrator Sistem",
    displayName: "Operator BHT",
    email: "operator.bht@example.org",
    id: "ACC-BHT-0031",
    lastActiveAt: "28 Agustus 2026, 08.05 WIB",
    relationship: { kind: "UNLINKED" },
    roleId: "admin",
    status: "ACTIVE",
    updatedAt: "10 Juni 2026, 09.40 WIB",
  },
  {
    createdAt: "25 Agustus 2026, 14.22 WIB",
    createdBy: "Administrator Sistem",
    displayName: "Alya Prameswari",
    email: "alya.prameswari.long-address@example.org",
    id: "ACC-BHT-0042",
    invitedAt: "25 Agustus 2026, 14.22 WIB",
    lastInvitationAt: "25 Agustus 2026, 14.22 WIB",
    relationship: { kind: "NON_MEMBER" },
    roleId: "partner_eksternal",
    status: "INVITED",
    updatedAt: "25 Agustus 2026, 14.22 WIB",
  },
  {
    createdAt: "15 Juli 2026, 10.30 WIB",
    createdBy: "Administrator Sistem",
    displayName: "Naufal Mahendra Putra",
    email: "naufal.mahendra@example.org",
    id: "ACC-BHT-0038",
    lastActiveAt: "26 Agustus 2026, 12.17 WIB",
    personalProfile: {
      fullName: "Naufal Mahendra Putra",
      preferredName: "Naufal",
    },
    relationship: { kind: "UNLINKED" },
    roleId: "auditor",
    status: "ACTIVE",
    updatedAt: "15 Juli 2026, 10.30 WIB",
  },
  {
    createdAt: "20 Agustus 2026, 08.10 WIB",
    createdBy: "Administrator Sistem",
    displayName: "Rangga Wicaksana",
    email: "rangga.wicaksana@example.org",
    id: "ACC-BHT-0044",
    lastActiveAt: "27 Agustus 2026, 10.02 WIB",
    personalProfile: {
      fullName: "Rangga Wicaksana",
      preferredName: "Rangga",
    },
    relationship: { kind: "CONFLICT" },
    roleId: "anggota",
    status: "ACTIVE",
    updatedAt: "27 Agustus 2026, 10.02 WIB",
  },
];

export function getNexusAccountDirectory() {
  return accounts.map((account) => ({
    ...account,
    ...(account.personalProfile
      ? { personalProfile: { ...account.personalProfile } }
      : {}),
    relationship: { ...account.relationship },
  }));
}
