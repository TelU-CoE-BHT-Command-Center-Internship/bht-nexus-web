import { formatTimestamp } from "@/components/nexus-workspace-page/nexus-workspace-format";
import type { Locale } from "@/i18n/locales";

export type CandidateDetail = {
  id: string;
  label: string;
  value: string;
};

/**
 * Candidate types the scraper writes to staging. `profile` comes from the
 * identity step; the rest come from SINTA's work views, mapped in
 * `sinta/source.py`.
 */
export type CandidateType =
  | "book"
  | "community_service"
  | "intellectual_property"
  | "paper"
  | "profile"
  | "research";

export type CandidateSource = "document" | "manual" | "scholar" | "sinta";

export type CandidateStatus = "completed" | "needs_fix" | "waiting";

/**
 * How a candidate compares against records already held. `new` means nothing
 * comparable was found, so the candidate can only be accepted as a new record.
 */
export type CandidateVerdict =
  | "exact"
  | "new"
  | "possible"
  | "same_identifier"
  | "strong";

export type CandidateMatch = {
  comparisonCount: number;
  score: number | null;
  verdict: CandidateVerdict;
  verdictLabel: string;
};

export type StagedCandidate = {
  details: CandidateDetail[];
  discoveredAt: string;
  discoveredAtLabel: string;
  id: string;
  match: CandidateMatch;
  owner: string;
  researcher: string;
  source: CandidateSource;
  sourceLabel: string;
  sourceUrl: string;
  status: CandidateStatus;
  statusLabel: string;
  title: string;
  type: CandidateType;
  typeLabel: string;
};

export type CandidateSourceTab = {
  count: number;
  id: CandidateSource | "all";
  label: string;
};

export type CandidateSelectOption = {
  label: string;
  value: string;
};

export type NexusScraperResultsContent = {
  acceptNewLabel: string;
  candidates: StagedCandidate[];
  candidatesTitle: string;
  columns: {
    action: string;
    discoveredAt: string;
    match: string;
    owner: string;
    source: string;
    status: string;
    title: string;
    type: string;
  };
  description: string;
  emptyLabel: string;
  mergeLabel: string;
  noMatchLabel: string;
  pageSizeOptions: CandidateSelectOption[];
  paginationLabel: string;
  promoteNote: string;
  rejectLabel: string;
  reviewLabel: string;
  searchLabel: string;
  searchPlaceholder: string;
  sourceTabs: CandidateSourceTab[];
  sourceUrlLabel: string;
  statusFilterLabel: string;
  statusOptions: CandidateSelectOption[];
  title: string;
  typeFilterLabel: string;
  typeOptions: CandidateSelectOption[];
};

type CandidateSeed = Omit<
  StagedCandidate,
  | "details"
  | "discoveredAtLabel"
  | "match"
  | "sourceLabel"
  | "statusLabel"
  | "typeLabel"
> & {
  comparisonCount: number;
  details: Array<{ id: string; label: Record<Locale, string>; value: string }>;
  score: number | null;
  verdict: CandidateVerdict;
};

const dictionary = {
  id: {
    source: {
      document: "Dokumen",
      manual: "Manual",
      scholar: "Google Scholar",
      sinta: "SINTA",
    },
    status: {
      completed: "Selesai ditinjau",
      needs_fix: "Perlu perbaikan",
      waiting: "Menunggu tinjauan",
    },
    type: {
      book: "Buku",
      community_service: "Pengabdian Masyarakat",
      intellectual_property: "Kekayaan Intelektual",
      paper: "Publikasi",
      profile: "Profil",
      research: "Penelitian",
    },
    verdict: {
      exact: "Metadata sama",
      new: "Belum ada pembanding",
      possible: "Sebagian metadata serupa",
      same_identifier: "DOI sama",
      strong: "Kecocokan tinggi",
    },
  },
  en: {
    source: {
      document: "Document",
      manual: "Manual",
      scholar: "Google Scholar",
      sinta: "SINTA",
    },
    status: {
      completed: "Reviewed",
      needs_fix: "Needs fixing",
      waiting: "Awaiting review",
    },
    type: {
      book: "Book",
      community_service: "Community Service",
      intellectual_property: "Intellectual Property",
      paper: "Publication",
      profile: "Profile",
      research: "Research",
    },
    verdict: {
      exact: "Metadata identical",
      new: "No comparison yet",
      possible: "Some metadata similar",
      same_identifier: "Same DOI",
      strong: "High similarity",
    },
  },
} satisfies Record<
  Locale,
  {
    source: Record<CandidateSource, string>;
    status: Record<CandidateStatus, string>;
    type: Record<CandidateType, string>;
    verdict: Record<CandidateVerdict, string>;
  }
