/**
 * Batas rute untuk sesi BHT Nexus. Dipakai oleh proxy, layout ruang kerja,
 * dan alur masuk sehingga ketiganya memakai daftar alamat yang sama.
 */

/** Nama cookie sesi layanan; varian `__Secure-` dipakai pada HTTPS produksi. */
export const nexusSessionCookieNames = [
  "better-auth.session_token",
  "__Secure-better-auth.session_token",
] as const;

export const NEXUS_SIGN_IN_PATH = "/nexus/masuk";
export const NEXUS_EN_SIGN_IN_PATH = "/en/nexus/sign-in";
export const NEXUS_ACTIVATION_PATH = "/nexus/aktivasi";
export const NEXUS_PASSWORD_RECOVERY_PATH = "/nexus/lupa-kata-sandi";
export const NEXUS_EN_ACTIVATION_PATH = "/en/nexus/activate";
export const NEXUS_EN_PASSWORD_RECOVERY_PATH = "/en/nexus/forgot-password";

/** Header dari proxy yang membawa alamat ruang kerja yang sedang diminta. */
export const NEXUS_REQUEST_PATH_HEADER = "x-nexus-request-path";

/** Parameter alamat tujuan setelah masuk. */
export const NEXUS_RETURN_PARAM = "lanjut";
/** Parameter alasan kembali ke halaman masuk. */
export const NEXUS_SIGN_IN_REASON_PARAM = "alasan";

export type NexusSignInReason = "keluar" | "sesi-berakhir";

const publicWorkspacePaths = new Set([
  "/nexus",
  NEXUS_SIGN_IN_PATH,
  NEXUS_ACTIVATION_PATH,
  NEXUS_PASSWORD_RECOVERY_PATH,
  "/en/nexus",
  NEXUS_EN_SIGN_IN_PATH,
  NEXUS_EN_ACTIVATION_PATH,
  NEXUS_EN_PASSWORD_RECOVERY_PATH,
]);

function isWorkspacePath(pathname: string) {
  return (
    pathname === "/nexus" ||
    pathname.startsWith("/nexus/") ||
    pathname === "/en/nexus" ||
    pathname.startsWith("/en/nexus/")
  );
}

export function nexusWorkspacePathIsProtected(pathname: string) {
  return isWorkspacePath(pathname) && !publicWorkspacePaths.has(pathname);
}

/**
 * Menerima alamat tujuan hanya bila ia rute ruang kerja internal yang
 * dilindungi. Alamat lain, termasuk URL absolut dan `//host`, ditolak agar
 * parameter tujuan tidak dapat dipakai untuk mengalihkan ke situs lain.
 */
export function nexusSafeReturnPath(value: string | null | undefined) {
  if (!value || value.length > 512) return null;
  if (!value.startsWith("/") || value.startsWith("//")) return null;
  if (value.includes("\\")) return null;
  if ([...value].some((character) => character.charCodeAt(0) < 32)) {
    return null;
  }

  const pathname = value.split(/[?#]/, 1)[0] ?? "";
  return nexusWorkspacePathIsProtected(pathname) ? value : null;
}

export function nexusSignInPathForReturn(
  returnPath?: string | null,
  reason?: NexusSignInReason,
) {
  const safeReturn = nexusSafeReturnPath(returnPath);
  const signInPath = safeReturn?.startsWith("/en/")
    ? NEXUS_EN_SIGN_IN_PATH
    : NEXUS_SIGN_IN_PATH;
  const params = new URLSearchParams();
  if (safeReturn) params.set(NEXUS_RETURN_PARAM, safeReturn);
  if (reason) params.set(NEXUS_SIGN_IN_REASON_PARAM, reason);
  const query = params.toString();
  return query ? `${signInPath}?${query}` : signInPath;
}
