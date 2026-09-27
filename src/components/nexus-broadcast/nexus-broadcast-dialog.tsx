"use client";

import {
  type FormEvent,
  type ReactNode,
  type RefObject,
  useEffect,
  useId,
  useRef,
} from "react";
import styles from "@/components/nexus-broadcast/nexus-broadcast-dialog.module.css";
import {
  NexusBroadcastIcon,
  type NexusBroadcastIconName,
} from "@/components/nexus-broadcast/nexus-broadcast-icons";

type NexusBroadcastDialogProps = {
  children: ReactNode;
  closeLabel: string;
  description: string;
  footer: ReactNode;
  icon?: NexusBroadcastIconName;
  /** Elemen yang menerima fokus saat dialog dibuka; bawaannya kontrol pertama. */
  initialFocusRef?: RefObject<HTMLElement | null>;
  onClose: () => void;
  /** Bila diisi, isi dialog menjadi formulir yang dikirim dengan Enter. */
  onSubmit?: () => void;
  size?: "compact" | "regular";
  title: string;
};

/**
 * Dialog Broadcast memakai `<dialog>` bawaan peramban, sama seperti editor foto
 * profil: peramban memegang lapisan teratas, membuat latar tidak dapat
 * dijangkau, dan meneruskan Escape sebagai pembatalan. Dialog tidak menutup
 * ketika latar diklik supaya isian tidak hilang tanpa sengaja.
 */
export function NexusBroadcastDialog({
  children,
  closeLabel,
  description,
  footer,
  icon,
  initialFocusRef,
  onClose,
  onSubmit,
  size = "regular",
  title,
}: NexusBroadcastDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const technicalId = useId();
  const titleId = `${technicalId}-title`;
  const descriptionId = `${technicalId}-description`;

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const returnTarget =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
    if (!dialog.open) dialog.showModal();
    initialFocusRef?.current?.focus();
    return () => {
      if (dialog.open) dialog.close();
      /*
       * Dialog sudah dilepas dari halaman ketika ditutup, sehingga peramban
       * tidak lagi mengembalikan fokus. Bila fokus jatuh ke halaman, fokus
       * kembali ke elemen yang membuka dialog.
       */
      const active = document.activeElement;
      if (returnTarget?.isConnected && (!active || active === document.body)) {
        returnTarget.focus({ preventScroll: true });
      }
    };
  }, [initialFocusRef]);

  const content = (
    <>
      <header className={styles.header}>
        {icon ? (
          <span aria-hidden="true" className={styles.headerIcon}>
            <NexusBroadcastIcon name={icon} />
          </span>
        ) : null}
        <div className={styles.headerCopy}>
          <h2 id={titleId}>{title}</h2>
          <p id={descriptionId}>{description}</p>
        </div>
        <button
          aria-label={closeLabel}
          className={styles.closeButton}
          onClick={onClose}
          type="button"
        >
          <NexusBroadcastIcon name="close" />
        </button>
      </header>
      <div className={styles.body}>{children}</div>
      <footer className={styles.footer}>{footer}</footer>
    </>
  );

  return (
    <dialog
      aria-describedby={descriptionId}
      aria-labelledby={titleId}
      className={styles.dialog}
      data-size={size}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      ref={dialogRef}
    >
      {onSubmit ? (
        <form
          className={styles.panel}
          noValidate
          onSubmit={(event: FormEvent<HTMLFormElement>) => {
            event.preventDefault();
            onSubmit();
          }}
        >
          {content}
        </form>
      ) : (
        <div className={styles.panel}>{content}</div>
      )}
    </dialog>
  );
}
