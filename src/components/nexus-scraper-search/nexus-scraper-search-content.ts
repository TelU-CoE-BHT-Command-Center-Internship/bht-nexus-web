import { getAutomationStatusLabel } from "@/components/nexus-automation-status/nexus-automation-status-content";
import type { AutomationJobStatus } from "@/components/nexus-automation-status/nexus-automation-status-types";
import { formatTimestamp } from "@/components/nexus-workspace-ui/nexus-workspace-format";
import type { Locale } from "@/i18n/locales";

export type CollectionSource = "scholar" | "sinta";

export type CollectionJob = {
  candidateCount: number;
  fullName: string;
  id: string;
  profileUrl: string;
  source: CollectionSource;
  sourceLabel: string;
  status: AutomationJobStatus;
  statusLabel: string;
  submittedAt: string;
  submittedAtLabel: string;
};

export type NexusScraperSearchContent = {
  candidatesLabel: string;
  columns: {
    action: string;
    candidates: string;
    name: string;
    source: string;
    status: string;
    submittedAt: string;
  };
  description: string;
  errorLabel: string;
  jobs: CollectionJob[];
  locale: Locale;
  nameLabel: string;
  namePlaceholder: string;
  profileUrlLabel: string;
  profileUrlPlaceholder: string;
  queuedLabel: string;
  reviewHref: string;
  reviewLabel: string;
  sourceLabel: string;
  sourceOptions: Array<{ id: CollectionSource; label: string }>;
  submitLabel: string;
  tableCaption: string;
  title: string;
};

const seeds = [
  {
    candidateCount: 6,
    fullName: "Suksmandhira Harimurti",
    id: "sinta-profile-6712043",
    profileUrl: "https://sinta.kemdiktisaintek.go.id/authors/profile/6712043",
    source: "sinta",
    status: "succeeded",
    submittedAt: "2026-08-12T08:54",
  },
  {
    candidateCount: 3,
    fullName: "Hesty Susanti",
    id: "scholar-profile-example",
    profileUrl: "https://scholar.google.com/citations?user=3xVn7QsAAAAJ",
    source: "scholar",
    status: "succeeded",
    submittedAt: "2026-08-12T08:48",
  },
  {
    candidateCount: 0,
    fullName: "Dita Puspitasari",
    id: "sinta-profile-6698215",
    profileUrl: "https://sinta.kemdiktisaintek.go.id/authors/profile/6698215",
    source: "sinta",
    status: "running",
    submittedAt: "2026-08-12T08:41",
  },
] satisfies Array<
  Omit<CollectionJob, "sourceLabel" | "statusLabel" | "submittedAtLabel">
>;

const copy = {
  id: {
    candidatesLabel: "kandidat",
    columns: {
      action: "Aksi",
      candidates: "Hasil",
      name: "Nama peneliti",
      source: "Sumber",
      status: "Status",
      submittedAt: "Diajukan",
    },
    description:
      "Ajukan profil publik SINTA atau Google Scholar sebagai pekerjaan pengumpulan. Hasilnya masuk ke Tinjauan, bukan langsung ke data resmi.",
    errorLabel:
      "Isi nama dan URL HTTPS yang sesuai dengan sumber SINTA atau Google Scholar.",
    nameLabel: "Nama peneliti",
    namePlaceholder: "Contoh: Nama peneliti",
    profileUrlLabel: "URL profil publik",
    profileUrlPlaceholder:
      "https://sinta.kemdiktisaintek.go.id/authors/profile/…",
    queuedLabel: "Pekerjaan ditambahkan ke antrean pengumpulan.",
    reviewHref: "/nexus/tinjauan",
    reviewLabel: "Buka Tinjauan",
    sourceLabel: "Sumber",
    sourceOptions: [
      { id: "sinta", label: "SINTA" },
      { id: "scholar", label: "Google Scholar" },
    ],
    submitLabel: "Mulai pengumpulan",
    tableCaption: "Status pekerjaan pengumpulan profil publik",
    title: "Pengumpulan Data",
  },
  en: {
    candidatesLabel: "candidates",
    columns: {
      action: "Action",
      candidates: "Results",
      name: "Researcher",
      source: "Source",
      status: "Status",
      submittedAt: "Submitted",
    },
    description:
      "Submit a public SINTA or Google Scholar profile as a collection job. Results enter Reviews and never write directly to official data.",
    errorLabel:
      "Enter a name and an HTTPS URL matching the selected SINTA or Google Scholar source.",
    nameLabel: "Researcher name",
    namePlaceholder: "Example: Researcher name",
    profileUrlLabel: "Public profile URL",
    profileUrlPlaceholder:
      "https://sinta.kemdiktisaintek.go.id/authors/profile/…",
    queuedLabel: "The collection job was added to the queue.",
    reviewHref: "/en/nexus/reviews",
    reviewLabel: "Open Reviews",
    sourceLabel: "Source",
    sourceOptions: [
      { id: "sinta", label: "SINTA" },
      { id: "scholar", label: "Google Scholar" },
    ],
    submitLabel: "Start collection",
    tableCaption: "Public profile collection job status",
    title: "Data Collection",
  },
} satisfies Record<Locale, Omit<NexusScraperSearchContent, "jobs" | "locale">>;

export function getNexusScraperSearchContent(
  locale: Locale,
): NexusScraperSearchContent {
  const sourceLabels: Record<CollectionSource, string> = {
    scholar: "Google Scholar",
    sinta: "SINTA",
  };

  return {
    ...copy[locale],
    jobs: seeds.map((seed) => ({
      ...seed,
      sourceLabel: sourceLabels[seed.source],
      statusLabel: getAutomationStatusLabel(locale, seed.status),
      submittedAtLabel: formatTimestamp(seed.submittedAt),
    })),
    locale,
  };
}
