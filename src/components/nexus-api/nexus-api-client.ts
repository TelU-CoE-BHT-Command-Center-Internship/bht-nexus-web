import {
  NexusApiError,
  nexusApiErrorFromResponse,
  nexusApiErrorFromUnknown,
  nexusLocalApiErrorCodes,
} from "@/components/nexus-api/nexus-api-error";

/**
 * Satu klien peramban untuk layanan BHT Nexus. Semua permintaan melewati asal
 * ruang kerja (`/api/*`), membawa cookie sesi yang sama, menyertakan token
 * CSRF untuk perubahan data, dan mengembalikan kegagalan sebagai
 * `NexusApiError`. Token sesi tidak pernah dibaca atau disimpan oleh kode ini.
 */

const CSRF_COOKIE_NAME = "csrf_token";
const CSRF_HEADER_NAME = "x-csrf-token";
const REQUEST_TIMEOUT_MS = 15_000;

export type NexusApiPaginationMeta = {
  limit: number;
  page: number;
  total: number;
  totalPages: number;
};

type NexusApiMethod = "DELETE" | "GET" | "PATCH" | "POST" | "PUT";

type NexusApiRequestOptions = {
  body?: unknown;
  method?: NexusApiMethod;
  query?: Record<string, boolean | number | string | undefined>;
  signal?: AbortSignal;
};

type SessionExpiredListener = () => void;

const sessionExpiredListeners = new Set<SessionExpiredListener>();

/**
 * Penyedia sesi mendaftarkan penanganan sesi berakhir di sini. Permintaan
 * data yang ditolak karena sesi tidak lagi sah memanggilnya sekali.
 */
export function onNexusSessionExpired(listener: SessionExpiredListener) {
  sessionExpiredListeners.add(listener);
  return () => {
    sessionExpiredListeners.delete(listener);
  };
}

function readCookie(name: string) {
  const match = document.cookie
    .split("; ")
    .find((entry) => entry.startsWith(`${name}=`));
  return match ? decodeURIComponent(match.slice(name.length + 1)) : undefined;
}

/**
 * Layanan menanam token CSRF pada respons apa pun. Bila peramban belum
 * memilikinya, satu permintaan ringan dipakai untuk mendapatkannya lebih dulu.
 */
async function ensureCsrfToken(signal?: AbortSignal) {
  const existing = readCookie(CSRF_COOKIE_NAME);
  if (existing) return existing;
  await fetch("/api/auth/ok", {
    cache: "no-store",
    credentials: "same-origin",
    signal,
  }).catch(() => null);
  return readCookie(CSRF_COOKIE_NAME);
}

function buildUrl(path: string, query?: NexusApiRequestOptions["query"]) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query ?? {})) {
    if (value !== undefined) params.set(key, String(value));
  }
  const search = params.toString();
  return `/api${path}${search ? `?${search}` : ""}`;
}

function isAuthPath(path: string) {
  return path.startsWith("/auth/");
}

async function request(path: string, options: NexusApiRequestOptions) {
  const method = options.method ?? "GET";
  const headers = new Headers({ Accept: "application/json" });
  if (options.body !== undefined) {
    headers.set("Content-Type", "application/json");
  }
  const controller = new AbortController();
  const timeoutId = window.setTimeout(
    () => controller.abort(new DOMException("Timeout", "TimeoutError")),
    REQUEST_TIMEOUT_MS,
  );
  const abortFromCaller = () => controller.abort(options.signal?.reason);
  options.signal?.addEventListener("abort", abortFromCaller, { once: true });
  const signal = controller.signal;

  try {
    if (method !== "GET") {
      const csrfToken = await ensureCsrfToken(signal);
      if (csrfToken) headers.set(CSRF_HEADER_NAME, csrfToken);
    }

    const response = await fetch(buildUrl(path, options.query), {
      body:
        options.body === undefined ? undefined : JSON.stringify(options.body),
      cache: "no-store",
      credentials: "same-origin",
      headers,
      method,
      signal,
    });

    if (!response.ok) {
      const error = await nexusApiErrorFromResponse(response);
      if (error.status === 401 && !isAuthPath(path)) {
        for (const listener of sessionExpiredListeners) listener();
      }
      throw error;
    }

    return (await response.json().catch(() => {
      throw new NexusApiError({
        code: nexusLocalApiErrorCodes.invalidResponse,
        status: response.status,
      });
    })) as unknown;
  } catch (error) {
    if (options.signal?.aborted) throw error;
    throw nexusApiErrorFromUnknown(
      signal.aborted && signal.reason instanceof DOMException
        ? signal.reason
        : error,
    );
  } finally {
    window.clearTimeout(timeoutId);
    options.signal?.removeEventListener("abort", abortFromCaller);
  }
}

function isEnvelope(
  value: unknown,
): value is { data: unknown; meta?: NexusApiPaginationMeta; success: true } {
  return (
    typeof value === "object" &&
    value !== null &&
    (value as { success?: unknown }).success === true &&
    "data" in value
  );
}

/**
 * Mengembalikan isi `data` dari amplop aplikasi, atau respons apa adanya untuk
 * rute autentikasi yang tidak memakai amplop.
 */
export async function nexusApiRequest<T>(
  path: string,
  options: NexusApiRequestOptions = {},
): Promise<T> {
  const body = await request(path, options);
  return (isEnvelope(body) ? body.data : body) as T;
}

export async function nexusApiRequestPage<T>(
  path: string,
  options: NexusApiRequestOptions = {},
): Promise<{ data: T[]; meta: NexusApiPaginationMeta }> {
  const body = await request(path, options);
  if (!isEnvelope(body) || !Array.isArray(body.data) || !body.meta) {
    throw new NexusApiError({
      code: nexusLocalApiErrorCodes.invalidResponse,
      status: 200,
    });
  }
  return { data: body.data as T[], meta: body.meta };
}
