import { apiFetch, apiFetchPaginated } from "@/lib/api-client";

export type WorkType =
  | "book_chapter"
  | "conference_paper"
  | "journal_article"
  | "other"
  | "patent";

export type Quartile = "Q1" | "Q2" | "Q3" | "Q4";

export type PublicationSummary = {
  citationCount: number;
  createdAt: string;
  doi: string | null;
  publicId: string;
  quartile: Quartile | null;
  sjr: number | null;
  title: string;
  venue: string | null;
  workType: WorkType;
  year: number;
};

export type PublicationAuthorEntry = {
  authorNameRaw: string;
  authorOrder: number;
  memberPublicId: string | null;
};

export type PublicationDetail = PublicationSummary & {
  authors: PublicationAuthorEntry[];
  issnL: string | null;
};

export type ListPublicationsParams = {
  dateFrom?: string;
  dateTo?: string;
  limit?: number;
  page?: number;
  quartile?: Quartile;
  search?: string;
  sortBy?: "citationCount" | "createdAt" | "title" | "year";
  sortOrder?: "asc" | "desc";
  workType?: WorkType;
  year?: number;
};

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
): Promise<{ data: PublicationSummary[]; meta: { total: number } }> {
  return apiFetchPaginated(`/publications${buildQuery(params)}`);
}

export function getPublication(publicId: string): Promise<PublicationDetail> {
  return apiFetch(`/publications/${publicId}`);
}
