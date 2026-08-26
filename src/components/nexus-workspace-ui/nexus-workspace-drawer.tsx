"use client";

import { type ReactNode, useEffect, useId, useRef } from "react";
import styles from "@/components/nexus-workspace-ui/nexus-workspace-drawer.module.css";

export type NexusDrawerStep = {
  active: boolean;
  complete?: boolean;
  label: string;
  number: number;
};

type NexusWorkspaceDrawerProps = {
  children: ReactNode;
  closeLabel: string;
  description: string;
  eyebrow: string;
  onClose: () => void;
  steps?: readonly NexusDrawerStep[];
  title: string;
};

function CloseIcon() {
  return (
    <svg aria-hidden="true" fill="none" viewBox="0 0 20 20">
      <path d="m5 5 10 10M15 5 5 15" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg aria-hidden="true" fill="none" viewBox="0 0 16 16">
      <path d="m3 8.5 3 3L13 4.8" />
    </svg>
  );
}

export function NexusWorkspaceDrawer({
  children,
  closeLabel,
  description,
  eyebrow,
  onClose,
  steps,
  title,
}: NexusWorkspaceDrawerProps) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLElement>(null);
  const onCloseRef = useRef(onClose);
  const technicalId = useId();
  const titleId = `${technicalId}-drawer-title`;
  const descriptionId = `${technicalId}-drawer-description`;

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    const previousFocusedElement =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus({ preventScroll: true });

    const handleDialogKeyboard = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onCloseRef.current();
        return;
      }
      if (event.key !== "Tab" || !dialogRef.current) return;

      const focusableElements = Array.from(
        dialogRef.current.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), summary, [tabindex]:not([tabindex="-1"])',
        ),
      ).filter((element) => !element.hasAttribute("hidden"));
      const firstElement = focusableElements[0];
      const lastElement = focusableElements.at(-1);
      if (!firstElement || !lastElement) return;

      if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      } else if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    };

    document.addEventListener("keydown", handleDialogKeyboard);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleDialogKeyboard);
      previousFocusedElement?.focus({ preventScroll: true });
    };
  }, []);

  return (
    <div className={styles.layer}>
      <button
        aria-label={closeLabel}
        className={styles.backdrop}
        onClick={onClose}
        type="button"
      />
      <aside
        aria-describedby={descriptionId}
        aria-labelledby={titleId}
        aria-modal="true"
        className={styles.drawer}
        ref={dialogRef}
        role="dialog"
      >
        <header className={styles.header}>
          <div>
            <span className={styles.eyebrow}>{eyebrow}</span>
            <h2 id={titleId}>{title}</h2>
            <p id={descriptionId}>{description}</p>
          </div>
          <button
            aria-label={closeLabel}
            className={styles.closeButton}
            onClick={onClose}
            ref={closeButtonRef}
            type="button"
          >
            <CloseIcon />
          </button>
        </header>

        {steps ? (
          <nav className={styles.workflow} aria-label="Tahapan rincian">
            {steps.map((step) => (
              <span
                data-active={step.active || undefined}
                data-complete={step.complete || undefined}
                key={step.number}
              >
                <i>{step.complete ? <CheckIcon /> : step.number}</i>
                {step.label}
              </span>
            ))}
          </nav>
        ) : null}

        <div className={styles.body}>{children}</div>
      </aside>
    </div>
  );
}
