# Panduan Kontribusi BHT-Nexus Web

Panduan ini membantu tim menjaga perubahan tetap jelas, aman, mudah diperiksa, dan tidak menghapus pekerjaan yang sudah ada.

## Prinsip Dasar

1. Satu perubahan mempunyai satu tujuan utama.
2. Pekerjaan dimulai dari issue yang jelas.
3. Kontributor membuat perubahan pada branch, bukan langsung di `main`.
4. Seluruh diff dibaca sebelum commit.
5. Pemeriksaan lokal dijalankan sebelum push.
6. Pull request ditinjau manusia sebelum digabungkan.
7. Riwayat Git tidak dihapus untuk merapikan struktur atau memasang alat baru.

## Menyiapkan Repository

```powershell
git clone https://github.com/TelU-CoE-BHT-Command-Center-Internship/bht-nexus-web.git
Set-Location bht-nexus-web
npm ci
npm run check
```

Jika pemeriksaan awal gagal, simpan pesan kesalahannya dan selesaikan penyebabnya sebelum mulai mengubah kode.

## Alur Pekerjaan

1. pilih atau buat issue;
2. sinkronkan `main`;
3. buat branch dengan satu tujuan;
4. kerjakan perubahan;
5. jalankan seluruh pemeriksaan;
6. periksa diff dan data sensitif;
7. buat commit yang jelas;
8. push branch;
9. buka pull request;
10. tanggapi review dan gabungkan setelah seluruh syarat terpenuhi.

Contoh memulai branch:

```powershell
git switch main
git pull --ff-only origin main
git switch -c feat/dashboard-layout
```

`--ff-only` mencegah Git membuat penggabungan yang tidak disengaja ketika hanya ingin mengambil pembaruan.

## Penamaan Branch

Gunakan nama singkat dengan huruf kecil dan tanda hubung.

```text
feat/dashboard-layout
fix/mobile-navigation
docs/local-setup
test/dashboard-summary
refactor/shared-components
chore/ci-baseline
```

## Format Commit

Gunakan pola:

```text
type(scope): deskripsi
```

`type` dan `scope` menggunakan istilah Inggris. Deskripsi menggunakan bahasa Indonesia yang ringkas dan natural.

| Type | Digunakan untuk |
|---|---|
| `feat` | Kemampuan baru bagi pengguna |
| `fix` | Perbaikan perilaku yang salah |
| `docs` | Dokumentasi |
| `test` | Pengujian |
| `refactor` | Perapian kode tanpa mengubah perilaku |
| `perf` | Peningkatan performa |
| `chore` | Alat, dependency, dan pemeliharaan |
| `ci` | Pemeriksaan otomatis GitHub |
| `build` | Proses build dan packaging |
| `revert` | Membatalkan commit sebelumnya |

Contoh:

```text
chore(repo): siapkan fondasi awal aplikasi web
feat(dashboard): tambahkan kerangka navigasi utama
fix(navigation): perbaiki menu pada layar kecil
docs(setup): jelaskan cara menjalankan proyek
test(dashboard): tambahkan pemeriksaan ringkasan
```

Hindari pesan seperti `update`, `done`, `revisi`, `coba`, atau `fix lagi` karena tidak menjelaskan tujuan perubahan.

## Pemeriksaan Sebelum Push

```powershell
npm ci
npm run check
npm audit --audit-level=high
git status
git diff --check
```

Pastikan tidak ada:

- kata sandi, token, cookie, atau private key;
- data pribadi atau data produksi;
- `.env` asli;
- transkrip percakapan atau catatan kerja lokal;
- hasil build dan `node_modules`;
- dependency yang tidak digunakan.

## Pull Request

Pull request harus menjelaskan:

- masalah atau kebutuhan;
- perubahan yang dibuat;
- batas pekerjaan;
- cara memeriksa hasil;
- dampak terhadap tampilan, data, dan keamanan;
- issue yang berkaitan.

Perubahan antarmuka perlu menyertakan tangkapan layar yang tidak memuat data sensitif dan mengikuti [docs/design-guide.md](docs/design-guide.md).

Satu persetujuan dan pemeriksaan otomatis yang lulus diperlukan sebelum perubahan dapat masuk ke `main`. Persetujuan lama dibatalkan jika terdapat perubahan baru setelah review.

## Dependency Baru

Sebelum menambahkan paket:

1. pastikan kebutuhannya belum dapat dipenuhi oleh Next.js, React, atau paket yang sudah ada;
2. periksa dokumentasi, aktivitas pemeliharaan, lisensi, dan keamanan;
3. pastikan kompatibel dengan Node.js 24;
4. gunakan npm dan perbarui `package-lock.json`;
5. jelaskan alasan penambahan pada pull request.

Jangan menambahkan `pnpm-lock.yaml` atau `yarn.lock`. Repository ini menggunakan npm dan `package-lock.json`.

## Menjaga Riwayat

Jangan menghapus lalu membuat ulang repository, menjalankan `git init` di dalam hasil clone, melakukan force push ke `main`, atau mengganti riwayat yang sudah dibagikan.

Perubahan struktur, alat, atau aturan dilakukan melalui branch dan pull request agar perbedaannya dapat diperiksa serta commit lama tetap tersedia.

Pemeliharaan terbatas dapat dilakukan langsung oleh administrator setelah seluruh pemeriksaan lokal lulus. Administrator tetap wajib memantau CI sampai selesai dan tidak boleh menulis ulang riwayat yang sudah dibagikan.

## Keamanan

Dugaan kerentanan tidak dilaporkan melalui issue biasa. Ikuti [SECURITY.md](SECURITY.md) agar laporan diterima secara privat.
