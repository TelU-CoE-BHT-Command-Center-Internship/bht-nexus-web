import {
  getNexusReviewFiltersContent,
  type NexusReviewFiltersContent,
} from "@/components/nexus-review-summary/nexus-review-filters-content";
import type { ReviewCandidateStatus } from "@/components/nexus-review-summary/nexus-review-table-content";

export type ReviewSummaryIconName =
  | "check-circle"
  | "clock"
  | "edit"
  | "x-circle";

export type ReviewSummaryCard = {
  icon: ReviewSummaryIconName;
  id: string;
  label: string;
  status: ReviewCandidateStatus;
  tone: ReviewCandidateStatus;
  unit: string;
};

export type NexusReviewSummaryContent = {
  description: string;
  filters: NexusReviewFiltersContent;
  summaryCards: ReviewSummaryCard[];
  title: string;
};

const summaryCards: ReviewSummaryCard[] = [
  {
    icon: "clock",
    id: "waiting-review",
    label: "Menunggu Tinjauan",
    status: "waiting",
    tone: "waiting",
    unit: "data",
  },
  {
    icon: "edit",
    id: "needs-fix",
    label: "Perlu Perbaikan",
    status: "needs-fix",
    tone: "needs-fix",
    unit: "data",
  },
  {
    icon: "check-circle",
    id: "approved",
    label: "Disetujui",
    status: "approved",
    tone: "approved",
    unit: "data",
  },
  {
    icon: "x-circle",
    id: "rejected",
    label: "Ditolak",
    status: "rejected",
    tone: "rejected",
    unit: "data",
  },
];

/**
 * Presentation-ready review totals. A server adapter can supply this same
 * contract later without changing the summary component or its layout.
 */
export function getNexusReviewSummaryContent(): NexusReviewSummaryContent {
  return {
    description:
      "Tinjau kandidat data dari SINTA, Scopus, dan input manual sebelum menjadi data resmi BHT Nexus.",
    filters: getNexusReviewFiltersContent(),
    summaryCards,
    title: "Tinjauan Data",
  };
}
