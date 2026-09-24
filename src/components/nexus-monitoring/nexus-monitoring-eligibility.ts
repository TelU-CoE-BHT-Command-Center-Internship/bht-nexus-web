import type { NexusMonitoringRecord } from "@/components/nexus-monitoring/nexus-monitoring-sources";
import type { NexusKmIndicatorId } from "@/content/nexus-km-indicators";

/**
 * Apakah sebuah rekam resmi memenuhi syarat perhitungan satu indikator.
 *
 * Rekam resmi yang tertaut ke indikator belum tentu menyumbang realisasinya:
 * kaitan KM menyatakan rekam itu dilaporkan pada indikator tersebut, sedangkan
 * syarat perhitungan menyatakan apakah rekam itu memang memenuhi ketentuan
 * indikatornya. Keduanya dibedakan supaya angka realisasi tidak pernah lebih
 * besar daripada rekam yang benar-benar memenuhi syarat.
 *
 * `undetermined` dipakai ketika sumbernya belum mencatat bidang yang
 * menentukan, sehingga syaratnya tidak dapat dibuktikan maupun dibantah.
 * Keadaan itu tidak pernah dihitung sebagai realisasi.
 */
export type NexusMonitoringEligibility =
  | { state: "eligible" }
  | { reason: string; state: "ineligible" }
  | { reason: string; state: "undetermined" };

export type NexusEligibilityState = NexusMonitoringEligibility["state"];

export const nexusEligibilityLabels: Record<NexusEligibilityState, string> = {
  eligible: "Dihitung",
  ineligible: "Belum dihitung",
  undetermined: "Perlu verifikasi",
};

const eligible: NexusMonitoringEligibility = { state: "eligible" };

function ineligible(reason: string): NexusMonitoringEligibility {
  return { reason, state: "ineligible" };
}

function undetermined(reason: string): NexusMonitoringEligibility {
  return { reason, state: "undetermined" };
}

const WRONG_HOUSE =
  "Rekam ini berasal dari rumah data yang berbeda dari sumber realisasi indikator, sehingga syaratnya belum dapat diperiksa.";

const UNCLASSIFIED_WORK =
  "Bentuk karya rekam ini belum diklasifikasikan, sehingga kesesuaiannya dengan ketentuan indikator belum dapat dipastikan. Lengkapi bentuk karyanya pada rumah Data Resmi.";

const NO_REGISTRATION_NUMBER =
  "Nomor pencatatan belum tercatat, sedangkan indikator ini dihitung setelah pengajuan memperoleh nomor registrasi. Lengkapi nomor pencatatannya pada rumah Data Resmi.";

type EligibilityRule = (
  record: NexusMonitoringRecord,
) => NexusMonitoringEligibility;

/** Syarat bentuk karya untuk indikator yang memang mensyaratkan satu bentuk. */
function requirePublicationType(
  expected: "Artikel Jurnal" | "Buku / Book Chapter" | "Makalah Konferensi",
  mismatch: (actual: string) => string,
): EligibilityRule {
  return (record) => {
    if (record.family !== "publications") return undetermined(WRONG_HOUSE);

    const { type } = record.publication;
    if (type === expected) return eligible;
    if (type === "Belum diklasifikasikan")
      return undetermined(UNCLASSIFIED_WORK);

    return ineligible(mismatch(type));
  };
}

const REPUTABLE_QUARTILES = ["Q1", "Q2"] as const;

function isReputableQuartile(value: string | undefined) {
  return (
    value !== undefined &&
    REPUTABLE_QUARTILES.includes(value as (typeof REPUTABLE_QUARTILES)[number])
  );
}

/**
 * Syarat kuartil untuk KM-13: jurnal internasional bereputasi selain Q1/Q2,
 * termasuk book chapter. Ketentuannya berupa pengecualian, jadi level jurnal
 * yang tercatat pada sumber boleh menggugurkan rekam walaupun bentuk karyanya
 * belum dipastikan artikel jurnal. Nilai sumber tidak pernah dinaikkan menjadi
 * kuartil kanonis; ia hanya dipakai untuk menahan rekam yang jelas Q1 atau Q2.
 */
const outsideTopQuartiles: EligibilityRule = (record) => {
  if (record.family !== "publications") return undetermined(WRONG_HOUSE);

  const { quartile, sourceReportedQuartile } = record.publication;
  if (isReputableQuartile(quartile)) {
    return ineligible(
      `Kuartil jurnalnya ${quartile}, sedangkan indikator ini menghitung jurnal bereputasi selain Q1 dan Q2.`,
    );
  }
  if (isReputableQuartile(sourceReportedQuartile)) {
    return ineligible(
      `Sumber mencatat level jurnalnya ${sourceReportedQuartile}, sedangkan indikator ini menghitung jurnal bereputasi selain Q1 dan Q2.`,
    );
  }
  if (quartile === undefined && sourceReportedQuartile === undefined) {
    return undetermined(
      "Level jurnal rekam ini belum tercatat, sehingga posisinya terhadap Q1 dan Q2 belum dapat dipastikan. Lengkapi kuartil jurnalnya pada rumah Data Resmi.",
    );
  }

  return eligible;
};

