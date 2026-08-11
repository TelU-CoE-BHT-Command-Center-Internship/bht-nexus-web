import type { ImageProps } from "next/image";
import muhammadAmmarAsyrafPhoto from "@/assets/members/muhammad-ammar-asyraf.webp";
import { COE_BHT_LINKS } from "@/content/coe-bht";
import type { Locale } from "@/i18n/locales";

export type DashboardShellIconName =
  | "administration"
  | "candidates"
  | "dashboard"
  | "documents"
  | "extraction"
  | "members"
  | "publications"
  | "questions"
  | "reviews"
  | "search";

export type DashboardNavigationItem = {
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
  mainNavigationLabel: string;
  navigationGroups: DashboardNavigationGroup[];
  notificationLabel: string;
  notifications: DashboardNotification[];
  notificationsTitle: string;
  openMenuLabel: string;
  plannedFeatureLabel: string;
  profileLabel: string;
  searchLabel: string;
  searchPlaceholder: string;
  signOutHref: string;
  signOutLabel: string;
  supportDescription: string;
  supportHref: string;
  supportTitle: string;
  viewer: DashboardViewer;
};

type DashboardPermission =
  | "administration:read"
  | "candidates:read"
  | "dashboard:read"
  | "documents:read"
  | "extraction:read"
  | "members:read"
  | "publications:read"
  | "queries:read"
  | "reviews:read"
  | "scraper:read";

type NavigationGroupId =
  | "administration"
  | "data"
  | "documents"
  | "main"
  | "scraper";

type NavigationDefinition = {
  group: NavigationGroupId;
  href: Record<Locale, string>;
  icon: DashboardShellIconName;
  id: string;
  label: Record<Locale, string>;
  permission: DashboardPermission;
};

const navigationDefinitions: NavigationDefinition[] = [
  {
    group: "main",
    href: { en: "/en/nexus/dashboard", id: "/nexus/dashboard" },
    icon: "dashboard",
    id: "dashboard",
    label: { en: "Dashboard", id: "Dashboard" },
    permission: "dashboard:read",
  },
  {
    group: "documents",
    href: { en: "/en/nexus/documents", id: "/nexus/dokumen" },
    icon: "documents",
    id: "documents",
    label: { en: "Library", id: "Pustaka" },
    permission: "documents:read",
  },
  {
    group: "documents",
    href: { en: "/en/nexus/ask-documents", id: "/nexus/tanya-dokumen" },
    icon: "questions",
    id: "document-questions",
    label: { en: "Q&A", id: "Tanya Jawab" },
    permission: "queries:read",
  },
  {
    group: "documents",
    href: { en: "/en/nexus/extraction", id: "/nexus/ekstraksi" },
    icon: "extraction",
    id: "extraction",
    label: { en: "Extraction", id: "Ekstraksi" },
    permission: "extraction:read",
  },
  {
    group: "scraper",
    href: { en: "/en/nexus/search", id: "/nexus/pencarian" },
    icon: "search",
    id: "researcher-search",
    label: { en: "Search", id: "Pencarian" },
    permission: "scraper:read",
  },
  {
    group: "scraper",
    href: { en: "/en/nexus/candidates", id: "/nexus/kandidat" },
    icon: "candidates",
    id: "collection-results",
    label: { en: "Candidates", id: "Kandidat" },
    permission: "candidates:read",
  },
  {
    group: "data",
    href: { en: "/en/nexus/members", id: "/nexus/anggota" },
    icon: "members",
    id: "members",
    label: { en: "Members", id: "Anggota" },
    permission: "members:read",
  },
  {
    group: "data",
    href: { en: "/en/nexus/publications", id: "/nexus/publikasi" },
    icon: "publications",
    id: "publications",
    label: { en: "Publications", id: "Publikasi" },
    permission: "publications:read",
  },
  {
    group: "data",
    href: { en: "/en/nexus/reviews", id: "/nexus/tinjauan" },
    icon: "reviews",
    id: "reviews",
    label: { en: "Reviews", id: "Tinjauan" },
    permission: "reviews:read",
  },
  {
    group: "administration",
    href: { en: "/en/nexus/administration", id: "/nexus/administrasi" },
    icon: "administration",
    id: "administration",
    label: { en: "Administration", id: "Administrasi" },
    permission: "administration:read",
  },
];

