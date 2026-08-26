import { NexusWorkspaceIconPaths } from "@/components/nexus-workspace-ui/nexus-workspace-icons";

export type ActivityIconName =
  | "activity"
  | "alert"
  | "check"
  | "community"
  | "database"
  | "indicator";

const sharedIcons = {
  activity: "activity",
  alert: "alert",
  check: "check",
  database: "database",
  indicator: "chart",
} as const;

function IconPaths({ name }: { name: ActivityIconName }) {
  const shared = sharedIcons[name as keyof typeof sharedIcons];
  if (shared) return <NexusWorkspaceIconPaths name={shared} />;

  switch (name) {
    case "community":
      return (
        <>
          <circle cx="8" cy="9" r="3" />
          <circle cx="16" cy="9" r="3" />
          <path d="M3.5 19c.35-3.35 2.1-5 4.5-5s4.15 1.65 4.5 5M11.5 19c.35-3.35 2.1-5 4.5-5s4.15 1.65 4.5 5" />
        </>
      );
  }
}

export function NexusActivitiesIcon({ name }: { name: ActivityIconName }) {
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
