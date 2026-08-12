import type { ReviewSelectFilter } from "@/components/nexus-review-summary/nexus-review-filters-content";

export type ReviewCandidateSource = "Manual" | "SINTA" | "Scopus";

export type ReviewCandidateStatus =
  | "approved"
  | "needs-fix"
  | "rejected"
  | "waiting";

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

export type ReviewFieldComparison = {
  key: ReviewRecordFieldKey;
  label: string;
  status: ReviewComparisonStatus;
};

export type ReviewTimelineEntry = {
  detail: string;
  id: string;
  label: string;
  timeLabel: string;
  tone: ReviewCandidateStatus | "neutral";
};

export type ReviewMember = {
  name: string;
  portrait: ReviewOwnerPortrait;
  role: string;
};

export type ReviewCandidateRow = {
  comparisons: readonly ReviewFieldComparison[];
  discoveredAt: string;
  discoveredAtIso: string;
  id: string;
  officialRecord: ReviewRecord | null;
  owner: ReviewMember;
  previousIssue?: string;
  publicationType: "Artikel Jurnal" | "Buku / Monograf" | "Prosiding";
  publicationTypeId: ReviewPublicationTypeId;
  record: ReviewRecord;
  relatedMembers: readonly ReviewMember[];
  reviewerNote: string;
  source: ReviewCandidateSource;
  sourceHref?: string;
  status: ReviewCandidateStatus;
  timeline: readonly ReviewTimelineEntry[];
};

export type NexusReviewTableContent = {
  caption: string;
  columns: {
    action: string;
    discoveredAt: string;
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
  selectAllLabel: string;
  selectRowLabel: string;
  totalUnit: string;
};

export const reviewStatusLabels: Record<ReviewCandidateStatus, string> = {
  approved: "Disetujui",
  "needs-fix": "Perlu Perbaikan",
  rejected: "Ditolak",
  waiting: "Menunggu Tinjauan",
};

export const reviewComparisonLabels: Record<ReviewComparisonStatus, string> = {
  different: "Berbeda",
  empty: "Kosong",
  same: "Sama",
  similar: "Mirip",
  unavailable: "Belum ada",
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

const fieldLabels: Record<ReviewRecordFieldKey, string> = {
  abstract: "Abstrak",
  affiliation: "Afiliasi",
  authors: "Penulis",
  doi: "DOI",
  journal: "Jurnal / wadah terbit",
  keywords: "Kata kunci",
  title: "Judul",
  year: "Tahun",
};

const fieldOrder: readonly ReviewRecordFieldKey[] = [
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
  ...Array.from({ length: 46 }, () => "SINTA" as const),
  ...Array.from({ length: 24 }, () => "Scopus" as const),
  ...Array.from({ length: 16 }, () => "Manual" as const),
];

const statusPool: readonly ReviewCandidateStatus[] = [
  ...Array.from({ length: 46 }, () => "waiting" as const),
  ...Array.from({ length: 18 }, () => "needs-fix" as const),
  ...Array.from({ length: 14 }, () => "approved" as const),
  ...Array.from({ length: 8 }, () => "rejected" as const),
];

const sourceLinks: Partial<Record<ReviewCandidateSource, string>> = {
  SINTA: "https://sinta.kemdikbud.go.id/",
  Scopus: "https://www.scopus.com/",
};

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
    return {
      id: "book" as const,
      label: "Buku / Monograf" as const,
    };
  }

  if (index % 5 === 3) {
    return {
      id: "proceeding" as const,
      label: "Prosiding" as const,
    };
  }

  return {
    id: "journal-article" as const,
    label: "Artikel Jurnal" as const,
  };
}

function getComparisonStatus(
  key: ReviewRecordFieldKey,
  candidateValue: string,
  officialValue: string,
): ReviewComparisonStatus {
  if (!officialValue) {
    return "empty";
  }

  if (candidateValue === officialValue) {
    return "same";
  }

  if (key === "authors" || key === "keywords" || key === "abstract") {
    return "similar";
  }

  return "different";
}

