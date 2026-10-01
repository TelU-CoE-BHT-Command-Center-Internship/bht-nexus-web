import type { NexusAcademicView } from "@/components/nexus-academic/nexus-academic-content";
import type { NexusActivityView } from "@/components/nexus-activities/nexus-activities-content";
import type { NexusContractProposalView } from "@/components/nexus-contract-proposals/nexus-contract-proposals-content";
import type { NexusIntellectualPropertyView } from "@/components/nexus-intellectual-property/nexus-intellectual-property-content";
import {
  type OfficialRecordCorrectionMap,
  projectOfficialRecordCorrections,
} from "@/components/nexus-official-records/nexus-official-record-corrections";
import type { NexusPublicationView } from "@/components/nexus-publications/nexus-publications-content";

/** Seluruh rekam resmi kelima rumah Data Resmi. */
export type NexusOfficialRecordSet = {
  academic: readonly NexusAcademicView[];
  activities: readonly NexusActivityView[];
  contracts: readonly NexusContractProposalView[];
  intellectualProperty: readonly NexusIntellectualPropertyView[];
  publications: readonly NexusPublicationView[];
};

/** Perubahan sesi yang berlaku di atas rekam resmi dari server. */
export type NexusOfficialRecordSessionState = {
  officialRecordCorrections: OfficialRecordCorrectionMap;
};

/**
 * Satu jalur proyeksi untuk setiap rumah data: koreksi Monitoring diterapkan
 * di atas rekam resmi dari server. Rumah Data Resmi dan Monitoring memakai
 * fungsi yang sama sehingga satu rekam tidak pernah mempunyai dua nilai
 * berbeda di dua halaman.
 */
export function projectNexusOfficialRecordSet(
  base: NexusOfficialRecordSet,
  session: NexusOfficialRecordSessionState,
): NexusOfficialRecordSet {
  const { officialRecordCorrections: corrections } = session;
  return {
    academic: projectOfficialRecordCorrections(
      "academic",
      base.academic,
      corrections,
    ),
    activities: projectOfficialRecordCorrections(
      "activities",
      base.activities,
      corrections,
    ),
    contracts: projectOfficialRecordCorrections(
      "contracts",
      base.contracts,
      corrections,
    ),
    intellectualProperty: projectOfficialRecordCorrections(
      "intellectual-property",
      base.intellectualProperty,
      corrections,
    ),
    publications: projectOfficialRecordCorrections(
      "publications",
      base.publications,
      corrections,
    ),
  };
}
