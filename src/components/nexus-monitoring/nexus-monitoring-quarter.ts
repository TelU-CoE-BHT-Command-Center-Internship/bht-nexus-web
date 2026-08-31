/**
 * Triwulan evaluasi KM. TW adalah pembagian periode pelaporan:
 * TW1 Januari–Maret, TW2 April–Juni, TW3 Juli–September, TW4 Oktober–Desember.
 *
 * TW tidak sama dengan kuartil jurnal Q1–Q4. Kuartil adalah pemeringkatan
 * reputasi jurnal, sedangkan TW adalah waktu. Keduanya tidak boleh saling
 * menggantikan pada label, tooltip, maupun ringkasan teks.
 */
export type NexusEvaluationQuarter = 1 | 2 | 3 | 4;

export const nexusQuarterLabels: Record<NexusEvaluationQuarter, string> = {
  1: "TW1",
  2: "TW2",
  3: "TW3",
  4: "TW4",
};

export const nexusQuarterRangeLabels: Record<NexusEvaluationQuarter, string> = {
  1: "Januari–Maret",
  2: "April–Juni",
  3: "Juli–September",
  4: "Oktober–Desember",
};

export const nexusQuarters: readonly NexusEvaluationQuarter[] = [1, 2, 3, 4];

const monthNames = [
  "januari",
  "februari",
  "maret",
  "april",
  "mei",
  "juni",
  "juli",
  "agustus",
  "september",
  "oktober",
  "november",
  "desember",
];

export type NexusParsedBusinessDate = {
  iso: string;
  label: string;
  month: number;
  quarter: NexusEvaluationQuarter;
  year: number;
};

function quarterOfMonth(month: number): NexusEvaluationQuarter {
  if (month <= 3) return 1;
  if (month <= 6) return 2;
  if (month <= 9) return 3;
  return 4;
}

function formatDate(year: number, month: number, day: number) {
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    timeZone: "UTC",
    year: "numeric",
  }).format(new Date(Date.UTC(year, month - 1, day)));
}

function isRealDate(year: number, month: number, day: number) {
  if (month < 1 || month > 12 || day < 1 || day > 31) return false;
  const date = new Date(Date.UTC(year, month - 1, day));
  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}

/**
 * Membaca tanggal bisnis sebuah rekam resmi. Format ISO dipakai rekam yang
 * berasal dari formulir, sedangkan tanggal panjang berbahasa Indonesia dipakai
 * sumber yang mencatatnya sebagai teks. Nilai yang tidak dapat dibaca dengan
 * pasti mengembalikan `undefined` supaya triwulan tidak pernah ditebak.
 */
export function parseBusinessDate(
  value: string | undefined,
): NexusParsedBusinessDate | undefined {
  const trimmed = value?.trim();
  if (!trimmed) return undefined;

  const isoMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(trimmed);
  if (isoMatch) {
    const year = Number(isoMatch[1]);
    const month = Number(isoMatch[2]);
    const day = Number(isoMatch[3]);
    if (!isRealDate(year, month, day)) return undefined;

    return {
      iso: trimmed,
      label: formatDate(year, month, day),
      month,
      quarter: quarterOfMonth(month),
      year,
    };
  }

  const textMatch = /^(\d{1,2})\s+([\p{L}]+)\s+(\d{4})$/u.exec(trimmed);
  if (!textMatch) return undefined;

  const day = Number(textMatch[1]);
  const monthIndex = monthNames.indexOf(
    textMatch[2].toLocaleLowerCase("id-ID"),
  );
  const year = Number(textMatch[3]);
  if (monthIndex < 0) return undefined;

  const month = monthIndex + 1;
  if (!isRealDate(year, month, day)) return undefined;

  return {
    iso: `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`,
    label: formatDate(year, month, day),
    month,
    quarter: quarterOfMonth(month),
    year,
  };
}
