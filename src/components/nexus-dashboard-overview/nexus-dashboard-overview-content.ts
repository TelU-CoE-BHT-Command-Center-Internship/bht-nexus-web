import jasmineCallForPapersPoster from "@/assets/featured-programs/jasmine-call-for-papers-2026.png";
import ultrasonographyTrainingImage from "@/assets/news-highlights/ultrasonography-training.webp";
import type {
  DashboardAnnouncement,
  DashboardFeaturedProgram,
  DashboardMetric,
  DashboardRecentActivity,
  NexusDashboardOverviewContent,
  RecentProject,
  ResearchActivitySeries,
} from "@/components/nexus-dashboard-overview/nexus-dashboard-overview-types";
import { nexusDashboardPreviewViewer } from "@/components/nexus-dashboard-shell/nexus-dashboard-shell-content";

const announcements: DashboardAnnouncement[] = [
  {
    actionLabel: "Lihat data anggota",
    deadlineAt: "2026-08-14T16:00:00+07:00",
    deadlineLabel: "Batas konfirmasi: 14 Agustus 2026",
    expiresAt: "2026-08-14T23:59:59+07:00",
    href: "https://coe-bht.telkomuniversity.ac.id/#staf",
    id: "research-data-refresh-2026-08",
    summary:
      "Mohon peneliti memverifikasi profil, publikasi, dataset, dan proyek agar ringkasan BHT Nexus tetap akurat.",
    title: "Pemutakhiran Data Riset CoE BHT 2026",
  },
  {
    actionLabel: "Lihat fokus riset",
    deadlineAt: "2026-08-18T09:00:00+07:00",
    deadlineLabel: "Selasa, 18 Agustus 2026 · 09.00 WIB",
    expiresAt: "2026-08-18T23:59:59+07:00",
    href: "https://coe-bht.telkomuniversity.ac.id/#riset",
    id: "digital-health-coordination-2026-08",
    summary:
      "Agenda membahas progres riset, kebutuhan dataset, dan peluang kolaborasi antaranggota CoE BHT.",
    title: "Koordinasi Riset Digital Health Semester Ganjil",
  },
  {
    actionLabel: "Lihat program",
    deadlineAt: "2026-08-28T16:00:00+07:00",
    deadlineLabel: "Batas pendaftaran minat: 28 Agustus 2026",
    expiresAt: "2026-08-28T23:59:59+07:00",
    href: "https://coe-bht.telkomuniversity.ac.id/#pelatihan_seminar",
    id: "ultrasonography-training-interest-2026",
    summary:
      "Anggota dapat mendaftarkan minat awal untuk pelatihan ultrasonografi dan diagnostik pencitraan.",
    title: "Pendaftaran Minat Basic Training Ultrasonography",
  },
];

const recentActivities: DashboardRecentActivity[] = [
  {
    action: "diperbarui",
    detail: "oleh Zaenal · Data & Analytics",
    detailFull: "oleh Muhammad Zaenal Abidin Abdurrahman · Data & Analytics",
    icon: "document",
    id: "dashboard-delivery-plan-updated",
    occurredAt: "2026-08-07",
    subject: "Rencana pengembangan BHT Nexus",
    timeLabel: "7 Agu",
    tone: "violet",
  },
  {
    action: "ditetapkan sebagai fokus kerja tim",
    detail: "oleh Ammar · Supervisor",
    detailFull: "oleh Muhammad Ammar Asyraf · Supervisor",
    icon: "project",
    id: "dashboard-focus-confirmed",
    occurredAt: "2026-08-03",
    subject: "Dashboard internal BHT Nexus",
    timeLabel: "3 Agu",
    tone: "blue",
  },
  {
    action: "dibagikan untuk peninjauan",
    detail: "oleh Caldera · Full-stack Web",
    detailFull: "oleh Fa Ainama Caldera Sudibyo · Full-stack Web",
    icon: "review",
    id: "landing-page-review-shared",
    occurredAt: "2026-07-29",
    subject: "Rancangan landing page BHT Nexus",
    timeLabel: "29 Jul",
    tone: "teal",
  },
  {
    action: "disepakati untuk alur data awal",
    detail: "oleh Rifqi · AI Engineering & Data Science",
    detailFull: "oleh M. Rifqi Dzaky Azhad · AI Engineering & Data Science",
    icon: "data",
    id: "sinta-review-flow-agreed",
    occurredAt: "2026-07-18",
    subject: "Alur pemeriksaan data SINTA",
    timeLabel: "18 Jul",
    tone: "green",
  },
  {
    action: "dipublikasikan untuk ditinjau tim",
    detail: "oleh Caldera · Rekayasa Perangkat Lunak",
    detailFull: "oleh Fa Ainama Caldera Sudibyo · Rekayasa Perangkat Lunak",
    icon: "document",
    id: "srs-draft-published",
    occurredAt: "2026-07-14",
    subject: "Dokumen kebutuhan BHT Nexus",
    timeLabel: "14 Jul",
    tone: "violet",
  },
  {
    action: "bergabung ke tim",
    detail: "Dashboard Automation Specialist · Data & Analytics",
    icon: "member",
    id: "zaenal-joined-dashboard-team",
    occurredAt: "2026-06-22",
    subject: "Zaenal",
    subjectFull: "Muhammad Zaenal Abidin Abdurrahman",
    timeLabel: "22 Jun",
    tone: "gold",
  },
];

