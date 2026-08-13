import type { ReviewSelectFilter } from "@/components/nexus-review-summary/nexus-review-filters-content";

export type ReviewCandidateSource =
  | "Dokumen"
  | "Google Scholar"
  | "Manual"
  | "SINTA";

export type ReviewCandidateStatus = "completed" | "needs-fix" | "waiting";

export type ReviewDecision = "approved-new" | "merged" | "rejected";

export type ReviewStatusChangeContext = {
  decision?: ReviewDecision;
  detail?: string;
  label?: string;
};

export type ReviewOwnerPortrait =
  | "ammar"
  | "dita"
  | "fathur"
  | "hesty"
  | "laily"
  | "salsabila"
  | "suksmandhira";

export type ReviewPublicationTypeId = "book" | "journal-article" | "proceeding";

export type ReviewRecordFieldKey =
  | "abstract"
  | "affiliation"
  | "authors"
  | "doi"
  | "journal"
  | "keywords"
  | "title"
  | "year";

export type ReviewRecord = Record<ReviewRecordFieldKey, string>;

export type ReviewComparisonStatus =
  | "different"
  | "empty"
  | "same"
  | "similar"
  | "unavailable";

export type ReviewMatchVerdict =
  | "exact"
  | "new"
  | "possible"
  | "same-identifier"
  | "strong";

export type ReviewFieldComparison = {
  key: ReviewRecordFieldKey;
  label: string;
  score: number;
  status: ReviewComparisonStatus;
};

export type ReviewRevisionChange = {
  currentValue: string;
  key: ReviewRecordFieldKey;
  label: string;
  previousValue: string;
};

export type ReviewRevisionSubmission = {
  changes: readonly ReviewRevisionChange[];
  note: string;
  submittedAt: string;
  submittedBy: string;
  version: string;
};

export type ReviewTimelineEntry = {
  actor: string;
  candidateVersion: string;
  detail: string;
  id: string;
  label: string;
  timeLabel: string;
  tone: ReviewCandidateStatus | ReviewDecision | "neutral";
};

export type ReviewMember = {
  name: string;
  portrait: ReviewOwnerPortrait;
  role: string;
};

export type ReviewProvenance = {
  attemptId: string;
  href?: string;
  id: string;
  jobId: string;
  kind: "document" | "manual" | "official" | "scraper";
  label: string;
  parserVersion: string;
  responseHash: string;
  retrievedAt: string;
  sourceKey: string;
};

export type ReviewEvidence = {
  documentName: string;
  id: string;
  page: number;
  quote: string;
};

export type ReviewOfficialMatch = {
  basis: string;
  comparisons: readonly ReviewFieldComparison[];
  id: string;
  officialRecord: ReviewRecord;
  score: number;
  sources: readonly ReviewProvenance[];
  updatedAt: string;
  verdict: Exclude<ReviewMatchVerdict, "new">;
};

export type ReviewDuplicateAssessment = {
  basis: string;
  explanation: string;
  highestScore: number;
  matchCount: number;
  verdict: ReviewMatchVerdict;
};

export type ReviewCandidateRow = {
  decision?: ReviewDecision;
  discoveredAt: string;
  discoveredAtIso: string;
  duplicateAssessment: ReviewDuplicateAssessment;
  evidence: readonly ReviewEvidence[];
  id: string;
  latestRevision?: ReviewRevisionSubmission;
  matches: readonly ReviewOfficialMatch[];
  owner: ReviewMember;
  previousIssue?: string;
  provenance: readonly ReviewProvenance[];
  publicationType: "Artikel Jurnal" | "Buku / Monograf" | "Prosiding";
  publicationTypeId: ReviewPublicationTypeId;
  record: ReviewRecord;
  relatedMembers: readonly ReviewMember[];
  reviewerNote: string;
  source: ReviewCandidateSource;
  status: ReviewCandidateStatus;
  timeline: readonly ReviewTimelineEntry[];
  version: string;
};

