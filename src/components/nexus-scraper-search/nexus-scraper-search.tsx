"use client";

import { useState } from "react";
import { AutomationStatusBadge } from "@/components/nexus-automation-status/nexus-automation-status";
import styles from "@/components/nexus-scraper-search/nexus-scraper-search.module.css";
import type {
  NexusScraperSearchContent,
  ScraperProfileLink,
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
    return submission.submittedAt;
  }

  return submission.fullName;
}

type ProfileCellProps = {
  emptyLabel: string;
  profile: ScraperProfileLink | null;
};

function ProfileCell({ emptyLabel, profile }: ProfileCellProps) {
  if (!profile) {
    return <span className={styles.emptyLink}>{emptyLabel}</span>;
  }

  return (
    <a
      className={styles.profileLink}
      href={profile.url}
      rel="noreferrer"
      target="_blank"
    >
      {profile.id}
    </a>
  );
}

type NexusScraperSearchProps = {
  content: NexusScraperSearchContent;
};

export function NexusScraperSearch({ content }: NexusScraperSearchProps) {
  const { sort, sortRows, toggle } = useTableSort<SortKey>("submittedAt");
  const [selectedId, setSelectedId] = useState(content.submissions[0]?.id);
  const submissions = sortRows(content.submissions, readSubmission);
  const selected =
    content.submissions.find((item) => item.id === selectedId) ??
    content.submissions[0];

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
                <tr
                  className={styles.row}
                  data-selected={submission.id === selected?.id}
                  key={submission.id}
                >
                  <th scope="row">
                    <button
                      aria-label={`${submission.fullName}. ${content.selectRowLabel}`}
                      className={styles.rowButton}
                      onClick={() => setSelectedId(submission.id)}
                      type="button"
                    >
                      {submission.fullName}
                    </button>
                  </th>
                  <td data-label={content.columns.sinta}>
                    <ProfileCell
                      emptyLabel={content.emptyLinkLabel}
                      profile={submission.sinta}
                    />
                  </td>
                  <td data-label={content.columns.scholar}>
                    <ProfileCell
                      emptyLabel={content.emptyLinkLabel}
                      profile={submission.scholar}
                    />
                  </td>
                  <td data-label={content.columns.status}>
                    <AutomationStatusBadge
                      label={submission.statusLabel}
                      status={submission.status}
                    />
                  </td>
                  <td data-label={content.columns.submittedAt}>
                    <time dateTime={submission.submittedAt}>
                      {submission.submittedAtLabel}
                    </time>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </WorkspacePanel>

      {selected ? (
        <WorkspacePanel
          flush
          id="scraper-attempts"
          subtitle={selected.fullName}
          title={content.attemptsTitle}
        >
          <dl className={styles.summaryRow}>
            <div>
              <dt>{content.summaryLabels.candidates}</dt>
              <dd>{selected.candidateCount}</dd>
            </div>
            <div>
              <dt>{content.summaryLabels.updated}</dt>
              <dd>
                <time dateTime={selected.updatedAt}>
                  {selected.updatedAtLabel}
                </time>
              </dd>
            </div>
          </dl>

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
                {selected.attempts.map((attempt) => (
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
      ) : null}
    </WorkspacePage>
  );
}
