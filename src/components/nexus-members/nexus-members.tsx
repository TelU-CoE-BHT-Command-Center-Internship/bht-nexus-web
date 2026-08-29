"use client";

import { useRouter } from "next/navigation";
import {
  type ChangeEvent,
  type FormEvent,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useNexusAccessPolicySession } from "@/components/nexus-access-policy/nexus-access-policy-session";
import { useNexusAccountSession } from "@/components/nexus-account-session/nexus-account-session";
import type { NexusMemberCapabilities } from "@/components/nexus-dashboard-shell/nexus-workspace-access";
import { useNexusMemberSession } from "@/components/nexus-member-session/nexus-member-session";
import {
  type MemberDetailTab,
  NexusMemberDetail,
} from "@/components/nexus-members/nexus-member-detail";
import { NexusMemberDirectory } from "@/components/nexus-members/nexus-member-directory";
import { NexusMemberProfileDrawer } from "@/components/nexus-members/nexus-member-profile-drawer";
import { MemberIcon } from "@/components/nexus-members/nexus-member-ui";
import styles from "@/components/nexus-members/nexus-members.module.css";
import {
  type NexusMemberRecord,
  type NexusMembersContent,
  projectNexusMemberAccounts,
} from "@/components/nexus-members/nexus-members-content";
import {
  createEditDraft,
  createNewMemberDraft,
  type MemberProfileErrors,
  normalizedMemberDraft,
  type ProfileEditorState,
  profileDraftIsDirty,
  type statusDefinitions,
  validateMemberProfile,
} from "@/components/nexus-members/nexus-members-model";
import { NexusWorkspaceConfirmDialog } from "@/components/nexus-workspace-ui/nexus-workspace-confirm-dialog";
import { NexusWorkspaceButton } from "@/components/nexus-workspace-ui/nexus-workspace-elements";
import {
  formatAuditTimestamp,
  normalizeWorkspaceSearch,
} from "@/components/nexus-workspace-ui/nexus-workspace-format";

const PAGE_SIZE = 6;

type StatusFilter = (typeof statusDefinitions)[number]["id"];

type NexusMembersProps = {
  capabilities: NexusMemberCapabilities;
  content: NexusMembersContent;
  initialMemberId?: string;
};

function memberMatchesQuery(member: NexusMemberRecord, query: string) {
  const searchable = normalizeWorkspaceSearch(
    [
      member.name,
      member.coeAssignment,
      member.affiliation.primaryUnit,
      member.expertise.primary,
      member.expertise.secondary.join(" "),
      member.academic.sintaId,
      member.academic.orcid,
      member.academic.scopusAuthorId,
      member.academic.researcherId,
    ]
      .filter(Boolean)
      .join(" "),
  );
  return searchable.includes(normalizeWorkspaceSearch(query));
}

function recordFromDraft(
  draftValue: ProfileEditorState["value"],
  current?: NexusMemberRecord,
): NexusMemberRecord {
  const draft = normalizedMemberDraft(draftValue);
  return {
    academic: {
      googleScholar: draft.googleScholar || undefined,
      orcid: draft.orcid || undefined,
      researcherId: draft.researcherId || undefined,
      scopusAuthorId: draft.scopusAuthorId || undefined,
      sintaId: draft.sintaId || undefined,
    },
    affiliation: {
      institution: current?.affiliation.institution ?? "Telkom University",
      office: draft.office.trim() || undefined,
      primaryUnit: draft.primaryUnit.trim(),
    },
    avatarOriginalSrc: draft.avatarSrc ? draft.avatarOriginalSrc : undefined,
    avatarPosition: draft.avatarSrc ? draft.avatarPosition : undefined,
    avatarSrc: draft.avatarSrc,
    biography: draft.biography.trim(),
    coeAssignment: draft.coeAssignment.trim(),
    contact: {
      alternateEmail: draft.alternateEmail.trim() || undefined,
      institutionalEmail: draft.institutionalEmail.trim() || undefined,
      phone: draft.phone.trim() || undefined,
    },
    expertise: {
      primary: draft.primaryExpertise.trim() || undefined,
      secondary: draft.secondaryExpertise
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
    },
    id: current?.id ?? `member-${crypto.randomUUID()}`,
    identity: {
      preferredName: draft.preferredName.trim() || draft.name.trim(),
    },
    membership: {
      joinedAt: draft.joinedAt || undefined,
      publicProfile: draft.publicProfile,
      status: draft.membershipStatus,
    },
    name: draft.name.trim(),
    updatedAt: formatAuditTimestamp(),
  };
}

