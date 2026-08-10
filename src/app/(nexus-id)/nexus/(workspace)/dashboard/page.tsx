import type { Metadata } from "next";
import { connection } from "next/server";
import { NexusDashboardOverview } from "@/components/nexus-dashboard-overview/nexus-dashboard-overview";
import { getNexusDashboardOverviewContent } from "@/components/nexus-dashboard-overview/nexus-dashboard-overview-content";

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
  const content = getNexusDashboardOverviewContent();

  return <NexusDashboardOverview content={content} />;
}
