import type { AuditReviewRecord } from "@/components/nexus-audit-review/nexus-audit-review-content";
import { getAutomationStatusLabel } from "@/components/nexus-automation-status/nexus-automation-status-content";
import type { AutomationJobStatus } from "@/components/nexus-automation-status/nexus-automation-status-types";
import { formatTimestamp } from "@/components/nexus-workspace-ui/nexus-workspace-format";
import {
  kmIndicator,
  type NexusKmIndicatorId,
} from "@/content/nexus-km-indicators";
import type { Locale } from "@/i18n/locales";

export type CollectionSource = "scholar" | "sinta";

export type CollectionCandidate = Pick<
  AuditReviewRecord,
  | "candidateKind"
  | "category"
  | "categoryLabel"
  | "fields"
  | "id"
  | "kpiLinks"
  | "matches"
  | "owner"
  | "periodLabel"
  | "primaryPerson"
  | "signal"
  | "subtitle"
  | "title"
  | "typeLabel"
>;

export type CollectionJob = {
  candidates: CollectionCandidate[];
  fullName: string;
  id: string;
  profileUrl: string;
  source: CollectionSource;
  sourceLabel: string;
  status: AutomationJobStatus;
  statusLabel: string;
  submittedAt: string;
  submittedAtLabel: string;
  submittedBy: string;
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
  noResultsLabel: string;
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
  waitingForServiceLabel: string;
};

type PublicationCandidateSeed = {
  candidateKind: CollectionCandidate["candidateKind"];
  doi?: string;
  id: string;
  indicatorId: NexusKmIndicatorId;
  owner: string;
  person: string;
  title: string;
  typeLabel?: string;
  venue: string;
  year: number;
};

function publicationCandidate({
  candidateKind,
  doi,
  id,
  indicatorId,
  owner,
  person,
  title,
  typeLabel = "Artikel jurnal",
  venue,
  year,
}: PublicationCandidateSeed): CollectionCandidate {
  return {
    candidateKind,
    category: "publication_conference",
    categoryLabel: "Publikasi & konferensi",
    fields: [
      { id: "title", label: "Judul publikasi", value: title },
      { id: "authors", label: "Penulis", value: person },
      { id: "journal", label: "Jurnal / wadah terbit", value: venue },
      { id: "doi", label: "DOI", value: doi ?? "" },
      { id: "year", label: "Tahun terbit", value: String(year) },
    ],
    id,
    kpiLinks: [
      {
        evidenceRule:
          "Halaman penerbit, daftar penulis, afiliasi CoE, tahun terbit, dan klasifikasi publikasi yang dapat diverifikasi.",
        indicator: kmIndicator(indicatorId),
      },
    ],
    matches: [],
    owner,
    periodLabel: String(year),
    primaryPerson: person,
    signal: {
      primary: "Kandidat hasil pengumpulan",
      secondary: "Belum ada rekam pembanding terpilih",
      tone: "info",
    },
    subtitle: `${person} · ${venue}`,
    title,
    typeLabel,
  };
}

const suksmandhiraCandidates: CollectionCandidate[] = [
  publicationCandidate({
    candidateKind: "new_record",
    id: "COL-SINTA-6712043-PUB-001",
    indicatorId: "KM-11",
    owner: "CoE BHT",
    person:
      "Suksmandhira Harimurti; M Rivaldi Ali Septian; Khilda Afifah; Estananto",
    title:
      "Design of Electrochemical Biosensor Output Reader through Modelling the Electrochemical Cell System and Designing a 90nm CMOS Transimpedance Amplifier with Self-Biasing",
    typeLabel: "Makalah konferensi",
    venue:
      "International Symposium on Intelligent Signal Processing and Communication Systems (ISPACS)",
    year: 2026,
  }),
  publicationCandidate({
    candidateKind: "new_record",
    id: "COL-SINTA-6712043-PUB-002",
    indicatorId: "KM-12",
    owner: "CoE BHT",
    person:
      "M Rivaldi Ali Septian; Suksmandhira Harimurti; Wahmisari Priharti; Iswahyudi Hidayat; Mohamad Ramdhani",
    title:
      "Publikasi pada ELKOMIKA: Jurnal Teknik Energi Elektrik, Teknik Telekomunikasi, & Teknik Elektronika",
    venue:
      "ELKOMIKA: Jurnal Teknik Energi Elektrik, Teknik Telekomunikasi, & Teknik Elektronika",
    year: 2026,
  }),
];

const hestyCandidates: CollectionCandidate[] = [
  publicationCandidate({
    candidateKind: "new_record",
    id: "COL-SCHOLAR-HESTY-PUB-001",
    indicatorId: "KM-12",
    owner: "CoE BHT",
    person: "Liana Nafisa Saftari; Hesty Susanti",
    title:
      "Publikasi pada Indonesian Journal of Electronics, Electromedical Engineering, and Medical Informatics",
    venue:
      "Indonesian Journal of Electronics, Electromedical Engineering, and Medical Informatics",
    year: 2026,
  }),
];

const seeds = [
  {
    candidates: suksmandhiraCandidates,
    fullName: "Suksmandhira Harimurti",
    id: "sinta-profile-6712043",
    profileUrl: "https://sinta.kemdiktisaintek.go.id/authors/profile/6712043",
    source: "sinta",
    status: "succeeded",
    submittedAt: "2026-08-12T08:54",
    submittedBy: "Muhammad Ammar Asyraf · Admin / Pimpinan",
  },
  {
    candidates: hestyCandidates,
    fullName: "Hesty Susanti",
    id: "scholar-profile-example",
    profileUrl: "https://scholar.google.com/citations?user=3xVn7QsAAAAJ",
    source: "scholar",
    status: "succeeded",
    submittedAt: "2026-08-12T08:48",
    submittedBy: "Muhammad Ammar Asyraf · Admin / Pimpinan",
  },
  {
    candidates: [],
    fullName: "Dita Puspitasari",
    id: "sinta-profile-6698215",
    profileUrl: "https://sinta.kemdiktisaintek.go.id/authors/profile/6698215",
    source: "sinta",
    status: "running",
    submittedAt: "2026-08-12T08:41",
    submittedBy: "Muhammad Ammar Asyraf · Admin / Pimpinan",
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
    noResultsLabel: "Tidak ada hasil",
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
    waitingForServiceLabel: "Menunggu layanan",
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
    noResultsLabel: "No results",
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
    waitingForServiceLabel: "Waiting for service",
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
