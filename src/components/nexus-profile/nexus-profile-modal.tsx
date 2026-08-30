"use client";

import { type ReactNode, useEffect, useId, useRef } from "react";
import styles from "@/components/nexus-profile/nexus-profile-modal.module.css";

type NexusProfileModalProps = {
  children: ReactNode;
  closeLabel: string;
  description: string;
  onClose: () => void;
  title: string;
};

function CloseIcon() {
  return (
    <svg aria-hidden="true" fill="none" viewBox="0 0 20 20">
      <path d="m5 5 10 10M15 5 5 15" />
    </svg>
  );
}

/**
 * Kerangka pop-up terpusat untuk penyuntingan profil pribadi.
 *
 * Berbeda dengan drawer rincian ruang kerja, formulir profil milik pengguna
 * sendiri tampil di tengah layar dengan isi yang menggulir di dalam panel dan
 * baris aksi yang tetap terjangkau. Kendali papan ketik mengikuti aturan yang
 * sama dengan drawer: lapisan teratas menerima Escape lebih dahulu dan fokus
 * dikembalikan ke pemicunya setelah ditutup.
 */
export function NexusProfileModal({
  children,
  closeLabel,
  description,
  onClose,
  title,
}: NexusProfileModalProps) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLElement>(null);
  const onCloseRef = useRef(onClose);
  const technicalId = useId();
  const titleId = `${technicalId}-profile-modal-title`;
  const descriptionId = `${technicalId}-profile-modal-description`;

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
      /* Editor foto memakai dialog bawaan peramban dan memegang lapisan atas. */
      if (document.querySelector("dialog[open]")) return;

      const topModal = Array.from(
        document.querySelectorAll<HTMLElement>('[aria-modal="true"]'),
      ).at(-1);
      if (topModal && topModal !== dialogRef.current) return;

      if (event.key === "Escape") {
        event.preventDefault();
        onCloseRef.current();
        return;
      }
      if (event.key !== "Tab" || !dialogRef.current) return;

      const focusableElements = Array.from(
        dialogRef.current.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), summary, [tabindex]:not([tabindex="-1"])',
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
      <section
        aria-describedby={descriptionId}
        aria-labelledby={titleId}
        aria-modal="true"
        className={styles.panel}
        ref={dialogRef}
        role="dialog"
      >
        <header className={styles.header}>
          <h2 id={titleId}>{title}</h2>
          <p id={descriptionId}>{description}</p>
        </header>
        <button
          aria-label={closeLabel}
          className={styles.closeButton}
          onClick={onClose}
          ref={closeButtonRef}
          type="button"
        >
          <CloseIcon />
        </button>
        {children}
      </section>
    </div>
  );
}
