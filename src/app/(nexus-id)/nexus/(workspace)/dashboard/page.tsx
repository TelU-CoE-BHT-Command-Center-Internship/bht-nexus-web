import type { Metadata } from "next";
import { connection } from "next/server";
import { NexusDashboardOverview } from "@/components/nexus-dashboard-overview/nexus-dashboard-overview";
import { getNexusDashboardOverviewContent } from "@/components/nexus-dashboard-overview/nexus-dashboard-overview-content";
import { loadNexusDashboardLiveContent } from "@/components/nexus-dashboard-overview/nexus-dashboard-overview-server";
import { getServerSession } from "@/lib/api-server";

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
  const viewerName =
    session.kind === "authenticated" ? session.user.name : "Pengguna";
  const live = await loadNexusDashboardLiveContent();
  const content = getNexusDashboardOverviewContent(
    viewerName,
    new Date(),
    live,
  );

  return <NexusDashboardOverview content={content} />;
}
