"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import {
  type NexusAccessActionId,
  type NexusPermissionId,
  type NexusRoleRecord,
  nexusAccessActionLabels,
} from "@/components/nexus-access-policy/nexus-access-policy";
import type { NexusRoleDraftInput } from "@/components/nexus-access-policy/nexus-access-policy-session";
import type { DashboardShellIconName } from "@/components/nexus-dashboard-shell/nexus-dashboard-shell-content";
import { nexusServerRoleLabel } from "@/components/nexus-dashboard-shell/nexus-workspace-access";
import { ApiRequestError, apiErrorMessage } from "@/lib/api-client";
import { listPermissions, type PermissionRecord } from "@/lib/api-permissions";
import {
  createRole as createServerRole,
  deleteRole,
  grantRolePermission,
  listRolePermissionGrants,
  listRoles,
  type RoleCategory,
  type RoleRecord,
  revokeRolePermission,
  updateRole,
} from "@/lib/api-roles";
import { useLoadEffect } from "@/lib/use-load-effect";

/**
 * Penerjemah peran dan izin server ke permukaan Peran & Hak Akses. Setiap sel
 * matriks mewakili tepat satu izin server, sehingga menyalakan atau mematikan
 * sel selalu berarti memberi atau mencabut izin itu.
 */

export type NexusPermissionMatrixModule = {
  description: string;
  icon: DashboardShellIconName;
  id: string;
  label: string;
  permissions: ReadonlyArray<{
    action: NexusAccessActionId;
    id: NexusPermissionId;
  }>;
};

export type NexusServerRoleRecord = NexusRoleRecord & {
  category: RoleCategory | null;
  name: string;
};

type LoadState = "error" | "loading" | "ready";

const actionBySuffix: Record<string, NexusAccessActionId> = {
  approve: "approve",
  create: "create",
  decide: "approve",
  edit: "update",
  manage: "manage",
  read: "view",
  review: "review",
  update: "update",
  view: "view",
};

const resourceCopy: Record<
  string,
  { description: string; icon: DashboardShellIconName; label: string }
> = {
  activity: {
    description:
      "Kegiatan & Pengabdian beserta Kekayaan Intelektual, Kontrak & Proposal, dan Akademik.",
    icon: "activities",
    label: "Kegiatan & data resmi lain",
  },
  audit: {
    description: "Jejak aktivitas dan statistik penolakan akses.",
    icon: "administration",
    label: "Log audit",
  },
  dashboard: {
    description: "Ringkasan capaian dan pengumuman ruang kerja.",
    icon: "dashboard",
    label: "Dashboard",
  },
  iam: {
    description:
      "Mengundang akun, mengubah status, menautkan anggota, dan menyetel akses khusus.",
    icon: "administration",
    label: "Identitas & akses",
  },
  job: {
    description: "Pekerjaan pengumpulan profil publik dan riwayatnya.",
    icon: "search",
    label: "Pengumpulan",
  },
  kpi: {
    description: "Capaian indikator KM dan rekam pembentuknya.",
    icon: "monitoring",
    label: "Monitoring KM",
  },
  member: {
    description: "Profil anggota, keanggotaan CoE, dan identitas akademik.",
    icon: "members",
    label: "Anggota",
  },
  permission: {
    description: "Katalog izin yang dapat diberikan kepada peran.",
    icon: "administration",
    label: "Katalog izin",
  },
  publication: {
    description: "Artikel jurnal, konferensi, dan buku yang sudah resmi.",
    icon: "publications",
    label: "Publikasi",
  },
  review: {
    description: "Antrean kandidat, perbaikan, dan keputusan data resmi.",
    icon: "reviews",
    label: "Tinjauan",
  },
  role: {
    description: "Daftar peran beserta nama dan deskripsinya.",
    icon: "administration",
    label: "Peran",
  },
  role_permission: {
    description: "Hak akses bawaan setiap peran.",
    icon: "administration",
    label: "Hak akses peran",
  },
  user: {
    description: "Daftar akun pengguna BHT Nexus.",
    icon: "members",
    label: "Akun pengguna",
  },
  user_role: {
    description: "Peran yang melekat pada setiap akun.",
    icon: "members",
    label: "Peran akun",
  },
};

const resourceOrder = [
  "dashboard",
  "kpi",
  "job",
  "review",
  "publication",
  "activity",
  "member",
  "user",
  "user_role",
  "role",
  "role_permission",
  "permission",
  "iam",
  "audit",
];

const categoryLabels: Record<RoleCategory, string> = {
  coe_admin: "Pengelola CoE",
  coe_eksternal: "Pihak eksternal",
  coe_internal: "Internal CoE",
  coe_member: "Anggota CoE",
};

/**
 * Nama izin server dalam bahasa produk: modul beserta tindakannya, sama dengan
 * baris dan kolom pada matriks hak akses.
 */
