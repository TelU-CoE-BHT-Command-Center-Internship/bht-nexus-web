import type { ImageProps } from "next/image";
import muhammadAmmarAsyrafPhoto from "@/assets/members/muhammad-ammar-asyraf.webp";
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
  available: boolean;
  href: string;
  icon: DashboardShellIconName;
  id: string;
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
  notificationLabel: string;
  notifications: DashboardNotification[];
  notificationsTitle: string;
  openMenuLabel: string;
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
  available: Record<Locale, boolean>;
  group: NavigationGroupId;
  href: Record<Locale, string>;
  icon: DashboardShellIconName;
  id: string;
  label: Record<Locale, string>;
};

/**
 * Alur data BHT Nexus: Pengumpulan dan Dokumen memasok kandidat, Tinjauan
 * memutuskan, lalu hasilnya mendarat pada satu rumah data resmi.
 *
 * Grup `official` dipetakan satu-per-satu dari kategori kandidat di Tinjauan
 * sehingga setiap keputusan reviewer selalu punya tujuan yang jelas. Hanya
 * Publikasi yang sudah dibangun; sisanya ditandai belum tersedia agar
 * strukturnya terbaca tanpa membuat halaman kosong.
 */
const navigationDefinitions: NavigationDefinition[] = [
  {
    available: { en: false, id: true },
    group: "main",
    href: { en: "/en/nexus", id: "/nexus/dashboard" },
    icon: "dashboard",
    id: "dashboard",
    label: { en: "Dashboard", id: "Dashboard" },
  },
  {
    available: { en: true, id: true },
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
    available: { en: true, id: true },
    group: "pipeline",
    href: { en: "/en/nexus/documents", id: "/nexus/dokumen" },
    icon: "documents",
    id: "documents",
    label: { en: "Documents", id: "Dokumen" },
  },
  {
    available: { en: true, id: true },
    group: "pipeline",
    href: { en: "/en/nexus/reviews", id: "/nexus/tinjauan" },
    icon: "reviews",
    id: "reviews",
    label: { en: "Reviews", id: "Tinjauan" },
  },
  {
    available: { en: false, id: true },
    group: "official",
    href: { en: "/en/nexus/publications", id: "/nexus/publikasi" },
    icon: "publications",
    id: "publications",
    label: { en: "Publications", id: "Publikasi" },
  },
  {
    available: { en: false, id: false },
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
    available: { en: false, id: false },
    group: "official",
    href: { en: "/en/nexus/contracts", id: "/nexus/kontrak-proposal" },
    icon: "contracts",
    id: "contracts",
    label: { en: "Contracts & Proposals", id: "Kontrak & Proposal" },
  },
  {
    available: { en: false, id: false },
    group: "official",
    href: { en: "/en/nexus/academic", id: "/nexus/akademik" },
    icon: "academic",
    id: "academic",
    label: { en: "Academic", id: "Akademik" },
  },
  {
    available: { en: false, id: false },
    group: "official",
    href: { en: "/en/nexus/activities", id: "/nexus/kegiatan" },
    icon: "activities",
    id: "activities",
    label: { en: "Activities & Outreach", id: "Kegiatan & Pengabdian" },
  },
  {
    available: { en: false, id: false },
    group: "administration",
    href: { en: "/en/nexus/members", id: "/nexus/anggota" },
    icon: "members",
    id: "members",
    label: { en: "Members", id: "Anggota" },
  },
  {
    available: { en: false, id: false },
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
  initials: "MA",
  name: "Muhammad Ammar Asyraf",
  roleLabel: "Admin / Pimpinan",
} satisfies DashboardViewer;

export function getNexusDashboardShellPreviewContent(
  locale: Locale = "id",
): NexusDashboardShellContent {
  const isId = locale === "id";
  const navigationGroups = (
    ["main", "pipeline", "official", "administration"] as const
  ).map((group) => ({
    id: group,
    items: navigationDefinitions
      .filter((item) => item.group === group)
      .map((item) => ({
        activeHrefs: item.activeHrefs?.[locale] ?? [item.href[locale]],
        available: item.available[locale],
        href: item.href[locale],
        icon: item.icon,
        id: item.id,
        label: item.label[locale],
      })),
    label: groupLabels[locale][group],
  }));
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
      .filter((item) => item.available)
      .map((item) => ({
        description: isId ? `Buka halaman ${item.label}` : `Open ${item.label}`,
        href: item.href,
        id: item.id,
        label: item.label,
      })),
  );

  return {
    brandInstitutionLabel: "Telkom University, Indonesia",
    brandLabel: "BHT Nexus",
    brandOrganizationLabel: "CoE Biomedical & Healthcare Technology",
    closeMenuLabel: isId ? "Tutup navigasi" : "Close navigation",
    collapseMenuLabel: isId ? "Ciutkan navigasi" : "Collapse navigation",
    defaultPageTitle: "BHT Nexus",
    expandMenuLabel: isId ? "Perluas navigasi" : "Expand navigation",
    helpHref: `${COE_BHT_LINKS.email}?subject=${isId ? "Bantuan%20BHT%20Nexus" : "BHT%20Nexus%20help"}`,
    helpLabel: isId ? "Bantuan BHT Nexus" : "BHT Nexus help",
    homeHref: isId ? "/nexus/dashboard" : "/en/nexus/collection",
    languageLabel: isId
      ? "Pilih bahasa ruang kerja"
      : "Choose workspace language",
    locale,
    mainNavigationLabel: isId ? "Navigasi ruang kerja" : "Workspace navigation",
    navigationGroups,
    notificationLabel: isId ? "Buka notifikasi" : "Open notifications",
    notifications: [
      {
        detail: isId
          ? "Kandidat publikasi dan lintas-domain tersedia dalam satu antrean."
          : "Publication and cross-domain candidates share one queue.",
        href: isId ? "/nexus/tinjauan" : "/en/nexus/reviews",
        id: "candidate-review",
        timeLabel: isId ? "Baru saja" : "Just now",
        title: isId ? "Data menunggu tinjauan" : "Data awaiting review",
      },
    ],
    notificationsTitle: isId ? "Notifikasi" : "Notifications",
    openMenuLabel: isId ? "Buka navigasi" : "Open navigation",
    plannedFeatureLabel: isId
      ? "Fitur ini akan dibangun pada tahap berikutnya"
      : "This feature is planned for a later stage",
    profileLabel: isId ? "Buka menu pengguna" : "Open user menu",
    searchEmptyLabel: isId
      ? "Tidak ada halaman yang cocok."
      : "No matching page.",
    searchItems,
    searchLabel: isId ? "Cari di BHT Nexus" : "Search BHT Nexus",
    searchPlaceholder: isId
      ? "Cari pengumpulan, tinjauan, publikasi, atau dokumen"
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
