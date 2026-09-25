import type { Metadata } from "next";
import { NexusAuditReview } from "@/components/nexus-audit-review/nexus-audit-review";
import { getNexusAuditReviewContent } from "@/components/nexus-audit-review/nexus-audit-review-content";
import { nexusReviewActorIds } from "@/components/nexus-review-session/nexus-review-actors";

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
  /* Keputusan pada riwayat contoh tidak pernah diatasnamakan akun yang
     sedang masuk; tindakan baru tetap memakai akun sesi. */
  const content = getNexusAuditReviewContent({
    actorId: nexusReviewActorIds.sampleReviewer,
    label: "Pemeriksa data contoh",
  });
  const requestedRecord = (await searchParams).record;
  const initialRecordId = Array.isArray(requestedRecord)
    ? requestedRecord[0]
    : requestedRecord;

  return (
    <NexusAuditReview content={content} initialRecordId={initialRecordId} />
  );
}
