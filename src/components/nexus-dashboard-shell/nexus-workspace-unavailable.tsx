import styles from "@/components/nexus-dashboard-shell/nexus-workspace-unavailable.module.css";
import { NexusWorkspaceLinkButton } from "@/components/nexus-workspace-ui/nexus-workspace-elements";
import type { Locale } from "@/i18n/locales";

const rateLimitedCopy = {
  en: {
    description:
      "BHT Nexus is limiting requests from your network for a moment. Your data is unchanged. Please wait a little and try again.",
    eyebrow: "Please wait",
    home: "Back to CoE BHT site",
    retry: "Try again",
    title: "Too many requests right now",
  },
  id: {
    description:
      "BHT Nexus sedang membatasi permintaan dari jaringan Anda untuk sementara. Data Anda tidak berubah. Tunggu sebentar lalu coba lagi.",
    eyebrow: "Tunggu sebentar",
    home: "Kembali ke situs CoE BHT",
    retry: "Coba lagi",
    title: "Terlalu banyak permintaan saat ini",
  },
} satisfies Record<Locale, Record<string, string>>;

const copy = {
  en: {
    description:
      "The workspace needs the BHT Nexus service, which cannot be reached right now. Your data is unchanged. Please try again in a moment.",
    eyebrow: "Service unavailable",
    home: "Back to CoE BHT site",
    retry: "Try again",
    title: "BHT Nexus cannot be reached right now",
  },
  id: {
    description:
      "Ruang kerja membutuhkan layanan BHT Nexus yang saat ini belum dapat dihubungi. Data Anda tidak berubah. Coba lagi beberapa saat lagi.",
    eyebrow: "Layanan belum tersedia",
    home: "Kembali ke situs CoE BHT",
    retry: "Coba lagi",
    title: "BHT Nexus belum dapat dihubungi",
  },
} satisfies Record<Locale, Record<string, string>>;

/**
 * Keadaan ketika server tidak menjawab (atau membatasi permintaan) saat sesi
 * diperiksa. Pengguna tidak dianggap keluar dan tidak dialihkan ke halaman masuk.
 */
export function NexusWorkspaceUnavailable({
  locale,
  reason = "unavailable",
  retryHref,
}: {
  locale: Locale;
  reason?: "rate-limited" | "unavailable";
  retryHref: string;
}) {
  const text = (reason === "rate-limited" ? rateLimitedCopy : copy)[locale];

  return (
    <main className={styles.page}>
      <section
        aria-labelledby="nexus-unavailable-title"
        className={styles.card}
        role="alert"
      >
        <span aria-hidden="true" className={styles.icon}>
          !
        </span>
        <p className={styles.eyebrow}>{text.eyebrow}</p>
        <h1 id="nexus-unavailable-title">{text.title}</h1>
        <p>{text.description}</p>
        <div className={styles.actions}>
          <NexusWorkspaceLinkButton href={retryHref} tone="primary">
            {text.retry}
          </NexusWorkspaceLinkButton>
          <NexusWorkspaceLinkButton href={locale === "id" ? "/" : "/en"}>
            {text.home}
          </NexusWorkspaceLinkButton>
        </div>
      </section>
    </main>
  );
}
