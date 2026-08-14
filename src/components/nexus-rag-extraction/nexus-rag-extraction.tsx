"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { NexusDocumentNav } from "@/components/nexus-document-workspace/nexus-document-nav";
import styles from "@/components/nexus-rag-extraction/nexus-rag-extraction.module.css";
import type {
  ExtractionFieldDecision,
  NexusRagExtractionContent,
} from "@/components/nexus-rag-extraction/nexus-rag-extraction-content";
import {
  NexusWorkspaceButton,
  NexusWorkspaceCard,
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
  const initialDecisions = Object.fromEntries(
    content.fields.map((field) => [field.id, field.decision]),
  ) as Record<string, ExtractionFieldDecision>;
  const [profile, setProfile] = useState(content.selectedProfileId);
  const [decisions, setDecisions] = useState(initialDecisions);
  const [sent, setSent] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const decidedCount = Object.values(decisions).filter(
    (decision) => decision !== "pending",
  ).length;
  const acceptedCount = Object.values(decisions).filter(
    (decision) => decision === "accepted",
  ).length;
  const pendingCount = content.fields.length - decidedCount;
  const allDecided = pendingCount === 0;
  const profileConfig = useMemo<NexusSelectConfig>(
    () => ({
      defaultValue: content.selectedProfileId,
      id: "extraction-profile",
      label: content.profileLabel,
      options: [
        {
          label: `${content.profileOptions[0]?.label ?? "Profile"} · ${content.profileOptions[0]?.version ?? "v1"}`,
          value: content.profileOptions[0]?.id ?? content.selectedProfileId,
        },
        ...content.profileOptions.slice(1).map((option) => ({
          label: `${option.label} · ${option.version}`,
          value: option.id,
        })),
      ],
    }),
    [content.profileLabel, content.profileOptions, content.selectedProfileId],
  );

  function decide(id: string, decision: ExtractionFieldDecision) {
    setDecisions((current) => ({ ...current, [id]: decision }));
    setSent(false);
  }

  function changeProfile(nextProfile: string) {
    setProfile(nextProfile);
    setDecisions(
      Object.fromEntries(
        content.fields.map((field) => [field.id, "pending"]),
      ) as Record<string, ExtractionFieldDecision>,
    );
    setSent(false);
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
            label: content.locale === "id" ? "Diterima Reviewer" : "Accepted",
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
              <NexusWorkspaceSelect
                config={profileConfig}
                isOpen={isProfileOpen}
                name="extraction-profile"
                onOpenChange={setIsProfileOpen}
                onValueChange={changeProfile}
                value={profile}
              />
            </div>
          </div>
        </NexusWorkspaceCard>

        <NexusWorkspaceTableSection
          guidance={
            content.locale === "id"
              ? "Keputusan berlaku per bidang. Kutipan sumber harus diperiksa sebelum kandidat dikirim ke Tinjauan."
              : "Decisions apply per field. Check the source passage before sending candidates to Reviews."
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
              {allDecided
                ? content.locale === "id"
                  ? "Semua bidang sudah diputuskan dan siap dikirim."
                  : "All fields are decided and ready to send."
                : content.locale === "id"
                  ? `${pendingCount} bidang masih memerlukan keputusan.`
                  : `${pendingCount} fields still need a decision.`}
            </p>
            {sent ? (
              <NexusWorkspaceNotice tone="success">
                {content.sentLabel}{" "}
                <Link href={content.reviewHref} prefetch={false}>
                  {content.reviewLinkLabel}
                </Link>
              </NexusWorkspaceNotice>
            ) : (
              <NexusWorkspaceButton
                disabled={!allDecided}
                onClick={() => setSent(true)}
                tone="primary"
                type="button"
              >
                {content.sendLabel}
              </NexusWorkspaceButton>
            )}
          </footer>
        </NexusWorkspaceTableSection>
      </div>
    </NexusWorkspacePage>
  );
}
