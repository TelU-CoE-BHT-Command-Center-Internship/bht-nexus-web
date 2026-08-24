"use client";

import Link from "next/link";
import type { KeyboardEvent } from "react";
import type { NexusMemberCapabilities } from "@/components/nexus-dashboard-shell/nexus-workspace-access";
import { relatedDataHref } from "@/components/nexus-members/nexus-member-identity";
import {
  accountStatusLabels,
  displayMemberDate,
  displayMemberValue,
  MemberAvatar,
  MemberDetailCard,
  MemberGuidanceCard,
  MemberIcon,
  memberStatusTone,
} from "@/components/nexus-members/nexus-member-ui";
import styles from "@/components/nexus-members/nexus-members.module.css";
import type { NexusMemberRecord } from "@/components/nexus-members/nexus-members-content";
import { statusLabels } from "@/components/nexus-members/nexus-members-model";
import {
  NexusWorkspaceButton,
  NexusWorkspaceLinkButton,
} from "@/components/nexus-workspace-ui/nexus-workspace-elements";

export type MemberDetailTab =
  | "access"
  | "academic"
  | "membership"
  | "profile"
  | "related";

const detailTabs: { id: MemberDetailTab; label: string }[] = [
  { id: "profile", label: "Profil" },
  { id: "membership", label: "Keanggotaan CoE" },
  { id: "academic", label: "Identitas Akademik" },
  { id: "related", label: "Data Terkait" },
  { id: "access", label: "Akses BHT Nexus" },
];

const relatedCatalogs = [
  {
    description: "Karya ilmiah resmi yang mencantumkan anggota ini.",
    href: "/nexus/publikasi",
    label: "Publikasi",
  },
  {
    description: "Hak cipta dan paten yang mencantumkan anggota ini.",
    href: "/nexus/kekayaan-intelektual",
    label: "Kekayaan Intelektual",
  },
  {
    description: "Kontrak dan proposal yang melibatkan anggota ini.",
    href: "/nexus/kontrak-proposal",
    label: "Kontrak & Proposal",
  },
  {
    description: "Bimbingan dan rekam akademik anggota ini.",
    href: "/nexus/akademik",
    label: "Akademik",
  },
  {
    description: "Kegiatan dan pengabdian yang melibatkan anggota ini.",
    href: "/nexus/kegiatan",
    label: "Kegiatan & Pengabdian",
  },
] as const;

type MemberDetailProps = {
  activeTab: MemberDetailTab;
  capabilities: NexusMemberCapabilities;
  member: NexusMemberRecord;
  onBack: () => void;
  onEdit: () => void;
  onGrantAccess: () => void;
  onOpenAcademicEditor: () => void;
  onTabChange: (tab: MemberDetailTab) => void;
};

function AcademicLink({ href, label }: { href?: string; label: string }) {
  if (!href) return <>{displayMemberValue()}</>;
  return (
    <a href={href} rel="noreferrer" target="_blank">
      {label}
    </a>
  );
}

