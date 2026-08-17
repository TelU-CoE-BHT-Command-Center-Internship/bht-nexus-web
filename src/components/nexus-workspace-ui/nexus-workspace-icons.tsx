/**
 * Ikon yang dipakai oleh kerangka drawer setiap rumah data resmi: penanda data
 * resmi, peringatan kelengkapan, dan sumber pembentuk. Bentuknya harus sama di
 * semua domain, sehingga gambarnya disimpan satu kali di sini.
 *
 * Berkas ini hanya mengembalikan isi `<svg>`. Pembungkus `<svg>` tetap milik
 * komponen ikon masing-masing domain, sehingga seluruh pemanggilan yang sudah
 * ada tidak perlu berubah.
 */
export type NexusWorkspaceIconName = "alert" | "check" | "database";

export function NexusWorkspaceIconPaths({
  name,
}: {
  name: NexusWorkspaceIconName;
}) {
  switch (name) {
    case "alert":
      return (
        <>
          <path d="M12 3.5 21 20H3L12 3.5Z" />
          <path d="M12 9v5M12 17.2h.01" />
        </>
      );
    case "check":
      return (
        <>
          <circle cx="12" cy="12" r="9" />
          <path d="m8 12.25 2.5 2.5L16.5 9" />
        </>
      );
    case "database":
      return (
        <>
          <ellipse cx="12" cy="5.5" rx="7.5" ry="3" />
          <path d="M4.5 5.5v6c0 1.65 3.36 3 7.5 3s7.5-1.35 7.5-3v-6M4.5 11.5v6c0 1.65 3.36 3 7.5 3s7.5-1.35 7.5-3v-6" />
        </>
      );
  }
}
