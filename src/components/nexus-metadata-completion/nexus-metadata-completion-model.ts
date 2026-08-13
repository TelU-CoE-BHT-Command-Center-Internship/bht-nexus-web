export type MetadataCompletionFieldKey =
  | "doi"
  | "issue"
  | "pages"
  | "publisherUrl";

export type MetadataCompletionResolutionStatus =
  | "not-applicable"
  | "not-available"
  | "provided";

export type MetadataCompletionResolution = {
  reason: string;
  status: MetadataCompletionResolutionStatus;
  value: string;
};

export type MetadataCompletionResolutions = Partial<
  Record<MetadataCompletionFieldKey, MetadataCompletionResolution>
>;

export type MetadataCompletionFieldConfig = {
  help: string;
  key: MetadataCompletionFieldKey;
  placeholder: string;
  type: "text" | "url";
};

export const metadataCompletionFieldLabels: Record<
  MetadataCompletionFieldKey,
  string
> = {
  doi: "DOI",
  issue: "Nomor terbit",
  pages: "Halaman / nomor artikel",
  publisherUrl: "Tautan penerbit",
};

export const metadataCompletionFieldConfigs: Record<
  MetadataCompletionFieldKey,
  MetadataCompletionFieldConfig
> = {
  doi: {
    help: "Masukkan DOI tanpa harus menambahkan https://doi.org/.",
    key: "doi",
    placeholder: "10.xxxx/xxxxx",
    type: "text",
  },
  issue: {
    help: "Gunakan nomor terbit yang ditulis oleh jurnal atau penerbit.",
    key: "issue",
    placeholder: "Contoh: 2",
    type: "text",
  },
  pages: {
    help: "Gunakan rentang halaman atau nomor artikel dari penerbit.",
    key: "pages",
    placeholder: "Contoh: 115–128 atau e10452",
    type: "text",
  },
  publisherUrl: {
    help: "Gunakan tautan langsung menuju halaman karya pada situs penerbit.",
    key: "publisherUrl",
    placeholder: "https://penerbit.example/artikel",
    type: "url",
  },
};

export const metadataCompletionResolutionOptions: readonly {
  description: string;
  label: string;
  status: MetadataCompletionResolutionStatus;
}[] = [
  {
    description: "Nilai tersedia pada sumber yang dapat diperiksa.",
    label: "Isi nilai",
    status: "provided",
  },
  {
    description: "Sumber sudah diperiksa dan memang tidak menyediakan nilai.",
    label: "Memang tidak tersedia",
    status: "not-available",
  },
  {
    description: "Bidang ini tidak relevan untuk karya tersebut.",
    label: "Tidak berlaku",
    status: "not-applicable",
  },
];

export const metadataCompletionResolutionLabels: Record<
  MetadataCompletionResolutionStatus,
  string
> = {
  "not-applicable": "Tidak berlaku",
  "not-available": "Memang tidak tersedia",
  provided: "Nilai diajukan",
};

export function createEmptyMetadataCompletionResolution(): MetadataCompletionResolution {
  return { reason: "", status: "provided", value: "" };
}

export function normalizeMetadataCompletionResolution(
  resolution?: MetadataCompletionResolution,
): MetadataCompletionResolution {
  return {
    reason: resolution?.reason.trim() ?? "",
    status: resolution?.status ?? "provided",
    value: resolution?.value.trim() ?? "",
  };
}

export function areMetadataCompletionResolutionsEqual(
  first: MetadataCompletionResolution,
  second: MetadataCompletionResolution,
) {
  return (
    first.status === second.status &&
    first.value === second.value &&
    first.reason === second.reason
  );
}
