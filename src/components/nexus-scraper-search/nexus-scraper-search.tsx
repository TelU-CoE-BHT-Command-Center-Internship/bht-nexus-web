"use client";

import {
  type FormEvent,
  useDeferredValue,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { getAutomationStatusLabel } from "@/components/nexus-automation-status/nexus-automation-status-content";
import type { NexusCollectionCapabilities } from "@/components/nexus-dashboard-shell/nexus-workspace-access";
import { NexusMemberContext } from "@/components/nexus-members/nexus-member-context";
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
import { NexusWorkspaceDrawer } from "@/components/nexus-workspace-ui/nexus-workspace-drawer";
import {
  NexusWorkspaceButton,
  NexusWorkspaceCard,
  NexusWorkspaceEmptyState,
  NexusWorkspaceField,
  NexusWorkspaceLinkButton,
  NexusWorkspaceLoadError,
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
import { apiErrorMessage } from "@/lib/api-client";
import {
  createJob,
  getJob,
  type JobAttemptRecord,
  type JobRecord,
  listJobAttempts,
  listJobs,
  retryJob,
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

/** Hasil pengiriman kandidat sebuah pekerjaan ke Tinjauan pada kunjungan ini. */
type CollectionReviewSync = {
  createdCount: number;
  firstReviewCaseId?: string;
};

/** Jeda pemantauan status: rapat selama pekerjaan berjalan agar hitung mundur bergerak. */
const pollDelayMs = (status: JobRecord["status"]) =>
  status === "running" ? 5000 : 15000;
const pollRetryDelayMs = 30000;
const inProgressStatuses: ReadonlySet<string> = new Set([
  "queued",
  "retrying",
  "running",
]);

/** Kendala per sumber dari worker; pesan pekerjaan dipakai bila sumber tidak menyebutnya. */
function jobProgressFields(record: JobRecord) {
  const failed =
    record.status === "failed" || record.status === "failed_permanently";
  const sourceIssues = record.summary.sources
    .map((source) => source.message)
    .filter((message): message is string => Boolean(message));
  const running = inProgressStatuses.has(record.status);
  return {
    failureReason:
      sourceIssues.length > 0
        ? sourceIssues.join(". ")
        : failed
          ? record.progressMessage
          : undefined,
    progress: running ? record.progress : undefined,
    progressNote: running ? record.progressMessage : undefined,
  };
}

const attemptSourceLabels: Record<string, string> = {
  google_scholar: "Google Scholar",
  scholar: "Google Scholar",
  sinta: "SINTA",
};

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
    ...jobProgressFields(record),
    fullName:
      record.normalizedName ??
      parsedInput.name ??
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
  canOpenReviews,
  capabilities,
  content,
  initialRequest,
}: {
  /** Antrean Tinjauan dapat dibuka oleh akun ini. */
  canOpenReviews: boolean;
  capabilities: NexusCollectionCapabilities;
  content: NexusScraperSearchContent;
  initialRequest?: NexusCollectionRequest;
}) {
  const [jobs, setJobs] = useState<CollectionJob[]>([]);
  const [jobsTotal, setJobsTotal] = useState<number | null>(null);
  const [isLoadingJobs, setIsLoadingJobs] = useState(true);
  const [loadJobsError, setLoadJobsError] = useState<string | null>(null);
  const [jobsRequest, setJobsRequest] = useState(0);
  const [reviewSyncs, setReviewSyncs] = useState<
    Record<string, CollectionReviewSync>
  >({});
  const [busyJobIds, setBusyJobIds] = useState<ReadonlySet<string>>(
    () => new Set(),
  );
  // Pemantauan status berhenti ketika halaman ditinggalkan.
  const isMounted = useRef(true);
  const polledJobIds = useRef(new Set<string>());
  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);
  const reviewHref = canOpenReviews ? content.reviewHref : undefined;

  // biome-ignore lint/correctness/useExhaustiveDependencies: content is stable per locale; jobsRequest only changes when the user retries
  useEffect(() => {
    let cancelled = false;
    listJobs({ kind: "scraper", limit: 50 })
      .then((result) => {
        if (cancelled) return;
        const fetched = result.data.map((record) =>
          jobRecordToCollectionJob(record, content),
        );
        setJobs((current) => [
          ...current.filter((job) => job.id.startsWith("local-")),
          ...fetched,
        ]);
        setJobsTotal(result.meta.total);
        setLoadJobsError(null);
        for (const record of result.data) {
          if (inProgressStatuses.has(record.status)) {
            void pollJob(record.publicId);
          }
        }
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        setLoadJobsError(
          apiErrorMessage(
            error,
            content.locale === "id"
              ? "Riwayat pengumpulan belum dapat dimuat."
              : "The collection history could not be loaded.",
            content.locale,
          ),
        );
      })
      .finally(() => {
        if (!cancelled) setIsLoadingJobs(false);
      });
    return () => {
      cancelled = true;
    };
  }, [jobsRequest]);
  const retryLoadJobs = () => {
    setIsLoadingJobs(true);
    setJobsRequest((request) => request + 1);
  };
  const resetHistoryFilters = () => {
    setHistoryQuery("");
    setHistorySource("all");
    setHistoryStatus("all");
    setCurrentPage(1);
  };
  const requestedMemberName = initialRequest?.memberName?.trim() || undefined;
  const initialMemberName = initialRequest?.memberId
    ? requestedMemberName
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{
    message: string;
    tone: "danger" | "success";
  } | null>(null);
  const [attemptsJobId, setAttemptsJobId] = useState<string | null>(null);
  const [attempts, setAttempts] = useState<JobAttemptRecord[]>([]);
  const [isLoadingAttempts, setIsLoadingAttempts] = useState(false);
  const [attemptsError, setAttemptsError] = useState<string | null>(null);

  useEffect(() => {
    if (attemptsJobId === null) return;
    let cancelled = false;
    setIsLoadingAttempts(true);
    setAttemptsError(null);
    listJobAttempts(attemptsJobId)
      .then((result) => {
        if (!cancelled) setAttempts(result.data);
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        setAttemptsError(
          apiErrorMessage(
            error,
            content.locale === "id"
              ? "Riwayat percobaan belum dapat dimuat."
              : "The attempt history could not be loaded.",
            content.locale,
          ),
        );
      })
      .finally(() => {
        if (!cancelled) setIsLoadingAttempts(false);
      });
    return () => {
      cancelled = true;
    };
  }, [attemptsJobId, content.locale]);
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
  // Server belum menyebut jumlah kandidat per pekerjaan, jadi kartu ketiga
  // menghitung pekerjaan yang selesai, bukan kandidat.
  const metrics = [
    {
      icon: <CollectionIcon name="search" />,
      id: "jobs",
      label:
        content.locale === "id" ? "Pekerjaan Pengumpulan" : "Collection Jobs",
      tone: "completed" as const,
      unit: content.locale === "id" ? "data" : "jobs",
      value: isLoadingJobs ? null : (jobsTotal ?? jobs.length),
    },
    {
      icon: <CollectionIcon name="clock" />,
      id: "active",
      label: content.locale === "id" ? "Sedang Diproses" : "In Progress",
      tone: "waiting" as const,
      unit: content.locale === "id" ? "data" : "jobs",
      value: isLoadingJobs ? null : activeCount,
    },
    {
      icon: <CollectionIcon name="check" />,
      id: "completed",
      label: content.locale === "id" ? "Selesai Diproses" : "Completed",
      tone: "completed" as const,
      unit: content.locale === "id" ? "data" : "jobs",
      value: isLoadingJobs ? null : completedCount,
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
              ...jobProgressFields(record),
            }
          : job,
      ),
    );
  }

  function setJobBusy(publicId: string, busy: boolean) {
    setBusyJobIds((current) => {
      const next = new Set(current);
      if (busy) next.add(publicId);
      else next.delete(publicId);
      return next;
    });
  }

  async function sendToReview(publicId: string, announce: boolean) {
    setJobBusy(publicId, true);
    try {
      const result = await syncReviewCasesFromJob(publicId);
      if (!isMounted.current) return;
      setReviewSyncs((current) => ({
        ...current,
        [publicId]: {
          createdCount: result.createdCount,
          firstReviewCaseId: result.reviewCases[0]?.publicId,
        },
      }));
      if (announce) {
        setFeedback({
          message:
            content.locale === "id"
              ? result.createdCount > 0
                ? `${result.createdCount} kandidat baru masuk ke antrean Tinjauan.`
                : "Seluruh kandidat dari pekerjaan ini sudah ada di antrean Tinjauan."
              : result.createdCount > 0
                ? `${result.createdCount} new candidates were sent to review.`
                : "All candidates from this job are already in review.",
          tone: "success",
        });
      }
    } catch (error) {
      if (announce && isMounted.current) {
        setFeedback({
          message: apiErrorMessage(
            error,
            content.locale === "id"
              ? "Hasil pengumpulan belum dapat dikirim ke Tinjauan."
              : "The collection results could not be sent to review.",
            content.locale,
          ),
          tone: "danger",
        });
      }
    } finally {
      if (isMounted.current) setJobBusy(publicId, false);
    }
  }

  async function pollJob(publicId: string) {
    if (polledJobIds.current.has(publicId)) return;
    polledJobIds.current.add(publicId);
    const wait = (ms: number) =>
      new Promise((resolve) => setTimeout(resolve, ms));
    try {
      while (isMounted.current) {
        let record: JobRecord;
        try {
          record = await getJob(publicId);
        } catch {
          await wait(pollRetryDelayMs);
          continue;
        }
        if (!isMounted.current) return;
        applyJobUpdate(publicId, record);
        if (inProgressStatuses.has(record.status)) {
          await wait(pollDelayMs(record.status));
          continue;
        }
        if (record.status === "succeeded" && capabilities.canSendToReview) {
          await sendToReview(publicId, false);
        }
        return;
      }
    } finally {
      polledJobIds.current.delete(publicId);
    }
  }

  async function retry(job: CollectionJob) {
    setJobBusy(job.id, true);
    try {
      const record = await retryJob(job.id);
      if (!isMounted.current) return;
      applyJobUpdate(job.id, record);
      setFeedback({ message: content.queuedLabel, tone: "success" });
      void pollJob(job.id);
    } catch (error) {
      if (!isMounted.current) return;
      setFeedback({
        message: apiErrorMessage(
          error,
          content.locale === "id"
            ? "Pekerjaan belum dapat diajukan ulang."
            : "The job could not be submitted again.",
          content.locale,
        ),
        tone: "danger",
      });
    } finally {
      if (isMounted.current) setJobBusy(job.id, false);
    }
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSubmitting) return;
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

    setIsSubmitting(true);
    createJob({
      name: cleanName,
      scholarUrl: cleanScholarUrl,
      sintaUrl: cleanSintaUrl,
    })
      .then((created) => {
        if (!isMounted.current) return;
        const now = new Date();
        const queued: CollectionJob = {
          candidates: [],
          fullName: cleanName,
          id: created.publicId,
          memberBinding: activeMemberBinding,
          profileUrl: cleanSintaUrl,
          scholarUrl: cleanScholarUrl,
          sintaUrl: cleanSintaUrl,
          source: "sinta",
          sourceLabel: "SINTA",
          status: created.status,
          statusLabel: getAutomationStatusLabel(content.locale, created.status),
          submittedAt: now.toISOString(),
          submittedAtLabel: formatTimestamp(now.toISOString()),
        };
        setJobs((current) => [queued, ...current]);
        setJobsTotal((total) => (total === null ? total : total + 1));
        setFeedback({ message: content.queuedLabel, tone: "success" });
        setName("");
        setSintaUrl("");
        setScholarUrl("");
        setCurrentPage(1);
        void pollJob(created.publicId);
      })
      .catch((error: unknown) => {
        if (!isMounted.current) return;
        setFeedback({
          message: apiErrorMessage(
            error,
            content.locale === "id"
              ? "Pekerjaan belum dapat diajukan."
              : "The job could not be submitted.",
            content.locale,
          ),
          tone: "danger",
        });
      })
      .finally(() => {
        if (isMounted.current) setIsSubmitting(false);
      });
  }

  const rows = visibleJobs.map((job) => {
    const tone = statusTone(job.status);
    const isLocal = job.id.startsWith("local-");
    const isBusy = busyJobIds.has(job.id);
    const reviewSync = reviewSyncs[job.id];
    const inProgress = inProgressStatuses.has(job.status);
    const failed =
      job.status === "failed" || job.status === "failed_permanently";
    const resultSignal =
      job.status === "succeeded" && reviewSync
        ? {
            primary: reviewSync.createdCount,
            secondary:
              content.locale === "id"
                ? "kandidat baru di Tinjauan"
                : "new candidates in review",
            tone:
              reviewSync.createdCount > 0
                ? ("success" as const)
                : ("neutral" as const),
          }
        : job.status === "succeeded"
          ? {
              primary: content.locale === "id" ? "Selesai" : "Done",
              secondary:
                content.locale === "id"
                  ? "Kandidat diperiksa di Tinjauan"
                  : "Candidates are checked in review",
              tone: "neutral" as const,
            }
          : inProgress
            ? {
                primary:
                  job.status === "running" && job.progress !== undefined
                    ? `${job.progress}%`
                    : "—",
                secondary:
                  (job.status === "running" && job.progressNote) ||
                  (content.locale === "id"
                    ? "Menunggu hasil"
                    : "Waiting for results"),
                tone: "neutral" as const,
              }
            : {
                primary: "—",
                secondary: content.noResultsLabel,
                tone: "neutral" as const,
              };
    const action =
      job.status === "succeeded" &&
      reviewSync &&
      reviewSync.createdCount > 0 &&
      reviewSync.firstReviewCaseId &&
      reviewHref ? (
        <NexusWorkspaceLinkButton
          href={`${reviewHref}?record=${encodeURIComponent(reviewSync.firstReviewCaseId)}`}
          key={`${job.id}-action`}
        >
          {`Tinjau ${reviewSync.createdCount} kandidat`}
        </NexusWorkspaceLinkButton>
      ) : job.status === "succeeded" &&
        !reviewSync &&
        !isLocal &&
        capabilities.canSendToReview ? (
        <NexusWorkspaceButton
          disabled={isBusy}
          key={`${job.id}-action`}
          onClick={() => void sendToReview(job.id, true)}
          type="button"
        >
          {isBusy
            ? content.locale === "id"
              ? "Mengirim…"
              : "Sending…"
            : content.locale === "id"
              ? "Kirim ke Tinjauan"
              : "Send to review"}
        </NexusWorkspaceButton>
      ) : job.status === "succeeded" && reviewHref ? (
        <NexusWorkspaceLinkButton href={reviewHref} key={`${job.id}-action`}>
          {content.reviewLabel}
        </NexusWorkspaceLinkButton>
      ) : failed && !isLocal && capabilities.canCreateJob ? (
        <NexusWorkspaceButton
          disabled={isBusy}
          key={`${job.id}-action`}
          onClick={() => void retry(job)}
          type="button"
        >
          {isBusy
            ? content.locale === "id"
              ? "Mengajukan…"
              : "Submitting…"
            : content.locale === "id"
              ? "Ajukan ulang"
              : "Submit again"}
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
            onClick={isLocal ? undefined : () => setAttemptsJobId(job.id)}
            title={job.fullName}
          />
        ),
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
            primary={resultSignal.primary}
            secondary={resultSignal.secondary}
            tone={resultSignal.tone}
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
                  {resultSignal.primary} · {resultSignal.secondary}
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
      <NexusWorkspaceMetrics
        metrics={metrics}
        unavailable={loadJobsError !== null}
      />
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
          {capabilities.canCreateJob ? (
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
              <NexusWorkspaceButton
                disabled={isSubmitting}
                tone="primary"
                type="submit"
              >
                {content.submitLabel}
              </NexusWorkspaceButton>
            </form>
          ) : (
            <NexusWorkspaceNotice>
              {content.locale === "id"
                ? "Akun Anda dapat melihat riwayat pengumpulan, tetapi belum dapat mengajukan pekerjaan baru. Hubungi pengelola bila memerlukan akses."
                : "Your account can view the collection history but cannot submit new jobs. Contact an administrator if you need access."}
            </NexusWorkspaceNotice>
          )}
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
        {loadJobsError === null ? (
          <div aria-live="polite" className={styles.historyResultMeta}>
            {historyQuery !== deferredHistoryQuery
              ? content.locale === "id"
                ? "Memperbarui hasil pencarian..."
                : "Updating search results..."
              : `${filteredJobs.length} ${content.locale === "id" ? "pekerjaan ditemukan" : "jobs found"}`}
          </div>
        ) : null}

        <NexusWorkspaceTableSection
          guidance={
            content.locale === "id"
              ? "Pekerjaan otomatis tidak pernah menulis langsung ke data resmi; kandidat harus diputuskan oleh reviewer."
              : "Automated jobs never write directly to official data. Use the Indonesian workspace for candidate review."
          }
          summary={
            loadJobsError === null
              ? `${filteredJobs.length} ${content.locale === "id" ? "sesuai filter dari" : "matching of"} ${jobs.length} ${content.locale === "id" ? "pekerjaan" : "jobs"} · ${completedCount} ${content.locale === "id" ? "selesai" : "completed"}`
              : undefined
          }
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
              isHistoryFiltered ? (
                <NexusWorkspaceEmptyState
                  description={
                    content.locale === "id"
                      ? "Ubah kata kunci atau filter untuk melihat pekerjaan lainnya."
                      : "Change the keyword or filters to see other jobs."
                  }
                  onResetFilters={resetHistoryFilters}
                  title={
                    content.locale === "id"
                      ? "Tidak ada pekerjaan yang cocok"
                      : "No matching jobs"
                  }
                />
              ) : (
                <NexusWorkspaceEmptyState
                  description={
                    content.locale === "id"
                      ? "Isi formulir di atas untuk mulai mengumpulkan data dari profil SINTA dan Google Scholar seorang peneliti."
                      : "Fill in the form above to start collecting data from a researcher's SINTA and Google Scholar profiles."
                  }
                  title={
                    content.locale === "id"
                      ? "Belum ada pekerjaan pengumpulan"
                      : "No collection jobs yet"
                  }
                />
              )
            }
            error={
              loadJobsError === null ? undefined : (
                <NexusWorkspaceLoadError
                  description={loadJobsError}
                  onRetry={retryLoadJobs}
                  retryLabel={
                    content.locale === "id" ? "Coba lagi" : "Try again"
                  }
                  title={
                    content.locale === "id"
                      ? "Riwayat pengumpulan belum dapat dimuat"
                      : "The collection history could not be loaded"
                  }
                />
              )
            }
            isLoading={isLoadingJobs}
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

      {attemptsJobId !== null ? (
        <NexusWorkspaceDrawer
          closeLabel={content.locale === "id" ? "Tutup" : "Close"}
          description={
            content.locale === "id"
              ? "Riwayat percobaan pengumpulan untuk pekerjaan ini."
              : "Collection attempt history for this job."
          }
          eyebrow={content.locale === "id" ? "Percobaan" : "Attempts"}
          onClose={() => setAttemptsJobId(null)}
          title={jobs.find((job) => job.id === attemptsJobId)?.fullName ?? ""}
        >
          {attemptsError !== null ? (
            <NexusWorkspaceNotice tone="danger">
              {attemptsError}
            </NexusWorkspaceNotice>
          ) : isLoadingAttempts ? (
            <p>{content.locale === "id" ? "Memuat…" : "Loading…"}</p>
          ) : attempts.length === 0 ? (
            <p>
              {content.locale === "id"
                ? "Belum ada percobaan."
                : "No attempts yet."}
            </p>
          ) : (
            <ul className={styles.attemptList}>
              {attempts.map((attempt) => (
                <li className={styles.attemptItem} key={attempt.publicId}>
                  <div className={styles.attemptHeader}>
                    <strong>
                      {attemptSourceLabels[attempt.source] ?? attempt.source}
                    </strong>
                    <NexusWorkspaceTableBadge
                      tone={
                        attempt.status === "succeeded"
                          ? "success"
                          : attempt.status === "failed"
                            ? "danger"
                            : "waiting"
                      }
                    >
                      {attempt.status === "succeeded"
                        ? content.locale === "id"
                          ? "Berhasil"
                          : "Succeeded"
                        : attempt.status === "failed"
                          ? content.locale === "id"
                            ? "Gagal"
                            : "Failed"
                          : attempt.status}
                    </NexusWorkspaceTableBadge>
                  </div>
                  <time dateTime={attempt.createdAt}>
                    {formatTimestamp(attempt.createdAt)}
                  </time>
                  {attempt.errorMessage ? (
                    <details>
                      <summary>
                        {content.locale === "id"
                          ? "Detail teknis"
                          : "Technical details"}
                      </summary>
                      <p>{attempt.errorMessage}</p>
                    </details>
                  ) : null}
                </li>
              ))}
            </ul>
          )}
        </NexusWorkspaceDrawer>
      ) : null}
    </NexusWorkspacePage>
  );
}
