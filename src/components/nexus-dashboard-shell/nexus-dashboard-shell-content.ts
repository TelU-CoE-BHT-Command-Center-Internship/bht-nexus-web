import type { ImageProps } from "next/image";
import {
  type NexusWorkspaceAccess,
  type NexusWorkspaceNavigationId,
  nexusWorkspaceCanOpen,
} from "@/components/nexus-dashboard-shell/nexus-workspace-access";
import type { NexusMemberAvatarPosition } from "@/components/nexus-members/nexus-member-avatar";
import { nexusMonitoringRoutes } from "@/components/nexus-monitoring/nexus-monitoring-evaluation";
import type { NexusReviewCapabilities } from "@/components/nexus-review-session/nexus-review-session";
import {
  type NexusSession,
  nexusSessionInitials,
  nexusSessionRoleLabel,
} from "@/components/nexus-session/nexus-session-model";
import { COE_BHT_LINKS } from "@/content/coe-bht";
import type { Locale } from "@/i18n/locales";

export type DashboardShellIconName =
  | "academic"
  | "activities"
  | "administration"
  | "broadcast"
  | "contracts"
  | "dashboard"
  | "documents"
  | "intellectualProperty"
  | "members"
  | "monitoring"
  | "publications"
  | "reviews"
  | "search";

export type DashboardNavigationItem = {
  activeHrefs: string[];
  /** Menandai route yang sudah dibangun, bukan izin akses pengguna. */
  implemented: boolean;
  href: string;
  icon: DashboardShellIconName;
  id: NexusWorkspaceNavigationId;
  label: string;
};

export type DashboardNavigationGroup = {
  id: string;
  items: DashboardNavigationItem[];
  label: string;
};
export type DashboardNotification = {
  detail: string;
  href: string;
  id: string;
  timeLabel: string;
  title: string;
};
export type DashboardViewer = {
  avatarPosition?: NexusMemberAvatarPosition;
  avatarSrc?: ImageProps["src"];
  email: string;
  fullName: string;
  id: string;
  initials: string;
  name: string;
  roleLabel: string;
};
export type DashboardSearchItem = {
  description: string;
  href: string;
  id: string;
  label: string;
};

export type NexusDashboardShellContent = {
  accessDeniedDescription: string;
  accessDeniedEyebrow: string;
  accessDeniedReturnLabel: string;
  accessDeniedTitle: string;
  brandInstitutionLabel: string;
  brandLabel: string;
  brandOrganizationLabel: string;
  closeMenuLabel: string;
  collapseMenuLabel: string;
  defaultPageTitle: string;
  expandMenuLabel: string;
  helpHref: string;
  helpLabel: string;
  homeHref: string;
  /** Tujuan pemindah bahasa; bahasa aktif tetap pada halaman yang sama. */
  languageHomeHrefs: Record<Locale, string>;
  languageLabel: string;
  locale: Locale;
  mainNavigationLabel: string;
  navigationGroups: DashboardNavigationGroup[];
  reviewCapabilities: NexusReviewCapabilities;
  routeAccess: Array<{
    activeHrefs: string[];
    allowed: boolean;
    implemented: boolean;
    label: string;
  }>;
  notificationLabel: string;
  notifications: DashboardNotification[];
  notificationsEmptyLabel: string;
  notificationsTitle: string;
  openMenuLabel: string;
  plannedBadgeLabel: string;
  plannedFeatureLabel: string;
  /** Tujuan Profil Saya; kosong pada ruang kerja yang belum memilikinya. */
  profileHref?: string;
  profileLabel: string;
  profileMenuLabel: string;
  searchEmptyLabel: string;
  searchItems: DashboardSearchItem[];
  searchLabel: string;
  searchPlaceholder: string;
  signOutErrorLabel: string;
  signOutLabel: string;
  signingOutLabel: string;
  supportDescription: string;
  supportHref: string;
  supportTitle: string;
  viewer: DashboardViewer;
};

