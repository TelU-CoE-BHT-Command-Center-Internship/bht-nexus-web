"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { LanguageSwitcher } from "@/components/site-header/language-switcher";
import styles from "@/components/site-header/site-header.module.css";
import type {
  Locale,
  SiteNavigation,
} from "@/components/site-header/site-navigation";

type MobileNavigationProps = {
  content: SiteNavigation;
  locale: Locale;
};

function ChevronIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 12 8" fill="none">
      <path d="m1 1 5 5 5-5" />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none">
      <path d="M5 12h13M14 7l5 5-5 5" />
    </svg>
  );
}

function isPathActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function MobileNavigation({ content, locale }: MobileNavigationProps) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [openGroupHref, setOpenGroupHref] = useState<string | null>(null);
  const menuButtonReference = useRef<HTMLButtonElement>(null);

  function closeMenu() {
    setIsOpen(false);
    setOpenGroupHref(null);
  }

  useEffect(() => {
    const desktopMediaQuery = window.matchMedia("(min-width: 70.0625rem)");

    function handleBreakpointChange(event: MediaQueryListEvent) {
      if (event.matches) {
        setIsOpen(false);
        setOpenGroupHref(null);
      }
    }

    desktopMediaQuery.addEventListener("change", handleBreakpointChange);

    return () => {
      desktopMediaQuery.removeEventListener("change", handleBreakpointChange);
    };
  }, []);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const previousBodyOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function handleDocumentKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
        setOpenGroupHref(null);
        menuButtonReference.current?.focus();
      }
    }

    document.addEventListener("keydown", handleDocumentKeyDown);

    return () => {
      document.body.style.overflow = previousBodyOverflow;
      document.removeEventListener("keydown", handleDocumentKeyDown);
    };
  }, [isOpen]);

  return (
    <div className={styles.mobileNavigation}>
      <button
        className={styles.menuButton}
        type="button"
        aria-controls="mobile-navigation-panel"
        aria-expanded={isOpen}
        aria-label={isOpen ? content.closeMenuLabel : content.menuLabel}
        ref={menuButtonReference}
        onClick={() => {
          setIsOpen((currentValue) => !currentValue);
          setOpenGroupHref(null);
        }}
      >
        <span />
        <span />
        <span />
      </button>

      <section
        className={styles.mobilePanel}
        id="mobile-navigation-panel"
        hidden={!isOpen}
        aria-label={content.mainNavigationLabel}
      >
        <div className={styles.mobilePanelInner}>
          <header className={styles.mobilePanelHeader}>
            <p>{content.mobileMenuEyebrow}</p>
            <h2>{content.mobileMenuTitle}</h2>
          </header>

          <div className={styles.mobileNavigationSection}>
            <p className={styles.mobileSectionLabel}>
              {content.mainNavigationLabel}
            </p>

            <nav
              className={styles.mobilePrimaryLinks}
              aria-label={content.mainNavigationLabel}
            >
              {content.primaryLinks.map((item) =>
                item.children?.length ? (
                  <div
                    className={styles.mobileNavigationGroup}
                    data-active={item.children.some((child) =>
                      isPathActive(pathname, child.href),
                    )}
                    data-open={openGroupHref === item.href}
                    key={item.href}
                  >
                    <button
                      type="button"
                      aria-expanded={openGroupHref === item.href}
                      onClick={() =>
                        setOpenGroupHref((currentHref) =>
                          currentHref === item.href ? null : item.href,
                        )
                      }
                    >
                      {item.label}
                      <ChevronIcon />
                    </button>
                    <div
                      className={styles.mobileNavigationChildren}
                      aria-hidden={openGroupHref !== item.href}
                      inert={openGroupHref !== item.href}
                    >
                      <div>
                        {item.children.map((child) => {
                          const isActive = isPathActive(pathname, child.href);

                          return (
                            <Link
                              aria-current={isActive ? "page" : undefined}
                              data-active={isActive}
                              key={child.href}
                              href={child.href}
                              prefetch={false}
                              tabIndex={
                                openGroupHref === item.href ? undefined : -1
                              }
                              onClick={closeMenu}
                            >
                              {child.label}
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                ) : (
                  <Link
                    aria-current={
                      isPathActive(pathname, item.href) ? "page" : undefined
                    }
                    data-active={isPathActive(pathname, item.href)}
                    key={item.href}
                    href={item.href}
                    prefetch={false}
                    onClick={closeMenu}
                  >
                    {item.label}
                  </Link>
                ),
              )}
            </nav>
          </div>

          <div className={styles.mobileActionSection}>
            <p className={styles.mobileSectionLabel}>{content.platformLabel}</p>
            <Link
              className={styles.mobilePrimaryAction}
              href={content.action.href}
              prefetch={false}
              onClick={closeMenu}
            >
              <span>{content.action.label}</span>
              <ArrowIcon />
            </Link>
          </div>

          <div className={styles.mobileSecondarySections}>
            <div>
              <p className={styles.mobileSectionLabel}>
                {content.utilityNavigationLabel}
              </p>
              <nav
                className={styles.mobileUtilityLinks}
                aria-label={content.utilityNavigationLabel}
              >
                {content.utilityLinks.map((item) =>
                  item.external ? (
                    <a
                      key={item.href}
                      href={item.href}
                      target="_blank"
                      rel="noreferrer"
                      onClick={closeMenu}
                    >
                      {item.label}
                    </a>
                  ) : (
                    <Link
                      key={item.href}
                      href={item.href}
                      prefetch={false}
                      onClick={closeMenu}
                    >
                      {item.label}
                    </Link>
                  ),
                )}
              </nav>
            </div>

            <div>
              <p className={styles.mobileSectionLabel}>
                {content.languageLabel}
              </p>
              <LanguageSwitcher
                className={styles.mobileLanguageSwitcher}
                label={content.languageLabel}
                locale={locale}
                onNavigate={closeMenu}
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
