"use client";

import dynamic from "next/dynamic";
import { useDeferredValue, useMemo, useState } from "react";
import styles from "@/components/nexus-administration/nexus-administration.module.css";
import {
  accountStatusLabels,
  type NexusAdministrationAccount,
  type NexusAdministrationContent,
} from "@/components/nexus-administration/nexus-administration-content";
import { NexusAdministrationIcon } from "@/components/nexus-administration/nexus-administration-icons";
import type { NexusAccountInvitationInput } from "@/components/nexus-administration/nexus-administration-invite-drawer";
import type { NexusAdministrationCapabilities } from "@/components/nexus-dashboard-shell/nexus-workspace-access";
import { NexusTablePagination } from "@/components/nexus-workspace-ui/nexus-table-pagination";
import { NexusWorkspaceSearch } from "@/components/nexus-workspace-ui/nexus-workspace-controls";
import {
  NexusWorkspaceButton,
  NexusWorkspaceEmptyState,
  NexusWorkspaceResultMeta,
} from "@/components/nexus-workspace-ui/nexus-workspace-elements";
import {
  formatAuditTimestamp,
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

type NexusAdministrationProps = {
  capabilities: NexusAdministrationCapabilities;
  content: NexusAdministrationContent;
};

type FilterId = "member" | "role" | "status";

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
    { label: "Terhubung ke anggota", tone: "completed", value: "linked" },
    { label: "Tidak terhubung", tone: "neutral", value: "unlinked" },
  ],
};

function accountStatusTone(status: NexusAdministrationAccount["status"]) {
  if (status === "ACTIVE") return "success";
  if (status === "INVITED") return "waiting";
  return "danger";
}

