"use client";

import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useDeferredValue, useEffect, useMemo, useState } from "react";
import {
  nexusAssignableRoles,
  nexusRoleHealth,
  resolveNexusRole,
} from "@/components/nexus-access-policy/nexus-access-policy";
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
  nexusAdministrationErrorMessage,
} from "@/components/nexus-administration/nexus-administration-content";
import { NexusAdministrationIcon } from "@/components/nexus-administration/nexus-administration-icons";
import {
  administrationRelationshipLabel,
  type NexusResolvedAdministrationRelationship,
  resolveAdministrationRelationship,
} from "@/components/nexus-administration/nexus-administration-relationship";
import {
  type NexusAdministrationCapabilities,
  nexusCanOpenRoleManagement,
} from "@/components/nexus-dashboard-shell/nexus-workspace-access";
import { useNexusProfileDirectory } from "@/components/nexus-profile/nexus-current-profile";
import type { NexusProfileView } from "@/components/nexus-profile/nexus-profile-model";
import { useNexusSession } from "@/components/nexus-session/nexus-session-provider";
import { NexusTablePagination } from "@/components/nexus-workspace-ui/nexus-table-pagination";
import { NexusWorkspaceConfirmDialog } from "@/components/nexus-workspace-ui/nexus-workspace-confirm-dialog";
import {
  NexusWorkspaceSearch,
  NexusWorkspaceToolbar,
} from "@/components/nexus-workspace-ui/nexus-workspace-controls";
import {
  NexusWorkspaceButton,
  NexusWorkspaceEmptyState,
  NexusWorkspaceLinkButton,
  NexusWorkspaceNotice,
  NexusWorkspaceResultMeta,
} from "@/components/nexus-workspace-ui/nexus-workspace-elements";
import {
  normalizeWorkspaceSearch,
  personInitials,
} from "@/components/nexus-workspace-ui/nexus-workspace-format";
import { NexusWorkspaceLoading } from "@/components/nexus-workspace-ui/nexus-workspace-loading";
import {
  NexusWorkspaceMetrics,
  NexusWorkspacePage,
} from "@/components/nexus-workspace-ui/nexus-workspace-page";
import {
  NexusWorkspaceCatalog,
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
import { NexusWorkspaceState } from "@/components/nexus-workspace-ui/nexus-workspace-state";
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
  hasInitialAccountContext: boolean;
  hasInitialInviteMemberContext: boolean;
  initialAccountId?: string;
  initialInviteMemberId?: string;
};

type FilterId = "member" | "role" | "status";

type PendingAccountAction = {
  accountId: string;
  kind: "suspend";
};

const PAGE_SIZE = 6;

const columns: readonly NexusWorkspaceRecordColumn[] = [
  { id: "primary", label: "Pengguna", primary: true },
  { id: "member", label: "Hubungan Anggota" },
  { id: "role", label: "Peran" },
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
  profile: NexusProfileView | undefined,
  query: string,
) {
  const member =
    relationship.kind === "LINKED" || relationship.kind === "CONFLICT"
      ? relationship.member
      : undefined;
  return normalizeWorkspaceSearch(
    [
      account.displayName,
      profile?.displayName,
      profile?.fullName,
      profile?.preferredName,
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
        <small>{relationship.member.assignment || "Anggota CoE BHT"}</small>
      </span>
    );
  }

  const copy = {
    CONFLICT: ["Perlu diperiksa", "Hubungan akun tidak konsisten"],
    NON_MEMBER: ["Tidak terhubung", "Belum ditautkan ke profil anggota"],
    UNLINKED: ["Belum dihubungkan", "Hubungan belum ditentukan"],
  }[relationship.kind];

  return (
    <span className={styles.memberCell} data-relationship={relationship.kind}>
      <strong>{copy[0]}</strong>
      <small>{copy[1]}</small>
    </span>
  );
}

/**
 * Administrasi selalu bekerja pada direktori akun layanan. Halaman menunggu
 * direktori termuat lebih dahulu sehingga tautan `?account=` tidak pernah
 * dinilai tidak ditemukan hanya karena data belum tiba.
 */
