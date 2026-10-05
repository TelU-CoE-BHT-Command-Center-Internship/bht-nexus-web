"use client";

import { type ChangeEvent, useDeferredValue, useMemo, useState } from "react";
import { getAutomationStatusLabel } from "@/components/nexus-automation-status/nexus-automation-status-content";
import { latestDocumentProcessingAttempt } from "@/components/nexus-document-workspace/nexus-document-content";
import { NexusDocumentNav } from "@/components/nexus-document-workspace/nexus-document-nav";
import { useNexusDocumentCatalog } from "@/components/nexus-document-workspace/nexus-document-server";
import styles from "@/components/nexus-rag-library/nexus-rag-library.module.css";
import type {
  NexusRagLibraryContent,
  RagDocument,
} from "@/components/nexus-rag-library/nexus-rag-library-content";
import { NexusTablePagination } from "@/components/nexus-workspace-ui/nexus-table-pagination";
import {
  NexusWorkspaceSearch,
  NexusWorkspaceToolbar,
} from "@/components/nexus-workspace-ui/nexus-workspace-controls";
import {
  NexusWorkspaceButton,
  NexusWorkspaceEmptyState,
  NexusWorkspaceLinkButton,
  NexusWorkspaceLoadError,
  NexusWorkspaceNotice,
} from "@/components/nexus-workspace-ui/nexus-workspace-elements";
import { NexusWorkspaceIconPaths } from "@/components/nexus-workspace-ui/nexus-workspace-icons";
import { NexusWorkspaceInfoHint } from "@/components/nexus-workspace-ui/nexus-workspace-info-hint";
import {
  NexusWorkspaceMetrics,
  NexusWorkspacePage,
} from "@/components/nexus-workspace-ui/nexus-workspace-page";
import {
  NexusWorkspaceMobileCard,
  type NexusWorkspaceRecordColumn,
  NexusWorkspaceRecordTable,
  NexusWorkspaceTableBadge,
  NexusWorkspaceTablePrimary,
} from "@/components/nexus-workspace-ui/nexus-workspace-records";
import {
  type NexusSelectConfig,
  NexusWorkspaceSelect,
} from "@/components/nexus-workspace-ui/nexus-workspace-select";
import { NexusWorkspaceTableSection } from "@/components/nexus-workspace-ui/nexus-workspace-table";
import { apiErrorMessage } from "@/lib/api-client";
import {
  DOCUMENT_UPLOAD_LIMIT_BYTES,
  reindexDocument,
  uploadDocument,
} from "@/lib/api-documents";

const columns: readonly NexusWorkspaceRecordColumn[] = [
  { id: "primary", label: "Dokumen", primary: true },
  { id: "owner", label: "Unit pemilik" },
  { id: "status", label: "Status pemrosesan" },
  { id: "updated", label: "Diperbarui" },
  { id: "action", label: "Aksi" },
];

function DocumentIcon({ name }: { name: "document" | "queue" | "ready" }) {
  const shared = {
    document: "document",
    queue: "clock",
    ready: "check",
  } as const;

  return (
    <svg aria-hidden="true" fill="none" viewBox="0 0 24 24">
      <NexusWorkspaceIconPaths name={shared[name]} />
    </svg>
  );
}

function statusTone(status: RagDocument["processingJob"]["status"]) {
  if (status === "succeeded") return "success" as const;
  if (status === "failed" || status === "failed_permanently")
    return "danger" as const;
  if (status === "running") return "info" as const;
  return "waiting" as const;
}

