import type { ReactNode } from "react";
import type {
  DashboardActivityIconName,
  DashboardProgramDetailIconName,
} from "@/components/nexus-dashboard-overview/nexus-dashboard-overview-types";

type InsightsIconName =
  | DashboardActivityIconName
  | DashboardProgramDetailIconName
  | "arrow-left"
  | "arrow-right"
  | "close"
  | "expand"
  | "external";

type NexusDashboardInsightsIconProps = {
  name: InsightsIconName;
};

const ICON_PATHS: Record<InsightsIconName, ReactNode> = {
  "arrow-left": <path d="m15 18-6-6 6-6" />,
  "arrow-right": <path d="m9 18 6-6-6-6" />,
  audience: (
    <>
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
    </>
  ),
  calendar: (
    <>
      <rect height="18" rx="2" width="18" x="3" y="4" />
      <path d="M16 2v4M8 2v4M3 10h18" />
    </>
  ),
  close: <path d="m6 6 12 12M18 6 6 18" />,
  data: (
    <>
      <ellipse cx="12" cy="5" rx="8" ry="3" />
      <path d="M4 5v6c0 1.66 3.58 3 8 3s8-1.34 8-3V5M4 11v6c0 1.66 3.58 3 8 3s8-1.34 8-3v-6" />
    </>
  ),
  document: (
    <>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" />
      <path d="M14 2v6h6M8 13h8M8 17h6" />
    </>
  ),
  expand: (
    <>
      <path d="M8 3H3v5M16 3h5v5M8 21H3v-5M16 21h5v-5" />
      <path d="m3 8 6-6M21 8l-6-6M3 16l6 6M21 16l-6 6" />
    </>
  ),
  external: (
    <>
      <path d="M15 3h6v6M10 14 21 3" />
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
    </>
  ),
  member: (
    <>
      <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="8.5" cy="7" r="4" />
      <path d="M20 8v6M23 11h-6" />
    </>
  ),
  project: (
    <path d="M3 6a2 2 0 0 1 2-2h5l2 2h7a2 2 0 0 1 2 2v9a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3Z" />
  ),
  review: (
    <>
      <path d="M15 4h3a2 2 0 0 1 2 2v14H4V6a2 2 0 0 1 2-2h3" />
      <rect height="4" rx="1" width="6" x="9" y="2" />
      <path d="m9 13 2 2 4-5" />
    </>
  ),
};

export function NexusDashboardInsightsIcon({
  name,
}: NexusDashboardInsightsIconProps) {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      {ICON_PATHS[name]}
    </svg>
  );
}
