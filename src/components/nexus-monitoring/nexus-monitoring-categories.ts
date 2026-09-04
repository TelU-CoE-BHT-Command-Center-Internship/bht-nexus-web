import {
  nexusCategoryIsMonitored,
  nexusDomainHref,
} from "@/components/nexus-monitoring/nexus-monitoring-evaluation";
import {
  getNexusMonitoringRecords,
  type NexusMonitoringRecord,
} from "@/components/nexus-monitoring/nexus-monitoring-sources";
import {
  type NexusKmIndicatorCategory,
  nexusKmIndicators,
} from "@/content/nexus-km-indicators";

/**
 * Keadaan pemantauan sebuah kategori KM. Kategori yang belum dipantau tidak
 * pernah ditampilkan sebagai capaian 0%: yang belum diketahui berbeda dari yang
 * memang bernilai nol.
 */
export type NexusCategoryMonitoringState =
  | "monitored"
  | "sources-connected"
  | "sources-none"
  | "sources-partial";

export type NexusMonitoringCategory = {
  category: NexusKmIndicatorCategory;
  /** Indikator yang sudah punya rekam resmi berkait pada periode berjalan. */
  connectedIndicators: number;
  detail: string;
  href?: string;
  indicators: number;
  /** Nomor indikator terkecil pada kategori; dipakai menjaga urutan workbook. */
  order: number;
  /** Rekam resmi berbeda yang berkait dengan indikator kategori ini. */
  records: number;
  state: NexusCategoryMonitoringState;
  stateLabel: string;
};

const stateLabels: Record<NexusCategoryMonitoringState, string> = {
  monitored: "Pemantauan tersedia",
  "sources-connected": "Sumber realisasi terhubung",
  "sources-none": "Sumber realisasi belum terhubung",
  "sources-partial": "Sumber realisasi sebagian terhubung",
};

function categoryDetail(
  state: NexusCategoryMonitoringState,
  connected: number,
  indicators: number,
) {
  if (state === "monitored") {
    return `Capaian ${indicators} indikator dihitung dari data resmi pembentuknya.`;
  }
  if (state === "sources-none") {
    return "Belum ada rekam resmi yang dikaitkan dengan indikator kategori ini, sehingga capaiannya belum dapat dihitung.";
  }
  return `${connected} dari ${indicators} indikator sudah memiliki rekam resmi berkait. Target dan capaiannya disiapkan menyusul.`;
}

/**
 * Ringkasan kategori untuk halaman Monitoring KM. Daftar kategori dan jumlah
 * indikatornya diturunkan dari registry KM kanonis, sedangkan keterhubungan
 * sumber dihitung dari rumah data resmi yang sama dengan halaman Data Resmi.
 */
export function getNexusMonitoringCategories(
  records: readonly NexusMonitoringRecord[] = getNexusMonitoringRecords(),
): readonly NexusMonitoringCategory[] {
  const categories = new Map<
    NexusKmIndicatorCategory,
    {
      connected: Set<string>;
      indicators: number;
      order: number;
      records: Set<string>;
    }
  >();

  for (const indicator of nexusKmIndicators) {
    const bucket = categories.get(indicator.category) ?? {
      connected: new Set<string>(),
      indicators: 0,
      order: indicator.number,
      records: new Set<string>(),
    };
    bucket.indicators += 1;
    // Urutan kategori mengikuti workbook: nomor indikator terkecil lebih dulu.
    bucket.order = Math.min(bucket.order, indicator.number);
    categories.set(indicator.category, bucket);
  }

  for (const record of records) {
    for (const kmId of record.kmIds) {
      const indicator = nexusKmIndicators.find((item) => item.id === kmId);
      if (!indicator) continue;
      const bucket = categories.get(indicator.category);
      if (!bucket) continue;
      bucket.connected.add(kmId);
      bucket.records.add(record.publicId);
    }
  }

  return [...categories.entries()]
    .map(([category, bucket]) => {
      const connectedIndicators = bucket.connected.size;
      const state: NexusCategoryMonitoringState = nexusCategoryIsMonitored(
        category,
      )
        ? "monitored"
        : connectedIndicators === 0
          ? "sources-none"
          : connectedIndicators === bucket.indicators
            ? "sources-connected"
            : "sources-partial";

      return {
        category,
        connectedIndicators,
        detail: categoryDetail(state, connectedIndicators, bucket.indicators),
        href: state === "monitored" ? nexusDomainHref(category) : undefined,
        indicators: bucket.indicators,
        order: bucket.order,
        records: bucket.records.size,
        state,
        stateLabel: stateLabels[state],
      };
    })
    .sort((first, second) => first.order - second.order);
}
