import type { Metadata } from "next";
import { NexusScraperJobs } from "@/components/nexus-scraper-jobs/nexus-scraper-jobs";
import { getNexusScraperJobsContent } from "@/components/nexus-scraper-jobs/nexus-scraper-jobs-content";

export const metadata: Metadata = {
  title: "Status Job",
  description: "Status dan log percobaan job pengumpulan data BHT Nexus.",
  robots: {
    follow: false,
    index: false,
  },
};

export default function IndonesianNexusJobStatusPage() {
  return <NexusScraperJobs content={getNexusScraperJobsContent("id")} />;
}
