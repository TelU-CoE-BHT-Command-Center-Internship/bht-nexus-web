"use client";

import { useState } from "react";
import { NexusReviewFilters } from "@/components/nexus-review-summary/nexus-review-filters";
import type { NexusReviewSummaryContent } from "@/components/nexus-review-summary/nexus-review-summary-content";
import { NexusReviewSummaryIcon } from "@/components/nexus-review-summary/nexus-review-summary-icons";
import type {
  ReviewCandidateStatus,
  ReviewDecision,
  ReviewStatusChangeContext,
} from "@/components/nexus-review-summary/nexus-review-table-content";
import {
  NexusWorkspaceMetrics,
  NexusWorkspacePage,
} from "@/components/nexus-workspace-ui/nexus-workspace-page";

type NexusReviewSummaryProps = {
  content: NexusReviewSummaryContent;
};

export function NexusReviewSummary({ content }: NexusReviewSummaryProps) {
  const [candidates, setCandidates] = useState(content.filters.table.rows);
  const metrics = content.summaryCards.map((card) => ({
    icon: <NexusReviewSummaryIcon name={card.icon} />,
    id: card.id,
    label: card.label,
    tone: card.tone,
    unit: card.unit,
    value: candidates.reduce(
      (total, candidate) => total + (candidate.status === card.status ? 1 : 0),
      0,
    ),
  }));

  const updateReviewerNote = (candidateId: string, reviewerNote: string) => {
    setCandidates((currentCandidates) =>
      currentCandidates.map((candidate) =>
        candidate.id === candidateId
          ? { ...candidate, reviewerNote }
          : candidate,
      ),
    );
  };

  const updateCandidateStatus = (
    candidateId: string,
    status: ReviewCandidateStatus,
    context?: ReviewStatusChangeContext,
  ) => {
    setCandidates((currentCandidates) =>
      currentCandidates.map((candidate) => {
        if (candidate.id !== candidateId || candidate.status === "completed") {
          return candidate;
        }

        const decisionLabel =
          context?.label ??
          {
            completed: "Tinjauan diselesaikan",
            "needs-fix": "Perbaikan diminta",
            waiting: "Menunggu Tinjauan",
          }[status];

        const nextDecision: ReviewDecision | undefined =
          status === "completed" ? context?.decision : candidate.decision;

        return {
          ...candidate,
          decision: nextDecision,
          previousIssue:
            status === "needs-fix"
              ? `Catatan terbaru: ${candidate.reviewerNote.trim()}`
              : candidate.previousIssue,
          status,
          timeline: [
            ...candidate.timeline,
            {
              actor: "Muhammad Ammar Asyraf",
              candidateVersion: candidate.version,
              detail:
                context?.detail ||
                candidate.reviewerNote.trim() ||
                "Keputusan ditambahkan ke riwayat tinjauan.",
              id: `${candidate.id}-${status}-${candidate.timeline.length + 1}`,
              label: decisionLabel,
              timeLabel: "Baru saja",
              tone: status,
            },
          ],
        };
      }),
    );
  };

  return (
    <NexusWorkspacePage
      description={content.description}
      descriptionId="review-summary-description"
      title={content.title}
      titleId="review-summary-title"
    >
      <NexusWorkspaceMetrics metrics={metrics} />

      <NexusReviewFilters
        candidates={candidates}
        content={content.filters}
        onReviewerNoteChange={updateReviewerNote}
        onStatusChange={updateCandidateStatus}
      />
    </NexusWorkspacePage>
  );
}
