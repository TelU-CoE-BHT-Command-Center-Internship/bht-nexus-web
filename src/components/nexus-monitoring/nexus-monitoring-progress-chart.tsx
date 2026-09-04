"use client";

import { type CSSProperties, useState } from "react";
import styles from "@/components/nexus-monitoring/nexus-monitoring.module.css";

/**
 * Satu titik capaian indikator. Bentuk ini sengaja netral supaya Ringkasan
 * seluruh domain dan pemantauan satu domain memakai grafik yang sama tanpa
 * masing-masing menyusun capaiannya sendiri.
 */
export type MonitoringProgressPoint = {
  id: string;
  /** Nama panjang indikator; dipakai judul baris, bukan sumbu. */
  label: string;
  /** Rasio realisasi terhadap target dalam persen; boleh melebihi 100. */
  progressPercent: number | null;
  realization: number | null;
  status: MonitoringProgressStatus;
  target: number | null;
};

export type MonitoringProgressStatus =
  | "not-reached"
  | "reached"
  | "unavailable";

const statusLabels: Record<MonitoringProgressStatus, string> = {
  "not-reached": "Belum tercapai",
  reached: "Tercapai",
  unavailable: "Belum dihitung",
};

type ProgressLegendTone = "reached" | "remaining" | "reported" | "unavailable";

const legendItems: readonly {
  label: string;
  tone: ProgressLegendTone;
}[] = [
  { label: "Tercapai", tone: "reached" },
  { label: "Realisasi", tone: "reported" },
  { label: "Sisa target", tone: "remaining" },
  { label: "Belum dihitung", tone: "unavailable" },
];

const initialVisibleTones = new Set<ProgressLegendTone>(
  legendItems.map((item) => item.tone),
);

function chartDensity(count: number) {
  if (count >= 8) return "dense";
  if (count <= 2) return "sparse";
  return "regular";
}

function progressSegments(point: MonitoringProgressPoint) {
  if (point.status === "unavailable") {
    return { remaining: 0, reported: 0, unavailable: 100 };
  }
  if (point.status === "reached") {
    return { remaining: 0, reported: 100, unavailable: 0 };
  }

  const reported = Math.min(Math.max(point.progressPercent ?? 0, 0), 100);
  return { remaining: 100 - reported, reported, unavailable: 0 };
}

function progressDescription(point: MonitoringProgressPoint) {
  if (point.status === "unavailable") {
    return `${point.id}: capaian belum dapat dihitung.`;
  }
  return `${point.id}: realisasi ${point.realization ?? 0} dari target ${point.target ?? "belum tersedia"}; ${point.progressPercent ?? 0}% dari target.`;
}

/**
 * Batang capaian per indikator. Geometrinya berhenti di 100% supaya seluruh
 * indikator tetap sebanding, sedangkan angka di kanan tetap menyebut capaian
 * sebenarnya—termasuk ketika target sudah terlampaui.
 */
export function MonitoringProgressChart({
  label,
  points,
  scopeKey,
}: {
  label: string;
  points: readonly MonitoringProgressPoint[];
  /** Penanda kumpulan data aktif supaya animasi baris diputar ulang saat berganti. */
  scopeKey: string;
}) {
  const [visibleTones, setVisibleTones] = useState(
    () => new Set(initialVisibleTones),
  );
  const density = chartDensity(points.length);
  const toggleTone = (tone: ProgressLegendTone) => {
    setVisibleTones((current) => {
      const next = new Set(current);
      if (next.has(tone)) next.delete(tone);
      else next.add(tone);
      return next;
    });
  };

  return (
    <>
      <div
        aria-label={label}
        className={styles.categoryProgressViewport}
        data-density={density}
        role="img"
      >
        <ul className={styles.categoryProgressRows}>
          {points.map((point, index) => {
            const segments = progressSegments(point);
            return (
              <li
                className={styles.categoryProgressRow}
                key={`${scopeKey}-${point.id}`}
                style={{ "--row-index": index } as CSSProperties}
                title={`${point.id} · ${point.label}`}
              >
                <span className={styles.categoryProgressLabel}>{point.id}</span>
                <span
                  aria-label={`Capaian ${point.id}`}
                  aria-valuemax={100}
                  aria-valuemin={0}
                  aria-valuenow={
                    point.status === "unavailable"
                      ? undefined
                      : Math.min(point.progressPercent ?? 0, 100)
                  }
                  aria-valuetext={progressDescription(point)}
                  className={styles.categoryProgressTrack}
                  role="progressbar"
                >
                  <span
                    className={styles.categoryProgressReached}
                    style={{
                      display: visibleTones.has("reached") ? undefined : "none",
                      width:
                        point.status === "reached"
                          ? `${segments.reported}%`
                          : "0%",
                    }}
                  />
                  <span
                    className={styles.categoryProgressReported}
                    style={{
                      display: visibleTones.has("reported")
                        ? undefined
                        : "none",
                      width:
                        point.status === "not-reached"
                          ? `${segments.reported}%`
                          : "0%",
                    }}
                  />
                  <span
                    className={styles.categoryProgressRemaining}
                    style={{
                      display: visibleTones.has("remaining")
                        ? undefined
                        : "none",
                      width: `${segments.remaining}%`,
                    }}
                  />
                  <span
                    className={styles.categoryProgressUnavailable}
                    style={{
                      display: visibleTones.has("unavailable")
                        ? undefined
                        : "none",
                      width: `${segments.unavailable}%`,
                    }}
                  />
                </span>
                <span
                  className={styles.categoryProgressValue}
                  data-status={point.status}
                >
                  {point.progressPercent === null
                    ? "—"
                    : `${point.progressPercent}%`}
                  <span className={styles.visuallyHidden}>
                    {statusLabels[point.status]}
                  </span>
                </span>
              </li>
            );
          })}
        </ul>
      </div>
      <fieldset className={styles.categoryProgressLegend}>
        <legend className={styles.visuallyHidden}>
          Atur segmen capaian yang ditampilkan
        </legend>
        {legendItems.map((item) => (
          <button
            aria-pressed={visibleTones.has(item.tone)}
            data-tone={item.tone}
            key={item.tone}
            onClick={() => toggleTone(item.tone)}
            type="button"
          >
            {item.label}
          </button>
        ))}
      </fieldset>
    </>
  );
}
