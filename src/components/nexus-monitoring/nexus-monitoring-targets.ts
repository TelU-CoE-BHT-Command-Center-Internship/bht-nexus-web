import {
  NEXUS_EVALUATION_PERIOD,
  type NexusIndicatorTarget,
  nexusEvaluationTargetSeeds,
} from "@/components/nexus-monitoring/nexus-monitoring-evaluation";
import type { NexusKmIndicatorId } from "@/content/nexus-km-indicators";

/**
 * Periode evaluasi yang terdaftar pada Monitoring KM. Periode dari workbook
 * KM 2026 menjadi titik awal; periode berikutnya ditambahkan pengelola dari
 * Monitoring sendiri, bukan dari workbook baru.
 */
export type NexusMonitoringPeriodRecord = {
  copiedFromPeriodId?: string;
  createdAt?: string;
  createdBy?: string;
  id: string;
  origin: "added" | "workbook";
  year: number;
};

/**
 * Satu versi target sebuah indikator pada satu periode. Perubahan target
 * selalu menambah versi baru, sehingga angka lama tetap dapat ditelusuri
 * (SRS REQ-FUNC-025) dan tidak ada target yang ditimpa tanpa jejak.
 */
export type NexusIndicatorTargetVersion = {
  actorName: string;
  actorRoleLabel?: string;
  id: string;
  indicatorId: NexusKmIndicatorId;
  literal: string | null;
  origin: "copied" | "manual" | "workbook";
  periodId: string;
  reason: string;
  /** Instant mesin; format WIB baru dibuat ketika ditampilkan. */
  recordedAt: string | null;
  value: number | null;
  version: number;
};

export type NexusMonitoringTargetLookup = (
  indicatorId: NexusKmIndicatorId,
) => NexusIndicatorTarget;

const WORKBOOK_ACTOR = "Workbook KM 2026";

export const nexusWorkbookPeriods: readonly NexusMonitoringPeriodRecord[] = [
  {
    id: NEXUS_EVALUATION_PERIOD,
    origin: "workbook",
    year: Number(NEXUS_EVALUATION_PERIOD),
  },
];

/** Versi pertama setiap target, diambil apa adanya dari workbook KM 2026. */
export const nexusWorkbookTargetVersions: readonly NexusIndicatorTargetVersion[] =
  nexusEvaluationTargetSeeds.map((seed) => ({
    actorName: WORKBOOK_ACTOR,
    id: `TGT-${NEXUS_EVALUATION_PERIOD}-${seed.indicatorId}-1`,
    indicatorId: seed.indicatorId,
    literal: seed.literal,
    origin: "workbook",
    periodId: NEXUS_EVALUATION_PERIOD,
    reason: seed.reference,
    recordedAt: null,
    value: seed.value,
    version: 1,
  }));

/** Versi target terbaru sebuah indikator pada satu periode. */
export function nexusCurrentTargetVersion(
  versions: readonly NexusIndicatorTargetVersion[],
  periodId: string,
  indicatorId: NexusKmIndicatorId,
): NexusIndicatorTargetVersion | undefined {
  let current: NexusIndicatorTargetVersion | undefined;
  for (const version of versions) {
    if (version.periodId !== periodId || version.indicatorId !== indicatorId) {
      continue;
    }
    if (!current || version.version > current.version) current = version;
  }
  return current;
}

/**
 * Target yang berlaku untuk setiap indikator pada satu periode. Indikator
 * tanpa versi target dibaca sebagai target belum tersedia, bukan target nol.
 */
export function nexusTargetLookup(
  versions: readonly NexusIndicatorTargetVersion[],
  periodId: string,
): NexusMonitoringTargetLookup {
  const byIndicator = new Map<NexusKmIndicatorId, NexusIndicatorTarget>();
  for (const version of versions) {
    if (version.periodId !== periodId) continue;
    const current = nexusCurrentTargetVersion(
      versions,
      periodId,
      version.indicatorId,
    );
    if (current && !byIndicator.has(version.indicatorId)) {
      byIndicator.set(version.indicatorId, {
        literal: current.literal,
        reference:
          current.origin === "workbook"
            ? current.reason
            : `Target versi ${current.version} · ${current.actorName}`,
        value: current.value,
        version: current.version,
      });
    }
  }

  return (indicatorId) =>
    byIndicator.get(indicatorId) ?? {
      literal: null,
      reference: `Target periode ${periodId} belum ditetapkan`,
      value: null,
      version: 0,
    };
}

/** Riwayat target satu periode, terbaru lebih dahulu. */
export function nexusTargetHistory(
  versions: readonly NexusIndicatorTargetVersion[],
  periodId: string,
  indicatorId?: NexusKmIndicatorId,
): readonly NexusIndicatorTargetVersion[] {
  return versions
    .filter(
      (version) =>
        version.periodId === periodId &&
        (indicatorId === undefined || version.indicatorId === indicatorId),
    )
    .sort(
      (first, second) =>
        (second.recordedAt ?? "").localeCompare(first.recordedAt ?? "") ||
        second.version - first.version ||
        first.indicatorId.localeCompare(second.indicatorId, "id-ID", {
          numeric: true,
        }),
    );
}

/** Nilai target untuk ditampilkan, termasuk target gabungan seperti `9/1M`. */
export function nexusTargetDisplay(target: {
  literal: string | null;
  value: number | null;
}) {
  if (target.value !== null) return String(target.value);
  if (target.literal !== null) return target.literal;
  return "Belum ditetapkan";
}
