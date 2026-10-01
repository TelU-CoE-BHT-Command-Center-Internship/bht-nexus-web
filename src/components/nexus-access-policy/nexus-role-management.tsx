"use client";

import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import type { NexusPermissionId } from "@/components/nexus-access-policy/nexus-access-policy";
import type { NexusRoleDraftInput } from "@/components/nexus-access-policy/nexus-access-policy-session";
import { NexusPermissionMatrix } from "@/components/nexus-access-policy/nexus-permission-matrix";
import styles from "@/components/nexus-access-policy/nexus-role-management.module.css";
import {
  type NexusPermissionMatrixModule,
  type NexusServerRoleRecord,
  useNexusServerRoles,
} from "@/components/nexus-access-policy/nexus-role-server";
import {
  type NexusAccountStatus,
  nexusAccountStatusLabels,
} from "@/components/nexus-accounts/nexus-account-directory";
import { nexusAccountRoleIds } from "@/components/nexus-accounts/nexus-account-server";
import {
  nexusAccountSpecialAccessLabel,
  useNexusAccountSpecialAccess,
} from "@/components/nexus-accounts/nexus-account-special-access";
import {
  administrationRelationshipLabel,
  resolveAdministrationRelationship,
} from "@/components/nexus-administration/nexus-administration-relationship";
import { DashboardShellIcon } from "@/components/nexus-dashboard-shell/nexus-dashboard-shell-icons";
import type { NexusAdministrationCapabilities } from "@/components/nexus-dashboard-shell/nexus-workspace-access";
import { NexusWorkspaceBreadcrumb } from "@/components/nexus-workspace-ui/nexus-workspace-breadcrumb";
import { NexusWorkspaceConfirmDialog } from "@/components/nexus-workspace-ui/nexus-workspace-confirm-dialog";
import {
  NexusWorkspaceSearch,
  NexusWorkspaceTabs,
} from "@/components/nexus-workspace-ui/nexus-workspace-controls";
import {
  NexusWorkspaceButton,
  NexusWorkspaceEmptyState,
  NexusWorkspaceNotice,
} from "@/components/nexus-workspace-ui/nexus-workspace-elements";
import {
  displayRecordId,
  normalizeWorkspaceSearch,
} from "@/components/nexus-workspace-ui/nexus-workspace-format";
import { NexusWorkspacePage } from "@/components/nexus-workspace-ui/nexus-workspace-page";
import {
  NexusWorkspaceMobileAction,
  NexusWorkspaceMobileCard,
  type NexusWorkspaceRecordColumn,
  NexusWorkspaceRecordTable,
  NexusWorkspaceTableAction,
  NexusWorkspaceTableBadge,
} from "@/components/nexus-workspace-ui/nexus-workspace-records";
import { NexusWorkspaceState } from "@/components/nexus-workspace-ui/nexus-workspace-state";
import {
  useNexusWorkspaceNavigation,
  useNexusWorkspaceUnsavedChanges,
} from "@/components/nexus-workspace-ui/nexus-workspace-unsaved-changes";

const NexusRoleFormDrawer = dynamic(() =>
  import("@/components/nexus-access-policy/nexus-role-form-drawer").then(
    (module) => module.NexusRoleFormDrawer,
  ),
);

type NexusRoleManagementProps = {
  /** Direktori Anggota boleh dibaca akun ini, sehingga nama anggota dapat ditampilkan. */
  canReadMembers: boolean;
  capabilities: NexusAdministrationCapabilities;
  hasInitialRoleContext: boolean;
  initialRoleId?: string;
};

type RoleDraft = {
  description: string;
  label: string;
  permissions: readonly NexusPermissionId[];
};

type RoleFormDrawerState = {
  duplicateRoleId?: string;
};

type PendingRoleAction =
  | { kind: "add-role" }
  | { kind: "duplicate-role"; roleId: string }
  | { kind: "select-role"; roleId: string };

type PendingDialog =
  | { kind: "assigned-role"; count: number }
  | { kind: "deactivate" }
  | { kind: "discard"; nextAction: PendingRoleAction }
  | { kind: "restore" }
  /* Jumlah akun tidak ada bila daftar akun tidak boleh dibaca akun ini. */
  | { accountCount?: number; kind: "save" };

const ADMINISTRATION_HREF = "/nexus/administrasi";
const PAGE_DESCRIPTION =
  "Atur hak akses bawaan untuk setiap peran pengguna BHT Nexus.";

const userColumns: readonly NexusWorkspaceRecordColumn[] = [
  { id: "primary", label: "Pengguna", primary: true },
  { id: "member", label: "Hubungan Anggota" },
  { id: "status", label: "Status Akun" },
  { id: "special", label: "Akses Khusus" },
  { id: "action", label: "Aksi" },
];

