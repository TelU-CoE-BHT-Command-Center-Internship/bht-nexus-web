import type { NexusAcademicView } from "@/components/nexus-academic/nexus-academic-content";
import type { NexusActivityView } from "@/components/nexus-activities/nexus-activities-content";
import type { NexusContractProposalView } from "@/components/nexus-contract-proposals/nexus-contract-proposals-content";
import type { NexusIntellectualPropertyView } from "@/components/nexus-intellectual-property/nexus-intellectual-property-content";
import type { NexusPublicationView } from "@/components/nexus-publications/nexus-publications-content";

/** Seluruh rekam resmi kelima rumah Data Resmi. */
export type NexusOfficialRecordSet = {
  academic: readonly NexusAcademicView[];
  activities: readonly NexusActivityView[];
  contracts: readonly NexusContractProposalView[];
  intellectualProperty: readonly NexusIntellectualPropertyView[];
  publications: readonly NexusPublicationView[];
};
