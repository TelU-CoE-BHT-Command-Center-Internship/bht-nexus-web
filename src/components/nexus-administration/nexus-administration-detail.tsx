"use client";

import styles from "@/components/nexus-administration/nexus-administration.module.css";
import {
  accountStatusLabels,
  type NexusAdministrationAccount,
  type NexusAdministrationRole,
} from "@/components/nexus-administration/nexus-administration-content";
import { NexusAdministrationIcon } from "@/components/nexus-administration/nexus-administration-icons";
import type { NexusAdministrationCapabilities } from "@/components/nexus-dashboard-shell/nexus-workspace-access";
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
  onResendInvitation: () => void;
  onRestore: () => void;
  onSuspend: () => void;
  role?: NexusAdministrationRole;
};

function statusTone(status: NexusAdministrationAccount["status"]) {
  if (status === "ACTIVE") return "positive";
  if (status === "INVITED") return "warning";
  return "danger";
}

export function NexusAdministrationDetail({
  account,
  capabilities,
  onCancelInvitation,
  onClose,
  onEditAccess,
  onResendInvitation,
  onRestore,
  onSuspend,
  role,
}: NexusAdministrationDetailProps) {
  return (
    <NexusWorkspaceDrawer
      closeLabel="Tutup detail akun"
      description="Tinjau identitas akun, hubungan anggota, role tingkat tinggi, dan tindakan yang tersedia."
      eyebrow="Accounts & Access"
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
              <dt>Jenis akun</dt>
              <dd>
                {account.accountKind === "operational"
                  ? "Akun operasional"
                  : "Pengguna individual"}
              </dd>
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
          {account.member ? (
            <div className={styles.relationCard} data-linked="true">
              <div>
                <span>{account.member.id}</span>
                <strong>{account.member.name}</strong>
                <small>{account.member.assignment}</small>
              </div>
              <NexusWorkspaceLinkButton href="/nexus/anggota">
                Buka Anggota
              </NexusWorkspaceLinkButton>
            </div>
          ) : (
            <div className={styles.relationCard}>
              <div>
                <span>Tidak terhubung</span>
                <strong>Akun non-anggota</strong>
                <small>
                  Keadaan ini valid untuk operator, reviewer, administrator,
                  intern, atau akun operasional.
                </small>
              </div>
              <NexusWorkspaceLinkButton href="/nexus/anggota">
                Buka Anggota
              </NexusWorkspaceLinkButton>
            </div>
          )}
        </section>

        <section className={styles.detailSection}>
          <header>
            <span aria-hidden="true">
              <NexusAdministrationIcon name="shield" />
            </span>
            <div>
              <h3>Role &amp; Akses</h3>
              <p>
                Ringkasan ini bukan matriks permission dan tidak menggantikan
                pemeriksaan server.
              </p>
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
                    onClick={onResendInvitation}
                    type="button"
                  >
                    Kirim ulang undangan
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
            Perubahan final wajib diterapkan dan dicatat oleh layanan server.
          </p>
        </section>
      </div>
    </NexusWorkspaceDrawer>
  );
}