function accountStatusTone(status: NexusAccountStatus) {
  if (status === "ACTIVE") return "success";
  if (status === "INVITED") return "waiting";
  return "danger";
}

/* Deskripsi yang disunting adalah yang tersimpan, bukan kalimat pengganti
   yang ditampilkan selama peran belum punya deskripsi. */
function draftFromRole(role: NexusServerRoleRecord): RoleDraft {
  return {
    description: role.storedDescription,
    label: role.label,
    permissions: [...role.permissions],
  };
}

function samePermissions(first: readonly string[], second: readonly string[]) {
  if (first.length !== second.length) return false;
  const known = new Set(first);
  return second.every((permission) => known.has(permission));
}

function permissionChangeSummary(
  before: readonly string[],
  after: readonly string[],
) {
  const previous = new Set(before);
  const next = new Set(after);
  const added = after.filter((permission) => !previous.has(permission)).length;
  const removed = before.filter((permission) => !next.has(permission)).length;
  return { added, removed };
}

/**
 * Ringkasan cakupan peran dihitung dari hak akses yang sedang berlaku pada
 * baris matriks server, bukan dari teks terpisah.
 */
function roleAccessSummary(
  permissions: readonly NexusPermissionId[],
  modules: readonly NexusPermissionMatrixModule[],
) {
  const granted = new Set(permissions);
  if (granted.size === 0) return ["Belum ada hak akses yang aktif"];
  const modulesWith = (actions: readonly string[]) =>
    modules.filter((module) =>
      module.permissions.some(
        (permission) =>
          actions.includes(permission.action) && granted.has(permission.id),
      ),
    ).length;
  const viewable = modulesWith(["view"]);
  const editable = modulesWith(["create", "update"]);
  const decisions = modulesWith(["review", "approve", "manage"]);
  return [
    `Dapat membuka ${viewable} dari ${modules.length} modul`,
    editable > 0
      ? `Dapat mengisi atau memperbarui data pada ${editable} modul`
      : "Tidak dapat mengubah data",
    decisions > 0
      ? `Memegang kewenangan tinjauan, persetujuan, atau pengelolaan pada ${decisions} modul`
      : "Tidak memegang kewenangan tinjauan atau pengelolaan",
  ];
}

