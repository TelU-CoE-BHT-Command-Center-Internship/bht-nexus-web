import type { Metadata } from "next";
import { NexusContractProposals } from "@/components/nexus-contract-proposals/nexus-contract-proposals";
import { getNexusContractProposalContent } from "@/components/nexus-contract-proposals/nexus-contract-proposals-content";

export const metadata: Metadata = {
  title: "Kontrak & Proposal",
  description: "Kontrak dan proposal resmi CoE BHT pada BHT Nexus.",
  robots: {
    follow: false,
    index: false,
  },
};

export default function NexusContractProposalPage() {
  const content = getNexusContractProposalContent();

  return <NexusContractProposals content={content} />;
}
