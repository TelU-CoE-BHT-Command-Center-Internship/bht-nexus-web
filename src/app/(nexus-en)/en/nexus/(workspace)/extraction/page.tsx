import type { Metadata } from "next";
import { NexusRagExtraction } from "@/components/nexus-rag-extraction/nexus-rag-extraction";
import { getNexusRagExtractionContent } from "@/components/nexus-rag-extraction/nexus-rag-extraction-content";

export const metadata: Metadata = {
  title: "Extraction",
  description: "Review extracted field candidates from BHT Nexus documents.",
  robots: {
    follow: false,
    index: false,
  },
};

export default function EnglishNexusExtractionPage() {
  return <NexusRagExtraction content={getNexusRagExtractionContent("en")} />;
}
