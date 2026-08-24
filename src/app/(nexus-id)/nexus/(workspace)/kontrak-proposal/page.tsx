import type { Metadata } from "next";
import { NexusContractProposals } from "@/components/nexus-contract-proposals/nexus-contract-proposals";
import { getNexusContractProposalContent } from "@/components/nexus-contract-proposals/nexus-contract-proposals-content";
import {
  memberIdFromSearchParams,
  type NexusMemberFilteredPageProps,
} from "@/components/nexus-members/nexus-member-route";

export const metadata: Metadata = {
  title: "Kontrak & Proposal",
  description: "Kontrak dan proposal resmi CoE BHT pada BHT Nexus.",
  robots: {
    follow: false,
    index: false,
  },
};

export default async function NexusContractProposalPage({
  searchParams,
}: NexusMemberFilteredPageProps) {
  const content = getNexusContractProposalContent();
  const initialMemberId = await memberIdFromSearchParams(searchParams);

  return (
    <NexusContractProposals
      content={content}
      initialMemberId={initialMemberId}
    />
  );
}
