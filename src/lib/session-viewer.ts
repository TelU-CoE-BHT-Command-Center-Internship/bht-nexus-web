import type { DashboardViewer } from "@/components/nexus-dashboard-shell/nexus-dashboard-shell-content";
import { nexusServerRoleLabel } from "@/components/nexus-dashboard-shell/nexus-workspace-access";
import type { NexusSessionUser } from "@/lib/api-server";

function initialsFromName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? (parts[parts.length - 1]?.[0] ?? "") : "";
  return `${first}${last}`.toUpperCase() || "?";
}

/**
 * Identitas header dan pelaku tindakan selalu berasal dari sesi server. Label
 * peran memakai peran pertama akun; akun tanpa peran tidak diberi label.
 */
export function deriveDashboardViewer(
  user: NexusSessionUser,
  roles: readonly string[] | null,
): DashboardViewer {
  const roleName = roles?.[0];

  return {
    avatarSrc: user.image,
    email: user.email,
    fullName: user.name,
    id: user.publicId ?? "current-account",
    initials: initialsFromName(user.name),
    name: user.name,
    roleLabel:
      roleName === undefined ? undefined : nexusServerRoleLabel(roleName),
  };
}
