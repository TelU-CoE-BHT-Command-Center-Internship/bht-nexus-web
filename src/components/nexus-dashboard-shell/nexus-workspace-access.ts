import type { NexusReviewCapabilities } from "@/components/nexus-review-session/nexus-review-session";

export type NexusWorkspaceNavigationId =
  | "academic"
  | "activities"
  | "administration"
  | "broadcast"
  | "collection"
  | "contracts"
  | "dashboard"
  | "documents"
  | "import"
  | "intellectual-property"
  | "members"
  | "monitoring"
  | "publications"
  | "reviews";

/**
 * Bentuk akses yang dibutuhkan UI, terpisah dari nama permission server.
 * Adapter API kelak menerjemahkan policy server ke kontrak kecil ini.
 */
export type NexusWorkspaceAccess = {
  administrationCapabilities: NexusAdministrationCapabilities;
  allowedNavigationIds: readonly NexusWorkspaceNavigationId[];
  broadcastCapabilities: NexusBroadcastCapabilities;
  collectionCapabilities: NexusCollectionCapabilities;
  importCapabilities: NexusImportCapabilities;
  memberCapabilities: NexusMemberCapabilities;
  monitoringCapabilities: NexusMonitoringCapabilities;
  reviewCapabilities: NexusReviewCapabilities;
};

/**
 * Kemampuan pada Broadcast / Newsletter. Membuka halaman mengikuti izin
 * melihat (`broadcast.view`), sedangkan menyusun dan meninjau pengiriman
 * mengikuti izin mengelola (`broadcast.manage`) yang pada Meeting Minggu 12
 * ditetapkan hanya untuk pengurus.
 */
export type NexusBroadcastCapabilities = {
  canCompose: boolean;
};

/**
 * Kemampuan pada Pengumpulan: melihat riwayat terpisah dari mengajukan
 * pekerjaan baru (`job.create`) dan mengirim hasil pekerjaan ke Tinjauan
 * (`review.edit`).
 */
export type NexusCollectionCapabilities = {
  canCreateJob: boolean;
  canSendToReview: boolean;
};

/** Mengunggah impor spreadsheet (`import.create`) terpisah dari melihatnya (`import.read`). */
export type NexusImportCapabilities = {
  canUpload: boolean;
};

/**
 * Kemampuan pada Monitoring KM. Mengelola periode dan target (`monitoring.manage`)
 * terpisah dari mengoreksi rekam pembentuk realisasi (`monitoring.update`).
 * Mengunduh laporan mengikuti izin melihat Monitoring.
 */
export type NexusMonitoringCapabilities = {
  canCorrectRecords: boolean;
  canExport: boolean;
  canManageTargets: boolean;
};

export type NexusAdministrationCapabilities = {
  canInviteAccount: boolean;
  canManageAccess: boolean;
  canManageAccountStatus: boolean;
  canManageRolePermissions: boolean;
  canManageRoles: boolean;
  canManageUserOverrides: boolean;
  /** Membuka daftar akun pada halaman Administrasi. */
  canReadAccounts: boolean;
  /** Membuka catatan penolakan akses. */
  canReadAudit: boolean;
  /** Mengembalikan hak akses peran bawaan ke bawaan BHT Nexus. */
  canRestoreRoleDefaults: boolean;
};

export type NexusMemberCapabilities = {
  canCreateMember: boolean;
  canDeactivateMember: boolean;
  canEditMember: boolean;
  canGrantAccess: boolean;
};

export const nexusPreviewWorkspaceAccess = {
  administrationCapabilities: {
    canInviteAccount: true,
    canManageAccess: true,
    canManageAccountStatus: true,
    canManageRolePermissions: true,
    canManageRoles: true,
    canManageUserOverrides: true,
    canReadAccounts: true,
    canReadAudit: true,
    canRestoreRoleDefaults: true,
  },
  allowedNavigationIds: [
    "dashboard",
    "monitoring",
    "broadcast",
    "collection",
    "import",
    "documents",
    "reviews",
    "publications",
    "intellectual-property",
    "contracts",
    "academic",
    "activities",
    "members",
    "administration",
  ],
  broadcastCapabilities: {
    canCompose: true,
  },
  collectionCapabilities: {
    canCreateJob: true,
    canSendToReview: true,
  },
  importCapabilities: {
    canUpload: true,
  },
  memberCapabilities: {
    canCreateMember: true,
    canDeactivateMember: true,
    canEditMember: true,
    canGrantAccess: true,
  },
  monitoringCapabilities: {
    canCorrectRecords: true,
    canExport: false,
    canManageTargets: false,
  },
  reviewCapabilities: {
    canReview: true,
    canSubmitCorrection: true,
    canSubmitRecord: true,
  },
} satisfies NexusWorkspaceAccess;

