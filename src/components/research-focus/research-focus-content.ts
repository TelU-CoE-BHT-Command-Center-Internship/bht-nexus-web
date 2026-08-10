import type { StaticImageData } from "next/image";
import assistiveNavigationImage from "@/assets/research/assistive-navigation.webp";
import biosignalMonitoringImage from "@/assets/research/biosignal-monitoring.webp";
import elderRehabilitationImage from "@/assets/research/elder-rehabilitation.webp";
import labTeamImage from "@/assets/research/lab-team.webp";
import medicalImagingImage from "@/assets/research/medical-imaging.webp";
import medicalTrainingImage from "@/assets/research/medical-training.webp";
import researchCollaborationImage from "@/assets/research/research-collaboration.webp";
import telemedicineImage from "@/assets/research/telemedicine.webp";
import ultrasoundImage from "@/assets/research/ultrasound.webp";
import type { Locale } from "@/i18n/locales";

export type ResearchTopic = {
  id: string;
  title: string;
  description: string;
  image: StaticImageData;
  imageAlt: string;
  href: string;
};

export type ResearchCategory = {
  id: string;
  label: string;
  summary: string;
  topics: ResearchTopic[];
};

export type ResearchFocusContent = {
  title: string;
  metricsTitle: string;
  metricsSubtitle: string;
  categoryNavigationLabel: string;
  topicNavigationLabel: string;
  exploreLabel: string;
  categories: ResearchCategory[];
};

