"use client";

import type { ImageProps } from "next/image";
import type { ChangeEvent, FormEvent } from "react";
import type { NexusMemberAvatarPosition } from "@/components/nexus-members/nexus-member-avatar";
import { NexusMemberProfilePhoto } from "@/components/nexus-members/nexus-member-profile-photo";
import type {
  MemberProfileDraft,
  MemberProfileErrors,
} from "@/components/nexus-members/nexus-members-model";
import { NexusProfileModal } from "@/components/nexus-profile/nexus-profile-modal";
import styles from "@/components/nexus-profile/nexus-profile-modal.module.css";
import type {
  NexusProfileDraft,
  NexusProfileErrors,
  NexusProfileField,
} from "@/components/nexus-profile/nexus-profile-model";
import {
  NexusWorkspaceButton,
  NexusWorkspaceNotice,
} from "@/components/nexus-workspace-ui/nexus-workspace-elements";
import { NexusWorkspaceFormField } from "@/components/nexus-workspace-ui/nexus-workspace-form-field";

type FormChangeHandler = (
  event: ChangeEvent<
    HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
  >,
) => void;

type SubmitHandler = (event: FormEvent<HTMLFormElement>) => void;

export type NexusProfilePhotoChange = {
  avatarSrc?: ImageProps["src"];
  originalSrc?: ImageProps["src"];
  position: NexusMemberAvatarPosition;
};

/** Petunjuk untuk bidang yang tampil tetapi belum dapat disimpan dari halaman ini. */
const UNAVAILABLE_FIELD_HINT = "Belum dapat diubah dari Profil Saya.";

type SaveState = {
  /** Penyimpanan sedang berjalan; formulir menunggu jawaban layanan. */
  isSaving?: boolean;
  /** Alasan penyimpanan terakhir ditolak, ditampilkan di atas tombol aksi. */
  saveError?: string;
};

function ModalActions({
  isSaving = false,
  onClose,
  saveError,
}: SaveState & { onClose: () => void }) {
  return (
    <>
      {saveError ? (
        <div className={styles.saveError}>
          <NexusWorkspaceNotice tone="danger">{saveError}</NexusWorkspaceNotice>
        </div>
      ) : null}
      <footer className={styles.actions}>
        <NexusWorkspaceButton onClick={onClose} type="button">
          Batal
        </NexusWorkspaceButton>
        <NexusWorkspaceButton disabled={isSaving} tone="primary" type="submit">
          {isSaving ? "Menyimpan…" : "Simpan perubahan"}
        </NexusWorkspaceButton>
      </footer>
    </>
  );
}

