import { redirect } from "next/navigation";
import { nexusFirstAccessibleHref } from "@/components/nexus-dashboard-shell/nexus-dashboard-shell-content";
import { getNexusWorkspaceAccess } from "@/components/nexus-dashboard-shell/nexus-workspace-session";
import { NexusWorkspaceUnavailable } from "@/components/nexus-dashboard-shell/nexus-workspace-unavailable";
import { getServerSession } from "@/lib/api-server";

export default async function EnglishNexusGatewayPage() {
  const session = await getServerSession();
  if (session.kind === "anonymous") {
    redirect("/en/nexus/sign-in");
  }
  if (session.kind === "unavailable" || session.kind === "rate-limited") {
    return (
      <NexusWorkspaceUnavailable
        locale="en"
        reason={session.kind}
        retryHref="/en/nexus"
      />
    );
  }
  redirect(nexusFirstAccessibleHref(await getNexusWorkspaceAccess(), "en"));
}
