import { NexusWorkspaceIconPaths } from "@/components/nexus-workspace-ui/nexus-workspace-icons";
export type PublicationsIconName =
  | "alert"
  | "book"
  | "check"
  | "database"
  | "quartile";

type NexusPublicationsIconProps = {
  name: PublicationsIconName;
};

function IconPaths({ name }: NexusPublicationsIconProps) {
  if (name === "alert" || name === "check" || name === "database") {
    return <NexusWorkspaceIconPaths name={name} />;
  }

  switch (name) {
    case "book":
      return (
        <>
          <path d="M5.5 4.5h9a2 2 0 0 1 2 2v13h-9a2 2 0 0 1-2-2v-13Z" />
          <path d="M16.5 7.5h2a1.5 1.5 0 0 1 1.5 1.5v10.5h-3.5M8.5 8.5h5M8.5 12h5" />
        </>
      );
    case "quartile":
      return (
        <>
          <path d="M4 20V13.5M10 20V9M16 20v-6M4 20h17" />
          <path d="m13.5 6.5 3-3 3 3M16.5 3.5V9" />
        </>
      );
  }
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
