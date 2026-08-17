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

function IconPaths({ name }: NexusContractProposalIconProps) {
  if (name === "alert" || name === "check" || name === "database") {
    return <NexusWorkspaceIconPaths name={name} />;
  }

  switch (name) {
    case "contract":
      return (
        <>
          <path d="M7 3.5h7l3 3v14H7z" />
          <path d="M14 3.5v3h3M9.5 11h5M9.5 14h5M9.5 17h3" />
        </>
      );
    case "indicator":
      return (
        <>
          <path d="M4 19.5h16" />
          <path d="M7 19.5V11M12 19.5V6.5M17 19.5v-5.5" />
        </>
      );
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
