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

function IconPaths({ name }: NexusIntellectualPropertyIconProps) {
  if (name === "alert" || name === "check" || name === "database") {
    return <NexusWorkspaceIconPaths name={name} />;
  }

  switch (name) {
    case "certificate":
      return (
        <>
          <path d="M5 4h11l3 3v8H5z" />
          <path d="M16 4v3h3M8 8h6M8 11.5h4" />
          <path d="M12 15v3.5l2.2-1.2 2.2 1.2V15" />
        </>
      );
    case "shield":
      return (
        <>
          <path d="M12 2.8 4.6 6v6.1c0 4.2 3 7.4 7.4 9.1 4.4-1.7 7.4-4.9 7.4-9.1V6L12 2.8Z" />
          <path d="M9 11.9h6M12 8.9v6" />
        </>
      );
  }
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
