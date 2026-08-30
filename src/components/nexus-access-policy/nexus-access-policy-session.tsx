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
  type NexusOverrideMode,
  type NexusPermissionId,
  type NexusRoleRecord,
  type NexusUserPermissionOverride,
  nexusDefaultRolePermissions,
  nexusPermissionExists,
} from "@/components/nexus-access-policy/nexus-access-policy";
import { normalizeWorkspaceSearch } from "@/components/nexus-workspace-ui/nexus-workspace-format";

export type NexusRoleDraftInput = {
  copyFromRoleId?: string;
  description: string;
  label: string;
};

export type NexusAccountOverrideDraft = {
  mode: NexusOverrideMode;
  permissionId: NexusPermissionId;
};

type NexusAccessPolicySessionValue = {
  activateRole: (roleId: string) => void;
  createRole: (input: NexusRoleDraftInput) => NexusRoleRecord;
  deactivateRole: (roleId: string) => void;
  overrides: NexusUserPermissionOverride[];
  replaceAccountOverrides: (
    accountId: string,
    drafts: readonly NexusAccountOverrideDraft[],
  ) => void;
  restoreRoleDefaults: (roleId: string) => void;
  roles: NexusRoleRecord[];
  updateRoleDetails: (
    roleId: string,
    details: { description: string; label: string },
  ) => void;
  updateRolePermissions: (
    roleId: string,
    permissions: readonly NexusPermissionId[],
  ) => void;
};

const NexusAccessPolicySessionContext =
  createContext<NexusAccessPolicySessionValue | null>(null);

const ROLE_LABEL_MAX_LENGTH = 60;
const ROLE_DESCRIPTION_MAX_LENGTH = 200;

function customRoleSequence(roles: readonly NexusRoleRecord[]) {
  return roles.reduce((highest, role) => {
    const match = /^peran_kustom_(\d+)$/.exec(role.id);
    return Math.max(highest, match ? Number(match[1]) : 0);
  }, 0);
}

function assertUsableLabel(
  label: string,
  roles: readonly NexusRoleRecord[],
  currentRoleId?: string,
) {
  const trimmed = label.trim();
  if (!trimmed) {
    throw new Error("Nama peran wajib diisi.");
  }
  if (trimmed.length > ROLE_LABEL_MAX_LENGTH) {
    throw new Error(`Nama peran maksimal ${ROLE_LABEL_MAX_LENGTH} karakter.`);
  }
  const normalized = normalizeWorkspaceSearch(trimmed);
  if (
    roles.some(
      (role) =>
        role.id !== currentRoleId &&
        normalizeWorkspaceSearch(role.label) === normalized,
    )
  ) {
    throw new Error("Nama peran ini sudah digunakan.");
  }
  return trimmed;
}

function assertUsableDescription(description: string) {
  const trimmed = description.trim();
  if (trimmed.length > ROLE_DESCRIPTION_MAX_LENGTH) {
    throw new Error(
      `Deskripsi maksimal ${ROLE_DESCRIPTION_MAX_LENGTH} karakter.`,
    );
  }
  return trimmed;
}

export function NexusAccessPolicySessionProvider({
  children,
  initialOverrides,
  initialRoles,
}: {
  children: ReactNode;
  initialOverrides: NexusUserPermissionOverride[];
  initialRoles: NexusRoleRecord[];
}) {
  const [roles, setRoles] = useState(initialRoles);
  const [overrides, setOverrides] = useState(initialOverrides);
  const sequence = useRef(customRoleSequence(initialRoles));

  const createRole = useCallback(
    (input: NexusRoleDraftInput) => {
      const label = assertUsableLabel(input.label, roles);
      const description = assertUsableDescription(input.description);
      const source = input.copyFromRoleId
        ? roles.find((role) => role.id === input.copyFromRoleId)
        : undefined;
      if (input.copyFromRoleId && !source) {
        throw new Error("Peran sumber tidak lagi tersedia.");
      }

      sequence.current += 1;
      const role: NexusRoleRecord = {
        description,
        id: `peran_kustom_${String(sequence.current).padStart(2, "0")}`,
        kind: "CUSTOM",
        label,
        permissions: source ? [...source.permissions] : [],
        status: "ACTIVE",
      };
      setRoles((current) => [...current, role]);
      return role;
    },
    [roles],
  );

  const updateRoleDetails = useCallback(
    (roleId: string, details: { description: string; label: string }) => {
      const label = assertUsableLabel(details.label, roles, roleId);
      const description = assertUsableDescription(details.description);
      setRoles((current) =>
        current.map((role) =>
          role.id === roleId ? { ...role, description, label } : role,
        ),
      );
    },
    [roles],
  );

  const updateRolePermissions = useCallback(
    (roleId: string, permissions: readonly NexusPermissionId[]) => {
      const accepted = permissions.filter((permission) =>
        nexusPermissionExists(permission),
      );
      setRoles((current) =>
        current.map((role) =>
          role.id === roleId ? { ...role, permissions: accepted } : role,
        ),
      );
    },
    [],
  );

  const restoreRoleDefaults = useCallback((roleId: string) => {
    const defaults = nexusDefaultRolePermissions[roleId];
    if (!defaults) {
      throw new Error("Peran ini tidak memiliki hak akses bawaan.");
    }
    setRoles((current) =>
      current.map((role) =>
        role.id === roleId ? { ...role, permissions: [...defaults] } : role,
      ),
    );
  }, []);

  const deactivateRole = useCallback((roleId: string) => {
    setRoles((current) =>
      current.map((role) =>
        role.id === roleId ? { ...role, status: "INACTIVE" } : role,
      ),
    );
  }, []);

  const activateRole = useCallback((roleId: string) => {
    setRoles((current) =>
      current.map((role) =>
        role.id === roleId ? { ...role, status: "ACTIVE" } : role,
      ),
    );
  }, []);

  const replaceAccountOverrides = useCallback(
    (accountId: string, drafts: readonly NexusAccountOverrideDraft[]) => {
      const accepted = drafts
        .filter((draft) => nexusPermissionExists(draft.permissionId))
        .map((draft) => ({ ...draft, accountId }));
      setOverrides((current) => [
        ...current.filter((override) => override.accountId !== accountId),
        ...accepted,
      ]);
    },
    [],
  );

  const value = useMemo(
    () => ({
      activateRole,
      createRole,
      deactivateRole,
      overrides,
      replaceAccountOverrides,
      restoreRoleDefaults,
      roles,
      updateRoleDetails,
      updateRolePermissions,
    }),
    [
      activateRole,
      createRole,
      deactivateRole,
      overrides,
      replaceAccountOverrides,
      restoreRoleDefaults,
      roles,
      updateRoleDetails,
      updateRolePermissions,
    ],
  );

  return (
    <NexusAccessPolicySessionContext.Provider value={value}>
      {children}
    </NexusAccessPolicySessionContext.Provider>
  );
}

export function useNexusAccessPolicySession() {
  const session = useContext(NexusAccessPolicySessionContext);
  if (!session) {
    throw new Error(
      "useNexusAccessPolicySession must be used inside NexusAccessPolicySessionProvider",
    );
  }
  return session;
}

/** Untuk permukaan bersama yang juga dipakai ruang kerja tanpa kebijakan akses. */
export function useNexusAccessPolicySessionIfAvailable() {
  return useContext(NexusAccessPolicySessionContext);
}