export type NexusReviewTableContent = {
  caption: string;
  columns: {
    action: string;
    discoveredAt: string;
    duplicateRisk: string;
    owner: string;
    publicationType: string;
    source: string;
    status: string;
    title: string;
  };
  defaultPageSize: string;
  nextPageLabel: string;
  openCandidateLabel: string;
  pageLabel: string;
  pageSizeFilter: ReviewSelectFilter;
  previousPageLabel: string;
  rangePrefix: string;
  rows: readonly ReviewCandidateRow[];
  totalUnit: string;
};

export const reviewStatusLabels: Record<ReviewCandidateStatus, string> = {
  completed: "Selesai Ditinjau",
  "needs-fix": "Perlu Perbaikan",
  waiting: "Menunggu Tinjauan",
};

export const reviewDecisionLabels: Record<ReviewDecision, string> = {
  "approved-new": "Disetujui sebagai data baru",
  merged: "Dihubungkan ke rekam resmi",
  rejected: "Ditolak",
};

export const reviewComparisonLabels: Record<ReviewComparisonStatus, string> = {
  different: "Berbeda",
  empty: "Kosong",
  same: "Sama",
  similar: "Serupa",
  unavailable: "Tidak tersedia",
};

export const reviewMatchVerdictLabels: Record<ReviewMatchVerdict, string> = {
  exact: "Metadata tampak sama",
  new: "Belum ada pembanding",
  possible: "Sebagian metadata serupa",
  "same-identifier": "DOI sama",
  strong: "Kecocokan metadata tinggi",
};

const owners: readonly ReviewMember[] = [
  { name: "Dr. Hesty Susanti", portrait: "hesty", role: "Ketua CoE BHT" },
  {
    name: "Dr. Suksmandhira H.",
    portrait: "suksmandhira",
    role: "Koordinator riset",
  },
  {
    name: "Salsabila Aurellia",
    portrait: "salsabila",
    role: "Pengelola data",
  },
  { name: "Fathur Rahman", portrait: "fathur", role: "Pengelola publikasi" },
  {
    name: "Laily Ade Oktaviana",
    portrait: "laily",
    role: "Pengelola administrasi",
  },
  { name: "Dita Puspitasari", portrait: "dita", role: "Reviewer internal" },
  {
    name: "Muhammad Ammar A.",
    portrait: "ammar",
    role: "Admin / Pimpinan",
  },
];

type CandidateSeed = {
  abstract: string;
  affiliation: string;
  authors: string;
  journal: string;
  keywords: string;
  title: string;
};

