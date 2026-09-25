"use client";

import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  getNexusRoleDirectory,
  type NexusRoleRecord,
} from "@/components/nexus-access-policy/nexus-access-policy";
import {
  getNexusAccountDirectory,
  type NexusAccountDirectoryRecord,
  type NexusAccountInvitationInput,
  type NexusAccountMemberRelationship,
  nexusAccountRelationshipMemberId,
} from "@/components/nexus-accounts/nexus-account-directory";
import type { NexusAdministrationMemberOption } from "@/components/nexus-administration/nexus-administration-content";
import {
  nexusApiRequest,
  nexusApiRequestPage,
} from "@/components/nexus-api/nexus-api-client";
import { NexusApiError } from "@/components/nexus-api/nexus-api-error";
import {
  nexusAccountStatusFromServer,
  nexusRoleLabel,
} from "@/components/nexus-session/nexus-session-model";
import { formatAuditTimestamp } from "@/components/nexus-workspace-ui/nexus-workspace-format";

/**
 * Direktori akun BHT Nexus untuk Administrasi. Sumbernya layanan server:
 * daftar akun, peran yang dapat ditetapkan, dan profil anggota yang dapat
 * ditautkan. Setiap perubahan dikirim ke layanan lebih dahulu dan direktori
 * dimuat ulang dari layanan, sehingga antarmuka tidak pernah menampilkan
 * hasil yang belum diterima server.
 */

export type NexusAccountDirectoryStatus =
  | "error"
  | "idle"
  | "loading"
  | "ready";

type NexusAccountSessionValue = {
  accounts: NexusAccountDirectoryRecord[];
  createInvitation: (
    input: NexusAccountInvitationInput,
  ) => Promise<NexusAccountDirectoryRecord>;
  directoryError?: NexusApiError;
  directoryStatus: NexusAccountDirectoryStatus;
  /** Memulai pemuatan direktori bila belum pernah dimuat. */
  ensureDirectory: () => void;
  /** Profil anggota yang dapat ditautkan ke akun. */
  memberOptions: NexusAdministrationMemberOption[];
  /** Memuat ulang dari layanan; tanpa hasil bila pemuatan gagal. */
  reloadDirectory: () => Promise<NexusAccountDirectoryRecord[] | undefined>;
  restoreAccount: (accountId: string) => Promise<void>;
  /** Peran yang tercatat pada layanan dan dapat ditetapkan ke akun. */
  roles: NexusRoleRecord[];
  /** "live" untuk akun layanan; "preview" untuk data contoh rancangan. */
  source: "live" | "preview";
  suspendAccount: (accountId: string) => Promise<void>;
  updateRelationship: (
    accountId: string,
    relationship: NexusAccountMemberRelationship,
  ) => Promise<void>;
  updateRole: (accountId: string, roleId: string) => Promise<void>;
};

type ServerAccountSummary = {
  createdAt?: string;
  email: string;
  emailVerified: boolean;
  linkedMember: { publicId: string } | null;
  name: string;
  publicId: string;
  roles: { name: string; publicId: string }[];
  status: string;
};

type ServerRole = {
  description: Record<string, unknown> | null;
  displayName: Record<string, unknown> | null;
  name: string;
  publicId: string;
  type: string;
};

type ServerMemberSummary = {
  accountAccess?: { kind: "CONFLICT" | "LINKED" | "NONE" };
  coeAssignment?: string | null;
  name: string;
  primaryUnit?: string;
  publicId: string;
};

const PAGE_LIMIT = 100;

const NexusAccountSessionContext =
  createContext<NexusAccountSessionValue | null>(null);

async function requestAllPages<T>(path: string) {
  const items: T[] = [];
  for (let page = 1; ; page += 1) {
    const result = await nexusApiRequestPage<T>(path, {
      query: { limit: PAGE_LIMIT, page },
    });
    items.push(...result.data);
    if (page >= result.meta.totalPages || result.data.length === 0) {
      return items;
    }
  }
}

/** Daftar pelengkap yang ditolak karena izin dibaca sebagai daftar kosong. */
async function requestOptionalPages<T>(path: string) {
  try {
    return await requestAllPages<T>(path);
  } catch (error) {
    if (error instanceof NexusApiError && error.status === 403) return [];
    throw error;
  }
}

