import type { Metadata } from "next";
import { NexusReviewLive } from "@/components/nexus-audit-review/nexus-review-live";

export const metadata: Metadata = {
  title: "Tinjauan Data",
  description: "Tinjau kandidat data sebelum menjadi data resmi BHT Nexus.",
  robots: {
    follow: false,
    index: false,
  },
};

export default function NexusReviewPage() {
  return <NexusReviewLive />;
}
