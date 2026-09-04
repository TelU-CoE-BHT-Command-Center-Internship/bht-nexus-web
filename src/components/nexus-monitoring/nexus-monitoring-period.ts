import { NEXUS_EVALUATION_PERIOD } from "@/components/nexus-monitoring/nexus-monitoring-evaluation";

/**
 * Pilihan periode evaluasi pada Monitoring KM.
 *
 * Workbook KM 2026 menetapkan satu target per indikator untuk satu tahun
 * evaluasi; kolom `TW 1` sampai `TW 4` berisi catatan realisasi triwulan, bukan
 * target triwulan. Karena itu tidak ada aturan resmi untuk menilai status
 * sebuah indikator pada satu triwulan, dan kendali ini hanya menawarkan periode
 * yang benar-benar dimodelkan supaya angka pada kartu, grafik, dan tabel tidak
 * pernah diberi label periode yang tidak menghitungnya.
 *
 * Dimensi triwulan tetap dapat dibaca pada rincian indikator melalui sebaran
 * triwulan yang dihitung dari tanggal bisnis rekam resmi.
 */
export type NexusMonitoringScope = "year";

export type NexusMonitoringPeriod = {
  id: string;
  /** Label pendek untuk tombol pemilih, mengikuti gaya "Tahun 2026". */
  label: string;
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

export const nexusMonitoringPeriods: readonly NexusMonitoringPeriod[] =
  modeledYears.map(yearPeriod);

export const NEXUS_DEFAULT_MONITORING_PERIOD_ID: string =
  NEXUS_EVALUATION_PERIOD;

export function nexusMonitoringPeriod(id: string): NexusMonitoringPeriod {
  return (
    nexusMonitoringPeriods.find((period) => period.id === id) ??
    nexusMonitoringPeriods[0]
  );
}
