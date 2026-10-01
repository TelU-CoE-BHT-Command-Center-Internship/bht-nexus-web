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
