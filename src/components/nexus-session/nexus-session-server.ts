import "server-only";
import { headers } from "next/headers";
import { cache } from "react";
import { NexusApiError } from "@/components/nexus-api/nexus-api-error";
import { nexusServerApiRequest } from "@/components/nexus-api/nexus-api-server";
import {
  type NexusServerProfile,
  type NexusSession,
  nexusSessionFromProfile,
} from "@/components/nexus-session/nexus-session-model";
import {
  NEXUS_REQUEST_PATH_HEADER,
  nexusSessionCookieNames,
} from "@/components/nexus-session/nexus-session-routes";

export type NexusSessionResolution =
  | { kind: "AUTHENTICATED"; session: NexusSession }
  | { kind: "UNAUTHENTICATED"; requestPath?: string }
  | { code: string; kind: "UNAVAILABLE" };

function hasSessionCookie(cookieHeader: string) {
  return nexusSessionCookieNames.some((name) =>
    cookieHeader.split(/;\s*/).some((entry) => entry.startsWith(`${name}=`)),
  );
}

/**
 * Menyelesaikan sesi sekali per permintaan render. Sumbernya selalu layanan
 * BHT Nexus: cookie tanpa sesi yang sah dianggap belum masuk, sedangkan
 * layanan yang tidak dapat dihubungi dibedakan agar tidak menjadi putaran
 * pengalihan ke halaman masuk.
 */
export const resolveNexusSession = cache(
  async (): Promise<NexusSessionResolution> => {
    const requestHeaders = await headers();
    const cookieHeader = requestHeaders.get("cookie") ?? "";
    const requestPath =
      requestHeaders.get(NEXUS_REQUEST_PATH_HEADER) ?? undefined;

    if (!hasSessionCookie(cookieHeader)) {
      return { kind: "UNAUTHENTICATED", requestPath };
    }

    try {
      const profile = await nexusServerApiRequest<NexusServerProfile>(
        "/profile/me",
        cookieHeader,
      );
      return {
        kind: "AUTHENTICATED",
        session: nexusSessionFromProfile(profile),
      };
    } catch (error) {
      if (error instanceof NexusApiError && error.status === 401) {
        return { kind: "UNAUTHENTICATED", requestPath };
      }
      return {
        code: error instanceof NexusApiError ? error.code : "UNKNOWN",
        kind: "UNAVAILABLE",
      };
    }
  },
);
