import {
  ApiRequestError,
  apiErrorMessage,
  DEFAULT_API_BASE_URL,
} from "@/lib/api-client";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? DEFAULT_API_BASE_URL;

export type DashboardExportFormat = "xlsx" | "csv";

class ExportFormatUnavailableError extends Error {}

export function dashboardExportErrorMessage(error: unknown): string {
  return error instanceof ExportFormatUnavailableError
    ? error.message
    : apiErrorMessage(
        error,
        "Berkas laporan belum dapat dibuat. Silakan coba lagi.",
      );
}

/** Mengunduh laporan sesuai tahun dan cakupan yang diperiksa oleh server. */
export async function downloadDashboardExport(
  year: number,
  divisionPublicId?: string,
  format: DashboardExportFormat = "xlsx",
): Promise<void> {
  let response: Response;
  try {
    const query = new URLSearchParams({ year: String(year), format });
    if (divisionPublicId) query.set("divisionPublicId", divisionPublicId);
    response = await fetch(`${API_BASE_URL}/dashboard/export?${query}`, {
      credentials: "include",
      headers: {
        Accept:
          format === "xlsx"
            ? "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            : "text/csv",
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
      body?.code ?? "EXPORT_ERROR",
      body?.message ?? response.statusText,
    );
  }

  const contentType = response.headers
    .get("Content-Type")
    ?.split(";")[0]
    ?.trim();
  const expectedType =
    format === "xlsx"
      ? "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      : "text/csv";
  if (contentType !== expectedType) {
    throw new ExportFormatUnavailableError(
      format === "xlsx"
        ? "Laporan Excel belum tersedia pada server. Gunakan CSV sementara atau hubungi pengelola."
        : "Server belum dapat menghasilkan laporan CSV. Silakan coba lagi.",
    );
  }
  const url = URL.createObjectURL(await response.blob());
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `bht-nexus-monitoring-${year}.${format}`;
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 30_000);
}
