import {
  type NexusApiError,
  nexusLocalApiErrorCodes,
  nexusRetryAfterMinutes,
} from "@/components/nexus-api/nexus-api-error";
import type { Locale } from "@/i18n/locales";

/**
 * Kosakata keadaan gagal pada alur akun. Kode layanan diterjemahkan ke kalimat
 * produk; pesan mentah layanan tidak pernah ditampilkan kepada pengguna.
 */
export type NexusAuthErrorKey =
  | "accountSuspended"
  | "accountUnavailable"
  | "codeExpired"
  | "currentPasswordInvalid"
  | "invalidCode"
  | "invalidCredentials"
  | "network"
  | "passwordCompromised"
  | "passwordTooLong"
  | "passwordTooShort"
  | "rateLimited"
  | "requestRejected"
  | "serviceUnavailable"
  | "tooManyAttempts";

const codeToKey: Record<string, NexusAuthErrorKey> = {
  ACCOUNT_SUSPENDED: "accountSuspended",
  ACCOUNT_UNAVAILABLE: "accountUnavailable",
  INVALID_EMAIL_OR_PASSWORD: "invalidCredentials",
  INVALID_OTP: "invalidCode",
  INVALID_PASSWORD: "currentPasswordInvalid",
  OTP_EXPIRED: "codeExpired",
  PASSWORD_COMPROMISED: "passwordCompromised",
  PASSWORD_TOO_LONG: "passwordTooLong",
  PASSWORD_TOO_SHORT: "passwordTooShort",
  SERVICE_NOT_CONFIGURED: "serviceUnavailable",
  TOO_MANY_ATTEMPTS: "tooManyAttempts",
};

export function nexusAuthErrorKey(error: NexusApiError): NexusAuthErrorKey {
  const known = codeToKey[error.code];
  if (known) return known;
  if (error.status === 429) return "rateLimited";
  if (
    error.status === 0 ||
    error.code === nexusLocalApiErrorCodes.network ||
    error.code === nexusLocalApiErrorCodes.timeout
  ) {
    return "network";
  }
  if (error.status >= 500) return "serviceUnavailable";
  return "requestRejected";
}

const messages: Record<Locale, Record<NexusAuthErrorKey, string>> = {
  en: {
    accountSuspended:
      "Your account is suspended. Contact the BHT Nexus administrator to restore access.",
    accountUnavailable:
      "This account is not available. Contact the BHT Nexus administrator.",
    codeExpired: "This code has expired. Request a new code.",
    currentPasswordInvalid: "Your current password is incorrect.",
    invalidCode: "The code is incorrect. Check the latest email and try again.",
    invalidCredentials: "The email or password is incorrect.",
    network:
      "BHT Nexus could not be reached. Check your connection and try again.",
    passwordCompromised:
      "This password has appeared in a public data breach. Choose a different password.",
    passwordTooLong: "The password is too long.",
    passwordTooShort: "Use at least 8 characters.",
    rateLimited: "Too many attempts. Try again in {minutes} minutes.",
    requestRejected:
      "The request could not be processed. Reload the page and try again.",
    serviceUnavailable:
      "The BHT Nexus service is not available right now. Try again shortly.",
    tooManyAttempts: "Too many incorrect codes. Request a new code.",
  },
  id: {
    accountSuspended:
      "Akun Anda sedang ditangguhkan. Hubungi pengelola BHT Nexus untuk memulihkan akses.",
    accountUnavailable: "Akun ini tidak tersedia. Hubungi pengelola BHT Nexus.",
    codeExpired: "Kode sudah kedaluwarsa. Minta kode baru.",
    currentPasswordInvalid: "Kata sandi saat ini tidak sesuai.",
    invalidCode: "Kode tidak sesuai. Periksa email terbaru lalu coba lagi.",
    invalidCredentials: "Email atau kata sandi tidak sesuai.",
    network: "BHT Nexus belum dapat dihubungi. Periksa koneksi lalu coba lagi.",
    passwordCompromised:
      "Kata sandi ini pernah muncul dalam kebocoran data publik. Gunakan kata sandi lain.",
    passwordTooLong: "Kata sandi terlalu panjang.",
    passwordTooShort: "Gunakan minimal 8 karakter.",
    rateLimited: "Terlalu banyak percobaan. Coba lagi dalam {minutes} menit.",
    requestRejected:
      "Permintaan tidak dapat diproses. Muat ulang halaman lalu coba lagi.",
    serviceUnavailable:
      "Layanan BHT Nexus sedang tidak tersedia. Coba lagi beberapa saat lagi.",
    tooManyAttempts: "Terlalu banyak kode yang salah. Minta kode baru.",
  },
};

export function nexusAuthErrorMessage(error: NexusApiError, locale: Locale) {
  const key = nexusAuthErrorKey(error);
  return messages[locale][key].replace(
    "{minutes}",
    String(nexusRetryAfterMinutes(error) ?? 15),
  );
}

/** Batas kata sandi mengikuti kebijakan layanan (8–128 karakter). */
export const NEXUS_PASSWORD_MIN_LENGTH = 8;
export const NEXUS_PASSWORD_MAX_LENGTH = 128;
