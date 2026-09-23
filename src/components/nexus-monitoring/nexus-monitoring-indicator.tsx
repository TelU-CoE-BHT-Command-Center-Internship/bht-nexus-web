"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import styles from "@/components/nexus-monitoring/nexus-monitoring.module.css";
import { MonitoringQuarterChart } from "@/components/nexus-monitoring/nexus-monitoring-charts";
import { MonitoringComposition } from "@/components/nexus-monitoring/nexus-monitoring-composition";
import { NEXUS_MONITORING_HREF } from "@/components/nexus-monitoring/nexus-monitoring-evaluation";
import { nexusMonitoringPeriodHref } from "@/components/nexus-monitoring/nexus-monitoring-period";
import type { NexusEvaluationQuarter } from "@/components/nexus-monitoring/nexus-monitoring-quarter";
import { MonitoringRecordDetail } from "@/components/nexus-monitoring/nexus-monitoring-record-detail";
import {
  MonitoringBadge,
  MonitoringCard,
  MonitoringChartFrame,
  MonitoringChartSummary,
  MonitoringDistributionList,
  MonitoringMetricCard,
  MonitoringUnavailable,
} from "@/components/nexus-monitoring/nexus-monitoring-ui";
import type { MonitoringIndicatorView } from "@/components/nexus-monitoring/nexus-monitoring-view";
import type {
  OfficialRecordCorrectionChange,
  OfficialRecordCorrectionMap,
  OfficialRecordCorrectionValues,
} from "@/components/nexus-official-records/nexus-official-record-corrections";
import { NexusTablePagination } from "@/components/nexus-workspace-ui/nexus-table-pagination";
import { NexusWorkspaceBreadcrumb } from "@/components/nexus-workspace-ui/nexus-workspace-breadcrumb";
import {
  NexusWorkspaceEmptyState,
  NexusWorkspaceLinkButton,
} from "@/components/nexus-workspace-ui/nexus-workspace-elements";
import {
  NexusWorkspaceMobileCard,
  NexusWorkspaceRecordTable,
  NexusWorkspaceTableAction,
  NexusWorkspaceTableBadge,
  NexusWorkspaceTablePrimary,
} from "@/components/nexus-workspace-ui/nexus-workspace-records";
import type { NexusSelectConfig } from "@/components/nexus-workspace-ui/nexus-workspace-select";

/** Penanda saringan yang berarti seluruh triwulan, bukan salah satu di antaranya. */
const ALL_QUARTERS = "semua";

type QuarterFilter = NexusEvaluationQuarter | typeof ALL_QUARTERS;

const pageSizeConfig: NexusSelectConfig = {
  defaultValue: "10",
  id: "monitoring-indicator-page-size",
  label: "Jumlah rekam per halaman",
  options: [
    { label: "10 per halaman", value: "10" },
    { label: "20 per halaman", value: "20" },
    { label: "50 per halaman", value: "50" },
  ],
};

function ArrowRightIcon() {
  return (
    <svg aria-hidden="true" fill="none" viewBox="0 0 20 20">
      <path d="M4 10h12M10.5 4.5 16 10l-5.5 5.5" />
    </svg>
  );
}

function ArrowLeftIcon() {
  return (
    <svg aria-hidden="true" fill="none" viewBox="0 0 20 20">
      <path d="M16 10H4M9.5 4.5 4 10l5.5 5.5" />
    </svg>
  );
}

function lowerFirst(value: string) {
  return value.charAt(0).toLocaleLowerCase("id-ID") + value.slice(1);
}

/**
 * Kalimat capaian yang seluruhnya ditentukan angka. Tidak ada penilaian laju
 * seperti "sesuai jalur" karena workbook KM 2026 tidak menetapkan aturan itu.
 */
function progressSentence(view: MonitoringIndicatorView) {
  const { difference, progressPercent, realization, target } = view;
  if (realization === null || target === null || difference === null) return "";

  const share = `${progressPercent}% dari target`;
  if (difference > 0) {
    return `Realisasi ${realization} melampaui target ${target} sebanyak ${difference} rekam (${share}).`;
  }
  if (difference === 0) {
    return `Realisasi ${realization} tepat memenuhi target ${target} (${share}).`;
  }
  return `Realisasi ${realization} masih kurang ${Math.abs(difference)} rekam dari target ${target} (${share}).`;
}

