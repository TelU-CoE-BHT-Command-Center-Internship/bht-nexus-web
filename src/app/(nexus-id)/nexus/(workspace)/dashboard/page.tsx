import type { Metadata } from "next";
import { connection } from "next/server";
import { NexusDashboardOverview } from "@/components/nexus-dashboard-overview/nexus-dashboard-overview";
import { getNexusDashboardOverviewContent } from "@/components/nexus-dashboard-overview/nexus-dashboard-overview-content";
import { getServerSession } from "@/lib/api-server";
import { viewerNameFromSession } from "@/lib/session-viewer";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Ruang kerja internal BHT Nexus.",
  robots: {
    follow: false,
    index: false,
  },
};

export default async function NexusDashboardPage() {
  await connection();
  const session = await getServerSession();
  const viewerName = viewerNameFromSession(session?.user);
  const content = getNexusDashboardOverviewContent(viewerName);

  return <NexusDashboardOverview content={content} />;
}
