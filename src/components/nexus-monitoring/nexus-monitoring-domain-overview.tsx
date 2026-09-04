"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import styles from "@/components/nexus-monitoring/nexus-monitoring.module.css";
import { MonitoringComposition } from "@/components/nexus-monitoring/nexus-monitoring-composition";
import {
  MonitoringProgressChart,
  type MonitoringProgressPoint,
} from "@/components/nexus-monitoring/nexus-monitoring-progress-chart";
import { NexusMonitoringRecentUpdates } from "@/components/nexus-monitoring/nexus-monitoring-recent-updates";
import {
  MonitoringCard,
  MonitoringChartSummary,
  MonitoringDistributionList,
  MonitoringMetricCard,
  MonitoringUnavailable,
} from "@/components/nexus-monitoring/nexus-monitoring-ui";
import type { NexusMonitoringUpdate } from "@/components/nexus-monitoring/nexus-monitoring-updates";
import type {
  MonitoringDomainView,
  MonitoringIndicatorSummary,
} from "@/components/nexus-monitoring/nexus-monitoring-view";
import { NexusWorkspaceEmptyState } from "@/components/nexus-workspace-ui/nexus-workspace-elements";
import {
  NexusWorkspaceMobileCard,
  NexusWorkspaceRecordTable,
  NexusWorkspaceTableBadge,
  NexusWorkspaceTablePrimary,
  nexusWorkspaceRecordStyles as recordStyles,
} from "@/components/nexus-workspace-ui/nexus-workspace-records";

type StatusFilter = "belum" | "semua" | "tercapai" | "tidak-dapat-dihitung";

/** Banyaknya selisih terbesar yang ditampilkan; sisanya tetap ada di tabel. */
const GAP_LIMIT = 5;

const statusFilters: readonly { id: StatusFilter; label: string }[] = [
  { id: "semua", label: "Semua" },
  { id: "tercapai", label: "Tercapai" },
  { id: "belum", label: "Belum tercapai" },
  { id: "tidak-dapat-dihitung", label: "Belum dapat dihitung" },
];

function ArrowRightIcon() {
  return (
    <svg aria-hidden="true" fill="none" viewBox="0 0 20 20">
      <path d="M4 10h12M10.5 4.5 16 10l-5.5 5.5" />
    </svg>
  );
}

function matchesFilter(
  indicator: MonitoringIndicatorSummary,
  filter: StatusFilter,
) {
  if (filter === "semua") return true;
  if (filter === "tercapai") return indicator.status === "tercapai";
  if (filter === "tidak-dapat-dihitung") {
    return indicator.status === "belum-dapat-dihitung";
  }
  return (
    indicator.status === "belum-tercapai" ||
    indicator.status === "belum-ada-realisasi" ||
    indicator.status === "target-belum-tersedia"
  );
}

/**
 * Capaian satu indikator sebagai titik grafik. Indikator yang capaiannya belum
 * dapat dihitung tetap mendapat baris sendiri supaya ketiadaan angka terbaca
 * sebagai belum dihitung, bukan sebagai capaian nol.
 */
function progressPoint(
  indicator: MonitoringIndicatorSummary,
): MonitoringProgressPoint {
  return {
    id: indicator.id,
    label: indicator.label,
    progressPercent: indicator.progressPercent,
    realization: indicator.realization,
    status:
      indicator.progressPercent === null
        ? "unavailable"
        : indicator.status === "tercapai"
          ? "reached"
          : "not-reached",
    target: indicator.target,
  };
}

function percentLabel(share: number) {
  return `${Math.round(share * 100)}%`;
}

/**
 * Target apa adanya. Workbook memakai satu angka untuk hampir semua indikator,
 * tetapi ada target gabungan seperti `9/1M` yang ditampilkan utuh dan tidak
 * dipecah menjadi angka pembanding.
 */
function targetLabel(indicator: MonitoringIndicatorSummary) {
  if (indicator.target !== null) return String(indicator.target);
  return indicator.targetLiteral ?? "Belum tersedia";
}

/**
 * Ikhtisar satu domain KM di dalam kerangka Monitoring. Komponen ini adalah
 * satu-satunya susunan ikhtisar domain: halaman Ringkasan dan alamat
 * `/nexus/monitoring/<domain>` memakai komponen yang sama, sehingga tidak ada
 * dua kebenaran untuk satu domain.
 */
