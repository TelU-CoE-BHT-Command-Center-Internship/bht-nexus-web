import type { StaticImageData } from "next/image";
import biomedicalLab from "@/assets/biomedical-lab-hero.jpg";
import bandungTechnoPark from "@/assets/hero-gallery/bandung-techno-park.jpg";
import openLibrary from "@/assets/hero-gallery/open-library-telkom.jpg";
import type { Locale } from "@/components/site-header/site-navigation";

export type HeroSlide = {
  id: "biomedical-innovation" | "knowledge" | "collaboration";
  image: StaticImageData;
  imagePosition: string;
  title: string;
  lead: string;
  action: {
    href: string;
    label: string;
  };
};

const heroSlides = {
  id: [
    {
      id: "biomedical-innovation",
      image: biomedicalLab,
      imagePosition: "center",
      title: "Inovasi biomedis untuk masa depan kesehatan yang lebih baik",
      lead: "Memajukan riset, teknologi, dan kolaborasi untuk menghadirkan solusi kesehatan yang berdampak bagi masyarakat.",
      action: {
        href: "/riset",
        label: "Jelajahi Riset Kami",
      },
    },
    {
      id: "knowledge",
      image: openLibrary,
      imagePosition: "center",
      title: "Pengetahuan yang mempercepat penemuan biomedis",
      lead: "Menghubungkan peneliti, mahasiswa, dan sumber daya bersama untuk mengubah pembelajaran lintas disiplin menjadi inovasi kesehatan.",
      action: {
        href: "/program",
        label: "Jelajahi Pendidikan & Program",
      },
    },
    {
      id: "collaboration",
      image: bandungTechnoPark,
      imagePosition: "center",
      title: "Kolaborasi yang menggerakkan inovasi kesehatan",
      lead: "Mempertemukan akademisi, industri, dan masyarakat untuk menerjemahkan hasil riset menjadi solusi yang memberi dampak nyata.",
      action: {
        href: "/kolaborasi",
        label: "Jelajahi Kolaborasi",
      },
    },
  ],
  en: [
    {
      id: "biomedical-innovation",
      image: biomedicalLab,
      imagePosition: "center",
      title: "Biomedical innovation for a healthier future",
      lead: "Advancing research, technology, and collaboration to create impactful healthcare solutions for society.",
      action: {
        href: "/en/research",
        label: "Explore Our Research",
      },
    },
    {
      id: "knowledge",
      image: openLibrary,
      imagePosition: "center",
      title: "Knowledge that accelerates biomedical discovery",
      lead: "Connecting researchers, students, and shared resources to turn interdisciplinary learning into healthcare innovation.",
      action: {
        href: "/en/programs",
        label: "Explore Education & Programs",
      },
    },
    {
      id: "collaboration",
      image: bandungTechnoPark,
      imagePosition: "center",
      title: "Collaboration that moves healthcare innovation forward",
      lead: "Bringing academia, industry, and communities together to transform research into solutions with measurable impact.",
      action: {
        href: "/en/collaboration",
        label: "Explore Collaboration",
      },
    },
  ],
} satisfies Record<Locale, HeroSlide[]>;

export function getHeroSlides(locale: Locale): HeroSlide[] {
  return heroSlides[locale];
}
