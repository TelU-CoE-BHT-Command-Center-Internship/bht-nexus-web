/**
 * Kosakata bidang metadata yang boleh diusulkan lewat alur pelengkapan.
 *
 * Satu kosakata dipakai bersama seluruh rumah data resmi supaya bentuk usulan,
 * aturan pengecualian, dan tampilannya tidak bercabang per domain. Bidang yang
 * maknanya berbeda antar domain memakai kunci berbeda, bukan kunci yang sama
 * dengan arti ganda.
 *
 * Judul, tahun, dan tautan mengikuti metadata pada SRS; kuartil dan nomor
 * pencatatan mengikuti kebutuhan pelaporan KM 2026.
 */
export type MetadataCompletionFieldKey =
  | "applicant"
  | "contractEnd"
  | "contractStart"
  | "documentUrl"
  | "doi"
  | "duration"
  | "evidenceUrl"
  | "eventDate"
  | "funder"
  | "funding"
  | "issue"
  | "issn"
  | "journalVolume"
  | "location"
  | "organization"
  | "pages"
  | "primaryParty"
  | "programStudy"
  | "protectionType"
  | "publicationFrequency"
  | "publisherUrl"
  | "quartile"
  | "registrationNumber"
  | "role"
  | "scheme"
  | "targetGroup"
  | "team"
  | "title"
  | "type"
  | "year";

export type MetadataCompletionResolutionStatus =
  | "not-applicable"
  | "not-available"
  | "provided";

export type MetadataCompletionFieldState =
  | "available"
  | "not-available"
  | "not-applicable"
  | "unresolved";

export type MetadataCompletionResolution = {
  reason: string;
  status: MetadataCompletionResolutionStatus;
  value: string;
};

export type MetadataCompletionResolutions = Partial<
  Record<MetadataCompletionFieldKey, MetadataCompletionResolution>
>;

/**
 * Usulan pelengkapan yang menunggu keputusan Tinjauan. Model ini dimiliki
 * domain pelengkapan, bukan komponen form, agar halaman resmi dan sesi
 * Tinjauan berbagi kontrak data yang sama tanpa saling mengimpor UI.
 */
export type MetadataCompletionProposal = {
  id: string;
  note: string;
  recordId: string;
  resolutions: MetadataCompletionResolutions;
  status: "waiting-review";
  submittedAt: string;
  submittedBy: string;
  submittedByActorId?: string;
};

export type MetadataCompletionFieldConfig = {
  /** Pilihan tetap untuk bidang bertipe `choice`. */
  choices?: readonly string[];
  help: string;
  /** Papan ketik angka pada perangkat sentuh. */
  inputMode?: "numeric";
  key: MetadataCompletionFieldKey;
  maxLength?: number;
  placeholder: string;
  type: "choice" | "text" | "url";
};

/** Tahun paling awal yang masih masuk akal untuk seluruh rekam CoE. */
const EARLIEST_RECORD_YEAR = 1900;

/** Tautan bukti hanya diterima bila lengkap dan memakai HTTPS. */
function isHttpsUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "https:";
  } catch {
    return false;
  }
}

function isIsoDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;

  const date = new Date(`${value}T00:00:00Z`);
  return (
    !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value
  );
}

/**
 * Menyimpan DOI dalam bentuk kanonis tanpa awalan URL atau label `doi:`.
 * Pengguna tetap boleh menempelkan DOI dari address bar; nilai yang masuk ke
 * kandidat selalu mempunyai bentuk yang sama untuk kebutuhan pencocokan.
 */
