import type { ImageProps } from "next/image";
import muhammadAmmarAsyrafPhoto from "@/assets/members/muhammad-ammar-asyraf.webp";
import { COE_BHT_LINKS } from "@/content/coe-bht";

export type DashboardShellIconName =
  | "administration"
  | "dashboard"
  | "members"
  | "publications"
  | "reviews";

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
  signOutLabel: string;
  supportDescription: string;
  supportHref: string;
  supportTitle: string;
  viewer: DashboardViewer;
};

type DashboardPermission =
  | "administration:read"
  | "dashboard:read"
  | "members:read"
  | "publications:read"
  | "reviews:read";

type NavigationDefinition = Omit<DashboardNavigationItem, "available"> & {
  group: "administration" | "data" | "main";
  permission: DashboardPermission;
};

const navigationDefinitions: NavigationDefinition[] = [
  {
    href: "/nexus/dashboard",
    group: "main",
    icon: "dashboard",
    id: "dashboard",
    label: "Dashboard",
    permission: "dashboard:read",
  },
  {
    href: "/nexus/anggota",
    group: "data",
    icon: "members",
    id: "members",
    label: "Anggota",
    permission: "members:read",
  },
  {
    href: "/nexus/publikasi",
    group: "data",
    icon: "publications",
    id: "publications",
    label: "Publikasi",
    permission: "publications:read",
  },
  {
    href: "/nexus/tinjauan",
    group: "data",
    icon: "reviews",
    id: "reviews",
    label: "Tinjauan",
    permission: "reviews:read",
  },
  {
    href: "/nexus/administrasi",
    group: "administration",
    icon: "administration",
    id: "administration",
    label: "Administrasi",
    permission: "administration:read",
  },
];

export const nexusDashboardPreviewViewer = {
  avatarSrc: muhammadAmmarAsyrafPhoto,
  initials: "MA",
  name: "Muhammad Ammar Asyraf",
  roleLabel: "Admin / Pimpinan",
} satisfies DashboardViewer;

const previewSession = {
  availableRoutes: new Set(["/nexus/dashboard"]),
  permissions: new Set<DashboardPermission>([
    "administration:read",
    "dashboard:read",
    "members:read",
    "publications:read",
    "reviews:read",
  ]),
  viewer: nexusDashboardPreviewViewer,
};

/**
 * Temporary presentation data for the dashboard-shell milestone.
 * Replace this function with the authenticated server-session adapter when the
 * BHT Nexus server contract is ready; the component API can remain unchanged.
 */
export function getNexusDashboardShellPreviewContent(): NexusDashboardShellContent {
  const allowedNavigation = navigationDefinitions.filter((item) =>
    previewSession.permissions.has(item.permission),
  );
  const navigationGroups = [
    { id: "main", label: "Utama" },
    { id: "data", label: "Data & Konten" },
    { id: "administration", label: "Administrasi" },
  ].flatMap((group) => {
    const items = allowedNavigation
      .filter((item) => item.group === group.id)
      .map(({ group: _group, permission: _permission, ...item }) => ({
        ...item,
        available: previewSession.availableRoutes.has(item.href),
      }));

    return items.length > 0 ? [{ ...group, items }] : [];
  });
  const supportMessage = [
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
  ].join("\n");

  return {
    brandInstitutionLabel: "Telkom University, Indonesia",
    brandLabel: "BHT Nexus",
    brandOrganizationLabel: "CoE Biomedical & Healthcare Technology",
    closeMenuLabel: "Tutup navigasi",
    collapseMenuLabel: "Ciutkan navigasi",
    defaultPageTitle: "Dashboard",
    expandMenuLabel: "Perluas navigasi",
    helpHref: `${COE_BHT_LINKS.email}?subject=Bantuan%20BHT%20Nexus`,
    helpLabel: "Bantuan BHT Nexus",
    mainNavigationLabel: "Navigasi ruang kerja",
    navigationGroups,
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
    signOutLabel: "Keluar",
    supportDescription: "Hubungi Dukungan BHT Nexus",
    supportHref: `${COE_BHT_LINKS.whatsapp}?text=${encodeURIComponent(supportMessage)}`,
    supportTitle: "Butuh bantuan?",
    viewer: previewSession.viewer,
  };
}
