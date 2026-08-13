import { getAutomationStatusLabel } from "@/components/nexus-automation-status/nexus-automation-status-content";
import type { AutomationJobStatus } from "@/components/nexus-automation-status/nexus-automation-status-types";
import { formatTimestamp } from "@/components/nexus-workspace-ui/nexus-workspace-format";
import type { Locale } from "@/i18n/locales";

export type ScraperSourceOption = {
  id: string;
  label: string;
};

export type ScraperProfileLink = {
  id: string;
  url: string;
};

export type ScraperAttempt = {
  finishedAt: string;
  finishedAtLabel: string;
  id: string;
  outcome: "failed" | "succeeded";
  outcomeLabel: string;
  requestUrl: string;
  sourceLabel: string;
};

export type ScraperSubmission = {
  attempts: ScraperAttempt[];
  candidateCount: string;
  fullName: string;
  id: string;
  scholar: ScraperProfileLink | null;
  sinta: ScraperProfileLink | null;
  status: AutomationJobStatus;
  statusLabel: string;
  submittedAt: string;
  submittedAtLabel: string;
  updatedAt: string;
  updatedAtLabel: string;
};

export type NexusScraperSearchContent = {
  attemptColumns: {
    outcome: string;
    request: string;
    source: string;
    time: string;
  };
  attemptsTitle: string;
  columns: {
    name: string;
    scholar: string;
    sinta: string;
    status: string;
    submittedAt: string;
  };
  description: string;
  emptyLinkLabel: string;
  inputLabel: string;
  inputPlaceholder: string;
  selectRowLabel: string;
  sourceLabel: string;
  sourceOptions: ScraperSourceOption[];
  submissions: ScraperSubmission[];
  submissionsTitle: string;
  submitLabel: string;
  summaryLabels: {
    candidates: string;
    name: string;
    updated: string;
  };
  title: string;
};

type AttemptSeed = Omit<ScraperAttempt, "finishedAtLabel" | "outcomeLabel"> & {
  outcomeLabel: Record<Locale, string>;
};

type SubmissionSeed = Omit<
  ScraperSubmission,
  "attempts" | "statusLabel" | "submittedAtLabel" | "updatedAtLabel"
> & {
  attempts: AttemptSeed[];
};

const sintaProfile = (id: string): ScraperProfileLink => ({
  id,
  url: `https://sinta.kemdiktisaintek.go.id/authors/profile/${id}`,
});

const scholarProfile = (id: string): ScraperProfileLink => ({
  id,
  url: `https://scholar.google.com/citations?user=${id}`,
});

const succeeded = { en: "Succeeded", id: "Berhasil" };
const failed = { en: "Failed", id: "Gagal" };

const submissionSeeds: SubmissionSeed[] = [
  {
    attempts: [
      {
        finishedAt: "2026-08-11T08:53",
        id: "harimurti-sinta-profile",
        outcome: "succeeded",
        outcomeLabel: succeeded,
        requestUrl:
          "https://sinta.kemdiktisaintek.go.id/authors/profile/6712043",
        sourceLabel: "SINTA",
      },
      {
        finishedAt: "2026-08-11T08:54",
        id: "harimurti-sinta-page-1",
        outcome: "succeeded",
        outcomeLabel: succeeded,
        requestUrl:
          "https://sinta.kemdiktisaintek.go.id/authors/profile/6712043?view=scopus&page=1",
        sourceLabel: "SINTA",
      },
      {
        finishedAt: "2026-08-11T08:56",
        id: "harimurti-scholar",
        outcome: "failed",
        outcomeLabel: failed,
        requestUrl: "https://scholar.google.com/citations?user=8kQ2vRUAAAAJ",
        sourceLabel: "Google Scholar",
      },
    ],
    candidateCount: "33",
    fullName: "Suksmandhira Harimurti",
    id: "harimurti",
    scholar: scholarProfile("8kQ2vRUAAAAJ"),
    sinta: sintaProfile("6712043"),
    status: "running",
    submittedAt: "2026-08-11T08:52",
    updatedAt: "2026-08-11T08:56",
  },
  {
    attempts: [
      {
        finishedAt: "2026-08-11T08:33",
        id: "susanti-scholar",
        outcome: "failed",
        outcomeLabel: failed,
        requestUrl: "https://scholar.google.com/citations?user=3xVn7QsAAAAJ",
        sourceLabel: "Google Scholar",
      },
    ],
    candidateCount: "0",
    fullName: "Hesty Susanti",
    id: "susanti",
    scholar: scholarProfile("3xVn7QsAAAAJ"),
    sinta: null,
    status: "retrying",
    submittedAt: "2026-08-11T08:31",
    updatedAt: "2026-08-11T08:33",
  },
  {
    attempts: [
      {
        finishedAt: "2026-08-10T16:10",
        id: "puspitasari-sinta-profile",
        outcome: "succeeded",
        outcomeLabel: succeeded,
        requestUrl:
          "https://sinta.kemdiktisaintek.go.id/authors/profile/6698215",
        sourceLabel: "SINTA",
      },
      {
        finishedAt: "2026-08-10T16:12",
        id: "puspitasari-sinta-page-1",
        outcome: "succeeded",
        outcomeLabel: succeeded,
        requestUrl:
          "https://sinta.kemdiktisaintek.go.id/authors/profile/6698215?view=scopus&page=1",
        sourceLabel: "SINTA",
      },
    ],
    candidateCount: "18",
    fullName: "Dita Puspitasari",
    id: "puspitasari",
    scholar: null,
    sinta: sintaProfile("6698215"),
    status: "succeeded",
    submittedAt: "2026-08-10T16:09",
    updatedAt: "2026-08-10T16:12",
  },
  {
    attempts: [
      {
        finishedAt: "2026-08-10T14:23",
        id: "rahman-sinta-search",
        outcome: "failed",
        outcomeLabel: failed,
        requestUrl:
          "https://sinta.kemdiktisaintek.go.id/authors?q=fathur+rahman",
        sourceLabel: "SINTA",
      },
    ],
    candidateCount: "0",
    fullName: "Fathur Rahman",
    id: "rahman",
    scholar: null,
    sinta: sintaProfile("6710884"),
    status: "failed",
    submittedAt: "2026-08-10T14:22",
    updatedAt: "2026-08-10T14:23",
  },
];

