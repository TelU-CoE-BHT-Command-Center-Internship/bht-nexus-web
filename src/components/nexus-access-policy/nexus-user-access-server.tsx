"use client";

import { useCallback, useRef, useState } from "react";
import type {
  NexusRoleRecord,
  NexusUserPermissionOverride,
} from "@/components/nexus-access-policy/nexus-access-policy";
import {
  NexusAccessPolicySessionProvider,
  type NexusAccountOverrideDraft,
} from "@/components/nexus-access-policy/nexus-access-policy-session";
import {
  type NexusPermissionMatrixModule,
  permissionMatrixModules,
} from "@/components/nexus-access-policy/nexus-role-server";
import { NexusUserAccess } from "@/components/nexus-access-policy/nexus-user-access";
import { NexusAccountSessionProvider } from "@/components/nexus-account-session/nexus-account-session";
import type { NexusAccountDirectoryRecord } from "@/components/nexus-accounts/nexus-account-directory";
import {
  nexusAccountFromServer,
  nexusAccountRoleId,
  nexusAccountRoles,
  nexusLinkedMemberFromAccount,
} from "@/components/nexus-accounts/nexus-account-server";
import type { NexusAdministrationCapabilities } from "@/components/nexus-dashboard-shell/nexus-workspace-access";
import { NexusMemberSessionProvider } from "@/components/nexus-member-session/nexus-member-session";
import { nexusMemberFromSummary } from "@/components/nexus-members/nexus-member-server";
import type { NexusMemberRecord } from "@/components/nexus-members/nexus-members-content";
import { useNexusReviewSession } from "@/components/nexus-review-session/nexus-review-session";
import { NexusWorkspaceButton } from "@/components/nexus-workspace-ui/nexus-workspace-elements";
import { NexusWorkspacePage } from "@/components/nexus-workspace-ui/nexus-workspace-page";
import { NexusWorkspaceState } from "@/components/nexus-workspace-ui/nexus-workspace-state";
import {
  type AccountPermissionEntry,
  getAccountPermissions,
  listAllAccounts,
  overrideAccountPermissions,
} from "@/lib/api-accounts";
import { apiErrorMessage, whenForbidden } from "@/lib/api-client";
import { listAllMembers } from "@/lib/api-members";
import { useLoadEffect } from "@/lib/use-load-effect";

/**
 * Halaman Akses Khusus Pengguna di atas izin akun dari server. Setiap baris
 * mewakili satu izin server: asalnya dari peran, penyesuaian khusus akun, dan
 * hasil akhirnya dibaca apa adanya.
 */

const PAGE_TITLE = "Akses Khusus Pengguna";
const PAGE_DESCRIPTION =
  "Sesuaikan hak akses satu akun terhadap hak akses bawaan perannya.";

const overrideModes = {
  granted_override: "GRANT",
  revoked_override: "DENY",
} as const;

function overridesFromServer(
  accountId: string,
  permissions: readonly AccountPermissionEntry[],
): NexusUserPermissionOverride[] {
  return permissions.flatMap((permission) =>
    permission.overrideStatus === "inherited"
      ? []
      : [
          {
            accountId,
            mode: overrideModes[permission.overrideStatus],
            permissionId: permission.name,
          },
        ],
  );
}

/** Penyesuaian sebagaimana dipahami server: tambah, batasi, atau ikuti peran. */
function storedGrant(permission: AccountPermissionEntry) {
  if (permission.overrideStatus === "granted_override") return true;
  if (permission.overrideStatus === "revoked_override") return false;
  return null;
}

const acceptsEveryPermission = () => true;

type UserAccessDirectory = {
  accounts: NexusAccountDirectoryRecord[];
  members: NexusMemberRecord[];
  modules: NexusPermissionMatrixModule[];
  overrides: NexusUserPermissionOverride[];
  roles: NexusRoleRecord[];
};

