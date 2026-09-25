/**
 * Kegagalan dari layanan BHT Nexus dalam satu bentuk. Layanan memakai dua
 * bentuk respons gagal: amplop aplikasi `{ success: false, statusCode, code,
 * message, errors }` dan respons autentikasi `{ code, message }`. Keduanya
 * dinormalkan menjadi kode yang stabil; pesan mentah layanan tidak pernah
 * ditampilkan apa adanya kepada pengguna.
 */
export class NexusApiError extends Error {
  readonly code: string;
  readonly retryAfterSeconds?: number;
  readonly status: number;

  constructor({
    code,
    message,
    retryAfterSeconds,
    status,
  }: {
    code: string;
    message?: string;
    retryAfterSeconds?: number;
    status: number;
  }) {
    super(message ?? code);
    this.name = "NexusApiError";
    this.code = code;
    this.status = status;
    this.retryAfterSeconds = retryAfterSeconds;
  }
}

/** Kode yang dibuat antarmuka ketika layanan tidak memberi respons terbaca. */
export const nexusLocalApiErrorCodes = {
  invalidResponse: "INVALID_RESPONSE",
  network: "NETWORK_ERROR",
  timeout: "REQUEST_TIMEOUT",
} as const;

function codeForStatus(status: number) {
  if (status === 400) return "BAD_REQUEST";
  if (status === 401) return "UNAUTHORIZED";
  if (status === 403) return "FORBIDDEN";
  if (status === 404) return "NOT_FOUND";
  if (status === 409) return "CONFLICT";
  if (status === 422) return "VALIDATION_ERROR";
  if (status === 429) return "TOO_MANY_REQUESTS";
  return "SERVICE_UNAVAILABLE";
}

function positiveNumber(value: unknown) {
  const number = typeof value === "string" ? Number(value) : value;
  return typeof number === "number" && Number.isFinite(number) && number > 0
    ? Math.ceil(number)
    : undefined;
}

export async function nexusApiErrorFromResponse(response: Response) {
  const body: unknown = await response.json().catch(() => null);
  const record =
    typeof body === "object" && body !== null
      ? (body as Record<string, unknown>)
      : {};
  const errors =
    typeof record.errors === "object" && record.errors !== null
      ? (record.errors as Record<string, unknown>)
      : {};
  const code =
    typeof record.code === "string" && record.code
      ? record.code
      : codeForStatus(response.status);

  return new NexusApiError({
    code,
    message: typeof record.message === "string" ? record.message : undefined,
    retryAfterSeconds:
      positiveNumber(response.headers.get("Retry-After")) ??
      positiveNumber(response.headers.get("X-Retry-After")) ??
      positiveNumber(errors.retryAfter),
    status: response.status,
  });
}

export function nexusApiErrorFromUnknown(error: unknown) {
  if (error instanceof NexusApiError) return error;
  if (error instanceof DOMException && error.name === "TimeoutError") {
    return new NexusApiError({
      code: nexusLocalApiErrorCodes.timeout,
      status: 0,
    });
  }
  return new NexusApiError({
    code: nexusLocalApiErrorCodes.network,
    status: 0,
  });
}

/** Menit tunggu yang dapat dibaca manusia dari `Retry-After`. */
export function nexusRetryAfterMinutes(error: NexusApiError) {
  return error.retryAfterSeconds
    ? Math.max(1, Math.ceil(error.retryAfterSeconds / 60))
    : undefined;
}
