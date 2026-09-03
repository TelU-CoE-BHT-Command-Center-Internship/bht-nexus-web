"use client";

import Link from "next/link";
import { useState } from "react";
import styles from "@/components/nexus-monitoring/nexus-monitoring.module.css";
import {
  NEXUS_MONITORING_HREF,
  NEXUS_MONITORING_RISET_HREF,
} from "@/components/nexus-monitoring/nexus-monitoring-evaluation";
import {
  MonitoringCard,
  MonitoringChartSummary,
  MonitoringDistributionList,
  MonitoringMetricCard,
  MonitoringUnavailable,
} from "@/components/nexus-monitoring/nexus-monitoring-ui";
import type { MonitoringIndicatorView } from "@/components/nexus-monitoring/nexus-monitoring-view";
import { NexusWorkspaceBreadcrumb } from "@/components/nexus-workspace-ui/nexus-workspace-breadcrumb";
import { NexusWorkspacePage } from "@/components/nexus-workspace-ui/nexus-workspace-page";
import {
  NexusWorkspaceMobileCard,
  NexusWorkspaceRecordTable,
  NexusWorkspaceTableBadge,
  NexusWorkspaceTablePrimary,
  nexusWorkspaceRecordStyles as recordStyles,
} from "@/components/nexus-workspace-ui/nexus-workspace-records";
import {
  type NexusSelectConfig,
  NexusWorkspaceSelect,
} from "@/components/nexus-workspace-ui/nexus-workspace-select";
import { useNexusWorkspaceNavigation } from "@/components/nexus-workspace-ui/nexus-workspace-unsaved-changes";

function ChevronLeftIcon() {
  return (
    <svg aria-hidden="true" fill="none" viewBox="0 0 20 20">
      <path d="m12 15-5-5 5-5" />
    </svg>
  );
}

function ChevronRightIcon() {
  return (
    <svg aria-hidden="true" fill="none" viewBox="0 0 20 20">
      <path d="m8 5 5 5-5 5" />
    </svg>
  );
}

function ArrowRightIcon() {
  return (
    <svg aria-hidden="true" fill="none" viewBox="0 0 20 20">
      <path d="M4 10h12M10.5 4.5 16 10l-5.5 5.5" />
    </svg>
  );
}

/** Keterangan selisih yang menyebut arahnya, bukan sekadar angka bertanda. */
function differenceDetail(view: MonitoringIndicatorView) {
  if (view.difference === null) {
    return "Selisih terhadap target belum dapat dihitung.";
  }
  if (view.difference > 0) {
    return `Melampaui target sebanyak ${view.difference}.`;
  }
  if (view.difference === 0) {
    return "Realisasi tepat pada target periode ini.";
  }
  return `Kurang ${Math.abs(view.difference)} dari target periode ini.`;
}

function shareOf(value: number, total: number) {
  return total === 0 ? 0 : value / total;
}

