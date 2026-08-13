"use client";

import { useState } from "react";
import styles from "@/components/nexus-workspace-ui/nexus-workspace-page.module.css";

export type SortDirection = "ascending" | "descending";

type SortState<Key extends string> = {
  direction: SortDirection;
  key: Key;
};

/**
 * Client-side column sorting for the workspace tables. Rows are already in the
 * browser, so sorting stays local until a server adapter takes over ordering.
 */
export function useTableSort<Key extends string>(initialKey: Key) {
  const [sort, setSort] = useState<SortState<Key>>({
    direction: "ascending",
    key: initialKey,
  });

  function toggle(key: Key) {
    setSort((current) =>
      current.key === key
        ? {
            direction:
              current.direction === "ascending" ? "descending" : "ascending",
            key,
          }
        : { direction: "ascending", key },
    );
  }

  function sortRows<Row>(rows: Row[], read: (row: Row, key: Key) => string) {
    const factor = sort.direction === "ascending" ? 1 : -1;

    return [...rows].sort(
      (first, second) =>
        factor *
        read(first, sort.key).localeCompare(read(second, sort.key), undefined, {
          numeric: true,
          sensitivity: "base",
        }),
    );
  }

  return { sort, sortRows, toggle };
}

type SortableColumnProps<Key extends string> = {
  activeKey: Key;
  direction: SortDirection;
  label: string;
  onSort: (key: Key) => void;
  sortKey: Key;
};

export function SortableColumn<Key extends string>({
  activeKey,
  direction,
  label,
  onSort,
  sortKey,
}: SortableColumnProps<Key>) {
  const isActive = activeKey === sortKey;

  return (
    <th aria-sort={isActive ? direction : "none"} scope="col">
      <button
        className={styles.sortButton}
        data-active={isActive}
        onClick={() => onSort(sortKey)}
        type="button"
      >
        {label}
        <span aria-hidden="true" className={styles.sortMark}>
          {isActive && direction === "descending" ? "▾" : "▴"}
        </span>
      </button>
    </th>
  );
}