export function NexusRagLibrary({
  content,
}: {
  content: NexusRagLibraryContent;
}) {
  const catalog = useNexusDocumentCatalog(content.locale);
  const documents = catalog.documents;
  const [isUploading, setIsUploading] = useState(false);
  const [reindexingId, setReindexingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{
    message: string;
    tone: "danger" | "success";
  } | null>(null);
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query);
  const [status, setStatus] = useState("all");
  const [isStatusOpen, setIsStatusOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSizeValue, setPageSizeValue] = useState("10");
  const statusConfig: NexusSelectConfig = {
    defaultValue: "all",
    id: "document-status",
    label: content.columns.status,
    options: [
      {
        label: content.locale === "id" ? "Semua status" : "All statuses",
        value: "all",
      },
      {
        label: getAutomationStatusLabel(content.locale, "succeeded"),
        tone: "completed",
        value: "succeeded",
      },
      {
        label: getAutomationStatusLabel(content.locale, "running"),
        tone: "waiting",
        value: "running",
      },
      {
        label: getAutomationStatusLabel(content.locale, "queued"),
        tone: "neutral",
        value: "queued",
      },
      {
        label: getAutomationStatusLabel(content.locale, "retrying"),
        tone: "needs-fix",
        value: "retrying",
      },
      {
        label: getAutomationStatusLabel(content.locale, "failed"),
        tone: "needs-fix",
        value: "failed",
      },
      {
        label: getAutomationStatusLabel(content.locale, "failed_permanently"),
        tone: "needs-fix",
        value: "failed_permanently",
      },
    ],
  };
  const pageSizeConfig: NexusSelectConfig = {
    defaultValue: "10",
    id: "document-page-size",
    label:
      content.locale === "id"
        ? "Jumlah dokumen per halaman"
        : "Documents per page",
    options: [
      { label: "10 / halaman", value: "10" },
      { label: "20 / halaman", value: "20" },
      { label: "50 / halaman", value: "50" },
    ],
  };
  const filteredDocuments = useMemo(() => {
    const needle = deferredQuery
      .trim()
      .toLocaleLowerCase(content.locale === "id" ? "id-ID" : "en-US");
    return documents.filter(
      (document) =>
        (status === "all" ||
          (document.processingJob.status === status && !document.notIndexed)) &&
        (!needle ||
          `${document.title} ${document.ownerUnit} ${document.fileLabel}`
            .toLocaleLowerCase()
            .includes(needle)),
    );
  }, [content.locale, deferredQuery, documents, status]);
  const pageSize = Number(pageSizeValue);
  const totalPages = Math.max(
    1,
    Math.ceil(filteredDocuments.length / pageSize),
  );
  const safePage = Math.min(Math.max(currentPage, 1), totalPages);
  const visibleDocuments = filteredDocuments.slice(
    (safePage - 1) * pageSize,
    safePage * pageSize,
  );
  const readyCount = documents.filter(
    (document) => document.processingJob.status === "succeeded",
  ).length;
  const queueCount = documents.filter(
    (document) =>
      document.processingJob.status === "queued" ||
      document.processingJob.status === "running" ||
      document.processingJob.status === "retrying",
  ).length;

  async function addDocument(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file || isUploading) return;
    const extension = file.name.split(".").pop()?.toLocaleLowerCase();
    if (
      (extension !== "pdf" && extension !== "docx") ||
      file.size > DOCUMENT_UPLOAD_LIMIT_BYTES
    ) {
      setFeedback({ message: content.fileErrorLabel, tone: "danger" });
      return;
    }
    setIsUploading(true);
    setFeedback(null);
    try {
      await uploadDocument(file);
      catalog.reload();
      setCurrentPage(1);
      setFeedback({
        message: `${file.name} ${content.uploadSuccessLabel}`,
        tone: "success",
      });
    } catch (error) {
      setFeedback({
        message: apiErrorMessage(
          error,
          content.locale === "id"
            ? "Dokumen belum dapat diunggah."
            : "The document could not be uploaded.",
          content.locale,
        ),
        tone: "danger",
      });
    } finally {
      setIsUploading(false);
    }
  }

  async function reindex(documentId: string) {
    setReindexingId(documentId);
    setFeedback(null);
    try {
      await reindexDocument(documentId);
      catalog.refresh(true);
    } catch (error) {
      setFeedback({
        message: apiErrorMessage(
          error,
          content.locale === "id"
            ? "Dokumen belum dapat diindeks ulang."
            : "The document could not be indexed again.",
          content.locale,
        ),
        tone: "danger",
      });
    } finally {
      setReindexingId(null);
    }
  }

  const rows = visibleDocuments.map((document) => {
    const processingStatus = document.processingJob.status;
    const failureReason = latestDocumentProcessingAttempt(document)?.reason;
    const tone = document.notIndexed
      ? ("waiting" as const)
      : statusTone(processingStatus);
    const questionHref = `${
      content.locale === "id"
        ? "/nexus/tanya-dokumen"
        : "/en/nexus/ask-documents"
    }?document=${encodeURIComponent(document.id)}`;
    const extractionHref = `${
      content.locale === "id" ? "/nexus/ekstraksi" : "/en/nexus/extraction"
    }?document=${encodeURIComponent(document.id)}`;
    const action =
      processingStatus === "succeeded" && document.capabilities.length > 0 ? (
        <span className={styles.documentActions} key={`${document.id}-action`}>
          {document.capabilities.includes("qa") ? (
            <NexusWorkspaceLinkButton href={questionHref}>
              {content.locale === "id" ? "Tanya" : "Ask"}
            </NexusWorkspaceLinkButton>
          ) : null}
          {document.capabilities.includes("extraction") ? (
            <NexusWorkspaceLinkButton href={extractionHref}>
              {content.locale === "id" ? "Ekstrak" : "Extract"}
            </NexusWorkspaceLinkButton>
          ) : null}
        </span>
      ) : processingStatus === "failed" && !document.notIndexed ? (
        <NexusWorkspaceButton
          disabled={reindexingId !== null}
          key={`${document.id}-action`}
          onClick={() => void reindex(document.id)}
          type="button"
        >
          {reindexingId === document.id
            ? content.locale === "id"
              ? "Mengantrekan…"
              : "Queueing…"
            : content.locale === "id"
              ? "Indeks ulang"
              : "Index again"}
        </NexusWorkspaceButton>
      ) : (
        <span className={styles.noAction} key={`${document.id}-action`}>
          —
        </span>
      );
    return {
      id: document.id,
      cells: {
        primary: (
          <NexusWorkspaceTablePrimary
            title={document.title}
            subtitle={document.fileLabel}
          />
        ),
        owner: document.ownerUnit,
        status: (
          <span className={styles.statusDetail}>
            <NexusWorkspaceTableBadge tone={tone}>
              {document.statusLabel}
            </NexusWorkspaceTableBadge>
            {failureReason ? (
              <NexusWorkspaceInfoHint
                label={content.locale === "id" ? "Kendala" : "Issue"}
                text={failureReason}
              />
            ) : null}
          </span>
        ),
        updated: (
          <time dateTime={document.updatedAt}>{document.updatedLabel}</time>
        ),
        action,
      },
      mobile: (
        <NexusWorkspaceMobileCard
          action={action}
          eyebrow={
            <NexusWorkspaceTableBadge tone={tone}>
              {document.statusLabel}
            </NexusWorkspaceTableBadge>
          }
          meta={
            <dl>
              <div>
                <dt>{content.columns.owner}</dt>
                <dd>{document.ownerUnit}</dd>
              </div>
              <div>
                <dt>{content.columns.updatedAt}</dt>
                <dd>{document.updatedLabel}</dd>
              </div>
              <div>
                <dt>Format</dt>
                <dd>{document.fileLabel}</dd>
              </div>
              {failureReason ? (
                <div>
                  <dt>{content.locale === "id" ? "Kendala" : "Issue"}</dt>
                  <dd>{failureReason}</dd>
                </div>
              ) : null}
            </dl>
          }
          title={document.title}
        />
      ),
    };
  });

  return (
    <NexusWorkspacePage
      actions={
        <div className={styles.uploadActions}>
          <label className={styles.uploadButton}>
            {content.uploadLabel}
            <input
              disabled={isUploading}
              accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              className={styles.fileInput}
              onChange={addDocument}
              type="file"
            />
          </label>
          <span>{content.uploadNote}</span>
        </div>
      }
      description={content.description}
      descriptionId="library-description"
      title={content.title}
      titleId="library-title"
    >
      <NexusWorkspaceMetrics
        metrics={[
          {
            icon: <DocumentIcon name="document" />,
            id: "documents",
            label:
              content.locale === "id"
                ? "Dokumen Terkelola"
                : "Managed Documents",
            tone: "completed",
            unit: content.locale === "id" ? "data" : "files",
            value: documents.length,
          },
          {
            icon: <DocumentIcon name="ready" />,
            id: "ready",
            label: content.locale === "id" ? "Siap Digunakan" : "Ready to Use",
            tone: "completed",
            unit: content.locale === "id" ? "data" : "files",
            value: readyCount,
          },
          {
            icon: <DocumentIcon name="queue" />,
            id: "queue",
            label: content.locale === "id" ? "Dalam Pemrosesan" : "Processing",
            tone: "waiting",
            unit: content.locale === "id" ? "data" : "files",
            value: queueCount,
          },
        ]}
      />

      <div className={styles.workspace}>
        <NexusDocumentNav locale={content.locale} />
        {feedback ? (
          <NexusWorkspaceNotice tone={feedback.tone}>
            {feedback.message}
          </NexusWorkspaceNotice>
        ) : null}
        <NexusWorkspaceToolbar>
          <NexusWorkspaceSearch
            label={
              content.locale === "id" ? "Cari dokumen" : "Search documents"
            }
            name="document-search"
            onValueChange={(value) => {
              setQuery(value);
              setCurrentPage(1);
            }}
            placeholder={
              content.locale === "id"
                ? "Cari judul, format, atau unit pemilik..."
                : "Search title, format, or owning unit..."
            }
            value={query}
          />
          <NexusWorkspaceSelect
            config={statusConfig}
            isOpen={isStatusOpen}
            name="document-status"
            onOpenChange={setIsStatusOpen}
            onValueChange={(value) => {
              setStatus(value);
              setCurrentPage(1);
            }}
            value={status}
          />
        </NexusWorkspaceToolbar>
        <div aria-live="polite" className={styles.resultMeta}>
          {query !== deferredQuery
            ? content.locale === "id"
              ? "Memperbarui hasil pencarian..."
              : "Updating search results..."
            : `${filteredDocuments.length} ${content.locale === "id" ? "dokumen ditemukan" : "documents found"}`}
        </div>

        <NexusWorkspaceTableSection
          guidance={
            content.locale === "id"
              ? "Hanya dokumen selesai diproses yang dapat digunakan untuk jawaban bersitasi dan ekstraksi."
              : "Only processed documents can be used for cited answers and extraction."
          }
          summary={`${filteredDocuments.length} ${content.locale === "id" ? "sesuai filter dari" : "matching of"} ${documents.length} ${content.locale === "id" ? "dokumen" : "documents"}`}
          title={
            content.locale === "id" ? "Pustaka dokumen" : "Document library"
          }
          titleId="document-library-title"
        >
          <NexusWorkspaceRecordTable
            caption={content.title}
            columns={columns}
            empty={
              documents.length === 0 ? (
                <NexusWorkspaceEmptyState
                  description={
                    content.locale === "id"
                      ? "Unggah dokumen PDF atau DOCX untuk memulainya."
                      : "Upload a PDF or DOCX document to begin."
                  }
                  title={
                    content.locale === "id"
                      ? "Belum ada dokumen"
                      : "No documents yet"
                  }
                  tone="search"
                />
              ) : (
                <NexusWorkspaceEmptyState
                  description={
                    content.locale === "id"
                      ? "Ubah kata kunci atau filter status untuk melihat dokumen lain."
                      : "Change the keyword or status filter to see other documents."
                  }
                  title={
                    content.locale === "id"
                      ? "Tidak ada dokumen yang cocok"
                      : "No matching documents"
                  }
                  tone="search"
                />
              )
            }
            error={
              catalog.state === "error" ? (
                <NexusWorkspaceLoadError
                  description={catalog.errorMessage ?? content.loadErrorTitle}
                  onRetry={catalog.reload}
                  title={content.loadErrorTitle}
                />
              ) : undefined
            }
            isLoading={query !== deferredQuery || catalog.state === "loading"}
            pagination={
              <NexusTablePagination
                currentPage={safePage}
                itemCount={filteredDocuments.length}
                navigationLabel={
                  content.locale === "id"
                    ? "Navigasi halaman dokumen"
                    : "Document page navigation"
                }
                nextPageLabel={
                  content.locale === "id" ? "Halaman berikutnya" : "Next page"
                }
                onPageChange={setCurrentPage}
                onPageSizeChange={(value) => {
                  setPageSizeValue(value);
                  setCurrentPage(1);
                }}
                pageLabel={content.locale === "id" ? "Halaman" : "Page"}
                pageSizeConfig={pageSizeConfig}
                pageSizeValue={pageSizeValue}
                previousPageLabel={
                  content.locale === "id"
                    ? "Halaman sebelumnya"
                    : "Previous page"
                }
                rangePrefix={
                  content.locale === "id" ? "Menampilkan" : "Showing"
                }
                totalUnit={content.locale === "id" ? "dokumen" : "documents"}
              />
            }
            rows={rows}
          />
        </NexusWorkspaceTableSection>
      </div>
    </NexusWorkspacePage>
  );
}
