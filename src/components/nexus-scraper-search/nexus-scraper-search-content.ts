import type { AuditReviewRecord } from "@/components/nexus-audit-review/nexus-audit-review-content";
import { getAutomationStatusLabel } from "@/components/nexus-automation-status/nexus-automation-status-content";
import type { AutomationJobStatus } from "@/components/nexus-automation-status/nexus-automation-status-types";
import { formatTimestamp } from "@/components/nexus-workspace-ui/nexus-workspace-format";
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

type PublicationCandidateSeed = {
  candidateKind: CollectionCandidate["candidateKind"];
  doi: string;
  id: string;
  owner: string;
  person: string;
  title: string;
  venue: string;
  year: number;
};

function publicationCandidate({
  candidateKind,
  doi,
  id,
  owner,
  person,
  title,
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
      { id: "doi", label: "DOI", value: doi },
      { id: "year", label: "Tahun terbit", value: String(year) },
    ],
    id,
    kpiLinks: [
      {
        category: "Riset",
        evidenceRule:
          "Tautan DOI atau penerbit, daftar penulis, afiliasi CoE, dan tahun terbit.",
        indicatorId: "KM-14",
        indicatorLabel: "Publikasi ilmiah anggota CoE",
        indicatorNumber: 14,
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
    typeLabel: "Artikel jurnal",
  };
}

const suksmandhiraCandidates: CollectionCandidate[] = [
  publicationCandidate({
    candidateKind: "new_record",
    doi: "10.1016/j.heliyon.2026.14521",
    id: "COL-SINTA-6712043-PUB-001",
    owner: "Suksmandhira Harimurti",
    person: "Suksmandhira Harimurti",
    title: "Wearable Biosignal Monitoring for Community Primary Care",
    venue: "Heliyon",
    year: 2026,
  }),
  publicationCandidate({
    candidateKind: "new_record",
    doi: "10.1109/ACCESS.2026.3112047",
    id: "COL-SINTA-6712043-PUB-002",
    owner: "Hesty Susanti",
    person: "Suksmandhira Harimurti; Hesty Susanti",
    title: "Remote Cardiac Monitoring for Indonesian Rural Clinics",
    venue: "IEEE Access",
    year: 2026,
  }),
  publicationCandidate({
    candidateKind: "record_update",
    doi: "10.2196/48213",
    id: "COL-SINTA-6712043-PUB-003",
    owner: "Hesty Susanti",
    person: "Suksmandhira Harimurti; Hesty Susanti",
    title: "Primary Care Telemedicine Adoption in Indonesian District Clinics",
    venue: "Journal of Medical Internet Research",
    year: 2026,
  }),
  publicationCandidate({
    candidateKind: "new_record",
    doi: "10.3390/s26041182",
    id: "COL-SINTA-6712043-PUB-004",
    owner: "Suksmandhira Harimurti",
    person: "Suksmandhira Harimurti; Rizky Hidayat",
    title: "Low-Power ECG Acquisition for Home Monitoring",
    venue: "Sensors",
    year: 2026,
  }),
  publicationCandidate({
    candidateKind: "new_record",
    doi: "10.1007/s11517-026-02941-7",
    id: "COL-SINTA-6712043-PUB-005",
    owner: "Suksmandhira Harimurti",
    person: "Suksmandhira Harimurti; Dita Puspitasari",
    title: "Explainable Arrhythmia Screening from Single-Lead ECG",
    venue: "Medical & Biological Engineering & Computing",
    year: 2026,
  }),
  publicationCandidate({
    candidateKind: "new_record",
    doi: "10.1088/2057-1976/ad9e12",
    id: "COL-SINTA-6712043-PUB-006",
    owner: "Suksmandhira Harimurti",
    person: "Suksmandhira Harimurti; Fathur Rahman",
    title: "Biosignal Quality Assessment for Mobile Health Devices",
    venue: "Biomedical Physics & Engineering Express",
    year: 2025,
  }),
];

const hestyCandidates: CollectionCandidate[] = [
  publicationCandidate({
    candidateKind: "new_record",
    doi: "10.1016/j.compbiomed.2026.108211",
    id: "COL-SCHOLAR-HESTY-PUB-001",
    owner: "Hesty Susanti",
    person: "Hesty Susanti",
    title: "Clinical Decision Support for Home Biosignal Monitoring",
    venue: "Computers in Biology and Medicine",
    year: 2026,
  }),
  publicationCandidate({
    candidateKind: "new_record",
    doi: "10.1109/JBHI.2025.3511942",
    id: "COL-SCHOLAR-HESTY-PUB-002",
    owner: "Hesty Susanti",
    person: "Hesty Susanti; Suksmandhira Harimurti",
    title: "Multimodal Fall-Risk Assessment for Older Adults",
    venue: "IEEE Journal of Biomedical and Health Informatics",
    year: 2025,
  }),
  publicationCandidate({
    candidateKind: "new_record",
    doi: "10.3390/healthcare13020144",
    id: "COL-SCHOLAR-HESTY-PUB-003",
    owner: "Hesty Susanti",
    person: "Hesty Susanti; Nabila Rahmawati",
    title: "Community Health Worker Readiness for Remote Monitoring",
    venue: "Healthcare",
    year: 2025,
  }),
];

export function createLocalCollectionCandidates(
  jobId: string,
  person: string,
  count: number,
): CollectionCandidate[] {
  return Array.from({ length: count }, (_, index) =>
    publicationCandidate({
      candidateKind: "new_record",
      doi: `10.0000/preview.${jobId}.${index + 1}`,
      id: `COL-${jobId.toUpperCase()}-PUB-${String(index + 1).padStart(3, "0")}`,
      owner: "Belum ditetapkan",
      person,
      title: `Kandidat publikasi ${index + 1} · ${person}`,
      venue: "Wadah terbit belum diverifikasi",
      year: 2026,
    }),
  );
}

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
