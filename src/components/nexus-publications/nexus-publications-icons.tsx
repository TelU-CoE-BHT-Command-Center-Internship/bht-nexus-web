import { NexusWorkspaceIconPaths } from "@/components/nexus-workspace-ui/nexus-workspace-icons";

export type PublicationsIconName = "alert" | "book" | "quartile";

type NexusPublicationsIconProps = {
  name: PublicationsIconName;
};

const sharedIcons = {
  alert: "alert",
  book: "book",
  quartile: "chart",
} as const;

function IconPaths({ name }: NexusPublicationsIconProps) {
  const shared = sharedIcons[name as keyof typeof sharedIcons];
  if (shared) return <NexusWorkspaceIconPaths name={shared} />;
}

export function NexusPublicationsIcon({ name }: NexusPublicationsIconProps) {
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
