"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import styles from "@/components/nexus-monitoring/nexus-monitoring.module.css";
import {
  MonitoringBarChart,
  MonitoringColumnChart,
  MonitoringRadialChart,
} from "@/components/nexus-monitoring/nexus-monitoring-charts";
import { NEXUS_MONITORING_HREF } from "@/components/nexus-monitoring/nexus-monitoring-evaluation";
import { MonitoringNumber } from "@/components/nexus-monitoring/nexus-monitoring-number";
import {
  MonitoringBadge,
  MonitoringCard,
  MonitoringChartFrame,
  MonitoringChartSummary,
  MonitoringDistributionList,
  MonitoringMetricCard,
  MonitoringUnavailable,
  MonitoringValueTable,
} from "@/components/nexus-monitoring/nexus-monitoring-ui";
import type {
  MonitoringIndicatorSummary,
  MonitoringRisetView,
} from "@/components/nexus-monitoring/nexus-monitoring-view";
import { NexusWorkspaceBreadcrumb } from "@/components/nexus-workspace-ui/nexus-workspace-breadcrumb";
import { NexusWorkspaceEmptyState } from "@/components/nexus-workspace-ui/nexus-workspace-elements";
import { NexusWorkspacePage } from "@/components/nexus-workspace-ui/nexus-workspace-page";
import {
  NexusWorkspaceMobileCard,
  NexusWorkspaceRecordTable,
  NexusWorkspaceTableBadge,
  NexusWorkspaceTablePrimary,
  nexusWorkspaceRecordStyles as recordStyles,
} from "@/components/nexus-workspace-ui/nexus-workspace-records";

type StatusFilter = "belum" | "semua" | "tercapai" | "tidak-dapat-dihitung";
type SecondaryView = "capaian" | "rekam";

const statusFilters: readonly { id: StatusFilter; label: string }[] = [
  { id: "semua", label: "Semua" },
  { id: "tercapai", label: "Tercapai" },
  { id: "belum", label: "Belum tercapai" },
  { id: "tidak-dapat-dihitung", label: "Belum dapat dihitung" },
];

const secondaryViews: readonly {
  description: string;
  id: SecondaryView;
  label: string;
  title: string;
}[] = [
  {
    description:
      "Perbandingan realisasi terhadap target masing-masing indikator, dalam persen. Nilai di atas 100% berarti realisasinya melampaui target.",
    id: "capaian",
    label: "Capaian target",
    title: "Capaian terhadap target per indikator",
  },
  {
    description:
      "Jumlah rekam resmi yang membentuk realisasi setiap indikator pada periode evaluasi ini.",
    id: "rekam",
    label: "Rekam pembentuk",
    title: "Rekam resmi pembentuk realisasi per indikator",
  },
];

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

