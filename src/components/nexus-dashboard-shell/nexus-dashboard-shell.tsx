"use client";

import { usePathname } from "next/navigation";
import {
  type ReactNode,
  type TransitionEvent,
  useLayoutEffect,
  useState,
} from "react";
import { NexusDashboardHeader } from "@/components/nexus-dashboard-shell/nexus-dashboard-header";
import styles from "@/components/nexus-dashboard-shell/nexus-dashboard-shell.module.css";
import type { NexusDashboardShellContent } from "@/components/nexus-dashboard-shell/nexus-dashboard-shell-content";
import { NexusDashboardSidebar } from "@/components/nexus-dashboard-shell/nexus-dashboard-sidebar";
import { NexusWorkspaceNoAccess } from "@/components/nexus-workspace-ui/nexus-workspace-state";

type NexusDashboardShellProps = {
  children: ReactNode;
  content: NexusDashboardShellContent;
};

type DashboardPanel = "notifications" | "profile";

export function NexusDashboardShell({
  children,
  content,
}: NexusDashboardShellProps) {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isSidebarTransitioning, setIsSidebarTransitioning] = useState(false);
  const [openPanel, setOpenPanel] = useState<DashboardPanel | null>(null);
  const activeNavigationItem = content.navigationGroups
    .flatMap((group) => group.items)
    .find((item) => item.activeHrefs.includes(pathname));
  const activeRouteAccess = content.routeAccess.find((item) =>
    item.activeHrefs.includes(pathname),
  );
  const pageTitle =
    activeNavigationItem?.label ??
    activeRouteAccess?.label ??
    content.defaultPageTitle;
  const accessDenied = Boolean(
    activeRouteAccess?.implemented && !activeRouteAccess.allowed,
  );

  useLayoutEffect(() => {
    if (pathname) {
      document.scrollingElement?.scrollTo({ left: 0, top: 0 });
      setIsMobileMenuOpen(false);
      setOpenPanel(null);
    }
  }, [pathname]);

  function closeTransientUi() {
    setIsMobileMenuOpen(false);
    setOpenPanel(null);
  }

  function togglePanel(panel: DashboardPanel) {
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
      data-nexus-workspace-shell=""
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

      <NexusDashboardSidebar
        content={content}
        isCollapsed={isSidebarCollapsed}
        isTransitioning={isSidebarTransitioning}
        onCloseMobileMenu={() => setIsMobileMenuOpen(false)}
        onToggle={toggleSidebar}
        pathname={pathname}
      />

      <NexusDashboardHeader
        content={content}
        isMobileMenuOpen={isMobileMenuOpen}
        onClosePanel={() => setOpenPanel(null)}
        onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
        onTogglePanel={togglePanel}
        openPanel={openPanel}
        pageTitle={pageTitle}
      />

      <main className={styles.main} id="main-content" tabIndex={-1}>
        {accessDenied ? (
          <NexusWorkspaceNoAccess
            description={content.accessDeniedDescription}
            eyebrow={content.accessDeniedEyebrow}
            returnHref={content.homeHref}
            returnLabel={content.accessDeniedReturnLabel}
            title={content.accessDeniedTitle}
          />
        ) : (
          children
        )}
      </main>
    </div>
  );
}