>;

const label = (id: string, en: string) => ({ en, id });
const year = (value: string) => ({
  id: "year",
  label: label("Tahun", "Year"),
  value,
});
const venue = (value: string) => ({
  id: "venue",
  label: label("Venue", "Venue"),
  value,
});
const authors = (value: string) => ({
  id: "authors",
  label: label("Penulis", "Authors"),
  value,
});
const doi = (value: string) => ({
  id: "doi",
  label: label("DOI", "DOI"),
  value,
});

const sinta = (path: string) =>
  `https://sinta.kemdiktisaintek.go.id/authors/profile/${path}`;

const candidateSeeds: CandidateSeed[] = [
  {
    comparisonCount: 3,
    details: [
      year("2026"),
      venue("Journal of Medical Internet Research"),
      authors("S. Harimurti, H. Susanti, M. A. Asyraf"),
      doi("10.2196/48213"),
    ],
    discoveredAt: "2026-08-11T08:54",
    id: "paper-telemedicine",
    owner: "Hesty Susanti",
    researcher: "Suksmandhira Harimurti",
    score: 98,
    source: "sinta",
    sourceUrl: "https://doi.org/10.2196/48213",
    status: "waiting",
    title: "Primary Care Telemedicine Adoption in Indonesian District Clinics",
    type: "paper",
    verdict: "same_identifier",
  },
  {
    comparisonCount: 1,
    details: [
      year("2026"),
      venue("Jurnal Teknologi Kesehatan Indonesia"),
      authors("D. Wibisono, S. Harimurti"),
      doi("10.31219/osf.io/3kq7d"),
    ],
    discoveredAt: "2026-08-11T08:52",
    id: "paper-histopathology",
    owner: "Suksmandhira Harimurti",
    researcher: "Suksmandhira Harimurti",
    score: 100,
    source: "sinta",
    sourceUrl: "https://doi.org/10.31219/osf.io/3kq7d",
    status: "waiting",
    title: "Deep Learning untuk Klasifikasi Citra Histopatologi",
    type: "paper",
    verdict: "exact",
  },
  {
    comparisonCount: 1,
    details: [
      year("2025"),
      venue("Seminar Nasional Teknologi Kesehatan"),
      authors("M. Rafi, F. Rahman"),
    ],
    discoveredAt: "2026-08-10T14:20",
    id: "paper-curcumin",
    owner: "Fathur Rahman",
    researcher: "Fathur Rahman",
    score: 93,
    source: "sinta",
    sourceUrl: sinta("6710884?view=scopus"),
    status: "waiting",
    title: "Studi In Silico Turunan Kurkumin sebagai Kandidat Antikanker",
    type: "paper",
    verdict: "strong",
  },
  {
    comparisonCount: 0,
    details: [
      year("2025"),
      {
        id: "scheme",
        label: label("Skema", "Scheme"),
        value: "Penelitian Terapan Unggulan",
      },
      {
        id: "funder",
        label: label("Pemberi dana", "Funder"),
        value: "Kemendiktisaintek",
      },
    ],
    discoveredAt: "2026-08-11T08:55",
    id: "research-biosignal",
    owner: "Suksmandhira Harimurti",
    researcher: "Suksmandhira Harimurti",
    score: null,
    source: "sinta",
    sourceUrl: sinta("6712043?view=researches"),
    status: "waiting",
    title: "Sistem Pemantauan Biosinyal Terintegrasi untuk Layanan Primer",
    type: "research",
    verdict: "new",
  },
  {
    comparisonCount: 0,
    details: [
      year("2025"),
      {
        id: "partner",
        label: label("Mitra", "Partner"),
        value: "Puskesmas Cibiru",
      },
    ],
    discoveredAt: "2026-08-11T08:55",
    id: "service-puskesmas",
    owner: "Dita Puspitasari",
    researcher: "Suksmandhira Harimurti",
    score: null,
    source: "sinta",
    sourceUrl: sinta("6712043?view=services"),
    status: "waiting",
    title: "Pelatihan Pemantauan Biosinyal untuk Tenaga Puskesmas",
    type: "community_service",
    verdict: "new",
  },
  {
    comparisonCount: 2,
    details: [
      year("2026"),
      venue("IEEE Access"),
      authors("N. Rahmawati, H. Susanti"),
      doi("10.1109/ACCESS.2026.3312904"),
    ],
    discoveredAt: "2026-08-09T11:15",
    id: "paper-gait",
    owner: "Hesty Susanti",
    researcher: "Hesty Susanti",
    score: 71,
    source: "scholar",
    sourceUrl: "https://doi.org/10.1109/ACCESS.2026.3312904",
    status: "needs_fix",
    title: "Pemantauan Gait dan Risiko Jatuh Berbasis Sensor",
    type: "paper",
    verdict: "possible",
  },
  {
    comparisonCount: 0,
    details: [
      year("2026"),
      authors("H. Susanti, L. A. Oktaviana"),
      venue("Prosiding Konferensi Nasional Biomedis"),
    ],
    discoveredAt: "2026-08-09T10:02",
    id: "paper-wearable",
    owner: "Laily Ade Oktaviana",
    researcher: "Hesty Susanti",
    score: null,
    source: "scholar",
    sourceUrl: "https://scholar.google.com/citations?user=3xVn7QsAAAAJ",
    status: "waiting",
    title: "Wearable Biosignal Acquisition for Remote Elderly Care",
    type: "paper",
    verdict: "new",
  },
  {
    comparisonCount: 1,
    details: [
      year("2024"),
      {
        id: "publisher",
        label: label("Penerbit", "Publisher"),
        value: "Telkom University Press",
      },
      { id: "isbn", label: label("ISBN", "ISBN"), value: "978-623-8756-11-4" },
    ],
    discoveredAt: "2026-08-10T16:12",
    id: "book-rehabilitasi",
    owner: "Dita Puspitasari",
    researcher: "Dita Puspitasari",
    score: 88,
    source: "sinta",
    sourceUrl: sinta("6698215?view=books"),
    status: "waiting",
    title: "Rehabilitasi Lansia Berbasis Sensor",
    type: "book",
    verdict: "strong",
  },
  {
    comparisonCount: 0,
    details: [
      {
        id: "source-id",
        label: label("ID sumber", "Source ID"),
        value: "6712043",
      },
      {
        id: "institution",
        label: label("Institusi", "Institution"),
        value: "Universitas Telkom",
      },
    ],
    discoveredAt: "2026-08-11T08:53",
    id: "profile-harimurti",
    owner: "Suksmandhira Harimurti",
    researcher: "Suksmandhira Harimurti",
    score: null,
    source: "sinta",
    sourceUrl: sinta("6712043"),
    status: "completed",
    title: "Suksmandhira Harimurti",
    type: "profile",
    verdict: "new",
  },
  {
    comparisonCount: 0,
    details: [
      {
        id: "source-id",
        label: label("ID sumber", "Source ID"),
        value: "6698215",
      },
      {
        id: "institution",
        label: label("Institusi", "Institution"),
        value: "Universitas Telkom",
      },
    ],
    discoveredAt: "2026-08-10T16:10",
    id: "profile-puspitasari",
    owner: "Dita Puspitasari",
    researcher: "Dita Puspitasari",
    score: null,
    source: "sinta",
    sourceUrl: sinta("6698215"),
    status: "completed",
    title: "Dita Puspitasari",
    type: "profile",
    verdict: "new",
  },
  {
    comparisonCount: 2,
    details: [
      year("2026"),
      {
        id: "scheme",
        label: label("Skema", "Scheme"),
        value: "Hibah Penelitian Terapan",
      },
      {
        id: "amount",
        label: label("Nilai dana", "Amount"),
        value: "Rp 185.000.000",
      },
    ],
    discoveredAt: "2026-08-08T09:12",
    id: "document-hibah",
    owner: "Muhammad Ammar Asyraf",
    researcher: "Suksmandhira Harimurti",
    score: 84,
    source: "document",
    sourceUrl: "https://coe-bht.telkomuniversity.ac.id/",
    status: "needs_fix",
    title: "Perjanjian Penugasan Hibah Penelitian 2026",
    type: "research",
    verdict: "strong",
  },
  {
    comparisonCount: 0,
    details: [
      year("2026"),
      { id: "number", label: label("Nomor", "Number"), value: "045/PkM/2026" },
    ],
    discoveredAt: "2026-08-07T15:40",
    id: "document-pengumuman",
    owner: "Muhammad Ammar Asyraf",
    researcher: "Dita Puspitasari",
    score: null,
    source: "document",
    sourceUrl: "https://coe-bht.telkomuniversity.ac.id/",
    status: "waiting",
    title: "Pengumuman Kelulusan Proposal PkM 2026",
    type: "community_service",
    verdict: "new",
  },
  {
    comparisonCount: 1,
    details: [
      year("2025"),
      {
        id: "registration",
        label: label("Nomor pencatatan", "Registration"),
        value: "EC00202511934",
      },
    ],
    discoveredAt: "2026-08-06T13:30",
    id: "ipr-biosignal",
    owner: "Fathur Rahman",
    researcher: "Fathur Rahman",
    score: 62,
    source: "manual",
    sourceUrl: "https://coe-bht.telkomuniversity.ac.id/",
    status: "waiting",
    title: "Perangkat Lunak Akuisisi Biosinyal Nirkabel",
    type: "intellectual_property",
    verdict: "possible",
  },
  {
    comparisonCount: 0,
    details: [
      year("2025"),
      authors("D. Lestari, D. Puspitasari"),
      venue("Jurnal Farmasi Indonesia"),
    ],
    discoveredAt: "2026-08-05T09:45",
    id: "manual-binahong",
    owner: "Dita Puspitasari",
    researcher: "Dita Puspitasari",
    score: null,
    source: "manual",
    sourceUrl: "https://coe-bht.telkomuniversity.ac.id/",
    status: "completed",
    title: "Aktivitas Antibakteri Ekstrak Daun Binahong",
    type: "paper",
    verdict: "new",
  },
];

