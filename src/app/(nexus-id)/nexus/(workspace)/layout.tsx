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
import { NexusReviewSessionProvider } from "@/components/nexus-review-session/nexus-review-session";

export default function NexusWorkspaceLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const content = getNexusDashboardShellPreviewContent();
  const accounts = getNexusAccountDirectory();
  const memberDirectory = getNexusMemberDirectory();

  return (
    <NexusReviewSessionProvider
      actor={{
        id: content.viewer.id,
        name: content.viewer.name,
        roleLabel: content.viewer.roleLabel,
      }}
      capabilities={content.reviewCapabilities}
    >
      <NexusMemberSessionProvider initialRecords={memberDirectory}>
        <NexusAccessPolicySessionProvider
          initialOverrides={getNexusUserPermissionOverrides()}
          initialRoles={getNexusRoleDirectory()}
        >
          <NexusAccountSessionProvider
            actorName={content.viewer.name}
            initialAccounts={accounts}
          >
            <NexusDashboardShell content={content}>
              {children}
            </NexusDashboardShell>
          </NexusAccountSessionProvider>
        </NexusAccessPolicySessionProvider>
      </NexusMemberSessionProvider>
    </NexusReviewSessionProvider>
  );
}
