import type { Metadata } from "next";
import { NexusRagLibrary } from "@/components/nexus-rag-library/nexus-rag-library";
import { getNexusRagLibraryContent } from "@/components/nexus-rag-library/nexus-rag-library-content";

export const metadata: Metadata = {
  title: "Documents",
  description: "The BHT Nexus indexed document library.",
  robots: {
    follow: false,
    index: false,
  },
};

export default function EnglishNexusDocumentLibraryPage() {
  return <NexusRagLibrary content={getNexusRagLibraryContent("en")} />;
}
