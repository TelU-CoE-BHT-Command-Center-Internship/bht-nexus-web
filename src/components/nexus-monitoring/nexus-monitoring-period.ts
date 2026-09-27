import { NEXUS_EVALUATION_PERIOD } from "@/components/nexus-monitoring/nexus-monitoring-evaluation";
import type { NexusMonitoringPeriodRecord } from "@/components/nexus-monitoring/nexus-monitoring-targets";

/**
 * Pilihan periode evaluasi pada Monitoring KM.
 *
 * Satu periode adalah satu tahun evaluasi dengan satu target per indikator.
 * Kolom `TW 1` sampai `TW 4` pada workbook berisi catatan realisasi triwulan,
 * bukan target triwulan, sehingga status indikator hanya dinilai per tahun.
 * Dimensi triwulan tetap dibaca pada rincian indikator melalui sebaran
 * triwulan rekam resmi.
 *
 * Daftar periode berasal dari periode yang terdaftar pada sesi Monitoring:
 * periode awal workbook dan periode yang ditambahkan pengelola.
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

export const NEXUS_DEFAULT_MONITORING_PERIOD_ID: string =
  NEXUS_EVALUATION_PERIOD;

/** Nama parameter alamat yang membawa periode antarhalaman Monitoring. */
export const NEXUS_MONITORING_PERIOD_PARAM = "periode";

export function nexusMonitoringPeriodFromRecord(
  record: Pick<NexusMonitoringPeriodRecord, "id" | "year">,
): NexusMonitoringPeriod {
  return {
    id: record.id,
    label: `Tahun ${record.year}`,
    rangeLabel: "Januari–Desember",
    scope: "year",
    year: String(record.year),
  };
}

/** Periode terdaftar, terbaru lebih dahulu. */
export function nexusMonitoringPeriodOptions(
  records: readonly NexusMonitoringPeriodRecord[],
): readonly NexusMonitoringPeriod[] {
  return [...records]
    .sort((first, second) => second.year - first.year)
    .map(nexusMonitoringPeriodFromRecord);
}

/**
 * Membaca parameter periode dari alamat. Nilai kosong berarti periode bawaan;
 * nilai yang tidak terdaftar tetap diteruskan supaya halaman dapat menyatakan
 * periode itu belum terdaftar, bukan diam-diam membuka periode lain.
 */
export function nexusMonitoringPeriodParam(
  value: string | string[] | undefined,
): string | undefined {
  const raw = Array.isArray(value) ? value[0] : value;
  const trimmed = raw?.trim();
  return trimmed ? trimmed : undefined;
}

/** Menambahkan periode pada tautan Monitoring bila bukan periode bawaan. */
export function nexusMonitoringPeriodHref(href: string, periodId: string) {
  if (periodId === NEXUS_DEFAULT_MONITORING_PERIOD_ID) return href;
  return `${href}?${NEXUS_MONITORING_PERIOD_PARAM}=${encodeURIComponent(periodId)}`;
}
