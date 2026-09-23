import {
  getNexusAcademicContent,
  type OfficialAcademicRecord,
} from "@/components/nexus-academic/nexus-academic-content";
import {
  getNexusActivitiesContent,
  type OfficialActivityRecord,
} from "@/components/nexus-activities/nexus-activities-content";
import {
  getNexusContractProposalContent,
  type OfficialContractProposalRecord,
} from "@/components/nexus-contract-proposals/nexus-contract-proposals-content";
import {
  getNexusIntellectualPropertyContent,
  normalizeProjectedIntellectualProperty,
  type OfficialIntellectualProperty,
} from "@/components/nexus-intellectual-property/nexus-intellectual-property-content";
import {
  projectOfficialAcademics,
  projectOfficialActivities,
  projectOfficialContractProposals,
  projectOfficialIntellectualProperties,
  projectOfficialPublications,
} from "@/components/nexus-manual-submission/nexus-manual-submission-projection";
import {
  type OfficialRecordCorrectionMap,
  projectOfficialRecordCorrections,
} from "@/components/nexus-official-records/nexus-official-record-corrections";
import {
  getNexusPublicationsContent,
  normalizeProjectedPublication,
  type OfficialPublication,
} from "@/components/nexus-publications/nexus-publications-content";
import {
  type OfficialMetadataProjectionMap,
  type OfficialRecordDecisionProjectionMap,
  projectOfficialMetadataRecords,
} from "@/components/nexus-review-session/nexus-official-record-projection";

/** Seluruh rekam resmi kelima rumah Data Resmi. */
export type NexusOfficialRecordSet = {
  academic: readonly OfficialAcademicRecord[];
  activities: readonly OfficialActivityRecord[];
  contracts: readonly OfficialContractProposalRecord[];
  intellectualProperty: readonly OfficialIntellectualProperty[];
  publications: readonly OfficialPublication[];
};

/** Perubahan sesi yang membentuk rekam resmi di atas data awalnya. */
export type NexusOfficialRecordSessionState = {
  officialMetadataByRecordId: OfficialMetadataProjectionMap;
  officialRecordCorrections: OfficialRecordCorrectionMap;
  officialRecordDecisions: OfficialRecordDecisionProjectionMap;
};

/**
 * Satu jalur proyeksi untuk setiap rumah data: pelengkapan metadata yang
 * disetujui, lalu keputusan Tinjauan, lalu koreksi Monitoring. Rumah Data
 * Resmi dan Monitoring memakai fungsi yang sama sehingga satu rekam tidak
 * pernah mempunyai dua nilai berbeda di dua halaman.
 */
export function projectNexusPublications(
  records: readonly OfficialPublication[],
  session: NexusOfficialRecordSessionState,
) {
  return projectOfficialRecordCorrections(
    "publications",
    projectOfficialPublications(
      projectOfficialMetadataRecords(
        records,
        session.officialMetadataByRecordId,
        normalizeProjectedPublication,
      ),
      session.officialRecordDecisions,
    ),
    session.officialRecordCorrections,
  );
}

export function projectNexusIntellectualProperties(
  records: readonly OfficialIntellectualProperty[],
  session: NexusOfficialRecordSessionState,
) {
  return projectOfficialRecordCorrections(
    "intellectual-property",
    projectOfficialIntellectualProperties(
      projectOfficialMetadataRecords(
        records,
        session.officialMetadataByRecordId,
        normalizeProjectedIntellectualProperty,
      ),
      session.officialRecordDecisions,
    ),
    session.officialRecordCorrections,
  );
}

export function projectNexusContractProposals(
  records: readonly OfficialContractProposalRecord[],
  session: NexusOfficialRecordSessionState,
) {
  return projectOfficialRecordCorrections(
    "contracts",
    projectOfficialContractProposals(
      projectOfficialMetadataRecords(
        records,
        session.officialMetadataByRecordId,
      ),
      session.officialRecordDecisions,
    ),
    session.officialRecordCorrections,
  );
}

export function projectNexusAcademics(
  records: readonly OfficialAcademicRecord[],
  session: NexusOfficialRecordSessionState,
) {
  return projectOfficialRecordCorrections(
    "academic",
    projectOfficialAcademics(
      projectOfficialMetadataRecords(
        records,
        session.officialMetadataByRecordId,
      ),
      session.officialRecordDecisions,
    ),
    session.officialRecordCorrections,
  );
}

export function projectNexusActivities(
  records: readonly OfficialActivityRecord[],
  session: NexusOfficialRecordSessionState,
) {
  return projectOfficialRecordCorrections(
    "activities",
    projectOfficialActivities(
      projectOfficialMetadataRecords(
        records,
        session.officialMetadataByRecordId,
      ),
      session.officialRecordDecisions,
    ),
    session.officialRecordCorrections,
  );
}

/** Rekam awal kelima rumah data sebelum perubahan sesi diterapkan. */
export function getNexusOfficialBaseRecords(): NexusOfficialRecordSet {
  return {
    academic: getNexusAcademicContent().records,
    activities: getNexusActivitiesContent().records,
    contracts: getNexusContractProposalContent().records,
    intellectualProperty: getNexusIntellectualPropertyContent().records,
    publications: getNexusPublicationsContent().records,
  };
}

export function projectNexusOfficialRecordSet(
  base: NexusOfficialRecordSet,
  session: NexusOfficialRecordSessionState,
): NexusOfficialRecordSet {
  return {
    academic: projectNexusAcademics(base.academic, session),
    activities: projectNexusActivities(base.activities, session),
    contracts: projectNexusContractProposals(base.contracts, session),
    intellectualProperty: projectNexusIntellectualProperties(
      base.intellectualProperty,
      session,
    ),
    publications: projectNexusPublications(base.publications, session),
  };
}
