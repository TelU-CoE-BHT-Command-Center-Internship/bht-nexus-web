import { apiFetch } from "@/lib/api-client";
import type { RecordTrailHouse } from "@/lib/api-record-trail";

export type OfficialRecordCorrectionResult = {
  appliedFields: string[];
  correctionPublicId: string;
  targetEntityPublicId: string;
};

/**
 * Koreksi langsung satu rekam resmi oleh pemegang izin keputusan tinjauan.
 * Koreksi berlaku seketika, dan server mencatat pengoreksi, alasan, serta
 * nilainya pada jejak rekam. Bila ada satu nilai yang tidak sah, seluruh
 * koreksi ditolak.
 */
export function correctOfficialRecord(
  house: RecordTrailHouse,
  publicId: string,
  body: { changes: Record<string, string>; reason: string },
): Promise<OfficialRecordCorrectionResult> {
  return apiFetch(`/${house}/${encodeURIComponent(publicId)}/correction`, {
    body: JSON.stringify(body),
    method: "POST",
  });
}
