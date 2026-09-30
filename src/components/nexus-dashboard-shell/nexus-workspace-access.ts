import type { NexusReviewCapabilities } from "@/components/nexus-review-session/nexus-review-session";

export type NexusWorkspaceNavigationId =
  | "academic"
  | "activities"
  | "administration"
  | "broadcast"
  | "collection"
  | "contracts"
  | "dashboard"
  | "documents"
  | "intellectual-property"
  | "members"
  | "monitoring"
  | "publications"
  | "reviews";

/**
 * Bentuk akses yang dibutuhkan UI, terpisah dari nama permission server.
 * Adapter API kelak menerjemahkan policy server ke kontrak kecil ini.
 */
export type NexusWorkspaceAccess = {
  administrationCapabilities: NexusAdministrationCapabilities;
  allowedNavigationIds: readonly NexusWorkspaceNavigationId[];
  broadcastCapabilities: NexusBroadcastCapabilities;
  collectionCapabilities: NexusCollectionCapabilities;
  memberCapabilities: NexusMemberCapabilities;
  monitoringCapabilities: NexusMonitoringCapabilities;
  reviewCapabilities: NexusReviewCapabilities;
};

/**
 * Kemampuan pada Broadcast / Newsletter. Membuka halaman mengikuti izin
 * melihat (`broadcast.view`), sedangkan menyusun dan meninjau pengiriman
 * mengikuti izin mengelola (`broadcast.manage`) yang pada Meeting Minggu 12
 * ditetapkan hanya untuk pengurus.
 */
export type NexusBroadcastCapabilities = {
  canCompose: boolean;
};

/** Kemampuan pada Pengumpulan: melihat riwayat terpisah dari mengajukan pekerjaan baru. */
export type NexusCollectionCapabilities = {
  canCreateJob: boolean;
};

/**
 * Kemampuan pada Monitoring KM. Mengelola periode dan target (`monitoring.manage`)
 * terpisah dari mengoreksi rekam pembentuk realisasi (`monitoring.update`).
 * Mengunduh laporan mengikuti izin melihat Monitoring.
 */
export type NexusMonitoringCapabilities = {
  canCorrectRecords: boolean;
  canManageTargets: boolean;
};

export type NexusAdministrationCapabilities = {
  canInviteAccount: boolean;
  canManageAccess: boolean;
  canManageAccountStatus: boolean;
  canManageRolePermissions: boolean;
  canManageRoles: boolean;
  canManageUserOverrides: boolean;
};

export type NexusMemberCapabilities = {
  canCreateMember: boolean;
  canDeactivateMember: boolean;
  canEditMember: boolean;
  canGrantAccess: boolean;
};

export const nexusPreviewWorkspaceAccess = {
  administrationCapabilities: {
    canInviteAccount: true,
    canManageAccess: true,
    canManageAccountStatus: true,
    canManageRolePermissions: true,
    canManageRoles: true,
    canManageUserOverrides: true,
  },
  allowedNavigationIds: [
    "dashboard",
    "monitoring",
    "broadcast",
    "collection",
    "documents",
    "reviews",
    "publications",
    "intellectual-property",
    "contracts",
    "academic",
    "activities",
    "members",
    "administration",
  ],
  broadcastCapabilities: {
    canCompose: true,
  },
  collectionCapabilities: {
    canCreateJob: true,
  },
  memberCapabilities: {
    canCreateMember: true,
    canDeactivateMember: true,
    canEditMember: true,
    canGrantAccess: true,
  },
  monitoringCapabilities: {
    canCorrectRecords: true,
    canManageTargets: true,
  },
  reviewCapabilities: {
    canReview: true,
    canSubmitCorrection: true,
  },
} satisfies NexusWorkspaceAccess;

/** Nama peran sistem pada server BHT Nexus. */
export type NexusServerRoleName =
  | "admin"
  | "auditor"
  | "cluster_head"
  | "director"
  | "external_partner"
  | "intern"
  | "member"
  | "officer";

type NexusServerPermission =
  | "activity.read"
  | "audit.read"
  | "dashboard.read"
  | "iam.manage"
  | "job.create"
  | "job.read"
  | "kpi.read"
  | "member.read"
  | "permission.manage"
  | "permission.read"
  | "publication.read"
  | "review.decide"
  | "review.edit"
  | "review.read"
  | "role.manage"
  | "role.read"
  | "role_permission.manage"
  | "role_permission.read"
  | "user.read"
  | "user_role.manage"
  | "user_role.read";

/**
 * Cermin izin bawaan setiap peran sistem pada server. Peta ini hanya membentuk
 * navigasi dan tindakan yang ditampilkan; server tetap menolak setiap
 * permintaan yang tidak diizinkan, dan halaman menampilkan keadaan tanpa akses
 * bila izin peran di server berbeda dari bawaan ini.
 */
const serverRolePermissions: Record<
  NexusServerRoleName,
  readonly NexusServerPermission[]
