"use client";

import { type FormEvent, useEffect, useState } from "react";
import { NexusDocumentNav } from "@/components/nexus-document-workspace/nexus-document-nav";
import { useNexusDocumentCatalog } from "@/components/nexus-document-workspace/nexus-document-server";
import styles from "@/components/nexus-rag-qa/nexus-rag-qa.module.css";
import type {
  NexusRagQaContent,
  RagExchange,
} from "@/components/nexus-rag-qa/nexus-rag-qa-content";
import {
  NexusWorkspaceButton,
  NexusWorkspaceCard,
  NexusWorkspaceField,
  NexusWorkspaceNotice,
} from "@/components/nexus-workspace-ui/nexus-workspace-elements";
import { formatTimestamp } from "@/components/nexus-workspace-ui/nexus-workspace-format";
import {
  NexusWorkspaceMetrics,
  NexusWorkspacePage,
} from "@/components/nexus-workspace-ui/nexus-workspace-page";
import { NexusWorkspaceTableBadge } from "@/components/nexus-workspace-ui/nexus-workspace-records";
import {
  type NexusSelectConfig,
  NexusWorkspaceSelect,
} from "@/components/nexus-workspace-ui/nexus-workspace-select";
import { apiErrorMessage } from "@/lib/api-client";
import {
  askDocuments,
  listRagHistory,
  type RagAnswer,
  type RagHistoryItem,
} from "@/lib/api-rag";

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

function languageLabel(language: string) {
  return language === "en" ? "English" : "Bahasa Indonesia";
}

function exchangeFromAnswer(
  result: RagAnswer,
  locale: NexusRagQaContent["locale"],
): RagExchange {
  const bySource = new Map<string, RagExchange["sources"][number]>();
  for (const [index, citation] of result.citations.entries()) {
    const source = bySource.get(citation.documentPublicId) ?? {
      documentTitle: citation.documentTitle,
      id: citation.documentPublicId,
      passages: [],
    };
    source.passages.push({
      id: `${citation.documentPublicId}-${index}`,
      page: citation.pageNo,
      quote: citation.quoteText,
    });
    bySource.set(citation.documentPublicId, source);
  }
  return {
    answer: result.isRefused
      ? (result.refusalReason?.[locale] ?? "")
      : (result.answer ?? ""),
    askedAt: result.generatedAt,
    askedAtLabel: formatTimestamp(result.generatedAt),
    citationCount: result.citations.length,
    id: result.queryPublicId,
    question: result.question,
    questionLanguageLabel: languageLabel(result.language),
    sources: [...bySource.values()],
    supported: !result.isRefused,
  };
}

function exchangeFromHistory(item: RagHistoryItem): RagExchange {
  return {
    answer: item.isRefused ? (item.refusalReason ?? "") : (item.answer ?? ""),
    askedAt: item.askedAt,
    askedAtLabel: formatTimestamp(item.askedAt),
    citationCount: item.citationsCount,
    id: item.queryPublicId,
    question: item.question,
    questionLanguageLabel: languageLabel(item.language),
    sources: [],
    supported: !item.isRefused,
  };
}

export function NexusRagQa({ content }: { content: NexusRagQaContent }) {
  const catalog = useNexusDocumentCatalog(content.locale);
  const readyDocuments = catalog.documents.filter(
    (document) => document.processingJob.status === "succeeded",
  );
  const [query, setQuery] = useState("");
  const [exchanges, setExchanges] = useState<RagExchange[]>([]);
  const [historyError, setHistoryError] = useState("");
  const [error, setError] = useState("");
  const [isAsking, setIsAsking] = useState(false);
  const [scope, setScope] = useState("all");
  const [isScopeOpen, setIsScopeOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    listRagHistory()
      .then((items) => {
        if (cancelled) return;
        setExchanges((current) => [
          ...current,
          ...items
            .map(exchangeFromHistory)
            .filter(
              (item) => !current.some((existing) => existing.id === item.id),
            ),
        ]);
      })
      .catch((cause: unknown) => {
        if (cancelled) return;
        setHistoryError(apiErrorMessage(cause, content.historyLoadErrorLabel));
      });
    return () => {
      cancelled = true;
    };
  }, [content.historyLoadErrorLabel]);

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
  const supportedCount = exchanges.filter(
    (exchange) => exchange.supported,
  ).length;
  const citationCount = exchanges.reduce(
    (total, exchange) => total + exchange.citationCount,
    0,
  );

  async function ask(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const question = query.trim();
    if (isAsking) return;
    if (question.length < 3) {
      setError(content.emptyQuestionLabel);
      return;
    }
    setError("");
    setIsAsking(true);
    try {
      const result = await askDocuments({
        documentPublicIds: scope === "all" ? undefined : [scope],
        language: content.locale,
        question,
      });
      setExchanges((current) => [
        exchangeFromAnswer(result, content.locale),
        ...current,
      ]);
      setQuery("");
    } catch (cause) {
      setError(
        apiErrorMessage(
          cause,
          content.locale === "id"
            ? "Pertanyaan belum dapat dijawab."
            : "The question could not be answered.",
          content.locale,
        ),
      );
    } finally {
      setIsAsking(false);
    }
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
            <NexusWorkspaceButton
              disabled={isAsking}
              tone="primary"
              type="submit"
            >
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
                {content.locale === "id" ? "pertanyaan" : "questions"}
              </p>
            </div>
            <p>
              {content.locale === "id"
                ? "Periksa kutipan sebelum memakai jawaban sebagai dasar keputusan."
                : "Check citations before using an answer as a decision basis."}
            </p>
          </header>
          {historyError ? (
            <NexusWorkspaceNotice tone="danger">
              {historyError}
            </NexusWorkspaceNotice>
          ) : null}
          {exchanges.length === 0 && !historyError ? (
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
                  {exchange.sources.length === 0 && exchange.citationCount > 0
                    ? ` · ${exchange.citationCount} ${content.locale === "id" ? "kutipan" : "citations"}`
                    : ""}
                </p>
                {exchange.sources.length > 0 ? (
                  <details className={styles.citations}>
                    <summary>
                      {content.citationsTitle} ({exchange.citationCount})
                    </summary>
                    <ul>
                      {exchange.sources.map((source) => (
                        <li key={source.id}>
                          <strong>{source.documentTitle}</strong>
                          {source.passages.map((passage) => (
                            <blockquote key={passage.id}>
                              <span>
                                {content.pageLabel} {passage.page}
                              </span>
                              <p>{passage.quote}</p>
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
