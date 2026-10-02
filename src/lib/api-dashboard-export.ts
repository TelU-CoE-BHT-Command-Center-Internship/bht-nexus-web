import { ApiRequestError, DEFAULT_API_BASE_URL } from "@/lib/api-client";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? DEFAULT_API_BASE_URL;

/** Mengunduh CSV ringkasan dashboard dan realisasi KPI yang dibuat dan dicatat oleh server. */
export async function downloadDashboardExport(
  year: number,
  divisionPublicId?: string,
): Promise<void> {
  let response: Response;
  try {
    const query = new URLSearchParams({ year: String(year) });
    if (divisionPublicId) query.set("divisionPublicId", divisionPublicId);
    response = await fetch(`${API_BASE_URL}/dashboard/export?${query}`, {
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
      body?.code ?? "EXPORT_ERROR",
      body?.message ?? response.statusText,
    );
  }

  const url = URL.createObjectURL(await response.blob());
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `bht-nexus-dashboard-${year}.csv`;
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 30_000);
}
