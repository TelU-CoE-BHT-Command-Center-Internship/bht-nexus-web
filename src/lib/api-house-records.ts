import { apiFetch, apiFetchPaginated } from "@/lib/api-client";
import type { CompletionProposalItem } from "@/lib/api-publications";

type HouseSummary = {
  createdAt: string;
  evidenceUrl: string | null;
  kmIndicators: string[];
  publicId: string;
  reportedQuarter?: 1 | 2 | 3 | 4 | null;
  title: string;
};

export type IntellectualPropertySummary = HouseSummary & {
  filedOn: string | null;
  protection:
    | "copyright"
    | "industrial_design"
    | "patent"
    | "trademark"
    | "unclassified";
  registrationNumber: string | null;
  registry: string;
  year: number | null;
};

export type IntellectualPropertyDetail = IntellectualPropertySummary & {
  creators: {
    creatorNameRaw: string;
    creatorOrder: number;
    memberPublicId: string | null;
  }[];
};

export type ContractProposalSummary = HouseSummary & {
  amount: number | null;
  applicant: string | null;
  contractEnd: string | null;
  contractStart: string | null;
  funder: string | null;
  group: "contract" | "proposal";
  kind:
    | "commercialization_business_contract"
    | "international_research_contract"
    | "international_research_proposal"
    | "national_research_contract"
    | "national_research_proposal"
    | "non_research_proposal";
  ownerUnit: string;
  partner: string | null;
  recordStatus: "active" | "recorded" | "submitted";
  referenceNumber: string | null;
  scheme: string | null;
  submittedOn: string | null;
  year?: number | null;
};

export type ContractProposalDetail = ContractProposalSummary & {
  relatedMembers: { memberPublicId: string; name: string }[];
};

export type AcademicSummary = HouseSummary & {
  activityType:
    | "doctoral_supervision"
    | "masters_supervision"
    | "other_academic_activity"
    | "student_competition"
    | "student_internship"
    | "thesis_research";
  duration: string | null;
  participantCode: string;
  participantName: string | null;
  programStudy: string | null;
  year: number | null;
};

export type AcademicDetail = AcademicSummary & {
  mentors: {
    memberPublicId: string | null;
    mentorNameRaw: string;
    mentorOrder: number;
  }[];
};

type HouseRecords = {
  academics: {
    detail: AcademicDetail;
    sortBy: "year";
    summary: AcademicSummary;
  };
  "contracts-proposals": {
    detail: ContractProposalDetail;
    sortBy: "createdAt";
    summary: ContractProposalSummary;
  };
  "intellectual-properties": {
    detail: IntellectualPropertyDetail;
    sortBy: "year";
    summary: IntellectualPropertySummary;
  };
};

export type OfficialHouse = keyof HouseRecords;

const MAX_PAGE_SIZE = 100;

const sortByHouse: { [House in OfficialHouse]: HouseRecords[House]["sortBy"] } =
  {
    academics: "year",
    "contracts-proposals": "createdAt",
    "intellectual-properties": "year",
  };

/**
 * Seluruh rekam satu rumah data resmi, dibaca per halaman sebanyak yang
 * diizinkan server. Filter anggota diterapkan server.
 */
export async function listAllHouseRecords<House extends OfficialHouse>(
  house: House,
  {
    divisionPublicId,
    memberPublicId,
  }: { divisionPublicId?: string; memberPublicId?: string } = {},
): Promise<HouseRecords[House]["summary"][]> {
  const records: HouseRecords[House]["summary"][] = [];
  const memberFilter = memberPublicId
    ? `&memberPublicId=${encodeURIComponent(memberPublicId)}`
    : "";
  const divisionFilter = divisionPublicId
    ? `&divisionPublicId=${encodeURIComponent(divisionPublicId)}`
    : "";
  for (let page = 1; ; page += 1) {
    const result = await apiFetchPaginated<HouseRecords[House]["summary"]>(
      `/${house}?limit=${MAX_PAGE_SIZE}&page=${page}&sortBy=${sortByHouse[house]}&sortOrder=desc${memberFilter}${divisionFilter}`,
    );
    records.push(...result.data);
    if (result.data.length === 0 || records.length >= result.meta.total) {
      return records;
    }
  }
}

export function getHouseRecord<House extends OfficialHouse>(
  house: House,
  publicId: string,
): Promise<HouseRecords[House]["detail"]> {
  return apiFetch(`/${house}/${encodeURIComponent(publicId)}`);
}

/** Usulan pelengkapan metadata satu rekam, dikirim ke antrean tinjauan. */
export function requestHouseRecordCompletion(
  house: OfficialHouse,
  publicId: string,
  body: { note?: string; proposals: Record<string, CompletionProposalItem> },
): Promise<{ reviewCasePublicId: string; status: string }> {
  return apiFetch(
    `/${house}/${encodeURIComponent(publicId)}/completion-request`,
    { body: JSON.stringify(body), method: "POST" },
  );
}