export function NexusMembers({
  capabilities,
  content,
  initialMemberId,
}: NexusMembersProps) {
  const router = useRouter();
  const { accounts } = useNexusAccountSession();
  const { roles } = useNexusAccessPolicySession();
  const { records: memberRecords, saveMember } = useNexusMemberSession();
  const records = useMemo(
    () => projectNexusMemberAccounts(memberRecords, accounts, roles),
    [accounts, memberRecords, roles],
  );
  const initialMemberIsKnown =
    !initialMemberId ||
    memberRecords.some((member) => member.id === initialMemberId);
  const [selectedMemberId, setSelectedMemberId] = useState(
    initialMemberId
      ? initialMemberIsKnown
        ? initialMemberId
        : ""
      : (memberRecords[0]?.id ?? ""),
  );
  const [invalidMemberContextDismissed, setInvalidMemberContextDismissed] =
    useState(false);
  const [activeStatus, setActiveStatus] = useState<StatusFilter>("all");
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
  const [profileErrors, setProfileErrors] = useState<MemberProfileErrors>({});
  const [announcement, setAnnouncement] = useState("");
  const [profileDiscardConfirmationOpen, setProfileDiscardConfirmationOpen] =
    useState(false);

  useEffect(() => {
    if (!announcement) return;

    const timeoutId = window.setTimeout(() => setAnnouncement(""), 4500);
    return () => window.clearTimeout(timeoutId);
  }, [announcement]);

  useEffect(() => {
    setInvalidMemberContextDismissed(false);
    if (!initialMemberId) return;
    setSelectedMemberId(initialMemberIsKnown ? initialMemberId : "");
  }, [initialMemberId, initialMemberIsKnown]);

  const fieldOptions = useMemo(
    () =>
      Array.from(new Set(records.map((member) => member.coeAssignment))).sort(
        (first, second) => first.localeCompare(second, "id-ID"),
      ),
    [records],
  );

  const filteredMembers = useMemo(
    () =>
      records.filter((member) => {
        const matchesStatus =
          activeStatus === "all" || member.membership.status === activeStatus;
        const matchesAssignment =
          fieldFilter === "all" || member.coeAssignment === fieldFilter;
        return (
          matchesStatus &&
          matchesAssignment &&
          memberMatchesQuery(member, query)
        );
      }),
    [activeStatus, fieldFilter, query, records],
  );

  const totalPages = Math.max(1, Math.ceil(filteredMembers.length / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);
  const visibleMembers = filteredMembers.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE,
  );
  const selectedMember =
    initialMemberId && !initialMemberIsKnown && !invalidMemberContextDismissed
      ? undefined
      : (filteredMembers.find((member) => member.id === selectedMemberId) ??
        filteredMembers[0]);

  function selectFirstResult() {
    setSelectedMemberId("");
    setCurrentPage(1);
    setActiveDetailTab("profile");
  }

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
    setSelectedMemberId(records[0]?.id ?? "");
    setFilterOpen(false);
  }

  function openNewMemberEditor() {
    const value = createNewMemberDraft();
    setProfileErrors({});
    setProfileEditor({ initialValue: value, mode: "create", value });
  }

  function openMemberEditor() {
    if (!selectedMember) return;
    const value = createEditDraft(selectedMember);
    setProfileErrors({});
    setProfileEditor({ initialValue: value, mode: "edit", value });
  }

  function requestCloseProfileEditor() {
    if (profileEditor && profileDraftIsDirty(profileEditor)) {
      setProfileDiscardConfirmationOpen(true);
      return;
    }
    closeProfileEditor();
  }

  function closeProfileEditor() {
    setProfileDiscardConfirmationOpen(false);
    setProfileErrors({});
    setProfileEditor(null);
  }

  function changeProfileDraft(
    event: ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) {
    const field = event.currentTarget.name as keyof ProfileEditorState["value"];
    const value = event.currentTarget.value;
    setProfileEditor((current) =>
      current
        ? { ...current, value: { ...current.value, [field]: value } }
        : current,
    );
    setProfileErrors((current) => ({ ...current, [field]: undefined }));
  }

  function saveProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!profileEditor) return;
    const currentMember =
      profileEditor.mode === "edit"
        ? memberRecords.find((member) => member.id === selectedMember?.id)
        : undefined;
    const errors = validateMemberProfile(
      profileEditor.value,
      records,
      currentMember?.id,
    );
    if (Object.keys(errors).length > 0) {
      setProfileErrors(errors);
      const firstField = Object.keys(errors)[0];
      requestAnimationFrame(() =>
        document.querySelector<HTMLElement>(`[name="${firstField}"]`)?.focus(),
      );
      return;
    }

    const savedMember = recordFromDraft(profileEditor.value, currentMember);
    saveMember(savedMember);
    if (profileEditor.mode === "create") {
      setAnnouncement("Anggota baru berhasil ditambahkan.");
    } else {
      setAnnouncement("Perubahan profil anggota berhasil disimpan.");
    }

    setSelectedMemberId(savedMember.id);
    setActiveStatus("all");
    setFieldFilter("all");
    setQuery("");
    setCurrentPage(1);
    setMobileView("detail");
    setProfileErrors({});
    setProfileEditor(null);
  }

  return (
    <section
      aria-labelledby="members-page-title"
      className={styles.page}
      data-mobile-view={mobileView}
    >
      <NexusMemberDirectory
        activeStatus={activeStatus}
        canCreateMember={capabilities.canCreateMember}
        currentPage={safePage}
        description={content.description}
        fieldFilter={fieldFilter}
        fieldOptions={fieldOptions}
        filterOpen={filterOpen}
        filteredCount={filteredMembers.length}
        onCreate={openNewMemberEditor}
        onFieldFilterChange={(value) => {
          setFieldFilter(value);
          selectFirstResult();
        }}
        onFilterOpenChange={setFilterOpen}
        onPageChange={setCurrentPage}
        onQueryChange={(value) => {
          setQuery(value);
          selectFirstResult();
        }}
        onResetFilters={resetFilters}
        onSelect={selectMember}
        onStatusChange={(status) => {
          setActiveStatus(status);
          selectFirstResult();
        }}
        pageSize={PAGE_SIZE}
        query={query}
        records={records}
        selectedMemberId={selectedMember?.id}
        title={content.title}
        visibleMembers={visibleMembers}
      />

      {selectedMember ? (
        <NexusMemberDetail
          activeTab={activeDetailTab}
          capabilities={capabilities}
          member={selectedMember}
          onBack={() => setMobileView("list")}
          onEdit={openMemberEditor}
          onOpenAcademicEditor={openMemberEditor}
          onTabChange={setActiveDetailTab}
        />
      ) : (
        <article className={`${styles.detail} ${styles.detailEmpty}`}>
          <div className={styles.detailEmptyContent}>
            <span aria-hidden="true">
              <MemberIcon name="plus" />
            </span>
            <h2>
              {initialMemberId &&
              !initialMemberIsKnown &&
              !invalidMemberContextDismissed
                ? "Profil anggota tidak ditemukan"
                : records.length === 0
                  ? "Direktori anggota belum dimulai"
                  : "Tidak ada anggota pada hasil ini"}
            </h2>
            <p>
              {initialMemberId &&
              !initialMemberIsKnown &&
              !invalidMemberContextDismissed
                ? "ID anggota pada tautan ini tidak tersedia. Kembali ke direktori untuk memilih profil yang benar."
                : records.length === 0
                  ? "Catat identitas anggota terlebih dahulu. Akses akun dapat diberikan kemudian."
                  : "Ubah pencarian atau filter di daftar anggota untuk memilih profil lain."}
            </p>
            {initialMemberId &&
            !initialMemberIsKnown &&
            !invalidMemberContextDismissed ? (
              <NexusWorkspaceButton
                onClick={() => {
                  setInvalidMemberContextDismissed(true);
                  setSelectedMemberId(records[0]?.id ?? "");
                  router.replace("/nexus/anggota");
                }}
                type="button"
              >
                Kembali ke direktori
              </NexusWorkspaceButton>
            ) : records.length === 0 && capabilities.canCreateMember ? (
              <NexusWorkspaceButton
                onClick={openNewMemberEditor}
                tone="primary"
                type="button"
              >
                <MemberIcon name="plus" />
                Tambah anggota pertama
              </NexusWorkspaceButton>
            ) : records.length > 0 ? (
              <NexusWorkspaceButton onClick={resetFilters} type="button">
                Tampilkan semua anggota
              </NexusWorkspaceButton>
            ) : null}
          </div>
        </article>
      )}

      {profileEditor ? (
        <NexusMemberProfileDrawer
          canDeactivateMember={capabilities.canDeactivateMember}
          editor={profileEditor}
          errors={profileErrors}
          memberName={selectedMember?.identity.preferredName}
          onChange={changeProfileDraft}
          onClose={requestCloseProfileEditor}
          onEditorChange={(editor) => {
            setProfileEditor(editor);
            setProfileErrors({});
          }}
          onSubmit={saveProfile}
        />
      ) : null}

      {profileDiscardConfirmationOpen ? (
        <NexusWorkspaceConfirmDialog
          cancelLabel="Lanjutkan mengisi"
          confirmLabel="Buang perubahan"
          description="Perubahan pada profil belum disimpan dan akan hilang jika formulir ditutup."
          onCancel={() => setProfileDiscardConfirmationOpen(false)}
          onConfirm={closeProfileEditor}
          title="Buang perubahan profil?"
        />
      ) : null}

      <output aria-live="polite" className={styles.announcement}>
        {announcement}
      </output>
    </section>
  );
}
