"use client";

import { type ReactNode, useEffect, useState } from "react";
import { nexusAccountStatusLabels } from "@/components/nexus-accounts/nexus-account-directory";
import { nexusWorkspaceHasListedPage } from "@/components/nexus-dashboard-shell/nexus-dashboard-shell-content";
import { nexusWorkspaceAccessFromPermissions } from "@/components/nexus-dashboard-shell/nexus-workspace-access";
import { NexusAcademicIdentifierValue } from "@/components/nexus-members/nexus-member-academic";
import styles from "@/components/nexus-profile/nexus-profile.module.css";
import {
  NexusProfileAcademicForm,
  NexusProfilePasswordForm,
  NexusProfilePersonalForm,
} from "@/components/nexus-profile/nexus-profile-forms";
import { NexusProfileIcon } from "@/components/nexus-profile/nexus-profile-icons";
import {
  type NexusSession,
  nexusSessionInitials,
} from "@/components/nexus-session/nexus-session-model";
import { useNexusSession } from "@/components/nexus-session/nexus-session-provider";
import { NexusWorkspaceButton } from "@/components/nexus-workspace-ui/nexus-workspace-elements";
import { NexusWorkspacePage } from "@/components/nexus-workspace-ui/nexus-workspace-page";

export type NexusProfileContent = {
  description: string;
  title: string;
};

type OpenForm = "academic" | "password" | "personal" | null;

function displayValue(value?: string) {
  return value?.trim() || "Belum tercatat";
}

function displayDate(value?: string) {
  if (!value) return "Belum tercatat";
  if (!/^\d{4}-\d{2}-\d{2}/.test(value)) return value;
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(`${value.slice(0, 10)}T00:00:00`));
}

function accountStatusTone(status: NexusSession["account"]["status"]) {
  if (status === "ACTIVE") return "positive";
  if (status === "INVITED") return "warning";
  return "danger";
}

function membershipStatusLabel(status: "active" | "inactive" | "on_leave") {
  if (status === "active") return "Aktif";
  if (status === "on_leave") return "Cuti";
  return "Nonaktif";
}

