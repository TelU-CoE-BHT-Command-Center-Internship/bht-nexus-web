"use client";

import { AutomationStatusBadge } from "@/components/nexus-automation-status/nexus-automation-status";
import styles from "@/components/nexus-rag-library/nexus-rag-library.module.css";
import type {
  NexusRagLibraryContent,
  RagDocument,
} from "@/components/nexus-rag-library/nexus-rag-library-content";
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

type SortKey = "indexedAt" | "owner" | "status" | "title";

type NexusRagLibraryProps = {
  content: NexusRagLibraryContent;
};

function readDocument(document: RagDocument, key: SortKey) {
  if (key === "owner") {
    return document.ownerUnit;
  }

  if (key === "status") {
    return document.statusLabel;
  }

  if (key === "indexedAt") {
    return document.indexedLabel;
  }

  return document.title;
}

export function NexusRagLibrary({ content }: NexusRagLibraryProps) {
  const { sort, sortRows, toggle } = useTableSort<SortKey>("indexedAt");
  const documents = sortRows(content.documents, readDocument);

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
        title={content.title}
      />

      <WorkspacePanel flush id="rag-library-documents" label={content.title}>
        <div className={shell.tableWrap}>
          <table className={shell.table}>
            <thead>
              <tr>
                <SortableColumn
                  activeKey={sort.key}
                  direction={sort.direction}
                  label={content.columns.document}
                  onSort={toggle}
                  sortKey="title"
                />
                <SortableColumn
                  activeKey={sort.key}
                  direction={sort.direction}
                  label={content.columns.owner}
                  onSort={toggle}
                  sortKey="owner"
                />
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
                  label={content.columns.indexedAt}
                  onSort={toggle}
                  sortKey="indexedAt"
                />
              </tr>
            </thead>
            <tbody>
              {documents.map((document) => (
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
                    {document.statusDetail ? (
                      <span className={styles.statusDetail}>
                        {document.statusDetail}
                      </span>
                    ) : null}
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