const candidateSeeds: readonly CandidateSeed[] = [
  {
    abstract:
      "Studi ini mengevaluasi nanoemulsi minyak habbatussauda sebagai intervensi pendamping pada model diabetes dan mengamati perubahan penanda inflamasi.",
    affiliation: "Telkom University; Universitas Padjadjaran",
    authors: "Muhammad Ammar Asyraf; Rahmawati N.; Hesty Susanti",
    journal: "Indonesian Journal of Biomedical Engineering",
    keywords: "nanoemulsi; diabetes; TNF-alpha; inflamasi",
    title:
      "Nanoemulsi Minyak Habbatussauda terhadap Ekspresi TNF-alpha pada Model Tikus Diabetes",
  },
  {
    abstract:
      "Model klasifikasi citra histopatologi dikembangkan untuk membantu skrining kanker payudara dan diuji menggunakan data teranotasi dari dua fasilitas kesehatan.",
    affiliation: "Telkom University; Rumah Sakit Hasan Sadikin",
    authors: "Dimas Wibisono; Suksmandhira Harimurti; Rina Kartika",
    journal: "Journal of Medical Imaging and Health Informatics",
    keywords: "deep learning; histopatologi; kanker payudara; klasifikasi",
    title:
      "Deep Learning untuk Klasifikasi Citra Histopatologi Kanker Payudara",
  },
  {
    abstract:
      "Hidrogel kitosan diformulasikan untuk menjaga kelembapan luka dan mendukung penyembuhan pada kondisi diabetes melalui pengujian karakteristik fisik dan biologis.",
    affiliation: "Telkom University",
    authors: "Rina Kartika; Salsabila Aurellia; Mira Sari",
    journal: "Jurnal Teknologi Kesehatan Indonesia",
    keywords: "hidrogel; kitosan; luka diabetes; biomaterial",
    title: "Formulasi Hidrogel Berbasis Kitosan untuk Luka Diabetes",
  },
  {
    abstract:
      "Penapisan komputasional digunakan untuk mengidentifikasi kandidat turunan kurkumin yang berpotensi menghambat protein target utama.",
    affiliation: "Telkom University; Universiti Teknologi Malaysia",
    authors: "Muhammad Rafi; Fathur Rahman; Andi Kurniawan",
    journal: "Proceedings of Biomedical Engineering and Informatics",
    keywords: "in silico; kurkumin; molecular docking; inhibitor",
    title:
      "Studi In Silico Turunan Kurkumin sebagai Kandidat Inhibitor Protease",
  },
  {
    abstract:
      "Biosensor graphene dikembangkan untuk mendeteksi perubahan kadar glukosa melalui pengukuran elektrokimia yang ringkas dan berbiaya rendah.",
    affiliation: "Telkom University",
    authors: "Siti Aisyah; Laily Ade Oktaviana; Dewa Nugroho",
    journal: "BHT Nexus Working Paper Series",
    keywords: "biosensor; graphene; glukosa; elektrokimia",
    title: "Pengembangan Biosensor Berbasis Graphene untuk Deteksi Glukosa",
  },
  {
    abstract:
      "Aktivitas antibakteri ekstrak daun binahong dievaluasi terhadap bakteri uji dengan membandingkan beberapa konsentrasi ekstrak.",
    affiliation: "Telkom University; Universitas Indonesia",
    authors: "Dewi Lestari; Dita Puspitasari; Naufal Hidayat",
    journal: "Jurnal Farmasi dan Sains Biomedis",
    keywords: "binahong; antibakteri; Escherichia coli; ekstrak",
    title:
      "Aktivitas Antibakteri Ekstrak Daun Binahong terhadap Escherichia coli",
  },
  {
    abstract:
      "Kajian ini merangkum perkembangan penyuntingan gen pada sel punca mesenkimal beserta peluang dan batasan etik penerapannya.",
    affiliation: "Telkom University",
    authors: "Andi Kurniawan; Muhammad Ammar Asyraf; Puspita Wulandari",
    journal: "Monograf Teknologi Biomedis CoE BHT",
    keywords: "CRISPR-Cas9; sel punca; penyuntingan gen; etika",
    title: "CRISPR-Cas9 pada Sel Punca Mesenkimal: Tinjauan Sistematis",
  },
  {
    abstract:
      "Sistem wearable memantau pola langkah dan keseimbangan untuk mengenali perubahan risiko jatuh pada kelompok lanjut usia.",
    affiliation: "Telkom University; University of Wollongong",
    authors: "Nadia Rahmawati; Hesty Susanti; Farhan Akbar",
    journal: "International Journal of Assistive Technology",
    keywords: "wearable; gait; risiko jatuh; rehabilitasi",
    title: "Pemantauan Gait dan Risiko Jatuh Berbasis Sensor Wearable",
  },
  {
    abstract:
      "Sinyal elektrokardiogram dianalisis untuk mengenali pola aritmia dengan model yang dapat menjelaskan fitur utama pada setiap prediksi.",
    affiliation: "Telkom University",
    authors: "Rizky Hidayat; Suksmandhira Harimurti; Maya Sari",
    journal: "Biomedical Signal Processing Review",
    keywords: "elektrokardiogram; aritmia; explainable AI; biosignal",
    title:
      "Deteksi Aritmia dari Sinyal Elektrokardiogram dengan Explainable AI",
  },
  {
    abstract:
      "Citra fundus disegmentasi untuk membantu identifikasi awal lesi retinopati diabetik pada layanan kesehatan dengan sumber daya terbatas.",
    affiliation: "Telkom University; RS Mata Cicendo",
    authors: "Puspita Wulandari; Dita Puspitasari; Ahmad Pratama",
    journal: "Journal of Digital Health Innovation",
    keywords: "retinopati diabetik; segmentasi; citra fundus; skrining",
    title: "Segmentasi Lesi Retinopati Diabetik untuk Mendukung Skrining Dini",
  },
];

