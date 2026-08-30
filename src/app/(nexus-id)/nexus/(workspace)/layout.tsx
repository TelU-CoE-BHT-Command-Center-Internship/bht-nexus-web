import {
  getNexusRoleDirectory,
  getNexusUserPermissionOverrides,
} from "@/components/nexus-access-policy/nexus-access-policy";
import { NexusAccessPolicySessionProvider } from "@/components/nexus-access-policy/nexus-access-policy-session";
import { NexusAccountSessionProvider } from "@/components/nexus-account-session/nexus-account-session";
import { getNexusAccountDirectory } from "@/components/nexus-accounts/nexus-account-directory";
import { NexusDashboardShell } from "@/components/nexus-dashboard-shell/nexus-dashboard-shell";
import { getNexusDashboardShellPreviewContent } from "@/components/nexus-dashboard-shell/nexus-dashboard-shell-content";
import { NexusMemberSessionProvider } from "@/components/nexus-member-session/nexus-member-session";
import { getNexusMemberDirectory } from "@/components/nexus-members/nexus-members-content";
import { NexusCurrentUserReviewSessionProvider } from "@/components/nexus-review-session/nexus-review-session";
import { NexusWorkspaceUnsavedChangesProvider } from "@/components/nexus-workspace-ui/nexus-workspace-unsaved-changes";

export default function NexusWorkspaceLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const content = getNexusDashboardShellPreviewContent();
  const accounts = getNexusAccountDirectory();
  const memberDirectory = getNexusMemberDirectory();

  return (
    <NexusMemberSessionProvider initialRecords={memberDirectory}>
      <NexusAccessPolicySessionProvider
        initialOverrides={getNexusUserPermissionOverrides()}
        initialRoles={getNexusRoleDirectory()}
      >
        <NexusAccountSessionProvider initialAccounts={accounts}>
          <NexusCurrentUserReviewSessionProvider
            capabilities={content.reviewCapabilities}
          >
            <NexusWorkspaceUnsavedChangesProvider>
              <NexusDashboardShell content={content}>
                {children}
              </NexusDashboardShell>
            </NexusWorkspaceUnsavedChangesProvider>
          </NexusCurrentUserReviewSessionProvider>
        </NexusAccountSessionProvider>
      </NexusAccessPolicySessionProvider>
    </NexusMemberSessionProvider>
  );
}
