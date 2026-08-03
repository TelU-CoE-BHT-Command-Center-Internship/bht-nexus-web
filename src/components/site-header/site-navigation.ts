export const locales = ["id", "en"] as const;

export type Locale = (typeof locales)[number];

export type NavigationItem = {
  href: string;
  label: string;
  external?: boolean;
  children?: NavigationItem[];
};

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
      { href: "/kontak", label: "Kontak" },
    ],
    primaryLinks: [
      {
        href: "/tentang",
        label: "Tentang",
        children: [
          { href: "/tentang", label: "Profil CoE BHT" },
          { href: "/tentang/visi-misi", label: "Visi & Misi" },
          { href: "/anggota", label: "Anggota" },
        ],
      },
      { href: "/riset", label: "Riset & Inovasi" },
      {
        href: "/program",
        label: "Program",
        children: [
          { href: "/program", label: "Program" },
          {
            href: "/pengabdian-masyarakat",
            label: "Pengabdian Masyarakat",
          },
        ],
      },
      {
        href: "/kolaborasi",
        label: "Kolaborasi",
        children: [
          { href: "/kolaborasi", label: "Peluang Kolaborasi" },
          { href: "/mitra", label: "Mitra" },
        ],
      },
      { href: "/berita", label: "Berita & Kegiatan" },
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
      { href: "/en/contact", label: "Contact" },
    ],
    primaryLinks: [
      {
        href: "/en/about",
        label: "About",
        children: [
          { href: "/en/about", label: "CoE BHT Profile" },
          { href: "/en/about/vision-mission", label: "Vision & Mission" },
          { href: "/en/members", label: "Members" },
        ],
      },
      { href: "/en/research", label: "Research & Innovation" },
      {
        href: "/en/programs",
        label: "Programs",
        children: [
          { href: "/en/programs", label: "Programs" },
          { href: "/en/community-service", label: "Community Service" },
        ],
      },
      {
        href: "/en/collaboration",
        label: "Collaboration",
        children: [
          {
            href: "/en/collaboration",
            label: "Collaboration Opportunities",
          },
          { href: "/en/partners", label: "Partners" },
        ],
      },
      { href: "/en/news", label: "News & Events" },
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
