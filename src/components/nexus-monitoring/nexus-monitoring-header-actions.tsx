"use client";

import { useState } from "react";
import styles from "@/components/nexus-monitoring/nexus-monitoring.module.css";
import type { NexusMonitoringPeriod } from "@/components/nexus-monitoring/nexus-monitoring-period";
import { NexusWorkspaceButton } from "@/components/nexus-workspace-ui/nexus-workspace-elements";
import {
  type NexusSelectConfig,
  NexusWorkspaceSelect,
} from "@/components/nexus-workspace-ui/nexus-workspace-select";

function CalendarIcon() {
  return (
    <svg aria-hidden="true" fill="none" viewBox="0 0 24 24">
      <rect height="15.5" rx="2.2" width="17" x="3.5" y="5" />
      <path d="M8 3.5v3.6M16 3.5v3.6M3.5 10.4h17" />
    </svg>
  );
}

function TargetIcon() {
  return (
    <svg aria-hidden="true" fill="none" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="8" />
      <circle cx="12" cy="12" r="4" />
      <path d="M12 12h.01" />
    </svg>
  );
}

function DownloadIcon() {
  return (
    <svg aria-hidden="true" fill="none" viewBox="0 0 24 24">
      <path d="M12 4v11m0 0 4.5-4.5M12 15l-4.5-4.5M5 19.5h14" />
    </svg>
  );
}

function periodSelectOption(option: NexusMonitoringPeriod) {
  return {
    description: option.rangeLabel,
    label: option.label,
    value: option.id,
  };
}

/**
 * Tindakan kanan atas Monitoring KM: pemilih periode, pengelolaan target, dan
 * unduhan laporan. Ketiganya berada di satu tempat supaya pengelola tidak perlu
 * berpindah halaman untuk menyesuaikan target periode yang sedang dilihat.
 */
export function NexusMonitoringHeaderActions({
  downloadLabel,
  manageLabel,
  onDownload,
  onManageTargets,
  onPeriodChange,
  period,
  periodOptions,
}: {
  downloadLabel: string;
  manageLabel: string;
  /** Tidak diisi ketika periode belum terdaftar sehingga tidak ada yang diunduh. */
  onDownload?: () => void;
  /** Tidak diisi ketika akun tidak berwenang mengelola target. */
  onManageTargets?: () => void;
  onPeriodChange: (periodId: string) => void;
  period: NexusMonitoringPeriod;
  periodOptions: readonly NexusMonitoringPeriod[];
}) {
  const [isOpen, setIsOpen] = useState(false);
  const options = periodOptions.some((option) => option.id === period.id)
    ? periodOptions
    : [period, ...periodOptions];
  const config: NexusSelectConfig = {
    defaultValue: period.id,
    id: "period",
    label: "Pilih periode evaluasi",
    options: [
      periodSelectOption(options[0] ?? period),
      ...options.slice(1).map(periodSelectOption),
    ],
  };

  return (
    <div className={styles.headerActions}>
      <div className={styles.summaryPeriod}>
        <NexusWorkspaceSelect
          config={config}
          isOpen={isOpen}
          leadingIcon={<CalendarIcon />}
          name="monitoring-period"
          onOpenChange={setIsOpen}
          onValueChange={onPeriodChange}
          value={period.id}
        />
      </div>
      {onManageTargets ? (
        <NexusWorkspaceButton onClick={onManageTargets} type="button">
          <TargetIcon />
          {manageLabel}
        </NexusWorkspaceButton>
      ) : null}
      {onDownload ? (
        <NexusWorkspaceButton onClick={onDownload} type="button">
          <DownloadIcon />
          {downloadLabel}
        </NexusWorkspaceButton>
      ) : null}
    </div>
  );
}
