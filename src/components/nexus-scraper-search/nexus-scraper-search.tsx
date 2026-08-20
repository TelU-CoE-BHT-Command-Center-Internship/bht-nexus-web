"use client";

import { useRouter } from "next/navigation";
import { type FormEvent, useMemo, useState } from "react";
import { createCollectionReviewRecords } from "@/components/nexus-review-session/nexus-review-record-factory";
import { useOptionalNexusReviewSession } from "@/components/nexus-review-session/nexus-review-session";
import styles from "@/components/nexus-scraper-search/nexus-scraper-search.module.css";
import type {
  CollectionJob,
  CollectionSource,
  NexusScraperSearchContent,
} from "@/components/nexus-scraper-search/nexus-scraper-search-content";
import { NexusTablePagination } from "@/components/nexus-workspace-ui/nexus-table-pagination";
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
import {
  NexusWorkspaceMobileCard,
  type NexusWorkspaceRecordColumn,
  NexusWorkspaceRecordTable,
  NexusWorkspaceTableBadge,
  NexusWorkspaceTablePrimary,
  NexusWorkspaceTableSignal,
} from "@/components/nexus-workspace-ui/nexus-workspace-records";
import {
  type NexusSelectConfig,
  NexusWorkspaceSelect,
} from "@/components/nexus-workspace-ui/nexus-workspace-select";
import { NexusWorkspaceTableSection } from "@/components/nexus-workspace-ui/nexus-workspace-table";

const pageSizeConfig: NexusSelectConfig = {
  defaultValue: "10",
  id: "collection-page-size",
  label: "Jumlah pekerjaan per halaman",
  options: [
    { label: "10 / halaman", value: "10" },
    { label: "20 / halaman", value: "20" },
    { label: "50 / halaman", value: "50" },
  ],
};

const columns: readonly NexusWorkspaceRecordColumn[] = [
  { id: "primary", label: "Peneliti", primary: true },
  { id: "source", label: "Sumber" },
  { id: "status", label: "Status" },
  { id: "result", label: "Hasil" },
  { id: "submitted", label: "Diajukan" },
  { id: "action", label: "Aksi" },
];

function CollectionIcon({ name }: { name: "check" | "clock" | "search" }) {
  if (name === "check") {
    return (
      <svg aria-hidden="true" fill="none" viewBox="0 0 24 24">
        <path d="M5 12.5 9.2 17 19 7" />
        <circle cx="12" cy="12" r="9" />
      </svg>
    );
  }
  if (name === "clock") {
    return (
      <svg aria-hidden="true" fill="none" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3.5 2" />
      </svg>
    );
  }
  return (
    <svg aria-hidden="true" fill="none" viewBox="0 0 24 24">
      <circle cx="10.5" cy="10.5" r="6.5" />
      <path d="m15.5 15.5 4 4" />
    </svg>
  );
}

function matchesSource(urlValue: string, source: CollectionSource) {
  try {
    const url = new URL(urlValue);
    if (url.protocol !== "https:") return false;
    return source === "sinta"
      ? url.hostname === "sinta.kemdiktisaintek.go.id"
      : url.hostname === "scholar.google.com";
  } catch {
    return false;
  }
}

function statusTone(status: CollectionJob["status"]) {
  if (status === "succeeded") return "success" as const;
  if (status === "failed" || status === "failed_permanently")
    return "danger" as const;
  if (status === "running") return "info" as const;
  return "waiting" as const;
}

