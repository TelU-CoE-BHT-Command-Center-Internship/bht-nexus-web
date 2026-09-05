"use client";

import { useRouter } from "next/navigation";
import {
  type FormEvent,
  useDeferredValue,
  useEffect,
  useMemo,
  useState,
} from "react";
import { getAutomationStatusLabel } from "@/components/nexus-automation-status/nexus-automation-status-content";
import { NexusMemberContext } from "@/components/nexus-members/nexus-member-context";
import { knownMemberName } from "@/components/nexus-members/nexus-member-identity";
import { createCollectionReviewRecords } from "@/components/nexus-review-session/nexus-review-record-factory";
import { useOptionalNexusReviewSession } from "@/components/nexus-review-session/nexus-review-session";
import {
  collectionMemberBindingMatches,
  collectionProfileMatchesSource,
  createCollectionMemberBinding,
} from "@/components/nexus-scraper-search/nexus-collection-identity";
import styles from "@/components/nexus-scraper-search/nexus-scraper-search.module.css";
import type {
  CollectionJob,
  CollectionSource,
  NexusScraperSearchContent,
} from "@/components/nexus-scraper-search/nexus-scraper-search-content";
import { NexusTablePagination } from "@/components/nexus-workspace-ui/nexus-table-pagination";
import { NexusWorkspaceSearch } from "@/components/nexus-workspace-ui/nexus-workspace-controls";
import {
  NexusWorkspaceButton,
  NexusWorkspaceCard,
  NexusWorkspaceField,
  NexusWorkspaceNotice,
} from "@/components/nexus-workspace-ui/nexus-workspace-elements";
import {
  formatTimestamp,
  normalizeWorkspaceSearch,
} from "@/components/nexus-workspace-ui/nexus-workspace-format";
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
  NexusWorkspaceTableSignal,
  NexusWorkspaceTableText,
} from "@/components/nexus-workspace-ui/nexus-workspace-records";
import {
  type NexusSelectConfig,
  NexusWorkspaceSelect,
} from "@/components/nexus-workspace-ui/nexus-workspace-select";
import { NexusWorkspaceTableSection } from "@/components/nexus-workspace-ui/nexus-workspace-table";
import { ApiRequestError } from "@/lib/api-client";
import {
  createJob,
  getJob,
  type JobRecord,
  listJobs,
  syncReviewCasesFromJob,
} from "@/lib/api-jobs";

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

export type NexusCollectionRequest = {
  memberId?: string;
  memberName?: string;
  scholarUrl?: string;
  sintaUrl?: string;
};

const columns: readonly NexusWorkspaceRecordColumn[] = [
  { id: "primary", label: "Peneliti", primary: true },
  { id: "sinta", label: "SINTA" },
  { id: "scholar", label: "Scholar" },
  { id: "status", label: "Status" },
  { id: "result", label: "Hasil" },
  { id: "submitted", label: "Diajukan" },
  { id: "action", label: "Aksi" },
];

/**
 * Setiap pekerjaan hanya membawa satu profil (SINTA atau Scholar), sedangkan
 * peneliti yang sama bisa akhirnya punya keduanya begitu resolver
 * lintas-sumber (lihat catatan Name/SINTA/Scholar Cross-Resolver) menemukan
 * pasangannya. Sel ini kosong sampai profil itu diketahui, isi begitu ada,
 * mengikuti pola tautan profil yang sama dengan direktori Anggota.
 */
function ProfileLinkCell({
  source,
  url,
}: {
  source: CollectionSource;
  url?: string;
}) {
  if (!url) {
    return <NexusWorkspaceTableText>Belum ada</NexusWorkspaceTableText>;
  }
  const label = source === "sinta" ? "SINTA" : "Scholar";
  return (
    <a
      aria-label={`Buka profil ${label} pada tab baru`}
      href={url}
      rel="noreferrer"
      target="_blank"
    >
      Buka profil
    </a>
  );
}

function CollectionIcon({ name }: { name: "check" | "clock" | "search" }) {
  return (
    <svg aria-hidden="true" fill="none" viewBox="0 0 24 24">
      <NexusWorkspaceIconPaths name={name} />
    </svg>
  );
}

