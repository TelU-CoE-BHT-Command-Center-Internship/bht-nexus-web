"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import type { NexusRoleRecord } from "@/components/nexus-access-policy/nexus-access-policy";
import { NexusAccessPolicySessionProvider } from "@/components/nexus-access-policy/nexus-access-policy-session";
import {
  type NexusPermissionMatrixModule,
  nexusRoleFromServer,
  nexusServerRoleGrants,
  nexusSortServerRoles,
  permissionMatrixModules,
} from "@/components/nexus-access-policy/nexus-role-server";
import { NexusAccountSessionProvider } from "@/components/nexus-account-session/nexus-account-session";
import type { NexusAccountDirectoryRecord } from "@/components/nexus-accounts/nexus-account-directory";
import {
  nexusAccountFromServer,
  nexusAccountRemote,
  nexusAccountRoles,
  nexusLinkedMemberFromAccount,
} from "@/components/nexus-accounts/nexus-account-server";
import { useNexusAccountSpecialAccess } from "@/components/nexus-accounts/nexus-account-special-access";
import {
  NexusAdministration,
  type NexusAdministrationProps,
} from "@/components/nexus-administration/nexus-administration";
import { NexusMemberSessionProvider } from "@/components/nexus-member-session/nexus-member-session";
import { nexusMemberFromSummary } from "@/components/nexus-members/nexus-member-server";
import type { NexusMemberRecord } from "@/components/nexus-members/nexus-members-content";
import { useNexusReviewSession } from "@/components/nexus-review-session/nexus-review-session";
import { NexusWorkspaceButton } from "@/components/nexus-workspace-ui/nexus-workspace-elements";
import { NexusWorkspacePage } from "@/components/nexus-workspace-ui/nexus-workspace-page";
import { NexusWorkspaceState } from "@/components/nexus-workspace-ui/nexus-workspace-state";
import { listAllAccounts } from "@/lib/api-accounts";
import { apiErrorMessage, whenForbidden } from "@/lib/api-client";
import { listAllMembers } from "@/lib/api-members";
import { listPermissions } from "@/lib/api-permissions";
import { listRoles } from "@/lib/api-roles";
import { useLoadEffect } from "@/lib/use-load-effect";

/**
 * Halaman Administrasi di atas akun nyata. Akun, peran, dan hubungan anggota
 * dibaca dari server lalu mengisi sesi halaman, sehingga tampilan dan perilaku
 * halamannya tetap sama.
 */

type AccountDirectory = {
  accessModules?: NexusPermissionMatrixModule[];
  accounts: NexusAccountDirectoryRecord[];
  members: NexusMemberRecord[];
  /** Direktori Anggota benar-benar terbaca, bukan disusun dari daftar akun. */
  membersKnown: boolean;
  roles: NexusRoleRecord[];
};

function useNexusAccountDirectory(canReadMembers: boolean) {
  const [directory, setDirectory] = useState<AccountDirectory>();
  const [state, setState] = useState<"error" | "loading" | "ready">("loading");
  const [errorMessage, setErrorMessage] = useState<string>();
  const [version, setVersion] = useState(0);
  const latestRequest = useRef(0);

  const load = useCallback(() => {
    const request = ++latestRequest.current;
    setState("loading");
    Promise.all([
      listAllAccounts(),
      listRoles({ limit: 100 }).catch(whenForbidden(undefined)),
      listPermissions({ limit: 100 }).catch(whenForbidden(undefined)),
      canReadMembers
        ? listAllMembers().catch(whenForbidden(undefined))
        : Promise.resolve(undefined),
    ])
      .then(async ([accounts, roleResult, permissionResult, members]) => {
        const catalogue = roleResult
          ? await Promise.all(
              nexusSortServerRoles(roleResult.data).map(async (role) =>
                nexusRoleFromServer(
                  role,
                  await nexusServerRoleGrants(role.publicId).catch(
                    whenForbidden([]),
                  ),
                ),
              ),
            )
          : undefined;
        if (request !== latestRequest.current) return;
        setDirectory({
          accessModules:
            roleResult && permissionResult
              ? permissionMatrixModules(permissionResult.data)
              : undefined,
          accounts: accounts.map((account) =>
            nexusAccountFromServer(account, members !== undefined),
          ),
          members: members
            ? members.map(nexusMemberFromSummary)
            : accounts.flatMap(nexusLinkedMemberFromAccount),
          membersKnown: members !== undefined,
          roles: nexusAccountRoles(accounts, catalogue),
        });
        setVersion((current) => current + 1);
        setState("ready");
      })
      .catch((error: unknown) => {
        if (request !== latestRequest.current) return;
        setErrorMessage(
          apiErrorMessage(error, "Daftar akun belum dapat dimuat."),
        );
        setState("error");
      });
  }, [canReadMembers]);

  useLoadEffect(load);

  return { directory, errorMessage, retry: load, state, version };
}

type NexusAdministrationLiveProps = Omit<
  NexusAdministrationProps,
  "accessModules" | "membersReadable" | "specialAccess"
> & {
  /** Direktori Anggota boleh dibaca akun ini, sehingga nama anggota dapat ditampilkan. */
  canReadMembers: boolean;
};

export function NexusAdministrationLive({
  canReadMembers,
  ...props
}: NexusAdministrationLiveProps) {
  const { directory, errorMessage, retry, state, version } =
    useNexusAccountDirectory(canReadMembers);
  const specialAccess = useNexusAccountSpecialAccess(
    props.capabilities.canManageUserOverrides,
  );
  const { actor } = useNexusReviewSession();
  const membersKnown = directory?.membersKnown ?? false;
  const remote = useMemo(
    () => nexusAccountRemote(membersKnown),
    [membersKnown],
  );

  if (!directory) {
    return (
      <NexusWorkspacePage
        description={props.content.description}
        descriptionId="administration-loading-description"
        title={props.content.title}
        titleId="administration-loading-title"
      >
        {state === "error" ? (
          <NexusWorkspaceState
            actions={
              <NexusWorkspaceButton onClick={retry} type="button">
                Coba lagi
              </NexusWorkspaceButton>
            }
            description={errorMessage ?? "Daftar akun belum dapat dimuat."}
            eyebrow="Gagal memuat"
            title="Daftar akun belum dapat dimuat"
            tone="danger"
          />
        ) : (
          <NexusWorkspaceState
            description="Akun, peran, dan hubungan anggota sedang dibaca."
            eyebrow="Memuat"
            title="Memuat daftar akun…"
          />
        )}
      </NexusWorkspacePage>
    );
  }

  return (
    /* Sesi halaman diisi ulang setiap direktori dibaca lagi. */
    <NexusMemberSessionProvider
      initialRecords={directory.members}
      key={version}
    >
      <NexusAccessPolicySessionProvider
        initialOverrides={[]}
        initialRoles={directory.roles}
      >
        <NexusAccountSessionProvider
          actor={actor}
          initialAccounts={directory.accounts}
          remote={remote}
        >
          <NexusAdministration
            {...props}
            accessModules={directory.accessModules ?? []}
            membersReadable={directory.membersKnown}
            specialAccess={specialAccess}
          />
        </NexusAccountSessionProvider>
      </NexusAccessPolicySessionProvider>
    </NexusMemberSessionProvider>
  );
}
