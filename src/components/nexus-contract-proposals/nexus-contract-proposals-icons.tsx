import { NexusWorkspaceIconPaths } from "@/components/nexus-workspace-ui/nexus-workspace-icons";

export type ContractProposalIconName =
  | "alert"
  | "check"
  | "contract"
  | "database"
  | "indicator"
  | "proposal";

type NexusContractProposalIconProps = {
  name: ContractProposalIconName;
};

const sharedIcons = {
  alert: "alert",
  check: "check",
  contract: "contract",
  database: "database",
  indicator: "chart",
} as const;

function IconPaths({ name }: NexusContractProposalIconProps) {
  const shared = sharedIcons[name as keyof typeof sharedIcons];
  if (shared) return <NexusWorkspaceIconPaths name={shared} />;

  switch (name) {
    case "proposal":
      return (
        <>
          <path d="M5 5.5h14v14H5z" />
          <path d="M8.5 9h7M8.5 12h7M8.5 15h4" />
        </>
      );
  }
}

export function NexusContractProposalIcon({
  name,
}: NexusContractProposalIconProps) {
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
