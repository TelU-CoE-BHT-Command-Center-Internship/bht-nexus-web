import { NexusDashboardShell } from "@/components/nexus-dashboard-shell/nexus-dashboard-shell";
import { getNexusDashboardShellPreviewContent } from "@/components/nexus-dashboard-shell/nexus-dashboard-shell-content";

export default function NexusWorkspaceLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const content = getNexusDashboardShellPreviewContent();

  return (
    <NexusDashboardShell content={content}>{children}</NexusDashboardShell>
  );
}