/** Nama peran sistem pada server BHT Nexus. */
export type NexusServerRoleName =
  | "admin"
  | "auditor"
  | "cluster_head"
  | "director"
  | "external_partner"
  | "intern"
  | "member"
  | "officer";

type NexusServerPermission =
  | "academic.read"
  | "activity.read"
  | "audit.read"
  | "contract.read"
  | "dashboard.export"
  | "dashboard.read"
  | "iam.manage"
  | "import.create"
  | "import.read"
  | "intellectual_property.read"
  | "job.create"
  | "job.read"
  | "kpi.read"
  | "kpi.target.manage"
  | "member.read"
  | "permission.manage"
  | "permission.read"
  | "publication.read"
  | "review.decide"
  | "review.edit"
  | "review.read"
  | "role.manage"
  | "role.read"
  | "role_permission.manage"
  | "role_permission.read"
  | "user.read"
  | "user_role.manage"
  | "user_role.read";

/**
 * Cermin izin bawaan setiap peran sistem pada server. Peta ini hanya dipakai
 * bila server belum menjawab izin efektif akun; selama itu peran kustom dan
 * akses khusus per akun tidak tercermin pada navigasi. Server tetap menolak
 * setiap permintaan yang tidak diizinkan.
 */
const serverRolePermissions: Record<
  NexusServerRoleName,
  readonly NexusServerPermission[]
> = {
  admin: [
    "kpi.target.manage",
    "job.create",
    "job.read",
    "review.read",
    "review.edit",
    "review.decide",
    "publication.read",
    "member.read",
    "activity.read",
    "intellectual_property.read",
    "contract.read",
    "academic.read",
    "audit.read",
    "kpi.read",
    "dashboard.read",
    "dashboard.export",
    "import.create",
    "import.read",
  ],
  auditor: [
    "iam.manage",
    "member.read",
    "user.read",
    "user_role.read",
    "user_role.manage",
    "role.read",
    "role.manage",
    "permission.read",
    "permission.manage",
    "role_permission.read",
    "role_permission.manage",
    "audit.read",
    "intellectual_property.read",
    "contract.read",
    "academic.read",
  ],
  cluster_head: [
    "job.read",
    "review.read",
    "review.edit",
    "publication.read",
    "member.read",
    "activity.read",
    "intellectual_property.read",
    "contract.read",
    "academic.read",
    "kpi.read",
    "dashboard.read",
  ],
  director: [
    "review.read",
    "review.decide",
    "job.read",
    "publication.read",
    "member.read",
    "activity.read",
    "intellectual_property.read",
    "contract.read",
    "academic.read",
    "kpi.read",
    "dashboard.read",
    "audit.read",
    "import.read",
  ],
  external_partner: ["publication.read"],
  intern: ["publication.read"],
  member: [
    "member.read",
    "publication.read",
    "activity.read",
    "intellectual_property.read",
    "contract.read",
    "academic.read",
  ],
  officer: [
    "job.create",
    "job.read",
    "review.read",
    "review.edit",
    "publication.read",
    "member.read",
    "activity.read",
    "intellectual_property.read",
    "contract.read",
    "academic.read",
    "kpi.read",
    "dashboard.read",
  ],
};

const serverRoleLabels: Record<NexusServerRoleName, string> = {
  admin: "Admin",
  auditor: "Auditor",
  cluster_head: "Ketua Klaster",
  director: "Pimpinan",
  external_partner: "Mitra Eksternal",
  intern: "Magang",
  member: "Anggota",
  officer: "Pengurus",
};

/** Broadcast / Newsletter belum punya layanan server, sehingga tidak dibuka untuk peran mana pun. */
const broadcastRoles: readonly NexusServerRoleName[] = [];

function isServerRoleName(value: string): value is NexusServerRoleName {
  return Object.hasOwn(serverRolePermissions, value);
}

/** Label peran untuk identitas pengguna; peran di luar katalog sistem ditampilkan apa adanya. */
export function nexusServerRoleLabel(roleName: string): string {
  return isServerRoleName(roleName) ? serverRoleLabels[roleName] : roleName;
}

function canBroadcastWith(roles: readonly string[]) {
  return roles.some(
    (role) => isServerRoleName(role) && broadcastRoles.includes(role),
  );
}

