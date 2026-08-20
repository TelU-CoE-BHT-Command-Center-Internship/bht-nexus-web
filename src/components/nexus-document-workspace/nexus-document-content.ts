import { getAutomationStatusLabel } from "@/components/nexus-automation-status/nexus-automation-status-content";
import type { AutomationJobStatus } from "@/components/nexus-automation-status/nexus-automation-status-types";
import { formatTimestamp } from "@/components/nexus-workspace-ui/nexus-workspace-format";
import type { Locale } from "@/i18n/locales";

export type NexusDocumentCapability = "extraction" | "qa";

export type NexusDocumentRecord = {
  capabilities: NexusDocumentCapability[];
  fileLabel: string;
  id: string;
  indexedAt: string;
  indexedLabel: string;
  ownerUnit: string;
  status: AutomationJobStatus;
  statusLabel: string;
  title: string;
};

const documentSeeds = [
  {
    capabilities: ["qa"],
    fileLabel: { en: "PDF · 18 pages", id: "PDF · 18 halaman" },
    id: "pedoman-metadata-publikasi",
    indexedAt: "2026-08-12T09:12",
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
    indexedAt: "2026-08-12T08:05",
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
    indexedAt: "2026-08-12T08:03",
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
    indexedAt: "2026-08-11T19:22",
    ownerUnit: { en: "Data Management", id: "Pengelolaan Data" },
    status: "retrying",
    title: {
      en: "Annual Publication Summary",
      id: "Rekap Publikasi Tahunan",
    },
  },
] satisfies Array<{
  capabilities: NexusDocumentCapability[];
  fileLabel: Record<Locale, string>;
  id: string;
  indexedAt: string;
  ownerUnit: Record<Locale, string>;
  status: AutomationJobStatus;
  title: Record<Locale, string>;
}>;

/** Satu sumber metadata dokumen dipakai bersama Pustaka, Tanya, dan Ekstraksi. */
export function getNexusDocumentRecords(locale: Locale): NexusDocumentRecord[] {
  return documentSeeds.map((seed) => ({
    capabilities: seed.capabilities,
    fileLabel: seed.fileLabel[locale],
    id: seed.id,
    indexedAt: seed.indexedAt,
    indexedLabel: formatTimestamp(seed.indexedAt),
    ownerUnit: seed.ownerUnit[locale],
    status: seed.status,
    statusLabel: getAutomationStatusLabel(locale, seed.status),
    title: seed.title[locale],
  }));
}
