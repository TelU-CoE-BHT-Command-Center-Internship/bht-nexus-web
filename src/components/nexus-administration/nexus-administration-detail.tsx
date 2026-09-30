"use client";

import Image from "next/image";
import {
  type NexusAccessSummaryModule,
  type NexusRoleResolution,
  nexusRoleAccessSummary,
  nexusRoleHealth,
} from "@/components/nexus-access-policy/nexus-access-policy";
import styles from "@/components/nexus-administration/nexus-administration.module.css";
import {
  accountStatusLabels,
  type NexusAccountSpecialAccess,
  type NexusAdministrationAccount,
} from "@/components/nexus-administration/nexus-administration-content";
import { NexusAdministrationIcon } from "@/components/nexus-administration/nexus-administration-icons";
import type { NexusResolvedAdministrationRelationship } from "@/components/nexus-administration/nexus-administration-relationship";
import type { NexusAdministrationCapabilities } from "@/components/nexus-dashboard-shell/nexus-workspace-access";
import { relatedDataHref } from "@/components/nexus-members/nexus-member-identity";
import {
  type NexusProfileView,
  nexusProfileRequiredFieldLabels,
} from "@/components/nexus-profile/nexus-profile-model";
import { NexusWorkspaceDrawer } from "@/components/nexus-workspace-ui/nexus-workspace-drawer";
import {
  NexusWorkspaceButton,
  NexusWorkspaceLinkButton,
  NexusWorkspacePlannedButton,
} from "@/components/nexus-workspace-ui/nexus-workspace-elements";
import { displayRecordId } from "@/components/nexus-workspace-ui/nexus-workspace-format";

type NexusAdministrationDetailProps = {
  /** Katalog modul untuk ringkasan cakupan peran; kosong bila tidak terbaca. */
  accessModules?: readonly NexusAccessSummaryModule[];
  account: NexusAdministrationAccount;
  /** Bila belum tersedia, tindakan akun tampil dengan penanda "Segera". */
  actionsAvailable: boolean;
  canOpenMembers: boolean;
  capabilities: NexusAdministrationCapabilities;
  onCancelInvitation: () => void;
  onClose: () => void;
  onEditAccess: () => void;
  onEditRelationship: () => void;
  onManageSpecialAccess: () => void;
  onRefreshInvitation: () => void;
  onRestore: () => void;
  onSuspend: () => void;
  profile: NexusProfileView;
  relationship: NexusResolvedAdministrationRelationship;
  role: NexusRoleResolution;
  specialAccessCount: NexusAccountSpecialAccess;
};

function statusTone(status: NexusAdministrationAccount["status"]) {
  if (status === "ACTIVE") return "positive";
  if (status === "INVITED") return "warning";
  return "danger";
}

/**
 * Proyeksi profil yang sama untuk setiap akun, baik anggota maupun bukan.
 * Nilainya berasal dari penyelesai profil bersama, sehingga Administrasi tidak
 * pernah menampilkan versi lain dari informasi pribadi yang sama.
 */
