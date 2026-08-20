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
  | "publications"
  | "reviews";

/**
 * Bentuk akses yang dibutuhkan UI, terpisah dari nama permission server.
 * Adapter API kelak menerjemahkan policy server ke kontrak kecil ini.
 */
export type NexusWorkspaceAccess = {
  allowedNavigationIds: readonly NexusWorkspaceNavigationId[];
  reviewCapabilities: NexusReviewCapabilities;
};

export const nexusPreviewWorkspaceAccess = {
  allowedNavigationIds: [
    "dashboard",
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
