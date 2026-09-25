"use client";

import Link from "next/link";
import styles from "@/components/nexus-session/nexus-session-unavailable.module.css";
import type { Locale } from "@/i18n/locales";

const copy = {
  en: {
    description:
      "The workspace needs the BHT Nexus service to confirm your account. Check your connection and try again. If the problem continues, contact BHT Nexus Support.",
    eyebrow: "Service unavailable",
    reference: "Reference",
    retry: "Try again",
    signIn: "Go to sign-in",
    signInHref: "/en/nexus/sign-in",
    title: "BHT Nexus cannot be reached right now",
  },
  id: {
    description:
      "Ruang kerja membutuhkan layanan BHT Nexus untuk memastikan akun Anda. Periksa koneksi lalu coba lagi. Jika kendala berlanjut, hubungi Dukungan BHT Nexus.",
    eyebrow: "Layanan belum tersedia",
    reference: "Referensi",
    retry: "Coba lagi",
    signIn: "Ke halaman masuk",
    signInHref: "/nexus/masuk",
    title: "Layanan BHT Nexus belum dapat dihubungi",
  },
} satisfies Record<Locale, Record<string, string>>;

/**
 * Keadaan ketika sesi tidak dapat dipastikan karena layanan tidak menjawab.
 * Keadaan ini tidak mengalihkan ke halaman masuk agar tidak terjadi putaran
 * pengalihan, dan tidak pernah membuka ruang kerja tanpa identitas yang sah.
 */
export function NexusSessionUnavailable({
  code,
  locale,
}: {
  code: string;
  locale: Locale;
}) {
  const text = copy[locale];

  return (
    <main className={styles.page} id="main-content" tabIndex={-1}>
      <section
        aria-labelledby="nexus-session-unavailable-title"
        className={styles.card}
        role="alert"
      >
        <span aria-hidden="true" className={styles.icon}>
          !
        </span>
        <p className={styles.eyebrow}>{text.eyebrow}</p>
        <h1 id="nexus-session-unavailable-title">{text.title}</h1>
        <p>{text.description}</p>
        <small className={styles.reference}>
          {text.reference}: <code>{code}</code>
        </small>
        <div className={styles.actions}>
          <button
            className={styles.primary}
            onClick={() => window.location.reload()}
            type="button"
          >
            {text.retry}
          </button>
          <Link className={styles.secondary} href={text.signInHref}>
            {text.signIn}
          </Link>
        </div>
      </section>
    </main>
  );
}
