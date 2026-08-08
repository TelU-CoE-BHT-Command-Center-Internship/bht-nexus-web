import type { DashboardMetricIconName } from "@/components/nexus-dashboard-overview/nexus-dashboard-overview-content";

type OverviewIconName =
  | DashboardMetricIconName
  | "arrow-right"
  | "arrow-up"
  | "calendar"
  | "chevron-down";

type OverviewIconProps = {
  name: OverviewIconName;
};

function IconPaths({ name }: OverviewIconProps) {
  switch (name) {
    case "projects":
      return (
        <>
          <path d="M3.5 7.5h6l2-2h9a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2h-17a2 2 0 0 1-2-2v-9a2 2 0 0 1 2-2Z" />
          <path d="M2 10.5h20" />
        </>
      );
    case "datasets":
      return (
        <>
          <ellipse cx="12" cy="5.5" rx="7.5" ry="3.5" />
          <path d="M4.5 5.5v6c0 1.9 3.4 3.5 7.5 3.5s7.5-1.6 7.5-3.5v-6" />
          <path d="M4.5 11.5v6c0 1.9 3.4 3.5 7.5 3.5s7.5-1.6 7.5-3.5v-6" />
        </>
      );
    case "publications":
      return (
        <>
          <path d="M6 2.5h8l5 5v14H6a2 2 0 0 1-2-2v-15a2 2 0 0 1 2-2Z" />
          <path d="M14 2.5v6h5M8 13h7M8 17h5" />
        </>
      );
    case "researchers":
      return (
        <>
          <circle cx="9" cy="8" r="3.5" />
          <path d="M2.5 21a6.5 6.5 0 0 1 13 0" />
          <path d="M16 5.3a3.2 3.2 0 0 1 0 6.2M17.5 15a5.8 5.8 0 0 1 4 5.5" />
        </>
      );
    case "calendar":
      return (
        <>
          <rect x="3" y="5" width="18" height="16" rx="2" />
          <path d="M7 2.5V7M17 2.5V7M3 9.5h18" />
        </>
      );
    case "arrow-up":
      return <path d="m6.5 11.5 5.5-5.5 5.5 5.5M12 6v12" />;
    case "arrow-right":
      return <path d="M5 12h14M14 7l5 5-5 5" />;
    case "chevron-down":
      return <path d="m7 10 5 5 5-5" />;
  }
}

export function NexusDashboardOverviewIcon({ name }: OverviewIconProps) {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <IconPaths name={name} />
    </svg>
  );
}