function useNexusUserAccessDirectory(
  accountId: string | undefined,
  canReadMembers: boolean,
) {
  const [directory, setDirectory] = useState<UserAccessDirectory>();
  const [state, setState] = useState<"error" | "loading" | "ready">("loading");
  const [errorMessage, setErrorMessage] = useState<string>();
  const [version, setVersion] = useState(0);
  const latestRequest = useRef(0);
  /* Izin akun sebagaimana terakhir dijawab server; dasar perbandingan saat
     penyesuaian berikutnya disimpan. */
  const storedPermissions = useRef<readonly AccountPermissionEntry[]>([]);

  const load = useCallback(() => {
    const request = ++latestRequest.current;
    setState("loading");
    Promise.all([
      listAllAccounts(),
      canReadMembers
        ? listAllMembers().catch(whenForbidden(undefined))
        : Promise.resolve(undefined),
    ])
      .then(async ([accounts, members]) => {
        const account = accounts.find(
          (candidate) => candidate.publicId === accountId,
        );
        // Akun yang tidak dikenal ditangani halaman sebagai tautan tidak berlaku.
        const permissions = account
          ? (await getAccountPermissions(account.publicId)).permissions
          : [];
        if (request !== latestRequest.current) return;
        storedPermissions.current = permissions;
        const accountRoleId = account ? nexusAccountRoleId(account) : undefined;
        const inherited = permissions
          .filter((permission) => permission.isInherited)
          .map((permission) => permission.name);
        setDirectory({
          accounts: accounts.map((candidate) =>
            nexusAccountFromServer(candidate, members !== undefined),
          ),
          members: members
            ? members.map(nexusMemberFromSummary)
            : accounts.flatMap(nexusLinkedMemberFromAccount),
          modules: permissionMatrixModules(permissions),
          overrides: account
            ? overridesFromServer(account.publicId, permissions)
            : [],
          /* Hak bawaan akun ini dibaca dari jawaban izinnya sendiri, sehingga
             tetap benar untuk akun yang memegang lebih dari satu peran. */
          roles: nexusAccountRoles(accounts).map((role) =>
            role.id === accountRoleId
              ? { ...role, permissions: inherited }
              : role,
          ),
        });
        setVersion((current) => current + 1);
        setState("ready");
      })
      .catch((error: unknown) => {
        if (request !== latestRequest.current) return;
        setErrorMessage(
          apiErrorMessage(error, "Akses khusus akun belum dapat dimuat."),
        );
        setState("error");
      });
  }, [accountId, canReadMembers]);

  useLoadEffect(load);

  /** Mengirim hanya izin yang penyesuaiannya berubah terhadap keadaan tersimpan. */
  const saveOverrides = useCallback(
    async (
      targetAccountId: string,
      drafts: readonly NexusAccountOverrideDraft[],
    ) => {
      const desired = new Map(
        drafts.map((draft) => [draft.permissionId, draft.mode === "GRANT"]),
      );
      const changes = storedPermissions.current.flatMap((permission) => {
        const isGranted = desired.get(permission.name) ?? null;
        return isGranted === storedGrant(permission)
          ? []
          : [{ isGranted, permissionPublicId: permission.publicId }];
      });
      if (changes.length === 0) return;
      try {
        const stored = await overrideAccountPermissions(
          targetAccountId,
          changes,
        );
        storedPermissions.current = stored.permissions;
      } catch (error) {
        throw new Error(
          apiErrorMessage(error, "Akses khusus belum dapat disimpan."),
        );
      }
    },
    [],
  );

  return {
    directory,
    errorMessage,
    retry: load,
    saveOverrides,
    state,
    version,
  };
}

type NexusUserAccessLiveProps = {
  /** Direktori Anggota boleh dibaca akun ini, sehingga nama anggota dapat ditampilkan. */
  canReadMembers: boolean;
  capabilities: NexusAdministrationCapabilities;
  initialAccountId?: string;
};

export function NexusUserAccessLive({
  canReadMembers,
  capabilities,
  initialAccountId,
}: NexusUserAccessLiveProps) {
  const { directory, errorMessage, retry, saveOverrides, state, version } =
    useNexusUserAccessDirectory(initialAccountId, canReadMembers);
  const { actor } = useNexusReviewSession();

  if (!directory) {
    return (
      <NexusWorkspacePage
        description={PAGE_DESCRIPTION}
        descriptionId="user-access-loading-description"
        title={PAGE_TITLE}
        titleId="user-access-loading-title"
      >
        {state === "error" ? (
          <NexusWorkspaceState
            actions={
              <NexusWorkspaceButton onClick={retry} type="button">
                Coba lagi
              </NexusWorkspaceButton>
            }
            description={
              errorMessage ?? "Akses khusus akun belum dapat dimuat."
            }
            eyebrow="Gagal memuat"
            title="Akses khusus belum dapat dimuat"
            tone="danger"
          />
        ) : (
          <NexusWorkspaceState
            description="Akun, peran, dan izin akun sedang dibaca."
            eyebrow="Memuat"
            title="Memuat akses khusus…"
          />
        )}
      </NexusWorkspacePage>
    );
  }

  return (
    /* Sesi halaman diisi ulang setiap izin akun dibaca lagi. */
    <NexusMemberSessionProvider
      initialRecords={directory.members}
      key={version}
    >
      <NexusAccessPolicySessionProvider
        initialOverrides={directory.overrides}
        initialRoles={directory.roles}
        isKnownPermission={acceptsEveryPermission}
      >
        <NexusAccountSessionProvider
          actor={actor}
          initialAccounts={directory.accounts}
        >
          <NexusUserAccess
            capabilities={capabilities}
            initialAccountId={initialAccountId}
            modules={directory.modules}
            onSaveOverrides={saveOverrides}
          />
        </NexusAccountSessionProvider>
      </NexusAccessPolicySessionProvider>
    </NexusMemberSessionProvider>
  );
}
