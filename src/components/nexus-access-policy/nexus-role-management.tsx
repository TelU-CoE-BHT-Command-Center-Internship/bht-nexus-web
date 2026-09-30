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
  NexusWorkspaceNotice,
  NexusWorkspacePlannedButton,
} from "@/components/nexus-workspace-ui/nexus-workspace-elements";
import { normalizeWorkspaceSearch } from "@/components/nexus-workspace-ui/nexus-workspace-format";
import { NexusWorkspacePage } from "@/components/nexus-workspace-ui/nexus-workspace-page";
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
  | { kind: "deactivate" }
  | { kind: "discard"; nextAction: PendingRoleAction }
  | { kind: "save" };

const ADMINISTRATION_HREF = "/nexus/administrasi";
const PAGE_DESCRIPTION =
  "Atur hak akses bawaan untuk setiap peran pengguna BHT Nexus.";

function draftFromRole(role: NexusServerRoleRecord): RoleDraft {
  return {
    description: role.description,
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
  capabilities,
  hasInitialRoleContext,
  initialRoleId,
}: NexusRoleManagementProps) {
  const router = useRouter();
  const navigate = useNexusWorkspaceNavigation();
  const directory = useNexusServerRoles();
  const { modules, roles } = directory;

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
        activeDraft.description !== selectedRole.description),
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
      setActionError(error);
      setAnnouncement(error);
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
    if (hasUnsavedPermissions) {
      setPendingDialog({ kind: "save" });
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

  async function deactivateSelectedRole() {
    if (!selectedRole) return;
    const role = selectedRole;
    setIsSaving(true);
    const error = await directory.deactivateRole(role);
    setIsSaving(false);
    if (error) {
      setActionError(error);
      setAnnouncement(error);
      return;
    }
    setChosenRoleId(undefined);
    setDraft(null);
    setActionError("");
    setAnnouncement(`Peran ${role.label} dinonaktifkan.`);
  }

  const tabs = [
    { id: "matrix", label: "Matriks Hak Akses" },
    { id: "users", label: "Pengguna" },
    { id: "info", label: "Informasi" },
  ];

  const canEditPermissions = capabilities.canManageRolePermissions;
  const canEditDetails = capabilities.canManageRoles;
  const isDefaultRole = Boolean(selectedRole && selectedRole.kind === "SYSTEM");
  const canRestoreRoleDefaults =
    capabilities.canManageRolePermissions && isDefaultRole;
  const canManageSelectedRoleLifecycle =
    capabilities.canManageRoles && !isDefaultRole;
  const hasSecondaryActions =
    capabilities.canManageRoles || canRestoreRoleDefaults;
  const discardDescription =
    pendingDialog?.kind === "discard"
      ? pendingDialog.nextAction.kind === "duplicate-role"
        ? `Duplikasi memakai versi ${selectedRole?.label ?? "peran"} yang terakhir disimpan. Perubahan yang belum disimpan tidak akan ikut dan akan dibuang.`
        : pendingDialog.nextAction.kind === "add-role"
          ? "Perubahan peran yang belum disimpan akan dibuang sebelum Anda membuat peran baru."
          : "Perubahan peran yang belum disimpan akan dibuang sebelum Anda membuka peran lain."
      : "";

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
                    <span className={styles.roleListMeta}>
                      <span className={styles.roleListCount}>
                        {role.permissions.length}
                        <span className={styles.visuallyHidden}>
                          {` izin aktif pada peran ${role.label}`}
                        </span>
                      </span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}

          <div className={styles.rolePanelNote}>
            <strong>Tentang hak akses bawaan</strong>
            <p>
              Hak akses bawaan berlaku untuk seluruh akun yang memakai peran
              tersebut. Angka pada setiap peran menunjukkan jumlah izin yang
              sedang aktif.
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

                {activeTab === "users" ? (
                  <div className={styles.usersEmpty}>
                    <strong>Daftar akun per peran segera tersedia</strong>
                    <p>
                      Akun yang memakai peran {selectedRole.label} akan tampil
                      di sini setelah layanan daftar akun tersambung ke halaman
                      ini.
                    </p>
                    <NexusWorkspacePlannedButton>
                      Buka daftar akun
                    </NexusWorkspacePlannedButton>
                  </div>
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
                        <dt>Pengenal peran</dt>
                        <dd>{selectedRole.name}</dd>
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
                    {canRestoreRoleDefaults ? (
                      <NexusWorkspacePlannedButton description="Pemulihan hak akses bawaan akan segera tersedia">
                        Pulihkan ke default
                      </NexusWorkspacePlannedButton>
                    ) : null}
                    {canManageSelectedRoleLifecycle ? (
                      <NexusWorkspaceButton
                        disabled={isSaving}
                        onClick={() => setPendingDialog({ kind: "deactivate" })}
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
              title="Pilih peran lebih dahulu"
            />
          )}
        </section>
      </div>

      {formDrawer ? (
        <NexusRoleFormDrawer
          {...(formDrawer.duplicateRoleId
            ? {
                duplicateSource: roles.find(
                  (role) => role.id === formDrawer.duplicateRoleId,
                ),
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
          description={`Perubahan hak akses berlaku untuk seluruh akun yang memakai peran ${selectedRole.label}, dan tercatat pada log audit.`}
          onCancel={() => setPendingDialog(null)}
          onConfirm={() => {
            setPendingDialog(null);
            void applyDraft();
          }}
          title="Simpan perubahan hak akses peran?"
          tone="warning"
        />
      ) : null}

      {pendingDialog?.kind === "deactivate" && selectedRole ? (
        <NexusWorkspaceConfirmDialog
          cancelLabel="Batal"
          confirmLabel="Nonaktifkan peran"
          description={`Peran ${selectedRole.label} dikeluarkan dari daftar dan tidak dapat dipilih lagi. Layanan hanya menerima bila peran tidak dipakai akun dan tidak memiliki hak akses aktif; mengaktifkan kembali belum tersedia.${isDirty ? " Perubahan peran yang belum disimpan akan dibuang." : ""}`}
          onCancel={() => setPendingDialog(null)}
          onConfirm={() => {
            setPendingDialog(null);
            void deactivateSelectedRole();
          }}
          title="Nonaktifkan peran ini?"
          tone="danger"
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
