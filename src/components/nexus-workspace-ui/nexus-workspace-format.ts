const WIB_TIME_ZONE = "Asia/Jakarta";

/**
 * Timestamp lama tanpa offset berasal dari data lokal WIB. Tambahan offset ini
 * menjaga kompatibilitas fixture lama; event baru selalu menyimpan ISO UTC.
 */
function normalizedTimestamp(value: string) {
  const trimmed = value.trim();
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(?::\d{2}(?:\.\d+)?)?$/.test(trimmed)) {
    return trimmed;
  }
  return `${trimmed}+07:00`;
}

/** Menampilkan instant ISO dalam zona operasional CoE BHT (WIB). */
export function formatTimestamp(value: string): string {
  const date = new Date(normalizedTimestamp(value));
  if (Number.isNaN(date.getTime())) return value;

  const parts = new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    hour: "2-digit",
    hourCycle: "h23",
    minute: "2-digit",
    month: "2-digit",
    timeZone: WIB_TIME_ZONE,
    year: "2-digit",
  }).formatToParts(date);
  const partValue = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value ?? "";

  return `${partValue("hour")}:${partValue("minute")} ${partValue("day")}-${partValue("month")}-${partValue("year")}`;
}

/**
 * Formats user actions in the product's Indonesian audit vocabulary. The
 * server can later replace the source timestamp without changing the UI.
 */
export function formatAuditTimestamp(value: Date | string = new Date()) {
  const date =
    typeof value === "string" ? new Date(normalizedTimestamp(value)) : value;

  if (Number.isNaN(date.getTime())) {
    return typeof value === "string" ? value : "Waktu tidak tersedia";
  }

  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    hour: "2-digit",
    hourCycle: "h23",
    minute: "2-digit",
    month: "short",
    timeZone: WIB_TIME_ZONE,
    timeZoneName: "short",
    year: "numeric",
  }).format(date);
}

/**
 * Membandingkan instant, bukan bentuk teks ISO-nya. Nilai legacy tanpa offset
 * tetap diperlakukan sebagai WIB; nilai invalid selalu ditempatkan terakhir.
 */
export function compareTimestamps(
  first: string,
  second: string,
  direction: "ascending" | "descending" = "ascending",
) {
  const firstEpoch = new Date(normalizedTimestamp(first)).getTime();
  const secondEpoch = new Date(normalizedTimestamp(second)).getTime();
  const firstIsValid = !Number.isNaN(firstEpoch);
  const secondIsValid = !Number.isNaN(secondEpoch);

  if (!firstIsValid && !secondIsValid) {
    const fallback = first.localeCompare(second);
    return direction === "ascending" ? fallback : -fallback;
  }
  if (!firstIsValid) return 1;
  if (!secondIsValid) return -1;

  return direction === "ascending"
    ? firstEpoch - secondEpoch
    : secondEpoch - firstEpoch;
}

/**
 * Normalisasi teks pencarian ruang kerja: tanpa diakritik, huruf kecil, dan
 * terpangkas, supaya pencarian pada setiap rumah data resmi berperilaku sama.
 */
export function normalizeWorkspaceSearch(value: string) {
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLocaleLowerCase("id-ID")
    .trim();
}

/**
 * Mengambil inisial dari nama orang tanpa menjadikan gelar akademik sebagai
 * huruf awal. Credential setelah koma juga tidak ikut dihitung.
 */
export function personInitials(name: string) {
  const nameWithoutCredentials = name.split(",", 1)[0]?.trim() ?? "";
  const actualName = nameWithoutCredentials.replace(
    /^(?:(?:Prof|Dr|Eng|Ir)\.?\s*)+/giu,
    "",
  );
  const words = actualName.match(/[\p{L}\p{N}]+/gu) ?? [];

  if (words.length === 0) return "—";

  return words
    .filter((_, index) => index === 0 || index === words.length - 1)
    .map((word) => word[0]?.toLocaleUpperCase("id-ID"))
    .join("");
}
