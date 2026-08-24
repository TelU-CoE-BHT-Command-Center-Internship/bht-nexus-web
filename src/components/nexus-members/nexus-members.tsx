"use client";

import Image from "next/image";
import Link from "next/link";
import {
  type ChangeEvent,
  type FormEvent,
  type KeyboardEvent,
  useMemo,
  useState,
} from "react";
import styles from "@/components/nexus-members/nexus-members.module.css";
import type {
  NexusMemberAccountStatus,
  NexusMemberRecord,
  NexusMemberStatus,
  NexusMembersContent,
} from "@/components/nexus-members/nexus-members-content";
import { NexusTablePagination } from "@/components/nexus-workspace-ui/nexus-table-pagination";
import { NexusWorkspaceSearch } from "@/components/nexus-workspace-ui/nexus-workspace-controls";
import { NexusWorkspaceDrawer } from "@/components/nexus-workspace-ui/nexus-workspace-drawer";
import { NexusWorkspaceButton } from "@/components/nexus-workspace-ui/nexus-workspace-elements";
import { NexusWorkspaceFormField } from "@/components/nexus-workspace-ui/nexus-workspace-form-field";

type MemberDetailTab =
  | "access"
  | "academic"
  | "membership"
  | "profile"
  | "related";

type MemberProfileDraft = {
  alternateEmail: string;
  biography: string;
  coeAssignment: string;
  googleScholar: string;
  institutionalEmail: string;
  joinedAt: string;
  location: string;
  membershipStatus: NexusMemberStatus;
  name: string;
  orcid: string;
  phone: string;
  preferredName: string;
  primaryExpertise: string;
  primaryUnit: string;
  publicProfile: boolean;
  researcherId: string;
  scopusAuthorId: string;
  secondaryExpertise: string;
  sintaId: string;
};

type ProfileEditorState = {
  mode: "create" | "edit";
  value: MemberProfileDraft;
};

type InviteDraft = {
  email: string;
};

const PAGE_SIZE = 6;
const DEFAULT_MEMBER_UNIT = "CoE Biomedical & Healthcare Technology";

const statusDefinitions = [
  { id: "all", label: "Semua" },
  { id: "active", label: "Aktif" },
  { id: "on_leave", label: "Cuti" },
  { id: "inactive", label: "Nonaktif" },
] as const;

const statusLabels: Record<NexusMemberStatus, string> = {
  active: "Aktif",
  inactive: "Nonaktif",
  on_leave: "Cuti",
};

const accountStatusLabels: Record<NexusMemberAccountStatus, string> = {
  active: "Aktif",
  invited: "Undangan dikirim",
  suspended: "Ditangguhkan",
};

const detailTabs: { id: MemberDetailTab; label: string }[] = [
  { id: "profile", label: "Profil" },
  { id: "membership", label: "Keanggotaan CoE" },
  { id: "academic", label: "Identitas Akademik" },
  { id: "related", label: "Data Terkait" },
  { id: "access", label: "Akses BHT Nexus" },
];

const relatedCatalogs = [
  {
    description: "Karya ilmiah dan penulis pada rekam publikasi resmi.",
    href: "/nexus/publikasi",
    label: "Publikasi",
  },
  {
    description: "Pencipta, inventor, hak cipta, dan paten resmi.",
    href: "/nexus/kekayaan-intelektual",
    label: "Kekayaan Intelektual",
  },
  {
    description: "Pihak terkait pada kontrak riset dan proposal.",
    href: "/nexus/kontrak-proposal",
    label: "Kontrak & Proposal",
  },
  {
    description: "Pembimbing, mahasiswa, dan kegiatan akademik.",
    href: "/nexus/akademik",
    label: "Akademik",
  },
  {
    description: "Tim pelaksana kegiatan dan pengabdian masyarakat.",
    href: "/nexus/kegiatan",
    label: "Kegiatan & Pengabdian",
  },
] as const;

function Icon({
  name,
}: {
  name:
    | "arrow"
    | "calendar"
    | "chevron"
    | "edit"
    | "email"
    | "filter"
    | "location"
    | "lock"
    | "plus"
    | "phone";
}) {
  const paths = {
    arrow: <path d="M19 12H5m5-5-5 5 5 5" />,
    calendar: (
      <>
        <rect height="15" rx="2" width="16" x="4" y="5" />
        <path d="M8 3v4m8-4v4M4 10h16" />
      </>
    ),
    chevron: <path d="m9 6 6 6-6 6" />,
    edit: (
      <>
        <path d="M13.5 5.5 18.5 10.5M5 19l3.3-.7L19 7.6a1.8 1.8 0 0 0 0-2.6l-.1-.1a1.8 1.8 0 0 0-2.6 0L5.7 15.7 5 19Z" />
        <path d="M12 5H6a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2v-6" />
      </>
    ),
    email: (
      <>
        <rect height="14" rx="2" width="18" x="3" y="5" />
        <path d="m4 7 8 6 8-6" />
      </>
    ),
    filter: <path d="M4 5h16l-6.2 7v5.2L10.2 19v-7L4 5Z" />,
    location: (
      <>
        <path d="M12 21s6-5.2 6-11a6 6 0 1 0-12 0c0 5.8 6 11 6 11Z" />
        <circle cx="12" cy="10" r="2" />
      </>
    ),
    lock: (
      <>
        <rect height="11" rx="2" width="14" x="5" y="10" />
        <path d="M8 10V7a4 4 0 0 1 8 0v3" />
      </>
    ),
    plus: <path d="M12 5v14M5 12h14" />,
    phone: (
      <path d="M7.2 3.5 10 8 7.8 10c1.3 2.7 3.5 4.9 6.2 6.2l2-2.2 4.5 2.8-.8 3c-.2.8-1 1.3-1.8 1.2C10.3 20.2 3.8 13.7 3 6.1c-.1-.8.4-1.6 1.2-1.8l3-.8Z" />
    ),
  } satisfies Record<string, React.ReactNode>;

  return (
    <svg aria-hidden="true" fill="none" viewBox="0 0 24 24">
      {paths[name]}
    </svg>
  );
}

