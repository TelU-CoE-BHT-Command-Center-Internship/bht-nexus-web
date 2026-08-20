import type { Metadata } from "next";
import { NexusRagQa } from "@/components/nexus-rag-qa/nexus-rag-qa";
import { getNexusRagQaContent } from "@/components/nexus-rag-qa/nexus-rag-qa-content";

export const metadata: Metadata = {
  title: "Tanya Jawab Dokumen",
  description: "Ajukan pertanyaan dengan jawaban bersitasi di BHT Nexus.",
  robots: { follow: false, index: false },
};

export default async function DocumentQuestionsPage({
  searchParams,
}: {
  searchParams: Promise<{ document?: string | string[] }>;
}) {
  const requestedDocument = (await searchParams).document;
  return (
    <NexusRagQa
      content={getNexusRagQaContent("id")}
      initialDocumentId={
        Array.isArray(requestedDocument)
          ? requestedDocument[0]
          : requestedDocument
      }
    />
  );
}
