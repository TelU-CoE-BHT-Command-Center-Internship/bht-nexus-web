"use client";

import { useState } from "react";
import { NexusReviewFilters } from "@/components/nexus-review-summary/nexus-review-filters";
import type { NexusReviewSummaryContent } from "@/components/nexus-review-summary/nexus-review-summary-content";
import { NexusReviewSummaryIcon } from "@/components/nexus-review-summary/nexus-review-summary-icons";
import type {
  ReviewCandidateStatus,
  ReviewCompletionRevisionChange,
  ReviewDecision,
  ReviewMetadataCompletionProposal,
  ReviewRecord,
  ReviewRevisionChange,
  ReviewStatusChangeContext,
} from "@/components/nexus-review-summary/nexus-review-table-content";
import { buildReviewFieldComparisons } from "@/components/nexus-review-summary/nexus-review-table-content";
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
          linkOutcome:
            context?.decision === "merged" && context.linkedTargetId
              ? {
                  proposedEnrichmentFields:
                    context.proposedEnrichmentFields ?? [],
                  targetId: context.linkedTargetId,
                }
              : candidate.linkOutcome,
          previousIssue:
            status === "needs-fix"
              ? `Catatan terbaru: ${candidate.reviewerNote.trim()}`
              : candidate.previousIssue,
          requestedCorrectionFields:
            status === "needs-fix"
              ? context?.requestedCorrectionFields
              : candidate.requestedCorrectionFields,
          requestedCompletionFields:
            status === "needs-fix"
              ? context?.requestedCompletionFields
              : candidate.requestedCompletionFields,
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

  const resubmitCandidate = (
    candidateId: string,
    record: ReviewRecord,
    note: string,
    changes: readonly ReviewRevisionChange[],
  ) => {
    setCandidates((currentCandidates) =>
      currentCandidates.map((candidate) => {
        if (candidate.id !== candidateId || candidate.status !== "needs-fix") {
          return candidate;
        }

        const currentVersionNumber = Number.parseInt(
          candidate.version.replace(/^v/, ""),
          10,
        );
        const nextVersion = `v${Number.isNaN(currentVersionNumber) ? 2 : currentVersionNumber + 1}`;
        const matches = candidate.matches.map((match) => ({
          ...match,
          comparisons: buildReviewFieldComparisons(
            record,
            match.officialRecord,
          ),
        }));

        return {
          ...candidate,
          latestRevision: {
            changes,
            note,
            submittedAt: "Baru saja",
            submittedBy: candidate.owner.name,
            version: nextVersion,
          },
          matches,
          record,
          reviewerNote: "",
          requestedCorrectionFields: undefined,
          status: "waiting" as const,
          timeline: [
            ...candidate.timeline,
            {
              actor: candidate.owner.name,
              candidateVersion: nextVersion,
              detail: `${changes.length} bidang diperbarui. Dasar perubahan: ${note}`,
              id: `${candidate.id}-resubmitted-${candidate.timeline.length + 1}`,
              label: "Perbaikan dikirim ulang",
              timeLabel: "Baru saja",
              tone: "waiting" as const,
            },
          ],
          version: nextVersion,
        };
      }),
    );
  };

  const resubmitCompletionProposal = (
    candidateId: string,
    resolutions: ReviewMetadataCompletionProposal["resolutions"],
    sourceNote: string,
    changes: readonly ReviewCompletionRevisionChange[],
  ) => {
    setCandidates((currentCandidates) =>
      currentCandidates.map((candidate) => {
        const proposal = candidate.completionProposal;

        if (
          candidate.id !== candidateId ||
          candidate.status !== "needs-fix" ||
          !proposal
        ) {
          return candidate;
        }

        const currentVersionNumber = Number.parseInt(
          candidate.version.replace(/^v/, ""),
          10,
        );
        const nextVersion = `v${Number.isNaN(currentVersionNumber) ? 2 : currentVersionNumber + 1}`;
        const previousSourceNote = proposal.sourceNote;
        const reviewerRequest = candidate.reviewerNote.trim();
        const requestedFields =
          candidate.requestedCompletionFields ?? proposal.affectedFields;
        const revisionDetail =
          changes.length > 0
            ? `${changes.length} nilai usulan diperbarui. Dasar revisi: ${sourceNote}`
            : `Dasar sumber usulan diperbarui: ${sourceNote}`;

        return {
          ...candidate,
          completionProposal: {
            ...proposal,
            latestRevision: {
              changes,
              currentSourceNote: sourceNote,
              previousSourceNote,
              requestedFields,
              reviewerRequest,
              submittedAt: "Baru saja",
              submittedBy: candidate.owner.name,
              version: nextVersion,
            },
            resolutions,
            sourceNote,
            submittedAt: "Baru saja",
          },
          reviewerNote: "",
          requestedCompletionFields: undefined,
          status: "waiting" as const,
          timeline: [
            ...candidate.timeline,
            {
              actor: candidate.owner.name,
              candidateVersion: nextVersion,
              detail: revisionDetail,
              id: `${candidate.id}-proposal-resubmitted-${candidate.timeline.length + 1}`,
              label: "Usulan diperbaiki dan dikirim ulang",
              timeLabel: "Baru saja",
              tone: "waiting" as const,
            },
          ],
          version: nextVersion,
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
        onCandidateResubmit={resubmitCandidate}
        onCompletionProposalResubmit={resubmitCompletionProposal}
        onReviewerNoteChange={updateReviewerNote}
        onStatusChange={updateCandidateStatus}
      />
    </NexusWorkspacePage>
  );
}
