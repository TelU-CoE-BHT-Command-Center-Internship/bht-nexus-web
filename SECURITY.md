# Kebijakan Keamanan BHT-Nexus Web

Keamanan diterapkan sejak tahap awal pengembangan BHT-Nexus Web.

## Status Dukungan

Selama aplikasi belum mempunyai rilis produksi, branch `main` menjadi fondasi aktif yang dipelihara. Kebijakan versi akan diperbarui setelah rilis pertama tersedia.

## Melaporkan Kerentanan

Jangan membuat issue publik untuk dugaan kerentanan.

Gunakan **Private Vulnerability Reporting** pada tab **Security** repository. Jika fitur tersebut tidak tersedia, hubungi maintainer melalui kanal internal tim yang telah disetujui.

Laporan sebaiknya memuat:

- ringkasan masalah;
- bagian yang terdampak;
- langkah reproduksi minimal;
- kemungkinan dampak;
- bukti yang sudah dibersihkan dari informasi rahasia;
- saran perbaikan jika tersedia.

Jangan mengirim kata sandi, token aktif, private key, data pribadi, atau dokumen rahasia sebagai bukti.

## Jika Informasi Rahasia Terlanjur Masuk

Menghapus informasi dari commit terbaru tidak otomatis menghilangkannya dari riwayat.

Urutan penanganannya:

1. cabut atau ganti informasi rahasia pada layanan penerbitnya;
2. beri tahu pihak yang berwenang melalui kanal privat;
3. periksa kemungkinan penyalahgunaan;
4. tentukan kebutuhan pembersihan riwayat Git;
5. catat penyebab dan langkah pencegahan tanpa mempublikasikan nilainya.

## Target Penanganan

Tim menargetkan konfirmasi penerimaan laporan dalam dua hari kerja dan penilaian awal dalam lima hari kerja. Waktu penyelesaian menyesuaikan dampak dan kompleksitas masalah.

## Ruang Lingkup

Contoh masalah yang perlu dilaporkan secara privat:

- akses tanpa izin;
- kebocoran sesi atau identitas pengguna;
- data sensitif tampil kepada pihak yang salah;
- validasi masukan yang dapat dilewati;
- skrip berbahaya pada halaman;
- konfigurasi web yang membuka informasi internal;
- dependency dengan dampak keamanan nyata;
- informasi rahasia yang tercatat pada log atau hasil build.

Rincian kerentanan tidak dipublikasikan sebelum perbaikan tersedia dan pihak yang berwenang menyetujui pengungkapannya.
