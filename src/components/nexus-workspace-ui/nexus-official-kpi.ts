export type NexusOfficialKpiResolutionStatus =
  | "not_applicable"
  | "resolved"
  | "undetermined";

export function officialKpiEmptyCopy(
  status?: NexusOfficialKpiResolutionStatus,
) {
  if (status === "not_applicable") {
    return {
      detail:
        "Reviewer telah menetapkan bahwa rekam resmi ini tidak terkait indikator KM.",
      label: "Tidak terkait indikator KM",
    };
  }
  if (status === "undetermined") {
    return {
      detail:
        "Reviewer belum dapat menentukan keterkaitan indikator dari bukti yang tersedia.",
      label: "Keterkaitan KM belum dapat ditentukan",
    };
  }
  return {
    detail:
      "Keterkaitan indikator dapat ditetapkan melalui Tinjauan setelah klasifikasinya dipastikan.",
    label: "Belum dikaitkan dengan indikator KM",
  };
}
