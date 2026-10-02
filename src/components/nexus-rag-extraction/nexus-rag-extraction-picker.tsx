"use client";

import { useEffect, useMemo, useState } from "react";
import { getAutomationStatusLabel } from "@/components/nexus-automation-status/nexus-automation-status-content";
import { NexusDocumentNav } from "@/components/nexus-document-workspace/nexus-document-nav";
import { useNexusDocumentCatalog } from "@/components/nexus-document-workspace/nexus-document-server";
import styles from "@/components/nexus-rag-extraction/nexus-rag-extraction-picker.module.css";
import {
  NexusWorkspaceButton,
  NexusWorkspaceCard,
  NexusWorkspaceLinkButton,
  NexusWorkspaceNotice,
} from "@/components/nexus-workspace-ui/nexus-workspace-elements";
import { NexusWorkspacePage } from "@/components/nexus-workspace-ui/nexus-workspace-page";
import {
  type NexusSelectConfig,
  NexusWorkspaceSelect,
} from "@/components/nexus-workspace-ui/nexus-workspace-select";
import type { Locale } from "@/i18n/locales";
import { apiErrorMessage } from "@/lib/api-client";
import { getJob, type JobStatus } from "@/lib/api-jobs";
import {
  type ExtractionJob,
  type ExtractionProfile,
  listExtractionProfiles,
  startExtraction,
} from "@/lib/api-rag";

const POLL_MS = 20000;
const TERMINAL: readonly JobStatus[] = [
  "succeeded",
  "failed",
  "failed_permanently",
];

type NexusRagExtractionPickerProps = {
  description: string;
  locale: Locale;
  title: string;
};

