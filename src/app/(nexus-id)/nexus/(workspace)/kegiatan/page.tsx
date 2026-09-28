import type { Metadata } from "next";
import { NexusActivitiesLive } from "@/components/nexus-activities/nexus-activities-live";

export const metadata: Metadata = {
  title: "Kegiatan & Pengabdian",
  description: "Kegiatan dan pengabdian resmi CoE BHT pada BHT Nexus.",
  robots: {
    follow: false,
    index: false,
  },
};

export default function NexusActivitiesPage() {
  return <NexusActivitiesLive />;
}
