import type { Locale } from "@/i18n/locales";

export type NavigationItem = {
  href: string;
  label: string;
  external?: boolean;
  children?: NavigationItem[];
};

export function isPageSectionHref(href: string) {
  return href.startsWith("#");
}

export function isPathActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export type SiteNavigation = {
  brandHomeLabel: string;
  closeMenuLabel: string;
  languageLabel: string;
  mainNavigationLabel: string;
  menuLabel: string;
  mobileMenuEyebrow: string;
  mobileMenuTitle: string;
  platformLabel: string;
  utilityNavigationLabel: string;
  utilityLinks: NavigationItem[];
  primaryLinks: NavigationItem[];
  action: NavigationItem;
};

const siteNavigation = {
  id: {
    brandHomeLabel: "Beranda CoE Biomedical & Healthcare Technology",
    closeMenuLabel: "Tutup menu utama",
    languageLabel: "Pilih bahasa",
    mainNavigationLabel: "Navigasi utama",
    menuLabel: "Buka menu utama",
    mobileMenuEyebrow: "Telkom University",
    mobileMenuTitle: "CoE Biomedical & Healthcare Technology",
    platformLabel: "Platform digital",
    utilityNavigationLabel: "Tautan institusi",
    utilityLinks: [
      {
        href: "https://telkomuniversity.ac.id/",
        label: "Telkom University",
        external: true,
      },
      { href: "/#contact", label: "Kontak" },
    ],
    primaryLinks: [
      { href: "/#research-focus", label: "Riset & Inovasi" },
      { href: "/#news-highlights", label: "Berita" },
      { href: "/#latest-events", label: "Kegiatan" },
      { href: "/#partners", label: "Mitra" },
      { href: "/anggota", label: "Anggota" },
    ],
    action: {
      href: "/nexus",
      label: "BHT-Nexus",
    },
  },
  en: {
    brandHomeLabel: "CoE Biomedical & Healthcare Technology home",
    closeMenuLabel: "Close main menu",
    languageLabel: "Choose language",
    mainNavigationLabel: "Main navigation",
    menuLabel: "Open main menu",
    mobileMenuEyebrow: "Telkom University",
    mobileMenuTitle: "CoE Biomedical & Healthcare Technology",
    platformLabel: "Digital platform",
    utilityNavigationLabel: "Institutional links",
    utilityLinks: [
      {
        href: "https://telkomuniversity.ac.id/en/",
        label: "Telkom University",
        external: true,
      },
      { href: "/en#contact", label: "Contact" },
    ],
    primaryLinks: [
      { href: "/en#research-focus", label: "Research & Innovation" },
      { href: "/en#news-highlights", label: "News" },
      { href: "/en#latest-events", label: "Events" },
      { href: "/en#partners", label: "Partners" },
      { href: "/en/members", label: "Members" },
    ],
    action: {
      href: "/en/nexus",
      label: "BHT-Nexus",
    },
  },
} satisfies Record<Locale, SiteNavigation>;

export function getSiteNavigation(locale: Locale): SiteNavigation {
  return siteNavigation[locale];
}
