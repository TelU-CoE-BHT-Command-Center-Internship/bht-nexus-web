import {
  COE_BHT_LINKS,
  COE_BHT_PRIMARY_LOCATION,
  COE_BHT_RESEARCH_SPACE,
} from "@/content/coe-bht";
import type { Locale } from "@/i18n/locales";

type FooterLink = {
  href: string;
  label: string;
};

type FooterLocation = {
  ariaLabel: string;
  href: string;
  lines: string[];
  title: string;
};

export type FooterSocialIcon = "email" | "instagram" | "whatsapp";

type FooterSocialLink = FooterLink & {
  icon: FooterSocialIcon;
};

export type SiteFooterContent = {
  brandHomeLabel: string;
  contactLabel: string;
  copyrightLabel: string;
  locations: FooterLocation[];
  privacyLabel: string;
  quickLinks: FooterLink[];
  quickLinksLabel: string;
  rissAriaLabel: string;
  rissLabel: string;
  rissTitle: string;
  socialLabel: string;
  socialLinks: FooterSocialLink[];
  updatesLabel: string;
};

const sharedQuickLinks = {
  centerOfExcellence: COE_BHT_LINKS.centerOfExcellence,
  electricalEngineering: COE_BHT_LINKS.electricalEngineering,
  laboratoryDirectory: COE_BHT_LINKS.laboratoryDirectory,
} as const;

const siteFooterContent = {
  id: {
    brandHomeLabel: "Kembali ke beranda CoE BHT",
    contactLabel: "Hubungi CoE BHT",
    copyrightLabel: "CoE Biomedical & Healthcare Technology",
    locations: [
      {
        ariaLabel: "Buka petunjuk arah ke Kampus Utama Telkom University",
        href: COE_BHT_PRIMARY_LOCATION.directionsHref,
        title: "Kampus Utama Bandung",
        lines: [
          "Telkom University",
          "Jl. Telekomunikasi No. 1",
          "Terusan Buahbatu–Bojongsoang",
          "Kabupaten Bandung, Jawa Barat 40257",
        ],
      },
      {
        ariaLabel: "Buka lokasi Ruang CoE BHT di Gedung F Telkom University",
        href: COE_BHT_RESEARCH_SPACE.directionsHref,
        title: COE_BHT_RESEARCH_SPACE.name,
        lines: [
          "Gedung F, Telkom University",
          "Jl. Telekomunikasi No. 1",
          "Kabupaten Bandung, Jawa Barat 40257",
        ],
      },
    ],
    privacyLabel: "Kebijakan Privasi",
    quickLinks: [
      {
        href: COE_BHT_LINKS.telkomUniversity.id,
        label: "Telkom University",
      },
      {
        href: sharedQuickLinks.electricalEngineering,
        label: "Fakultas Teknik Elektro",
      },
      {
        href: sharedQuickLinks.laboratoryDirectory,
        label: "Direktori Laboratorium",
      },
      {
        href: sharedQuickLinks.centerOfExcellence,
        label: "Center of Excellence Tel-U",
      },
    ],
    quickLinksLabel: "Tautan Cepat",
    rissAriaLabel:
      "Buka Research and Innovation Support System Telkom University",
    rissLabel: "Riset & Inovasi Telkom University",
    rissTitle: "RISS Telkom University",
    socialLabel: "Kanal resmi CoE BHT",
    socialLinks: [
      {
        href: COE_BHT_LINKS.instagram,
        icon: "instagram",
        label: "Instagram CoE BHT",
      },
      {
        href: COE_BHT_LINKS.whatsapp,
        icon: "whatsapp",
        label: "WhatsApp CoE BHT",
      },
      {
        href: COE_BHT_LINKS.email,
        icon: "email",
        label: "Email CoE BHT",
      },
    ],
    updatesLabel: "Ikuti kabar terbaru CoE BHT",
  },
  en: {
    brandHomeLabel: "Return to the CoE BHT home page",
    contactLabel: "Contact CoE BHT",
    copyrightLabel: "CoE Biomedical & Healthcare Technology",
    locations: [
      {
        ariaLabel: "Open directions to the Telkom University Main Campus",
        href: COE_BHT_PRIMARY_LOCATION.directionsHref,
        title: "Bandung Main Campus",
        lines: [
          "Telkom University",
          "Jl. Telekomunikasi No. 1",
          "Terusan Buahbatu–Bojongsoang",
          "Bandung Regency, West Java 40257",
        ],
      },
      {
        ariaLabel: "Open the location of the CoE BHT Room in Building F",
        href: COE_BHT_RESEARCH_SPACE.directionsHref,
        title: "CoE BHT Research Space",
        lines: [
          "Building F, Telkom University",
          "Jl. Telekomunikasi No. 1",
          "Bandung Regency, West Java 40257",
        ],
      },
    ],
    privacyLabel: "Privacy Policy",
    quickLinks: [
      {
        href: COE_BHT_LINKS.telkomUniversity.en,
        label: "Telkom University",
      },
      {
        href: sharedQuickLinks.electricalEngineering,
        label: "School of Electrical Engineering",
      },
      {
        href: sharedQuickLinks.laboratoryDirectory,
        label: "Laboratory Directory",
      },
      {
        href: sharedQuickLinks.centerOfExcellence,
        label: "Tel-U Centers of Excellence",
      },
    ],
    quickLinksLabel: "Quick Links",
    rissAriaLabel:
      "Open the Telkom University Research and Innovation Support System",
    rissLabel: "Telkom University Research & Innovation",
    rissTitle: "RISS Telkom University",
    socialLabel: "Official CoE BHT channels",
    socialLinks: [
      {
        href: COE_BHT_LINKS.instagram,
        icon: "instagram",
        label: "CoE BHT Instagram",
      },
      {
        href: COE_BHT_LINKS.whatsapp,
        icon: "whatsapp",
        label: "CoE BHT WhatsApp",
      },
      {
        href: COE_BHT_LINKS.email,
        icon: "email",
        label: "CoE BHT email",
      },
    ],
    updatesLabel: "Follow the latest updates from CoE BHT",
  },
} satisfies Record<Locale, SiteFooterContent>;

export function getSiteFooterContent(locale: Locale): SiteFooterContent {
  return siteFooterContent[locale];
}
