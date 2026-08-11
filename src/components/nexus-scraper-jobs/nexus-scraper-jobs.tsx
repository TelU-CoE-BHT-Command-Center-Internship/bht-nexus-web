import { AutomationStatusBadge } from "@/components/nexus-automation-status/nexus-automation-status";
import styles from "@/components/nexus-scraper-jobs/nexus-scraper-jobs.module.css";
import type { NexusScraperJobsContent } from "@/components/nexus-scraper-jobs/nexus-scraper-jobs-content";
import {
  WorkspaceNote,
  WorkspacePage,
  WorkspacePageHeader,
  WorkspacePanel,
} from "@/components/nexus-workspace-page/nexus-workspace-page";
import shell from "@/components/nexus-workspace-page/nexus-workspace-page.module.css";

type NexusScraperJobsProps = {
  content: NexusScraperJobsContent;
};

export function NexusScraperJobs({ content }: NexusScraperJobsProps) {
  const { job, summaryLabels } = content;
  const summaryEntries = [
    { id: "input", label: summaryLabels.input, value: job.rawInput },
    { id: "outcome", label: summaryLabels.outcome, value: job.outcomeLabel },
    {
      id: "candidates",
      label: summaryLabels.candidates,
      value: job.candidateCount,
    },
    { id: "progress", label: summaryLabels.progress, value: job.progressLabel },
    { id: "retries", label: summaryLabels.retries, value: job.retryLabel },
    { id: "created", label: summaryLabels.created, value: job.createdAtLabel },
    { id: "updated", label: summaryLabels.updated, value: job.updatedAtLabel },
  ];

  return (
    <WorkspacePage>
      <WorkspacePageHeader
        description={content.description}
        eyebrow={content.eyebrow}
        title={content.title}
      />

      <div className={styles.lookupCard}>
        <div className={shell.toolbar}>
          <label className={shell.field} htmlFor="job-lookup">
            <span>{content.lookupLabel}</span>
            <input
              id="job-lookup"
              name="jobId"
              placeholder={content.lookupPlaceholder}
              spellCheck={false}
              type="text"
            />
          </label>
          <button className={shell.primaryButton} type="button">
            {content.lookupButtonLabel}
          </button>
        </div>
      </div>

      <WorkspacePanel
        action={
          <AutomationStatusBadge label={job.statusLabel} status={job.status} />
        }
        id="scraper-job-summary"
        subtitle={`${job.id} · ${job.normalizedValue}`}
        title={content.jobTitle}
      >
        <dl className={styles.summaryGrid}>
          {summaryEntries.map((entry) => (
            <div className={styles.summaryEntry} key={entry.id}>
              <dt>{entry.label}</dt>
              <dd>{entry.value}</dd>
            </div>
          ))}
        </dl>
      </WorkspacePanel>

      <WorkspacePanel
        flush
        id="scraper-job-attempts"
        subtitle={content.attemptsSubtitle}
        title={content.attemptsTitle}
      >
        <div className={shell.tableWrap}>
          <table className={shell.table}>
            <thead>
              <tr>
                <th scope="col">{content.attemptColumns.source}</th>
                <th scope="col">{content.attemptColumns.request}</th>
                <th scope="col">{content.attemptColumns.outcome}</th>
                <th scope="col">{content.attemptColumns.time}</th>
              </tr>
            </thead>
            <tbody>
              {content.attempts.map((attempt) => (
                <tr key={attempt.id}>
                  <th scope="row">{attempt.sourceLabel}</th>
                  <td data-label={content.attemptColumns.request}>
                    <code className={styles.requestUrl}>
                      {attempt.requestUrl}
                    </code>
                  </td>
                  <td data-label={content.attemptColumns.outcome}>
                    <span
                      className={styles.attemptOutcome}
                      data-outcome={attempt.outcome}
                    >
                      {attempt.outcomeLabel}
                    </span>
                    <span className={styles.attemptMessage}>
                      {attempt.message}
                    </span>
                  </td>
                  <td data-label={content.attemptColumns.time}>
                    <time>{attempt.finishedAtLabel}</time>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </WorkspacePanel>

      <WorkspaceNote tone="warning">{content.partialSuccessNote}</WorkspaceNote>
    </WorkspacePage>
  );
}