/** Nilai Google Scholar dari layanan berupa ID profil, bukan alamat lengkap. */
function googleScholarProfileUrl(value?: string) {
  const trimmed = value?.trim();
  if (!trimmed) return undefined;
  return /^https?:\/\//.test(trimmed)
    ? trimmed
    : `https://scholar.google.com/citations?user=${encodeURIComponent(trimmed)}`;
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

/** Tombol ubah menyebut bagian yang disunting pada nama aksesibelnya. */
function EditAction({
  onClick,
  section,
}: {
  onClick: () => void;
  section: string;
}) {
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

/**
 * Profil Saya menampilkan akun yang benar-benar sedang masuk. Informasi
 * pribadi disimpan pada akun, pengenal akademik pada rekam anggota yang
 * tertaut, sedangkan email masuk, peran, status, keanggotaan, dan klaster
 * hanya dibaca karena dikelola pengelola BHT Nexus.
 */
export function NexusProfile({ content }: { content: NexusProfileContent }) {
  const { refresh, session } = useNexusSession();
  const [openForm, setOpenForm] = useState<OpenForm>(null);
  const [announcement, setAnnouncement] = useState("");
  const { account, member } = session;

  useEffect(() => {
    if (!announcement) return;
    const timeoutId = window.setTimeout(() => setAnnouncement(""), 6000);
    return () => window.clearTimeout(timeoutId);
  }, [announcement]);

  async function finishSave(message: string) {
    setOpenForm(null);
    setAnnouncement(message);
    await refresh().catch(() =>
      setAnnouncement(
        `${message} Muat ulang halaman bila perubahan belum tampil.`,
      ),
    );
  }

  const roleLabels = session.roles.map((role) => role.label);
  const hasWorkspacePage = nexusWorkspaceHasListedPage(
    nexusWorkspaceAccessFromPermissions(session.permissions),
  );
  const phoneMissing = !account.phone.trim();

  return (
    <NexusWorkspacePage
      description={content.description}
      descriptionId="profile-page-description"
      title={content.title}
      titleId="profile-page-title"
    >
      <div className={styles.layout}>
        {phoneMissing ? (
          <section className={styles.notice}>
            <span aria-hidden="true" className={styles.noticeIcon}>
              <NexusProfileIcon name="alert" />
            </span>
            <div className={styles.noticeCopy}>
              <strong>Profil belum lengkap</strong>
              <p>
                Nomor HP belum diisi. Lengkapi agar rekan CoE dapat menghubungi
                Anda.
              </p>
            </div>
            <NexusWorkspaceButton
              className={styles.cardAction}
              onClick={() => setOpenForm("personal")}
              tone="primary"
              type="button"
            >
              Lengkapi profil
            </NexusWorkspaceButton>
          </section>
        ) : null}

        {roleLabels.length === 0 ? (
          <section className={styles.notice}>
            <span aria-hidden="true" className={styles.noticeIcon}>
              <NexusProfileIcon name="alert" />
            </span>
            <div className={styles.noticeCopy}>
              <strong>Akun belum memiliki peran</strong>
              <p>
                Belum ada halaman kerja yang dapat dibuka dengan akun ini.
                Hubungi pengelola Administrasi untuk menetapkan peran.
              </p>
            </div>
          </section>
        ) : !hasWorkspacePage ? (
          <section className={styles.notice}>
            <span aria-hidden="true" className={styles.noticeIcon}>
              <NexusProfileIcon name="alert" />
            </span>
            <div className={styles.noticeCopy}>
              <strong>Belum ada halaman kerja untuk peran ini</strong>
              <p>
                Peran {roleLabels.join(", ")} belum membuka halaman kerja selain
                Profil Saya. Hubungi pengelola Administrasi bila Anda memerlukan
                akses.
              </p>
            </div>
          </section>
        ) : null}

        <div className={styles.shell}>
          <h3 className={styles.shellTitle}>Profil BHT Nexus</h3>
          <div className={styles.cards}>
            <section className={styles.card}>
              <div className={styles.hero}>
                <div className={styles.heroIdentity}>
                  <span aria-hidden="true" className={styles.avatar}>
                    {nexusSessionInitials(session)}
                  </span>
                  <div className={styles.heroCopy}>
                    <h4>{displayValue(account.name)}</h4>
                    <p className={styles.heroMeta}>
                      <span>
                        {roleLabels.length > 0
                          ? roleLabels.join(", ")
                          : "Belum ada peran"}
                      </span>
                      <span aria-hidden="true" className={styles.heroDivider} />
                      <span>
                        {member
                          ? "Anggota CoE BHT"
                          : "Tidak terhubung ke anggota"}
                      </span>
                    </p>
                  </div>
                </div>
                <EditAction
                  onClick={() => setOpenForm("personal")}
                  section="informasi pribadi"
                />
              </div>

              <dl className={styles.infoGrid}>
                <InfoItem label="Nama lengkap">
                  {displayValue(account.name)}
                </InfoItem>
                <InfoItem label="Nomor HP">
                  {displayValue(account.phone)}
                </InfoItem>
                <InfoItem label="Ringkasan profil" wide>
                  {displayValue(account.bio)}
                </InfoItem>
              </dl>
            </section>

            <section className={styles.card}>
              <div className={styles.cardHead}>
                <div>
                  <h4>Akun BHT Nexus</h4>
                  <p>
                    Email masuk, peran, status akun, dan hubungan anggota
                    dikelola melalui Administrasi.
                  </p>
                </div>
              </div>
              <dl className={styles.infoGrid} data-columns="2">
                <InfoItem label="Email masuk">{account.email}</InfoItem>
                <InfoItem label="Peran">
                  {roleLabels.length > 0 ? (
                    <span className={styles.tags}>
                      {roleLabels.map((label) => (
                        <span className={styles.tag} key={label}>
                          {label}
                        </span>
                      ))}
                    </span>
                  ) : (
                    "Belum ada peran"
                  )}
                </InfoItem>
                <InfoItem label="Status akun">
                  <span
                    className={styles.badge}
                    data-tone={accountStatusTone(account.status)}
                  >
                    {nexusAccountStatusLabels[account.status]}
                  </span>
                </InfoItem>
                <InfoItem label="Verifikasi email">
                  <span
                    className={styles.badge}
                    data-tone={account.emailVerified ? "positive" : "warning"}
                  >
                    {account.emailVerified
                      ? "Terverifikasi"
                      : "Belum terverifikasi"}
                  </span>
                </InfoItem>
                <InfoItem label="Hubungan anggota" wide>
                  {member
                    ? `Terhubung ke profil anggota ${member.name}`
                    : "Tidak terhubung ke profil anggota"}
                </InfoItem>
              </dl>
            </section>

            {member ? (
              <>
                <section className={styles.card}>
                  <div className={styles.cardHead}>
                    <div>
                      <h4>Keanggotaan &amp; Klaster</h4>
                      <p>
                        Informasi keanggotaan dan klaster riset dikelola oleh
                        pengelola BHT Nexus.
                      </p>
                    </div>
                  </div>
                  <dl className={styles.infoGrid} data-columns="2">
                    <InfoItem label="Nama anggota">{member.name}</InfoItem>
                    <InfoItem label="Status keanggotaan">
                      {membershipStatusLabel(member.status)}
                    </InfoItem>
                    <InfoItem label="Klaster riset">
                      {member.cluster?.name ?? "Belum ditetapkan"}
                    </InfoItem>
                    <InfoItem label="Bergabung sejak">
                      {displayDate(member.joinedAt)}
                    </InfoItem>
                    <InfoItem label="Profil publik">
                      <span
                        className={styles.badge}
                        data-tone={
                          member.publicProfile ? "positive" : "neutral"
                        }
                      >
                        {member.publicProfile
                          ? "Ditampilkan"
                          : "Tidak ditampilkan"}
                      </span>
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
                      onClick={() => setOpenForm("academic")}
                      section="identitas akademik"
                    />
                  </div>
                  <dl className={styles.infoGrid} data-columns="2">
                    <InfoItem label="SINTA ID">
                      <NexusAcademicIdentifierValue
                        identifier="sintaId"
                        value={member.academic.sintaId}
                      />
                    </InfoItem>
                    <InfoItem label="Scopus Author ID">
                      <NexusAcademicIdentifierValue
                        identifier="scopusAuthorId"
                        value={member.academic.scopusAuthorId}
                      />
                    </InfoItem>
                    <InfoItem label="Google Scholar">
                      <NexusAcademicIdentifierValue
                        identifier="googleScholar"
                        value={googleScholarProfileUrl(
                          member.academic.googleScholar,
                        )}
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
                      Ganti kata sandi secara berkala. Sesi pada perangkat lain
                      diakhiri setelah kata sandi diganti.
                    </p>
                  </div>
                  <NexusWorkspaceButton
                    className={styles.cardAction}
                    onClick={() => setOpenForm("password")}
                    type="button"
                  >
                    Ubah kata sandi
                  </NexusWorkspaceButton>
                </div>
              </div>
            </section>
          </div>
        </div>

        <output aria-live="polite" className={styles.announcement}>
          {announcement}
        </output>
      </div>

      {openForm === "personal" ? (
        <NexusProfilePersonalForm
          onClose={() => setOpenForm(null)}
          onSaved={() => finishSave("Informasi pribadi berhasil disimpan.")}
          session={session}
        />
      ) : null}

      {openForm === "academic" && member ? (
        <NexusProfileAcademicForm
          onClose={() => setOpenForm(null)}
          onSaved={() => finishSave("Identitas akademik berhasil disimpan.")}
          session={session}
        />
      ) : null}

      {openForm === "password" ? (
        <NexusProfilePasswordForm
          email={account.email}
          onClose={() => setOpenForm(null)}
          onSaved={() =>
            finishSave(
              "Kata sandi berhasil diganti. Sesi pada perangkat lain sudah diakhiri.",
            )
          }
        />
      ) : null}
    </NexusWorkspacePage>
  );
}
