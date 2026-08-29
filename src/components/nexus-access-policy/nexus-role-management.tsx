"use client";

import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  type NexusPermissionId,
  type NexusRoleRecord,
  nexusAccessModules,
  nexusAccountOverrides,
  nexusRoleAccessSummary,
  nexusRoleMatchesDefault,
} from "@/components/nexus-access-policy/nexus-access-policy";
import {
  type NexusRoleDraftInput,
  useNexusAccessPolicySession,
} from "@/components/nexus-access-policy/nexus-access-policy-session";
import { NexusPermissionMatrix } from "@/components/nexus-access-policy/nexus-permission-matrix";
import styles from "@/components/nexus-access-policy/nexus-role-management.module.css";
import { useNexusAccountSession } from "@/components/nexus-account-session/nexus-account-session";
import { nexusAccountStatusLabels } from "@/components/nexus-accounts/nexus-account-directory";
import {
  administrationRelationshipLabel,
  resolveAdministrationRelationship,
} from "@/components/nexus-administration/nexus-administration-relationship";
import { DashboardShellIcon } from "@/components/nexus-dashboard-shell/nexus-dashboard-shell-icons";
import type { NexusAdministrationCapabilities } from "@/components/nexus-dashboard-shell/nexus-workspace-access";
import { useNexusMemberSession } from "@/components/nexus-member-session/nexus-member-session";
import { NexusWorkspaceBreadcrumb } from "@/components/nexus-workspace-ui/nexus-workspace-breadcrumb";
import { NexusWorkspaceConfirmDialog } from "@/components/nexus-workspace-ui/nexus-workspace-confirm-dialog";
import {
  NexusWorkspaceSearch,
  NexusWorkspaceTabs,
} from "@/components/nexus-workspace-ui/nexus-workspace-controls";
import {
  NexusWorkspaceButton,
  NexusWorkspaceNotice,
} from "@/components/nexus-workspace-ui/nexus-workspace-elements";
import { normalizeWorkspaceSearch } from "@/components/nexus-workspace-ui/nexus-workspace-format";
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

type PendingDialog =
  | { kind: "assigned-role"; count: number }
  | { kind: "deactivate" }
  | { kind: "discard"; nextRoleId?: string; returnHref?: string }
  | { kind: "restore" }
  | { kind: "save"; accountCount: number };

const ADMINISTRATION_HREF = "/nexus/administrasi";

const userColumns: readonly NexusWorkspaceRecordColumn[] = [
  { id: "primary", label: "Pengguna", primary: true },
  { id: "member", label: "Hubungan Anggota" },
  { id: "status", label: "Status Akun" },
  { id: "special", label: "Akses Khusus" },
  { id: "action", label: "Aksi" },
];

