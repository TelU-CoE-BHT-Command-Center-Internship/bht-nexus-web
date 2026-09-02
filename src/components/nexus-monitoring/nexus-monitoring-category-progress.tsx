"use client";

import { type CSSProperties, useState } from "react";
import styles from "@/components/nexus-monitoring/nexus-monitoring.module.css";
import type { NexusMonitoringDomain } from "@/components/nexus-monitoring/nexus-monitoring-domains";
import type {
  NexusMonitoringIndicatorProgress,
  NexusMonitoringIndicatorProgressStatus,
} from "@/components/nexus-monitoring/nexus-monitoring-indicator-progress";
import { MonitoringCard } from "@/components/nexus-monitoring/nexus-monitoring-ui";
import {
  type NexusSelectConfig,
  NexusWorkspaceSelect,
} from "@/components/nexus-workspace-ui/nexus-workspace-select";
import type { NexusKmIndicatorCategory } from "@/content/nexus-km-indicators";

const DEFAULT_CATEGORY: NexusKmIndicatorCategory = "Riset";

const statusLabels: Record<NexusMonitoringIndicatorProgressStatus, string> = {
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

function progressSegments(indicator: NexusMonitoringIndicatorProgress) {
  if (indicator.status === "unavailable") {
    return { remaining: 0, reported: 0, unavailable: 100 };
  }
  if (indicator.status === "reached") {
    return { remaining: 0, reported: 100, unavailable: 0 };
  }

  const reported = Math.min(Math.max(indicator.progressPercent ?? 0, 0), 100);
  return { remaining: 100 - reported, reported, unavailable: 0 };
}

function progressDescription(indicator: NexusMonitoringIndicatorProgress) {
  if (indicator.status === "unavailable") {
    return `${indicator.id}: capaian belum dapat dihitung.`;
  }
  return `${indicator.id}: realisasi ${indicator.realization ?? 0} dari target ${indicator.target ?? "belum tersedia"}; ${indicator.progressPercent ?? 0}% dari target.`;
}

function domainOption(domain: NexusMonitoringDomain) {
  return {
    label: `${domain.chartLabel} · ${domain.indicators} indikator`,
    value: domain.id,
  };
}

export function NexusMonitoringCategoryProgress({
  domains,
  indicators,
}: {
  domains: readonly NexusMonitoringDomain[];
  indicators: readonly NexusMonitoringIndicatorProgress[];
}) {
  const [category, setCategory] =
    useState<NexusKmIndicatorCategory>(DEFAULT_CATEGORY);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [visibleTones, setVisibleTones] = useState(
    () => new Set(initialVisibleTones),
  );
  const categoryDomains = domains.filter((domain) => Boolean(domain.category));
  const [firstDomain, ...otherDomains] = categoryDomains;
  const selectConfig: NexusSelectConfig = {
    defaultValue: DEFAULT_CATEGORY,
    id: "monitoring-progress-category",
    label: "Pilih kategori indikator",
    options: firstDomain
      ? [domainOption(firstDomain), ...otherDomains.map(domainOption)]
      : [{ label: "Riset · 10 indikator", value: DEFAULT_CATEGORY }],
  };
  const activeDomain =
    categoryDomains.find((domain) => domain.category === category) ??
    categoryDomains[0];
  const visibleIndicators = indicators.filter(
    (indicator) => indicator.category === activeDomain?.category,
  );
  const density = chartDensity(visibleIndicators.length);
  const toggleTone = (tone: ProgressLegendTone) => {
    setVisibleTones((current) => {
      const next = new Set(current);
      if (next.has(tone)) next.delete(tone);
      else next.add(tone);
      return next;
    });
  };

  return (
    <div className={styles.categoryProgress}>
      <MonitoringCard
        actions={
          <div className={styles.categoryProgressSelect}>
            <NexusWorkspaceSelect
              config={selectConfig}
              isOpen={isCategoryOpen}
              name="monitoring-progress-category"
              onOpenChange={setIsCategoryOpen}
              onValueChange={(value) => {
                setCategory(value as NexusKmIndicatorCategory);
              }}
              placement="top-on-narrow"
              value={category}
            />
          </div>
        }
        description={`Capaian setiap indikator dalam kategori ${activeDomain?.label ?? category}.`}
        headingId="monitoring-category-progress-title"
        title="Capaian Indikator per Kategori"
      >
        <div
          aria-label={`Capaian ${visibleIndicators.length} indikator kategori ${activeDomain?.label ?? category}`}
          className={styles.categoryProgressViewport}
          data-density={density}
          role="img"
        >
          <ul className={styles.categoryProgressRows}>
            {visibleIndicators.map((indicator, index) => {
              const segments = progressSegments(indicator);
              const description = progressDescription(indicator);
              return (
                <li
                  className={styles.categoryProgressRow}
                  key={`${category}-${indicator.id}`}
                  style={{ "--row-index": index } as CSSProperties}
                  title={`${indicator.id} · ${indicator.label}`}
                >
                  <span className={styles.categoryProgressLabel}>
                    {indicator.id}
                  </span>
                  <span
                    aria-label={`Capaian ${indicator.id}`}
                    aria-valuemax={100}
                    aria-valuemin={0}
                    aria-valuenow={
                      indicator.status === "unavailable"
                        ? undefined
                        : Math.min(indicator.progressPercent ?? 0, 100)
                    }
                    aria-valuetext={description}
                    className={styles.categoryProgressTrack}
                    role="progressbar"
                  >
                    <span
                      className={styles.categoryProgressReached}
                      style={{
                        width:
                          indicator.status === "reached"
                            ? `${segments.reported}%`
                            : "0%",
                        display: visibleTones.has("reached")
                          ? undefined
                          : "none",
                      }}
                    />
                    <span
                      className={styles.categoryProgressReported}
                      style={{
                        width:
                          indicator.status === "not-reached"
                            ? `${segments.reported}%`
                            : "0%",
                        display: visibleTones.has("reported")
                          ? undefined
                          : "none",
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
                    data-status={indicator.status}
                  >
                    {indicator.progressPercent === null
                      ? "—"
                      : `${indicator.progressPercent}%`}
                    <span className={styles.visuallyHidden}>
                      {statusLabels[indicator.status]}
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
      </MonitoringCard>
    </div>
  );
}
