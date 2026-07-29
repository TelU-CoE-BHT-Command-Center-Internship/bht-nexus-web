"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  type FocusEvent,
  type KeyboardEvent,
  type MouseEvent,
  useState,
} from "react";
import styles from "@/components/site-header/site-header.module.css";
import type { NavigationItem } from "@/components/site-header/site-navigation";

type DesktopPrimaryNavigationProps = {
  items: NavigationItem[];
  label: string;
};

function ChevronIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20" fill="none">
      <path d="M5 7.5 10 12.5 15 7.5" />
    </svg>
  );
}

function DirectionIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20" fill="none">
      <path d="m7 5 5 5-5 5" />
    </svg>
  );
}

function createMenuId(href: string) {
  const pathName = href.split("/").filter(Boolean).pop() ?? "menu";
  return `desktop-navigation-${pathName}`;
}

function isPathActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function DesktopPrimaryNavigation({
  items,
  label,
}: DesktopPrimaryNavigationProps) {
  const pathname = usePathname();
  const [openMenuHref, setOpenMenuHref] = useState<string | null>(null);

  function closeAllMenus() {
    setOpenMenuHref(null);
  }

  function handleBlur(event: FocusEvent<HTMLElement>) {
    if (!event.currentTarget.contains(event.relatedTarget)) {
      closeAllMenus();
    }
  }

  function handleKeyDown(event: KeyboardEvent<HTMLElement>) {
    if (event.key === "Escape") {
      closeAllMenus();
    }
  }

  function handleTriggerClick(
    event: MouseEvent<HTMLButtonElement>,
    href: string,
  ) {
    event.preventDefault();
    setOpenMenuHref((currentHref) => (currentHref === href ? null : href));
  }

  return (
    <nav
      className={styles.primaryLinks}
      aria-label={label}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      onMouseLeave={closeAllMenus}
    >
      {items.map((item) => {
        if (!item.children?.length) {
          const isActive = isPathActive(pathname, item.href);

          return (
            <Link
              aria-current={isActive ? "page" : undefined}
              data-active={isActive}
              key={item.href}
              href={item.href}
              prefetch={false}
              onFocus={closeAllMenus}
              onMouseEnter={closeAllMenus}
            >
              {item.label}
            </Link>
          );
        }

        const isOpen = openMenuHref === item.href;
        const isActive = item.children.some((child) =>
          isPathActive(pathname, child.href),
        );
        const menuId = createMenuId(item.href);

        return (
          <fieldset
            className={styles.navigationGroup}
            data-active={isActive}
            data-open={isOpen}
            key={item.href}
            onMouseEnter={() => setOpenMenuHref(item.href)}
          >
            <button
              className={styles.navigationTrigger}
              type="button"
              aria-controls={menuId}
              aria-expanded={isOpen}
              onClick={(event) => handleTriggerClick(event, item.href)}
              onFocus={() => setOpenMenuHref(item.href)}
            >
              {item.label}
              <ChevronIcon />
            </button>

            <div
              className={styles.navigationDropdown}
              id={menuId}
              aria-hidden={!isOpen}
            >
              {item.children.map((child) => (
                <Link
                  key={child.href}
                  href={child.href}
                  aria-current={
                    isPathActive(pathname, child.href) ? "page" : undefined
                  }
                  data-active={isPathActive(pathname, child.href)}
                  prefetch={false}
                  tabIndex={isOpen ? undefined : -1}
                  onClick={closeAllMenus}
                >
                  <span>{child.label}</span>
                  <DirectionIcon />
                </Link>
              ))}
            </div>
          </fieldset>
        );
      })}
    </nav>
  );
}
