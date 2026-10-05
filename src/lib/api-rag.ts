import { apiFetch } from "@/lib/api-client";

export type RagLanguage = "en" | "id";

export type RagCitation = {
  documentPublicId: string;
  documentTitle: string;
  pageNo: number;
  quoteText: string;
};

export type RagAnswer = {
  answer: string | null;
  citations: RagCitation[];
  generatedAt: string;
  isRefused: boolean;
  language: RagLanguage;
  question: string;
  queryPublicId: string;
  refusalReason: { en: string; id: string } | null;
};

export type RagHistoryItem = {
  answer: string | null;
  askedAt: string;
  citationsCount: number;
  isRefused: boolean;
  language: string;
  question: string;
  queryPublicId: string;
  refusalReason: string | null;
};

export type ExtractionProfile = {
  description: { en: string; id: string };
  id: string;
  name: { en: string; id: string };
  targetEntityType: string;
};

export type ExtractionJob = {
  documentPublicId: string;
  jobPublicId: string;
  profile?: string;
  schemaId?: string;
  status: string;
};

export function askDocuments(input: {
  documentPublicIds?: string[];
  language: RagLanguage;
  question: string;
}): Promise<RagAnswer> {
  return apiFetch("/rag/query", {
    body: JSON.stringify(input),
    method: "POST",
  });
}

export async function listRagHistory(): Promise<RagHistoryItem[]> {
  const result = await apiFetch<{ data: RagHistoryItem[] }>("/rag/history");
  return result.data;
}

export async function listExtractionProfiles(): Promise<ExtractionProfile[]> {
  const result = await apiFetch<{ data: ExtractionProfile[] }>(
    "/rag/extraction-profiles",
  );
  return result.data;
}

export function startExtraction(input: {
  documentPublicId: string;
  profile: string;
}): Promise<ExtractionJob> {
  return apiFetch("/rag/extract", {
    body: JSON.stringify(input),
    method: "POST",
  });
}

export type ExtractionResult = {
  fields: unknown[];
  jobPublicId: string;
  records: unknown[];
  reviewCasePublicIds: string[];
  status: string;
};

/** Hasil pekerjaan ekstraksi; bidang dan baris kosong bila tidak ada data yang cocok. */
export function getExtractionResult(
  jobPublicId: string,
): Promise<ExtractionResult> {
  return apiFetch(`/rag/extract/${encodeURIComponent(jobPublicId)}`);
}
