"use client";

import Image, { type StaticImageData } from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { type FormEvent, useMemo, useState } from "react";
import indonesiaFlag from "@/assets/Flag_of_Indonesia.svg";
import unitedKingdomFlag from "@/assets/Flag_of_the_United_Kingdom_(3-5).svg";
import { resetDismissedAnnouncementsForSession } from "@/components/nexus-dashboard-announcement/nexus-dashboard-announcement-session";
import styles from "@/components/nexus-dashboard-shell/nexus-dashboard-shell.module.css";
import {
  type NexusDashboardShellContent,
  nexusDashboardViewerFromProfile,
} from "@/components/nexus-dashboard-shell/nexus-dashboard-shell-content";
import { DashboardShellIcon } from "@/components/nexus-dashboard-shell/nexus-dashboard-shell-icons";
import { useNexusCurrentProfile } from "@/components/nexus-profile/nexus-current-profile";
import { useNexusWorkspaceNavigation } from "@/components/nexus-workspace-ui/nexus-workspace-unsaved-changes";
import type { Locale } from "@/i18n/locales";

export type DashboardHeaderPanel = "notifications" | "profile";

type NexusDashboardHeaderProps = {
  content: NexusDashboardShellContent;
  isMobileMenuOpen: boolean;
  onOpenMobileMenu: () => void;
  onTogglePanel: (panel: DashboardHeaderPanel) => void;
  openPanel: DashboardHeaderPanel | null;
  pageTitle: string;
};

type WorkspaceLanguageOption = {
  flag: StaticImageData;
  label: string;
  locale: Locale;
};

const workspaceLanguageOptions: WorkspaceLanguageOption[] = [
  { flag: indonesiaFlag, label: "Bahasa Indonesia", locale: "id" },
  { flag: unitedKingdomFlag, label: "English", locale: "en" },
];

function getWorkspaceLanguageHref(
  currentLocale: Locale,
  pathname: string,
  targetLocale: Locale,
) {
  if (targetLocale === currentLocale) return pathname;
  return targetLocale === "en" ? "/en/nexus/coming-soon" : "/nexus/dashboard";
}

