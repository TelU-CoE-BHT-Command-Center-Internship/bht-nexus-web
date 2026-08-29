"use client";

import { useEffect, useMemo, useState } from "react";
import {
  type NexusAccessModuleId,
  type NexusPermissionId,
  type NexusPermissionMode,
  nexusAccessActionLabels,
  nexusAccessModules,
  nexusAccountOverrides,
  nexusEffectiveAccess,
  nexusRoleHasUsableBaseline,
  resolveNexusRole,
} from "@/components/nexus-access-policy/nexus-access-policy";
import {
  type NexusAccountOverrideDraft,
  useNexusAccessPolicySession,
} from "@/components/nexus-access-policy/nexus-access-policy-session";
import { NexusAccessStateBadge } from "@/components/nexus-access-policy/nexus-access-state";
import styles from "@/components/nexus-access-policy/nexus-user-access.module.css";
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
  NexusWorkspaceButton,
  NexusWorkspaceNotice,
} from "@/components/nexus-workspace-ui/nexus-workspace-elements";
import { personInitials } from "@/components/nexus-workspace-ui/nexus-workspace-format";
import { NexusWorkspacePage } from "@/components/nexus-workspace-ui/nexus-workspace-page";
import { NexusWorkspaceState } from "@/components/nexus-workspace-ui/nexus-workspace-state";
import {
  useNexusWorkspaceNavigation,
  useNexusWorkspaceUnsavedChanges,
} from "@/components/nexus-workspace-ui/nexus-workspace-unsaved-changes";

type NexusUserAccessProps = {
  capabilities: NexusAdministrationCapabilities;
  initialAccountId?: string;
};

type PendingDialog = { kind: "reset" };

type AccessFilterId = "active" | "adjusted" | "all" | "inactive";

const ADMINISTRATION_HREF = "/nexus/administrasi";

const modeOptions: readonly {
  hint: string;
  label: string;
  value: NexusPermissionMode;
}[] = [
  { hint: "mengikuti peran", label: "Ikuti peran", value: "INHERIT" },
  { hint: "tambahan khusus akun ini", label: "Tambahkan", value: "GRANT" },
  { hint: "dibatasi khusus akun ini", label: "Batasi", value: "DENY" },
];

function ChevronIcon() {
  return (
    <svg aria-hidden="true" fill="none" viewBox="0 0 16 16">
      <path d="m4 6 4 4 4-4" />
    </svg>
  );
}

