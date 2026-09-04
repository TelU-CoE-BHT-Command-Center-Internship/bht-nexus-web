import {
  kmIndicator,
  type NexusKmIndicator,
  type NexusKmIndicatorCategory,
  type NexusKmIndicatorId,
  nexusKmIndicators,
} from "@/content/nexus-km-indicators";

/**
 * Periode evaluasi yang benar-benar dimodelkan. Tahun lain tidak ditawarkan
 * sebagai pilihan supaya kontrol periode tidak menjanjikan data yang belum ada.
 */
export type NexusEvaluationPeriodId = "2026";

export const NEXUS_EVALUATION_PERIOD: NexusEvaluationPeriodId = "2026";

/** Rumah data resmi tempat realisasi sebuah indikator dibentuk. */
export type NexusMonitoringSourceFamily =
  | "academic"
  | "activities"
  | "contracts"
  | "intellectual-property"
  | "publications";

export type NexusMonitoringSourceHouse = {
  family: NexusMonitoringSourceFamily;
  href: string;
  label: string;
};

export const nexusMonitoringSourceHouses: Record<
  NexusMonitoringSourceFamily,
  NexusMonitoringSourceHouse
> = {
  academic: {
    family: "academic",
    href: "/nexus/akademik",
    label: "Akademik",
  },
  activities: {
    family: "activities",
    href: "/nexus/kegiatan",
    label: "Kegiatan & Pengabdian",
  },
  contracts: {
    family: "contracts",
    href: "/nexus/kontrak-proposal",
    label: "Kontrak & Proposal",
  },
  "intellectual-property": {
    family: "intellectual-property",
    href: "/nexus/kekayaan-intelektual",
    label: "Kekayaan Intelektual",
  },
  publications: {
    family: "publications",
    href: "/nexus/publikasi",
    label: "Publikasi",
  },
};

/**
 * Target sebuah indikator pada satu periode evaluasi. Target adalah milik
 * periode, bukan milik indikator: KM-14 tidak selamanya bertarget 6.
 */
export type NexusIndicatorTarget = {
  /**
   * Tulisan target apa adanya ketika workbook tidak memuat satu angka tunggal,
   * misalnya `9/1M` untuk target yang menggabungkan jumlah dan nilai rupiah.
   * Nilai gabungan tidak pernah dipecah sendiri menjadi angka pembanding.
   */
  literal: string | null;
  /** Lokasi nilai pada workbook KM 2026 sehingga angkanya dapat diperiksa. */
  reference: string;
  value: number | null;
};

/**
 * Nilai yang tercatat pada workbook KM 2026 apa adanya. Nilai ini adalah
 * rujukan sumber, bukan hasil hitung dari data resmi BHT Nexus, sehingga tidak
 * pernah dipakai sebagai realisasi.
 */
export type NexusIndicatorWorkbookNote = {
  previousPeriodLabel: string;
  previousPeriodValue: number | null;
  quarterly: readonly (number | null)[];
  reference: string;
};

/**
 * Eviden yang diminta workbook KM 2026 untuk membuktikan realisasi sebuah
 * indikator. Kolom `Eviden` pada worksheet `List KM` tersedia sebagai kepala
 * kolom, tetapi belum diisi untuk indikator Riset. Ketiadaan itu disampaikan
 * apa adanya; syarat bukti tidak pernah dikarang sendiri.
 */
export type NexusIndicatorEvidence = {
  reference: string;
  value: string | null;
};

/**
 * Cara realisasi sebuah indikator dibentuk dari data resmi. Sebagian besar
 * indikator dihitung sebagai jumlah rekam resmi berkait, tetapi ada indikator
 * yang nilainya bukan jumlah rekam—misalnya KM-30 yang bernilai kapasitas
 * magang, bukan jumlah peserta. Perbedaan itu dinyatakan, bukan dipaksakan.
 */
export type NexusIndicatorRealizationRule =
  | { kind: "record-count" }
  | { kind: "unavailable"; reason: string };

