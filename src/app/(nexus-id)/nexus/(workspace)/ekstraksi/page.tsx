import type { Metadata } from "next";
import { NexusRagExtraction } from "@/components/nexus-rag-extraction/nexus-rag-extraction";
import { getNexusRagExtractionContent } from "@/components/nexus-rag-extraction/nexus-rag-extraction-content";

export const metadata: Metadata = {
  title: "Ekstraksi",
  description: "Tinjauan kandidat isian hasil ekstraksi dokumen BHT Nexus.",
  robots: {
    follow: false,
    index: false,
  },
};

export default function IndonesianNexusExtractionPage() {
  return <NexusRagExtraction content={getNexusRagExtractionContent("id")} />;
}
