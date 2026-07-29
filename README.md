# BHT-Nexus Web

<div align="center">

**Landing page dan antarmuka web untuk layanan digital CoE BHT.**

[![Status](https://img.shields.io/badge/status-pengembangan_aktif-d7193f)](#status-saat-ini)
[![CI](https://github.com/TelU-CoE-BHT-Command-Center-Internship/bht-nexus-web/actions/workflows/ci.yml/badge.svg)](https://github.com/TelU-CoE-BHT-Command-Center-Internship/bht-nexus-web/actions/workflows/ci.yml)
[![Next.js](https://img.shields.io/badge/Next.js-16.2.12-111827)](https://nextjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-24_LTS-339933)](https://nodejs.org/)

[Status](#status-saat-ini) · [Menjalankan proyek](#menjalankan-proyek) · [Kontribusi](CONTRIBUTING.md) · [Keamanan](SECURITY.md)

</div>

## Gambaran Umum

BHT-Nexus Web adalah antarmuka publik CoE Biomedical & Healthcare Technology yang dikembangkan sebagai pintu masuk menuju informasi organisasi, kegiatan, riset, kolaborasi, dan layanan BHT-Nexus.

Aplikasi web dan server dikelola dalam repository terpisah. Repository ini berfokus pada halaman dan interaksi pengguna, sedangkan aturan bisnis, autentikasi, serta pengelolaan data berada di [`bht-nexus-server`](https://github.com/TelU-CoE-BHT-Command-Center-Internship/bht-nexus-server).

## Status Saat Ini

Repository berada pada tahap **pengembangan landing page**. Halaman utama berbahasa Indonesia dan Inggris sudah tersedia dengan susunan visual responsif. Isi berita, kegiatan, tautan, dan jadwal pada tahap ini masih bersifat editorial sementara agar struktur antarmuka dapat ditinjau sebelum konten resmi dan integrasi data diterapkan.

| Bagian | Status |
|---|---|
| Fondasi Next.js | Tersedia |
| TypeScript dan CSS Modules | Tersedia |
| Pemeriksaan kode dengan Biome | Tersedia |
| Pemeriksaan otomatis di GitHub | Tersedia |
| Navigasi dan identitas visual CoE BHT | Tersedia |
| Hero, riset, berita, dan kegiatan | Tersedia |
| Halaman Indonesia dan Inggris | Tersedia |
| Tata letak responsif | Tersedia |
| Bagian mitra dan bagian lanjutan | Dalam pengembangan |
| Halaman detail dan konten final | Belum dibuat |
| Login dan hak akses | Belum dihubungkan |
| Integrasi dengan server | Belum dibuat |
| Dashboard operasional BHT-Nexus | Belum dibuat |

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
| Kerangka web | Next.js 16.2.12 |
| Pustaka antarmuka | React 19.2.4 |
| Bahasa | TypeScript 5.9.3 |
| Gaya tampilan | CSS Modules dan token CSS |
| Pemeriksaan kode | Biome 2.2.0 |
| Runtime | Node.js 24.18.0 |
| Pengelola paket | npm 11.16.0 |

## Struktur Saat Ini

```text
.
├── .github/            # template kontribusi dan pemeriksaan otomatis
├── scripts/            # pemeriksaan konfigurasi repository
├── src/
│   ├── app/             # route, layout, metadata, font, dan gaya global
│   ├── assets/          # logo serta gambar landing page
│   └── components/      # komponen per bagian landing page
├── biome.json          # aturan pemeriksaan dan format kode
├── next.config.ts      # pengaturan Next.js
├── package.json        # daftar perintah dan dependency
└── tsconfig.json       # aturan TypeScript
```

Komponen dipisahkan berdasarkan bagian tampilan supaya isi, presentasi, dan interaksi dapat diperbarui tanpa membuat halaman utama sulit dirawat. Folder baru ditambahkan ketika benar-benar dibutuhkan.

## Halaman yang Tersedia

| Alamat | Bahasa | Cakupan |
|---|---|---|
| `/` | Indonesia | Landing page utama |
| `/en` | Inggris | Landing page utama |

Landing page saat ini mencakup:

- navigasi desktop dan mobile;
- hero dengan sorotan utama;
- eksplorasi fokus riset;
- berita pilihan;
- kegiatan terbaru dengan tanggal, waktu, dan gambar yang dapat dibuka dalam ukuran asli.

Bagian mitra, halaman detail, konten resmi terbaru, dan pintu masuk dashboard akan ditambahkan secara bertahap.

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

`npm run check` memeriksa konfigurasi repository, pola kode, TypeScript, dan proses build. `npm audit` memeriksa paket yang mempunyai peringatan keamanan tingkat tinggi.

## Perintah yang Tersedia

| Perintah | Fungsi |
|---|---|
| `npm run dev` | Menjalankan web untuk pengembangan |
| `npm run validate:config` | Memeriksa YAML dan struktur issue form |
| `npm run lint` | Memeriksa format dan pola kode |
| `npm run typecheck` | Memeriksa kesesuaian TypeScript |
| `npm run build` | Membuat build produksi |
| `npm run start` | Menjalankan hasil build |
| `npm run check` | Menjalankan lint, typecheck, dan build |
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

Daftar ini akan mengikuti perkembangan kontribusi pada BHT-Nexus Web.

## Lisensi dan Penggunaan

Repository ini dapat dilihat secara publik untuk mendukung peninjauan dan kolaborasi. Lisensi penggunaan ulang belum ditetapkan. Keterlihatan publik tidak secara otomatis memberikan izin untuk menyalin, memodifikasi, atau mendistribusikan kode di luar kewenangan organisasi.

Nilai `"private": true` pada `package.json` hanya mencegah proyek terpublikasi sebagai paket npm secara tidak sengaja. Nilai tersebut tidak menentukan keterlihatan repository GitHub.
