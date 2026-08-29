"use client";

import type { KeyboardEvent } from "react";
import styles from "@/components/nexus-workspace-ui/nexus-workspace-controls.module.css";

export type NexusWorkspaceTab = {
  /** Jumlah hanya ditampilkan ketika angkanya memang bermakna bagi tab itu. */
  count?: number;
  id: string;
  label: string;
};

type NexusWorkspaceSearchProps = {
  label: string;
  name: string;
  onValueChange: (value: string) => void;
  placeholder: string;
  value: string;
};

type NexusWorkspaceTabsProps = {
  activeId: string;
  label: string;
  onActiveChange: (id: string) => void;
  panelId: string;
  tabs: readonly NexusWorkspaceTab[];
};

function SearchIcon() {
  return (
    <svg aria-hidden="true" fill="none" viewBox="0 0 24 24">
      <circle cx="10.75" cy="10.75" r="6.75" />
      <path d="m16 16 4 4" />
    </svg>
  );
}

function getAdjacentTabIndex(
  event: KeyboardEvent<HTMLButtonElement>,
  currentIndex: number,
  tabCount: number,
) {
  if (event.key === "Home") return 0;
  if (event.key === "End") return tabCount - 1;
  if (event.key === "ArrowRight" || event.key === "ArrowDown") {
    return (currentIndex + 1) % tabCount;
  }
  if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
    return (currentIndex - 1 + tabCount) % tabCount;
  }
  return null;
}

export function NexusWorkspaceSearch({
  label,
  name,
  onValueChange,
  placeholder,
  value,
}: NexusWorkspaceSearchProps) {
  return (
    <label className={styles.searchField}>
      <span className={styles.visuallyHidden}>{label}</span>
      <SearchIcon />
      <input
        autoComplete="off"
        name={name}
        onChange={(event) => onValueChange(event.currentTarget.value)}
        placeholder={placeholder}
        type="search"
        value={value}
      />
    </label>
  );
}

export function NexusWorkspaceTabs({
  activeId,
  label,
  onActiveChange,
  panelId,
  tabs,
}: NexusWorkspaceTabsProps) {
  const activeIndex = Math.max(
    tabs.findIndex((tab) => tab.id === activeId),
    0,
  );

  const selectAdjacentTab = (
    event: KeyboardEvent<HTMLButtonElement>,
    currentIndex: number,
  ) => {
    const nextIndex = getAdjacentTabIndex(event, currentIndex, tabs.length);
    if (nextIndex === null) return;

    event.preventDefault();
    const nextTab = tabs[nextIndex];
    if (!nextTab) return;

    onActiveChange(nextTab.id);
    event.currentTarget.parentElement
      ?.querySelectorAll<HTMLButtonElement>('[role="tab"]')
      [nextIndex]?.focus();
  };

  return (
    <div aria-label={label} className={styles.tabs} role="tablist">
      {tabs.map((tab, index) => {
        const isActive = index === activeIndex;
        return (
          <button
            aria-controls={panelId}
            aria-selected={isActive}
            className={styles.tab}
            key={tab.id}
            onClick={() => onActiveChange(tab.id)}
            onKeyDown={(event) => selectAdjacentTab(event, index)}
            role="tab"
            tabIndex={isActive ? 0 : -1}
            type="button"
          >
            <span>{tab.label}</span>
            {tab.count === undefined ? null : (
              <span className={styles.tabCount}>{tab.count}</span>
            )}
          </button>
        );
      })}
    </div>
  );
}
