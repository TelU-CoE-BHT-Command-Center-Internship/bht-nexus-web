"use client";

import { useMemo, useState } from "react";
import type { NexusMonitoringCapabilities } from "@/components/nexus-dashboard-shell/nexus-workspace-access";
import styles from "@/components/nexus-monitoring/nexus-monitoring.module.css";
import { useNexusMonitoringData } from "@/components/nexus-monitoring/nexus-monitoring-data";
import {
  nexusIndicatorEvaluation,
  nexusIndicatorHref,
} from "@/components/nexus-monitoring/nexus-monitoring-evaluation";
import {
  downloadNexusCsv,
  nexusMonitoringIndicatorCsv,
} from "@/components/nexus-monitoring/nexus-monitoring-export";
import { NexusMonitoringHeaderActions } from "@/components/nexus-monitoring/nexus-monitoring-header-actions";
import { NexusMonitoringIndicator } from "@/components/nexus-monitoring/nexus-monitoring-indicator";
import {
  NEXUS_DEFAULT_MONITORING_PERIOD_ID,
  nexusMonitoringPeriodHref,
} from "@/components/nexus-monitoring/nexus-monitoring-period";
import { NexusMonitoringTargetDrawer } from "@/components/nexus-monitoring/nexus-monitoring-target-drawer";
import { buildIndicatorView } from "@/components/nexus-monitoring/nexus-monitoring-view";
import { useNexusReviewSession } from "@/components/nexus-review-session/nexus-review-session";
import {
  NexusWorkspaceButton,
  NexusWorkspaceNotice,
} from "@/components/nexus-workspace-ui/nexus-workspace-elements";
import { NexusWorkspacePage } from "@/components/nexus-workspace-ui/nexus-workspace-page";
import { NexusWorkspaceState } from "@/components/nexus-workspace-ui/nexus-workspace-state";
import type { NexusKmIndicatorId } from "@/content/nexus-km-indicators";

/**
 * Rincian satu indikator KM yang dihitung dari rekam resmi sesi berjalan dan
 * target versi terbaru periode terpilih. Target dapat diubah dan rekam dapat
 * dikoreksi langsung dari halaman ini tanpa berpindah halaman.
 */
export function NexusMonitoringIndicatorScreen({
  capabilities,
  indicatorId,
  requestedPeriodId = NEXUS_DEFAULT_MONITORING_PERIOD_ID,
}: {
  capabilities: NexusMonitoringCapabilities;
  indicatorId: NexusKmIndicatorId;
  requestedPeriodId?: string;
}) {
  const reviewSession = useNexusReviewSession();
  const [periodId, setPeriodId] = useState(requestedPeriodId);
  const [targetDrawerOpen, setTargetDrawerOpen] = useState(false);
  const [notice, setNotice] = useState("");
  const { input, isKnownPeriod, period, periodOptions } =
    useNexusMonitoringData(periodId);
  const view = useMemo(
    () => buildIndicatorView(indicatorId, input),
    [indicatorId, input],
  );
  const evaluation = nexusIndicatorEvaluation(indicatorId);

  const selectPeriod = (nextPeriod: string) => {
    setPeriodId(nextPeriod);
    setNotice("");
    window.history.replaceState(
      window.history.state,
      "",
      nexusMonitoringPeriodHref(nexusIndicatorHref(indicatorId), nextPeriod),
    );
  };

  if (!view || !evaluation) return null;

  return (
    <NexusWorkspacePage
      actions={
        <NexusMonitoringHeaderActions
          downloadLabel="Unduh rekam"
          manageLabel="Ubah target"
          onDownload={
            isKnownPeriod
              ? () =>
                  downloadNexusCsv(
                    `monitoring-km-${periodId}-${indicatorId.toLocaleLowerCase("id-ID")}-rekam.csv`,
                    nexusMonitoringIndicatorCsv(view),
                  )
              : undefined
          }
          onManageTargets={
            capabilities.canManageTargets && isKnownPeriod
              ? () => setTargetDrawerOpen(true)
              : undefined
          }
          onPeriodChange={selectPeriod}
          period={period}
          periodOptions={periodOptions}
        />
      }
      description={view.definition}
      descriptionId="monitoring-indicator-description"
      meta={`Periode evaluasi ${period.year}`}
      title={`${view.id} · ${view.label}`}
      titleId="monitoring-indicator-title"
    >
      {notice ? (
        <div className={styles.pageNotice}>
          <NexusWorkspaceNotice tone="success">{notice}</NexusWorkspaceNotice>
        </div>
      ) : null}

      {isKnownPeriod ? (
        <NexusMonitoringIndicator
          canCorrectRecords={capabilities.canCorrectRecords}
          corrections={reviewSession.officialRecordCorrections}
          key={view.id}
          onCorrect={(recordPublicId, correction) => {
            const record = view.records.find(
              (item) => item.publicId === recordPublicId,
            );
            if (!record) return;
            reviewSession.applyOfficialRecordCorrection({
              changes: correction.changes,
              family: record.correction.family,
              reason: correction.reason,
              recordPublicId,
              values: correction.values,
            });
          }}
          periodLabel={period.label}
          view={view}
        />
      ) : (
        <NexusWorkspaceState
          actions={
            <NexusWorkspaceButton
              onClick={() => selectPeriod(NEXUS_DEFAULT_MONITORING_PERIOD_ID)}
              type="button"
            >
              Buka periode {NEXUS_DEFAULT_MONITORING_PERIOD_ID}
            </NexusWorkspaceButton>
          }
          description={`Periode ${periodId} belum didaftarkan pada Monitoring KM. Pilih periode yang sudah terdaftar, atau tambahkan periodenya melalui Kelola target pada Ringkasan.`}
          eyebrow="Periode belum terdaftar"
          title={`Periode ${periodId} belum tersedia`}
        />
      )}

      {targetDrawerOpen ? (
        <NexusMonitoringTargetDrawer
          focusIndicatorId={indicatorId}
          onClose={() => setTargetDrawerOpen(false)}
          onPeriodAdded={selectPeriod}
          onSaved={(message) => {
            setTargetDrawerOpen(false);
            setNotice(message);
          }}
          periodId={periodId}
        />
      ) : null}
    </NexusWorkspacePage>
  );
}