export function nexusServerPermissionLabel(name: string): {
  action?: string;
  description?: string;
  module: string;
} {
  const separator = name.lastIndexOf(".");
  const resource = separator > 0 ? name.slice(0, separator) : name;
  const action = actionBySuffix[separator > 0 ? name.slice(separator + 1) : ""];
  const copy = resourceCopy[resource];
  return {
    action: action ? nexusAccessActionLabels[action] : undefined,
    description: copy?.description,
    module: copy?.label ?? name,
  };
}

/** Baris matriks dari katalog izin server, dikelompokkan per sumber daya. */
export function permissionMatrixModules(
  permissions: readonly Pick<PermissionRecord, "name">[],
): NexusPermissionMatrixModule[] {
  const modules = new Map<
    string,
    {
      description: string;
      icon: DashboardShellIconName;
      id: string;
      label: string;
      permissions: Array<{ action: NexusAccessActionId; id: string }>;
    }
  >();
  for (const permission of permissions) {
    const separator = permission.name.lastIndexOf(".");
    const resource =
      separator > 0 ? permission.name.slice(0, separator) : permission.name;
    const suffix = separator > 0 ? permission.name.slice(separator + 1) : "";
    const action = actionBySuffix[suffix] ?? "manage";
    const copy = resourceCopy[resource];
    let moduleId = resource;
    // Izin yang tidak cocok dengan sel yang tersedia mendapat barisnya sendiri.
    if (
      modules
        .get(moduleId)
        ?.permissions.some((candidate) => candidate.action === action)
    ) {
      moduleId = permission.name;
    }
    const module = modules.get(moduleId) ?? {
      description: copy?.description ?? `Izin ${permission.name}.`,
      icon: copy?.icon ?? "administration",
      id: moduleId,
      label:
        moduleId === resource
          ? (copy?.label ?? resource)
          : `${copy?.label ?? resource} (${suffix})`,
      permissions: [],
    };
    module.permissions.push({ action, id: permission.name });
    modules.set(moduleId, module);
  }
  const rank = (id: string) => {
    const index = resourceOrder.indexOf(id.split(".")[0] ?? id);
    return index < 0 ? resourceOrder.length : index;
  };
  return [...modules.values()].toSorted(
    (first, second) =>
      rank(first.id) - rank(second.id) || first.id.localeCompare(second.id),
  );
}

export function nexusRoleFromServer(
  role: RoleRecord,
  permissions: readonly string[],
): NexusServerRoleRecord {
  return {
    category: role.category,
    description:
      role.description?.id ??
      (role.type === "system"
        ? `${role.category ? `${categoryLabels[role.category]} · ` : ""}Peran bawaan BHT Nexus`
        : "Peran kustom"),
    id: role.publicId,
    kind: role.type === "system" ? "SYSTEM" : "CUSTOM",
    label: role.displayName?.id ?? nexusServerRoleLabel(role.name),
    name: role.name,
    permissions,
    status: "ACTIVE",
  };
}

/** Nama peran server dari nama tampilan, unik terhadap peran yang ada. */
function roleNameFromLabel(label: string, taken: ReadonlySet<string>) {
  const base =
    label
      .normalize("NFKD")
      .toLocaleLowerCase("id-ID")
      .replace(/[^a-z0-9]+/g, "_")
      .replace(/^[^a-z]+/, "")
      .replace(/_+$/, "")
      .slice(0, 60) || "peran";
  let name = base;
  for (let suffix = 2; taken.has(name); suffix += 1) {
    name = `${base}_${suffix}`;
  }
  return name;
}

/** Nama izin yang sedang diberikan kepada satu peran. */
export async function nexusServerRoleGrants(rolePublicId: string) {
  const grants = await listRolePermissionGrants(rolePublicId, { limit: 100 });
  return grants.data
    .filter((grant) => grant.granted)
    .map((grant) => grant.name);
}

export type RoleSaveInput = {
  description: string;
  label: string;
  permissions: readonly NexusPermissionId[];
};

