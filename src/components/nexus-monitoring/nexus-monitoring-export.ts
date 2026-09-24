import ExcelJS from "exceljs";
import type { NexusMonitoringInput } from "@/components/nexus-monitoring/nexus-monitoring-measurement";
import {
  measureMonitoredIndicators,
  nexusIndicatorStatusLabels,
} from "@/components/nexus-monitoring/nexus-monitoring-measurement";
import {
  nexusQuarters,
  parseBusinessDate,
} from "@/components/nexus-monitoring/nexus-monitoring-quarter";
import type { MonitoringIndicatorView } from "@/components/nexus-monitoring/nexus-monitoring-view";

type ExportValue = Date | number | string | null;

function addTable(
  workbook: ExcelJS.Workbook,
  name: string,
  columns: { header: string; width: number }[],
  rows: ExportValue[][],
) {
  const sheet = workbook.addWorksheet(name);
  sheet.columns = columns.map((column) => ({
    header: column.header,
    key: column.header,
    width: column.width,
  }));
  sheet.views = [{ state: "frozen", ySplit: 1 }];
  sheet.autoFilter = {
    from: { row: 1, column: 1 },
    to: { row: 1, column: columns.length },
  };
  sheet.getRow(1).height = 32;
  sheet.getRow(1).eachCell((cell) => {
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF173F60" },
    };
    cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
    cell.alignment = { vertical: "middle", wrapText: true };
  });
  for (const values of rows) {
    const row = sheet.addRow(values);
    row.alignment = { vertical: "top", wrapText: true };
  }
  return sheet;
}

function targetValue(target: {
  value: number | null;
  literal: string | null;
}): ExportValue {
  return target.value ?? target.literal ?? null;
}

/** Laporan evaluasi satu periode dengan target tahunan dan realisasi per TW. */
export function nexusMonitoringPeriodWorkbook(input: NexusMonitoringInput) {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "BHT Nexus Monitoring";
  const rows = measureMonitoredIndicators(input).map(
    (measurement, index): ExportValue[] => {
      const { evaluation, quarterly } = measurement;
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
        targetValue(measurement.target),
        ...nexusQuarters.map((quarter) =>
          quarterly.available ? quarterly.counts[quarter] : null,
        ),
        quarterly.available ? quarterly.undated : null,
        measurement.realization,
        measurement.progress,
        nexusIndicatorStatusLabels[measurement.status],
        note,
      ];
    },
  );
  const sheet = addTable(
    workbook,
    `Evaluasi ${input.period}`.slice(0, 31),
    [
      { header: "No", width: 7 },
      { header: "KM", width: 10 },
      { header: "Indikator", width: 54 },
      { header: "Domain", width: 20 },
      { header: "Satuan", width: 18 },
      { header: `Target ${input.period}`, width: 18 },
      { header: "TW1", width: 11 },
      { header: "TW2", width: 11 },
      { header: "TW3", width: 11 },
      { header: "TW4", width: 11 },
      { header: "Belum terpetakan", width: 18 },
      { header: "Realisasi", width: 15 },
      { header: "Capaian", width: 16 },
      { header: "Status", width: 23 },
      { header: "Keterangan", width: 56 },
    ],
    rows,
  );
  for (let row = 2; row <= sheet.rowCount; row += 1) {
    for (const column of [1, 6, 7, 8, 9, 10, 11, 12]) {
      if (typeof sheet.getCell(row, column).value === "number") {
        sheet.getCell(row, column).numFmt = "#,##0";
      }
    }
    sheet.getCell(row, 13).numFmt = "0.0%";
  }
  return workbook;
}

function businessDate(value: string): ExportValue {
  const parsed = parseBusinessDate(value);
  if (!parsed) return value;
  if (parsed.precision === "bulan") return parsed.label;
  return new Date(
    Date.UTC(parsed.year, parsed.month - 1, Number(value.slice(8, 10))),
  );
}

