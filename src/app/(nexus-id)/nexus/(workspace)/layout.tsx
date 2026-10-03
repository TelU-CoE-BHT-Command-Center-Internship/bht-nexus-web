import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { NEXUS_CLUSTER_COOKIE } from "@/components/nexus-cluster-scope/nexus-cluster-cookie";
import { NexusClusterScopeProvider } from "@/components/nexus-cluster-scope/nexus-cluster-scope";
import { NexusDashboardShell } from "@/components/nexus-dashboard-shell/nexus-dashboard-shell";
import { getNexusDashboardShellPreviewContent } from "@/components/nexus-dashboard-shell/nexus-dashboard-shell-content";
import { getNexusWorkspaceAccess } from "@/components/nexus-dashboard-shell/nexus-workspace-session";
import { NexusWorkspaceUnavailable } from "@/components/nexus-dashboard-shell/nexus-workspace-unavailable";
import { NexusMonitoringSessionProvider } from "@/components/nexus-monitoring/nexus-monitoring-session";
import { NexusCurrentUserReviewSessionProvider } from "@/components/nexus-review-session/nexus-review-session";
import { NexusWorkerNotice } from "@/components/nexus-workspace-ui/nexus-worker-notice";
import { NexusWorkspaceUnsavedChangesProvider } from "@/components/nexus-workspace-ui/nexus-workspace-unsaved-changes";
import { nexusSignInHref } from "@/lib/api-client";
import type { NexusDivision } from "@/lib/api-divisions";
import {
  getRequestPath,
  getServerData,
  getServerSession,
} from "@/lib/api-server";
import { deriveDashboardViewer } from "@/lib/session-viewer";

export default async function NexusWorkspaceLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getServerSession();
  if (session.kind === "anonymous") {
    redirect(nexusSignInHref(await getRequestPath()));
  }
  if (session.kind === "unavailable" || session.kind === "rate-limited") {
    return (
      <NexusWorkspaceUnavailable
        locale="id"
        reason={session.kind}
        retryHref={(await getRequestPath()) ?? "/nexus"}
      />
    );
  }

  const shouldLoadDivisions =
    session.dataScope?.kind === "all" &&
    session.permissions?.includes("member.read");
  const [access, divisions] = await Promise.all([
    getNexusWorkspaceAccess(),
    shouldLoadDivisions
      ? getServerData<NexusDivision[]>("/divisions")
      : Promise.resolve([]),
  ]);
  const initialDivisionPublicId = (await cookies()).get(
    NEXUS_CLUSTER_COOKIE,
  )?.value;
  const content = getNexusDashboardShellPreviewContent("id", access);
  content.viewer = deriveDashboardViewer(session.user, session.roles);
  const actor = {
    id: content.viewer.id,
    name: content.viewer.name,
    roleLabel: content.viewer.roleLabel ?? "Pengguna BHT Nexus",
  };

  return (
    <NexusClusterScopeProvider
      divisions={divisions ?? []}
      directoryUnavailable={Boolean(shouldLoadDivisions && divisions === null)}
      initialDivisionPublicId={initialDivisionPublicId}
      scope={session.dataScope}
    >
      <NexusCurrentUserReviewSessionProvider
        actor={actor}
        capabilities={content.reviewCapabilities}
      >
        <NexusMonitoringSessionProvider
          canReadTargets={access.allowedNavigationIds.includes("monitoring")}
        >
          <NexusWorkspaceUnsavedChangesProvider>
            <NexusDashboardShell content={content}>
              {children}
            </NexusDashboardShell>
            <NexusWorkerNotice />
          </NexusWorkspaceUnsavedChangesProvider>
        </NexusMonitoringSessionProvider>
      </NexusCurrentUserReviewSessionProvider>
    </NexusClusterScopeProvider>
  );
}
