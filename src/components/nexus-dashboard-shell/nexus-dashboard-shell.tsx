"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { type ReactNode, type TransitionEvent, useState } from "react";
import coeBhtMark from "@/app/icon.png";
import whatsappIcon from "@/assets/whatsapp-svgrepo-com.svg";
import styles from "@/components/nexus-dashboard-shell/nexus-dashboard-shell.module.css";
import type { NexusDashboardShellContent } from "@/components/nexus-dashboard-shell/nexus-dashboard-shell-content";
import { DashboardShellIcon } from "@/components/nexus-dashboard-shell/nexus-dashboard-shell-icons";

type NexusDashboardShellProps = {
  children: ReactNode;
  content: NexusDashboardShellContent;
};

export function NexusDashboardShell({
  children,
  content,
}: NexusDashboardShellProps) {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isSidebarTransitioning, setIsSidebarTransitioning] = useState(false);
  const [openPanel, setOpenPanel] = useState<
    "notifications" | "profile" | null
  >(null);
  const activeNavigationItem = content.navigationGroups
    .flatMap((group) => group.items)
    .find((item) => item.href === pathname);
  const pageTitle = activeNavigationItem?.label ?? content.defaultPageTitle;

  function closeTransientUi() {
    setIsMobileMenuOpen(false);
    setOpenPanel(null);
  }

  function togglePanel(panel: "notifications" | "profile") {
    setOpenPanel((currentPanel) => (currentPanel === panel ? null : panel));
  }

  function toggleSidebar() {
    if (isSidebarTransitioning) {
      return;
    }

    setIsSidebarTransitioning(
      !window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    );
    setIsSidebarCollapsed((collapsed) => !collapsed);
  }

  function finishSidebarTransition(event: TransitionEvent<HTMLDivElement>) {
    if (
      event.currentTarget === event.target &&
      event.propertyName === "grid-template-columns"
    ) {
      setIsSidebarTransitioning(false);
    }
  }

  return (
    <div
      className={styles.shell}
      data-mobile-menu-open={isMobileMenuOpen}
      data-sidebar-collapsed={isSidebarCollapsed}
      data-sidebar-transitioning={isSidebarTransitioning}
      onTransitionEnd={finishSidebarTransition}
    >
      <button
        aria-label={content.closeMenuLabel}
        className={styles.backdrop}
        onClick={closeTransientUi}
        type="button"
      />

      <aside className={styles.sidebar} id="nexus-workspace-navigation">
        <div className={styles.brandRow}>
          <Link
            aria-label={content.brandLabel}
            className={styles.brandLink}
            href="/nexus/dashboard"
            prefetch={false}
          >
            <Image
              alt=""
              aria-hidden="true"
              className={styles.brandMark}
              preload
              sizes="3.25rem"
              src={coeBhtMark}
            />
            <span className={styles.brandCopy}>
              <strong>{content.brandLabel}</strong>
              <span>{content.brandOrganizationLabel}</span>
              <small>{content.brandInstitutionLabel}</small>
            </span>
          </Link>

          <button
            aria-label={
              isSidebarCollapsed
                ? content.expandMenuLabel
                : content.collapseMenuLabel
            }
            className={styles.collapseButton}
            disabled={isSidebarTransitioning}
            onClick={toggleSidebar}
            type="button"
          >
            <DashboardShellIcon
              name={isSidebarCollapsed ? "chevron-right" : "chevron-left"}
            />
          </button>
          <button
            aria-label={content.closeMenuLabel}
            className={styles.mobileCloseButton}
            onClick={() => setIsMobileMenuOpen(false)}
            type="button"
          >
            <DashboardShellIcon name="close" />
          </button>
        </div>

        <nav aria-label={content.mainNavigationLabel} className={styles.nav}>
          {content.navigationGroups.map((group) => (
            <div className={styles.navGroup} key={group.id}>
              <p className={styles.navGroupLabel}>{group.label}</p>
              <div className={styles.navItems}>
                {group.items.map((item) => {
                  const isActive = item.href === pathname;
                  const itemContent = (
                    <>
                      <span className={styles.navIcon}>
                        <DashboardShellIcon name={item.icon} />
                      </span>
                      <span className={styles.navLabel}>{item.label}</span>
                    </>
                  );

                  return item.available ? (
                    <Link
                      aria-current={isActive ? "page" : undefined}
                      className={styles.navItem}
                      data-active={isActive}
                      href={item.href}
                      key={item.id}
                      onClick={() => setIsMobileMenuOpen(false)}
                      prefetch={false}
                      title={isSidebarCollapsed ? item.label : undefined}
                    >
                      {itemContent}
                    </Link>
                  ) : (
                    <button
                      aria-disabled="true"
                      aria-label={`${item.label}. ${content.plannedFeatureLabel}.`}
                      className={styles.navItem}
                      data-active={isActive}
                      data-planned="true"
                      key={item.id}
                      title={
                        isSidebarCollapsed
                          ? `${item.label} — ${content.plannedFeatureLabel}`
                          : content.plannedFeatureLabel
                      }
                      type="button"
                    >
                      {itemContent}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        <div className={styles.sidebarFooter}>
          <a
            aria-label={`${content.supportTitle} ${content.supportDescription}`}
            className={styles.supportCard}
            href={content.supportHref}
            rel="noreferrer"
            target="_blank"
            title={isSidebarCollapsed ? content.supportTitle : undefined}
          >
            <span className={styles.supportIcon}>
              <Image
                alt=""
                aria-hidden="true"
                className={styles.supportWhatsAppLogo}
                sizes="2rem"
                src={whatsappIcon}
              />
            </span>
            <span className={styles.supportCopy}>
              <strong>{content.supportTitle}</strong>
              <span>{content.supportDescription}</span>
            </span>
          </a>
        </div>
      </aside>

      <header className={styles.header}>
        <h1 className={styles.visuallyHidden}>{pageTitle}</h1>

        <button
          aria-controls="nexus-workspace-navigation"
          aria-expanded={isMobileMenuOpen}
          aria-label={content.openMenuLabel}
          className={styles.mobileMenuButton}
          onClick={() => setIsMobileMenuOpen(true)}
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
              aria-expanded={openPanel === "notifications"}
              aria-label={content.notificationLabel}
              className={styles.iconButton}
              onClick={() => togglePanel("notifications")}
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
              >
                <h2>{content.notificationsTitle}</h2>
                {content.notifications.map((notification) => (
                  <div
                    className={styles.notificationItem}
                    key={notification.id}
                  >
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
              aria-expanded={openPanel === "profile"}
              aria-label={content.profileLabel}
              className={styles.profileButton}
              onClick={() => togglePanel("profile")}
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
              <div className={styles.profilePanel}>
                <div>
                  <strong>{content.viewer.name}</strong>
                  <span className={styles.profilePanelRole}>
                    {content.viewer.roleLabel}
                  </span>
                </div>
                <Link href="/nexus/masuk" prefetch={false}>
                  {content.signOutLabel}
                </Link>
              </div>
            ) : null}
          </div>
        </div>
      </header>

      <main className={styles.main} id="main-content" tabIndex={-1}>
        {children}
      </main>
    </div>
  );
}
