import type { Metadata } from "next";
import { NexusPublications } from "@/components/nexus-publications/nexus-publications";

export const metadata: Metadata = {
  title: "Publikasi",
  description: "Koleksi publikasi resmi BHT Nexus.",
  robots: {
    follow: false,
    index: false,
  },
};

export default function NexusPublicationsPage() {
  return <NexusPublications />;
}
