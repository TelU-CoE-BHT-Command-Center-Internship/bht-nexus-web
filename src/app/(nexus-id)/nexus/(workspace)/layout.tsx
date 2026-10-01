import { redirect } from "next/navigation";
import {
  getNexusRoleDirectory,
  getNexusUserPermissionOverrides,
} from "@/components/nexus-access-policy/nexus-access-policy";
import { NexusAccessPolicySessionProvider } from "@/components/nexus-access-policy/nexus-access-policy-session";
import { NexusAccountSessionProvider } from "@/components/nexus-account-session/nexus-account-session";
import { getNexusAccountDirectory } from "@/components/nexus-accounts/nexus-account-directory";
import { NexusDashboardShell } from "@/components/nexus-dashboard-shell/nexus-dashboard-shell";
import { getNexusDashboardShellPreviewContent } from "@/components/nexus-dashboard-shell/nexus-dashboard-shell-content";
import { getNexusWorkspaceAccess } from "@/components/nexus-dashboard-shell/nexus-workspace-session";
import { NexusWorkspaceUnavailable } from "@/components/nexus-dashboard-shell/nexus-workspace-unavailable";
import { NexusMemberSessionProvider } from "@/components/nexus-member-session/nexus-member-session";
import { getNexusMemberDirectory } from "@/components/nexus-members/nexus-members-content";
import { NexusMonitoringSessionProvider } from "@/components/nexus-monitoring/nexus-monitoring-session";
import {
  nexusWorkbookPeriods,
  nexusWorkbookTargetVersions,
} from "@/components/nexus-monitoring/nexus-monitoring-targets";
import { NexusCurrentUserReviewSessionProvider } from "@/components/nexus-review-session/nexus-review-session";
import { NexusWorkerNotice } from "@/components/nexus-workspace-ui/nexus-worker-notice";
import { NexusWorkspaceUnsavedChangesProvider } from "@/components/nexus-workspace-ui/nexus-workspace-unsaved-changes";
import { nexusSignInHref } from "@/lib/api-client";
import { getRequestPath, getServerSession } from "@/lib/api-server";
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

  const access = await getNexusWorkspaceAccess();
  const content = getNexusDashboardShellPreviewContent("id", access);
  content.viewer = deriveDashboardViewer(session.user, session.roles);
  const actor = {
    id: content.viewer.id,
    name: content.viewer.name,
    roleLabel: content.viewer.roleLabel ?? "Pengguna BHT Nexus",
  };
  const accounts = getNexusAccountDirectory();
  const memberDirectory = getNexusMemberDirectory();

  return (
    <NexusMemberSessionProvider initialRecords={memberDirectory}>
      <NexusAccessPolicySessionProvider
        initialOverrides={getNexusUserPermissionOverrides()}
        initialRoles={getNexusRoleDirectory()}
      >
        <NexusAccountSessionProvider actor={actor} initialAccounts={accounts}>
          <NexusCurrentUserReviewSessionProvider
            actor={actor}
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
                <NexusWorkerNotice />
              </NexusWorkspaceUnsavedChangesProvider>
            </NexusMonitoringSessionProvider>
          </NexusCurrentUserReviewSessionProvider>
        </NexusAccountSessionProvider>
      </NexusAccessPolicySessionProvider>
    </NexusMemberSessionProvider>
  );
}