export function NexusMonitoringIndicator({
  canCorrectRecords,
  corrections,
  onCorrect,
  periodLabel,
  view,
}: {
  canCorrectRecords: boolean;
  corrections: OfficialRecordCorrectionMap;
  onCorrect: (
    recordPublicId: string,
    input: {
      changes: readonly OfficialRecordCorrectionChange[];
      reason: string;
      values: OfficialRecordCorrectionValues;
    },
  ) => void;
  periodLabel: string;
  view: MonitoringIndicatorView;
}) {
  const [quarterFilter, setQuarterFilter] =
    useState<QuarterFilter>(ALL_QUARTERS);
  const [currentPage, setCurrentPage] = useState(1);
  /*
   * Rekam terpilih dirujuk lewat ID, bukan salinan tampilannya, supaya panel
   * langsung memuat nilai terbaru setelah koreksi. Bila koreksi melepas rekam
   * dari indikator ini, panelnya tertutup dengan sendirinya.
   */
  const [selectedRecordId, setSelectedRecordId] = useState<string | null>(null);
  const selectedRecord =
    view.records.find((record) => record.publicId === selectedRecordId) ?? null;
  const [pageSizeValue, setPageSizeValue] = useState(
    pageSizeConfig.defaultValue,
  );

  const quarterly = view.quarterly;
  const filteredRecords = useMemo(
    () =>
      quarterFilter === ALL_QUARTERS
        ? view.records
        : view.records.filter((record) => record.quarter === quarterFilter),
    [quarterFilter, view.records],
  );

  const pageSize = Number(pageSizeValue);
  const totalPages = Math.max(1, Math.ceil(filteredRecords.length / pageSize));
  const safePage = Math.min(currentPage, totalPages);
  const visibleRecords = filteredRecords.slice(
    (safePage - 1) * pageSize,
    safePage * pageSize,
  );

  const businessDateColumn = view.businessDateLabel;
  /*
   * Panel kesiapan hanya muncul ketika memang ada yang perlu dijelaskan.
   * Saat seluruh rekam tertaut sudah dihitung, kartu metrik sudah menyebut
   * hubungan itu dan panel tambahan hanya mengulanginya.
   */
  const showCountingPanel = view.counting.items.some(
    (item) => item.id !== "counted" && item.value > 0,
  );
  const countedVisible = filteredRecords.filter(
    (record) => record.counting.state === "counted",
  ).length;

  const quarterFilters: readonly { id: QuarterFilter; label: string }[] =
    quarterly.available
      ? [
          { id: ALL_QUARTERS, label: "Semua" },
          ...quarterly.points.map((point) => ({
            id: point.id as QuarterFilter,
            label: point.label,
          })),
        ]
      : [];

  function changeQuarterFilter(next: QuarterFilter) {
    setQuarterFilter(next);
    setCurrentPage(1);
  }

  return (
    <>
      <div className={styles.indicatorTrail}>
        <NexusWorkspaceBreadcrumb
          current={view.id}
          trail={[
            {
              href: nexusMonitoringPeriodHref(
                NEXUS_MONITORING_HREF,
                view.period,
              ),
              label: "Monitoring KM",
            },
            { href: view.domainHref, label: view.category },
          ]}
        />
        <nav
          aria-label="Indikator lain pada domain ini"
          className={styles.indicatorNav}
        >
          {view.previous ? (
            <Link
              className={styles.indicatorNavLink}
              aria-label={`Indikator sebelumnya: ${view.previous.id} · ${view.previous.label}`}
              href={view.previous.href}
              prefetch={false}
            >
              <ArrowLeftIcon />
              <span>
                <small>Sebelumnya</small>
                {view.previous.id}
              </span>
            </Link>
          ) : null}
          {view.next ? (
            <Link
              className={styles.indicatorNavLink}
              aria-label={`Indikator berikutnya: ${view.next.id} · ${view.next.label}`}
              data-align="end"
              href={view.next.href}
              prefetch={false}
            >
              <span>
                <small>Berikutnya</small>
                {view.next.id}
              </span>
              <ArrowRightIcon />
            </Link>
          ) : null}
        </nav>
      </div>

      <div className={`${styles.summaryMetricGrid} ${styles.indicatorMetrics}`}>
        <MonitoringMetricCard
          detail={
            view.targetVersion > 0
              ? `Periode ${view.period} · versi target ${view.targetVersion}`
              : `Periode ${view.period} · target belum ditetapkan`
          }
          fallback={view.targetLiteral ?? "Belum tersedia"}
          icon="target"
          label="Target tahunan"
          tone="blue"
          value={view.target}
          variant="summary"
        />
        <MonitoringMetricCard
          detail={`Dari ${view.counting.linked} rekam resmi yang tertaut`}
          fallback="Belum dapat dihitung"
          icon="database"
          label="Realisasi"
          tone="green"
          unit="rekam"
          value={view.realization}
          variant="summary"
        />
        <MonitoringMetricCard
          detail="Realisasi − target tahunan"
          fallback="Belum dapat dihitung"
          icon="chart"
          label="Selisih target"
          signDisplay="exceptZero"
          tone="gold"
          unit="rekam"
          value={view.difference}
          variant="summary"
        />
        <MonitoringMetricCard
          detail={view.statusLabel}
          fallback="Belum dapat dihitung"
          icon="chart"
          label="Capaian target"
          tone="violet"
          unit="%"
          value={view.progressPercent}
          variant="summary"
        />
      </div>

      <div className={styles.indicatorAnalyticsGrid}>
        <MonitoringCard
          actions={
            <span className={styles.summaryChartUnit}>Jumlah rekam</span>
          }
          description={`Rekam resmi yang dihitung sebagai realisasi, dikelompokkan menurut ${lowerFirst(businessDateColumn)} pada ${periodLabel}; rekam tanpa tanggal memakai triwulan yang dilaporkan.`}
          fill
          headingId="monitoring-indicator-quarters"
          title="Realisasi per Triwulan"
        >
          {quarterly.available ? (
            <>
              <MonitoringChartFrame
                fluid
                label={`Grafik batang sebaran ${view.realization ?? 0} rekam resmi yang dihitung sebagai realisasi ${view.id} pada empat triwulan ${periodLabel}. ${quarterly.points
                  .map((point) => `${point.label} ${point.value} rekam`)
                  .join(", ")}.`}
              >
                <MonitoringQuarterChart
                  columns={quarterly.points.map((point) => ({
                    id: String(point.id),
                    label: point.label,
                    value: point.value,
                  }))}
                  height={180}
                  unitLabel="rekam"
                />
              </MonitoringChartFrame>
              <dl className={styles.indicatorQuarterGrid}>
                {quarterly.points.map((point) => (
                  <div key={point.id}>
                    <dt>
                      {point.label}
                      <span>{point.rangeLabel}</span>
                    </dt>
                    <dd>
                      {point.value} <small>rekam</small>
                    </dd>
                  </div>
                ))}
              </dl>
              {quarterly.undated > 0 ? (
                <MonitoringChartSummary>
                  {`${quarterly.undated} rekam yang dihitung belum terpetakan ke triwulan karena ${lowerFirst(businessDateColumn)} maupun triwulan dilaporkannya belum tercatat. Rekam tersebut tetap masuk realisasi tahunan${canCorrectRecords ? "; lengkapi melalui Koreksi data pada rincian rekam" : ""}.`}
                </MonitoringChartSummary>
              ) : null}
            </>
          ) : (
            <MonitoringUnavailable
              description={quarterly.reason}
              title="Sebaran triwulan belum dapat dibentuk"
            />
          )}
        </MonitoringCard>

        <MonitoringCard
          fill
          headingId="monitoring-indicator-calculation"
          title="Dasar Perhitungan"
        >
          <MonitoringBadge tone={view.statusTone}>
            {view.statusLabel}
          </MonitoringBadge>
          <p className={styles.indicatorCalculation}>{view.calculation}</p>
          <dl className={styles.ruleList}>
            <div className={styles.ruleItem}>
              <dt>Satuan indikator</dt>
              <dd>{view.unit ?? "Belum ditetapkan"}</dd>
            </div>
            <div className={styles.ruleItem}>
              <dt>Dasar triwulan</dt>
              <dd>{`${businessDateColumn}, atau triwulan dilaporkan`}</dd>
            </div>
          </dl>
          <p className={styles.ruleSource}>
            {progressSentence(view) ||
              view.unavailableReason ||
              "Target yang dapat dibandingkan sebagai satu angka belum tersedia."}
          </p>
        </MonitoringCard>
      </div>

      {showCountingPanel || view.analytics ? (
        <div className={styles.indicatorInsightGrid}>
          {showCountingPanel ? (
            <MonitoringCard
              description={`Rekam resmi yang tertaut ke ${view.id} tidak seluruhnya membentuk realisasinya. Alasan tiap rekam tercantum pada daftar di bawah.`}
              fill
              headingId="monitoring-indicator-counting"
              title="Kesiapan Perhitungan"
            >
              <MonitoringDistributionList
                items={view.counting.items}
                valueLabel={(item) => `${item.value} rekam`}
              />
              <MonitoringChartSummary>
                {view.counting.summary}
              </MonitoringChartSummary>
            </MonitoringCard>
          ) : null}

          {view.analytics ? (
            <MonitoringCard
              description={view.analytics.description}
              fill
              headingId="monitoring-indicator-breakdown"
              title={view.analytics.title}
            >
              <MonitoringComposition
                centerLabel={view.analytics.centerLabel}
                chartLabel={`Cincin komposisi ${view.analytics.population} ${view.analytics.unitLabel} yang dihitung sebagai realisasi ${view.id}. ${view.analytics.slices
                  .map(
                    (slice) =>
                      `${slice.label} ${slice.value} ${view.analytics?.unitLabel ?? "rekam"}`,
                  )
                  .join(", ")}.`}
                items={view.analytics.slices}
                unitLabel={view.analytics.unitLabel}
                variant="centered"
              />
            </MonitoringCard>
          ) : null}
        </div>
      ) : null}

      <div className={styles.summaryUpdates}>
        <MonitoringCard
          actions={
            <NexusWorkspaceLinkButton href={view.houseHref} tone="secondary">
              {`Buka ${view.houseLabel}`}
            </NexusWorkspaceLinkButton>
          }
          description={`Rekam resmi yang tertaut ke ${view.id} pada ${periodLabel}, termasuk rekam yang belum membentuk realisasinya. Buka judul rekam untuk memeriksa alasan, eviden, dan asal datanya.`}
          headingId="monitoring-indicator-records"
          inlineHeader={false}
          title="Data Pembentuk Realisasi"
        >
          {view.records.length === 0 ? (
            <MonitoringUnavailable
              description={`Belum ada rekam resmi yang dikaitkan dengan ${view.id}. Rekam akan muncul di sini setelah lolos Tinjauan dan tertaut ke indikator ini.`}
              title="Belum ada rekam tertaut"
            />
          ) : (
            <>
              {quarterFilters.length > 0 ? (
                <fieldset className={styles.segment}>
                  <legend className={styles.visuallyHidden}>
                    Saring rekam menurut triwulan
                  </legend>
                  {quarterFilters.map((filter) => (
                    <button
                      aria-pressed={filter.id === quarterFilter}
                      data-active={filter.id === quarterFilter}
                      key={filter.id}
                      onClick={() => changeQuarterFilter(filter.id)}
                      type="button"
                    >
                      {filter.label}
                    </button>
                  ))}
                </fieldset>
              ) : null}
              <div className={styles.indicatorRecordsTable}>
                <NexusWorkspaceRecordTable
                  caption={`Rekam resmi pembentuk realisasi ${view.id} pada ${periodLabel}`}
                  columns={[
                    { id: "record", label: "Rekam resmi", primary: true },
                    { id: "counting", label: "Perhitungan" },
                    { id: "date", label: businessDateColumn },
                    { id: "evidence", label: "Eviden" },
                    { id: "quality", label: "Kelengkapan" },
                    { id: "action", label: "Aksi" },
                  ]}
                  empty={
                    <NexusWorkspaceEmptyState
                      description={`Tidak ada rekam pembentuk ${view.id} pada triwulan tersebut.`}
                      onResetFilters={() => changeQuarterFilter(ALL_QUARTERS)}
                      title="Tidak ada rekam pada triwulan ini"
                    />
                  }
                  pagination={
                    filteredRecords.length > 10 ? (
                      <NexusTablePagination
                        currentPage={safePage}
                        itemCount={filteredRecords.length}
                        navigationLabel="Navigasi rekam pembentuk realisasi"
                        nextPageLabel="Halaman berikutnya"
                        onPageChange={setCurrentPage}
                        onPageSizeChange={(value) => {
                          setPageSizeValue(value);
                          setCurrentPage(1);
                        }}
                        pageLabel="Halaman"
                        pageSizeConfig={pageSizeConfig}
                        pageSizeValue={pageSizeValue}
                        previousPageLabel="Halaman sebelumnya"
                        rangePrefix="Menampilkan"
                        totalUnit="rekam"
                      />
                    ) : null
                  }
                  rows={visibleRecords.map((record) => {
                    const dateCell = record.businessDateLabel ? (
                      <span
                        className={styles.indicatorRecordDate}
                        key={`${record.publicId}-tanggal`}
                      >
                        <strong>{record.businessDateLabel}</strong>
                        <small>{record.quarterLabel}</small>
                      </span>
                    ) : (
                      <span
                        className={styles.summaryUpdatePlain}
                        key={`${record.publicId}-tanggal`}
                      >
                        Belum tercatat
                      </span>
                    );
                    const evidenceBadge = (
                      <NexusWorkspaceTableBadge
                        key={`${record.publicId}-eviden`}
                        tone={record.evidenceTone}
                      >
                        {record.evidenceLabel}
                      </NexusWorkspaceTableBadge>
                    );

                    return {
                      cells: {
                        action: (
                          <NexusWorkspaceTableAction
                            label={`Lihat rincian rekam: ${record.title}`}
                            onClick={() => setSelectedRecordId(record.publicId)}
                          >
                            Rincian
                          </NexusWorkspaceTableAction>
                        ),
                        counting: (
                          <NexusWorkspaceTableBadge
                            key={`${record.publicId}-perhitungan`}
                            tone={record.counting.tone}
                          >
                            {record.counting.label}
                          </NexusWorkspaceTableBadge>
                        ),
                        date: dateCell,
                        evidence: evidenceBadge,
                        quality: (
                          <NexusWorkspaceTableBadge
                            tone={
                              record.quality === "Lengkap"
                                ? "success"
                                : "waiting"
                            }
                          >
                            {record.quality}
                          </NexusWorkspaceTableBadge>
                        ),
                        record: (
                          <NexusWorkspaceTablePrimary
                            onClick={() => setSelectedRecordId(record.publicId)}
                            subtitle={`${record.publicId} · ${record.subtitle}`}
                            title={record.title}
                          />
                        ),
                      },
                      id: record.publicId,
                      mobile: (
                        <NexusWorkspaceMobileCard
                          action={
                            <NexusWorkspaceTableAction
                              label={`Lihat rincian rekam: ${record.title}`}
                              onClick={() =>
                                setSelectedRecordId(record.publicId)
                              }
                            >
                              Rincian
                            </NexusWorkspaceTableAction>
                          }
                          eyebrow={
                            <>
                              <NexusWorkspaceTableBadge
                                tone={record.counting.tone}
                              >
                                {record.counting.label}
                              </NexusWorkspaceTableBadge>
                              <span className={styles.summaryUpdateTime}>
                                {record.publicId}
                              </span>
                            </>
                          }
                          meta={
                            <dl>
                              <div>
                                <dt>{businessDateColumn}</dt>
                                <dd>
                                  {record.businessDateLabel
                                    ? `${record.businessDateLabel} · ${record.quarterLabel}`
                                    : "Belum tercatat"}
                                </dd>
                              </div>
                              <div>
                                <dt>Eviden</dt>
                                <dd>{record.evidenceLabel}</dd>
                              </div>
                              <div>
                                <dt>Kelengkapan</dt>
                                <dd>{record.quality}</dd>
                              </div>
                              {record.counting.reason ? (
                                <div>
                                  <dt>Alasan</dt>
                                  <dd>{record.counting.reason}</dd>
                                </div>
                              ) : null}
                            </dl>
                          }
                          title={record.title}
                        >
                          <p className={styles.summaryUpdateId}>
                            {record.subtitle}
                          </p>
                        </NexusWorkspaceMobileCard>
                      ),
                    };
                  })}
                />
              </div>
              <MonitoringChartSummary>
                {quarterFilter === ALL_QUARTERS
                  ? `Daftar ini memuat ${filteredRecords.length} rekam tertaut; ${countedVisible} di antaranya dihitung sebagai realisasi ${view.id} pada ${periodLabel}.`
                  : `Saringan triwulan hanya mempersempit daftar ini: ${filteredRecords.length} rekam tertaut, ${countedVisible} di antaranya dihitung. Realisasi ${view.id} pada ${periodLabel} tetap ${view.realization} rekam untuk satu tahun penuh.`}
              </MonitoringChartSummary>
            </>
          )}
        </MonitoringCard>
      </div>

      <details className={styles.indicatorReferences}>
        <summary>
          Definisi indikator{" "}
          <span>Ketentuan pengukuran dan persyaratan eviden</span>
        </summary>
        <div>
          <MonitoringCard
            description="Definisi yang digunakan untuk pengukuran indikator pada periode evaluasi ini."
            headingId="monitoring-indicator-rule"
            title="Aturan Pengukuran"
          >
            <dl className={styles.ruleList}>
              <div className={styles.ruleItem}>
                <dt>Satuan</dt>
                <dd>{view.unit ?? "Belum ditetapkan"}</dd>
              </div>
              <div className={styles.ruleItem}>
                <dt>Definisi</dt>
                <dd>{view.definition}</dd>
              </div>
              <div className={styles.ruleItem}>
                <dt>Tujuan</dt>
                <dd>{view.purpose}</dd>
              </div>
              <div className={styles.ruleItem}>
                <dt>Cara perhitungan</dt>
                <dd>{view.calculation}</dd>
              </div>
              <div className={styles.ruleItem}>
                <dt>Dasar triwulan</dt>
                <dd>{`${businessDateColumn} pada rekam resmi. Bila tanggal belum tercatat, dipakai triwulan yang dilaporkan pengaju atau auditor; tanggal selalu lebih menentukan.`}</dd>
              </div>
              <div className={styles.ruleItem}>
                <dt>Eviden</dt>
                <dd>
                  {view.evidenceValue ??
                    "Belum ada persyaratan eviden khusus yang tercatat pada definisi indikator ini."}
                </dd>
              </div>
            </dl>
          </MonitoringCard>
        </div>
      </details>
      <p className={styles.indicatorMethodNote}>
        Realisasi berasal dari rekam resmi tertaut yang memenuhi ketentuan
        indikator pada periode ini; rekam tertaut lain tetap tercantum beserta
        alasannya. Kandidat yang masih menunggu Tinjauan belum dihitung.
        Saringan triwulan hanya mengubah daftar, bukan angka tahunan.
      </p>
      {selectedRecord ? (
        <MonitoringRecordDetail
          businessDateLabel={businessDateColumn}
          canCorrect={canCorrectRecords}
          corrections={corrections[selectedRecord.publicId] ?? []}
          indicatorId={view.id}
          onClose={() => setSelectedRecordId(null)}
          onCorrect={(input) => onCorrect(selectedRecord.publicId, input)}
          record={selectedRecord}
        />
      ) : null}
    </>
  );
}
