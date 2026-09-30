import { redirect } from "next/navigation";
import { nexusFirstAccessibleHref } from "@/components/nexus-dashboard-shell/nexus-dashboard-shell-content";
import { getNexusWorkspaceAccess } from "@/components/nexus-dashboard-shell/nexus-workspace-session";
import { NexusWorkspaceUnavailable } from "@/components/nexus-dashboard-shell/nexus-workspace-unavailable";
import { getServerSession } from "@/lib/api-server";

/**
 * Pintu masuk ruang kerja: pengguna yang sudah masuk diarahkan ke halaman
 * pertama yang boleh ia buka (bukan dashboard), selain itu ke halaman masuk.
 */
export default async function IndonesianNexusGatewayPage() {
  const session = await getServerSession();
  if (session.kind === "anonymous") {
    redirect("/nexus/masuk");
  }
  if (session.kind === "unavailable" || session.kind === "rate-limited") {
    return (
      <NexusWorkspaceUnavailable
        locale="id"
        reason={session.kind}
        retryHref="/nexus"
      />
    );
  }
  redirect(nexusFirstAccessibleHref(await getNexusWorkspaceAccess(), "id"));
}
