import { AutomationStatusBadge } from "@/components/nexus-automation-status/nexus-automation-status";
import styles from "@/components/nexus-rag-library/nexus-rag-library.module.css";
import type { NexusRagLibraryContent } from "@/components/nexus-rag-library/nexus-rag-library-content";
import {
  WorkspaceNote,
  WorkspacePage,
  WorkspacePageHeader,
  WorkspacePanel,
} from "@/components/nexus-workspace-page/nexus-workspace-page";
import shell from "@/components/nexus-workspace-page/nexus-workspace-page.module.css";

type NexusRagLibraryProps = {
  content: NexusRagLibraryContent;
};

export function NexusRagLibrary({ content }: NexusRagLibraryProps) {
  return (
    <WorkspacePage>
      <WorkspacePageHeader
        actions={
          <>
            <button className={shell.primaryButton} type="button">
              {content.uploadLabel}
            </button>
            <span className={styles.uploadNote}>{content.uploadNote}</span>
          </>
        }
        description={content.description}
        eyebrow={content.eyebrow}
        title={content.title}
      />

      <WorkspaceNote>{content.indexNote}</WorkspaceNote>

      <WorkspacePanel id="rag-library-summary" title={content.summaryTitle}>
        <ul className={styles.summaryGrid}>
          {content.statusSummary.map((entry) => (
            <li
              className={styles.summaryCard}
              data-status={entry.status}
              key={entry.status}
            >
              <strong>{entry.count}</strong>
              <span>{entry.label}</span>
            </li>
          ))}
        </ul>
      </WorkspacePanel>

      <WorkspacePanel
        flush
        id="rag-library-documents"
        subtitle={content.tableSubtitle}
        title={content.tableTitle}
      >
        <div className={shell.tableWrap}>
          <table className={shell.table}>
            <thead>
              <tr>
                <th scope="col">{content.columns.document}</th>
                <th scope="col">{content.columns.owner}</th>
                <th scope="col">{content.columns.status}</th>
                <th scope="col">{content.columns.indexedAt}</th>
              </tr>
            </thead>
            <tbody>
              {content.documents.map((document) => (
                <tr key={document.id}>
                  <th scope="row">
                    {document.title}
                    <span className={styles.documentMeta}>
                      {document.fileLabel} · {document.jobId}
                    </span>
                  </th>
                  <td data-label={content.columns.owner}>
                    {document.ownerUnit}
                  </td>
                  <td data-label={content.columns.status}>
                    <AutomationStatusBadge
                      label={document.statusLabel}
                      status={document.status}
                    />
                    <span className={styles.statusDetail}>
                      {document.statusDetail}
                    </span>
                  </td>
                  <td data-label={content.columns.indexedAt}>
                    <time>{document.indexedLabel}</time>
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
