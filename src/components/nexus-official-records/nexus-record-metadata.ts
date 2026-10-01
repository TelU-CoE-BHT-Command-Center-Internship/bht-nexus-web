import { nexusKmIndicators } from "@/content/nexus-km-indicators";

/** Nilai teks tak kosong dari metadata rekam server, atau `undefined`. */
export function metadataText(metadata: Record<string, unknown>, key: string) {
  const value = metadata[key];
  return typeof value === "string" && value.trim() !== ""
    ? value.trim()
    : undefined;
}

/** Keterkaitan indikator KM dari kode yang tercatat pada rekam server. */
export function kmLinksFromCodes(codes: readonly string[] | undefined) {
  return (codes ?? []).flatMap((code) => {
    const indicator = nexusKmIndicators.find((item) => item.id === code);
    return indicator ? [{ indicator, note: "" }] : [];
  });
}

/**
 * Rekam server berlabel domain rumah data lain tampil di rumahnya sendiri.
 * Daftar kegiatan server juga memuat tipe "other", yang dipakai rekam HKI,
 * sehingga rekam berlabel itu harus disaring dari Kegiatan & Pengabdian.
 */
const otherHouseDomains = new Set([
  "academic",
  "contract",
  "contract_proposal",
  "intellectual_property",
  "proposal",
]);

export function belongsToActivityHouse(metadata: Record<string, unknown>) {
  const domain = metadataText(metadata, "domain");
  return domain !== undefined && otherHouseDomains.has(domain);
}

/**
 * Keterkaitan KM publikasi menurut definisi workbook KM 2026: konferensi
 * KM-11, jurnal bereputasi setara Q1/Q2 KM-14, jurnal lain berkuartil dan
 * book chapter KM-13. Jenis dan kuartil adalah fakta rekam, bukan penilaian.
 */
export function publicationKmCodes(summary: {
  quartile: string | null;
  workType: string;
}) {
  if (summary.workType === "conference_paper") return ["KM-11"];
  if (summary.workType === "book_chapter") return ["KM-13"];
  if (summary.workType !== "journal_article" || !summary.quartile) return [];
  return summary.quartile === "Q1" || summary.quartile === "Q2"
    ? ["KM-14"]
    : ["KM-13"];
}

export function recordYear(periodStart: string) {
  const year = Number(periodStart.slice(0, 4));
  return Number.isInteger(year) && year > 0 ? year : undefined;
}

export function formatRecordDate(value: string) {
  const date = new Date(`${value.slice(0, 10)}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    timeZone: "UTC",
    year: "numeric",
  }).format(date);
}
