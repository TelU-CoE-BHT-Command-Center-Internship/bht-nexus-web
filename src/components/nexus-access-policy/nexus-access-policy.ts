import type { DashboardShellIconName } from "@/components/nexus-dashboard-shell/nexus-dashboard-shell-content";
import type { NexusWorkspaceNavigationId } from "@/components/nexus-dashboard-shell/nexus-workspace-access";

/**
 * Satu kebijakan akses kanonis untuk ruang kerja BHT Nexus.
 *
 * Modul memakai identitas navigasi yang sudah ada, sedangkan tindakan mengikuti
 * kosakata izin pada kebutuhan REQ-FUNC-019: baca, buat, ubah, periksa,
 * setujui, dan kelola. Izin ekspor belum dimasukkan karena belum ada fungsi
 * ekspor pada ruang kerja; menampilkannya akan menjanjikan kendali atas fungsi
 * yang tidak dimiliki produk.
 *
 * Penegakan otorisasi, penyimpanan, dan audit tetap milik layanan server.
 * Modul ini hanya menyusun kebijakan yang dilihat dan disetel administrator.
 */

export type NexusAccessActionId =
  | "approve"
  | "create"
  | "manage"
  | "review"
  | "update"
  | "view";

export type NexusAccessModuleId = NexusWorkspaceNavigationId;

export type NexusPermissionId = string;

export type NexusAccessActionDefinition = {
  /** Kalimat pendek yang dipakai untuk nama aksesibel kontrol izin. */
  controlPhrase: string;
  id: NexusAccessActionId;
  label: string;
};

export type NexusPermissionDefinition = {
  action: NexusAccessActionId;
  id: NexusPermissionId;
  moduleId: NexusAccessModuleId;
};

export type NexusAccessModuleDefinition = {
  description: string;
  icon: DashboardShellIconName;
  id: NexusAccessModuleId;
  label: string;
  permissions: readonly NexusPermissionDefinition[];
};

export type NexusRoleKind = "CUSTOM" | "SYSTEM";

export type NexusRoleStatus = "ACTIVE" | "INACTIVE";

export type NexusRoleRecord = {
  description: string;
  /**
   * Pengenal peran yang stabil dan tidak diturunkan dari nama tampilan, supaya
   * penggantian nama tidak pernah memutus rujukan akun.
   */
  id: string;
  kind: NexusRoleKind;
  label: string;
  permissions: readonly NexusPermissionId[];
  status: NexusRoleStatus;
};

export type NexusRoleResolution =
  | { kind: "KNOWN"; role: NexusRoleRecord }
  | { kind: "UNASSIGNED" }
  | { kind: "UNKNOWN" };

/** Penyesuaian eksplisit milik satu akun. Tanpa catatan berarti mengikuti peran. */
export type NexusOverrideMode = "DENY" | "GRANT";

export type NexusPermissionMode = NexusOverrideMode | "INHERIT";

export type NexusUserPermissionOverride = {
  accountId: string;
  mode: NexusOverrideMode;
  permissionId: NexusPermissionId;
};

export const nexusAccessActions: readonly NexusAccessActionDefinition[] = [
  { controlPhrase: "melihat", id: "view", label: "Lihat" },
  { controlPhrase: "menambah data pada", id: "create", label: "Tambah" },
  { controlPhrase: "mengubah data pada", id: "update", label: "Ubah" },
  { controlPhrase: "meninjau", id: "review", label: "Tinjau" },
  { controlPhrase: "menyetujui", id: "approve", label: "Setujui" },
  { controlPhrase: "mengelola", id: "manage", label: "Kelola" },
];

export const nexusAccessActionLabels = Object.fromEntries(
  nexusAccessActions.map((action) => [action.id, action.label]),
) as Record<NexusAccessActionId, string>;

type ModuleBlueprint = {
  actions: readonly NexusAccessActionId[];
  description: string;
  icon: DashboardShellIconName;
  id: NexusAccessModuleId;
  label: string;
  /** Nama sumber daya pada kunci izin, mengikuti pola `sumber_daya.tindakan`. */
  resource: string;
};

