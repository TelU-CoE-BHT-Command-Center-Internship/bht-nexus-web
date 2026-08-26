"use client";

import { useEffect, useState } from "react";
import { AuditReviewDecisionSection } from "@/components/nexus-audit-review/nexus-audit-review-decision";
import { AuditCandidateDetails } from "@/components/nexus-audit-review/nexus-audit-review-detail";
import {
  type AuditReviewDrawerProps,
  auditSectionIndexes,
} from "@/components/nexus-audit-review/nexus-audit-review-drawer-model";
import { NexusWorkspaceDrawer } from "@/components/nexus-workspace-ui/nexus-workspace-drawer";

export function NexusAuditReviewDrawer(props: AuditReviewDrawerProps) {
  const { onClose, record, state } = props;
  const [selectedMatchId, setSelectedMatchId] = useState<string | null>(
    state.reviewTargetRecordId &&
      state.matches.some((match) => match.id === state.reviewTargetRecordId)
      ? state.reviewTargetRecordId
      : state.decision?.targetRecordId &&
          state.matches.some(
            (match) => match.id === state.decision?.targetRecordId,
          )
        ? state.decision.targetRecordId
        : state.matches.length === 1
          ? state.matches[0].id
          : null,
  );
  useEffect(() => {
    if (
      selectedMatchId &&
      !state.matches.some((match) => match.id === selectedMatchId)
    ) {
      setSelectedMatchId(
        state.matches.length === 1 ? state.matches[0].id : null,
      );
    }
  }, [selectedMatchId, state.matches]);
  const selectedMatch = state.matches.find(
    (match) => match.id === selectedMatchId,
  );
  const sectionIndexes = auditSectionIndexes(state.matches.length > 0);

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
          label: state.matches.length > 0 ? "Kecocokan" : "Bukti",
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
        onSelectMatch={setSelectedMatchId}
        record={record}
        selectedMatch={selectedMatch}
        state={state}
      />
      <AuditReviewDecisionSection
        {...props}
        decisionIndex={sectionIndexes.decision}
        key={selectedMatch?.id ?? "no-match"}
        selectedMatch={selectedMatch}
      />
    </NexusWorkspaceDrawer>
  );
}
