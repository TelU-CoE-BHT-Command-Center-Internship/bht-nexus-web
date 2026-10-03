"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import {
  type NexusAccessActionId,
  type NexusPermissionId,
  type NexusRoleRecord,
  nexusAccessActionLabels,
  nexusAccessActions,
} from "@/components/nexus-access-policy/nexus-access-policy";
import type { NexusRoleDraftInput } from "@/components/nexus-access-policy/nexus-access-policy-session";
import type { NexusAccountDirectoryRecord } from "@/components/nexus-accounts/nexus-account-directory";
import {
  nexusAccountFromServer,
  nexusLinkedMemberFromAccount,
} from "@/components/nexus-accounts/nexus-account-server";
import type { DashboardShellIconName } from "@/components/nexus-dashboard-shell/nexus-dashboard-shell-content";
import { nexusServerRoleLabel } from "@/components/nexus-dashboard-shell/nexus-workspace-access";
import { nexusMemberFromSummary } from "@/components/nexus-members/nexus-member-server";
import type { NexusMemberRecord } from "@/components/nexus-members/nexus-members-content";
import { normalizeWorkspaceSearch } from "@/components/nexus-workspace-ui/nexus-workspace-format";
import { type AccountSummary, listAllAccounts } from "@/lib/api-accounts";
import {
  ApiRequestError,
  apiErrorMessage,
  whenForbidden,
} from "@/lib/api-client";
import { listAllMembers, type MemberSummary } from "@/lib/api-members";
import { listPermissions, type PermissionRecord } from "@/lib/api-permissions";
import {
  createRole as createServerRole,
  deleteRole,
  grantRolePermission,
  listRolePermissionGrants,
  listRoles,
  type RoleCategory,
  type RoleRecord,
  resetRole,
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
  /** Deskripsi yang benar-benar tersimpan; kosong bila peran belum punya. */
  storedDescription: string;
};

/**
 * Akun untuk halaman Peran. `accounts` tidak ada bila akun yang sedang masuk
 * tidak berwenang membaca daftar akun, sehingga jumlahnya tidak pernah
 * dianggap nol.
 */
type RoleAccountDirectory = {
  accounts?: NexusAccountDirectoryRecord[];
  members: NexusMemberRecord[];
  /** Direktori Anggota benar-benar terbaca, bukan disusun dari daftar akun. */
  membersKnown: boolean;
};

function roleAccountDirectory(
  accounts: readonly AccountSummary[] | undefined,
  members: readonly MemberSummary[] | undefined,
): RoleAccountDirectory {
  const membersKnown = members !== undefined;
  if (!accounts) return { members: [], membersKnown };
  return {
    accounts: accounts.map((account) =>
      nexusAccountFromServer(account, membersKnown),
    ),
    members: members
      ? members.map(nexusMemberFromSummary)
      : accounts.flatMap(nexusLinkedMemberFromAccount),
    membersKnown,
  };
}

type LoadState = "error" | "loading" | "ready";

/** Tindakan izin yang tidak punya kolom sendiri pada matriks hak akses. */
const separateSuffixLabels: Record<string, string> = {
  export: "ekspor",
};

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
  academic: {
    description: "Bimbingan, kapasitas magang, dan luaran akademik.",
    icon: "academic",
    label: "Akademik",
  },
  activity: {
    description: "Kegiatan riset, pengabdian masyarakat, dan bukti kegiatan.",
    icon: "activities",
    label: "Kegiatan & Pengabdian",
  },
  audit: {
    description: "Jejak aktivitas dan statistik penolakan akses.",
    icon: "administration",
    label: "Log audit",
  },
  contract: {
    description: "Kontrak riset, kontrak non-riset, dan proposal.",
    icon: "contracts",
    label: "Kontrak & Proposal",
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
  import: {
    description: "Impor berkas data yang hasilnya masuk ke antrean Tinjauan.",
    icon: "documents",
    label: "Impor data",
  },
  intellectual_property: {
    description: "Hak cipta, paten, dan pencatatan kekayaan intelektual.",
    icon: "intellectualProperty",
    label: "Kekayaan Intelektual",
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
  "intellectual_property",
  "contract",
  "academic",
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
  const suffix = separator > 0 ? name.slice(separator + 1) : "";
  const action = actionBySuffix[suffix];
  const copy = resourceCopy[resource];
  const separateLabel = separateSuffixLabels[suffix];
  return {
    action: action ? nexusAccessActionLabels[action] : undefined,
    description: copy?.description,
    module:
      copy && separateLabel
        ? `${copy.label} (${separateLabel})`
        : (copy?.label ?? name),
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
      separateSuffixLabels[suffix] ||
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
          : `${copy?.label ?? resource} (${separateSuffixLabels[suffix] ?? suffix})`,
      permissions: [],
    };
    module.permissions.push({ action, id: permission.name });
    modules.set(moduleId, module);
  }
  const rank = (id: string) => {
    const index = resourceOrder.indexOf(id.split(".")[0] ?? id);
    return index < 0 ? resourceOrder.length : index;
  };
  /* Izin dalam satu modul mengikuti urutan tindakan yang sama dengan kolom
     matriks: Lihat lebih dahulu, Kelola paling akhir. */
  const actionRank = (action: NexusAccessActionId) =>
    nexusAccessActions.findIndex((candidate) => candidate.id === action);
  return [...modules.values()]
    .map((module) => ({
      ...module,
      permissions: module.permissions.toSorted(
        (first, second) => actionRank(first.action) - actionRank(second.action),
      ),
    }))
    .toSorted(
      (first, second) =>
        rank(first.id) - rank(second.id) || first.id.localeCompare(second.id),
    );
}

