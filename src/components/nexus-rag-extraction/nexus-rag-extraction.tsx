"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { NexusDocumentNav } from "@/components/nexus-document-workspace/nexus-document-nav";
import styles from "@/components/nexus-rag-extraction/nexus-rag-extraction.module.css";
import type {
  ExtractionFieldDecision,
  NexusRagExtractionContent,
} from "@/components/nexus-rag-extraction/nexus-rag-extraction-content";
import { createExtractionReviewRecord } from "@/components/nexus-review-session/nexus-review-record-factory";
import { useOptionalNexusReviewSession } from "@/components/nexus-review-session/nexus-review-session";
import {
  NexusWorkspaceButton,
  NexusWorkspaceCard,
  NexusWorkspaceLinkButton,
  NexusWorkspaceNotice,
} from "@/components/nexus-workspace-ui/nexus-workspace-elements";
import {
  NexusWorkspaceMetrics,
  NexusWorkspacePage,
} from "@/components/nexus-workspace-ui/nexus-workspace-page";
import { NexusWorkspaceTableBadge } from "@/components/nexus-workspace-ui/nexus-workspace-records";
import { NexusWorkspaceState } from "@/components/nexus-workspace-ui/nexus-workspace-state";
import { NexusWorkspaceTableSection } from "@/components/nexus-workspace-ui/nexus-workspace-table";

function ExtractionIcon({ name }: { name: "accepted" | "fields" | "pending" }) {
  if (name === "accepted")
    return (
      <svg aria-hidden="true" fill="none" viewBox="0 0 24 24">
        <path d="M5 12.5 9.2 17 19 7" />
        <circle cx="12" cy="12" r="9" />
      </svg>
    );
  if (name === "pending")
    return (
      <svg aria-hidden="true" fill="none" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3.5 2" />
      </svg>
    );
  return (
    <svg aria-hidden="true" fill="none" viewBox="0 0 24 24">
      <path d="M5 4h14v16H5zM8 8h8M8 12h8M8 16h5" />
    </svg>
  );
}