export function NexusProfilePersonalEditor({
  draft,
  errors,
  includeInstitutionalEmail,
  isSaving,
  onChange,
  onClose,
  onPhotoChange,
  onSubmit,
  photoAvailable = true,
  saveError,
  unavailableFields,
}: SaveState & {
  draft: NexusProfileDraft;
  errors: NexusProfileErrors;
  includeInstitutionalEmail: boolean;
  onChange: FormChangeHandler;
  onClose: () => void;
  onPhotoChange: (value: NexusProfilePhotoChange) => void;
  onSubmit: SubmitHandler;
  /** Foto profil dapat diganti dan disimpan dari halaman ini. */
  photoAvailable?: boolean;
  /** Bidang yang tampil sebagai informasi karena belum dapat disimpan. */
  unavailableFields?: ReadonlySet<NexusProfileField>;
}) {
  const unavailable = (field: NexusProfileField) =>
    unavailableFields?.has(field) ?? false;

  return (
    <NexusProfileModal
      closeLabel="Tutup formulir informasi pribadi"
      description="Perbarui informasi pribadi yang dipakai pada profil BHT Nexus Anda."
      onClose={onClose}
      title="Edit informasi pribadi"
    >
      <form className={styles.form} noValidate onSubmit={onSubmit}>
        <div className={styles.body}>
          <section className={styles.section}>
            <h3>Foto profil</h3>
            {photoAvailable ? (
              <NexusMemberProfilePhoto
                onChange={onPhotoChange}
                originalValue={draft.avatarOriginalSrc}
                personName={draft.fullName}
                position={draft.avatarPosition}
                value={draft.avatarSrc}
              />
            ) : (
              <p className={styles.sectionNote}>
                Mengganti foto profil belum tersedia dari halaman ini.
              </p>
            )}
          </section>

          <section className={styles.section}>
            <h3>Informasi pribadi</h3>
            <div className={styles.grid}>
              <NexusWorkspaceFormField
                error={errors.fullName}
                id="profile-full-name"
                label="Nama lengkap"
                name="fullName"
                onChange={onChange}
                required
                type="text"
                value={draft.fullName}
              />
              <NexusWorkspaceFormField
                disabled={unavailable("preferredName")}
                hint={
                  unavailable("preferredName")
                    ? UNAVAILABLE_FIELD_HINT
                    : "Jika kosong, nama lengkap akan digunakan."
                }
                id="profile-preferred-name"
                label="Nama panggilan"
                name="preferredName"
                onChange={onChange}
                type="text"
                value={draft.preferredName}
              />
              <NexusWorkspaceFormField
                error={errors.phone}
                id="profile-phone"
                label="Nomor HP"
                name="phone"
                onChange={onChange}
                required
                type="text"
                value={draft.phone}
              />
              <NexusWorkspaceFormField
                disabled={unavailable("alternateEmail")}
                error={errors.alternateEmail}
                hint={
                  unavailable("alternateEmail")
                    ? UNAVAILABLE_FIELD_HINT
                    : "Kanal cadangan untuk dihubungi, bukan email masuk."
                }
                id="profile-alternate-email"
                label="Email alternatif"
                name="alternateEmail"
                onChange={onChange}
                type="email"
                value={draft.alternateEmail}
              />
              {includeInstitutionalEmail ? (
                <NexusWorkspaceFormField
                  disabled={unavailable("institutionalEmail")}
                  error={errors.institutionalEmail}
                  hint={
                    unavailable("institutionalEmail")
                      ? UNAVAILABLE_FIELD_HINT
                      : undefined
                  }
                  id="profile-institutional-email"
                  label="Email institusi personal"
                  name="institutionalEmail"
                  onChange={onChange}
                  type="email"
                  value={draft.institutionalEmail}
                  wide
                />
              ) : null}
              <NexusWorkspaceFormField
                error={errors.biography}
                id="profile-biography"
                label="Ringkasan profil"
                name="biography"
                onChange={onChange}
                type="textarea"
                value={draft.biography}
                wide
              />
            </div>
          </section>
        </div>
        <ModalActions
          isSaving={isSaving}
          onClose={onClose}
          saveError={saveError}
        />
      </form>
    </NexusProfileModal>
  );
}

export function NexusProfileMemberEditor({
  draft,
  onChange,
  onClose,
  onPublicProfileChange,
  onSubmit,
}: {
  draft: MemberProfileDraft;
  onChange: FormChangeHandler;
  onClose: () => void;
  onPublicProfileChange: (publicProfile: boolean) => void;
  onSubmit: SubmitHandler;
}) {
  return (
    <NexusProfileModal
      closeLabel="Tutup formulir profil anggota"
      description="Atur lokasi kerja dan tampilan profil Anda pada halaman publik CoE BHT."
      onClose={onClose}
      title="Edit profil anggota"
    >
      <form className={styles.form} noValidate onSubmit={onSubmit}>
        <div className={styles.body}>
          <div className={styles.grid}>
            <NexusWorkspaceFormField
              id="profile-office"
              label="Lokasi kerja"
              name="office"
              onChange={onChange}
              type="text"
              value={draft.office}
              wide
            />
            <label className={styles.visibilityControl}>
              <input
                checked={draft.publicProfile}
                onChange={(event) =>
                  onPublicProfileChange(event.currentTarget.checked)
                }
                type="checkbox"
              />
              <span>
                <strong>Izinkan profil tampil pada halaman publik</strong>
                <small>
                  Informasi publik tetap mengikuti proses penyimpanan dan
                  persetujuan data anggota.
                </small>
              </span>
            </label>
          </div>
        </div>
        <ModalActions onClose={onClose} />
      </form>
    </NexusProfileModal>
  );
}