/**
 * Metadata evaluasi satu indikator: satuan, definisi, cara perhitungan, target
 * periode, eviden, rumah data resmi, aturan realisasi, dan tanggal bisnis yang
 * menentukan triwulan.
 *
 * Definisi dan perhitungan ditulis ulang dalam ejaan baku yang setia pada
 * makna kolom `Definisi`, `Tujuan`, dan `Perhitungan Indikator` pada workbook
 * KM 2026; letak barisnya dicantumkan agar tetap dapat ditelusuri.
 */
export type NexusIndicatorEvaluation = {
  businessDateLabel: string;
  calculation: string;
  definition: string;
  evidence: NexusIndicatorEvidence;
  indicator: NexusKmIndicator;
  purpose: string;
  realization: NexusIndicatorRealizationRule;
  sourceFamily: NexusMonitoringSourceFamily;
  target: NexusIndicatorTarget;
  /** Satuan menurut workbook; `null` ketika kolomnya memang belum diisi. */
  unit: string | null;
  workbookNote: NexusIndicatorWorkbookNote;
};

type EvaluationSeed = {
  businessDateLabel: string;
  calculation: string;
  definition: string;
  /** Diisi hanya bila kolom `Eviden` pada `List KM` memang bernilai. */
  evidenceValue?: string;
  id: NexusKmIndicatorId;
  previousPeriodValue: number | null;
  purpose: string;
  quarterly: readonly (number | null)[];
  /** Diisi ketika realisasi indikator tidak boleh dihitung dari jumlah rekam. */
  realizationUnavailableReason?: string;
  row: number;
  sourceFamily: NexusMonitoringSourceFamily;
  /** Tulisan target apa adanya ketika workbook tidak memuat satu angka. */
  targetLiteral?: string;
  targetValue: number | null;
  /** Satuan workbook; dihilangkan berarti mengikuti satuan bawaan `Jumlah`. */
  unitValue?: string | null;
};

const ACADEMIC_EXCELLENCE = "Mengukur academic excellence pusat unggulan.";
const IP_PURPOSE =
  "Mengukur upaya dan kemampuan lembaga melindungi hak kekayaan intelektual dosen.";
const PUBLISHER_REVIEW_PHRASE =
  "yang sekurang-kurangnya sudah masuk tahap penelaahan di penerbit";

