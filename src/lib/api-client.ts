import {
  announceWorkerUnavailable,
  WORKER_UNAVAILABLE_CODE,
} from "@/lib/worker-unavailable";

export const DEFAULT_API_BASE_URL = "http://localhost:3000/api";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? DEFAULT_API_BASE_URL;

const CSRF_COOKIE_NAME = "csrf_token";
const CSRF_HEADER_NAME = "x-csrf-token";

export type ApiPaginationMeta = {
  limit: number;
  page: number;
  total: number;
  totalPages: number;
};

type ApiSuccessEnvelope<T> = {
  success: true;
  statusCode: number;
  message: string;
  data: T;
  meta?: ApiPaginationMeta;
};

type ApiEnvelope<T> =
  | ApiSuccessEnvelope<T>
  | {
      success: false;
      statusCode: number;
      code: string;
      message: string;
      errors?: unknown;
      timestamp: string;
      path: string;
    };

export class ApiRequestError extends Error {
  code: string;
  status: number;
  errors?: unknown;
  retryAfterSeconds?: number;

  constructor(
    status: number,
    code: string,
    message: string,
    errors?: unknown,
    retryAfterSeconds?: number,
  ) {
    super(message);
    this.name = "ApiRequestError";
    this.status = status;
    this.code = code;
    this.errors = errors;
    this.retryAfterSeconds = retryAfterSeconds;
  }
}

/**
 * Keadaan produk yang dapat dibaca dari kegagalan permintaan. Status 0 berarti
 * permintaan tidak pernah sampai ke server (jaringan terputus atau layanan mati).
 */
export type ApiErrorKind =
  | "conflict"
  | "forbidden"
  | "not-found"
  | "rate-limited"
  | "unauthenticated"
  | "unavailable"
  | "unknown"
  | "validation";

export function apiErrorKind(error: unknown): ApiErrorKind {
  if (!(error instanceof ApiRequestError)) return "unknown";
  if (error.status === 0 || error.status >= 500) return "unavailable";
  if (error.status === 401) return "unauthenticated";
  if (error.status === 403) return "forbidden";
  if (error.status === 404) return "not-found";
  if (error.status === 409) return "conflict";
  if (error.status === 429) return "rate-limited";
  if (error.status === 400 || error.status === 422) return "validation";
  return "unknown";
}

/**
 * Untuk bacaan pelengkap sebuah halaman: penolakan akses diganti nilai
 * cadangan supaya halaman tetap tampil, sedangkan kegagalan lain tetap gagal.
 */
export function whenForbidden<T>(fallback: T) {
  return (error: unknown): T => {
    if (apiErrorKind(error) === "forbidden") return fallback;
    throw error;
  };
}

const apiErrorCopy = {
  en: {
    conflict:
      "This data changed or conflicts with another record. Reload and try again.",
    forbidden: "Your account is not allowed to perform this action.",
    "not-found": "The data was not found or is no longer available.",
    "rate-limited": "Too many attempts. Please try again in a moment.",
    unauthenticated: "Your session has ended. Please sign in again.",
    unavailable: "The service cannot be reached right now. Please try again.",
    validation: "Please check your input.",
  },
  id: {
    conflict:
      "Data sudah berubah atau bentrok dengan data lain. Muat ulang lalu coba lagi.",
    forbidden: "Akun Anda tidak memiliki izin untuk tindakan ini.",
    "not-found": "Data tidak ditemukan atau sudah tidak tersedia.",
    "rate-limited": "Terlalu banyak percobaan. Coba lagi dalam beberapa saat.",
    unauthenticated: "Sesi Anda telah berakhir. Silakan masuk kembali.",
    unavailable: "Layanan belum dapat dihubungi. Coba lagi beberapa saat lagi.",
    validation: "Periksa kembali isian Anda.",
  },
} as const;

/**
 * Pesan produk untuk kegagalan permintaan. Pesan validasi dari server dipakai
 * apa adanya karena menjelaskan isian yang perlu diperbaiki; keadaan lain
 * memakai kalimat produk supaya detail teknis tidak tampil ke pengguna.
 */
export function apiErrorMessage(
  error: unknown,
  fallback: string,
  locale: "en" | "id" = "id",
): string {
  const kind = apiErrorKind(error);
  if (kind === "unknown") return fallback;
  if (
    kind === "validation" &&
    error instanceof ApiRequestError &&
    error.message.trim() !== ""
  ) {
    return error.message;
  }
  return apiErrorCopy[locale][kind];
}

function readCookie(name: string): string | undefined {
  if (typeof document === "undefined") {
    return undefined;
  }
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : undefined;
}

