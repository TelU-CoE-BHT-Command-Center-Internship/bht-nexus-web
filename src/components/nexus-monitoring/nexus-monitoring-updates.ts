import type { NexusMonitoringRecord } from "@/components/nexus-monitoring/nexus-monitoring-sources";
import {
  type NexusKmIndicatorCategory,
  nexusKmIndicators,
} from "@/content/nexus-km-indicators";

export type NexusMonitoringUpdate = {
  domains: readonly NexusKmIndicatorCategory[];
  id: string;
  indicatorIds: readonly string[];
  sourceId: string;
  sourceLabel: string;
  title: string;
  updatedAt: string;
};

const indicatorById = new Map(
  nexusKmIndicators.map((indicator) => [indicator.id, indicator]),
);

const monthNumbers: Record<string, number> = {
  agu: 7,
  agustus: 7,
  apr: 3,
  april: 3,
  des: 11,
  desember: 11,
  feb: 1,
  februari: 1,
  jan: 0,
  januari: 0,
  jul: 6,
  juli: 6,
  jun: 5,
  juni: 5,
  mar: 2,
  maret: 2,
  mei: 4,
  nov: 10,
  november: 10,
  okt: 9,
  oktober: 9,
  sep: 8,
  september: 8,
};

function updateTimestamp(label: string) {
  const normalized = label.replace(/^Diperbarui\s+/i, "").trim();
  const match =
    /(\d{1,2})\s+([A-Za-z]+)\s+(\d{4})(?:\s*[·,]\s*(\d{1,2})[.:](\d{2}))?/.exec(
      normalized,
    );
  if (!match) return Date.parse(normalized) || 0;

  const month = monthNumbers[match[2]?.toLocaleLowerCase("id-ID") ?? ""];
  if (month === undefined) return 0;
  return Date.UTC(
    Number(match[3]),
    month,
    Number(match[1]),
    Number(match[4] ?? 0),
    Number(match[5] ?? 0),
  );
}

function updateLabel(label: string) {
  return label.replace(/^Diperbarui\s+/i, "").trim();
}

/**
 * Pembaruan yang benar-benar dapat memengaruhi Monitoring: hanya Data Resmi
 * dengan kaitan indikator KM eksplisit. Tidak ada aktor atau status audit yang
 * ditebak pada lapisan ini.
 */
export function nexusMonitoringUpdates(
  records: readonly NexusMonitoringRecord[],
): readonly NexusMonitoringUpdate[] {
  return records
    .filter((record) => record.kmIds.length > 0)
    .map((record) => {
      const indicators = record.kmIds
        .map((id) => indicatorById.get(id))
        .filter((indicator): indicator is NonNullable<typeof indicator> =>
          Boolean(indicator),
        );

      return {
        domains: [
          ...new Set(indicators.map((indicator) => indicator.category)),
        ],
        id: record.publicId,
        indicatorIds: [...new Set(indicators.map((indicator) => indicator.id))],
        sourceId: record.house.family,
        sourceLabel: record.house.label,
        title: record.title,
        updatedAt: updateLabel(record.updatedAt),
        updatedAtSort: updateTimestamp(record.updatedAt),
      };
    })
    .sort(
      (first, second) =>
        second.updatedAtSort - first.updatedAtSort ||
        second.id.localeCompare(first.id, "id-ID", { numeric: true }),
    )
    .map(({ updatedAtSort: _updatedAtSort, ...update }) => update);
}