const evaluationSeeds: readonly EvaluationSeed[] = [
  {
    businessDateLabel: "Tanggal kegiatan",
    calculation:
      "Jumlah undangan menjadi pembicara pada konferensi internasional selama periode evaluasi.",
    definition:
      "Jumlah undangan menjadi pembicara pada konferensi internasional, baik invited speaker maupun keynote speaker.",
    id: "KM-9",
    previousPeriodValue: 3,
    purpose: ACADEMIC_EXCELLENCE,
    quarterly: [0, 1, null, null],
    row: 15,
    sourceFamily: "activities",
    targetValue: 1,
  },
  {
    businessDateLabel: "Tanggal kunjungan",
    calculation:
      "Jumlah kolaborasi lembaga internasional dengan CoE terkait riset dan akademik, termasuk kunjungan.",
    definition: "Jumlah kunjungan lembaga internasional ke CoE.",
    id: "KM-10",
    previousPeriodValue: 0,
    purpose: ACADEMIC_EXCELLENCE,
    quarterly: [0, 1, null, null],
    row: 16,
    sourceFamily: "activities",
    targetValue: 1,
  },
  {
    businessDateLabel: "Tanggal terbit",
    calculation: `Jumlah makalah konferensi internasional terindeks ${PUBLISHER_REVIEW_PHRASE}.`,
    definition: "Jumlah makalah konferensi internasional terindeks.",
    id: "KM-11",
    previousPeriodValue: 35,
    purpose: ACADEMIC_EXCELLENCE,
    quarterly: [28, 7, null, null],
    row: 17,
    sourceFamily: "publications",
    targetValue: 26,
  },
  {
    businessDateLabel: "Tanggal terbit",
    calculation: `Jumlah publikasi pada jurnal nasional terakreditasi Sinta 1 sampai Sinta 4 ${PUBLISHER_REVIEW_PHRASE}.`,
    definition:
      "Jumlah publikasi pada jurnal nasional terakreditasi Sinta 1 sampai Sinta 4.",
    id: "KM-12",
    previousPeriodValue: 14,
    purpose: ACADEMIC_EXCELLENCE,
    quarterly: [3, 2, null, null],
    row: 18,
    sourceFamily: "publications",
    targetValue: 5,
  },
  {
    businessDateLabel: "Tanggal terbit",
    calculation: `Jumlah publikasi jurnal internasional bereputasi selain Q1/Q2 ${PUBLISHER_REVIEW_PHRASE}.`,
    definition:
      "Jumlah jurnal internasional bereputasi selain Q1/Q2, termasuk book chapter.",
    id: "KM-13",
    previousPeriodValue: 7,
    purpose: ACADEMIC_EXCELLENCE,
    quarterly: [null, null, null, null],
    row: 19,
    sourceFamily: "publications",
    targetValue: 13,
  },
  {
    businessDateLabel: "Tanggal terbit",
    calculation: `Jumlah publikasi jurnal internasional bereputasi setara Q1 atau Q2 ${PUBLISHER_REVIEW_PHRASE}.`,
    definition: "Jumlah jurnal internasional bereputasi setara Q1 atau Q2.",
    id: "KM-14",
    previousPeriodValue: 41,
    purpose: ACADEMIC_EXCELLENCE,
    quarterly: [null, null, null, null],
    row: 20,
    sourceFamily: "publications",
    targetValue: 6,
  },
  {
    businessDateLabel: "Tanggal pengajuan",
    calculation:
      "Jumlah realisasi pengajuan HKI pada tahun berjalan sampai pendaftaran ke Kemenkumham melalui klinik HKI Telkom University, dihitung setelah memperoleh nomor registrasi.",
    definition:
      "Pengajuan HKI yang diakui Kemenkumham dan diperoleh pada tahun berjalan.",
    id: "KM-15",
    previousPeriodValue: 5,
    purpose: IP_PURPOSE,
    quarterly: [null, null, null, null],
    row: 21,
    sourceFamily: "intellectual-property",
    targetValue: 41,
  },
  {
    businessDateLabel: "Tanggal pengajuan",
    calculation:
      "Jumlah realisasi pengajuan paten pada tahun berjalan sampai pendaftaran ke Kemenkumham melalui klinik HKI Telkom University, dihitung setelah memperoleh nomor registrasi.",
    definition: "Pengajuan paten pada tahun berjalan, minimal sudah submit.",
    id: "KM-16",
    previousPeriodValue: 3,
    purpose: IP_PURPOSE,
    quarterly: [0, 1, null, null],
    row: 22,
    sourceFamily: "intellectual-property",
    targetValue: 1,
  },
  {
    businessDateLabel: "Tanggal mulai kontrak",
    calculation:
      "Jumlah realisasi pengajuan kontrak riset pada tingkat nasional.",
    definition: "Pengajuan kontrak riset pada tingkat nasional.",
    id: "KM-17",
    previousPeriodValue: 3,
    purpose:
      "Mengukur kemampuan lembaga menghasilkan kontrak riset tingkat nasional.",
    quarterly: [0, 3, null, null],
    row: 23,
    sourceFamily: "contracts",
    targetValue: 2,
  },
  {
    businessDateLabel: "Tanggal mulai kontrak",
    calculation:
      "Jumlah realisasi pengajuan kontrak riset pada tingkat internasional.",
    definition: "Pengajuan kontrak riset pada tingkat internasional.",
    id: "KM-18",
    previousPeriodValue: 5,
    purpose:
      "Mengukur kemampuan lembaga menghasilkan kontrak riset tingkat internasional.",
    quarterly: [0, 2, null, null],
    row: 24,
    sourceFamily: "contracts",
    targetValue: 3,
  },
  {
    businessDateLabel: "Tanggal mulai kontrak",
    calculation:
      "Jumlah realisasi pengajuan kontrak bisnis untuk komersialisasi produk bersama industri.",
    definition: "Pengajuan kontrak bisnis untuk komersialisasi produk.",
    id: "KM-19",
    previousPeriodValue: 0,
    purpose:
      "Mengukur kemampuan lembaga menghasilkan kontrak bisnis untuk komersialisasi produk bersama industri.",
    quarterly: [null, null, null, null],
    row: 26,
    sourceFamily: "contracts",
    targetValue: 1,
  },
  {
    businessDateLabel: "Tanggal kegiatan",
    calculation:
      "Jumlah keterlibatan dalam unit bisnis yang melayani jasa sesuai kompetensi CoE.",
    definition:
      "Keterlibatan dalam unit bisnis seperti LSP atau start-up yang melayani jasa sesuai kompetensi CoE.",
    id: "KM-20",
    previousPeriodValue: 0,
    purpose:
      "Mengukur kemampuan lembaga mengembangkan unit bisnis yang melayani jasa sesuai kompetensi CoE.",
    quarterly: [null, null, null, null],
    row: 27,
    sourceFamily: "activities",
    targetValue: 1,
  },
  {
    businessDateLabel: "Tanggal kegiatan",
    calculation: "Jumlah UMKM atau komunitas binaan sesuai kompetensi CoE.",
    definition: "UMKM atau komunitas yang dibina CoE.",
    id: "KM-21",
    previousPeriodValue: 0,
    purpose:
      "Mengukur kemampuan lembaga membina UMKM atau komunitas sesuai bidang kompetensi CoE.",
    quarterly: [null, null, null, null],
    row: 28,
    sourceFamily: "activities",
    targetValue: 1,
  },
  {
    businessDateLabel: "Tanggal kegiatan",
    calculation:
      "Jumlah seminar atau konferensi internasional yang meningkat kualitasnya atas peran CoE.",
    definition:
      "Seminar atau konferensi internasional yang meningkat kualitas dan internasionalisasinya.",
    id: "KM-22",
    previousPeriodValue: 0,
    purpose:
      "Mengukur kemampuan lembaga meningkatkan dan menginternasionalisasi seminar atau konferensi internasional.",
    quarterly: [null, null, null, null],
    row: 30,
    sourceFamily: "activities",
    targetValue: 1,
  },
  {
    businessDateLabel: "Tanggal kegiatan",
    calculation:
      "Jumlah kontrak non-riset yang diperoleh CoE pada tahun berjalan.",
    definition:
      "Kontrak non-riset berupa pelatihan, jasa konsultansi, industri, komunitas, pemerintah, dan sejenisnya.",
    id: "KM-23",
    previousPeriodValue: 29,
    purpose: "Mengukur kemampuan lembaga menghasilkan kontrak non-riset.",
    quarterly: [null, null, null, null],
    row: 31,
    sourceFamily: "activities",
    targetLiteral: "9/1M",
    targetValue: null,
    unitValue: "Jumlah/Milyar Rupiah",
  },
  {
    businessDateLabel: "Tanggal kegiatan",
    calculation: "Jumlah pengabdian masyarakat yang terlaksana di CoE.",
    definition:
      "Pengabdian masyarakat berbentuk kolaborasi, CSR, dan sejenisnya yang terlaksana di CoE.",
    id: "KM-24",
    previousPeriodValue: null,
    purpose: "Mengukur kemampuan lembaga melaksanakan pengabdian masyarakat.",
    quarterly: [null, null, null, null],
    row: 32,
    sourceFamily: "activities",
    targetValue: null,
    unitValue: null,
  },
  {
    businessDateLabel: "Tanggal kegiatan",
    calculation:
      "Jumlah proposal pengabdian masyarakat DRTPM yang diajukan CoE pada tahun berjalan.",
    definition: "Proposal pengabdian masyarakat DRTPM yang diajukan CoE.",
    id: "KM-25",
    previousPeriodValue: null,
    purpose:
      "Mengukur kemampuan lembaga mengajukan proposal pengabdian masyarakat DRTPM.",
    quarterly: [null, null, null, null],
    row: 33,
    sourceFamily: "activities",
    targetValue: null,
    unitValue: null,
  },
  {
    businessDateLabel: "Tanggal kegiatan",
    calculation:
      "Jumlah proposal pengabdian masyarakat yang berkaitan dengan SDGs.",
    definition:
      "Proposal pengabdian masyarakat yang berkaitan dengan Sustainable Development Goals.",
    id: "KM-26",
    previousPeriodValue: null,
    purpose:
      "Mengukur kemampuan lembaga mengajukan proposal pengabdian masyarakat yang berkaitan dengan SDGs.",
    quarterly: [null, null, null, null],
    row: 34,
    sourceFamily: "activities",
    targetValue: null,
    unitValue: null,
  },
  {
    businessDateLabel: "Tanggal kegiatan",
    calculation:
      "Jumlah jurnal ilmiah yang dikelola dan meningkat akreditasi atau internasionalisasinya.",
    definition:
      "Jurnal ilmiah yang dikelola CoE dan meningkat akreditasi atau internasionalisasinya.",
    id: "KM-27",
    previousPeriodValue: 1,
    purpose:
      "Mengukur kemampuan lembaga mengelola dan meningkatkan akreditasi jurnal ilmiah.",
    quarterly: [null, null, null, null],
    row: 35,
    sourceFamily: "activities",
    targetValue: 1,
  },
  {
    businessDateLabel: "Tanggal kegiatan",
    calculation:
      "Jumlah bimbingan doktor berbasis riset di CoE setelah tiga tahun.",
    definition: "Bimbingan doktor dengan topik yang berasal dari riset CoE.",
    id: "KM-28",
    previousPeriodValue: 15,
    purpose:
      "Mengukur academic excellence pusat unggulan dalam membimbing mahasiswa doktor dengan topik riset CoE.",
    quarterly: [null, null, null, null],
    row: 37,
    sourceFamily: "academic",
    targetValue: 1,
  },
  {
    businessDateLabel: "Tanggal kegiatan",
    calculation:
      "Jumlah bimbingan magister berbasis riset di CoE setelah tiga tahun.",
    definition: "Bimbingan magister dengan topik yang berasal dari riset CoE.",
    id: "KM-29",
    previousPeriodValue: 44,
    purpose:
      "Mengukur academic excellence pusat unggulan dalam membimbing mahasiswa magister dengan topik riset CoE.",
    quarterly: [null, null, null, null],
    row: 38,
    sourceFamily: "academic",
    targetValue: 2,
  },
  {
    businessDateLabel: "Tanggal kegiatan",
    calculation: "Jumlah kapasitas magang mahasiswa yang tersedia di CoE.",
    definition: "Kapasitas atau daya tampung magang mahasiswa di CoE.",
    id: "KM-30",
    previousPeriodValue: 5,
    purpose:
      "Mengukur kemampuan CoE menyediakan kapasitas magang bagi mahasiswa.",
    quarterly: [null, null, null, null],
    realizationUnavailableReason:
      "Indikator ini bernilai kapasitas magang, bukan jumlah peserta. Rekam peserta magang menjadi bukti operasional dan tidak dijumlahkan menjadi kapasitas.",
    row: 39,
    sourceFamily: "academic",
    targetValue: 18,
  },
  {
    businessDateLabel: "Tanggal kegiatan",
    calculation:
      "Jumlah mahasiswa D3, S1, atau S2 yang melaksanakan riset tugas akhir dengan pembimbing anggota CoE.",
    definition: "Kegiatan riset tugas akhir jenjang D3, S1, atau S2.",
    id: "KM-31",
    previousPeriodValue: null,
    purpose:
      "Mengukur kemampuan CoE membimbing riset tugas akhir jenjang D3, S1, dan S2.",
    quarterly: [null, null, null, null],
    row: 40,
    sourceFamily: "academic",
    targetValue: 84,
  },
  {
    businessDateLabel: "Tanggal kegiatan",
    calculation: "Jumlah ide atau inovasi untuk kompetisi mahasiswa.",
    definition:
      "Ide dan inovasi yang disiapkan untuk mendukung kompetisi mahasiswa.",
    id: "KM-32",
    previousPeriodValue: 5,
    purpose: "Mengukur kemampuan lembaga mendukung kompetisi mahasiswa.",
    quarterly: [null, null, null, null],
    row: 41,
    sourceFamily: "academic",
    targetValue: 2,
  },
  {
    businessDateLabel: "Tanggal terbit",
    calculation: "Jumlah buku yang dihasilkan pada tahun berjalan.",
    definition:
      "Buku ajar, monograf, referensi, dan sejenisnya yang dihasilkan CoE.",
    id: "KM-33",
    previousPeriodValue: 0,
    purpose: "Mengukur kemampuan lembaga menghasilkan buku.",
    quarterly: [null, null, null, null],
    row: 42,
    sourceFamily: "publications",
    targetValue: 1,
  },
  {
    businessDateLabel: "Tanggal mulai kontrak",
    calculation:
      "Jumlah submit proposal riset pada tingkat nasional oleh dosen anggota CoE.",
    definition:
      "Proposal riset yang diajukan pada hibah riset tingkat nasional.",
    id: "KM-37",
    previousPeriodValue: null,
    purpose:
      "Mengukur upaya lembaga menginisiasi kontrak riset pada tingkat nasional.",
    quarterly: [null, null, null, null],
    row: 49,
    sourceFamily: "contracts",
    targetValue: 8,
  },
  {
    businessDateLabel: "Tanggal mulai kontrak",
    calculation:
      "Jumlah submit proposal riset pada tingkat internasional oleh dosen anggota CoE.",
    definition:
      "Proposal riset yang diajukan pada hibah riset tingkat internasional.",
    id: "KM-38",
    previousPeriodValue: null,
    purpose:
      "Mengukur upaya lembaga menginisiasi kontrak riset pada tingkat internasional.",
    quarterly: [null, null, null, null],
    row: 50,
    sourceFamily: "contracts",
    targetValue: 11,
  },
  {
    businessDateLabel: "Tanggal mulai kontrak",
    calculation:
      "Jumlah submit proposal non-riset oleh dosen anggota CoE, termasuk pelatihan, transfer teknologi, jasa konsultasi, dan pengabdian masyarakat.",
    definition:
      "Proposal non-riset berupa pelatihan, transfer teknologi, jasa konsultasi, bentuk hilirisasi keahlian lain, serta pengabdian masyarakat CSR dan DRPM.",
    id: "KM-39",
    previousPeriodValue: null,
    purpose: "Mengukur upaya lembaga menginisiasi kontrak non-riset.",
    quarterly: [null, null, null, null],
    row: 51,
    sourceFamily: "contracts",
    targetValue: 36,
  },
];

