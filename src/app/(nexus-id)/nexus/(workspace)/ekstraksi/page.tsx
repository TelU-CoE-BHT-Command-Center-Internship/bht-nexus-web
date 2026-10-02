import type { Metadata } from "next";
import { getExtractionPageCopy } from "@/components/nexus-rag-extraction/nexus-rag-extraction-content";
import { NexusRagExtractionPicker } from "@/components/nexus-rag-extraction/nexus-rag-extraction-picker";

export const metadata: Metadata = {
  title: "Ekstraksi Dokumen",
  description: "Periksa kandidat isian yang diekstrak dari dokumen BHT Nexus.",
  robots: { follow: false, index: false },
};

export default function ExtractionPage() {
  const pageCopy = getExtractionPageCopy("id");
  return (
    <NexusRagExtractionPicker
      description={pageCopy.description}
      locale="id"
      title={pageCopy.title}
    />
  );
}
