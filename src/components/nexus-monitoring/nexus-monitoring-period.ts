import { NEXUS_EVALUATION_PERIOD } from "@/components/nexus-monitoring/nexus-monitoring-evaluation";
import {
  type NexusEvaluationQuarter,
  nexusQuarterLabels,
  nexusQuarterRangeLabels,
  nexusQuarters,
} from "@/components/nexus-monitoring/nexus-monitoring-quarter";

/**
 * Pilihan periode pada Ringkasan Monitoring KM. Satu tahun evaluasi
 * menghasilkan satu pilihan tahunan dan empat pilihan triwulan, mengikuti
 * kolom `Target`, `Realisasi`, dan `TW 1` sampai `TW 4` pada workbook KM.
 *
 * Tahun yang belum dimodelkan tidak ditawarkan supaya kendali ini tidak
 * menjanjikan periode yang datanya memang belum ada.
 */
export type NexusMonitoringScope = "quarter" | "year";

export type NexusMonitoringPeriod = {
  id: string;
  /** Label pendek untuk tombol pemilih, mengikuti gaya "Triwulan 2 2026". */
  label: string;
  quarter?: NexusEvaluationQuarter;
  /** Rentang bulan yang diwakili periode ini. */
  rangeLabel: string;
  scope: NexusMonitoringScope;
  year: string;
};

const modeledYears: readonly string[] = [NEXUS_EVALUATION_PERIOD];

function yearPeriod(year: string): NexusMonitoringPeriod {
  return {
    id: year,
    label: `Tahun ${year}`,
    rangeLabel: "Januari–Desember",
    scope: "year",
    year,
  };
}

function quarterPeriod(
  year: string,
  quarter: NexusEvaluationQuarter,
): NexusMonitoringPeriod {
  return {
    id: `${year}-tw${quarter}`,
    label: `Triwulan ${quarter} ${year}`,
    quarter,
    rangeLabel: nexusQuarterRangeLabels[quarter],
    scope: "quarter",
    year,
  };
}

export const nexusMonitoringPeriods: readonly NexusMonitoringPeriod[] =
  modeledYears.flatMap((year) => [
    yearPeriod(year),
    ...nexusQuarters.map((quarter) => quarterPeriod(year, quarter)),
  ]);

export const NEXUS_DEFAULT_MONITORING_PERIOD_ID: string =
  NEXUS_EVALUATION_PERIOD;

export function nexusMonitoringPeriod(id: string): NexusMonitoringPeriod {
  return (
    nexusMonitoringPeriods.find((period) => period.id === id) ??
    nexusMonitoringPeriods[0]
  );
}

/** Label lengkap untuk daftar pilihan: "Triwulan 2 2026 · April–Juni". */
export function nexusMonitoringPeriodOptionLabel(
  period: NexusMonitoringPeriod,
) {
  return `${period.label} · ${period.rangeLabel}`;
}

/** Penyebutan periode di dalam kalimat, mis. "TW2 2026" atau "tahun 2026". */
export function nexusMonitoringPeriodShortLabel(period: NexusMonitoringPeriod) {
  if (period.scope === "year") return `tahun ${period.year}`;
  return `${nexusQuarterLabels[period.quarter as NexusEvaluationQuarter]} ${period.year}`;
}