const evaluationById = new Map<NexusKmIndicatorId, NexusIndicatorEvaluation>(
  evaluationSeeds.map((seed) => [
    seed.id,
    {
      businessDateLabel: seed.businessDateLabel,
      calculation: seed.calculation,
      definition: seed.definition,
      evidence: {
        reference: "Workbook KM 2026 · List KM kolom Eviden",
        value: seed.evidenceValue ?? null,
      },
      indicator: kmIndicator(seed.id),
      purpose: seed.purpose,
      realization: seed.realizationUnavailableReason
        ? { kind: "unavailable", reason: seed.realizationUnavailableReason }
        : { kind: "record-count" },
      sourceFamily: seed.sourceFamily,
      target: {
        literal: seed.targetLiteral ?? null,
        reference: `Workbook KM 2026 · Evaluasi 2026 baris ${seed.row}`,
        value: seed.targetValue,
      },
      unit: seed.unitValue === undefined ? "Jumlah" : seed.unitValue,
      workbookNote: {
        previousPeriodLabel: "2025",
        previousPeriodValue: seed.previousPeriodValue,
        quarterly: seed.quarterly,
        reference: `Workbook KM 2026 · Evaluasi 2026 baris ${seed.row}`,
      },
    },
  ]),
);

/**
 * Seluruh indikator yang metadata evaluasinya sudah tersedia, mengikuti urutan
 * registry KM kanonis. Daftar diturunkan dari registry, bukan ditulis ulang,
 * sehingga penambahan indikator tidak pernah menghasilkan dua kebenaran.
 */
