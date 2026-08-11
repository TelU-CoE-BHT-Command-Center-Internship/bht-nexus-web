import type { Metadata } from "next";
import { NexusRagLibrary } from "@/components/nexus-rag-library/nexus-rag-library";
import { getNexusRagLibraryContent } from "@/components/nexus-rag-library/nexus-rag-library-content";

export const metadata: Metadata = {
  title: "Pustaka",
  description: "Pustaka dokumen terindeks BHT Nexus.",
  robots: {
    follow: false,
    index: false,
  },
};

export default function IndonesianNexusDocumentLibraryPage() {
  return <NexusRagLibrary content={getNexusRagLibraryContent("id")} />;
}