const featuredPrograms: DashboardFeaturedProgram[] = [
  {
    badge: "Call for Papers",
    description:
      "JASMINE menerima naskah AI dan machine learning, termasuk biomedical engineering serta bioinformatika.",
    details: [
      {
        icon: "calendar",
        id: "publication-schedule",
        label: "Jadwal terbit",
        value: "Mei & November",
      },
      {
        icon: "audience",
        id: "research-scope",
        label: "Cakupan",
        value: "AI/ML & Biomedis",
      },
      {
        icon: "document",
        id: "publication-fee",
        label: "Biaya publikasi",
        value: "Gratis",
      },
    ],
    focalPoint: { x: 50, y: 18 },
    href: "https://journals.telkomuniversity.ac.id/jasmine/announcement/view/59",
    id: "jasmine-call-for-papers-2026",
    image: jasmineCallForPapersPoster,
    imageAlt:
      "Poster Call for Papers JASMINE, Journal of Intelligent Systems and Machine Learning",
    linkLabel: "Pelajari program",
    title: "JASMINE Call for Papers 2026",
  },
  {
    badge: "Program Pelatihan",
    description:
      "Program penguatan kompetensi pencitraan biomedis melalui pelatihan ultrasonografi untuk anggota dan mitra CoE BHT.",
    details: [
      {
        icon: "calendar",
        id: "program-status",
        label: "Status",
        value: "Segera hadir",
      },
      {
        icon: "audience",
        id: "program-audience",
        label: "Peserta",
        value: "Anggota & mitra",
      },
      {
        icon: "document",
        id: "program-focus",
        label: "Fokus",
        value: "Pencitraan klinis",
      },
    ],
    focalPoint: { x: 34, y: 48 },
    href: "https://coe-bht.telkomuniversity.ac.id/#pelatihan_seminar",
    id: "basic-training-ultrasonography",
    image: ultrasonographyTrainingImage,
    imageAlt: "Tenaga medis melakukan pemeriksaan ultrasonografi kepada pasien",
    linkLabel: "Lihat program",
    title: "Basic Training Ultrasonography",
  },
];

const metrics: DashboardMetric[] = [
  {
    changeDescription: "Meningkat 14 persen dibanding Juli 2026",
    changeDirection: "up",
    changeLabel: "14%",
    comparisonLabel: "dibanding Juli 2026",
    detail: "8 berjalan · 4 tahap awal",
    icon: "projects",
    id: "active-projects",
    label: "Proyek Aktif",
    tone: "blue",
    value: "12",
  },
  {
    changeDescription: "Tetap dibanding Juli 2026",
    changeDirection: "steady",
    changeLabel: "0%",
    comparisonLabel: "dibanding Juli 2026",
    detail: "112 terkurasi · 16 terbatas",
    icon: "datasets",
    id: "datasets",
    label: "Dataset",
    tone: "violet",
    value: "128",
  },
  {
    changeDescription: "Menurun 3 persen dibanding Juli 2026",
    changeDirection: "down",
    changeLabel: "3%",
    comparisonLabel: "dibanding Juli 2026",
    detail: "Tahun berjalan",
    icon: "publications",
    id: "publications",
    label: "Publikasi",
    tone: "green",
    value: "96",
  },
  {
    changeDescription: "Meningkat 9 persen dibanding Juli 2026",
    changeDirection: "up",
    changeLabel: "9%",
    comparisonLabel: "dibanding Juli 2026",
    detail: "Anggota aktif",
    icon: "researchers",
    id: "researchers",
    label: "Peneliti",
    tone: "gold",
    value: "42",
  },
];