export const nexusEvaluations: readonly NexusIndicatorEvaluation[] =
  nexusKmIndicators
    .map((indicator) => evaluationById.get(indicator.id))
    .filter((evaluation): evaluation is NexusIndicatorEvaluation =>
      Boolean(evaluation),
    );

/** Indikator satu kategori yang metadata evaluasinya sudah tersedia. */
export function nexusCategoryEvaluations(
  category: NexusKmIndicatorCategory,
): readonly NexusIndicatorEvaluation[] {
  return nexusEvaluations.filter(
    (evaluation) => evaluation.indicator.category === category,
  );
}

/**
 * Kategori KM yang sudah dapat dipantau, yaitu kategori yang seluruh atau
 * sebagian indikatornya sudah mempunyai metadata evaluasi. Urutannya mengikuti
 * registry KM sehingga sama dengan urutan pemilih domain.
 */
export const nexusMonitoredCategories: readonly NexusKmIndicatorCategory[] = [
  ...new Set(
    nexusEvaluations.map((evaluation) => evaluation.indicator.category),
  ),
];

export function nexusCategoryIsMonitored(category: NexusKmIndicatorCategory) {
  return nexusMonitoredCategories.includes(category);
}

export function nexusIndicatorEvaluation(
  id: NexusKmIndicatorId,
): NexusIndicatorEvaluation | undefined {
  return evaluationById.get(id);
}

