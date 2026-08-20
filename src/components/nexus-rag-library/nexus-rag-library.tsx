"use client";

import { type ChangeEvent, useDeferredValue, useMemo, useState } from "react";
import { getAutomationStatusLabel } from "@/components/nexus-automation-status/nexus-automation-status-content";
import { NexusDocumentNav } from "@/components/nexus-document-workspace/nexus-document-nav";
import styles from "@/components/nexus-rag-library/nexus-rag-library.module.css";
import type {
  NexusRagLibraryContent,
  RagDocument,
} from "@/components/nexus-rag-library/nexus-rag-library-content";
import { NexusTablePagination } from "@/components/nexus-workspace-ui/nexus-table-pagination";
import { NexusWorkspaceSearch } from "@/components/nexus-workspace-ui/nexus-workspace-controls";
import {
  NexusWorkspaceButton,
  NexusWorkspaceLinkButton,
  NexusWorkspaceNotice,
} from "@/components/nexus-workspace-ui/nexus-workspace-elements";
import { formatTimestamp } from "@/components/nexus-workspace-ui/nexus-workspace-format";
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

const columns: readonly NexusWorkspaceRecordColumn[] = [
  { id: "primary", label: "Dokumen", primary: true },
  { id: "owner", label: "Unit pemilik" },
  { id: "status", label: "Status pemrosesan" },
  { id: "updated", label: "Diperbarui" },
  { id: "action", label: "Aksi" },
];

function DocumentIcon({ name }: { name: "document" | "queue" | "ready" }) {
  if (name === "queue")
    return (
      <svg aria-hidden="true" fill="none" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3.5 2" />
      </svg>
    );
  if (name === "ready")
    return (
      <svg aria-hidden="true" fill="none" viewBox="0 0 24 24">
        <path d="M5 12.5 9.2 17 19 7" />
        <circle cx="12" cy="12" r="9" />
      </svg>
    );
  return (
    <svg aria-hidden="true" fill="none" viewBox="0 0 24 24">
      <path d="M6 3h8l4 4v14H6zM14 3v5h4M9 12h6M9 16h6" />
    </svg>
  );
}

function statusTone(status: RagDocument["status"]) {
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
  const [documents, setDocuments] = useState(content.documents);
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
        (status === "all" || document.status === status) &&
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
    (document) => document.status === "succeeded",
  ).length;
  const queueCount = documents.filter(
    (document) =>
      document.status === "queued" ||
      document.status === "running" ||
      document.status === "retrying",
  ).length;

  function submitNewProcessing(document: RagDocument) {
    setDocuments((current) =>
      current.map((item) =>
        item.id === document.id
          ? {
              ...item,
              attempt: (item.attempt ?? 0) + 1,
              failureReason: undefined,
              status: "queued",
              statusLabel: getAutomationStatusLabel(content.locale, "queued"),
            }
          : item,
      ),
    );
    setFeedback({
      message:
        content.locale === "id"
          ? `${document.title} diajukan kembali ke antrean pemrosesan.`
          : `${document.title} was submitted to the processing queue again.`,
      tone: "success",
    });
  }

  function addDocument(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    const extension = file.name.split(".").pop()?.toLocaleLowerCase();
    if (
      (extension !== "pdf" && extension !== "docx") ||
      file.size > 25 * 1024 * 1024
    ) {
      setFeedback({ message: content.fileErrorLabel, tone: "danger" });
      return;
    }
    const now = new Date();
    const next: RagDocument = {
      capabilities: [],
      fileLabel: `${extension.toLocaleUpperCase()} · ${(file.size / (1024 * 1024)).toFixed(1)} MB`,
      id: `local-${now.getTime()}`,
      indexedAt: now.toISOString(),
      indexedLabel: formatTimestamp(now.toISOString()),
      ownerUnit:
        content.locale === "id" ? "Pengelolaan Data" : "Data Management",
      status: "queued",
      statusLabel: getAutomationStatusLabel(content.locale, "queued"),
      title: file.name.replace(/\.(pdf|docx)$/i, ""),
    };
    setDocuments((current) => [next, ...current]);
    setFeedback({
      message: `${file.name} ${content.uploadSuccessLabel}`,
      tone: "success",
    });
    setCurrentPage(1);
  }

  const rows = visibleDocuments.map((document) => {
    const tone = statusTone(document.status);
    const questionHref = `${
      content.locale === "id"
        ? "/nexus/tanya-dokumen"
        : "/en/nexus/ask-documents"
    }?document=${encodeURIComponent(document.id)}`;
    const extractionHref = `${
      content.locale === "id" ? "/nexus/ekstraksi" : "/en/nexus/extraction"
    }?document=${encodeURIComponent(document.id)}`;
    const action =
      document.status === "succeeded" && document.capabilities.length > 0 ? (
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
      ) : document.status === "failed" ||
        document.status === "failed_permanently" ? (
        <NexusWorkspaceButton
          key={`${document.id}-action`}
          onClick={() => submitNewProcessing(document)}
          type="button"
        >
          {content.locale === "id" ? "Ajukan proses baru" : "Submit new job"}
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
            {document.failureReason ? (
              <small>{document.failureReason}</small>
            ) : null}
          </span>
        ),
        updated: (
          <time dateTime={document.indexedAt}>{document.indexedLabel}</time>
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
                <dt>{content.columns.indexedAt}</dt>
                <dd>{document.indexedLabel}</dd>
              </div>
              <div>
                <dt>Format</dt>
                <dd>{document.fileLabel}</dd>
              </div>
              {document.failureReason ? (
                <div>
                  <dt>{content.locale === "id" ? "Kendala" : "Issue"}</dt>
                  <dd>{document.failureReason}</dd>
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
        <div className={styles.toolbar}>
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
        </div>
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
              <div className={styles.emptyState}>
                <strong>
                  {content.locale === "id"
                    ? "Tidak ada dokumen yang cocok"
                    : "No matching documents"}
                </strong>
                <p>
                  {content.locale === "id"
                    ? "Ubah kata kunci atau filter status untuk melihat dokumen lain."
                    : "Change the keyword or status filter to see other documents."}
                </p>
              </div>
            }
            isLoading={query !== deferredQuery}
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
