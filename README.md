# BHT-Nexus Web

<div align="center">

**Landing page dan antarmuka web untuk layanan digital CoE BHT.**

[![Status](https://img.shields.io/badge/status-pengembangan_aktif-d7193f)](#status-saat-ini)
[![CI](https://github.com/TelU-CoE-BHT-Command-Center-Internship/bht-nexus-web/actions/workflows/ci.yml/badge.svg)](https://github.com/TelU-CoE-BHT-Command-Center-Internship/bht-nexus-web/actions/workflows/ci.yml)
[![Next.js](https://img.shields.io/badge/Next.js-16.3.0-111827)](https://nextjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-24_LTS-339933)](https://nodejs.org/)

[Situs](https://bht-nexus-web.vercel.app) · [Status](#status-saat-ini) · [Cakupan saat ini](docs/current-scope.md) · [Menjalankan proyek](#menjalankan-proyek) · [Kontribusi](CONTRIBUTING.md) · [Keamanan](SECURITY.md)

</div>

## Gambaran Umum

BHT-Nexus Web adalah antarmuka publik CoE Biomedical & Healthcare Technology yang dikembangkan sebagai pintu masuk menuju informasi organisasi, kegiatan, riset, kolaborasi, dan layanan BHT-Nexus.

Aplikasi web dan server dikelola dalam repository terpisah. Repository ini berfokus pada halaman dan interaksi pengguna, sedangkan aturan bisnis, autentikasi, serta pengelolaan data berada di [`bht-nexus-server`](https://github.com/TelU-CoE-BHT-Command-Center-Internship/bht-nexus-server).

## Status Saat Ini

Repository sedang mengembangkan landing page sekaligus antarmuka ruang kerja BHT Nexus. Halaman utama dan halaman anggota dalam bahasa Indonesia serta Inggris sudah tersedia dengan tampilan responsif. Antarmuka masuk, dashboard, Pengumpulan, Tinjauan, Publikasi, Kekayaan Intelektual, Kontrak & Proposal, Akademik, Kegiatan & Pengabdian, Anggota, Administrasi Accounts & Access, dan Dokumen juga telah tersedia sebagai fondasi frontend sebelum autentikasi serta data server dihubungkan.

Landing page belum menjadi versi akhir. Bagian tambahan, tautan, serta informasi berita, kegiatan, dan mitra masih akan dilengkapi atau disesuaikan setelah tim mengonfirmasi data resminya.

| Bagian | Status |
|---|---|
| Fondasi Next.js | Tersedia |
| TypeScript dan CSS Modules | Tersedia |
| Pemeriksaan kode dengan Biome | Tersedia |
| Pemeriksaan otomatis di GitHub | Tersedia untuk konfigurasi, keamanan dependency, kontras, pola kode, TypeScript, dan build produksi |
| Navigasi dan identitas visual CoE BHT | Tersedia |
| Hero, riset, berita, dan kegiatan | Tersedia |
| Lokasi interaktif, kanal kontak, dan footer institusional | Tersedia |
| Halaman Indonesia dan Inggris | Tersedia |
| Tata letak responsif | Tersedia |
| Profil ketua dan tim pengurus CoE BHT | Tersedia |
| Kerangka jejaring mitra nasional dan internasional | Tersedia; daftar mitra masih dilengkapi dan dikonfirmasi bersama tim |
| Bagian landing page lanjutan | Dalam pengembangan |
| Halaman institusional lanjutan dan konten final | Dalam pengembangan |
| Antarmuka masuk BHT Nexus | Tersedia dalam bahasa Indonesia dan Inggris; autentikasi belum dihubungkan |
| Dashboard BHT Nexus | Tersedia dan responsif; metrik serta aktivitas masih menggunakan data terstruktur untuk pengembangan antarmuka |
| Halaman Publikasi BHT Nexus | Tersedia dan responsif; daftar dan rincian membedakan metadata resmi, jenis karya, kuartil jurnal, nilai yang hanya tercatat pada sumber, sitasi, serta jejak tinjauan. Metadata yang belum lengkap diajukan kembali ke Tinjauan dan tidak langsung mengubah rekam resmi |
| Halaman Kekayaan Intelektual BHT Nexus | Tersedia dan responsif; memuat hak cipta dan paten resmi beserta nomor pencatatan, keberadaan dokumen pendaftaran, dan keterkaitan indikator KM. Baris sumber yang menduplikasi rekam yang sama digabungkan tanpa menghilangkan jejak asalnya |
| Halaman Kontrak & Proposal BHT Nexus | Tersedia; memisahkan status kontrak dan proposal dalam satu rumah data resmi, mencakup KM-17 sampai KM-19 serta KM-37 sampai KM-39, dan meneruskan usulan pelengkapan metadata ke Tinjauan |
| Halaman Akademik BHT Nexus | Tersedia dan responsif; memuat bimbingan doktor, bimbingan magister, magang, riset tugas akhir, dan kompetisi mahasiswa (KM-28–KM-32) beserta pembimbing, bukti, dan keterkaitan indikator. Bimbingan dengan lebih dari satu pembimbing dihitung sebagai satu kegiatan, identitas mahasiswa memakai penanda rekam, dan peserta magang tidak disalahartikan sebagai nilai kapasitas KM-30 |
| Halaman Kegiatan & Pengabdian BHT Nexus | Tersedia dan responsif; memuat pembicara dan kunjungan internasional (KM-9–KM-10), keterlibatan unit bisnis, pembinaan komunitas, konferensi internasional, layanan non-riset, pengabdian masyarakat, proposal pengabdian, dan pengelolaan jurnal nasional (KM-20–KM-27). Metadata yang belum lengkap diajukan ke Tinjauan tanpa langsung mengubah rekam resmi |
| Halaman Pengumpulan BHT Nexus | Tersedia dalam ruang kerja Indonesia; menerima URL profil publik SINTA atau Google Scholar, memperlihatkan status pekerjaan dan kegagalannya, membuat setiap hasil sebagai rekam Tinjauan individual, serta menyediakan pencarian dan filter sumber maupun status pada riwayatnya |
| Halaman Tinjauan BHT Nexus | Alur Indonesia tersedia dan responsif; seluruh kandidat berada dalam satu antrean, sistem sumber dipisahkan dari pengaju serta penerima koreksi manusia, identitas dan label KM-1 sampai KM-46 mengikuti workbook stakeholder, data yang belum diketahui tidak ditebak, dan riwayat keputusan maupun koreksi tetap dapat ditelusuri |
| Pengajuan manual Data Resmi | Tersedia untuk Publikasi, Kekayaan Intelektual, Kontrak & Proposal, Akademik, serta Kegiatan & Pengabdian. Formulir memakai bidang subtype dari workbook, memisahkan periode evaluasi dari tahun/tanggal entitas, menerima bukti HTTPS, menyimpan draft tab secara otomatis, mencocokkan pengenal resmi, menyarankan indikator KM untuk keputusan reviewer, dan memproyeksikan hasil persetujuan beserta metadata khusus jenis ke rumah Data Resmi. Reviewer dapat menetapkan nol, satu, atau beberapa indikator KM |
| Ruang kerja Dokumen BHT Nexus | Tersedia dalam ruang kerja Indonesia; mencakup pustaka dengan identitas job dan riwayat proses, tanya jawab bersitasi yang menolak jawaban tanpa dukungan, serta pemeriksaan kandidat ekstraksi per bidang dengan pencegahan pengiriman ganda ke Tinjauan. Ekstraksi tidak memilih dokumen secara diam-diam dan pengguna dapat memilih tetap mengekstrak atau langsung membuka Tinjauan setelah mengirim |
| Ruang kerja BHT Nexus Inggris | Sedang dibangun; seluruh route workspace Inggris diarahkan ke satu halaman status sampai alur Indonesia selesai, sedangkan landing page dan halaman masuk Inggris tetap tersedia |
| Login dan hak akses | Antarmuka dan adapter akses frontend tersedia untuk navigasi, pencarian, route, serta aksi Tinjauan; sesi, autentikasi, dan otorisasi server belum dihubungkan |
| Integrasi dengan server | Belum dibuat |
| Deployment | Tersedia untuk diakses melalui [bht-nexus-web.vercel.app](https://bht-nexus-web.vercel.app) |

Status ini ditulis sesuai keadaan proyek. Landing page akan terus berkembang dan belum dianggap sebagai versi akhir.

## Hubungan dengan Server

```text
Pengguna
   │
   ▼
bht-nexus-web
halaman yang dibuka melalui browser
   │
   │ nanti meminta atau mengirim data
   ▼
bht-nexus-server
login, aturan, proses, dan pengelolaan data
   │
   ▼
basis data dan layanan pendukung
```

Pada tahap ini, hubungan tersebut masih menjadi arah pengembangan. Web belum mengirim permintaan ke server.

## Teknologi Dasar

| Bagian | Teknologi |
|---|---|
| Kerangka web | Next.js 16.3.0 |
| Pustaka antarmuka | React 19.2.4 |
| Bahasa | TypeScript 5.9.3 |
| Gaya tampilan | CSS Modules dan token CSS |
| Peta interaktif | MapLibre GL JS dan OpenFreeMap |
| Pemeriksaan kode | Biome 2.2.0 |
| Runtime | Node.js 24.18.0 |
| Pengelola paket | npm 11.16.0 |

## Struktur Saat Ini

```text
.
├── .github/            # template kontribusi dan pemeriksaan otomatis
├── docs/               # panduan desain dan batas data frontend
├── scripts/            # pemeriksaan konfigurasi dan kontras
├── src/
│   ├── app/             # route, layout, metadata, font, dan gaya global
│   ├── assets/          # logo serta gambar landing page dan ruang kerja
│   ├── components/      # komponen landing page, halaman masuk, ruang kerja, dan state lintas fitur
│   ├── content/         # data institusi yang dipakai lintas komponen
│   └── i18n/            # tipe bahasa yang dipakai lintas fitur
├── biome.json          # aturan pemeriksaan dan format kode
├── next.config.ts      # pengaturan Next.js
├── package.json        # daftar perintah dan dependency
└── tsconfig.json       # aturan TypeScript
```

Komponen dipisahkan berdasarkan bagian tampilan supaya isi, presentasi, dan interaksi dapat diperbarui tanpa membuat halaman utama sulit dirawat. Folder baru ditambahkan ketika benar-benar dibutuhkan. Komponen antarmuka yang benar-benar dipakai lintas fitur ruang kerja berada di `nexus-workspace-ui`, bentuk data dan formulir pelengkapan metadata berada di `nexus-metadata-completion`, sedangkan formulir pengajuan baru lintas-domain memakai model bersama di `nexus-manual-submission`. Logika serta gaya yang hanya berlaku untuk satu fitur tetap disimpan di folder fiturnya.

Palet dasar ruang kerja BHT Nexus—permukaan, teks, garis, aksen, serta warna status utama—didefinisikan sebagai token CSS di `src/app/globals.css`. Variasi yang hanya memiliki makna pada satu komponen tetap lokal agar daftar token tidak menjadi kumpulan warna tanpa konteks.

Inventaris fitur, alur kandidat, dan batas implementasi terbaru tersedia di [cakupan produk saat ini](docs/current-scope.md). Pola navigasi, state, aksesibilitas, dan pemakaian token dijelaskan di [panduan desain](docs/design-guide.md). Sumber fixture, perilaku lokal, batas keamanan, serta kemampuan server penggantinya dicatat di [batas data frontend](docs/preview-data.md).

## Halaman yang Tersedia

| Alamat | Bahasa | Cakupan |
|---|---|---|
| `/` | Indonesia | Landing page utama |
| `/en` | Inggris | Landing page utama |
| `/anggota` | Indonesia | Profil ketua dan tim pengurus CoE BHT |
| `/en/members` | Inggris | Profil ketua dan tim pengurus CoE BHT |
| `/nexus` | Indonesia | Pengarah menuju halaman masuk BHT Nexus |
| `/en/nexus` | Inggris | Pengarah menuju halaman masuk BHT Nexus |
| `/nexus/masuk` | Indonesia | Antarmuka masuk BHT Nexus |
| `/en/nexus/sign-in` | Inggris | Antarmuka masuk BHT Nexus |
| `/nexus/dashboard` | Indonesia | Dashboard ruang kerja BHT Nexus |
| `/nexus/pengumpulan` | Indonesia | Pekerjaan pengumpulan profil publik SINTA atau Google Scholar |
| `/en/nexus/coming-soon` | Inggris | Status pembangunan ruang kerja Inggris dan jalan kembali ke ruang kerja Indonesia |
| `/nexus/ajukan/[domain]` | Indonesia | Formulir pengajuan baru untuk lima rumah Data Resmi sebelum masuk ke Tinjauan |
| `/nexus/publikasi` | Indonesia | Daftar publikasi resmi beserta metadata, sumber, dan riwayat tinjauannya |
| `/nexus/kekayaan-intelektual` | Indonesia | Daftar hak cipta dan paten resmi beserta nomor pencatatan dan dokumennya |
| `/nexus/kontrak-proposal` | Indonesia | Daftar kontrak dan proposal resmi beserta pihak, skema, bukti, dan indikator KM |
| `/nexus/akademik` | Indonesia | Daftar bimbingan doktor, bimbingan magister, dan magang mahasiswa resmi |
| `/nexus/kegiatan` | Indonesia | Daftar kegiatan, jejaring, bisnis, dan pengabdian masyarakat resmi untuk KM-9, KM-10, serta KM-20 sampai KM-27 |
| `/nexus/anggota` | Indonesia | Direktori, profil, keanggotaan, identitas akademik, data terkait, dan hubungan akun BHT Nexus |
| `/nexus/administrasi` | Indonesia | Satu alur akun untuk undangan, relasi anggota kanonis, role tingkat tinggi, status akses, dan konteks dua arah dengan profil Anggota |
| `/nexus/tinjauan` | Indonesia | Satu antrean Tinjauan untuk publikasi, pelengkapan metadata, serta kandidat lintas-domain |
| `/nexus/dokumen` | Indonesia | Pustaka dan status pemrosesan dokumen |
| `/nexus/tanya-dokumen` | Indonesia | Tanya jawab dokumen dengan sumber dan kutipan |
| `/nexus/ekstraksi` | Indonesia | Tinjauan kandidat isian hasil ekstraksi dokumen |

Alamat lama `/nexus/pencarian` dan `/nexus/kandidat` tetap diarahkan ke Pengumpulan atau Tinjauan yang sesuai. Seluruh alamat workspace Inggris lama diarahkan ke `/en/nexus/coming-soon`, sehingga tidak ada alur terjemahan parsial yang terlihat selesai.

Landing page saat ini mencakup:

- navigasi desktop dan mobile;
- hero dengan sorotan utama;
- eksplorasi fokus riset;
- berita pilihan;
- kegiatan terbaru dengan tanggal, waktu, dan gambar yang dapat dibuka dalam ukuran asli;
- kerangka jejaring mitra nasional dan internasional dengan daftar yang masih dilengkapi dan dikonfirmasi bersama tim;
- lokasi kampus interaktif serta kanal Instagram, WhatsApp, dan email;
- footer institusional dengan dua lokasi, tautan resmi, RISS, dan kebijakan privasi.

Landing page akan terus dilengkapi secara bertahap, termasuk penyempurnaan informasi mitra dan bagian lanjutan setelah data resmi dikonfirmasi. Pengembangan ruang kerja BHT Nexus juga berlanjut melalui penyempurnaan antarmuka per fitur, penyesuaian berbasis peran, serta integrasi autentikasi dan data server. Pekerjaan tahap awalnya dilacak melalui [issue #1](https://github.com/TelU-CoE-BHT-Command-Center-Internship/bht-nexus-web/issues/1).

### Ruang Kerja BHT Nexus

Ruang kerja menyediakan Dashboard, Pengumpulan, Tinjauan, Publikasi, Kekayaan Intelektual, Kontrak & Proposal, Akademik, Kegiatan & Pengabdian, dan Dokumen dalam shell responsif yang konsisten. Navigasinya dikelompokkan mengikuti perjalanan data: Pengumpulan, Dokumen, dan Tinjauan berada pada kelompok alur data; lima halaman domain menjadi rumah data resmi yang sudah tersedia. Tujuan yang belum dibangun tetap ditandai belum tersedia agar arah pengembangannya terbaca tanpa membuat halaman kosong.

Tinjauan menjadi satu antrean keputusan manusia untuk kandidat lintas-domain. Metadata, bukti, pilihan pembanding, kaitan evaluasi, asal-usul data, dan tindakan menyesuaikan apakah kandidat merupakan data baru, pembaruan rekam, atau pelengkapan metadata. Kontrak frontend menutup keputusan ketika ID pelaku belum diketahui, mengikat hasil pencocokan pada versi kandidat, serta menyimpan waktu audit sebagai instant ISO sebelum ditampilkan dalam WIB.

Pada ruang kerja Indonesia, setiap hasil bisnis dari Pengumpulan, bidang yang disertakan dari Ekstraksi Dokumen, usulan pelengkapan, dan pengajuan baru dari lima rumah Data Resmi benar-benar dibuat sebagai rekam Tinjauan dan dibuka kembali melalui identitas rekamnya selama sesi frontend. Keputusan menerima data baru, memperbarui, atau menghubungkan kandidat dari sumber mana pun langsung tercermin pada rumah Data Resmi melalui adapter sesi yang sama; metadata resmi yang tidak dibawa kandidat tetap dipertahankan ketika pembaruan diterapkan. Pengumpulan dari profil Anggota mempertahankan hubungan hanya selama sumber dan pengenal orang eksternalnya tetap sama. Pada kandidat multi-orang, reviewer memilih person kandidat yang mewakili anggota dan memetakan person existing secara eksplisit ketika rekam diperbarui atau digabungkan; ID penulis, pencipta, dan pembimbing tidak pernah dianggap sama dengan `memberId` atau ditebak dari nama. Status KM yang belum dapat ditentukan mempertahankan hubungan existing, sedangkan penghapusan merupakan keputusan eksplisit. Lima jalur Data Terkait memakai ID anggota untuk membuka katalog dalam konteks orang yang dipilih. Identitas pekerjaan Pengumpulan tetap disimpan sebagai jejak sumber, bukan dijadikan satu kandidat gabungan. Perpindahan ini tetap bersifat lokal sampai endpoint staging dan penyimpanan server tersedia. Pemindah bahasa tampil konsisten pada seluruh header workspace; pilihan Inggris menuju satu halaman status pembangunan sampai seluruh alurnya benar-benar setara.

Data saat ini masih bersifat lokal dan deterministik untuk memvalidasi presentasi serta interaksi frontend. Autentikasi, hak akses, penyimpanan permanen, worker, dan sinkronisasi lintas sesi tetap menunggu integrasi layanan server; perubahan Data Resmi selama sesi sudah diterapkan melalui adapter frontend. Struktur adapter dan state frontend dipertahankan sebagai batas integrasi agar sumber data server nantinya dapat menggantikan data pengembangan tanpa membongkar alur utama antarmuka.

Inventaris kemampuan per halaman, batas implementasi, dan prioritas pengembangan berikutnya dijelaskan di [cakupan produk saat ini](docs/current-scope.md).

## Menjalankan Proyek

### Prasyarat

- Git;
- Node.js 24.18.0;
- npm 11.16.0.

### 1. Clone repository

```powershell
git clone https://github.com/TelU-CoE-BHT-Command-Center-Internship/bht-nexus-web.git
Set-Location bht-nexus-web
```

### 2. Pasang dependency

```powershell
npm ci
```

`npm ci` memasang versi paket yang sudah dicatat di `package-lock.json` sehingga setiap anggota menggunakan susunan dependency yang sama.

### 3. Jalankan web

```powershell
npm run dev
```

Buka `http://localhost:3000`. Tekan `Ctrl+C` pada terminal untuk menghentikan aplikasi.

### 4. Jalankan pemeriksaan lengkap

```powershell
npm run check
npm audit --audit-level=high
```

`npm run check` memeriksa konfigurasi repository, kontras token warna, pola kode, TypeScript, dan proses build. `npm audit` memeriksa paket yang mempunyai peringatan keamanan tingkat tinggi. Keduanya cukup untuk pemeriksaan rutin repository saat ini dan tidak memerlukan instalasi browser pengujian tambahan.

## Perintah yang Tersedia

| Perintah | Fungsi |
|---|---|
| `npm run dev` | Menjalankan web untuk pengembangan |
| `npm run validate:config` | Memeriksa YAML dan struktur issue form |
| `npm run validate:contrast` | Memeriksa pasangan token warna teks dan komponen terhadap ambang WCAG 2.2 AA |
| `npm run lint` | Memeriksa format dan pola kode |
| `npm run typecheck` | Memeriksa kesesuaian TypeScript |
| `npm run build` | Membuat build produksi |
| `npm run start` | Menjalankan hasil build |
| `npm run check` | Menjalankan pemeriksaan konfigurasi, kontras, lint, typecheck, dan build |
| `npm run format` | Merapikan format berkas yang didukung Biome |

## Cara Berkontribusi

Kontribusi anggota tim dikerjakan melalui issue, branch, dan pull request. Pemeliharaan langsung ke `main` hanya dilakukan oleh administrator setelah pemeriksaan lokal lulus.

Panduan lengkap tersedia di [CONTRIBUTING.md](CONTRIBUTING.md).

## Keamanan dan Dukungan

- Jangan menyimpan kata sandi, token, data pribadi, atau isi `.env` ke dalam Git.
- Bug dan usulan pengembangan dilaporkan melalui tab **Issues**.
- Dugaan kerentanan dilaporkan secara privat mengikuti [SECURITY.md](SECURITY.md).
- Pertanyaan penggunaan dan pemeliharaan mengikuti [SUPPORT.md](SUPPORT.md).

## Kontributor

- [Muhammad Zaenal Abidin Abdurrahman](https://github.com/Zendin110206)
- [Facalder](https://github.com/Facalder)
- [Liamours](https://github.com/Liamours)

Integrasi ruang kerja Pengumpulan, kandidat lintas-domain, dan Dokumen mempertahankan gagasan serta pekerjaan fitur dari PR #2 milik Liamours. Implementasinya direkonsiliasi dengan arsitektur dan bahasa visual terbaru di `main`, lalu dicatat kembali melalui atribusi Git pada commit integrasi.

Daftar ini akan mengikuti perkembangan kontribusi pada BHT-Nexus Web.

## Lisensi dan Penggunaan

Repository ini dapat dilihat secara publik untuk mendukung peninjauan dan kolaborasi. Lisensi penggunaan ulang belum ditetapkan. Keterlihatan publik tidak secara otomatis memberikan izin untuk menyalin, memodifikasi, atau mendistribusikan kode di luar kewenangan organisasi.

Nilai `"private": true` pada `package.json` hanya mencegah proyek terpublikasi sebagai paket npm secara tidak sengaja. Nilai tersebut tidak menentukan keterlihatan repository GitHub.
