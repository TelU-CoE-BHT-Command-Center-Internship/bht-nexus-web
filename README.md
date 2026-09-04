# BHT-Nexus Web

<div align="center">

**Landing page dan antarmuka web untuk layanan digital CoE BHT.**

[![Status](https://img.shields.io/badge/status-pengembangan_aktif-d7193f)](docs/current-scope.md)
[![CI](https://github.com/TelU-CoE-BHT-Command-Center-Internship/bht-nexus-web/actions/workflows/ci.yml/badge.svg)](https://github.com/TelU-CoE-BHT-Command-Center-Internship/bht-nexus-web/actions/workflows/ci.yml)
[![Next.js](https://img.shields.io/badge/Next.js-16.3.0-111827)](https://nextjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-24_LTS-339933)](https://nodejs.org/)

[Situs](https://bht-nexus-web.vercel.app) · [Menjalankan proyek](#menjalankan-proyek) · [Dokumentasi](#dokumentasi) · [Kontribusi](CONTRIBUTING.md) · [Keamanan](SECURITY.md)

</div>

## Gambaran umum

BHT-Nexus Web adalah antarmuka publik CoE Biomedical & Healthcare Technology: pintu masuk menuju informasi organisasi, kegiatan, riset, kolaborasi, dan ruang kerja BHT Nexus.

Web dan server dikelola terpisah. Repository ini berisi halaman dan interaksi pengguna, sedangkan autentikasi, aturan bisnis, dan pengelolaan data berada di [`bht-nexus-server`](https://github.com/TelU-CoE-BHT-Command-Center-Internship/bht-nexus-server). Web belum mengirim permintaan ke server; seluruh data pada antarmuka masih disediakan adapter frontend.

## Status singkat

- Landing page dan halaman anggota tersedia dalam bahasa Indonesia dan Inggris, responsif, dan masih akan dilengkapi—terutama bagian mitra dan informasi yang menunggu konfirmasi tim.
- Ruang kerja BHT Nexus sudah mempunyai Dashboard, Monitoring KM, Pengumpulan, Tinjauan, lima rumah Data Resmi, Dokumen, Anggota, Profil Saya, serta Administrasi beserta peran dan hak aksesnya.
- Autentikasi, penyimpanan permanen, worker, dan audit belum ada di repository ini; keempatnya milik server.

Inventaris per halaman, daftar route, batas implementasi, dan prioritas berikutnya ada di [cakupan produk saat ini](docs/current-scope.md).

## Menjalankan proyek

Prasyarat: Git, Node.js 24.18.0, npm 11.16.0.

```powershell
git clone https://github.com/TelU-CoE-BHT-Command-Center-Internship/bht-nexus-web.git
Set-Location bht-nexus-web
npm ci
npm run dev
```

Buka `http://localhost:3000`, dan tekan `Ctrl+C` untuk menghentikannya. `npm ci` memasang versi paket yang tercatat di `package-lock.json` supaya seluruh anggota memakai susunan dependency yang sama.

Sebelum mengusulkan perubahan, jalankan pemeriksaan lengkapnya:

```powershell
npm run check
npm audit --audit-level=high
```

`npm run check` memeriksa konfigurasi repository, kontras token warna, pola kode, TypeScript, dan proses build. `npm audit` memeriksa paket dengan peringatan keamanan tingkat tinggi. Keduanya cukup untuk pemeriksaan rutin dan tidak memerlukan browser pengujian tambahan.

## Perintah yang tersedia

| Perintah | Fungsi |
|---|---|
| `npm run dev` | Menjalankan web untuk pengembangan |
| `npm run build` | Membuat build produksi |
| `npm run start` | Menjalankan hasil build |
| `npm run check` | Menjalankan seluruh pemeriksaan di bawah ini sekaligus, lalu build |
| `npm run validate:config` | Memeriksa YAML dan struktur issue form |
| `npm run validate:contrast` | Memeriksa pasangan token warna terhadap ambang WCAG 2.2 AA |
| `npm run lint` | Memeriksa format dan pola kode |
| `npm run typecheck` | Memeriksa kesesuaian TypeScript |
| `npm run format` | Merapikan format berkas yang didukung Biome |

## Teknologi

| Bagian | Teknologi |
|---|---|
| Kerangka web | Next.js 16.3.0 |
| Pustaka antarmuka | React 19.2.4 |
| Bahasa | TypeScript 5.9.3 |
| Gaya tampilan | CSS Modules dan token CSS |
| Grafik | ApexCharts |
| Peta interaktif | MapLibre GL JS dan OpenFreeMap |
| Pemeriksaan kode | Biome 2.2.0 |
| Runtime | Node.js 24.18.0 |
| Pengelola paket | npm 11.16.0 |

## Struktur folder

```text
.
├── .github/            # template kontribusi dan pemeriksaan otomatis
├── docs/               # cakupan produk, panduan desain, dan batas data frontend
├── scripts/            # pemeriksaan konfigurasi dan kontras
├── src/
│   ├── app/             # route, layout, metadata, font, dan gaya global
│   ├── assets/          # logo serta gambar landing page dan ruang kerja
│   ├── components/      # komponen landing page, halaman masuk, dan ruang kerja
│   ├── content/         # data institusi yang dipakai lintas komponen
│   └── i18n/            # tipe bahasa yang dipakai lintas fitur
├── biome.json          # aturan pemeriksaan dan format kode
├── next.config.ts      # pengaturan Next.js
├── package.json        # daftar perintah dan dependency
└── tsconfig.json       # aturan TypeScript
```

Komponen dipisahkan menurut bagian tampilan supaya isi, presentasi, dan interaksi dapat diperbarui tanpa membuat satu halaman menjadi sulit dirawat. Palet dasar ruang kerja—permukaan, teks, garis, aksen, dan warna status—didefinisikan sebagai token CSS di `src/app/globals.css`.

## Dokumentasi

| Dokumen | Isinya |
|---|---|
| [docs/current-scope.md](docs/current-scope.md) | Kemampuan tiap halaman, daftar route, batas implementasi, dan prioritas berikutnya |
| [docs/design-guide.md](docs/design-guide.md) | Navigasi, struktur halaman, tabel, warna, interaksi, aksesibilitas, dan bahasa antarmuka |
| [docs/preview-data.md](docs/preview-data.md) | Adapter data frontend, kemampuan server yang dibutuhkan, kontrak integrasi, dan urutan migrasinya |
| [CONTRIBUTING.md](CONTRIBUTING.md) | Alur issue, branch, commit, dan pull request |

Mulailah dari `docs/current-scope.md` bila ingin tahu apa yang sudah ada, dan dari `docs/design-guide.md` bila hendak menambah tampilan baru.

## Cara berkontribusi

Kontribusi anggota tim dikerjakan melalui issue, branch, dan pull request. Pemeliharaan langsung ke `main` hanya dilakukan administrator setelah pemeriksaan lokal lulus. Panduan lengkapnya di [CONTRIBUTING.md](CONTRIBUTING.md).

## Keamanan dan dukungan

- Jangan menyimpan kata sandi, token, data pribadi, atau isi `.env` ke dalam Git.
- Bug dan usulan pengembangan dilaporkan melalui tab **Issues**.
- Dugaan kerentanan dilaporkan secara privat mengikuti [SECURITY.md](SECURITY.md).
- Pertanyaan penggunaan dan pemeliharaan mengikuti [SUPPORT.md](SUPPORT.md).

## Kontributor

- [Muhammad Zaenal Abidin Abdurrahman](https://github.com/Zendin110206)
- [Facalder](https://github.com/Facalder)
- [Liamours](https://github.com/Liamours)

Integrasi ruang kerja Pengumpulan, kandidat lintas-domain, dan Dokumen mempertahankan gagasan serta pekerjaan fitur dari PR #2 milik Liamours. Implementasinya direkonsiliasi dengan arsitektur dan bahasa visual terbaru di `main`, lalu dicatat kembali melalui atribusi Git pada commit integrasi.

## Lisensi dan penggunaan

Repository ini dapat dilihat publik untuk mendukung peninjauan dan kolaborasi. Lisensi penggunaan ulang belum ditetapkan, dan keterlihatan publik tidak dengan sendirinya memberi izin menyalin, memodifikasi, atau mendistribusikan kode di luar kewenangan organisasi.

Nilai `"private": true` pada `package.json` hanya mencegah proyek terpublikasi sebagai paket npm secara tidak sengaja; nilai tersebut tidak menentukan keterlihatan repository GitHub.
