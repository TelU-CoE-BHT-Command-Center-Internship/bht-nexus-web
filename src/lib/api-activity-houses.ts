import type { ActivityDetail, ActivitySummary } from "@/lib/api-activities";
import { apiFetch, apiFetchPaginated } from "@/lib/api-client";

/** Rumah data yang disajikan server dari tabel kegiatan, dipisah per domain. */
export type ActivityHouse =
  | "academics"
  | "contracts-proposals"
  | "intellectual-properties";

const MAX_PAGE_SIZE = 100;

function listHouse(
  house: ActivityHouse,
  page: number,
): Promise<{ data: ActivitySummary[]; meta: { total: number } }> {
  return apiFetchPaginated(
    `/${house}?limit=${MAX_PAGE_SIZE}&page=${page}&sortBy=periodStart&sortOrder=desc`,
  );
}

/** Seluruh rekam satu rumah data, dibaca per halaman sebanyak yang diizinkan. */
export async function listAllHouseRecords(
  house: ActivityHouse,
): Promise<ActivitySummary[]> {
  const records: ActivitySummary[] = [];
  for (let page = 1; ; page += 1) {
    const result = await listHouse(house, page);
    records.push(...result.data);
    if (result.data.length === 0 || records.length >= result.meta.total) {
      return records;
    }
  }
}

export function getHouseRecord(
  house: ActivityHouse,
  publicId: string,
): Promise<ActivityDetail> {
  return apiFetch(`/${house}/${encodeURIComponent(publicId)}`);
}