export const reviewRecordFieldLabels: Record<ReviewRecordFieldKey, string> = {
  abstract: "Abstrak",
  affiliation: "Afiliasi",
  authors: "Penulis",
  doi: "DOI",
  journal: "Jurnal / wadah terbit",
  keywords: "Kata kunci",
  title: "Judul",
  year: "Tahun",
};

export const reviewRecordFieldOrder: readonly ReviewRecordFieldKey[] = [
  "title",
  "authors",
  "journal",
  "year",
  "doi",
  "affiliation",
  "keywords",
  "abstract",
];

const sourcePool: readonly ReviewCandidateSource[] = [
  ...Array.from({ length: 34 }, () => "SINTA" as const),
  ...Array.from({ length: 24 }, () => "Google Scholar" as const),
  ...Array.from({ length: 16 }, () => "Manual" as const),
  ...Array.from({ length: 12 }, () => "Dokumen" as const),
];

const statusPool: readonly ReviewCandidateStatus[] = [
  ...Array.from({ length: 46 }, () => "waiting" as const),
  ...Array.from({ length: 18 }, () => "needs-fix" as const),
  ...Array.from({ length: 22 }, () => "completed" as const),
];

function formatDiscoveryDate(date: Date) {
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
    timeZone: "UTC",
    year: "numeric",
  })
    .format(date)
    .replaceAll(".", "");
}

function getPublicationType(index: number) {
  if (index % 11 === 10) {
    return { id: "book" as const, label: "Buku / Monograf" as const };
  }

  if (index % 5 === 3) {
    return { id: "proceeding" as const, label: "Prosiding" as const };
  }

  return { id: "journal-article" as const, label: "Artikel Jurnal" as const };
}

function createProvenance(
  index: number,
  source: ReviewCandidateSource | "BHT Nexus",
  suffix: string,
): ReviewProvenance {
  const isOfficial = source === "BHT Nexus";
  const kind = isOfficial
    ? "official"
    : source === "Dokumen"
      ? "document"
      : source === "Manual"
        ? "manual"
        : "scraper";

  return {
    attemptId: `ATT-${String(index + 81).padStart(5, "0")}-${suffix}`,
    id: `provenance-${index}-${suffix}`,
    jobId: isOfficial
      ? `SYNC-OFF-${String(index + 41).padStart(5, "0")}`
      : `JOB-ING-${String(index + 71).padStart(5, "0")}`,
    kind,
    label: source,
    parserVersion: kind === "document" ? "rag-parser 0.8.2" : "metadata 2.4.1",
    responseHash: `sha256:${(index + 1147).toString(16).padStart(8, "0")}…${suffix}`,
    retrievedAt: `${10 - (index % 4)} Agu 2026, ${String(8 + (index % 7)).padStart(2, "0")}.20 WIB`,
    sourceKey: `publication:${index + 1041}:${suffix.toLowerCase()}`,
  };
}

function getComparisonStatus(
  key: ReviewRecordFieldKey,
  candidateValue: string,
  officialValue: string,
): ReviewComparisonStatus {
  if (!candidateValue) {
    return "unavailable";
  }

  if (!officialValue) {
    return "empty";
  }

  if (candidateValue === officialValue) {
    return "same";
  }

  if (
    key === "authors" ||
    key === "keywords" ||
    key === "abstract" ||
    key === "title"
  ) {
    return "similar";
  }

  return "different";
}

