# Panduan Desain BHT-Nexus Web

Dokumen ini adalah "dokumen desain antarmuka" yang dirujuk REQ-UI-001 pada
`srs/bht-nexus-srs.md`. Isinya empat hal: warna, tipografi, jarak, dan komponen
inti. Perubahan pada salah satunya dilakukan lewat pull request seperti
perubahan kode lainnya.

## Aturan yang mengikat

Empat aturan berikut berasal langsung dari REQ-UI-001 dan berlaku pada setiap
layar baru.

1. Seluruh alur utama dapat digunakan mulai lebar layar 360 piksel.
2. Setiap bidang formulir memiliki label yang terlihat. Pesan kesalahan
   menyebutkan bagian yang perlu diperbaiki.
3. Keadaan memuat, kosong, berhasil, gagal, dan tidak memiliki izin
   ditampilkan secara eksplisit.
4. Warna bukan satu-satunya penanda status. Setiap penanda status membawa teks,
   dan boleh ditambah ikon atau bentuk.

Ambang kontras mengikuti WCAG 2.2 AA: teks biasa 4.5:1, teks besar 3:1, dan
komponen non-teks seperti batas bidang isian serta cincin fokus 3:1.

## Warna

Seluruh warna didefinisikan sebagai token pada `src/app/globals.css`. Komponen
memakai `var(--nama-token)` dan tidak menulis nilai heksadesimal sendiri.

### Ramp teks

Lima langkah, seluruhnya lolos 4.5:1 di atas `--color-paper`.

| Token | Nilai | Dipakai untuk |
|---|---|---|
| `--color-ink-900` | `#071c41` | Judul halaman dan judul panel |
| `--color-ink-700` | `#102d57` | Nilai yang ditekankan, kolom pertama tabel |
| `--color-ink-500` | `#3f4f65` | Teks isi, sel tabel, label bidang |
| `--color-ink-400` | `#53647b` | Teks sekunder, deskripsi, kutipan |
| `--color-ink-300` | `#60728b` | Metadata, label huruf kapital, teks placeholder |

`--color-ink` yang lama tetap dipakai halaman publik dan bukan bagian dari ramp
ini.

### Permukaan dan garis

| Token | Nilai | Dipakai untuk |
|---|---|---|
| `--color-paper` | `#ffffff` | Latar halaman dan panel |
| `--color-surface-raised` | `#fcfdff` | Kartu di dalam panel |
| `--color-surface-muted` | `#fbfcfe` | Kepala tabel, tombol sekunder |
| `--color-surface-sunken` | `#f7fafd` | Chip, blok kutipan sumber |
| `--color-line-soft` | `#dce4ee` | Batas panel dan kontrol dekoratif |
| `--color-line-faint` | `#e6ebf2` | Pembatas baris dan kartu |
| `--color-line-field` | `#8f959c` | Batas kontrol interaktif: bidang isian, select, tombol sekunder |
| `--color-link` | `#1557aa` | Tautan dalam konten |

`--color-line-field` lebih gelap daripada dua token garis lainnya karena
kriteria 1.4.11 WCAG 2.2 meminta 3:1 untuk bagian non-teks pada komponen
interaktif. Garis yang hanya membentuk tampilan memakai `--color-line-soft`.

### Status job

Enam status pada REQ-FUNC-013-1 memakai satu pasang token per status. Pasangan
ini dipakai lencana status, ringkasan hitungan, dan keputusan tinjauan.

| Status | Ink | Surface |
|---|---|---|
| `queued` | `--color-status-queued-ink` | `--color-status-queued-surface` |
| `running` | `--color-status-running-ink` | `--color-status-running-surface` |
| `retrying` | `--color-status-retrying-ink` | `--color-status-retrying-surface` |
| `succeeded` | `--color-status-succeeded-ink` | `--color-status-succeeded-surface` |
| `failed` | `--color-status-failed-ink` | `--color-status-failed-surface` |
| `failed_permanently` | `--color-status-stopped-ink` | `--color-status-stopped-surface` |

### Catatan sebaris

`--color-note-*` untuk informasi dan `--color-note-warning-*` untuk peringatan,
masing-masing terdiri dari ink, surface, dan edge.

### Pemeriksaan

`npm run validate:contrast` membaca token dari `globals.css` dan menghitung
rasio setiap pasangan. Perintah ini termasuk dalam `npm run check`, sehingga
pasangan warna yang gagal menghentikan CI. Menambah pasangan baru berarti
menambah satu baris pada `textPairs` (ambang 4.5:1) atau `uiPairs` (ambang
3:1) di `scripts/validate-contrast.mjs`.

## Tipografi

`--font-sans` (Inter) untuk seluruh antarmuka. `--font-serif` hanya untuk judul
halaman dan judul sambutan.

