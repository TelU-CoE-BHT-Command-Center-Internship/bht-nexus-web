import type { NexusMonitoringInput } from "@/components/nexus-monitoring/nexus-monitoring-measurement";
import {
  measureMonitoredIndicators,
  nexusIndicatorStatusLabels,
} from "@/components/nexus-monitoring/nexus-monitoring-measurement";
import { nexusQuarters } from "@/components/nexus-monitoring/nexus-monitoring-quarter";
import { nexusTargetDisplay } from "@/components/nexus-monitoring/nexus-monitoring-targets";
import type { MonitoringIndicatorView } from "@/components/nexus-monitoring/nexus-monitoring-view";

type CsvCell = number | string | null | undefined;

/**
 * Sel CSV untuk Excel berlokal Indonesia: pemisah titik koma, koma desimal,
 * dan kutip ganda di-escape. Sel yang diawali `=`, `+`, `-`, atau `@` diberi
 * tanda petik tunggal supaya tidak pernah dijalankan sebagai rumus.
 */
function csvCell(value: CsvCell) {
  if (value === null || value === undefined) return "";
  const text =
    typeof value === "number"
      ? String(value).replace(".", ",")
      : value.replace(/\r?\n/g, " ");
  const guarded = /^[=+\-@]/.test(text) ? `'${text}` : text;
  return /[;"\n]/.test(guarded) ? `"${guarded.replace(/"/g, '""')}"` : guarded;
}

function csvDocument(rows: readonly (readonly CsvCell[])[]) {
  return `\uFEFF${rows.map((row) => row.map(csvCell).join(";")).join("\r\n")}\r\n`;
}

/**
 * Laporan capaian seluruh indikator terpantau pada satu periode, dengan kolom
 * yang mengikuti susunan worksheet `Evaluasi` workbook KM: target tahunan,
 * realisasi per triwulan, lalu realisasi dan capaian tahunan.
 */
export function nexusMonitoringPeriodCsv(input: NexusMonitoringInput) {
  const header = [
    "No",
    "KM",
    "Indikator",
    "Domain",
    "Satuan",
    `Target ${input.period}`,
    "TW1",
    "TW2",
    "TW3",
    "TW4",
    "Belum terpetakan",
    "Realisasi",
    "Capaian (%)",
    "Status",
    "Keterangan",
  ];
  const rows = measureMonitoredIndicators(input).map((measurement, index) => {
    const { evaluation, quarterly } = measurement;
    const quarters = nexusQuarters.map((quarter) =>
      quarterly.available ? quarterly.counts[quarter] : null,
    );
    const note =
      evaluation.realization.kind === "unavailable"
        ? evaluation.realization.reason
        : measurement.status === "target-belum-tersedia"
          ? "Target periode belum ditetapkan."
          : measurement.target.value === null &&
              measurement.target.literal !== null
            ? `Target ${measurement.target.literal} tidak dibandingkan sebagai satu angka.`
            : measurement.needsVerification > 0
              ? `${measurement.needsVerification} rekam tertaut perlu verifikasi.`
              : "";

    return [
      index + 1,
      evaluation.indicator.id,
      evaluation.indicator.label,
      evaluation.indicator.category,
      evaluation.unit,
      nexusTargetDisplay(measurement.target),
      ...quarters,
      quarterly.available ? quarterly.undated : null,
      measurement.realization,
      measurement.progress === null
        ? null
        : Math.round(measurement.progress * 1000) / 10,
      nexusIndicatorStatusLabels[measurement.status],
      note,
    ];
  });

  return csvDocument([header, ...rows]);
}

/** Daftar rekam pembentuk satu indikator beserta alasan dihitung atau tidaknya. */
export function nexusMonitoringIndicatorCsv(view: MonitoringIndicatorView) {
  const header = [
    "ID rekam",
    "Judul",
    "Rumah data",
    view.businessDateLabel,
    "Triwulan",
    "Dasar triwulan",
    "Status hitung",
    "Alasan",
    "Eviden",
    "Kelengkapan",
    "Diperbarui",
  ];
  const rows = view.records.map((record) => [
    record.publicId,
    record.title,
    record.houseLabel,
    record.businessDateLabel ?? "Belum tercatat",
    record.quarterLabel,
    record.quarterBasis === "tanggal"
      ? view.businessDateLabel
      : record.quarterBasis === "dilaporkan"
        ? "Triwulan dilaporkan"
        : "",
    record.counting.label,
    record.counting.reason ?? "",
    record.evidenceUrl ?? record.evidenceLabel,
    record.quality,
    record.updatedAt,
  ]);

  return csvDocument([header, ...rows]);
}

/** Menyerahkan berkas CSV kepada peramban untuk diunduh pengguna. */
export function downloadNexusCsv(filename: string, content: string) {
  const blob = new Blob([content], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}
