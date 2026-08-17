import type { Metadata } from "next";
import { NexusIntellectualProperty } from "@/components/nexus-intellectual-property/nexus-intellectual-property";
import { getNexusIntellectualPropertyContent } from "@/components/nexus-intellectual-property/nexus-intellectual-property-content";

export const metadata: Metadata = {
  title: "Kekayaan Intelektual",
  description: "Kekayaan intelektual resmi CoE BHT pada BHT Nexus.",
  robots: {
    follow: false,
    index: false,
  },
};

export default function NexusIntellectualPropertyPage() {
  const content = getNexusIntellectualPropertyContent();

  return <NexusIntellectualProperty content={content} />;
}
