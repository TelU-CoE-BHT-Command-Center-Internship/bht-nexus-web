/**
 * Renders an ISO local timestamp (`2026-08-11T08:52`) as `HH:MM DD-MM-YY`.
 * The string is sliced rather than parsed through `Date`, so server and client
 * produce the same output regardless of the machine time zone.
 */
export function formatTimestamp(value: string): string {
  const [date, time = ""] = value.split("T");
  const [year = "", month = "", day = ""] = date.split("-");

  return `${time.slice(0, 5)} ${day}-${month}-${year.slice(2)}`;
}

/**
 * Formats user actions in the product's Indonesian audit vocabulary. The
 * server can later replace the source timestamp without changing the UI.
 */
export function formatAuditTimestamp(value: Date | string = new Date()) {
  const date = typeof value === "string" ? new Date(value) : value;

  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    hour: "2-digit",
    hourCycle: "h23",
    minute: "2-digit",
    month: "short",
    timeZone: "Asia/Jakarta",
    timeZoneName: "short",
    year: "numeric",
  }).format(date);
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