const resultsCopy = {
  id: {
    acceptNewLabel: "Terima sebagai data baru",
    candidatesTitle: "Antrean Tinjauan",
    columns: {
      action: "Aksi",
      discoveredAt: "Ditemukan",
      match: "Kecocokan",
      owner: "Pemilik",
      source: "Sumber",
      status: "Status",
      title: "Judul",
      type: "Jenis",
    },
    description:
      "Kandidat dari SINTA, Google Scholar, ekstraksi dokumen, dan input manual. Setiap kandidat ditinjau terpisah.",
    emptyLabel: "Tidak ada kandidat yang cocok dengan filter ini.",
    mergeLabel: "Hubungkan ke data resmi",
    noMatchLabel: "Belum ada",
    pageSizeOptions: [
      { label: "5 per halaman", value: "5" },
      { label: "10 per halaman", value: "10" },
      { label: "20 per halaman", value: "20" },
    ],
    paginationLabel: "Navigasi halaman",
    promoteNote: "Data resmi berubah hanya setelah kandidat diterima.",
    rejectLabel: "Tolak",
    reviewLabel: "Rincian",
    searchLabel: "Cari kandidat",
    searchPlaceholder: "Judul, penulis, atau pemilik",
    sourceUrlLabel: "Buka sumber",
    statusFilterLabel: "Status",
    statusOptions: [
      { label: "Semua status", value: "all" },
      { label: "Menunggu tinjauan", value: "waiting" },
      { label: "Perlu perbaikan", value: "needs_fix" },
      { label: "Selesai ditinjau", value: "completed" },
    ],
    title: "Kandidat",
    typeFilterLabel: "Jenis",
    typeOptions: [
      { label: "Semua jenis", value: "all" },
      { label: "Publikasi", value: "paper" },
      { label: "Penelitian", value: "research" },
      { label: "Pengabdian Masyarakat", value: "community_service" },
      { label: "Buku", value: "book" },
      { label: "Kekayaan Intelektual", value: "intellectual_property" },
      { label: "Profil", value: "profile" },
    ],
  },
  en: {
    acceptNewLabel: "Accept as new record",
    candidatesTitle: "Review Queue",
    columns: {
      action: "Action",
      discoveredAt: "Found",
      match: "Match",
      owner: "Owner",
      source: "Source",
      status: "Status",
      title: "Title",
      type: "Type",
    },
    description:
      "Candidates from SINTA, Google Scholar, document extraction, and manual entry. Each candidate is reviewed on its own.",
    emptyLabel: "No candidate matches these filters.",
    mergeLabel: "Link to official record",
    noMatchLabel: "None yet",
    pageSizeOptions: [
      { label: "5 per page", value: "5" },
      { label: "10 per page", value: "10" },
      { label: "20 per page", value: "20" },
    ],
    paginationLabel: "Page navigation",
    promoteNote: "Official data changes only after a candidate is accepted.",
    rejectLabel: "Reject",
    reviewLabel: "Details",
    searchLabel: "Search candidates",
    searchPlaceholder: "Title, author, or owner",
    sourceUrlLabel: "Open source",
    statusFilterLabel: "Status",
    statusOptions: [
      { label: "All statuses", value: "all" },
      { label: "Awaiting review", value: "waiting" },
      { label: "Needs fixing", value: "needs_fix" },
      { label: "Reviewed", value: "completed" },
    ],
    title: "Candidates",
    typeFilterLabel: "Type",
    typeOptions: [
      { label: "All types", value: "all" },
      { label: "Publication", value: "paper" },
      { label: "Research", value: "research" },
      { label: "Community Service", value: "community_service" },
      { label: "Book", value: "book" },
      { label: "Intellectual Property", value: "intellectual_property" },
      { label: "Profile", value: "profile" },
    ],
  },
} satisfies Record<
  Locale,
  Omit<NexusScraperResultsContent, "candidates" | "sourceTabs">
