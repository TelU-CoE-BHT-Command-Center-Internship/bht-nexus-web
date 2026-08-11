# Panduan Desain BHT-Nexus Web

Dokumen ini adalah "dokumen desain antarmuka" yang dirujuk REQ-UI-001 pada
`srs/bht-nexus-srs.md`.

## Aturan yang mengikat

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

Warna teks, garis, permukaan, dan status didefinisikan sebagai token pada
`src/app/globals.css`. Komponen memakai `var(--nama-token)` untuk peran
tersebut. Warna aksen sekali pakai dikecualikan, lihat Cakupan token.

**Warna menandai pengecualian.** Baris yang berhasil, kandidat yang menunggu
tinjauan, dan keadaan lain yang berlaku pada seluruh baris ditulis sebagai teks
biasa. Nada berwarna dipakai untuk keadaan yang berbeda dari sekitarnya:
kegagalan, penolakan, atau percobaan ulang. Setiap penanda tetap membawa teks,
sesuai aturan 4 di atas.

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

Garis yang hanya membentuk tampilan memakai `--color-line-soft`.

### Status job

Enam status pada REQ-FUNC-013-1 memakai satu pasang token per status.

| Status | Ink | Surface |
|---|---|---|
| `queued` | `--color-status-queued-ink` | `--color-status-queued-surface` |
| `running` | `--color-status-running-ink` | `--color-status-running-surface` |
| `retrying` | `--color-status-retrying-ink` | `--color-status-retrying-surface` |
| `succeeded` | `--color-status-succeeded-ink` | `--color-status-succeeded-surface` |
| `failed` | `--color-status-failed-ink` | `--color-status-failed-surface` |
| `failed_permanently` | `--color-status-stopped-ink` | `--color-status-stopped-surface` |

### Blok jawaban

`--color-note-ink`, `--color-note-surface`, dan `--color-note-edge` dipakai blok
jawaban pada halaman tanya jawab.

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

Halaman baru memakai komponen yang ada sebelum membuat yang baru.

| Komponen | Berkas | Catatan |
|---|---|---|
| `WorkspacePage` | `components/nexus-workspace-page/` | Pembungkus halaman, mengatur padding dan jarak antarblok |
| `WorkspacePageHeader` | `components/nexus-workspace-page/` | Judul, deskripsi, dan area aksi |
| `WorkspacePanel` | `components/nexus-workspace-page/` | Panel. `flush` menghapus padding badan untuk tabel; tanpa `title` panel tampil tanpa kepala dan memakai `label` untuk pembaca layar |
| `SortableColumn` | `components/nexus-workspace-page/` | Kepala kolom yang dapat diurutkan, dipasangkan dengan `useTableSort` |
| `AutomationStatusBadge` | `components/nexus-automation-status/` | Lencana status job. Selalu membawa teks status |
| `WorkspaceFootnote` | `components/nexus-workspace-page/` | Satu kalimat penutup di bawah panel |

Tabel memakai kelas `.table` dari `nexus-workspace-page.module.css`. Setiap
`<td>` memakai atribut `data-label`, yang menjadi label baris di bawah `42rem`.

**Satu hal mendominasi tiap layar.** Jawaban, nilai isian, dan judul kandidat
dibaca lebih dulu, sehingga ukurannya paling besar. Bukti pendukung berupa
kutipan sumber, rincian kandidat, dan potongan dokumen ditutup di balik
elemen `details` memakai kelas `.disclosure`, terbuka atas permintaan pembaca.

Sitasi dikelompokkan per dokumen, sehingga judul dokumen muncul sekali
meskipun jawaban memakai beberapa halaman dari dokumen yang sama.

Sel tabel berisi nilai yang berulang dan dapat dibandingkan antarbaris: nama,
tautan, status, angka, dan waktu. Kalimat bebas per baris tidak dipakai, karena
tidak ada kolom di basis data yang menghasilkannya.

Waktu ditulis `HH:MM DD-MM-YY` lewat `formatTimestamp`, dengan nilai ISO pada
atribut `dateTime`.

## Isi teks

Komponen tidak menulis teks tampilan. Setiap fitur memiliki berkas
`*-content.ts` yang mengembalikan objek bertipe untuk `id` dan `en`, sehingga
adapter server dapat menggantinya tanpa mengubah kontrak komponen. Pola ini
berlaku pada seluruh komponen `nexus-*`.

Teks antarmuka menyebutkan apa yang dilihat dan apa yang dapat dilakukan
pengguna. Nama komponen internal, nilai enum mentah, dan urutan pemrosesan di
belakang layar tidak ditulis pada layar.

Daftar data contoh beserta endpoint penggantinya ada di
[docs/preview-data.md](preview-data.md).

Satu label tidak ditampilkan dua kali pada satu layar. Bila judul panel sudah
menjelaskan bidang isian di dalamnya, label bidang tersebut disembunyikan
secara visual dan tetap tersedia untuk pembaca layar.

## Cakupan token

Warna teks, garis, permukaan, status, radius, dan bayangan pada berkas berikut
memakai token:

- `components/nexus-workspace-page/`, `components/nexus-automation-status/`
- `components/nexus-rag-*/`, `components/nexus-scraper-*/`
- `components/nexus-dashboard-overview/`, `components/nexus-dashboard-insights/`
- `components/nexus-dashboard-shell/`, `components/nexus-dashboard-announcement/`
- `components/nexus-login/`

Dua hal sengaja tetap berupa nilai langsung.

1. **Warna aksen sekali pakai.** Nada ungu, teal, hijau, dan biru pada ikon,
   grafik, serta kartu program hanya dipakai satu tempat.
2. **Halaman publik.** `landing-hero`, `research-focus`, `news-highlights`,
   `latest-events`, `partners`, `members`, `location-map`, `site-header`, dan
   `site-footer` memakai palet pemasaran sendiri dengan gradien dan lapisan
   foto. Seluruhnya sudah lolos audit kontras.

## Yang belum selesai

**Keadaan memuat, kosong, dan tanpa izin belum ada komponennya.** Tiga keadaan
ini disebut REQ-UI-001 tetapi belum tersedia di mana pun. Halaman yang ada
menampilkan keadaan berhasil dan gagal melalui lencana status, serta keadaan
tanpa bukti pada halaman tanya jawab.
