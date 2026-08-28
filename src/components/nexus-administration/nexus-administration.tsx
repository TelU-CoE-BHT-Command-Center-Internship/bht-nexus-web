"use client";

import dynamic from "next/dynamic";
import { useDeferredValue, useEffect, useMemo, useState } from "react";
import { useNexusAccountSession } from "@/components/nexus-account-session/nexus-account-session";
import type {
  NexusAccountInvitationInput,
  NexusAccountMemberRelationship,
} from "@/components/nexus-accounts/nexus-account-directory";
import styles from "@/components/nexus-administration/nexus-administration.module.css";
import {
  accountStatusLabels,
  type NexusAdministrationAccount,
  type NexusAdministrationContent,
} from "@/components/nexus-administration/nexus-administration-content";
import { NexusAdministrationIcon } from "@/components/nexus-administration/nexus-administration-icons";
import {
  administrationRelationshipLabel,
  type NexusResolvedAdministrationRelationship,
  resolveAdministrationRelationship,
} from "@/components/nexus-administration/nexus-administration-relationship";
import type { NexusAdministrationCapabilities } from "@/components/nexus-dashboard-shell/nexus-workspace-access";
import { useNexusMemberSession } from "@/components/nexus-member-session/nexus-member-session";
import { NexusTablePagination } from "@/components/nexus-workspace-ui/nexus-table-pagination";
import { NexusWorkspaceConfirmDialog } from "@/components/nexus-workspace-ui/nexus-workspace-confirm-dialog";
import { NexusWorkspaceSearch } from "@/components/nexus-workspace-ui/nexus-workspace-controls";
import {
  NexusWorkspaceButton,
  NexusWorkspaceEmptyState,
  NexusWorkspaceResultMeta,
} from "@/components/nexus-workspace-ui/nexus-workspace-elements";
import {
  normalizeWorkspaceSearch,
  personInitials,
} from "@/components/nexus-workspace-ui/nexus-workspace-format";
import {
  NexusWorkspaceMetrics,
  NexusWorkspacePage,
} from "@/components/nexus-workspace-ui/nexus-workspace-page";
import {
  NexusWorkspaceMobileAction,
  NexusWorkspaceMobileCard,
  type NexusWorkspaceRecordColumn,
  NexusWorkspaceRecordTable,
  NexusWorkspaceTableAction,
  NexusWorkspaceTableBadge,
} from "@/components/nexus-workspace-ui/nexus-workspace-records";
import {
  type NexusSelectConfig,
  type NexusSelectOption,
  NexusWorkspaceSelect,
} from "@/components/nexus-workspace-ui/nexus-workspace-select";
import { NexusWorkspaceTableSection } from "@/components/nexus-workspace-ui/nexus-workspace-table";

const NexusAdministrationAccessDrawer = dynamic(() =>
  import(
    "@/components/nexus-administration/nexus-administration-access-drawer"
  ).then((module) => module.NexusAdministrationAccessDrawer),
);

const NexusAdministrationDetail = dynamic(() =>
  import("@/components/nexus-administration/nexus-administration-detail").then(
    (module) => module.NexusAdministrationDetail,
  ),
);

const NexusAdministrationInviteDrawer = dynamic(() =>
  import(
    "@/components/nexus-administration/nexus-administration-invite-drawer"
  ).then((module) => module.NexusAdministrationInviteDrawer),
);

const NexusAdministrationRelationshipDrawer = dynamic(() =>
  import(
    "@/components/nexus-administration/nexus-administration-relationship-drawer"
  ).then((module) => module.NexusAdministrationRelationshipDrawer),
);

type NexusAdministrationProps = {
  capabilities: NexusAdministrationCapabilities;
  content: NexusAdministrationContent;
  initialAccountId?: string;
  initialInviteMemberId?: string;
};

type FilterId = "member" | "role" | "status";

type PendingAccountAction = {
  accountId: string;
  kind: "cancel-invitation" | "suspend";
};

const PAGE_SIZE = 6;

