import type { Metadata } from "next";
import { NexusActivities } from "@/components/nexus-activities/nexus-activities";
import { getNexusActivitiesContent } from "@/components/nexus-activities/nexus-activities-content";

export const metadata: Metadata = {
  title: "Kegiatan & Pengabdian",
  description: "Kegiatan dan pengabdian resmi CoE BHT pada BHT Nexus.",
  robots: {
    follow: false,
    index: false,
  },
};

export default function NexusActivitiesPage() {
  const content = getNexusActivitiesContent();

  return <NexusActivities content={content} />;
}
