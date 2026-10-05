import { apiFetch, apiFetchPaginated } from "@/lib/api-client";

export const DOCUMENT_UPLOAD_LIMIT_BYTES = 50 * 1024 * 1024;

export type DocumentClassification =
  | "confidential"
  | "internal"
  | "public"
  | "restricted";

export type DocumentQuarantineStatus = "passed" | "pending" | "rejected";

export type DocumentIndexStatus =
  | "failed"
  | "not_indexed"
  | "queued"
  | "ready"
  | "running";

export type DocumentSummary = {
  classification: DocumentClassification;
  createdAt: string;
  indexStatus: DocumentIndexStatus;
  latestVersionNo: number;
  mimeType: string;
  originalName: string;
  ownerEmail?: string | null;
  publicId: string;
  quarantineStatus: DocumentQuarantineStatus;
  sizeBytes: number;
  title: string;
};

export type UploadedDocument = {
  publicId: string;
  quarantineStatus: DocumentQuarantineStatus;
  title: string;
};

export function listDocuments(
  params: { limit?: number; page?: number } = {},
): Promise<{ data: DocumentSummary[]; meta: { total: number } }> {
  const search = new URLSearchParams({
    limit: String(params.limit ?? 100),
    page: String(params.page ?? 1),
  });
  return apiFetchPaginated(`/documents?${search.toString()}`);
}

/** Seluruh dokumen yang boleh dibaca akun ini, dibaca per halaman. */
export async function listAllDocuments(): Promise<DocumentSummary[]> {
  const documents: DocumentSummary[] = [];
  for (let page = 1; ; page += 1) {
    const result = await listDocuments({ limit: 100, page });
    documents.push(...result.data);
    if (result.data.length === 0 || documents.length >= result.meta.total) {
      return documents;
    }
  }
}

/** Mengantrekan ulang indeks dokumen yang indeksnya gagal. */
export function reindexDocument(publicId: string): Promise<unknown> {
  return apiFetch(`/documents/${encodeURIComponent(publicId)}/reindex`, {
    method: "POST",
  });
}

export function uploadDocument(file: File): Promise<UploadedDocument> {
  const body = new FormData();
  body.append("file", file);
  body.append("title", file.name.replace(/\.[^.]+$/, ""));
  body.append("classification", "internal");
  return apiFetch("/documents/upload", { body, method: "POST" });
}
