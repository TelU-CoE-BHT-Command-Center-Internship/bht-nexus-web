import { NexusWorkspaceIconPaths } from "@/components/nexus-workspace-ui/nexus-workspace-icons";
export type IntellectualPropertyIconName =
  | "alert"
  | "certificate"
  | "check"
  | "database"
  | "shield";

type NexusIntellectualPropertyIconProps = {
  name: IntellectualPropertyIconName;
};

const sharedIcons = {
  alert: "alert",
  certificate: "certificate",
  check: "check",
  database: "database",
  shield: "shield",
} as const;

function IconPaths({ name }: NexusIntellectualPropertyIconProps) {
  const shared = sharedIcons[name as keyof typeof sharedIcons];
  if (shared) return <NexusWorkspaceIconPaths name={shared} />;
}

export function NexusIntellectualPropertyIcon({
  name,
}: NexusIntellectualPropertyIconProps) {
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
