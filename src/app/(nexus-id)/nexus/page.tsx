import { redirect } from "next/navigation";
import { nexusWorkspaceHomeHref } from "@/components/nexus-dashboard-shell/nexus-dashboard-shell-content";
import { nexusWorkspaceAccessFromPermissions } from "@/components/nexus-dashboard-shell/nexus-workspace-access";
import { NEXUS_SIGN_IN_PATH } from "@/components/nexus-session/nexus-session-routes";
import { resolveNexusSession } from "@/components/nexus-session/nexus-session-server";

/**
 * Pintu masuk ruang kerja: akun bersesi langsung menuju halaman pertama yang
 * diizinkan untuknya, sedangkan pengunjung lain diarahkan ke halaman masuk.
 */
export default async function IndonesianNexusGatewayPage() {
  const resolution = await resolveNexusSession();
  if (resolution.kind !== "AUTHENTICATED") redirect(NEXUS_SIGN_IN_PATH);

  redirect(
    nexusWorkspaceHomeHref(
      nexusWorkspaceAccessFromPermissions(resolution.session.permissions),
    ),
  );
}