export function NexusProfileExpertiseEditor({
  draft,
  onChange,
  onClose,
  onSubmit,
}: {
  draft: MemberProfileDraft;
  onChange: FormChangeHandler;
  onClose: () => void;
  onSubmit: SubmitHandler;
}) {
  return (
    <NexusProfileModal
      closeLabel="Tutup formulir bidang keahlian"
      description="Bidang keahlian dipakai untuk pencarian anggota dan pemetaan kompetensi CoE."
      onClose={onClose}
      title="Edit bidang keahlian"
    >
      <form className={styles.form} noValidate onSubmit={onSubmit}>
        <div className={styles.body}>
          <div className={styles.grid}>
            <NexusWorkspaceFormField
              id="profile-primary-expertise"
              label="Bidang utama"
              name="primaryExpertise"
              onChange={onChange}
              type="text"
              value={draft.primaryExpertise}
            />
            <NexusWorkspaceFormField
              hint="Pisahkan beberapa bidang dengan koma."
              id="profile-secondary-expertise"
              label="Bidang lain"
              name="secondaryExpertise"
              onChange={onChange}
              type="text"
              value={draft.secondaryExpertise}
            />
          </div>
        </div>
        <ModalActions onClose={onClose} />
      </form>
    </NexusProfileModal>
  );
}

export function NexusProfileAcademicEditor({
  draft,
  errors,
  isSaving,
  onChange,
  onClose,
  onSubmit,
  saveError,
  unavailableFields,
}: SaveState & {
  draft: MemberProfileDraft;
  errors: MemberProfileErrors;
  onChange: FormChangeHandler;
  onClose: () => void;
  onSubmit: SubmitHandler;
  /** Pengenal yang tampil sebagai informasi karena belum dapat disimpan. */
  unavailableFields?: ReadonlySet<keyof MemberProfileDraft>;
}) {
  const unavailable = (field: keyof MemberProfileDraft) =>
    unavailableFields?.has(field) ?? false;

  return (
    <NexusProfileModal
      closeLabel="Tutup formulir identitas akademik"
      description="Pengenal eksternal membantu membedakan karya Anda dari peneliti bernama mirip."
      onClose={onClose}
      title="Edit identitas akademik"
    >
      <form className={styles.form} noValidate onSubmit={onSubmit}>
        <div className={styles.body}>
          <div className={styles.grid}>
            <NexusWorkspaceFormField
              error={errors.sintaId}
              id="profile-sinta-id"
              label="SINTA ID"
              name="sintaId"
              onChange={onChange}
              type="text"
              value={draft.sintaId}
            />
            <NexusWorkspaceFormField
              disabled={unavailable("orcid")}
              error={errors.orcid}
              hint={unavailable("orcid") ? UNAVAILABLE_FIELD_HINT : undefined}
              id="profile-orcid"
              label="ORCID iD"
              name="orcid"
              onChange={onChange}
              type="text"
              value={draft.orcid}
            />
            <NexusWorkspaceFormField
              error={errors.googleScholar}
              id="profile-google-scholar"
              label="Google Scholar"
              name="googleScholar"
              onChange={onChange}
              type="url"
              value={draft.googleScholar}
              wide
            />
            <NexusWorkspaceFormField
              error={errors.scopusAuthorId}
              id="profile-scopus-author-id"
              label="Scopus Author ID"
              name="scopusAuthorId"
              onChange={onChange}
              type="text"
              value={draft.scopusAuthorId}
            />
            <NexusWorkspaceFormField
              disabled={unavailable("researcherId")}
              error={errors.researcherId}
              hint={
                unavailable("researcherId") ? UNAVAILABLE_FIELD_HINT : undefined
              }
              id="profile-researcher-id"
              label="ResearcherID"
              name="researcherId"
              onChange={onChange}
              type="text"
              value={draft.researcherId}
            />
          </div>
        </div>
        <ModalActions
          isSaving={isSaving}
          onClose={onClose}
          saveError={saveError}
        />
      </form>
    </NexusProfileModal>
  );
}
