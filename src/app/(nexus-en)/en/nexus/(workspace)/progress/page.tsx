import type { Metadata } from "next";
import { NexusScraperJobs } from "@/components/nexus-scraper-jobs/nexus-scraper-jobs";
import { getNexusScraperJobsContent } from "@/components/nexus-scraper-jobs/nexus-scraper-jobs-content";

export const metadata: Metadata = {
  title: "Progress",
  description: "Researcher search progress and its attempt log.",
  robots: {
    follow: false,
    index: false,
  },
};

export default function EnglishNexusJobStatusPage() {
  return <NexusScraperJobs content={getNexusScraperJobsContent("en")} />;
}
