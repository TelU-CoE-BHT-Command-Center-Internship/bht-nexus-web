const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3001/api/v1";

const CSRF_COOKIE_NAME = "csrf_token";
const CSRF_HEADER_NAME = "x-csrf-token";

type ApiEnvelope<T> =
  | {
      success: true;
      statusCode: number;
      message: string;
      data: T;
      meta?: unknown;
    }
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

  constructor(status: number, code: string, message: string, errors?: unknown) {
    super(message);
    this.name = "ApiRequestError";
    this.status = status;
    this.code = code;
    this.errors = errors;
  }
}

function readCookie(name: string): string | undefined {
  if (typeof document === "undefined") {
    return undefined;
  }
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : undefined;
}

// ponytail: nexus-server sets csrf_token as httpOnly, so this header can
// never actually be populated by a browser client until that's fixed
// server-side. Left wired so it activates automatically, no frontend change
// needed, once the cookie stops being httpOnly.
export async function apiFetch<T>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const method = (init.method ?? "GET").toUpperCase();
  const headers = new Headers(init.headers);
  headers.set("Accept", "application/json");
  if (init.body !== undefined && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  if (method !== "GET" && method !== "HEAD") {
    const csrfToken = readCookie(CSRF_COOKIE_NAME);
    if (csrfToken !== undefined) {
      headers.set(CSRF_HEADER_NAME, csrfToken);
    }
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers,
    credentials: "include",
  });

  const body = (await response
    .json()
    .catch(() => null)) as ApiEnvelope<T> | null;

  if (body === null) {
    throw new ApiRequestError(
      response.status,
      "INVALID_RESPONSE",
      response.statusText,
    );
  }
  if (!body.success) {
    throw new ApiRequestError(
      body.statusCode,
      body.code,
      body.message,
      body.errors,
    );
  }

  return body.data;
}
