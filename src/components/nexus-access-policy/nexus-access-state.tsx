import styles from "@/components/nexus-access-policy/nexus-access-state.module.css";

/**
 * Penanda keadaan izin. Bentuk ikon, teks, dan warna dipakai bersama supaya
 * aktif dan nonaktif tetap terbaca tanpa mengandalkan warna saja.
 */
export function NexusAccessStateBadge({
  size = "medium",
  state,
}: {
  size?: "medium" | "small";
  state: "ACTIVE" | "INACTIVE" | "UNRESOLVED";
}) {
  const isActive = state === "ACTIVE";
  return (
    <span className={styles.badge} data-size={size} data-state={state}>
      <span aria-hidden="true" className={styles.badgeIcon}>
        {isActive ? (
          <svg aria-hidden="true" fill="none" viewBox="0 0 16 16">
            <path d="m3.6 8.3 2.9 2.9 5.9-6.2" />
          </svg>
        ) : (
          <svg aria-hidden="true" fill="none" viewBox="0 0 16 16">
            <path d="M4.2 8h7.6" />
          </svg>
        )}
      </span>
      {state === "UNRESOLVED"
        ? "Belum dapat dihitung"
        : isActive
          ? "Aktif"
          : "Nonaktif"}
    </span>
  );
}