const researchFocusContent = {
  id: {
    title: "Riset",
    metricsTitle: "Fakta CoE BHT",
    metricsSubtitle: "Cakupan riset dan program saat ini",
    categoryNavigationLabel: "Kategori riset",
    topicNavigationLabel: "Topik pada kategori",
    exploreLabel: "Pelajari lebih lanjut",
    categories: [
      {
        id: "focus-areas",
        label: "Fokus Riset",
        summary:
          "Arah utama yang menghubungkan rekayasa biomedis cerdas, layanan kesehatan digital, dan kesejahteraan masyarakat.",
        topics: [
          {
            id: "intelligent-biomedical-engineering",
            title: "Intelligent Biomedical Engineering",
            description:
              "Mengembangkan sistem biomedis cerdas yang menghubungkan instrumentasi, pemrosesan data, dan rekayasa untuk menjawab kebutuhan kesehatan.",
            image: labTeamImage,
            imageAlt: "Tim peneliti bekerja bersama di laboratorium biomedis.",
            href: "/riset#intelligent-biomedical-engineering",
          },
          {
            id: "digital-healthcare-systems",
            title: "Digital Healthcare Systems",
            description:
              "Merancang layanan kesehatan digital dan telemedisin agar pengetahuan, pemantauan, dan dukungan kesehatan dapat menjangkau lebih banyak masyarakat.",
            image: telemedicineImage,
            imageAlt:
              "Konsultasi kesehatan jarak jauh melalui perangkat digital.",
            href: "/riset#digital-healthcare-systems",
          },
          {
            id: "social-psychological-wellbeing",
            title: "Social & Psychological Well-being",
            description:
              "Menggabungkan pendekatan teknologi dan sosial untuk mendukung kualitas hidup, kemandirian, serta kesejahteraan psikologis masyarakat.",
            image: elderRehabilitationImage,
            imageAlt:
              "Pendamping membantu seorang lansia menjalani latihan rehabilitasi.",
            href: "/riset#social-psychological-wellbeing",
          },
        ],
      },
      {
        id: "expertise",
        label: "Keahlian",
        summary:
          "Mencakup instrumentasi, citra dan biosinyal, telemedisin, asesmen teknologi, promosi kesehatan, serta rehabilitasi.",
        topics: [
          {
            id: "biomedical-instrumentation",
            title: "Instrumentasi Biomedis",
            description:
              "Merekayasa perangkat, sensor, dan sistem pengukuran yang membantu memperoleh data fisiologis secara aman, terukur, dan andal.",
            image: biosignalMonitoringImage,
            imageAlt:
              "Perangkat pemantauan biosinyal menampilkan data fisiologis pasien.",
            href: "/riset#biomedical-instrumentation",
          },
          {
            id: "medical-imaging-biosignals",
            title: "Citra Medis & Biosinyal",
            description:
              "Mengolah citra dan sinyal biomedis menjadi informasi yang bermakna untuk mendukung analisis, pemantauan, dan pengambilan keputusan.",
            image: medicalImagingImage,
            imageAlt:
              "Tenaga medis mengoperasikan perangkat pencitraan resonansi magnetik.",
            href: "/riset#medical-imaging-biosignals",
          },
          {
            id: "ict-healthcare-telemedicine",
            title: "ICT untuk Kesehatan & Telemedisin",
            description:
              "Menghubungkan teknologi informasi dan layanan kesehatan melalui platform yang aman, mudah digunakan, dan relevan dengan kebutuhan pengguna.",
            image: telemedicineImage,
            imageAlt:
              "Dokter memberikan layanan konsultasi kesehatan secara daring.",
            href: "/riset#ict-healthcare-telemedicine",
          },
          {
            id: "health-technology-assessment",
            title: "Kajian Teknologi Kesehatan",
            description:
              "Mengkaji manfaat, kelayakan, dan nilai suatu teknologi kesehatan agar inovasi dapat dikembangkan dengan dampak yang terukur.",
            image: researchCollaborationImage,
            imageAlt:
              "Peneliti berdiskusi dan menganalisis hasil eksperimen di laboratorium.",
            href: "/riset#health-technology-assessment",
          },
          {
            id: "health-promotion-social-engineering",
            title: "Promosi Kesehatan & Rekayasa Sosial",
            description:
              "Merancang pendekatan berbasis masyarakat untuk membantu teknologi dan pengetahuan kesehatan diterima serta digunakan secara berkelanjutan.",
            image: medicalTrainingImage,
            imageAlt: "Tenaga kesehatan belajar bersama dalam sesi pelatihan.",
            href: "/riset#health-promotion-social-engineering",
          },
          {
            id: "rehabilitation-ultrasound",
            title: "Rehabilitasi & Diagnostik Ultrasonografi",
            description:
              "Mendukung asesmen dan pemulihan melalui rekayasa rehabilitasi serta pemanfaatan teknologi ultrasonografi diagnostik.",
            image: ultrasoundImage,
            imageAlt:
              "Tenaga medis melakukan pemeriksaan dengan perangkat ultrasonografi.",
            href: "/riset#rehabilitation-ultrasound",
          },
        ],
      },
      {
        id: "flagship-projects",
        label: "Proyek Unggulan",
        summary:
          "Inisiatif terapan untuk navigasi asistif, mitigasi risiko jatuh, dan perlindungan keselamatan berbasis teknologi.",
        topics: [
          {
            id: "fall-risk-mitigation",
            title: "Mitigasi Risiko Jatuh pada Lansia",
            description:
              "Mengembangkan pendekatan yang membantu mengenali dan mengurangi risiko jatuh untuk mendukung keselamatan serta kemandirian lansia.",
            image: elderRehabilitationImage,
            imageAlt:
              "Seorang lansia berlatih gerak dengan pendampingan profesional.",
            href: "/riset#fall-risk-mitigation",
          },
          {
            id: "plan-assistive-navigation",
            title: "PLAN: Navigasi Asistif Berbasis AI",
            description:
              "Perangkat portabel berbiaya rendah yang memanfaatkan kecerdasan artifisial untuk membantu navigasi pengguna dengan hambatan penglihatan.",
            image: assistiveNavigationImage,
            imageAlt:
              "Seseorang dengan hambatan penglihatan berjalan menggunakan tongkat putih.",
            href: "/riset#plan-assistive-navigation",
          },
          {
            id: "protective-airbag",
            title: "Pelindung Otomatis untuk Keselamatan Jatuh",
            description:
              "Eksplorasi perangkat perlindungan otomatis untuk mengurangi dampak cedera ketika insiden jatuh pada pengguna berisiko terjadi.",
            image: biosignalMonitoringImage,
            imageAlt:
              "Perangkat kesehatan digital memantau kondisi pengguna secara langsung.",
            href: "/riset#protective-airbag",
          },
        ],
      },
      {
        id: "programs",
        label: "Program",
        summary:
          "Seminar, pelatihan ultrasonografi, dan short course telemedisin untuk memperkuat kapasitas akademisi dan praktisi.",
        topics: [
          {
            id: "biomedical-healthcare-seminar",
            title: "Seminar Biomedical & Healthcare Technology",
            description:
              "Ruang pertukaran pengetahuan yang mempertemukan akademisi, praktisi, mahasiswa, dan mitra untuk membahas perkembangan teknologi kesehatan.",
            image: medicalTrainingImage,
            imageAlt:
              "Kelompok tenaga kesehatan mengikuti sesi pembelajaran bersama.",
            href: "/program#biomedical-healthcare-seminar",
          },
          {
            id: "ultrasonography-training",
            title: "Pelatihan Dasar Ultrasonografi",
            description:
              "Pembelajaran terapan untuk memperkuat pemahaman dasar penggunaan, interpretasi, dan pengembangan teknologi ultrasonografi.",
            image: ultrasoundImage,
            imageAlt:
              "Praktisi melakukan demonstrasi pemeriksaan ultrasonografi.",
            href: "/program#ultrasonography-training",
          },
          {
            id: "telemedicine-short-course",
            title: "Short Course Sistem Telemedisin",
            description:
              "Program pengembangan kapasitas untuk merancang layanan telemedisin yang berorientasi pada kebutuhan pengguna dan konteks layanan kesehatan.",
            image: telemedicineImage,
            imageAlt:
              "Konsultasi telemedisin berlangsung melalui layar komputer.",
            href: "/program#telemedicine-short-course",
          },
        ],
      },
    ],
  },
  en: {
    title: "Research",
    metricsTitle: "CoE BHT in Numbers",
    metricsSubtitle: "Our current research and programme portfolio",
    categoryNavigationLabel: "Research categories",
    topicNavigationLabel: "Topics in category",
    exploreLabel: "Explore this topic",
    categories: [
      {
        id: "focus-areas",
        label: "Focus areas",
        summary:
          "Core directions connecting intelligent biomedical engineering, digital healthcare, and community well-being.",
        topics: [
          {
            id: "intelligent-biomedical-engineering",
            title: "Intelligent Biomedical Engineering",
            description:
              "Developing intelligent biomedical systems that connect instrumentation, data processing, and engineering to address real healthcare needs.",
            image: labTeamImage,
            imageAlt:
              "A research team working together in a biomedical laboratory.",
            href: "/en/research#intelligent-biomedical-engineering",
          },
          {
            id: "digital-healthcare-systems",
            title: "Digital Healthcare Systems",
            description:
              "Designing digital health and telemedicine services that broaden access to health knowledge, monitoring, and support.",
            image: telemedicineImage,
            imageAlt:
              "A remote healthcare consultation taking place through a digital device.",
            href: "/en/research#digital-healthcare-systems",
          },
          {
            id: "social-psychological-wellbeing",
            title: "Social & Psychological Well-being",
            description:
              "Combining technological and social approaches to support quality of life, independence, and psychological well-being.",
            image: elderRehabilitationImage,
            imageAlt:
              "A trainer helping an older adult with a rehabilitation exercise.",
            href: "/en/research#social-psychological-wellbeing",
          },
        ],
      },
      {
        id: "expertise",
        label: "Expertise",
        summary:
          "Spanning instrumentation, imaging and biosignals, telemedicine, technology assessment, health promotion, and rehabilitation.",
        topics: [
          {
            id: "biomedical-instrumentation",
            title: "Biomedical Instrumentation",
            description:
              "Engineering devices, sensors, and measurement systems that capture physiological data safely, consistently, and reliably.",
            image: biosignalMonitoringImage,
            imageAlt:
              "A biosignal monitor displaying a patient's physiological data.",
            href: "/en/research#biomedical-instrumentation",
          },
          {
            id: "medical-imaging-biosignals",
            title: "Medical Imaging & Biosignals",
            description:
              "Transforming biomedical images and signals into meaningful information for analysis, monitoring, and evidence-based decisions.",
            image: medicalImagingImage,
            imageAlt:
              "A healthcare professional operating magnetic resonance imaging equipment.",
            href: "/en/research#medical-imaging-biosignals",
          },
          {
            id: "ict-healthcare-telemedicine",
            title: "ICT for Healthcare & Telemedicine",
            description:
              "Connecting information technology and healthcare through platforms that are secure, usable, and relevant to their users.",
            image: telemedicineImage,
            imageAlt: "A doctor providing a healthcare consultation online.",
            href: "/en/research#ict-healthcare-telemedicine",
          },
          {
            id: "health-technology-assessment",
            title: "Healthcare Technology Assessment",
            description:
              "Evaluating the benefits, feasibility, and value of healthcare technologies so innovation can progress with measurable impact.",
            image: researchCollaborationImage,
            imageAlt:
              "Researchers reviewing experimental results together in a laboratory.",
            href: "/en/research#health-technology-assessment",
          },
          {
            id: "health-promotion-social-engineering",
            title: "Health Promotion & Social Engineering",
            description:
              "Designing community-centred approaches that help health technologies and knowledge be adopted sustainably.",
            image: medicalTrainingImage,
            imageAlt:
              "Healthcare professionals learning together during a training session.",
            href: "/en/research#health-promotion-social-engineering",
          },
          {
            id: "rehabilitation-ultrasound",
            title: "Rehabilitation & Ultrasound Diagnostics",
            description:
              "Supporting assessment and recovery through rehabilitation engineering and the application of diagnostic ultrasound technology.",
            image: ultrasoundImage,
            imageAlt:
              "A healthcare professional carrying out an ultrasound examination.",
            href: "/en/research#rehabilitation-ultrasound",
          },
        ],
      },
      {
        id: "flagship-projects",
        label: "Flagship projects",
        summary:
          "Applied initiatives for assistive navigation, fall-risk mitigation, and technology-enabled safety protection.",
        topics: [
          {
            id: "fall-risk-mitigation",
            title: "Fall-risk Mitigation for Older Adults",
            description:
              "Developing approaches that help identify and reduce fall risk to support the safety and independence of older adults.",
            image: elderRehabilitationImage,
            imageAlt:
              "An older adult practicing movement with professional support.",
            href: "/en/research#fall-risk-mitigation",
          },
          {
            id: "plan-assistive-navigation",
            title: "PLAN: AI-guided Assistive Navigation",
            description:
              "A portable, low-cost device that uses artificial intelligence to support navigation for people with visual impairments.",
            image: assistiveNavigationImage,
            imageAlt: "A visually impaired person walking with a white cane.",
            href: "/en/research#plan-assistive-navigation",
          },
          {
            id: "protective-airbag",
            title: "Automatic Protection for Fall Safety",
            description:
              "Exploring an automatic protection device designed to reduce the potential for injury when a high-risk fall occurs.",
            image: biosignalMonitoringImage,
            imageAlt:
              "A digital healthcare device monitoring its user's condition.",
            href: "/en/research#protective-airbag",
          },
        ],
      },
      {
        id: "programs",
        label: "Programs",
        summary:
          "Seminars, ultrasonography training, and telemedicine short courses that strengthen academic and professional capacity.",
        topics: [
          {
            id: "biomedical-healthcare-seminar",
            title: "Biomedical & Healthcare Technology Seminar",
            description:
              "A knowledge-sharing forum connecting academics, practitioners, students, and partners around advances in healthcare technology.",
            image: medicalTrainingImage,
            imageAlt:
              "A group of healthcare professionals participating in a learning session.",
            href: "/en/programs#biomedical-healthcare-seminar",
          },
          {
            id: "ultrasonography-training",
            title: "Basic Ultrasonography Training",
            description:
              "Applied learning that builds foundational understanding of ultrasound technology, interpretation, and development.",
            image: ultrasoundImage,
            imageAlt: "A practitioner demonstrating an ultrasound examination.",
            href: "/en/programs#ultrasonography-training",
          },
          {
            id: "telemedicine-short-course",
            title: "Telemedicine System Short Course",
            description:
              "A capacity-building program for designing telemedicine services around user needs and healthcare delivery contexts.",
            image: telemedicineImage,
            imageAlt:
              "A telemedicine consultation taking place on a computer screen.",
            href: "/en/programs#telemedicine-short-course",
          },
        ],
      },
    ],
  },
} satisfies Record<Locale, ResearchFocusContent>;

export function getResearchFocusContent(locale: Locale): ResearchFocusContent {
  return researchFocusContent[locale];
}