/** Mengubah segmen route `km-14` menjadi ID indikator kanonis. */
export function nexusIndicatorIdFromSlug(
  slug: string,
): NexusKmIndicatorId | undefined {
  const match = /^km-(\d{1,2})$/.exec(slug.trim().toLocaleLowerCase("id-ID"));
  if (!match) return undefined;

  const candidate = `KM-${Number(match[1])}` as NexusKmIndicatorId;
  return evaluationById.has(candidate) ? candidate : undefined;
}

export function nexusIndicatorSlug(id: NexusKmIndicatorId) {
  return id.toLocaleLowerCase("id-ID");
}

/**
 * Segmen alamat untuk tiap domain KM. Slug ditulis sekali di sini supaya route,
 * tautan, dan pemilih domain memakai pengenal yang sama dan tidak diturunkan
 * dari nama tampilan yang bisa berubah.
 */
const domainSlugs: Record<NexusKmIndicatorCategory, string> = {
  Akademik: "akademik",
  Bisnis: "bisnis",
  Finansial: "finansial",
  Inovasi: "inovasi",
  "Organisasi CoE": "organisasi-coe",
  "Pengabdian Masyarakat": "pengabdian-masyarakat",
  "Pengembangan dan Performansi Sumber Daya": "sumber-daya",
  Proposal: "proposal",
  Riset: "riset",
};

