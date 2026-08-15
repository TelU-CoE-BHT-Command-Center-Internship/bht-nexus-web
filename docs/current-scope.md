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
- Identitas pengguna, pemindah bahasa Indonesia/Inggris, notifikasi, bantuan, dan menu profil sudah tersedia sebagai antarmuka.
- Dashboard menampilkan metrik, pengumuman, aktivitas riset, program unggulan, serta proyek terkini.
- Tabel dan kartu mempunyai perilaku responsif serta keadaan kosong dan loading yang konsisten.

### Pengumpulan

- Menerima profil publik SINTA atau Google Scholar.
- Memvalidasi nama, protokol HTTPS, dan host sesuai sumber.
- Menampilkan perjalanan pekerjaan dari antrean hingga hasil tersedia.
- Hasil pengumpulan selalu menjadi kandidat dan tidak pernah langsung mengubah data resmi. Satu pekerjaan yang menemukan enam karya menghasilkan enam rekam kandidat individual; pekerjaan hanya menjadi jejak sumbernya.
- Rekam hasil mempertahankan identitas pekerjaan, sumber, profil peneliti, pengaju, dan kandidat saat dibuka di Tinjauan pada sesi yang sama.

### Tinjauan

- Menggunakan satu antrean keputusan untuk seluruh kandidat CoE BHT.
- Tab sumber dan opsi periode dibentuk dari data antrean yang tersedia. Fixture impor lembar kerja tersedia sebagai kontrak riset KM-17 yang dapat difilter dan ditinjau.
- Filter tambahan mencakup status, jenis data, periode, dan urutan antrean.
- Jenis data mengikuti enam kelompok kerja: publikasi dan konferensi; riset dan bisnis; pengabdian masyarakat; HKI, paten, dan inovasi; akademik dan SDM; serta aktivitas dan tata kelola.
- Rincian kandidat menampilkan metadata sesuai jenis data, pemilik, pihak terkait, sumber, bukti, konteks evaluasi, dan riwayat audit.
- Ketika satu atau beberapa rekam resmi pembanding tersedia, reviewer memilih pembanding lalu memeriksa skor kecocokan dan perbandingan setiap bidang.
- Identifier yang sama mencegah kandidat diterima sebagai data baru, tetapi tidak mengambil keputusan secara otomatis.
- Tindakan keputusan menyesuaikan tujuan kandidat: data baru, pembaruan rekam, atau pelengkapan metadata. Menghubungkan ke rekam resmi, menerima data baru ketika aman, menyetujui perubahan, menyetujui pelengkapan, meminta perbaikan, dan menolak tidak ditampilkan sebagai satu daftar generik.
- Rincian sumber menyediakan asal-usul data yang dapat dibuka saat diperlukan: pekerjaan, percobaan, pengolah, waktu pengambilan, kunci sumber, dan sidik respons.
- Pengaju kandidat dicatat terpisah dari pemilik atau pihak utama agar pelaku ekstraksi tidak keliru dianggap sebagai pemilik data.
- Satu kandidat dapat terhubung ke beberapa indikator evaluasi tanpa menggandakan rekam kandidat. Setiap kaitan memakai `indicatorId`, nomor, label, kategori, dan aturan bukti yang konsisten.
- Setiap keputusan membutuhkan alasan dan tahap konfirmasi sebelum disimpan pada state frontend.
- Kemampuan pemeriksa disediakan melalui kontrak sesi. Pada kemampuan Audit KM saat ini, permintaan perbaikan menentukan bidang dan alasan, lalu ditampilkan sebagai status baca-saja; pemeriksa tidak mengubah kandidat atas nama pihak lain. Penerimanya dinyatakan netral sampai hak akses server menentukan pihak yang berwenang.
- Tautan rekam sesi yang sudah tidak tersedia menampilkan penjelasan dan jalan kembali ke antrean, bukan halaman kosong atau drawer tanpa isi.
- Drawer rincian dimuat ketika diperlukan agar halaman antrean tetap ringan.

### Publikasi

- Menampilkan daftar publikasi resmi, sumber pembentuk metadata, kelengkapan bidang, serta riwayat tinjauan.
- Sitasi diperlakukan sebagai metrik yang terpisah dari sumber pembentuk metadata.
- Bidang resmi yang masih kosong dapat menerima usulan nilai, pernyataan tidak tersedia, atau pernyataan tidak berlaku.
- Usulan tidak langsung mengubah rekam resmi dan selalu diteruskan ke Tinjauan.
- Setelah dikirim, usulan tersedia sebagai kandidat pelengkapan metadata pada Tinjauan di sesi yang sama.

### Dokumen

- Pustaka menerima PDF atau DOCX hingga 25 MB pada sesi frontend.
- Tanya jawab hanya menampilkan jawaban ketika bukti dan kutipan tersedia.
- Ekstraksi memperlihatkan kandidat per bidang dan mewajibkan keputusan sebelum dikirim ke Tinjauan.
- Bidang yang diterima beserta kutipannya dibuat sebagai rekam Tinjauan pada sesi yang sama.
- Pustaka, Tanya jawab, dan Ekstraksi tetap berada dalam satu ruang kerja Dokumen.

## Route utama

| Route | Cakupan |
|---|---|
| `/` dan `/en` | Landing page Indonesia dan Inggris |
| `/anggota` dan `/en/members` | Profil ketua dan tim pengurus |
| `/nexus/masuk` dan `/en/nexus/sign-in` | Antarmuka masuk |
| `/nexus/dashboard` | Dashboard ruang kerja |
| `/nexus/pengumpulan` dan `/en/nexus/collection` | Pengumpulan sumber publik |
| `/nexus/tinjauan` | Tinjauan kandidat sebelum menjadi data resmi |
| `/en/nexus/reviews` | Keadaan jujur bahwa terjemahan Tinjauan belum tersedia |
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

Penanggung jawab tujuan permintaan perbaikan masih merupakan keputusan produk yang perlu dikonfirmasi bersama layanan server dan konfigurasi peran. Antarmuka saat ini menggunakan bahasa netral, tidak menetapkan orang atau peran secara sepihak, dan tidak menegakkan izin melalui pemeriksaan role di browser.

Memuat ulang halaman interaktif akan mengembalikan state lokal ke kondisi awal. Bentuk data dan komponen sudah dipisahkan agar integrasi server dapat dilakukan melalui adapter tanpa membongkar presentasi utama.

## Prioritas lanjutan

- melengkapi dan mengonfirmasi daftar mitra;
- menyempurnakan berita, kegiatan, tautan, dan bagian landing page lanjutan;
- menghubungkan sesi, peran, dan sumber data server;
- menyimpan pekerjaan, keputusan, koreksi, versi, dan audit secara permanen;
- menjaga pemeriksaan aksesibilitas, responsivitas, kontras, dan regresi pada setiap pengembangan fitur.

Rincian pola antarmuka tersedia di [panduan desain](design-guide.md), sedangkan kontrak penggantian data frontend tersedia di [batas data frontend](preview-data.md).
