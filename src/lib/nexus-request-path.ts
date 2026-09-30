/** Header yang diisi `proxy.ts` supaya layout mengetahui halaman yang diminta. */
export const NEXUS_REQUEST_PATH_HEADER = "x-nexus-request-path";

const workspacePathPattern = /^\/(?:en\/)?nexus(?:[/?#]|$)/;
const signInPaths = new Set(["/nexus/masuk", "/en/nexus/sign-in"]);

/**
 * Tujuan kembali setelah masuk hanya boleh berupa halaman ruang kerja pada
 * situs ini. Nilai lain (situs luar, `//host`, halaman masuk itu sendiri)
 * diabaikan supaya tautan masuk tidak dapat dipakai untuk mengalihkan pengguna.
 */
export function safeWorkspaceReturnPath(
  value: string | null | undefined,
): string | undefined {
  if (typeof value !== "string" || value === "") return undefined;
  if (!value.startsWith("/") || value.startsWith("//")) return undefined;
  if (value.includes("\\")) return undefined;
  if (!workspacePathPattern.test(value)) return undefined;
  const pathname = value.split(/[?#]/)[0] ?? value;
  if (signInPaths.has(pathname)) return undefined;
  return value;
}
