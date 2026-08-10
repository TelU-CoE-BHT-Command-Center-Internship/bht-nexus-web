"use client";

import Image from "next/image";
import { useSyncExternalStore } from "react";
import announcementIcon from "@/assets/workspace/announcement-svgrepo-com.svg";
import styles from "@/components/nexus-dashboard-announcement/nexus-dashboard-announcement.module.css";
import {
  dismissAnnouncementForSession,
  getDismissedAnnouncementSnapshot,
  getServerDismissedAnnouncementSnapshot,
  readDismissedAnnouncementIds,
  subscribeToDismissedAnnouncements,
} from "@/components/nexus-dashboard-announcement/nexus-dashboard-announcement-session";
import type { DashboardAnnouncement } from "@/components/nexus-dashboard-overview/nexus-dashboard-overview-types";

type NexusDashboardAnnouncementProps = {
  announcements: DashboardAnnouncement[];
};

function CloseIcon() {
  return (
    <svg aria-hidden="true" fill="none" viewBox="0 0 24 24">
      <path d="m6 6 12 12M18 6 6 18" />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg aria-hidden="true" fill="none" viewBox="0 0 24 24">
      <path d="M5 12h14M14 7l5 5-5 5" />
    </svg>
  );
}

export function NexusDashboardAnnouncement({
  announcements,
}: NexusDashboardAnnouncementProps) {
  const dismissedSnapshot = useSyncExternalStore(
    subscribeToDismissedAnnouncements,
    getDismissedAnnouncementSnapshot,
    getServerDismissedAnnouncementSnapshot,
  );
  const dismissedIds = readDismissedAnnouncementIds(dismissedSnapshot);
  const activeAnnouncement = announcements.find(
    (announcement) => !dismissedIds.includes(announcement.id),
  );

  if (!activeAnnouncement) {
    return null;
  }

  const activePosition =
    announcements.findIndex(
      (announcement) => announcement.id === activeAnnouncement.id,
    ) + 1;
  const positionLabel = `${activePosition} dari ${announcements.length}`;
  const isExternalLink = activeAnnouncement.href.startsWith("http");

  return (
    <section
      aria-labelledby="dashboard-announcement-title"
      aria-live="polite"
      className={styles.announcement}
    >
      <span aria-hidden="true" className={styles.iconBadge}>
        <Image
          alt=""
          className={styles.icon}
          height={44}
          sizes="2.75rem"
          src={announcementIcon}
          width={44}
        />
      </span>

      <div className={styles.copy}>
        <div className={styles.titleRow}>
          <h2 id="dashboard-announcement-title">{activeAnnouncement.title}</h2>
          <span className={styles.positionLabel}>
            <span className={styles.visuallyHidden}>Pengumuman </span>
            {positionLabel}
          </span>
        </div>
        <p className={styles.summary}>{activeAnnouncement.summary}</p>
        <p className={styles.deadline}>
          <span aria-hidden="true" />
          <time dateTime={activeAnnouncement.deadlineAt}>
            {activeAnnouncement.deadlineLabel}
          </time>
        </p>
      </div>

      <a
        className={styles.action}
        href={activeAnnouncement.href}
        rel={isExternalLink ? "noreferrer" : undefined}
        target={isExternalLink ? "_blank" : undefined}
      >
        {activeAnnouncement.actionLabel}
        {isExternalLink ? (
          <span className={styles.visuallyHidden}> (dibuka di tab baru)</span>
        ) : null}
        <ArrowIcon />
      </a>

      <button
        aria-label={`Tutup pengumuman ${positionLabel}: ${activeAnnouncement.title}`}
        className={styles.closeButton}
        onClick={() => dismissAnnouncementForSession(activeAnnouncement.id)}
        type="button"
      >
        <CloseIcon />
      </button>
    </section>
  );
}