export function NexusMemberDetail({
  activeTab,
  capabilities,
  member,
  onBack,
  onEdit,
  onGrantAccess,
  onOpenAcademicEditor,
  onTabChange,
}: MemberDetailProps) {
  const collectionRequests: { href: string; label: string; source: string }[] =
    [];

  if (member.academic.sintaId) {
    collectionRequests.push({
      href: `/nexus/pengumpulan?member=${encodeURIComponent(member.id)}&name=${encodeURIComponent(member.name)}&source=sinta&profile=${encodeURIComponent(`https://sinta.kemdiktisaintek.go.id/authors/profile/${member.academic.sintaId}`)}`,
      label: "Mulai dari SINTA",
      source: "sinta",
    });
  }

  if (member.academic.googleScholar) {
    collectionRequests.push({
      href: `/nexus/pengumpulan?member=${encodeURIComponent(member.id)}&name=${encodeURIComponent(member.name)}&source=scholar&profile=${encodeURIComponent(member.academic.googleScholar)}`,
      label: "Mulai dari Google Scholar",
      source: "scholar",
    });
  }

  function moveTab(
    event: KeyboardEvent<HTMLButtonElement>,
    currentIndex: number,
  ) {
    let nextIndex: number | null = null;
    if (event.key === "Home") nextIndex = 0;
    if (event.key === "End") nextIndex = detailTabs.length - 1;
    if (event.key === "ArrowRight") {
      nextIndex = (currentIndex + 1) % detailTabs.length;
    }
    if (event.key === "ArrowLeft") {
      nextIndex = (currentIndex - 1 + detailTabs.length) % detailTabs.length;
    }
    if (nextIndex === null) return;

    event.preventDefault();
    const nextTab = detailTabs[nextIndex];
    if (!nextTab) return;
    onTabChange(nextTab.id);
    event.currentTarget.parentElement
      ?.querySelectorAll<HTMLButtonElement>('[role="tab"]')
      [nextIndex]?.focus();
  }

  return (
    <article className={styles.detail}>
      <div className={styles.detailToolbar}>
        <button className={styles.backButton} onClick={onBack} type="button">
          <MemberIcon name="arrow" />
          Kembali ke daftar
        </button>
        <div className={styles.detailActions}>
          {capabilities.canEditMember ? (
            <NexusWorkspaceButton
              className={styles.detailActionButton}
              onClick={onEdit}
              type="button"
            >
              <MemberIcon name="edit" />
              Ubah profil
            </NexusWorkspaceButton>
          ) : null}
          {capabilities.canGrantAccess && !member.account ? (
            <NexusWorkspaceButton
              className={styles.detailActionButton}
              onClick={onGrantAccess}
              tone="primary"
              type="button"
            >
              <MemberIcon name="lock" />
              Beri akses BHT Nexus
            </NexusWorkspaceButton>
          ) : null}
        </div>
      </div>

      <header className={styles.profileHero}>
        <MemberAvatar member={member} />
        <div className={styles.profileIdentity}>
          <h2>{member.name}</h2>
          <strong>{member.affiliation.primaryUnit}</strong>
          <p>{member.coeAssignment}</p>
          <div className={styles.contactLine}>
            {member.contact.institutionalEmail ? (
              <a href={`mailto:${member.contact.institutionalEmail}`}>
                <MemberIcon name="email" />
                {member.contact.institutionalEmail}
              </a>
            ) : (
              <span>
                <MemberIcon name="email" /> Email personal belum tercatat
              </span>
            )}
            <span>
              <MemberIcon name="phone" />
              {displayMemberValue(member.contact.phone)}
            </span>
            <span>
              <MemberIcon name="location" />
              {displayMemberValue(member.affiliation.office)}
            </span>
          </div>
        </div>
        <dl className={styles.membershipSummary}>
          <div>
            <dt>Status keanggotaan</dt>
            <dd>
              <span
                className={styles.statusBadge}
                data-tone={memberStatusTone(member.membership.status)}
              >
                {statusLabels[member.membership.status]}
              </span>
            </dd>
          </div>
          <div>
            <dt>Bergabung sejak</dt>
            <dd>{displayMemberDate(member.membership.joinedAt)}</dd>
          </div>
          <div>
            <dt>ID anggota</dt>
            <dd>{member.id}</dd>
          </div>
        </dl>
      </header>

      <span className={styles.visuallyHidden} id="member-tabs-instructions">
        Gunakan tombol panah kiri dan kanan untuk berpindah tab. Gunakan Home
        untuk tab pertama dan End untuk tab terakhir.
      </span>
      <div
        aria-describedby="member-tabs-instructions"
        aria-label="Rincian anggota"
        aria-orientation="horizontal"
        className={styles.detailTabs}
        role="tablist"
      >
        {detailTabs.map((tab, index) => (
          <button
            aria-controls={`member-panel-${tab.id}`}
            aria-keyshortcuts="ArrowLeft ArrowRight Home End"
            aria-selected={activeTab === tab.id}
            id={`member-tab-${tab.id}`}
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            onKeyDown={(event) => moveTab(event, index)}
            role="tab"
            tabIndex={activeTab === tab.id ? 0 : -1}
            type="button"
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div
        aria-labelledby={`member-tab-${activeTab}`}
        className={styles.detailPanel}
        id={`member-panel-${activeTab}`}
        role="tabpanel"
      >
        {activeTab === "profile" ? (
          <div className={styles.cardGrid}>
            <MemberDetailCard
              items={[
                { label: "Nama lengkap", value: member.name },
                {
                  label: "Nama panggilan",
                  value: member.identity.preferredName,
                },
                {
                  label: "Email institusi personal",
                  value: member.contact.institutionalEmail,
                },
                {
                  label: "Email alternatif",
                  value: member.contact.alternateEmail,
                },
                { label: "Nomor HP", value: member.contact.phone },
              ]}
              title="Informasi umum"
            />
            <MemberDetailCard
              items={[
                { label: "Institusi", value: member.affiliation.institution },
                { label: "Unit utama", value: member.affiliation.primaryUnit },
                { label: "Penugasan CoE", value: member.coeAssignment },
                { label: "Lokasi kerja", value: member.affiliation.office },
              ]}
              title="Afiliasi & unit"
            />
            <MemberDetailCard
              items={[
                { label: "Bidang utama", value: member.expertise.primary },
                {
                  label: "Bidang lain",
                  value:
                    member.expertise.secondary.length > 0 ? (
                      <span className={styles.tagList}>
                        {member.expertise.secondary.map((item) => (
                          <span key={item}>{item}</span>
                        ))}
                      </span>
                    ) : undefined,
                },
                { label: "Ringkasan profil", value: member.biography },
              ]}
              title="Bidang keahlian"
              wide
            />
          </div>
        ) : null}

        {activeTab === "membership" ? (
          <div className={styles.cardGrid}>
            <MemberDetailCard
              items={[
                { label: "ID anggota", value: member.id },
                {
                  label: "Status",
                  value: statusLabels[member.membership.status],
                },
                {
                  label: "Bergabung sejak",
                  value: displayMemberDate(member.membership.joinedAt),
                },
                {
                  label: "Profil publik",
                  value: member.membership.publicProfile
                    ? "Diizinkan tampil"
                    : "Disembunyikan",
                },
              ]}
              title="Keanggotaan"
            />
            <MemberDetailCard
              items={[
                { label: "Institusi", value: member.affiliation.institution },
                { label: "Unit utama", value: member.affiliation.primaryUnit },
                { label: "Penugasan", value: member.coeAssignment },
              ]}
              title="Penempatan organisasi"
            />
          </div>
        ) : null}

        {activeTab === "academic" ? (
          <section className={styles.accessSection}>
            <MemberDetailCard
              items={[
                { label: "SINTA ID", value: member.academic.sintaId },
                {
                  label: "ORCID iD",
                  value: member.academic.orcid ? (
                    <AcademicLink
                      href={`https://orcid.org/${member.academic.orcid}`}
                      label={member.academic.orcid}
                    />
                  ) : undefined,
                },
                {
                  label: "Google Scholar",
                  value: member.academic.googleScholar ? (
                    <AcademicLink
                      href={member.academic.googleScholar}
                      label="Buka profil"
                    />
                  ) : undefined,
                },
                {
                  label: "Scopus Author ID",
                  value: member.academic.scopusAuthorId,
                },
                { label: "ResearcherID", value: member.academic.researcherId },
              ]}
              title="Identitas akademik & riset"
              wide
            />
            <MemberGuidanceCard
              action={
                collectionRequests.length > 0 ? (
                  collectionRequests.map((request) => (
                    <NexusWorkspaceLinkButton
                      href={request.href}
                      key={request.source}
                      tone={
                        request.source === "sinta" ? "primary" : "secondary"
                      }
                    >
                      {request.label}
                      <MemberIcon name="chevron" />
                    </NexusWorkspaceLinkButton>
                  ))
                ) : capabilities.canEditMember ? (
                  <NexusWorkspaceButton
                    onClick={onOpenAcademicEditor}
                    type="button"
                  >
                    Lengkapi identitas akademik
                  </NexusWorkspaceButton>
                ) : (
                  <small>Identitas akademik belum tersedia.</small>
                )
              }
              description="Pilih SINTA atau Google Scholar yang sudah tercatat untuk mencari karya ilmiah anggota ini."
              icon="download"
              title="Kumpulkan data akademik"
            />
          </section>
        ) : null}

        {activeTab === "related" ? (
          <section className={styles.relatedSection}>
            <div>
              <h3>Data resmi yang terkait dengan anggota</h3>
              <p>
                Pilih katalog untuk melihat data resmi yang terhubung langsung
                ke profil anggota ini.
              </p>
            </div>
            <div className={styles.relatedGrid}>
              {relatedCatalogs.map((catalog) => (
                <Link
                  href={relatedDataHref(catalog.href, member.id)}
                  key={catalog.href}
                >
                  <span>{catalog.label}</span>
                  <small>{catalog.description}</small>
                  <strong>
                    Buka data terkait <MemberIcon name="chevron" />
                  </strong>
                </Link>
              ))}
            </div>
          </section>
        ) : null}

        {activeTab === "access" ? (
          <section className={styles.accessSection}>
            {member.account ? (
              <>
                <div className={styles.cardGrid}>
                  <MemberDetailCard
                    items={[
                      { label: "Email akun", value: member.account.email },
                      {
                        label: "Status akun",
                        value: accountStatusLabels[member.account.status],
                      },
                      {
                        label: "Hubungan profil",
                        value: "Terhubung ke anggota ini",
                      },
                    ]}
                    title="Akun BHT Nexus"
                  />
                  <MemberDetailCard
                    items={[
                      {
                        label: "Role akun",
                        value:
                          member.account.roleLabels.join(", ") ||
                          "Belum ditetapkan",
                      },
                      {
                        label: "Hak akses",
                        value: "Mengikuti role dan izin akun",
                      },
                    ]}
                    title="Ringkasan akses"
                  />
                </div>
                <MemberGuidanceCard
                  description="Menangguhkan akun tidak menghapus profil atau riwayat keanggotaan orang ini."
                  icon="link"
                  title="Akun terhubung ke profil anggota"
                />
              </>
            ) : (
              <div className={styles.accessEmpty}>
                <span aria-hidden="true">
                  <MemberIcon name="lock" />
                </span>
                <h3>Belum memiliki akses BHT Nexus</h3>
                <p>
                  Anggota tetap dapat dicatat tanpa akun. Berikan akses hanya
                  jika orang ini memang perlu masuk ke sistem.
                </p>
                {capabilities.canGrantAccess ? (
                  <NexusWorkspaceButton
                    onClick={onGrantAccess}
                    tone="primary"
                    type="button"
                  >
                    Beri akses BHT Nexus
                  </NexusWorkspaceButton>
                ) : null}
                <small>
                  Sistem akan memeriksa apakah email belum punya akun, sudah
                  punya akun, atau sudah terhubung ke anggota lain.
                </small>
              </div>
            )}
          </section>
        ) : null}
      </div>

      {member.updatedAt ? (
        <footer className={styles.updatedMeta}>
          <MemberIcon name="calendar" />
          Terakhir diperbarui: {member.updatedAt}
        </footer>
      ) : null}
    </article>
  );
}
