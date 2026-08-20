import type { Metadata } from "next";
import { NexusRagExtraction } from "@/components/nexus-rag-extraction/nexus-rag-extraction";
import { getNexusRagExtractionContent } from "@/components/nexus-rag-extraction/nexus-rag-extraction-content";

export const metadata: Metadata = {
  title: "Ekstraksi Dokumen",
  description: "Periksa kandidat isian yang diekstrak dari dokumen BHT Nexus.",
  robots: { follow: false, index: false },
};

export default async function ExtractionPage({
  searchParams,
}: {
  searchParams: Promise<{ document?: string | string[] }>;
}) {
  const requestedDocument = (await searchParams).document;
  return (
    <NexusRagExtraction
      content={getNexusRagExtractionContent(
        "id",
        Array.isArray(requestedDocument)
          ? requestedDocument[0]
          : requestedDocument,
      )}
    />
  );
}
