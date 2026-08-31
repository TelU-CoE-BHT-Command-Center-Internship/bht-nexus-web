"use client";

import { useEffect, useId, useRef } from "react";
import styles from "@/components/nexus-workspace-ui/nexus-workspace-confirm-dialog.module.css";
import { NexusWorkspaceButton } from "@/components/nexus-workspace-ui/nexus-workspace-elements";

type NexusWorkspaceConfirmDialogProps = {
  cancelLabel: string;
  confirmLabel: string;
  description: string;
  onCancel: () => void;
  onConfirm: () => void;
  title: string;
  tone?: "danger" | "warning";
};

export function NexusWorkspaceConfirmDialog({
  cancelLabel,
  confirmLabel,
  description,
  onCancel,
  onConfirm,
  title,
  tone = "danger",
}: NexusWorkspaceConfirmDialogProps) {
  const dialogRef = useRef<HTMLElement>(null);
  const onCancelRef = useRef(onCancel);
  const technicalId = useId();
  const titleId = `${technicalId}-confirm-title`;
  const descriptionId = `${technicalId}-confirm-description`;

  useEffect(() => {
    onCancelRef.current = onCancel;
  }, [onCancel]);

  useEffect(() => {
    const previousFocusedElement =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    dialogRef.current
      ?.querySelector<HTMLButtonElement>("button")
      ?.focus({ preventScroll: true });

    const handleDialogKeyboard = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        event.stopImmediatePropagation();
        onCancelRef.current();
        return;
      }
      if (event.key !== "Tab" || !dialogRef.current) return;

      const focusableElements = Array.from(
        dialogRef.current.querySelectorAll<HTMLElement>(
          'button:not([disabled]), [href], [tabindex]:not([tabindex="-1"])',
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
    <div className={styles.layer} data-tone={tone}>
      <button
        aria-label={cancelLabel}
        className={styles.backdrop}
        onClick={onCancel}
        type="button"
      />
      <section
        aria-describedby={descriptionId}
        aria-labelledby={titleId}
        aria-modal="true"
        className={styles.dialog}
        ref={dialogRef}
        role="alertdialog"
      >
        <div className={styles.copy}>
          <h2 id={titleId}>{title}</h2>
          <p id={descriptionId}>{description}</p>
        </div>
        <footer className={styles.actions}>
          <NexusWorkspaceButton onClick={onCancel} type="button">
            {cancelLabel}
          </NexusWorkspaceButton>
          <NexusWorkspaceButton
            className={styles.confirmAction}
            onClick={onConfirm}
            tone={tone === "danger" ? "danger" : "secondary"}
            type="button"
          >
            {confirmLabel}
          </NexusWorkspaceButton>
        </footer>
      </section>
    </div>
  );
}
