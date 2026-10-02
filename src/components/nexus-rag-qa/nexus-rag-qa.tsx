"use client";

import { type FormEvent, useState } from "react";
import { NexusDocumentNav } from "@/components/nexus-document-workspace/nexus-document-nav";
import { useNexusDocumentCatalog } from "@/components/nexus-document-workspace/nexus-document-server";
import styles from "@/components/nexus-rag-qa/nexus-rag-qa.module.css";
import type { NexusRagQaContent } from "@/components/nexus-rag-qa/nexus-rag-qa-content";
import {
  NexusWorkspaceButton,
  NexusWorkspaceCard,
  NexusWorkspaceField,
  NexusWorkspaceNotice,
} from "@/components/nexus-workspace-ui/nexus-workspace-elements";
import {
  NexusWorkspaceMetrics,
  NexusWorkspacePage,
} from "@/components/nexus-workspace-ui/nexus-workspace-page";
import { NexusWorkspaceTableBadge } from "@/components/nexus-workspace-ui/nexus-workspace-records";
import {
  type NexusSelectConfig,
  NexusWorkspaceSelect,
} from "@/components/nexus-workspace-ui/nexus-workspace-select";
import { announceWorkerUnavailable } from "@/lib/worker-unavailable";

function QaIcon({ name }: { name: "answer" | "document" | "source" }) {
  if (name === "document")
    return (
      <svg aria-hidden="true" fill="none" viewBox="0 0 24 24">
        <path d="M6 3h8l4 4v14H6zM14 3v5h4M9 12h6M9 16h6" />
      </svg>
    );
  if (name === "source")
    return (
      <svg aria-hidden="true" fill="none" viewBox="0 0 24 24">
        <path d="M7 4h10v16H7zM10 8h4M10 12h4M10 16h3" />
      </svg>
    );
  return (
    <svg aria-hidden="true" fill="none" viewBox="0 0 24 24">
      <path d="M5 5h14v11H9l-4 4zM9 9h6M9 12h4" />
    </svg>
  );
}

