"use client";

import { useState } from "react";
import styles from "@/components/nexus-monitoring/nexus-monitoring.module.css";
import type { NexusMonitoringDomain } from "@/components/nexus-monitoring/nexus-monitoring-domains";
import type { NexusMonitoringIndicatorProgress } from "@/components/nexus-monitoring/nexus-monitoring-indicator-progress";
import {
  MonitoringProgressChart,
  type MonitoringProgressPoint,
} from "@/components/nexus-monitoring/nexus-monitoring-progress-chart";
import { MonitoringCard } from "@/components/nexus-monitoring/nexus-monitoring-ui";
import {
  type NexusSelectConfig,
  NexusWorkspaceSelect,
} from "@/components/nexus-workspace-ui/nexus-workspace-select";
import type { NexusKmIndicatorCategory } from "@/content/nexus-km-indicators";

const DEFAULT_CATEGORY: NexusKmIndicatorCategory = "Riset";

function domainOption(domain: NexusMonitoringDomain) {
  return {
    label: `${domain.chartLabel} · ${domain.indicators} indikator`,
    value: domain.id,
  };
}

function progressPoint(
  indicator: NexusMonitoringIndicatorProgress,
): MonitoringProgressPoint {
  return {
    id: indicator.id,
    label: indicator.label,
    progressPercent: indicator.progressPercent,
    realization: indicator.realization,
    status: indicator.status,
    target: indicator.target,
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
  const categoryLabel = activeDomain?.label ?? category;

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
        description={`Capaian setiap indikator dalam kategori ${categoryLabel}.`}
        headingId="monitoring-category-progress-title"
        title="Capaian Indikator per Kategori"
      >
        <MonitoringProgressChart
          label={`Capaian ${visibleIndicators.length} indikator kategori ${categoryLabel}`}
          points={visibleIndicators.map(progressPoint)}
          scopeKey={category}
        />
      </MonitoringCard>
    </div>
  );
}