function AccountProfileSummary({ profile }: { profile: NexusProfileView }) {
  const missingLabels = profile.missingRequiredFields.map(
    (field) => nexusProfileRequiredFieldLabels[field],
  );

  /* Rincian profil tidak ikut terbaca bersama daftar akun, jadi hanya nama
     yang ditampilkan dan tidak ada bidang yang dinyatakan kosong. */
  if (profile.account.personalProfileKnown === false) {
    return (
      <div className={styles.profileSummary} data-standalone="true">
        <span aria-hidden="true" className={styles.profileSummaryAvatar}>
          {profile.initials}
        </span>
        <div>
          <strong>{profile.fullName.trim() || profile.displayName}</strong>
          <small>Rincian profil dikelola pemilik akun di Profil Saya</small>
        </div>
      </div>
    );
  }

  if (!profile.hasPersonalData) {
    return (
      <div className={styles.relationCard} data-relationship="UNLINKED">
        <div className={styles.relationCardContent}>
          <span>Profil pengguna</span>
          <strong>Profil pengguna belum dilengkapi</strong>
          <small>
            Pemilik akun belum mengisi informasi pribadinya. Administrator tidak
            mengisi bagian ini dari halaman Administrasi.
          </small>
        </div>
      </div>
    );
  }

  return (
    <>
      {!profile.isComplete ? (
        <div className={styles.relationCard} data-relationship="UNLINKED">
          <div className={styles.relationCardContent}>
            <span>Profil pengguna</span>
            <strong>Profil pengguna terisi sebagian</strong>
            <small>
              {missingLabels.join(" dan ")} belum diisi. Pemilik akun dapat
              melengkapinya dari halaman Profil Saya.
            </small>
          </div>
        </div>
      ) : null}
      <div className={styles.profileSummary}>
        <span aria-hidden="true" className={styles.profileSummaryAvatar}>
          {profile.avatarSrc ? (
            <Image
              alt=""
              fill
              sizes="48px"
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
        <div>
          <strong>{profile.fullName.trim() || "Belum tercatat"}</strong>
          <small>
            {profile.source === "MEMBER"
              ? "Mengikuti profil anggota CoE BHT"
              : "Informasi pribadi milik akun ini"}
          </small>
        </div>
      </div>
      <dl className={styles.definitionGrid}>
        <div>
          <dt>Nama panggilan</dt>
          <dd>{profile.preferredName.trim() || "Belum tercatat"}</dd>
        </div>
        <div>
          <dt>Nomor HP</dt>
          <dd>{profile.phone.trim() || "Belum tercatat"}</dd>
        </div>
        <div>
          <dt>Email alternatif</dt>
          <dd>{profile.alternateEmail.trim() || "Belum tercatat"}</dd>
        </div>
      </dl>
    </>
  );
}

function AccountRelationshipSummary({
  actionsAvailable,
  canManageRelationship,
  canOpenMembers,
  onEditRelationship,
  relationship,
}: {
  actionsAvailable: boolean;
  canManageRelationship: boolean;
  canOpenMembers: boolean;
  onEditRelationship: () => void;
  relationship: NexusResolvedAdministrationRelationship;
}) {
  const manageRelationshipAction =
    !canManageRelationship ? null : actionsAvailable ? (
      <NexusWorkspaceButton
        className={styles.relationManageButton}
        onClick={onEditRelationship}
        type="button"
      >
        <NexusAdministrationIcon name="link" />
        Ubah hubungan
      </NexusWorkspaceButton>
    ) : (
      <NexusWorkspacePlannedButton className={styles.relationManageButton}>
        <NexusAdministrationIcon name="link" />
        Ubah hubungan
      </NexusWorkspacePlannedButton>
    );

  if (relationship.kind === "LINKED") {
    return (
      <div className={styles.relationCard} data-relationship="LINKED">
        <div className={styles.relationCardContent}>
          <span title={relationship.member.id}>
            {displayRecordId(relationship.member.id)}
          </span>
          <strong>{relationship.member.name}</strong>
          {relationship.member.assignment ? (
            <small>{relationship.member.assignment}</small>
          ) : null}
        </div>
        {canOpenMembers || manageRelationshipAction ? (
          <div className={styles.relationCardActions}>
            {canOpenMembers ? (
              <NexusWorkspaceLinkButton
                href={relatedDataHref("/nexus/anggota", relationship.member.id)}
              >
                Buka Anggota
              </NexusWorkspaceLinkButton>
            ) : null}
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
          <span>Akun non-anggota</span>
          <strong>Tidak memerlukan profil anggota</strong>
          <small>
            Hubungan ini ditetapkan secara eksplisit untuk pengguna di luar
            keanggotaan CoE BHT.
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
        {canOpenMembers || manageRelationshipAction ? (
          <div className={styles.relationCardActions}>
            {canOpenMembers ? (
              <NexusWorkspaceLinkButton href="/nexus/anggota">
                Buka direktori Anggota
              </NexusWorkspaceLinkButton>
            ) : null}
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
      {(relationship.member && canOpenMembers) || manageRelationshipAction ? (
        <div className={styles.relationCardActions}>
          {relationship.member && canOpenMembers ? (
            <NexusWorkspaceLinkButton
              href={relatedDataHref("/nexus/anggota", relationship.member.id)}
            >
              Buka Anggota
            </NexusWorkspaceLinkButton>
          ) : null}
          {manageRelationshipAction}
        </div>
      ) : null}
    </div>
  );
}

/** Tindakan akun: tombol biasa, atau tombol berpenanda "Segera" bila belum tersedia. */
function AccountAction({
  available,
  children,
  onClick,
  tone,
}: {
  available: boolean;
  children: string;
  onClick: () => void;
  tone?: "danger" | "primary";
}) {
  return available ? (
    <NexusWorkspaceButton onClick={onClick} tone={tone} type="button">
      {children}
    </NexusWorkspaceButton>
  ) : (
    <NexusWorkspacePlannedButton tone={tone}>
      {children}
    </NexusWorkspacePlannedButton>
  );
}

export function NexusAdministrationDetail({
  accessModules,
  account,
  actionsAvailable,
  canOpenMembers,
  capabilities,
  onCancelInvitation,
  onClose,
  onEditAccess,
  onEditRelationship,
  onManageSpecialAccess,
  onRefreshInvitation,
  onRestore,
  onSuspend,
  profile,
  relationship,
  role,
  specialAccessCount,
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
      description="Tinjau identitas akun, hubungan anggota, peran, akses khusus, dan tindakan yang tersedia."
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
            <small title={account.id}>{displayRecordId(account.id)}</small>
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
              <dd>{account.createdAt}</dd>
            </div>
            <div>
              <dt>Dibuat oleh</dt>
              <dd>{account.createdBy}</dd>
            </div>
            <div>
              <dt>Aktivitas terakhir</dt>
              <dd>
                {account.lastActiveAt ??
                  (account.status === "INVITED"
                    ? "Belum pernah masuk"
                    : "Belum tersedia")}
              </dd>
            </div>
            <div>
              <dt>Terakhir diperbarui</dt>
              <dd>{account.updatedAt}</dd>
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
            actionsAvailable={actionsAvailable}
            canManageRelationship={capabilities.canManageAccess}
            canOpenMembers={canOpenMembers}
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
            {roleHealth.isUsable && role.kind === "KNOWN" && accessModules ? (
              <ul aria-label="Cakupan hak akses bawaan peran">
                {nexusRoleAccessSummary(role.role, accessModules).map(
                  (item) => (
                    <li key={item}>{item}</li>
                  ),
                )}
              </ul>
            ) : null}
          </div>
          <div className={styles.specialAccessCard}>
            <div>
              <span>Akses khusus</span>
              <strong>
                {specialAccessCount === "loading"
                  ? "Memeriksa…"
                  : specialAccessCount === "unavailable"
                    ? "Belum dapat dibaca"
                    : specialAccessCount > 0
                      ? `${specialAccessCount} penyesuaian`
                      : "Mengikuti peran"}
              </strong>
              <small>
                {roleHealth.isUsable
                  ? "Penyesuaian berlaku hanya untuk akun ini dan tidak mengubah peran bagi akun lain."
                  : "Tetapkan peran aktif lebih dahulu supaya hasil akses khusus dapat dibaca dengan pasti."}
              </small>
            </div>
            {capabilities.canManageUserOverrides ? (
              <NexusWorkspaceButton
                onClick={onManageSpecialAccess}
                type="button"
              >
                Kelola akses khusus
              </NexusWorkspaceButton>
            ) : null}
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
          <div className={styles.detailActions}>
            {capabilities.canManageAccess &&
            (account.status === "ACTIVE" || !roleHealth.isUsable) ? (
              <AccountAction
                available={actionsAvailable}
                onClick={onEditAccess}
              >
                {roleHealth.isUsable ? "Ubah akses" : "Tetapkan peran"}
              </AccountAction>
            ) : null}

            {account.status === "ACTIVE" &&
            capabilities.canManageAccountStatus ? (
              <AccountAction
                available={actionsAvailable}
                onClick={onSuspend}
                tone="danger"
              >
                Tangguhkan akses
              </AccountAction>
            ) : null}

            {account.status === "INVITED" ? (
              <>
                {capabilities.canInviteAccount ? (
                  <AccountAction
                    available={actionsAvailable}
                    onClick={onRefreshInvitation}
                  >
                    Perbarui undangan
                  </AccountAction>
                ) : null}
                {capabilities.canManageAccountStatus ? (
                  <AccountAction
                    available={actionsAvailable}
                    onClick={onCancelInvitation}
                    tone="danger"
                  >
                    Batalkan undangan
                  </AccountAction>
                ) : null}
              </>
            ) : null}

            {account.status === "SUSPENDED" &&
            capabilities.canManageAccountStatus ? (
              <AccountAction
                available={actionsAvailable}
                onClick={onRestore}
                tone="primary"
              >
                Pulihkan akses
              </AccountAction>
            ) : null}
          </div>
          <p className={styles.auditBoundary}>
            Pastikan peran dan status akun sesuai kebutuhan pengguna sebelum
            menyimpan perubahan.
          </p>
        </section>
      </div>
    </NexusWorkspaceDrawer>
  );
}
