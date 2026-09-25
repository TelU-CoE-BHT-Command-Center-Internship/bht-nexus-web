"use client";

import Image from "next/image";
import {
  type NexusRoleResolution,
  nexusRoleHealth,
} from "@/components/nexus-access-policy/nexus-access-policy";
import styles from "@/components/nexus-administration/nexus-administration.module.css";
import {
  accountStatusLabels,
  type NexusAdministrationAccount,
} from "@/components/nexus-administration/nexus-administration-content";
import { NexusAdministrationIcon } from "@/components/nexus-administration/nexus-administration-icons";
import type { NexusResolvedAdministrationRelationship } from "@/components/nexus-administration/nexus-administration-relationship";
import type { NexusAdministrationCapabilities } from "@/components/nexus-dashboard-shell/nexus-workspace-access";
import type { NexusProfileView } from "@/components/nexus-profile/nexus-profile-model";
import { NexusWorkspaceDrawer } from "@/components/nexus-workspace-ui/nexus-workspace-drawer";
import { NexusWorkspaceButton } from "@/components/nexus-workspace-ui/nexus-workspace-elements";

type NexusAdministrationDetailProps = {
  account: NexusAdministrationAccount;
  capabilities: NexusAdministrationCapabilities;
  /** Akun milik pengguna yang sedang masuk; peran dan statusnya tidak diubah di sini. */
  isCurrentAccount: boolean;
  onClose: () => void;
  onEditAccess: () => void;
  onEditRelationship: () => void;
  onRestore: () => void;
  onSuspend: () => void;
  profile: NexusProfileView;
  relationship: NexusResolvedAdministrationRelationship;
  role: NexusRoleResolution;
};

function statusTone(status: NexusAdministrationAccount["status"]) {
  if (status === "ACTIVE") return "positive";
  if (status === "INVITED") return "warning";
  return "danger";
}

/**
 * Direktori akun layanan hanya membawa identitas akun. Informasi pribadi lain
 * diisi dan dilihat pemilik akun dari Profil Saya, sehingga Administrasi tidak
 * menyimpulkan profil yang kosong atau lengkap.
 */
function AccountProfileSummary({ profile }: { profile: NexusProfileView }) {
  return (
    <div className={styles.profileSummary}>
      <span aria-hidden="true" className={styles.profileSummaryAvatar}>
        {profile.initials}
      </span>
      <div>
        <strong>{profile.fullName.trim() || profile.displayName}</strong>
        <small>
          Nomor HP dan ringkasan profil dikelola pemilik akun dari Profil Saya.
        </small>
      </div>
    </div>
  );
}