/**
 * Kombinasi modul dan tindakan mengikuti fungsi yang benar-benar tersedia pada
 * ruang kerja. Kombinasi yang tidak berlaku sengaja tidak dibuat agar tidak ada
 * izin kosong yang bisa dinyalakan tanpa efek.
 */
const moduleBlueprints: readonly ModuleBlueprint[] = [
  {
    actions: ["view"],
    description: "Ringkasan capaian, notifikasi, dan pengumuman ruang kerja.",
    icon: "dashboard",
    id: "dashboard",
    label: "Dashboard",
    resource: "dashboard",
  },
  {
    actions: ["view", "create"],
    description: "Pencarian sumber publik dan pekerjaan pengumpulan kandidat.",
    icon: "search",
    id: "collection",
    label: "Pengumpulan",
    resource: "collection",
  },
  {
    actions: ["view", "create"],
    description: "Pustaka dokumen, tanya jawab bersitasi, dan ekstraksi.",
    icon: "documents",
    id: "documents",
    label: "Dokumen",
    resource: "documents",
  },
  {
    actions: ["view", "update", "review", "approve"],
    description: "Antrean kandidat, perbaikan, dan keputusan data resmi.",
    icon: "reviews",
    id: "reviews",
    label: "Tinjauan",
    resource: "reviews",
  },
  {
    actions: ["view", "create", "update"],
    description: "Artikel jurnal, konferensi, dan buku yang sudah resmi.",
    icon: "publications",
    id: "publications",
    label: "Publikasi",
    resource: "publications",
  },
  {
    actions: ["view", "create", "update"],
    description: "Hak cipta, paten, dan pencatatan kekayaan intelektual.",
    icon: "intellectualProperty",
    id: "intellectual-property",
    label: "Kekayaan Intelektual",
    resource: "intellectual_property",
  },
  {
    actions: ["view", "create", "update"],
    description: "Kontrak riset, kontrak non-riset, dan proposal.",
    icon: "contracts",
    id: "contracts",
    label: "Kontrak & Proposal",
    resource: "contracts",
  },
  {
    actions: ["view", "create", "update"],
    description: "Bimbingan, kapasitas magang, dan luaran akademik.",
    icon: "academic",
    id: "academic",
    label: "Akademik",
    resource: "academic",
  },
  {
    actions: ["view", "create", "update"],
    description: "Kegiatan riset, pengabdian masyarakat, dan bukti kegiatan.",
    icon: "activities",
    id: "activities",
    label: "Kegiatan & Pengabdian",
    resource: "activities",
  },
  {
    actions: ["view", "create", "update", "manage"],
    description: "Profil anggota, keanggotaan CoE, dan identitas akademik.",
    icon: "members",
    id: "members",
    label: "Anggota",
    resource: "members",
  },
  {
    actions: ["view", "create", "update", "manage"],
    description: "Akun pengguna, hubungan anggota, peran, dan hak akses.",
    icon: "administration",
    id: "administration",
    label: "Administrasi",
    resource: "administration",
  },
];

export const nexusAccessModules: readonly NexusAccessModuleDefinition[] =
  moduleBlueprints.map((blueprint) => ({
    description: blueprint.description,
    icon: blueprint.icon,
    id: blueprint.id,
    label: blueprint.label,
    permissions: nexusAccessActions
      .filter((action) => blueprint.actions.includes(action.id))
      .map((action) => ({
        action: action.id,
        id: `${blueprint.resource}.${action.id}`,
        moduleId: blueprint.id,
      })),
  }));

export const nexusPermissionCatalogue: readonly NexusPermissionDefinition[] =
  nexusAccessModules.flatMap((module) => module.permissions);

const permissionById = new Map(
  nexusPermissionCatalogue.map((permission) => [permission.id, permission]),
);

export function nexusPermissionExists(permissionId: string) {
  return permissionById.has(permissionId);
}