/** Rincian indikator dan seluruh rekam resmi yang tertaut, termasuk alasan hitung. */
export function nexusMonitoringIndicatorWorkbook(
  view: MonitoringIndicatorView,
) {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "BHT Nexus Monitoring";
  const summary = addTable(
    workbook,
    "Ringkasan",
    [
      { header: "KM", width: 12 },
      { header: "Indikator", width: 54 },
      { header: "Domain", width: 20 },
      { header: "Periode", width: 12 },
      { header: "Satuan", width: 18 },
      { header: "Target", width: 18 },
      { header: "Realisasi", width: 16 },
      { header: "Capaian", width: 16 },
      { header: "Status", width: 25 },
      { header: "Keterangan", width: 60 },
    ],
    [
      [
        view.id,
        view.label,
        view.category,
        view.period,
        view.unit,
        targetValue({ value: view.target, literal: view.targetLiteral }),
        view.realization,
        view.target !== null && view.target > 0 && view.realization !== null
          ? view.realization / view.target
          : view.progressPercent === null
            ? null
            : view.progressPercent / 100,
        view.statusLabel,
        view.unavailableReason ?? "",
      ],
    ],
  );
  summary.getCell("H2").numFmt = "0.0%";
  for (const column of ["F", "G"]) {
    if (typeof summary.getCell(`${column}2`).value === "number") {
      summary.getCell(`${column}2`).numFmt = "#,##0";
    }
  }

  const metadataLabels = [
    ...new Set(
      view.records.flatMap((record) =>
        record.metadata.map((field) => field.label),
      ),
    ),
  ];
  const recordSheet = addTable(
    workbook,
    "Data Pembentuk",
    [
      { header: "ID rekam", width: 20 },
      { header: "Judul", width: 52 },
      { header: "Rumah data", width: 27 },
      { header: view.businessDateLabel, width: 22 },
      { header: "Triwulan", width: 14 },
      { header: "Dasar triwulan", width: 25 },
      { header: "Status hitung", width: 20 },
      { header: "Alasan", width: 62 },
      { header: "Kaitan KM", width: 25 },
      { header: "Eviden", width: 38 },
      { header: "Kelengkapan", width: 22 },
      { header: "Diperbarui", width: 25 },
      ...metadataLabels.map((label) => ({ header: label, width: 32 })),
    ],
    view.records.map((record): ExportValue[] => [
      record.publicId,
      record.title,
      record.houseLabel,
      record.correction.businessDateIso
        ? businessDate(record.correction.businessDateIso)
        : (record.businessDateLabel ?? "Belum tercatat"),
      record.quarterLabel,
      record.quarterBasis === "tanggal"
        ? view.businessDateLabel
        : record.quarterBasis === "dilaporkan"
          ? "Triwulan dilaporkan"
          : "",
      record.counting.label,
      record.counting.reason ?? "",
      record.correction.kmIds.join(", "),
      record.evidenceUrl ?? record.evidenceLabel,
      record.quality,
      record.updatedAt,
      ...metadataLabels.map(
        (label) =>
          record.metadata.find((field) => field.label === label)?.value ?? "",
      ),
    ]),
  );
  for (let row = 2; row <= recordSheet.rowCount; row += 1) {
    const date = recordSheet.getCell(row, 4);
    if (date.value instanceof Date) date.numFmt = "dd mmm yyyy";
    const url = view.records[row - 2]?.evidenceUrl;
    if (url && /^https?:\/\//i.test(url)) {
      const cell = recordSheet.getCell(row, 10);
      cell.value = { text: "Buka eviden", hyperlink: url };
      cell.font = { color: { argb: "FF0878C5" }, underline: true };
    }
  }
  return workbook;
}

/** Mengunduh workbook XLSX asli dari peramban. */
export async function downloadNexusWorkbook(
  filename: string,
  workbook: ExcelJS.Workbook,
) {
  const data = await workbook.xlsx.writeBuffer();
  const blob = new Blob([new Uint8Array(data)], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 30_000);
}
