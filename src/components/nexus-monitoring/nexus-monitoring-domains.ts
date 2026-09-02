import type { NexusMonitoringCategory } from "@/components/nexus-monitoring/nexus-monitoring-categories";
import type { NexusWorkspaceIconName } from "@/components/nexus-workspace-ui/nexus-workspace-icons";
import type { NexusKmIndicatorCategory } from "@/content/nexus-km-indicators";

/** Penanda domain gabungan; bukan kategori KM dan tidak pernah dihitung ganda. */
export const NEXUS_ALL_DOMAINS = "semua";

export type NexusMonitoringDomainId =
  | typeof NEXUS_ALL_DOMAINS
  | NexusKmIndicatorCategory;

/**
 * Identitas visual tiap domain pada pemilih Ringkasan. Ikon dan warnanya hanya
 * membantu pengenalan domain; keadaan dan capaian tetap disampaikan lewat teks,
 * tidak pernah lewat warna saja.
 */
export type NexusMonitoringDomainIdentity = {
  accent: string;
  chartLabel: string;
  icon: NexusWorkspaceIconName;
};

const domainIdentities: Record<
  NexusMonitoringDomainId,
  NexusMonitoringDomainIdentity
> = {
  [NEXUS_ALL_DOMAINS]: {
    accent: "#315ca8",
    chartLabel: "Semua",
    icon: "globe",
  },
  Riset: { accent: "#5c4fd0", chartLabel: "Riset", icon: "flask" },
  Finansial: {
    accent: "#087443",
    chartLabel: "Finansial",
    icon: "money",
  },
  Bisnis: { accent: "#b06b00", chartLabel: "Bisnis", icon: "briefcase" },
  "Pengabdian Masyarakat": {
    accent: "#d7193f",
    chartLabel: "Pengabdian",
    icon: "heart",
  },
  Akademik: {
    accent: "#0e7490",
    chartLabel: "Akademik",
    icon: "graduation",
  },
  Inovasi: { accent: "#b8317f", chartLabel: "Inovasi", icon: "bulb" },
  "Organisasi CoE": {
    accent: "#08285c",
    chartLabel: "Organisasi",
    icon: "building",
  },
  "Pengembangan dan Performansi Sumber Daya": {
    accent: "#475467",
    chartLabel: "SDM",
    icon: "people",
  },
  Proposal: {
    accent: "#4d7c0f",
    chartLabel: "Proposal",
    icon: "document",
  },
};

export function nexusMonitoringDomainIdentity(id: NexusMonitoringDomainId) {
  return domainIdentities[id];
}

export type NexusMonitoringDomain = {
  accent: string;
  /** Kategori KM yang diwakili; kosong untuk domain gabungan. */
  category?: NexusKmIndicatorCategory;
  /** Nama pendek untuk sumbu grafik; nama domain lengkap tetap dipakai tab. */
  chartLabel: string;
  icon: NexusWorkspaceIconName;
  id: NexusMonitoringDomainId;
  indicators: number;
  label: string;
  /** Keterangan singkat di bawah nama domain pada pemilih. */
  meta: string;
  records: number;
};

/**
 * Daftar domain untuk pemilih Ringkasan: satu domain gabungan diikuti seluruh
 * kategori KM kanonis. Jumlah indikator dan rekam berasal dari registry KM dan
 * rumah Data Resmi, bukan dari daftar terpisah.
 */
export function nexusMonitoringDomains(
  categories: readonly NexusMonitoringCategory[],
): readonly NexusMonitoringDomain[] {
  const indicators = categories.reduce(
    (total, category) => total + category.indicators,
    0,
  );
  const records = categories.reduce(
    (total, category) => total + category.records,
    0,
  );

  return [
    {
      ...domainIdentities[NEXUS_ALL_DOMAINS],
      id: NEXUS_ALL_DOMAINS,
      indicators,
      label: "Semua Domain",
      meta: `${indicators} indikator`,
      records,
    },
    ...categories.map((category) => ({
      ...domainIdentities[category.category],
      category: category.category,
      id: category.category,
      indicators: category.indicators,
      label: category.category,
      meta: `${category.indicators} indikator`,
      records: category.records,
    })),
  ];
}
