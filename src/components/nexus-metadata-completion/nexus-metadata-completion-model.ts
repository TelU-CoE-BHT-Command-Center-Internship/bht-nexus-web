/**
 * Bidang metadata kanonis yang boleh diusulkan lewat alur pelengkapan.
 *
 * Daftar ini mengikuti metadata publikasi pada SRS (judul, tahun, DOI,
 * penomoran terbit, dan tautan sumber resmi) lalu diperluas oleh kebutuhan
 * pelaporan KM 2026 (kuartil jurnal). Workbook KM memperkaya daftar ini,
 * bukan menggantikannya.
 */
export type MetadataCompletionFieldKey =
  | "doi"
  | "issue"
  | "pages"
  | "publisherUrl"
  | "quartile"
  | "title"
  | "type"
  | "year";

export type MetadataCompletionResolutionStatus =
  | "not-applicable"
  | "not-available"
  | "provided";

export type MetadataCompletionResolution = {
  reason: string;
  status: MetadataCompletionResolutionStatus;
  value: string;
};

export type MetadataCompletionResolutions = Partial<
  Record<MetadataCompletionFieldKey, MetadataCompletionResolution>
>;

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

/** Tahun terbit paling awal yang masih masuk akal untuk arsip CoE. */
const EARLIEST_PUBLICATION_YEAR = 1900;

/**
 * Pesan kesalahan untuk nilai yang diajukan, atau `null` bila sudah sah.
 * Dipakai sebelum konfirmasi supaya nilai yang jelas keliru tidak pernah
 * sampai ke antrean Tinjauan.
 */
export function metadataCompletionValueError(
  key: MetadataCompletionFieldKey,
  value: string,
): string | null {
  const trimmed = value.trim();

  if (trimmed.length === 0) return "Nilai belum diisi.";

  if (key === "year") {
    if (!/^\d{4}$/.test(trimmed)) {
      return "Tahun terbit harus berupa empat digit angka, contoh 2026.";
    }

    const year = Number(trimmed);
    const latest = new Date().getFullYear() + 1;

    if (year < EARLIEST_PUBLICATION_YEAR || year > latest) {
      return `Tahun terbit harus antara ${EARLIEST_PUBLICATION_YEAR} dan ${latest}.`;
    }
  }

  if (key === "quartile" && !/^Q[1-4]$/.test(trimmed)) {
    return "Pilih salah satu kuartil Q1 sampai Q4.";
  }

  if (
    key === "type" &&
    !metadataCompletionTypeChoices.some((choice) => choice === trimmed)
  ) {
    return "Pilih salah satu bentuk karya yang tersedia.";
  }

  return null;
}

export const metadataCompletionFieldLabels: Record<
  MetadataCompletionFieldKey,
  string
> = {
  doi: "DOI",
  issue: "Nomor terbit",
  pages: "Halaman / nomor artikel",
  publisherUrl: "Tautan penerbit",
  quartile: "Kuartil jurnal",
  title: "Judul publikasi",
  type: "Jenis publikasi",
  year: "Tahun terbit",
};

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
  doi: {
    help: "Masukkan DOI tanpa https://doi.org/. DOI dipakai untuk mengenali publikasi yang sama dari sumber berbeda.",
    key: "doi",
    placeholder: "10.xxxx/xxxxx",
    type: "text",
  },
  issue: {
    help: "Gunakan volume atau nomor terbit yang ditulis oleh jurnal atau penerbit.",
    key: "issue",
    placeholder: "Contoh: Vol. 31 No. 3",
    type: "text",
  },
  pages: {
    help: "Gunakan rentang halaman atau nomor artikel dari penerbit.",
    key: "pages",
    placeholder: "Contoh: 115–128 atau e10452",
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
    help: "Salin judul persis seperti yang tertulis pada halaman penerbit.",
    key: "title",
    placeholder: "Judul lengkap artikel",
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
    help: "Gunakan tahun terbit karya, bukan tahun periode evaluasi KM. Isi empat digit angka.",
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
 * Judul, tahun terbit, dan jenis publikasi selalu ada pada sebuah karya.
 * Nilainya bisa belum ditemukan, tetapi tidak pernah "tidak berlaku", jadi
 * pilihan itu tidak ditawarkan agar pengecualian tidak dipakai sebagai jalan
 * pintas. Bidang lain tetap boleh dinyatakan tidak berlaku, termasuk kuartil
 * yang memang tidak dimiliki setiap jurnal.
 */
const alwaysApplicableFields: readonly MetadataCompletionFieldKey[] = [
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

export function createEmptyMetadataCompletionResolution(): MetadataCompletionResolution {
  return { reason: "", status: "provided", value: "" };
}

export function normalizeMetadataCompletionResolution(
  resolution?: MetadataCompletionResolution,
): MetadataCompletionResolution {
  return {
    reason: resolution?.reason.trim() ?? "",
    status: resolution?.status ?? "provided",
    value: resolution?.value.trim() ?? "",
  };
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
