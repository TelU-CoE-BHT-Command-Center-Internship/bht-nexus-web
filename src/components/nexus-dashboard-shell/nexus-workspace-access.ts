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
