import type { Metadata } from "next";
import { NexusAuditReview } from "@/components/nexus-audit-review/nexus-audit-review";

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
  const requestedRecord = (await searchParams).record;
  const initialRecordId = Array.isArray(requestedRecord)
    ? requestedRecord[0]
    : requestedRecord;

  return <NexusAuditReview initialRecordId={initialRecordId} />;
}