const comparisonScores: Record<ReviewComparisonStatus, number> = {
  different: 38,
  empty: 0,
  same: 100,
  similar: 86,
  unavailable: 0,
};

export function buildReviewFieldComparisons(
  candidate: ReviewRecord,
  official: ReviewRecord,
): ReviewFieldComparison[] {
  return reviewRecordFieldOrder.map((key) => {
    const status = getComparisonStatus(key, candidate[key], official[key]);

    return {
      key,
      label: reviewRecordFieldLabels[key],
      score: comparisonScores[status],
      status,
    };
  });
}

function createOfficialRecord(
  record: ReviewRecord,
  variant: "exact" | "possible" | "same-identifier" | "strong",
  rank: number,
): ReviewRecord {
  if (variant === "exact") {
    return { ...record };
  }

  if (variant === "same-identifier") {
    return {
      ...record,
      abstract: rank === 0 ? "" : record.abstract,
      affiliation: rank === 0 ? "Telkom University" : record.affiliation,
      authors: record.authors.replace(";", "; Dr. "),
      keywords:
        rank === 0
          ? record.keywords.split(";").slice(0, 3).join(";")
          : record.keywords,
    };
  }

  if (variant === "strong") {
    return {
      ...record,
      authors: record.authors.replace(";", "; Dr. "),
      doi: rank === 0 ? "" : record.doi.replace("bhtnexus", "bht-index"),
      title:
        rank === 0
          ? record.title.replace(" untuk ", ": Pendekatan untuk ")
          : record.title,
    };
  }

  return {
    ...record,
    abstract: "",
    affiliation: "Telkom University",
    authors: record.authors.split(";").slice(0, 2).join(";"),
    doi: "",
    journal: record.journal.replace("Journal", "Proceedings"),
    keywords: record.keywords.split(";").slice(0, 2).join(";"),
    title: record.title.replace(" untuk ", " pada "),
    year: String(Number(record.year) - 1),
  };
}

function createMatch(
  record: ReviewRecord,
  index: number,
  rank: number,
  verdict: Exclude<ReviewMatchVerdict, "new">,
  score: number,
): ReviewOfficialMatch {
  const officialRecord = createOfficialRecord(record, verdict, rank);

  return {
    basis:
      verdict === "exact"
        ? "Seluruh metadata yang dinormalisasi identik."
        : verdict === "same-identifier"
          ? "DOI identik, tetapi beberapa metadata berbeda atau belum tersedia."
          : verdict === "strong"
            ? "Judul dan penulis sangat mirip pada tahun publikasi yang sama."
            : "Sebagian judul dan penulis mirip; verifikasi manual diperlukan.",
    comparisons: buildReviewFieldComparisons(record, officialRecord),
    id: `PUB-${record.year}-${String(index * 3 + rank + 4567).padStart(5, "0")}`,
    officialRecord,
    score,
    sources: [
      createProvenance(index + rank, "BHT Nexus", `M${rank + 1}`),
      ...(rank === 0
        ? [createProvenance(index + rank + 1, "SINTA", `M${rank + 1}B`)]
        : []),
    ],
    updatedAt: `${8 + (index % 3)} Agu 2026, 16.10 WIB`,
    verdict,
  };
}

function createMatches(
  record: ReviewRecord,
  index: number,
): ReviewOfficialMatch[] {
  const hasDoi = record.doi.trim().length > 0;

  switch (index % 8) {
    case 0:
      return [
        createMatch(
          record,
          index,
          0,
          hasDoi ? "same-identifier" : "strong",
          hasDoi ? 98 : 96,
        ),
        createMatch(record, index, 1, "strong", 91),
        createMatch(record, index, 2, "possible", 76),
      ];
    case 1:
      return [createMatch(record, index, 0, "exact", 100)];
    case 2:
      return [
        createMatch(record, index, 0, "strong", 95),
        createMatch(record, index, 1, "possible", 78),
      ];
    case 3:
      return [createMatch(record, index, 0, "strong", 93)];
    case 4:
      return [createMatch(record, index, 0, "possible", 72)];
    case 6:
      return [
        createMatch(
          record,
          index,
          0,
          hasDoi ? "same-identifier" : "strong",
          hasDoi ? 97 : 94,
        ),
        createMatch(record, index, 1, "possible", 80),
      ];
    default:
      return [];
  }
}

