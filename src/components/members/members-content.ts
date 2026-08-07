import type { Locale } from "@/components/site-header/site-navigation";

export type MemberPortrait =
  | "ammar"
  | "dita"
  | "fathur"
  | "laily"
  | "miftadi"
  | "salsabila"
  | "suksmandhira";

export type MemberValueIcon =
  | "collaboration"
  | "commitment"
  | "impact"
  | "team";

type MemberValue = {
  description: string;
  icon: MemberValueIcon;
  title: string;
};

type ManagementMember = {
  description: string;
  field: string;
  name: string;
  portrait: MemberPortrait;
};

export type MembersContent = {
  breadcrumb: {
    about: string;
    current: string;
    home: string;
  };
  chair: {
    description: string;
    discipline: string;
    expertise: string;
    name: string;
  };
  collaboration: {
    action: string;
    description: string;
    title: string;
  };
  heroDescription: string;
  heroTitle: string;
  leadershipEyebrow: string;
  leadershipTitle: string;
  managementEyebrow: string;
  managementMembers: ManagementMember[];
  values: MemberValue[];
};

const membersContent = {
  id: {
    breadcrumb: {
      about: "Tentang",
      current: "Anggota",
      home: "Beranda",
    },
    chair: {
      description:
        "Memimpin arah strategis CoE BHT dalam pengembangan riset, inovasi, dan kolaborasi untuk solusi kesehatan yang berdampak nyata bagi masyarakat.",
      discipline: "Biomedical Engineering",
      expertise:
        "Biomedical Instrumentations, Medical Imaging & Image Processing, & Ultrasound Diagnostics Biomedical Engineering",
      name: "Dr. Hesty Susanti, S.T., M.T.",
    },
    collaboration: {
      action: "Hubungi Kami",
      description:
        "Kami terbuka untuk kolaborasi riset, inovasi, dan pengabdian bersama mitra institusi, industri, dan komunitas.",
      title: "Bergabung dan berkolaborasi untuk kesehatan yang lebih baik",
    },
    heroDescription:
      "Tim multidisiplin yang berkomitmen menghadirkan inovasi biomedis melalui riset, teknologi, dan kolaborasi untuk kesehatan masyarakat yang lebih baik.",
    heroTitle: "Anggota CoE BHT",
    leadershipEyebrow: "Kepemimpinan",
    leadershipTitle: "Ketua CoE BHT",
    managementEyebrow: "Tim Pengurus",
    managementMembers: [
      {
        description:
          "Mengawal komersialisasi hasil riset dan kekayaan intelektual serta koordinasi pengembangan bersama Bandung Techno Park.",
        field: "Bidang Inovasi dan Hilirisasi",
        name: "Muhammad Ammar Asyraf, S.T., M.T.",
        portrait: "ammar",
      },
      {
        description:
          "Mengembangkan kolaborasi dengan Fakultas Kedokteran dan rumah sakit, serta merintis bank masalah klinis.",
        field: "Bidang Hubungan Kerjasama Kedokteran",
        name: "Salsabila Aurellia, S.T., M.T.",
        portrait: "salsabila",
      },
      {
        description:
          "Mengelola peluang hibah eksternal nasional dan internasional serta kemitraan dengan industri.",
        field: "Bidang Grant dan Partnership",
        name: "Dr. Suksmandhira Harimurti, S.T., M.Eng.",
        portrait: "suksmandhira",
      },
      {
        description:
          "Mengelola peluang hibah eksternal nasional dan internasional serta kemitraan dengan industri.",
        field: "Bidang Grant dan Partnership",
        name: "Fathur Rahman, S.T., M.T.",
        portrait: "fathur",
      },
      {
        description:
          "Mengembangkan program pengabdian masyarakat sekaligus memperkuat branding CoE BHT.",
        field: "Bidang Pengabdian Masyarakat",
        name: "Laily Ade Oktaviana, S.T., M.T.",
        portrait: "laily",
      },
      {
        description:
          "Mengembangkan kompetensi dan kapasitas sumber daya manusia di lingkungan CoE BHT.",
        field: "Bidang Pengembangan Sumber Daya Manusia",
        name: "Ir. Miftadi Sudjai, M.Sc., Ph.D.",
        portrait: "miftadi",
      },
      {
        description:
          "Menjaga ketertiban administrasi untuk kebutuhan audit dan Knowledge Management CoE BHT.",
        field: "Bidang Internal Quality dan Audit",
        name: "Dita Puspitasari, S.T., B.Sc., M.T.",
        portrait: "dita",
      },
    ],
    values: [
      {
        description: "Keahlian beragam dari berbagai bidang ilmu",
        icon: "team",
        title: "Tim Multidisiplin",
      },
      {
        description: "Dedikasi tinggi untuk riset dan inovasi",
        icon: "commitment",
        title: "Komitmen Unggul",
      },
      {
        description: "Berkolaborasi dengan mitra nasional & internasional",
        icon: "collaboration",
        title: "Kolaborasi Global",
      },
      {
        description: "Solusi biomedis untuk masyarakat",
        icon: "impact",
        title: "Dampak Nyata",
      },
    ],
  },
  en: {
    breadcrumb: {
      about: "About",
      current: "Members",
      home: "Home",
    },
    chair: {
      description:
        "Leads the strategic direction of CoE BHT in advancing research, innovation, and collaboration for healthcare solutions that create meaningful public impact.",
      discipline: "Biomedical Engineering",
      expertise:
        "Biomedical Instrumentations, Medical Imaging & Image Processing, & Ultrasound Diagnostics Biomedical Engineering",
      name: "Dr. Hesty Susanti, S.T., M.T.",
    },
    collaboration: {
      action: "Contact Us",
      description:
        "We welcome research, innovation, and community-service collaborations with institutions, industry partners, and communities.",
      title: "Collaborate with us for better health",
    },
    heroDescription:
      "A multidisciplinary team committed to advancing biomedical innovation through research, technology, and collaboration for healthier communities.",
    heroTitle: "CoE BHT Members",
    leadershipEyebrow: "Leadership",
    leadershipTitle: "Head of CoE BHT",
    managementEyebrow: "Management Team",
    managementMembers: [
      {
        description:
          "Oversees research commercialization and intellectual property while coordinating development with Bandung Techno Park.",
        field: "Innovation and Downstream Development",
        name: "Muhammad Ammar Asyraf, S.T., M.T.",
        portrait: "ammar",
      },
      {
        description:
          "Develops collaboration with medical schools and hospitals while initiating a clinical problem bank.",
        field: "Medical Partnership Relations",
        name: "Salsabila Aurellia, S.T., M.T.",
        portrait: "salsabila",
      },
      {
        description:
          "Manages national and international external grant opportunities and industry partnerships.",
        field: "Grants and Partnerships",
        name: "Dr. Suksmandhira Harimurti, S.T., M.Eng.",
        portrait: "suksmandhira",
      },
      {
        description:
          "Manages national and international external grant opportunities and industry partnerships.",
        field: "Grants and Partnerships",
        name: "Fathur Rahman, S.T., M.T.",
        portrait: "fathur",
      },
      {
        description:
          "Develops community-service programs while strengthening the CoE BHT institutional brand.",
        field: "Community Service",
        name: "Laily Ade Oktaviana, S.T., M.T.",
        portrait: "laily",
      },
      {
        description:
          "Develops the competencies and capacity of people across the CoE BHT environment.",
        field: "Human Resources Development",
        name: "Ir. Miftadi Sudjai, M.Sc., Ph.D.",
        portrait: "miftadi",
      },
      {
        description:
          "Maintains administrative readiness for CoE BHT audit and Knowledge Management activities.",
        field: "Internal Quality and Audit",
        name: "Dita Puspitasari, S.T., B.Sc., M.T.",
        portrait: "dita",
      },
    ],
    values: [
      {
        description: "Diverse expertise across scientific disciplines",
        icon: "team",
        title: "Multidisciplinary Team",
      },
      {
        description: "A strong commitment to research and innovation",
        icon: "commitment",
        title: "Commitment to Excellence",
      },
      {
        description: "Collaboration with national & international partners",
        icon: "collaboration",
        title: "Global Collaboration",
      },
      {
        description: "Biomedical solutions for the wider community",
        icon: "impact",
        title: "Meaningful Impact",
      },
    ],
  },
} satisfies Record<Locale, MembersContent>;

export function getMembersContent(locale: Locale): MembersContent {
  return membersContent[locale];
}
