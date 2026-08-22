import {
  type MetadataCompletionFieldKey,
  type MetadataCompletionProposal,
  type MetadataCompletionResolutions,
  metadataCompletionAvailabilityLabel,
  metadataCompletionFieldLabels,
} from "@/components/nexus-metadata-completion/nexus-metadata-completion-model";
import type { NexusOfficialSourceMetadataItem } from "@/components/nexus-workspace-ui/nexus-official-source-metadata";
import { personInitials } from "@/components/nexus-workspace-ui/nexus-workspace-format";
import {
  kmIndicator,
  type NexusKmIndicator,
} from "@/content/nexus-km-indicators";

type AcademicIndicatorId = "KM-28" | "KM-29" | "KM-30" | "KM-31" | "KM-32";

type AcademicActivity =
  | "Bimbingan Doktor"
  | "Bimbingan Magister"
  | "Magang Mahasiswa"
  | "Kompetisi Mahasiswa"
  | "Riset Tugas Akhir";

type AcademicQuality = "Lengkap" | "Perlu dilengkapi";

export type AcademicCompletionFieldKey = MetadataCompletionFieldKey;

export const academicFieldLabels = metadataCompletionFieldLabels;

export type AcademicProposal = MetadataCompletionProposal;

type AcademicMentor = {
  id: string;
  initials: string;
  name: string;
};

type AcademicProvenance = {
  capturedAt: string;
  identifier: string;
  note?: string;
  source: string;
};

type AcademicKmLink = {
  indicator: NexusKmIndicator;
  note: string;
};

/**
 * Bukti internal ada, tetapi URL-nya tidak boleh dipublikasikan. Keadaan itu
 * berbeda dari bukti yang memang belum tercatat.
 */
type AcademicEvidenceStatus = "internal" | "public" | "unrecorded";

export type OfficialAcademicRecord = {
  activity: AcademicActivity;
  /** Lama kegiatan hanya relevan untuk magang. */
  duration?: string;
  /** Periode evaluasi KM, bukan tahun kegiatan. */
  evaluationPeriod: string;
  evidenceNote: string;
  evidenceStatus: AcademicEvidenceStatus;
  evidenceUrl?: string;
  id: string;
  kmLinks: AcademicKmLink[];
  mentors: AcademicMentor[];
  missingFields: AcademicCompletionFieldKey[];
  /** Penanda netral; identitas mahasiswa disediakan server sesuai hak akses. */
  participantCode: string;
  programStudy?: string;
  provenance: AcademicProvenance[];
  publicId: string;
  quality: AcademicQuality;
  /** Nilai atau pengecualian pelengkapan yang sudah disetujui. */
  resolvedMetadata?: MetadataCompletionResolutions;
  review: {
    candidateId: string;
    decision:
      | "Dihubungkan ke rekam resmi"
      | "Disetujui sebagai data baru"
      | "Pelengkapan metadata disetujui";
    note: string;
    reviewedAt: string;
    reviewer: string;
  };
  /** Metadata khusus jenis yang berasal dari pengajuan dan tidak diwakili bidang kanonis di atas. */
  sourceMetadata?: NexusOfficialSourceMetadataItem[];
  title: string;
  updatedAt: string;
  /** `undefined` ketika sumber belum mencatat tahun kegiatan. */
  year?: number;
};

export type NexusAcademicContent = {
  description: string;
  officialNote: string;
  records: OfficialAcademicRecord[];
  title: string;
  updatedAt: string;
};

const capturedAt = "14 Agu 2026";
const evaluationPeriod = "2026";

const kmLinkNotes: Record<AcademicIndicatorId, string> = {
  "KM-28":
    "Bimbingan doktor dihitung ketika topik disertasinya berasal dari riset CoE dan bukti bimbingannya tersedia.",
  "KM-29":
    "Bimbingan magister dihitung ketika topik tesisnya berasal dari riset CoE dan bukti bimbingannya tersedia.",
  "KM-30":
    "Rekam peserta magang menjadi bukti operasional. Nilai KM-30 tetap berupa kapasitas atau daya tampung magang, bukan jumlah mahasiswa aktif.",
  "KM-31":
    "Riset tugas akhir dicatat bersama mahasiswa, program studi, pembimbing, topik, dan bukti kegiatan.",
  "KM-32":
    "Ide atau inovasi kompetisi mahasiswa dicatat bersama kegiatan, dosen pembimbing, dan bukti pendukung.",
};

const evidenceNotes: Record<AcademicEvidenceStatus, string> = {
  internal:
    "Bukti kegiatan tersimpan pada penyimpanan internal dan hanya tersedia untuk pengguna yang berwenang.",
  public: "Bukti kegiatan dapat dibuka melalui tautan yang tercatat.",
  unrecorded: "Sumber belum mencatat bukti kegiatan untuk rekam ini.",
};

