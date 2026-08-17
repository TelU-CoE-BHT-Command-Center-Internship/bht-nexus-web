import type { Metadata } from "next";
import { NexusAcademic } from "@/components/nexus-academic/nexus-academic";
import { getNexusAcademicContent } from "@/components/nexus-academic/nexus-academic-content";

export const metadata: Metadata = {
  title: "Akademik",
  description: "Kegiatan akademik resmi CoE BHT pada BHT Nexus.",
  robots: {
    follow: false,
    index: false,
  },
};

export default function NexusAcademicPage() {
  const content = getNexusAcademicContent();

  return <NexusAcademic content={content} />;
}
