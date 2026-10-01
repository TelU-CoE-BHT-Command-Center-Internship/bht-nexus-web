import { apiFetch } from "@/lib/api-client";

/** Rumah Data Resmi yang menyajikan jejak rekam, menurut alamat API-nya. */
export type RecordTrailHouse =
  | "academics"
  | "activities"
  | "contracts-proposals"
  | "intellectual-properties"
  | "publications";

export type RecordTrailSource = {
  capturedAt: string;
  reference: string | null;
  reviewCasePublicId: string;
  /** Asal kandidat: `manual`, `sinta`, `google_scholar`, atau asal lain. */
  source: string;
  sourceUrl: string | null;
};

export type RecordTrailDecision = {
  decidedAt: string;
  decision: "approve" | "reject" | "request_revision";
  /** `promotion` membentuk atau menautkan rekam; `completion` melengkapinya. */
  purpose: "completion" | "promotion";
  reason: string | null;
  reviewCasePublicId: string;
  reviewerName: string;
};

export type RecordTrail = {
  /** Terbaru lebih dahulu. */
  decisions: RecordTrailDecision[];
  sources: RecordTrailSource[];
};

/** Sumber pembentuk dan keputusan tinjauan satu rekam resmi. */
export function getRecordTrail(
  house: RecordTrailHouse,
  publicId: string,
): Promise<RecordTrail> {
  return apiFetch(`/${house}/${encodeURIComponent(publicId)}/trail`);
}