type NavigationGroupId = "administration" | "main" | "official" | "pipeline";

type NavigationDefinition = {
  activeHrefs?: Record<Locale, string[]>;
  implemented: Record<Locale, boolean>;
  group: NavigationGroupId;
  href: Record<Locale, string>;
  icon: DashboardShellIconName;
  id: NexusWorkspaceNavigationId;
  label: Record<Locale, string>;
  /**
   * Halaman yang dibangun tetapi sengaja tidak ditawarkan di navigasi. Alamatnya
   * tetap dapat dibuka langsung oleh akun bersesi dan tidak pernah menjadi
   * tujuan bawaan setelah masuk.
   */
  listed: boolean;
};

/**
 * Alur data BHT Nexus: Pengumpulan dan Dokumen memasok kandidat, Tinjauan
 * memutuskan, lalu hasilnya mendarat pada satu rumah data resmi.
 *
 * Grup `official` dipetakan satu-per-satu dari kategori kandidat di Tinjauan
 * sehingga setiap keputusan reviewer selalu punya tujuan yang jelas. Publikasi,
 * Kekayaan Intelektual, Kontrak & Proposal, Akademik, serta Kegiatan &
 * Pengabdian sudah dibangun; sisanya ditandai belum tersedia agar strukturnya
 * terbaca tanpa membuat halaman kosong.
 */
