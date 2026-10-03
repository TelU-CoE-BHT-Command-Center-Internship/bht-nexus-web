# Broadcast / Newsletter

Izin `broadcast.read` membuka penerima dan riwayat; `broadcast.manage` membuka penyusun serta tindakan kirim. Secara bawaan keduanya hanya dimiliki Pimpinan. Server membatasi peran sistem Pimpinan pada satu akun; penugasan sebelumnya harus dicabut sebelum menunjuk pengganti. Perubahan izin peran atau akses khusus per akun tetap mengikuti izin efektif dari server.

## Alur penggunaan

1. Isi judul dan pesan dengan editor visual. Gambar PNG/JPG maksimal 1 MB mempunyai deskripsi, posisi dan ukuran.
2. Pilih **Simpan draf**. Draf disimpan di server dengan nomor versi dan dapat dibuka dari riwayat atau tautan `?broadcast=<publicId>`, termasuk setelah halaman dimuat ulang. Perubahan yang belum disimpan tetap dijaga saat berpindah halaman.
3. Pilih **Kirim percobaan**, isi satu atau dua alamat, lalu periksa ringkasannya. Percobaan dapat dilakukan walaupun belum ada email anggota. Klik ulang permintaan percobaan yang sama setelah gangguan jaringan tidak membuat antrean ganda, termasuk bila antrean sudah diterima tetapi pembacaan hasil belum berhasil.
4. Pilih **Tinjau pengiriman** untuk broadcast anggota. Penerima berasal dari anggota aktif: email institusi yang sah, atau email alternatif bila email institusi tidak sah. Alamat yang sama hanya dihitung sekali. Akun masuk bukan sumber alamat penerima; anggota cuti atau nonaktif dikecualikan.
5. Setelah dikirim, pilih **Perbarui hasil** untuk melihat hasil tiap alamat. Broadcast yang sudah masuk antrean menjadi hanya baca; isi dan penerimanya tidak berubah bila data anggota atau konfigurasi pengirim kemudian berubah.

Server memeriksa kembali versi draf dan daftar penerima sebelum menambahkan antrean. Jika berubah setelah peninjauan, pengiriman ditolak dan pengguna perlu meninjau lagi. Kesalahan penyimpanan tidak mengosongkan pesan yang sedang disunting.

Pemberitahuan layanan dan tombol pembaruan mempunyai jarak dari judul halaman. Pratinjau ponsel tetap dapat digulir dengan sentuhan, roda tetikus, atau papan ketik; batang gulirnya disembunyikan pada layar pratinjau agar bingkai ponsel tetap rapi. Fokus papan ketik tetap terlihat dan area tersebut mempunyai label yang jelas.

## Arti hasil

- **Dalam antrean** berarti pesan menunggu atau sedang diproses.
- **Diterima layanan email** memerlukan ID konfirmasi layanan dan belum membuktikan pesan sampai ke kotak masuk.
- **Tersimpan di penampung pemeriksaan** hanya berlaku pada modus lokal; pesan belum dikirim ke email sungguhan.
- **Belum dapat dipastikan** memerlukan pemeriksaan sebelum pengiriman ulang. Aplikasi tidak mencoba ulang hasil ini secara otomatis.
- **Gagal** berarti penolakan pasti. Tombol mencoba lagi hanya menjadwalkan alamat yang gagal, dengan isi pesan yang sama.

Riwayat memakai data server dan mencatat judul, penyusun, versi serta hasil per penerima. HTML email, teks polos dan Markdown dihasilkan server dari dokumen terstruktur yang tervalidasi. Gambar yang sudah diunggah memakai alamat publik storage; alamatnya harus bisa dibuka melalui internet untuk pengiriman sungguhan. Kunci penyedia email tetap berada di server. Pengaturan penyedia, domain dan pengirim menggunakan layanan yang sudah dimiliki.
