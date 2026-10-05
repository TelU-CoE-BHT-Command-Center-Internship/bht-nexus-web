import type {
  AuditDecisionKind,
  AuditKpiResolution,
  AuditPersonMapping,
  AuditReviewRecord,
} from "@/components/nexus-audit-review/nexus-audit-review-content";
import type { MetadataCompletionResolutions } from "@/components/nexus-metadata-completion/nexus-metadata-completion-model";

export type OfficialMetadataProjection = {
  appliedAt: string;
  note: string;
  resolutions: MetadataCompletionResolutions;
  reviewRecordId: string;
  reviewer: string;
};

export type OfficialMetadataProjectionMap = Record<
  string,
  OfficialMetadataProjection
>;

export type OfficialRecordDecisionProjection = {
  appliedAt: string;
  candidate: AuditReviewRecord;
  decisionKind: Extract<
    AuditDecisionKind,
    "approved_new" | "approved_update" | "merged"
  >;
  kpiResolution?: AuditKpiResolution;
  note: string;
  personMappings?: AuditPersonMapping[];
  reviewer: string;
  targetRecordId?: string;
  targetPersonId?: string;
};

export type OfficialRecordDecisionProjectionMap = Record<
  string,
  OfficialRecordDecisionProjection
>;