| Peran | Ukuran | Berat |
|---|---|---|
| Judul halaman | `clamp(1.55rem, 2.1vw, 2rem)` | 700 |
| Judul panel | `1rem` | 760 |
| Teks isi | `0.86rem` | 520 |
| Sel tabel dan metadata | `0.72rem` | 520 |
| Label huruf kapital | `0.64rem` | 720 |

Label huruf kapital memakai `letter-spacing` antara `0.04em` dan `0.08em`.

## Jarak dan bentuk

Jarak memakai kelipatan `0.25rem`. Padding panel `1rem 1.2rem`, padding badan
panel `1.15rem 1.2rem`, dan jarak antarblok pada satu halaman
`clamp(1rem, 1.6vw, 1.5rem)`.

| Token | Nilai | Dipakai untuk |
|---|---|---|
| `--radius-sm` | `0.5rem` | Tombol, bidang isian |
| `--radius-md` | `0.6rem` | Kartu di dalam panel |
| `--radius-lg` | `0.8rem` | Panel |
| `--radius-pill` | `999px` | Lencana dan chip |
| `--shadow-panel` | `0 0.55rem 1.65rem rgb(8 40 92 / 4%)` | Panel dan kartu tingkat atas |

Titik henti responsif: `56rem` untuk susunan satu kolom, `42rem` untuk tabel
yang berubah menjadi kartu, `34rem` untuk padding sempit.

## Komponen inti

Empat komponen ini menjadi dasar setiap halaman ruang kerja. Halaman baru
memakai komponen yang ada sebelum membuat yang baru.

| Komponen | Berkas | Catatan |
|---|---|---|
| `WorkspacePage` | `components/nexus-workspace-page/` | Pembungkus halaman, mengatur padding dan jarak antarblok |
| `WorkspacePageHeader` | `components/nexus-workspace-page/` | Eyebrow, judul, deskripsi, dan area aksi |
| `WorkspacePanel` | `components/nexus-workspace-page/` | Panel bertajuk. `flush` menghapus padding badan untuk tabel |
| `AutomationStatusBadge` | `components/nexus-automation-status/` | Lencana status job. Selalu membawa teks status |

Tabel memakai kelas `.table` dari `nexus-workspace-page.module.css`. Setiap
`<td>` wajib memiliki atribut `data-label` karena di bawah `42rem` nilai itu
menjadi label baris saat tabel berubah menjadi kartu.

## Isi teks

Komponen tidak menulis teks tampilan. Setiap fitur memiliki berkas
`*-content.ts` yang mengembalikan objek bertipe untuk `id` dan `en`, sehingga
adapter server dapat menggantinya tanpa mengubah kontrak komponen. Pola ini
berlaku pada seluruh komponen `nexus-*`.

Satu label tidak ditampilkan dua kali pada satu layar. Bila judul panel sudah
menjelaskan bidang isian di dalamnya, label bidang tersebut disembunyikan
secara visual dan tetap tersedia untuk pembaca layar.

## Cakupan token

Seluruh komponen ruang kerja, dashboard, dan halaman masuk memakai token.
Warna teks, garis, permukaan, status, radius, dan bayangan pada berkas berikut
tidak lagi menulis nilai heksadesimal untuk peran tersebut:

- `components/nexus-workspace-page/`, `components/nexus-automation-status/`
- `components/nexus-rag-*/`, `components/nexus-scraper-*/`
- `components/nexus-dashboard-overview/`, `components/nexus-dashboard-insights/`
- `components/nexus-dashboard-shell/`, `components/nexus-dashboard-announcement/`
- `components/nexus-login/`

Dua hal sengaja tetap berupa nilai langsung.

1. **Warna aksen sekali pakai.** Nada ungu, teal, hijau, dan biru pada ikon,
   grafik, serta kartu program hanya dipakai satu tempat. Membuat token untuk
   masing-masing akan menghasilkan palet besar yang tidak dipakai ulang.
2. **Halaman publik.** `landing-hero`, `research-focus`, `news-highlights`,
   `latest-events`, `partners`, `members`, `location-map`, `site-header`, dan
   `site-footer` memakai palet pemasaran sendiri dengan gradien dan lapisan
   foto. Seluruhnya sudah lolos audit kontras, sehingga migrasi ke token
   menjadi perapian tanpa manfaat aksesibilitas.

## Yang belum selesai

**Keadaan memuat, kosong, dan tanpa izin belum ada komponennya.** Tiga keadaan
ini disebut REQ-UI-001 tetapi belum tersedia di mana pun. Halaman yang ada
menampilkan keadaan berhasil dan gagal melalui lencana status, serta keadaan
tanpa bukti pada halaman tanya jawab.
