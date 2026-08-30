import type { ReactNode } from "react";
import { NexusWorkspaceIconPaths } from "@/components/nexus-workspace-ui/nexus-workspace-icons";

export type NexusProfileIconName = "alert" | "pencil" | "shield";

export function NexusProfileIcon({ name }: { name: NexusProfileIconName }) {
  const paths: Record<NexusProfileIconName, ReactNode> = {
    alert: <NexusWorkspaceIconPaths name="alert" />,
    pencil: <NexusWorkspaceIconPaths name="pencil" />,
    shield: <NexusWorkspaceIconPaths name="shield" />,
  };

  return (
    <svg aria-hidden="true" fill="none" viewBox="0 0 24 24">
      {paths[name]}
    </svg>
  );
}
