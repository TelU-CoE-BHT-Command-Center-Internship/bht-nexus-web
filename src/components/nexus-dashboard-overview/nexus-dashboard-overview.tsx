import Image from "next/image";
import biomedicalLabImage from "@/assets/biomedical-lab-hero.jpg";
import styles from "@/components/nexus-dashboard-overview/nexus-dashboard-overview.module.css";
import type {
  NexusDashboardOverviewContent,
  ResearchActivitySeries,
} from "@/components/nexus-dashboard-overview/nexus-dashboard-overview-content";
import { NexusDashboardOverviewIcon } from "@/components/nexus-dashboard-overview/nexus-dashboard-overview-icons";

type NexusDashboardOverviewProps = {
  content: NexusDashboardOverviewContent;
};

type ChartPoint = {
  x: number;
  y: number;
};

const chartWidth = 620;
const chartHeight = 260;
const chartPadding = {
  bottom: 38,
  left: 42,
  right: 48,
  top: 20,
};
const chartMaximum = 60;
const chartTicks = [60, 45, 30, 15, 0];

function createChartPoints(values: number[]): ChartPoint[] {
  const availableWidth = chartWidth - chartPadding.left - chartPadding.right;
  const availableHeight = chartHeight - chartPadding.top - chartPadding.bottom;

  return values.map((value, index) => ({
    x:
      chartPadding.left +
      (availableWidth * index) / Math.max(values.length - 1, 1),
    y:
      chartPadding.top +
      availableHeight -
      (availableHeight * value) / chartMaximum,
  }));
}

function createSmoothPath(points: ChartPoint[]) {
  if (points.length === 0) {
    return "";
  }

  if (points.length === 1) {
    return `M ${points[0].x} ${points[0].y}`;
  }

  const curve = points.slice(1).reduce((path, point, index) => {
    const previous = points[index];
    const midpointX = (previous.x + point.x) / 2;
    const midpointY = (previous.y + point.y) / 2;

    return `${path} Q ${previous.x} ${previous.y}, ${midpointX} ${midpointY}`;
  }, `M ${points[0].x} ${points[0].y}`);

  return `${curve} T ${points.at(-1)?.x} ${points.at(-1)?.y}`;
}