export function NexusRagExtractionPicker({
  description,
  locale,
  title,
}: NexusRagExtractionPickerProps) {
  const isId = locale === "id";
  const libraryHref = isId ? "/nexus/dokumen" : "/en/nexus/documents";
  const reviewHref = "/nexus/tinjauan";
  const catalog = useNexusDocumentCatalog(locale);
  const [profiles, setProfiles] = useState<ExtractionProfile[]>([]);
  const [profilesError, setProfilesError] = useState("");
  const [chosenDocument, setChosenDocument] = useState("");
  const [chosenProfile, setChosenProfile] = useState("");
  const [isDocumentOpen, setIsDocumentOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const [error, setError] = useState("");
  const [job, setJob] = useState<{
    id: string;
    status: JobStatus;
  } | null>(null);

  useEffect(() => {
    let cancelled = false;
    listExtractionProfiles()
      .then((items) => {
        if (!cancelled) setProfiles(items);
      })
      .catch((cause: unknown) => {
        if (cancelled) return;
        setProfilesError(
          apiErrorMessage(
            cause,
            isId
              ? "Profil ekstraksi belum dapat dimuat."
              : "Extraction profiles could not be loaded.",
            locale,
          ),
        );
      });
    return () => {
      cancelled = true;
    };
  }, [isId, locale]);

  useEffect(() => {
    if (!job || TERMINAL.includes(job.status)) return;
    const timer = window.setInterval(() => {
      getJob(job.id)
        .then((record) =>
          setJob((current) =>
            current?.id === job.id
              ? { id: job.id, status: record.status }
              : current,
          ),
        )
        .catch(() => undefined);
    }, POLL_MS);
    return () => window.clearInterval(timer);
  }, [job]);

  const documents = useMemo(
    () =>
      catalog.documents.map((document) => ({
        id: document.id,
        label: document.title,
        meta: `${document.fileLabel} · ${document.statusLabel}`,
      })),
    [catalog.documents],
  );
  const documentId = documents.some((item) => item.id === chosenDocument)
    ? chosenDocument
    : (documents[0]?.id ?? "");
  const profileId = profiles.some((item) => item.id === chosenProfile)
    ? chosenProfile
    : (profiles[0]?.id ?? "");

  const documentConfig = useMemo<NexusSelectConfig | null>(() => {
    const [first, ...rest] = documents;
    if (!first) return null;
    return {
      defaultValue: first.id,
      id: "extraction-document",
      label: isId ? "Pilih dokumen" : "Choose a document",
      options: [
        { label: `${first.label} · ${first.meta}`, value: first.id },
        ...rest.map((document) => ({
          label: `${document.label} · ${document.meta}`,
          value: document.id,
        })),
      ],
    };
  }, [documents, isId]);
  const profileConfig = useMemo<NexusSelectConfig | null>(() => {
    const [first, ...rest] = profiles;
    if (!first) return null;
    return {
      defaultValue: first.id,
      id: "extraction-profile",
      label: isId ? "Profil ekstraksi" : "Extraction profile",
      options: [
        { label: `${first.id} · ${first.name[locale]}`, value: first.id },
        ...rest.map((profile) => ({
          label: `${profile.id} · ${profile.name[locale]}`,
          value: profile.id,
        })),
      ],
    };
  }, [isId, locale, profiles]);

  async function start() {
    if (isStarting) return;
    if (!documentId || !profileId) {
      setError(
        isId
          ? "Pilih dokumen dan profil ekstraksi lebih dulu."
          : "Choose a document and an extraction profile first.",
      );
      return;
    }
    setError("");
    setIsStarting(true);
    try {
      const created: ExtractionJob = await startExtraction({
        documentPublicId: documentId,
        profile: profileId,
      });
      setJob({
        id: created.jobPublicId,
        status: created.status === "queued" ? "queued" : "running",
      });
    } catch (cause) {
      setJob(null);
      setError(
        apiErrorMessage(
          cause,
          isId
            ? "Ekstraksi belum dapat dimulai."
            : "The extraction could not be started.",
          locale,
        ),
      );
    } finally {
      setIsStarting(false);
    }
  }

  return (
    <NexusWorkspacePage
      description={description}
      descriptionId="extraction-description"
      title={title}
      titleId="extraction-title"
    >
      <NexusDocumentNav locale={locale} />
      <div className={styles.empty}>
        <div className={styles.panel}>
          <NexusWorkspaceCard
            description={
              isId
                ? "Ekstraksi berjalan pada satu dokumen dengan satu profil KM 2026. Hasilnya masuk ke Tinjauan sebagai kandidat, tidak mengubah data resmi."
                : "Extraction runs on one document with one KM 2026 profile. The result goes to Review as a candidate and never changes official data."
            }
            title={
              isId
                ? "Pilih dokumen untuk diekstrak"
                : "Choose a document to extract"
            }
          >
            <div className={styles.picker}>
              {documentConfig ? (
                <NexusWorkspaceSelect
                  config={documentConfig}
                  isOpen={isDocumentOpen}
                  name="extraction-document"
                  onOpenChange={setIsDocumentOpen}
                  onValueChange={setChosenDocument}
                  value={documentId}
                />
              ) : (
                <NexusWorkspaceLinkButton href={libraryHref}>
                  {isId ? "Buka Pustaka dokumen" : "Open document library"}
                </NexusWorkspaceLinkButton>
              )}
              {profileConfig ? (
                <NexusWorkspaceSelect
                  config={profileConfig}
                  isOpen={isProfileOpen}
                  name="extraction-profile"
                  onOpenChange={setIsProfileOpen}
                  onValueChange={setChosenProfile}
                  value={profileId}
                />
              ) : null}
              <NexusWorkspaceButton
                disabled={isStarting}
                onClick={start}
                tone="primary"
                type="button"
              >
                {isId ? "Mulai ekstraksi" : "Start extraction"}
              </NexusWorkspaceButton>
            </div>
          </NexusWorkspaceCard>
          {profilesError ? (
            <NexusWorkspaceNotice tone="danger">
              {profilesError}
            </NexusWorkspaceNotice>
          ) : null}
          {error ? (
            <NexusWorkspaceNotice tone="danger">{error}</NexusWorkspaceNotice>
          ) : null}
          {job ? (
            <NexusWorkspaceNotice
              tone={
                job.status === "succeeded"
                  ? "success"
                  : job.status === "failed" ||
                      job.status === "failed_permanently"
                    ? "danger"
                    : undefined
              }
            >
              {isId ? "Ekstraksi" : "Extraction"}{" "}
              {getAutomationStatusLabel(locale, job.status).toLocaleLowerCase()}
              .
              {job.status === "succeeded"
                ? isId
                  ? " Kandidat sudah ada di Tinjauan."
                  : " The candidate is now in Review."
                : ""}
            </NexusWorkspaceNotice>
          ) : null}
          {job?.status === "succeeded" ? (
            <NexusWorkspaceLinkButton href={reviewHref}>
              {isId ? "Buka Tinjauan" : "Open Review"}
            </NexusWorkspaceLinkButton>
          ) : null}
        </div>
      </div>
    </NexusWorkspacePage>
  );
}