/* Peran bawaan tampil menurut jenjangnya, seperti rancangan Administrasi;
   peran kustom menyusul sesuai waktu dibuat. Server mengurutkan menurut waktu
   dibuat, padahal seluruh peran bawaan dibuat bersamaan, sehingga urutan dari
   server berubah-ubah. */
const systemRoleOrder = [
  "director",
  "admin",
  "auditor",
  "officer",
  "cluster_head",
  "member",
  "external_partner",
  "intern",
];

export function nexusSortServerRoles(
  roles: readonly RoleRecord[],
): RoleRecord[] {
  const rank = (role: RoleRecord) => {
    const index = systemRoleOrder.indexOf(role.name);
    return role.type === "system" && index >= 0
      ? index
      : systemRoleOrder.length;
  };
  return roles.toSorted(
    (first, second) =>
      rank(first) - rank(second) ||
      first.createdAt.localeCompare(second.createdAt) ||
      first.name.localeCompare(second.name),
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
    storedDescription: role.description?.id ?? "",
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

const ROLE_LABEL_MAX_LENGTH = 60;
const ROLE_DESCRIPTION_MAX_LENGTH = 200;

const ROLE_IN_USE_MESSAGE =
  "Peran masih dipakai akun atau masih memiliki hak akses. Pindahkan akunnya ke peran lain dan cabut hak aksesnya terlebih dahulu.";

/** Aturan nama dan deskripsi peran; pesan dikembalikan bila isian belum dapat dipakai. */
function roleDetailsError(
  label: string,
  description: string,
  roles: readonly NexusServerRoleRecord[],
  currentRoleId?: string,
) {
  if (!label) return "Nama peran wajib diisi.";
  if (label.length > ROLE_LABEL_MAX_LENGTH) {
    return `Nama peran maksimal ${ROLE_LABEL_MAX_LENGTH} karakter.`;
  }
  const normalized = normalizeWorkspaceSearch(label);
  if (
    roles.some(
      (role) =>
        role.id !== currentRoleId &&
        normalizeWorkspaceSearch(role.label) === normalized,
    )
  ) {
    return "Nama peran ini sudah digunakan.";
  }
  if (description.length > ROLE_DESCRIPTION_MAX_LENGTH) {
    return `Deskripsi maksimal ${ROLE_DESCRIPTION_MAX_LENGTH} karakter.`;
  }
  return undefined;
}

type RoleDirectoryOptions = {
  /** Direktori Anggota boleh dibaca akun ini, sehingga nama anggota dapat ditampilkan. */
  canReadMembers: boolean;
};

/** Peran, katalog izin, hak akses bawaan, dan akun pemakainya dari server. */
export function useNexusServerRoles({ canReadMembers }: RoleDirectoryOptions) {
  const [roles, setRoles] = useState<NexusServerRoleRecord[]>([]);
  const [catalogue, setCatalogue] = useState<PermissionRecord[]>([]);
  const [accountDirectory, setAccountDirectory] =
    useState<RoleAccountDirectory>({ members: [], membersKnown: false });
  const [state, setState] = useState<LoadState>("loading");
  const [errorMessage, setErrorMessage] = useState<string>();
  const latestRequest = useRef(0);

  const load = useCallback(() => {
    const request = ++latestRequest.current;
    setState("loading");
    Promise.all([
      listRoles({ limit: 100 }),
      listPermissions({ limit: 100 }),
      listAllAccounts().catch(whenForbidden(undefined)),
      canReadMembers
        ? listAllMembers().catch(whenForbidden(undefined))
        : Promise.resolve(undefined),
    ])
      .then(async ([roleResult, permissionResult, accounts, members]) => {
        const withGrants = await Promise.all(
          nexusSortServerRoles(roleResult.data).map(async (role) =>
            nexusRoleFromServer(
              role,
              await nexusServerRoleGrants(role.publicId),
            ),
          ),
        );
        if (request !== latestRequest.current) return;
        setCatalogue(permissionResult.data);
        setRoles(withGrants);
        setAccountDirectory(roleAccountDirectory(accounts, members));
        setState("ready");
      })
      .catch((error: unknown) => {
        if (request !== latestRequest.current) return;
        setErrorMessage(
          apiErrorMessage(error, "Peran dan hak akses belum dapat dimuat."),
        );
        setState("error");
      });
  }, [canReadMembers]);

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
      const label = input.label.trim();
      const description = input.description.trim();
      const labelChanged = label !== role.label;
      const descriptionChanged = description !== role.storedDescription;
      if (labelChanged || descriptionChanged) {
        const detailsError = roleDetailsError(
          label,
          description,
          roles,
          role.id,
        );
        if (detailsError) return detailsError;
        if (descriptionChanged && !description) {
          return "Deskripsi yang sudah tersimpan belum dapat dikosongkan. Tulis deskripsi penggantinya.";
        }
      }
      const permissionIds = new Map(
        catalogue.map((permission) => [permission.name, permission.publicId]),
      );
      const before = new Set(role.permissions);
      const after = new Set(input.permissions);
      try {
        if (labelChanged || descriptionChanged) {
          /* Hanya bidang yang diubah yang dikirim, supaya nama dan deskripsi
             bawaan yang belum tersimpan tidak ikut tertulis ke server. */
          const updated = await updateRole(role.id, {
            ...(descriptionChanged ? { description: { id: description } } : {}),
            ...(labelChanged ? { displayName: { id: label } } : {}),
          });
          setRoles((current) =>
            current.map((candidate) =>
              candidate.id === role.id
                ? nexusRoleFromServer(updated, candidate.permissions)
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
    [catalogue, refreshRole, roles],
  );

  const createRole = useCallback(
    async (
      input: NexusRoleDraftInput,
    ): Promise<{ error?: string; role?: NexusServerRoleRecord }> => {
      const label = input.label.trim();
      const description = input.description.trim();
      const detailsError = roleDetailsError(label, description, roles);
      if (detailsError) return { error: detailsError };
      const source = roles.find((role) => role.id === input.copyFromRoleId);
      try {
        const created = await createServerRole({
          category: source?.category ?? null,
          description: description ? { id: description } : undefined,
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
              ? "Nama peran ini sudah digunakan."
              : apiErrorMessage(error, "Peran tidak dapat dibuat."),
        };
      }
    },
    [catalogue, load, roles],
  );

  /**
   * Menonaktifkan peran kustom. Server hanya melepas peran yang tidak dipakai
   * akun dan tidak lagi memegang izin, sehingga hak aksesnya dicabut lebih
   * dahulu, tetapi hanya setelah daftar akun terbaru memastikan tidak ada
   * akun yang memakainya.
   */
  const deactivateRole = useCallback(
    async (role: NexusServerRoleRecord): Promise<string | undefined> => {
      const permissionIds = new Map(
        catalogue.map((permission) => [permission.name, permission.publicId]),
      );
      try {
        if (accountDirectory.accounts) {
          const accounts = await listAllAccounts();
          setAccountDirectory((current) => ({
            ...current,
            accounts: accounts.map((account) =>
              nexusAccountFromServer(account, current.membersKnown),
            ),
            members: current.membersKnown
              ? current.members
              : accounts.flatMap(nexusLinkedMemberFromAccount),
          }));
          if (
            accounts.some((account) =>
              account.roles.some((held) => held.publicId === role.id),
            )
          ) {
            return ROLE_IN_USE_MESSAGE;
          }
          for (const name of role.permissions) {
            const permissionId = permissionIds.get(name);
            if (permissionId) {
              await revokeRolePermission(role.id, permissionId);
            }
          }
        }
        await deleteRole(role.id);
        setRoles((current) =>
          current.filter((candidate) => candidate.id !== role.id),
        );
        return undefined;
      } catch (error) {
        await refreshRole(role.id).catch(() => undefined);
        return error instanceof ApiRequestError && error.status === 409
          ? ROLE_IN_USE_MESSAGE
          : apiErrorMessage(error, "Peran tidak dapat dinonaktifkan.");
      }
    },
    [accountDirectory.accounts, catalogue, refreshRole],
  );

  /**
   * Mengembalikan hak akses peran bawaan ke bawaan BHT Nexus. Hasilnya dibaca
   * ulang dari server, sehingga tampilan mengikuti yang benar-benar berlaku.
   */
  const restoreRole = useCallback(
    async (
      role: NexusServerRoleRecord,
    ): Promise<{
      error?: string;
      permissions?: readonly NexusPermissionId[];
    }> => {
      try {
        await resetRole(role.id);
        return { permissions: await refreshRole(role.id) };
      } catch (error) {
        await refreshRole(role.id).catch(() => undefined);
        return {
          error: apiErrorMessage(
            error,
            "Hak akses peran tidak dapat dipulihkan.",
          ),
        };
      }
    },
    [refreshRole],
  );

  const modules = useMemo(
    () => permissionMatrixModules(catalogue),
    [catalogue],
  );

  return {
    accounts: accountDirectory.accounts,
    createRole,
    deactivateRole,
    errorMessage,
    members: accountDirectory.members,
    modules,
    restoreRole,
    retry: load,
    roles,
    saveRole,
    state,
  };
}
