import type { Metadata } from "next";
import { NexusRagExtraction } from "@/components/nexus-rag-extraction/nexus-rag-extraction";
import {
  getExtractionDocumentOptions,
  getExtractionPageCopy,
  getNexusRagExtractionContent,
} from "@/components/nexus-rag-extraction/nexus-rag-extraction-content";
import { NexusRagExtractionPicker } from "@/components/nexus-rag-extraction/nexus-rag-extraction-picker";

export const metadata: Metadata = {
  title: "Document Extraction",
  description: "Review candidate fields extracted from BHT Nexus documents.",
  robots: { follow: false, index: false },
};

export default async function ExtractionPage({
  searchParams,
}: {
  searchParams: Promise<{ document?: string | string[] }>;
}) {
  const requestedDocument = (await searchParams).document;
  const documentId = Array.isArray(requestedDocument)
    ? requestedDocument[0]
    : requestedDocument;

  if (!documentId) {
    const pageCopy = getExtractionPageCopy("en");
    return (
      <NexusRagExtractionPicker
        description={pageCopy.description}
        documents={getExtractionDocumentOptions("en")}
        locale="en"
        title={pageCopy.title}
      />
    );
  }

  return (
    <NexusRagExtraction
      content={getNexusRagExtractionContent("en", documentId)}
    />
  );
}
