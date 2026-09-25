import "server-only";
import {
  type NexusWorkspaceAccess,
  nexusWorkspaceAccessFromPermissions,
} from "@/components/nexus-dashboard-shell/nexus-workspace-access";
import { resolveNexusSession } from "@/components/nexus-session/nexus-session-server";

/**
 * Akses ruang kerja untuk halaman server. Sumbernya izin efektif sesi yang
 * sama dengan navigasi; tanpa sesi yang sah hasilnya tidak membuka apa pun.
 */
export async function getNexusWorkspaceAccess(): Promise<NexusWorkspaceAccess> {
  const resolution = await resolveNexusSession();
  return nexusWorkspaceAccessFromPermissions(
    resolution.kind === "AUTHENTICATED" ? resolution.session.permissions : [],
  );
}