const navigationGroupLabels = {
  id: {
    administration: "Administrasi",
    data: "Data & Konten",
    documents: "Dokumen",
    main: "Utama",
    scraper: "Peneliti",
  },
  en: {
    administration: "Administration",
    data: "Data & Content",
    documents: "Documents",
    main: "Main",
    scraper: "Researchers",
  },
} satisfies Record<Locale, Record<NavigationGroupId, string>>;

const navigationGroupOrder: NavigationGroupId[] = [
  "main",
  "documents",
  "scraper",
  "data",
  "administration",
];

export const nexusDashboardPreviewViewer = {
  avatarSrc: muhammadAmmarAsyrafPhoto,
  initials: "MA",
  name: "Muhammad Ammar Asyraf",
  roleLabel: "Admin / Pimpinan",
} satisfies DashboardViewer;

const previewSession = {
  availableRoutes: new Set([
    "/nexus/dashboard",
    "/nexus/dokumen",
    "/nexus/ekstraksi",
    "/nexus/kandidat",
    "/nexus/pencarian",
    "/nexus/tanya-dokumen",
    "/en/nexus/ask-documents",
    "/en/nexus/candidates",
    "/en/nexus/documents",
    "/en/nexus/extraction",
    "/en/nexus/search",
  ]),
  permissions: new Set<DashboardPermission>([
    "administration:read",
    "candidates:read",
    "dashboard:read",
    "documents:read",
    "extraction:read",
    "members:read",
    "publications:read",
    "queries:read",
    "reviews:read",
    "scraper:read",
  ]),
  viewer: nexusDashboardPreviewViewer,
};

type ShellCopy = Omit<
  NexusDashboardShellContent,
  | "brandLabel"
  | "brandOrganizationLabel"
  | "helpHref"
  | "navigationGroups"
  | "supportHref"
  | "viewer"
> & {
  helpSubject: string;
  supportMessage: string;
};

const shellCopy = {
  id: {
    brandInstitutionLabel: "Telkom University, Indonesia",
    closeMenuLabel: "Tutup navigasi",
    collapseMenuLabel: "Ciutkan navigasi",
    defaultPageTitle: "Dashboard",
    expandMenuLabel: "Perluas navigasi",
    helpSubject: "Bantuan%20BHT%20Nexus",
    helpLabel: "Bantuan BHT Nexus",
    homeHref: "/nexus/dashboard",
    mainNavigationLabel: "Navigasi ruang kerja",
    notificationLabel: "Buka notifikasi",
    notifications: [
      {
        detail: "Satu kandidat publikasi perlu diperiksa.",
        id: "publication-review-preview",
        timeLabel: "Baru saja",
        title: "Publikasi baru menunggu tinjauan",
      },
    ],
    notificationsTitle: "Notifikasi",
    openMenuLabel: "Buka navigasi",
    plannedFeatureLabel: "Fitur ini akan dibangun pada tahap berikutnya",
    profileLabel: "Buka menu pengguna",
    searchLabel: "Cari di BHT Nexus",
    searchPlaceholder: "Cari anggota, publikasi, atau dokumen",
    signOutHref: "/nexus/masuk",
    signOutLabel: "Keluar",
    supportDescription: "Hubungi Dukungan BHT Nexus",
    supportMessage: [
      "Halo Tim Dukungan BHT Nexus,",
      "",
      "Saya ingin meminta bantuan terkait penggunaan BHT Nexus.",
      "",
      `Nama: ${previewSession.viewer.name}`,
      `Peran/posisi: ${previewSession.viewer.roleLabel}`,
      "Halaman/fitur:",
      "Kategori bantuan:",
      "Uraian kendala:",
      "Waktu kejadian:",
      "",
      "Terima kasih.",
    ].join("\n"),
    supportTitle: "Butuh bantuan?",
  },
  en: {
    brandInstitutionLabel: "Telkom University, Indonesia",
    closeMenuLabel: "Close navigation",
    collapseMenuLabel: "Collapse navigation",
    defaultPageTitle: "Dashboard",
    expandMenuLabel: "Expand navigation",
    helpSubject: "BHT%20Nexus%20help",
    helpLabel: "BHT Nexus help",
    homeHref: "/en/nexus/documents",
    mainNavigationLabel: "Workspace navigation",
    notificationLabel: "Open notifications",
    notifications: [
      {
        detail: "One publication candidate needs a check.",
        id: "publication-review-preview",
        timeLabel: "Just now",
        title: "New publication awaiting review",
      },
    ],
    notificationsTitle: "Notifications",
    openMenuLabel: "Open navigation",
    plannedFeatureLabel: "This feature arrives in a later stage",
    profileLabel: "Open user menu",
    searchLabel: "Search BHT Nexus",
    searchPlaceholder: "Search members, publications, or documents",
    signOutHref: "/en/nexus/sign-in",
    signOutLabel: "Sign out",
    supportDescription: "Contact BHT Nexus Support",
    supportMessage: [
      "Hello BHT Nexus Support Team,",
      "",
      "I would like to request help with BHT Nexus.",
      "",
      `Name: ${previewSession.viewer.name}`,
      `Role/position: ${previewSession.viewer.roleLabel}`,
      "Page/feature:",
      "Help category:",
      "Issue description:",
      "Time of occurrence:",
      "",
      "Thank you.",
    ].join("\n"),
    supportTitle: "Need help?",
  },
} satisfies Record<Locale, ShellCopy>;

