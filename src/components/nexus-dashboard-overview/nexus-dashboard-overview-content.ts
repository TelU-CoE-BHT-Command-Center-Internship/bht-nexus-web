import jasmineCallForPapersPoster from "@/assets/featured-programs/jasmine-call-for-papers-2026.png";
import ultrasonographyTrainingImage from "@/assets/news-highlights/ultrasonography-training.webp";
import type {
  DashboardAnnouncement,
  DashboardFeaturedProgram,
  DashboardMetric,
  DashboardRecentActivity,
  NexusDashboardOverviewContent,
} from "@/components/nexus-dashboard-overview/nexus-dashboard-overview-types";

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

/** Bagian dashboard yang dibaca dari server; kosong bila server menolaknya. */
export type NexusDashboardLiveContent = {
  announcements: DashboardAnnouncement[];
  metrics: DashboardMetric[];
  recentActivities: DashboardRecentActivity[];
};

/**
 * Featured programs are real static content. Metrics, announcements, and the
 * activity feed come from the server. The activity chart and recent projects
 * have no backend source yet, so they stay empty rather than showing invented
 * numbers under a real signed-in identity.
 */
export function getNexusDashboardOverviewContent(
  viewerName: string,
  now = new Date(),
  live: NexusDashboardLiveContent = {
    announcements: [],
    metrics: [],
    recentActivities: [],
  },
): NexusDashboardOverviewContent {
  return {
    announcements: live.announcements,
    activityPeriodLabel: "6 bulan terakhir",
    activitySeries: [],
    activitySubtitle: "Perkembangan data yang telah lolos peninjauan",
    activityTitle: "Aktivitas Riset",
    activityXAxis: ["Mar", "Apr", "Mei", "Jun", "Jul", "Agu"],
    dateIso: formatDashboardIsoDate(now),
    dateLabel: formatDashboardDate(now),
    featuredPrograms,
    greeting: `Selamat datang kembali, ${viewerName}`,
    intro:
      "Memajukan riset dan inovasi biomedis serta teknologi kesehatan bersama.",
    metrics: live.metrics,
    recentActivities: live.recentActivities,
    recentActivitiesActionLabel: "Lihat semua",
    recentActivitiesTitle: "Aktivitas Terkini",
    recentProjects: [],
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
