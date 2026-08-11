import type { Metadata } from "next";
import { NexusRagQa } from "@/components/nexus-rag-qa/nexus-rag-qa";
import { getNexusRagQaContent } from "@/components/nexus-rag-qa/nexus-rag-qa-content";

export const metadata: Metadata = {
  title: "Tanya Jawab",
  description: "Tanya jawab dokumen internal BHT Nexus dengan sitasi sumber.",
  robots: {
    follow: false,
    index: false,
  },
};

export default function IndonesianNexusDocumentQaPage() {
  return <NexusRagQa content={getNexusRagQaContent("id")} />;
}
