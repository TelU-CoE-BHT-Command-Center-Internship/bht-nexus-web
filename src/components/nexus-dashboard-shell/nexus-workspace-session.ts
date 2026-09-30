import { cache } from "react";
import {
  type NexusWorkspaceAccess,
  nexusWorkspaceAccessFromRoles,
  nexusWorkspaceAccessFromSession,
} from "@/components/nexus-dashboard-shell/nexus-workspace-access";
import { getServerSession } from "@/lib/api-server";

/**
 * Akses ruang kerja akun yang sedang masuk, untuk halaman server. Layout dan
 * halaman memakai sesi yang sama dalam satu permintaan.
 */
export const getNexusWorkspaceAccess = cache(
  async (): Promise<NexusWorkspaceAccess> => {
    const session = await getServerSession();
    return session.kind === "authenticated"
      ? nexusWorkspaceAccessFromSession(session.roles, session.permissions)
      : nexusWorkspaceAccessFromRoles([]);
  },
);
