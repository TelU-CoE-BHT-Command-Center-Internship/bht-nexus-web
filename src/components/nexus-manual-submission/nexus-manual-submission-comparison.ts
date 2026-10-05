import type { AuditReviewRecord } from "@/components/nexus-audit-review/nexus-audit-review-content";
import type { ManualSubmissionDomain } from "@/components/nexus-manual-submission/nexus-manual-submission-model";

export function manualDomainForReviewRecord(
  record: AuditReviewRecord,
): ManualSubmissionDomain {
  if (record.manualSubmission) return record.manualSubmission.domain;
  if (record.kpiLinks[0]?.indicator.id === "KM-33") return "publication";
  if (record.category === "academic_hr") return "academic";
  if (
    record.category === "activity_governance" ||
    record.category === "community_service"
  ) {
    return "activity";
  }
  if (record.category === "innovation_ip") return "intellectual-property";
  if (record.category === "publication_conference") return "publication";
  return "contract";
}
