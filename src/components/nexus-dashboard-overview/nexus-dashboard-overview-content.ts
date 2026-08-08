import { nexusDashboardPreviewViewer } from "@/components/nexus-dashboard-shell/nexus-dashboard-shell-content";

export type DashboardMetricIconName =
  | "datasets"
  | "projects"
  | "publications"
  | "researchers";

export type DashboardMetric = {
  changeLabel: string;
  detail: string;
  icon: DashboardMetricIconName;
  id: string;
  label: string;
  tone: "blue" | "gold" | "green" | "violet";
  value: string;
};

export type ResearchActivitySeries = {
  id: string;
  label: string;
  tone: "navy" | "blue" | "pale";
  values: number[];
};

export type RecentProject = {
  id: string;
  leadResearcher: string;
  status: "Berjalan" | "Ditinjau" | "Perencanaan" | "Selesai";
  title: string;
  updatedAt: string;
};

export type NexusDashboardOverviewContent = {
  activityPeriodLabel: string;
  activitySeries: ResearchActivitySeries[];
  activitySubtitle: string;
  activityTitle: string;
  activityXAxis: string[];
  dateIso: string;
  dateLabel: string;
  greeting: string;
  intro: string;
  metrics: DashboardMetric[];
  previewLabel: string;
  recentProjects: RecentProject[];
  recentProjectsActionLabel: string;
  recentProjectsColumns: {
    leadResearcher: string;
    project: string;
    status: string;
    updatedAt: string;
  };
  recentProjectsTitle: string;
};

const metrics: DashboardMetric[] = [
  {
    changeLabel: "naik 14%",
    detail: "8 berjalan · 4 tahap awal",
    icon: "projects",
    id: "active-projects",
    label: "Proyek Aktif",
    tone: "blue",
    value: "12",
  },
  {
    changeLabel: "naik 18%",
    detail: "112 publik · 16 terbatas",
    icon: "datasets",
    id: "datasets",
    label: "Dataset",
    tone: "violet",
    value: "128",
  },
  {
    changeLabel: "naik 22%",
    detail: "Tahun berjalan",
    icon: "publications",
    id: "publications",
    label: "Publikasi",
    tone: "green",
    value: "96",
  },
  {
    changeLabel: "naik 9%",
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

export function getNexusDashboardOverviewPreviewContent(
  now = new Date(),
): NexusDashboardOverviewContent {
  return {
    activityPeriodLabel: "6 bulan terakhir",
    activitySeries,
    activitySubtitle: "Perkembangan data yang telah lolos peninjauan",
    activityTitle: "Aktivitas Riset",
    activityXAxis: ["Mar", "Apr", "Mei", "Jun", "Jul", "Agu"],
    dateIso: now.toISOString().slice(0, 10),
    dateLabel: formatDashboardDate(now),
    greeting: `Selamat datang kembali, ${nexusDashboardPreviewViewer.name}`,
    intro: "Berikut perkembangan utama di BHT Nexus hari ini.",
    metrics,
    previewLabel: "Data pratinjau UI",
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