/**
 * Temporary presentation data for the dashboard-shell milestone.
 * Replace this function with the authenticated server-session adapter when the
 * BHT Nexus server contract is ready; the component API can remain unchanged.
 */
export function getNexusDashboardShellPreviewContent(
  locale: Locale,
): NexusDashboardShellContent {
  const copy = shellCopy[locale];
  const allowedNavigation = navigationDefinitions.filter((item) =>
    previewSession.permissions.has(item.permission),
  );
  const navigationGroups = navigationGroupOrder.flatMap((groupId) => {
    const items = allowedNavigation
      .filter((item) => item.group === groupId)
      .map((item) => ({
        available: previewSession.availableRoutes.has(item.href[locale]),
        href: item.href[locale],
        icon: item.icon,
        id: item.id,
        label: item.label[locale],
      }));

    return items.length > 0
      ? [{ id: groupId, items, label: navigationGroupLabels[locale][groupId] }]
      : [];
  });

  return {
    brandInstitutionLabel: copy.brandInstitutionLabel,
    brandLabel: "BHT Nexus",
    brandOrganizationLabel: "CoE Biomedical & Healthcare Technology",
    closeMenuLabel: copy.closeMenuLabel,
    collapseMenuLabel: copy.collapseMenuLabel,
    defaultPageTitle: copy.defaultPageTitle,
    expandMenuLabel: copy.expandMenuLabel,
    helpHref: `${COE_BHT_LINKS.email}?subject=${copy.helpSubject}`,
    helpLabel: copy.helpLabel,
    homeHref: copy.homeHref,
    mainNavigationLabel: copy.mainNavigationLabel,
    navigationGroups,
    notificationLabel: copy.notificationLabel,
    notifications: copy.notifications,
    notificationsTitle: copy.notificationsTitle,
    openMenuLabel: copy.openMenuLabel,
    plannedFeatureLabel: copy.plannedFeatureLabel,
    profileLabel: copy.profileLabel,
    searchLabel: copy.searchLabel,
    searchPlaceholder: copy.searchPlaceholder,
    signOutHref: copy.signOutHref,
    signOutLabel: copy.signOutLabel,
    supportDescription: copy.supportDescription,
    supportHref: `${COE_BHT_LINKS.whatsapp}?text=${encodeURIComponent(copy.supportMessage)}`,
    supportTitle: copy.supportTitle,
    viewer: previewSession.viewer,
  };
}
