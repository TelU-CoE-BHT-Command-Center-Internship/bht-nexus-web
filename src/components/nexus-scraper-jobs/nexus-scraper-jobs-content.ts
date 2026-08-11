import { getAutomationStatusLabel } from "@/components/nexus-automation-status/nexus-automation-status-content";
import type { AutomationJobStatus } from "@/components/nexus-automation-status/nexus-automation-status-types";
import { formatTimestamp } from "@/components/nexus-workspace-page/nexus-workspace-format";
import type { Locale } from "@/i18n/locales";

export type ScraperJobAttempt = {
  finishedAt: string;
  finishedAtLabel: string;
  id: string;
  outcome: "failed" | "succeeded";
  outcomeLabel: string;
  requestUrl: string;
  sourceLabel: string;
};

export type ScraperJobSummary = {
  candidateCount: string;
  createdAt: string;
  createdAtLabel: string;
  fullName: string;
  progressLabel: string;
  status: AutomationJobStatus;
  statusLabel: string;
  updatedAt: string;
  updatedAtLabel: string;
};

export type NexusScraperJobsContent = {
  attemptColumns: {
    outcome: string;
    request: string;
    source: string;
    time: string;
  };
  attempts: ScraperJobAttempt[];
  attemptsSubtitle: string;
  attemptsTitle: string;
  description: string;
  job: ScraperJobSummary;
  jobTitle: string;
  lookupButtonLabel: string;
  lookupLabel: string;
  lookupPlaceholder: string;
  summaryLabels: {
    candidates: string;
    created: string;
    name: string;
    progress: string;
    updated: string;
  };
  title: string;
};

const jobStatus: AutomationJobStatus = "succeeded";

const jobsCopy = {
  id: {
    attemptColumns: {
      outcome: "Hasil",
      request: "Permintaan",
      source: "Sumber",
      time: "Selesai",
    },
    attempts: [
      {
        finishedAt: "2026-08-11T08:53",
        id: "attempt-sinta-profile",
        outcome: "succeeded",
        outcomeLabel: "Berhasil",
        requestUrl:
          "https://sinta.kemdiktisaintek.go.id/authors/profile/6712043",
        sourceLabel: "SINTA",
      },
      {
        finishedAt: "2026-08-11T08:54",
        id: "attempt-sinta-works-1",
        outcome: "succeeded",
        outcomeLabel: "Berhasil",
        requestUrl: "…/authors/profile/6712043/?view=scopus&page=1",
        sourceLabel: "SINTA",
      },
      {
        finishedAt: "2026-08-11T08:55",
        id: "attempt-sinta-works-2",
        outcome: "succeeded",
        outcomeLabel: "Berhasil",
        requestUrl: "…/authors/profile/6712043/?view=scopus&page=2",
        sourceLabel: "SINTA",
      },
      {
        finishedAt: "2026-08-11T08:56",
        id: "attempt-scholar",
        outcome: "failed",
        outcomeLabel: "Gagal",
        requestUrl: "https://scholar.google.com/citations?user=8kQ2vRUAAAAJ",
        sourceLabel: "Google Scholar",
      },
    ],
    attemptsSubtitle: "Empat percobaan pada dua sumber",
    attemptsTitle: "Log Percobaan",
    description: "Status pengumpulan data satu peneliti dan log percobaannya.",
    job: {
      candidateCount: "33",
      createdAt: "2026-08-11T08:52",
      fullName: "Suksmandhira Harimurti",
      progressLabel: "100%",
      status: jobStatus,
      statusLabel: getAutomationStatusLabel("id", jobStatus),
      updatedAt: "2026-08-11T08:56",
    },
    jobTitle: "Ringkasan Job",
    lookupButtonLabel: "Tampilkan",
    lookupLabel: "Nama peneliti",
    lookupPlaceholder: "Suksmandhira Harimurti",
    summaryLabels: {
      candidates: "Kandidat",
      created: "Dibuat",
      name: "Nama",
      progress: "Progres",
      updated: "Diperbarui",
    },
    title: "Status Job",
  },
  en: {
    attemptColumns: {
      outcome: "Result",
      request: "Request",
      source: "Source",
      time: "Finished",
    },
    attempts: [
      {
        finishedAt: "2026-08-11T08:53",
        id: "attempt-sinta-profile",
        outcome: "succeeded",
        outcomeLabel: "Succeeded",
        requestUrl:
          "https://sinta.kemdiktisaintek.go.id/authors/profile/6712043",
        sourceLabel: "SINTA",
      },
      {
        finishedAt: "2026-08-11T08:54",
        id: "attempt-sinta-works-1",
        outcome: "succeeded",
        outcomeLabel: "Succeeded",
        requestUrl: "…/authors/profile/6712043/?view=scopus&page=1",
        sourceLabel: "SINTA",
      },
      {
        finishedAt: "2026-08-11T08:55",
        id: "attempt-sinta-works-2",
        outcome: "succeeded",
        outcomeLabel: "Succeeded",
        requestUrl: "…/authors/profile/6712043/?view=scopus&page=2",
        sourceLabel: "SINTA",
      },
      {
        finishedAt: "2026-08-11T08:56",
        id: "attempt-scholar",
        outcome: "failed",
        outcomeLabel: "Failed",
        requestUrl: "https://scholar.google.com/citations?user=8kQ2vRUAAAAJ",
        sourceLabel: "Google Scholar",
      },
    ],
    attemptsSubtitle: "Four attempts across two sources",
    attemptsTitle: "Attempt Log",
    description: "Collection status for one researcher and its attempt log.",
    job: {
      candidateCount: "33",
      createdAt: "2026-08-11T08:52",
      fullName: "Suksmandhira Harimurti",
      progressLabel: "100%",
      status: jobStatus,
      statusLabel: getAutomationStatusLabel("en", jobStatus),
      updatedAt: "2026-08-11T08:56",
    },
    jobTitle: "Job Summary",
    lookupButtonLabel: "Show",
    lookupLabel: "Researcher name",
    lookupPlaceholder: "Suksmandhira Harimurti",
    summaryLabels: {
      candidates: "Candidates",
      created: "Created",
      name: "Name",
      progress: "Progress",
      updated: "Updated",
    },
    title: "Job Status",
  },
} satisfies Record<
  Locale,
  Omit<NexusScraperJobsContent, "attempts" | "job"> & {
    attempts: Omit<ScraperJobAttempt, "finishedAtLabel">[];
    job: Omit<ScraperJobSummary, "createdAtLabel" | "updatedAtLabel">;
  }
>;

/**
 * Presentation-ready job detail. A server adapter can replace the seeded job
 * and attempts without changing the component contract.
 */
export function getNexusScraperJobsContent(
  locale: Locale,
): NexusScraperJobsContent {
  const copy = jobsCopy[locale];

  return {
    ...copy,
    attempts: copy.attempts.map((attempt) => ({
      ...attempt,
      finishedAtLabel: formatTimestamp(attempt.finishedAt),
    })),
    job: {
      ...copy.job,
      createdAtLabel: formatTimestamp(copy.job.createdAt),
      updatedAtLabel: formatTimestamp(copy.job.updatedAt),
    },
  };
}
