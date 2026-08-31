"use client";

import Link from "next/link";
import { useId, useState } from "react";
import styles from "@/components/nexus-monitoring/nexus-monitoring.module.css";
import {
  MonitoringBarChart,
  MonitoringRadialChart,
} from "@/components/nexus-monitoring/nexus-monitoring-charts";
import {
  NEXUS_MONITORING_HREF,
  NEXUS_MONITORING_RISET_HREF,
} from "@/components/nexus-monitoring/nexus-monitoring-evaluation";
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

function differenceBadge(view: MonitoringIndicatorView) {
  if (view.difference === null) return undefined;
  if (view.difference > 0) {
    return { label: "Melampaui target", tone: "success" as const };
  }
  if (view.difference === 0) {
    return { label: "Tepat pada target", tone: "success" as const };
  }
  return { label: "Kurang dari target", tone: "waiting" as const };
}

export function NexusMonitoringIndicator({
  view,
}: {
  view: MonitoringIndicatorView;
}) {
  const navigate = useNexusWorkspaceNavigation();
  const selectId = useId();
  const [breakdownId, setBreakdownId] = useState(view.breakdowns[0]?.id ?? "");

  const breakdown =
    view.breakdowns.find((item) => item.id === breakdownId) ??
    view.breakdowns[0];
  const progressShare =
    view.progressPercent === null ? 0 : view.progressPercent / 100;

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
        <label htmlFor={selectId}>
          Pindah indikator Riset
          <select
            id={selectId}
            onChange={(event) => navigate(event.currentTarget.value)}
            value={`/nexus/monitoring/riset/${view.id.toLocaleLowerCase("id-ID")}`}
          >
            {view.options.map((option) => (
              <option key={option.id} value={option.href}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
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

      <div className={styles.grid}>
        <div className={styles.spanMain}>
          <div className={styles.metricGrid}>
            <MonitoringMetricCard
              badge={{ label: view.unit }}
              fallback="Belum tersedia"
              icon="target"
              label={`Target ${view.period}`}
              value={view.target}
            />
            <MonitoringMetricCard
              badge={{ label: view.statusLabel, tone: view.statusTone }}
              fallback="Belum dapat dihitung"
              icon="check"
              label="Realisasi BHT Nexus"
              value={view.realization}
            />
            <MonitoringMetricCard
              badge={differenceBadge(view)}
              fallback="Belum dapat dihitung"
              icon="chart"
              label="Selisih terhadap target"
              value={view.difference}
            />
            <MonitoringMetricCard
              badge={{ label: view.houseLabel }}
              icon="database"
              label="Rekam resmi pembentuk"
              value={view.evidence.length}
            />
          </div>

          <MonitoringCard
            actions={
              view.breakdowns.length > 1 ? (
                <fieldset className={styles.segment}>
                  <legend className={styles.visuallyHidden}>
                    Pilih sebaran yang ditampilkan
                  </legend>
                  {view.breakdowns.map((item) => (
                    <button
                      aria-pressed={item.id === breakdown?.id}
                      data-active={item.id === breakdown?.id}
                      key={item.id}
                      onClick={() => setBreakdownId(item.id)}
                      type="button"
                    >
                      {item.label}
                    </button>
                  ))}
                </fieldset>
              ) : undefined
            }
            description={
              breakdown?.description ??
              "Sebaran dibentuk dari rekam resmi yang membentuk realisasi indikator ini."
            }
            headingId="monitoring-indicator-breakdown"
            title={breakdown?.title ?? "Sebaran rekam resmi"}
          >
            {breakdown ? (
              <>
                <MonitoringChartFrame
                  label={`${breakdown.title} untuk ${view.id} pada periode ${view.period}.`}
                >
                  <MonitoringBarChart
                    height={Math.max(200, breakdown.points.length * 46 + 60)}
                    name="Rekam resmi"
                    points={breakdown.points}
                    unitSuffix=" rekam"
                  />
                </MonitoringChartFrame>
                <MonitoringValueTable
                  caption={`${breakdown.title} pada periode ${view.period}.`}
                  columns={["Rekam resmi"]}
                  rowHeader={breakdown.title}
                  rows={breakdown.points.map((point) => ({
                    id: point.id,
                    label: point.label,
                    values: [`${point.value} rekam`],
                  }))}
                />
              </>
            ) : (
              <MonitoringUnavailable
                description="Sebaran baru dapat dibentuk setelah ada rekam resmi yang membentuk realisasi indikator ini."
                title="Belum ada sebaran yang dapat ditampilkan"
              />
            )}
          </MonitoringCard>
        </div>

        <div className={styles.spanSide}>
          <section
            aria-labelledby="monitoring-indicator-radial"
            className={styles.targetCard}
          >
            <div className={styles.targetPanel}>
              <div className={styles.cardHeading}>
                <h3 id="monitoring-indicator-radial">
                  Capaian terhadap target
                </h3>
                <p>
                  {`Realisasi ${view.id} dibandingkan target periode ${view.period}.`}
                </p>
              </div>
              <div className={styles.targetChartWrap}>
                <div className={styles.targetChart}>
                  <MonitoringRadialChart share={progressShare} />
                </div>
                <span className={styles.targetPill}>
                  <MonitoringBadge tone={view.statusTone}>
                    {view.statusLabel}
                  </MonitoringBadge>
                </span>
              </div>
              <p className={styles.targetCaption}>
                {view.progressPercent === null
                  ? "Capaian belum dapat dihitung karena target atau realisasinya belum tersedia."
                  : view.progressPercent > 100
                    ? `Capaian sebenarnya ${view.progressPercent}%; busur berhenti di 100% karena target sudah terlampaui.`
                    : `Capaian ${view.progressPercent}% dari target periode ini.`}
              </p>
            </div>
            <div className={styles.targetFooter}>
              <div>
                <p>Target</p>
                <strong>
                  <MonitoringNumber fallback="—" value={view.target} />
                </strong>
              </div>
              <span aria-hidden="true" className={styles.targetDivider} />
              <div>
                <p>Realisasi</p>
                <strong>
                  <MonitoringNumber fallback="—" value={view.realization} />
                </strong>
              </div>
              <span aria-hidden="true" className={styles.targetDivider} />
              <div>
                <p>Selisih</p>
                <strong>
                  <MonitoringNumber fallback="—" value={view.difference} />
                </strong>
              </div>
            </div>
          </section>
        </div>

        <div className={styles.spanFull}>
          <MonitoringCard
            description="Keterangan indikator mengikuti workbook KM 2026; angka realisasinya dihitung dari data resmi BHT Nexus."
            headingId="monitoring-indicator-definition"
            inlineHeader={false}
            title="Definisi, perhitungan, dan rujukan"
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
            </dl>

            <div className={styles.definitionNote}>
              <strong>Rujukan workbook KM 2026.</strong> Nilai berikut disalin
              apa adanya dari workbook sumber. Nilai ini tidak dihitung ulang
              dari data resmi BHT Nexus dan tidak dipakai sebagai realisasi.
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

        <div className={styles.spanSide}>
          <MonitoringCard
            description={`Triwulan dibaca dari ${view.quarterly.field.toLocaleLowerCase("id-ID")} pada rekam resmi, bukan dari waktu pembaruan datanya.`}
            headingId="monitoring-indicator-quarter"
            inlineHeader={false}
            title="Sebaran triwulan"
          >
            {view.quarterly.available ? (
              <>
                <MonitoringDistributionList
                  items={view.quarterly.items.map((item) => {
                    const total = view.quarterly.available
                      ? view.quarterly.items.reduce(
                          (sum, entry) => sum + entry.value,
                          0,
                        )
                      : 0;
                    return {
                      detail: item.range,
                      id: item.id,
                      label: item.label,
                      share: total === 0 ? 0 : item.value / total,
                      value: item.value,
                    };
                  })}
                  valueLabel={(item) => `${item.value}`}
                />
                {view.quarterly.undated > 0 ? (
                  <MonitoringChartSummary>
                    {`${view.quarterly.undated} rekam belum masuk triwulan mana pun karena ${view.quarterly.field.toLocaleLowerCase("id-ID")}nya belum tercatat.`}
                  </MonitoringChartSummary>
                ) : null}
              </>
            ) : (
              <MonitoringUnavailable
                description={`${view.quarterly.reason} Tren per triwulan belum dapat dibentuk dari tanggal resmi yang tersedia.`}
                title="Sebaran triwulan belum tersedia"
              />
            )}
          </MonitoringCard>
        </div>

        <div className={styles.spanWide}>
          <MonitoringCard
            description={view.contributorNote}
            headingId="monitoring-indicator-contributors"
            inlineHeader={false}
            title="Nama yang paling sering muncul"
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

        <div className={styles.spanFull}>
          <MonitoringCard
            headingId="monitoring-indicator-evidence"
            inlineHeader={false}
            description={
              view.realization === null
                ? "Realisasi indikator ini belum dapat dihitung, sehingga belum ada rekam pembentuk yang dapat ditampilkan."
                : `Realisasi ${view.realization} dibentuk oleh ${view.evidence.length} rekam resmi berikut. Setiap rekam dihitung satu kali menurut pengenal resminya.`
            }
            title="Data pembentuk realisasi"
          >
            {view.evidence.length === 0 ? (
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
                              record.quality === "Lengkap"
                                ? "success"
                                : "waiting"
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
      </div>
    </NexusWorkspacePage>
  );
}
