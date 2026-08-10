import type { StaticImageData } from "next/image";

import ipegeriLogo from "@/assets/partners/domestic/ipegeri.png";
import itbLogo from "@/assets/partners/domestic/Logo ITB_COLOR_2026_SVG.svg";
import unpadLogo from "@/assets/partners/domestic/logo-unpad1.png";
import rshsLogo from "@/assets/partners/domestic/rshs.png";
import utmLogo from "@/assets/partners/international/LOGO UTM.png";
import umpsaLogo from "@/assets/partners/international/umpsa.png";
import uowLogo from "@/assets/partners/international/uow.svg";
import type { Locale } from "@/i18n/locales";

export type PartnerLogo = {
  image: StaticImageData;
  name: string;
  shape: "emblem" | "horizontal" | "stacked";
};

type PartnersContent = {
  domesticLabel: string;
  internationalLabel: string;
  title: string;
};

export const domesticPartners: PartnerLogo[] = [
  {
    name: "Ikatan Perawat Gerontik Indonesia (IPEGERI)",
    image: ipegeriLogo,
    shape: "emblem",
  },
  {
    name: "RSUP Dr. Hasan Sadikin Bandung",
    image: rshsLogo,
    shape: "horizontal",
  },
  {
    name: "Universitas Padjadjaran",
    image: unpadLogo,
    shape: "emblem",
  },
  {
    name: "Institut Teknologi Bandung",
    image: itbLogo,
    shape: "emblem",
  },
];

export const internationalPartners: PartnerLogo[] = [
  {
    name: "Universiti Teknologi Malaysia",
    image: utmLogo,
    shape: "horizontal",
  },
  {
    name: "University of Wollongong Australia",
    image: uowLogo,
    shape: "horizontal",
  },
  {
    name: "Universiti Malaysia Pahang Al-Sultan Abdullah",
    image: umpsaLogo,
    shape: "stacked",
  },
];

const partnersContent = {
  id: {
    title: "Mitra Kami",
    domesticLabel: "Mitra Nasional",
    internationalLabel: "Mitra Internasional",
  },
  en: {
    title: "Our Partners",
    domesticLabel: "Domestic Partners",
    internationalLabel: "International Partners",
  },
} satisfies Record<Locale, PartnersContent>;

export function getPartnersContent(locale: Locale): PartnersContent {
  return partnersContent[locale];
}