export function normalizeMetadataCompletionValue(
  key: MetadataCompletionFieldKey,
  value: string,
) {
  const trimmed = value.trim();
  if (key !== "doi") return trimmed;

  return trimmed
    .replace(/^https?:\/\/(?:dx\.)?doi\.org\//i, "")
    .replace(/^doi:\s*/i, "")
    .trim();
}

/**
 * Pesan kesalahan untuk nilai yang diajukan, atau `null` bila sudah sah.
 * Dipakai sebelum konfirmasi supaya nilai yang jelas keliru tidak pernah
 * sampai ke antrean Tinjauan.
 */
export function metadataCompletionValueError(
  key: MetadataCompletionFieldKey,
  value: string,
): string | null {
  const trimmed = normalizeMetadataCompletionValue(key, value);

  if (trimmed.length === 0) return "Nilai belum diisi.";

  if (key === "year") {
    if (!/^\d{4}$/.test(trimmed)) {
      return "Tahun harus berupa empat digit angka, contoh 2026.";
    }

    const year = Number(trimmed);
    const latest = new Date().getFullYear() + 1;

    if (year < EARLIEST_RECORD_YEAR || year > latest) {
      return `Tahun harus antara ${EARLIEST_RECORD_YEAR} dan ${latest}.`;
    }
  }

  if (
    (key === "contractStart" || key === "contractEnd" || key === "eventDate") &&
    !isIsoDate(trimmed)
  ) {
    return "Tanggal harus memakai format YYYY-MM-DD, contoh 2026-08-17.";
  }

  if (
    metadataCompletionFieldConfigs[key].type === "url" &&
    !isHttpsUrl(trimmed)
  ) {
    return "Tautan harus lengkap dan diawali https://.";
  }

  if (key === "quartile" && !/^Q[1-4]$/.test(trimmed)) {
    return "Pilih salah satu kuartil Q1 sampai Q4.";
  }

  if (key === "doi" && !/^10\.\d{4,9}\/\S+$/i.test(trimmed)) {
    return "DOI harus berbentuk 10.xxxx/xxxxx, tanpa spasi.";
  }

  if (
    key === "protectionType" &&
    !metadataCompletionProtectionChoices.some((choice) => choice === trimmed)
  ) {
    return "Pilih salah satu bentuk perlindungan yang tersedia.";
  }

  if (
    key === "type" &&
    !metadataCompletionTypeChoices.some((choice) => choice === trimmed)
  ) {
    return "Pilih salah satu bentuk karya yang tersedia.";
  }

  return null;
}

/**
 * Validasi yang membutuhkan lebih dari satu bidang. Aturan ini dipisahkan
 * dari `metadataCompletionValueError` agar form dan alur perbaikan memakai
 * kaidah tanggal kontrak yang sama.
 */
export function metadataCompletionResolutionSetErrors(
  resolutions: MetadataCompletionResolutions,
) {
  const errors: Partial<Record<MetadataCompletionFieldKey, string>> = {};
  const start = resolutions.contractStart;
  const end = resolutions.contractEnd;

  if (
    start?.status === "provided" &&
    end?.status === "provided" &&
    isIsoDate(start.value) &&
    isIsoDate(end.value) &&
    end.value < start.value
  ) {
    errors.contractEnd =
      "Tanggal selesai tidak boleh lebih awal dari tanggal mulai kontrak.";
  }

  return errors;
}

/**
 * Menjaga batas antara bidang metadata resmi dan bidang kandidat generik.
 * Drawer Tinjauan memakai pemeriksaan ini sebelum menerapkan aturan validasi
 * yang sama dengan form pelengkapan metadata.
 */
export function isMetadataCompletionFieldKey(
  value: string,
): value is MetadataCompletionFieldKey {
  return Object.hasOwn(metadataCompletionFieldConfigs, value);
}

export const metadataCompletionFieldLabels: Record<
  MetadataCompletionFieldKey,
  string
> = {
  applicant: "Nama / unit terkait",
  contractEnd: "Tanggal selesai kontrak",
  contractStart: "Tanggal mulai kontrak",
  doi: "DOI",
  duration: "Lama kegiatan",
  evidenceUrl: "Tautan bukti kegiatan",
  eventDate: "Tanggal kegiatan",
  funder: "Instansi pemberi hibah",
  funding: "Dana tercatat",
  issue: "Nomor terbit",
  issn: "ISSN",
  journalVolume: "Nomor volume",
  location: "Tempat kegiatan",
  organization: "Unit bisnis / komunitas",
  pages: "Halaman / nomor artikel",
  primaryParty: "Pihak utama",
  programStudy: "Program studi",
  documentUrl: "Tautan dokumen pendaftaran",
  protectionType: "Jenis perlindungan",
  publicationFrequency: "Frekuensi terbit",
  publisherUrl: "Tautan penerbit",
  registrationNumber: "Nomor pencatatan",
  role: "Bentuk keterlibatan",
  scheme: "Skema / program",
  targetGroup: "Masyarakat / mitra sasaran",
  team: "Tim pelaksana",
  quartile: "Kuartil jurnal",
  title: "Judul",
  type: "Jenis publikasi",
  year: "Tahun",
};

/** Bentuk perlindungan kekayaan intelektual yang boleh dipilih. */
export const metadataCompletionProtectionChoices = [
  "Hak Cipta",
  "Paten",
  "Merek",
  "Desain Industri",
] as const;

/** Bentuk karya yang boleh dipilih sebagai nilai akhir. */
export const metadataCompletionTypeChoices = [
  "Artikel Jurnal",
  "Makalah Konferensi",
  "Buku / Book Chapter",
] as const;

export const metadataCompletionFieldConfigs: Record<
  MetadataCompletionFieldKey,
  MetadataCompletionFieldConfig
> = {
  applicant: {
    help: "Gunakan nama orang, tim, atau unit persis seperti yang tercatat pada dokumen sumber.",
    key: "applicant",
    placeholder: "Nama orang, tim, atau unit terkait",
    type: "text",
  },
  contractEnd: {
    help: "Gunakan tanggal selesai yang tertulis pada kontrak dengan format YYYY-MM-DD.",
    key: "contractEnd",
    maxLength: 10,
    placeholder: "2026-12-31",
    type: "text",
  },
  contractStart: {
    help: "Gunakan tanggal mulai yang tertulis pada kontrak dengan format YYYY-MM-DD.",
    key: "contractStart",
    maxLength: 10,
    placeholder: "2026-01-01",
    type: "text",
  },
  doi: {
    help: "Masukkan DOI tanpa https://doi.org/. DOI dipakai untuk mengenali publikasi yang sama dari sumber berbeda.",
    key: "doi",
    placeholder: "10.xxxx/xxxxx",
    type: "text",
  },
  duration: {
    help: "Gunakan lama kegiatan yang tercatat pada sumber akademik, misalnya 4 bulan.",
    key: "duration",
    placeholder: "Contoh: 4 bulan",
    type: "text",
  },
  evidenceUrl: {
    help: "Gunakan tautan bukti yang dapat dibuka oleh pemeriksa, misalnya kontrak, proposal, surat tugas, lembar pengesahan, atau berkas laporan.",
    key: "evidenceUrl",
    placeholder: "https://penyimpanan.example/bukti",
    type: "url",
  },
  eventDate: {
    help: "Gunakan tanggal pelaksanaan kegiatan dengan format YYYY-MM-DD.",
    key: "eventDate",
    maxLength: 10,
    placeholder: "2026-09-18",
    type: "text",
  },
  funder: {
    help: "Gunakan nama instansi pemberi hibah sebagaimana tercatat pada proposal atau surat pengumuman.",
    key: "funder",
    placeholder: "Nama instansi pemberi hibah",
    type: "text",
  },
  funding: {
    help: "Gunakan nilai dana persis seperti yang tercatat pada dokumen sumber.",
    key: "funding",
    placeholder: "Contoh: Rp25.000.000",
    type: "text",
  },
  issue: {
    help: "Gunakan volume atau nomor terbit yang ditulis oleh jurnal atau penerbit.",
    key: "issue",
    placeholder: "Contoh: Vol. 31 No. 3",
    type: "text",
  },
  issn: {
    help: "Gunakan ISSN yang tercatat untuk jurnal yang dikelola.",
    key: "issn",
    placeholder: "Contoh: 1234-5678",
    type: "text",
  },
  journalVolume: {
    help: "Gunakan nomor volume jurnal pada periode sumber.",
    key: "journalVolume",
    placeholder: "Contoh: Volume 1",
    type: "text",
  },
  location: {
    help: "Gunakan tempat pelaksanaan yang tercatat pada sumber kegiatan.",
    key: "location",
    placeholder: "Tempat kegiatan",
    type: "text",
  },
  organization: {
    help: "Gunakan nama unit bisnis, UMKM, atau komunitas sesuai jenis rekam.",
    key: "organization",
    placeholder: "Nama unit bisnis atau komunitas",
    type: "text",
  },
  pages: {
    help: "Gunakan rentang halaman atau nomor artikel dari penerbit.",
    key: "pages",
    placeholder: "Contoh: 115–128 atau e10452",
    type: "text",
  },
  primaryParty: {
    help: "Gunakan nama dosen, pembina, pengelola, atau pihak utama yang tercatat pada sumber.",
    key: "primaryParty",
    placeholder: "Nama pihak utama",
    type: "text",
  },
  documentUrl: {
    help: "Gunakan tautan dokumen pendaftaran atau penerimaan yang dapat dibuka oleh pemeriksa. Dokumen yang hanya tersimpan pada penyimpanan internal tidak perlu ditautkan di sini.",
    key: "documentUrl",
    placeholder: "https://penyimpanan.example/dokumen",
    type: "url",
  },
  programStudy: {
    help: "Tulis nama program studi seperti yang tercatat pada data akademik mahasiswa, contoh S2 Teknik Elektro.",
    key: "programStudy",
    placeholder: "Contoh: S1 Teknik Komputer",
    type: "text",
  },
  protectionType: {
    choices: metadataCompletionProtectionChoices,
    help: "Tentukan bentuk perlindungan sesuai dokumen pendaftarannya.",
    key: "protectionType",
    placeholder: "Pilih jenis perlindungan",
    type: "choice",
  },
  publicationFrequency: {
    help: "Gunakan frekuensi terbit jurnal yang tercatat pada sumber.",
    key: "publicationFrequency",
    placeholder: "Contoh: 2 kali per tahun",
    type: "text",
  },
  registrationNumber: {
    help: "Gunakan nomor yang tertera pada bukti pencatatan atau pendaftaran. Indikator KM baru menghitung pengajuan yang sudah memperoleh nomor registrasi.",
    key: "registrationNumber",
    placeholder: "Contoh: REG-2026-001",
    type: "text",
  },
  role: {
    help: "Gunakan bentuk keterlibatan dosen pada unit bisnis sesuai sumber.",
    key: "role",
    placeholder: "Contoh: Anggota",
    type: "text",
  },
  scheme: {
    help: "Gunakan nama skema atau program persis seperti yang tercantum pada kontrak atau proposal.",
    key: "scheme",
    placeholder: "Nama skema atau program",
    type: "text",
  },
  targetGroup: {
    help: "Gunakan masyarakat atau mitra sasaran yang tercatat pada sumber kegiatan.",
    key: "targetGroup",
    placeholder: "Masyarakat atau mitra sasaran",
    type: "text",
  },
  team: {
    help: "Gunakan nama dosen dan tim pelaksana sebagaimana tercatat pada sumber.",
    key: "team",
    placeholder: "Nama tim pelaksana",
    type: "text",
  },
  publisherUrl: {
    help: "Gunakan tautan langsung menuju karya pada situs penerbit. Jika tautan penerbit memang tidak tersedia, gunakan pilihan “Memang tidak tersedia” dan cantumkan sumber alternatif seperti Scopus pada “Sumber atau dasar perubahan”.",
    key: "publisherUrl",
    placeholder: "https://penerbit.example/artikel",
    type: "url",
  },
  quartile: {
    choices: ["Q1", "Q2", "Q3", "Q4"],
    help: "Kuartil tidak tersedia di Google Scholar. Periksa di SCImago (SJR) atau Scopus, lalu cantumkan tautannya pada dasar perubahan.",
    key: "quartile",
    placeholder: "Pilih kuartil",
    type: "choice",
  },
  title: {
    help: "Salin judul persis seperti yang tertulis pada sumber resminya.",
    key: "title",
    placeholder: "Judul lengkap rekam",
    type: "text",
  },
  type: {
    choices: metadataCompletionTypeChoices,
    help: "Tentukan bentuk karya berdasarkan wadah terbitnya. Seri buku yang memuat makalah konferensi perlu diperiksa halaman penerbitnya lebih dulu.",
    key: "type",
    placeholder: "Pilih jenis publikasi",
    type: "choice",
  },
  year: {
    help: "Gunakan tahun yang melekat pada rekam ini, bukan tahun periode evaluasi KM. Isi empat digit angka.",
    inputMode: "numeric",
    key: "year",
    maxLength: 4,
    placeholder: "Contoh: 2026",
    type: "text",
  },
};

export const metadataCompletionResolutionOptions: readonly {
  description: string;
  label: string;
  status: MetadataCompletionResolutionStatus;
}[] = [
  {
    description: "Nilai tersedia pada sumber yang dapat diperiksa.",
    label: "Isi nilai",
    status: "provided",
  },
  {
    description: "Sumber sudah diperiksa dan memang tidak menyediakan nilai.",
    label: "Memang tidak tersedia",
    status: "not-available",
  },
  {
    description: "Bidang ini tidak relevan untuk karya tersebut.",
    label: "Tidak berlaku",
    status: "not-applicable",
  },
];

/**
 * Bidang identitas utama selalu melekat pada jenis rekam yang memakainya.
 * Nilainya bisa belum ditemukan, tetapi tidak pernah "tidak berlaku", jadi
 * pilihan itu tidak ditawarkan agar pengecualian tidak dipakai sebagai jalan
 * pintas. Bidang kontekstual tetap boleh dinyatakan tidak berlaku.
 */
const alwaysApplicableFields: readonly MetadataCompletionFieldKey[] = [
  "applicant",
  "contractEnd",
  "contractStart",
  "documentUrl",
  "duration",
  "evidenceUrl",
  "eventDate",
  "funder",
  "funding",
  "issn",
  "journalVolume",
  "location",
  "organization",
  "primaryParty",
  "programStudy",
  "protectionType",
  "publicationFrequency",
  "quartile",
  "registrationNumber",
  "role",
  "scheme",
  "targetGroup",
  "team",
  "title",
  "type",
  "year",
];

export function metadataCompletionResolutionChoices(
  key: MetadataCompletionFieldKey,
) {
  return alwaysApplicableFields.includes(key)
    ? metadataCompletionResolutionOptions.filter(
        (option) => option.status !== "not-applicable",
      )
    : metadataCompletionResolutionOptions;
}

export const metadataCompletionResolutionLabels: Record<
  MetadataCompletionResolutionStatus,
  string
> = {
  "not-applicable": "Tidak berlaku",
  "not-available": "Memang tidak tersedia",
  provided: "Nilai diajukan",
};

export const metadataCompletionFieldStateLabels: Record<
  MetadataCompletionFieldState,
  string
> = {
  available: "Tersedia",
  "not-applicable": "Tidak berlaku",
  "not-available": "Tidak tersedia",
  unresolved: "Belum diselesaikan",
};

/**
 * Status penyelesaian bukan sinonim dari ketersediaan. Pengecualian yang sudah
 * disetujui tetap membawa arti `tidak tersedia` atau `tidak berlaku`.
 */
export function metadataCompletionFieldState(
  resolutions: MetadataCompletionResolutions | undefined,
  key: MetadataCompletionFieldKey,
  isMissing: boolean,
): MetadataCompletionFieldState {
  if (isMissing) return "unresolved";
  const resolution = resolutions?.[key];
  if (!resolution || resolution.status === "provided") return "available";
  return resolution.status;
}

/**
 * Menampilkan hasil penyelesaian yang sudah disetujui tanpa menghilangkan
 * arti pengecualian. Nilai fallback tetap dipakai untuk rekam lama yang belum
 * mempunyai hasil pelengkapan terstruktur.
 */
export function metadataCompletionResolvedValue(
  resolutions: MetadataCompletionResolutions | undefined,
  key: MetadataCompletionFieldKey,
  fallback: string,
) {
  const resolution = resolutions?.[key];
  if (!resolution) return fallback;
  if (resolution.status === "provided") return resolution.value || fallback;

  return `${metadataCompletionResolutionLabels[resolution.status]} · ${resolution.reason}`;
}

export function createEmptyMetadataCompletionResolution(): MetadataCompletionResolution {
  return { reason: "", status: "provided", value: "" };
}

export function normalizeMetadataCompletionResolution(
  key: MetadataCompletionFieldKey,
  resolution?: MetadataCompletionResolution,
): MetadataCompletionResolution {
  const status = resolution?.status ?? "provided";
  return {
    reason: status === "provided" ? "" : (resolution?.reason.trim() ?? ""),
    status,
    value:
      status === "provided"
        ? normalizeMetadataCompletionValue(key, resolution?.value ?? "")
        : "",
  };
}

export function metadataCompletionProvidedValue(
  resolutions: MetadataCompletionResolutions,
  key: MetadataCompletionFieldKey,
) {
  const resolution = resolutions[key];
  return resolution?.status === "provided" ? resolution.value : undefined;
}

export function areMetadataCompletionResolutionsEqual(
  first: MetadataCompletionResolution,
  second: MetadataCompletionResolution,
) {
  return (
    first.status === second.status &&
    first.value === second.value &&
    first.reason === second.reason
  );
}