export function NexusScraperSearch({
  content,
}: {
  content: NexusScraperSearchContent;
}) {
  const router = useRouter();
  const reviewSession = useOptionalNexusReviewSession();
  const [jobs, setJobs] = useState(content.jobs);
  const [name, setName] = useState("");
  const [profileUrl, setProfileUrl] = useState("");
  const [source, setSource] = useState<CollectionSource>("sinta");
  const [isSourceOpen, setIsSourceOpen] = useState(false);
  const [feedback, setFeedback] = useState<{
    message: string;
    tone: "danger" | "success";
  } | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSizeValue, setPageSizeValue] = useState("10");
  const sourceConfig = useMemo<NexusSelectConfig>(
    () => ({
      defaultValue: "sinta",
      id: "collection-source",
      label: content.sourceLabel,
      options: [
        {
          label: content.sourceOptions[0]?.label ?? "SINTA",
          value: content.sourceOptions[0]?.id ?? "sinta",
        },
        ...content.sourceOptions
          .slice(1)
          .map((option) => ({ label: option.label, value: option.id })),
      ],
    }),
    [content.sourceLabel, content.sourceOptions],
  );
  const pageSize = Number(pageSizeValue);
  const visibleJobs = jobs.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );
  const completedCount = jobs.filter(
    (job) => job.status === "succeeded",
  ).length;
  const activeCount = jobs.filter((job) =>
    ["queued", "running", "retrying"].includes(job.status),
  ).length;
  const candidateCount = jobs.reduce(
    (total, job) => total + job.candidates.length,
    0,
  );
  const metrics = [
    {
      icon: <CollectionIcon name="search" />,
      id: "jobs",
      label:
        content.locale === "id" ? "Pekerjaan Pengumpulan" : "Collection Jobs",
      tone: "completed" as const,
      unit: content.locale === "id" ? "data" : "jobs",
      value: jobs.length,
    },
    {
      icon: <CollectionIcon name="clock" />,
      id: "active",
      label: content.locale === "id" ? "Sedang Diproses" : "In Progress",
      tone: "waiting" as const,
      unit: content.locale === "id" ? "data" : "jobs",
      value: activeCount,
    },
    {
      icon: <CollectionIcon name="check" />,
      id: "candidates",
      label:
        content.locale === "id" ? "Kandidat Ditemukan" : "Candidates Found",
      tone: "completed" as const,
      unit: content.locale === "id" ? "data" : "records",
      value: candidateCount,
    },
  ];

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const cleanName = name.trim();
    const cleanUrl = profileUrl.trim();
    if (!cleanName || !matchesSource(cleanUrl, source)) {
      setFeedback({ message: content.errorLabel, tone: "danger" });
      return;
    }

    const now = new Date();
    const id = `local-${now.getTime()}`;
    const sourceLabel =
      content.sourceOptions.find((option) => option.id === source)?.label ??
      source;
    const queued: CollectionJob = {
      candidates: [],
      fullName: cleanName,
      id,
      profileUrl: cleanUrl,
      source,
      sourceLabel,
      status: "queued",
      statusLabel: content.waitingForServiceLabel,
      submittedAt: now.toISOString(),
      submittedAtLabel: formatTimestamp(now.toISOString()),
      submittedBy: reviewSession
        ? `${reviewSession.actor.name} · ${reviewSession.actor.roleLabel}`
        : "Pengguna ruang kerja",
      submittedByActorId: reviewSession?.actor.id,
    };

    setJobs((current) => [queued, ...current]);
    setFeedback({ message: content.queuedLabel, tone: "success" });
    setName("");
    setProfileUrl("");
    setCurrentPage(1);
  }

  function submitNewCollection(job: CollectionJob) {
    const now = new Date();
    const queued: CollectionJob = {
      ...job,
      attempt: (job.attempt ?? 0) + 1,
      candidates: [],
      failureReason: undefined,
      id: `local-${now.getTime()}`,
      status: "queued",
      statusLabel: content.waitingForServiceLabel,
      submittedAt: now.toISOString(),
      submittedAtLabel: formatTimestamp(now.toISOString()),
      submittedBy: reviewSession
        ? `${reviewSession.actor.name} · ${reviewSession.actor.roleLabel}`
        : "Pengguna ruang kerja",
      submittedByActorId: reviewSession?.actor.id,
    };
    setJobs((current) => [queued, ...current]);
    setFeedback({ message: content.queuedLabel, tone: "success" });
    setCurrentPage(1);
  }

  const rows = visibleJobs.map((job) => {
    const tone = statusTone(job.status);
    const hasCandidates = job.candidates.length > 0;
    const action =
      job.status === "succeeded" && hasCandidates && content.reviewHref ? (
        <NexusWorkspaceButton
          key={`${job.id}-action`}
          onClick={() => {
            if (!reviewSession) {
              throw new Error("Review session is unavailable");
            }
            const reviewRecords = createCollectionReviewRecords(job);
            const firstRecord = reviewRecords[0];
            if (!firstRecord) return;
            reviewSession.submitRecords(reviewRecords);
            router.push(
              `${content.reviewHref}?record=${encodeURIComponent(firstRecord.id)}`,
            );
          }}
          type="button"
        >
          {`Tinjau ${job.candidates.length} kandidat`}
        </NexusWorkspaceButton>
      ) : job.status === "succeeded" && hasCandidates ? (
        <span className={styles.noAction} key={`${job.id}-action`}>
          {content.reviewLabel}
        </span>
      ) : job.status === "succeeded" ? (
        <span className={styles.noAction} key={`${job.id}-action`}>
          {content.noResultsLabel}
        </span>
      ) : job.status === "failed" || job.status === "failed_permanently" ? (
        <NexusWorkspaceButton
          key={`${job.id}-action`}
          onClick={() => submitNewCollection(job)}
          type="button"
        >
          {content.locale === "id" ? "Ajukan ulang" : "Submit again"}
        </NexusWorkspaceButton>
      ) : (
        <span className={styles.noAction} key={`${job.id}-action`}>
          —
        </span>
      );
    return {
      id: job.id,
      cells: {
        primary: (
          <NexusWorkspaceTablePrimary
            title={job.fullName}
            subtitle={job.profileUrl}
          />
        ),
        source: (
          <NexusWorkspaceTableBadge
            tone={job.source === "sinta" ? "success" : "info"}
          >
            {job.sourceLabel}
          </NexusWorkspaceTableBadge>
        ),
        status: (
          <span className={styles.statusDetail}>
            <NexusWorkspaceTableBadge tone={tone}>
              {job.statusLabel}
            </NexusWorkspaceTableBadge>
            {job.failureReason ? <small>{job.failureReason}</small> : null}
          </span>
        ),
        result: (
          <NexusWorkspaceTableSignal
            primary={job.candidates.length}
            secondary={content.candidatesLabel}
            tone={job.candidates.length > 0 ? "success" : "neutral"}
          />
        ),
        submitted: (
          <time dateTime={job.submittedAt}>{job.submittedAtLabel}</time>
        ),
        action,
      },
      mobile: (
        <NexusWorkspaceMobileCard
          action={action}
          eyebrow={
            <>
              <NexusWorkspaceTableBadge
                tone={job.source === "sinta" ? "success" : "info"}
              >
                {job.sourceLabel}
              </NexusWorkspaceTableBadge>
              <NexusWorkspaceTableBadge tone={tone}>
                {job.statusLabel}
              </NexusWorkspaceTableBadge>
            </>
          }
          meta={
            <dl>
              <div>
                <dt>{content.columns.candidates}</dt>
                <dd>
                  {job.candidates.length} {content.candidatesLabel}
                </dd>
              </div>
              <div>
                <dt>{content.columns.submittedAt}</dt>
                <dd>{job.submittedAtLabel}</dd>
              </div>
              {job.failureReason ? (
                <div>
                  <dt>{content.locale === "id" ? "Kendala" : "Issue"}</dt>
                  <dd>{job.failureReason}</dd>
                </div>
              ) : null}
            </dl>
          }
          title={job.fullName}
        />
      ),
    };
  });

  return (
    <NexusWorkspacePage
      description={content.description}
      descriptionId="collection-description"
      title={content.title}
      titleId="collection-title"
    >
      <NexusWorkspaceMetrics metrics={metrics} />
      <div className={styles.workspace}>
        <NexusWorkspaceCard
          description={
            content.locale === "id"
              ? "Sumber hanya menerima profil publik HTTPS. Hasil selalu masuk ke antrean Tinjauan."
              : "Only public HTTPS profiles are accepted. Candidate review is currently completed in the Indonesian workspace."
          }
          title={
            content.locale === "id"
              ? "Ajukan profil publik"
              : "Submit public profile"
          }
        >
          <form className={styles.form} onSubmit={submit}>
            <NexusWorkspaceField
              autoComplete="off"
              id="collection-name"
              label={content.nameLabel}
              onChange={(event) => setName(event.target.value)}
              placeholder={content.namePlaceholder}
              value={name}
            />
            <div className={styles.selectField}>
              <span>{content.sourceLabel}</span>
              <NexusWorkspaceSelect
                config={sourceConfig}
                isOpen={isSourceOpen}
                name="collection-source"
                onOpenChange={setIsSourceOpen}
                onValueChange={(value) => {
                  setSource(value as CollectionSource);
                  setProfileUrl("");
                }}
                value={source}
              />
            </div>
            <NexusWorkspaceField
              autoComplete="url"
              id="collection-url"
              inputMode="url"
              label={content.profileUrlLabel}
              onChange={(event) => setProfileUrl(event.target.value)}
              placeholder={content.profileUrlPlaceholder}
              spellCheck={false}
              type="url"
              value={profileUrl}
            />
            <NexusWorkspaceButton tone="primary" type="submit">
              {content.submitLabel}
            </NexusWorkspaceButton>
          </form>
          {feedback ? (
            <div className={styles.feedback}>
              <NexusWorkspaceNotice tone={feedback.tone}>
                {feedback.message}
              </NexusWorkspaceNotice>
            </div>
          ) : null}
        </NexusWorkspaceCard>

        <NexusWorkspaceTableSection
          guidance={
            content.locale === "id"
              ? "Pekerjaan otomatis tidak pernah menulis langsung ke data resmi; kandidat harus diputuskan oleh reviewer."
              : "Automated jobs never write directly to official data. Use the Indonesian workspace for candidate review."
          }
          summary={`${completedCount} ${content.locale === "id" ? "selesai dari" : "completed of"} ${jobs.length} ${content.locale === "id" ? "pekerjaan" : "jobs"}`}
          title={
            content.locale === "id"
              ? "Riwayat pengumpulan"
              : "Collection history"
          }
          titleId="collection-history-title"
        >
          <NexusWorkspaceRecordTable
            caption={content.tableCaption}
            columns={columns}
            empty={
              <p className={styles.noAction}>
                {content.locale === "id"
                  ? "Belum ada pekerjaan pengumpulan."
                  : "No collection jobs yet."}
              </p>
            }
            pagination={
              <NexusTablePagination
                currentPage={currentPage}
                itemCount={jobs.length}
                navigationLabel={
                  content.locale === "id"
                    ? "Navigasi halaman pekerjaan"
                    : "Job page navigation"
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
                totalUnit={content.locale === "id" ? "pekerjaan" : "jobs"}
              />
            }
            rows={rows}
          />
        </NexusWorkspaceTableSection>
      </div>
    </NexusWorkspacePage>
  );
}