const categoryBySlug = new Map<string, NexusKmIndicatorCategory>(
  Object.entries(domainSlugs).map(([category, slug]) => [
    slug,
    category as NexusKmIndicatorCategory,
  ]),
);

export function nexusDomainSlug(category: NexusKmIndicatorCategory) {
  return domainSlugs[category];
}

/** Mengubah segmen route `pengabdian-masyarakat` menjadi kategori kanonis. */
export function nexusCategoryFromDomainSlug(
  slug: string,
): NexusKmIndicatorCategory | undefined {
  return categoryBySlug.get(slug.trim().toLocaleLowerCase("id-ID"));
}

export const NEXUS_MONITORING_HREF = "/nexus/monitoring";

export function nexusDomainHref(category: NexusKmIndicatorCategory) {
  return `${NEXUS_MONITORING_HREF}/${nexusDomainSlug(category)}`;
}

export function nexusIndicatorHref(id: NexusKmIndicatorId) {
  const evaluation = evaluationById.get(id);
  const category = evaluation?.indicator.category ?? kmIndicator(id).category;
  return `${nexusDomainHref(category)}/${nexusIndicatorSlug(id)}`;
}

/** Seluruh route Monitoring, dipakai kerangka ruang kerja untuk judul halaman. */
export const nexusMonitoringRoutes: readonly string[] = [
  NEXUS_MONITORING_HREF,
  ...nexusMonitoredCategories.map(nexusDomainHref),
  ...nexusEvaluations.map((evaluation) =>
    nexusIndicatorHref(evaluation.indicator.id),
  ),
];
