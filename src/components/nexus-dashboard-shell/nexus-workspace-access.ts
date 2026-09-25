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

/**
 * Kunci izin efektif dari layanan BHT Nexus yang dipakai antarmuka. Setiap
 * modul memakai izin yang dituntut endpoint layanan untuk data modul itu,
 * sehingga navigasi tidak menjanjikan halaman yang datanya kelak ditolak.
 */
export const nexusServerPermissions = {
  activityRead: "activity.read",
  iamManage: "iam.manage",
  jobRead: "job.read",
  memberRead: "member.read",
  publicationRead: "publication.read",
  reviewDecide: "review.decide",
  reviewEdit: "review.edit",
  reviewRead: "review.read",
  roleManage: "role.manage",
  rolePermissionManage: "role_permission.manage",
  userRead: "user.read",
} as const;

/**
 * Modul yang belum mempunyai izin sendiri di layanan dipetakan sementara:
 * Monitoring KM dihitung dari rekam Publikasi dan Kegiatan sehingga menuntut
 * izin membaca keduanya, sedangkan Broadcast mengikuti bawaan yang disepakati
 * (hanya pengelola akun) sampai layanan pengirimannya tersedia. Dashboard
 * sengaja tidak dibuka dari navigasi selama isinya belum matang.
 */
export function nexusWorkspaceAccessFromPermissions(
  permissions: readonly string[],
): NexusWorkspaceAccess {
  const granted = new Set(permissions);
  const has = (permission: string) => granted.has(permission);
  const p = nexusServerPermissions;

  const navigation: Array<[NexusWorkspaceNavigationId, boolean]> = [
    ["monitoring", has(p.publicationRead) && has(p.activityRead)],
    ["broadcast", has(p.iamManage)],
    ["collection", has(p.jobRead)],
    ["documents", has(p.jobRead)],
    ["reviews", has(p.reviewRead)],
    ["publications", has(p.publicationRead)],
    ["intellectual-property", has(p.activityRead)],
    ["contracts", has(p.activityRead)],
    ["academic", has(p.activityRead)],
    ["activities", has(p.activityRead)],
    ["members", has(p.memberRead)],
    ["administration", has(p.userRead)],
  ];

  return {
    administrationCapabilities: {
      canInviteAccount: has(p.iamManage),
      canManageAccess: has(p.iamManage),
      canManageAccountStatus: has(p.iamManage),
      canManageRolePermissions: has(p.rolePermissionManage),
      canManageRoles: has(p.roleManage),
      canManageUserOverrides: has(p.iamManage),
    },
    allowedNavigationIds: navigation
      .filter(([, allowed]) => allowed)
      .map(([id]) => id),
    broadcastCapabilities: {
      canCompose: has(p.iamManage),
    },
    memberCapabilities: {
      canCreateMember: has(p.iamManage),
      canDeactivateMember: has(p.iamManage),
      canEditMember: has(p.iamManage),
      canGrantAccess: has(p.iamManage),
    },
    monitoringCapabilities: {
      canCorrectRecords: has(p.reviewEdit),
      canManageTargets: has(p.reviewDecide),
    },
    reviewCapabilities: {
      canReview: has(p.reviewDecide),
      canSubmitCorrection: has(p.reviewEdit),
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