export function NexusRagQa({ content }: { content: NexusRagQaContent }) {
  const catalog = useNexusDocumentCatalog(content.locale);
  const readyDocuments = catalog.documents.filter(
    (document) => document.processingJob.status === "succeeded",
  );
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");
  const [scope, setScope] = useState("all");
  const [isScopeOpen, setIsScopeOpen] = useState(false);
  const scopeConfig: NexusSelectConfig = {
    defaultValue: "all",
    id: "qa-document-scope",
    label: content.locale === "id" ? "Cakupan dokumen" : "Document scope",
    options: [
      {
        label:
          content.locale === "id"
            ? "Semua dokumen siap"
            : "All ready documents",
        value: "all",
      },
      ...readyDocuments.map((document) => ({
        label: document.title,
        value: document.id,
      })),
    ],
  };
  const exchanges = content.exchanges;
  const supportedCount = exchanges.filter(
    (exchange) => exchange.supported,
  ).length;
  const citationCount = exchanges.reduce(
    (total, exchange) =>
      total +
      exchange.sources.reduce(
        (sourceTotal, source) => sourceTotal + source.passages.length,
        0,
      ),
    0,
  );

  function ask(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!query.trim()) {
      setError(content.emptyQuestionLabel);
      return;
    }
    setError("");
    announceWorkerUnavailable({ worker: "rag" });
  }

  return (
    <NexusWorkspacePage
      description={content.description}
      descriptionId="qa-description"
      title={content.title}
      titleId="qa-title"
    >
      <NexusWorkspaceMetrics
        metrics={[
          {
            icon: <QaIcon name="document" />,
            id: "documents",
            label: content.locale === "id" ? "Dokumen Siap" : "Ready Documents",
            tone: "completed",
            unit: content.locale === "id" ? "data" : "files",
            value: readyDocuments.length,
          },
          {
            icon: <QaIcon name="answer" />,
            id: "answers",
            label:
              content.locale === "id" ? "Jawaban Tersimpan" : "Saved Answers",
            tone: "waiting",
            unit: content.locale === "id" ? "data" : "answers",
            value: exchanges.length,
          },
          {
            icon: <QaIcon name="source" />,
            id: "citations",
            label:
              content.locale === "id" ? "Kutipan Sumber" : "Source Citations",
            tone:
              supportedCount === exchanges.length ? "completed" : "needs-fix",
            unit: content.locale === "id" ? "bukti" : "passages",
            value: citationCount,
          },
        ]}
      />

      <div className={styles.workspace}>
        <NexusDocumentNav locale={content.locale} />
        <NexusWorkspaceCard
          description={
            content.locale === "id"
              ? "Jawaban tidak akan mengarang saat bukti tidak ditemukan. Setiap klaim yang didukung ditautkan ke halaman sumber."
              : "Answers do not invent information when evidence is missing. Every supported claim links to a source page."
          }
          title={
            content.locale === "id" ? "Ajukan pertanyaan" : "Ask a question"
          }
        >
          <form className={styles.askForm} onSubmit={ask}>
            <NexusWorkspaceField
              aria-describedby={error ? "rag-question-error" : undefined}
              autoComplete="off"
              id="rag-question"
              label={content.queryLabel}
              name="question"
              onChange={(event) => setQuery(event.target.value)}
              placeholder={content.queryPlaceholder}
              value={query}
            />
            <div className={styles.scopeField}>
              <span>{scopeConfig.label}</span>
              <NexusWorkspaceSelect
                config={scopeConfig}
                isOpen={isScopeOpen}
                name="qa-document-scope"
                onOpenChange={setIsScopeOpen}
                onValueChange={(value) => {
                  setScope(value);
                  setError("");
                }}
                value={scope}
              />
            </div>
            <NexusWorkspaceButton tone="primary" type="submit">
              {content.askLabel}
            </NexusWorkspaceButton>
          </form>
          {error ? (
            <div
              className={styles.formMessage}
              id="rag-question-error"
              role="alert"
            >
              <NexusWorkspaceNotice tone="danger">{error}</NexusWorkspaceNotice>
            </div>
          ) : null}
        </NexusWorkspaceCard>

        <section aria-labelledby="qa-history-title" className={styles.history}>
          <header className={styles.historyHeader}>
            <div>
              <h3 id="qa-history-title">{content.historyTitle}</h3>
              <p>
                {exchanges.length}{" "}
                {content.locale === "id"
                  ? "pertanyaan pada sesi ini"
                  : "questions in this session"}
              </p>
            </div>
            <p>
              {content.locale === "id"
                ? "Periksa kutipan sebelum memakai jawaban sebagai dasar keputusan."
                : "Check citations before using an answer as a decision basis."}
            </p>
          </header>
          {exchanges.length === 0 ? (
            <p className={styles.exchangeMeta}>{content.historyEmptyLabel}</p>
          ) : null}
          <ol className={styles.exchangeList}>
            {exchanges.map((exchange) => (
              <li className={styles.exchange} key={exchange.id}>
                <div className={styles.exchangeHeader}>
                  <div>
                    <span className={styles.eyebrow}>
                      {content.locale === "id" ? "Pertanyaan" : "Question"}
                    </span>
                    <h4>{exchange.question}</h4>
                  </div>
                  <NexusWorkspaceTableBadge
                    tone={exchange.supported ? "success" : "danger"}
                  >
                    {exchange.supported
                      ? content.locale === "id"
                        ? "Didukung sumber"
                        : "Source-supported"
                      : content.unsupportedLabel}
                  </NexusWorkspaceTableBadge>
                </div>
                <p className={styles.answer}>{exchange.answer}</p>
                <p className={styles.exchangeMeta}>
                  {exchange.questionLanguageLabel} ·{" "}
                  <time dateTime={exchange.askedAt}>
                    {exchange.askedAtLabel}
                  </time>
                </p>
                {exchange.sources.length > 0 ? (
                  <details className={styles.citations}>
                    <summary>
                      {content.citationsTitle} ({exchange.sources.length})
                    </summary>
                    <ul>
                      {exchange.sources.map((source) => (
                        <li key={source.id}>
                          <strong>{source.documentTitle}</strong>
                          {source.passages.map((passage) => (
                            <blockquote key={passage.id}>
                              <span>
                                {content.pageLabel} {passage.page}
                                {passage.documentVersion
                                  ? ` · V${passage.documentVersion}`
                                  : ""}
                                {passage.chunkId ? ` · ${passage.chunkId}` : ""}
                              </span>
                              <p>{passage.quote}</p>
                              {passage.href ? (
                                <a
                                  href={passage.href}
                                  rel="noreferrer"
                                  target="_blank"
                                >
                                  {content.locale === "id"
                                    ? "Buka dokumen"
                                    : "Open document"}
                                </a>
                              ) : null}
                            </blockquote>
                          ))}
                        </li>
                      ))}
                    </ul>
                  </details>
                ) : null}
              </li>
            ))}
          </ol>
        </section>
      </div>
    </NexusWorkspacePage>
  );
}
