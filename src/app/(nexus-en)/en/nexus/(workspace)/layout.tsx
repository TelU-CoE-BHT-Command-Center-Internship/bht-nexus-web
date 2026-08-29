import { NexusDashboardShell } from "@/components/nexus-dashboard-shell/nexus-dashboard-shell";
import { getNexusDashboardShellPreviewContent } from "@/components/nexus-dashboard-shell/nexus-dashboard-shell-content";
import { NexusWorkspaceUnsavedChangesProvider } from "@/components/nexus-workspace-ui/nexus-workspace-unsaved-changes";

export default function EnglishNexusWorkspaceLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <NexusWorkspaceUnsavedChangesProvider>
      <NexusDashboardShell content={getNexusDashboardShellPreviewContent("en")}>
        {children}
      </NexusDashboardShell>
    </NexusWorkspaceUnsavedChangesProvider>
  );
}
