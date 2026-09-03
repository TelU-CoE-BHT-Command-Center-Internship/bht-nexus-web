"use client";

import {
  type CSSProperties,
  type KeyboardEvent,
  type MouseEvent,
  type PointerEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import styles from "@/components/nexus-monitoring/nexus-monitoring.module.css";
import type { NexusMonitoringCategory } from "@/components/nexus-monitoring/nexus-monitoring-categories";
import { NexusMonitoringCategoryProgress } from "@/components/nexus-monitoring/nexus-monitoring-category-progress";
import {
  NEXUS_ALL_DOMAINS,
  type NexusMonitoringDomainId,
  nexusMonitoringDomains,
} from "@/components/nexus-monitoring/nexus-monitoring-domains";
import { NEXUS_MONITORED_CATEGORY } from "@/components/nexus-monitoring/nexus-monitoring-evaluation";
import type { NexusMonitoringIndicatorProgress } from "@/components/nexus-monitoring/nexus-monitoring-indicator-progress";
import {
  NEXUS_DEFAULT_MONITORING_PERIOD_ID,
  type NexusMonitoringPeriod,
  nexusMonitoringPeriod,
  nexusMonitoringPeriods,
} from "@/components/nexus-monitoring/nexus-monitoring-period";
import { NexusMonitoringRecentUpdates } from "@/components/nexus-monitoring/nexus-monitoring-recent-updates";
import { NexusMonitoringRisetOverview } from "@/components/nexus-monitoring/nexus-monitoring-riset-overview";
import {
  NexusMonitoringSummaryAnalytics,
  type NexusMonitoringTargetSummary,
} from "@/components/nexus-monitoring/nexus-monitoring-summary-analytics";
import {
  MonitoringIcon,
  MonitoringMetricCard,
} from "@/components/nexus-monitoring/nexus-monitoring-ui";
import { NexusMonitoringUnderConstruction } from "@/components/nexus-monitoring/nexus-monitoring-under-construction";
import type { NexusMonitoringUpdate } from "@/components/nexus-monitoring/nexus-monitoring-updates";
import type { MonitoringRisetView } from "@/components/nexus-monitoring/nexus-monitoring-view";
import { NexusWorkspacePage } from "@/components/nexus-workspace-ui/nexus-workspace-page";
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

const [firstPeriod, ...otherPeriods] = nexusMonitoringPeriods;

function periodOption(period: NexusMonitoringPeriod) {
  return {
    description: period.rangeLabel,
    label: period.label,
    value: period.id,
  };
}

const periodSelectConfig: NexusSelectConfig = {
  defaultValue: NEXUS_DEFAULT_MONITORING_PERIOD_ID,
  id: "period",
  label: "Pilih periode evaluasi",
  options: [periodOption(firstPeriod), ...otherPeriods.map(periodOption)],
};

/**
 * Perpindahan domain memakai kontrak papan ketik yang sama dengan tab ruang
 * kerja: panah berpindah pilihan, Home dan End melompat ke ujung daftar.
 */
function adjacentDomainIndex(
  event: KeyboardEvent<HTMLButtonElement>,
  currentIndex: number,
  total: number,
) {
  if (event.key === "Home") return 0;
  if (event.key === "End") return total - 1;
  if (event.key === "ArrowRight" || event.key === "ArrowDown") {
    return (currentIndex + 1) % total;
  }
  if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
    return (currentIndex - 1 + total) % total;
  }
  return null;
}

const DOMAIN_PANEL_ID = "monitoring-domain-panel";

const DRAG_THRESHOLD_PX = 4;

/**
 * Pengendali geser baris domain. Barisnya tidak memakai batang gulir, sehingga
 * penggeserannya disediakan langsung pada kartunya: kartu dapat diseret dengan
 * tetikus, roda tetikus menggeser mendatar, dan bayangan tepi menandakan masih
 * ada domain di arah tersebut. Sentuhan dan papan ketik memakai perilaku
 * bawaan peramban.
 */
