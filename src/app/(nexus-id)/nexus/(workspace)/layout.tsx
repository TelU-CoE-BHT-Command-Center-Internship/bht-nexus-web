import { redirect } from "next/navigation";
import { NexusDashboardShell } from "@/components/nexus-dashboard-shell/nexus-dashboard-shell";
import { getNexusDashboardShellPreviewContent } from "@/components/nexus-dashboard-shell/nexus-dashboard-shell-content";
import { NexusReviewSessionProvider } from "@/components/nexus-review-session/nexus-review-session";
import { getServerSession } from "@/lib/api-server";
import { deriveDashboardViewer } from "@/lib/session-viewer";

export default async function NexusWorkspaceLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getServerSession();
  if (session === null) {
    redirect("/nexus/masuk");
  }

  const content = getNexusDashboardShellPreviewContent();
  content.viewer = deriveDashboardViewer(session.user, content.viewer);

  return (
    <NexusReviewSessionProvider
      actor={{
        id: content.viewer.id,
        name: content.viewer.name,
        roleLabel: content.viewer.roleLabel ?? "",
      }}
      capabilities={content.reviewCapabilities}
    >
      <NexusDashboardShell content={content}>{children}</NexusDashboardShell>
    </NexusReviewSessionProvider>
  );
}
