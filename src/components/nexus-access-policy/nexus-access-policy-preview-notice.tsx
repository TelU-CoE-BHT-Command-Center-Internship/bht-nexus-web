import styles from "@/components/nexus-access-policy/nexus-access-policy-preview-notice.module.css";

/**
 * Pengaturan hak akses per peran dan per akun pada halaman ini masih berupa
 * rancangan dengan data contoh. Akses nyata setiap akun ditentukan layanan
 * BHT Nexus dan dikelola dari daftar akun di Administrasi.
 */
export function NexusAccessPolicyPreviewNotice() {
  return (
    <aside
      aria-label="Status halaman rancangan hak akses"
      className={styles.notice}
      role="note"
    >
      <strong>Rancangan kebijakan akses</strong>
      <p>
        Halaman ini memakai akun dan peran contoh untuk merancang hak akses.
        Perubahan di sini tidak disimpan dan tidak mengubah akses akun mana pun.
        Peran dan status akun sebenarnya dikelola dari daftar akun di
        Administrasi.
      </p>
    </aside>
  );
}
