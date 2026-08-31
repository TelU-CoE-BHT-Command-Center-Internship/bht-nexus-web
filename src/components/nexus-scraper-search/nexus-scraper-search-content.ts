import type { AuditReviewRecord } from "@/components/nexus-audit-review/nexus-audit-review-content";
import { getAutomationStatusLabel } from "@/components/nexus-automation-status/nexus-automation-status-content";
import type { AutomationJobStatus } from "@/components/nexus-automation-status/nexus-automation-status-types";
import type { NexusMemberId } from "@/components/nexus-members/nexus-member-identity";
import { reviewPeople } from "@/components/nexus-review-session/nexus-member-person-binding";
import { nexusReviewActorIds } from "@/components/nexus-review-session/nexus-review-actors";
import type { CollectionMemberBinding } from "@/components/nexus-scraper-search/nexus-collection-identity";
import { formatTimestamp } from "@/components/nexus-workspace-ui/nexus-workspace-format";
import type { Locale } from "@/i18n/locales";

export type CollectionSource = "scholar" | "sinta";

export type CollectionCandidate = Pick<
  AuditReviewRecord,
  | "candidateKind"
  | "category"
  | "categoryLabel"
  | "evidence"
  | "evaluationPeriodLabel"
  | "fields"
  | "id"
  | "kpiLinks"
  | "matches"
  | "memberId"
  | "memberPersonBinding"
  | "owner"
  | "primaryPerson"
  | "provenance"
  | "signal"
  | "subtitle"
  | "title"
  | "typeLabel"
>;

export type CollectionJob = {
  candidates: CollectionCandidate[];
  attempt?: number;
  failureReason?: string;
  fullName: string;
  id: string;
  memberBinding?: CollectionMemberBinding;
  profileUrl: string;
  source: CollectionSource;
  sourceLabel: string;
  status: AutomationJobStatus;
  statusLabel: string;
  submittedAt: string;
  submittedAtLabel: string;
  submittedBy: string;
  submittedByActorId?: string;
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
  reviewHref?: string;
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
  memberId?: NexusMemberId;
  memberPersonIndex?: number;
  memberName?: string;
  owner: string;
  person: string;
  title: string;
  typeLabel?: string;
  sourcePersonId?: string;
  venue: string;
  year: number;
};

function publicationCandidate({
  candidateKind,
  doi,
  id,
  memberId,
  memberPersonIndex,
  memberName,
  owner,
  person,
  title,
  typeLabel = "Artikel jurnal",
  sourcePersonId,
  venue,
  year,
}: PublicationCandidateSeed): CollectionCandidate {
  const authorPeople = reviewPeople("authors", person);
  const memberPerson =
    memberPersonIndex === undefined
      ? undefined
      : authorPeople[memberPersonIndex];
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
    memberId,
    memberPersonBinding:
      memberId && memberPerson && memberName
        ? {
            fieldId: "authors",
            memberId,
            memberName,
            personId: memberPerson.id,
            personName: memberPerson.name,
            sourcePersonId,
          }
        : undefined,
    evidence: [],
    evaluationPeriodLabel: undefined,
    kpiLinks: [],
    matches: [],
    owner,
    primaryPerson: person,
    provenance: {},
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
    memberId: "dr-suksmandhira-harimurti-s-t-m-eng",
    memberName: "Dr. Suksmandhira Harimurti, S.T., M.Eng.",
    memberPersonIndex: 0,
    owner: "CoE BHT",
    person:
      "Suksmandhira Harimurti; M Rivaldi Ali Septian; Khilda Afifah; Estananto",
    title:
      "Design of Electrochemical Biosensor Output Reader through Modelling the Electrochemical Cell System and Designing a 90nm CMOS Transimpedance Amplifier with Self-Biasing",
    typeLabel: "Makalah konferensi",
    sourcePersonId: "6712043",
    venue:
      "International Symposium on Intelligent Signal Processing and Communication Systems (ISPACS)",
    year: 2026,
  }),
  publicationCandidate({
    candidateKind: "new_record",
    id: "COL-SINTA-6712043-PUB-002",
    memberId: "dr-suksmandhira-harimurti-s-t-m-eng",
    memberName: "Dr. Suksmandhira Harimurti, S.T., M.Eng.",
    memberPersonIndex: 1,
    owner: "CoE BHT",
    person:
      "M Rivaldi Ali Septian; Suksmandhira Harimurti; Wahmisari Priharti; Iswahyudi Hidayat; Mohamad Ramdhani",
    title:
      "Publikasi pada ELKOMIKA: Jurnal Teknik Energi Elektrik, Teknik Telekomunikasi, & Teknik Elektronika",
    venue:
      "ELKOMIKA: Jurnal Teknik Energi Elektrik, Teknik Telekomunikasi, & Teknik Elektronika",
    year: 2026,
    sourcePersonId: "6712043",
  }),
];

