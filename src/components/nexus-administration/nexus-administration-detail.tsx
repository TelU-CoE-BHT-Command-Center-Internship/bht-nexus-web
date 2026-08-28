"use client";

import styles from "@/components/nexus-administration/nexus-administration.module.css";
import {
  accountStatusLabels,
  type NexusAdministrationAccount,
  type NexusAdministrationRole,
} from "@/components/nexus-administration/nexus-administration-content";
import { NexusAdministrationIcon } from "@/components/nexus-administration/nexus-administration-icons";
import type { NexusResolvedAdministrationRelationship } from "@/components/nexus-administration/nexus-administration-relationship";
import type { NexusAdministrationCapabilities } from "@/components/nexus-dashboard-shell/nexus-workspace-access";
import { relatedDataHref } from "@/components/nexus-members/nexus-member-identity";
import { NexusWorkspaceDrawer } from "@/components/nexus-workspace-ui/nexus-workspace-drawer";
import {
  NexusWorkspaceButton,
  NexusWorkspaceLinkButton,
} from "@/components/nexus-workspace-ui/nexus-workspace-elements";
import { personInitials } from "@/components/nexus-workspace-ui/nexus-workspace-format";

type NexusAdministrationDetailProps = {
  account: NexusAdministrationAccount;
  capabilities: NexusAdministrationCapabilities;
  onCancelInvitation: () => void;
  onClose: () => void;
  onEditAccess: () => void;
  onEditRelationship: () => void;
  onRefreshInvitation: () => void;
  onRestore: () => void;
  onSuspend: () => void;
  relationship: NexusResolvedAdministrationRelationship;
  role?: NexusAdministrationRole;
};

function statusTone(status: NexusAdministrationAccount["status"]) {
  if (status === "ACTIVE") return "positive";
  if (status === "INVITED") return "warning";
  return "danger";
}

function AccountRelationshipSummary({
  relationship,
}: {
  relationship: NexusResolvedAdministrationRelationship;
}) {
  if (relationship.kind === "LINKED") {
    return (
      <div className={styles.relationCard} data-relationship="LINKED">
        <div>
          <span>{relationship.member.id}</span>
          <strong>{relationship.member.name}</strong>
          <small>{relationship.member.assignment}</small>
        </div>
        <NexusWorkspaceLinkButton
          href={relatedDataHref("/nexus/anggota", relationship.member.id)}
        >
          Buka Anggota
        </NexusWorkspaceLinkButton>
      </div>
    );
  }

  if (relationship.kind === "NON_MEMBER") {
    return (
      <div className={styles.relationCard} data-relationship="NON_MEMBER">
        <div>
          <span>Akun non-anggota</span>
          <strong>Tidak memerlukan profil anggota</strong>
          <small>
            Hubungan ini ditetapkan secara eksplisit untuk pengguna di luar
            keanggotaan CoE BHT.
          </small>
        </div>
      </div>
    );
  }

  if (relationship.kind === "UNLINKED") {
    return (
      <div className={styles.relationCard} data-relationship="UNLINKED">
        <div>
          <span>Belum dihubungkan</span>
          <strong>Hubungan anggota belum ditentukan</strong>
          <small>
            Periksa apakah akun ini perlu ditautkan ke profil anggota atau
            ditetapkan sebagai akun non-anggota.
          </small>
        </div>
        <NexusWorkspaceLinkButton href="/nexus/anggota">
          Buka direktori Anggota
        </NexusWorkspaceLinkButton>
      </div>
    );
  }

  return (
    <div className={styles.relationCard} data-relationship="CONFLICT">
      <div>
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
      {relationship.member ? (
        <NexusWorkspaceLinkButton
          href={relatedDataHref("/nexus/anggota", relationship.member.id)}
        >
          Buka Anggota
        </NexusWorkspaceLinkButton>
      ) : null}
    </div>
  );
}

export function NexusAdministrationDetail({
  account,
  capabilities,
  onCancelInvitation,
  onClose,
  onEditAccess,
  onEditRelationship,
  onRefreshInvitation,
  onRestore,
  onSuspend,
  relationship,
  role,
}: NexusAdministrationDetailProps) {
  return (
    <NexusWorkspaceDrawer
      closeLabel="Tutup detail akun"
      description="Tinjau identitas akun, hubungan anggota, role tingkat tinggi, dan tindakan yang tersedia."
      eyebrow="Akun & Akses"
      onClose={onClose}
      title="Detail akun"
    >
      <div className={styles.detailStack}>
        <header className={styles.detailHero}>
          <span aria-hidden="true" className={styles.detailAvatar}>
            {personInitials(account.displayName)}
          </span>
          <div className={styles.detailIdentity}>
            <span
              className={styles.statusBadge}
              data-tone={statusTone(account.status)}
            >
              {accountStatusLabels[account.status]}
            </span>
            <h3>{account.displayName}</h3>
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
              <NexusAdministrationIcon name="link" />
            </span>
            <div>
              <h3>Hubungan Anggota</h3>
              <p>
                Akun dan profil anggota tetap merupakan dua entitas terpisah.
              </p>
            </div>
          </header>
          <AccountRelationshipSummary relationship={relationship} />
          {capabilities.canManageAccess ? (
            <div className={styles.detailActions}>
              <NexusWorkspaceButton onClick={onEditRelationship} type="button">
                Kelola hubungan anggota
              </NexusWorkspaceButton>
            </div>
          ) : null}
        </section>

        <section className={styles.detailSection}>
          <header>
            <span aria-hidden="true">
              <NexusAdministrationIcon name="shield" />
            </span>
            <div>
              <h3>Role &amp; Akses</h3>
              <p>Ringkasan peran utama yang berlaku untuk akun ini.</p>
            </div>
          </header>
          <div className={styles.roleSummary}>
            <div>
              <span>Role saat ini</span>
              <strong>{role?.label ?? "Belum ditetapkan"}</strong>
              <p>
                {role?.description ??
                  "Role perlu ditetapkan sebelum akun dapat memakai ruang kerja."}
              </p>
            </div>
            {role ? (
              <ul aria-label="Ringkasan cakupan akses">
                {role.accessSummary.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
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
            {account.status === "ACTIVE" ? (
              <>
                {capabilities.canManageAccess ? (
                  <NexusWorkspaceButton onClick={onEditAccess} type="button">
                    Ubah akses
                  </NexusWorkspaceButton>
                ) : null}
                {capabilities.canManageAccountStatus ? (
                  <NexusWorkspaceButton
                    onClick={onSuspend}
                    tone="danger"
                    type="button"
                  >
                    Tangguhkan akses
                  </NexusWorkspaceButton>
                ) : null}
              </>
            ) : null}

            {account.status === "INVITED" ? (
              <>
                {capabilities.canInviteAccount ? (
                  <NexusWorkspaceButton
                    onClick={onRefreshInvitation}
                    type="button"
                  >
                    Perbarui undangan
                  </NexusWorkspaceButton>
                ) : null}
                {capabilities.canManageAccountStatus ? (
                  <NexusWorkspaceButton
                    onClick={onCancelInvitation}
                    tone="danger"
                    type="button"
                  >
                    Batalkan undangan
                  </NexusWorkspaceButton>
                ) : null}
              </>
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
          <p className={styles.auditBoundary}>
            Pastikan peran dan status akun sesuai kebutuhan pengguna sebelum
            menyimpan perubahan.
          </p>
        </section>
      </div>
    </NexusWorkspaceDrawer>
  );
}