export function NexusMonitoringRiset({ view }: { view: MonitoringRisetView }) {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("semua");
  const [secondaryView, setSecondaryView] = useState<SecondaryView>("capaian");

  const filtered = useMemo(
    () =>
      view.indicators.filter((indicator) =>
        matchesFilter(indicator, statusFilter),
      ),
    [statusFilter, view.indicators],
  );

  const secondary =
    secondaryViews.find((item) => item.id === secondaryView) ??
    secondaryViews[0];

  const secondaryPoints = view.indicators.map((indicator) => ({
    id: indicator.id,
    label: indicator.id,
    value:
      secondaryView === "capaian"
        ? indicator.progressPercent
        : (indicator.realization ?? null),
  }));

  const reachedPercent = Math.round(view.reachedShare * 100);
  const totalTarget = view.indicators.reduce(
    (sum, indicator) => sum + (indicator.target ?? 0),
    0,
  );
  const totalRealization = view.indicators.reduce(
    (sum, indicator) => sum + (indicator.realization ?? 0),
    0,
  );

  return (
    <NexusWorkspacePage
      description="Capaian indikator KM kategori Riset pada periode evaluasi berjalan, dihitung dari data resmi BHT Nexus dan dapat ditelusuri sampai rekam pembentuknya."
      descriptionId="monitoring-riset-description"
      meta={`Periode evaluasi ${view.period}`}
      title="Monitoring KM · Riset"
      titleId="monitoring-riset-title"
    >
      <NexusWorkspaceBreadcrumb
        current="Riset"
        trail={[{ href: NEXUS_MONITORING_HREF, label: "Monitoring KM" }]}
      />

      <div className={styles.grid}>
        <div className={styles.spanMain}>
          <div className={styles.metricGrid}>
            <MonitoringMetricCard
              badge={{ label: `Periode ${view.period}` }}
              icon="chart"
              label="Indikator Riset dipantau"
              value={view.total}
            />
            <MonitoringMetricCard
              badge={{
                label: `${view.sources.length} rumah data resmi`,
              }}
              icon="database"
              label="Rekam resmi pembentuk realisasi"
              value={view.contributingRecords}
            />
          </div>

          <MonitoringCard
            description="Setiap indikator dibandingkan dengan targetnya sendiri. Target seluruh indikator tidak dijumlahkan menjadi satu angka Riset."
            headingId="monitoring-riset-target-chart"
            title="Target dan realisasi per indikator"
          >
            <MonitoringChartFrame
              label={`Grafik batang target dan realisasi ${view.total} indikator Riset pada periode ${view.period}.`}
            >
              <MonitoringColumnChart
                categories={view.indicators.map((indicator) => indicator.id)}
                height={230}
                series={[
                  {
                    data: view.indicators.map((indicator) => indicator.target),
                    name: `Target ${view.period}`,
                  },
                  {
                    data: view.indicators.map(
                      (indicator) => indicator.realization,
                    ),
                    name: "Realisasi BHT Nexus",
                  },
                ]}
              />
            </MonitoringChartFrame>
            <MonitoringChartSummary>
              {`Sepanjang KM-9 sampai KM-18, target periode ${view.period} berjumlah ${totalTarget} dan realisasi dari data resmi berjumlah ${totalRealization}. Kedua angka itu hanya penjumlahan bacaan grafik, bukan target atau capaian gabungan kategori Riset.`}
            </MonitoringChartSummary>
            <MonitoringValueTable
              caption={`Target dan realisasi tiap indikator Riset pada periode ${view.period}.`}
              columns={["Target", "Realisasi", "Status"]}
              rowHeader="Indikator"
              rows={view.indicators.map((indicator) => ({
                id: indicator.id,
                label: `${indicator.id} · ${indicator.label}`,
                values: [
                  indicator.target === null
                    ? "Belum tersedia"
                    : String(indicator.target),
                  indicator.realization === null
                    ? "Belum dapat dihitung"
                    : String(indicator.realization),
                  indicator.statusLabel,
                ],
              }))}
            />
          </MonitoringCard>
        </div>

        <div className={styles.spanSide}>
          <section
            aria-labelledby="monitoring-riset-radial"
            className={styles.targetCard}
          >
            <div className={styles.targetPanel}>
              <div className={styles.cardHeading}>
                <h3 id="monitoring-riset-radial">Indikator mencapai target</h3>
                <p>
                  Bagian indikator Riset yang realisasinya sudah mencapai target
                  periode ini.
                </p>
              </div>
              <div className={styles.targetChartWrap}>
                <div className={styles.targetChart}>
                  <MonitoringRadialChart share={view.reachedShare} />
                </div>
                <span className={styles.targetPill}>
                  <MonitoringBadge tone="success">
                    {`${view.reached} dari ${view.total}`}
                  </MonitoringBadge>
                </span>
              </div>
              <p className={styles.targetCaption}>
                {`${reachedPercent}% adalah proporsi indikator yang mencapai target, bukan rata-rata performa kategori Riset.`}
              </p>
            </div>
            <div className={styles.targetFooter}>
              <div>
                <p>Tercapai</p>
                <strong>
                  <MonitoringNumber value={view.reached} />
                </strong>
              </div>
              <span aria-hidden="true" className={styles.targetDivider} />
              <div>
                <p>Belum tercapai</p>
                <strong>
                  <MonitoringNumber value={view.notReached} />
                </strong>
              </div>
              <span aria-hidden="true" className={styles.targetDivider} />
              <div>
                <p>Belum dapat dihitung</p>
                <strong>
                  <MonitoringNumber value={view.notComputable} />
                </strong>
              </div>
            </div>
          </section>
        </div>

        <div className={styles.spanFull}>
          <MonitoringCard
            actions={
              <fieldset className={styles.segment}>
                <legend className={styles.visuallyHidden}>
                  Pilih tampilan grafik
                </legend>
                {secondaryViews.map((item) => (
                  <button
                    aria-pressed={item.id === secondaryView}
                    data-active={item.id === secondaryView}
                    key={item.id}
                    onClick={() => setSecondaryView(item.id)}
                    type="button"
                  >
                    {item.label}
                  </button>
                ))}
              </fieldset>
            }
            description={secondary.description}
            headingId="monitoring-riset-secondary"
            title={secondary.title}
          >
            <MonitoringChartFrame
              label={`${secondary.title} pada periode ${view.period}.`}
              wide
            >
              <MonitoringBarChart
                height={320}
                name={
                  secondaryView === "capaian"
                    ? "Capaian terhadap target"
                    : "Rekam resmi pembentuk"
                }
                points={secondaryPoints}
                unitSuffix={secondaryView === "capaian" ? "%" : " rekam"}
              />
            </MonitoringChartFrame>
            <MonitoringValueTable
              caption={`${secondary.title} pada periode ${view.period}.`}
              columns={
                secondaryView === "capaian"
                  ? ["Capaian", "Status"]
                  : ["Rekam pembentuk", "Status"]
              }
              rowHeader="Indikator"
              rows={view.indicators.map((indicator) => ({
                id: indicator.id,
                label: `${indicator.id} · ${indicator.label}`,
                values:
                  secondaryView === "capaian"
                    ? [
                        indicator.progressPercent === null
                          ? "Belum dapat dihitung"
                          : `${indicator.progressPercent}%`,
                        indicator.statusLabel,
                      ]
                    : [
                        indicator.realization === null
                          ? "Belum dapat dihitung"
                          : `${indicator.realization} rekam`,
                        indicator.statusLabel,
                      ],
              }))}
            />
          </MonitoringCard>
        </div>

        <div className={styles.spanSide}>
          <MonitoringCard
            description="Jumlah rekam resmi berbeda yang membentuk realisasi indikator Riset pada tiap rumah data resmi."
            headingId="monitoring-riset-sources"
            title="Sumber data resmi"
          >
            {view.sources.length === 0 ? (
              <MonitoringUnavailable
                description="Belum ada rekam resmi yang dikaitkan dengan indikator Riset pada periode ini."
                title="Belum ada sumber realisasi"
              />
            ) : (
              <MonitoringDistributionList
                items={view.sources.map((source) => ({
                  detail: `${source.records} rekam · ${source.indicators} indikator`,
                  href: source.href,
                  id: source.id,
                  label: source.label,
                  share: source.share,
                  value: source.records,
                }))}
                valueLabel={(item) => `${Math.round(item.share * 100)}%`}
              />
            )}
          </MonitoringCard>
        </div>

        <div className={styles.spanWide}>
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
            description={`Menampilkan ${filtered.length} dari ${view.indicators.length} indikator Riset.`}
            headingId="monitoring-riset-indicators"
            inlineHeader={false}
            title="Ringkasan indikator Riset"
          >
            <div className={styles.tableSurface}>
              <NexusWorkspaceRecordTable
                caption="Ringkasan target, realisasi, dan status indikator Riset"
                columns={[
                  { id: "indicator", label: "Indikator", primary: true },
                  { id: "house", label: "Rumah data" },
                  { id: "target", label: "Target" },
                  { id: "realization", label: "Realisasi" },
                  { id: "status", label: "Status" },
                  { id: "action", label: "Rincian" },
                ]}
                empty={
                  <NexusWorkspaceEmptyState
                    description="Tidak ada indikator Riset dengan status tersebut pada periode ini."
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
                    realization:
                      indicator.realization === null
                        ? "Belum dapat dihitung"
                        : `${indicator.realization}`,
                    status: (
                      <NexusWorkspaceTableBadge tone={indicator.statusTone}>
                        {indicator.statusLabel}
                      </NexusWorkspaceTableBadge>
                    ),
                    target:
                      indicator.target === null
                        ? "Belum tersedia"
                        : `${indicator.target}`,
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
                        <>
                          <span>
                            {`Target ${indicator.target === null ? "belum tersedia" : indicator.target}`}
                          </span>
                          <span>
                            {`Realisasi ${
                              indicator.realization === null
                                ? "belum dapat dihitung"
                                : indicator.realization
                            }`}
                          </span>
                          <span>{indicator.houseLabel}</span>
                        </>
                      }
                      title={`${indicator.id} · ${indicator.label}`}
                    />
                  ),
                }))}
              />
            </div>
          </MonitoringCard>
        </div>
      </div>
    </NexusWorkspacePage>
  );
}

function ArrowRightIcon() {
  return (
    <svg aria-hidden="true" fill="none" viewBox="0 0 20 20">
      <path d="M4 10h12M10.5 4.5 16 10l-5.5 5.5" />
    </svg>
  );
}
