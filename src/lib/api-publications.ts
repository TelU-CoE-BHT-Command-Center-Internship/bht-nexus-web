import { apiFetch, apiFetchPaginated } from "@/lib/api-client";

export type WorkType =
  | "book_chapter"
  | "conference_paper"
  | "journal_article"
  | "other"
  | "patent";

export type Quartile = "Q1" | "Q2" | "Q3" | "Q4";

export type PublicationRecord = {
  citationCount: number;
  createdAt: string;
  doi: string | null;
  isOfficial: boolean;
  issnL: string | null;
  publicId: string;
  quartile: Quartile | null;
  sjr: number | null;
  title: string;
  updatedAt: string;
  venue: string | null;
  workType: WorkType;
  year: number;
};

export type PublicationListMeta = {
  limit: number;
  page: number;
  total: number;
  totalPages: number;
};

export type ListPublicationsParams = {
  dateFrom?: string;
  dateTo?: string;
  isOfficial?: boolean;
  limit?: number;
  page?: number;
  quartile?: Quartile;
  search?: string;
  sortBy?: "citationCount" | "createdAt" | "title" | "year";
  sortOrder?: "asc" | "desc";
  workType?: WorkType;
  year?: number;
};

export type CreatePublicationInput = {
  citationCount?: number;
  doi?: string | null;
  isOfficial?: boolean;
  issnL?: string | null;
  quartile?: Quartile | null;
  sjr?: number | null;
  title: string;
  venue?: string | null;
  workType: WorkType;
  year: number;
};

export type UpdatePublicationInput = Partial<CreatePublicationInput>;

function buildQuery(params: Record<string, unknown>): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined) {
      search.set(key, String(value));
    }
  }
  const query = search.toString();
  return query === "" ? "" : `?${query}`;
}

export function listPublications(
  params: ListPublicationsParams = {},
): Promise<{ data: PublicationRecord[]; meta: PublicationListMeta }> {
  return apiFetchPaginated(`/publications${buildQuery(params)}`);
}

export function getPublication(publicId: string): Promise<PublicationRecord> {
  return apiFetch(`/publications/${publicId}`);
}

export function createPublication(
  input: CreatePublicationInput,
): Promise<PublicationRecord> {
  return apiFetch("/publications", {
    body: JSON.stringify(input),
    method: "POST",
  });
}

export function updatePublication(
  publicId: string,
  input: UpdatePublicationInput,
): Promise<PublicationRecord> {
  return apiFetch(`/publications/${publicId}`, {
    body: JSON.stringify(input),
    method: "PATCH",
  });
}

export function deletePublication(publicId: string): Promise<void> {
  return apiFetch(`/publications/${publicId}`, { method: "DELETE" });
}
