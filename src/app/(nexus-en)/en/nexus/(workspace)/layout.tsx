import { redirect } from "next/navigation";
import { NexusDashboardShell } from "@/components/nexus-dashboard-shell/nexus-dashboard-shell";
import {
  getNexusDashboardShellContent,
  nexusDashboardViewerFromSession,
} from "@/components/nexus-dashboard-shell/nexus-dashboard-shell-content";
import { nexusWorkspaceAccessFromPermissions } from "@/components/nexus-dashboard-shell/nexus-workspace-access";
import { NexusSessionProvider } from "@/components/nexus-session/nexus-session-provider";
import { nexusSignInPathForReturn } from "@/components/nexus-session/nexus-session-routes";
import { resolveNexusSession } from "@/components/nexus-session/nexus-session-server";
import { NexusSessionUnavailable } from "@/components/nexus-session/nexus-session-unavailable";
import { NexusWorkspaceUnsavedChangesProvider } from "@/components/nexus-workspace-ui/nexus-workspace-unsaved-changes";

export default async function EnglishNexusWorkspaceLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const resolution = await resolveNexusSession();

  if (resolution.kind === "UNAUTHENTICATED") {
    redirect(nexusSignInPathForReturn(resolution.requestPath, "sesi-berakhir"));
  }
  if (resolution.kind === "UNAVAILABLE") {
    return <NexusSessionUnavailable code={resolution.code} locale="en" />;
  }

  const { session } = resolution;
  const content = getNexusDashboardShellContent({
    access: nexusWorkspaceAccessFromPermissions(session.permissions),
    locale: "en",
    viewer: nexusDashboardViewerFromSession(session),
  });

  return (
    <NexusSessionProvider initialSession={session}>
      <NexusWorkspaceUnsavedChangesProvider>
        <NexusDashboardShell content={content}>{children}</NexusDashboardShell>
      </NexusWorkspaceUnsavedChangesProvider>
    </NexusSessionProvider>
  );
}
