import { getNexusRoleDirectory } from "@/components/nexus-access-policy/nexus-access-policy";
import type { NexusAccountStatus } from "@/components/nexus-accounts/nexus-account-directory";
import { personInitials } from "@/components/nexus-workspace-ui/nexus-workspace-format";

/**
 * Satu rantai identitas pengguna yang sedang masuk:
 * sesi layanan → Account → Member opsional → peran → izin efektif.
 *
 * Bentuk ini diturunkan dari `GET /profile/me` milik layanan BHT Nexus dan
 * menjadi satu-satunya sumber identitas pada header, Profil Saya, akses
 * navigasi, dan aktor tindakan. Account dan Member tetap dua entitas terpisah.
 */

type ServerAccountStatus = "active" | "invited" | "suspended";
type ServerMembershipStatus = "active" | "inactive" | "on_leave";

export type NexusServerRoleSummary = {
  category: string | null;
  displayName: Record<string, unknown> | null;
  name: string;
  priority: number;
  publicId: string;
};

export type NexusServerProfile = {
  bio: string | null;
  email: string;
  emailVerified: boolean;
  image: string | null;
  isLinkedMember: boolean;
  member: {
    division: { name: string; publicId: string } | null;
    googleScholarId: string | null;
    isPublic: boolean;
    joinedAt: string;
    name: string;
    publicId: string;
    scopusId: string | null;
    sintaId: string | null;
    status: ServerMembershipStatus;
  } | null;
  name: string;
  permissions: string[];
  phone: string | null;
  publicId: string;
  roles: NexusServerRoleSummary[];
  status: ServerAccountStatus;
};

export type NexusSessionRole = {
  category: string | null;
  /** Pengenal publik peran pada layanan. */
  id: string;
  /** Nama mesin peran, misalnya `auditor`; tidak dipakai sebagai label. */
  key: string;
  label: string;
};

export type NexusSessionCluster = {
  id: string;
  name: string;
};

export type NexusSessionMember = {
  academic: {
    googleScholar?: string;
    scopusAuthorId?: string;
    sintaId?: string;
  };
  /** Klaster riset tempat anggota bernaung; `null` bila belum ditetapkan. */
  cluster: NexusSessionCluster | null;
  id: string;
  joinedAt?: string;
  name: string;
  publicProfile: boolean;
  status: ServerMembershipStatus;
};

export type NexusSessionAccount = {
  bio: string;
  email: string;
  emailVerified: boolean;
  id: string;
  image?: string;
  name: string;
  phone: string;
  status: NexusAccountStatus;
};

export type NexusSession = {
  account: NexusSessionAccount;
  member: NexusSessionMember | null;
  permissions: readonly string[];
  roles: readonly NexusSessionRole[];
};

const accountStatuses: Record<ServerAccountStatus, NexusAccountStatus> = {
  active: "ACTIVE",
  invited: "INVITED",
  suspended: "SUSPENDED",
};

const knownRoleLabels = new Map(
  getNexusRoleDirectory().map((role) => [role.id, role.label]),
);

function humanizeRoleName(name: string) {
  return name
    .split(/[_.\s-]+/)
    .filter(Boolean)
    .map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1)}`)
    .join(" ");
}

/**
 * Label peran: nama tampilan berbahasa Indonesia dari layanan bila ada, lalu
 * kamus label peran sistem ruang kerja, lalu nama mesin yang dirapikan.
 */
export function nexusRoleLabel(
  name: string,
  displayName?: Record<string, unknown> | null,
) {
  const localized = displayName?.id;
  if (typeof localized === "string" && localized.trim()) {
    return localized.trim();
  }
  return knownRoleLabels.get(name) ?? humanizeRoleName(name);
}

export function nexusAccountStatusFromServer(status: string) {
  return accountStatuses[status as ServerAccountStatus] ?? "SUSPENDED";
}

function optionalText(value: string | null | undefined) {
  return value?.trim() ? value.trim() : undefined;
}

export function nexusSessionFromProfile(
  profile: NexusServerProfile,
): NexusSession {
  const member = profile.member;
  return {
    account: {
      bio: profile.bio ?? "",
      email: profile.email,
      emailVerified: profile.emailVerified,
      id: profile.publicId,
      image: optionalText(profile.image),
      name: profile.name,
      phone: profile.phone ?? "",
      status: nexusAccountStatusFromServer(profile.status),
    },
    member: member
      ? {
          academic: {
            googleScholar: optionalText(member.googleScholarId),
            scopusAuthorId: optionalText(member.scopusId),
            sintaId: optionalText(member.sintaId),
          },
          cluster: member.division
            ? { id: member.division.publicId, name: member.division.name }
            : null,
          id: member.publicId,
          joinedAt: optionalText(member.joinedAt),
          name: member.name,
          publicProfile: member.isPublic,
          status: member.status,
        }
      : null,
    permissions: [...profile.permissions],
    roles: profile.roles.map((role) => ({
      category: role.category,
      id: role.publicId,
      key: role.name,
      label: nexusRoleLabel(role.name, role.displayName),
    })),
  };
}

export function nexusSessionHasPermission(
  session: Pick<NexusSession, "permissions">,
  permission: string,
) {
  return session.permissions.includes(permission);
}

export function nexusSessionRoleLabel(session: Pick<NexusSession, "roles">) {
  if (session.roles.length === 0) return "Belum ada peran";
  return session.roles.map((role) => role.label).join(", ");
}

export function nexusSessionInitials(session: Pick<NexusSession, "account">) {
  return personInitials(session.account.name || session.account.email);
}