export function NexusUserAccess({
  capabilities,
  initialAccountId,
}: NexusUserAccessProps) {
  const navigate = useNexusWorkspaceNavigation();
  const { overrides, replaceAccountOverrides, roles } =
    useNexusAccessPolicySession();
  const { accounts } = useNexusAccountSession();
  const { records: memberRecords } = useNexusMemberSession();
  const [draft, setDraft] = useState<Record<string, NexusPermissionMode>>({});
  const [pendingDialog, setPendingDialog] = useState<PendingDialog | null>(
    null,
  );
  const [announcement, setAnnouncement] = useState("");
  const [filter, setFilter] = useState<AccessFilterId>("all");
  const [openModules, setOpenModules] = useState<NexusAccessModuleId[] | null>(
    null,
  );

  const account = accounts.find(
    (candidate) => candidate.id === initialAccountId,
  );
  const storedModes = useMemo(() => {
    const modes: Record<string, NexusPermissionMode> = {};
    if (!account) return modes;
    for (const override of nexusAccountOverrides(overrides, account.id)) {
      modes[override.permissionId] = override.mode;
    }
    return modes;
  }, [account, overrides]);

  const memberDirectory = useMemo(
    () =>
      memberRecords.map((member) => ({
        assignment: member.coeAssignment,
        id: member.id,
        name: member.name,
      })),
    [memberRecords],
  );

  useEffect(() => {
    if (!announcement) return;
    const timeoutId = window.setTimeout(() => setAnnouncement(""), 4500);
    return () => window.clearTimeout(timeoutId);
  }, [announcement]);

  const role = resolveNexusRole(account?.roleId, roles);
  const hasUsableRoleBaseline = nexusRoleHasUsableBaseline(role);
  const roleGrants = useMemo(
    () =>
      new Set(
        hasUsableRoleBaseline && role.kind === "KNOWN"
          ? role.role.permissions
          : [],
      ),
    [hasUsableRoleBaseline, role],
  );

  function modeFor(permissionId: NexusPermissionId): NexusPermissionMode {
    return draft[permissionId] ?? storedModes[permissionId] ?? "INHERIT";
  }

  const groups = nexusAccessModules.map((module) => {
    const rows = module.permissions.map((permission) => {
      const mode = modeFor(permission.id);
      const baseline = roleGrants.has(permission.id);
      return {
        baseline,
        effective: nexusEffectiveAccess(hasUsableRoleBaseline, baseline, mode),
        label: nexusAccessActionLabels[permission.action],
        mode,
        name: `${module.label} — ${nexusAccessActionLabels[permission.action]}`,
        permissionId: permission.id,
      };
    });
    return { module, rows };
  });

  const allRows = groups.flatMap((group) => group.rows);
  const adjustedCount = allRows.filter((row) => row.mode !== "INHERIT").length;
  const grantedCount = allRows.filter((row) => row.mode === "GRANT").length;
  const deniedCount = allRows.filter((row) => row.mode === "DENY").length;
  const effectiveCount = allRows.filter((row) => row.effective === true).length;
  const inactiveCount = allRows.filter((row) => row.effective === false).length;

  const isDirty = Object.entries(draft).some(
    ([permissionId, mode]) => (storedModes[permissionId] ?? "INHERIT") !== mode,
  );

  useNexusWorkspaceUnsavedChanges({
    confirmLabel: "Buang dan keluar",
    description:
      "Perubahan hak akses yang belum disimpan akan hilang jika Anda meninggalkan halaman ini.",
    isDirty: Boolean(account) && isDirty,
    title: "Buang perubahan hak akses?",
  });

  const filterCounts: Record<AccessFilterId, number> = {
    active: effectiveCount,
    adjusted: adjustedCount,
    all: allRows.length,
    inactive: inactiveCount,
  };

  const visibleGroups = groups
    .map((group) => ({
      module: group.module,
      rows: group.rows.filter((row) =>
        filter === "adjusted"
          ? row.mode !== "INHERIT"
          : filter === "active"
            ? row.effective === true
            : filter === "inactive"
              ? row.effective === false
              : true,
      ),
      total: group.rows.length,
    }))
    .filter((group) => group.rows.length > 0);

  const adjustedModuleIds = groups
    .filter((group) => group.rows.some((row) => row.mode !== "INHERIT"))
    .map((group) => group.module.id);
  const fallbackOpenModules =
    adjustedModuleIds.length > 0
      ? adjustedModuleIds
      : visibleGroups.slice(0, 1).map((group) => group.module.id);
  const expandedModules = openModules ?? fallbackOpenModules;
  const allExpanded =
    visibleGroups.length > 0 &&
    visibleGroups.every((group) => expandedModules.includes(group.module.id));

  if (!account) {
    return (
      <NexusWorkspacePage
        description="Sesuaikan hak akses satu akun terhadap hak akses bawaan perannya."
        descriptionId="user-access-not-found-description"
        title="Akses Khusus Pengguna"
        titleId="user-access-not-found-title"
      >
        <NexusWorkspaceState
          actions={
            <NexusWorkspaceButton
              onClick={() => navigate(ADMINISTRATION_HREF)}
              type="button"
            >
              Kembali ke daftar akun
            </NexusWorkspaceButton>
          }
          description="Akun pada tautan ini sudah tidak tersedia atau ID-nya tidak dikenali."
          eyebrow="Konteks tautan tidak tersedia"
          title="Akun tidak ditemukan"
          tone="danger"
        />
      </NexusWorkspacePage>
    );
  }

  const relationship = resolveAdministrationRelationship(
    account,
    memberDirectory,
    accounts,
  );
  const roleLabel =
    role.kind === "KNOWN"
      ? role.role.label
      : role.kind === "UNKNOWN"
        ? "Peran perlu ditinjau"
        : "Belum ditetapkan";
  const canEdit = capabilities.canManageUserOverrides && hasUsableRoleBaseline;

  function toggleModule(moduleId: NexusAccessModuleId) {
    setOpenModules(
      expandedModules.includes(moduleId)
        ? expandedModules.filter((id) => id !== moduleId)
        : [...expandedModules, moduleId],
    );
  }

  function applyFilter(next: AccessFilterId) {
    setFilter(next);
    setOpenModules(
      next === "all"
        ? null
        : groups
            .filter((group) =>
              group.rows.some((row) =>
                next === "adjusted"
                  ? row.mode !== "INHERIT"
                  : next === "active"
                    ? row.effective === true
                    : row.effective === false,
              ),
            )
            .map((group) => group.module.id),
    );
  }

  function saveOverrides() {
    if (!account || !canEdit) return;
    const drafts: NexusAccountOverrideDraft[] = [];
    for (const row of allRows) {
      if (row.mode === "INHERIT") continue;
      drafts.push({ mode: row.mode, permissionId: row.permissionId });
    }
    replaceAccountOverrides(account.id, drafts);
    setDraft({});
    setAnnouncement(
      drafts.length === 0
        ? `Akses ${account.displayName} kembali mengikuti peran.`
        : `Akses khusus ${account.displayName} disimpan: ${drafts.length} penyesuaian aktif.`,
    );
  }

  return (
    <NexusWorkspacePage
      description="Sesuaikan hak akses satu akun terhadap hak akses bawaan perannya."
      descriptionId="user-access-description"
      title="Akses Khusus Pengguna"
      titleId="user-access-title"
    >
      <NexusWorkspaceBreadcrumb
        current="Akses Khusus Pengguna"
        onNavigate={navigate}
        trail={[{ href: ADMINISTRATION_HREF, label: "Administrasi" }]}
      />

      <div className={styles.overview}>
        <section className={styles.identityCard}>
          <div className={styles.identityHead}>
            <span aria-hidden="true" className={styles.identityAvatar}>
              {personInitials(account.displayName)}
            </span>
            <div className={styles.identityCopy}>
              <h3>{account.displayName}</h3>
              <p>{account.email}</p>
              <small>{account.id}</small>
            </div>
            <span
              className={styles.identityStatus}
              data-status={account.status}
            >
              {nexusAccountStatusLabels[account.status]}
            </span>
          </div>
          <dl className={styles.identityMeta}>
            <div>
              <dt>Peran</dt>
              <dd>
                <strong data-unknown={role.kind !== "KNOWN"}>
                  {roleLabel}
                </strong>
                {role.kind === "KNOWN" ? (
                  <button
                    className={styles.identityLink}
                    onClick={() =>
                      navigate(
                        `/nexus/administrasi/peran?role=${encodeURIComponent(role.role.id)}`,
                      )
                    }
                    type="button"
                  >
                    Lihat hak akses peran
                  </button>
                ) : null}
              </dd>
            </div>
            <div>
              <dt>Hubungan anggota</dt>
              <dd>
                <strong>
                  {relationship.kind === "LINKED"
                    ? relationship.member.name
                    : administrationRelationshipLabel(relationship)}
                </strong>
                {relationship.kind === "LINKED" ? (
                  <small>{relationship.member.assignment}</small>
                ) : null}
              </dd>
            </div>
            <div>
              <dt>Akun diperbarui</dt>
              <dd>
                <strong>{account.updatedAt}</strong>
              </dd>
            </div>
          </dl>
        </section>

        <section className={styles.summaryCard}>
          <header>
            <h3>Ringkasan akses</h3>
            <p>
              {hasUsableRoleBaseline
                ? `Akses dasar mengikuti peran ${roleLabel}, lalu disesuaikan khusus untuk akun ini.`
                : "Hasil akses belum dapat dihitung sampai akun memiliki peran aktif yang berlaku."}
            </p>
          </header>
          <dl className={styles.summaryStats}>
            <div data-tone="effective">
              <dt>{hasUsableRoleBaseline ? "Izin aktif" : "Hasil akses"}</dt>
              <dd>
                {hasUsableRoleBaseline ? (
                  <>
                    {effectiveCount}
                    <span
                      className={styles.summaryUnit}
                    >{`dari ${allRows.length}`}</span>
                  </>
                ) : (
                  <span className={styles.summaryUnit}>
                    Belum dapat dihitung
                  </span>
                )}
              </dd>
            </div>
            <div data-tone="adjusted">
              <dt>Penyesuaian</dt>
              <dd>{adjustedCount}</dd>
            </div>
            <div data-tone="grant">
              <dt>Tambahan</dt>
              <dd>{grantedCount}</dd>
            </div>
            <div data-tone="deny">
              <dt>Dibatasi</dt>
              <dd>{deniedCount}</dd>
            </div>
          </dl>
        </section>
      </div>

      {hasUsableRoleBaseline ? null : (
        <div className={styles.roleWarning}>
          <NexusWorkspaceNotice tone="danger">
            {role.kind === "UNKNOWN"
              ? "Peran yang tersimpan pada akun ini tidak lagi dikenali, sehingga tidak ada hak akses bawaan yang dapat dibaca."
              : role.kind === "KNOWN"
                ? `Peran ${role.role.label} sudah nonaktif dan belum dapat menjadi dasar akses akun ini.`
                : "Akun ini belum mempunyai peran, sehingga tidak ada hak akses bawaan yang dapat dibaca."}{" "}
            Penyesuaian yang sudah tersimpan tetap ada dan akan dihitung kembali
            setelah peran aktif ditetapkan.
          </NexusWorkspaceNotice>
          <NexusWorkspaceButton
            onClick={() =>
              navigate(
                `${ADMINISTRATION_HREF}?account=${encodeURIComponent(account.id)}`,
              )
            }
            type="button"
          >
            Tetapkan peran akun
          </NexusWorkspaceButton>
        </div>
      )}

      <section className={styles.matrixCard}>
        <header className={styles.matrixToolbar}>
          <fieldset className={styles.filterGroup}>
            <legend className={styles.visuallyHidden}>
              Saring daftar izin
            </legend>
            {(
              [
                { id: "all", label: "Semua izin" },
                { id: "adjusted", label: "Penyesuaian" },
                ...(hasUsableRoleBaseline
                  ? ([
                      { id: "active", label: "Aktif" },
                      { id: "inactive", label: "Nonaktif" },
                    ] as const)
                  : []),
              ] as const
            ).map((option) => (
              <button
                aria-pressed={filter === option.id}
                className={styles.filterChip}
                key={option.id}
                onClick={() => applyFilter(option.id)}
                type="button"
              >
                {option.label}
                <span>{filterCounts[option.id]}</span>
              </button>
            ))}
          </fieldset>
          <button
            className={styles.expandToggle}
            onClick={() =>
              setOpenModules(
                allExpanded
                  ? []
                  : visibleGroups.map((group) => group.module.id),
              )
            }
            type="button"
          >
            {allExpanded ? "Tutup semua modul" : "Buka semua modul"}
          </button>
        </header>

        {visibleGroups.length === 0 ? (
          <div className={styles.matrixEmpty}>
            <strong>Tidak ada izin pada saringan ini</strong>
            <p>Pilih saringan lain untuk melihat izin yang tersedia.</p>
            <NexusWorkspaceButton
              onClick={() => applyFilter("all")}
              type="button"
            >
              Tampilkan semua izin
            </NexusWorkspaceButton>
          </div>
        ) : (
          <>
            <div aria-hidden="true" className={styles.columnHeader}>
              <span>Izin</span>
              <span>Dari peran</span>
              <span>Penyesuaian akun</span>
              <span>Hasil akhir</span>
            </div>

            <div className={styles.moduleList}>
              {visibleGroups.map((group) => {
                const isOpen = expandedModules.includes(group.module.id);
                const moduleAdjusted = group.rows.filter(
                  (row) => row.mode !== "INHERIT",
                ).length;
                const moduleActive = group.rows.filter(
                  (row) => row.effective === true,
                ).length;
                const panelId = `access-module-${group.module.id}`;
                return (
                  <div className={styles.moduleSection} key={group.module.id}>
                    <button
                      aria-controls={panelId}
                      aria-expanded={isOpen}
                      className={styles.moduleHeader}
                      onClick={() => toggleModule(group.module.id)}
                      type="button"
                    >
                      <span aria-hidden="true" className={styles.moduleIcon}>
                        <DashboardShellIcon name={group.module.icon} />
                      </span>
                      <span className={styles.moduleCopy}>
                        <strong>{group.module.label}</strong>
                        <small>{group.module.description}</small>
                      </span>
                      <span className={styles.moduleMeta}>
                        <span className={styles.moduleCount}>
                          {hasUsableRoleBaseline
                            ? `${moduleActive}/${group.rows.length} aktif`
                            : "Belum dapat dihitung"}
                        </span>
                        {moduleAdjusted > 0 ? (
                          <span className={styles.moduleAdjusted}>
                            {`${moduleAdjusted} penyesuaian`}
                          </span>
                        ) : null}
                      </span>
                      <span aria-hidden="true" className={styles.moduleChevron}>
                        <ChevronIcon />
                      </span>
                    </button>

                    <div
                      className={styles.moduleRows}
                      data-open={isOpen}
                      id={panelId}
                    >
                      {group.rows.map((row) => (
                        <div
                          className={styles.permissionRow}
                          data-mode={row.mode}
                          key={row.permissionId}
                        >
                          <span className={styles.permissionLabel}>
                            {row.label}
                          </span>
                          <span className={styles.baselineCell}>
                            <small>Dari peran</small>
                            <NexusAccessStateBadge
                              size="small"
                              state={
                                hasUsableRoleBaseline
                                  ? row.baseline
                                    ? "ACTIVE"
                                    : "INACTIVE"
                                  : "UNRESOLVED"
                              }
                            />
                          </span>
                          <span
                            aria-label={`Penyesuaian ${row.name}`}
                            className={styles.modeControl}
                            role="radiogroup"
                          >
                            {modeOptions.map((option) => (
                              <label
                                className={styles.modeOption}
                                data-mode={option.value}
                                data-selected={row.mode === option.value}
                                key={option.value}
                              >
                                <input
                                  checked={row.mode === option.value}
                                  disabled={!canEdit}
                                  name={`mode-${row.permissionId}`}
                                  onChange={() =>
                                    setDraft((current) => ({
                                      ...current,
                                      [row.permissionId]: option.value,
                                    }))
                                  }
                                  type="radio"
                                  value={option.value}
                                />
                                <span aria-hidden="true">{option.label}</span>
                                <span className={styles.visuallyHidden}>
                                  {`${row.name}: ${option.hint}`}
                                </span>
                              </label>
                            ))}
                          </span>
                          <span className={styles.effectiveCell}>
                            <small>Hasil akhir</small>
                            <NexusAccessStateBadge
                              state={
                                row.effective === null
                                  ? "UNRESOLVED"
                                  : row.effective
                                    ? "ACTIVE"
                                    : "INACTIVE"
                              }
                            />
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </section>

      <p className={styles.closingNote}>
        Penyesuaian ini hanya berlaku untuk akun {account.displayName} dan tidak
        mengubah hak akses akun lain pada peran yang sama.
      </p>

      {canEdit ? (
        <footer className={styles.actionBar}>
          <div className={styles.actionsMeta}>
            <strong>{`${adjustedCount} penyesuaian aktif`}</strong>
            <span data-dirty={isDirty}>
              {isDirty
                ? "Ada perubahan yang belum disimpan."
                : "Semua perubahan tersimpan."}
            </span>
          </div>
          <div className={styles.actionsButtons}>
            <NexusWorkspaceButton
              disabled={adjustedCount === 0}
              onClick={() => setPendingDialog({ kind: "reset" })}
              type="button"
            >
              Reset ke peran
            </NexusWorkspaceButton>
            <NexusWorkspaceButton
              disabled={!isDirty}
              onClick={saveOverrides}
              tone="primary"
              type="button"
            >
              Simpan perubahan
            </NexusWorkspaceButton>
          </div>
        </footer>
      ) : null}

      {pendingDialog?.kind === "reset" ? (
        <NexusWorkspaceConfirmDialog
          cancelLabel="Batal"
          confirmLabel="Reset ke peran"
          description="Akses khusus pengguna akan dihapus dan kembali mengikuti peran. Peran, hubungan anggota, dan status akun tidak berubah."
          onCancel={() => setPendingDialog(null)}
          onConfirm={() => {
            setPendingDialog(null);
            replaceAccountOverrides(account.id, []);
            setDraft({});
            setAnnouncement(
              `Akses ${account.displayName} kembali mengikuti peran.`,
            );
          }}
          title="Hapus seluruh akses khusus akun ini?"
          tone="warning"
        />
      ) : null}

      <output aria-live="polite" className={styles.announcement}>
        {announcement}
      </output>
    </NexusWorkspacePage>
  );
}
