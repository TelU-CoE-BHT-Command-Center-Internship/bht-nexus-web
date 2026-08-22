import type { ManualSubmissionDomain } from "@/components/nexus-manual-submission/nexus-manual-submission-model";

export type ManualSubmissionRoute = {
  formHref: string;
  officialHref: string;
  officialLabel: string;
};

export const manualSubmissionRoutes: Record<
  ManualSubmissionDomain,
  ManualSubmissionRoute
> = {
  publication: {
    formHref: "/nexus/ajukan/publikasi",
    officialHref: "/nexus/publikasi",
    officialLabel: "Publikasi",
  },
  "intellectual-property": {
    formHref: "/nexus/ajukan/kekayaan-intelektual",
    officialHref: "/nexus/kekayaan-intelektual",
    officialLabel: "Kekayaan Intelektual",
  },
  contract: {
    formHref: "/nexus/ajukan/kontrak-proposal",
    officialHref: "/nexus/kontrak-proposal",
    officialLabel: "Kontrak & Proposal",
  },
  academic: {
    formHref: "/nexus/ajukan/akademik",
    officialHref: "/nexus/akademik",
    officialLabel: "Akademik",
  },
  activity: {
    formHref: "/nexus/ajukan/kegiatan",
    officialHref: "/nexus/kegiatan",
    officialLabel: "Kegiatan & Pengabdian",
  },
};
