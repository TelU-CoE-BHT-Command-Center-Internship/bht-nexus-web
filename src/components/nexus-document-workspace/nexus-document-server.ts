"use client";

import { useCallback, useRef, useState } from "react";
import { getAutomationStatusLabel } from "@/components/nexus-automation-status/nexus-automation-status-content";
import type { AutomationJobStatus } from "@/components/nexus-automation-status/nexus-automation-status-types";
import type { NexusDocumentRecord } from "@/components/nexus-document-workspace/nexus-document-content";
import { formatTimestamp } from "@/components/nexus-workspace-ui/nexus-workspace-format";
import type { Locale } from "@/i18n/locales";
import { apiErrorMessage } from "@/lib/api-client";
import { type DocumentSummary, listAllDocuments } from "@/lib/api-documents";
import { useLoadEffect } from "@/lib/use-load-effect";

/** Penerjemah dokumen server ke bentuk halaman Dokumen; status indeks datang dari pekerjaan rag_index di server. */

function processingStatus(document: DocumentSummary): AutomationJobStatus {
  if (document.indexStatus === "ready") return "succeeded";
  if (document.indexStatus === "running") return "running";
  if (
    document.indexStatus === "failed" ||
    document.indexStatus === "not_indexable"
  ) {
    return "failed";
  }
  return "queued";
}

function fileLabel(document: DocumentSummary) {
  const extension =
    document.originalName.split(".").pop()?.toLocaleUpperCase() ?? "";
  const size = (document.sizeBytes / (1024 * 1024)).toFixed(1);
  return `${extension} · ${size} MB`;
}

export function nexusDocumentFromServer(
  document: DocumentSummary,
  locale: Locale,
): NexusDocumentRecord {
  const status = processingStatus(document);
  return {
    capabilities: status === "succeeded" ? ["qa", "extraction"] : [],
    fileLabel: fileLabel(document),
    id: document.publicId,
    ownerUnit: document.ownerEmail ?? "-",
    processingHistory: [],
    processingJob: {
      attempts: [{ attemptedAt: document.createdAt, number: 1, status }],
      correlationId: document.publicId,
      finishedAt: status === "succeeded" ? document.createdAt : undefined,
      id: document.publicId,
      requestedAt: document.createdAt,
      requestedByActorId: "",
      status,
    },
    statusLabel: getAutomationStatusLabel(locale, status),
    title: document.title,
    updatedAt: document.createdAt,
    updatedLabel: formatTimestamp(document.createdAt),
  };
}

export type NexusDocumentLoadState = "error" | "loading" | "ready";

/** Dokumen dari server, dimuat saat halaman dibuka dan dapat dimuat ulang setelah unggah. */
export function useNexusDocumentCatalog(locale: Locale) {
  const [documents, setDocuments] = useState<NexusDocumentRecord[]>([]);
  const [state, setState] = useState<NexusDocumentLoadState>("loading");
  const [errorMessage, setErrorMessage] = useState<string>();
  const latestRequest = useRef(0);

  const load = useCallback(() => {
    const request = ++latestRequest.current;
    setState("loading");
    listAllDocuments()
      .then((items) => {
        if (request !== latestRequest.current) return;
        setDocuments(
          items.map((item) => nexusDocumentFromServer(item, locale)),
        );
        setErrorMessage(undefined);
        setState("ready");
      })
      .catch((error: unknown) => {
        if (request !== latestRequest.current) return;
        setErrorMessage(
          apiErrorMessage(
            error,
            locale === "id"
              ? "Dokumen belum dapat dimuat."
              : "Documents could not be loaded.",
            locale,
          ),
        );
        setState("error");
      });
  }, [locale]);

  useLoadEffect(load);

  return { documents, errorMessage, reload: load, state };
}
