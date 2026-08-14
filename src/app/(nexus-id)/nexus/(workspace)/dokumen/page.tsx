import type { Metadata } from "next";
import { NexusRagLibrary } from "@/components/nexus-rag-library/nexus-rag-library";
import { getNexusRagLibraryContent } from "@/components/nexus-rag-library/nexus-rag-library-content";

export const metadata: Metadata = {
  title: "Dokumen",
  description: "Kelola dokumen yang diizinkan di BHT Nexus.",
  robots: { follow: false, index: false },
};

export default function DocumentsPage() {
  return <NexusRagLibrary content={getNexusRagLibraryContent("id")} />;
}
