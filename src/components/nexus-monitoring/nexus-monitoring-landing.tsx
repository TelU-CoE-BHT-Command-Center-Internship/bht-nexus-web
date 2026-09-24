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
import type { NexusMonitoringCapabilities } from "@/components/nexus-dashboard-shell/nexus-workspace-access";
import styles from "@/components/nexus-monitoring/nexus-monitoring.module.css";
import { NexusMonitoringCategoryProgress } from "@/components/nexus-monitoring/nexus-monitoring-category-progress";
import { useNexusMonitoringData } from "@/components/nexus-monitoring/nexus-monitoring-data";
import { NexusMonitoringDomainOverview } from "@/components/nexus-monitoring/nexus-monitoring-domain-overview";
import {
  NEXUS_ALL_DOMAINS,
  type NexusMonitoringDomain,
  type NexusMonitoringDomainId,
  nexusMonitoringDomains,
} from "@/components/nexus-monitoring/nexus-monitoring-domains";
import {
  NEXUS_MONITORING_HREF,
  nexusCategoryIsMonitored,
  nexusDomainHref,
} from "@/components/nexus-monitoring/nexus-monitoring-evaluation";
import { NexusMonitoringHeaderActions } from "@/components/nexus-monitoring/nexus-monitoring-header-actions";
import { getNexusMonitoringLandingData } from "@/components/nexus-monitoring/nexus-monitoring-landing-data";
import {
  NEXUS_DEFAULT_MONITORING_PERIOD_ID,
  nexusMonitoringPeriodHref,
} from "@/components/nexus-monitoring/nexus-monitoring-period";
import { NexusMonitoringRecentUpdates } from "@/components/nexus-monitoring/nexus-monitoring-recent-updates";
import { NexusMonitoringSummaryAnalytics } from "@/components/nexus-monitoring/nexus-monitoring-summary-analytics";
import { NexusMonitoringTargetDrawer } from "@/components/nexus-monitoring/nexus-monitoring-target-drawer";
import { NexusMonitoringToast } from "@/components/nexus-monitoring/nexus-monitoring-toast";
import {
  MonitoringIcon,
  MonitoringMetricCard,
} from "@/components/nexus-monitoring/nexus-monitoring-ui";
import { NexusMonitoringUnderConstruction } from "@/components/nexus-monitoring/nexus-monitoring-under-construction";
import {
  NexusWorkspaceButton,
  NexusWorkspaceNotice,
} from "@/components/nexus-workspace-ui/nexus-workspace-elements";
import { NexusWorkspacePage } from "@/components/nexus-workspace-ui/nexus-workspace-page";
import { NexusWorkspaceState } from "@/components/nexus-workspace-ui/nexus-workspace-state";

/**
 * Menyelaraskan alamat dengan periode dan domain yang sedang dilihat tanpa
 * memuat ulang halaman, supaya tautan yang disalin membuka konteks yang sama.
 */