/**
 * Syarat kuartil untuk KM-14: jurnal internasional bereputasi setara Q1 atau
 * Q2. Ketentuannya berupa pernyataan positif, jadi hanya kuartil kanonis yang
 * boleh membuktikannya. Level jurnal yang baru tercatat pada sumber belum
 * cukup dan menyisakan keadaan yang masih perlu verifikasi.
 */
const withinTopQuartiles: EligibilityRule = (record) => {
  if (record.family !== "publications") return undetermined(WRONG_HOUSE);

  const { quartile, quartileApplies, sourceReportedQuartile } =
    record.publication;
  if (isReputableQuartile(quartile)) return eligible;
  if (quartile !== undefined) {
    return ineligible(
      `Kuartil jurnalnya ${quartile}, sedangkan indikator ini menghitung jurnal bereputasi setara Q1 atau Q2.`,
    );
  }
  if (!quartileApplies) {
    return undetermined(
      sourceReportedQuartile === undefined
        ? "Bentuk karyanya bukan artikel jurnal, sehingga kuartil jurnal belum dapat ditetapkan untuk rekam ini."
        : `Sumber mencatat level jurnal ${sourceReportedQuartile}, tetapi bentuk karyanya bukan artikel jurnal sehingga nilai itu belum menjadi kuartil jurnal yang terverifikasi.`,
    );
  }

  return undetermined(
    "Kuartil jurnal rekam ini belum tercatat, sehingga kesetaraannya dengan Q1 atau Q2 belum dapat dipastikan. Lengkapi kuartil jurnalnya pada rumah Data Resmi.",
  );
};

/** KM-15: pengajuan HKI dihitung setelah memperoleh nomor registrasi. */
const registeredIntellectualProperty: EligibilityRule = (record) => {
  if (record.family !== "intellectual-property") {
    return undetermined(WRONG_HOUSE);
  }

  return record.intellectualProperty.registrationNumber
    ? eligible
    : undetermined(NO_REGISTRATION_NUMBER);
};

/**
 * KM-16: pengajuan paten, dihitung setelah memperoleh nomor registrasi.
 * Ketentuan nomor registrasinya sama dengan KM-15, tetapi bentuk
 * perlindungannya harus paten, sehingga keduanya tidak memakai aturan yang
 * sama persis.
 */
const registeredPatent: EligibilityRule = (record) => {
  if (record.family !== "intellectual-property") {
    return undetermined(WRONG_HOUSE);
  }

  const { protection, registrationNumber } = record.intellectualProperty;
  if (protection === "Belum diklasifikasikan") {
    return undetermined(
      "Bentuk perlindungan rekam ini belum diklasifikasikan, sehingga belum dapat dipastikan sebagai paten. Lengkapi bentuk perlindungannya pada rumah Data Resmi.",
    );
  }
  if (protection !== "Paten") {
    return ineligible(
      `Bentuk perlindungannya ${protection}, sedangkan indikator ini menghitung pengajuan paten.`,
    );
  }

  return registrationNumber ? eligible : undetermined(NO_REGISTRATION_NUMBER);
};

/**
 * Syarat perhitungan per indikator, diturunkan dari kolom Perhitungan
 * Indikator pada workbook KM 2026.
 *
 * Indikator yang tidak tercantum memang tidak mempunyai syarat baris tambahan
 * pada sumbernya: cakupan nasional atau internasional, bentuk kegiatan, dan
 * jenjang akademik dibawa oleh worksheet tempat baris itu berada, yaitu oleh
 * kaitan KM-nya sendiri. Menambahkan syarat baris untuk indikator tersebut
 * berarti mengarang ketentuan yang tidak dimiliki sumbernya.
 */
const eligibilityRules: Partial<Record<NexusKmIndicatorId, EligibilityRule>> = {
  "KM-11": requirePublicationType(
    "Makalah Konferensi",
    (actual) =>
      `Bentuk karyanya ${actual}, sedangkan indikator ini menghitung makalah konferensi internasional terindeks.`,
  ),
  "KM-12": requirePublicationType(
    "Artikel Jurnal",
    (actual) =>
      `Bentuk karyanya ${actual}, sedangkan indikator ini menghitung publikasi pada jurnal nasional terakreditasi.`,
  ),
  "KM-13": outsideTopQuartiles,
  "KM-14": withinTopQuartiles,
  "KM-15": registeredIntellectualProperty,
  "KM-16": registeredPatent,
  "KM-33": requirePublicationType(
    "Buku / Book Chapter",
    (actual) =>
      `Bentuk karyanya ${actual}, sedangkan indikator ini menghitung buku, book chapter, monograf, dan referensi.`,
  ),
};

/** Apakah indikator memang mempunyai syarat baris tambahan pada sumbernya. */
export function nexusIndicatorHasEligibilityRule(
  indicatorId: NexusKmIndicatorId,
) {
  return eligibilityRules[indicatorId] !== undefined;
}

export function resolveRecordEligibility(
  indicatorId: NexusKmIndicatorId,
  record: NexusMonitoringRecord,
): NexusMonitoringEligibility {
  return eligibilityRules[indicatorId]?.(record) ?? eligible;
}
