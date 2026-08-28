import type { ReactNode } from "react";
import { NexusWorkspaceIconPaths } from "@/components/nexus-workspace-ui/nexus-workspace-icons";

export type NexusAdministrationIconName =
  | "account"
  | "active"
  | "clock"
  | "email"
  | "key"
  | "link"
  | "pause"
  | "plus"
  | "restore"
  | "role"
  | "shield";

export function NexusAdministrationIcon({
  name,
}: {
  name: NexusAdministrationIconName;
}) {
  const paths: Record<NexusAdministrationIconName, ReactNode> = {
    account: (
      <>
        <circle cx="9" cy="8" r="3.5" />
        <path d="M3.5 20a5.5 5.5 0 0 1 11 0M16 9.5h4.5M18.25 7.25v4.5" />
      </>
    ),
    active: <NexusWorkspaceIconPaths name="check" />,
    clock: <NexusWorkspaceIconPaths name="clock" />,
    email: (
      <>
        <rect height="14" rx="2" width="18" x="3" y="5" />
        <path d="m4 7 8 6 8-6" />
      </>
    ),
    key: (
      <>
        <circle cx="8" cy="12" r="4.2" />
        <path d="M12.2 12H21M17 12v3M19.5 12v2" />
      </>
    ),
    link: (
      <>
        <path d="m9.8 14.2 4.4-4.4" />
        <path d="M8.2 16.2 6.8 17.6a3.4 3.4 0 0 1-4.8-4.8l3-3a3.4 3.4 0 0 1 4.8 0M15.8 7.8l1.4-1.4a3.4 3.4 0 0 1 4.8 4.8l-3 3a3.4 3.4 0 0 1-4.8 0" />
      </>
    ),
    pause: (
      <>
        <circle cx="12" cy="12" r="8.5" />
        <path d="M9.4 8.5v7M14.6 8.5v7" />
      </>
    ),
    plus: <path d="M12 4.5v15M4.5 12h15" />,
    restore: (
      <>
        <path d="M5.2 8.2V4.5M5.2 4.5h3.7" />
        <path d="M5.6 5.2a8.5 8.5 0 1 1-1.7 9.2" />
        <path d="M12 7.4v4.9l3.1 1.8" />
      </>
    ),
    role: (
      <>
        <circle cx="8.3" cy="8" r="3.2" />
        <path d="M3 19.5a5.3 5.3 0 0 1 10.6 0" />
        <path d="M16.2 10.5 18 8.7l1.8 1.8v3.7l-1.8 1.8-1.8-1.8Z" />
      </>
    ),
    shield: <NexusWorkspaceIconPaths name="shield" />,
  };

  return (
    <svg aria-hidden="true" fill="none" viewBox="0 0 24 24">
      {paths[name]}
    </svg>
  );
}