export function NexusMonitoringDomainOverview({
  periodLabel,
  updates,
  view,
}: {
  periodLabel: string;
  updates: readonly NexusMonitoringUpdate[];
  view: MonitoringDomainView;
}) {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("semua");

  const filtered = useMemo(
    () =>
      view.indicators.filter((indicator) =>
        matchesFilter(indicator, statusFilter),
      ),
    [statusFilter, view.indicators],
  );
  const domainUpdates = useMemo(
    () => updates.filter((update) => update.domains.includes(view.category)),
    [updates, view.category],
  );

  const computableShare = view.total === 0 ? 0 : view.computable / view.total;
  const visibleGaps = view.gaps.slice(0, GAP_LIMIT);
  const hiddenGaps = view.gaps.length - visibleGaps.length;
  /* Rumah data yang benar-benar menyumbang rekam, bukan sekadar yang dirujuk. */
  const contributingHouses = view.sources.filter(
    (source) => source.records > 0,
  ).length;

  return (
    <>
      <div className={styles.summaryMetricGrid}>
        <MonitoringMetricCard
          detail={`${view.indicatorRange} · ${periodLabel}`}
          icon="chart"
          label={`Indikator ${view.label}`}
          tone="blue"
          unit="indikator"
          value={view.total}
          variant="summary"
        />
        <MonitoringMetricCard
          detail={`${percentLabel(computableShare)} cakupan indikator`}
          icon="database"
          label="Indikator dapat dihitung"
          tone="green"
          unit={`dari ${view.total}`}
          value={view.computable}
          variant="summary"
        />
        <MonitoringMetricCard
          detail={`${percentLabel(view.reachedShare)} dari indikator terhitung`}
          icon="target"
          label="Mencapai target"
          tone="gold"
          unit={`dari ${view.computable}`}
          value={view.reached}
          variant="summary"
        />
        <MonitoringMetricCard
          detail={`${contributingHouses} rumah data · ${periodLabel}`}
          icon="document"
          label="Rekam resmi pembentuk"
          tone="violet"
          unit="rekam"
          value={view.contributingRecords}
          variant="summary"
        />
      </div>

      <div className={styles.monitoringSection}>
        <MonitoringCard
          actions={
            <span className={styles.summaryChartUnit}>
              Capaian terhadap target
            </span>
          }
          description={`Setiap indikator dibandingkan dengan targetnya sendiri pada ${periodLabel}. Target seluruh indikator tidak dijumlahkan menjadi satu angka ${view.label}.`}
          headingId="monitoring-domain-progress"
          title="Pemenuhan Target per Indikator"
        >
          <MonitoringProgressChart
            label={`Capaian ${view.total} indikator ${view.label} terhadap targetnya masing-masing pada ${periodLabel}`}
            points={view.indicators.map(progressPoint)}
            scopeKey={view.category}
          />
        </MonitoringCard>
      </div>

      <div className={styles.insightGrid}>
        <MonitoringCard
          description={`Rekam resmi berbeda yang membentuk realisasi indikator ${view.label} pada ${periodLabel}, menurut rumah data resminya.`}
          fill
          headingId="monitoring-domain-sources"
          title="Sebaran Rekam Pembentuk"
        >
          {view.sources.length === 0 ? (
            <MonitoringUnavailable
              description={`Belum ada rekam resmi yang dikaitkan dengan indikator ${view.label} pada periode ini.`}
              title="Belum ada sumber realisasi"
            />
          ) : (
            <MonitoringComposition
              centerLabel="rekam"
              chartLabel={`Komposisi ${view.contributingRecords} rekam resmi pembentuk realisasi ${view.label} menurut rumah datanya`}
              items={view.sources.map((source) => ({
                detail: `${source.indicators} indikator`,
                href: source.href,
                id: source.id,
                label: source.label,
                share: source.share,
                value: source.records,
              }))}
              unitLabel="rekam"
            />
          )}
        </MonitoringCard>

        <MonitoringCard
          description="Indikator yang realisasinya masih di bawah target, diurutkan dari selisih terbesar. Batangnya menunjukkan capaian terhadap target, angkanya menunjukkan kekurangannya."
          fill
          headingId="monitoring-domain-gaps"
          title="Gap Target Terbesar"
        >
          {view.gaps.length === 0 ? (
            <MonitoringUnavailable
              description={`Seluruh indikator ${view.label} yang dapat dihitung sudah mencapai targetnya pada periode ini.`}
              title="Tidak ada selisih terhadap target"
            />
          ) : (
            <>
              <MonitoringDistributionList
                items={visibleGaps.map((gap) => ({
                  detail: `Realisasi ${gap.realization} dari target ${gap.target} · ${gap.progressPercent ?? 0}% tercapai`,
                  href: gap.detailHref,
                  id: gap.id,
                  label: `${gap.id} · ${gap.label}`,
                  share: (gap.progressPercent ?? 0) / 100,
                  value: gap.gap,
                }))}
                valueLabel={(item) => `kurang ${item.value}`}
              />
              {hiddenGaps > 0 ? (
                <MonitoringChartSummary>
                  {`${hiddenGaps} indikator lain juga masih di bawah target dengan selisih lebih kecil; seluruhnya tercantum pada Capaian Indikator ${view.label}.`}
                </MonitoringChartSummary>
              ) : null}
            </>
          )}
        </MonitoringCard>
      </div>

      <div className={styles.monitoringSection}>
        <MonitoringCard
          actions={
            <fieldset className={styles.segment}>
              <legend className={styles.visuallyHidden}>
                Saring indikator menurut status
              </legend>
              {statusFilters.map((filter) => (
                <button
                  aria-pressed={filter.id === statusFilter}
                  data-active={filter.id === statusFilter}
                  key={filter.id}
                  onClick={() => setStatusFilter(filter.id)}
                  type="button"
                >
                  {filter.label}
                </button>
              ))}
            </fieldset>
          }
          description={`Menampilkan ${filtered.length} dari ${view.indicators.length} indikator ${view.label}. Buka rincian untuk menelusuri rekam resmi pembentuk realisasinya.`}
          headingId="monitoring-domain-indicators"
          inlineHeader={false}
          title={`Capaian Indikator ${view.label}`}
        >
          <div className={styles.tableSurface}>
            <NexusWorkspaceRecordTable
              caption={`Target, realisasi, capaian, dan status indikator ${view.label}`}
              columns={[
                { id: "indicator", label: "Indikator", primary: true },
                { id: "house", label: "Rumah data" },
                { id: "target", label: "Target" },
                { id: "realization", label: "Realisasi" },
                { id: "progress", label: "Capaian" },
                { id: "status", label: "Status" },
                { id: "action", label: "Rincian" },
              ]}
              empty={
                <NexusWorkspaceEmptyState
                  description={`Tidak ada indikator ${view.label} dengan status tersebut pada periode ini.`}
                  onResetFilters={() => setStatusFilter("semua")}
                  title="Tidak ada indikator yang cocok"
                />
              }
              pagination={null}
              rows={filtered.map((indicator) => ({
                cells: {
                  action: (
                    <Link
                      className={styles.inlineLink}
                      href={indicator.detailHref}
                      prefetch={false}
                    >
                      {`Buka ${indicator.id}`}
                      <ArrowRightIcon />
                    </Link>
                  ),
                  house: indicator.houseLabel,
                  indicator: (
                    <NexusWorkspaceTablePrimary
                      subtitle={indicator.label}
                      title={indicator.id}
                    />
                  ),
                  progress:
                    indicator.progressPercent === null
                      ? "Belum dapat dihitung"
                      : `${indicator.progressPercent}%`,
                  realization:
                    indicator.realization === null
                      ? "Belum dapat dihitung"
                      : `${indicator.realization}`,
                  status: (
                    <NexusWorkspaceTableBadge tone={indicator.statusTone}>
                      {indicator.statusLabel}
                    </NexusWorkspaceTableBadge>
                  ),
                  target: targetLabel(indicator),
                },
                id: indicator.id,
                mobile: (
                  <NexusWorkspaceMobileCard
                    action={
                      <Link
                        className={recordStyles.mobileAction}
                        href={indicator.detailHref}
                        prefetch={false}
                      >
                        {`Buka rincian ${indicator.id}`}
                        <ArrowRightIcon />
                      </Link>
                    }
                    eyebrow={
                      <NexusWorkspaceTableBadge tone={indicator.statusTone}>
                        {indicator.statusLabel}
                      </NexusWorkspaceTableBadge>
                    }
                    meta={
                      <dl>
                        <div>
                          <dt>Target</dt>
                          <dd>{targetLabel(indicator)}</dd>
                        </div>
                        <div>
                          <dt>Realisasi</dt>
                          <dd>
                            {indicator.realization === null
                              ? "Belum dapat dihitung"
                              : indicator.realization}
                          </dd>
                        </div>
                        <div>
                          <dt>Capaian</dt>
                          <dd>
                            {indicator.progressPercent === null
                              ? "Belum dapat dihitung"
                              : `${indicator.progressPercent}%`}
                          </dd>
                        </div>
                        <div>
                          <dt>Rumah data</dt>
                          <dd>{indicator.houseLabel}</dd>
                        </div>
                      </dl>
                    }
                    title={`${indicator.id} · ${indicator.label}`}
                  />
                ),
              }))}
            />
          </div>
          {view.notes.length > 0 ? (
            <ul className={styles.computabilityNotes}>
              {view.notes.map((note) => (
                <li key={note}>{note}</li>
              ))}
            </ul>
          ) : null}
        </MonitoringCard>
      </div>

      <NexusMonitoringRecentUpdates
        description={`Data Resmi terakhir yang terkait indikator ${view.label}.`}
        emptyDescription={`Pembaruan akan muncul setelah Data Resmi dikaitkan dengan indikator ${view.label}.`}
        headingId="monitoring-domain-recent-updates"
        title={`Pembaruan Data ${view.label} Terbaru`}
        updates={domainUpdates}
      />
    </>
  );
}
