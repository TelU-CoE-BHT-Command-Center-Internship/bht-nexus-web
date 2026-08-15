import type { Metadata } from "next";
import { NexusAuditReview } from "@/components/nexus-audit-review/nexus-audit-review";
import { getNexusAuditReviewContent } from "@/components/nexus-audit-review/nexus-audit-review-content";

export const metadata: Metadata = {
  title: "Tinjauan Data",
  description: "Tinjau kandidat data sebelum menjadi data resmi BHT Nexus.",
  robots: {
    follow: false,
    index: false,
  },
};

export default function NexusReviewPage() {
  const content = getNexusAuditReviewContent();

  return <NexusAuditReview content={content} />;
}