export function NexusAdministration(props: NexusAdministrationProps) {
  const { directoryError, directoryStatus, ensureDirectory, reloadDirectory } =
    useNexusAccountSession();

  useEffect(() => {
    ensureDirectory();
  }, [ensureDirectory]);

  if (directoryStatus === "ready") {
    return <NexusAdministrationWorkspace {...props} />;
  }

  if (directoryStatus !== "error") {
    return <NexusWorkspaceLoading label="Memuat daftar akun…" />;
  }

  return (
    <NexusWorkspacePage
      description={props.content.description}
      descriptionId="administration-load-error-description"
      title={props.content.title}
      titleId="administration-load-error-title"
    >
      <NexusWorkspaceState
        actions={
          <NexusWorkspaceButton
            onClick={() => void reloadDirectory()}
            tone="primary"
            type="button"
          >
            Coba lagi
          </NexusWorkspaceButton>
        }
        description={nexusAdministrationErrorMessage(directoryError, "load")}
        eyebrow="Akun & Akses"
        title="Daftar akun belum dapat dimuat"
        tone="danger"
      />
    </NexusWorkspacePage>
  );
}

function NexusAdministrationWorkspace({
  capabilities,
  content,
  hasInitialAccountContext,
  hasInitialInviteMemberContext,
  initialAccountId,
  initialInviteMemberId,
}: NexusAdministrationProps) {
  const router = useRouter();
  const {
    accounts,
    createInvitation: createAccountInvitation,
    memberOptions: memberDirectory,
    restoreAccount: restoreSessionAccount,
    roles,
    suspendAccount: suspendSessionAccount,
    updateRelationship: setAccountRelationship,
    updateRole: setAccountRole,
  } = useNexusAccountSession();
  const currentAccountId = useNexusSession().session.account.id;
  const profilesByAccountId = useNexusProfileDirectory();
  const canOpenRoleManagement = nexusCanOpenRoleManagement(capabilities);
  const assignableRoles = useMemo(() => nexusAssignableRoles(roles), [roles]);
  const [actionError, setActionError] = useState("");
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
  const invalidAccountContext =
    hasInitialAccountContext && !initialAccountExists;
  const invalidInviteMemberContext =
    !hasInitialAccountContext &&
    hasInitialInviteMemberContext &&
    !initialInviteMemberExists;
  const invalidContextKey = invalidAccountContext
    ? `account:${initialAccountId ?? ""}`
    : invalidInviteMemberContext
      ? `invite-member:${initialInviteMemberId ?? ""}`
      : "";
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
      : !hasInitialAccountContext && initialInviteMemberExists
        ? (accountClaimingInitialMember?.id ?? null)
        : null,
  );
  const [inviteOpen, setInviteOpen] = useState(
    !hasInitialAccountContext &&
      initialInviteMemberExists &&
      !accountClaimingInitialMember,
  );
  const [inviteMemberId, setInviteMemberId] = useState(
    !hasInitialAccountContext &&
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
  const [dismissedInvalidContextKey, setDismissedInvalidContextKey] =
    useState("");

  useEffect(() => {
    if (!announcement) return;

    const timeoutId = window.setTimeout(() => setAnnouncement(""), 4500);
    return () => window.clearTimeout(timeoutId);
  }, [announcement]);

  const roleConfig = useMemo<NexusSelectConfig>(() => {
    const options: [NexusSelectOption, ...NexusSelectOption[]] = [
      { label: "Semua peran", value: "all" },
      ...roles.map((role) => ({
        label: role.label,
        value: role.id,
      })),
      { label: "Belum ditetapkan", tone: "neutral", value: "unassigned" },
      {
        label: "Peran perlu ditinjau",
        tone: "needs-fix",
        value: "unknown",
      },
    ];
    return {
      defaultValue: "all",
      id: "role",
      label: "Filter peran",
      options,
    };
  }, [roles]);

  const rolesByAccountId = useMemo(
    () =>
      new Map(
        accounts.map((account) => [
          account.id,
          resolveNexusRole(account.roleId, roles),
        ]),
      ),
    [accounts, roles],
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
        const role = rolesByAccountId.get(account.id);
        if (!relationship || !role) return false;
        const matchesStatus =
          filters.status === "all" || account.status === filters.status;
        const matchesRole =
          filters.role === "all" ||
          (filters.role === "unassigned"
            ? role.kind === "UNASSIGNED"
            : filters.role === "unknown"
              ? role.kind === "UNKNOWN"
              : role.kind === "KNOWN" && role.role.id === filters.role);
        const matchesMember =
          filters.member === "all" || relationship.kind === filters.member;
        return (
          matchesStatus &&
          matchesRole &&
          matchesMember &&
          accountMatchesQuery(
            account,
            relationship,
            profilesByAccountId.get(account.id),
            deferredQuery,
          )
        );
      }),
    [
      accounts,
      deferredQuery,
      filters,
      profilesByAccountId,
      relationshipsByAccountId,
      rolesByAccountId,
    ],
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
  const selectedProfile = selectedAccount
    ? profilesByAccountId.get(selectedAccount.id)
    : undefined;
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

  if (
    dismissedInvalidContextKey !== invalidContextKey &&
    (invalidAccountContext || invalidInviteMemberContext)
  ) {
    const accountWasRequested = invalidAccountContext;
    return (
      <NexusWorkspacePage
        description={content.description}
        descriptionId="administration-invalid-context-description"
        title={content.title}
        titleId="administration-invalid-context-title"
      >
        <NexusWorkspaceState
          actions={
            <NexusWorkspaceButton
              onClick={() => {
                setDismissedInvalidContextKey(invalidContextKey);
                router.replace("/nexus/administrasi", { scroll: false });
              }}
              type="button"
            >
              Kembali ke daftar akun
            </NexusWorkspaceButton>
          }
          description={
            accountWasRequested
              ? "Akun pada tautan ini sudah tidak tersedia atau ID-nya tidak dikenali."
              : "Profil anggota pada tautan ini sudah tidak tersedia atau ID-nya tidak dikenali."
          }
          eyebrow="Konteks tautan tidak tersedia"
          title={
            accountWasRequested
              ? "Akun tidak ditemukan"
              : "Anggota untuk undangan tidak ditemukan"
          }
          tone="danger"
        />
      </NexusWorkspacePage>
    );
  }

  function resetFilters() {
    setQuery("");
    setFilters({ member: "all", role: "all", status: "all" });
    setCurrentPage(1);
    setOpenFilterId(null);
  }

  async function createInvitation(input: NexusAccountInvitationInput) {
    const account = await createAccountInvitation(input);
    setActionError("");
    setAnnouncement(`Undangan akun untuk ${input.email} berhasil dibuat.`);
    resetFilters();
    return account.id;
  }

  function accountName(account: NexusAdministrationAccount) {
    return (
      profilesByAccountId.get(account.id)?.displayName ?? account.displayName
    );
  }

  async function suspendAccount(account: NexusAdministrationAccount) {
    try {
      await suspendSessionAccount(account.id);
      setActionError("");
      setAnnouncement(
        `Akses ${accountName(account)} ditangguhkan. Sesi aktif akun ini sudah diakhiri.`,
      );
    } catch (error) {
      setActionError(nexusAdministrationErrorMessage(error, "status"));
    }
  }

  async function restoreAccount(account: NexusAdministrationAccount) {
    try {
      await restoreSessionAccount(account.id);
      setActionError("");
      setAnnouncement(`Akses ${accountName(account)} dipulihkan.`);
    } catch (error) {
      setActionError(nexusAdministrationErrorMessage(error, "status"));
    }
  }

  const rows = visibleAccounts.map((account) => {
    const profile = profilesByAccountId.get(account.id);
    const personName = profile?.displayName ?? account.displayName;
    const role = rolesByAccountId.get(account.id) ?? {
      kind: "UNASSIGNED" as const,
    };
    const relationship = relationshipsByAccountId.get(account.id) ?? {
      kind: "CONFLICT" as const,
    };
    const roleHealth = nexusRoleHealth(role);
    const openDetail = () => setSelectedAccountId(account.id);
    return {
      cells: {
        action: (
          <NexusWorkspaceTableAction
            label={`Buka detail akun ${personName}`}
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
              {profile?.initials ?? personInitials(personName)}
            </span>
            <span>
              <strong>{personName}</strong>
              <small>{account.email}</small>
            </span>
          </button>
        ),
        role: (
          <span className={styles.roleCell}>
            <NexusWorkspaceTableBadge tone={roleHealth.tone}>
              {roleHealth.label}
            </NexusWorkspaceTableBadge>
            {roleHealth.note ? <small>{roleHealth.note}</small> : null}
          </span>
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
              label={`Buka detail akun ${personName}`}
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
                <dt>Peran</dt>
                <dd>
                  {roleHealth.note
                    ? `${roleHealth.label} · ${roleHealth.note}`
                    : roleHealth.label}
                </dd>
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
      actions={
        canOpenRoleManagement || capabilities.canInviteAccount ? (
          <div className={styles.headerActions}>
            {canOpenRoleManagement ? (
              <NexusWorkspaceLinkButton href="/nexus/administrasi/peran">
                Peran &amp; Hak Akses
              </NexusWorkspaceLinkButton>
            ) : null}
            {capabilities.canInviteAccount ? (
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
            ) : null}
          </div>
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
            unit: "akun berstatus aktif",
            value: accounts.filter((account) => account.status === "ACTIVE")
              .length,
          },
          {
            icon: <NexusAdministrationIcon name="clock" />,
            id: "invited-accounts",
            label: "Menunggu aktivasi",
            tone: "waiting",
            unit: "akun belum diaktifkan",
            value: accounts.filter((account) => account.status === "INVITED")
              .length,
          },
        ]}
      />

      {actionError ? (
        <NexusWorkspaceNotice tone="danger">{actionError}</NexusWorkspaceNotice>
      ) : null}

      <NexusWorkspaceCatalog className={styles.catalog}>
        <NexusWorkspaceToolbar>
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
        </NexusWorkspaceToolbar>

        <NexusWorkspaceResultMeta
          isUpdating={deferredQuery !== query}
          onResetFilters={hasActiveFilters ? resetFilters : undefined}
          resultLabel={`${filteredAccounts.length} akun ditemukan`}
          updatingLabel="Memperbarui hasil pencarian"
        />

        <NexusWorkspaceTableSection
          guidance="Pilih Detail untuk meninjau hubungan anggota, peran, dan tindakan sesuai status akun."
          summary={`${filteredAccounts.length} dari ${accounts.length} akun sesuai pencarian dan filter.`}
          title="Akun & akses"
          titleId="administration-account-list-title"
        >
          <NexusWorkspaceRecordTable
            caption="Daftar akun BHT Nexus beserta hubungan anggota, peran, status, dan tindakan yang tersedia"
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
      </NexusWorkspaceCatalog>

      {selectedAccount && selectedProfile ? (
        <NexusAdministrationDetail
          account={selectedAccount}
          capabilities={capabilities}
          isCurrentAccount={selectedAccount.id === currentAccountId}
          onClose={() => setSelectedAccountId(null)}
          onEditAccess={() => {
            setSelectedAccountId(null);
            setAccessEditorAccountId(selectedAccount.id);
          }}
          onEditRelationship={() => {
            setSelectedAccountId(null);
            setRelationshipEditorAccountId(selectedAccount.id);
          }}
          onRestore={() => restoreAccount(selectedAccount)}
          onSuspend={() =>
            setPendingAccountAction({
              accountId: selectedAccount.id,
              kind: "suspend",
            })
          }
          profile={selectedProfile}
          relationship={
            relationshipsByAccountId.get(selectedAccount.id) ?? {
              kind: "CONFLICT",
            }
          }
          role={
            rolesByAccountId.get(selectedAccount.id) ?? {
              kind: "UNASSIGNED",
            }
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
          roles={assignableRoles}
        />
      ) : null}

      {accessEditorAccount ? (
        <NexusAdministrationAccessDrawer
          account={accessEditorAccount}
          allRoles={roles}
          personName={
            profilesByAccountId.get(accessEditorAccount.id)?.displayName ??
            accessEditorAccount.displayName
          }
          onClose={() => setAccessEditorAccountId(null)}
          onSave={async (roleId) => {
            await setAccountRole(accessEditorAccount.id, roleId);
            setAccessEditorAccountId(null);
            setSelectedAccountId(accessEditorAccount.id);
            setActionError("");
            setAnnouncement(
              `Peran ${accountName(accessEditorAccount)} diperbarui.`,
            );
          }}
          roles={assignableRoles}
        />
      ) : null}

      {relationshipEditorAccount && relationshipEditorResolved ? (
        <NexusAdministrationRelationshipDrawer
          availableMembers={relationshipEditorMembers}
          personName={
            profilesByAccountId.get(relationshipEditorAccount.id)
              ?.displayName ?? relationshipEditorAccount.displayName
          }
          onClose={() => setRelationshipEditorAccountId(null)}
          onSave={async (relationship: NexusAccountMemberRelationship) => {
            await setAccountRelationship(
              relationshipEditorAccount.id,
              relationship,
            );
            setRelationshipEditorAccountId(null);
            setSelectedAccountId(relationshipEditorAccount.id);
            setActionError("");
            setAnnouncement(
              `Hubungan anggota ${accountName(relationshipEditorAccount)} diperbarui.`,
            );
          }}
          relationship={relationshipEditorResolved}
        />
      ) : null}

      {pendingAccountAction && pendingActionAccount ? (
        <NexusWorkspaceConfirmDialog
          cancelLabel="Kembali"
          confirmLabel="Tangguhkan akses"
          description={`${accountName(pendingActionAccount)} tidak dapat masuk sampai akses dipulihkan, dan sesi yang sedang aktif diakhiri.`}
          onCancel={() => setPendingAccountAction(null)}
          onConfirm={() => {
            setPendingAccountAction(null);
            void suspendAccount(pendingActionAccount);
          }}
          title="Tangguhkan akses akun?"
          tone="danger"
        />
      ) : null}

      <output aria-live="polite" className={styles.announcement}>
        {announcement}
      </output>
    </NexusWorkspacePage>
  );
}
