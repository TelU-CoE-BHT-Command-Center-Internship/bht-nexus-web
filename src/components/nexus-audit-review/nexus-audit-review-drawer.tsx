"use client";

import { AuditReviewDecisionSection } from "@/components/nexus-audit-review/nexus-audit-review-decision";
import { AuditCandidateDetails } from "@/components/nexus-audit-review/nexus-audit-review-detail";
import {
  type AuditReviewDrawerProps,
  auditSectionIndexes,
} from "@/components/nexus-audit-review/nexus-audit-review-drawer-model";
import { NexusWorkspaceDrawer } from "@/components/nexus-workspace-ui/nexus-workspace-drawer";

export function NexusAuditReviewDrawer(props: AuditReviewDrawerProps) {
  const { onClose, record, state } = props;
  const sectionIndexes = auditSectionIndexes(Boolean(record.match));

  return (
    <NexusWorkspaceDrawer
      closeLabel="Tutup rincian kandidat"
      description="Periksa kandidat, rekam terkait, bukti, dan dampaknya sebelum menetapkan keputusan."
      eyebrow={`${record.id} · V${state.version}`}
      onClose={onClose}
      steps={[
        { active: true, complete: true, label: "Kandidat", number: 1 },
        {
          active: state.status === "waiting",
          complete: state.status !== "waiting",
          label: record.match ? "Kecocokan" : "Bukti",
          number: 2,
        },
        {
          active: state.status !== "waiting",
          complete: state.status === "completed",
          label: "Keputusan",
          number: 3,
        },
      ]}
      title="Rincian kandidat"
    >
      <AuditCandidateDetails
        indexes={sectionIndexes}
        record={record}
        state={state}
      />
      <AuditReviewDecisionSection
        {...props}
        decisionIndex={sectionIndexes.decision}
      />
    </NexusWorkspaceDrawer>
  );
}
