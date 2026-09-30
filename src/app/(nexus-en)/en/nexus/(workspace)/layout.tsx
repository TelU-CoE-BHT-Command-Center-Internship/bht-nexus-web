import { redirect } from "next/navigation";
import { NexusDashboardShell } from "@/components/nexus-dashboard-shell/nexus-dashboard-shell";
import { getNexusDashboardShellPreviewContent } from "@/components/nexus-dashboard-shell/nexus-dashboard-shell-content";
import { getNexusWorkspaceAccess } from "@/components/nexus-dashboard-shell/nexus-workspace-session";
import { NexusWorkspaceUnavailable } from "@/components/nexus-dashboard-shell/nexus-workspace-unavailable";
import { NexusCurrentUserReviewSessionProvider } from "@/components/nexus-review-session/nexus-review-session";
import { NexusWorkspaceUnsavedChangesProvider } from "@/components/nexus-workspace-ui/nexus-workspace-unsaved-changes";
import { nexusSignInHref } from "@/lib/api-client";
import { getRequestPath, getServerSession } from "@/lib/api-server";
import { deriveDashboardViewer } from "@/lib/session-viewer";

export default async function EnglishNexusWorkspaceLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const session = await getServerSession();
  const requestPath = await getRequestPath();
  if (session.kind === "anonymous") {
    redirect(nexusSignInHref(requestPath ?? "/en/nexus/collection"));
  }
  if (session.kind === "unavailable" || session.kind === "rate-limited") {
    return (
      <NexusWorkspaceUnavailable
        locale="en"
        reason={session.kind}
        retryHref={requestPath ?? "/en/nexus/collection"}
      />
    );
  }

  const access = await getNexusWorkspaceAccess();
  const content = getNexusDashboardShellPreviewContent("en", access);
  content.viewer = deriveDashboardViewer(session.user, session.roles);

  return (
    <NexusCurrentUserReviewSessionProvider
      actor={{
        id: content.viewer.id,
        name: content.viewer.name,
        roleLabel: content.viewer.roleLabel ?? "BHT Nexus user",
      }}
      capabilities={content.reviewCapabilities}
    >
      <NexusWorkspaceUnsavedChangesProvider>
        <NexusDashboardShell content={content}>{children}</NexusDashboardShell>
      </NexusWorkspaceUnsavedChangesProvider>
    </NexusCurrentUserReviewSessionProvider>
  );
}