function localizedText(value: Record<string, unknown> | null | undefined) {
  const text = value?.id;
  return typeof text === "string" ? text.trim() : "";
}

function accountFromServer(
  account: ServerAccountSummary,
): NexusAccountDirectoryRecord {
  return {
    createdAt: account.createdAt ? formatAuditTimestamp(account.createdAt) : "",
    createdBy: "",
    displayName: account.name,
    email: account.email,
    id: account.publicId,
    personalProfile: { fullName: account.name },
    relationship: account.linkedMember
      ? { kind: "LINKED", memberId: account.linkedMember.publicId }
      : { kind: "NON_MEMBER" },
    roleId: account.roles[0]?.name,
    status: nexusAccountStatusFromServer(account.status),
    updatedAt: "",
  };
}

function roleFromServer(role: ServerRole): NexusRoleRecord {
  return {
    description:
      localizedText(role.description) ||
      "Hak akses peran ini diatur oleh pengelola BHT Nexus.",
    id: role.name,
    kind: role.type === "system" ? "SYSTEM" : "CUSTOM",
    label: nexusRoleLabel(role.name, role.displayName),
    permissions: [],
    status: "ACTIVE",
  };
}

function memberFromServer(
  member: ServerMemberSummary,
): NexusAdministrationMemberOption {
  return {
    assignment: member.coeAssignment?.trim() || member.primaryUnit || "",
    id: member.publicId,
    name: member.name,
  };
}