function createAssessment(
  matches: readonly ReviewOfficialMatch[],
): ReviewDuplicateAssessment {
  const topMatch = matches[0];

  if (!topMatch) {
    return {
      basis:
        "Belum ada rekam resmi terkait yang disertakan untuk dibandingkan.",
      explanation:
        "Periksa kelengkapan kandidat dan sumbernya sebelum menentukan apakah data ini dapat diterima sebagai rekam baru.",
      highestScore: 0,
      matchCount: 0,
      verdict: "new",
    };
  }

  return {
    basis: topMatch.basis,
    explanation:
      topMatch.verdict === "exact"
        ? "Metadata yang dibandingkan tampak sama. Pastikan konteks karya dan sumbernya sebelum memilih keputusan."
        : topMatch.verdict === "same-identifier"
          ? "DOI yang sama ditemukan pada rekam resmi. Periksa perbedaan metadata dan sumber sebelum menghubungkannya."
          : `${matches.length} rekam resmi terkait tersedia untuk diperiksa; sinyal ini bukan keputusan duplikasi.`,
    highestScore: topMatch.score,
    matchCount: matches.length,
    verdict: topMatch.verdict,
  };
}

function createTimeline(
  index: number,
  status: ReviewCandidateStatus,
  discoveredAt: string,
  decision?: ReviewDecision,
): ReviewTimelineEntry[] {
  const entries: ReviewTimelineEntry[] = [
    {
      actor: "Sistem ingest",
      candidateVersion: "v1",
      detail: "Kandidat masuk ke antrean dan belum mengubah data resmi.",
      id: `timeline-${index + 1}-discovered`,
      label: "Kandidat ditemukan",
      timeLabel: discoveredAt,
      tone: "neutral",
    },
  ];

  if (status === "needs-fix") {
    entries.push({
      actor: "Dita Puspitasari",
      candidateVersion: "v1",
      detail: "Afiliasi dan DOI perlu diperiksa kembali pada sumber.",
      id: `timeline-${index + 1}-needs-fix`,
      label: "Perbaikan diminta",
      timeLabel: "11 Agu 2026, 09.20 WIB",
      tone: "needs-fix",
    });
  }

  if (status === "completed" && decision) {
    entries.push({
      actor: "Muhammad Ammar Asyraf",
      candidateVersion: "v1",
      detail:
        decision === "rejected"
          ? "Kandidat ditolak dan tetap disimpan bersama sumber serta riwayat keputusannya."
          : decision === "merged"
            ? "Kandidat dihubungkan ke rekam resmi tanpa membuat publikasi resmi kedua."
            : "Kandidat disetujui sebagai rekam resmi baru bersama bukti sumbernya.",
      id: `timeline-${index + 1}-${decision}`,
      label: reviewDecisionLabels[decision],
      timeLabel: "11 Agu 2026, 14.35 WIB",
      tone: decision,
    });
  }

  return entries;
}