function AccountRelationshipSummary({
  canManageRelationship,
  onEditRelationship,
  relationship,
}: {
  canManageRelationship: boolean;
  onEditRelationship: () => void;
  relationship: NexusResolvedAdministrationRelationship;
}) {
  const manageRelationshipAction = canManageRelationship ? (
    <NexusWorkspaceButton
      className={styles.relationManageButton}
      onClick={onEditRelationship}
      type="button"
    >
      <NexusAdministrationIcon name="link" />
      Ubah hubungan
    </NexusWorkspaceButton>
  ) : null;

  if (relationship.kind === "LINKED") {
    return (
      <div className={styles.relationCard} data-relationship="LINKED">
        <div className={styles.relationCardContent}>
          <span>Terhubung ke anggota</span>
          <strong>{relationship.member.name}</strong>
          <small>{relationship.member.assignment || "Anggota CoE BHT"}</small>
        </div>
        {manageRelationshipAction ? (
          <div className={styles.relationCardActions}>
            {manageRelationshipAction}
          </div>
        ) : null}
      </div>
    );
  }

  if (relationship.kind === "NON_MEMBER") {
    return (
      <div className={styles.relationCard} data-relationship="NON_MEMBER">
        <div className={styles.relationCardContent}>
          <span>Tidak terhubung</span>
          <strong>Belum ditautkan ke profil anggota</strong>
          <small>
            Tautkan akun ini bila pemiliknya anggota CoE BHT. Akun operator atau
            pengelola boleh tetap tanpa profil anggota.
          </small>
        </div>
        {manageRelationshipAction ? (
          <div className={styles.relationCardActions}>
            {manageRelationshipAction}
          </div>
        ) : null}
      </div>
    );
  }

  if (relationship.kind === "UNLINKED") {
    return (
      <div className={styles.relationCard} data-relationship="UNLINKED">
        <div className={styles.relationCardContent}>
          <span>Belum dihubungkan</span>
          <strong>Hubungan anggota belum ditentukan</strong>
          <small>
            Periksa apakah akun ini perlu ditautkan ke profil anggota atau
            ditetapkan sebagai akun non-anggota.
          </small>
        </div>
        {manageRelationshipAction ? (
          <div className={styles.relationCardActions}>
            {manageRelationshipAction}
          </div>
        ) : null}
      </div>
    );
  }

  return (
    <div className={styles.relationCard} data-relationship="CONFLICT">
      <div className={styles.relationCardContent}>
        <span>Perlu diperiksa</span>
        <strong>Hubungan akun tidak konsisten</strong>
        <small>
          Catatan hubungan akun tidak lengkap atau saling bertentangan. Tinjau
          sebelum mengubah akses.
        </small>
        {relationship.conflictingAccountId ? (
          <small>
            Hubungan juga dicatat pada akun {relationship.conflictingAccountId}.
          </small>
        ) : null}
      </div>
      {manageRelationshipAction ? (
        <div className={styles.relationCardActions}>
          {manageRelationshipAction}
        </div>
      ) : null}
    </div>
  );
}

