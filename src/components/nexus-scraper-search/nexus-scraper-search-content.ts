import { getAutomationStatusLabel } from "@/components/nexus-automation-status/nexus-automation-status-content";
import type { AutomationJobStatus } from "@/components/nexus-automation-status/nexus-automation-status-types";
import type { Locale } from "@/i18n/locales";

export type ScraperSourceOption = {
  id: string;
  label: string;
  note: string;
};

export type ApprovedHost = {
  host: string;
  note: string;
};

export type ScraperSubmission = {
  id: string;
  inputKindLabel: string;
  jobId: string;
  normalizedValue: string;
  rawInput: string;
  sourceLabel: string;
  status: AutomationJobStatus;
  statusLabel: string;
  submittedAtLabel: string;
};

export type NexusScraperSearchContent = {
  approvedHosts: ApprovedHost[];
  approvedHostsSubtitle: string;
  approvedHostsTitle: string;
  columns: {
    input: string;
    normalized: string;
    source: string;
    status: string;
    submittedAt: string;
  };
  description: string;
  eyebrow: string;
  inputLabel: string;
  inputPlaceholder: string;
  normalizationNote: string;
  proxyNote: string;
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
  "inputKindLabel" | "sourceLabel" | "statusLabel"
> & {
  inputKindLabel: Record<Locale, string>;
  sourceLabel: string;
};

const submissionSeeds: SubmissionSeed[] = [
  {
    id: "harimurti-sinta",
    inputKindLabel: { en: "Name", id: "Nama" },
    jobId: "job_01J9D1A4",
    normalizedValue: "suksmandhira harimurti",
    rawInput: "Dr. Suksmandhira Harimurti, S.T., M.T.",
    sourceLabel: "SINTA",
    status: "running",
    submittedAtLabel: "2026-08-11 08:52",
  },
  {
    id: "susanti-scholar",
    inputKindLabel: { en: "Profile URL", id: "URL profil" },
    jobId: "job_01J9CZ7B",
    normalizedValue: "user=8kQ2vRUAAAAJ",
    rawInput: "https://scholar.google.com/citations?user=8kQ2vRUAAAAJ",
    sourceLabel: "Google Scholar",
    status: "retrying",
    submittedAtLabel: "2026-08-11 08:31",
  },
  {
    id: "puspitasari-sinta",
    inputKindLabel: { en: "Profile URL", id: "URL profil" },
    jobId: "job_01J9BF2K",
    normalizedValue: "id=6712043",
    rawInput: "https://sinta.kemdiktisaintek.go.id/authors/profile/6712043",
    sourceLabel: "SINTA",
    status: "succeeded",
    submittedAtLabel: "2026-08-10 16:09",
  },
  {
    id: "rahman-sinta",
    inputKindLabel: { en: "Name", id: "Nama" },
    jobId: "job_01J9A8X3",
    normalizedValue: "fathur rahman",
    rawInput: "Fathur Rahman, M.Sc.",
    sourceLabel: "SINTA",
    status: "failed",
    submittedAtLabel: "2026-08-10 14:22",
  },
];

const searchCopy = {
  id: {
    approvedHosts: [
      {
        host: "sinta.kemdiktisaintek.go.id",
        note: "Profil dan daftar karya diambil langsung dari SINTA.",
      },
      {
        host: "scholar.google.com",
        note: "URL profil dibaca untuk mengambil ID penulis. Pengambilan data dilakukan lewat SerpApi.",
      },
    ],
    approvedHostsSubtitle: "URL di luar daftar ini ditolak",
    approvedHostsTitle: "Host yang Disetujui",
    columns: {
      input: "Masukan",
      normalized: "Nilai Ternormalisasi",
      source: "Sumber",
      status: "Status",
      submittedAt: "Dikirim",
    },
    description:
      "Kirim nama peneliti atau URL profil ber-HTTPS pada host yang disetujui untuk membuat job pengumpulan data.",
    eyebrow: "Pengumpulan Data",
    inputLabel: "Nama atau URL profil",
    inputPlaceholder:
      "Nama peneliti atau https://sinta.kemdiktisaintek.go.id/authors/profile/…",
    normalizationNote:
      "Gelar dan sufiks akademik dihapus, spasi dan huruf besar-kecil diseragamkan. Masukan mentah dan nilai ternormalisasi tersimpan pada job.",
    proxyNote:
      "Google Scholar diambil melalui SerpApi sebagai perantara, bukan pengambilan langsung ke scholar.google.com.",
    sourceLabel: "Sumber data",
    sourceOptions: [
      { id: "sinta", label: "SINTA", note: "Pengambilan langsung" },
      {
        id: "google_scholar",
        label: "Google Scholar",
        note: "Melalui SerpApi",
      },
    ],
    submissionsSubtitle: "Empat pengiriman terakhir",
    submissionsTitle: "Pengiriman Terkini",
    submitLabel: "Buat job",
    title: "Pencarian Peneliti",
  },
  en: {
    approvedHosts: [
      {
        host: "sinta.kemdiktisaintek.go.id",
        note: "Profiles and work lists are fetched from SINTA directly.",
      },
      {
        host: "scholar.google.com",
        note: "The profile URL is read for its author ID. Collection itself runs through SerpApi.",
      },
    ],
    approvedHostsSubtitle: "URLs outside this list are rejected",
    approvedHostsTitle: "Approved Hosts",
    columns: {
      input: "Input",
      normalized: "Normalised Value",
      source: "Source",
      status: "Status",
      submittedAt: "Submitted",
    },
    description:
      "Submit a researcher name or an HTTPS profile URL on an approved host to create a collection job.",
    eyebrow: "Data Collection",
    inputLabel: "Name or profile URL",
    inputPlaceholder:
      "Researcher name or https://sinta.kemdiktisaintek.go.id/authors/profile/…",
    normalizationNote:
      "Academic titles and suffixes are stripped, spacing and case are normalised. Both the raw input and the normalised value are stored on the job.",
    proxyNote:
      "Google Scholar is collected through SerpApi as a proxy rather than fetched from scholar.google.com directly.",
    sourceLabel: "Data source",
    sourceOptions: [
      { id: "sinta", label: "SINTA", note: "Direct fetch" },
      { id: "google_scholar", label: "Google Scholar", note: "Via SerpApi" },
    ],
    submissionsSubtitle: "Four most recent submissions",
    submissionsTitle: "Recent Submissions",
    submitLabel: "Create job",
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
      id: seed.id,
      inputKindLabel: seed.inputKindLabel[locale],
      jobId: seed.jobId,
      normalizedValue: seed.normalizedValue,
      rawInput: seed.rawInput,
      sourceLabel: seed.sourceLabel,
      status: seed.status,
      statusLabel: getAutomationStatusLabel(locale, seed.status),
      submittedAtLabel: seed.submittedAtLabel,
    })),
  };
}
