import type { Metadata } from "next";
import { NexusScraperJobs } from "@/components/nexus-scraper-jobs/nexus-scraper-jobs";
import { getNexusScraperJobsContent } from "@/components/nexus-scraper-jobs/nexus-scraper-jobs-content";

export const metadata: Metadata = {
  title: "Proses",
  description: "Proses pencarian peneliti dan log percobaannya.",
  robots: {
    follow: false,
    index: false,
  },
};

export default function IndonesianNexusJobStatusPage() {
  return <NexusScraperJobs content={getNexusScraperJobsContent("id")} />;
}
