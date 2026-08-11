import { AutomationStatusBadge } from "@/components/nexus-automation-status/nexus-automation-status";
import styles from "@/components/nexus-scraper-search/nexus-scraper-search.module.css";
import type { NexusScraperSearchContent } from "@/components/nexus-scraper-search/nexus-scraper-search-content";
import {
  WorkspacePage,
  WorkspacePageHeader,
  WorkspacePanel,
} from "@/components/nexus-workspace-page/nexus-workspace-page";
import shell from "@/components/nexus-workspace-page/nexus-workspace-page.module.css";

type NexusScraperSearchProps = {
  content: NexusScraperSearchContent;
};

export function NexusScraperSearch({ content }: NexusScraperSearchProps) {
  return (
    <WorkspacePage>
      <WorkspacePageHeader
        description={content.description}
        eyebrow={content.eyebrow}
        previewLabel={content.previewLabel}
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
        id="scraper-approved-hosts"
        subtitle={content.approvedHostsSubtitle}
        title={content.approvedHostsTitle}
      >
        <ul className={styles.hostList}>
          {content.approvedHosts.map((host) => (
            <li className={styles.host} key={host.host}>
              <code>{host.host}</code>
            </li>
          ))}
        </ul>
      </WorkspacePanel>

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
                <th scope="col">{content.columns.input}</th>
                <th scope="col">{content.columns.normalized}</th>
                <th scope="col">{content.columns.source}</th>
                <th scope="col">{content.columns.status}</th>
                <th scope="col">{content.columns.submittedAt}</th>
              </tr>
            </thead>
            <tbody>
              {content.submissions.map((submission) => (
                <tr key={submission.id}>
                  <th scope="row">
                    <span className={styles.rawInput}>
                      {submission.rawInput}
                    </span>
                    <span className={styles.submissionMeta}>
                      {submission.inputKindLabel} · {submission.jobId}
                    </span>
                  </th>
                  <td data-label={content.columns.normalized}>
                    <code>{submission.normalizedValue}</code>
                  </td>
                  <td data-label={content.columns.source}>
                    {submission.sourceLabel}
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
