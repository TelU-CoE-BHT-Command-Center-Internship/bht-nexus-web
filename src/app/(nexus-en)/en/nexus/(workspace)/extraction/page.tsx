import type { Metadata } from "next";
import { getExtractionPageCopy } from "@/components/nexus-rag-extraction/nexus-rag-extraction-content";
import { NexusRagExtractionPicker } from "@/components/nexus-rag-extraction/nexus-rag-extraction-picker";

export const metadata: Metadata = {
  title: "Document Extraction",
  description: "Review candidate fields extracted from BHT Nexus documents.",
  robots: { follow: false, index: false },
};

export default function ExtractionPage() {
  const pageCopy = getExtractionPageCopy("en");
  return (
    <NexusRagExtractionPicker
      description={pageCopy.description}
      locale="en"
      title={pageCopy.title}
    />
  );
}