const hestyCandidates: CollectionCandidate[] = [
  publicationCandidate({
    candidateKind: "new_record",
    id: "COL-SCHOLAR-HESTY-PUB-001",
    memberId: "hesty-susanti",
    memberName: "Dr. Hesty Susanti, S.T., M.T.",
    memberPersonIndex: 1,
    owner: "CoE BHT",
    person: "Liana Nafisa Saftari; Hesty Susanti",
    title:
      "Publikasi pada Indonesian Journal of Electronics, Electromedical Engineering, and Medical Informatics",
    venue:
      "Indonesian Journal of Electronics, Electromedical Engineering, and Medical Informatics",
    year: 2026,
    sourcePersonId: "3xVn7QsAAAAJ",
  }),
];

const seeds = [
  {
    candidates: suksmandhiraCandidates,
    fullName: "Suksmandhira Harimurti",
    id: "sinta-profile-6712043",
    memberBinding: {
      memberId: "dr-suksmandhira-harimurti-s-t-m-eng",
      memberName: "Dr. Suksmandhira Harimurti, S.T., M.Eng.",
      profileUrl: "https://sinta.kemdiktisaintek.go.id/authors/profile/6712043",
      source: "sinta",
      sourcePersonId: "6712043",
    },
    profileUrl: "https://sinta.kemdiktisaintek.go.id/authors/profile/6712043",
    source: "sinta",
    status: "succeeded",
    submittedAt: "2026-08-12T08:54",
    submittedBy: "Pengelola Data",
    submittedByActorId: nexusReviewActorIds.dataSteward,
  },
  {
    candidates: hestyCandidates,
    fullName: "Hesty Susanti",
    id: "scholar-profile-example",
    memberBinding: {
      memberId: "hesty-susanti",
      memberName: "Dr. Hesty Susanti, S.T., M.T.",
      profileUrl: "https://scholar.google.com/citations?user=3xVn7QsAAAAJ",
      source: "scholar",
      sourcePersonId: "3xVn7QsAAAAJ",
    },
    profileUrl: "https://scholar.google.com/citations?user=3xVn7QsAAAAJ",
    source: "scholar",
    status: "succeeded",
    submittedAt: "2026-08-12T08:48",
    submittedBy: "Pengelola Data",
    submittedByActorId: nexusReviewActorIds.dataSteward,
  },
  {
    candidates: [],
    fullName: "Dita Puspitasari",
    id: "sinta-profile-6698215",
    memberBinding: {
      memberId: "dita-puspitasari-s-t-b-sc-m-t",
      memberName: "Dita Puspitasari, S.T., B.Sc., M.T.",
      profileUrl: "https://sinta.kemdiktisaintek.go.id/authors/profile/6698215",
      source: "sinta",
      sourcePersonId: "6698215",
    },
    profileUrl: "https://sinta.kemdiktisaintek.go.id/authors/profile/6698215",
    source: "sinta",
    status: "running",
    submittedAt: "2026-08-12T08:41",
    submittedBy: "Pengelola Data",
    submittedByActorId: nexusReviewActorIds.dataSteward,
  },
  {
    attempt: 3,
    candidates: [],
    failureReason:
      "Profil publik tidak dapat dibaca setelah tiga percobaan. Periksa URL profil lalu ajukan pekerjaan baru.",
    fullName: "Peneliti A",
    id: "sinta-profile-failed-neutral",
    profileUrl: "https://sinta.kemdiktisaintek.go.id/authors/profile/0000000",
    source: "sinta",
    status: "failed_permanently",
    submittedAt: "2026-08-12T08:36",
    submittedBy: "Pengelola Data",
    submittedByActorId: nexusReviewActorIds.dataSteward,
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
      "Submit a public SINTA or Google Scholar profile as a collection job. This page shows candidate results without writing them directly to official data.",
    errorLabel:
      "Enter a name and an HTTPS URL matching the selected SINTA or Google Scholar source.",
    nameLabel: "Researcher name",
    namePlaceholder: "Example: Researcher name",
    noResultsLabel: "No results",
    profileUrlLabel: "Public profile URL",
    profileUrlPlaceholder:
      "https://sinta.kemdiktisaintek.go.id/authors/profile/…",
    queuedLabel: "The collection job was added to the queue.",
    reviewLabel: "Switch to Indonesian to review candidates",
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
