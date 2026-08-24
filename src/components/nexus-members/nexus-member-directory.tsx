"use client";

import {
  MemberAvatar,
  MemberIcon,
  memberStatusTone,
} from "@/components/nexus-members/nexus-member-ui";
import styles from "@/components/nexus-members/nexus-members.module.css";
import type { NexusMemberRecord } from "@/components/nexus-members/nexus-members-content";
import {
  statusDefinitions,
  statusLabels,
} from "@/components/nexus-members/nexus-members-model";
import { NexusTablePagination } from "@/components/nexus-workspace-ui/nexus-table-pagination";
import { NexusWorkspaceSearch } from "@/components/nexus-workspace-ui/nexus-workspace-controls";
import { NexusWorkspaceButton } from "@/components/nexus-workspace-ui/nexus-workspace-elements";
import { NexusWorkspaceFormField } from "@/components/nexus-workspace-ui/nexus-workspace-form-field";

type StatusFilter = (typeof statusDefinitions)[number]["id"];

type MemberDirectoryProps = {
  activeStatus: StatusFilter;
  canCreateMember: boolean;
  currentPage: number;
  description: string;
  fieldFilter: string;
  fieldOptions: readonly string[];
  filterOpen: boolean;
  filteredCount: number;
  onCreate: () => void;
  onFieldFilterChange: (value: string) => void;
  onFilterOpenChange: (open: boolean) => void;
  onPageChange: (page: number) => void;
  onQueryChange: (value: string) => void;
  onResetFilters: () => void;
  onSelect: (id: string) => void;
  onStatusChange: (status: StatusFilter) => void;
  pageSize: number;
  query: string;
  records: readonly NexusMemberRecord[];
  selectedMemberId?: string;
  title: string;
  visibleMembers: readonly NexusMemberRecord[];
};

export function NexusMemberDirectory({
  activeStatus,
  canCreateMember,
  currentPage,
  description,
  fieldFilter,
  fieldOptions,
  filterOpen,
  filteredCount,
  onCreate,
  onFieldFilterChange,
  onFilterOpenChange,
  onPageChange,
  onQueryChange,
  onResetFilters,
  onSelect,
  onStatusChange,
  pageSize,
  query,
  records,
  selectedMemberId,
  title,
  visibleMembers,
}: MemberDirectoryProps) {
  const statusTabs = statusDefinitions.map((status) => ({
    count:
      status.id === "all"
        ? records.length
        : records.filter((member) => member.membership.status === status.id)
            .length,
    ...status,
  }));

  return (
    <aside aria-label="Daftar anggota CoE BHT" className={styles.directory}>
      <header className={styles.directoryHeader}>
        <div className={styles.directoryHeading}>
          <div>
            <h1 id="members-page-title">{title}</h1>
            <p>{description}</p>
          </div>
          {canCreateMember ? (
            <NexusWorkspaceButton
              className={styles.addMemberButton}
              onClick={onCreate}
              tone="primary"
              type="button"
            >
              <MemberIcon name="plus" />
              Tambah anggota
            </NexusWorkspaceButton>
          ) : null}
        </div>
      </header>

      <div className={styles.searchRow}>
        <NexusWorkspaceSearch
          label="Cari anggota"
          name="member-search"
          onValueChange={onQueryChange}
          placeholder="Cari anggota atau bidang keahlian"
          value={query}
        />
        <button
          aria-expanded={filterOpen}
          aria-label="Filter penugasan anggota"
          className={styles.filterButton}
          data-active={fieldFilter !== "all" || undefined}
          onClick={() => onFilterOpenChange(!filterOpen)}
          type="button"
        >
          <MemberIcon name="filter" />
        </button>
      </div>

      {filterOpen ? (
        <div className={styles.filterPanel}>
          <NexusWorkspaceFormField
            id="member-field-filter"
            label="Penugasan CoE"
            name="fieldFilter"
            onChange={(event) => onFieldFilterChange(event.currentTarget.value)}
            options={[
              { label: "Semua penugasan", value: "all" },
              ...fieldOptions.map((field) => ({ label: field, value: field })),
            ]}
            type="select"
            value={fieldFilter}
          />
          {fieldFilter !== "all" ? (
            <NexusWorkspaceButton
              className={styles.clearFilterButton}
              onClick={() => onFieldFilterChange("all")}
              type="button"
            >
              Hapus filter
            </NexusWorkspaceButton>
          ) : null}
        </div>
      ) : null}

      <div
        aria-label="Filter anggota berdasarkan status"
        className={styles.statusTabs}
        role="tablist"
      >
        {statusTabs.map((tab) => (
          <button
            aria-selected={activeStatus === tab.id}
            key={tab.id}
            onClick={() => onStatusChange(tab.id)}
            role="tab"
            type="button"
          >
            {tab.label} <span>{tab.count}</span>
          </button>
        ))}
      </div>

      <div className={styles.memberList} role="tabpanel">
        {visibleMembers.length > 0 ? (
          visibleMembers.map((member) => (
            <button
              aria-current={member.id === selectedMemberId || undefined}
              className={styles.memberRow}
              key={member.id}
              onClick={() => onSelect(member.id)}
              type="button"
            >
              <MemberAvatar member={member} />
              <span className={styles.memberRowCopy}>
                <strong>{member.name}</strong>
                <small>{member.coeAssignment}</small>
                <span
                  className={styles.statusBadge}
                  data-tone={memberStatusTone(member.membership.status)}
                >
                  {statusLabels[member.membership.status]}
                </span>
              </span>
              <span className={styles.rowChevron}>
                <MemberIcon name="chevron" />
              </span>
            </button>
          ))
        ) : (
          <div className={styles.emptyList}>
            <strong>
              {records.length === 0
                ? "Belum ada anggota"
                : "Tidak ada anggota yang cocok"}
            </strong>
            <p>
              {records.length === 0
                ? "Tambahkan profil anggota pertama untuk memulai direktori CoE BHT."
                : "Ubah kata kunci atau filter untuk melihat anggota lainnya."}
            </p>
            {records.length > 0 || canCreateMember ? (
              <NexusWorkspaceButton
                className={styles.emptyListAction}
                onClick={records.length === 0 ? onCreate : onResetFilters}
                tone={records.length === 0 ? "primary" : undefined}
                type="button"
              >
                {records.length === 0
                  ? "Tambah anggota pertama"
                  : "Tampilkan semua anggota"}
              </NexusWorkspaceButton>
            ) : null}
          </div>
        )}
      </div>

      <NexusTablePagination
        currentPage={currentPage}
        itemCount={filteredCount}
        navigationLabel="Navigasi halaman anggota"
        nextPageLabel="Halaman anggota berikutnya"
        onPageChange={onPageChange}
        pageLabel="Halaman"
        pageSizeValue={String(pageSize)}
        previousPageLabel="Halaman anggota sebelumnya"
        rangePrefix="Menampilkan"
        totalUnit="anggota"
      />
    </aside>
  );
}