export function NexusMonitoringIndicator({
  view,
}: {
  view: MonitoringIndicatorView;
}) {
  const navigate = useNexusWorkspaceNavigation();
  const [isIndicatorOpen, setIsIndicatorOpen] = useState(false);

  const [firstOption, ...otherOptions] = view.options;
  const indicatorSelectConfig: NexusSelectConfig = {
    defaultValue: view.id,
    id: "monitoring-indicator-switch",
    label: "Pindah indikator Riset",
    options: [
      { label: firstOption.label, value: firstOption.id },
      ...otherOptions.map((option) => ({
        label: option.label,
        value: option.id,
      })),
    ],
  };
  const recordCount = view.evidence.length;
  const quarterTotal = view.quarterly.available
    ? view.quarterly.items.reduce((sum, item) => sum + item.value, 0)
    : 0;

  return (
    <NexusWorkspacePage
      description={view.definition}
      descriptionId="monitoring-indicator-description"
      meta={`Periode evaluasi ${view.period}`}
      title={`${view.id} · ${view.label}`}
      titleId="monitoring-indicator-title"
    >
      <NexusWorkspaceBreadcrumb
        current={view.id}
        onNavigate={navigate}
        trail={[
          { href: NEXUS_MONITORING_HREF, label: "Monitoring KM" },
          { href: NEXUS_MONITORING_RISET_HREF, label: "Riset" },
        ]}
      />

      <div className={styles.indicatorNav}>
        <div className={styles.indicatorSelect}>
          <NexusWorkspaceSelect
            config={indicatorSelectConfig}
            isOpen={isIndicatorOpen}
            name="monitoring-indicator-switch"
            onOpenChange={setIsIndicatorOpen}
            onValueChange={(value) => {
              const target = view.options.find((option) => option.id === value);
              if (target) navigate(target.href);
            }}
            value={view.id}
          />
        </div>
        <div className={styles.navButtons}>
          {view.previousHref ? (
            <Link
              className={styles.navButton}
              href={view.previousHref}
              prefetch={false}
            >
              <ChevronLeftIcon />
              Sebelumnya
            </Link>
          ) : (
            <span aria-disabled="true" className={styles.navButton}>
              <ChevronLeftIcon />
              Sebelumnya
            </span>
          )}
          {view.nextHref ? (
            <Link
              className={styles.navButton}
              href={view.nextHref}
              prefetch={false}
            >
              Berikutnya
              <ChevronRightIcon />
            </Link>
          ) : (
            <span aria-disabled="true" className={styles.navButton}>
              Berikutnya
              <ChevronRightIcon />
            </span>
          )}
        </div>
      </div>

      <div className={styles.summaryMetricGrid}>
        <MonitoringMetricCard
          detail={`Periode ${view.period} · workbook KM 2026`}
          fallback="Belum tersedia"
          icon="target"
          label="Target"
          tone="blue"
          unit={view.unit.toLocaleLowerCase("id-ID")}
          value={view.target}
          variant="summary"
        />
        <MonitoringMetricCard
          detail="Dihitung dari data resmi, bukan dari catatan workbook."
          fallback="Belum dapat dihitung"
          icon="check"
          label="Realisasi BHT Nexus"
          tone="green"
          unit={view.unit.toLocaleLowerCase("id-ID")}
          value={view.realization}
          variant="summary"
        />
        <MonitoringMetricCard
          badge={{ label: view.statusLabel, tone: view.statusTone }}
          detail={differenceDetail(view)}
          fallback="Belum dapat dihitung"
          icon="chart"
          label="Capaian terhadap target"
          suffix="%"
          tone="gold"
          value={view.progressPercent}
          variant="summary"
        />
        <MonitoringMetricCard
          detail={`${view.houseLabel} · periode ${view.period}`}
          icon="database"
          label="Rekam resmi pembentuk"
          tone="violet"
          unit="rekam"
          value={recordCount}
          variant="summary"
        />
      </div>

      <div className={styles.monitoringSection}>
        <MonitoringCard
          description="Keterangan indikator mengikuti workbook KM 2026; angka realisasinya dihitung dari data resmi BHT Nexus."
          headingId="monitoring-indicator-definition"
          inlineHeader={false}
          title="Definisi, Perhitungan, dan Rujukan"
        >
          <dl className={styles.definitionGrid}>
            <div className={styles.definitionItem}>
              <dt>Definisi indikator</dt>
              <dd>{view.definition}</dd>
            </div>
            <div className={styles.definitionItem}>
              <dt>Cara perhitungan</dt>
              <dd>{view.calculation}</dd>
            </div>
            <div className={styles.definitionItem}>
              <dt>Eviden</dt>
              <dd>
                {view.evidenceRequirement ??
                  "Belum tercatat pada workbook KM 2026. Bukti setiap rekam tetap dapat diperiksa pada daftar data pembentuk realisasi."}
              </dd>
            </div>
            <div className={styles.definitionItem}>
              <dt>Tujuan pengukuran</dt>
              <dd>{view.purpose}</dd>
            </div>
            <div className={styles.definitionItem}>
              <dt>Kategori</dt>
              <dd>{view.categoryLabel}</dd>
            </div>
            <div className={styles.definitionItem}>
              <dt>Rumah data resmi</dt>
              <dd>
                <Link
                  className={styles.inlineLink}
                  href={view.houseHref}
                  prefetch={false}
                >
                  {view.houseLabel}
                  <ArrowRightIcon />
                </Link>
              </dd>
            </div>
            <div className={styles.definitionItem}>
              <dt>Sumber target</dt>
              <dd>{view.targetReference}</dd>
            </div>
            <div className={styles.definitionItem}>
              <dt>Tanggal penentu triwulan</dt>
              <dd>{view.quarterly.field}</dd>
            </div>
          </dl>

          <div className={styles.definitionNote}>
            <strong>Rujukan workbook KM 2026.</strong> Nilai berikut disalin apa
            adanya dari workbook sumber. Nilai ini tidak dihitung ulang dari
            data resmi BHT Nexus dan tidak dipakai sebagai realisasi.
            <dl className={styles.workbookList}>
              <div>
                <dt>{`Realisasi ${view.workbook.previousPeriodLabel}`}</dt>
                <dd>
                  {view.workbook.previousPeriodValue === null
                    ? "Tidak tercatat"
                    : view.workbook.previousPeriodValue}
                </dd>
              </div>
              {view.workbook.quarterly.map((value, index) => (
                <div key={`workbook-tw-${index + 1}`}>
                  <dt>{`Catatan TW${index + 1} ${view.period}`}</dt>
                  <dd>{value === null ? "Belum diisi" : value}</dd>
                </div>
              ))}
            </dl>
          </div>

          {view.insights.length > 0 ? (
            <>
              <p className={styles.definitionNote}>
                <strong>Catatan capaian.</strong>
              </p>
              <ul className={styles.insightList}>
                {view.insights.map((insight) => (
                  <li key={insight}>{insight}</li>
                ))}
              </ul>
            </>
          ) : null}
        </MonitoringCard>
      </div>

      <div className={styles.insightGrid}>
        <MonitoringCard
          description={`Triwulan dibaca dari ${view.quarterly.field.toLocaleLowerCase("id-ID")} pada rekam resmi, bukan dari waktu pembaruan datanya.`}
          headingId="monitoring-indicator-quarter"
          inlineHeader={false}
          title="Sebaran Triwulan"
        >
          {view.quarterly.available ? (
            <>
              <MonitoringDistributionList
                items={view.quarterly.items.map((item) => ({
                  detail: item.range,
                  id: item.id,
                  label: item.label,
                  share: shareOf(item.value, quarterTotal),
                  value: item.value,
                }))}
                valueLabel={(item) => `${item.value} rekam`}
              />
              {view.quarterly.undated > 0 ? (
                <MonitoringChartSummary>
                  {`${view.quarterly.undated} rekam belum masuk triwulan mana pun karena ${view.quarterly.field.toLocaleLowerCase("id-ID")}nya belum tercatat.`}
                </MonitoringChartSummary>
              ) : null}
            </>
          ) : (
            <MonitoringUnavailable
              description={`${view.quarterly.reason} Sebaran triwulan baru dapat dibentuk setelah tanggal resmi itu tersedia.`}
              title="Sebaran triwulan belum tersedia"
            />
          )}
        </MonitoringCard>

        {view.breakdowns.map((breakdown) => (
          <MonitoringCard
            description={breakdown.description}
            headingId={`monitoring-indicator-breakdown-${breakdown.id}`}
            inlineHeader={false}
            key={breakdown.id}
            title={breakdown.title}
          >
            <MonitoringDistributionList
              items={breakdown.points.map((point) => ({
                detail: `${Math.round(shareOf(point.value, recordCount) * 100)}% dari rekam pembentuk`,
                id: point.id,
                label: point.label,
                share: shareOf(point.value, recordCount),
                value: point.value,
              }))}
              valueLabel={(item) => `${item.value} rekam`}
            />
          </MonitoringCard>
        ))}

        <MonitoringCard
          description={view.contributorNote}
          headingId="monitoring-indicator-contributors"
          inlineHeader={false}
          title="Nama yang Paling Sering Muncul"
        >
          {view.contributors.length > 0 ? (
            <MonitoringDistributionList
              items={view.contributors}
              valueLabel={(item) => `${item.value} rekam`}
            />
          ) : (
            <MonitoringUnavailable
              description="Sumber belum mencatat nama pada rekam resmi indikator ini."
              title="Belum ada nama yang tercatat"
            />
          )}
        </MonitoringCard>
      </div>

      <div className={styles.monitoringSection}>
        <MonitoringCard
          description={
            view.realization === null
              ? "Realisasi indikator ini belum dapat dihitung, sehingga belum ada rekam pembentuk yang dapat ditampilkan."
              : `Realisasi ${view.realization} dibentuk oleh ${recordCount} rekam resmi berikut. Setiap rekam dihitung satu kali menurut pengenal resminya.`
          }
          headingId="monitoring-indicator-evidence"
          inlineHeader={false}
          title="Data Pembentuk Realisasi"
        >
          {recordCount === 0 ? (
            <MonitoringUnavailable
              description="Belum ada rekam resmi yang dikaitkan dengan indikator ini pada periode evaluasi berjalan."
              title="Belum ada realisasi dari data resmi"
            />
          ) : (
            <div className={styles.tableSurface}>
              <NexusWorkspaceRecordTable
                caption={`Rekam resmi pembentuk realisasi ${view.id}`}
                columns={[
                  { id: "record", label: "Rekam resmi", primary: true },
                  { id: "house", label: "Rumah data" },
                  { id: "date", label: view.quarterly.field },
                  { id: "evidence", label: "Bukti" },
                  { id: "quality", label: "Kelengkapan" },
                  { id: "action", label: "Data resmi" },
                ]}
                empty={null}
                pagination={null}
                rows={view.evidence.map((record) => ({
                  cells: {
                    action: (
                      <Link
                        className={styles.inlineLink}
                        href={record.houseHref}
                        prefetch={false}
                      >
                        {`Buka ${record.houseLabel}`}
                        <ArrowRightIcon />
                      </Link>
                    ),
                    date: record.businessDate,
                    evidence: (
                      <NexusWorkspaceTableBadge
                        tone={
                          record.evidenceState === "public"
                            ? "success"
                            : record.evidenceState === "internal"
                              ? "info"
                              : "waiting"
                        }
                      >
                        {record.evidenceLabel}
                      </NexusWorkspaceTableBadge>
                    ),
                    house: record.houseLabel,
                    quality: (
                      <NexusWorkspaceTableBadge
                        tone={
                          record.quality === "Lengkap" ? "success" : "waiting"
                        }
                      >
                        {record.quality}
                      </NexusWorkspaceTableBadge>
                    ),
                    record: (
                      <>
                        <NexusWorkspaceTablePrimary
                          subtitle={`${record.publicId} · ${record.subtitle}`}
                          title={record.title}
                        />
                        {record.notes.length > 0 ? (
                          <ul className={styles.recordNotes}>
                            {record.notes.map((note) => (
                              <li key={note}>{note}</li>
                            ))}
                          </ul>
                        ) : null}
                      </>
                    ),
                  },
                  id: record.id,
                  mobile: (
                    <NexusWorkspaceMobileCard
                      action={
                        <Link
                          className={recordStyles.mobileAction}
                          href={record.houseHref}
                          prefetch={false}
                        >
                          {`Buka ${record.houseLabel}`}
                          <ArrowRightIcon />
                        </Link>
                      }
                      eyebrow={
                        <NexusWorkspaceTableBadge
                          tone={
                            record.quality === "Lengkap" ? "success" : "waiting"
                          }
                        >
                          {record.quality}
                        </NexusWorkspaceTableBadge>
                      }
                      meta={
                        <>
                          <span>{record.publicId}</span>
                          <span>{`${view.quarterly.field}: ${record.businessDate}`}</span>
                          <span>{record.evidenceLabel}</span>
                        </>
                      }
                      title={record.title}
                    >
                      <p>{record.subtitle}</p>
                    </NexusWorkspaceMobileCard>
                  ),
                }))}
              />
            </div>
          )}
        </MonitoringCard>
      </div>
    </NexusWorkspacePage>
  );
}