// nexus-server sets csrf_token on any request, including a 404, since the
// middleware runs before routing. A visitor whose first request is a
// mutation (e.g. submitting sign-in cold) has no cookie yet, so prime one
// with a throwaway GET before attaching the header.
async function ensureCsrfToken(): Promise<string | undefined> {
  const existing = readCookie(CSRF_COOKIE_NAME);
  if (existing !== undefined) {
    return existing;
  }
  await fetch(API_BASE_URL, { credentials: "include" }).catch(() => null);
  return readCookie(CSRF_COOKIE_NAME);
}

export function nexusSignInHref(returnPath?: string): string {
  const isEnglish = returnPath?.startsWith("/en/") ?? false;
  const signInPath = isEnglish ? "/en/nexus/sign-in" : "/nexus/masuk";
  return returnPath
    ? `${signInPath}?next=${encodeURIComponent(returnPath)}`
    : signInPath;
}

/**
 * Sesi yang berakhir saat halaman sedang dipakai diarahkan ke halaman masuk,
 * lalu kembali ke halaman yang sama setelah pengguna masuk lagi.
 */
function redirectToSignIn() {
  if (typeof window === "undefined") return;
  const { pathname, search } = window.location;
  if (pathname === "/nexus/masuk" || pathname === "/en/nexus/sign-in") return;
  window.location.assign(nexusSignInHref(`${pathname}${search}`));
}

function retryAfterSeconds(response: Response): number | undefined {
  const value = Number(response.headers.get("Retry-After"));
  return Number.isFinite(value) && value > 0 ? value : undefined;
}

async function requestEnvelope<T>(
  path: string,
  init: RequestInit,
): Promise<ApiSuccessEnvelope<T>> {
  const method = (init.method ?? "GET").toUpperCase();
  const headers = new Headers(init.headers);
  headers.set("Accept", "application/json");
  if (
    init.body !== undefined &&
    !(init.body instanceof FormData) &&
    !headers.has("Content-Type")
  ) {
    headers.set("Content-Type", "application/json");
  }
  if (method !== "GET" && method !== "HEAD") {
    const csrfToken = await ensureCsrfToken();
    if (csrfToken !== undefined) {
      headers.set(CSRF_HEADER_NAME, csrfToken);
    }
  }

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...init,
      headers,
      credentials: "include",
    });
  } catch {
    throw new ApiRequestError(0, "NETWORK_ERROR", "Network request failed");
  }

  const parsed: unknown = await response.json().catch(() => null);

  // better-auth's own mounted routes (/auth/*) return their native response
  // shape directly, not wrapped in this app's {success, data} envelope - see
  // nexus-server's CLAUDE.md, dual-ID §2's accepted exception for these routes.
  if (path.startsWith("/auth/")) {
    if (!response.ok) {
      const errorBody =
        typeof parsed === "object" && parsed !== null
          ? (parsed as { message?: unknown; code?: unknown })
          : {};
      throw new ApiRequestError(
        response.status,
        typeof errorBody.code === "string" ? errorBody.code : "AUTH_ERROR",
        typeof errorBody.message === "string"
          ? errorBody.message
          : response.statusText,
        undefined,
        retryAfterSeconds(response),
      );
    }
    return {
      success: true,
      statusCode: response.status,
      message: "",
      data: parsed as T,
    };
  }

  const body =
    typeof parsed === "object" &&
    parsed !== null &&
    typeof (parsed as { success?: unknown }).success === "boolean"
      ? (parsed as ApiEnvelope<T>)
      : null;

  if (body === null) {
    throw new ApiRequestError(
      response.status,
      "INVALID_RESPONSE",
      response.statusText,
    );
  }
  if (!body.success) {
    if (body.statusCode === 401) {
      redirectToSignIn();
    }
    if (body.code === WORKER_UNAVAILABLE_CODE) {
      announceWorkerUnavailable(body.errors);
    }
    throw new ApiRequestError(
      body.statusCode,
      body.code,
      body.message,
      body.errors,
      retryAfterSeconds(response),
    );
  }

  return body;
}

export async function apiFetch<T>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const body = await requestEnvelope<T>(path, init);
  return body.data;
}

export async function apiFetchPaginated<T>(
  path: string,
  init: RequestInit = {},
): Promise<{ data: T[]; meta: ApiPaginationMeta }> {
  const body = await requestEnvelope<T[]>(path, init);
  if (body.meta === undefined) {
    throw new ApiRequestError(
      body.statusCode,
      "INVALID_RESPONSE",
      "Respons paginasi tidak menyertakan meta.",
    );
  }
  return { data: body.data, meta: body.meta };
}
