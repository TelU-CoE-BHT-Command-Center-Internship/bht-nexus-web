/**
 * Alamat layanan BHT Nexus yang boleh diteruskan dari asal ruang kerja.
 * Daftar ini sengaja sempit dan mengikuti kontrak yang benar-benar dipakai:
 * autentikasi, sesi, profil sendiri, serta siklus akun di Administrasi.
 * Modul lain ditambahkan ketika integrasinya dikerjakan.
 */
const forwardedApiPaths = new Set([
  "/api/auth/ok",
  "/api/auth/get-session",
  "/api/auth/sign-in/email",
  "/api/auth/sign-out",
  "/api/auth/change-password",
  "/api/auth/email-otp/send-verification-otp",
  "/api/auth/email-otp/verify-email",
  "/api/auth/email-otp/request-password-reset",
  "/api/auth/email-otp/reset-password",
  "/api/profile/me",
  "/api/profile/me/academic-identifiers",
  "/api/admin/accounts",
  "/api/admin/accounts/invite",
  "/api/roles",
  "/api/members",
]);

const forwardedApiPatterns = [
  /^\/api\/admin\/accounts\/[0-9a-f-]{36}\/(?:role|status|link-member)$/,
];

export function nexusApiPathIsForwarded(pathname: string) {
  return (
    forwardedApiPaths.has(pathname) ||
    forwardedApiPatterns.some((pattern) => pattern.test(pathname))
  );
}