/** Navigasi dan kemampuan yang dibuka oleh satu himpunan izin server. */
function accessFromPermissions(
  permissions: ReadonlySet<string>,
  canBroadcast: boolean,
): NexusWorkspaceAccess {
  const has = (permission: NexusServerPermission) =>
    permissions.has(permission);
  const navigation = new Set<NexusWorkspaceNavigationId>();

  if (has("dashboard.read")) navigation.add("dashboard");
  if (has("kpi.read")) navigation.add("monitoring");
  if (canBroadcast) navigation.add("broadcast");
  if (has("job.read")) {
    navigation.add("collection");
    navigation.add("documents");
  }
  if (has("import.read")) navigation.add("import");
  if (has("review.read")) navigation.add("reviews");
  if (has("publication.read")) navigation.add("publications");
  if (has("intellectual_property.read")) {
    navigation.add("intellectual-property");
  }
  if (has("contract.read")) navigation.add("contracts");
  if (has("academic.read")) navigation.add("academic");
  if (has("activity.read")) navigation.add("activities");
  if (has("member.read")) navigation.add("members");
  if (
    has("user.read") ||
    has("iam.manage") ||
    has("role.read") ||
    has("audit.read")
  ) {
    navigation.add("administration");
  }

  return {
    administrationCapabilities: {
      canInviteAccount: has("iam.manage"),
      canManageAccess: has("iam.manage"),
      canManageAccountStatus: has("iam.manage"),
      canManageRolePermissions: has("role_permission.manage"),
      canManageRoles: has("role.manage"),
      canManageUserOverrides: has("iam.manage"),
      canReadAccounts: has("user.read"),
      canReadAudit: has("audit.read"),
      canRestoreRoleDefaults: has("iam.manage"),
    },
    allowedNavigationIds:
      nexusPreviewWorkspaceAccess.allowedNavigationIds.filter((id) =>
        navigation.has(id),
      ),
    broadcastCapabilities: { canCompose: canBroadcast },
    collectionCapabilities: {
      canCreateJob: has("job.create"),
      canSendToReview: has("review.edit"),
    },
    importCapabilities: {
      canUpload: has("import.create"),
    },
    memberCapabilities: {
      canCreateMember: has("iam.manage"),
      canDeactivateMember: has("iam.manage"),
      canEditMember: has("iam.manage"),
      canGrantAccess: has("iam.manage"),
    },
    monitoringCapabilities: {
      canCorrectRecords: has("kpi.read"),
      canExport: has("dashboard.export"),
      canManageTargets: has("kpi.target.manage"),
    },
    reviewCapabilities: {
      canReview: has("review.decide"),
      canSubmitCorrection: has("review.edit"),
      canSubmitRecord: has("job.create"),
    },
  };
}

/**
 * Akses ruang kerja dari nama peran saja. Bila peran belum dapat dibaca dari
 * server, navigasi tetap lengkap dan setiap halaman mengikuti jawaban server
 * (termasuk keadaan tanpa akses).
 */
export function nexusWorkspaceAccessFromRoles(
  roles: readonly string[] | null,
): NexusWorkspaceAccess {
  if (roles === null) return nexusPreviewWorkspaceAccess;

  return accessFromPermissions(
    new Set(
      roles
        .filter(isServerRoleName)
        .flatMap((role) => serverRolePermissions[role]),
    ),
    canBroadcastWith(roles),
  );
}

/**
 * Akses ruang kerja akun yang sedang masuk. Izin efektif dari server sudah
 * memperhitungkan seluruh peran akun, peran kustom, dan akses khusus per
 * akun; bila server belum menjawabnya, izin bawaan peran dipakai.
 */
export function nexusWorkspaceAccessFromSession(
  roles: readonly string[] | null,
  permissions: readonly string[] | null,
): NexusWorkspaceAccess {
  if (permissions === null) return nexusWorkspaceAccessFromRoles(roles);

  return accessFromPermissions(
    new Set(permissions),
    canBroadcastWith(roles ?? []),
  );
}

export function nexusWorkspaceCanOpen(
  access: NexusWorkspaceAccess,
  navigationId: NexusWorkspaceNavigationId,
) {
  return access.allowedNavigationIds.includes(navigationId);
}

/**
 * Pengelolaan siklus peran dan penyetelan izin peran merupakan kemampuan yang
 * berdiri sendiri. Salah satunya cukup untuk membuka permukaan Peran, sementara
 * setiap tindakan di dalam halaman tetap mengikuti kemampuannya sendiri.
 */
export function nexusCanOpenRoleManagement(
  capabilities: NexusAdministrationCapabilities,
) {
  return capabilities.canManageRoles || capabilities.canManageRolePermissions;
}

/**
 * Permukaan Administrasi pertama yang boleh dibuka akun: daftar akun, lalu
 * Peran & Hak Akses, lalu catatan penolakan akses.
 */
export function nexusAdministrationHomeHref(
  capabilities: NexusAdministrationCapabilities,
): string | undefined {
  if (capabilities.canReadAccounts) return "/nexus/administrasi";
  if (nexusCanOpenRoleManagement(capabilities)) {
    return "/nexus/administrasi/peran";
  }
  if (capabilities.canReadAudit) return "/nexus/administrasi/audit";
  return undefined;
}
