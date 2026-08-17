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

function IconPaths({ name }: NexusAcademicIconProps) {
  if (name === "alert" || name === "check" || name === "database") {
    return <NexusWorkspaceIconPaths name={name} />;
  }

  switch (name) {
    case "indicator":
      return (
        <>
          <path d="M4 19.5h16" />
          <path d="M7 19.5V11M12 19.5V6.5M17 19.5v-5.5" />
        </>
      );
    case "mentoring":
      return (
        <>
          <path d="M12 3.2 21 7.4l-9 4.2-9-4.2 9-4.2Z" />
          <path d="M6.5 9.6v4.6c0 1.7 2.5 3 5.5 3s5.5-1.3 5.5-3V9.6" />
          <path d="M20 8v5.2" />
        </>
      );
  }
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
