import { NexusDashboardShell } from "@/components/nexus-dashboard-shell/nexus-dashboard-shell";
import { getNexusDashboardShellPreviewContent } from "@/components/nexus-dashboard-shell/nexus-dashboard-shell-content";
import { NexusCurrentUserReviewSessionProvider } from "@/components/nexus-review-session/nexus-review-session";
import { NexusWorkspaceUnsavedChangesProvider } from "@/components/nexus-workspace-ui/nexus-workspace-unsaved-changes";

export default function EnglishNexusWorkspaceLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const content = getNexusDashboardShellPreviewContent("en");

  return (
    <NexusCurrentUserReviewSessionProvider
      capabilities={content.reviewCapabilities}
    >
      <NexusWorkspaceUnsavedChangesProvider>
        <NexusDashboardShell content={content}>{children}</NexusDashboardShell>
      </NexusWorkspaceUnsavedChangesProvider>
    </NexusCurrentUserReviewSessionProvider>
  );
}
