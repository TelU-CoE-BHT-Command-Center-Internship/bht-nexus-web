import { NEXUS_EVALUATION_PERIOD } from "@/components/nexus-monitoring/nexus-monitoring-evaluation";
import { measureRisetIndicators } from "@/components/nexus-monitoring/nexus-monitoring-measurement";
import type { NexusMonitoringRecord } from "@/components/nexus-monitoring/nexus-monitoring-sources";
import {
  type NexusKmIndicatorCategory,
  type NexusKmIndicatorId,
  nexusKmIndicators,
} from "@/content/nexus-km-indicators";

export type NexusMonitoringIndicatorProgressStatus =
  | "not-reached"
  | "reached"
  | "unavailable";

export type NexusMonitoringIndicatorProgress = {
  category: NexusKmIndicatorCategory;
  id: NexusKmIndicatorId;
  label: string;
  progressPercent: number | null;
  realization: number | null;
  status: NexusMonitoringIndicatorProgressStatus;
  target: number | null;
};

/**
 * Satu daftar indikator kanonis untuk grafik kategori. Evaluator yang sudah
 * tersedia mengisi capaian; indikator lain tetap hadir sebagai belum dihitung.
 */
export function nexusMonitoringIndicatorProgress(
  records: readonly NexusMonitoringRecord[],
): readonly NexusMonitoringIndicatorProgress[] {
  const risetMeasurements = new Map(
    measureRisetIndicators(NEXUS_EVALUATION_PERIOD, records).map(
      (measurement) => [measurement.evaluation.indicator.id, measurement],
    ),
  );

  return nexusKmIndicators.map((indicator) => {
    const measurement = risetMeasurements.get(indicator.id);
    if (!measurement || measurement.progress === null) {
      return {
        category: indicator.category,
        id: indicator.id,
        label: indicator.label,
        progressPercent: null,
        realization: measurement?.realization ?? null,
        status: "unavailable",
        target: measurement?.evaluation.target.value ?? null,
      };
    }

    return {
      category: indicator.category,
      id: indicator.id,
      label: indicator.label,
      progressPercent: Math.round(measurement.progress * 100),
      realization: measurement.realization,
      status: measurement.status === "tercapai" ? "reached" : "not-reached",
      target: measurement.evaluation.target.value,
    };
  });
}
