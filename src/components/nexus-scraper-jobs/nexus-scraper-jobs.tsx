"use client";

import { AutomationStatusBadge } from "@/components/nexus-automation-status/nexus-automation-status";
import styles from "@/components/nexus-scraper-jobs/nexus-scraper-jobs.module.css";
import type {
  NexusScraperJobsContent,
  ScraperJobAttempt,
} from "@/components/nexus-scraper-jobs/nexus-scraper-jobs-content";
import {
  WorkspacePage,
  WorkspacePageHeader,
  WorkspacePanel,
} from "@/components/nexus-workspace-page/nexus-workspace-page";
import shell from "@/components/nexus-workspace-page/nexus-workspace-page.module.css";
import {
  SortableColumn,
  useTableSort,
} from "@/components/nexus-workspace-page/nexus-workspace-sort";

type SortKey = "outcome" | "source" | "time";

function readAttempt(attempt: ScraperJobAttempt, key: SortKey) {
  if (key === "outcome") {
    return attempt.outcomeLabel;
  }

  if (key === "time") {
    return attempt.finishedAt;
  }

  return attempt.sourceLabel;
}

type NexusScraperJobsProps = {
  content: NexusScraperJobsContent;
};

export function NexusScraperJobs({ content }: NexusScraperJobsProps) {
  const { job, summaryLabels } = content;
  const { sort, sortRows, toggle } = useTableSort<SortKey>("time");
  const attempts = sortRows(content.attempts, readAttempt);
  const summaryEntries = [
    { id: "name", label: summaryLabels.name, value: job.fullName },
    {
      id: "candidates",
      label: summaryLabels.candidates,
      value: job.candidateCount,
    },
    { id: "progress", label: summaryLabels.progress, value: job.progressLabel },
    { id: "created", label: summaryLabels.created, value: job.createdAtLabel },
    { id: "updated", label: summaryLabels.updated, value: job.updatedAtLabel },
  ];

  return (
    <WorkspacePage>
      <WorkspacePageHeader
        description={content.description}
        title={content.title}
      />

      <div className={styles.lookupCard}>
        <div className={shell.toolbar}>
          <label className={shell.field} htmlFor="job-lookup">
            <span>{content.lookupLabel}</span>
            <input
              id="job-lookup"
              name="researcher"
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
                <SortableColumn
                  activeKey={sort.key}
                  direction={sort.direction}
                  label={content.attemptColumns.source}
                  onSort={toggle}
                  sortKey="source"
                />
                <th scope="col">{content.attemptColumns.request}</th>
                <SortableColumn
                  activeKey={sort.key}
                  direction={sort.direction}
                  label={content.attemptColumns.outcome}
                  onSort={toggle}
                  sortKey="outcome"
                />
                <SortableColumn
                  activeKey={sort.key}
                  direction={sort.direction}
                  label={content.attemptColumns.time}
                  onSort={toggle}
                  sortKey="time"
                />
              </tr>
            </thead>
            <tbody>
              {attempts.map((attempt) => (
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
                  </td>
                  <td data-label={content.attemptColumns.time}>
                    <time dateTime={attempt.finishedAt}>
                      {attempt.finishedAtLabel}
                    </time>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </WorkspacePanel>
    </WorkspacePage>
  );
}
