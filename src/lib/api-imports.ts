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
  kind: "change" | "duplicate" | "error" | "warning";
  reason: string;
  suggestion: string;
  value: string | null;
};

export type ImportEntity =
  | "publication"
  | "intellectual-property"
  | "contract"
  | "academic"
  | "activity";

export type ImportOptions = {
  targetEntity: ImportEntity | "auto";
  reportYear?: number;
};

export type ImportSheetSummary = {
  name: string;
  status: "data" | "context" | "unsupported" | "empty";
  headerRow: number | null;
  total: number;
  valid: number;
  failed: number;
  houses: ImportEntity[];
  notes: string[];
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
  sheets?: ImportSheetSummary[] | null;
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
  targetEntity?: ImportEntity | null;
  sheetName?: string | null;
  sourceRowNumber?: number;
  sourceValues?: Record<string, string> | null;
  values: Record<string, unknown>;
};

export type ImportSubmitResult = {
  publicId: string;
  status: string;
  submitted: { changed: number; new: number };
};

export function uploadImport(
  file: File,
  options?: ImportOptions,
): Promise<ImportUpload> {
  const body = new FormData();
  body.append("file", file);
  if (options) {
    body.append("targetEntity", options.targetEntity);
    if (options.reportYear !== undefined)
      body.append("reportYear", String(options.reportYear));
  }
  return apiFetch("/imports", { body, method: "POST" });
}

const ALL_ROWS_PAGE_SIZE = 200;

/** Seluruh baris pratinjau (maksimal 2.000) agar pencarian dan filter bekerja pada semua lembar. */
export async function listAllImportRows(
  publicId: string,
): Promise<ImportRow[]> {
  const rows: ImportRow[] = [];
  for (let page = 1; ; page += 1) {
    const search = new URLSearchParams({
      limit: String(ALL_ROWS_PAGE_SIZE),
      page: String(page),
    });
    const result = await apiFetchPaginated<ImportRow>(
      `/imports/${encodeURIComponent(publicId)}/rows?${search.toString()}`,
    );
    rows.push(...result.data);
    if (page >= (result.meta.totalPages ?? 1)) return rows;
  }
}

export function submitImport(publicId: string): Promise<ImportSubmitResult> {
  return apiFetch(`/imports/${encodeURIComponent(publicId)}/submit`, {
    method: "POST",
  });
}

/** Mengunduh berkas yang dibuat server: templat Excel atau laporan kesalahan CSV. */
export async function downloadImportFile(path: string, filename: string) {
  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      credentials: "include",
      headers: {
        Accept:
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, text/csv",
      },
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

export function importTemplatePath(targetEntity: ImportEntity = "publication") {
  return `/imports/template?targetEntity=${encodeURIComponent(targetEntity)}`;
}

export function importErrorsPath(publicId: string) {
  return `/imports/${encodeURIComponent(publicId)}/errors`;
}
