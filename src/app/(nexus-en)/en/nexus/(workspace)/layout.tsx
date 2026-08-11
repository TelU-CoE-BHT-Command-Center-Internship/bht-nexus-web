import { NexusDashboardShell } from "@/components/nexus-dashboard-shell/nexus-dashboard-shell";
import { getNexusDashboardShellPreviewContent } from "@/components/nexus-dashboard-shell/nexus-dashboard-shell-content";

export default function EnglishNexusWorkspaceLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const content = getNexusDashboardShellPreviewContent("en");

  return (
    <NexusDashboardShell content={content}>{children}</NexusDashboardShell>
  );
}
