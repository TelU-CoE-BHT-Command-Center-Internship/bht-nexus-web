import { getAutomationStatusLabel } from "@/components/nexus-automation-status/nexus-automation-status-content";
import type { AutomationJobStatus } from "@/components/nexus-automation-status/nexus-automation-status-types";
import { formatTimestamp } from "@/components/nexus-workspace-page/nexus-workspace-format";
import type { Locale } from "@/i18n/locales";

export type ScraperSourceOption = {
  id: string;
  label: string;
};

export type ScraperProfileLink = {
  id: string;
  url: string;
};

export type ScraperSubmission = {
  fullName: string;
  id: string;
  scholar: ScraperProfileLink | null;
  sinta: ScraperProfileLink | null;
  status: AutomationJobStatus;
  statusLabel: string;
  submittedAt: string;
  submittedAtLabel: string;
};

export type NexusScraperSearchContent = {
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
  sourceLabel: string;
  sourceOptions: ScraperSourceOption[];
  submissions: ScraperSubmission[];
  submissionsSubtitle: string;
  submissionsTitle: string;
  submitLabel: string;
  title: string;
};

type SubmissionSeed = Omit<
  ScraperSubmission,
  "statusLabel" | "submittedAtLabel"
>;

const sintaProfile = (id: string): ScraperProfileLink => ({
  id,
  url: `https://sinta.kemdiktisaintek.go.id/authors/profile/${id}`,
});

const scholarProfile = (id: string): ScraperProfileLink => ({
  id,
  url: `https://scholar.google.com/citations?user=${id}`,
});

const submissionSeeds: SubmissionSeed[] = [
  {
    fullName: "Suksmandhira Harimurti",
    id: "harimurti",
    scholar: scholarProfile("8kQ2vRUAAAAJ"),
    sinta: sintaProfile("6712043"),
    status: "running",
    submittedAt: "2026-08-11T08:52",
  },
  {
    fullName: "Hesty Susanti",
    id: "susanti",
    scholar: scholarProfile("3xVn7QsAAAAJ"),
    sinta: null,
    status: "retrying",
    submittedAt: "2026-08-11T08:31",
  },
  {
    fullName: "Dita Puspitasari",
    id: "puspitasari",
    scholar: null,
    sinta: sintaProfile("6698215"),
    status: "succeeded",
    submittedAt: "2026-08-10T16:09",
  },
  {
    fullName: "Fathur Rahman",
    id: "rahman",
    scholar: null,
    sinta: sintaProfile("6710884"),
    status: "failed",
    submittedAt: "2026-08-10T14:22",
  },
];

const searchCopy = {
  id: {
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
    sourceLabel: "Sumber data",
    sourceOptions: [
      { id: "sinta", label: "SINTA" },
      { id: "google_scholar", label: "Google Scholar" },
    ],
    submissionsSubtitle: "Empat pencarian terakhir",
    submissionsTitle: "Pencarian Terkini",
    submitLabel: "Cari",
    title: "Pencarian Peneliti",
  },
  en: {
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
    sourceLabel: "Data source",
    sourceOptions: [
      { id: "sinta", label: "SINTA" },
      { id: "google_scholar", label: "Google Scholar" },
    ],
    submissionsSubtitle: "Four most recent searches",
    submissionsTitle: "Recent Searches",
    submitLabel: "Search",
    title: "Researcher Search",
  },
} satisfies Record<Locale, Omit<NexusScraperSearchContent, "submissions">>;

/**
 * Presentation-ready submission list. A server adapter can replace the seeded
 * submissions without changing the component contract.
 */
export function getNexusScraperSearchContent(
  locale: Locale,
): NexusScraperSearchContent {
  return {
    ...searchCopy[locale],
    submissions: submissionSeeds.map((seed) => ({
      ...seed,
      statusLabel: getAutomationStatusLabel(locale, seed.status),
      submittedAtLabel: formatTimestamp(seed.submittedAt),
    })),
  };
}
