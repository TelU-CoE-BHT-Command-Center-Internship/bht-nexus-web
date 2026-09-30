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

/**
 * Penyimpan direktori akun di server. Bila diberikan, setiap perubahan ditulis
 * ke sana lebih dahulu, lalu direktori diisi ulang dari jawaban server supaya
 * yang tampil selalu keadaan yang benar-benar tersimpan.
 */
export type NexusAccountRemote = {
  /** Membuat akun menunggu aktivasi dan menjawab ID akunnya. */
  createInvitation: (input: NexusAccountInvitationInput) => Promise<string>;
  list: () => Promise<NexusAccountDirectoryRecord[]>;
  updateRelationship: (
    account: NexusAccountDirectoryRecord,
    relationship: NexusAccountMemberRelationship,
  ) => Promise<unknown>;
  updateRole: (
    account: NexusAccountDirectoryRecord,
    roleId: string,
  ) => Promise<unknown>;
  updateStatus: (
    account: NexusAccountDirectoryRecord,
    status: "ACTIVE" | "SUSPENDED",
  ) => Promise<unknown>;
};

type NexusAccountSessionValue = {
  accounts: NexusAccountDirectoryRecord[];
  /** Kirim ulang dan pembatalan undangan hanya tersedia tanpa penyimpan server. */
  canManageInvitations: boolean;
  cancelInvitation: (accountId: string) => void;
  createInvitation: (
    input: NexusAccountInvitationInput,
  ) => Promise<NexusAccountDirectoryRecord>;
  /** Akun yang sedang diwakili ruang kerja; tidak pernah baris pertama daftar. */
  currentAccount?: NexusAccountDirectoryRecord;
  /** ID akun yang sedang masuk, bila diketahui. */
  currentAccountId?: string;
  /** Proyeksi kanonis yang juga menjadi identitas aktor sesi saat ini. */
  currentProfile?: NexusProfileView;
  refreshInvitation: (accountId: string) => void;
  restoreAccount: (accountId: string) => Promise<void>;
  suspendAccount: (accountId: string) => Promise<void>;
  updatePersonalProfile: (
    accountId: string,
    personalProfile: NexusAccountPersonalProfile,
  ) => void;
  updateRelationship: (
    accountId: string,
    relationship: NexusAccountMemberRelationship,
  ) => Promise<void>;
  updateRole: (accountId: string, roleId: string) => Promise<void>;
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
  actor,
  children,
  initialAccounts,
  remote,
}: {
  /** Akun yang sedang masuk; dicatat sebagai pelaku perubahan pada direktori ini. */
  actor?: { id: string; name: string };
  children: ReactNode;
  initialAccounts: NexusAccountDirectoryRecord[];
  remote?: NexusAccountRemote;
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
    actor?.name ??
    currentProfile?.displayName ??
    currentAccount?.displayName ??
    "Pengguna BHT Nexus";
  const currentActorId = actor?.id ?? currentAccount?.id;

  /**
   * Menulis satu perubahan ke server lalu mengisi ulang direktori, juga ketika
   * perubahan gagal di tengah jalan, supaya daftar tidak menampilkan keadaan
   * yang hanya ada di peramban.
   */
  const writeToRemote = useCallback(
    async <Result,>(
      store: NexusAccountRemote,
      change: () => Promise<Result>,
    ): Promise<Result> => {
      try {
        return await change();
      } finally {
        await store
          .list()
          .then(setAccounts)
          .catch(() => undefined);
      }
    },
    [],
  );

  const accountById = useCallback(
    (accountId: string) => {
      const account = accounts.find((candidate) => candidate.id === accountId);
      if (!account) throw new Error("Akun ini sudah tidak tersedia.");
      return account;
    },
    [accounts],
  );

  const createInvitation = useCallback(
    async (input: NexusAccountInvitationInput) => {
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

      if (remote) {
        const accountId = await remote.createInvitation({
          ...input,
          displayName: displayNameFromInvitation(input),
          email: normalizedEmail,
        });
        const stored = await remote.list();
        setAccounts(stored);
        const created = stored.find((account) => account.id === accountId);
        if (!created) throw new Error("Akun undangan belum dapat dibaca.");
        return created;
      }

      const createdAt = formatAuditTimestamp();
      sequence.current += 1;
      const account: NexusAccountDirectoryRecord = {
        createdAt,
        createdBy: currentActorName,
        createdByActorId: currentActorId,
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
    [accounts, currentActorId, currentActorName, remote, roles],
  );

  const updateRole = useCallback(
    async (accountId: string, roleId: string) => {
      assertAssignableRole(roles, roleId);
      if (remote) {
        const account = accountById(accountId);
        await writeToRemote(remote, () => remote.updateRole(account, roleId));
        return;
      }
      setAccounts((current) =>
        current.map((account) =>
          account.id === accountId
            ? { ...account, roleId, updatedAt: formatAuditTimestamp() }
            : account,
        ),
      );
    },
    [accountById, remote, roles, writeToRemote],
  );

  const updateRelationship = useCallback(
    async (accountId: string, relationship: NexusAccountMemberRelationship) => {
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
      if (remote) {
        const account = accountById(accountId);
        await writeToRemote(remote, () =>
          remote.updateRelationship(account, relationship),
        );
        return;
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
    [accountById, accounts, remote, writeToRemote],
  );

  const suspendAccount = useCallback(
    async (accountId: string) => {
      if (remote) {
        const account = accountById(accountId);
        await writeToRemote(remote, () =>
          remote.updateStatus(account, "SUSPENDED"),
        );
        return;
      }
      setAccounts((current) =>
        updateAccountWithStatus(current, accountId, "ACTIVE", (account) => ({
          ...account,
          status: "SUSPENDED",
          updatedAt: formatAuditTimestamp(),
        })),
      );
    },
    [accountById, remote, writeToRemote],
  );

  const restoreAccount = useCallback(
    async (accountId: string) => {
      if (remote) {
        const account = accountById(accountId);
        await writeToRemote(remote, () =>
          remote.updateStatus(account, "ACTIVE"),
        );
        return;
      }
      setAccounts((current) =>
        updateAccountWithStatus(current, accountId, "SUSPENDED", (account) => ({
          ...account,
          status: "ACTIVE",
          updatedAt: formatAuditTimestamp(),
        })),
      );
    },
    [accountById, remote, writeToRemote],
  );

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
      canManageInvitations: remote === undefined,
      cancelInvitation,
      createInvitation,
      currentAccount,
      currentAccountId: currentActorId,
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
      currentActorId,
      currentProfile,
      refreshInvitation,
      restoreAccount,
      suspendAccount,
      updatePersonalProfile,
      updateRelationship,
      updateRole,
      remote,
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
