import type { Metadata } from "next";
import { NexusDashboardOverview } from "@/components/nexus-dashboard-overview/nexus-dashboard-overview";
import { getNexusDashboardOverviewPreviewContent } from "@/components/nexus-dashboard-overview/nexus-dashboard-overview-content";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Ruang kerja internal BHT Nexus.",
  robots: {
    follow: false,
    index: false,
  },
};

export default function NexusDashboardPage() {
  const content = getNexusDashboardOverviewPreviewContent();

  return <NexusDashboardOverview content={content} />;
}
