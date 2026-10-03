import type { NexusActivityView } from "@/components/nexus-activities/nexus-activities-content";
import type { NexusIntellectualPropertyView } from "@/components/nexus-intellectual-property/nexus-intellectual-property-content";
import type { NexusPublicationView } from "@/components/nexus-publications/nexus-publications-content";
import type { NexusKmIndicatorId } from "@/content/nexus-km-indicators";

export type OfficialRecordQuarter = 1 | 2 | 3 | 4;

/**
 * Bidang rekam resmi yang dapat dikoreksi langsung dari Monitoring KM. Hanya
 * bidang yang menentukan apakah dan kapan sebuah rekam dihitung yang tersedia;
 * metadata lain tetap dilengkapi melalui rumah Data Resmi dan Tinjauan.
 *
 * Bidang yang tidak disertakan berarti tidak diubah. Nilai `null` pada
 * triwulan dilaporkan berarti triwulannya dikosongkan dengan sengaja.
 */
export type OfficialRecordCorrectionValues = {
  /** Tanggal bisnis `YYYY-MM-DD` pada bidang tanggal milik rumah datanya. */
  businessDate?: string;
  kmIds?: NexusKmIndicatorId[];
  protection?: NexusIntellectualPropertyView["protection"];
  publicationType?: NexusPublicationView["type"];
  quartile?: NonNullable<NexusPublicationView["quartile"]> | null;
  registrationNumber?: string;
  reportedQuarter?: OfficialRecordQuarter | null;
  year?: number | null;
};

export type OfficialRecordCorrectionField =
  keyof OfficialRecordCorrectionValues;

export type OfficialRecordCorrectionChange = {
  after: string;
  before: string;
  field: OfficialRecordCorrectionField;
  label: string;
};

export const officialRecordCorrectionLabels: Record<
  OfficialRecordCorrectionField,
  string
> = {
  businessDate: "Tanggal bisnis",
  kmIds: "Kaitan indikator KM",
  protection: "Bentuk perlindungan",
  publicationType: "Bentuk karya",
  quartile: "Kuartil jurnal",
  registrationNumber: "Nomor pencatatan",
  reportedQuarter: "Triwulan dilaporkan",
  year: "Tahun",
};

/** Proposal abdimas mencatat tanggal pengajuan, kegiatan lain tanggal pelaksanaan. */
export function activityUsesSubmissionDate(activity: NexusActivityView) {
  return activity.kind.startsWith("Proposal");
}

/**
 * Baris rincian "Triwulan dilaporkan" untuk rumah Data Resmi. Muncul hanya
 * bila rekam memang membawa triwulan dilaporkan, beserta asal nilainya.
 */
export function officialReportedQuarterItems(record: {
  reportedQuarter?: OfficialRecordQuarter;
  reportedQuarterSource?: string;
}) {
  if (!record.reportedQuarter) return [];
  return [
    {
      key: "reportedQuarter",
      label: "Triwulan dilaporkan",
      value: `TW${record.reportedQuarter}${record.reportedQuarterSource ? ` · ${record.reportedQuarterSource}` : ""}`,
    },
  ];
}
