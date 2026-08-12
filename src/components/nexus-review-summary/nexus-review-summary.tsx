"use client";

import { useState } from "react";
import { NexusReviewFilters } from "@/components/nexus-review-summary/nexus-review-filters";
import styles from "@/components/nexus-review-summary/nexus-review-summary.module.css";
import type { NexusReviewSummaryContent } from "@/components/nexus-review-summary/nexus-review-summary-content";
import { NexusReviewSummaryIcon } from "@/components/nexus-review-summary/nexus-review-summary-icons";
import type { ReviewCandidateStatus } from "@/components/nexus-review-summary/nexus-review-table-content";

type NexusReviewSummaryProps = {
  content: NexusReviewSummaryContent;
};

export function NexusReviewSummary({ content }: NexusReviewSummaryProps) {
  const [candidates, setCandidates] = useState(content.filters.table.rows);

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
  ) => {
    setCandidates((currentCandidates) =>
      currentCandidates.map((candidate) => {
        if (
          candidate.id !== candidateId ||
          candidate.status === "approved" ||
          candidate.status === "rejected"
        ) {
          return candidate;
        }

        const decisionLabel = {
          approved: "Kandidat disetujui",
          "needs-fix": "Perbaikan diminta",
          rejected: "Kandidat ditolak",
          waiting: "Menunggu Tinjauan",
        }[status];

        return {
          ...candidate,
          previousIssue:
            status === "needs-fix"
              ? `Catatan terbaru: ${candidate.reviewerNote.trim()}`
              : candidate.previousIssue,
          status,
          timeline: [
            ...candidate.timeline,
            {
              detail:
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
    <section
      aria-describedby="review-summary-description"
      aria-labelledby="review-summary-title"
      className={styles.page}
    >
      <header className={styles.header}>
        <h2 id="review-summary-title">{content.title}</h2>
        <p id="review-summary-description">{content.description}</p>
      </header>

      <div className={styles.summaryGrid}>
        {content.summaryCards.map((card) => {
          const count = candidates.reduce(
            (total, candidate) =>
              total + (candidate.status === card.status ? 1 : 0),
            0,
          );

          return (
            <article
              aria-label={`${card.label}: ${count} ${card.unit}`}
              className={styles.summaryCard}
              data-tone={card.tone}
              key={card.id}
            >
              <span aria-hidden="true" className={styles.iconWrap}>
                <NexusReviewSummaryIcon name={card.icon} />
              </span>

              <div className={styles.cardCopy}>
                <h3>{card.label}</h3>
                <p>
                  <strong>{count}</strong>
                  <span>{card.unit}</span>
                </p>
              </div>
            </article>
          );
        })}
      </div>

      <NexusReviewFilters
        candidates={candidates}
        content={content.filters}
        onReviewerNoteChange={updateReviewerNote}
        onStatusChange={updateCandidateStatus}
      />
    </section>
  );
}
