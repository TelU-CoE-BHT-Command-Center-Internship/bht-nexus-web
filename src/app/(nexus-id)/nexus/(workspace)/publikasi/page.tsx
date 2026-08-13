import type { Metadata } from "next";
import { NexusPublications } from "@/components/nexus-publications/nexus-publications";
import { getNexusPublicationsContent } from "@/components/nexus-publications/nexus-publications-content";

export const metadata: Metadata = {
  title: "Publikasi",
  description: "Koleksi publikasi resmi BHT Nexus.",
  robots: {
    follow: false,
    index: false,
  },
};

export default function NexusPublicationsPage() {
  const content = getNexusPublicationsContent();

  return <NexusPublications content={content} />;
}