function displayNameFromInvitation(input: NexusAccountInvitationInput) {
  if (input.displayName) return input.displayName;
  const emailName = input.email.split("@")[0] ?? "Akun undangan";
  return emailName
    .split(/[._-]+/)
    .filter(Boolean)
    .map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1)}`)
    .join(" ");
}

function accountMatchesQuery(
  account: NexusAdministrationAccount,
  query: string,
) {
  return normalizeWorkspaceSearch(
    [
      account.displayName,
      account.email,
      account.id,
      account.member?.id,
      account.member?.name,
      account.member?.assignment,
    ]
      .filter(Boolean)
      .join(" "),
  ).includes(normalizeWorkspaceSearch(query));
}

export function NexusAdministration({
  capabilities,
  content,
}: NexusAdministrationProps) {
  const [accounts, setAccounts] = useState(content.accounts);
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
    null,
  );
  const [inviteOpen, setInviteOpen] = useState(false);
  const [accessEditorAccountId, setAccessEditorAccountId] = useState<
    string | null
  >(null);
  const [announcement, setAnnouncement] = useState("");

  const roleConfig = useMemo<NexusSelectConfig>(() => {
    const options: [NexusSelectOption, ...NexusSelectOption[]] = [
      { label: "Semua role", value: "all" },
      ...content.roles.map((role) => ({
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
  }, [content.roles]);

  const rolesById = useMemo(
    () => new Map(content.roles.map((role) => [role.id, role])),
    [content.roles],
  );

  const filteredAccounts = useMemo(
    () =>
      accounts.filter((account) => {
        const matchesStatus =
          filters.status === "all" || account.status === filters.status;
        const matchesRole =
          filters.role === "all" ||
          (filters.role === "unassigned"
            ? !account.roleId
            : account.roleId === filters.role);
        const matchesMember =
          filters.member === "all" ||
          (filters.member === "linked"
            ? Boolean(account.member)
            : !account.member);
        return (
          matchesStatus &&
          matchesRole &&
          matchesMember &&
          accountMatchesQuery(account, deferredQuery)
        );
      }),
    [accounts, deferredQuery, filters],
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
  const hasActiveFilters =
    Boolean(query) || Object.values(filters).some((value) => value !== "all");
  const availableMembers = content.availableMembers.filter(
    (member) => !accounts.some((account) => account.member?.id === member.id),
  );

  function resetFilters() {
    setQuery("");
    setFilters({ member: "all", role: "all", status: "all" });
    setCurrentPage(1);
    setOpenFilterId(null);
  }

  function updateAccount(
    accountId: string,
    updater: (
      account: NexusAdministrationAccount,
    ) => NexusAdministrationAccount,
  ) {
    setAccounts((current) =>
      current.map((account) =>
        account.id === accountId ? updater(account) : account,
      ),
    );
  }

  function createInvitation(input: NexusAccountInvitationInput) {
    const createdAt = formatAuditTimestamp();
    const id = `ACC-BHT-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;
    const account: NexusAdministrationAccount = {
      accountKind: "individual",
      createdAt,
      createdBy: "Admin / Pimpinan (pratinjau)",
      displayName: displayNameFromInvitation(input),
      email: input.email,
      id,
      invitedAt: createdAt,
      lastInvitationAt: createdAt,
      member: input.member,
      roleId: input.roleId,
      status: "INVITED",
      updatedAt: createdAt,
    };
    setAccounts((current) => [account, ...current]);
    setAnnouncement(`Undangan akun untuk ${input.email} berhasil dibuat.`);
    resetFilters();
    return id;
  }

  function suspendAccount(account: NexusAdministrationAccount) {
    if (
      !window.confirm(
        `Tangguhkan akses ${account.displayName}? Pengguna tidak dapat masuk sampai akses dipulihkan.`,
      )
    ) {
      return;
    }
    updateAccount(account.id, (current) => ({
      ...current,
      status: "SUSPENDED",
      updatedAt: formatAuditTimestamp(),
    }));
    setAnnouncement(`Akses ${account.displayName} ditangguhkan.`);
  }

  function restoreAccount(account: NexusAdministrationAccount) {
    updateAccount(account.id, (current) => ({
      ...current,
      status: "ACTIVE",
      updatedAt: formatAuditTimestamp(),
    }));
    setAnnouncement(`Akses ${account.displayName} dipulihkan.`);
  }

  function resendInvitation(account: NexusAdministrationAccount) {
    const updatedAt = formatAuditTimestamp();
    updateAccount(account.id, (current) => ({
      ...current,
      lastInvitationAt: updatedAt,
      updatedAt,
    }));
    setAnnouncement(
      `Undangan untuk ${account.email} dijadwalkan dikirim ulang.`,
    );
  }

  function cancelInvitation(account: NexusAdministrationAccount) {
    if (
      !window.confirm(
        `Batalkan undangan untuk ${account.email}? Tautan aktivasi akan menjadi tidak berlaku.`,
      )
    ) {
      return;
    }
    setAccounts((current) => current.filter((item) => item.id !== account.id));
    setSelectedAccountId(null);
    setAnnouncement(
      `Undangan untuk ${account.email} dibatalkan. Tidak ada akun aktif yang dihapus.`,
    );
  }

  const rows = visibleAccounts.map((account) => {
    const role = account.roleId ? rolesById.get(account.roleId) : undefined;
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
        member: account.member ? (
          <span className={styles.memberCell}>
            <strong>{account.member.id}</strong>
            <small>{account.member.assignment}</small>
          </span>
        ) : (
          <span className={styles.memberCell} data-unlinked="true">
            <strong>Tidak terhubung</strong>
            <small>Akun non-anggota valid</small>
          </span>
        ),
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
                <dd>{account.member?.id ?? "Tidak terhubung"}</dd>
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
            onClick={() => setInviteOpen(true)}
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
      meta={content.updatedAt}
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
                      onClick={() => setInviteOpen(true)}
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
          onCancelInvitation={() => cancelInvitation(selectedAccount)}
          onClose={() => setSelectedAccountId(null)}
          onEditAccess={() => {
            setSelectedAccountId(null);
            setAccessEditorAccountId(selectedAccount.id);
          }}
          onResendInvitation={() => resendInvitation(selectedAccount)}
          onRestore={() => restoreAccount(selectedAccount)}
          onSuspend={() => suspendAccount(selectedAccount)}
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
          onClose={() => setInviteOpen(false)}
          onInvite={createInvitation}
          onViewAccount={(accountId) => {
            setInviteOpen(false);
            setSelectedAccountId(accountId);
          }}
          roles={content.roles}
        />
      ) : null}

      {accessEditorAccount ? (
        <NexusAdministrationAccessDrawer
          account={accessEditorAccount}
          onClose={() => setAccessEditorAccountId(null)}
          onSave={(roleId) => {
            updateAccount(accessEditorAccount.id, (account) => ({
              ...account,
              roleId,
              updatedAt: formatAuditTimestamp(),
            }));
            setAccessEditorAccountId(null);
            setSelectedAccountId(accessEditorAccount.id);
            setAnnouncement(
              `Role ${accessEditorAccount.displayName} diperbarui.`,
            );
          }}
          roles={content.roles}
        />
      ) : null}

      <p aria-live="polite" className={styles.announcement}>
        {announcement}
      </p>
    </NexusWorkspacePage>
  );
}
