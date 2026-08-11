import { getAutomationStatusLabel } from "@/components/nexus-automation-status/nexus-automation-status-content";
import type { AutomationJobStatus } from "@/components/nexus-automation-status/nexus-automation-status-types";
import type { Locale } from "@/i18n/locales";

export type ScraperJobAttempt = {
  finishedAtLabel: string;
  id: string;
  message: string;
  outcome: "failed" | "succeeded";
  outcomeLabel: string;
  requestUrl: string;
  sourceLabel: string;
};

export type ScraperJobSummary = {
  candidateCount: string;
  createdAtLabel: string;
  fullName: string;
  id: string;
  progressLabel: string;
  status: AutomationJobStatus;
  statusLabel: string;
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
        finishedAtLabel: "2026-08-11 08:53",
        id: "attempt-sinta-profile",
        message: "Identitas cocok tepat, institusi terkonfirmasi.",
        outcome: "succeeded",
        outcomeLabel: "Berhasil",
        requestUrl:
          "https://sinta.kemdiktisaintek.go.id/authors/profile/6712043",
        sourceLabel: "SINTA",
      },
      {
        finishedAtLabel: "2026-08-11 08:54",
        id: "attempt-sinta-works-1",
        message: "24 karya terambil.",
        outcome: "succeeded",
        outcomeLabel: "Berhasil",
        requestUrl: "…/authors/profile/6712043/?view=scopus&page=1",
        sourceLabel: "SINTA",
      },
      {
        finishedAtLabel: "2026-08-11 08:55",
        id: "attempt-sinta-works-2",
        message: "9 karya terambil, halaman terakhir.",
        outcome: "succeeded",
        outcomeLabel: "Berhasil",
        requestUrl: "…/authors/profile/6712043/?view=scopus&page=2",
        sourceLabel: "SINTA",
      },
      {
        finishedAtLabel: "2026-08-11 08:56",
        id: "attempt-scholar",
        message:
          "Sumber meminta verifikasi CAPTCHA atau sign-in. Hasil SINTA tetap disimpan.",
        outcome: "failed",
        outcomeLabel: "Gagal",
        requestUrl: "SerpApi google_scholar_author?user=8kQ2vRUAAAAJ",
        sourceLabel: "Google Scholar",
      },
    ],
    attemptsSubtitle: "Empat percobaan pada dua sumber",
    attemptsTitle: "Log Percobaan",
    description: "Status pengumpulan data satu peneliti dan log percobaannya.",
    job: {
      candidateCount: "33",
      createdAtLabel: "2026-08-11 08:52",
      id: "job_01J9BF2K",
      fullName: "Suksmandhira Harimurti",
      progressLabel: "100%",
      status: jobStatus,
      statusLabel: getAutomationStatusLabel("id", jobStatus),
      updatedAtLabel: "2026-08-11 08:56",
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
        finishedAtLabel: "2026-08-11 08:53",
        id: "attempt-sinta-profile",
        message: "Exact identity match, institution confirmed.",
        outcome: "succeeded",
        outcomeLabel: "Succeeded",
        requestUrl:
          "https://sinta.kemdiktisaintek.go.id/authors/profile/6712043",
        sourceLabel: "SINTA",
      },
      {
        finishedAtLabel: "2026-08-11 08:54",
        id: "attempt-sinta-works-1",
        message: "24 works collected.",
        outcome: "succeeded",
        outcomeLabel: "Succeeded",
        requestUrl: "…/authors/profile/6712043/?view=scopus&page=1",
        sourceLabel: "SINTA",
      },
      {
        finishedAtLabel: "2026-08-11 08:55",
        id: "attempt-sinta-works-2",
        message: "9 works collected, final page.",
        outcome: "succeeded",
        outcomeLabel: "Succeeded",
        requestUrl: "…/authors/profile/6712043/?view=scopus&page=2",
        sourceLabel: "SINTA",
      },
      {
        finishedAtLabel: "2026-08-11 08:56",
        id: "attempt-scholar",
        message:
          "The source asked for CAPTCHA or sign-in verification. SINTA results were kept.",
        outcome: "failed",
        outcomeLabel: "Failed",
        requestUrl: "SerpApi google_scholar_author?user=8kQ2vRUAAAAJ",
        sourceLabel: "Google Scholar",
      },
    ],
    attemptsSubtitle: "Four attempts across two sources",
    attemptsTitle: "Attempt Log",
    description: "Collection status for one researcher and its attempt log.",
    job: {
      candidateCount: "33",
      createdAtLabel: "2026-08-11 08:52",
      id: "job_01J9BF2K",
      fullName: "Suksmandhira Harimurti",
      progressLabel: "100%",
      status: jobStatus,
      statusLabel: getAutomationStatusLabel("en", jobStatus),
      updatedAtLabel: "2026-08-11 08:56",
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
} satisfies Record<Locale, Omit<NexusScraperJobsContent, "previewLabel">>;

/**
 * Presentation-ready job detail. A server adapter can replace the seeded job
 * and attempts without changing the component contract.
 */
export function getNexusScraperJobsContent(
  locale: Locale,
): NexusScraperJobsContent {
  return {
    ...jobsCopy[locale],
  };
}