export function NexusRagExtraction({
  content,
}: {
  content: NexusRagExtractionContent;
}) {
  const router = useRouter();
  const reviewSession = useOptionalNexusReviewSession();
  const initialDecisions = Object.fromEntries(
    content.fields.map((field) => [field.id, field.decision]),
  ) as Record<string, ExtractionFieldDecision>;
  const [decisions, setDecisions] = useState(initialDecisions);
  const decidedCount = Object.values(decisions).filter(
    (decision) => decision !== "pending",
  ).length;
  const acceptedCount = Object.values(decisions).filter(
    (decision) => decision === "accepted",
  ).length;
  const pendingCount = content.fields.length - decidedCount;
  const allDecided = pendingCount === 0;
  const readyForReview = allDecided && acceptedCount > 0;
  const readyToSend = Boolean(content.reviewHref) && readyForReview;
  const profile =
    content.profileOptions.find(
      (option) => option.id === content.selectedProfileId,
    ) ?? content.profileOptions[0];

  function decide(id: string, decision: ExtractionFieldDecision) {
    setDecisions((current) => ({ ...current, [id]: decision }));
  }

  function sendToReview() {
    if (!readyToSend || !content.reviewHref) return;
    if (!reviewSession) {
      throw new Error("Review session is unavailable");
    }
    const reviewRecord = createExtractionReviewRecord(
      content,
      decisions,
      profile?.id ?? content.selectedProfileId,
      reviewSession.actor,
      reviewSession.createSessionRecordId(
        `EXT-${(profile?.id ?? content.selectedProfileId).toUpperCase()}`,
      ),
    );
    reviewSession.submitRecord(reviewRecord);
    router.push(`${content.reviewHref}?record=${reviewRecord.id}`);
  }

  if (content.requestError) {
    return (
      <NexusWorkspacePage
        description={content.description}
        descriptionId="extraction-description"
        title={content.title}
        titleId="extraction-title"
      >
        <NexusWorkspaceState
          actions={
            <NexusWorkspaceLinkButton
              href={
                content.locale === "id"
                  ? "/nexus/dokumen"
                  : "/en/nexus/documents"
              }
            >
              {content.locale === "id"
                ? "Kembali ke Dokumen"
                : "Back to Documents"}
            </NexusWorkspaceLinkButton>
          }
          description={content.requestError}
          eyebrow={
            content.locale === "id"
              ? "Dokumen tidak siap"
              : "Document unavailable"
          }
          title={
            content.locale === "id"
              ? "Ekstraksi tidak dimulai"
              : "Extraction was not started"
          }
          tone="danger"
        />
      </NexusWorkspacePage>
    );
  }

  return (
    <NexusWorkspacePage
      description={content.description}
      descriptionId="extraction-description"
      title={content.title}
      titleId="extraction-title"
    >
      <NexusWorkspaceMetrics
        metrics={[
          {
            icon: <ExtractionIcon name="fields" />,
            id: "fields",
            label:
              content.locale === "id" ? "Kandidat Isian" : "Candidate Fields",
            tone: "completed",
            unit: content.locale === "id" ? "data" : "fields",
            value: content.fields.length,
          },
          {
            icon: <ExtractionIcon name="accepted" />,
            id: "accepted",
            label:
              content.locale === "id" ? "Bidang Disertakan" : "Included Fields",
            tone: "completed",
            unit: content.locale === "id" ? "data" : "fields",
            value: acceptedCount,
          },
          {
            icon: <ExtractionIcon name="pending" />,
            id: "pending",
            label:
              content.locale === "id"
                ? "Belum Diputuskan"
                : "Awaiting Decision",
            tone: pendingCount > 0 ? "needs-fix" : "completed",
            unit: content.locale === "id" ? "data" : "fields",
            value: pendingCount,
          },
        ]}
      />

      <div className={styles.workspace}>
        <NexusDocumentNav locale={content.locale} />
        <NexusWorkspaceCard
          description={content.documentMeta}
          title={content.documentTitle}
        >
          <div className={styles.documentControls}>
            <div className={styles.documentSignal}>
              <span>
                {content.locale === "id"
                  ? "Sumber ekstraksi"
                  : "Extraction source"}
              </span>
              <strong>{content.documentTitle}</strong>
              <small>{content.documentMeta}</small>
            </div>
            <div className={styles.profileField}>
              <span>{content.profileLabel}</span>
              <strong>
                {profile?.label ?? content.selectedProfileId} ·{" "}
                {profile?.version ?? "v1"}
              </strong>
              <small>
                {content.locale === "id"
                  ? "Profil yang tersedia untuk jenis dokumen ini"
                  : "Profile available for this document type"}
              </small>
            </div>
          </div>
        </NexusWorkspaceCard>

        <NexusWorkspaceTableSection
          guidance={
            content.locale === "id"
              ? "Keputusan berlaku per bidang. Kutipan sumber harus diperiksa sebelum kandidat dikirim ke Tinjauan."
              : "Decisions apply per field. Check each source passage before including a field."
          }
          summary={`${decidedCount} ${content.locale === "id" ? "dari" : "of"} ${content.fields.length} ${content.locale === "id" ? "bidang telah diputuskan" : "fields decided"}`}
          title={content.fieldsTitle}
          titleId="extraction-fields-title"
        >
          <ul className={styles.fieldList}>
            {content.fields.map((field) => {
              const decision = decisions[field.id];
              const tone =
                decision === "accepted"
                  ? "success"
                  : decision === "rejected"
                    ? "danger"
                    : "waiting";
              const label =
                decision === "accepted"
                  ? content.acceptedLabel
                  : decision === "rejected"
                    ? content.rejectedLabel
                    : content.pendingDecisionLabel;
              return (
                <li className={styles.field} key={field.id}>
                  <div className={styles.fieldMain}>
                    <span className={styles.fieldLabel}>{field.label}</span>
                    <strong data-empty={!field.source}>
                      {field.source ? field.value : content.notFoundLabel}
                    </strong>
                    {field.source ? (
                      <details className={styles.source}>
                        <summary>
                          {content.sourceLabel} · {content.pageLabel}{" "}
                          {field.source.page}
                        </summary>
                        <blockquote>{field.source.quote}</blockquote>
                      </details>
                    ) : null}
                  </div>
                  <div className={styles.fieldDecision}>
                    <NexusWorkspaceTableBadge tone={tone}>
                      {label}
                    </NexusWorkspaceTableBadge>
                    <div>
                      <NexusWorkspaceButton
                        aria-pressed={decision === "accepted"}
                        disabled={!field.source}
                        onClick={() => decide(field.id, "accepted")}
                        type="button"
                      >
                        {content.acceptLabel}
                      </NexusWorkspaceButton>
                      <NexusWorkspaceButton
                        aria-pressed={decision === "rejected"}
                        onClick={() => decide(field.id, "rejected")}
                        tone="danger"
                        type="button"
                      >
                        {content.rejectLabel}
                      </NexusWorkspaceButton>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
          <footer className={styles.sendArea}>
            <p>
              {readyForReview
                ? content.locale === "id"
                  ? `${acceptedCount} bidang akan dikirim sebagai satu kandidat.`
                  : `${acceptedCount} fields are ready to form one candidate.`
                : allDecided
                  ? content.locale === "id"
                    ? "Sertakan setidaknya satu bidang sebelum mengirim kandidat."
                    : "Include at least one field before this extraction can form a candidate."
                  : content.locale === "id"
                    ? `${pendingCount} bidang masih memerlukan keputusan.`
                    : `${pendingCount} fields still need a decision.`}
            </p>
            {content.reviewHref ? (
              <NexusWorkspaceButton
                disabled={!readyToSend}
                onClick={sendToReview}
                tone="primary"
                type="button"
              >
                {content.sendLabel}
              </NexusWorkspaceButton>
            ) : (
              <NexusWorkspaceNotice>
                {content.reviewUnavailableLabel}
              </NexusWorkspaceNotice>
            )}
          </footer>
        </NexusWorkspaceTableSection>
      </div>
    </NexusWorkspacePage>
  );
}
