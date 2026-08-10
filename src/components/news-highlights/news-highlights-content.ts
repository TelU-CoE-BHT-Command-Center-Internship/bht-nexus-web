import type { StaticImageData } from "next/image";

import healthyAgeingImage from "@/assets/news-highlights/healthy-ageing-technology.webp";
import seminarImage from "@/assets/news-highlights/seminar-nasional-bht.webp";
import telemedicineImage from "@/assets/news-highlights/telemedicine-course.webp";
import tideEyeImage from "@/assets/news-highlights/tide-eye-flood-monitoring.webp";
import ultrasonographyImage from "@/assets/news-highlights/ultrasonography-training.webp";
import type { Locale } from "@/i18n/locales";

type NewsItem = {
  alt: string;
  href: string;
  image: StaticImageData;
  title: string;
};

type FeaturedNewsItem = NewsItem & {
  category: string;
  date: {
    day: string;
    iso: string;
    monthYear: string;
  };
  description: string;
};

export type NewsHighlightsContent = {
  allNewsHref: string;
  allNewsLabel: string;
  featured: FeaturedNewsItem;
  items: NewsItem[];
  title: string;
};

const officialWebsite = "https://coe-bht.telkomuniversity.ac.id/";

const newsHighlightsContent = {
  id: {
    allNewsHref: officialWebsite,
    allNewsLabel: "Semua berita",
    title: "BHT dalam Aksi",
    featured: {
      alt: "Ilustrasi pemantauan banjir dari udara",
      category: "Riset kolaboratif",
      date: {
        day: "20",
        iso: "2024-05-20",
        monthYear: "Mei 2024",
      },
      description:
        "Kolaborasi Indonesia–Australia mengembangkan sistem pemantauan muka air berbasis AI dan IoT untuk membantu menghadapi banjir rob di pesisir utara Jawa Tengah.",
      href: `${officialWebsite}#riset`,
      image: tideEyeImage,
      title: "Tide Eye: AI dan IoT untuk Memantau Muka Air dan Banjir Rob",
    },
    items: [
      {
        alt: "Poster Seminar Nasional Biomedical & Healthcare Technology",
        href: `${officialWebsite}#pelatihan_seminar`,
        image: seminarImage,
        title: "Seminar Nasional Biomedical & Healthcare Technology",
      },
      {
        alt: "Ilustrasi pelatihan ultrasonografi untuk tenaga kesehatan",
        href: `${officialWebsite}#pelatihan_seminar`,
        image: ultrasonographyImage,
        title: "Basic Training Ultrasonography (USG)",
      },
      {
        alt: "Ilustrasi dokter menggunakan sistem telemedicine",
        href: `${officialWebsite}#pelatihan_seminar`,
        image: telemedicineImage,
        title: "A Short Course on How to Develop a Telemedicine System",
      },
      {
        alt: "Ilustrasi teknologi wearable untuk mendukung lansia",
        href: `${officialWebsite}#riset`,
        image: healthyAgeingImage,
        title: "Sistem Inovatif untuk Mitigasi Risiko Jatuh pada Lansia",
      },
    ],
  },
  en: {
    allNewsHref: officialWebsite,
    allNewsLabel: "All news",
    title: "BHT in Action",
    featured: {
      alt: "Illustration of aerial flood monitoring",
      category: "Collaborative research",
      date: {
        day: "20",
        iso: "2024-05-20",
        monthYear: "May 2024",
      },
      description:
        "An Indonesia–Australia collaboration is developing an AI- and IoT-powered water-level monitoring system to help address tidal flooding along the north coast of Central Java.",
      href: `${officialWebsite}#riset`,
      image: tideEyeImage,
      title: "Tide Eye: AI and IoT for Water-Level and Tidal-Flood Monitoring",
    },
    items: [
      {
        alt: "Poster for the National Seminar on Biomedical & Healthcare Technology",
        href: `${officialWebsite}#pelatihan_seminar`,
        image: seminarImage,
        title: "National Seminar on Biomedical & Healthcare Technology",
      },
      {
        alt: "Illustration of ultrasonography training for healthcare workers",
        href: `${officialWebsite}#pelatihan_seminar`,
        image: ultrasonographyImage,
        title: "Basic Training in Ultrasonography (USG)",
      },
      {
        alt: "Illustration of a doctor using a telemedicine system",
        href: `${officialWebsite}#pelatihan_seminar`,
        image: telemedicineImage,
        title: "A Short Course on How to Develop a Telemedicine System",
      },
      {
        alt: "Illustration of wearable technology supporting an older adult",
        href: `${officialWebsite}#riset`,
        image: healthyAgeingImage,
        title: "An Innovative Fall-Risk Mitigation System for Older Adults",
      },
    ],
  },
} satisfies Record<Locale, NewsHighlightsContent>;

export function getNewsHighlightsContent(
  locale: Locale,
): NewsHighlightsContent {
  return newsHighlightsContent[locale];
}
