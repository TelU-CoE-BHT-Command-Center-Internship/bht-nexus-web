import {
  ApiRequestError,
  apiFetch,
  apiFetchPaginated,
  DEFAULT_API_BASE_URL,
} from "@/lib/api-client";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? DEFAULT_API_BASE_URL;

export type ImportIssue = {
  column: string;
  kind: "change" | "duplicate" | "error";
  reason: string;
  suggestion: string;
  value: string | null;
};

export type ImportSummary = {
  changed: number;
  duplicate: number;
  failed: number;
  new: number;
  total: number;
  valid: number;
};

export type ImportBatch = {
  fileName: string;
  publicId: string;
  status: "failed" | "previewed" | "processing" | "promoted";
  summary: ImportSummary;
  targetEntity: string;
  uploadedAt: string;
};

export type ImportUpload = ImportBatch & {
  failedRows: { issues: ImportIssue[]; rowNumber: number }[];
};

export type ImportRowAction = "duplicate" | "new" | "skip" | "update";

export type ImportRow = {
  action: ImportRowAction;
  issues: ImportIssue[];
  rowNumber: number;
  values: Record<string, unknown>;
};

export type ImportSubmitResult = {
  publicId: string;
  status: string;
  submitted: { changed: number; new: number };
};

export function uploadImport(file: File): Promise<ImportUpload> {
  const body = new FormData();
  body.append("file", file);
  return apiFetch("/imports", { body, method: "POST" });
}

export function listImportRows(
  publicId: string,
  action: ImportRowAction | undefined,
  page: number,
) {
  const search = new URLSearchParams({ limit: "20", page: String(page) });
  if (action) search.set("action", action);
  return apiFetchPaginated<ImportRow>(
    `/imports/${encodeURIComponent(publicId)}/rows?${search.toString()}`,
  );
}

export function submitImport(publicId: string): Promise<ImportSubmitResult> {
  return apiFetch(`/imports/${encodeURIComponent(publicId)}/submit`, {
    method: "POST",
  });
}

/** Mengunduh berkas CSV yang dibuat server, yaitu templat atau laporan kesalahan. */
export async function downloadImportCsv(path: string, filename: string) {
  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      credentials: "include",
      headers: { Accept: "text/csv" },
    });
  } catch {
    throw new ApiRequestError(0, "NETWORK_ERROR", "Network request failed");
  }
  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as {
      code?: string;
      message?: string;
    } | null;
    throw new ApiRequestError(
      response.status,
      body?.code ?? "DOWNLOAD_ERROR",
      body?.message ?? response.statusText,
    );
  }
  const url = URL.createObjectURL(await response.blob());
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 30_000);
}

export function importTemplatePath() {
  return "/imports/template";
}

export function importErrorsPath(publicId: string) {
  return `/imports/${encodeURIComponent(publicId)}/errors`;
}
