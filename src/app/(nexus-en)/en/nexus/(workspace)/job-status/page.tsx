import type { Metadata } from "next";
import { NexusScraperJobs } from "@/components/nexus-scraper-jobs/nexus-scraper-jobs";
import { getNexusScraperJobsContent } from "@/components/nexus-scraper-jobs/nexus-scraper-jobs-content";

export const metadata: Metadata = {
  title: "Job Status",
  description: "Status and attempt log for BHT Nexus collection jobs.",
  robots: {
    follow: false,
    index: false,
  },
};

export default function EnglishNexusJobStatusPage() {
  return <NexusScraperJobs content={getNexusScraperJobsContent("en")} />;
}