function permissionIdsFor(
  entries: Partial<Record<NexusAccessModuleId, readonly NexusAccessActionId[]>>,
) {
  return nexusPermissionCatalogue
    .filter((permission) =>
      entries[permission.moduleId]?.includes(permission.action),
    )
    .map((permission) => permission.id);
}

/**
 * Hak akses bawaan untuk peran sistem. Nilai awal mengikuti kebutuhan yang
 * sudah disepakati dan sengaja konservatif: kombinasi yang belum jelas
 * kepemilikannya dibiarkan nonaktif dan dapat dinyalakan administrator.
 *
 * Peran Auditor memegang alur data operasional terluas, Pimpinan mengikuti
 * cakupan data yang sama, sedangkan Administrator memegang pengelolaan akun dan
 * hak akses dengan akses data yang bersifat pemantauan.
 */
const operationalBaseline = permissionIdsFor({
  academic: ["view", "create", "update"],
  activities: ["view", "create", "update"],
  collection: ["view", "create"],
  contracts: ["view", "create", "update"],
  dashboard: ["view"],
  documents: ["view", "create"],
  "intellectual-property": ["view", "create", "update"],
  members: ["view"],
  publications: ["view", "create", "update"],
  reviews: ["view", "update", "review", "approve"],
});

const memberBaseline = permissionIdsFor({
  academic: ["view", "create"],
  activities: ["view", "create"],
  contracts: ["view", "create"],
  dashboard: ["view"],
  documents: ["view", "create"],
  "intellectual-property": ["view", "create"],
  members: ["view"],
  publications: ["view", "create"],
});

const administratorBaseline = permissionIdsFor({
  academic: ["view"],
  activities: ["view"],
  administration: ["view", "create", "update", "manage"],
  collection: ["view"],
  contracts: ["view"],
  dashboard: ["view"],
  documents: ["view"],
  "intellectual-property": ["view"],
  members: ["view"],
  publications: ["view"],
  reviews: ["view"],
});

const externalBaseline = permissionIdsFor({
  dashboard: ["view"],
  publications: ["view"],
});

type SystemRoleBlueprint = {
  description: string;
  id: string;
  label: string;
  permissions: readonly NexusPermissionId[];
};

/**
 * Pengenal peran sistem mengikuti pengenal yang sudah dipakai kontrak identitas
 * BHT Nexus, sehingga nama tampilan dapat berubah tanpa memutus rujukan akun.
 */
const systemRoleBlueprints: readonly SystemRoleBlueprint[] = [
  {
    description:
      "Memantau capaian CoE dan mengambil keputusan strategis atas data resmi.",
    id: "pimpinan",
    label: "Pimpinan",
    permissions: operationalBaseline,
  },
  {
    description:
      "Mengelola akun, hubungan anggota, peran, dan hak akses ruang kerja.",
    id: "admin",
    label: "Admin",
    permissions: administratorBaseline,
  },
  {
    description:
      "Menjalankan audit KM: memeriksa, melengkapi, dan memutuskan kandidat data.",
    id: "auditor",
    label: "Auditor",
    permissions: operationalBaseline,
  },
  {
    description:
      "Anggota CoE yang mengajukan capaian riset, akademik, dan pengabdian.",
    id: "anggota",
    label: "Anggota",
    permissions: memberBaseline,
  },
  {
    description:
      "Mitra di luar CoE dengan akses terbatas pada informasi yang dibagikan.",
    id: "partner_eksternal",
    label: "Mitra Eksternal",
    permissions: externalBaseline,
  },
];

/** Hak akses bawaan peran sistem yang dipakai tindakan Pulihkan ke Default. */
export const nexusDefaultRolePermissions: Readonly<
  Record<string, readonly NexusPermissionId[]>
> = Object.fromEntries(
  systemRoleBlueprints.map((role) => [role.id, role.permissions]),
);

export function getNexusRoleDirectory(): NexusRoleRecord[] {
  return systemRoleBlueprints.map((role) => ({
    description: role.description,
    id: role.id,
    kind: "SYSTEM",
    label: role.label,
    permissions: [...role.permissions],
    status: "ACTIVE",
  }));
}

