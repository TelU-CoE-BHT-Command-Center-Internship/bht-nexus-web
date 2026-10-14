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
  includeMemberFields,
  isSaving,
  loadOriginalImage,
  onChange,
  onClose,
  onPhotoChange,
  onSubmit,
  saveError,
}: SaveState & {
  draft: NexusProfileDraft;
  errors: NexusProfileErrors;
  /** Nama panggilan dan email kontak disimpan pada profil anggota yang tertaut. */
  includeMemberFields: boolean;
  loadOriginalImage?: () => Promise<string>;
  onChange: FormChangeHandler;
  onClose: () => void;
  onPhotoChange: (value: NexusProfilePhotoChange) => void;
  onSubmit: SubmitHandler;
}) {
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
            <NexusMemberProfilePhoto
              loadOriginalImage={loadOriginalImage}
              onChange={onPhotoChange}
              originalValue={draft.avatarOriginalSrc}
              personName={draft.fullName}
              position={draft.avatarPosition}
              value={draft.avatarSrc}
            />
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
              {includeMemberFields ? (
                <NexusWorkspaceFormField
                  hint="Jika kosong, nama lengkap akan digunakan."
                  id="profile-preferred-name"
                  label="Nama panggilan"
                  name="preferredName"
                  onChange={onChange}
                  type="text"
                  value={draft.preferredName}
                />
              ) : null}
              <NexusWorkspaceFormField
                error={errors.phone}
                id="profile-phone"
                hint="Boleh dilengkapi nanti."
                label="Nomor HP"
                name="phone"
                onChange={onChange}
                type="text"
                value={draft.phone}
              />
              {includeMemberFields ? (
                <NexusWorkspaceFormField
                  error={errors.alternateEmail}
                  hint="Kanal cadangan untuk dihubungi, bukan email masuk."
                  id="profile-alternate-email"
                  label="Email alternatif"
                  name="alternateEmail"
                  onChange={onChange}
                  type="email"
                  value={draft.alternateEmail}
                />
              ) : null}
              {includeMemberFields ? (
                <NexusWorkspaceFormField
                  error={errors.institutionalEmail}
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
  isSaving,
  saveError,
}: SaveState & {
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
        <ModalActions
          isSaving={isSaving}
          onClose={onClose}
          saveError={saveError}
        />
      </form>
    </NexusProfileModal>
  );
}

export function NexusProfileExpertiseEditor({
  draft,
  onChange,
  onClose,
  onSubmit,
  isSaving,
  saveError,
}: SaveState & {
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
        <ModalActions
          isSaving={isSaving}
          onClose={onClose}
          saveError={saveError}
        />
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
}: SaveState & {
  draft: MemberProfileDraft;
  errors: MemberProfileErrors;
  onChange: FormChangeHandler;
  onClose: () => void;
  onSubmit: SubmitHandler;
}) {
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
              error={errors.orcid}
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
              error={errors.researcherId}
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

export type NexusPasswordDraft = {
  confirmPassword: string;
  currentPassword: string;
  newPassword: string;
};

export type NexusPasswordErrors = Partial<
  Record<keyof NexusPasswordDraft, string>
>;

export function NexusProfilePasswordEditor({
  draft,
  errors,
  isSaving,
  onChange,
  onClose,
  onSubmit,
  saveError,
}: SaveState & {
  draft: NexusPasswordDraft;
  errors: NexusPasswordErrors;
  onChange: FormChangeHandler;
  onClose: () => void;
  onSubmit: SubmitHandler;
}) {
  return (
    <NexusProfileModal
      closeLabel="Tutup formulir ganti kata sandi"
      description="Setelah kata sandi diganti, sesi di perangkat lain diakhiri dan Anda tetap masuk di perangkat ini."
      onClose={onClose}
      title="Ganti kata sandi"
    >
      <form className={styles.form} noValidate onSubmit={onSubmit}>
        <div className={styles.body}>
          <input
            autoComplete="username"
            hidden
            name="username"
            readOnly
            type="email"
            value=""
          />
          <div className={styles.grid}>
            <NexusWorkspaceFormField
              autoComplete="current-password"
              error={errors.currentPassword}
              id="profile-current-password"
              label="Kata sandi saat ini"
              name="currentPassword"
              onChange={onChange}
              required
              type="password"
              value={draft.currentPassword}
              wide
            />
            <NexusWorkspaceFormField
              autoComplete="new-password"
              error={errors.newPassword}
              hint="Minimal 8 karakter."
              id="profile-new-password"
              label="Kata sandi baru"
              name="newPassword"
              onChange={onChange}
              required
              type="password"
              value={draft.newPassword}
            />
            <NexusWorkspaceFormField
              autoComplete="new-password"
              error={errors.confirmPassword}
              id="profile-confirm-password"
              label="Ulangi kata sandi baru"
              name="confirmPassword"
              onChange={onChange}
              required
              type="password"
              value={draft.confirmPassword}
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
