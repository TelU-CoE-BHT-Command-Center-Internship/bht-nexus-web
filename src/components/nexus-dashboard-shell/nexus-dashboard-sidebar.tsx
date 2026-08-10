import Image from "next/image";
import Link from "next/link";
import coeBhtMark from "@/app/icon.png";
import whatsappIcon from "@/assets/whatsapp-svgrepo-com.svg";
import styles from "@/components/nexus-dashboard-shell/nexus-dashboard-shell.module.css";
import type { NexusDashboardShellContent } from "@/components/nexus-dashboard-shell/nexus-dashboard-shell-content";
import { DashboardShellIcon } from "@/components/nexus-dashboard-shell/nexus-dashboard-shell-icons";

type NexusDashboardSidebarProps = {
  content: NexusDashboardShellContent;
  isCollapsed: boolean;
  isTransitioning: boolean;
  onCloseMobileMenu: () => void;
  onToggle: () => void;
  pathname: string;
};

export function NexusDashboardSidebar({
  content,
  isCollapsed,
  isTransitioning,
  onCloseMobileMenu,
  onToggle,
  pathname,
}: NexusDashboardSidebarProps) {
  return (
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
            isCollapsed ? content.expandMenuLabel : content.collapseMenuLabel
          }
          className={styles.collapseButton}
          disabled={isTransitioning}
          onClick={onToggle}
          type="button"
        >
          <DashboardShellIcon
            name={isCollapsed ? "chevron-right" : "chevron-left"}
          />
        </button>
        <button
          aria-label={content.closeMenuLabel}
          className={styles.mobileCloseButton}
          onClick={onCloseMobileMenu}
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
                    onClick={onCloseMobileMenu}
                    prefetch={false}
                    title={isCollapsed ? item.label : undefined}
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
                      isCollapsed
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
          title={isCollapsed ? content.supportTitle : undefined}
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
  );
}