function displayNameFromInvitation(input: NexusAccountInvitationInput) {
  if (input.displayName.trim()) return input.displayName.trim();
  const emailName = input.email.split("@")[0] ?? "Akun undangan";
  return emailName
    .split(/[._-]+/)
    .filter(Boolean)
    .map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1)}`)
    .join(" ");
}

export function NexusAccountSessionProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [accounts, setAccounts] = useState<NexusAccountDirectoryRecord[]>([]);
  const [serverRoles, setServerRoles] = useState<ServerRole[]>([]);
  const [memberOptions, setMemberOptions] = useState<
    NexusAdministrationMemberOption[]
  >([]);
  const [directoryStatus, setDirectoryStatus] =
    useState<NexusAccountDirectoryStatus>("idle");
  const [directoryError, setDirectoryError] = useState<NexusApiError>();
  const loadRequest = useRef<Promise<
    NexusAccountDirectoryRecord[] | undefined
  > | null>(null);

  const reloadDirectory = useCallback(() => {
    if (loadRequest.current) return loadRequest.current;
    setDirectoryStatus((current) =>
      current === "ready" ? current : "loading",
    );
    const request = (async () => {
      try {
        const [nextAccounts, nextRoles, nextMembers] = await Promise.all([
          requestAllPages<ServerAccountSummary>("/admin/accounts"),
          requestOptionalPages<ServerRole>("/roles"),
          requestOptionalPages<ServerMemberSummary>("/members"),
        ]);
        const records = nextAccounts.map(accountFromServer);
        setAccounts(records);
        setServerRoles(nextRoles);
        setMemberOptions(nextMembers.map(memberFromServer));
        setDirectoryError(undefined);
        setDirectoryStatus("ready");
        return records;
      } catch (error) {
        setDirectoryError(
          error instanceof NexusApiError
            ? error
            : new NexusApiError({ code: "UNKNOWN", status: 0 }),
        );
        setDirectoryStatus("error");
        return undefined;
      } finally {
        loadRequest.current = null;
      }
    })();
    loadRequest.current = request;
    return request;
  }, []);

  const ensureDirectory = useCallback(() => {
    if (directoryStatus === "idle") void reloadDirectory();
  }, [directoryStatus, reloadDirectory]);

  const roles = useMemo(() => serverRoles.map(roleFromServer), [serverRoles]);

  const rolePublicId = useCallback(
    (roleId: string) => {
      const role = serverRoles.find((candidate) => candidate.name === roleId);
      if (!role) {
        throw new NexusApiError({ code: "ROLE_NOT_FOUND", status: 404 });
      }
      return role.publicId;
    },
    [serverRoles],
  );

  const createInvitation = useCallback(
    async (input: NexusAccountInvitationInput) => {
      const created = await nexusApiRequest<ServerAccountSummary>(
        "/admin/accounts/invite",
        {
          body: {
            email: input.email,
            memberPublicId:
              nexusAccountRelationshipMemberId(input.relationship) ?? null,
            name: displayNameFromInvitation(input),
            rolePublicId: rolePublicId(input.roleId),
          },
          method: "POST",
        },
      );
      const reloaded = await reloadDirectory();
      return (
        reloaded?.find((account) => account.id === created.publicId) ??
        accountFromServer(created)
      );
    },
    [reloadDirectory, rolePublicId],
  );

  const changeStatus = useCallback(
    async (accountId: string, status: "active" | "suspended") => {
      await nexusApiRequest(`/admin/accounts/${accountId}/status`, {
        body: { status },
        method: "PATCH",
      });
      await reloadDirectory();
    },
    [reloadDirectory],
  );

  const suspendAccount = useCallback(
    (accountId: string) => changeStatus(accountId, "suspended"),
    [changeStatus],
  );

  const restoreAccount = useCallback(
    (accountId: string) => changeStatus(accountId, "active"),
    [changeStatus],
  );

  const updateRole = useCallback(
    async (accountId: string, roleId: string) => {
      await nexusApiRequest(`/admin/accounts/${accountId}/role`, {
        body: { rolePublicId: rolePublicId(roleId) },
        method: "PATCH",
      });
      await reloadDirectory();
    },
    [reloadDirectory, rolePublicId],
  );

  const updateRelationship = useCallback(
    async (accountId: string, relationship: NexusAccountMemberRelationship) => {
      await nexusApiRequest(`/admin/accounts/${accountId}/link-member`, {
        body: {
          memberPublicId:
            nexusAccountRelationshipMemberId(relationship) ?? null,
        },
        method: "PATCH",
      });
      await reloadDirectory();
    },
    [reloadDirectory],
  );

  const value = useMemo<NexusAccountSessionValue>(
    () => ({
      accounts,
      createInvitation,
      directoryError,
      directoryStatus,
      ensureDirectory,
      memberOptions,
      reloadDirectory,
      restoreAccount,
      roles,
      source: "live",
      suspendAccount,
      updateRelationship,
      updateRole,
    }),
    [
      accounts,
      createInvitation,
      directoryError,
      directoryStatus,
      ensureDirectory,
      memberOptions,
      reloadDirectory,
      restoreAccount,
      roles,
      suspendAccount,
      updateRelationship,
      updateRole,
    ],
  );

  return (
    <NexusAccountSessionContext.Provider value={value}>
      {children}
    </NexusAccountSessionContext.Provider>
  );
}

function previewChangeUnavailable(): Promise<never> {
  return Promise.reject(
    new Error("Rancangan kebijakan akses tidak mengubah akun sebenarnya."),
  );
}

/**
 * Direktori contoh untuk halaman rancangan kebijakan akses (Peran dan Akses
 * Khusus). Datanya netral dan terpisah dari akun sebenarnya, sehingga
 * rancangan yang belum tersambung tidak pernah tercampur dengan akun nyata.
 */
export function NexusAccountDirectoryPreviewProvider({
  children,
}: {
  children: ReactNode;
}) {
  const value = useMemo<NexusAccountSessionValue>(
    () => ({
      accounts: getNexusAccountDirectory(),
      createInvitation: previewChangeUnavailable,
      directoryStatus: "ready",
      ensureDirectory: () => undefined,
      memberOptions: [],
      reloadDirectory: () => Promise.resolve(undefined),
      restoreAccount: previewChangeUnavailable,
      roles: getNexusRoleDirectory(),
      source: "preview",
      suspendAccount: previewChangeUnavailable,
      updateRelationship: previewChangeUnavailable,
      updateRole: previewChangeUnavailable,
    }),
    [],
  );

  return (
    <NexusAccountSessionContext.Provider value={value}>
      {children}
    </NexusAccountSessionContext.Provider>
  );
}

export function useNexusAccountSession() {
  const session = useContext(NexusAccountSessionContext);
  if (!session) {
    throw new Error(
      "useNexusAccountSession must be used inside NexusAccountSessionProvider",
    );
  }
  return session;
}

/** Untuk permukaan bersama yang juga dipakai ruang kerja tanpa direktori akun. */
export function useNexusAccountSessionIfAvailable() {
  return useContext(NexusAccountSessionContext);
}
