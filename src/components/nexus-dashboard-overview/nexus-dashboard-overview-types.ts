import type { StaticImageData } from "next/image";

export type DashboardMetricIconName =
  | "datasets"
  | "projects"
  | "publications"
  | "researchers";

export type DashboardMetric = {
  changeLabel: string;
  changeDescription: string;
  changeDirection: "down" | "steady" | "up";
  comparisonLabel: string;
  detail: string;
  icon: DashboardMetricIconName;
  id: string;
  label: string;
  tone: "blue" | "gold" | "green" | "violet";
  value: string;
};

export type DashboardAnnouncement = {
  actionLabel: string;
  deadlineAt: string;
  deadlineLabel: string;
  expiresAt: string;
  href: string;
  id: string;
  summary: string;
  title: string;
};

export type DashboardActivityIconName =
  | "data"
  | "document"
  | "member"
  | "project"
  | "review";

export type DashboardRecentActivity = {
  action: string;
  detail: string;
  detailFull?: string;
  icon: DashboardActivityIconName;
  id: string;
  occurredAt: string;
  subject: string;
  subjectFull?: string;
  timeLabel: string;
  tone: "blue" | "gold" | "green" | "teal" | "violet";
};

export type DashboardProgramDetailIconName =
  | "audience"
  | "calendar"
  | "document";

export type DashboardFeaturedProgram = {
  badge: string;
  description: string;
  details: Array<{
    icon: DashboardProgramDetailIconName;
    id: string;
    label: string;
    value: string;
  }>;
  focalPoint: {
    x: number;
    y: number;
  };
  href: string;
  id: string;
  image: StaticImageData;
  imageAlt: string;
  linkLabel: string;
  title: string;
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
  announcements: DashboardAnnouncement[];
  activityPeriodLabel: string;
  activitySeries: ResearchActivitySeries[];
  activitySubtitle: string;
  activityTitle: string;
  activityXAxis: string[];
  dateIso: string;
  dateLabel: string;
  featuredPrograms: DashboardFeaturedProgram[];
  greeting: string;
  intro: string;
  metrics: DashboardMetric[];
  recentActivities: DashboardRecentActivity[];
  recentActivitiesActionLabel: string;
  recentActivitiesTitle: string;
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
