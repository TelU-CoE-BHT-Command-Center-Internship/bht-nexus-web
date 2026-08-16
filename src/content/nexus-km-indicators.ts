export type NexusKmIndicatorCategory =
  | "Akademik"
  | "Bisnis"
  | "Finansial"
  | "Inovasi"
  | "Organisasi CoE"
  | "Pengabdian Masyarakat"
  | "Pengembangan dan Performansi Sumber Daya"
  | "Proposal"
  | "Riset";

type NexusKmIndicatorEntry = readonly [
  id: `KM-${number}`,
  number: number,
  label: string,
  category: NexusKmIndicatorCategory,
];

/**
 * Label indikator diambil dari `List KM!C6:C59`. Whitespace pada batas dan
 * line break dinormalisasi, sedangkan ejaan serta tanda baca sumber dijaga.
 * Metadata formula, unit, dan periode baru akan dimodelkan saat halaman
 * Monitoring/Evaluasi KM memang membutuhkannya.
 */
const indicatorDefinitions = [
  ["KM-1", 1, "Research Income", "Finansial"],
  [
    "KM-2",
    2,
    "Operating Ratio & Cash Collection Telkom University (Common Indikator)",
    "Finansial",
  ],
  ["KM-3", 3, "Penyerapan RKA Total CoE", "Finansial"],
  ["KM-4", 4, "Penyerapan RKA Pengembangan CoE", "Finansial"],
  ["KM-5", 5, "Pendapatan dari Inovasi", "Finansial"],
  ["KM-6", 6, "Pendapatan Hibah Eskternal di luar DRPM dan LPDP", "Finansial"],
  [
    "KM-7",
    7,
    "Revenue generating dari inovasi yang memiliki HKI atau dari spin-off/startup",
    "Finansial",
  ],
  [
    "KM-8",
    8,
    "Revenue generating (Riset, Non-Riset, Komersialisasi, dll)",
    "Finansial",
  ],
  [
    "KM-9",
    9,
    "Pembicara undangan (invited/ keynote speaker) pada konferensi internasional",
    "Riset",
  ],
  ["KM-10", 10, "Kunjungan lembaga internasional ke CoE", "Riset"],
  ["KM-11", 11, "Makalah Konferensi internasional", "Riset"],
  ["KM-12", 12, "Publikasi ilmiah dalam jurnal nasional S1 s. d. S4", "Riset"],
  [
    "KM-13",
    13,
    "Publikasi jurnal internasional bereputasi selain Q1/ Q2",
    "Riset",
  ],
  [
    "KM-14",
    14,
    "Publikasi jurnal internasional bereputasi setara Q1/ Q2",
    "Riset",
  ],
  ["KM-15", 15, "HKI", "Riset"],
  ["KM-16", 16, "Paten (minimal submit)", "Riset"],
  ["KM-17", 17, "Kontrak riset pada tingkat nasional", "Riset"],
  ["KM-18", 18, "Kontrak riset pada tingkat internasional", "Riset"],
  ["KM-19", 19, "Kontrak bisnis untuk komersialisasi", "Bisnis"],
  [
    "KM-20",
    20,
    "Keterlibatan dalam unit bisnis (LSP, start-up, dll.) yang melayani jasa sesuai kompetensi CoE",
    "Bisnis",
  ],
  ["KM-21", 21, "Pembinaan UMKM/ komunitas", "Bisnis"],
  [
    "KM-22",
    22,
    "Pengelolaan dan peningkatan/ internasionalisasi seminar/ konferensi internasional",
    "Pengabdian Masyarakat",
  ],
  [
    "KM-23",
    23,
    "Kontrak non-riset (pelatihan, jasa konsultansi, industri, komunitas, pemerintah, dll.)",
    "Pengabdian Masyarakat",
  ],
  [
    "KM-24",
    24,
    "Community services (kolaborasi, CSR, dll.)",
    "Pengabdian Masyarakat",
  ],
  ["KM-25", 25, "Proposal abdimas DRTPM", "Pengabdian Masyarakat"],
  [
    "KM-26",
    26,
    "Proposal abdimas yang berkaitan dengan SDGs",
    "Pengabdian Masyarakat",
  ],
  [
    "KM-27",
    27,
    "Pengelolaan dan peningkatan/internasionalisasi akreditasi jurnal ilmiah",
    "Pengabdian Masyarakat",
  ],
  ["KM-28", 28, "Bimbingan doktor dengan topik dari riset CoE", "Akademik"],
  ["KM-29", 29, "Bimbingan magister dengan topik dari riset CoE", "Akademik"],
  ["KM-30", 30, "Kapasitas magang mahasiswa", "Akademik"],
  ["KM-31", 31, "Kegiatan riset tugas akhir D3/ S1/ S2", "Akademik"],
  ["KM-32", 32, "Ide & Inovasi untuk kompetisi mahasiswa", "Akademik"],
  ["KM-33", 33, "Buku (buku ajar, monograf, referensi, dll.)", "Akademik"],
  ["KM-34", 34, "Produk berbasis sumber daya dalam negeri", "Inovasi"],
  ["KM-35", 35, "Produk yang dilisensikan", "Inovasi"],
  [
    "KM-36",
    36,
    "Jumlah Pegawai yang Mengikuti dan Menuntaskan Kewajiban Peningkatan kompetensi SDM",
    "Pengembangan dan Performansi Sumber Daya",
  ],
  [
    "KM-37",
    37,
    "Jumlah submit proposal riset pada tingkat nasional",
    "Proposal",
  ],
  [
    "KM-38",
    38,
    "Jumlah submit proposal riset pada tingkat internasional",
    "Proposal",
  ],
  [
    "KM-39",
    39,
    "Jumlah submit proposal non riset (pelatihan, transfer teknologi, jasa konsultasi atau bentuk hilirisasi keahlian lainnya, abdimas CSR, abdimas DRPM)",
    "Proposal",
  ],
  ["KM-40", 40, "Roadmap Penelitian dan Roadmap Lembaga", "Organisasi CoE"],
  [
    "KM-41",
    41,
    "Tata Kelola. Adanya dokumen-dokumen acuan untuk tata kelola internal CoE dan penerapannya.",
    "Organisasi CoE",
  ],
  ["KM-42", 42, "Website", "Organisasi CoE"],
  ["KM-43", 43, "Kelengkapan Sarpras", "Organisasi CoE"],
  ["KM-44", 44, "Produktivitas Riset (jumlah ketua riset)", "Organisasi CoE"],
  [
    "KM-45",
    45,
    "Produktivitas Publikasi (jumlah First/Corresponding Author)",
    "Organisasi CoE",
  ],
  ["KM-46", 46, "Spektrum/Keberagaman Skema", "Organisasi CoE"],
] as const satisfies readonly NexusKmIndicatorEntry[];

export type NexusKmIndicatorId = (typeof indicatorDefinitions)[number][0];

export type NexusKmIndicator = {
  category: NexusKmIndicatorCategory;
  id: NexusKmIndicatorId;
  label: string;
  number: number;
};

export const nexusKmIndicators: readonly NexusKmIndicator[] =
  indicatorDefinitions.map(([id, number, label, category]) => ({
    category,
    id,
    label,
    number,
  }));

const indicatorById = new Map<NexusKmIndicatorId, NexusKmIndicator>(
  nexusKmIndicators.map((indicator) => [indicator.id, indicator]),
);

export function kmIndicator(id: NexusKmIndicatorId): NexusKmIndicator {
  const indicator = indicatorById.get(id);

  if (!indicator) {
    throw new Error(`Indikator KM tidak dikenal: ${id}`);
  }

  return indicator;
}
