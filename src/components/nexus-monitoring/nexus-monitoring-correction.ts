import type { MonitoringRecordView } from "@/components/nexus-monitoring/nexus-monitoring-view";
import type { OfficialRecordCorrectionValues } from "@/components/nexus-official-records/nexus-official-record-corrections";
import {
  correctOfficialRecord,
  type OfficialRecordCorrectionResult,
} from "@/lib/api-official-record-corrections";
import type { RecordTrailHouse } from "@/lib/api-record-trail";

const houseByFamily: Record<
  MonitoringRecordView["correction"]["family"],
  RecordTrailHouse
> = {
  academic: "academics",
  activities: "activities",
  contracts: "contracts-proposals",
  "intellectual-property": "intellectual-properties",
  publications: "publications",
};

function workTypeFor(
  type: NonNullable<OfficialRecordCorrectionValues["publicationType"]>,
  kmIds: readonly string[],
): string {
  if (type === "Artikel Jurnal") return "journal_article";
  if (type === "Makalah Konferensi") return "conference_paper";
  if (type === "Buku / Book Chapter") {
    return kmIds.includes("KM-33") ? "book" : "book_chapter";
  }
  return "other";
}

/**
 * Nilai koreksi Monitoring dalam kunci koreksi server. Hanya bidang yang
 * berubah yang dikirim; triwulan kosong berarti triwulannya dihapus dan
 * kaitan KM kosong berarti rekam tidak terkait indikator KM.
 */
export function monitoringCorrectionChanges(
  record: MonitoringRecordView,
  values: OfficialRecordCorrectionValues,
): Record<string, string> {
  const { correction } = record;
  const changes: Record<string, string> = {};
  if (values.businessDate && correction.businessDateKey) {
    changes[correction.businessDateKey] = values.businessDate;
  }
  if (typeof values.year === "number") changes.year = String(values.year);
  if (values.reportedQuarter !== undefined) {
    changes.reportedQuarter =
      values.reportedQuarter === null ? "" : String(values.reportedQuarter);
  }
  if (values.publicationType) {
    changes.workType = workTypeFor(
      values.publicationType,
      values.kmIds ?? correction.kmIds,
    );
  }
  if (values.quartile) changes.quartile = values.quartile;
  if (values.protection && values.protection !== "Belum diklasifikasikan") {
    changes.protectionType = values.protection;
  }
  if (values.registrationNumber) {
    changes.registrationNumber = values.registrationNumber;
  }
  if (values.kmIds) changes.kmIndicators = values.kmIds.join(", ");
  return changes;
}

/** Menerapkan koreksi Monitoring langsung pada rekam resmi di server. */
export function applyMonitoringCorrection(
  record: MonitoringRecordView,
  values: OfficialRecordCorrectionValues,
  reason: string,
): Promise<OfficialRecordCorrectionResult> {
  return correctOfficialRecord(
    houseByFamily[record.correction.family],
    record.publicId,
    { changes: monitoringCorrectionChanges(record, values), reason },
  );
}
