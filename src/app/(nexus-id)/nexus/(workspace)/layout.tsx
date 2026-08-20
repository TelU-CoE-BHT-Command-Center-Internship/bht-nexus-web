import { NexusDashboardShell } from "@/components/nexus-dashboard-shell/nexus-dashboard-shell";
import { getNexusDashboardShellPreviewContent } from "@/components/nexus-dashboard-shell/nexus-dashboard-shell-content";
import { NexusReviewSessionProvider } from "@/components/nexus-review-session/nexus-review-session";

export default function NexusWorkspaceLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const content = getNexusDashboardShellPreviewContent();

  return (
    <NexusReviewSessionProvider
      actor={{
        id: content.viewer.id,
        name: content.viewer.name,
        roleLabel: content.viewer.roleLabel,
      }}
      capabilities={content.reviewCapabilities}
    >
      <NexusDashboardShell content={content}>{children}</NexusDashboardShell>
    </NexusReviewSessionProvider>
  );
}
