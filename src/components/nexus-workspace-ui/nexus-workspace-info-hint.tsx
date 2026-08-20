"use client";

import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import styles from "@/components/nexus-workspace-ui/nexus-workspace-info-hint.module.css";

type NexusWorkspaceInfoHintProps = {
  label: string;
  text: string;
};

const PANEL_WIDTH = 264;
const VIEWPORT_MARGIN = 12;

function InfoIcon() {
  return (
    <svg aria-hidden="true" fill="none" viewBox="0 0 16 16">
      <circle cx="8" cy="8" r="6.25" />
      <path d="M8 7.1v4M8 4.75h.01" />
    </svg>
  );
}

export function NexusWorkspaceInfoHint({
  label,
  text,
}: NexusWorkspaceInfoHintProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState({ left: 0, top: 0 });
  const wrapperRef = useRef<HTMLSpanElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelId = useId();

  const close = useCallback(() => setIsOpen(false), []);

  useLayoutEffect(() => {
    if (!isOpen || !triggerRef.current) return;

    const trigger = triggerRef.current.getBoundingClientRect();
    const maxLeft = window.innerWidth - PANEL_WIDTH - VIEWPORT_MARGIN;
    const left = Math.min(
      Math.max(
        VIEWPORT_MARGIN,
        trigger.left + trigger.width / 2 - PANEL_WIDTH / 2,
      ),
      Math.max(VIEWPORT_MARGIN, maxLeft),
    );

    setPosition({ left, top: trigger.bottom + 8 });
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      close();
      triggerRef.current?.focus();
    };
    const handlePointerDown = (event: PointerEvent) => {
      if (wrapperRef.current?.contains(event.target as Node)) return;
      close();
    };

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("pointerdown", handlePointerDown);
    window.addEventListener("resize", close);
    window.addEventListener("scroll", close, true);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("resize", close);
      window.removeEventListener("scroll", close, true);
    };
  }, [close, isOpen]);

  return (
    <span className={styles.wrapper} ref={wrapperRef}>
      <button
        aria-controls={panelId}
        aria-expanded={isOpen}
        aria-label={label}
        className={styles.trigger}
        onClick={() => setIsOpen((current) => !current)}
        ref={triggerRef}
        type="button"
      >
        <InfoIcon />
      </button>
      {isOpen ? (
        <span
          className={styles.panel}
          id={panelId}
          style={{ left: position.left, top: position.top }}
        >
          <strong>{label}</strong>
          {text}
        </span>
      ) : null}
    </span>
  );
}