export function NexusDashboardHeader({
  content,
  isMobileMenuOpen,
  onOpenMobileMenu,
  onTogglePanel,
  openPanel,
  pageTitle,
}: NexusDashboardHeaderProps) {
  const navigate = useNexusWorkspaceNavigation();
  const pathname = usePathname();
  /* Identitas mengikuti profil akun yang sedang diwakili, sehingga perubahan
     nama atau foto pada Profil Saya langsung terlihat di header. */
  const { profile } = useNexusCurrentProfile();
  const viewer = profile
    ? nexusDashboardViewerFromProfile(profile)
    : content.viewer;
  const profileHref = content.profileHref;
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const matches = useMemo(() => {
    const query = searchQuery.trim().toLocaleLowerCase();
    if (!query) return [];
    return content.searchItems.filter((item) =>
      `${item.label} ${item.description}`.toLocaleLowerCase().includes(query),
    );
  }, [content.searchItems, searchQuery]);

  function submitSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const firstMatch = matches[0];
    if (!firstMatch) return;
    navigate(firstMatch.href, () => {
      setIsSearchOpen(false);
      setSearchQuery("");
    });
  }

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

      <form
        className={styles.searchWrap}
        onBlur={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget)) {
            setIsSearchOpen(false);
          }
        }}
        onSubmit={submitSearch}
      >
        <label className={styles.searchField}>
          <span className={styles.visuallyHidden}>{content.searchLabel}</span>
          <DashboardShellIcon name="search" />
          <input
            aria-controls="nexus-global-search-results"
            aria-expanded={isSearchOpen && searchQuery.length > 0}
            aria-autocomplete="list"
            autoComplete="off"
            onChange={(event) => {
              setSearchQuery(event.target.value);
              setIsSearchOpen(true);
            }}
            onFocus={() => setIsSearchOpen(true)}
            onKeyDown={(event) => {
              if (event.key === "Escape") {
                setIsSearchOpen(false);
                event.currentTarget.blur();
              }
            }}
            placeholder={content.searchPlaceholder}
            role="combobox"
            type="search"
            value={searchQuery}
          />
        </label>
        {isSearchOpen && searchQuery.length > 0 ? (
          <div
            aria-label={content.searchLabel}
            className={styles.searchResults}
            id="nexus-global-search-results"
            role="listbox"
          >
            {matches.length > 0 ? (
              matches.map((item) => (
                <Link
                  href={item.href}
                  key={item.id}
                  onNavigate={(event) => {
                    event.preventDefault();
                    navigate(item.href, () => {
                      setIsSearchOpen(false);
                      setSearchQuery("");
                    });
                  }}
                  prefetch={false}
                  role="option"
                >
                  <strong>{item.label}</strong>
                  <span>{item.description}</span>
                </Link>
              ))
            ) : (
              <p>{content.searchEmptyLabel}</p>
            )}
          </div>
        ) : null}
      </form>

      <div className={styles.headerActions}>
        <nav
          aria-label={content.languageLabel}
          className={styles.workspaceLanguageSwitcher}
        >
          {workspaceLanguageOptions.map((option) => {
            const isActive = content.locale === option.locale;

            const href = getWorkspaceLanguageHref(
              content.locale,
              pathname,
              option.locale,
            );

            return (
              <Link
                aria-current={isActive ? "page" : undefined}
                aria-label={option.label}
                data-active={isActive || undefined}
                href={href}
                key={option.locale}
                onNavigate={(event) => {
                  if (href === pathname) return;
                  event.preventDefault();
                  navigate(href);
                }}
                prefetch={false}
                title={option.label}
              >
                <span className={styles.workspaceLanguageFlag}>
                  <Image alt="" sizes="1.5rem" src={option.flag} unoptimized />
                </span>
                <span className={styles.visuallyHidden}>{option.label}</span>
              </Link>
            );
          })}
        </nav>

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
              {content.notifications.length > 0 ? (
                content.notifications.map((notification) => (
                  <Link
                    className={styles.notificationItem}
                    href={notification.href}
                    key={notification.id}
                    onNavigate={(event) => {
                      event.preventDefault();
                      navigate(notification.href, () =>
                        onTogglePanel("notifications"),
                      );
                    }}
                    prefetch={false}
                  >
                    <span className={styles.notificationMarker} />
                    <div>
                      <strong>{notification.title}</strong>
                      <p>{notification.detail}</p>
                      <time>{notification.timeLabel}</time>
                    </div>
                  </Link>
                ))
              ) : (
                <p>{content.notificationsEmptyLabel}</p>
              )}
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
              {viewer.avatarSrc ? (
                <Image
                  alt=""
                  aria-hidden="true"
                  className={styles.avatarImage}
                  fill
                  sizes="2.75rem"
                  src={viewer.avatarSrc}
                  style={
                    viewer.avatarPosition
                      ? {
                          objectPosition: `${viewer.avatarPosition.x}% ${viewer.avatarPosition.y}%`,
                        }
                      : undefined
                  }
                  unoptimized={
                    typeof viewer.avatarSrc === "string" &&
                    viewer.avatarSrc.startsWith("data:")
                  }
                />
              ) : (
                viewer.initials
              )}
            </span>
            <span className={styles.profileCopy}>{viewer.name}</span>
            <span className={styles.profileChevron}>
              <DashboardShellIcon name="chevron-down" />
            </span>
          </button>

          {openPanel === "profile" ? (
            <div className={styles.profilePanel} id="nexus-profile-panel">
              <div className={styles.profilePanelIdentity}>
                <strong>{viewer.fullName}</strong>
                <span>{viewer.email}</span>
              </div>
              {profileHref ? (
                <ul className={styles.profilePanelMenu}>
                  <li>
                    <Link
                      href={profileHref}
                      onNavigate={(event) => {
                        event.preventDefault();
                        navigate(profileHref, () => onTogglePanel("profile"));
                      }}
                      prefetch={false}
                    >
                      <DashboardShellIcon name="user" />
                      {content.profileMenuLabel}
                    </Link>
                  </li>
                </ul>
              ) : null}
              <Link
                className={styles.profilePanelSignOut}
                href={content.signOutHref}
                onNavigate={(event) => {
                  event.preventDefault();
                  navigate(
                    content.signOutHref,
                    resetDismissedAnnouncementsForSession,
                  );
                }}
                prefetch={false}
              >
                <DashboardShellIcon name="sign-out" />
                {content.signOutLabel}
              </Link>
            </div>
          ) : null}
        </div>
      </div>
    </header>
  );
}
