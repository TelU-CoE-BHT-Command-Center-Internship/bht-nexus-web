"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  type ChangeEvent,
  type FormEvent,
  type ReactNode,
  useEffect,
  useState,
} from "react";
import { nexusRoleHealth } from "@/components/nexus-access-policy/nexus-access-policy";
import { nexusAccountStatusLabels } from "@/components/nexus-accounts/nexus-account-directory";
import { NexusAcademicIdentifierValue } from "@/components/nexus-members/nexus-member-academic";
import {
  createEditDraft,
  type MemberProfileDraft,
  type MemberProfileErrors,
  validateMemberProfile,
} from "@/components/nexus-members/nexus-members-model";
import styles from "@/components/nexus-profile/nexus-profile.module.css";
import {
  NexusProfileAcademicEditor,
  NexusProfileExpertiseEditor,
  NexusProfileMemberEditor,
  NexusProfilePersonalEditor,
  type NexusProfilePhotoChange,
} from "@/components/nexus-profile/nexus-profile-editors";
import { NexusProfileIcon } from "@/components/nexus-profile/nexus-profile-icons";
import {
  createNexusProfileDraft,
  type NexusProfileDraft,
  type NexusProfileErrors,
  type NexusProfileField,
  type NexusProfileView,
  nexusProfileDraftIsDirty,
  nexusProfileRelationshipLabels,
  nexusProfileRequiredFieldLabels,
  validateNexusProfileDraft,
} from "@/components/nexus-profile/nexus-profile-model";
import {
  nexusSelfAcademicFields,
  useNexusSessionProfile,
} from "@/components/nexus-profile/nexus-profile-server";
import { NexusWorkspaceConfirmDialog } from "@/components/nexus-workspace-ui/nexus-workspace-confirm-dialog";
import {
  NexusWorkspaceButton,
  NexusWorkspacePlannedButton,
  nexusWorkspaceElementStyles,
} from "@/components/nexus-workspace-ui/nexus-workspace-elements";
import { displayRecordId } from "@/components/nexus-workspace-ui/nexus-workspace-format";
import { NexusWorkspacePage } from "@/components/nexus-workspace-ui/nexus-workspace-page";
import { NexusWorkspaceState } from "@/components/nexus-workspace-ui/nexus-workspace-state";
import { useNexusWorkspaceUnsavedChanges } from "@/components/nexus-workspace-ui/nexus-workspace-unsaved-changes";
import { COE_BHT_LINKS } from "@/content/coe-bht";

export type NexusProfileContent = {
  description: string;
  title: string;
};

type NexusProfileProps = {
  content: NexusProfileContent;
};

type MemberEditorKind = "academic" | "expertise" | "member";

type MemberEditorState = {
  initialValue: MemberProfileDraft;
  kind: MemberEditorKind;
  value: MemberProfileDraft;
};

type PersonalEditorState = {
  initialValue: NexusProfileDraft;
  value: NexusProfileDraft;
};

/** Urutan bidang mengikuti tata letak formulirnya agar fokus jatuh ke bidang
 *  bermasalah yang terbaca lebih dahulu. */
const memberEditorFields: Record<
  MemberEditorKind,
  readonly (keyof MemberProfileDraft)[]
> = {
  academic: [
    "sintaId",
    "orcid",
    "googleScholar",
    "scopusAuthorId",
    "researcherId",
  ],
  expertise: ["primaryExpertise", "secondaryExpertise"],
  member: ["office", "publicProfile"],
};

/*
 * Bidang yang dapat disimpan pemilik akun mengikuti layanan: informasi pribadi
 * akun (nama lengkap, nomor HP, ringkasan) dan pengenal SINTA, Scopus, serta
 * Google Scholar pada anggota yang tertaut. Bidang lain tetap tampil sebagai
 * informasi sampai layanan menyediakan penyimpanannya.
 */
const personalUnavailableFields: ReadonlySet<NexusProfileField> = new Set([
  "alternateEmail",
  "institutionalEmail",
  "preferredName",
]);