export function NexusAdministrationDetail({
  account,
  capabilities,
  isCurrentAccount,
  onClose,
  onEditAccess,
  onEditRelationship,
  onRestore,
  onSuspend,
  profile,
  relationship,
  role,
}: NexusAdministrationDetailProps) {
  const roleHealth = nexusRoleHealth(role);
  const roleDescription =
    role.kind === "KNOWN"
      ? roleHealth.isUsable
        ? role.role.description
        : "Peran ini sudah dinonaktifkan sehingga belum dapat menjadi dasar hak akses akun. Pilih peran aktif supaya hak akses akun dapat dihitung kembali."
      : role.kind === "UNKNOWN"
        ? "Peran yang tersimpan tidak lagi dikenali. Pilih peran yang berlaku sebelum menyimpan perubahan akses."
        : "Peran perlu ditetapkan sebelum akun dapat memakai ruang kerja.";

  return (
    <NexusWorkspaceDrawer
      closeLabel="Tutup detail akun"
      description="Tinjau identitas akun, hubungan anggota, peran, dan tindakan yang tersedia."
      eyebrow="Akun & Akses"
      onClose={onClose}
      title="Detail akun"
    >
      <div className={styles.detailStack}>
        <header className={styles.detailHero}>
          <span aria-hidden="true" className={styles.detailAvatar}>
            {profile.avatarSrc ? (
              <Image
                alt=""
                fill
                sizes="64px"
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
          <div className={styles.detailIdentity}>
            <span
              className={styles.statusBadge}
              data-tone={statusTone(account.status)}
            >
              {accountStatusLabels[account.status]}
            </span>
            <h3>{profile.displayName}</h3>
            <p>{account.email}</p>
            <small>{account.id}</small>
          </div>
        </header>

        <section className={styles.detailSection}>
          <header>
            <span aria-hidden="true">
              <NexusAdministrationIcon name="account" />
            </span>
            <div>
              <h3>Informasi Akun</h3>
              <p>
                Email menjadi identitas masuk dan tidak dapat diubah di sini.
              </p>
            </div>
          </header>
          <dl className={styles.definitionGrid}>
            <div>
              <dt>Email</dt>
              <dd>{account.email}</dd>
            </div>
            <div>
              <dt>Dibuat pada</dt>
              <dd>{account.createdAt || "Belum tercatat"}</dd>
            </div>
            <div>
              <dt>Status aktivasi</dt>
              <dd>
                {account.status === "INVITED"
                  ? "Belum pernah masuk"
                  : account.status === "SUSPENDED"
                    ? "Akses ditangguhkan"
                    : "Sudah aktif"}
              </dd>
            </div>
          </dl>
        </section>

        <section className={styles.detailSection}>
          <header>
            <span aria-hidden="true">
              <NexusAdministrationIcon name="account" />
            </span>
            <div>
              <h3>Profil Pengguna</h3>
              <p>
                Informasi pribadi diisi oleh pemilik akun dari halaman Profil
                Saya.
              </p>
            </div>
          </header>
          <AccountProfileSummary profile={profile} />
        </section>

        <section className={styles.detailSection}>
          <header>
            <span aria-hidden="true">
              <NexusAdministrationIcon name="link" />
            </span>
            <div>
              <h3>Hubungan Anggota</h3>
              <p>
                Akun dan profil anggota tetap merupakan dua entitas terpisah.
              </p>
            </div>
          </header>
          <AccountRelationshipSummary
            canManageRelationship={capabilities.canManageAccess}
            onEditRelationship={onEditRelationship}
            relationship={relationship}
          />
        </section>

        <section className={styles.detailSection}>
          <header>
            <span aria-hidden="true">
              <NexusAdministrationIcon name="shield" />
            </span>
            <div>
              <h3>Peran &amp; Hak Akses</h3>
              <p>Peran menetapkan hak akses bawaan untuk akun ini.</p>
            </div>
          </header>
          <div className={styles.roleSummary}>
            <div>
              <span>Peran saat ini</span>
              <strong>{roleHealth.label}</strong>
              {roleHealth.note ? (
                <span className={styles.roleStateFlag}>{roleHealth.note}</span>
              ) : null}
              <p>{roleDescription}</p>
            </div>
          </div>
        </section>

        <section className={styles.detailSection}>
          <header>
            <span aria-hidden="true">
              <NexusAdministrationIcon name="key" />
            </span>
            <div>
              <h3>Tindakan</h3>
              <p>Hanya tindakan yang sesuai dengan status akun yang tampil.</p>
            </div>
          </header>
          {isCurrentAccount ? (
            <p className={styles.auditBoundary}>
              Ini akun Anda sendiri. Peran dan status akun Anda dikelola oleh
              pengelola lain supaya tidak ada yang mengubah aksesnya sendiri.
            </p>
          ) : (
            <div className={styles.detailActions}>
              {capabilities.canManageAccess &&
              account.status !== "SUSPENDED" ? (
                <NexusWorkspaceButton onClick={onEditAccess} type="button">
                  {roleHealth.isUsable ? "Ubah peran" : "Tetapkan peran"}
                </NexusWorkspaceButton>
              ) : null}

              {account.status !== "SUSPENDED" &&
              capabilities.canManageAccountStatus ? (
                <NexusWorkspaceButton
                  onClick={onSuspend}
                  tone="danger"
                  type="button"
                >
                  Tangguhkan akses
                </NexusWorkspaceButton>
              ) : null}

              {account.status === "SUSPENDED" &&
              capabilities.canManageAccountStatus ? (
                <NexusWorkspaceButton
                  onClick={onRestore}
                  tone="primary"
                  type="button"
                >
                  Pulihkan akses
                </NexusWorkspaceButton>
              ) : null}
            </div>
          )}
          {account.status === "INVITED" ? (
            <p className={styles.auditBoundary}>
              Akun ini menunggu aktivasi. Pemilik akun membuat kata sandinya
              sendiri melalui Aktifkan akun di halaman masuk BHT Nexus dengan
              email ini.
            </p>
          ) : null}
          <p className={styles.auditBoundary}>
            Pastikan peran dan status akun sesuai kebutuhan pengguna sebelum
            menyimpan perubahan.
          </p>
        </section>
      </div>
    </NexusWorkspaceDrawer>
  );
}
