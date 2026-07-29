"use client";

import { type ReactNode, useEffect, useState } from "react";
import styles from "@/components/site-header/site-header.module.css";

type StickyHeaderProps = {
  children: ReactNode;
};

const COMPACT_HEADER_SCROLL_DISTANCE = 96;
const EXPANDED_HEADER_SCROLL_DISTANCE = 0;

export function StickyHeader({ children }: StickyHeaderProps) {
  const [isCompact, setIsCompact] = useState(false);

  useEffect(() => {
    let animationFrameId: number | null = null;
    let compactState = window.scrollY >= COMPACT_HEADER_SCROLL_DISTANCE;

    function updateHeaderState() {
      animationFrameId = null;
      const nextCompactState = compactState
        ? window.scrollY > EXPANDED_HEADER_SCROLL_DISTANCE
        : window.scrollY >= COMPACT_HEADER_SCROLL_DISTANCE;

      if (nextCompactState !== compactState) {
        compactState = nextCompactState;
        setIsCompact(nextCompactState);
      }
    }

    setIsCompact(compactState);
    function handleScroll() {
      if (animationFrameId === null) {
        animationFrameId = window.requestAnimationFrame(updateHeaderState);
      }
    }

    updateHeaderState();
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);

      if (animationFrameId !== null) {
        window.cancelAnimationFrame(animationFrameId);
      }
    };
  }, []);

  return (
    <header className={styles.header} data-compact={isCompact}>
      {children}
    </header>
  );
}
