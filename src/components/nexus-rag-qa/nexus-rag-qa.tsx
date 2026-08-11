import styles from "@/components/nexus-rag-qa/nexus-rag-qa.module.css";
import type { NexusRagQaContent } from "@/components/nexus-rag-qa/nexus-rag-qa-content";
import {
  WorkspacePage,
  WorkspacePageHeader,
  WorkspacePanel,
} from "@/components/nexus-workspace-page/nexus-workspace-page";
import shell from "@/components/nexus-workspace-page/nexus-workspace-page.module.css";

type NexusRagQaProps = {
  content: NexusRagQaContent;
};

export function NexusRagQa({ content }: NexusRagQaProps) {
  return (
    <WorkspacePage>
      <WorkspacePageHeader
        description={content.description}
        title={content.title}
      />

      <div className={styles.askCard}>
        <div className={shell.toolbar}>
          <label className={shell.field} htmlFor="rag-question">
            <span className={styles.visuallyHidden}>{content.queryLabel}</span>
            <input
              id="rag-question"
              name="question"
              placeholder={content.queryPlaceholder}
              type="text"
            />
          </label>
          <button className={shell.primaryButton} type="button">
            {content.askLabel}
          </button>
        </div>
      </div>

      <WorkspacePanel
        id="rag-qa-history"
        subtitle={content.historySubtitle}
        title={content.historyTitle}
      >
        <ol className={styles.exchangeList}>
          {content.exchanges.map((exchange) => (
            <li className={styles.exchange} key={exchange.id}>
              <div className={styles.questionRow}>
                <p className={styles.question}>{exchange.question}</p>
                <span className={styles.questionMeta}>
                  {exchange.questionLanguageLabel} · {exchange.askedAtLabel}
                </span>
              </div>

              <div
                className={styles.answer}
                data-supported={exchange.supported}
              >
                {exchange.supported ? null : (
                  <span className={styles.unsupportedFlag}>
                    {content.unsupportedLabel}
                  </span>
                )}
                <p>{exchange.answer}</p>
              </div>

              {exchange.citations.length > 0 ? (
                <div className={styles.citations}>
                  <p className={styles.citationsTitle}>
                    {content.citationsTitle}
                  </p>
                  <ul>
                    {exchange.citations.map((citation) => (
                      <li className={styles.citation} key={citation.id}>
                        <p className={styles.citationSource}>
                          {citation.documentTitle}
                          <span>
                            {content.pageLabel} {citation.page} ·{" "}
                            {citation.versionLabel} · {citation.chunkLabel}
                          </span>
                        </p>
                        <blockquote>{citation.quote}</blockquote>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </li>
          ))}
        </ol>
      </WorkspacePanel>
    </WorkspacePage>
  );
}
