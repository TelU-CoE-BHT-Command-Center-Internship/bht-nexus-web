# Cakupan Produk Saat Ini

Dokumen ini merangkum bagian BHT-Nexus Web yang sudah tersedia, batas implementasinya, dan pekerjaan yang masih berlanjut. Ringkasan ini diperbarui bersama perubahan produk agar README tetap ringkas dan mudah dipakai sebagai pintu masuk repository.

## Status pengembangan

BHT-Nexus Web masih berada dalam pengembangan aktif. Landing page, halaman institusional, serta ruang kerja BHT Nexus sudah mempunyai fondasi visual dan interaksi yang dapat ditinjau, tetapi belum dianggap sebagai versi akhir.

Data pada antarmuka ruang kerja masih berupa data terstruktur untuk pengembangan frontend. Autentikasi, hak akses, penyimpanan permanen, pekerjaan latar belakang, dan perubahan data resmi belum dihubungkan ke layanan server.

## Landing page dan halaman institusional

Bagian yang sudah tersedia:

- navigasi desktop dan mobile;
- hero dan sorotan utama;
- eksplorasi fokus riset;
- berita pilihan dan kegiatan terbaru;
- profil ketua dan tim pengurus;
- peta lokasi dan kanal kontak;
- footer institusional;
- halaman Indonesia dan Inggris;
- kerangka jejaring mitra nasional dan internasional.

Landing page masih akan berkembang. Daftar mitra, berita, kegiatan, tautan, dan beberapa bagian lanjutan menunggu data resmi serta konfirmasi tim sebelum dianggap final.

## Ruang kerja BHT Nexus

### Shell dan dashboard

- Navigasi desktop dan mobile memakai struktur yang sama di seluruh ruang kerja.
- Identitas pengguna, notifikasi, bantuan, dan menu profil sudah tersedia sebagai antarmuka.
- Dashboard menampilkan metrik, pengumuman, aktivitas riset, program unggulan, serta proyek terkini.
- Tabel dan kartu mempunyai perilaku responsif serta keadaan kosong dan loading yang konsisten.

### Pengumpulan

- Menerima profil publik SINTA atau Google Scholar.
- Memvalidasi nama, protokol HTTPS, dan host sesuai sumber.
- Menampilkan perjalanan pekerjaan dari antrean hingga hasil tersedia.
- Hasil pengumpulan selalu menjadi kandidat dan tidak pernah langsung mengubah data resmi.

### Tinjauan

- Menggunakan satu antrean keputusan untuk seluruh kandidat CoE BHT.
- Tab digunakan untuk memfilter sumber: Semua sumber, SINTA, Google Scholar, Dokumen, dan Manual.
- Filter tambahan mencakup status, jenis data, periode, dan urutan antrean.
- Jenis data mengikuti enam kelompok kerja: publikasi dan konferensi; riset dan bisnis; pengabdian masyarakat; HKI, paten, dan inovasi; akademik dan SDM; serta aktivitas dan tata kelola.
- Rincian kandidat menampilkan metadata sesuai jenis data, pemilik, pihak terkait, sumber, bukti, konteks evaluasi, dan riwayat audit.
- Ketika rekam resmi pembanding tersedia, reviewer dapat memeriksa skor kecocokan dan perbandingan setiap bidang.
- Identifier yang sama mencegah kandidat diterima sebagai data baru, tetapi tidak mengambil keputusan secara otomatis.
- Keputusan yang tersedia adalah menghubungkan ke rekam resmi, menerima sebagai data baru ketika aman, meminta perbaikan, atau menolak kandidat.
- Setiap keputusan membutuhkan alasan dan tahap konfirmasi sebelum disimpan pada state frontend.
- Permintaan perbaikan menentukan bidang yang boleh diubah, menyimpan dasar perubahan, menghasilkan versi baru, dan memperlihatkan nilai sebelum–sesudah.
- Drawer rincian dimuat ketika diperlukan agar halaman antrean tetap ringan.

### Publikasi

- Menampilkan daftar publikasi resmi, sumber pembentuk metadata, kelengkapan bidang, serta riwayat tinjauan.
- Sitasi diperlakukan sebagai metrik yang terpisah dari sumber pembentuk metadata.
- Bidang resmi yang masih kosong dapat menerima usulan nilai, pernyataan tidak tersedia, atau pernyataan tidak berlaku.
- Usulan tidak langsung mengubah rekam resmi dan selalu diteruskan ke Tinjauan.

### Dokumen

- Pustaka menerima PDF atau DOCX hingga 25 MB pada sesi frontend.
- Tanya jawab hanya menampilkan jawaban ketika bukti dan kutipan tersedia.
- Ekstraksi memperlihatkan kandidat per bidang dan mewajibkan keputusan sebelum dikirim ke Tinjauan.
- Pustaka, Tanya jawab, dan Ekstraksi tetap berada dalam satu ruang kerja Dokumen.

## Route utama

| Route | Cakupan |
|---|---|
| `/` dan `/en` | Landing page Indonesia dan Inggris |
| `/anggota` dan `/en/members` | Profil ketua dan tim pengurus |
| `/nexus/masuk` dan `/en/nexus/sign-in` | Antarmuka masuk |
| `/nexus/dashboard` | Dashboard ruang kerja |
| `/nexus/pengumpulan` dan `/en/nexus/collection` | Pengumpulan sumber publik |
| `/nexus/tinjauan` dan `/en/nexus/reviews` | Tinjauan kandidat sebelum menjadi data resmi |
| `/nexus/publikasi` | Daftar dan rincian publikasi resmi |
| `/nexus/dokumen` dan `/en/nexus/documents` | Pustaka dokumen |
| `/nexus/tanya-dokumen` dan `/en/nexus/ask-documents` | Tanya jawab bersitasi |
| `/nexus/ekstraksi` dan `/en/nexus/extraction` | Ekstraksi kandidat dari dokumen |

## Batas implementasi

Hal-hal berikut belum menjadi kemampuan produksi pada repository web:

- sesi dan autentikasi nyata;
- otorisasi berdasarkan peran;
- penyimpanan keputusan dan audit permanen;
- unggahan permanen;
- pekerjaan pengumpulan dan pemrosesan dokumen di server;
- indeks pencarian dokumen;
- promosi kandidat menjadi data resmi;
- integrasi penuh dengan layanan server;
- deployment produksi final.

Memuat ulang halaman interaktif akan mengembalikan state lokal ke kondisi awal. Bentuk data dan komponen sudah dipisahkan agar integrasi server dapat dilakukan melalui adapter tanpa membongkar presentasi utama.

## Prioritas lanjutan

- melengkapi dan mengonfirmasi daftar mitra;
- menyempurnakan berita, kegiatan, tautan, dan bagian landing page lanjutan;
- menghubungkan sesi, peran, dan sumber data server;
- menyimpan pekerjaan, keputusan, koreksi, versi, dan audit secara permanen;
- menjaga pemeriksaan aksesibilitas, responsivitas, kontras, dan regresi pada setiap pengembangan fitur.

Rincian pola antarmuka tersedia di [panduan desain](design-guide.md), sedangkan kontrak penggantian data frontend tersedia di [batas data frontend](preview-data.md).