function ResearchActivityChart({
  content,
}: {
  content: Pick<
    NexusDashboardOverviewContent,
    "activitySeries" | "activitySubtitle" | "activityTitle" | "activityXAxis"
  >;
}) {
  const seriesWithPoints = content.activitySeries.map((series) => ({
    ...series,
    points: createChartPoints(series.values),
  }));
  const plotHeight = chartHeight - chartPadding.top - chartPadding.bottom;
  const plotWidth = chartWidth - chartPadding.left - chartPadding.right;

  return (
    <>
      <svg
        aria-labelledby="research-activity-chart-title research-activity-chart-description"
        className={styles.chart}
        role="img"
        viewBox={`0 0 ${chartWidth} ${chartHeight}`}
      >
        <title id="research-activity-chart-title">
          {content.activityTitle}
        </title>
        <desc id="research-activity-chart-description">
          {content.activitySubtitle}. Grafik memuat proyek, publikasi, dan
          dataset selama enam bulan.
        </desc>

        {chartTicks.map((tick) => {
          const y =
            chartPadding.top + plotHeight - (plotHeight * tick) / chartMaximum;

          return (
            <g key={tick}>
              <line
                className={styles.chartGridLine}
                x1={chartPadding.left}
                x2={chartWidth - chartPadding.right}
                y1={y}
                y2={y}
              />
              <text className={styles.chartAxisLabel} x="6" y={y + 4}>
                {tick}
              </text>
            </g>
          );
        })}

        {content.activityXAxis.map((label, index) => (
          <text
            className={styles.chartAxisLabel}
            key={label}
            textAnchor="middle"
            x={
              chartPadding.left +
              (plotWidth * index) /
                Math.max(content.activityXAxis.length - 1, 1)
            }
            y={chartHeight - 10}
          >
            {label}
          </text>
        ))}

        {seriesWithPoints.map((series) => (
          <g
            className={styles.chartSeries}
            data-tone={series.tone}
            key={series.id}
          >
            <path d={createSmoothPath(series.points)} />
            {series.points.map((point, index) => (
              <circle
                cx={point.x}
                cy={point.y}
                key={`${series.id}-${content.activityXAxis[index]}`}
                r="3.5"
              />
            ))}
            <text
              className={styles.chartEndValue}
              x={(series.points.at(-1)?.x ?? 0) + 14}
              y={(series.points.at(-1)?.y ?? 0) + 4}
            >
              {series.values.at(-1)}
            </text>
          </g>
        ))}
      </svg>

      <table className={styles.chartDataTable}>
        <caption>Data alternatif untuk grafik aktivitas riset</caption>
        <thead>
          <tr>
            <th scope="col">Kategori</th>
            {content.activityXAxis.map((label) => (
              <th key={label} scope="col">
                {label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {content.activitySeries.map((series) => (
            <tr key={series.id}>
              <th scope="row">{series.label}</th>
              {series.values.map((value, index) => (
                <td key={`${series.id}-${content.activityXAxis[index]}`}>
                  {value}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}

function ActivityLegend({ series }: { series: ResearchActivitySeries[] }) {
  return (
    <ul aria-label="Legenda grafik" className={styles.chartLegend}>
      {series.map((item) => (
        <li data-tone={item.tone} key={item.id}>
          <span aria-hidden="true" />
          {item.label}
        </li>
      ))}
    </ul>
  );
}

export function NexusDashboardOverview({
  content,
}: NexusDashboardOverviewProps) {
  return (
    <div className={styles.page}>
      <section
        aria-labelledby="dashboard-welcome-title"
        className={styles.welcomePanel}
      >
        <div aria-hidden="true" className={styles.welcomeVisual}>
          <Image
            alt=""
            fill
            loading="eager"
            placeholder="blur"
            sizes="(max-width: 56rem) 100vw, 74vw"
            src={biomedicalLabImage}
          />
        </div>
        <span aria-hidden="true" className={styles.welcomeWash} />

        <div className={styles.welcomeHeader}>
          <div className={styles.welcomeCopy}>
            <h2 id="dashboard-welcome-title">
              {content.greeting} <span aria-hidden="true">👋</span>
            </h2>
            <p>{content.intro}</p>
          </div>

          <div className={styles.dateBlock}>
            <span className={styles.previewBadge}>{content.previewLabel}</span>
            <span className={styles.dateValue}>
              <NexusDashboardOverviewIcon name="calendar" />
              <time dateTime={content.dateIso}>{content.dateLabel}</time>
            </span>
          </div>
        </div>

        <div className={styles.metricsGrid}>
          {content.metrics.map((metric) => (
            <article
              className={styles.metricCard}
              data-tone={metric.tone}
              key={metric.id}
            >
              <div className={styles.metricCopy}>
                <p>{metric.label}</p>
                <div className={styles.metricValueRow}>
                  <strong>{metric.value}</strong>
                  <span className={styles.metricChange}>
                    <NexusDashboardOverviewIcon name="arrow-up" />
                    {metric.changeLabel}
                  </span>
                </div>
                <span className={styles.metricDetail}>{metric.detail}</span>
              </div>
              <span className={styles.metricIcon}>
                <NexusDashboardOverviewIcon name={metric.icon} />
              </span>
            </article>
          ))}
        </div>
      </section>

      <div className={styles.dashboardGrid}>
        <section
          aria-labelledby="research-activity-title"
          className={styles.panel}
        >
          <div className={styles.panelHeader}>
            <div>
              <h2 id="research-activity-title">{content.activityTitle}</h2>
              <p>{content.activitySubtitle}</p>
            </div>
            <span className={styles.periodControl}>
              {content.activityPeriodLabel}
              <NexusDashboardOverviewIcon name="chevron-down" />
            </span>
          </div>

          <ActivityLegend series={content.activitySeries} />
          <ResearchActivityChart content={content} />
        </section>

        <section
          aria-labelledby="recent-projects-title"
          className={`${styles.panel} ${styles.recentProjectsPanel}`}
        >
          <div className={styles.projectsHeader}>
            <h2 id="recent-projects-title">{content.recentProjectsTitle}</h2>
            <span className={styles.projectsAction}>
              {content.recentProjectsActionLabel}
              <NexusDashboardOverviewIcon name="arrow-right" />
            </span>
          </div>

          <div className={styles.projectsTableWrap}>
            <table className={styles.projectsTable}>
              <thead>
                <tr>
                  <th scope="col">{content.recentProjectsColumns.project}</th>
                  <th scope="col">
                    {content.recentProjectsColumns.leadResearcher}
                  </th>
                  <th scope="col">{content.recentProjectsColumns.status}</th>
                  <th scope="col">{content.recentProjectsColumns.updatedAt}</th>
                </tr>
              </thead>
              <tbody>
                {content.recentProjects.map((project) => (
                  <tr key={project.id}>
                    <th scope="row">{project.title}</th>
                    <td
                      data-label={content.recentProjectsColumns.leadResearcher}
                    >
                      {project.leadResearcher}
                    </td>
                    <td data-label={content.recentProjectsColumns.status}>
                      <span
                        className={styles.projectStatus}
                        data-status={project.status}
                      >
                        {project.status}
                      </span>
                    </td>
                    <td data-label={content.recentProjectsColumns.updatedAt}>
                      <time>{project.updatedAt}</time>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}
