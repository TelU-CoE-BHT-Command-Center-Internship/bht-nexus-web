import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { NexusManualSubmissionPage } from "@/components/nexus-manual-submission/nexus-manual-submission";
import { getManualComparisonCandidates } from "@/components/nexus-manual-submission/nexus-manual-submission-comparison";
import type { ManualSubmissionDomain } from "@/components/nexus-manual-submission/nexus-manual-submission-model";

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
      comparisonCandidates={getManualComparisonCandidates(route.domain)}
      domain={route.domain}
    />
  );
}
