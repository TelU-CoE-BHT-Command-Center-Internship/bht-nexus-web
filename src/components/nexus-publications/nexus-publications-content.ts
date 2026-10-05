import type { ImageProps } from "next/image";
import type { NexusMemberId } from "@/components/nexus-members/nexus-member-identity";
import {
  type MetadataCompletionFieldKey,
  type MetadataCompletionProposal,
  type MetadataCompletionResolutions,
  metadataCompletionFieldLabels,
  metadataCompletionFieldState,
} from "@/components/nexus-metadata-completion/nexus-metadata-completion-model";
import type { NexusOfficialSourceMetadataItem } from "@/components/nexus-workspace-ui/nexus-official-source-metadata";
import type { NexusKmIndicator } from "@/content/nexus-km-indicators";

/**
 * Bentuk karya menurut metadata bibliografis (SRS REQ-FUNC-022 `tipe karya`).
 * Sengaja TIDAK diturunkan dari indikator KM: KM adalah klasifikasi pelaporan,
 * sedangkan tipe adalah sifat karyanya sendiri. Workbook membuktikan keduanya
 * bisa berbeda — definisi KM-13 mencakup book chapter, dan ada baris KM-13
 * yang wadah terbitnya justru prosiding konferensi.
 */
type PublicationType =
  | "Artikel Jurnal"
  | "Belum diklasifikasikan"
  | "Buku / Book Chapter"
  | "Makalah Konferensi";

/**
 * Indikator KM yang luarannya berupa karya publikasi. Dipakai untuk membatasi
 * seed workbook agar salah tulis indikator menjadi kesalahan tipe, bukan diam-diam
 * jatuh ke jenis publikasi default. `OfficialPublication.kmLinks` tetap 0..N dan
 * boleh memuat indikator lain jika kelak memang relevan.
 */
export type PublicationIndicatorId =
  | "KM-11"
  | "KM-12"
  | "KM-13"
  | "KM-14"
  | "KM-33";

type PublicationQuartile = "Q1" | "Q2" | "Q3" | "Q4";

type PublicationQuality = "Lengkap" | "Perlu dilengkapi";

export type PublicationCompletionFieldKey = MetadataCompletionFieldKey;
export type PublicationCompletionResolutions = MetadataCompletionResolutions;

export const publicationCompletionFieldLabels: Record<
  PublicationCompletionFieldKey,
  string
> = metadataCompletionFieldLabels;

export type PublicationMetadataProposal = MetadataCompletionProposal;

export const publicationSourceNames = [
  "Workbook KM 2026",
  "SINTA",
  "Google Scholar",
  "Dokumen",
  "Manual",
] as const;

export type PublicationSourceName = (typeof publicationSourceNames)[number];

type PublicationCitationProvider = "Google Scholar" | "SINTA";

type PublicationAuthor = {
  avatarSrc?: ImageProps["src"];
  id: string;
  initials: string;
  memberId?: NexusMemberId;
  name: string;
};

/**
 * REQ-FUNC-022: pengenal sumber disimpan bersama URL dan waktu pengambilan.
 *
 * - `identifier` menunjuk lokasi persis pada sumbernya, misalnya `no.14!A6:J6`.
 * - `sourceUrl` hanya diisi bila sumbernya memang punya alamat yang dapat
 *   diverifikasi; impor workbook tidak punya, jadi dibiarkan kosong.
 * - `note` merekam ketidakcocokan antar-sumber supaya asal data tetap jujur
 *   setelah beberapa baris direkonsiliasi menjadi satu rekam resmi.
 */
type PublicationProvenance = {
  /** Nama kolom penulis pada sumber, yang belum tentu sama dengan label kanonis. */
  authorColumn?: string;
  capturedAt: string;
  identifier: string;
  note?: string;
  source: PublicationSourceName;
  sourceUrl?: string;
};

/**
 * Keterkaitan rekam resmi dengan indikator KM. Panjangnya boleh nol: sebuah
 * publikasi tetap sah sebagai data resmi walaupun belum dikaitkan dengan
 * indikator mana pun. Klasifikasi KM tidak menentukan keberadaan publikasi.
 */
type PublicationKmLink = {
  indicator: NexusKmIndicator;
  note: string;
};

