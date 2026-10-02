# Klaster riset pada ruang kerja

Cakupan berasal dari `dataScope` pada profil akun yang sedang masuk. Ketua klaster melihat anggota dan rekam resmi yang berkaitan dengan anggota klasternya. Ketua tanpa keanggotaan klaster mendapatkan keterangan bahwa klaster belum ditetapkan.

Pimpinan, pengurus, admin, dan auditor yang memiliki izin baca dapat memilih satu klaster atau seluruh CoE. Pilihan digunakan bersama pada direktori anggota, kelima rumah data, Monitoring, dashboard, dan ekspor CSV. Nama penulis atau peserta bebas perlu dihubungkan ke identitas anggota agar server mengenali keterlibatan klaster.

## Mengelola klaster

Pengelola dengan izin `iam.manage` membuka **Anggota → Kelola klaster** untuk menambah nama, kode opsional, dan keterangan. Pada **Tambah anggota** atau **Ubah profil**, pilih klaster anggota. Setelah anggota masuk ke klaster, buka pengaturan klaster dan pilih ketuanya.

Penetapan ketua organisasi dan peran akses akun adalah dua pengaturan berbeda. Akun ketua harus terhubung ke identitas anggota dan memiliki peran ketua klaster. Perpindahan anggota keluar dari klaster melepaskan penetapannya sebagai ketua klaster lama.

## Pergantian cakupan

Pergantian klaster memuat ulang data dan mengosongkan detail serta hasil daftar sebelumnya. Formulir yang belum disimpan meminta pengguna menyimpan atau membuang perubahan terlebih dahulu. Cookie pilihan klaster menyimpan preferensi tampilan; server tetap menentukan izin dan cakupan setiap permintaan.

Daftar klaster yang gagal dimuat menampilkan pesan dan tombol mencoba kembali. Aplikasi tidak menyatakan perubahan tersimpan sebelum API berhasil. Cache rekam dipisahkan berdasarkan akun dan cakupan.

## Kontrak API

- `GET /api/profile/me`: cakupan akun.
- `GET /api/divisions`: direktori klaster, nama ketua, dan keterangan.
- `POST /api/divisions` dan `PATCH /api/divisions/:public_id`: pengaturan klaster.
- `divisionPublicId` pada daftar anggota, rumah data, KPI, dashboard, dan ekspor: filter pilihan pengguna.
- `divisionPublicId` pada penulisan anggota: penetapan klaster, dengan nilai `null` untuk melepasnya.

Rekam lintas klaster tersedia satu kali pada setiap klaster yang melibatkan anggota terkait, dan tetap satu kali pada seluruh CoE. Kelayakan indikator ditentukan oleh jenis dan metadata rekam. Pengujian hitungan dan batas akses tersedia pada tes integrasi server `data-scope.integration-spec.ts`.