function normalized(value: string) {
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLocaleLowerCase("id-ID")
    .trim();
}

function displayValue(value?: string) {
  return value?.trim() || "Belum tercatat";
}

function displayDate(value?: string) {
  if (!value) return "Belum tercatat";
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;

  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(`${value}T00:00:00`));
}

function statusTone(status: NexusMemberStatus) {
  if (status === "active") return "positive";
  if (status === "on_leave") return "warning";
  return "neutral";
}

function memberInitials(name: string) {
  const words = name
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .split(/\s+/)
    .filter(Boolean);

  return (words[0]?.[0] ?? "A") + (words[1]?.[0] ?? "");
}

function DetailCard({
  items,
  title,
  wide = false,
}: {
  items: { label: string; value?: React.ReactNode }[];
  title: string;
  wide?: boolean;
}) {
  return (
    <section className={styles.detailCard} data-wide={wide || undefined}>
      <h3>{title}</h3>
      <dl>
        {items.map((item) => (
          <div key={item.label}>
            <dt>{item.label}</dt>
            <dd>{item.value || "Belum tercatat"}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

function MemberAvatar({ member }: { member: NexusMemberRecord }) {
  return (
    <span className={styles.avatarWrap}>
      {member.avatarSrc ? (
        <Image
          alt={`Foto ${member.name}`}
          fill
          sizes="(max-width: 768px) 72px, 104px"
          src={member.avatarSrc}
        />
      ) : (
        <span
          aria-label={`Inisial ${member.name}`}
          className={styles.avatarFallback}
          role="img"
        >
          {memberInitials(member.name)}
        </span>
      )}
      <span
        aria-hidden="true"
        className={styles.presence}
        data-tone={statusTone(member.membership.status)}
      />
    </span>
  );
}

function createEditDraft(member: NexusMemberRecord): MemberProfileDraft {
  return {
    alternateEmail: member.contact.alternateEmail ?? "",
    biography: member.biography,
    coeAssignment: member.coeAssignment,
    googleScholar: member.academic.googleScholar ?? "",
    institutionalEmail: member.contact.institutionalEmail ?? "",
    joinedAt: member.membership.joinedAt ?? "",
    location: member.contact.location ?? "",
    membershipStatus: member.membership.status,
    name: member.name,
    orcid: member.academic.orcid ?? "",
    phone: member.contact.phone ?? "",
    preferredName: member.identity.preferredName,
    primaryExpertise: member.expertise.primary ?? "",
    primaryUnit: member.affiliation.primaryUnit,
    publicProfile: member.membership.publicProfile,
    researcherId: member.academic.researcherId ?? "",
    scopusAuthorId: member.academic.scopusAuthorId ?? "",
    secondaryExpertise: member.expertise.secondary.join(", "),
    sintaId: member.academic.sintaId ?? "",
  };
}

function createNewMemberDraft(): MemberProfileDraft {
  return {
    alternateEmail: "",
    biography: "",
    coeAssignment: "",
    googleScholar: "",
    institutionalEmail: "",
    joinedAt: "",
    location: "",
    membershipStatus: "active",
    name: "",
    orcid: "",
    phone: "",
    preferredName: "",
    primaryExpertise: "",
    primaryUnit: DEFAULT_MEMBER_UNIT,
    publicProfile: false,
    researcherId: "",
    scopusAuthorId: "",
    secondaryExpertise: "",
    sintaId: "",
  };
}

export function NexusMembers({ content }: { content: NexusMembersContent }) {
  const [records, setRecords] = useState(content.records);
  const [selectedMemberId, setSelectedMemberId] = useState(
    content.records[0]?.id ?? "",
  );
  const [activeStatus, setActiveStatus] = useState("all");
  const [activeDetailTab, setActiveDetailTab] =
    useState<MemberDetailTab>("profile");
  const [currentPage, setCurrentPage] = useState(1);
  const [fieldFilter, setFieldFilter] = useState("all");
  const [filterOpen, setFilterOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [mobileView, setMobileView] = useState<"detail" | "list">("list");
  const [profileEditor, setProfileEditor] = useState<ProfileEditorState | null>(
    null,
  );
  const [inviteDraft, setInviteDraft] = useState<InviteDraft | null>(null);
  const [formError, setFormError] = useState("");
  const [announcement, setAnnouncement] = useState("");

  const selectedMember =
    records.find((member) => member.id === selectedMemberId) ?? records[0];
  const profileDraft = profileEditor?.value;
  const fieldOptions = useMemo(
    () =>
      Array.from(new Set(records.map((member) => member.coeAssignment))).sort(),
    [records],
  );
  const statusTabs = statusDefinitions.map((status) => ({
    count:
      status.id === "all"
        ? records.length
        : records.filter((member) => member.membership.status === status.id)
            .length,
    id: status.id,
    label: status.label,
  }));
  const filteredMembers = useMemo(() => {
    const term = normalized(query);

    return records.filter((member) => {
      const matchesStatus =
        activeStatus === "all" || member.membership.status === activeStatus;
      const matchesField =
        fieldFilter === "all" || member.coeAssignment === fieldFilter;
      const searchable = normalized(
        [
          member.name,
          member.coeAssignment,
          member.affiliation.primaryUnit,
          member.expertise.primary,
          member.expertise.secondary.join(" "),
          member.academic.sintaId,
          member.academic.orcid,
        ]
          .filter(Boolean)
          .join(" "),
      );

      return matchesStatus && matchesField && searchable.includes(term);
    });
  }, [activeStatus, fieldFilter, query, records]);
  const totalPages = Math.max(1, Math.ceil(filteredMembers.length / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);
  const visibleMembers = filteredMembers.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE,
  );

  function selectMember(memberId: string) {
    setSelectedMemberId(memberId);
    setActiveDetailTab("profile");
    setMobileView("detail");
  }

  function resetFilters() {
    setActiveStatus("all");
    setFieldFilter("all");
    setQuery("");
    setCurrentPage(1);
    setFilterOpen(false);
  }

  function updateSelectedMember(
    updater: (member: NexusMemberRecord) => NexusMemberRecord,
  ) {
    setRecords((currentRecords) =>
      currentRecords.map((member) =>
        member.id === selectedMemberId ? updater(member) : member,
      ),
    );
  }

  function changeProfileDraft(
    event: ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) {
    const { name, value } = event.currentTarget;
    setProfileEditor((current) =>
      current
        ? { ...current, value: { ...current.value, [name]: value } }
        : current,
    );
    setFormError("");
  }

  function saveProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!profileEditor) return;
    const draft = profileEditor.value;
    if (
      !draft.name.trim() ||
      !draft.coeAssignment.trim() ||
      !draft.primaryUnit.trim()
    ) {
      setFormError("Nama lengkap, penugasan CoE, dan unit utama wajib diisi.");
      return;
    }

    const comparedRecords =
      profileEditor.mode === "edit"
        ? records.filter((member) => member.id !== selectedMember.id)
        : records;
    const duplicateSinta = draft.sintaId.trim()
      ? comparedRecords.find(
          (member) =>
            normalized(member.academic.sintaId ?? "") ===
            normalized(draft.sintaId),
        )
      : undefined;
    const duplicateOrcid = draft.orcid.trim()
      ? comparedRecords.find(
          (member) =>
            normalized(member.academic.orcid ?? "") === normalized(draft.orcid),
        )
      : undefined;

    if (duplicateSinta || duplicateOrcid) {
      const identifier = duplicateSinta ? "SINTA ID" : "ORCID iD";
      const owner = duplicateSinta ?? duplicateOrcid;
      setFormError(
        `${identifier} tersebut sudah digunakan oleh ${owner?.name ?? "anggota lain"}.`,
      );
      return;
    }

    if (profileEditor.mode === "create") {
      const newMemberId = `member-${crypto.randomUUID()}`;
      const newMember: NexusMemberRecord = {
        academic: {
          googleScholar: draft.googleScholar.trim() || undefined,
          orcid: draft.orcid.trim() || undefined,
          researcherId: draft.researcherId.trim() || undefined,
          scopusAuthorId: draft.scopusAuthorId.trim() || undefined,
          sintaId: draft.sintaId.trim() || undefined,
        },
        affiliation: {
          institution: "Telkom University",
          office: draft.location.trim() || undefined,
          primaryUnit: draft.primaryUnit.trim(),
        },
        biography: draft.biography.trim(),
        coeAssignment: draft.coeAssignment.trim(),
        contact: {
          alternateEmail: draft.alternateEmail.trim() || undefined,
          institutionalEmail: draft.institutionalEmail.trim() || undefined,
          location: draft.location.trim() || undefined,
          phone: draft.phone.trim() || undefined,
        },
        expertise: {
          primary: draft.primaryExpertise.trim() || undefined,
          secondary: draft.secondaryExpertise
            .split(",")
            .map((item) => item.trim())
            .filter(Boolean),
        },
        id: newMemberId,
        identity: {
          preferredName: draft.preferredName.trim() || draft.name.trim(),
        },
        membership: {
          joinedAt: draft.joinedAt || undefined,
          publicProfile: draft.publicProfile,
          status: draft.membershipStatus,
        },
        name: draft.name.trim(),
        updatedAt: "Baru saja",
      };

      setRecords((currentRecords) => [newMember, ...currentRecords]);
      setSelectedMemberId(newMemberId);
      setActiveDetailTab("profile");
      setActiveStatus("all");
      setCurrentPage(1);
      setFieldFilter("all");
      setQuery("");
      setMobileView("detail");
      setProfileEditor(null);
      setAnnouncement("Anggota baru berhasil ditambahkan.");
      return;
    }

    updateSelectedMember((member) => ({
      ...member,
      academic: {
        googleScholar: draft.googleScholar.trim() || undefined,
        orcid: draft.orcid.trim() || undefined,
        researcherId: draft.researcherId.trim() || undefined,
        scopusAuthorId: draft.scopusAuthorId.trim() || undefined,
        sintaId: draft.sintaId.trim() || undefined,
      },
      affiliation: {
        ...member.affiliation,
        office: draft.location.trim() || undefined,
        primaryUnit: draft.primaryUnit.trim(),
      },
      biography: draft.biography.trim(),
      coeAssignment: draft.coeAssignment.trim(),
      contact: {
        ...member.contact,
        alternateEmail: draft.alternateEmail.trim() || undefined,
        institutionalEmail: draft.institutionalEmail.trim() || undefined,
        location: draft.location.trim() || undefined,
        phone: draft.phone.trim() || undefined,
      },
      expertise: {
        primary: draft.primaryExpertise.trim() || undefined,
        secondary: draft.secondaryExpertise
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),
      },
      identity: {
        ...member.identity,
        preferredName: draft.preferredName.trim() || draft.name.trim(),
      },
      membership: {
        ...member.membership,
        joinedAt: draft.joinedAt || undefined,
        publicProfile: draft.publicProfile,
        status: draft.membershipStatus,
      },
      name: draft.name.trim(),
      updatedAt: "Baru saja",
    }));
    setProfileEditor(null);
    setAnnouncement("Perubahan diterapkan pada profil anggota.");
  }

  function saveInvitation(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!inviteDraft) return;
    const email = inviteDraft.email.trim();
    if (!email) {
      setFormError("Email undangan wajib diisi.");
      return;
    }

    updateSelectedMember((member) => ({
      ...member,
      account: {
        email,
        roleLabels: [],
        status: "invited",
      },
      updatedAt: "Baru saja",
    }));
    setInviteDraft(null);
    setActiveDetailTab("access");
    setAnnouncement("Undangan akses BHT Nexus berhasil dikirim.");
  }

  function changeDetailTabByKeyboard(
    event: KeyboardEvent<HTMLButtonElement>,
    currentIndex: number,
  ) {
    let nextIndex: number | null = null;
    if (event.key === "Home") nextIndex = 0;
    if (event.key === "End") nextIndex = detailTabs.length - 1;
    if (event.key === "ArrowRight" || event.key === "ArrowDown") {
      nextIndex = (currentIndex + 1) % detailTabs.length;
    }
    if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
      nextIndex = (currentIndex - 1 + detailTabs.length) % detailTabs.length;
    }
    if (nextIndex === null) return;

    event.preventDefault();
    const nextTab = detailTabs[nextIndex];
    if (!nextTab) return;
    setActiveDetailTab(nextTab.id);
    event.currentTarget.parentElement
      ?.querySelectorAll<HTMLButtonElement>('[role="tab"]')
      [nextIndex]?.focus();
  }

  function openNewMemberEditor() {
    setFormError("");
    setProfileEditor({
      mode: "create",
      value: createNewMemberDraft(),
    });
  }

  return (
    <section
      aria-labelledby="members-page-title"
      className={styles.page}
      data-mobile-view={mobileView}
    >
      <aside aria-label="Daftar anggota CoE BHT" className={styles.directory}>
        <header className={styles.directoryHeader}>
          <div className={styles.directoryHeading}>
            <div>
              <h1 id="members-page-title">{content.title}</h1>
              <p>{content.description}</p>
            </div>
            <NexusWorkspaceButton
              className={styles.addMemberButton}
              onClick={openNewMemberEditor}
              tone="primary"
              type="button"
            >
              <Icon name="plus" />
              Tambah anggota
            </NexusWorkspaceButton>
          </div>
        </header>

        <div className={styles.searchRow}>
          <NexusWorkspaceSearch
            label="Cari anggota"
            name="member-search"
            onValueChange={(value) => {
              setQuery(value);
              setCurrentPage(1);
            }}
            placeholder="Cari anggota atau bidang keahlian"
            value={query}
          />
          <button
            aria-expanded={filterOpen}
            aria-label="Filter bidang anggota"
            className={styles.filterButton}
            data-active={fieldFilter !== "all" || undefined}
            onClick={() => setFilterOpen((current) => !current)}
            type="button"
          >
            <Icon name="filter" />
          </button>
        </div>

        {filterOpen ? (
          <div className={styles.filterPanel}>
            <NexusWorkspaceFormField
              id="member-field-filter"
              label="Bidang atau penugasan"
              name="fieldFilter"
              onChange={(event) => {
                setFieldFilter(event.currentTarget.value);
                setCurrentPage(1);
              }}
              options={[
                { label: "Semua bidang", value: "all" },
                ...fieldOptions.map((field) => ({
                  label: field,
                  value: field,
                })),
              ]}
              type="select"
              value={fieldFilter}
            />
            {fieldFilter !== "all" ? (
              <NexusWorkspaceButton
                className={styles.clearFilterButton}
                onClick={() => setFieldFilter("all")}
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
              onClick={() => {
                setActiveStatus(tab.id);
                setCurrentPage(1);
              }}
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
                aria-current={member.id === selectedMember?.id || undefined}
                className={styles.memberRow}
                key={member.id}
                onClick={() => selectMember(member.id)}
                type="button"
              >
                <MemberAvatar member={member} />
                <span className={styles.memberRowCopy}>
                  <strong>{member.name}</strong>
                  <small>{member.coeAssignment}</small>
                  <span
                    className={styles.statusBadge}
                    data-tone={statusTone(member.membership.status)}
                  >
                    {statusLabels[member.membership.status]}
                  </span>
                </span>
                <span className={styles.rowChevron}>
                  <Icon name="chevron" />
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
              <NexusWorkspaceButton
                className={styles.emptyListAction}
                onClick={
                  records.length === 0 ? openNewMemberEditor : resetFilters
                }
                tone={records.length === 0 ? "primary" : undefined}
                type="button"
              >
                {records.length === 0
                  ? "Tambah anggota pertama"
                  : "Tampilkan semua anggota"}
              </NexusWorkspaceButton>
            </div>
          )}
        </div>

        <NexusTablePagination
          currentPage={safePage}
          itemCount={filteredMembers.length}
          navigationLabel="Navigasi halaman anggota"
          nextPageLabel="Halaman anggota berikutnya"
          onPageChange={setCurrentPage}
          pageLabel="Halaman"
          pageSizeValue={String(PAGE_SIZE)}
          previousPageLabel="Halaman anggota sebelumnya"
          rangePrefix="Menampilkan"
          totalUnit="anggota"
        />
      </aside>

      {selectedMember ? (
        <article
          aria-labelledby="member-detail-title"
          className={styles.detail}
        >
          <header className={styles.detailToolbar}>
            <button
              className={styles.backButton}
              onClick={() => setMobileView("list")}
              type="button"
            >
              <Icon name="arrow" />
              Daftar anggota
            </button>
            <div className={styles.detailActions}>
              <NexusWorkspaceButton
                className={styles.detailActionButton}
                onClick={() => {
                  setFormError("");
                  setProfileEditor({
                    mode: "edit",
                    value: createEditDraft(selectedMember),
                  });
                }}
                type="button"
              >
                <Icon name="edit" />
                Ubah profil
              </NexusWorkspaceButton>
              <NexusWorkspaceButton
                className={styles.detailActionButton}
                onClick={() => {
                  setFormError("");
                  if (selectedMember.account) {
                    setActiveDetailTab("access");
                    return;
                  }
                  setInviteDraft({ email: "" });
                }}
                tone="primary"
                type="button"
              >
                <Icon name="lock" />
                {selectedMember.account
                  ? "Lihat akses BHT Nexus"
                  : "Beri akses BHT Nexus"}
              </NexusWorkspaceButton>
            </div>
          </header>

          <section className={styles.profileHero}>
            <MemberAvatar member={selectedMember} />
            <div className={styles.profileIdentity}>
              <h2 id="member-detail-title">{selectedMember.name}</h2>
              <strong>{selectedMember.affiliation.primaryUnit}</strong>
              <p>{selectedMember.coeAssignment}</p>
              <div className={styles.contactLine}>
                {selectedMember.contact.institutionalEmail ? (
                  <a
                    href={`mailto:${selectedMember.contact.institutionalEmail}`}
                  >
                    <Icon name="email" />
                    {selectedMember.contact.institutionalEmail}
                  </a>
                ) : (
                  <span>
                    <Icon name="email" />
                    Belum tercatat
                  </span>
                )}
                <span>
                  <Icon name="phone" />
                  {displayValue(selectedMember.contact.phone)}
                </span>
                <span>
                  <Icon name="location" />
                  {displayValue(selectedMember.affiliation.office)}
                </span>
              </div>
            </div>
            <dl className={styles.membershipSummary}>
              <div>
                <dt>Status keanggotaan</dt>
                <dd>
                  <span
                    className={styles.statusBadge}
                    data-tone={statusTone(selectedMember.membership.status)}
                  >
                    {statusLabels[selectedMember.membership.status]}
                  </span>
                </dd>
              </div>
              <div>
                <dt>Bergabung sejak</dt>
                <dd>{displayDate(selectedMember.membership.joinedAt)}</dd>
              </div>
              <div>
                <dt>ID anggota</dt>
                <dd>{displayValue(selectedMember.membership.memberCode)}</dd>
              </div>
            </dl>
          </section>

          <div
            aria-label="Rincian anggota"
            className={styles.detailTabs}
            role="tablist"
          >
            {detailTabs.map((tab, index) => (
              <button
                aria-controls="member-detail-panel"
                aria-selected={activeDetailTab === tab.id}
                key={tab.id}
                onClick={() => setActiveDetailTab(tab.id)}
                onKeyDown={(event) => changeDetailTabByKeyboard(event, index)}
                role="tab"
                tabIndex={activeDetailTab === tab.id ? 0 : -1}
                type="button"
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div
            aria-live="polite"
            className={styles.detailPanel}
            id="member-detail-panel"
            role="tabpanel"
          >
            {activeDetailTab === "profile" ? (
              <div className={styles.cardGrid}>
                <DetailCard
                  items={[
                    { label: "Nama lengkap", value: selectedMember.name },
                    {
                      label: "Nama panggilan",
                      value: selectedMember.identity.preferredName,
                    },
                    {
                      label: "Jenis kelamin",
                      value: displayValue(selectedMember.identity.gender),
                    },
                    {
                      label: "Tanggal lahir",
                      value: displayValue(selectedMember.identity.dateOfBirth),
                    },
                    {
                      label: "Kewarganegaraan",
                      value: displayValue(selectedMember.identity.citizenship),
                    },
                    {
                      label: "Email institusi",
                      value: selectedMember.contact.institutionalEmail ? (
                        <a
                          href={`mailto:${selectedMember.contact.institutionalEmail}`}
                        >
                          {selectedMember.contact.institutionalEmail}
                        </a>
                      ) : (
                        "Belum tercatat"
                      ),
                    },
                    {
                      label: "Email alternatif",
                      value: displayValue(
                        selectedMember.contact.alternateEmail,
                      ),
                    },
                    {
                      label: "Nomor HP",
                      value: displayValue(selectedMember.contact.phone),
                    },
                  ]}
                  title="Informasi umum"
                />
                <DetailCard
                  items={[
                    {
                      label: "Unit utama",
                      value: selectedMember.affiliation.primaryUnit,
                    },
                    {
                      label: "Unit lain",
                      value: displayValue(
                        selectedMember.affiliation.secondaryUnit,
                      ),
                    },
                    {
                      label: "Institusi",
                      value: selectedMember.affiliation.institution,
                    },
                    {
                      label: "Jabatan fungsional",
                      value: displayValue(
                        selectedMember.affiliation.functionalPosition,
                      ),
                    },
                    {
                      label: "Status kepegawaian",
                      value: displayValue(
                        selectedMember.affiliation.employmentStatus,
                      ),
                    },
                    {
                      label: "Lokasi kerja",
                      value: displayValue(selectedMember.contact.location),
                    },
                  ]}
                  title="Afiliasi & unit"
                />
                <DetailCard
                  items={[
                    {
                      label: "Bidang utama",
                      value: displayValue(selectedMember.expertise.primary),
                    },
                    {
                      label: "Bidang lain",
                      value:
                        selectedMember.expertise.secondary.length > 0 ? (
                          <span className={styles.tagList}>
                            {selectedMember.expertise.secondary.map((item) => (
                              <span key={item}>{item}</span>
                            ))}
                          </span>
                        ) : (
                          "Belum tercatat"
                        ),
                    },
                  ]}
                  title="Bidang keahlian"
                  wide
                />
                <DetailCard
                  items={[
                    { label: "Ringkasan", value: selectedMember.biography },
                  ]}
                  title="Tentang anggota"
                  wide
                />
              </div>
            ) : null}

            {activeDetailTab === "membership" ? (
              <div className={styles.cardGrid}>
                <DetailCard
                  items={[
                    {
                      label: "Status",
                      value: statusLabels[selectedMember.membership.status],
                    },
                    {
                      label: "Penugasan CoE",
                      value: selectedMember.coeAssignment,
                    },
                    {
                      label: "Bergabung sejak",
                      value: displayDate(selectedMember.membership.joinedAt),
                    },
                    {
                      label: "ID anggota",
                      value: displayValue(selectedMember.membership.memberCode),
                    },
                  ]}
                  title="Keanggotaan"
                />
                <DetailCard
                  items={[
                    {
                      label: "Profil publik",
                      value: selectedMember.membership.publicProfile
                        ? "Ditampilkan"
                        : "Disembunyikan",
                    },
                    {
                      label: "Terakhir diperbarui",
                      value: selectedMember.updatedAt,
                    },
                  ]}
                  title="Status profil"
                />
              </div>
            ) : null}

            {activeDetailTab === "academic" ? (
              <div className={styles.cardGrid}>
                <DetailCard
                  items={[
                    {
                      label: "SINTA ID",
                      value: displayValue(selectedMember.academic.sintaId),
                    },
                    {
                      label: "ORCID iD",
                      value: displayValue(selectedMember.academic.orcid),
                    },
                    {
                      label: "Google Scholar",
                      value: displayValue(
                        selectedMember.academic.googleScholar,
                      ),
                    },
                    {
                      label: "Scopus Author ID",
                      value: displayValue(
                        selectedMember.academic.scopusAuthorId,
                      ),
                    },
                    {
                      label: "ResearcherID",
                      value: displayValue(selectedMember.academic.researcherId),
                    },
                  ]}
                  title="Identitas akademik & riset"
                  wide
                />
                <aside className={styles.infoNote}>
                  <strong>Mengapa identitas ini penting?</strong>
                  <p>
                    Pengenal eksternal membantu menghubungkan anggota dengan
                    karya ilmiah tanpa hanya mengandalkan kemiripan nama.
                  </p>
                  <NexusWorkspaceButton
                    className={styles.noteAction}
                    onClick={() => {
                      setFormError("");
                      setProfileEditor({
                        mode: "edit",
                        value: createEditDraft(selectedMember),
                      });
                    }}
                    type="button"
                  >
                    Lengkapi profil
                  </NexusWorkspaceButton>
                </aside>
              </div>
            ) : null}

            {activeDetailTab === "related" ? (
              <section className={styles.relatedSection}>
                <div>
                  <h3>Telusuri data resmi yang melibatkan anggota</h3>
                  <p>
                    Buka katalog domain untuk melihat anggota sebagai penulis,
                    pencipta, pembimbing, pihak terkait, atau pelaksana
                    kegiatan.
                  </p>
                </div>
                <div className={styles.relatedGrid}>
                  {relatedCatalogs.map((catalog) => (
                    <Link href={catalog.href} key={catalog.href}>
                      <span>{catalog.label}</span>
                      <small>{catalog.description}</small>
                      <strong>
                        Buka katalog <Icon name="chevron" />
                      </strong>
                    </Link>
                  ))}
                </div>
              </section>
            ) : null}

            {activeDetailTab === "access" ? (
              <section className={styles.accessSection}>
                {selectedMember.account ? (
                  <>
                    <div className={styles.cardGrid}>
                      <DetailCard
                        items={[
                          {
                            label: "Email akun",
                            value: selectedMember.account.email,
                          },
                          {
                            label: "Status akun",
                            value:
                              accountStatusLabels[
                                selectedMember.account.status
                              ],
                          },
                          {
                            label: "Hubungan profil",
                            value: "Terhubung secara langsung",
                          },
                        ]}
                        title="Akun BHT Nexus"
                      />
                      <DetailCard
                        items={[
                          {
                            label: "Role akun",
                            value:
                              selectedMember.account.roleLabels.length > 0
                                ? selectedMember.account.roleLabels.join(", ")
                                : "Belum ditetapkan",
                          },
                          {
                            label: "Pengaturan izin",
                            value: "Dikelola melalui Administrasi",
                          },
                        ]}
                        title="Ringkasan akses"
                      />
                    </div>
                    <aside className={styles.infoNote}>
                      <strong>Data anggota tetap terpisah dari akun</strong>
                      <p>
                        Perubahan akun, role, dan izin dilakukan melalui
                        Administrasi. Menangguhkan akun tidak menghapus profil
                        anggota maupun data organisasi yang sudah terhubung.
                      </p>
                    </aside>
                  </>
                ) : (
                  <div className={styles.accessEmpty}>
                    <span aria-hidden="true">
                      <Icon name="lock" />
                    </span>
                    <h3>Belum memiliki akses BHT Nexus</h3>
                    <p>
                      Profil ini tetap tercatat sebagai anggota CoE BHT meskipun
                      belum mempunyai akun untuk masuk ke BHT Nexus.
                    </p>
                    <NexusWorkspaceButton
                      onClick={() => {
                        setFormError("");
                        setInviteDraft({ email: "" });
                      }}
                      tone="primary"
                      type="button"
                    >
                      Beri akses BHT Nexus
                    </NexusWorkspaceButton>
                    <small>
                      Akun akan dihubungkan secara sengaja ke profil anggota
                      ini, bukan ditebak hanya dari kesamaan email.
                    </small>
                  </div>
                )}
              </section>
            ) : null}
          </div>

          <footer className={styles.updatedMeta}>
            <Icon name="calendar" />
            Terakhir diperbarui: {selectedMember.updatedAt}
          </footer>
        </article>
      ) : (
        <article className={`${styles.detail} ${styles.detailEmpty}`}>
          <div className={styles.detailEmptyContent}>
            <span aria-hidden="true">
              <Icon name="plus" />
            </span>
            <h2>Direktori anggota belum dimulai</h2>
            <p>
              Catat identitas anggota terlebih dahulu. Akses akun dapat
              diberikan kemudian dari profil yang sudah dibuat.
            </p>
            <NexusWorkspaceButton
              onClick={openNewMemberEditor}
              tone="primary"
              type="button"
            >
              <Icon name="plus" />
              Tambah anggota pertama
            </NexusWorkspaceButton>
          </div>
        </article>
      )}

      {profileDraft && profileEditor ? (
        <NexusWorkspaceDrawer
          closeLabel={
            profileEditor.mode === "create"
              ? "Tutup formulir anggota baru"
              : "Tutup formulir profil"
          }
          description={
            profileEditor.mode === "create"
              ? "Catat identitas dan keanggotaan CoE terlebih dahulu. Akun BHT Nexus dapat diberikan kemudian dari profil anggota."
              : "Perbarui identitas, keanggotaan, kontak, dan bidang keahlian. Pengaturan akun tidak termasuk dalam data anggota."
          }
          eyebrow="Anggota CoE BHT"
          onClose={() => setProfileEditor(null)}
          title={
            profileEditor.mode === "create"
              ? "Tambah anggota"
              : `Ubah profil · ${selectedMember?.identity.preferredName ?? "Anggota"}`
          }
        >
          <form className={styles.drawerForm} onSubmit={saveProfile}>
            <section className={styles.drawerSection}>
              <div>
                <span>01</span>
                <h3>Identitas anggota</h3>
                <p>Informasi utama yang dipakai pada daftar anggota.</p>
              </div>
              <div className={styles.formGrid}>
                <NexusWorkspaceFormField
                  id="member-name"
                  label="Nama lengkap"
                  name="name"
                  onChange={changeProfileDraft}
                  required
                  type="text"
                  value={profileDraft.name}
                />
                <NexusWorkspaceFormField
                  hint="Jika kosong, sistem memakai nama lengkap."
                  id="member-preferred-name"
                  label="Nama panggilan"
                  name="preferredName"
                  onChange={changeProfileDraft}
                  type="text"
                  value={profileDraft.preferredName}
                />
                <NexusWorkspaceFormField
                  id="member-coe-assignment"
                  label="Penugasan CoE"
                  name="coeAssignment"
                  onChange={changeProfileDraft}
                  required
                  type="text"
                  value={profileDraft.coeAssignment}
                />
                <NexusWorkspaceFormField
                  id="member-biography"
                  label="Ringkasan profil"
                  name="biography"
                  onChange={changeProfileDraft}
                  type="textarea"
                  value={profileDraft.biography}
                  wide
                />
              </div>
            </section>
            <section className={styles.drawerSection}>
              <div>
                <span>02</span>
                <h3>Keanggotaan CoE</h3>
                <p>
                  Hubungan organisasi ini tetap terpisah dari akun BHT Nexus.
                </p>
              </div>
              <div className={styles.formGrid}>
                <NexusWorkspaceFormField
                  id="member-status"
                  label="Status keanggotaan"
                  name="membershipStatus"
                  onChange={(event) => {
                    const membershipStatus = event.currentTarget
                      .value as NexusMemberStatus;
                    setProfileEditor((current) =>
                      current
                        ? {
                            ...current,
                            value: { ...current.value, membershipStatus },
                          }
                        : current,
                    );
                    setFormError("");
                  }}
                  options={statusDefinitions
                    .filter((status) => status.id !== "all")
                    .map((status) => ({
                      label: status.label,
                      value: status.id,
                    }))}
                  required
                  type="select"
                  value={profileDraft.membershipStatus}
                />
                <NexusWorkspaceFormField
                  id="member-joined-at"
                  label="Bergabung sejak"
                  name="joinedAt"
                  onChange={changeProfileDraft}
                  type="date"
                  value={profileDraft.joinedAt}
                />
                <label className={styles.visibilityControl}>
                  <input
                    checked={profileDraft.publicProfile}
                    onChange={(event) => {
                      const publicProfile = event.currentTarget.checked;
                      setProfileEditor((current) =>
                        current
                          ? {
                              ...current,
                              value: { ...current.value, publicProfile },
                            }
                          : current,
                      );
                    }}
                    type="checkbox"
                  />
                  <span>
                    <strong>Tampilkan profil pada halaman publik</strong>
                    <small>
                      Hanya informasi yang telah disetujui untuk publik yang
                      dapat ditampilkan.
                    </small>
                  </span>
                </label>
              </div>
            </section>
            <section className={styles.drawerSection}>
              <div>
                <span>03</span>
                <h3>Afiliasi & kontak</h3>
                <p>Unit organisasi dan kanal untuk menghubungi anggota.</p>
              </div>
              <div className={styles.formGrid}>
                <NexusWorkspaceFormField
                  id="member-primary-unit"
                  label="Unit utama"
                  name="primaryUnit"
                  onChange={changeProfileDraft}
                  required
                  type="text"
                  value={profileDraft.primaryUnit}
                  wide
                />
                <NexusWorkspaceFormField
                  id="member-institutional-email"
                  label="Email institusi"
                  name="institutionalEmail"
                  onChange={changeProfileDraft}
                  type="email"
                  value={profileDraft.institutionalEmail}
                />
                <NexusWorkspaceFormField
                  id="member-alternate-email"
                  label="Email alternatif"
                  name="alternateEmail"
                  onChange={changeProfileDraft}
                  type="email"
                  value={profileDraft.alternateEmail}
                />
                <NexusWorkspaceFormField
                  id="member-phone"
                  label="Nomor HP"
                  name="phone"
                  onChange={changeProfileDraft}
                  type="text"
                  value={profileDraft.phone}
                />
                <NexusWorkspaceFormField
                  id="member-location"
                  label="Lokasi kerja"
                  name="location"
                  onChange={changeProfileDraft}
                  type="text"
                  value={profileDraft.location}
                />
              </div>
            </section>
            <section className={styles.drawerSection}>
              <div>
                <span>04</span>
                <h3>Bidang keahlian</h3>
                <p>Dipakai untuk pencarian anggota dan pemetaan kompetensi.</p>
              </div>
              <div className={styles.formGrid}>
                <NexusWorkspaceFormField
                  id="member-primary-expertise"
                  label="Bidang utama"
                  name="primaryExpertise"
                  onChange={changeProfileDraft}
                  type="text"
                  value={profileDraft.primaryExpertise}
                />
                <NexusWorkspaceFormField
                  hint="Pisahkan beberapa bidang dengan koma."
                  id="member-secondary-expertise"
                  label="Bidang lain"
                  name="secondaryExpertise"
                  onChange={changeProfileDraft}
                  type="text"
                  value={profileDraft.secondaryExpertise}
                />
              </div>
            </section>
            <section className={styles.drawerSection}>
              <div>
                <span>05</span>
                <h3>Identitas akademik</h3>
                <p>
                  Tautkan profil riset agar publikasi dan rekam akademik dapat
                  dikenali dengan tepat.
                </p>
              </div>
              <div className={styles.formGrid}>
                <NexusWorkspaceFormField
                  id="member-sinta-id"
                  label="SINTA ID"
                  name="sintaId"
                  onChange={changeProfileDraft}
                  type="text"
                  value={profileDraft.sintaId}
                />
                <NexusWorkspaceFormField
                  id="member-orcid"
                  label="ORCID iD"
                  name="orcid"
                  onChange={changeProfileDraft}
                  type="text"
                  value={profileDraft.orcid}
                />
                <NexusWorkspaceFormField
                  id="member-google-scholar"
                  label="Google Scholar"
                  name="googleScholar"
                  onChange={changeProfileDraft}
                  type="url"
                  value={profileDraft.googleScholar}
                />
                <NexusWorkspaceFormField
                  id="member-scopus-author-id"
                  label="Scopus Author ID"
                  name="scopusAuthorId"
                  onChange={changeProfileDraft}
                  type="text"
                  value={profileDraft.scopusAuthorId}
                />
                <NexusWorkspaceFormField
                  id="member-researcher-id"
                  label="ResearcherID"
                  name="researcherId"
                  onChange={changeProfileDraft}
                  type="text"
                  value={profileDraft.researcherId}
                />
              </div>
            </section>
            {formError ? <p className={styles.formError}>{formError}</p> : null}
            <footer className={styles.drawerActions}>
              <NexusWorkspaceButton
                onClick={() => setProfileEditor(null)}
                type="button"
              >
                Batal
              </NexusWorkspaceButton>
              <NexusWorkspaceButton tone="primary" type="submit">
                {profileEditor.mode === "create"
                  ? "Tambah anggota"
                  : "Simpan perubahan"}
              </NexusWorkspaceButton>
            </footer>
          </form>
        </NexusWorkspaceDrawer>
      ) : null}

      {inviteDraft ? (
        <NexusWorkspaceDrawer
          closeLabel="Tutup undangan akses"
          description="Kirim undangan akun yang secara sengaja dihubungkan ke profil anggota ini. Role dan izin dikelola terpisah melalui Administrasi."
          eyebrow="Akses BHT Nexus"
          onClose={() => setInviteDraft(null)}
          title={`Beri akses · ${selectedMember.identity.preferredName}`}
        >
          <form className={styles.drawerForm} onSubmit={saveInvitation}>
            <section className={styles.drawerSection}>
              <div>
                <span>01</span>
                <h3>Profil yang dihubungkan</h3>
                <p>
                  Pastikan undangan diberikan kepada pemilik profil yang benar.
                </p>
              </div>
              <div className={styles.linkedMemberCard}>
                <MemberAvatar member={selectedMember} />
                <span>
                  <strong>{selectedMember.name}</strong>
                  <small>{selectedMember.coeAssignment}</small>
                  <small>
                    Status anggota:{" "}
                    {statusLabels[selectedMember.membership.status]}
                  </small>
                </span>
              </div>
            </section>
            <section className={styles.drawerSection}>
              <div>
                <span>02</span>
                <h3>Email undangan</h3>
                <p>
                  Email hanya menjadi alamat undangan, bukan dasar untuk menebak
                  identitas anggota.
                </p>
              </div>
              <div className={styles.formGrid}>
                <NexusWorkspaceFormField
                  hint="Undangan akan ditautkan langsung ke profil anggota yang dipilih."
                  id="member-invitation-email"
                  label="Email untuk masuk"
                  name="email"
                  onChange={(event) => {
                    const email = event.currentTarget.value;
                    setInviteDraft((current) =>
                      current ? { ...current, email } : current,
                    );
                    setFormError("");
                  }}
                  placeholder="nama@telkomuniversity.ac.id"
                  required
                  type="email"
                  value={inviteDraft.email}
                  wide
                />
                <div className={styles.accountBoundary}>
                  <strong>Yang terjadi setelah undangan dikirim</strong>
                  <ul>
                    <li>Akun dihubungkan ke ID anggota yang dipilih.</li>
                    <li>Data anggota tidak disalin ulang ke akun.</li>
                    <li>Role dan izin ditentukan melalui Administrasi.</li>
                  </ul>
                </div>
              </div>
            </section>
            {formError ? <p className={styles.formError}>{formError}</p> : null}
            <footer className={styles.drawerActions}>
              <NexusWorkspaceButton
                onClick={() => setInviteDraft(null)}
                type="button"
              >
                Batal
              </NexusWorkspaceButton>
              <NexusWorkspaceButton tone="primary" type="submit">
                Kirim undangan
              </NexusWorkspaceButton>
            </footer>
          </form>
        </NexusWorkspaceDrawer>
      ) : null}

      <p aria-live="polite" className={styles.announcement}>
        {announcement}
      </p>
    </section>
  );
}
