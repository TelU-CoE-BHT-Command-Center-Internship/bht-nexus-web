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
 * Metadata evaluasi satu indikator: satuan, definisi, cara perhitungan, target
 * periode, eviden, rumah data resmi, dan tanggal bisnis yang menentukan
 * triwulan.
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
  sourceFamily: NexusMonitoringSourceFamily;
  target: NexusIndicatorTarget;
  unit: string;
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
  row: number;
  sourceFamily: NexusMonitoringSourceFamily;
  targetValue: number | null;
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
      sourceFamily: seed.sourceFamily,
      target: {
        reference: `Workbook KM 2026 · Evaluasi 2026 baris ${seed.row}`,
        value: seed.targetValue,
      },
      unit: "Jumlah",
      workbookNote: {
        previousPeriodLabel: "2025",
        previousPeriodValue: seed.previousPeriodValue,
        quarterly: seed.quarterly,
        reference: `Workbook KM 2026 · Evaluasi 2026 baris ${seed.row}`,
      },
    },
  ]),
);

/** Kategori KM yang sudah punya halaman pemantauan sendiri. */
export const NEXUS_MONITORED_CATEGORY: NexusKmIndicatorCategory = "Riset";

export const nexusRisetIndicators: readonly NexusKmIndicator[] =
  nexusKmIndicators.filter(
    (indicator) => indicator.category === NEXUS_MONITORED_CATEGORY,
  );

/**
 * Indikator Riset yang metadata evaluasinya sudah tersedia. Daftar diturunkan
 * dari registry KM kanonis, bukan ditulis ulang, sehingga penambahan indikator
 * pada registry tidak pernah menghasilkan dua kebenaran.
 */
export const nexusRisetEvaluations: readonly NexusIndicatorEvaluation[] =
  nexusRisetIndicators
    .map((indicator) => evaluationById.get(indicator.id))
    .filter((evaluation): evaluation is NexusIndicatorEvaluation =>
      Boolean(evaluation),
    );

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

export function nexusIndicatorHref(id: NexusKmIndicatorId) {
  return `/nexus/monitoring/riset/${nexusIndicatorSlug(id)}`;
}

export const NEXUS_MONITORING_HREF = "/nexus/monitoring";
export const NEXUS_MONITORING_RISET_HREF = "/nexus/monitoring/riset";

/** Seluruh route Monitoring, dipakai kerangka ruang kerja untuk judul halaman. */
export const nexusMonitoringRoutes: readonly string[] = [
  NEXUS_MONITORING_HREF,
  NEXUS_MONITORING_RISET_HREF,
  ...nexusRisetEvaluations.map((evaluation) =>
    nexusIndicatorHref(evaluation.indicator.id),
  ),
];
