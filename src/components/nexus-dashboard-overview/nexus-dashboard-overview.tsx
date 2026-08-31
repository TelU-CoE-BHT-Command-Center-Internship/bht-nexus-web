import Image from "next/image";
import biomedicalLabImage from "@/assets/nexus-dashboard-microscope-hero.webp";
import { NexusDashboardAnnouncement } from "@/components/nexus-dashboard-announcement/nexus-dashboard-announcement";
import { NexusDashboardInsights } from "@/components/nexus-dashboard-insights/nexus-dashboard-insights";
import styles from "@/components/nexus-dashboard-overview/nexus-dashboard-overview.module.css";
import { NexusDashboardOverviewIcon } from "@/components/nexus-dashboard-overview/nexus-dashboard-overview-icons";
import type { NexusDashboardOverviewContent } from "@/components/nexus-dashboard-overview/nexus-dashboard-overview-types";
import { NexusDashboardRecentProjects } from "@/components/nexus-dashboard-overview/nexus-dashboard-recent-projects";
import { NexusDashboardResearchActivity } from "@/components/nexus-dashboard-overview/nexus-dashboard-research-activity";

type NexusDashboardOverviewProps = {
  content: NexusDashboardOverviewContent;
};

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
            <span className={styles.dateValue}>
              <NexusDashboardOverviewIcon name="calendar" />
              <time dateTime={content.dateIso}>{content.dateLabel}</time>
            </span>
          </div>
        </div>

        {content.metrics.length === 0 ? (
          <p className={styles.emptyState}>
            Ringkasan metrik belum tersambung ke data resmi.
          </p>
        ) : null}

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
                  <span
                    aria-hidden="true"
                    className={styles.metricChange}
                    data-direction={metric.changeDirection}
                    title={metric.changeDescription}
                  >
                    <NexusDashboardOverviewIcon
                      name={
                        metric.changeDirection === "up"
                          ? "arrow-up"
                          : metric.changeDirection === "down"
                            ? "arrow-down"
                            : "steady"
                      }
                    />
                    {metric.changeLabel}
                  </span>
                  <span className={styles.visuallyHidden}>
                    {metric.changeDescription}
                  </span>
                </div>
                <span className={styles.metricDetail}>{metric.detail}</span>
                <span className={styles.metricComparison}>
                  {metric.comparisonLabel}
                </span>
              </div>
              <span className={styles.metricIcon}>
                <NexusDashboardOverviewIcon name={metric.icon} />
              </span>
            </article>
          ))}
        </div>
      </section>

      <NexusDashboardAnnouncement announcements={content.announcements} />

      <NexusDashboardInsights
        activities={content.recentActivities}
        activitiesActionLabel={content.recentActivitiesActionLabel}
        activitiesTitle={content.recentActivitiesTitle}
        programs={content.featuredPrograms}
      />

      <div className={styles.dashboardGrid}>
        <NexusDashboardResearchActivity content={content} />
        <NexusDashboardRecentProjects content={content} />
      </div>
    </div>
  );
}
