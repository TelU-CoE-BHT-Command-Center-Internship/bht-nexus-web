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
  type NexusRoleRecord,
  nexusAssignableRoles,
} from "@/components/nexus-access-policy/nexus-access-policy";
import { useNexusAccessPolicySession } from "@/components/nexus-access-policy/nexus-access-policy-session";
import type {
  NexusAccountDirectoryRecord,
  NexusAccountInvitationInput,
  NexusAccountMemberRelationship,
  NexusAccountPersonalProfile,
  NexusAccountStatus,
} from "@/components/nexus-accounts/nexus-account-directory";
import {
  NEXUS_CURRENT_ACCOUNT_ID,
  nexusAccountRelationshipMemberId,
} from "@/components/nexus-accounts/nexus-account-directory";
import { useNexusMemberSession } from "@/components/nexus-member-session/nexus-member-session";
import {
  type NexusProfileView,
  resolveNexusProfile,
} from "@/components/nexus-profile/nexus-profile-model";
import { formatAuditTimestamp } from "@/components/nexus-workspace-ui/nexus-workspace-format";

type NexusAccountSessionValue = {
  accounts: NexusAccountDirectoryRecord[];
  cancelInvitation: (accountId: string) => void;
  createInvitation: (
    input: NexusAccountInvitationInput,
  ) => NexusAccountDirectoryRecord;
  /** Akun yang sedang diwakili ruang kerja; tidak pernah baris pertama daftar. */
  currentAccount?: NexusAccountDirectoryRecord;
  /** Proyeksi kanonis yang juga menjadi identitas aktor sesi saat ini. */
  currentProfile?: NexusProfileView;
  refreshInvitation: (accountId: string) => void;
  restoreAccount: (accountId: string) => void;
  suspendAccount: (accountId: string) => void;
  updatePersonalProfile: (
    accountId: string,
    personalProfile: NexusAccountPersonalProfile,
  ) => void;
  updateRelationship: (
    accountId: string,
    relationship: NexusAccountMemberRelationship,
  ) => void;
  updateRole: (accountId: string, roleId: string) => void;
};

const NexusAccountSessionContext =
  createContext<NexusAccountSessionValue | null>(null);

