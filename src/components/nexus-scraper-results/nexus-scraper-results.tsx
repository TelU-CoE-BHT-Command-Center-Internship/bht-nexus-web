import styles from "@/components/nexus-scraper-results/nexus-scraper-results.module.css";
import type { NexusScraperResultsContent } from "@/components/nexus-scraper-results/nexus-scraper-results-content";
import {
  WorkspaceNote,
  WorkspacePage,
  WorkspacePageHeader,
  WorkspacePanel,
} from "@/components/nexus-workspace-page/nexus-workspace-page";
import shell from "@/components/nexus-workspace-page/nexus-workspace-page.module.css";

type NexusScraperResultsProps = {
  content: NexusScraperResultsContent;
};

export function NexusScraperResults({ content }: NexusScraperResultsProps) {
  return (
    <WorkspacePage>
      <WorkspacePageHeader
        description={content.description}
        eyebrow={content.eyebrow}
        title={content.title}
      />

      <WorkspaceNote>{content.promoteNote}</WorkspaceNote>

      <WorkspacePanel
        id="scraper-results-candidates"
        subtitle={content.candidatesSubtitle}
        title={content.candidatesTitle}
      >
        <ul className={styles.candidateList}>
          {content.candidates.map((candidate) => (
            <li className={styles.candidate} key={candidate.id}>
              <div className={styles.candidateHeader}>
                <div className={styles.candidateCopy}>
                  <p className={styles.candidateTitle}>{candidate.title}</p>
                  <p className={styles.candidateMeta}>
                    {candidate.typeLabel} · {candidate.sourceLabel} ·{" "}
                    {candidate.jobId} · {candidate.retrievedAtLabel}
                  </p>
                </div>
                <span className={styles.candidateStatus}>
                  {candidate.statusLabel}
                </span>
              </div>

              <dl className={styles.detailGrid}>
                {candidate.details.map((detail) => (
                  <div className={styles.detailEntry} key={detail.id}>
                    <dt>{detail.label}</dt>
                    <dd>{detail.value}</dd>
                  </div>
                ))}
              </dl>

              <div className={styles.candidateFooter}>
                <a
                  className={styles.sourceLink}
                  href={candidate.sourceUrl}
                  rel="noreferrer"
                  target="_blank"
                >
                  {content.sourceUrlLabel}
                </a>
                <div className={styles.decisionButtons}>
                  <button className={shell.ghostButton} type="button">
                    {content.rejectLabel}
                  </button>
                  <button className={shell.primaryButton} type="button">
                    {content.acceptLabel}
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </WorkspacePanel>

      <WorkspaceNote tone="warning">{content.selfApprovalNote}</WorkspaceNote>
    </WorkspacePage>
  );
}