const submittedNameStorageKey = (publicId: string) =>
  `nexus-collection-submitted-name:${publicId}`;

function readSubmittedName(publicId: string): string | null {
  return window.localStorage.getItem(submittedNameStorageKey(publicId));
}

function rememberSubmittedName(publicId: string, name: string) {
  window.localStorage.setItem(submittedNameStorageKey(publicId), name);
}

/**
 * inputValue membawa bentuk berbeda tergantung inputKind: "combined_profile"
 * menyimpannya sebagai JSON {name, sintaUrl, scholarUrl} (lihat
 * resolveJobInput di job.service.ts), sedangkan job lama sebelum jadi
 * pekerjaan-langsung hanya menyimpan satu URL mentah per inputKind. Kedua
 * bentuk ditangani supaya riwayat lama tetap tampil, tidak hanya job baru.
 * ponytail: jumlah kandidat selalu 0 untuk rekam riwayat (bukan hasil submit
 * baru di sesi ini) karena listing job tidak mengembalikannya dan memanggil
 * ulang sync-from-job per baris hanya untuk menghitung akan jadi N+1 fetch.
 * Naikkan ke sini kalau endpoint /jobs atau /reviews/cases suatu saat
 * menyediakan jumlah kandidat per job secara langsung.
 */
function parseJobInput(record: JobRecord) {
  if (record.inputKind === "combined_profile") {
    try {
      const parsed = JSON.parse(record.inputValue) as {
        name?: string;
        scholarUrl?: string;
        sintaUrl?: string;
      };
      return {
        name: parsed.name,
        scholarUrl: parsed.scholarUrl,
        sintaUrl: parsed.sintaUrl,
      };
    } catch {
      return {};
    }
  }
  if (
    record.inputKind === "sinta_profile_url" ||
    record.inputKind === "sinta_url"
  ) {
    return { sintaUrl: record.inputValue };
  }
  if (
    record.inputKind === "scholar_profile_url" ||
    record.inputKind === "scholar_url"
  ) {
    return { scholarUrl: record.inputValue };
  }
  return {};
}

