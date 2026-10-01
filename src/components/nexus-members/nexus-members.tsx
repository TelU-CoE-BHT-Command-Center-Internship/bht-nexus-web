"use client";

import { useRouter } from "next/navigation";
import {
  type ChangeEvent,
  type FormEvent,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { NexusMemberCapabilities } from "@/components/nexus-dashboard-shell/nexus-workspace-access";
import {
  type MemberDetailTab,
  type MemberRelatedCatalogId,
  NexusMemberDetail,
} from "@/components/nexus-members/nexus-member-detail";
import { NexusMemberDirectory } from "@/components/nexus-members/nexus-member-directory";
import { NexusMemberProfileDrawer } from "@/components/nexus-members/nexus-member-profile-drawer";
import {
  memberWriteBodyFromRecord,
  useNexusMemberDetail,
  useNexusMemberDirectory,
} from "@/components/nexus-members/nexus-member-server";
import { MemberIcon } from "@/components/nexus-members/nexus-member-ui";
import styles from "@/components/nexus-members/nexus-members.module.css";
import type {
  NexusMemberRecord,
  NexusMembersContent,
  NexusMemberViewRecord,
} from "@/components/nexus-members/nexus-members-content";
import {
  createEditDraft,
  createNewMemberDraft,
  type MemberProfileErrors,
  memberRecordFromDraft,
  type ProfileEditorState,
  profileDraftIsDirty,
  type statusDefinitions,
  validateMemberProfile,
} from "@/components/nexus-members/nexus-members-model";
import { NexusWorkspaceConfirmDialog } from "@/components/nexus-workspace-ui/nexus-workspace-confirm-dialog";
import { NexusWorkspaceButton } from "@/components/nexus-workspace-ui/nexus-workspace-elements";
import { normalizeWorkspaceSearch } from "@/components/nexus-workspace-ui/nexus-workspace-format";
import { apiErrorMessage } from "@/lib/api-client";
import {
  createMember,
  updateMember,
  updateMemberAvatar,
} from "@/lib/api-members";

const PAGE_SIZE = 6;

type StatusFilter = (typeof statusDefinitions)[number]["id"];

type NexusMembersProps = {
  capabilities: NexusMemberCapabilities;
  /** Pengumpulan data dapat dimulai dari identitas akademik anggota. */
  canStartCollection: boolean;
  content: NexusMembersContent;
  initialMemberId?: string;
  relatedCatalogIds?: readonly MemberRelatedCatalogId[];
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

export function NexusMembers({
  capabilities,
  canStartCollection,
  content,
  initialMemberId,
  relatedCatalogIds,
}: NexusMembersProps) {
  const router = useRouter();
  const directory = useNexusMemberDirectory();
  const records: readonly NexusMemberViewRecord[] = directory.records;
  const isDirectoryReady = directory.state === "ready";
  const initialMemberIsKnown =
    !initialMemberId ||
    !isDirectoryReady ||
    records.some((member) => member.id === initialMemberId);
  const [selectedMemberId, setSelectedMemberId] = useState(
    initialMemberId ?? "",
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
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileSaveError, setProfileSaveError] = useState("");
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
    setSelectedMemberId(initialMemberId);
  }, [initialMemberId]);

  const fieldOptions = useMemo(
    () =>
      Array.from(
        new Set(records.map((member) => member.coeAssignment).filter(Boolean)),
      ).sort((first, second) => first.localeCompare(second, "id-ID")),
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
  const showsInvalidContext =
    Boolean(initialMemberId) &&
    !initialMemberIsKnown &&
    !invalidMemberContextDismissed;
  const selectedMember = showsInvalidContext
    ? undefined
    : (filteredMembers.find((member) => member.id === selectedMemberId) ??
      filteredMembers[0]);
  const detail = useNexusMemberDetail(selectedMember?.id);

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
    setProfileSaveError("");
    setProfileEditor({ initialValue: value, mode: "create", value });
  }

  function openMemberEditor() {
    if (!detail.record) return;
    const value = createEditDraft(detail.record);
    setProfileErrors({});
    setProfileSaveError("");
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

  async function saveProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!profileEditor || isSavingProfile) return;
    const currentMember =
      profileEditor.mode === "edit" ? detail.record : undefined;
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

    const savedMember = memberRecordFromDraft(
      profileEditor.value,
      currentMember,
    );
    const body = memberWriteBodyFromRecord(savedMember);
    const avatar = savedMember.avatarSrc;
    const avatarChanged =
      typeof avatar === "string" &&
      avatar !== profileEditor.initialValue.avatarSrc;
    setIsSavingProfile(true);
    setProfileSaveError("");
    try {
      const stored =
        profileEditor.mode === "create"
          ? await createMember(body)
          : await updateMember(savedMember.id, body);
      if (avatarChanged) {
        await updateMemberAvatar(stored.publicId, {
          avatarOriginalSrc:
            typeof savedMember.avatarOriginalSrc === "string"
              ? savedMember.avatarOriginalSrc
              : undefined,
          avatarPosition: savedMember.avatarPosition,
          avatarSrc: avatar,
        });
      }
      directory.refresh();
      detail.reload(stored.publicId);
      setAnnouncement(
        profileEditor.mode === "create"
          ? "Anggota baru berhasil ditambahkan."
          : "Perubahan profil anggota berhasil disimpan.",
      );
      setSelectedMemberId(stored.publicId);
      setActiveStatus("all");
      setFieldFilter("all");
      setQuery("");
      setCurrentPage(1);
      setMobileView("detail");
      setProfileErrors({});
      setProfileEditor(null);
    } catch (error) {
      setProfileSaveError(
        apiErrorMessage(error, "Profil anggota belum dapat disimpan."),
      );
    } finally {
      setIsSavingProfile(false);
    }
  }

  function renderDetail() {
    if (directory.state === "loading") {
      return (
        <article
          aria-busy="true"
          className={`${styles.detail} ${styles.detailEmpty}`}
        >
          <div className={styles.detailEmptyContent}>
            <h2>Memuat direktori anggota…</h2>
          </div>
        </article>
      );
    }

    if (directory.state === "error") {
      return (
        <article className={`${styles.detail} ${styles.detailEmpty}`}>
          <div className={styles.detailEmptyContent} role="alert">
            <h2>Direktori anggota belum dapat dimuat</h2>
            <p>{directory.errorMessage}</p>
            <NexusWorkspaceButton onClick={directory.retry} type="button">
              Coba lagi
            </NexusWorkspaceButton>
          </div>
        </article>
      );
    }

    if (selectedMember && detail.state === "ready" && detail.record) {
      return (
        <NexusMemberDetail
          accountManagementAvailable
          activeTab={activeDetailTab}
          canStartCollection={canStartCollection}
          capabilities={capabilities}
          editingAvailable
          member={detail.record}
          onBack={() => setMobileView("list")}
          onEdit={openMemberEditor}
          onOpenAcademicEditor={openMemberEditor}
          onTabChange={setActiveDetailTab}
          relatedCatalogIds={relatedCatalogIds}
        />
      );
    }

    if (selectedMember && detail.state === "error") {
      return (
        <article className={`${styles.detail} ${styles.detailEmpty}`}>
          <div className={styles.detailEmptyContent} role="alert">
            <h2>
              {detail.notFound
                ? "Profil anggota tidak ditemukan"
                : "Rincian anggota belum dapat dimuat"}
            </h2>
            <p>
              {detail.notFound
                ? "Profil ini sudah tidak tersedia. Pilih anggota lain dari direktori."
                : detail.errorMessage}
            </p>
            <NexusWorkspaceButton
              onClick={detail.notFound ? directory.retry : detail.retry}
              type="button"
            >
              {detail.notFound ? "Muat ulang direktori" : "Coba lagi"}
            </NexusWorkspaceButton>
          </div>
        </article>
      );
    }

    if (selectedMember) {
      return (
        <article
          aria-busy="true"
          className={`${styles.detail} ${styles.detailEmpty}`}
        >
          <div className={styles.detailEmptyContent}>
            <h2>Memuat profil anggota…</h2>
          </div>
        </article>
      );
    }

    return (
      <article className={`${styles.detail} ${styles.detailEmpty}`}>
        <div className={styles.detailEmptyContent}>
          <span aria-hidden="true">
            <MemberIcon name="plus" />
          </span>
          <h2>
            {showsInvalidContext
              ? "Profil anggota tidak ditemukan"
              : records.length === 0
                ? "Direktori anggota belum dimulai"
                : "Tidak ada anggota pada hasil ini"}
          </h2>
          <p>
            {showsInvalidContext
              ? "ID anggota pada tautan ini tidak tersedia. Kembali ke direktori untuk memilih profil yang benar."
              : records.length === 0
                ? "Catat identitas anggota terlebih dahulu. Akses akun dapat diberikan kemudian."
                : "Ubah pencarian atau filter di daftar anggota untuk memilih profil lain."}
          </p>
          {showsInvalidContext ? (
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
    );
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
        creationAvailable
        currentPage={safePage}
        description={content.description}
        fieldFilter={fieldFilter}
        fieldOptions={fieldOptions}
        filterOpen={filterOpen}
        filteredCount={filteredMembers.length}
        isLoading={directory.state === "loading"}
        loadError={
          directory.state === "error" ? directory.errorMessage : undefined
        }
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
        onRetry={directory.retry}
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

      {renderDetail()}

      {profileEditor ? (
        <NexusMemberProfileDrawer
          canDeactivateMember={capabilities.canDeactivateMember}
          editor={profileEditor}
          errors={profileErrors}
          isSaving={isSavingProfile}
          memberName={detail.record?.identity.preferredName}
          onChange={changeProfileDraft}
          onClose={requestCloseProfileEditor}
          onEditorChange={(editor) => {
            setProfileEditor(editor);
            setProfileErrors({});
          }}
          onSubmit={saveProfile}
          saveError={profileSaveError}
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