/** Peran, katalog izin, dan hak akses bawaan dari server. */
export function useNexusServerRoles() {
  const [roles, setRoles] = useState<NexusServerRoleRecord[]>([]);
  const [catalogue, setCatalogue] = useState<PermissionRecord[]>([]);
  const [state, setState] = useState<LoadState>("loading");
  const [errorMessage, setErrorMessage] = useState<string>();
  const latestRequest = useRef(0);

  const load = useCallback(() => {
    const request = ++latestRequest.current;
    setState("loading");
    Promise.all([listRoles({ limit: 100 }), listPermissions({ limit: 100 })])
      .then(async ([roleResult, permissionResult]) => {
        const withGrants = await Promise.all(
          roleResult.data.map(async (role) =>
            nexusRoleFromServer(
              role,
              await nexusServerRoleGrants(role.publicId),
            ),
          ),
        );
        if (request !== latestRequest.current) return;
        setCatalogue(permissionResult.data);
        setRoles(withGrants);
        setState("ready");
      })
      .catch((error: unknown) => {
        if (request !== latestRequest.current) return;
        setErrorMessage(
          apiErrorMessage(error, "Peran dan hak akses belum dapat dimuat."),
        );
        setState("error");
      });
  }, []);

  useLoadEffect(load);

  const refreshRole = useCallback(async (publicId: string) => {
    const permissions = await nexusServerRoleGrants(publicId);
    setRoles((current) =>
      current.map((role) =>
        role.id === publicId ? { ...role, permissions } : role,
      ),
    );
    return permissions;
  }, []);

  /**
   * Menyimpan nama, deskripsi, dan hak akses. Setiap izin diberikan atau
   * dicabut satu per satu; bila server menolak di tengah jalan, peran dibaca
   * ulang supaya tampilan mengikuti keadaan yang benar-benar tersimpan.
   */
  const saveRole = useCallback(
    async (
      role: NexusServerRoleRecord,
      input: RoleSaveInput,
    ): Promise<string | undefined> => {
      const permissionIds = new Map(
        catalogue.map((permission) => [permission.name, permission.publicId]),
      );
      const before = new Set(role.permissions);
      const after = new Set(input.permissions);
      try {
        if (
          input.label.trim() !== role.label ||
          input.description.trim() !== role.description
        ) {
          const updated = await updateRole(role.id, {
            description: input.description.trim()
              ? { id: input.description.trim() }
              : undefined,
            displayName: { id: input.label.trim() },
          });
          setRoles((current) =>
            current.map((candidate) =>
              candidate.id === role.id
                ? {
                    ...nexusRoleFromServer(updated, candidate.permissions),
                  }
                : candidate,
            ),
          );
        }
        for (const name of after) {
          const permissionId = permissionIds.get(name);
          if (!before.has(name) && permissionId) {
            await grantRolePermission(role.id, permissionId);
          }
        }
        for (const name of before) {
          const permissionId = permissionIds.get(name);
          if (!after.has(name) && permissionId) {
            await revokeRolePermission(role.id, permissionId);
          }
        }
        await refreshRole(role.id);
        return undefined;
      } catch (error) {
        await refreshRole(role.id).catch(() => undefined);
        return apiErrorMessage(error, "Perubahan peran tidak dapat disimpan.");
      }
    },
    [catalogue, refreshRole],
  );

  const createRole = useCallback(
    async (
      input: NexusRoleDraftInput,
    ): Promise<{ error?: string; role?: NexusServerRoleRecord }> => {
      const label = input.label.trim();
      if (!label) return { error: "Nama peran wajib diisi." };
      if (
        roles.some(
          (role) =>
            role.label.toLocaleLowerCase("id-ID") ===
            label.toLocaleLowerCase("id-ID"),
        )
      ) {
        return { error: "Nama peran sudah dipakai peran lain." };
      }
      const source = roles.find((role) => role.id === input.copyFromRoleId);
      try {
        const created = await createServerRole({
          category: source?.category ?? null,
          description: input.description.trim()
            ? { id: input.description.trim() }
            : undefined,
          displayName: { id: label },
          name: roleNameFromLabel(
            label,
            new Set(roles.map((role) => role.name)),
          ),
        });
        const permissionIds = new Map(
          catalogue.map((permission) => [permission.name, permission.publicId]),
        );
        for (const name of source?.permissions ?? []) {
          const permissionId = permissionIds.get(name);
          if (permissionId) {
            await grantRolePermission(created.publicId, permissionId);
          }
        }
        const role = nexusRoleFromServer(
          created,
          await nexusServerRoleGrants(created.publicId),
        );
        setRoles((current) => [...current, role]);
        return { role };
      } catch (error) {
        load();
        return {
          error:
            error instanceof ApiRequestError && error.status === 409
              ? "Nama peran sudah dipakai peran lain."
              : apiErrorMessage(error, "Peran tidak dapat dibuat."),
        };
      }
    },
    [catalogue, load, roles],
  );

  /** Menonaktifkan peran kustom; server menolak bila peran masih dipakai. */
  const deactivateRole = useCallback(
    async (role: NexusServerRoleRecord): Promise<string | undefined> => {
      try {
        await deleteRole(role.id);
        setRoles((current) =>
          current.filter((candidate) => candidate.id !== role.id),
        );
        return undefined;
      } catch (error) {
        return error instanceof ApiRequestError && error.status === 409
          ? "Peran masih dipakai akun atau masih memiliki hak akses. Cabut hak aksesnya dan pindahkan akunnya ke peran lain terlebih dahulu."
          : apiErrorMessage(error, "Peran tidak dapat dinonaktifkan.");
      }
    },
    [],
  );

  const modules = useMemo(
    () => permissionMatrixModules(catalogue),
    [catalogue],
  );

  return {
    createRole,
    deactivateRole,
    errorMessage,
    modules,
    retry: load,
    roles,
    saveRole,
    state,
  };
}
