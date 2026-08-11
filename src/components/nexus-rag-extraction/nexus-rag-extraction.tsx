import styles from "@/components/nexus-rag-extraction/nexus-rag-extraction.module.css";
import type { NexusRagExtractionContent } from "@/components/nexus-rag-extraction/nexus-rag-extraction-content";
import {
  WorkspacePage,
  WorkspacePageHeader,
  WorkspacePanel,
} from "@/components/nexus-workspace-page/nexus-workspace-page";
import shell from "@/components/nexus-workspace-page/nexus-workspace-page.module.css";

type NexusRagExtractionProps = {
  content: NexusRagExtractionContent;
};

export function NexusRagExtraction({ content }: NexusRagExtractionProps) {
  return (
    <WorkspacePage>
      <WorkspacePageHeader
        description={content.description}
        title={content.title}
      />

      <div className={styles.documentCard}>
        <div className={styles.documentCopy}>
          <strong>{content.documentTitle}</strong>
          <span>{content.documentMeta}</span>
        </div>

        <label className={shell.field} htmlFor="extraction-profile">
          <span>{content.profileLabel}</span>
          <select
            defaultValue={content.selectedProfileId}
            id="extraction-profile"
            name="profile"
          >
            {content.profileOptions.map((profile) => (
              <option key={profile.id} value={profile.id}>
                {profile.label} · {profile.version}
              </option>
            ))}
          </select>
        </label>
      </div>

      <WorkspacePanel id="rag-extraction-fields" title={content.fieldsTitle}>
        <ul className={styles.fieldList}>
          {content.fields.map((field) => (
            <li className={styles.field} key={field.id}>
              <div className={styles.fieldMain}>
                <p className={styles.fieldLabel}>{field.label}</p>
                <p className={styles.fieldValue} data-empty={!field.source}>
                  {field.source ? field.value : content.notFoundLabel}
                </p>
              </div>

              <div className={styles.fieldDecision}>
                {field.decision === "pending" ? null : (
                  <span
                    className={styles.decisionBadge}
                    data-decision={field.decision}
                  >
                    {field.decisionLabel}
                  </span>
                )}
                <div className={styles.decisionButtons}>
                  <button className={shell.ghostButton} type="button">
                    {content.acceptLabel}
                  </button>
                  <button className={shell.ghostButton} type="button">
                    {content.rejectLabel}
                  </button>
                </div>
              </div>

              {field.source ? (
                <details
                  className={`${shell.disclosure} ${styles.fieldSource}`}
                >
                  <summary>
                    {content.sourceLabel} · {content.pageLabel}{" "}
                    {field.source.page}
                  </summary>
                  <blockquote className={shell.disclosureBody}>
                    {field.source.quote}
                  </blockquote>
                </details>
              ) : null}
            </li>
          ))}
        </ul>
      </WorkspacePanel>
    </WorkspacePage>
  );
}