type AcademicSeed = {
  activity: AcademicActivity;
  duration?: string;
  evidenceStatus: AcademicEvidenceStatus;
  evidenceUrl?: string;
  indicatorId?: AcademicIndicatorId;
  mentors: readonly string[];
  participantCode: string;
  programStudy?: string;
  publicId: string;
  sources: readonly AcademicProvenance[];
  title?: string;
  year?: number;
};

/**
 * Struktur bidang mengikuti kebutuhan workbook KM 2026, tetapi nilai kegiatan
 * operasional sengaja netral karena repository ini publik. Jumlah record cukup
 * untuk menguji setiap jenjang, data lengkap, data kosong, bukti internal,
 * beberapa pembimbing, dan kegiatan yang belum mempunyai kaitan indikator.
 */
const seeds: readonly AcademicSeed[] = [
  {
    activity: "Bimbingan Doktor",
    evidenceStatus: "internal",
    indicatorId: "KM-28",
    mentors: ["Pembimbing A", "Pembimbing B"],
    participantCode: "Mahasiswa A",
    programStudy: "S3 Teknik Elektro",
    publicId: "AKD-2026-0001",
    sources: [
      {
        capturedAt,
        identifier: "AKD-SRC-001",
        source: "Data akademik",
      },
      {
        capturedAt,
        identifier: "AKD-SRC-002",
        note: "Sumber kedua mencatat kegiatan yang sama dengan pembimbing pendamping. Keduanya disatukan tanpa menghapus jejak sumber.",
        source: "Data akademik",
      },
    ],
    title: "Topik Riset Doktor A",
  },
  {
    activity: "Bimbingan Doktor",
    evidenceStatus: "unrecorded",
    indicatorId: "KM-28",
    mentors: ["Pembimbing C"],
    participantCode: "Mahasiswa B",
    publicId: "AKD-2026-0002",
    sources: [
      {
        capturedAt,
        identifier: "AKD-SRC-003",
        note: "Program studi dan bukti belum tercatat pada sumber.",
        source: "Data akademik",
      },
    ],
    title: "Topik Riset Doktor B",
  },
  {
    activity: "Bimbingan Magister",
    evidenceStatus: "internal",
    indicatorId: "KM-29",
    mentors: ["Pembimbing A", "Pembimbing D"],
    participantCode: "Mahasiswa C",
    programStudy: "S2 Teknik Elektro",
    publicId: "AKD-2026-0003",
    sources: [
      {
        capturedAt,
        identifier: "AKD-SRC-004",
        source: "Data akademik",
      },
    ],
    title: "Topik Riset Magister A",
  },
  {
    activity: "Bimbingan Magister",
    evidenceStatus: "unrecorded",
    indicatorId: "KM-29",
    mentors: ["Pembimbing E"],
    participantCode: "Mahasiswa D",
    programStudy: "S2 Teknik Biomedis",
    publicId: "AKD-2026-0004",
    sources: [
      {
        capturedAt,
        identifier: "AKD-SRC-005",
        note: "Nama topik dan bukti kegiatan belum tercatat pada sumber.",
        source: "Data akademik",
      },
    ],
  },
  {
    activity: "Magang Mahasiswa",
    duration: "5 bulan",
    evidenceStatus: "internal",
    indicatorId: "KM-30",
    mentors: ["Pembimbing Lapangan A"],
    participantCode: "Mahasiswa E",
    programStudy: "S1 Teknik Biomedis",
    publicId: "AKD-2026-0005",
    sources: [
      {
        capturedAt,
        identifier: "AKD-SRC-006",
        source: "Data akademik",
      },
    ],
    title: "Program Magang Mahasiswa A",
    year: 2026,
  },
  {
    activity: "Magang Mahasiswa",
    duration: "4 bulan",
    evidenceStatus: "unrecorded",
    indicatorId: "KM-30",
    mentors: ["Pembimbing Lapangan B"],
    participantCode: "Mahasiswa F",
    programStudy: "S1 Teknik Komputer",
    publicId: "AKD-2026-0006",
    sources: [
      {
        capturedAt,
        identifier: "AKD-SRC-007",
        note: "Bukti kegiatan belum tercatat pada sumber.",
        source: "Data akademik",
      },
    ],
    title: "Program Magang Mahasiswa B",
    year: 2026,
  },
  {
    activity: "Bimbingan Magister",
    evidenceStatus: "internal",
    mentors: ["Pembimbing F"],
    participantCode: "Mahasiswa G",
    programStudy: "S2 Informatika",
    publicId: "AKD-2026-0007",
    sources: [
      {
        capturedAt,
        identifier: "AKD-SRC-008",
        note: "Bentuk kegiatan sudah tercatat, tetapi kaitan indikator evaluasinya belum dipastikan.",
        source: "Data akademik",
      },
    ],
    title: "Topik Riset Lintas Program A",
  },
];

