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
      shortLabel: "Tidak terkait KM",
    };
  }
  if (status === "undetermined") {
    return {
      detail:
        "Reviewer belum dapat menentukan keterkaitan indikator dari bukti yang tersedia.",
      label: "Keterkaitan KM belum dapat ditentukan",
      shortLabel: "Belum ditentukan",
    };
  }
  return {
    detail:
      "Keterkaitan indikator dapat ditetapkan melalui Tinjauan setelah klasifikasinya dipastikan.",
    label: "Belum dikaitkan dengan indikator KM",
    shortLabel: "Belum dikaitkan",
  };
}

/**
 * Isi sel Indikator KM pada tabel rekam resmi. Kolom ini sempit, sehingga rekam
 * tanpa indikator memakai penanda ringkas yang tenang; kalimat lengkapnya tetap
 * tampil pada rincian rekam dan kartu seluler.
 */
export function officialKpiTableSignal(
  kmLinks: readonly { indicator: { id: string } }[],
  status?: NexusOfficialKpiResolutionStatus,
) {
  if (kmLinks.length === 0) {
    const copy = officialKpiEmptyCopy(status);
    return {
      primary: copy.shortLabel,
      subdued: true,
      title: copy.label,
      tone: "neutral" as const,
    };
  }
  return {
    primary: kmLinks.map((link) => link.indicator.id).join(", "),
    subdued: false,
    tone: "info" as const,
  };
}
