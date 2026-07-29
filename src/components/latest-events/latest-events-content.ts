import type { StaticImageData } from "next/image";

import seminarImage from "@/assets/news-highlights/seminar-nasional-bht.webp";
import telemedicineImage from "@/assets/news-highlights/telemedicine-course.webp";
import ultrasonographyImage from "@/assets/news-highlights/ultrasonography-training.webp";
import type { Locale } from "@/components/site-header/site-navigation";

type EventItem = {
  alt: string;
  date: {
    day: string;
    iso: string;
    monthYear: string;
  };
  href: string;
  image: StaticImageData;
  preserveImage: boolean;
  schedule: {
    iso: string;
    label: string;
  };
  title: string;
};

export type LatestEventsContent = {
  allEventsHref: string;
  allEventsLabel: string;
  events: EventItem[];
  openImageLabel: string;
  title: string;
};

const officialEventsUrl =
  "https://coe-bht.telkomuniversity.ac.id/#pelatihan_seminar";

const latestEventsContent = {
  id: {
    allEventsHref: officialEventsUrl,
    allEventsLabel: "Lihat semua event",
    openImageLabel: "Lihat gambar penuh",
    title: "Latest Event",
    events: [
      {
        alt: "Poster Seminar Nasional Biomedical & Healthcare Technology",
        date: {
          day: "1",
          iso: "2024-07-01",
          monthYear: "Juli 2024",
        },
        href: officialEventsUrl,
        image: seminarImage,
        preserveImage: true,
        schedule: {
          iso: "2024-07-01T08:00:00+07:00",
          label: "08.00–16.00 WIB",
        },
        title: "Seminar Nasional Biomedical & Healthcare Technology",
      },
      {
        alt: "Pelatihan ultrasonografi untuk tenaga kesehatan",
        date: {
          day: "29",
          iso: "2024-06-29",
          monthYear: "Juni 2024",
        },
        href: officialEventsUrl,
        image: ultrasonographyImage,
        preserveImage: false,
        schedule: {
          iso: "2024-06-29T09:00:00+07:00",
          label: "09.00–12.00 WIB",
        },
        title: "Basic Training Ultrasonography (USG)",
      },
      {
        alt: "Dokter menggunakan laptop untuk layanan telemedicine",
        date: {
          day: "29",
          iso: "2024-06-29",
          monthYear: "Juni 2024",
        },
        href: officialEventsUrl,
        image: telemedicineImage,
        preserveImage: false,
        schedule: {
          iso: "2024-06-29T13:00:00+07:00",
          label: "13.00–15.30 WIB",
        },
        title: "A Short Course on How to Develop a Telemedicine System",
      },
    ],
  },
  en: {
    allEventsHref: officialEventsUrl,
    allEventsLabel: "View all events",
    openImageLabel: "View full image",
    title: "Latest Event",
    events: [
      {
        alt: "Poster for the National Seminar on Biomedical & Healthcare Technology",
        date: {
          day: "1",
          iso: "2024-07-01",
          monthYear: "July 2024",
        },
        href: officialEventsUrl,
        image: seminarImage,
        preserveImage: true,
        schedule: {
          iso: "2024-07-01T08:00:00+07:00",
          label: "8:00 AM–4:00 PM WIB",
        },
        title: "National Seminar on Biomedical & Healthcare Technology",
      },
      {
        alt: "Ultrasonography training for healthcare professionals",
        date: {
          day: "29",
          iso: "2024-06-29",
          monthYear: "June 2024",
        },
        href: officialEventsUrl,
        image: ultrasonographyImage,
        preserveImage: false,
        schedule: {
          iso: "2024-06-29T09:00:00+07:00",
          label: "9:00 AM–12:00 PM WIB",
        },
        title: "Basic Training in Ultrasonography (USG)",
      },
      {
        alt: "Doctor using a laptop to provide telemedicine services",
        date: {
          day: "29",
          iso: "2024-06-29",
          monthYear: "June 2024",
        },
        href: officialEventsUrl,
        image: telemedicineImage,
        preserveImage: false,
        schedule: {
          iso: "2024-06-29T13:00:00+07:00",
          label: "1:00–3:30 PM WIB",
        },
        title: "A Short Course on How to Develop a Telemedicine System",
      },
    ],
  },
} satisfies Record<Locale, LatestEventsContent>;

export function getLatestEventsContent(locale: Locale): LatestEventsContent {
  return latestEventsContent[locale];
}