export function NexusRoleManagement({
  canReadMembers,
  capabilities,
  hasInitialRoleContext,
  initialRoleId,
}: NexusRoleManagementProps) {
  const router = useRouter();
  const navigate = useNexusWorkspaceNavigation();
  const directory = useNexusServerRoles({ canReadMembers });
  const { accounts, members, modules, roles } = directory;
  const specialAccess = useNexusAccountSpecialAccess(
    capabilities.canManageUserOverrides,
  );

  const initialRoleExists = roles.some((role) => role.id === initialRoleId);
  const [chosenRoleId, setChosenRoleId] = useState<string>();
  const selectedRoleId =
    chosenRoleId ?? (initialRoleExists ? initialRoleId : roles[0]?.id) ?? "";
  const [query, setQuery] = useState("");
  const [activeTab, setActiveTab] = useState("matrix");
  const [draft, setDraft] = useState<RoleDraft | null>(null);
  const [pendingDialog, setPendingDialog] = useState<PendingDialog | null>(
    null,
  );
  const [formDrawer, setFormDrawer] = useState<RoleFormDrawerState | null>(
    null,
  );
  const [announcement, setAnnouncement] = useState("");
  const [actionError, setActionError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [dismissedInvalidRoleId, setDismissedInvalidRoleId] = useState("");

  useEffect(() => {
    if (!announcement) return;
    const timeoutId = window.setTimeout(() => setAnnouncement(""), 4500);
    return () => window.clearTimeout(timeoutId);
  }, [announcement]);

  const selectedRole = roles.find((role) => role.id === selectedRoleId);
  const activeDraft = selectedRole
    ? (draft ?? draftFromRole(selectedRole))
    : null;
  const grantedPermissions = useMemo(
    () => new Set(activeDraft?.permissions ?? []),
    [activeDraft],
  );
  const hasUnsavedDetails = Boolean(
    selectedRole &&
      activeDraft &&
      (activeDraft.label !== selectedRole.label ||
        activeDraft.description !== selectedRole.storedDescription),
  );
  const hasUnsavedPermissions = Boolean(
    selectedRole &&
      activeDraft &&
      !samePermissions(activeDraft.permissions, selectedRole.permissions),
  );
  const isDirty = hasUnsavedDetails || hasUnsavedPermissions;

  useNexusWorkspaceUnsavedChanges({
    confirmLabel: "Buang dan keluar",
    description:
      "Perubahan peran yang belum disimpan akan hilang jika Anda meninggalkan halaman ini.",
    isDirty,
    title: "Buang perubahan peran?",
  });

  /* Tanpa daftar akun, jumlah pemakai peran tidak diketahui dan tidak pernah
     ditampilkan sebagai nol. Akun berperan ganda terhitung pada setiap perannya. */
  const accountsKnown = accounts !== undefined;
  const accountsByRole = useMemo(
    () =>
      (accounts ?? []).filter((account) =>
        nexusAccountRoleIds(account).includes(selectedRoleId),
      ),
    [accounts, selectedRoleId],
  );
  const roleUsage = useMemo(() => {
    const usage = new Map<string, number>();
    for (const account of accounts ?? []) {
      for (const roleId of nexusAccountRoleIds(account)) {
        usage.set(roleId, (usage.get(roleId) ?? 0) + 1);
      }
    }
    return usage;
  }, [accounts]);
  const memberDirectory = useMemo(
    () =>
      members.map((member) => ({
        assignment: member.coeAssignment,
        id: member.id,
        name: member.name,
      })),
    [members],
  );

  const requestSpecialAccess = specialAccess.request;
  useEffect(() => {
    if (activeTab !== "users") return;
    for (const account of accountsByRole) requestSpecialAccess(account.id);
  }, [accountsByRole, activeTab, requestSpecialAccess]);

  const filteredRoles = useMemo(() => {
    const normalized = normalizeWorkspaceSearch(query);
    if (!normalized) return roles;
    return roles.filter((role) =>
      normalizeWorkspaceSearch(`${role.label} ${role.description}`).includes(
        normalized,
      ),
    );
  }, [query, roles]);

  if (directory.state !== "ready") {
    return (
      <NexusWorkspacePage
        description={PAGE_DESCRIPTION}
        descriptionId="role-management-description"
        title="Peran & Hak Akses"
        titleId="role-management-title"
      >
        <NexusWorkspaceBreadcrumb
          current="Peran & Hak Akses"
          onNavigate={navigate}
          trail={[{ href: ADMINISTRATION_HREF, label: "Administrasi" }]}
        />
        {directory.state === "error" ? (
          <NexusWorkspaceState
            actions={
              <NexusWorkspaceButton onClick={directory.retry} type="button">
                Coba lagi
              </NexusWorkspaceButton>
            }
            description={
              directory.errorMessage ??
              "Peran dan hak akses belum dapat dimuat."
            }
            eyebrow="Gagal memuat"
            title="Peran & Hak Akses belum dapat dimuat"
            tone="danger"
          />
        ) : (
          <NexusWorkspaceState
            description="Peran, katalog izin, dan hak akses bawaan sedang dibaca dari layanan."
            eyebrow="Memuat"
            title="Memuat peran dan hak akses"
          />
        )}
      </NexusWorkspacePage>
    );
  }

  const invalidRoleContext =
    hasInitialRoleContext &&
    !initialRoleExists &&
    dismissedInvalidRoleId !== (initialRoleId ?? "");

  if (invalidRoleContext) {
    return (
      <NexusWorkspacePage
        description={PAGE_DESCRIPTION}
        descriptionId="role-management-invalid-description"
        title="Peran & Hak Akses"
        titleId="role-management-invalid-title"
      >
        <NexusWorkspaceState
          actions={
            <NexusWorkspaceButton
              onClick={() => {
                setDismissedInvalidRoleId(initialRoleId ?? "");
                router.replace("/nexus/administrasi/peran", { scroll: false });
              }}
              type="button"
            >
              Kembali ke daftar peran
            </NexusWorkspaceButton>
          }
          description="Peran pada tautan ini sudah tidak tersedia atau pengenalnya tidak dikenali."
          eyebrow="Konteks tautan tidak tersedia"
          title="Peran tidak ditemukan"
          tone="danger"
        />
      </NexusWorkspacePage>
    );
  }

  function updateDraft(update: Partial<RoleDraft>) {
    if (!selectedRole) return;
    setDraft((current) => ({
      ...(current ?? draftFromRole(selectedRole)),
      ...update,
    }));
  }

  function togglePermission(
    permissionId: NexusPermissionId,
    isGranted: boolean,
  ) {
    if (!activeDraft) return;
    updateDraft({
      permissions: isGranted
        ? [...activeDraft.permissions, permissionId]
        : activeDraft.permissions.filter(
            (permission) => permission !== permissionId,
          ),
    });
  }

  function selectRole(roleId: string) {
    if (roleId === selectedRoleId) return;
    if (isDirty) {
      setPendingDialog({
        kind: "discard",
        nextAction: { kind: "select-role", roleId },
      });
      return;
    }
    setChosenRoleId(roleId);
    setDraft(null);
    setActionError("");
    setActiveTab("matrix");
  }

  function requestRoleForm(nextForm: RoleFormDrawerState) {
    if (isDirty) {
      setPendingDialog({
        kind: "discard",
        nextAction: nextForm.duplicateRoleId
          ? { kind: "duplicate-role", roleId: nextForm.duplicateRoleId }
          : { kind: "add-role" },
      });
      return;
    }
    setFormDrawer(nextForm);
  }

  function proceedAfterDiscard(nextAction: PendingRoleAction) {
    setDraft(null);
    setActionError("");
    if (nextAction.kind === "select-role") {
      setChosenRoleId(nextAction.roleId);
      setActiveTab("matrix");
      return;
    }
    setFormDrawer(
      nextAction.kind === "duplicate-role"
        ? { duplicateRoleId: nextAction.roleId }
        : {},
    );
  }

  function reportActionError(message: string) {
    setActionError(message);
    setAnnouncement(message);
  }

  async function applyDraft() {
    if (!selectedRole || !activeDraft || isSaving) return;
    const changes = permissionChangeSummary(
      selectedRole.permissions,
      activeDraft.permissions,
    );
    setIsSaving(true);
    setActionError("");
    const error = await directory.saveRole(selectedRole, activeDraft);
    setIsSaving(false);
    if (error) {
      reportActionError(error);
      return;
    }
    setDraft(null);
    setAnnouncement(
      changes.added || changes.removed
        ? `Hak akses ${activeDraft.label} disimpan: ${changes.added} izin ditambahkan, ${changes.removed} izin dicabut.`
        : `Perubahan peran ${activeDraft.label} disimpan.`,
    );
  }

  function requestSave() {
    if (!selectedRole || !activeDraft) return;
    if (!hasUnsavedPermissions) {
      void applyDraft();
      return;
    }
    if (!accountsKnown) {
      setPendingDialog({ kind: "save" });
      return;
    }
    if (accountsByRole.length > 0) {
      setPendingDialog({ accountCount: accountsByRole.length, kind: "save" });
      return;
    }
    void applyDraft();
  }

  async function submitRoleForm(input: NexusRoleDraftInput) {
    const result = await directory.createRole(input);
    if (result.error || !result.role) {
      return result.error ?? "Peran tidak dapat dibuat.";
    }
    setFormDrawer(null);
    setChosenRoleId(result.role.id);
    setDraft(null);
    setActionError("");
    setActiveTab("matrix");
    setQuery("");
    setAnnouncement(
      `Peran ${result.role.label} dibuat. Atur hak akses bawaannya lalu simpan perubahan.`,
    );
    return undefined;
  }

  function requestDeactivate() {
    if (!selectedRole) return;
    if (accountsByRole.length > 0) {
      setPendingDialog({ count: accountsByRole.length, kind: "assigned-role" });
      return;
    }
    setPendingDialog({ kind: "deactivate" });
  }

  async function deactivateSelectedRole() {
    if (!selectedRole || isSaving) return;
    const role = selectedRole;
    setIsSaving(true);
    setActionError("");
    const error = await directory.deactivateRole(role);
    setIsSaving(false);
    if (error) {
      setDraft(null);
      reportActionError(error);
      return;
    }
    setChosenRoleId(undefined);
    setDraft(null);
    setAnnouncement(`Peran ${role.label} dinonaktifkan.`);
  }

  async function restoreSelectedRole() {
    if (!selectedRole || isSaving) return;
    const role = selectedRole;
    const keptDetails = hasUnsavedDetails ? activeDraft : null;
    setIsSaving(true);
    setActionError("");
    const result = await directory.restoreRole(role);
    setIsSaving(false);
    if (result.error || !result.permissions) {
      reportActionError(
        result.error ?? "Hak akses peran tidak dapat dipulihkan.",
      );
      return;
    }
    setDraft(
      keptDetails
        ? { ...keptDetails, permissions: [...result.permissions] }
        : null,
    );
    setAnnouncement(
      keptDetails
        ? `Hak akses ${role.label} dipulihkan ke bawaan. Perubahan nama atau deskripsi masih perlu disimpan.`
        : `Hak akses ${role.label} dipulihkan ke bawaan.`,
    );
  }

  const tabs = [
    { id: "matrix", label: "Matriks Hak Akses" },
    {
      ...(accountsKnown ? { count: accountsByRole.length } : {}),
      id: "users",
      label: "Pengguna",
    },
    { id: "info", label: "Informasi" },
  ];

  const canEditPermissions = capabilities.canManageRolePermissions;
  const canEditDetails = capabilities.canManageRoles;
  const isDefaultRole = Boolean(selectedRole && selectedRole.kind === "SYSTEM");
  const canRestoreSelectedRole =
    capabilities.canRestoreRoleDefaults && isDefaultRole;
  const canManageSelectedRoleLifecycle =
    capabilities.canManageRoles && !isDefaultRole;
  const hasSecondaryActions =
    capabilities.canManageRoles || canRestoreSelectedRole;
  const discardDescription =
    pendingDialog?.kind === "discard"
      ? pendingDialog.nextAction.kind === "duplicate-role"
        ? `Duplikasi memakai versi ${selectedRole?.label ?? "peran"} yang terakhir disimpan. Perubahan yang belum disimpan tidak akan ikut dan akan dibuang.`
        : pendingDialog.nextAction.kind === "add-role"
          ? "Perubahan peran yang belum disimpan akan dibuang sebelum Anda membuat peran baru."
          : "Perubahan peran yang belum disimpan akan dibuang sebelum Anda membuka peran lain."
      : "";
  const restoreDescription = [
    `Hak akses peran ${selectedRole?.label ?? "ini"} kembali ke bawaan BHT Nexus.`,
    accountsByRole.length > 0
      ? `${accountsByRole.length} akun memakai peran ini dan langsung mengikuti hak akses bawaannya.`
      : "",
    "Akses khusus pada masing-masing akun tidak ikut berubah.",
    hasUnsavedPermissions
      ? "Perubahan hak akses yang belum disimpan akan diganti dengan bawaan."
      : "",
    hasUnsavedDetails
      ? "Perubahan nama atau deskripsi tetap dipertahankan sampai Anda menyimpannya."
      : "",
  ]
    .filter(Boolean)
    .join(" ");
  const duplicateSource = formDrawer?.duplicateRoleId
    ? roles.find((role) => role.id === formDrawer.duplicateRoleId)
    : undefined;

  const userRows = accountsByRole.map((account) => {
    const personName = account.displayName;
    const relationship = resolveAdministrationRelationship(
      account,
      memberDirectory,
      accounts ?? [],
    );
    const relationshipLabel = administrationRelationshipLabel(relationship);
    const specialAccessCount = specialAccess.countFor(account.id);
    const specialAccessLabel =
      nexusAccountSpecialAccessLabel(specialAccessCount);
    const openAccount = () =>
      navigate(
        `${ADMINISTRATION_HREF}?account=${encodeURIComponent(account.id)}`,
      );

    return {
      cells: {
        action: (
          <NexusWorkspaceTableAction
            label={`Buka akun ${personName}`}
            onClick={openAccount}
          >
            Buka akun
          </NexusWorkspaceTableAction>
        ),
        member: (
          <span className={styles.userMember}>
            <strong>
              {relationship.kind === "LINKED"
                ? relationship.member.name
                : relationshipLabel}
            </strong>
            <small>
              {relationship.kind === "LINKED"
                ? relationship.member.assignment || relationshipLabel
                : relationship.kind === "NON_MEMBER"
                  ? "Tidak memerlukan profil anggota"
                  : "Hubungan belum ditentukan"}
            </small>
          </span>
        ),
        primary: (
          <span className={styles.userIdentity}>
            <strong>{personName}</strong>
            <small>{account.email}</small>
          </span>
        ),
        special: (
          <NexusWorkspaceTableBadge
            tone={
              typeof specialAccessCount === "number" && specialAccessCount > 0
                ? "info"
                : "neutral"
            }
          >
            {specialAccessLabel}
          </NexusWorkspaceTableBadge>
        ),
        status: (
          <NexusWorkspaceTableBadge tone={accountStatusTone(account.status)}>
            {nexusAccountStatusLabels[account.status]}
          </NexusWorkspaceTableBadge>
        ),
      },
      id: account.id,
      mobile: (
        <NexusWorkspaceMobileCard
          action={
            <NexusWorkspaceMobileAction
              label={`Buka akun ${personName}`}
              onClick={openAccount}
            >
              Buka akun
            </NexusWorkspaceMobileAction>
          }
          eyebrow={
            <>
              <span className={styles.userAccountId} title={account.id}>
                {displayRecordId(account.id)}
              </span>
              <NexusWorkspaceTableBadge
                tone={accountStatusTone(account.status)}
              >
                {nexusAccountStatusLabels[account.status]}
              </NexusWorkspaceTableBadge>
            </>
          }
          meta={
            <dl>
              <div>
                <dt>Email</dt>
                <dd>{account.email}</dd>
              </div>
              <div>
                <dt>Anggota</dt>
                <dd>
                  {relationship.kind === "LINKED"
                    ? relationship.member.name
                    : relationshipLabel}
                </dd>
              </div>
              <div>
                <dt>Akses khusus</dt>
                <dd>{specialAccessLabel}</dd>
              </div>
            </dl>
          }
          title={personName}
        />
      ),
    };
  });

  return (
    <NexusWorkspacePage
      description={PAGE_DESCRIPTION}
      descriptionId="role-management-description"
      title="Peran & Hak Akses"
      titleId="role-management-title"
    >
      <NexusWorkspaceBreadcrumb
        current="Peran & Hak Akses"
        onNavigate={navigate}
        trail={[{ href: ADMINISTRATION_HREF, label: "Administrasi" }]}
      />

      <div className={styles.workspace}>
        <aside className={styles.rolePanel}>
          <header className={styles.rolePanelHeader}>
            <h3>Daftar Peran</h3>
            {capabilities.canManageRoles ? (
              <button
                aria-label="Tambah peran baru"
                className={styles.addRoleButton}
                onClick={() => requestRoleForm({})}
                type="button"
              >
                <svg aria-hidden="true" fill="none" viewBox="0 0 24 24">
                  <path d="M12 4.5v15M4.5 12h15" />
                </svg>
              </button>
            ) : null}
          </header>

          <NexusWorkspaceSearch
            label="Cari peran berdasarkan nama atau deskripsi"
            name="role-search"
            onValueChange={setQuery}
            placeholder="Cari peran"
            value={query}
          />

          {filteredRoles.length === 0 ? (
            <div className={styles.rolePanelEmpty}>
              <strong>Tidak ada peran yang cocok</strong>
              <p>Ubah kata kunci untuk melihat peran lainnya.</p>
              <NexusWorkspaceButton onClick={() => setQuery("")} type="button">
                Hapus pencarian
              </NexusWorkspaceButton>
            </div>
          ) : (
            <ul className={styles.roleList}>
              {filteredRoles.map((role) => (
                <li key={role.id}>
                  <button
                    aria-current={
                      role.id === selectedRoleId ? "true" : undefined
                    }
                    className={styles.roleListItem}
                    data-selected={role.id === selectedRoleId}
                    onClick={() => selectRole(role.id)}
                    type="button"
                  >
                    <span className={styles.roleListIcon} aria-hidden="true">
                      <DashboardShellIcon name="members" />
                    </span>
                    <span className={styles.roleListCopy}>
                      <strong>{role.label}</strong>
                      <small>{role.description}</small>
                    </span>
                    {accountsKnown ? (
                      <span className={styles.roleListMeta}>
                        <span className={styles.roleListCount}>
                          {roleUsage.get(role.id) ?? 0}
                          <span className={styles.visuallyHidden}>
                            {` akun memakai peran ${role.label}`}
                          </span>
                        </span>
                      </span>
                    ) : null}
                  </button>
                </li>
              ))}
            </ul>
          )}

          <div className={styles.rolePanelNote}>
            <strong>Tentang hak akses bawaan</strong>
            <p>
              Hak akses bawaan berlaku untuk seluruh akun yang memakai peran
              tersebut. Kebutuhan satu akun yang berbeda diatur melalui akses
              khusus pada akun itu sendiri.
            </p>
          </div>
        </aside>

        <section className={styles.roleDetail}>
          {selectedRole && activeDraft ? (
            <>
              <header className={styles.roleDetailHeader}>
                <span aria-hidden="true" className={styles.roleDetailIcon}>
                  <DashboardShellIcon name="administration" />
                </span>
                <div className={styles.roleDetailCopy}>
                  <span>Peran terpilih</span>
                  <h3>{selectedRole.label}</h3>
                  <p>{selectedRole.description}</p>
                </div>
                <div className={styles.roleDetailBadges}>
                  <span
                    className={styles.roleStatus}
                    data-status={selectedRole.status}
                  >
                    Aktif
                  </span>
                  <span className={styles.roleKind}>
                    {selectedRole.kind === "SYSTEM"
                      ? "Peran bawaan"
                      : "Peran kustom"}
                  </span>
                </div>
              </header>

              {actionError ? (
                <NexusWorkspaceNotice tone="danger">
                  {actionError}
                </NexusWorkspaceNotice>
              ) : null}

              <NexusWorkspaceTabs
                activeId={activeTab}
                label="Bagian rincian peran"
                onActiveChange={setActiveTab}
                panelId="role-detail-panel"
                tabs={tabs}
              />

              <div className={styles.roleDetailPanel} id="role-detail-panel">
                {activeTab === "matrix" ? (
                  <>
                    <p className={styles.matrixGuidance}>
                      Nyalakan izin yang dibutuhkan peran ini. Tanda —
                      menandakan tindakan tersebut tidak berlaku untuk modul
                      terkait.
                    </p>
                    <NexusPermissionMatrix
                      granted={grantedPermissions}
                      isReadOnly={!canEditPermissions || isSaving}
                      modules={modules}
                      onToggle={togglePermission}
                      roleLabel={selectedRole.label}
                    />
                  </>
                ) : null}

                {activeTab === "users" && accountsKnown ? (
                  <NexusWorkspaceRecordTable
                    caption={`Akun yang memakai peran ${selectedRole.label}`}
                    columns={userColumns}
                    empty={
                      <NexusWorkspaceEmptyState
                        actions={
                          <NexusWorkspaceButton
                            onClick={() => navigate(ADMINISTRATION_HREF)}
                            type="button"
                          >
                            Buka daftar akun
                          </NexusWorkspaceButton>
                        }
                        description="Peran ini dapat dipilih ketika mengundang akun baru atau ketika mengubah akses akun yang sudah ada."
                        title="Belum ada akun pada peran ini"
                      />
                    }
                    pagination={null}
                    rows={userRows}
                  />
                ) : null}

                {activeTab === "users" && !accountsKnown ? (
                  <NexusWorkspaceEmptyState
                    description={`Akun Anda belum berwenang membaca daftar akun, sehingga akun yang memakai peran ${selectedRole.label} tidak ditampilkan.`}
                    title="Daftar akun tidak dapat dibaca"
                  />
                ) : null}

                {activeTab === "info" ? (
                  <div className={styles.infoPanel}>
                    <dl className={styles.infoGrid}>
                      <div>
                        <dt>Jenis peran</dt>
                        <dd>
                          {selectedRole.kind === "SYSTEM"
                            ? "Bawaan BHT Nexus"
                            : "Dibuat administrator"}
                        </dd>
                      </div>
                      <div>
                        <dt>Status</dt>
                        <dd>Aktif dan dapat dipilih</dd>
                      </div>
                      <div>
                        <dt>Akun pada peran ini</dt>
                        <dd>
                          {accountsKnown
                            ? `${accountsByRole.length} akun`
                            : "Tidak dapat dibaca akun Anda"}
                        </dd>
                      </div>
                      <div>
                        <dt>Hak akses aktif</dt>
                        <dd>{`${selectedRole.permissions.length} izin pada ${modules.length} modul`}</dd>
                      </div>
                    </dl>

                    <ul className={styles.infoSummary}>
                      {roleAccessSummary(selectedRole.permissions, modules).map(
                        (item) => (
                          <li key={item}>{item}</li>
                        ),
                      )}
                    </ul>

                    <div className={styles.infoForm}>
                      <label
                        className={styles.infoField}
                        htmlFor="role-detail-label"
                      >
                        <span>Nama peran</span>
                        <input
                          disabled={!canEditDetails || isSaving}
                          id="role-detail-label"
                          name="roleLabel"
                          onChange={(event) =>
                            updateDraft({ label: event.currentTarget.value })
                          }
                          type="text"
                          value={activeDraft.label}
                        />
                      </label>
                      <label
                        className={styles.infoField}
                        htmlFor="role-detail-description"
                      >
                        <span>Deskripsi</span>
                        <textarea
                          disabled={!canEditDetails || isSaving}
                          id="role-detail-description"
                          name="roleDescription"
                          onChange={(event) =>
                            updateDraft({
                              description: event.currentTarget.value,
                            })
                          }
                          placeholder="Belum ada deskripsi"
                          rows={3}
                          value={activeDraft.description}
                        />
                      </label>
                      <p className={styles.infoHint}>
                        Mengubah nama peran tidak memutus akun yang sudah
                        memakainya.
                      </p>
                    </div>
                  </div>
                ) : null}
              </div>

              <footer className={styles.roleActions}>
                <div className={styles.roleActionsPrimary}>
                  {capabilities.canManageRoles ||
                  capabilities.canManageRolePermissions ? (
                    <NexusWorkspaceButton
                      disabled={
                        !isDirty || isSaving || !activeDraft.label.trim()
                      }
                      onClick={requestSave}
                      tone="primary"
                      type="button"
                    >
                      {isSaving ? "Menyimpan…" : "Simpan perubahan"}
                    </NexusWorkspaceButton>
                  ) : null}
                  {isDirty ? (
                    <span className={styles.dirtyHint}>
                      Ada perubahan yang belum disimpan.
                    </span>
                  ) : null}
                </div>
                {hasSecondaryActions ? (
                  <div className={styles.roleActionsSecondary}>
                    {capabilities.canManageRoles ? (
                      <NexusWorkspaceButton
                        disabled={isSaving}
                        onClick={() =>
                          requestRoleForm({ duplicateRoleId: selectedRole.id })
                        }
                        type="button"
                      >
                        Duplikasi peran
                      </NexusWorkspaceButton>
                    ) : null}
                    {canRestoreSelectedRole ? (
                      <NexusWorkspaceButton
                        disabled={isSaving}
                        onClick={() => setPendingDialog({ kind: "restore" })}
                        type="button"
                      >
                        Pulihkan ke default
                      </NexusWorkspaceButton>
                    ) : null}
                    {canManageSelectedRoleLifecycle ? (
                      <NexusWorkspaceButton
                        disabled={isSaving}
                        onClick={requestDeactivate}
                        tone="danger"
                        type="button"
                      >
                        Nonaktifkan peran
                      </NexusWorkspaceButton>
                    ) : null}
                  </div>
                ) : null}
              </footer>
            </>
          ) : (
            <NexusWorkspaceState
              description="Pilih salah satu peran pada daftar untuk meninjau dan menyetel hak aksesnya."
              eyebrow="Belum ada peran terpilih"
              framed={false}
              title="Pilih peran lebih dahulu"
            />
          )}
        </section>
      </div>

      {formDrawer ? (
        <NexusRoleFormDrawer
          {...(duplicateSource
            ? {
                duplicateSource: {
                  ...duplicateSource,
                  description: duplicateSource.storedDescription,
                },
              }
            : {})}
          onClose={() => setFormDrawer(null)}
          onSubmit={submitRoleForm}
          roles={roles}
        />
      ) : null}

      {pendingDialog?.kind === "save" && selectedRole ? (
        <NexusWorkspaceConfirmDialog
          cancelLabel="Periksa lagi"
          confirmLabel="Simpan hak akses"
          description={
            pendingDialog.accountCount === undefined
              ? `Perubahan hak akses berlaku untuk seluruh akun yang memakai peran ${selectedRole.label}, kecuali izin yang sudah diatur sebagai akses khusus pada akun tertentu.`
              : `${pendingDialog.accountCount} akun memakai peran ${selectedRole.label}. Perubahan hak akses berlaku untuk seluruh akun tersebut, kecuali izin yang sudah diatur sebagai akses khusus pada akun tertentu.`
          }
          onCancel={() => setPendingDialog(null)}
          onConfirm={() => {
            setPendingDialog(null);
            void applyDraft();
          }}
          title="Simpan perubahan hak akses peran?"
          tone="warning"
        />
      ) : null}

      {pendingDialog?.kind === "restore" && selectedRole ? (
        <NexusWorkspaceConfirmDialog
          cancelLabel="Batal"
          confirmLabel="Pulihkan hak akses"
          description={restoreDescription}
          onCancel={() => setPendingDialog(null)}
          onConfirm={() => {
            setPendingDialog(null);
            void restoreSelectedRole();
          }}
          title="Pulihkan hak akses ke bawaan?"
          tone="warning"
        />
      ) : null}

      {pendingDialog?.kind === "deactivate" && selectedRole ? (
        <NexusWorkspaceConfirmDialog
          cancelLabel="Batal"
          confirmLabel="Nonaktifkan peran"
          description={`Peran ${selectedRole.label} dikeluarkan dari daftar peran beserta hak aksesnya dan tidak dapat dipilih lagi. Mengaktifkan kembali belum tersedia.${isDirty ? " Perubahan peran yang belum disimpan akan dibuang." : ""}`}
          onCancel={() => setPendingDialog(null)}
          onConfirm={() => {
            setPendingDialog(null);
            void deactivateSelectedRole();
          }}
          title="Nonaktifkan peran ini?"
          tone="danger"
        />
      ) : null}

      {pendingDialog?.kind === "assigned-role" && selectedRole ? (
        <NexusWorkspaceConfirmDialog
          cancelLabel="Kembali"
          confirmLabel="Lihat pengguna"
          description={`${pendingDialog.count} akun masih memakai peran ${selectedRole.label}. Pindahkan akun tersebut ke peran lain sebelum menonaktifkannya.`}
          onCancel={() => setPendingDialog(null)}
          onConfirm={() => {
            setPendingDialog(null);
            setActiveTab("users");
          }}
          title="Peran masih digunakan"
          tone="warning"
        />
      ) : null}

      {pendingDialog?.kind === "discard" ? (
        <NexusWorkspaceConfirmDialog
          cancelLabel="Lanjutkan menyunting"
          confirmLabel="Buang perubahan"
          description={discardDescription}
          onCancel={() => setPendingDialog(null)}
          onConfirm={() => {
            const target = pendingDialog;
            setPendingDialog(null);
            proceedAfterDiscard(target.nextAction);
          }}
          title="Buang perubahan peran?"
          tone="warning"
        />
      ) : null}

      <output aria-live="polite" className={styles.announcement}>
        {announcement}
      </output>
    </NexusWorkspacePage>
  );
}