function accountSequence(accounts: readonly NexusAccountDirectoryRecord[]) {
  return accounts.reduce((highest, account) => {
    const match = /^ACC-BHT-(\d+)$/.exec(account.id);
    return Math.max(highest, match ? Number(match[1]) : 0);
  }, 0);
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

function assertAssignableRole(
  roles: readonly NexusRoleRecord[],
  roleId: string,
) {
  if (!nexusAssignableRoles(roles).some((role) => role.id === roleId)) {
    throw new Error("Peran yang dipilih tidak lagi tersedia.");
  }
}

function updateAccountWithStatus(
  accounts: readonly NexusAccountDirectoryRecord[],
  accountId: string,
  expectedStatus: NexusAccountStatus,
  update: (account: NexusAccountDirectoryRecord) => NexusAccountDirectoryRecord,
) {
  return accounts.map((account) =>
    account.id === accountId && account.status === expectedStatus
      ? update(account)
      : account,
  );
}

export function NexusAccountSessionProvider({
  children,
  initialAccounts,
}: {
  children: ReactNode;
  initialAccounts: NexusAccountDirectoryRecord[];
}) {
  const [accounts, setAccounts] = useState(initialAccounts);
  /* Peran dirujuk lewat ID dari satu kebijakan akses bersama, bukan disalin. */
  const { roles } = useNexusAccessPolicySession();
  const { records: members } = useNexusMemberSession();
  const sequence = useRef(accountSequence(initialAccounts));
  const currentAccount = useMemo(
    () => accounts.find((account) => account.id === NEXUS_CURRENT_ACCOUNT_ID),
    [accounts],
  );
  const currentProfile = useMemo(
    () =>
      currentAccount
        ? resolveNexusProfile({
            account: currentAccount,
            accounts,
            members,
            roles,
          })
        : undefined,
    [accounts, currentAccount, members, roles],
  );
  const currentActorName =
    currentProfile?.displayName ??
    currentAccount?.displayName ??
    "Pengguna BHT Nexus";

  const createInvitation = useCallback(
    (input: NexusAccountInvitationInput) => {
      const normalizedEmail = input.email.trim().toLocaleLowerCase("id-ID");
      if (
        accounts.some(
          (account) =>
            account.email.trim().toLocaleLowerCase("id-ID") === normalizedEmail,
        )
      ) {
        throw new Error("Email ini sudah digunakan oleh akun lain.");
      }
      assertAssignableRole(roles, input.roleId);

      const memberId = nexusAccountRelationshipMemberId(input.relationship);
      if (
        memberId &&
        accounts.some(
          (account) =>
            nexusAccountRelationshipMemberId(account.relationship) === memberId,
        )
      ) {
        throw new Error("Anggota ini sudah mempunyai hubungan akun.");
      }

      const createdAt = formatAuditTimestamp();
      sequence.current += 1;
      const account: NexusAccountDirectoryRecord = {
        createdAt,
        createdBy: currentActorName,
        createdByActorId: currentAccount?.id,
        displayName: displayNameFromInvitation(input),
        email: normalizedEmail,
        id: `ACC-BHT-${String(sequence.current).padStart(4, "0")}`,
        invitedAt: createdAt,
        lastInvitationAt: createdAt,
        relationship: { ...input.relationship },
        roleId: input.roleId,
        status: "INVITED",
        updatedAt: createdAt,
      };
      setAccounts((current) => [account, ...current]);
      return account;
    },
    [accounts, currentAccount?.id, currentActorName, roles],
  );

  const updateRole = useCallback(
    (accountId: string, roleId: string) => {
      assertAssignableRole(roles, roleId);
      setAccounts((current) =>
        current.map((account) =>
          account.id === accountId
            ? { ...account, roleId, updatedAt: formatAuditTimestamp() }
            : account,
        ),
      );
    },
    [roles],
  );

  const updateRelationship = useCallback(
    (accountId: string, relationship: NexusAccountMemberRelationship) => {
      const memberId = nexusAccountRelationshipMemberId(relationship);
      if (
        memberId &&
        accounts.some(
          (account) =>
            account.id !== accountId &&
            nexusAccountRelationshipMemberId(account.relationship) === memberId,
        )
      ) {
        throw new Error("Anggota ini sudah mempunyai hubungan akun lain.");
      }
      setAccounts((current) =>
        current.map((account) =>
          account.id === accountId
            ? {
                ...account,
                relationship: { ...relationship },
                updatedAt: formatAuditTimestamp(),
              }
            : account,
        ),
      );
    },
    [accounts],
  );

  const suspendAccount = useCallback((accountId: string) => {
    setAccounts((current) =>
      updateAccountWithStatus(current, accountId, "ACTIVE", (account) => ({
        ...account,
        status: "SUSPENDED",
        updatedAt: formatAuditTimestamp(),
      })),
    );
  }, []);

  const restoreAccount = useCallback((accountId: string) => {
    setAccounts((current) =>
      updateAccountWithStatus(current, accountId, "SUSPENDED", (account) => ({
        ...account,
        status: "ACTIVE",
        updatedAt: formatAuditTimestamp(),
      })),
    );
  }, []);

  const refreshInvitation = useCallback((accountId: string) => {
    const updatedAt = formatAuditTimestamp();
    setAccounts((current) =>
      updateAccountWithStatus(current, accountId, "INVITED", (account) => ({
        ...account,
        lastInvitationAt: updatedAt,
        updatedAt,
      })),
    );
  }, []);

  const cancelInvitation = useCallback((accountId: string) => {
    setAccounts((current) =>
      current.filter(
        (account) => account.id !== accountId || account.status !== "INVITED",
      ),
    );
  }, []);

  const updatePersonalProfile = useCallback(
    (accountId: string, personalProfile: NexusAccountPersonalProfile) => {
      setAccounts((current) =>
        current.map((account) =>
          account.id === accountId
            ? {
                ...account,
                personalProfile: { ...personalProfile },
                updatedAt: formatAuditTimestamp(),
              }
            : account,
        ),
      );
    },
    [],
  );

  const value = useMemo(
    () => ({
      accounts,
      cancelInvitation,
      createInvitation,
      currentAccount,
      currentProfile,
      refreshInvitation,
      restoreAccount,
      suspendAccount,
      updatePersonalProfile,
      updateRelationship,
      updateRole,
    }),
    [
      accounts,
      cancelInvitation,
      createInvitation,
      currentAccount,
      currentProfile,
      refreshInvitation,
      restoreAccount,
      suspendAccount,
      updatePersonalProfile,
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
