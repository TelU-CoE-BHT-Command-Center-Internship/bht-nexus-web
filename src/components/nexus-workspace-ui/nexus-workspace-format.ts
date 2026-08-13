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
