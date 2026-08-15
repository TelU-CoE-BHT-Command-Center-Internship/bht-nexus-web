import type { Metadata } from "next";
import { NexusAuditReview } from "@/components/nexus-audit-review/nexus-audit-review";
import { getNexusAuditReviewContent } from "@/components/nexus-audit-review/nexus-audit-review-content";
import { getNexusDashboardShellPreviewContent } from "@/components/nexus-dashboard-shell/nexus-dashboard-shell-content";

export const metadata: Metadata = {
  title: "Tinjauan Data",
  description: "Tinjau kandidat data sebelum menjadi data resmi BHT Nexus.",
  robots: {
    follow: false,
    index: false,
  },
};

export default async function NexusReviewPage({
  searchParams,
}: {
  searchParams: Promise<{ record?: string | string[] }>;
}) {
  const viewer = getNexusDashboardShellPreviewContent().viewer;
  const content = getNexusAuditReviewContent(
    `${viewer.name} · ${viewer.roleLabel}`,
  );
  const requestedRecord = (await searchParams).record;
  const initialRecordId = Array.isArray(requestedRecord)
    ? requestedRecord[0]
    : requestedRecord;

  return (
    <NexusAuditReview content={content} initialRecordId={initialRecordId} />
  );
}
