import type { Metadata } from "next";
import { NexusRagExtraction } from "@/components/nexus-rag-extraction/nexus-rag-extraction";
import { getNexusRagExtractionContent } from "@/components/nexus-rag-extraction/nexus-rag-extraction-content";

export const metadata: Metadata = {
  title: "Ekstraksi Dokumen",
  description: "Periksa kandidat isian yang diekstrak dari dokumen BHT Nexus.",
  robots: { follow: false, index: false },
};

export default function ExtractionPage() {
  return <NexusRagExtraction content={getNexusRagExtractionContent("id")} />;
}