/**
 * Penyesuaian akses khusus awal. Penyesuaian melekat pada akun, bukan pada
 * profil anggota, sehingga akun non-anggota pun dapat memilikinya.
 */
export function getNexusUserPermissionOverrides(): NexusUserPermissionOverride[] {
  return [
    {
      accountId: "ACC-BHT-0024",
      mode: "GRANT",
      permissionId: "members.update",
    },
    {
      accountId: "ACC-BHT-0024",
      mode: "DENY",
      permissionId: "contracts.update",
    },
    {
      accountId: "ACC-BHT-0038",
      mode: "GRANT",
      permissionId: "documents.create",
    },
  ];
}

export function resolveNexusRole(
  roleId: string | undefined,
  roles: readonly NexusRoleRecord[],
): NexusRoleResolution {
  if (!roleId) return { kind: "UNASSIGNED" };
  const role = roles.find((candidate) => candidate.id === roleId);
  return role ? { kind: "KNOWN", role } : { kind: "UNKNOWN" };
}

/** Peran yang boleh dipilih untuk penugasan akun baru. */
export function nexusAssignableRoles(roles: readonly NexusRoleRecord[]) {
  return roles.filter((role) => role.status === "ACTIVE");
}

export function nexusOverrideMode(
  overrides: readonly NexusUserPermissionOverride[],
  accountId: string,
  permissionId: NexusPermissionId,
): NexusPermissionMode {
  return (
    overrides.find(
      (override) =>
        override.accountId === accountId &&
        override.permissionId === permissionId,
    )?.mode ?? "INHERIT"
  );
}

/** Hak akses bawaan peran ditambah penyesuaian akun menghasilkan akses efektif. */
export function nexusEffectiveAccess(
  roleGrants: boolean,
  mode: NexusPermissionMode,
) {
  if (mode === "GRANT") return true;
  if (mode === "DENY") return false;
  return roleGrants;
}

export function nexusAccountOverrides(
  overrides: readonly NexusUserPermissionOverride[],
  accountId: string,
) {
  return overrides.filter((override) => override.accountId === accountId);
}

/**
 * Ringkasan cakupan peran dihitung dari hak akses yang sedang berlaku, bukan
 * dari teks terpisah yang bisa tertinggal ketika matriks berubah.
 */
export function nexusRoleAccessSummary(role: NexusRoleRecord) {
  const granted = new Set(role.permissions);
  const countModules = (action: NexusAccessActionId) =>
    nexusAccessModules.filter((module) =>
      module.permissions.some(
        (permission) =>
          permission.action === action && granted.has(permission.id),
      ),
    ).length;

  const viewable = countModules("view");
  const editable = new Set(
    nexusAccessModules
      .filter((module) =>
        module.permissions.some(
          (permission) =>
            (permission.action === "create" ||
              permission.action === "update") &&
            granted.has(permission.id),
        ),
      )
      .map((module) => module.id),
  ).size;
  const decisions =
    countModules("review") + countModules("approve") + countModules("manage");

  if (granted.size === 0) {
    return ["Belum ada hak akses yang aktif"];
  }

  return [
    `Dapat membuka ${viewable} dari ${nexusAccessModules.length} modul`,
    editable > 0
      ? `Dapat mengisi atau memperbarui data pada ${editable} modul`
      : "Tidak dapat mengubah data",
    decisions > 0
      ? `Memegang ${decisions} kewenangan tinjauan, persetujuan, atau pengelolaan`
      : "Tidak memegang kewenangan tinjauan atau pengelolaan",
  ];
}

export function nexusRoleMatchesDefault(role: NexusRoleRecord) {
  const defaults = nexusDefaultRolePermissions[role.id];
  if (!defaults) return true;
  const current = new Set(role.permissions);
  return (
    current.size === defaults.length &&
    defaults.every((permission) => current.has(permission))
  );
}
