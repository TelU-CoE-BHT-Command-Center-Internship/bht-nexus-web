import type { Metadata } from "next";
import { NexusRagQa } from "@/components/nexus-rag-qa/nexus-rag-qa";
import { getNexusRagQaContent } from "@/components/nexus-rag-qa/nexus-rag-qa-content";

export const metadata: Metadata = {
  title: "Document Q&A",
  description: "Ask source-grounded questions in BHT Nexus.",
  robots: { follow: false, index: false },
};

export default function DocumentQuestionsPage() {
  return <NexusRagQa content={getNexusRagQaContent("en")} />;
}
