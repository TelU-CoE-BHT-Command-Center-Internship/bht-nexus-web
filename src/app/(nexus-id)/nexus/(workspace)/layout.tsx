import { redirect } from "next/navigation";
import {
  getNexusRoleDirectory,
  getNexusUserPermissionOverrides,
} from "@/components/nexus-access-policy/nexus-access-policy";
import { NexusAccessPolicySessionProvider } from "@/components/nexus-access-policy/nexus-access-policy-session";
import { NexusAccountSessionProvider } from "@/components/nexus-account-session/nexus-account-session";
import { NexusDashboardShell } from "@/components/nexus-dashboard-shell/nexus-dashboard-shell";
import {
  getNexusDashboardShellContent,
  nexusDashboardViewerFromSession,
} from "@/components/nexus-dashboard-shell/nexus-dashboard-shell-content";
import { nexusWorkspaceAccessFromPermissions } from "@/components/nexus-dashboard-shell/nexus-workspace-access";
import { NexusMemberSessionProvider } from "@/components/nexus-member-session/nexus-member-session";
import { getNexusMemberDirectory } from "@/components/nexus-members/nexus-members-content";
import { NexusMonitoringSessionProvider } from "@/components/nexus-monitoring/nexus-monitoring-session";
import {
  nexusWorkbookPeriods,
  nexusWorkbookTargetVersions,
} from "@/components/nexus-monitoring/nexus-monitoring-targets";
import { NexusCurrentUserReviewSessionProvider } from "@/components/nexus-review-session/nexus-review-session";
import { NexusSessionProvider } from "@/components/nexus-session/nexus-session-provider";
import { nexusSignInPathForReturn } from "@/components/nexus-session/nexus-session-routes";
import { resolveNexusSession } from "@/components/nexus-session/nexus-session-server";
import { NexusSessionUnavailable } from "@/components/nexus-session/nexus-session-unavailable";
import { NexusWorkspaceUnsavedChangesProvider } from "@/components/nexus-workspace-ui/nexus-workspace-unsaved-changes";

export default async function NexusWorkspaceLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const resolution = await resolveNexusSession();

  if (resolution.kind === "UNAUTHENTICATED") {
    redirect(nexusSignInPathForReturn(resolution.requestPath, "sesi-berakhir"));
  }
  if (resolution.kind === "UNAVAILABLE") {
    return <NexusSessionUnavailable code={resolution.code} locale="id" />;
  }

  const { session } = resolution;
  const access = nexusWorkspaceAccessFromPermissions(session.permissions);
  const content = getNexusDashboardShellContent({
    access,
    locale: "id",
    viewer: nexusDashboardViewerFromSession(session),
  });
  const memberDirectory = getNexusMemberDirectory();

  return (
    <NexusSessionProvider initialSession={session}>
      <NexusMemberSessionProvider initialRecords={memberDirectory}>
        <NexusAccessPolicySessionProvider
          initialOverrides={getNexusUserPermissionOverrides()}
          initialRoles={getNexusRoleDirectory()}
        >
          <NexusAccountSessionProvider>
            <NexusCurrentUserReviewSessionProvider
              capabilities={content.reviewCapabilities}
            >
              <NexusMonitoringSessionProvider
                initialPeriods={nexusWorkbookPeriods}
                initialTargetVersions={nexusWorkbookTargetVersions}
              >
                <NexusWorkspaceUnsavedChangesProvider>
                  <NexusDashboardShell content={content}>
                    {children}
                  </NexusDashboardShell>
                </NexusWorkspaceUnsavedChangesProvider>
              </NexusMonitoringSessionProvider>
            </NexusCurrentUserReviewSessionProvider>
          </NexusAccountSessionProvider>
        </NexusAccessPolicySessionProvider>
      </NexusMemberSessionProvider>
    </NexusSessionProvider>
  );
}
