import { NexusWorkspaceIconPaths } from "@/components/nexus-workspace-ui/nexus-workspace-icons";

export type AcademicIconName =
  | "alert"
  | "check"
  | "database"
  | "indicator"
  | "mentoring";

type NexusAcademicIconProps = {
  name: AcademicIconName;
};

const sharedIcons = {
  alert: "alert",
  check: "check",
  database: "database",
  indicator: "chart",
  mentoring: "graduation",
} as const;

function IconPaths({ name }: NexusAcademicIconProps) {
  const shared = sharedIcons[name as keyof typeof sharedIcons];
  if (shared) return <NexusWorkspaceIconPaths name={shared} />;
}

export function NexusAcademicIcon({ name }: NexusAcademicIconProps) {
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