>;

const sourceOrder: CandidateSource[] = [
  "sinta",
  "scholar",
  "document",
  "manual",
];

function buildSourceTabs(locale: Locale): CandidateSourceTab[] {
  const all: CandidateSourceTab = {
    count: candidateSeeds.length,
    id: "all",
    label: locale === "id" ? "Semua" : "All",
  };

  return [
    all,
    ...sourceOrder.map((source) => ({
      count: candidateSeeds.filter((seed) => seed.source === source).length,
      id: source,
      label: dictionary[locale].source[source],
    })),
  ];
}

/**
 * Presentation-ready review queue. Each row keeps its own decision, matching
 * one row of `staging_candidates` and one row of `candidate_decisions`.
 */
export function getNexusScraperResultsContent(
  locale: Locale,
): NexusScraperResultsContent {
  const words = dictionary[locale];

  return {
    ...resultsCopy[locale],
    candidates: candidateSeeds.map((seed) => ({
      details: seed.details.map((detail) => ({
        id: detail.id,
        label: detail.label[locale],
        value: detail.value,
      })),
      discoveredAt: seed.discoveredAt,
      discoveredAtLabel: formatTimestamp(seed.discoveredAt),
      id: seed.id,
      match: {
        comparisonCount: seed.comparisonCount,
        score: seed.score,
        verdict: seed.verdict,
        verdictLabel: words.verdict[seed.verdict],
      },
      owner: seed.owner,
      researcher: seed.researcher,
      source: seed.source,
      sourceLabel: words.source[seed.source],
      sourceUrl: seed.sourceUrl,
      status: seed.status,
      statusLabel: words.status[seed.status],
      title: seed.title,
      type: seed.type,
      typeLabel: words.type[seed.type],
    })),
    sourceTabs: buildSourceTabs(locale),
  };
}