function createCandidate(index: number): ReviewCandidateRow {
  const seed = candidateSeeds[index % candidateSeeds.length];
  const suffix = Math.floor(index / candidateSeeds.length);
  const publicationType = getPublicationType(index);
  const year = 2026 - (index % 3);
  const source = sourcePool[(index * 31) % sourcePool.length];
  const status = statusPool[(index * 37) % statusPool.length];
  const discoveredDate = new Date(Date.UTC(2026, 7, 10 - index));
  const discoveredAtIso = discoveredDate.toISOString().slice(0, 10);
  const discoveredAt = formatDiscoveryDate(discoveredDate);
  const record: ReviewRecord = {
    abstract: index % 9 === 7 ? "" : seed.abstract,
    affiliation: index % 8 === 4 ? "" : seed.affiliation,
    authors: seed.authors,
    doi:
      index % 7 === 4
        ? ""
        : `10.26740/bhtnexus.${year}.${String(index + 101).padStart(4, "0")}`,
    journal: seed.journal,
    keywords: seed.keywords,
    title:
      suffix === 0 ? seed.title : `${seed.title}: Studi Seri ${suffix + 1}`,
    year: String(year),
  };
  const matches = createMatches(record, index);
  const decision: ReviewDecision | undefined =
    status === "completed"
      ? index % 3 === 0
        ? "rejected"
        : matches.length > 0
          ? "merged"
          : "approved-new"
      : undefined;
  const owner = owners[index % owners.length];
  const relatedMembers = [
    owner,
    owners[(index + 2) % owners.length],
    owners[(index + 4) % owners.length],
  ].filter(
    (member, memberIndex, members) =>
      members.findIndex((candidate) => candidate.name === member.name) ===
      memberIndex,
  );
  const reviewerNote =
    status === "needs-fix"
      ? "Mohon lengkapi afiliasi penulis dan pastikan DOI sama dengan halaman sumber."
      : status === "completed" && decision !== "rejected"
        ? "Metadata utama, pembanding, dan bukti sumber sudah diperiksa sebelum keputusan dicatat."
        : decision === "rejected"
          ? "Judul mengarah ke karya yang berbeda dari pemilik terpilih."
          : "";

  return {
    discoveredAt,
    discoveredAtIso,
    decision,
    duplicateAssessment: createAssessment(matches),
    evidence:
      source === "Dokumen"
        ? [
            {
              documentName: "Laporan Sistem BHT Nexus 2026.pdf",
              id: `evidence-${index}`,
              page: 18 + (index % 4),
              quote: `Publikasi ${record.title} dicantumkan bersama nama penulis dan tahun terbit.`,
            },
          ]
        : [],
    id: `TJV-2026-${String(index + 71).padStart(5, "0")}`,
    matches,
    owner,
    previousIssue:
      status === "needs-fix"
        ? "Catatan sebelumnya: afiliasi kedua belum konsisten dan DOI belum dapat diverifikasi."
        : undefined,
    provenance: [createProvenance(index, source, "C1")],
    publicationType: publicationType.label,
    publicationTypeId: publicationType.id,
    record,
    relatedMembers,
    reviewerNote,
    source,
    status,
    timeline: createTimeline(index, status, discoveredAt, decision),
    version: "v1",
  };
}

const rows: readonly ReviewCandidateRow[] = Array.from(
  { length: 86 },
  (_, index) => createCandidate(index),
);

const pageSizeFilter: ReviewSelectFilter = {
  defaultValue: "10",
  id: "page-size",
  label: "Jumlah data per halaman",
  options: [
    { label: "10 / halaman", value: "10" },
    { label: "20 / halaman", value: "20" },
    { label: "50 / halaman", value: "50" },
  ],
};

/**
 * Serializable fixture contract for the frontend-only review milestone. A
 * server adapter can later provide this same shape without changing the page
 * composition or interaction components.
 */
export function getNexusReviewTableContent(): NexusReviewTableContent {
  return {
    caption: "Daftar kandidat data yang perlu ditinjau",
    columns: {
      action: "Aksi",
      discoveredAt: "Ditemukan",
      duplicateRisk: "Sinyal kecocokan",
      owner: "Pemilik",
      publicationType: "Jenis",
      source: "Sumber",
      status: "Status",
      title: "Judul / Entitas",
    },
    defaultPageSize: pageSizeFilter.defaultValue,
    nextPageLabel: "Halaman berikutnya",
    openCandidateLabel: "Tinjau kandidat",
    pageLabel: "Halaman",
    pageSizeFilter,
    previousPageLabel: "Halaman sebelumnya",
    rangePrefix: "Menampilkan",
    rows,
    totalUnit: "data",
  };
}
