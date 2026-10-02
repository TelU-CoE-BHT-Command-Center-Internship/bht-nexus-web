import { cookies, headers } from "next/headers";
import { cache } from "react";
import { DEFAULT_API_BASE_URL } from "@/lib/api-client";
import type { NexusDataScope } from "@/lib/api-divisions";
import {
  NEXUS_REQUEST_PATH_HEADER,
  safeWorkspaceReturnPath,
} from "@/lib/nexus-request-path";

const API_BASE_URL =
  process.env.API_INTERNAL_BASE_URL ??
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  DEFAULT_API_BASE_URL;

/** Identitas akun yang sedang masuk, sebagaimana dijawab server. */
export type NexusSessionUser = {
  email: string;
  image?: string;
  name: string;
  /** `public_id` akun bila profil dapat dibaca; tidak pernah ID internal. */
  publicId?: string;
};

/**
 * Hasil penyelesaian sesi di server. `unavailable` dan `rate-limited` berarti
 * server belum dapat menjawab, sehingga pengguna tidak boleh dianggap keluar.
 * `roles` bernilai null bila peran akun belum dapat dibaca; `permissions`
 * bernilai null bila server belum menjawab izin efektif akun. `dataScope`
 * bernilai null bila server belum menjawab cakupan klaster akun.
 */
export type NexusServerSession =
  | { kind: "anonymous" }
  | { kind: "rate-limited" }
  | { kind: "unavailable" }
  | {
      dataScope: NexusDataScope | null;
      kind: "authenticated";
      permissions: readonly string[] | null;
      roles: readonly string[] | null;
      user: NexusSessionUser;
    };

type JsonResult = { body: unknown; status: number } | null;

/** Satu permintaan per alamat dan cookie dalam satu render server. */
const fetchJson = cache(
  async (path: string, cookieHeader: string): Promise<JsonResult> => {
    try {
      const response = await fetch(`${API_BASE_URL}${path}`, {
        cache: "no-store",
        headers: { Accept: "application/json", Cookie: cookieHeader },
      });
      const body: unknown = await response.json().catch(() => null);
      return { body, status: response.status };
    } catch {
      return null;
    }
  },
);

async function cookieHeader(): Promise<string> {
  return (await cookies())
    .getAll()
    .map((cookie) => `${cookie.name}=${cookie.value}`)
    .join("; ");
}

function text(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() !== "" ? value : undefined;
}

type ProfileData = {
  dataScope?: unknown;
  email?: unknown;
  image?: unknown;
  name?: unknown;
  permissions?: unknown;
  publicId?: unknown;
  roles?: unknown;
};

function profileData(result: JsonResult): ProfileData | null {
  const data = (result?.body as { data?: ProfileData } | null)?.data;
  return typeof data === "object" && data !== null ? data : null;
}

function rolesFrom(profile: ProfileData): readonly string[] | null {
  if (!Array.isArray(profile.roles)) return null;
  return profile.roles
    .map((role) => (role as { name?: unknown }).name)
    .filter((name): name is string => typeof name === "string");
}

function dataScopeFrom(profile: ProfileData): NexusDataScope | null {
  const scope = profile.dataScope as {
    division?: { code?: unknown; name?: unknown; publicId?: unknown } | null;
    kind?: unknown;
  } | null;
  if (typeof scope !== "object" || scope === null) return null;
  if (scope.kind === "all" || scope.kind === "none")
    return { kind: scope.kind };
  const division = scope.division;
  const publicId = text(division?.publicId);
  const name = text(division?.name);
  if (scope.kind !== "division" || !publicId || !name) return null;
  return {
    division: { code: text(division?.code) ?? null, name, publicId },
    kind: "division",
  };
}

function permissionsFrom(profile: ProfileData): readonly string[] | null {
  if (!Array.isArray(profile.permissions)) return null;
  return profile.permissions.filter(
    (name): name is string => typeof name === "string",
  );
}

function failureKind(result: JsonResult): NexusServerSession | null {
  if (result === null || result.status >= 500) return { kind: "unavailable" };
  if (result.status === 429) return { kind: "rate-limited" };
  if (result.status === 401) return { kind: "anonymous" };
  return null;
}

/**
 * Sesi dibaca dari profil akun (`/profile/me`): satu permintaan menjawab
 * identitas, peran, dan izin efektif. Server yang belum membuka profil untuk
 * akun biasa (403) tetap dilayani lewat `/auth/me`, tanpa informasi peran.
 */
async function resolveFromSessionEndpoint(
  cookies: string,
): Promise<NexusServerSession> {
  const result = await fetchJson("/auth/me", cookies);
  const failure = failureKind(result);
  if (failure) return failure;

  // /auth/me is a better-auth-mounted route - it returns {session, user}
  // directly (or null without a session), not this app's envelope.
  const body = result?.body as {
    session?: unknown;
    user?: Record<string, unknown>;
  } | null;
  if (
    result?.status !== 200 ||
    body === null ||
    body === undefined ||
    body.session === undefined ||
    body.user === undefined
  ) {
    return { kind: "anonymous" };
  }

  const email = text(body.user.email) ?? "";
  return {
    dataScope: null,
    kind: "authenticated",
    permissions: null,
    roles: null,
    user: {
      email,
      image: text(body.user.image),
      name: text(body.user.name) ?? email,
    },
  };
}

export const getServerSession = cache(async (): Promise<NexusServerSession> => {
  const cookies = await cookieHeader();
  if (cookies === "") {
    return { kind: "anonymous" };
  }

  const result = await fetchJson("/profile/me", cookies);
  const failure = failureKind(result);
  if (failure) return failure;

  const profile = result?.status === 200 ? profileData(result) : null;
  if (profile === null) {
    return resolveFromSessionEndpoint(cookies);
  }

  const email = text(profile.email) ?? "";
  return {
    dataScope: dataScopeFrom(profile),
    kind: "authenticated",
    permissions: permissionsFrom(profile),
    roles: rolesFrom(profile),
    user: {
      email,
      image: text(profile.image),
      name: text(profile.name) ?? email,
      publicId: text(profile.publicId),
    },
  };
});

/**
 * Isi `data` dari jawaban server untuk akun yang sedang masuk, atau `null`
 * bila server menolak atau tidak dapat dihubungi.
 */
export async function getServerData<T>(path: string): Promise<T | null> {
  const result = await fetchJson(path, await cookieHeader());
  if (result === null || result.status !== 200) return null;
  const data = (result.body as { data?: T } | null)?.data;
  return data ?? null;
}

/** Halaman ruang kerja yang sedang diminta, bila aman dipakai sebagai tujuan kembali. */
export async function getRequestPath(): Promise<string | undefined> {
  return safeWorkspaceReturnPath(
    (await headers()).get(NEXUS_REQUEST_PATH_HEADER),
  );
}
