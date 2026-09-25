import "server-only";
import {
  NexusApiError,
  nexusApiErrorFromResponse,
  nexusApiErrorFromUnknown,
} from "@/components/nexus-api/nexus-api-error";

const SERVER_REQUEST_TIMEOUT_MS = 8_000;

/** Asal layanan BHT Nexus; hanya dibaca di server, tidak masuk bundel klien. */
export function nexusApiOrigin() {
  return process.env.BHT_NEXUS_API_ORIGIN || undefined;
}

/**
 * Permintaan server-ke-server atas nama pengguna yang sedang membuka halaman.
 * Cookie pengguna diteruskan apa adanya dan tidak pernah dicatat.
 */
export async function nexusServerApiRequest<T>(
  path: string,
  cookieHeader: string,
): Promise<T> {
  const origin = nexusApiOrigin();
  if (!origin) {
    throw new NexusApiError({ code: "SERVICE_NOT_CONFIGURED", status: 503 });
  }

  try {
    const response = await fetch(new URL(`/api${path}`, origin), {
      cache: "no-store",
      headers: { Accept: "application/json", Cookie: cookieHeader },
      signal: AbortSignal.timeout(SERVER_REQUEST_TIMEOUT_MS),
    });
    if (!response.ok) throw await nexusApiErrorFromResponse(response);

    const body = (await response.json()) as unknown;
    if (
      typeof body === "object" &&
      body !== null &&
      (body as { success?: unknown }).success === true &&
      "data" in body
    ) {
      return (body as { data: T }).data;
    }
    return body as T;
  } catch (error) {
    throw nexusApiErrorFromUnknown(error);
  }
}
