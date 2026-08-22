import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  academicDisplayTitle,
  academicMentorNames,
  getNexusAcademicContent,
} from "@/components/nexus-academic/nexus-academic-content";
import {
  activityContextLabel,
  activityDisplayTitle,
  getNexusActivitiesContent,
} from "@/components/nexus-activities/nexus-activities-content";
import {
  contractProposalDisplayTitle,
  contractProposalPrimaryParty,
  getNexusContractProposalContent,
} from "@/components/nexus-contract-proposals/nexus-contract-proposals-content";
import {
  getNexusIntellectualPropertyContent,
  intellectualPropertyCreatorNames,
} from "@/components/nexus-intellectual-property/nexus-intellectual-property-content";
import { NexusManualSubmissionPage } from "@/components/nexus-manual-submission/nexus-manual-submission";
import type {
  ManualRecordComparisonCandidate,
  ManualSubmissionDomain,
} from "@/components/nexus-manual-submission/nexus-manual-submission-model";
import {
  getNexusPublicationsContent,
  publicationAuthorNames,
  publicationDisplayTitle,
} from "@/components/nexus-publications/nexus-publications-content";

const submissionRoutes = {
  akademik: {
    description:
      "Ajukan kegiatan akademik untuk diverifikasi sebelum menjadi Data Resmi BHT Nexus.",
    domain: "academic",
    title: "Ajukan Kegiatan Akademik",
  },
  kegiatan: {
    description:
      "Ajukan kegiatan atau pengabdian untuk diverifikasi sebelum menjadi Data Resmi BHT Nexus.",
    domain: "activity",
    title: "Ajukan Kegiatan & Pengabdian",
  },
  "kekayaan-intelektual": {
    description:
      "Ajukan kekayaan intelektual untuk diverifikasi sebelum menjadi Data Resmi BHT Nexus.",
    domain: "intellectual-property",
    title: "Ajukan Kekayaan Intelektual",
  },
  "kontrak-proposal": {
    description:
      "Ajukan kontrak atau proposal untuk diverifikasi sebelum menjadi Data Resmi BHT Nexus.",
    domain: "contract",
    title: "Ajukan Kontrak & Proposal",
  },
  publikasi: {
    description:
      "Ajukan publikasi untuk diverifikasi sebelum menjadi Data Resmi BHT Nexus.",
    domain: "publication",
    title: "Ajukan Publikasi",
  },
} as const satisfies Record<
  string,
  { description: string; domain: ManualSubmissionDomain; title: string }
>;

type SubmissionRouteSlug = keyof typeof submissionRoutes;
type SubmissionPageProps = {
  params: Promise<{ domain: string }>;
};

function isSubmissionRouteSlug(value: string): value is SubmissionRouteSlug {
  return value in submissionRoutes;
}

function getComparisonCandidates(
  domain: ManualSubmissionDomain,
): ManualRecordComparisonCandidate[] {
  switch (domain) {
    case "publication":
      return getNexusPublicationsContent().records.map((record) => ({
        id: record.id,
        subtitle: publicationAuthorNames(record),
        title: publicationDisplayTitle(record),
      }));
    case "intellectual-property":
      return getNexusIntellectualPropertyContent().records.map((record) => ({
        id: record.id,
        subtitle: intellectualPropertyCreatorNames(record),
        title: record.title,
      }));
    case "contract":
      return getNexusContractProposalContent().records.map((record) => ({
        id: record.id,
        subtitle: contractProposalPrimaryParty(record),
        title: contractProposalDisplayTitle(record),
      }));
    case "academic":
      return getNexusAcademicContent().records.map((record) => ({
        id: record.id,
        subtitle: academicMentorNames(record),
        title: academicDisplayTitle(record),
      }));
    case "activity":
      return getNexusActivitiesContent().records.map((record) => ({
        id: record.id,
        subtitle: activityContextLabel(record),
        title: activityDisplayTitle(record),
      }));
  }
}

export const dynamicParams = false;

export function generateStaticParams() {
  return Object.keys(submissionRoutes).map((domain) => ({ domain }));
}

export async function generateMetadata({
  params,
}: SubmissionPageProps): Promise<Metadata> {
  const { domain: slug } = await params;
  if (!isSubmissionRouteSlug(slug)) notFound();

  const route = submissionRoutes[slug];
  return {
    description: route.description,
    robots: { follow: false, index: false },
    title: route.title,
  };
}

export default async function NexusManualSubmissionRoute({
  params,
}: SubmissionPageProps) {
  const { domain: slug } = await params;
  if (!isSubmissionRouteSlug(slug)) notFound();

  const route = submissionRoutes[slug];
  return (
    <NexusManualSubmissionPage
      comparisonCandidates={getComparisonCandidates(route.domain)}
      domain={route.domain}
    />
  );
}
