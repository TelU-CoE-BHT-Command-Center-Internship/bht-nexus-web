import { NexusWorkspaceIconPaths } from "@/components/nexus-workspace-ui/nexus-workspace-icons";

export type ActivityIconName =
  | "activity"
  | "alert"
  | "check"
  | "community"
  | "database"
  | "indicator";

function IconPaths({ name }: { name: ActivityIconName }) {
  if (name === "alert" || name === "check" || name === "database") {
    return <NexusWorkspaceIconPaths name={name} />;
  }

  switch (name) {
    case "activity":
      return (
        <>
          <path d="M5 5.5h14v14H5z" />
          <path d="M8 9h8M8 12.5h8M8 16h5" />
        </>
      );
    case "community":
      return (
        <>
          <circle cx="8" cy="9" r="3" />
          <circle cx="16" cy="9" r="3" />
          <path d="M3.5 19c.35-3.35 2.1-5 4.5-5s4.15 1.65 4.5 5M11.5 19c.35-3.35 2.1-5 4.5-5s4.15 1.65 4.5 5" />
        </>
      );
    case "indicator":
      return (
        <>
          <path d="M4 19.5h16" />
          <path d="M7 19.5V11M12 19.5V6.5M17 19.5v-5.5" />
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
