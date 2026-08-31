"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import styles from "@/components/nexus-dashboard-insights/nexus-dashboard-insights.module.css";
import { NexusDashboardInsightsIcon } from "@/components/nexus-dashboard-insights/nexus-dashboard-insights-icons";
import type {
  DashboardFeaturedProgram,
  DashboardRecentActivity,
} from "@/components/nexus-dashboard-overview/nexus-dashboard-overview-types";

type NexusDashboardInsightsProps = {
  activities: DashboardRecentActivity[];
  activitiesActionLabel: string;
  activitiesTitle: string;
  programs: DashboardFeaturedProgram[];
};

const initialActivityCount = 5;

export function NexusDashboardInsights({
  activities,
  activitiesActionLabel,
  activitiesTitle,
  programs,
}: NexusDashboardInsightsProps) {
  const posterDialogRef = useRef<HTMLDialogElement>(null);
  const [activeProgramIndex, setActiveProgramIndex] = useState(0);
  const [showAllActivities, setShowAllActivities] = useState(false);
  const activeProgram = programs[activeProgramIndex] ?? programs[0];
  const hasAdditionalActivities = activities.length > initialActivityCount;
  const visibleActivities = showAllActivities
    ? activities
    : activities.slice(0, initialActivityCount);
  const hasMultiplePrograms = programs.length > 1;

  if (!activeProgram) {
    return null;
  }

  function showPreviousProgram() {
    setActiveProgramIndex(
      (currentIndex) => (currentIndex - 1 + programs.length) % programs.length,
    );
  }

  function showNextProgram() {
    setActiveProgramIndex(
      (currentIndex) => (currentIndex + 1) % programs.length,
    );
  }

  function openPoster() {
    posterDialogRef.current?.showModal();
  }

  function closePoster() {
    posterDialogRef.current?.close();
  }

  return (
    <section
      aria-label="Ringkasan aktivitas dan program"
      className={styles.grid}
    >
      <section
        aria-labelledby="dashboard-recent-activity-title"
        className={`${styles.panel} ${styles.activityPanel}`}
      >
        <div className={styles.panelHeader}>
          <h2 id="dashboard-recent-activity-title">{activitiesTitle}</h2>
          {hasAdditionalActivities ? (
            <button
              aria-controls="dashboard-recent-activity-list"
              aria-expanded={showAllActivities}
              className={styles.textButton}
              onClick={() => setShowAllActivities((isVisible) => !isVisible)}
              type="button"
            >
              {showAllActivities ? "Ringkas" : activitiesActionLabel}
            </button>
          ) : null}
        </div>

        {activities.length === 0 ? (
          <p className={styles.emptyState}>
            Belum ada aktivitas untuk ditampilkan.
          </p>
        ) : (
          <ul
            className={styles.activityList}
            id="dashboard-recent-activity-list"
          >
            {visibleActivities.map((activity) => (
              <li className={styles.activityItem} key={activity.id}>
                <span
                  aria-hidden="true"
                  className={styles.activityIcon}
                  data-tone={activity.tone}
                >
                  <NexusDashboardInsightsIcon name={activity.icon} />
                </span>
                <div className={styles.activityCopy}>
                  <p className={styles.activityHeadline}>
                    <strong title={activity.subjectFull}>
                      {activity.subject}
                    </strong>{" "}
                    {activity.action}
                  </p>
                  <p
                    className={styles.activityDetail}
                    title={activity.detailFull}
                  >
                    {activity.detail}
                  </p>
                </div>
                <time dateTime={activity.occurredAt}>{activity.timeLabel}</time>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section
        aria-labelledby="dashboard-featured-program-title"
        className={`${styles.panel} ${styles.programPanel}`}
      >
        <div className={styles.panelHeader}>
          <h2 id="dashboard-featured-program-title">Program Unggulan</h2>
          {hasMultiplePrograms ? (
            <div className={styles.carouselControls}>
              <button
                aria-label="Program sebelumnya"
                onClick={showPreviousProgram}
                type="button"
              >
                <NexusDashboardInsightsIcon name="arrow-left" />
              </button>
              <span aria-live="polite">
                {activeProgramIndex + 1} / {programs.length}
              </span>
              <button
                aria-label="Program berikutnya"
                onClick={showNextProgram}
                type="button"
              >
                <NexusDashboardInsightsIcon name="arrow-right" />
              </button>
            </div>
          ) : null}
        </div>

        <article aria-live="polite" className={styles.programContent}>
          <div className={styles.programBanner} key={activeProgram.id}>
            <button
              aria-label={`Lihat poster penuh: ${activeProgram.title}`}
              className={styles.programImageButton}
              onClick={openPoster}
              type="button"
            >
              <Image
                alt=""
                fill
                placeholder="blur"
                sizes="(max-width: 72rem) 100vw, 58vw"
                src={activeProgram.image}
                style={{
                  objectPosition: `${activeProgram.focalPoint.x}% ${activeProgram.focalPoint.y}%`,
                }}
              />
            </button>

            <div className={styles.programCopy}>
              <span className={styles.programBadge}>{activeProgram.badge}</span>
              <h3>{activeProgram.title}</h3>
              <p>{activeProgram.description}</p>
              <a
                className={styles.programLink}
                href={activeProgram.href}
                rel="noreferrer"
                target="_blank"
              >
                {activeProgram.linkLabel}
                <NexusDashboardInsightsIcon name="external" />
                <span className={styles.visuallyHidden}>
                  (dibuka di tab baru)
                </span>
              </a>
            </div>

            <span aria-hidden="true" className={styles.expandHint}>
              <NexusDashboardInsightsIcon name="expand" />
            </span>
          </div>

          <dl className={styles.programDetails}>
            {activeProgram.details.map((detail) => (
              <div key={detail.id}>
                <span aria-hidden="true" className={styles.detailIcon}>
                  <NexusDashboardInsightsIcon name={detail.icon} />
                </span>
                <div>
                  <dt>{detail.label}</dt>
                  <dd>{detail.value}</dd>
                </div>
              </div>
            ))}
          </dl>
        </article>

        <dialog
          aria-labelledby="featured-program-poster-title"
          className={styles.posterDialog}
          onClick={(event) => {
            if (event.target === event.currentTarget) {
              closePoster();
            }
          }}
          onKeyDown={(event) => {
            if (event.key === "Escape") {
              closePoster();
            }
          }}
          ref={posterDialogRef}
        >
          <div className={styles.dialogHeader}>
            <div>
              <span>Poster program</span>
              <h3 id="featured-program-poster-title">{activeProgram.title}</h3>
            </div>
            <button
              aria-label="Tutup poster"
              onClick={closePoster}
              type="button"
            >
              <NexusDashboardInsightsIcon name="close" />
            </button>
          </div>
          <div className={styles.posterViewport}>
            <Image
              alt={activeProgram.imageAlt}
              placeholder="blur"
              sizes="(max-width: 48rem) 92vw, 44rem"
              src={activeProgram.image}
            />
          </div>
        </dialog>
      </section>
    </section>
  );
}