function useDomainScroller() {
  const rowRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{
    armed: boolean;
    moved: boolean;
    startLeft: number;
    startX: number;
  }>({ armed: false, moved: false, startLeft: 0, startX: 0 });
  const [edges, setEdges] = useState({ atEnd: true, atStart: true });
  const [isDragging, setIsDragging] = useState(false);

  const syncEdges = useCallback(() => {
    const row = rowRef.current;
    if (!row) return;
    const maxScroll = row.scrollWidth - row.clientWidth;
    setEdges({
      atEnd: maxScroll <= 1 || row.scrollLeft >= maxScroll - 1,
      atStart: row.scrollLeft <= 1,
    });
  }, []);

  useEffect(() => {
    const row = rowRef.current;
    if (!row) return;

    /*
     * Roda tetikus hanya dialihkan selama baris masih dapat digeser ke arah
     * itu; setelah mentok, halaman kembali menggulir seperti biasa sehingga
     * kursor di atas baris tidak pernah mengunci halaman.
     */
    const scrollSideways = (event: WheelEvent) => {
      if (event.deltaX !== 0 || event.shiftKey) return;
      const maxScroll = row.scrollWidth - row.clientWidth;
      if (maxScroll <= 1) return;

      const next = row.scrollLeft + event.deltaY;
      if (next <= 0 || next >= maxScroll) {
        const reachedEdge =
          (event.deltaY < 0 && row.scrollLeft <= 0) ||
          (event.deltaY > 0 && row.scrollLeft >= maxScroll);
        if (reachedEdge) return;
      }

      event.preventDefault();
      row.scrollLeft = next;
    };

    syncEdges();
    row.addEventListener("scroll", syncEdges, { passive: true });
    row.addEventListener("wheel", scrollSideways, { passive: false });
    const observer = new ResizeObserver(syncEdges);
    observer.observe(row);
    return () => {
      row.removeEventListener("scroll", syncEdges);
      row.removeEventListener("wheel", scrollSideways);
      observer.disconnect();
    };
  }, [syncEdges]);

  const startDrag = (event: PointerEvent<HTMLDivElement>) => {
    const row = rowRef.current;
    /*
     * Penanda seretan selalu dibersihkan lebih dahulu. Bila sisa penanda dari
     * interaksi sebelumnya dibiarkan, klik berikutnya ikut ditelan dan domain
     * tidak pernah terpilih.
     */
    dragRef.current = {
      armed: false,
      moved: false,
      startLeft: row?.scrollLeft ?? 0,
      startX: event.clientX,
    };

    if (!row || event.pointerType !== "mouse" || event.button !== 0) return;
    if (row.scrollWidth - row.clientWidth <= 1) return;
    dragRef.current.armed = true;
  };

  const moveDrag = (event: PointerEvent<HTMLDivElement>) => {
    const row = rowRef.current;
    if (!row || !dragRef.current.armed) return;

    const distance = event.clientX - dragRef.current.startX;
    if (!dragRef.current.moved) {
      if (Math.abs(distance) <= DRAG_THRESHOLD_PX) return;
      /*
       * Pointer baru dikunci setelah kursor benar-benar digeser. Menguncinya
       * sejak tombol ditekan membuat event klik pindah dari chip ke barisnya,
       * sehingga domain tidak pernah terpilih pada klik biasa.
       */
      dragRef.current.moved = true;
      setIsDragging(true);
      row.setPointerCapture(event.pointerId);
    }

    row.scrollLeft = dragRef.current.startLeft - distance;
  };

  const endDrag = (event: PointerEvent<HTMLDivElement>) => {
    const row = rowRef.current;
    dragRef.current.armed = false;
    if (!row) return;
    if (row.hasPointerCapture(event.pointerId)) {
      row.releasePointerCapture(event.pointerId);
    }
    setIsDragging(false);
  };

  /** Seretan tidak boleh ikut memilih domain yang kebetulan berada di bawah kursor. */
  const suppressClickAfterDrag = (event: MouseEvent<HTMLDivElement>) => {
    if (!dragRef.current.moved) return;
    dragRef.current.moved = false;
    event.preventDefault();
    event.stopPropagation();
  };

  return {
    edges,
    isDragging,
    rowHandlers: {
      onClickCapture: suppressClickAfterDrag,
      onPointerCancel: endDrag,
      onPointerDown: startDrag,
      onPointerMove: moveDrag,
      onPointerUp: endDrag,
    },
    rowRef,
  };
}