const navigationDefinitions: NavigationDefinition[] = [
  {
    implemented: { en: false, id: true },
    group: "main",
    href: { en: "/en/nexus", id: "/nexus/dashboard" },
    icon: "dashboard",
    id: "dashboard",
    label: { en: "Dashboard", id: "Dashboard" },
    listed: false,
  },
  {
    activeHrefs: {
      en: ["/en/nexus/monitoring"],
      id: [...nexusMonitoringRoutes],
    },
    implemented: { en: false, id: true },
    group: "main",
    href: { en: "/en/nexus/monitoring", id: "/nexus/monitoring" },
    icon: "monitoring",
    id: "monitoring",
    label: { en: "KM Monitoring", id: "Monitoring KM" },
    listed: true,
  },
  {
    implemented: { en: false, id: true },
    group: "main",
    href: { en: "/en/nexus/broadcast", id: "/nexus/broadcast" },
    icon: "broadcast",
    id: "broadcast",
    label: { en: "Broadcast / Newsletter", id: "Broadcast / Newsletter" },
    listed: true,
  },
  {
    implemented: { en: false, id: true },
    group: "pipeline",
    href: { en: "/en/nexus/collection", id: "/nexus/pengumpulan" },
    icon: "search",
    id: "collection",
    label: { en: "Collection", id: "Pengumpulan" },
    listed: true,
  },
  {
    activeHrefs: {
      en: [
        "/en/nexus/documents",
        "/en/nexus/ask-documents",
        "/en/nexus/extraction",
      ],
      id: ["/nexus/dokumen", "/nexus/tanya-dokumen", "/nexus/ekstraksi"],
    },
    implemented: { en: false, id: true },
    group: "pipeline",
    href: { en: "/en/nexus/documents", id: "/nexus/dokumen" },
    icon: "documents",
    id: "documents",
    label: { en: "Documents", id: "Dokumen" },
    listed: true,
  },
  {
    implemented: { en: false, id: true },
    group: "pipeline",
    href: { en: "/en/nexus/reviews", id: "/nexus/tinjauan" },
    icon: "reviews",
    id: "reviews",
    label: { en: "Reviews", id: "Tinjauan" },
    listed: true,
  },
  {
    activeHrefs: {
      en: ["/en/nexus/publications"],
      id: ["/nexus/publikasi", "/nexus/ajukan/publikasi"],
    },
    implemented: { en: false, id: true },
    group: "official",
    href: { en: "/en/nexus/publications", id: "/nexus/publikasi" },
    icon: "publications",
    id: "publications",
    label: { en: "Publications", id: "Publikasi" },
    listed: true,
  },
  {
    activeHrefs: {
      en: ["/en/nexus/intellectual-property"],
      id: ["/nexus/kekayaan-intelektual", "/nexus/ajukan/kekayaan-intelektual"],
    },
    implemented: { en: false, id: true },
    group: "official",
    href: {
      en: "/en/nexus/intellectual-property",
      id: "/nexus/kekayaan-intelektual",
    },
    icon: "intellectualProperty",
    id: "intellectual-property",
    label: {
      en: "Intellectual Property",
      id: "Kekayaan Intelektual",
    },
    listed: true,
  },
  {
    activeHrefs: {
      en: ["/en/nexus/contracts"],
      id: ["/nexus/kontrak-proposal", "/nexus/ajukan/kontrak-proposal"],
    },
    implemented: { en: false, id: true },
    group: "official",
    href: { en: "/en/nexus/contracts", id: "/nexus/kontrak-proposal" },
    icon: "contracts",
    id: "contracts",
    label: { en: "Contracts & Proposals", id: "Kontrak & Proposal" },
    listed: true,
  },
  {
    activeHrefs: {
      en: ["/en/nexus/academic"],
      id: ["/nexus/akademik", "/nexus/ajukan/akademik"],
    },
    implemented: { en: false, id: true },
    group: "official",
    href: { en: "/en/nexus/academic", id: "/nexus/akademik" },
    icon: "academic",
    id: "academic",
    label: { en: "Academic", id: "Akademik" },
    listed: true,
  },
  {
    activeHrefs: {
      en: ["/en/nexus/activities"],
      id: ["/nexus/kegiatan", "/nexus/ajukan/kegiatan"],
    },
    implemented: { en: false, id: true },
    group: "official",
    href: { en: "/en/nexus/activities", id: "/nexus/kegiatan" },
    icon: "activities",
    id: "activities",
    label: { en: "Activities & Outreach", id: "Kegiatan & Pengabdian" },
    listed: true,
  },
  {
    implemented: { en: false, id: true },
    group: "administration",
    href: { en: "/en/nexus/members", id: "/nexus/anggota" },
    icon: "members",
    id: "members",
    label: { en: "Members", id: "Anggota" },
    listed: true,
  },
  {
    activeHrefs: {
      en: ["/en/nexus/administration"],
      id: [
        "/nexus/administrasi",
        "/nexus/administrasi/peran",
        "/nexus/administrasi/akses",
      ],
    },
    implemented: { en: false, id: true },
    group: "administration",
    href: { en: "/en/nexus/administration", id: "/nexus/administrasi" },
    icon: "administration",
    id: "administration",
    label: { en: "Administration", id: "Administrasi" },
    listed: true,
  },
];

const groupLabels = {
  id: {
    administration: "Administrasi",
    main: "Utama",
    official: "Data Resmi",
    pipeline: "Alur Data",
  },
  en: {
    administration: "Administration",
    main: "Main",
    official: "Official Data",
    pipeline: "Data Pipeline",
  },
} satisfies Record<Locale, Record<NavigationGroupId, string>>;

/**
 * Identitas pengguna pada header berasal dari sesi layanan yang sama dengan
 * Profil Saya dan aktor tindakan, bukan dari nilai tersendiri. Foto akun belum
 * ditampilkan karena alamat gambarnya berasal dari penyimpanan di luar asal
 * ruang kerja; inisial dipakai sampai unggah foto akun tersedia.
 */
export function nexusDashboardViewerFromSession(
  session: NexusSession,
): DashboardViewer {
  return {
    email: session.account.email,
    fullName: session.account.name || session.account.email,
    id: session.account.id,
    initials: nexusSessionInitials(session),
    name: session.account.name || session.account.email,
    roleLabel: nexusSessionRoleLabel(session),
  };
}

