import { getAutomationStatusLabel } from "@/components/nexus-automation-status/nexus-automation-status-content";
import type { AutomationJobStatus } from "@/components/nexus-automation-status/nexus-automation-status-types";
import { nexusReviewActorIds } from "@/components/nexus-review-session/nexus-review-actors";
import { formatTimestamp } from "@/components/nexus-workspace-ui/nexus-workspace-format";
import type { Locale } from "@/i18n/locales";

export type NexusDocumentCapability = "extraction" | "qa";

export type NexusDocumentProcessingAttempt = {
  attemptedAt: string;
  number: number;
  reason?: string;
  status: AutomationJobStatus;
};

export type NexusDocumentProcessingJob = {
  attempts: NexusDocumentProcessingAttempt[];
  correlationId: string;
  finishedAt?: string;
  id: string;
  requestedAt: string;
  requestedByActorId: string;
  status: AutomationJobStatus;
};

export type NexusDocumentRecord = {
  capabilities: NexusDocumentCapability[];
  fileLabel: string;
  id: string;
  ownerUnit: string;
  processingHistory: NexusDocumentProcessingJob[];
  processingJob: NexusDocumentProcessingJob;
  statusLabel: string;
  title: string;
  updatedAt: string;
  updatedLabel: string;
};

const documentSeeds = [
  {
    capabilities: ["qa"],
    fileLabel: { en: "PDF · 18 pages", id: "PDF · 18 halaman" },
    id: "pedoman-metadata-publikasi",
    updatedAt: "2026-08-12T09:12",
    ownerUnit: { en: "Data Management", id: "Pengelolaan Data" },
    status: "succeeded",
    title: {
      en: "Publication Metadata Guide",
      id: "Pedoman Metadata Publikasi",
    },
  },
  {
    capabilities: ["qa", "extraction"],
    fileLabel: { en: "PDF · 10 pages", id: "PDF · 10 halaman" },
    id: "ringkasan-kegiatan-telemedisin",
    updatedAt: "2026-08-12T08:05",
    ownerUnit: { en: "Research", id: "Riset" },
    // Dokumen yang sudah menjadi sumber ekstraksi harus sudah selesai diproses.
    status: "succeeded",
    title: {
      en: "Primary Care Telemedicine Activity Summary",
      id: "Ringkasan Kegiatan Telemedisin Layanan Primer",
    },
  },
  {
    capabilities: [],
    fileLabel: { en: "DOCX · 7 pages", id: "DOCX · 7 halaman" },
    id: "profil-riset-laboratorium",
    updatedAt: "2026-08-12T08:03",
    ownerUnit: { en: "Research", id: "Riset" },
    status: "queued",
    title: {
      en: "Laboratory Research Profile",
      id: "Profil Riset Laboratorium",
    },
  },
  {
    capabilities: [],
    fileLabel: { en: "PDF · 24 pages", id: "PDF · 24 halaman" },
    id: "rekap-publikasi-tahunan",
    updatedAt: "2026-08-11T19:22",
    ownerUnit: { en: "Data Management", id: "Pengelolaan Data" },
    status: "retrying",
    attempt: 2,
    failureReason:
      "Pemrosesan teks belum berhasil. Sistem sedang menjalankan percobaan berikutnya.",
    title: {
      en: "Annual Publication Summary",
      id: "Rekap Publikasi Tahunan",
    },
  },
  {
    attempt: 3,
    capabilities: [],
    failureReason:
      "Berkas tidak dapat dibaca setelah tiga percobaan. Periksa berkas sumber lalu ajukan pemrosesan baru.",
    fileLabel: { en: "PDF · 6 pages", id: "PDF · 6 halaman" },
    id: "lampiran-kegiatan-tidak-terbaca",
    updatedAt: "2026-08-11T18:10",
    ownerUnit: { en: "Research", id: "Riset" },
    status: "failed_permanently",
    title: {
      en: "Unreadable Activity Attachment",
      id: "Lampiran Kegiatan Belum Terbaca",
    },
  },
] satisfies Array<{
  attempt?: number;
  capabilities: NexusDocumentCapability[];
  failureReason?: string;
  fileLabel: Record<Locale, string>;
  id: string;
  updatedAt: string;
  ownerUnit: Record<Locale, string>;
  status: AutomationJobStatus;
  title: Record<Locale, string>;
}>;

/** Satu sumber metadata dokumen dipakai bersama Pustaka, Tanya, dan Ekstraksi. */
export function getNexusDocumentRecords(locale: Locale): NexusDocumentRecord[] {
  return documentSeeds.map((seed, index) => ({
    capabilities: seed.capabilities,
    fileLabel: seed.fileLabel[locale],
    id: seed.id,
    ownerUnit: seed.ownerUnit[locale],
    processingHistory: [],
    processingJob: {
      attempts: [
        {
          attemptedAt: seed.updatedAt,
          number: seed.attempt ?? 1,
          reason: seed.failureReason,
          status: seed.status,
        },
      ],
      correlationId: `DOC-CORR-2026-${String(index + 1).padStart(4, "0")}`,
      finishedAt:
        seed.status === "succeeded" || seed.status === "failed_permanently"
          ? seed.updatedAt
          : undefined,
      id: `DOC-JOB-2026-${String(index + 1).padStart(4, "0")}`,
      requestedAt: seed.updatedAt,
      requestedByActorId: nexusReviewActorIds.dataSteward,
      status: seed.status,
    },
    statusLabel: getAutomationStatusLabel(locale, seed.status),
    title: seed.title[locale],
    updatedAt: seed.updatedAt,
    updatedLabel: formatTimestamp(seed.updatedAt),
  }));
}

export function latestDocumentProcessingAttempt(document: NexusDocumentRecord) {
  return document.processingJob.attempts.at(-1);
}