const activitySeries: ResearchActivitySeries[] = [
  {
    id: "projects",
    label: "Proyek",
    tone: "navy",
    values: [14, 24, 32, 47, 50, 56],
  },
  {
    id: "publications",
    label: "Publikasi",
    tone: "blue",
    values: [7, 16, 18, 25, 29, 34],
  },
  {
    id: "datasets",
    label: "Dataset",
    tone: "pale",
    values: [2, 10, 8, 13, 15, 18],
  },
];

const recentProjects: RecentProject[] = [
  {
    id: "integrated-biosignal-monitoring",
    leadResearcher: "Suksmandhira Harimurti",
    status: "Berjalan",
    title: "Sistem Pemantauan Biosinyal Terintegrasi",
    updatedAt: "8 Agu 2026",
  },
  {
    id: "primary-care-telemedicine",
    leadResearcher: "Hesty Susanti",
    status: "Ditinjau",
    title: "Platform Telemedisin untuk Layanan Primer",
    updatedAt: "7 Agu 2026",
  },
  {
    id: "assistive-navigation",
    leadResearcher: "Muhammad Ammar Asyraf",
    status: "Selesai",
    title: "Navigasi Asistif Berbasis Computer Vision",
    updatedAt: "5 Agu 2026",
  },
  {
    id: "clinical-ultrasonography-training",
    leadResearcher: "Fathur Rahman",
    status: "Berjalan",
    title: "Pelatihan Ultrasonografi Klinis",
    updatedAt: "3 Agu 2026",
  },
  {
    id: "elder-rehabilitation",
    leadResearcher: "Dita Puspitasari",
    status: "Perencanaan",
    title: "Rehabilitasi Lansia Berbasis Sensor",
    updatedAt: "1 Agu 2026",
  },
];

function formatDashboardDate(now: Date) {
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    timeZone: "Asia/Jakarta",
    weekday: "long",
    year: "numeric",
  }).format(now);
}

function formatDashboardIsoDate(now: Date) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    day: "2-digit",
    month: "2-digit",
    timeZone: "Asia/Jakarta",
    year: "numeric",
  }).formatToParts(now);
  const part = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((item) => item.type === type)?.value ?? "";

  return `${part("year")}-${part("month")}-${part("day")}`;
}

/**
 * Presentation-ready dashboard snapshot. The server adapter can replace the
 * values supplied here without changing the component contract or layout.
 */
export function getNexusDashboardOverviewContent(
  now = new Date(),
): NexusDashboardOverviewContent {
  return {
    announcements: announcements
      .filter(
        (announcement) =>
          new Date(announcement.expiresAt).getTime() >= now.getTime(),
      )
      .sort(
        (first, second) =>
          new Date(first.deadlineAt).getTime() -
          new Date(second.deadlineAt).getTime(),
      ),
    activityPeriodLabel: "6 bulan terakhir",
    activitySeries,
    activitySubtitle: "Perkembangan data yang telah lolos peninjauan",
    activityTitle: "Aktivitas Riset",
    activityXAxis: ["Mar", "Apr", "Mei", "Jun", "Jul", "Agu"],
    dateIso: formatDashboardIsoDate(now),
    dateLabel: formatDashboardDate(now),
    featuredPrograms,
    greeting: `Selamat datang kembali, ${nexusDashboardPreviewViewer.name}`,
    intro:
      "Memajukan riset dan inovasi biomedis serta teknologi kesehatan bersama.",
    metrics,
    recentActivities,
    recentActivitiesActionLabel: "Lihat semua",
    recentActivitiesTitle: "Aktivitas Terkini",
    recentProjects,
    recentProjectsActionLabel: "Lihat semua proyek",
    recentProjectsColumns: {
      leadResearcher: "Peneliti Utama",
      project: "Proyek",
      status: "Status",
      updatedAt: "Diperbarui",
    },
    recentProjectsTitle: "Proyek Terkini",
  };
}
