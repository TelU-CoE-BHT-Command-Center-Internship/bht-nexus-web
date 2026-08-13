import styles from "@/components/nexus-rag-qa/nexus-rag-qa.module.css";
import type { NexusRagQaContent } from "@/components/nexus-rag-qa/nexus-rag-qa-content";
import { NexusWorkspacePage } from "@/components/nexus-workspace-ui/nexus-workspace-page";
import shell from "@/components/nexus-workspace-ui/nexus-workspace-page.module.css";
import {
  NexusWorkspacePanel,
  NexusWorkspaceStack,
} from "@/components/nexus-workspace-ui/nexus-workspace-panel";

type NexusRagQaProps = {
  content: NexusRagQaContent;
};

export function NexusRagQa({ content }: NexusRagQaProps) {
  return (
    <NexusWorkspacePage
      description={content.description}
      title={content.title}
      descriptionId="qa-description"
      titleId="qa-title"
    >
      <NexusWorkspaceStack>
        <div className={styles.askCard}>
          <div className={shell.toolbar}>
            <label className={shell.field} htmlFor="rag-question">
              <span className={styles.visuallyHidden}>
                {content.queryLabel}
              </span>
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

        <NexusWorkspacePanel id="rag-qa-history" title={content.historyTitle}>
          <ol className={styles.exchangeList}>
            {content.exchanges.map((exchange) => (
              <li className={styles.exchange} key={exchange.id}>
                <p className={styles.question}>{exchange.question}</p>

                {exchange.supported ? null : (
                  <p className={styles.unsupportedFlag}>
                    {content.unsupportedLabel}
                  </p>
                )}

                <p className={styles.answer}>{exchange.answer}</p>

                <p className={styles.exchangeMeta}>
                  {exchange.questionLanguageLabel} ·{" "}
                  <time dateTime={exchange.askedAt}>
                    {exchange.askedAtLabel}
                  </time>
                </p>

                {exchange.sources.length > 0 ? (
                  <details className={shell.disclosure}>
                    <summary>
                      {content.citationsTitle} ({exchange.sources.length})
                    </summary>
                    <ul className={`${shell.disclosureBody} ${styles.sources}`}>
                      {exchange.sources.map((source) => (
                        <li key={source.id}>
                          <p className={styles.sourceTitle}>
                            {source.documentTitle}
                          </p>
                          <ul className={styles.passages}>
                            {source.passages.map((passage) => (
                              <li className={styles.passage} key={passage.id}>
                                <span className={styles.passagePage}>
                                  {content.pageLabel} {passage.page}
                                </span>
                                <blockquote>{passage.quote}</blockquote>
                              </li>
                            ))}
                          </ul>
                        </li>
                      ))}
                    </ul>
                  </details>
                ) : null}
              </li>
            ))}
          </ol>
        </NexusWorkspacePanel>
      </NexusWorkspaceStack>
    </NexusWorkspacePage>
  );
}