const searchCopy = {
  id: {
    attemptColumns: {
      outcome: "Hasil",
      request: "Permintaan",
      source: "Sumber",
      time: "Selesai",
    },
    attemptsTitle: "Log Percobaan",
    columns: {
      name: "Nama",
      scholar: "Google Scholar",
      sinta: "SINTA",
      status: "Status",
      submittedAt: "Dikirim",
    },
    description: "Cari peneliti berdasarkan nama atau URL profil.",
    emptyLinkLabel: "Belum ada",
    inputLabel: "Nama atau URL profil",
    inputPlaceholder:
      "Nama peneliti atau https://sinta.kemdiktisaintek.go.id/authors/profile/…",
    selectRowLabel: "Lihat log percobaan",
    sourceLabel: "Sumber data",
    sourceOptions: [
      { id: "sinta", label: "SINTA" },
      { id: "google_scholar", label: "Google Scholar" },
    ],
    submissionsTitle: "Pencarian Terkini",
    submitLabel: "Cari",
    summaryLabels: {
      candidates: "Kandidat",
      name: "Nama",
      updated: "Diperbarui",
    },
    title: "Pencarian Peneliti",
  },
  en: {
    attemptColumns: {
      outcome: "Result",
      request: "Request",
      source: "Source",
      time: "Finished",
    },
    attemptsTitle: "Attempt Log",
    columns: {
      name: "Name",
      scholar: "Google Scholar",
      sinta: "SINTA",
      status: "Status",
      submittedAt: "Submitted",
    },
    description: "Find a researcher by name or profile URL.",
    emptyLinkLabel: "None yet",
    inputLabel: "Name or profile URL",
    inputPlaceholder:
      "Researcher name or https://sinta.kemdiktisaintek.go.id/authors/profile/…",
    selectRowLabel: "View attempt log",
    sourceLabel: "Data source",
    sourceOptions: [
      { id: "sinta", label: "SINTA" },
      { id: "google_scholar", label: "Google Scholar" },
    ],
    submissionsTitle: "Recent Searches",
    submitLabel: "Search",
    summaryLabels: {
      candidates: "Candidates",
      name: "Name",
      updated: "Updated",
    },
    title: "Researcher Search",
  },
} satisfies Record<Locale, Omit<NexusScraperSearchContent, "submissions">>;

/**
 * Presentation-ready search list. Each row carries its own attempt log, so one
 * page holds both the searches and the detail of the selected row.
 */
export function getNexusScraperSearchContent(
  locale: Locale,
): NexusScraperSearchContent {
  return {
    ...searchCopy[locale],
    submissions: submissionSeeds.map((seed) => ({
      ...seed,
      attempts: seed.attempts.map((attempt) => ({
        ...attempt,
        finishedAtLabel: formatTimestamp(attempt.finishedAt),
        outcomeLabel: attempt.outcomeLabel[locale],
      })),
      statusLabel: getAutomationStatusLabel(locale, seed.status),
      submittedAtLabel: formatTimestamp(seed.submittedAt),
      updatedAtLabel: formatTimestamp(seed.updatedAt),
    })),
  };
}