function draftFromRole(role: NexusRoleRecord): RoleDraft {
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

export function NexusRoleManagement({
  capabilities,
  hasInitialRoleContext,
  initialRoleId,
}: NexusRoleManagementProps) {
  const router = useRouter();
  const {
    activateRole,
    createRole,
    deactivateRole,
    overrides,
    restoreRoleDefaults,
    roles,
    updateRoleDetails,
    updateRolePermissions,
  } = useNexusAccessPolicySession();
  const { accounts } = useNexusAccountSession();
  const { records: memberRecords } = useNexusMemberSession();
  const memberDirectory = useMemo(
    () =>
      memberRecords.map((member) => ({
        assignment: member.coeAssignment,
        id: member.id,
        name: member.name,
      })),
    [memberRecords],
  );

  const initialRoleExists = roles.some((role) => role.id === initialRoleId);
  const [selectedRoleId, setSelectedRoleId] = useState(
    initialRoleExists ? (initialRoleId as string) : (roles[0]?.id ?? ""),
  );
  const [query, setQuery] = useState("");
  const [activeTab, setActiveTab] = useState("matrix");
  const [draft, setDraft] = useState<RoleDraft | null>(null);
  const [pendingDialog, setPendingDialog] = useState<PendingDialog | null>(
    null,
  );
  const [formDrawer, setFormDrawer] = useState<{
    duplicateRoleId?: string;
  } | null>(null);
  const [announcement, setAnnouncement] = useState("");
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
  const isDirty = Boolean(
    selectedRole &&
      activeDraft &&
      (activeDraft.label !== selectedRole.label ||
        activeDraft.description !== selectedRole.description ||
        !samePermissions(activeDraft.permissions, selectedRole.permissions)),
  );

  const accountsByRole = useMemo(
    () => accounts.filter((account) => account.roleId === selectedRoleId),
    [accounts, selectedRoleId],
  );
  const roleUsage = useMemo(() => {
    const usage = new Map<string, number>();
    for (const account of accounts) {
      if (!account.roleId) continue;
      usage.set(account.roleId, (usage.get(account.roleId) ?? 0) + 1);
    }
    return usage;
  }, [accounts]);

  const filteredRoles = useMemo(() => {
    const normalized = normalizeWorkspaceSearch(query);
    if (!normalized) return roles;
    return roles.filter((role) =>
      normalizeWorkspaceSearch(`${role.label} ${role.description}`).includes(
        normalized,
      ),
    );
  }, [query, roles]);

  const invalidRoleContext =
    hasInitialRoleContext &&
    !initialRoleExists &&
    dismissedInvalidRoleId !== (initialRoleId ?? "");

  if (invalidRoleContext) {
    return (
      <NexusWorkspacePage
        description="Atur hak akses bawaan untuk setiap peran pengguna BHT Nexus."
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
      setPendingDialog({ kind: "discard", nextRoleId: roleId });
      return;
    }
    setSelectedRoleId(roleId);
    setDraft(null);
    setActiveTab("matrix");
  }

  function leaveTo(href: string) {
    if (isDirty) {
      setPendingDialog({ kind: "discard", returnHref: href });
      return;
    }
    router.push(href);
  }

  function applyDraft() {
    if (!selectedRole || !activeDraft) return;
    const changes = permissionChangeSummary(
      selectedRole.permissions,
      activeDraft.permissions,
    );
    try {
      updateRoleDetails(selectedRole.id, {
        description: activeDraft.description,
        label: activeDraft.label,
      });
      updateRolePermissions(selectedRole.id, activeDraft.permissions);
    } catch (caughtError) {
      setAnnouncement(
        caughtError instanceof Error
          ? caughtError.message
          : "Perubahan peran tidak dapat disimpan.",
      );
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
    const permissionsChanged = !samePermissions(
      activeDraft.permissions,
      selectedRole.permissions,
    );
    const accountCount = accountsByRole.length;
    if (permissionsChanged && accountCount > 0) {
      setPendingDialog({ accountCount, kind: "save" });
      return;
    }
    applyDraft();
  }

  function submitRoleForm(input: NexusRoleDraftInput) {
    const created = createRole(input);
    setFormDrawer(null);
    setSelectedRoleId(created.id);
    setDraft(null);
    setActiveTab("matrix");
    setQuery("");
    setAnnouncement(
      `Peran ${created.label} dibuat. Atur hak akses bawaannya lalu simpan perubahan.`,
    );
  }

  function requestDeactivate() {
    if (!selectedRole) return;
    if (accountsByRole.length > 0) {
      setPendingDialog({ count: accountsByRole.length, kind: "assigned-role" });
      return;
    }
    setPendingDialog({ kind: "deactivate" });
  }

  const tabs = [
    { id: "matrix", label: "Matriks Hak Akses" },
    { count: accountsByRole.length, id: "users", label: "Pengguna" },
    { id: "info", label: "Informasi" },
  ];

  const canEditPermissions =
    capabilities.canManageRolePermissions && selectedRole?.status === "ACTIVE";
  const canEditDetails =
    capabilities.canManageRoles && selectedRole?.status === "ACTIVE";
  const isDefaultRole = Boolean(selectedRole && selectedRole.kind === "SYSTEM");
  const matchesDefault = selectedRole
    ? nexusRoleMatchesDefault(selectedRole)
    : true;

  const userRows = accountsByRole.map((account) => {
    const relationship = resolveAdministrationRelationship(
      account,
      memberDirectory,
      accounts,
    );
    const specialAccessCount = nexusAccountOverrides(
      overrides,
      account.id,
    ).length;
    const specialAccessLabel =
      specialAccessCount > 0
        ? `${specialAccessCount} penyesuaian`
        : "Mengikuti peran";
    const openAccount = () =>
      leaveTo(
        `${ADMINISTRATION_HREF}?account=${encodeURIComponent(account.id)}`,
      );

    return {
      cells: {
        action: (
          <NexusWorkspaceTableAction
            label={`Buka akun ${account.displayName}`}
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
                : administrationRelationshipLabel(relationship)}
            </strong>
            <small>
              {relationship.kind === "LINKED"
                ? relationship.member.assignment
                : relationship.kind === "NON_MEMBER"
                  ? "Tidak memerlukan profil anggota"
                  : "Hubungan belum ditentukan"}
            </small>
          </span>
        ),
        primary: (
          <span className={styles.userIdentity}>
            <strong>{account.displayName}</strong>
            <small>{account.email}</small>
          </span>
        ),
        special: (
          <NexusWorkspaceTableBadge
            tone={specialAccessCount > 0 ? "info" : "neutral"}
          >
            {specialAccessLabel}
          </NexusWorkspaceTableBadge>
        ),
        status: (
          <NexusWorkspaceTableBadge
            tone={
              account.status === "ACTIVE"
                ? "success"
                : account.status === "INVITED"
                  ? "waiting"
                  : "danger"
            }
          >
            {nexusAccountStatusLabels[account.status]}
          </NexusWorkspaceTableBadge>
        ),
      },
      id: account.id,
      mobile: (
        <NexusWorkspaceMobileCard
          action={
            <NexusWorkspaceMobileAction
              label={`Buka akun ${account.displayName}`}
              onClick={openAccount}
            >
              Buka akun
            </NexusWorkspaceMobileAction>
          }
          eyebrow={
            <>
              <span className={styles.userAccountId}>{account.id}</span>
              <NexusWorkspaceTableBadge
                tone={
                  account.status === "ACTIVE"
                    ? "success"
                    : account.status === "INVITED"
                      ? "waiting"
                      : "danger"
                }
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
                    : administrationRelationshipLabel(relationship)}
                </dd>
              </div>
              <div>
                <dt>Akses khusus</dt>
                <dd>{specialAccessLabel}</dd>
              </div>
            </dl>
          }
          title={account.displayName}
        />
      ),
    };
  });

  return (
    <NexusWorkspacePage
      description="Atur hak akses bawaan untuk setiap peran pengguna BHT Nexus."
      descriptionId="role-management-description"
      title="Peran & Hak Akses"
      titleId="role-management-title"
    >
      <NexusWorkspaceBreadcrumb
        current="Peran & Hak Akses"
        onNavigate={leaveTo}
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
                onClick={() => setFormDrawer({})}
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
              {filteredRoles.map((role) => {
                const usage = roleUsage.get(role.id) ?? 0;
                return (
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
                          {usage}
                          <span className={styles.visuallyHidden}>
                            {` akun memakai peran ${role.label}`}
                          </span>
                        </span>
                        {role.status === "INACTIVE" ? (
                          <span className={styles.roleListInactive}>
                            Nonaktif
                          </span>
                        ) : null}
                      </span>
                    </button>
                  </li>
                );
              })}
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
                    {selectedRole.status === "ACTIVE" ? "Aktif" : "Nonaktif"}
                  </span>
                  <span className={styles.roleKind}>
                    {selectedRole.kind === "SYSTEM"
                      ? "Peran bawaan"
                      : "Peran kustom"}
                  </span>
                </div>
              </header>

              {selectedRole.status === "INACTIVE" ? (
                <NexusWorkspaceNotice tone="danger">
                  Peran ini nonaktif dan tidak dapat dipilih untuk akun baru.
                  Aktifkan kembali sebelum menyetel hak aksesnya.
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
                      isReadOnly={!canEditPermissions}
                      onToggle={togglePermission}
                      roleLabel={selectedRole.label}
                    />
                  </>
                ) : null}

                {activeTab === "users" ? (
                  <NexusWorkspaceRecordTable
                    caption={`Akun yang memakai peran ${selectedRole.label}`}
                    columns={userColumns}
                    empty={
                      <div className={styles.usersEmpty}>
                        <strong>Belum ada akun pada peran ini</strong>
                        <p>
                          Peran ini dapat dipilih ketika mengundang akun baru
                          atau ketika mengubah akses akun yang sudah ada.
                        </p>
                        <NexusWorkspaceButton
                          onClick={() => leaveTo(ADMINISTRATION_HREF)}
                          type="button"
                        >
                          Buka daftar akun
                        </NexusWorkspaceButton>
                      </div>
                    }
                    pagination={null}
                    rows={userRows}
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
                        <dd>
                          {selectedRole.status === "ACTIVE"
                            ? "Aktif dan dapat dipilih"
                            : "Nonaktif dan tidak dapat dipilih"}
                        </dd>
                      </div>
                      <div>
                        <dt>Akun pada peran ini</dt>
                        <dd>{`${accountsByRole.length} akun`}</dd>
                      </div>
                      <div>
                        <dt>Hak akses aktif</dt>
                        <dd>{`${selectedRole.permissions.length} izin pada ${nexusAccessModules.length} modul`}</dd>
                      </div>
                      {selectedRole.kind === "SYSTEM" ? (
                        <div>
                          <dt>Penyesuaian dari bawaan</dt>
                          <dd>
                            {matchesDefault
                              ? "Masih sama dengan hak akses bawaan"
                              : "Sudah disesuaikan administrator"}
                          </dd>
                        </div>
                      ) : null}
                    </dl>

                    <ul className={styles.infoSummary}>
                      {nexusRoleAccessSummary(selectedRole).map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>

                    <div className={styles.infoForm}>
                      <label
                        className={styles.infoField}
                        htmlFor="role-detail-label"
                      >
                        <span>Nama peran</span>
                        <input
                          disabled={!canEditDetails}
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
                          disabled={!canEditDetails}
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
                      disabled={!isDirty}
                      onClick={requestSave}
                      tone="primary"
                      type="button"
                    >
                      Simpan perubahan
                    </NexusWorkspaceButton>
                  ) : null}
                  {isDirty ? (
                    <span className={styles.dirtyHint}>
                      Ada perubahan yang belum disimpan.
                    </span>
                  ) : null}
                </div>
                {capabilities.canManageRoles ? (
                  <div className={styles.roleActionsSecondary}>
                    <NexusWorkspaceButton
                      onClick={() =>
                        setFormDrawer({ duplicateRoleId: selectedRole.id })
                      }
                      type="button"
                    >
                      Duplikasi peran
                    </NexusWorkspaceButton>
                    {isDefaultRole ? (
                      <NexusWorkspaceButton
                        disabled={matchesDefault}
                        onClick={() => setPendingDialog({ kind: "restore" })}
                        type="button"
                      >
                        Pulihkan ke default
                      </NexusWorkspaceButton>
                    ) : selectedRole.status === "ACTIVE" ? (
                      <NexusWorkspaceButton
                        onClick={requestDeactivate}
                        tone="danger"
                        type="button"
                      >
                        Nonaktifkan peran
                      </NexusWorkspaceButton>
                    ) : (
                      <NexusWorkspaceButton
                        onClick={() => {
                          activateRole(selectedRole.id);
                          setAnnouncement(
                            `Peran ${selectedRole.label} diaktifkan kembali.`,
                          );
                        }}
                        type="button"
                      >
                        Aktifkan peran
                      </NexusWorkspaceButton>
                    )}
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
          description={`${pendingDialog.accountCount} akun memakai peran ${selectedRole.label}. Perubahan hak akses berlaku untuk seluruh akun tersebut, kecuali izin yang sudah diatur sebagai akses khusus pada akun tertentu.`}
          onCancel={() => setPendingDialog(null)}
          onConfirm={() => {
            setPendingDialog(null);
            applyDraft();
          }}
          title="Simpan perubahan hak akses peran?"
          tone="warning"
        />
      ) : null}

      {pendingDialog?.kind === "restore" && selectedRole ? (
        <NexusWorkspaceConfirmDialog
          cancelLabel="Batal"
          confirmLabel="Pulihkan hak akses"
          description={`Hak akses peran ${selectedRole.label} kembali ke bawaan BHT Nexus. Akses khusus pada masing-masing akun tidak ikut berubah.`}
          onCancel={() => setPendingDialog(null)}
          onConfirm={() => {
            setPendingDialog(null);
            restoreRoleDefaults(selectedRole.id);
            setDraft(null);
            setAnnouncement(
              `Hak akses ${selectedRole.label} dipulihkan ke bawaan.`,
            );
          }}
          title="Pulihkan hak akses ke bawaan?"
          tone="warning"
        />
      ) : null}

      {pendingDialog?.kind === "deactivate" && selectedRole ? (
        <NexusWorkspaceConfirmDialog
          cancelLabel="Batal"
          confirmLabel="Nonaktifkan peran"
          description={`Peran ${selectedRole.label} tidak lagi dapat dipilih untuk akun baru. Peran dapat diaktifkan kembali kapan saja.`}
          onCancel={() => setPendingDialog(null)}
          onConfirm={() => {
            setPendingDialog(null);
            deactivateRole(selectedRole.id);
            setDraft(null);
            setAnnouncement(`Peran ${selectedRole.label} dinonaktifkan.`);
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
          description="Perubahan hak akses peran yang belum disimpan akan dihapus."
          onCancel={() => setPendingDialog(null)}
          onConfirm={() => {
            const target = pendingDialog;
            setPendingDialog(null);
            setDraft(null);
            if (target.nextRoleId) {
              setSelectedRoleId(target.nextRoleId);
              setActiveTab("matrix");
            }
            if (target.returnHref) {
              router.push(target.returnHref);
            }
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