function firstListedPage(access: NexusWorkspaceAccess, locale: Locale) {
  return navigationDefinitions.find(
    (item) =>
      item.listed &&
      item.implemented[locale] &&
      nexusWorkspaceCanOpen(access, item.id),
  );
}

/** Apakah akses membuka setidaknya satu halaman kerja pada navigasi. */
export function nexusWorkspaceHasListedPage(
  access: NexusWorkspaceAccess,
  locale: Locale = "id",
) {
  return Boolean(firstListedPage(access, locale));
}

/** Tujuan bawaan ruang kerja: halaman pertama yang dibangun dan diizinkan. */
export function nexusWorkspaceHomeHref(
  access: NexusWorkspaceAccess,
  locale: Locale = "id",
) {
  const firstAllowed = firstListedPage(access, locale)?.href[locale];
  if (firstAllowed) return firstAllowed;
  return locale === "id" ? "/nexus/profil" : "/en/nexus/coming-soon";
}

export function getNexusDashboardShellContent({
  access,
  locale = "id",
  viewer,
}: {
  access: NexusWorkspaceAccess;
  locale?: Locale;
  viewer: DashboardViewer;
}): NexusDashboardShellContent {
  const isId = locale === "id";
  const routeAccess = navigationDefinitions.map((item) => ({
    activeHrefs: item.activeHrefs?.[locale] ?? [item.href[locale]],
    allowed: !item.listed || nexusWorkspaceCanOpen(access, item.id),
    implemented: item.implemented[locale],
    label: item.label[locale],
  }));

  /* Profil Saya adalah tindakan personal pada menu pengguna, bukan navigasi
     utama; entri ini hanya memberi judul halaman pada kerangka ruang kerja. */
  if (isId) {
    routeAccess.push({
      activeHrefs: ["/nexus/profil"],
      allowed: true,
      implemented: true,
      label: "Profil Saya",
    });
  }
  const homeHref = nexusWorkspaceHomeHref(access, locale);
  const navigationGroups = (
    ["main", "pipeline", "official", "administration"] as const
  )
    .map((group) => ({
      id: group,
      items: navigationDefinitions
        .filter(
          (item) =>
            item.listed &&
            item.group === group &&
            nexusWorkspaceCanOpen(access, item.id),
        )
        .map((item) => ({
          activeHrefs: item.activeHrefs?.[locale] ?? [item.href[locale]],
          implemented: item.implemented[locale],
          href: item.href[locale],
          icon: item.icon,
          id: item.id,
          label: item.label[locale],
        })),
      label: groupLabels[locale][group],
    }))
    .filter((group) => group.items.length > 0);
  const supportMessage = [
    isId ? "Halo Tim Dukungan BHT Nexus," : "Hello BHT Nexus Support Team,",
    "",
    isId
      ? "Saya ingin meminta bantuan terkait penggunaan BHT Nexus."
      : "I would like help using BHT Nexus.",
    "",
    isId ? "Halaman/fitur:" : "Page/feature:",
    isId ? "Uraian kendala:" : "Issue description:",
    isId ? "Waktu kejadian:" : "Time of occurrence:",
  ].join("\n");
  const searchItems: DashboardSearchItem[] = navigationGroups.flatMap((group) =>
    group.items
      .filter((item) => item.implemented)
      .map((item) => ({
        description: isId ? `Buka halaman ${item.label}` : `Open ${item.label}`,
        href: item.href,
        id: item.id,
        label: item.label,
      })),
  );

  return {
    accessDeniedDescription: isId
      ? "Akun Anda belum memiliki izin untuk membuka halaman ini. Silakan kembali ke ruang kerja atau hubungi pengelola jika akses tersebut diperlukan."
      : "Your account cannot open this page. Return to the workspace or contact an administrator if you need access.",
    accessDeniedEyebrow: isId ? "Akses dibatasi" : "Access restricted",
    accessDeniedReturnLabel: isId
      ? "Kembali ke ruang kerja"
      : "Return to workspace",
    accessDeniedTitle: isId
      ? "Halaman ini tidak tersedia untuk akun Anda"
      : "This page is not available to your account",
    brandInstitutionLabel: "Telkom University, Indonesia",
    brandLabel: "BHT Nexus",
    brandOrganizationLabel: "CoE Biomedical & Healthcare Technology",
    closeMenuLabel: isId ? "Tutup navigasi" : "Close navigation",
    collapseMenuLabel: isId ? "Ciutkan navigasi" : "Collapse navigation",
    defaultPageTitle: "BHT Nexus",
    expandMenuLabel: isId ? "Perluas navigasi" : "Expand navigation",
    helpHref: `${COE_BHT_LINKS.email}?subject=${isId ? "Bantuan%20BHT%20Nexus" : "BHT%20Nexus%20help"}`,
    helpLabel: isId ? "Bantuan BHT Nexus" : "BHT Nexus help",
    homeHref,
    languageHomeHrefs: {
      en: "/en/nexus/coming-soon",
      id: isId ? homeHref : nexusWorkspaceHomeHref(access, "id"),
    },
    languageLabel: isId
      ? "Pilih bahasa ruang kerja"
      : "Choose workspace language",
    locale,
    mainNavigationLabel: isId ? "Navigasi ruang kerja" : "Workspace navigation",
    navigationGroups,
    reviewCapabilities: access.reviewCapabilities,
    routeAccess,
    notificationLabel: isId ? "Buka notifikasi" : "Open notifications",
    notifications:
      isId && nexusWorkspaceCanOpen(access, "reviews")
        ? [
            {
              detail:
                "Kandidat publikasi dan lintas-domain tersedia dalam satu antrean.",
              href: "/nexus/tinjauan",
              id: "candidate-review",
              timeLabel: "Baru saja",
              title: "Data menunggu tinjauan",
            },
          ]
        : [],
    notificationsEmptyLabel: isId
      ? "Belum ada notifikasi baru."
      : "No new notifications.",
    notificationsTitle: isId ? "Notifikasi" : "Notifications",
    openMenuLabel: isId ? "Buka navigasi" : "Open navigation",
    plannedBadgeLabel: isId ? "Segera" : "Coming soon",
    plannedFeatureLabel: isId
      ? "Layanan ini akan segera tersedia"
      : "This service will be available soon",
    ...(isId ? { profileHref: "/nexus/profil" } : {}),
    profileLabel: isId ? "Buka menu pengguna" : "Open user menu",
    profileMenuLabel: isId ? "Profil Saya" : "My profile",
    searchEmptyLabel: isId
      ? "Tidak ada halaman yang cocok."
      : "No matching page.",
    searchItems,
    searchLabel: isId ? "Cari di BHT Nexus" : "Search BHT Nexus",
    searchPlaceholder: isId
      ? "Cari anggota, pengumpulan, tinjauan, data resmi, atau dokumen"
      : "Search collection, reviews, publications, or documents",
    signOutErrorLabel: isId
      ? "Belum berhasil keluar. Sesi Anda mungkin masih aktif; periksa koneksi lalu coba lagi."
      : "Sign-out did not complete. Your session may still be active; check your connection and try again.",
    signOutLabel: isId ? "Keluar" : "Sign out",
    signingOutLabel: isId ? "Mengakhiri sesi…" : "Signing out…",
    supportDescription: isId
      ? "Hubungi Dukungan BHT Nexus"
      : "Contact BHT Nexus Support",
    supportHref: `${COE_BHT_LINKS.whatsapp}?text=${encodeURIComponent(supportMessage)}`,
    supportTitle: isId ? "Butuh bantuan?" : "Need help?",
    viewer,
  };
}
