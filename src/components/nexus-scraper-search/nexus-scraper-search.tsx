"use client";

import { AutomationStatusBadge } from "@/components/nexus-automation-status/nexus-automation-status";
import styles from "@/components/nexus-scraper-search/nexus-scraper-search.module.css";
import type {
  NexusScraperSearchContent,
  ScraperSubmission,
} from "@/components/nexus-scraper-search/nexus-scraper-search-content";
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

type SortKey = "name" | "status" | "submittedAt";

function readSubmission(submission: ScraperSubmission, key: SortKey) {
  if (key === "status") {
    return submission.statusLabel;
  }

  if (key === "submittedAt") {
    return submission.submittedAtLabel;
  }

  return submission.fullName;
}

type NexusScraperSearchProps = {
  content: NexusScraperSearchContent;
};

export function NexusScraperSearch({ content }: NexusScraperSearchProps) {
  const { sort, sortRows, toggle } = useTableSort<SortKey>("submittedAt");
  const submissions = sortRows(content.submissions, readSubmission);

  return (
    <WorkspacePage>
      <WorkspacePageHeader
        description={content.description}
        title={content.title}
      />

      <div className={styles.submitCard}>
        <div className={shell.toolbar}>
          <label className={shell.field} htmlFor="scraper-input">
            <span>{content.inputLabel}</span>
            <input
              id="scraper-input"
              name="input"
              placeholder={content.inputPlaceholder}
              spellCheck={false}
              type="text"
            />
          </label>

          <label className={shell.field} htmlFor="scraper-source">
            <span>{content.sourceLabel}</span>
            <select defaultValue="sinta" id="scraper-source" name="source">
              {content.sourceOptions.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <button className={shell.primaryButton} type="button">
            {content.submitLabel}
          </button>
        </div>
      </div>

      <WorkspacePanel
        flush
        id="scraper-submissions"
        subtitle={content.submissionsSubtitle}
        title={content.submissionsTitle}
      >
        <div className={shell.tableWrap}>
          <table className={shell.table}>
            <thead>
              <tr>
                <SortableColumn
                  activeKey={sort.key}
                  direction={sort.direction}
                  label={content.columns.name}
                  onSort={toggle}
                  sortKey="name"
                />
                <th scope="col">{content.columns.sinta}</th>
                <th scope="col">{content.columns.scholar}</th>
                <SortableColumn
                  activeKey={sort.key}
                  direction={sort.direction}
                  label={content.columns.status}
                  onSort={toggle}
                  sortKey="status"
                />
                <SortableColumn
                  activeKey={sort.key}
                  direction={sort.direction}
                  label={content.columns.submittedAt}
                  onSort={toggle}
                  sortKey="submittedAt"
                />
              </tr>
            </thead>
            <tbody>
              {submissions.map((submission) => (
                <tr key={submission.id}>
                  <th scope="row">
                    {submission.fullName}
                    <span className={styles.submissionMeta}>
                      {submission.jobId}
                    </span>
                  </th>
                  <td data-label={content.columns.sinta}>
                    {submission.sinta ? (
                      <a
                        className={styles.profileLink}
                        href={submission.sinta.url}
                        rel="noreferrer"
                        target="_blank"
                      >
                        {submission.sinta.id}
                      </a>
                    ) : (
                      <span className={styles.emptyLink}>
                        {content.emptyLinkLabel}
                      </span>
                    )}
                  </td>
                  <td data-label={content.columns.scholar}>
                    {submission.scholar ? (
                      <a
                        className={styles.profileLink}
                        href={submission.scholar.url}
                        rel="noreferrer"
                        target="_blank"
                      >
                        {submission.scholar.id}
                      </a>
                    ) : (
                      <span className={styles.emptyLink}>
                        {content.emptyLinkLabel}
                      </span>
                    )}
                  </td>
                  <td data-label={content.columns.status}>
                    <AutomationStatusBadge
                      label={submission.statusLabel}
                      status={submission.status}
                    />
                  </td>
                  <td data-label={content.columns.submittedAt}>
                    <time>{submission.submittedAtLabel}</time>
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
