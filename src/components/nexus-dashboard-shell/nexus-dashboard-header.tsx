import Image from "next/image";
import Link from "next/link";
import { resetDismissedAnnouncementsForSession } from "@/components/nexus-dashboard-announcement/nexus-dashboard-announcement-session";
import styles from "@/components/nexus-dashboard-shell/nexus-dashboard-shell.module.css";
import type { NexusDashboardShellContent } from "@/components/nexus-dashboard-shell/nexus-dashboard-shell-content";
import { DashboardShellIcon } from "@/components/nexus-dashboard-shell/nexus-dashboard-shell-icons";

export type DashboardHeaderPanel = "notifications" | "profile";

type NexusDashboardHeaderProps = {
  content: NexusDashboardShellContent;
  isMobileMenuOpen: boolean;
  onOpenMobileMenu: () => void;
  onTogglePanel: (panel: DashboardHeaderPanel) => void;
  openPanel: DashboardHeaderPanel | null;
  pageTitle: string;
};

export function NexusDashboardHeader({
  content,
  isMobileMenuOpen,
  onOpenMobileMenu,
  onTogglePanel,
  openPanel,
  pageTitle,
}: NexusDashboardHeaderProps) {
  return (
    <header className={styles.header}>
      <h1 className={styles.visuallyHidden}>{pageTitle}</h1>

      <button
        aria-controls="nexus-workspace-navigation"
        aria-expanded={isMobileMenuOpen}
        aria-label={content.openMenuLabel}
        className={styles.mobileMenuButton}
        onClick={onOpenMobileMenu}
        type="button"
      >
        <DashboardShellIcon name="menu" />
      </button>
      <span className={styles.mobileBrandLabel}>{content.brandLabel}</span>

      <label className={styles.searchField}>
        <span className={styles.visuallyHidden}>{content.searchLabel}</span>
        <DashboardShellIcon name="search" />
        <input placeholder={content.searchPlaceholder} type="search" />
      </label>

      <div className={styles.headerActions}>
        <div className={styles.actionMenu}>
          <button
            aria-controls="nexus-notifications-panel"
            aria-expanded={openPanel === "notifications"}
            aria-label={content.notificationLabel}
            className={styles.iconButton}
            onClick={() => onTogglePanel("notifications")}
            type="button"
          >
            <DashboardShellIcon name="bell" />
            {content.notifications.length > 0 ? (
              <span className={styles.notificationCount}>
                {content.notifications.length}
              </span>
            ) : null}
          </button>

          {openPanel === "notifications" ? (
            <section
              aria-label={content.notificationsTitle}
              className={styles.notificationPanel}
              id="nexus-notifications-panel"
            >
              <h2>{content.notificationsTitle}</h2>
              {content.notifications.map((notification) => (
                <div className={styles.notificationItem} key={notification.id}>
                  <span className={styles.notificationMarker} />
                  <div>
                    <strong>{notification.title}</strong>
                    <p>{notification.detail}</p>
                    <time>{notification.timeLabel}</time>
                  </div>
                </div>
              ))}
            </section>
          ) : null}
        </div>

        <a
          aria-label={content.helpLabel}
          className={styles.iconButton}
          href={content.helpHref}
          title={content.helpLabel}
        >
          <DashboardShellIcon name="help" />
        </a>

        <span aria-hidden="true" className={styles.actionDivider} />

        <div className={styles.actionMenu}>
          <button
            aria-controls="nexus-profile-panel"
            aria-expanded={openPanel === "profile"}
            aria-label={content.profileLabel}
            className={styles.profileButton}
            onClick={() => onTogglePanel("profile")}
            type="button"
          >
            <span className={styles.avatar}>
              {content.viewer.avatarSrc ? (
                <Image
                  alt=""
                  aria-hidden="true"
                  className={styles.avatarImage}
                  fill
                  sizes="3rem"
                  src={content.viewer.avatarSrc}
                />
              ) : (
                content.viewer.initials
              )}
            </span>
            <span className={styles.profileCopy}>
              <strong>{content.viewer.name}</strong>
              <span className={styles.profileRole}>
                {content.viewer.roleLabel}
              </span>
            </span>
            <span className={styles.profileChevron}>
              <DashboardShellIcon name="chevron-down" />
            </span>
          </button>

          {openPanel === "profile" ? (
            <div className={styles.profilePanel} id="nexus-profile-panel">
              <div>
                <strong>{content.viewer.name}</strong>
                <span className={styles.profilePanelRole}>
                  {content.viewer.roleLabel}
                </span>
              </div>
              <Link
                href="/nexus/masuk"
                onClick={resetDismissedAnnouncementsForSession}
                prefetch={false}
              >
                {content.signOutLabel}
              </Link>
            </div>
          ) : null}
        </div>
      </div>
    </header>
  );
}