export type OfficialPublication = {
  authors: PublicationAuthor[];
  citationProvider?: PublicationCitationProvider;
  citationUpdatedAt?: string;
  citations: number | null;
  doi?: string;
  /** DOI, ISBN, atau pengenal resmi lain yang dicatat sumber. */
  identifier?: string;
  /** Periode evaluasi KM tempat rekam ini tercatat, bukan tahun terbit. */
  evaluationPeriod: string;
  id: string;
  issue?: string;
  kmLinks: PublicationKmLink[];
  kpiResolutionStatus?: "not_applicable" | "resolved" | "undetermined";
  missingFields: PublicationCompletionFieldKey[];
  pages?: string;
  provenance: PublicationProvenance[];
  publicId: string;
  /**
   * Triwulan realisasi menurut pelapor atau auditor (1–4). Dipakai hanya bila
   * tanggal bisnis rekam belum tercatat; tanggal selalu lebih menentukan.
   */
  reportedQuarter?: 1 | 2 | 3 | 4;
  /** Asal nilai triwulan dilaporkan, misalnya sel workbook atau koreksi. */
  reportedQuarterSource?: string;
  /**
   * Bulan atau tanggal terbit menurut sumbernya. Hanya sebagian sumber
   * mencatatnya: worksheet KM-12 memuat kolom tanggal publikasi berformat
   * bulan-tahun, sedangkan worksheet KM-11, KM-13, KM-14, dan KM-33 memang
   * tidak punya kolom tanggal sama sekali. Nilainya ditulis `YYYY-MM` ketika
   * sumber hanya mencatat bulannya, supaya hari yang tidak dicatat tidak
   * pernah dikarang. `year` tetap disimpan apa adanya.
   */
  publishedOn?: string;
  publisherUrl?: string;
  quality: PublicationQuality;
  /** Nilai atau pengecualian pelengkapan yang sudah disetujui. */
  resolvedMetadata?: MetadataCompletionResolutions;
  /**
   * Kuartil jurnal kanonis. Hanya terisi untuk artikel jurnal; nilai sumber
   * pada bentuk karya lain tidak dinaikkan menjadi kuartil kanonis.
   */
  quartile?: PublicationQuartile;
  /** `true` hanya untuk artikel jurnal. */
  quartileApplies: boolean;
  /**
   * Nilai kolom Level Jurnal apa adanya. Tetap disimpan walaupun bentuk
   * karyanya bukan artikel jurnal, supaya data sumber tidak hilang tanpa
   * pernah diklaim sebagai kuartil jurnal yang terverifikasi.
   */
  sourceReportedQuartile?: PublicationQuartile;
  /** Metadata khusus jenis yang berasal dari pengajuan dan tidak diwakili bidang kanonis di atas. */
  sourceMetadata?: NexusOfficialSourceMetadataItem[];
  quartileSource?: string;
  review: {
    candidateId: string;
    decision:
      | "Dihubungkan ke rekam resmi"
      | "Disetujui sebagai data baru"
      | "Rekam resmi diperbarui"
      | "Pelengkapan metadata disetujui";
    note: string;
    reviewedAt: string;
    reviewer: string;
  };
  /** Kosong ketika sumber belum mencatat judul karyanya. */
  title: string;
  type: PublicationType;
  /** Waktu rekam resmi dicatat, dipakai bila waktu pembaruan belum tercatat. */
  recordedAt?: string;
  updatedAt: string;
  venue: string;
  /** `undefined` ketika sumber belum mencatat tahun terbit karyanya. */
  year?: number;
};

/**
 * Rekam publikasi sebagaimana ditampilkan halaman Publikasi. Rekam yang dibaca
 * dari server belum membawa keputusan tinjauannya, sehingga bagian itu boleh
 * kosong dan ditampilkan apa adanya.
 */
export type NexusPublicationView = Omit<OfficialPublication, "review"> & {
  review?: OfficialPublication["review"];
};

export type NexusPublicationsContent = {
  description: string;
  officialNote: string;
  title: string;
};

/**
 * Label ringkas untuk kontrol filter. Label KM resmi yang panjang tetap
 * dipakai pada rincian publikasi supaya rujukannya tidak berubah.
 */
export const publicationIndicatorShortLabels: Record<
  PublicationIndicatorId,
  string
> = {
  "KM-11": "Makalah konferensi internasional",
  "KM-12": "Jurnal nasional S1-S4",
  "KM-13": "Jurnal internasional selain Q1/Q2",
  "KM-14": "Jurnal internasional Q1/Q2",
  "KM-33": "Buku / book chapter",
};

/** Judul tampilan untuk rekam yang judulnya belum tercatat di sumber. */
export function publicationDisplayTitle(publication: NexusPublicationView) {
  return publication.title || `Judul belum tercatat · ${publication.venue}`;
}

/**
 * Label kuartil yang dipakai tabel desktop, kartu mobile, dan rincian agar
 * ketiganya tidak pernah menyebut keadaan yang sama dengan istilah berbeda.
 */
export type PublicationQuartileState =
  | "available"
  | "not_available"
  | "not_applicable"
  | "pending_type"
  | "unresolved";

export function publicationQuartileState(
  publication: NexusPublicationView,
): PublicationQuartileState {
  if (publication.type === "Belum diklasifikasikan") return "pending_type";
  if (!publication.quartileApplies) return "not_applicable";
  if (publication.quartile) return "available";

  const state = metadataCompletionFieldState(
    publication.resolvedMetadata,
    "quartile",
    publication.missingFields.includes("quartile"),
  );
  return state === "not-available" ? "not_available" : "unresolved";
}

export function publicationQuartileLabel(publication: NexusPublicationView) {
  const state = publicationQuartileState(publication);
  if (state === "available")
    return publication.quartile ?? "Belum diverifikasi";
  if (state === "not_available") return "Tidak tersedia";
  if (state === "pending_type") return "Belum dapat dinilai";
  if (state === "not_applicable") return "Tidak berlaku";
  return "Belum diverifikasi";
}

export function publicationAuthorNames(publication: NexusPublicationView) {
  return publication.authors.map((author) => author.name).join("; ");
}

/**
 * Structured presentation fixtures for the official-publication workflow.
 * A server adapter can replace this function without changing the page API.
 */
export function getNexusPublicationsContent(): NexusPublicationsContent {
  return {
    description:
      "Seluruh publikasi resmi CoE BHT yang sudah lolos Tinjauan. Semua publikasi masuk tanpa diseleksi lebih dulu; indikator KM dan kuartil adalah klasifikasi untuk pelaporan, bukan syarat sebuah karya tercatat sebagai data resmi.",
    officialNote:
      "Daftar ini hanya memuat rekam resmi. Kandidat yang belum selesai diperiksa tetap berada di Tinjauan.",
    title: "Publikasi",
  };
}