export function NexusMonitoringLanding({
  categories,
  indicatorProgress,
  initialDomain = NEXUS_ALL_DOMAINS,
  risetView,
  targetSummary,
  updates,
}: {
  categories: readonly NexusMonitoringCategory[];
  indicatorProgress: readonly NexusMonitoringIndicatorProgress[];
  /** Domain yang aktif saat halaman dibuka; alamat Riset masuk lewat sini. */
  initialDomain?: NexusMonitoringDomainId;
  risetView: MonitoringRisetView;
  targetSummary: NexusMonitoringTargetSummary;
  updates: readonly NexusMonitoringUpdate[];
}) {
  const [periodId, setPeriodId] = useState(NEXUS_DEFAULT_MONITORING_PERIOD_ID);
  const [isPeriodOpen, setIsPeriodOpen] = useState(false);
  const [domainId, setDomainId] =
    useState<NexusMonitoringDomainId>(initialDomain);
  const { edges, isDragging, rowHandlers, rowRef } = useDomainScroller();

  const domains = useMemo(
    () => nexusMonitoringDomains(categories),
    [categories],
  );
  const period = nexusMonitoringPeriod(periodId);
  const activeDomain =
    domains.find((domain) => domain.id === domainId) ?? domains[0];
  const summary = useMemo(
    () =>
      categories.reduce(
        (totals, category) => {
          totals.connectedIndicators += category.connectedIndicators;
          totals.connectedRecords += category.records;
          totals.domainsWithSources += category.records > 0 ? 1 : 0;
          totals.indicators += category.indicators;
          return totals;
        },
        {
          connectedIndicators: 0,
          connectedRecords: 0,
          domainsWithSources: 0,
          indicators: 0,
        },
      ),
    [categories],
  );
  const connectedShare = summary.indicators
    ? `${((summary.connectedIndicators / summary.indicators) * 100)
        .toFixed(1)
        .replace(".", ",")}%`
    : "0%";
  const activeDomainIndex = domains.findIndex(
    (domain) => domain.id === activeDomain.id,
  );
  const sourceHouseCount = new Set(updates.map((update) => update.sourceId))
    .size;

  return (
    <NexusWorkspacePage
      actions={
        <div className={styles.summaryPeriod}>
          <NexusWorkspaceSelect
            config={periodSelectConfig}
            isOpen={isPeriodOpen}
            leadingIcon={<CalendarIcon />}
            name="monitoring-period"
            onOpenChange={setIsPeriodOpen}
            onValueChange={setPeriodId}
            value={periodId}
          />
        </div>
      }
      description={
        activeDomain.id === NEXUS_ALL_DOMAINS
          ? "Gambaran umum capaian KM di seluruh domain."
          : `Gambaran umum capaian KM kategori ${activeDomain.label}.`
      }
      descriptionId="monitoring-summary-description"
      title="Ringkasan"
      titleId="monitoring-summary-title"
    >
      <div
        className={styles.domainBar}
        data-at-end={edges.atEnd}
        data-at-start={edges.atStart}
      >
        <div
          aria-label="Pilih domain KM"
          className={styles.domainRow}
          data-dragging={isDragging}
          ref={rowRef}
          role="tablist"
          {...rowHandlers}
        >
          {domains.map((domain, index) => {
            const isActive = domain.id === activeDomain.id;
            return (
              <button
                aria-controls={DOMAIN_PANEL_ID}
                aria-selected={isActive}
                className={styles.domainChip}
                data-active={isActive}
                id={`monitoring-domain-tab-${index}`}
                key={domain.id}
                onClick={() => setDomainId(domain.id)}
                onKeyDown={(event) => {
                  const nextIndex = adjacentDomainIndex(
                    event,
                    index,
                    domains.length,
                  );
                  if (nextIndex === null) return;
                  event.preventDefault();
                  const nextDomain = domains[nextIndex];
                  if (!nextDomain) return;
                  setDomainId(nextDomain.id);
                  event.currentTarget.parentElement
                    ?.querySelectorAll<HTMLButtonElement>('[role="tab"]')
                    [nextIndex]?.focus();
                }}
                role="tab"
                style={{ "--domain-accent": domain.accent } as CSSProperties}
                tabIndex={isActive ? 0 : -1}
                type="button"
              >
                <span aria-hidden="true" className={styles.domainIcon}>
                  <MonitoringIcon name={domain.icon} />
                </span>
                <span className={styles.domainCopy}>
                  <strong>{domain.label}</strong>
                  <span>{domain.meta}</span>
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <section
        aria-labelledby={`monitoring-domain-tab-${Math.max(activeDomainIndex, 0)}`}
        aria-live="polite"
        className={styles.domainPanel}
        id={DOMAIN_PANEL_ID}
        role="tabpanel"
      >
        {activeDomain.id === NEXUS_ALL_DOMAINS ? (
          <>
            <div className={styles.summaryMetricGrid}>
              <MonitoringMetricCard
                detail={`${categories.length} domain · ${period.label}`}
                icon="chart"
                label="Indikator KM"
                tone="blue"
                unit="indikator"
                value={summary.indicators}
                variant="summary"
              />
              <MonitoringMetricCard
                detail={`${connectedShare} cakupan indikator`}
                icon="database"
                label="Terhubung ke data resmi"
                tone="green"
                unit={`dari ${summary.indicators}`}
                value={summary.connectedIndicators}
                variant="summary"
              />
              <MonitoringMetricCard
                detail={`${categories.length - summary.domainsWithSources} domain belum memiliki sumber`}
                icon="globe"
                label="Domain memiliki sumber"
                tone="gold"
                unit={`dari ${categories.length}`}
                value={summary.domainsWithSources}
                variant="summary"
              />
              <MonitoringMetricCard
                detail={`${sourceHouseCount} rumah data · ${period.label}`}
                icon="document"
                label="Rekam resmi terkait"
                tone="violet"
                unit="rekam"
                value={updates.length}
                variant="summary"
              />
            </div>
            <NexusMonitoringSummaryAnalytics
              domains={domains}
              targetSummary={targetSummary}
            />
            <NexusMonitoringCategoryProgress
              domains={domains}
              indicators={indicatorProgress}
            />
            <NexusMonitoringRecentUpdates updates={updates} />
          </>
        ) : activeDomain.category === NEXUS_MONITORED_CATEGORY ? (
          <NexusMonitoringRisetOverview
            periodLabel={period.label}
            updates={updates}
            view={risetView}
          />
        ) : (
          <NexusMonitoringUnderConstruction
            domain={activeDomain}
            onBack={() => setDomainId(NEXUS_ALL_DOMAINS)}
            periodLabel={period.label}
          />
        )}
      </section>
    </NexusWorkspacePage>
  );
}