> = {
  admin: [
    "job.create",
    "job.read",
    "review.read",
    "review.edit",
    "review.decide",
    "publication.read",
    "member.read",
    "activity.read",
    "audit.read",
    "kpi.read",
    "dashboard.read",
  ],
  auditor: [
    "iam.manage",
    "user.read",
    "user_role.read",
    "user_role.manage",
    "role.read",
    "role.manage",
    "permission.read",
    "permission.manage",
    "role_permission.read",
    "role_permission.manage",
    "audit.read",
  ],
  cluster_head: [
    "job.read",
    "review.read",
    "review.edit",
    "publication.read",
    "member.read",
    "activity.read",
  ],
  director: [
    "review.read",
    "review.decide",
    "job.read",
    "publication.read",
    "member.read",
    "activity.read",
    "audit.read",
  ],
  external_partner: ["publication.read"],
  intern: ["publication.read"],
  member: ["member.read", "publication.read", "activity.read"],
  officer: [
    "job.create",
    "job.read",
    "review.read",
    "review.edit",
    "publication.read",
    "member.read",
    "activity.read",
  ],
};

const serverRoleLabels: Record<NexusServerRoleName, string> = {
  admin: "Admin",
  auditor: "Auditor",
  cluster_head: "Ketua Klaster",
  director: "Pimpinan",
  external_partner: "Mitra Eksternal",
  intern: "Magang",
  member: "Anggota",
  officer: "Pengurus",
};

/** Broadcast / Newsletter belum punya izin server; Meeting Minggu 12 membatasinya untuk pengurus dan admin. */
const broadcastRoles: readonly NexusServerRoleName[] = ["admin", "officer"];

function isServerRoleName(value: string): value is NexusServerRoleName {
  return Object.hasOwn(serverRolePermissions, value);
}

/** Label peran untuk identitas pengguna; peran di luar katalog sistem ditampilkan apa adanya. */
export function nexusServerRoleLabel(roleName: string): string {
  return isServerRoleName(roleName) ? serverRoleLabels[roleName] : roleName;
}

/**
 * Akses ruang kerja dari peran akun yang sedang masuk. Bila peran belum dapat
 * dibaca dari server, navigasi tetap lengkap dan setiap halaman mengikuti
 * jawaban server (termasuk keadaan tanpa akses).
 */
export function nexusWorkspaceAccessFromRoles(
  roles: readonly string[] | null,
): NexusWorkspaceAccess {
  if (roles === null) return nexusPreviewWorkspaceAccess;

  const knownRoles = roles.filter(isServerRoleName);
  const permissions = new Set(
    knownRoles.flatMap((role) => serverRolePermissions[role]),
  );
  const has = (permission: NexusServerPermission) =>
    permissions.has(permission);
  const canBroadcast = knownRoles.some((role) => broadcastRoles.includes(role));
  const navigation = new Set<NexusWorkspaceNavigationId>();

  if (has("dashboard.read")) navigation.add("dashboard");
  if (has("kpi.read")) navigation.add("monitoring");
  if (canBroadcast) navigation.add("broadcast");
  if (has("job.read")) {
    navigation.add("collection");
    navigation.add("documents");
  }
  if (has("review.read")) navigation.add("reviews");
  if (has("publication.read")) navigation.add("publications");
  if (has("activity.read")) {
    navigation.add("intellectual-property");
    navigation.add("contracts");
    navigation.add("academic");
    navigation.add("activities");
  }
  if (has("member.read")) navigation.add("members");
  if (
    has("user.read") ||
    has("iam.manage") ||
    has("role.read") ||
    has("audit.read")
  ) {
    navigation.add("administration");
  }

  return {
    administrationCapabilities: {
      canInviteAccount: has("iam.manage"),
      canManageAccess: has("iam.manage"),
      canManageAccountStatus: has("iam.manage"),
      canManageRolePermissions: has("role_permission.manage"),
      canManageRoles: has("role.manage"),
      canManageUserOverrides: has("iam.manage"),
    },
    allowedNavigationIds:
      nexusPreviewWorkspaceAccess.allowedNavigationIds.filter((id) =>
        navigation.has(id),
      ),
    broadcastCapabilities: { canCompose: canBroadcast },
    collectionCapabilities: { canCreateJob: has("job.create") },
    memberCapabilities: {
      canCreateMember: has("iam.manage"),
      canDeactivateMember: has("iam.manage"),
      canEditMember: has("iam.manage"),
      canGrantAccess: has("iam.manage"),
    },
    monitoringCapabilities: {
      canCorrectRecords: has("kpi.read"),
      canManageTargets: has("kpi.read"),
    },
    reviewCapabilities: {
      canReview: has("review.decide"),
      canSubmitCorrection: has("review.edit"),
    },
  };
}

export function nexusWorkspaceCanOpen(
  access: NexusWorkspaceAccess,
  navigationId: NexusWorkspaceNavigationId,
) {
  return access.allowedNavigationIds.includes(navigationId);
}

/**
 * Pengelolaan siklus peran dan penyetelan izin peran merupakan kemampuan yang
 * berdiri sendiri. Salah satunya cukup untuk membuka permukaan Peran, sementara
 * setiap tindakan di dalam halaman tetap mengikuti kemampuannya sendiri.
 */
export function nexusCanOpenRoleManagement(
  capabilities: NexusAdministrationCapabilities,
) {
  return capabilities.canManageRoles || capabilities.canManageRolePermissions;
}