function replaceMonitoringUrl(
  domain: NexusMonitoringDomainId,
  domains: readonly NexusMonitoringDomain[],
  periodId: string,
) {
  const category = domains.find((item) => item.id === domain)?.category;
  const path =
    domain === NEXUS_ALL_DOMAINS || !category
      ? NEXUS_MONITORING_HREF
      : nexusDomainHref(category);
  window.history.replaceState(
    window.history.state,
    "",
    nexusMonitoringPeriodHref(path, periodId),
  );
}

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
  capabilities,
  initialDomain = NEXUS_ALL_DOMAINS,
  requestedPeriodId = NEXUS_DEFAULT_MONITORING_PERIOD_ID,
}: {
  capabilities: NexusMonitoringCapabilities;
  /** Domain yang aktif saat halaman dibuka; alamat domain masuk lewat sini. */
  initialDomain?: NexusMonitoringDomainId;
  /** Periode dari alamat `?periode=`; kosong berarti periode bawaan. */
  requestedPeriodId?: string;
}) {
  const [periodId, setPeriodId] = useState(requestedPeriodId);
  const [domainId, setDomainId] =
    useState<NexusMonitoringDomainId>(initialDomain);
  const [targetDrawerOpen, setTargetDrawerOpen] = useState(false);
  const [notice, setNotice] = useState<{ id: number; message: string } | null>(
    null,
  );
  const [exportError, setExportError] = useState("");
  const { edges, isDragging, rowHandlers, rowRef } = useDomainScroller();
  const { input, isKnownPeriod, period, periodOptions } =
    useNexusMonitoringData(periodId);
  const { categories, domainViews, indicatorProgress, targetSummary, updates } =
    useMemo(() => getNexusMonitoringLandingData(input), [input]);

  const domains = useMemo(
    () => nexusMonitoringDomains(categories),
    [categories],
  );
  const selectDomain = (nextDomain: NexusMonitoringDomainId) => {
    setDomainId(nextDomain);
    replaceMonitoringUrl(nextDomain, domains, periodId);
  };
  const selectPeriod = (nextPeriod: string) => {
    setPeriodId(nextPeriod);
    setNotice(null);
    replaceMonitoringUrl(domainId, domains, nextPeriod);
  };
  const activeDomain =
    domains.find((domain) => domain.id === domainId) ?? domains[0];
  const activeDomainView = activeDomain.category
    ? domainViews[activeDomain.category]
    : undefined;
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
        <NexusMonitoringHeaderActions
          downloadLabel="Unduh Excel"
          manageLabel="Kelola target"
          onDownload={
            isKnownPeriod
              ? async () => {
                  setExportError("");
                  try {
                    const {
                      downloadNexusWorkbook,
                      nexusMonitoringPeriodWorkbook,
                    } = await import(
                      "@/components/nexus-monitoring/nexus-monitoring-export"
                    );
                    await downloadNexusWorkbook(
                      `monitoring-km-${periodId}.xlsx`,
                      nexusMonitoringPeriodWorkbook(input),
                    );
                  } catch {
                    setExportError(
                      "Berkas Excel belum dapat dibuat. Silakan coba lagi.",
                    );
                  }
                }
              : undefined
          }
          onManageTargets={
            capabilities.canManageTargets
              ? () => setTargetDrawerOpen(true)
              : undefined
          }
          onPeriodChange={selectPeriod}
          period={period}
          periodOptions={periodOptions}
        />
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
      {exportError ? (
        <div className={styles.pageNotice}>
          <NexusWorkspaceNotice tone="danger">
            {exportError}
          </NexusWorkspaceNotice>
        </div>
      ) : null}
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
                onClick={() => selectDomain(domain.id)}
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
                  selectDomain(nextDomain.id);
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

      {notice ? (
        <NexusMonitoringToast
          key={notice.id}
          message={notice.message}
          onDismiss={() => setNotice(null)}
        />
      ) : null}

      {isKnownPeriod ? null : (
        <NexusWorkspaceState
          actions={
            <NexusWorkspaceButton
              onClick={() => selectPeriod(NEXUS_DEFAULT_MONITORING_PERIOD_ID)}
              type="button"
            >
              Buka periode {NEXUS_DEFAULT_MONITORING_PERIOD_ID}
            </NexusWorkspaceButton>
          }
          description={
            capabilities.canManageTargets
              ? `Periode ${periodId} belum didaftarkan pada Monitoring KM. Tambahkan periodenya melalui Kelola target, atau buka periode yang sudah terdaftar.`
              : `Periode ${periodId} belum didaftarkan pada Monitoring KM. Pilih periode yang sudah terdaftar.`
          }
          eyebrow="Periode belum terdaftar"
          title={`Periode ${periodId} belum tersedia`}
        />
      )}

      <section
        hidden={!isKnownPeriod}
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
        ) : activeDomain.category &&
          nexusCategoryIsMonitored(activeDomain.category) &&
          activeDomainView ? (
          <NexusMonitoringDomainOverview
            periodLabel={period.label}
            updates={updates}
            view={activeDomainView}
          />
        ) : (
          <NexusMonitoringUnderConstruction
            domain={activeDomain}
            onBack={() => selectDomain(NEXUS_ALL_DOMAINS)}
            periodLabel={period.label}
          />
        )}
      </section>

      {targetDrawerOpen ? (
        <NexusMonitoringTargetDrawer
          onClose={() => setTargetDrawerOpen(false)}
          onPeriodAdded={selectPeriod}
          onSaved={(message) => {
            setTargetDrawerOpen(false);
            setNotice({ id: Date.now(), message });
          }}
          periodId={
            isKnownPeriod ? periodId : NEXUS_DEFAULT_MONITORING_PERIOD_ID
          }
          suggestedYear={
            !isKnownPeriod && Number.isInteger(Number(periodId))
              ? Number(periodId)
              : undefined
          }
        />
      ) : null}
    </NexusWorkspacePage>
  );
}