const columns: readonly NexusWorkspaceRecordColumn[] = [
  { id: "primary", label: "Pengguna", primary: true },
  { id: "member", label: "Hubungan Anggota" },
  { id: "role", label: "Role" },
  { id: "status", label: "Status" },
  { id: "action", label: "Aksi" },
];

const statusConfig: NexusSelectConfig = {
  defaultValue: "all",
  id: "status",
  label: "Filter status akun",
  options: [
    { label: "Semua status", value: "all" },
    { label: "Aktif", tone: "completed", value: "ACTIVE" },
    { label: "Menunggu aktivasi", tone: "waiting", value: "INVITED" },
    { label: "Ditangguhkan", tone: "needs-fix", value: "SUSPENDED" },
  ],
};

const memberConfig: NexusSelectConfig = {
  defaultValue: "all",
  id: "member",
  label: "Filter hubungan anggota",
  options: [
    { label: "Semua hubungan", value: "all" },
    { label: "Terhubung ke anggota", tone: "completed", value: "LINKED" },
    { label: "Akun non-anggota", tone: "neutral", value: "NON_MEMBER" },
    { label: "Belum dihubungkan", tone: "waiting", value: "UNLINKED" },
    { label: "Perlu diperiksa", tone: "needs-fix", value: "CONFLICT" },
  ],
};

function accountStatusTone(status: NexusAdministrationAccount["status"]) {
  if (status === "ACTIVE") return "success";
  if (status === "INVITED") return "waiting";
  return "danger";
}

function accountMatchesQuery(
  account: NexusAdministrationAccount,
  relationship: NexusResolvedAdministrationRelationship,
  query: string,
) {
  const member =
    relationship.kind === "LINKED" || relationship.kind === "CONFLICT"
      ? relationship.member
      : undefined;
  return normalizeWorkspaceSearch(
    [
      account.displayName,
      account.email,
      account.id,
      administrationRelationshipLabel(relationship),
      member?.id,
      member?.name,
      member?.assignment,
    ]
      .filter(Boolean)
      .join(" "),
  ).includes(normalizeWorkspaceSearch(query));
}

function AccountRelationshipCell({
  relationship,
}: {
  relationship: NexusResolvedAdministrationRelationship;
}) {
  if (relationship.kind === "LINKED") {
    return (
      <span className={styles.memberCell} data-relationship="LINKED">
        <strong>{relationship.member.name}</strong>
        <small>
          {relationship.member.id} · {relationship.member.assignment}
        </small>
      </span>
    );
  }

  const copy = {
    CONFLICT: ["Perlu diperiksa", "Hubungan akun tidak konsisten"],
    NON_MEMBER: ["Akun non-anggota", "Tidak memerlukan profil anggota"],
    UNLINKED: ["Belum dihubungkan", "Hubungan belum ditentukan"],
  }[relationship.kind];

  return (
    <span className={styles.memberCell} data-relationship={relationship.kind}>
      <strong>{copy[0]}</strong>
      <small>{copy[1]}</small>
    </span>
  );
}