const academicUnavailableFields: ReadonlySet<keyof MemberProfileDraft> =
  new Set(
    memberEditorFields.academic.filter(
      (field) =>
        !(nexusSelfAcademicFields as readonly string[]).includes(field),
    ),
  );

/**
 * Memindahkan fokus ke kontrol pertama yang bermasalah. Kontrolnya sudah ada
 * pada dokumen ketika validasi berjalan, sehingga pemindahan fokus tidak perlu
 * menunggu bingkai gambar berikutnya.
 */
function focusInvalidField(field?: string) {
  if (!field) return;
  document.querySelector<HTMLElement>(`[name="${field}"]`)?.focus();
}

const passwordHelpHref = `${COE_BHT_LINKS.email}?subject=${encodeURIComponent("Bantuan kata sandi BHT Nexus")}`;

function displayValue(value: string) {
  return value.trim() || "Belum tercatat";
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

function accountStatusTone(status: NexusProfileView["account"]["status"]) {
  if (status === "ACTIVE") return "positive";
  if (status === "INVITED") return "warning";
  return "danger";
}

function membershipStatusLabel(status: "active" | "inactive" | "on_leave") {
  if (status === "active") return "Aktif";
  if (status === "on_leave") return "Cuti";
  return "Nonaktif";
}

function InfoItem({
  children,
  label,
  wide = false,
}: {
  children: ReactNode;
  label: string;
  wide?: boolean;
}) {
  return (
    <div data-wide={wide || undefined}>
      <dt>{label}</dt>
      <dd>{children}</dd>
    </div>
  );
}

/**
 * Tombol ubah pada setiap kartu memakai teks pendek yang sama, sehingga nama
 * aksesibelnya harus menyebut bagian yang disunting agar tetap dapat dibedakan.
 */
function EditAction({
  available,
  onClick,
  section,
}: {
  available: boolean;
  onClick: () => void;
  section: string;
}) {
  if (!available) {
    return (
      <NexusWorkspacePlannedButton
        badgeClassName={styles.editActionLabel}
        className={styles.editAction}
      >
        <NexusProfileIcon name="pencil" />
        <span className={styles.editActionLabel}>Ubah</span>
        <span className={nexusWorkspaceElementStyles.visuallyHidden}>
          {section}
        </span>
      </NexusWorkspacePlannedButton>
    );
  }

  return (
    <NexusWorkspaceButton
      aria-label={`Ubah ${section}`}
      className={styles.editAction}
      onClick={onClick}
      type="button"
    >
      <NexusProfileIcon name="pencil" />
      <span className={styles.editActionLabel}>Ubah</span>
    </NexusWorkspaceButton>
  );
}

export function NexusProfile({ content }: NexusProfileProps) {
  const router = useRouter();
  const session = useNexusSessionProfile();
  const profile = session.profile;
  const [personalEditor, setPersonalEditor] =
    useState<PersonalEditorState | null>(null);
  const [personalErrors, setPersonalErrors] = useState<NexusProfileErrors>({});
  const [memberEditor, setMemberEditor] = useState<MemberEditorState | null>(
    null,
  );
  const [memberErrors, setMemberErrors] = useState<MemberProfileErrors>({});
  const [discardConfirmationOpen, setDiscardConfirmationOpen] = useState(false);
  const [announcement, setAnnouncement] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  const isPersonalDirty = personalEditor
    ? nexusProfileDraftIsDirty(
        personalEditor.value,
        personalEditor.initialValue,
      )
    : false;
  const isMemberDirty = memberEditor
    ? JSON.stringify(memberEditor.value) !==
      JSON.stringify(memberEditor.initialValue)
    : false;

  useNexusWorkspaceUnsavedChanges({
    confirmLabel: "Buang perubahan",
    description:
      "Perubahan pada profil belum disimpan dan akan hilang jika Anda berpindah halaman.",
    isDirty: isPersonalDirty || isMemberDirty,
    title: "Buang perubahan profil?",
  });

  useEffect(() => {
    if (!announcement) return;
    const timeoutId = window.setTimeout(() => setAnnouncement(""), 4500);
    return () => window.clearTimeout(timeoutId);
  }, [announcement]);

  if (!profile && session.state === "loading") {
    return (
      <NexusWorkspacePage
        description={content.description}
        descriptionId="profile-loading-description"
        title={content.title}
        titleId="profile-loading-title"
      >
        <div className={styles.layout}>
          <div aria-busy="true" className={styles.shell}>
            <h3 className={styles.shellTitle}>Profil BHT Nexus</h3>
            <div className={styles.cards}>
              <section className={styles.card}>
                <p className={styles.loadingCopy}>Memuat profil Anda…</p>
              </section>
            </div>
          </div>
        </div>
      </NexusWorkspacePage>
    );
  }

  if (!profile) {
    return (
      <NexusWorkspacePage
        description={content.description}
        descriptionId="profile-unavailable-description"
        title={content.title}
        titleId="profile-unavailable-title"
      >
        <NexusWorkspaceState
          actions={
            <NexusWorkspaceButton onClick={session.retry} type="button">
              Coba lagi
            </NexusWorkspaceButton>
          }
          description={
            session.errorMessage ?? "Profil Anda belum dapat dimuat."
          }
          eyebrow="Gagal memuat"
          title="Profil belum dapat ditampilkan"
          tone="danger"
        />
      </NexusWorkspacePage>
    );
  }

  const currentProfile = profile;
  const { account, relationship } = currentProfile;
  const linkedMember =
    relationship.kind === "LINKED" ? relationship.member : undefined;
  const roleHealth = nexusRoleHealth(currentProfile.role);
  /* Informasi pribadi yang tampil berasal dari akun sendiri, sehingga dapat
     disimpan ke akun itu. Bila berasal dari rekam anggota, penyimpanannya
     belum tersedia bagi pemilik akun. */
  const personalEditable = currentProfile.source === "ACCOUNT";
  const memberEditorAvailable: Record<MemberEditorKind, boolean> = {
    academic: Boolean(linkedMember),
    expertise: false,
    member: false,
  };

  function openPersonalEditor() {
    const value = createNexusProfileDraft(currentProfile);
    setPersonalErrors({});
    setSaveError("");
    setPersonalEditor({ initialValue: value, value });
  }

  function closePersonalEditor() {
    setDiscardConfirmationOpen(false);
    setPersonalErrors({});
    setSaveError("");
    setPersonalEditor(null);
  }

  function openMemberEditor(kind: MemberEditorKind) {
    if (!linkedMember) return;
    const value = createEditDraft(linkedMember);
    setMemberErrors({});
    setSaveError("");
    setMemberEditor({ initialValue: value, kind, value });
  }

  function closeMemberEditor() {
    setDiscardConfirmationOpen(false);
    setMemberErrors({});
    setSaveError("");
    setMemberEditor(null);
  }

  function requestCloseEditors() {
    if (isPersonalDirty || isMemberDirty) {
      setDiscardConfirmationOpen(true);
      return;
    }
    if (personalEditor) closePersonalEditor();
    if (memberEditor) closeMemberEditor();
  }

  function changePersonalDraft(
    event: ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) {
    const field = event.currentTarget.name as keyof NexusProfileDraft;
    const value = event.currentTarget.value;
    setPersonalEditor((current) =>
      current
        ? { ...current, value: { ...current.value, [field]: value } }
        : current,
    );
    setPersonalErrors((current) => ({ ...current, [field]: undefined }));
  }

  function changePersonalPhoto({
    avatarSrc,
    originalSrc,
    position,
  }: NexusProfilePhotoChange) {
    setPersonalEditor((current) =>
      current
        ? {
            ...current,
            value: {
              ...current.value,
              avatarOriginalSrc: originalSrc,
              avatarPosition: position,
              avatarSrc,
            },
          }
        : current,
    );
  }

  async function submitPersonalEditor(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!personalEditor || !personalEditable || isSaving) return;
    const errors: NexusProfileErrors = {};
    for (const [field, message] of Object.entries(
      validateNexusProfileDraft(personalEditor.value, {
        includeInstitutionalEmail: Boolean(linkedMember),
      }),
    ) as [NexusProfileField, string | undefined][]) {
      if (message && !personalUnavailableFields.has(field)) {
        errors[field] = message;
      }
    }
    if (Object.keys(errors).length > 0) {
      setPersonalErrors(errors);
      focusInvalidField(Object.keys(errors)[0]);
      return;
    }

    setIsSaving(true);
    setSaveError("");
    const result = await session.saveAccountProfile(personalEditor.value);
    setIsSaving(false);
    if (result?.fieldErrors && Object.keys(result.fieldErrors).length > 0) {
      setPersonalErrors(result.fieldErrors);
      focusInvalidField(Object.keys(result.fieldErrors)[0]);
      return;
    }
    if (result?.message) {
      setSaveError(result.message);
      return;
    }
    setPersonalEditor(null);
    setPersonalErrors({});
    setAnnouncement("Informasi pribadi berhasil diperbarui.");
    /* Nama pada identitas header dibaca ulang dari server. */
    router.refresh();
  }

  function changeMemberDraft(
    event: ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) {
    const field = event.currentTarget.name as keyof MemberProfileDraft;
    const value = event.currentTarget.value;
    setMemberEditor((current) =>
      current
        ? { ...current, value: { ...current.value, [field]: value } }
        : current,
    );
    setMemberErrors((current) => ({ ...current, [field]: undefined }));
  }

  async function submitMemberEditor(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (
      !memberEditor ||
      !linkedMember ||
      !memberEditorAvailable[memberEditor.kind] ||
      isSaving
    ) {
      return;
    }
    const allErrors = validateMemberProfile(
      memberEditor.value,
      [],
      linkedMember.id,
    );
    const ownedFields = memberEditorFields[memberEditor.kind].filter(
      (field) => !academicUnavailableFields.has(field),
    );
    const errors: MemberProfileErrors = {};
    for (const field of ownedFields) {
      const message = allErrors[field];
      if (message) errors[field] = message;
    }
    if (Object.keys(errors).length > 0) {
      setMemberErrors(errors);
      focusInvalidField(ownedFields.find((field) => errors[field]));
      return;
    }

    setIsSaving(true);
    setSaveError("");
    const result = await session.saveAcademicIdentifiers(
      memberEditor.value,
      linkedMember.id,
    );
    setIsSaving(false);
    if (result?.fieldErrors && Object.keys(result.fieldErrors).length > 0) {
      const fieldErrors = result.fieldErrors;
      setMemberErrors(fieldErrors);
      focusInvalidField(ownedFields.find((field) => fieldErrors[field]));
      return;
    }
    if (result?.message) {
      setSaveError(result.message);
      return;
    }
    setMemberEditor(null);
    setMemberErrors({});
    setAnnouncement("Identitas akademik berhasil diperbarui.");
  }

  const missingLabels = profile.missingRequiredFields.map(
    (field) => nexusProfileRequiredFieldLabels[field],
  );

  return (
    <NexusWorkspacePage
      description={content.description}
      descriptionId="profile-page-description"
      title={content.title}
      titleId="profile-page-title"
    >
      <div className={styles.layout}>
        {missingLabels.length > 0 ? (
          <section className={styles.notice}>
            <span aria-hidden="true" className={styles.noticeIcon}>
              <NexusProfileIcon name="alert" />
            </span>
            <div className={styles.noticeCopy}>
              <strong>Profil belum lengkap</strong>
              <p>
                {missingLabels.length === 1
                  ? `${missingLabels[0]} belum diisi.`
                  : `${missingLabels.join(" dan ")} belum diisi.`}{" "}
                Lengkapi agar rekan CoE dapat menghubungi Anda.
              </p>
            </div>
            {personalEditable ? (
              <NexusWorkspaceButton
                className={styles.cardAction}
                onClick={openPersonalEditor}
                tone="primary"
                type="button"
              >
                Lengkapi profil
              </NexusWorkspaceButton>
            ) : (
              <NexusWorkspacePlannedButton
                className={styles.cardAction}
                tone="primary"
              >
                Lengkapi profil
              </NexusWorkspacePlannedButton>
            )}
          </section>
        ) : null}

        <div className={styles.shell}>
          <h3 className={styles.shellTitle}>Profil BHT Nexus</h3>
          <div className={styles.cards}>
            <section className={styles.card}>
              <div className={styles.hero}>
                <div className={styles.heroIdentity}>
                  <span className={styles.avatar}>
                    {profile.avatarSrc ? (
                      <Image
                        alt={`Foto ${profile.displayName}`}
                        fill
                        sizes="80px"
                        src={profile.avatarSrc}
                        style={{
                          objectPosition: `${profile.avatarPosition.x}% ${profile.avatarPosition.y}%`,
                        }}
                        unoptimized={
                          typeof profile.avatarSrc === "string" &&
                          profile.avatarSrc.startsWith("data:")
                        }
                      />
                    ) : (
                      profile.initials
                    )}
                  </span>
                  <div className={styles.heroCopy}>
                    <h4>{displayValue(profile.fullName)}</h4>
                    <p className={styles.heroMeta}>
                      <span>{roleHealth.label}</span>
                      <span aria-hidden="true" className={styles.heroDivider} />
                      <span>
                        {nexusProfileRelationshipLabels[relationship.kind]}
                      </span>
                    </p>
                  </div>
                </div>
                <EditAction
                  available={personalEditable}
                  onClick={openPersonalEditor}
                  section="informasi pribadi"
                />
              </div>

              <dl className={styles.infoGrid}>
                <InfoItem label="Nama lengkap">
                  {displayValue(profile.fullName)}
                </InfoItem>
                <InfoItem label="Nama panggilan">
                  {displayValue(profile.preferredName)}
                </InfoItem>
                <InfoItem label="Nomor HP">
                  {displayValue(profile.phone)}
                </InfoItem>
                <InfoItem label="Email alternatif">
                  {displayValue(profile.alternateEmail)}
                </InfoItem>
                {linkedMember ? (
                  <InfoItem label="Email institusi personal">
                    {displayValue(profile.institutionalEmail)}
                  </InfoItem>
                ) : null}
                <InfoItem label="Ringkasan profil" wide>
                  {displayValue(profile.biography)}
                </InfoItem>
              </dl>
            </section>

            <section className={styles.card}>
              <div className={styles.cardHead}>
                <div>
                  <h4>Akun BHT Nexus</h4>
                  <p>
                    Email masuk, peran, dan status akun dikelola melalui
                    Administrasi.
                  </p>
                </div>
              </div>
              <dl className={styles.infoGrid} data-columns="2">
                <InfoItem label="Email masuk">{account.email}</InfoItem>
                <InfoItem label="Peran">
                  {roleHealth.label}
                  {roleHealth.note ? (
                    <span className={styles.badge} data-tone="danger">
                      {roleHealth.note}
                    </span>
                  ) : null}
                </InfoItem>
                <InfoItem label="Status akun">
                  <span
                    className={styles.badge}
                    data-tone={accountStatusTone(account.status)}
                  >
                    {nexusAccountStatusLabels[account.status]}
                  </span>
                </InfoItem>
                <InfoItem label="Hubungan anggota">
                  {nexusProfileRelationshipLabels[relationship.kind]}
                </InfoItem>
              </dl>

              {relationship.kind === "UNLINKED" ? (
                <div className={styles.relationNote}>
                  <strong>Hubungan keanggotaan belum ditentukan</strong>
                  <p>
                    Akun ini belum ditandai sebagai anggota CoE BHT maupun akun
                    non-anggota. Hubungi pengelola Administrasi bila Anda
                    seharusnya terdaftar sebagai anggota.
                  </p>
                </div>
              ) : null}

              {relationship.kind === "CONFLICT" ? (
                <div className={styles.relationNote} data-tone="warning">
                  <strong>Hubungan keanggotaan perlu diperiksa</strong>
                  <p>
                    Catatan hubungan anggota pada akun ini belum konsisten,
                    sehingga informasi keanggotaan belum dapat ditampilkan.
                    Hubungi pengelola Administrasi untuk memeriksanya.
                  </p>
                </div>
              ) : null}
            </section>

            {linkedMember ? (
              <>
                <section className={styles.card}>
                  <div className={styles.cardHead}>
                    <div>
                      <h4>Keanggotaan &amp; Organisasi</h4>
                      <p>
                        Informasi organisasi dikelola melalui direktori Anggota.
                      </p>
                    </div>
                  </div>
                  <dl className={styles.infoGrid} data-columns="2">
                    <InfoItem label="ID anggota">
                      <span title={linkedMember.id}>
                        {displayRecordId(linkedMember.id)}
                      </span>
                    </InfoItem>
                    <InfoItem label="Status keanggotaan">
                      {membershipStatusLabel(linkedMember.membership.status)}
                    </InfoItem>
                    <InfoItem label="Bergabung sejak">
                      {displayDate(linkedMember.membership.joinedAt)}
                    </InfoItem>
                    <InfoItem label="Penugasan CoE">
                      {displayValue(linkedMember.coeAssignment)}
                    </InfoItem>
                    <InfoItem label="Institusi">
                      {displayValue(linkedMember.affiliation.institution)}
                    </InfoItem>
                    <InfoItem label="Unit utama">
                      {displayValue(linkedMember.affiliation.primaryUnit)}
                    </InfoItem>
                  </dl>
                </section>

                <section className={styles.card}>
                  <div className={styles.cardHead}>
                    <div>
                      <h4>Profil Anggota</h4>
                      <p>
                        Lokasi kerja dan tampilan profil Anda pada halaman
                        publik CoE BHT.
                      </p>
                    </div>
                    <EditAction
                      available={memberEditorAvailable.member}
                      onClick={() => openMemberEditor("member")}
                      section="profil anggota"
                    />
                  </div>
                  <dl className={styles.infoGrid} data-columns="2">
                    <InfoItem label="Lokasi kerja">
                      {displayValue(linkedMember.affiliation.office ?? "")}
                    </InfoItem>
                    <InfoItem label="Profil publik">
                      <span
                        className={styles.badge}
                        data-tone={
                          linkedMember.membership.publicProfile
                            ? "positive"
                            : "neutral"
                        }
                      >
                        {linkedMember.membership.publicProfile
                          ? "Ditampilkan"
                          : "Tidak ditampilkan"}
                      </span>
                    </InfoItem>
                  </dl>
                </section>

                <section className={styles.card}>
                  <div className={styles.cardHead}>
                    <div>
                      <h4>Bidang Keahlian</h4>
                      <p>
                        Dipakai untuk pencarian anggota dan pemetaan kompetensi
                        CoE.
                      </p>
                    </div>
                    <EditAction
                      available={memberEditorAvailable.expertise}
                      onClick={() => openMemberEditor("expertise")}
                      section="bidang keahlian"
                    />
                  </div>
                  <dl className={styles.infoGrid} data-columns="2">
                    <InfoItem label="Bidang utama">
                      {displayValue(linkedMember.expertise.primary ?? "")}
                    </InfoItem>
                    <InfoItem label="Bidang lain">
                      {linkedMember.expertise.secondary.length > 0 ? (
                        <span className={styles.tags}>
                          {linkedMember.expertise.secondary.map((item) => (
                            <span className={styles.tag} key={item}>
                              {item}
                            </span>
                          ))}
                        </span>
                      ) : (
                        "Belum tercatat"
                      )}
                    </InfoItem>
                  </dl>
                </section>

                <section className={styles.card}>
                  <div className={styles.cardHead}>
                    <div>
                      <h4>Identitas Akademik</h4>
                      <p>
                        Pengenal eksternal membantu membedakan karya Anda dari
                        peneliti bernama mirip.
                      </p>
                    </div>
                    <EditAction
                      available={memberEditorAvailable.academic}
                      onClick={() => openMemberEditor("academic")}
                      section="identitas akademik"
                    />
                  </div>
                  <dl className={styles.infoGrid} data-columns="2">
                    <InfoItem label="SINTA ID">
                      <NexusAcademicIdentifierValue
                        identifier="sintaId"
                        value={linkedMember.academic.sintaId}
                      />
                    </InfoItem>
                    <InfoItem label="ORCID iD">
                      <NexusAcademicIdentifierValue
                        identifier="orcid"
                        value={linkedMember.academic.orcid}
                      />
                    </InfoItem>
                    <InfoItem label="Google Scholar">
                      <NexusAcademicIdentifierValue
                        identifier="googleScholar"
                        value={linkedMember.academic.googleScholar}
                      />
                    </InfoItem>
                    <InfoItem label="Scopus Author ID">
                      <NexusAcademicIdentifierValue
                        identifier="scopusAuthorId"
                        value={linkedMember.academic.scopusAuthorId}
                      />
                    </InfoItem>
                    <InfoItem label="ResearcherID">
                      <NexusAcademicIdentifierValue
                        identifier="researcherId"
                        value={linkedMember.academic.researcherId}
                      />
                    </InfoItem>
                  </dl>
                </section>
              </>
            ) : null}

            <section className={styles.card}>
              <div className={styles.cardHead}>
                <div>
                  <h4>Keamanan</h4>
                  <p>Pengaturan yang menjaga akses masuk ke BHT Nexus.</p>
                </div>
              </div>
              <div className={styles.securityRows}>
                <div className={styles.securityRow}>
                  <div className={styles.securityCopy}>
                    <strong>Kata sandi</strong>
                    <p>
                      Penggantian kata sandi belum dapat dilakukan dari halaman
                      ini. Ajukan permintaan ke Dukungan BHT Nexus, lalu ikuti
                      petunjuk yang diberikan.
                    </p>
                  </div>
                  <a
                    className={`${nexusWorkspaceElementStyles.button} ${styles.cardAction}`}
                    data-tone="secondary"
                    href={passwordHelpHref}
                  >
                    Hubungi Dukungan
                  </a>
                </div>
              </div>
            </section>
          </div>
        </div>

        <output aria-live="polite" className={styles.announcement}>
          {announcement}
        </output>
      </div>

      {personalEditor ? (
        <NexusProfilePersonalEditor
          draft={personalEditor.value}
          errors={personalErrors}
          includeInstitutionalEmail={Boolean(linkedMember)}
          isSaving={isSaving}
          onChange={changePersonalDraft}
          onClose={requestCloseEditors}
          onPhotoChange={changePersonalPhoto}
          onSubmit={submitPersonalEditor}
          photoAvailable={false}
          saveError={saveError}
          unavailableFields={personalUnavailableFields}
        />
      ) : null}

      {memberEditor?.kind === "member" ? (
        <NexusProfileMemberEditor
          draft={memberEditor.value}
          onChange={changeMemberDraft}
          onClose={requestCloseEditors}
          onPublicProfileChange={(publicProfile) =>
            setMemberEditor((current) =>
              current
                ? { ...current, value: { ...current.value, publicProfile } }
                : current,
            )
          }
          onSubmit={submitMemberEditor}
        />
      ) : null}

      {memberEditor?.kind === "expertise" ? (
        <NexusProfileExpertiseEditor
          draft={memberEditor.value}
          onChange={changeMemberDraft}
          onClose={requestCloseEditors}
          onSubmit={submitMemberEditor}
        />
      ) : null}

      {memberEditor?.kind === "academic" ? (
        <NexusProfileAcademicEditor
          draft={memberEditor.value}
          errors={memberErrors}
          isSaving={isSaving}
          onChange={changeMemberDraft}
          onClose={requestCloseEditors}
          onSubmit={submitMemberEditor}
          saveError={saveError}
          unavailableFields={academicUnavailableFields}
        />
      ) : null}

      {discardConfirmationOpen ? (
        <NexusWorkspaceConfirmDialog
          cancelLabel="Lanjutkan mengisi"
          confirmLabel="Buang perubahan"
          description="Perubahan pada profil belum disimpan dan akan hilang jika formulir ditutup."
          onCancel={() => setDiscardConfirmationOpen(false)}
          onConfirm={() => {
            if (personalEditor) closePersonalEditor();
            if (memberEditor) closeMemberEditor();
          }}
          title="Buang perubahan profil?"
        />
      ) : null}
    </NexusWorkspacePage>
  );
}
