import type { NexusReviewCapabilities } from "@/components/nexus-review-session/nexus-review-session";

export type NexusWorkspaceNavigationId =
  | "academic"
  | "activities"
  | "administration"
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
  memberCapabilities: NexusMemberCapabilities;
  reviewCapabilities: NexusReviewCapabilities;
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
  memberCapabilities: {
    canCreateMember: true,
    canDeactivateMember: true,
    canEditMember: true,
    canGrantAccess: true,
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