export function NexusAdministration({
  capabilities,
  content,
  initialAccountId,
  initialInviteMemberId,
}: NexusAdministrationProps) {
  const {
    accounts,
    cancelInvitation: cancelAccountInvitation,
    createInvitation: createAccountInvitation,
    refreshInvitation: refreshAccountInvitation,
    restoreAccount: restoreSessionAccount,
    roles,
    suspendAccount: suspendSessionAccount,
    updateRelationship: setAccountRelationship,
    updateRole: setAccountRole,
  } = useNexusAccountSession();
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
  const initialAccountExists = accounts.some(
    (account) => account.id === initialAccountId,
  );
  const accountClaimingInitialMember = accounts.find(
    (account) =>
      (account.relationship.kind === "LINKED" ||
        account.relationship.kind === "CONFLICT") &&
      account.relationship.memberId === initialInviteMemberId,
  );
  const initialInviteMemberExists = memberDirectory.some(
    (member) => member.id === initialInviteMemberId,
  );
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query);
  const [filters, setFilters] = useState<Record<FilterId, string>>({
    member: "all",
    role: "all",
    status: "all",
  });
  const [openFilterId, setOpenFilterId] = useState<FilterId | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(
    initialAccountExists
      ? (initialAccountId ?? null)
      : (accountClaimingInitialMember?.id ?? null),
  );
  const [inviteOpen, setInviteOpen] = useState(
    !initialAccountExists &&
      initialInviteMemberExists &&
      !accountClaimingInitialMember,
  );
  const [inviteMemberId, setInviteMemberId] = useState(
    !initialAccountExists &&
      initialInviteMemberExists &&
      !accountClaimingInitialMember
      ? initialInviteMemberId
      : undefined,
  );
  const [accessEditorAccountId, setAccessEditorAccountId] = useState<
    string | null
  >(null);
  const [relationshipEditorAccountId, setRelationshipEditorAccountId] =
    useState<string | null>(null);
  const [announcement, setAnnouncement] = useState("");
  const [pendingAccountAction, setPendingAccountAction] =
    useState<PendingAccountAction | null>(null);

  useEffect(() => {
    if (!announcement) return;

    const timeoutId = window.setTimeout(() => setAnnouncement(""), 4500);
    return () => window.clearTimeout(timeoutId);
  }, [announcement]);

  const roleConfig = useMemo<NexusSelectConfig>(() => {
    const options: [NexusSelectOption, ...NexusSelectOption[]] = [
      { label: "Semua role", value: "all" },
      ...roles.map((role) => ({
        label: role.label,
        value: role.id,
      })),
      { label: "Belum ditetapkan", tone: "neutral", value: "unassigned" },
    ];
    return {
      defaultValue: "all",
      id: "role",
      label: "Filter role",
      options,
    };
  }, [roles]);

  const rolesById = useMemo(
    () => new Map(roles.map((role) => [role.id, role])),
    [roles],
  );

  const relationshipsByAccountId = useMemo(
    () =>
      new Map(
        accounts.map((account) => [
          account.id,
          resolveAdministrationRelationship(account, memberDirectory, accounts),
        ]),
      ),
    [accounts, memberDirectory],
  );

  const filteredAccounts = useMemo(
    () =>
      accounts.filter((account) => {
        const relationship = relationshipsByAccountId.get(account.id);
        if (!relationship) return false;
        const matchesStatus =
          filters.status === "all" || account.status === filters.status;
        const matchesRole =
          filters.role === "all" ||
          (filters.role === "unassigned"
            ? !account.roleId
            : account.roleId === filters.role);
        const matchesMember =
          filters.member === "all" || relationship.kind === filters.member;
        return (
          matchesStatus &&
          matchesRole &&
          matchesMember &&
          accountMatchesQuery(account, relationship, deferredQuery)
        );
      }),
    [accounts, deferredQuery, filters, relationshipsByAccountId],
  );

  const totalPages = Math.max(
    1,
    Math.ceil(filteredAccounts.length / PAGE_SIZE),
  );
  const safePage = Math.min(currentPage, totalPages);
  const visibleAccounts = filteredAccounts.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE,
  );
  const selectedAccount = accounts.find(
    (account) => account.id === selectedAccountId,
  );
  const accessEditorAccount = accounts.find(
    (account) => account.id === accessEditorAccountId,
  );
  const relationshipEditorAccount = accounts.find(
    (account) => account.id === relationshipEditorAccountId,
  );
  const pendingActionAccount = accounts.find(
    (account) => account.id === pendingAccountAction?.accountId,
  );
  const hasActiveFilters =
    Boolean(query) || Object.values(filters).some((value) => value !== "all");
  const availableMembers = memberDirectory.filter(
    (member) =>
      !accounts.some(
        (account) =>
          (account.relationship.kind === "LINKED" ||
            account.relationship.kind === "CONFLICT") &&
          account.relationship.memberId === member.id,
      ),
  );
  const relationshipEditorResolved = relationshipEditorAccount
    ? relationshipsByAccountId.get(relationshipEditorAccount.id)
    : undefined;
  const relationshipEditorMembers = relationshipEditorAccount
    ? memberDirectory.filter((member) => {
        const isCurrentResolvedMember =
          relationshipEditorResolved?.kind === "LINKED" &&
          relationshipEditorResolved.member.id === member.id;
        return (
          isCurrentResolvedMember ||
          !accounts.some(
            (account) =>
              account.id !== relationshipEditorAccount.id &&
              (account.relationship.kind === "LINKED" ||
                account.relationship.kind === "CONFLICT") &&
              account.relationship.memberId === member.id,
          )
        );
      })
    : [];

  function resetFilters() {
    setQuery("");
    setFilters({ member: "all", role: "all", status: "all" });
    setCurrentPage(1);
    setOpenFilterId(null);
  }

  function createInvitation(input: NexusAccountInvitationInput) {
    const account = createAccountInvitation(input);
    setAnnouncement(`Undangan akun untuk ${input.email} berhasil dibuat.`);
    resetFilters();
    return account.id;
  }

  function suspendAccount(account: NexusAdministrationAccount) {
    suspendSessionAccount(account.id);
    setAnnouncement(`Akses ${account.displayName} ditangguhkan.`);
  }

  function restoreAccount(account: NexusAdministrationAccount) {
    restoreSessionAccount(account.id);
    setAnnouncement(`Akses ${account.displayName} dipulihkan.`);
  }

  function refreshInvitation(account: NexusAdministrationAccount) {
    refreshAccountInvitation(account.id);
    setAnnouncement(`Undangan untuk ${account.email} diperbarui.`);
  }

  function cancelInvitation(account: NexusAdministrationAccount) {
    cancelAccountInvitation(account.id);
    setSelectedAccountId(null);
    setAnnouncement(
      `Undangan untuk ${account.email} dibatalkan. Tidak ada akun aktif yang dihapus.`,
    );
  }

  const rows = visibleAccounts.map((account) => {
    const role = account.roleId ? rolesById.get(account.roleId) : undefined;
    const relationship = relationshipsByAccountId.get(account.id) ?? {
      kind: "CONFLICT" as const,
    };
    const openDetail = () => setSelectedAccountId(account.id);
    return {
      cells: {
        action: (
          <NexusWorkspaceTableAction
            label={`Buka detail akun ${account.displayName}`}
            onClick={openDetail}
          >
            Detail
          </NexusWorkspaceTableAction>
        ),
        member: <AccountRelationshipCell relationship={relationship} />,
        primary: (
          <button
            className={styles.accountCell}
            onClick={openDetail}
            type="button"
          >
            <span aria-hidden="true">
              {personInitials(account.displayName)}
            </span>
            <span>
              <strong>{account.displayName}</strong>
              <small>{account.email}</small>
            </span>
          </button>
        ),
        role: (
          <NexusWorkspaceTableBadge tone={role ? "info" : "neutral"}>
            {role?.label ?? "Belum ditetapkan"}
          </NexusWorkspaceTableBadge>
        ),
        status: (
          <NexusWorkspaceTableBadge tone={accountStatusTone(account.status)}>
            {accountStatusLabels[account.status]}
          </NexusWorkspaceTableBadge>
        ),
      },
      id: account.id,
      mobile: (
        <NexusWorkspaceMobileCard
          action={
            <NexusWorkspaceMobileAction
              label={`Buka detail akun ${account.displayName}`}
              onClick={openDetail}
            >
              Lihat detail
            </NexusWorkspaceMobileAction>
          }
          eyebrow={
            <>
              <span className={styles.mobileAccountId}>{account.id}</span>
              <NexusWorkspaceTableBadge
                tone={accountStatusTone(account.status)}
              >
                {accountStatusLabels[account.status]}
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
                <dt>Role</dt>
                <dd>{role?.label ?? "Belum ditetapkan"}</dd>
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
      actions={
        capabilities.canInviteAccount ? (
          <NexusWorkspaceButton
            className={styles.inviteButton}
            onClick={() => {
              setInviteMemberId(undefined);
              setInviteOpen(true);
            }}
            tone="primary"
            type="button"
          >
            <NexusAdministrationIcon name="plus" />
            Undang akun
          </NexusWorkspaceButton>
        ) : null
      }
      description={content.description}
      descriptionId="administration-description"
      title={content.title}
      titleId="administration-title"
    >
      <NexusWorkspaceMetrics
        metrics={[
          {
            icon: <NexusAdministrationIcon name="account" />,
            id: "total-accounts",
            label: "Total akun",
            tone: "completed",
            unit: "akun terdaftar",
            value: accounts.length,
          },
          {
            icon: <NexusAdministrationIcon name="active" />,
            id: "active-accounts",
            label: "Aktif",
            tone: "completed",
            unit: "dapat mengakses sistem",
            value: accounts.filter((account) => account.status === "ACTIVE")
              .length,
          },
          {
            icon: <NexusAdministrationIcon name="clock" />,
            id: "invited-accounts",
            label: "Menunggu aktivasi",
            tone: "waiting",
            unit: "undangan belum diterima",
            value: accounts.filter((account) => account.status === "INVITED")
              .length,
          },
        ]}
      />

      <section className={styles.catalog}>
        <div className={styles.toolbar}>
          <NexusWorkspaceSearch
            label="Cari akun berdasarkan nama atau email"
            name="administration-search"
            onValueChange={(value) => {
              setQuery(value);
              setCurrentPage(1);
            }}
            placeholder="Cari nama atau email"
            value={query}
          />
          {[statusConfig, roleConfig, memberConfig].map((config) => (
            <NexusWorkspaceSelect
              config={config}
              isOpen={openFilterId === config.id}
              key={config.id}
              name={`administration-${config.id}`}
              onOpenChange={(isOpen) =>
                setOpenFilterId(isOpen ? (config.id as FilterId) : null)
              }
              onValueChange={(value) => {
                setFilters((current) => ({
                  ...current,
                  [config.id as FilterId]: value,
                }));
                setCurrentPage(1);
              }}
              placement="top-on-narrow"
              value={filters[config.id as FilterId]}
            />
          ))}
        </div>

        <NexusWorkspaceResultMeta
          isUpdating={deferredQuery !== query}
          onResetFilters={hasActiveFilters ? resetFilters : undefined}
          resultLabel={`${filteredAccounts.length} akun ditemukan`}
          updatingLabel="Memperbarui hasil pencarian"
        />

        <NexusWorkspaceTableSection
          guidance="Pilih Detail untuk meninjau hubungan anggota, role, dan tindakan sesuai status akun."
          summary={`${filteredAccounts.length} dari ${accounts.length} akun sesuai pencarian dan filter.`}
          title="Akun & akses"
          titleId="administration-account-list-title"
        >
          <NexusWorkspaceRecordTable
            caption="Daftar akun BHT Nexus beserta hubungan anggota, role, status, dan tindakan yang tersedia"
            columns={columns}
            empty={
              accounts.length === 0 ? (
                <div className={styles.emptyAccounts}>
                  <span aria-hidden="true">
                    <NexusAdministrationIcon name="account" />
                  </span>
                  <strong>Belum ada akun</strong>
                  <p>
                    Undang akun pertama untuk mulai memberikan akses BHT Nexus.
                  </p>
                  {capabilities.canInviteAccount ? (
                    <NexusWorkspaceButton
                      onClick={() => {
                        setInviteMemberId(undefined);
                        setInviteOpen(true);
                      }}
                      tone="primary"
                      type="button"
                    >
                      Undang akun pertama
                    </NexusWorkspaceButton>
                  ) : null}
                </div>
              ) : (
                <NexusWorkspaceEmptyState
                  description="Ubah kata kunci atau filter untuk melihat akun lainnya."
                  onResetFilters={resetFilters}
                  title="Tidak ada akun yang cocok"
                />
              )
            }
            isLoading={deferredQuery !== query}
            pagination={
              <NexusTablePagination
                currentPage={safePage}
                itemCount={filteredAccounts.length}
                navigationLabel="Navigasi halaman akun"
                nextPageLabel="Halaman akun berikutnya"
                onPageChange={setCurrentPage}
                pageLabel="Halaman"
                pageSizeValue={String(PAGE_SIZE)}
                previousPageLabel="Halaman akun sebelumnya"
                rangePrefix="Menampilkan"
                totalUnit="akun"
              />
            }
            rows={rows}
          />
        </NexusWorkspaceTableSection>
      </section>

      {selectedAccount ? (
        <NexusAdministrationDetail
          account={selectedAccount}
          capabilities={capabilities}
          onCancelInvitation={() =>
            setPendingAccountAction({
              accountId: selectedAccount.id,
              kind: "cancel-invitation",
            })
          }
          onClose={() => setSelectedAccountId(null)}
          onEditAccess={() => {
            setSelectedAccountId(null);
            setAccessEditorAccountId(selectedAccount.id);
          }}
          onEditRelationship={() => {
            setSelectedAccountId(null);
            setRelationshipEditorAccountId(selectedAccount.id);
          }}
          onRefreshInvitation={() => refreshInvitation(selectedAccount)}
          onRestore={() => restoreAccount(selectedAccount)}
          onSuspend={() =>
            setPendingAccountAction({
              accountId: selectedAccount.id,
              kind: "suspend",
            })
          }
          relationship={
            relationshipsByAccountId.get(selectedAccount.id) ?? {
              kind: "CONFLICT",
            }
          }
          role={
            selectedAccount.roleId
              ? rolesById.get(selectedAccount.roleId)
              : undefined
          }
        />
      ) : null}

      {inviteOpen ? (
        <NexusAdministrationInviteDrawer
          accountEmails={accounts.map((account) => account.email)}
          availableMembers={availableMembers}
          initialMemberId={inviteMemberId}
          onClose={() => setInviteOpen(false)}
          onInvite={createInvitation}
          onViewAccount={(accountId) => {
            setInviteOpen(false);
            setSelectedAccountId(accountId);
          }}
          roles={roles}
        />
      ) : null}

      {accessEditorAccount ? (
        <NexusAdministrationAccessDrawer
          account={accessEditorAccount}
          onClose={() => setAccessEditorAccountId(null)}
          onSave={(roleId) => {
            setAccountRole(accessEditorAccount.id, roleId);
            setAccessEditorAccountId(null);
            setSelectedAccountId(accessEditorAccount.id);
            setAnnouncement(
              `Role ${accessEditorAccount.displayName} diperbarui.`,
            );
          }}
          roles={roles}
        />
      ) : null}

      {relationshipEditorAccount && relationshipEditorResolved ? (
        <NexusAdministrationRelationshipDrawer
          account={relationshipEditorAccount}
          availableMembers={relationshipEditorMembers}
          onClose={() => setRelationshipEditorAccountId(null)}
          onSave={(relationship: NexusAccountMemberRelationship) => {
            setAccountRelationship(relationshipEditorAccount.id, relationship);
            setRelationshipEditorAccountId(null);
            setSelectedAccountId(relationshipEditorAccount.id);
            setAnnouncement(
              `Hubungan anggota ${relationshipEditorAccount.displayName} diperbarui.`,
            );
          }}
          relationship={relationshipEditorResolved}
        />
      ) : null}

      {pendingAccountAction && pendingActionAccount ? (
        <NexusWorkspaceConfirmDialog
          cancelLabel="Kembali"
          confirmLabel={
            pendingAccountAction.kind === "suspend"
              ? "Tangguhkan akses"
              : "Batalkan undangan"
          }
          description={
            pendingAccountAction.kind === "suspend"
              ? `${pendingActionAccount.displayName} tidak dapat masuk sampai akses dipulihkan.`
              : `Undangan untuk ${pendingActionAccount.email} akan dibatalkan dan akun yang belum aktif dihapus dari daftar.`
          }
          onCancel={() => setPendingAccountAction(null)}
          onConfirm={() => {
            if (pendingAccountAction.kind === "suspend") {
              suspendAccount(pendingActionAccount);
            } else {
              cancelInvitation(pendingActionAccount);
            }
            setPendingAccountAction(null);
          }}
          title={
            pendingAccountAction.kind === "suspend"
              ? "Tangguhkan akses akun?"
              : "Batalkan undangan akun?"
          }
          tone="danger"
        />
      ) : null}

      <output aria-live="polite" className={styles.announcement}>
        {announcement}
      </output>
    </NexusWorkspacePage>
  );
}