function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLocaleLowerCase("id-ID")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function toMentor(name: string): AcademicMentor {
  return { id: slugify(name), initials: personInitials(name), name };
}

function createRecord(seed: AcademicSeed): OfficialAcademicRecord {
  const title = seed.title ?? "";
  const isInternship = seed.activity === "Magang Mahasiswa";
  const missingFields: AcademicCompletionFieldKey[] = [
    ...(title.length === 0 ? (["title"] as const) : []),
    ...(seed.programStudy ? [] : (["programStudy"] as const)),
    ...(isInternship && !seed.duration ? (["duration"] as const) : []),
    ...(isInternship && !seed.year ? (["year"] as const) : []),
    ...(seed.evidenceStatus === "unrecorded" ? (["evidenceUrl"] as const) : []),
  ];

  return {
    activity: seed.activity,
    duration: seed.duration,
    evaluationPeriod,
    evidenceNote: evidenceNotes[seed.evidenceStatus],
    evidenceStatus: seed.evidenceStatus,
    evidenceUrl: seed.evidenceUrl,
    id: seed.publicId.toLocaleLowerCase("id-ID"),
    kmLinks: seed.indicatorId
      ? [
          {
            indicator: kmIndicator(seed.indicatorId),
            note: kmLinkNotes[seed.indicatorId],
          },
        ]
      : [],
    mentors: seed.mentors.map(toMentor),
    missingFields,
    participantCode: seed.participantCode,
    programStudy: seed.programStudy,
    provenance: [...seed.sources],
    publicId: seed.publicId,
    quality: missingFields.length > 0 ? "Perlu dilengkapi" : "Lengkap",
    review: {
      candidateId: `AKD-CAND-${seed.publicId.slice(-4)}`,
      decision:
        seed.sources.length > 1
          ? "Dihubungkan ke rekam resmi"
          : "Disetujui sebagai data baru",
      note:
        seed.sources.length > 1
          ? "Beberapa sumber yang merujuk kegiatan sama disatukan menjadi satu rekam resmi dan seluruh jejaknya dipertahankan."
          : "Bentuk kegiatan, pihak terkait, dan kelengkapan metadata diperiksa sebelum rekam disetujui.",
      reviewedAt: capturedAt,
      reviewer: "Pemeriksa A",
    },
    title,
    updatedAt: capturedAt,
    year: seed.year,
  };
}

const records: OfficialAcademicRecord[] = seeds.map(createRecord);

export function academicMentorNames(record: OfficialAcademicRecord) {
  if (record.mentors.length === 0) return "Pembimbing belum tercatat";
  return record.mentors.map((mentor) => mentor.name).join("; ");
}

export function academicEvidenceLabel(record: OfficialAcademicRecord) {
  const availableLabel =
    record.evidenceStatus === "internal"
      ? "Tersimpan internal"
      : "Tautan tersedia";
  return metadataCompletionAvailabilityLabel(
    record.resolvedMetadata,
    "evidenceUrl",
    record.missingFields.includes("evidenceUrl"),
    availableLabel,
  );
}

export function academicDisplayTitle(record: OfficialAcademicRecord) {
  return record.title || `${record.activity} · nama kegiatan belum tercatat`;
}

export function academicKmLabel(record: OfficialAcademicRecord) {
  if (record.kmLinks.length === 0) return "Belum dikaitkan";
  return record.kmLinks.map((link) => link.indicator.id).join(", ");
}

export const academicIndicatorScope: readonly NexusKmIndicator[] = (
  ["KM-28", "KM-29", "KM-30", "KM-31", "KM-32"] as const
).map(kmIndicator);

/** Batas adapter yang dapat diganti layanan server tanpa mengubah halaman. */
export function getNexusAcademicContent(): NexusAcademicContent {
  return {
    description:
      "Seluruh kegiatan akademik resmi CoE BHT yang sudah lolos Tinjauan, mulai dari bimbingan doktor dan magister sampai magang mahasiswa, beserta pembimbing dan bukti kegiatannya.",
    officialNote:
      "Daftar ini hanya memuat rekam resmi. Kegiatan yang sama dengan beberapa pembimbing tetap satu rekam. Baris peserta magang menjadi bukti operasional; nilai KM-30 tetap ditetapkan sebagai kapasitas magang.",
    records,
    title: "Akademik",
    updatedAt: "Diperbarui 17 Agustus 2026 · 09.30 WIB",
  };
}
