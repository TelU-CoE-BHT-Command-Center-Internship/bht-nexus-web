import type { Metadata } from "next";
import { NexusRagQa } from "@/components/nexus-rag-qa/nexus-rag-qa";
import { getNexusRagQaContent } from "@/components/nexus-rag-qa/nexus-rag-qa-content";

export const metadata: Metadata = {
  title: "Ask Documents",
  description: "Ask internal BHT Nexus documents and get cited answers.",
  robots: {
    follow: false,
    index: false,
  },
};

export default function EnglishNexusDocumentQaPage() {
  return <NexusRagQa content={getNexusRagQaContent("en")} />;
}
