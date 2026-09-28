import type { Metadata } from "next";
import { NexusPublicationsLive } from "@/components/nexus-publications/nexus-publications-live";

export const metadata: Metadata = {
  title: "Publikasi",
  description: "Koleksi publikasi resmi BHT Nexus.",
  robots: {
    follow: false,
    index: false,
  },
};

export default function NexusPublicationsPage() {
  return <NexusPublicationsLive />;
}
