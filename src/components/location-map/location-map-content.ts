import { COE_BHT_LINKS, COE_BHT_PRIMARY_LOCATION } from "@/content/coe-bht";
import type { Locale } from "@/i18n/locales";

export const COE_BHT_LOCATION = {
  ...COE_BHT_PRIMARY_LOCATION,
  mapStyleUrl: "https://tiles.openfreemap.org/styles/liberty",
} as const;

export type ContactChannelIcon = "email" | "instagram" | "whatsapp";

type ContactChannel = {
  ariaLabel: string;
  external?: boolean;
  href: string;
  icon: ContactChannelIcon;
  label: string;
  prefix: string;
};

export type LocationMapContent = {
  addressLabel: string;
  channels: ContactChannel[];
  description: string;
  directionsLabel: string;
  errorLabel: string;
  loadingLabel: string;
  mapLabel: string;
  markerLabel: string;
  title: string;
};

const locationMapContent = {
  id: {
    addressLabel: "Alamat kampus CoE BHT",
    title: "Kunjungi Kami",
    description:
      "Temukan kami di lingkungan Telkom University dan terhubung melalui kanal resmi CoE BHT.",
    directionsLabel: "Buka petunjuk arah",
    loadingLabel: "Menyiapkan peta interaktif…",
    errorLabel: "Peta belum dapat dimuat. Gunakan tautan petunjuk arah.",
    mapLabel: "Peta interaktif alamat kampus CoE BHT di Telkom University",
    markerLabel: "Telkom University, alamat kampus yang dicantumkan CoE BHT",
    channels: [
      {
        ariaLabel: "Buka Instagram resmi CoE BHT",
        external: true,
        href: COE_BHT_LINKS.instagram,
        icon: "instagram",
        label: "Instagram @coe.bht",
        prefix: "Ikuti kami di",
      },
      {
        ariaLabel: "Hubungi CoE BHT melalui WhatsApp",
        external: true,
        href: COE_BHT_LINKS.whatsapp,
        icon: "whatsapp",
        label: "WhatsApp",
        prefix: "Hubungi kami melalui",
      },
      {
        ariaLabel: "Kirim email ke CoE BHT",
        href: COE_BHT_LINKS.email,
        icon: "email",
        label: "coe.bht@telkomuniversity.ac.id",
        prefix: "Kirim email ke",
      },
    ],
  },
  en: {
    addressLabel: "CoE BHT campus address",
    title: "Visit Us",
    description:
      "Find us at Telkom University and stay connected through CoE BHT's official channels.",
    directionsLabel: "Open directions",
    loadingLabel: "Preparing the interactive map…",
    errorLabel: "The map could not load. Use the directions link instead.",
    mapLabel:
      "Interactive map of the CoE BHT campus address at Telkom University",
    markerLabel: "Telkom University, the campus address listed by CoE BHT",
    channels: [
      {
        ariaLabel: "Open the official CoE BHT Instagram account",
        external: true,
        href: COE_BHT_LINKS.instagram,
        icon: "instagram",
        label: "Instagram @coe.bht",
        prefix: "Follow us on",
      },
      {
        ariaLabel: "Contact CoE BHT through WhatsApp",
        external: true,
        href: COE_BHT_LINKS.whatsapp,
        icon: "whatsapp",
        label: "WhatsApp",
        prefix: "Reach us on",
      },
      {
        ariaLabel: "Send an email to CoE BHT",
        href: COE_BHT_LINKS.email,
        icon: "email",
        label: "coe.bht@telkomuniversity.ac.id",
        prefix: "Email us at",
      },
    ],
  },
} satisfies Record<Locale, LocationMapContent>;

export function getLocationMapContent(locale: Locale): LocationMapContent {
  return locationMapContent[locale];
}
