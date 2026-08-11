import styles from "@/components/nexus-scraper-results/nexus-scraper-results.module.css";
import type { NexusScraperResultsContent } from "@/components/nexus-scraper-results/nexus-scraper-results-content";
import {
  WorkspaceFootnote,
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
        title={content.title}
      />

      <WorkspacePanel
        id="scraper-results-candidates"
        title={content.candidatesTitle}
      >
        <div className={styles.groupList}>
          {content.groups.map((group) => (
            <section className={styles.group} key={group.id}>
              <h4 className={styles.groupName}>{group.fullName}</h4>

              <ul className={styles.candidateList}>
                {group.candidates.map((candidate) => (
                  <li className={styles.candidate} key={candidate.id}>
                    <div className={styles.candidateMain}>
                      <p className={styles.candidateType}>
                        {candidate.typeLabel}
                      </p>
                      <p className={styles.candidateTitle}>{candidate.title}</p>
                    </div>

                    <div className={styles.decisionButtons}>
                      <button className={shell.ghostButton} type="button">
                        {content.rejectLabel}
                      </button>
                      <button className={shell.primaryButton} type="button">
                        {content.acceptLabel}
                      </button>
                    </div>

                    <details
                      className={`${shell.disclosure} ${styles.candidateData}`}
                    >
                      <summary>{content.detailsLabel}</summary>
                      <div className={shell.disclosureBody}>
                        <dl className={styles.detailGrid}>
                          {candidate.details.map((detail) => (
                            <div className={styles.detailEntry} key={detail.id}>
                              <dt>{detail.label}</dt>
                              <dd>{detail.value}</dd>
                            </div>
                          ))}
                        </dl>
                        <p className={styles.candidateFooter}>
                          <a
                            className={styles.sourceLink}
                            href={candidate.sourceUrl}
                            rel="noreferrer"
                            target="_blank"
                          >
                            {content.sourceUrlLabel}
                          </a>
                          <span>
                            {candidate.sourceLabel} ·{" "}
                            <time dateTime={candidate.retrievedAt}>
                              {candidate.retrievedAtLabel}
                            </time>
                          </span>
                        </p>
                      </div>
                    </details>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </WorkspacePanel>

      <WorkspaceFootnote>{content.promoteNote}</WorkspaceFootnote>
    </WorkspacePage>
  );
}
