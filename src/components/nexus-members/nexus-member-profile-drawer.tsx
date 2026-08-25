"use client";

import type { ChangeEvent, FormEvent } from "react";
import { NexusMemberProfilePhoto } from "@/components/nexus-members/nexus-member-profile-photo";
import styles from "@/components/nexus-members/nexus-members.module.css";
import type { NexusMemberStatus } from "@/components/nexus-members/nexus-members-content";
import type {
  MemberProfileErrors,
  ProfileEditorState,
} from "@/components/nexus-members/nexus-members-model";
import { statusDefinitions } from "@/components/nexus-members/nexus-members-model";
import { NexusWorkspaceDrawer } from "@/components/nexus-workspace-ui/nexus-workspace-drawer";
import { NexusWorkspaceButton } from "@/components/nexus-workspace-ui/nexus-workspace-elements";
import { NexusWorkspaceFormField } from "@/components/nexus-workspace-ui/nexus-workspace-form-field";

type ProfileDrawerProps = {
  canDeactivateMember: boolean;
  editor: ProfileEditorState;
  errors: MemberProfileErrors;
  memberName?: string;
  onChange: (
    event: ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => void;
  onClose: () => void;
  onEditorChange: (editor: ProfileEditorState) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
};

export function NexusMemberProfileDrawer({
  canDeactivateMember,
  editor,
  errors,
  memberName,
  onChange,
  onClose,
  onEditorChange,
  onSubmit,
}: ProfileDrawerProps) {
  const draft = editor.value;
  const isCreate = editor.mode === "create";

  function updateMembershipStatus(membershipStatus: NexusMemberStatus) {
    onEditorChange({
      ...editor,
      value: { ...editor.value, membershipStatus },
    });
  }

  return (
    <NexusWorkspaceDrawer
      closeLabel={
        isCreate ? "Tutup formulir anggota baru" : "Tutup formulir profil"
      }
      description={
        isCreate
          ? "Catat identitas dan keanggotaan CoE terlebih dahulu. Akses BHT Nexus dapat diberikan kemudian dari profil anggota."
          : "Perbarui identitas organisasi, kontak, bidang keahlian, dan pengenal akademik anggota."
      }
      eyebrow="Anggota CoE BHT"
      onClose={onClose}
      title={
        isCreate ? "Tambah anggota" : `Ubah profil · ${memberName ?? "Anggota"}`
      }
    >
      <form className={styles.drawerForm} noValidate onSubmit={onSubmit}>
        <section className={styles.drawerSection}>
          <div>
            <span>01</span>
            <h3>Identitas anggota</h3>
            <p>Informasi utama yang dipakai pada direktori anggota.</p>
          </div>
          <div className={styles.formGrid}>
            <NexusMemberProfilePhoto
              memberName={draft.name}
              onChange={({ avatarSrc, originalSrc, position }) =>
                onEditorChange({
                  ...editor,
                  value: {
                    ...editor.value,
                    avatarOriginalSrc: originalSrc,
                    avatarPosition: position,
                    avatarSrc,
                  },
                })
              }
              originalValue={draft.avatarOriginalSrc}
              position={draft.avatarPosition}
              value={draft.avatarSrc}
            />
            <NexusWorkspaceFormField
              error={errors.name}
              id="member-name"
              label="Nama lengkap"
              name="name"
              onChange={onChange}
              required
              type="text"
              value={draft.name}
            />
            <NexusWorkspaceFormField
              hint="Jika kosong, nama lengkap akan digunakan."
              id="member-preferred-name"
              label="Nama panggilan"
              name="preferredName"
              onChange={onChange}
              type="text"
              value={draft.preferredName}
            />
            <NexusWorkspaceFormField
              error={errors.coeAssignment}
              id="member-coe-assignment"
              label="Penugasan CoE"
              name="coeAssignment"
              onChange={onChange}
              required
              type="text"
              value={draft.coeAssignment}
            />
            <NexusWorkspaceFormField
              id="member-biography"
              label="Ringkasan profil"
              name="biography"
              onChange={onChange}
              type="textarea"
              value={draft.biography}
              wide
            />
          </div>
        </section>

        <section className={styles.drawerSection}>
          <div>
            <span>02</span>
            <h3>Keanggotaan CoE</h3>
            <p>Hubungan organisasi ini tetap terpisah dari akun untuk login.</p>
          </div>
          <div className={styles.formGrid}>
            {canDeactivateMember ? (
              <NexusWorkspaceFormField
                id="member-status"
                label="Status keanggotaan"
                name="membershipStatus"
                onChange={(event) =>
                  updateMembershipStatus(
                    event.currentTarget.value as NexusMemberStatus,
                  )
                }
                options={statusDefinitions
                  .filter((status) => status.id !== "all")
                  .map((status) => ({
                    label: status.label,
                    value: status.id,
                  }))}
                required
                type="select"
                value={draft.membershipStatus}
              />
            ) : null}
            <NexusWorkspaceFormField
              id="member-joined-at"
              label="Bergabung sejak"
              name="joinedAt"
              onChange={onChange}
              type="date"
              value={draft.joinedAt}
            />
            <label className={styles.visibilityControl}>
              <input
                checked={draft.publicProfile}
                onChange={(event) =>
                  onEditorChange({
                    ...editor,
                    value: {
                      ...editor.value,
                      publicProfile: event.currentTarget.checked,
                    },
                  })
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
        </section>

        <section className={styles.drawerSection}>
          <div>
            <span>03</span>
            <h3>Afiliasi & kontak</h3>
            <p>Unit organisasi dan kanal personal untuk menghubungi anggota.</p>
          </div>
          <div className={styles.formGrid}>
            <NexusWorkspaceFormField
              error={errors.primaryUnit}
              id="member-primary-unit"
              label="Unit utama"
              name="primaryUnit"
              onChange={onChange}
              required
              type="text"
              value={draft.primaryUnit}
              wide
            />
            <NexusWorkspaceFormField
              error={errors.institutionalEmail}
              id="member-institutional-email"
              label="Email institusi personal"
              name="institutionalEmail"
              onChange={onChange}
              type="email"
              value={draft.institutionalEmail}
            />
            <NexusWorkspaceFormField
              error={errors.alternateEmail}
              id="member-alternate-email"
              label="Email alternatif"
              name="alternateEmail"
              onChange={onChange}
              type="email"
              value={draft.alternateEmail}
            />
            <NexusWorkspaceFormField
              id="member-phone"
              label="Nomor HP"
              name="phone"
              onChange={onChange}
              type="text"
              value={draft.phone}
            />
            <NexusWorkspaceFormField
              id="member-office"
              label="Lokasi kerja"
              name="office"
              onChange={onChange}
              type="text"
              value={draft.office}
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
              onChange={onChange}
              type="text"
              value={draft.primaryExpertise}
            />
            <NexusWorkspaceFormField
              hint="Pisahkan beberapa bidang dengan koma."
              id="member-secondary-expertise"
              label="Bidang lain"
              name="secondaryExpertise"
              onChange={onChange}
              type="text"
              value={draft.secondaryExpertise}
            />
          </div>
        </section>

        <section className={styles.drawerSection}>
          <div>
            <span>05</span>
            <h3>Identitas akademik</h3>
            <p>
              Pengenal eksternal membantu membedakan karya anggota yang namanya
              mirip.
            </p>
          </div>
          <div className={styles.formGrid}>
            <NexusWorkspaceFormField
              error={errors.sintaId}
              id="member-sinta-id"
              label="SINTA ID"
              name="sintaId"
              onChange={onChange}
              type="text"
              value={draft.sintaId}
            />
            <NexusWorkspaceFormField
              error={errors.orcid}
              id="member-orcid"
              label="ORCID iD"
              name="orcid"
              onChange={onChange}
              type="text"
              value={draft.orcid}
            />
            <NexusWorkspaceFormField
              error={errors.googleScholar}
              id="member-google-scholar"
              label="Google Scholar"
              name="googleScholar"
              onChange={onChange}
              type="url"
              value={draft.googleScholar}
            />
            <NexusWorkspaceFormField
              error={errors.scopusAuthorId}
              id="member-scopus-author-id"
              label="Scopus Author ID"
              name="scopusAuthorId"
              onChange={onChange}
              type="text"
              value={draft.scopusAuthorId}
            />
            <NexusWorkspaceFormField
              error={errors.researcherId}
              id="member-researcher-id"
              label="ResearcherID"
              name="researcherId"
              onChange={onChange}
              type="text"
              value={draft.researcherId}
            />
          </div>
        </section>

        <footer className={styles.drawerActions}>
          <NexusWorkspaceButton onClick={onClose} type="button">
            Batal
          </NexusWorkspaceButton>
          <NexusWorkspaceButton tone="primary" type="submit">
            {isCreate ? "Tambah anggota" : "Simpan perubahan"}
          </NexusWorkspaceButton>
        </footer>
      </form>
    </NexusWorkspaceDrawer>
  );
}
