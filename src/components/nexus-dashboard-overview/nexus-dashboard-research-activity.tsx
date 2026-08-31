import styles from "@/components/nexus-dashboard-overview/nexus-dashboard-overview.module.css";
import { NexusDashboardOverviewIcon } from "@/components/nexus-dashboard-overview/nexus-dashboard-overview-icons";
import type {
  NexusDashboardOverviewContent,
  ResearchActivitySeries,
} from "@/components/nexus-dashboard-overview/nexus-dashboard-overview-types";

type ResearchActivityContent = Pick<
  NexusDashboardOverviewContent,
  | "activityPeriodLabel"
  | "activitySeries"
  | "activitySubtitle"
  | "activityTitle"
  | "activityXAxis"
>;

type ResearchActivityProps = {
  content: ResearchActivityContent;
};

type ChartPoint = {
  x: number;
  y: number;
};

const CHART_WIDTH = 620;
const CHART_HEIGHT = 260;
const CHART_PADDING = {
  bottom: 38,
  left: 42,
  right: 48,
  top: 20,
};
const CHART_MAXIMUM = 60;
const CHART_TICKS = [60, 45, 30, 15, 0];

function createChartPoints(values: number[]): ChartPoint[] {
  const availableWidth = CHART_WIDTH - CHART_PADDING.left - CHART_PADDING.right;
  const availableHeight =
    CHART_HEIGHT - CHART_PADDING.top - CHART_PADDING.bottom;

  return values.map((value, index) => ({
    x:
      CHART_PADDING.left +
      (availableWidth * index) / Math.max(values.length - 1, 1),
    y:
      CHART_PADDING.top +
      availableHeight -
      (availableHeight * value) / CHART_MAXIMUM,
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

function ResearchActivityChart({ content }: ResearchActivityProps) {
  const seriesWithPoints = content.activitySeries.map((series) => ({
    ...series,
    points: createChartPoints(series.values),
  }));
  const plotHeight = CHART_HEIGHT - CHART_PADDING.top - CHART_PADDING.bottom;
  const plotWidth = CHART_WIDTH - CHART_PADDING.left - CHART_PADDING.right;

  return (
    <>
      <svg
        aria-labelledby="research-activity-chart-title research-activity-chart-description"
        className={styles.chart}
        role="img"
        viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}
      >
        <title id="research-activity-chart-title">
          {content.activityTitle}
        </title>
        <desc id="research-activity-chart-description">
          {content.activitySubtitle}. Grafik memuat proyek, publikasi, dan
          dataset selama enam bulan.
        </desc>

        {CHART_TICKS.map((tick) => {
          const y =
            CHART_PADDING.top +
            plotHeight -
            (plotHeight * tick) / CHART_MAXIMUM;

          return (
            <g key={tick}>
              <line
                className={styles.chartGridLine}
                x1={CHART_PADDING.left}
                x2={CHART_WIDTH - CHART_PADDING.right}
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
              CHART_PADDING.left +
              (plotWidth * index) /
                Math.max(content.activityXAxis.length - 1, 1)
            }
            y={CHART_HEIGHT - 10}
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

export function NexusDashboardResearchActivity({
  content,
}: ResearchActivityProps) {
  const hasData = content.activitySeries.length > 0;

  return (
    <section aria-labelledby="research-activity-title" className={styles.panel}>
      <div className={styles.panelHeader}>
        <div>
          <h2 id="research-activity-title">{content.activityTitle}</h2>
          <p>{content.activitySubtitle}</p>
        </div>
        {hasData ? (
          <span className={styles.periodControl}>
            {content.activityPeriodLabel}
            <NexusDashboardOverviewIcon name="chevron-down" />
          </span>
        ) : null}
      </div>

      {hasData ? (
        <>
          <ActivityLegend series={content.activitySeries} />
          <ResearchActivityChart content={content} />
        </>
      ) : (
        <p className={styles.panelEmptyState}>
          Belum ada data aktivitas riset untuk ditampilkan.
        </p>
      )}
    </section>
  );
}