function createOfficialRecord(
  record: ReviewRecord,
  index: number,
): ReviewRecord | null {
  if (index % 9 === 8) {
    return null;
  }

  return {
    abstract:
      index % 4 === 0
        ? `${record.abstract} Data resmi saat ini belum memuat rincian metode terbaru.`
        : record.abstract,
    affiliation: index % 6 === 0 ? "Telkom University" : record.affiliation,
    authors:
      index % 3 === 0 ? record.authors.replace(";", "; Dr. ") : record.authors,
    doi: index % 8 === 0 ? "" : record.doi,
    journal: index % 7 === 0 ? "" : record.journal,
    keywords:
      index % 4 === 1
        ? record.keywords.replace(";", "; kesehatan digital;")
        : record.keywords,
    title:
      index % 5 === 0
        ? record.title.replace(" untuk ", ": Pendekatan untuk ")
        : record.title,
    year: index % 10 === 0 ? String(Number(record.year) - 1) : record.year,
  };
}

function createTimeline(
  index: number,
  status: ReviewCandidateStatus,
  discoveredAt: string,
): ReviewTimelineEntry[] {
  const entries: ReviewTimelineEntry[] = [
    {
      detail: "Kandidat masuk ke antrean dan belum mengubah data resmi.",
      id: `timeline-${index + 1}-discovered`,
      label: "Kandidat ditemukan",
      timeLabel: discoveredAt,
      tone: "neutral",
    },
  ];

  if (status === "needs-fix") {
    entries.push({
      detail: "Afiliasi dan DOI perlu diperiksa kembali pada sumber.",
      id: `timeline-${index + 1}-needs-fix`,
      label: "Perbaikan diminta",
      timeLabel: "11 Agu 2026, 09.20 WIB",
      tone: "needs-fix",
    });
  }

  if (status === "approved" || status === "rejected") {
    entries.push({
      detail:
        status === "approved"
          ? "Kandidat disetujui sebagai rekam resmi BHT Nexus."
          : "Kandidat ditolak dan tetap disimpan sebagai riwayat tinjauan.",
      id: `timeline-${index + 1}-${status}`,
      label: status === "approved" ? "Kandidat disetujui" : "Kandidat ditolak",
      timeLabel: "11 Agu 2026, 14.35 WIB",
      tone: status,
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
    abstract: seed.abstract,
    affiliation: seed.affiliation,
    authors: seed.authors,
    doi: `10.26740/bhtnexus.${year}.${String(index + 101).padStart(4, "0")}`,
    journal: seed.journal,
    keywords: seed.keywords,
    title:
      suffix === 0 ? seed.title : `${seed.title}: Studi Seri ${suffix + 1}`,
    year: String(year),
  };
  const officialRecord = createOfficialRecord(record, index);
  const comparisons: ReviewFieldComparison[] = fieldOrder.map((key) => ({
    key,
    label: fieldLabels[key],
    status: officialRecord
      ? getComparisonStatus(key, record[key], officialRecord[key])
      : "unavailable",
  }));
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
      : status === "approved"
        ? "Metadata utama sesuai dengan bukti sumber dan rekam resmi."
        : status === "rejected"
          ? "Judul mengarah ke karya yang berbeda dari pemilik terpilih."
          : "";

  return {
    comparisons,
    discoveredAt,
    discoveredAtIso,
    id: `candidate-${String(index + 1).padStart(3, "0")}`,
    officialRecord,
    owner,
    previousIssue:
      status === "needs-fix"
        ? "Catatan sebelumnya: afiliasi kedua belum konsisten dan DOI belum dapat diverifikasi."
        : undefined,
    publicationType: publicationType.label,
    publicationTypeId: publicationType.id,
    record,
    relatedMembers,
    reviewerNote,
    source,
    sourceHref: sourceLinks[source],
    status,
    timeline: createTimeline(index, status, discoveredAt),
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
      owner: "Pemilik",
      publicationType: "Jenis",
      source: "Sumber",
      status: "Status",
      title: "Judul / Entitas",
    },
    defaultPageSize: pageSizeFilter.defaultValue,
    nextPageLabel: "Halaman berikutnya",
    openCandidateLabel: "Buka rincian kandidat",
    pageLabel: "Halaman",
    pageSizeFilter,
    previousPageLabel: "Halaman sebelumnya",
    rangePrefix: "Menampilkan",
    rows,
    selectAllLabel: "Pilih semua kandidat pada halaman ini",
    selectRowLabel: "Pilih kandidat",
    totalUnit: "data",
  };
}
