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
import { NexusWorkspaceButton } from "@/components/nexus-workspace-ui/nexus-workspace-elements";
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

function ModalActions({ onClose }: { onClose: () => void }) {
  return (
    <footer className={styles.actions}>
      <NexusWorkspaceButton onClick={onClose} type="button">
        Batal
      </NexusWorkspaceButton>
      <NexusWorkspaceButton tone="primary" type="submit">
        Simpan perubahan
      </NexusWorkspaceButton>
    </footer>
  );
}

export function NexusProfilePersonalEditor({
  draft,
  errors,
  includeInstitutionalEmail,
  onChange,
  onClose,
  onPhotoChange,
  onSubmit,
}: {
  draft: NexusProfileDraft;
  errors: NexusProfileErrors;
  includeInstitutionalEmail: boolean;
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
              <NexusWorkspaceFormField
                hint="Jika kosong, nama lengkap akan digunakan."
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
                error={errors.alternateEmail}
                hint="Kanal cadangan untuk dihubungi, bukan email masuk."
                id="profile-alternate-email"
                label="Email alternatif"
                name="alternateEmail"
                onChange={onChange}
                type="email"
                value={draft.alternateEmail}
              />
              {includeInstitutionalEmail ? (
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
        <ModalActions onClose={onClose} />
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
  onChange,
  onClose,
  onSubmit,
}: {
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
        <ModalActions onClose={onClose} />
      </form>
    </NexusProfileModal>
  );
}