function jobRecordToCollectionJob(
  record: JobRecord,
  content: NexusScraperSearchContent,
): CollectionJob {
  const parsedInput = parseJobInput(record);
  const sintaUrl = parsedInput.sintaUrl;
  const scholarUrl = parsedInput.scholarUrl;
  const source: CollectionSource = sintaUrl ? "sinta" : "scholar";
  const sourceLabel =
    content.sourceOptions.find((option) => option.id === source)?.label ??
    source;

  return {
    candidates: [],
    failureReason:
      record.status === "failed" || record.status === "failed_permanently"
        ? record.progressMessage
        : undefined,
    fullName:
      record.normalizedName ??
      parsedInput.name ??
      readSubmittedName(record.publicId) ??
      (content.locale === "id" ? "Belum diketahui" : "Unknown"),
    id: record.publicId,
    profileUrl: sintaUrl ?? scholarUrl ?? "",
    scholarUrl,
    sintaUrl,
    source,
    sourceLabel,
    status: record.status,
    statusLabel: getAutomationStatusLabel(content.locale, record.status),
    submittedAt: record.createdAt,
    submittedAtLabel: formatTimestamp(record.createdAt),
    submittedBy:
      content.locale === "id" ? "Pengguna ruang kerja" : "Workspace user",
  };
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
  initialRequest,
}: {
  content: NexusScraperSearchContent;
  initialRequest?: NexusCollectionRequest;
}) {
  const router = useRouter();
  const reviewSession = useOptionalNexusReviewSession();
  const [jobs, setJobs] = useState<CollectionJob[]>([]);
  const [isLoadingJobs, setIsLoadingJobs] = useState(true);
  const [loadJobsError, setLoadJobsError] = useState<string | null>(null);

  // biome-ignore lint/correctness/useExhaustiveDependencies: content is stable per locale, refetching on it would just repeat the same request
  useEffect(() => {
    let cancelled = false;
    listJobs({ limit: 50 })
      .then((result) => {
        if (cancelled) return;
        const fetched = result.data.map((record) =>
          jobRecordToCollectionJob(record, content),
        );
        setJobs((current) => [
          ...current.filter((job) => job.id.startsWith("local-")),
          ...fetched,
        ]);
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        setLoadJobsError(
          error instanceof ApiRequestError ? error.message : content.errorLabel,
        );
      })
      .finally(() => {
        if (!cancelled) setIsLoadingJobs(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);
  const requestedMemberName = initialRequest?.memberName?.trim() || undefined;
  const initialMemberName = initialRequest?.memberId
    ? (knownMemberName(initialRequest.memberId) ?? requestedMemberName)
    : undefined;
  const [name, setName] = useState(initialMemberName ?? "");
  const [sintaUrl, setSintaUrl] = useState(initialRequest?.sintaUrl ?? "");
  const [scholarUrl, setScholarUrl] = useState(
    initialRequest?.scholarUrl ?? "",
  );
  const initialMemberBinding = createCollectionMemberBinding({
    memberId: initialRequest?.memberId,
    memberName: initialMemberName,
    profileUrl: initialRequest?.sintaUrl,
    source: "sinta",
  });
  const activeMemberBinding = collectionMemberBindingMatches(
    initialMemberBinding,
    { memberName: name, profileUrl: sintaUrl, source: "sinta" },
  )
    ? initialMemberBinding
    : undefined;
  const [feedback, setFeedback] = useState<{
    message: string;
    tone: "danger" | "success";
  } | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSizeValue, setPageSizeValue] = useState("10");
  const [historyQuery, setHistoryQuery] = useState("");
  const deferredHistoryQuery = useDeferredValue(historyQuery);
  const [historySource, setHistorySource] = useState("all");
  const [isHistorySourceOpen, setIsHistorySourceOpen] = useState(false);
  const [historyStatus, setHistoryStatus] = useState("all");
  const [isHistoryStatusOpen, setIsHistoryStatusOpen] = useState(false);
  const historySourceConfig = useMemo<NexusSelectConfig>(
    () => ({
      defaultValue: "all",
      id: "collection-history-source",
      label: content.columns.source,
      options: [
        {
          label: content.locale === "id" ? "Semua sumber" : "All sources",
          value: "all",
        },
        ...content.sourceOptions.map((option) => ({
          label: option.label,
          value: option.id,
        })),
      ],
    }),
    [content.columns.source, content.locale, content.sourceOptions],
  );
  const historyStatusConfig = useMemo<NexusSelectConfig>(
    () => ({
      defaultValue: "all",
      id: "collection-history-status",
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
    }),
    [content.columns.status, content.locale],
  );
  const filteredJobs = useMemo(() => {
    const needle = normalizeWorkspaceSearch(deferredHistoryQuery);
    return jobs.filter(
      (job) =>
        (historySource === "all" || job.source === historySource) &&
        (historyStatus === "all" || job.status === historyStatus) &&
        (needle.length === 0 ||
          normalizeWorkspaceSearch(
            `${job.fullName} ${job.sintaUrl ?? ""} ${job.scholarUrl ?? ""} ${job.statusLabel}`,
          ).includes(needle)),
    );
  }, [deferredHistoryQuery, historySource, historyStatus, jobs]);
  const isHistoryFiltered =
    historySource !== "all" ||
    historyStatus !== "all" ||
    historyQuery.trim().length > 0;
  const pageSize = Number(pageSizeValue);
  const totalPages = Math.max(1, Math.ceil(filteredJobs.length / pageSize));
  const safePage = Math.min(Math.max(currentPage, 1), totalPages);
  const visibleJobs = filteredJobs.slice(
    (safePage - 1) * pageSize,
    safePage * pageSize,
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

  function applyJobUpdate(id: string, record: JobRecord, extra?: string) {
    setJobs((current) =>
      current.map((job) =>
        job.id === id
          ? {
              ...job,
              status: record.status,
              statusLabel:
                extra !== undefined
                  ? `${getAutomationStatusLabel(content.locale, record.status)} · ${extra}`
                  : getAutomationStatusLabel(content.locale, record.status),
              failureReason:
                record.status === "failed" ||
                record.status === "failed_permanently"
                  ? record.progressMessage
                  : undefined,
            }
          : job,
      ),
    );
  }

  async function pollJob(publicId: string) {
    const terminal = new Set(["succeeded", "failed", "failed_permanently"]);
    for (;;) {
      let record: JobRecord;
      try {
        record = await getJob(publicId);
      } catch {
        return;
      }
      if (!terminal.has(record.status)) {
        applyJobUpdate(publicId, record);
        await new Promise((resolve) => setTimeout(resolve, 4000));
        continue;
      }
      if (record.status === "succeeded") {
        try {
          const { createdCount } = await syncReviewCasesFromJob(publicId);
          applyJobUpdate(
            publicId,
            record,
            createdCount > 0
              ? `${createdCount} ${content.candidatesLabel}`
              : content.noResultsLabel,
          );
        } catch {
          applyJobUpdate(publicId, record);
        }
      } else {
        applyJobUpdate(publicId, record);
      }
      return;
    }
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const cleanName = name.trim();
    const cleanSintaUrl = sintaUrl.trim();
    const cleanScholarUrl = scholarUrl.trim();
    if (
      !cleanName ||
      !collectionProfileMatchesSource(cleanSintaUrl, "sinta") ||
      !collectionProfileMatchesSource(cleanScholarUrl, "scholar")
    ) {
      setFeedback({ message: content.errorLabel, tone: "danger" });
      return;
    }

    const now = new Date();
    const id = `local-${now.getTime()}`;
    const queued: CollectionJob = {
      candidates: [],
      fullName: cleanName,
      id,
      memberBinding: activeMemberBinding,
      profileUrl: cleanSintaUrl,
      scholarUrl: cleanScholarUrl,
      sintaUrl: cleanSintaUrl,
      source: "sinta",
      sourceLabel: "SINTA",
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
    setSintaUrl("");
    setScholarUrl("");
    setCurrentPage(1);

    createJob({
      name: cleanName,
      scholarUrl: cleanScholarUrl,
      sintaUrl: cleanSintaUrl,
    })
      .then((created) => {
        rememberSubmittedName(created.publicId, cleanName);
        setJobs((current) =>
          current.map((job) =>
            job.id === id
              ? { ...job, id: created.publicId, status: created.status }
              : job,
          ),
        );
        void pollJob(created.publicId);
      })
      .catch((error: unknown) => {
        const message =
          error instanceof ApiRequestError ? error.message : content.errorLabel;
        setJobs((current) =>
          current.map((job) =>
            job.id === id
              ? {
                  ...job,
                  status: "failed_permanently",
                  statusLabel: getAutomationStatusLabel(
                    content.locale,
                    "failed_permanently",
                  ),
                  failureReason: message,
                }
              : job,
          ),
        );
      });
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
        primary: <NexusWorkspaceTablePrimary title={job.fullName} />,
        sinta: <ProfileLinkCell source="sinta" url={job.sintaUrl} />,
        scholar: <ProfileLinkCell source="scholar" url={job.scholarUrl} />,
        status: (
          <span className={styles.statusDetail}>
            <NexusWorkspaceTableBadge tone={tone}>
              {job.statusLabel}
            </NexusWorkspaceTableBadge>
            {job.failureReason ? (
              <NexusWorkspaceInfoHint
                label={content.locale === "id" ? "Kendala" : "Issue"}
                text={job.failureReason}
              />
            ) : null}
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
            <NexusWorkspaceTableBadge tone={tone}>
              {job.statusLabel}
            </NexusWorkspaceTableBadge>
          }
          meta={
            <dl>
              <div>
                <dt>SINTA</dt>
                <dd>
                  <ProfileLinkCell source="sinta" url={job.sintaUrl} />
                </dd>
              </div>
              <div>
                <dt>Scholar</dt>
                <dd>
                  <ProfileLinkCell source="scholar" url={job.scholarUrl} />
                </dd>
              </div>
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
      {loadJobsError !== null ? (
        <NexusWorkspaceNotice tone="danger">
          {loadJobsError}
        </NexusWorkspaceNotice>
      ) : null}
      <NexusWorkspaceMetrics metrics={metrics} />
      <div className={styles.workspace}>
        <NexusWorkspaceCard
          description={
            content.locale === "id"
              ? "Nama lengkap, URL SINTA, dan URL Google Scholar wajib diisi. Hasil selalu masuk ke antrean Tinjauan."
              : "Full name, SINTA URL, and Google Scholar URL are all required. Candidate review is currently completed in the Indonesian workspace."
          }
          title={
            content.locale === "id"
              ? "Ajukan profil publik"
              : "Submit public profile"
          }
        >
          {activeMemberBinding ? (
            <div className={styles.feedback}>
              <NexusMemberContext
                description="Hasil pengumpulan akan ditautkan ke profil anggota ini."
                label="Anggota terpilih"
                memberName={activeMemberBinding.memberName}
                sourceLabel="SINTA"
              />
            </div>
          ) : null}
          <form className={styles.form} onSubmit={submit}>
            <NexusWorkspaceField
              autoComplete="off"
              id="collection-name"
              label={content.nameLabel}
              onChange={(event) => setName(event.target.value)}
              placeholder={content.namePlaceholder}
              required
              value={name}
            />
            <NexusWorkspaceField
              autoComplete="url"
              id="collection-sinta-url"
              inputMode="url"
              label={content.sintaUrlLabel}
              onChange={(event) => setSintaUrl(event.target.value)}
              placeholder={content.sintaUrlPlaceholder}
              required
              spellCheck={false}
              type="url"
              value={sintaUrl}
            />
            <NexusWorkspaceField
              autoComplete="url"
              id="collection-scholar-url"
              inputMode="url"
              label={content.scholarUrlLabel}
              onChange={(event) => setScholarUrl(event.target.value)}
              placeholder={content.scholarUrlPlaceholder}
              required
              spellCheck={false}
              type="url"
              value={scholarUrl}
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

        <div className={styles.historyToolbar}>
          <NexusWorkspaceSearch
            label={
              content.locale === "id"
                ? "Cari pekerjaan pengumpulan"
                : "Search collection jobs"
            }
            name="collection-history-search"
            onValueChange={(value) => {
              setHistoryQuery(value);
              setCurrentPage(1);
            }}
            placeholder={
              content.locale === "id"
                ? "Cari peneliti, URL profil, atau status..."
                : "Search researcher, profile URL, or status..."
            }
            value={historyQuery}
          />
          <NexusWorkspaceSelect
            config={historySourceConfig}
            isOpen={isHistorySourceOpen}
            name="collection-history-source"
            onOpenChange={setIsHistorySourceOpen}
            onValueChange={(value) => {
              setHistorySource(value);
              setCurrentPage(1);
            }}
            value={historySource}
          />
          <NexusWorkspaceSelect
            config={historyStatusConfig}
            isOpen={isHistoryStatusOpen}
            name="collection-history-status"
            onOpenChange={setIsHistoryStatusOpen}
            onValueChange={(value) => {
              setHistoryStatus(value);
              setCurrentPage(1);
            }}
            value={historyStatus}
          />
        </div>
        <div aria-live="polite" className={styles.historyResultMeta}>
          {historyQuery !== deferredHistoryQuery
            ? content.locale === "id"
              ? "Memperbarui hasil pencarian..."
              : "Updating search results..."
            : `${filteredJobs.length} ${content.locale === "id" ? "pekerjaan ditemukan" : "jobs found"}`}
        </div>

        <NexusWorkspaceTableSection
          guidance={
            content.locale === "id"
              ? "Pekerjaan otomatis tidak pernah menulis langsung ke data resmi; kandidat harus diputuskan oleh reviewer."
              : "Automated jobs never write directly to official data. Use the Indonesian workspace for candidate review."
          }
          summary={`${filteredJobs.length} ${content.locale === "id" ? "sesuai filter dari" : "matching of"} ${jobs.length} ${content.locale === "id" ? "pekerjaan" : "jobs"} · ${completedCount} ${content.locale === "id" ? "selesai" : "completed"}`}
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
            isLoading={isLoadingJobs}
            empty={
              <p className={styles.noAction}>
                {isHistoryFiltered
                  ? content.locale === "id"
                    ? "Tidak ada pekerjaan yang cocok dengan pencarian atau filter."
                    : "No jobs match the current search or filters."
                  : content.locale === "id"
                    ? "Belum ada pekerjaan pengumpulan."
                    : "No collection jobs yet."}
              </p>
            }
            pagination={
              <NexusTablePagination
                currentPage={safePage}
                itemCount={filteredJobs.length}
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
