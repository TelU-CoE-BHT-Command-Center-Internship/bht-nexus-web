import type { ImageProps } from "next/image";
import muhammadAmmarAsyrafPhoto from "@/assets/members/muhammad-ammar-asyraf.webp";
import {
  type NexusWorkspaceAccess,
  type NexusWorkspaceNavigationId,
  nexusPreviewWorkspaceAccess,
  nexusWorkspaceCanOpen,
} from "@/components/nexus-dashboard-shell/nexus-workspace-access";
import type { NexusReviewCapabilities } from "@/components/nexus-review-session/nexus-review-session";
import { COE_BHT_LINKS } from "@/content/coe-bht";
import type { Locale } from "@/i18n/locales";

export type DashboardShellIconName =
  | "academic"
  | "activities"
  | "administration"
  | "contracts"
  | "dashboard"
  | "documents"
  | "intellectualProperty"
  | "members"
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
  avatarSrc?: ImageProps["src"];
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
  profileLabel: string;
  searchEmptyLabel: string;
  searchItems: DashboardSearchItem[];
  searchLabel: string;
  searchPlaceholder: string;
  signOutHref: string;
  signOutLabel: string;
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
  },
  {
    implemented: { en: false, id: true },
    group: "pipeline",
    href: { en: "/en/nexus/collection", id: "/nexus/pengumpulan" },
    icon: "search",
    id: "collection",
    label: { en: "Collection", id: "Pengumpulan" },
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
  },
  {
    implemented: { en: false, id: true },
    group: "pipeline",
    href: { en: "/en/nexus/reviews", id: "/nexus/tinjauan" },
    icon: "reviews",
    id: "reviews",
    label: { en: "Reviews", id: "Tinjauan" },
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
  },
  {
    implemented: { en: false, id: true },
    group: "administration",
    href: { en: "/en/nexus/members", id: "/nexus/anggota" },
    icon: "members",
    id: "members",
    label: { en: "Members", id: "Anggota" },
  },
  {
    implemented: { en: false, id: false },
    group: "administration",
    href: { en: "/en/nexus/administration", id: "/nexus/administrasi" },
    icon: "administration",
    id: "administration",
    label: { en: "Administration", id: "Administrasi" },
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

export const nexusDashboardPreviewViewer = {
  avatarSrc: muhammadAmmarAsyrafPhoto,
  id: "USR-COE-BHT-ADMIN-001",
  initials: "MA",
  name: "Muhammad Ammar Asyraf",
  roleLabel: "Admin / Pimpinan",
} satisfies DashboardViewer;

export function getNexusDashboardShellPreviewContent(
  locale: Locale = "id",
  access: NexusWorkspaceAccess = nexusPreviewWorkspaceAccess,
): NexusDashboardShellContent {
  const isId = locale === "id";
  const routeAccess = navigationDefinitions.map((item) => ({
    activeHrefs: item.activeHrefs?.[locale] ?? [item.href[locale]],
    allowed: nexusWorkspaceCanOpen(access, item.id),
    implemented: item.implemented[locale],
    label: item.label[locale],
  }));
  const firstAllowedHref = navigationDefinitions.find(
    (item) =>
      item.implemented[locale] && nexusWorkspaceCanOpen(access, item.id),
  )?.href[locale];
  const navigationGroups = (
    ["main", "pipeline", "official", "administration"] as const
  )
    .map((group) => ({
      id: group,
      items: navigationDefinitions
        .filter(
          (item) =>
            item.group === group && nexusWorkspaceCanOpen(access, item.id),
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
    `${isId ? "Nama" : "Name"}: ${nexusDashboardPreviewViewer.name}`,
    `${isId ? "Peran/posisi" : "Role"}: ${nexusDashboardPreviewViewer.roleLabel}`,
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
    homeHref:
      firstAllowedHref ?? (isId ? "/nexus/dashboard" : "/en/nexus/coming-soon"),
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
    profileLabel: isId ? "Buka menu pengguna" : "Open user menu",
    searchEmptyLabel: isId
      ? "Tidak ada halaman yang cocok."
      : "No matching page.",
    searchItems,
    searchLabel: isId ? "Cari di BHT Nexus" : "Search BHT Nexus",
    searchPlaceholder: isId
      ? "Cari anggota, pengumpulan, tinjauan, data resmi, atau dokumen"
      : "Search collection, reviews, publications, or documents",
    signOutHref: isId ? "/nexus/masuk" : "/en/nexus/sign-in",
    signOutLabel: isId ? "Keluar" : "Sign out",
    supportDescription: isId
      ? "Hubungi Dukungan BHT Nexus"
      : "Contact BHT Nexus Support",
    supportHref: `${COE_BHT_LINKS.whatsapp}?text=${encodeURIComponent(supportMessage)}`,
    supportTitle: isId ? "Butuh bantuan?" : "Need help?",
    viewer: nexusDashboardPreviewViewer,
  };
}
