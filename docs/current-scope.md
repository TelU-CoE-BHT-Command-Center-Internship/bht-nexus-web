# Cakupan Produk Saat Ini

Dokumen ini merangkum bagian BHT-Nexus Web yang sudah tersedia, batas implementasinya, dan pekerjaan yang masih berlanjut. Ringkasan ini diperbarui bersama perubahan produk agar README tetap ringkas dan mudah dipakai sebagai pintu masuk repository.

## Status pengembangan

BHT-Nexus Web masih berada dalam pengembangan aktif. Landing page, halaman institusional, serta ruang kerja BHT Nexus sudah mempunyai fondasi visual dan interaksi yang dapat ditinjau, tetapi belum dianggap sebagai versi akhir.

Masuk, aktivasi akun, pemulihan kata sandi, sesi, Profil Saya, dan pengelolaan akun di Administrasi sudah memakai layanan `bht-nexus-server` (cabang `dev`). Data modul lain—Monitoring KM, Tinjauan, Data Resmi, Pengumpulan, Dokumen, Anggota, dan Broadcast—masih disediakan adapter frontend. Contoh publikasi dan buku hanya memakai identitas nyata ketika halaman penerbitnya tersedia secara publik. Skenario operasional seperti kontrak, bimbingan, proposal internal, HKI, dan paten memakai identitas netral sambil mempertahankan bentuk bidang dari workbook KM 2026. Penyimpanan permanen, pekerjaan latar belakang, dan perubahan data resmi untuk modul-modul tersebut belum dihubungkan ke layanan server.

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
- Identitas pada header—nama, inisial, email, dan peran—berasal dari sesi server akun yang sedang masuk; tidak ada lagi akun contoh yang mewakili pengguna. Notifikasi dan bantuan masih berupa antarmuka. Menu pengguna dan notifikasi saling menutup, berhenti saat route berubah, serta dapat ditutup melalui interaksi luar atau Escape dengan fokus kembali ke pemicunya. Menu pengguna memuat Profil Saya dan Keluar. Pesan awal Dukungan tidak menyimpan nama atau peran statis. Pemindah bahasa tampil konsisten pada seluruh header workspace; pilihan Inggris menuju satu halaman status pembangunan sampai seluruh alur Indonesia selesai dan terjemahannya benar-benar setara.
- Navigasi dan akses halaman diturunkan dari izin efektif akun yang dikirim layanan server (izin dari peran ditambah penyesuaian per akun). Butir yang tidak dapat dibuka tidak ditampilkan, alamat langsungnya menampilkan keadaan Akses dibatasi beserta jalan kembali ke halaman kerja pertama akun, dan penegakan akses tetap milik server.
- Dashboard belum dianggap matang: butirnya disembunyikan dari navigasi dan bukan tujuan setelah masuk. Route `/nexus/dashboard` beserta kodenya tetap dipertahankan untuk pengembangan berikutnya.
- Tabel dan kartu mempunyai perilaku responsif serta keadaan kosong dan loading yang konsisten.

### Masuk, aktivasi, dan pemulihan akun

- Seluruh alur akun memakai kontrak layanan server. Browser hanya memanggil `/api/*` pada alamat web yang sama; proxy Next.js meneruskannya ke `BHT_NEXUS_API_ORIGIN`, sehingga cookie sesi HTTP-only tetap first-party dan token tidak pernah disimpan di `localStorage` maupun `sessionStorage`.
- `/nexus/masuk` menerima email dan kata sandi. Kesalahan kredensial selalu memakai satu kalimat yang sama untuk email yang terdaftar maupun tidak. Akun yang ditangguhkan, batas percobaan dari server (beserta perkiraan menit tunggunya), layanan yang tidak tersedia, dan koneksi terputus masing-masing mempunyai pesan sendiri. Bidang yang salah ditandai `aria-invalid` dan terhubung ke pesannya.
- Akun yang emailnya belum terverifikasi langsung dibawa ke langkah verifikasi: kode 6 digit dikirim otomatis, dapat dikirim ulang setelah jeda 60 detik, dan kode yang salah, kedaluwarsa, atau terlalu sering salah mempunyai pesan sendiri. Setelah terverifikasi, server membuat sesi dan pengguna masuk ke ruang kerja.
- Setelah masuk, pengguna kembali ke alamat yang tadi diminta (`?lanjut=`, hanya alamat ruang kerja internal) atau ke halaman kerja pertama yang diizinkan perannya. Akun tanpa halaman kerja diarahkan ke Profil Saya.
- Akun dibuat oleh pengelola melalui undangan; tidak ada pendaftaran publik. Pemilik akun undangan mengaktifkan akunnya sendiri di `/nexus/aktivasi`: email → kode verifikasi → kata sandi baru → masuk. Sesi pertama mengubah status akun dari Menunggu aktivasi menjadi Aktif.
- `/nexus/lupa-kata-sandi` memakai kontrak yang sama dengan kalimat pemulihan. Halaman tidak pernah menyatakan apakah sebuah email terdaftar. Kata sandi baru minimal 8 karakter dan harus diulang dengan benar sebelum dikirim. Pemulihan mengakhiri sesi lain akun tersebut.
- Sesi dibaca di server pada setiap muat halaman ruang kerja. Tanpa sesi, alamat ruang kerja dialihkan ke halaman masuk sebelum isi halaman dikirim. Ketika layanan tidak dapat dihubungi, ruang kerja menampilkan halaman layanan belum dapat dihubungi dengan tombol Coba lagi, bukan isi kosong atau identitas contoh. Sesi yang berakhir atau dicabut—karena keluar dari perangkat lain, penggantian kata sandi, pemulihan, atau penangguhan akun—mengembalikan pengguna ke halaman masuk dengan pesan sesi berakhir.
- Keluar mengakhiri sesi di server lebih dahulu. Bila server menolak atau tidak dapat dihubungi, menu pengguna menyatakan kegagalan itu dan pengguna tetap berada di halaman; perubahan yang belum disimpan tetap dijaga penjaga navigasi.
- MFA/2FA belum tersedia di server `dev` dan belum menjadi keputusan rilis, sehingga tidak ada halaman MFA di antarmuka.

### Monitoring KM

- `Monitoring KM` menjadi satu butir navigasi pada kelompok Utama, di samping Dashboard. Kategori dan indikator tidak dipecah menjadi butir sidebar sendiri.
- `/nexus/monitoring` adalah Ringkasan: satu pemilih periode evaluasi di kanan atas dan satu baris pemilih domain berisi Semua Domain beserta sembilan kategori KM. Barisnya digeser mendatar—diseret, roda tetikus, sentuh, atau panah papan ketik—tanpa batang gulir, dengan bayangan tepi sebagai penanda masih ada domain di arah tersebut.
- Berpindah domain tidak berpindah halaman dan tidak menuntut klik kedua. Semua Domain menampilkan empat kartu ringkasan, capaian target per domain, kemajuan indikator per kategori, dan pembaruan data resmi terbaru. Domain yang metadata evaluasinya sudah tersedia—Riset, Bisnis, Pengabdian Masyarakat, Akademik, dan Proposal—langsung menampilkan ikhtisar domainnya di kerangka yang sama.
- Domain yang halaman pemantauannya belum dibangun menampilkan keadaan sedang disiapkan beserta jumlah indikator, jumlah rekam resmi yang sudah terkait, jalan kembali ke Ringkasan, dan pintasan ke rumah Data Resmi terkait bila ada. Keadaan itu tidak pernah ditampilkan sebagai capaian nol.
- Kanan atas Monitoring memuat pemilih periode, **Kelola target**, dan **Unduh Excel**; rincian indikator memuat pemilih periode, **Ubah target**, dan **Unduh Excel**. Pemilih periode menghitung ulang seluruh angka untuk periode terpilih dan membawanya pada alamat `?periode=`, termasuk tautan domain, indikator, dan breadcrumb. Periode yang belum terdaftar menampilkan keadaan belum tersedia beserta jalan kembali, dan pengelola dapat langsung menambahkannya.
- Workbook KM 2026 menetapkan satu target per indikator untuk satu tahun evaluasi, sedangkan kolom TW berisi catatan realisasi triwulan dan bukan target triwulan, sehingga status indikator hanya dinilai per tahun. Rincian indikator menyajikan sebaran TW1–TW4 pada tahun evaluasi yang sama; filter triwulan mempersempit daftar rekam tanpa mengubah target atau realisasi tahunan.
- Setiap ikhtisar domain memakai satu susunan yang sama: empat kartu metrik, grafik pemenuhan target per indikator selebar kartu, sebaran rekam pembentuk sebagai cincin komposisi beserta legenda bernilai, gap target terbesar, daftar indikator yang dapat disaring menurut status, dan pembaruan Data Resmi domain tersebut. `/nexus/monitoring/[domain]` adalah alamat tetap tiap domain dan merender kerangka Monitoring yang sama dengan domain itu aktif sejak awal, bukan susunan kedua.
- Grafik pemenuhan target membandingkan setiap indikator dengan targetnya sendiri, bukan membandingkan besar target antar-indikator. Target seluruh indikator tidak pernah dijumlahkan menjadi satu angka domain dan tidak ada skor gabungan kategori.

- Target KM berlaku satu tahun penuh. Kelola target menampilkan target berlaku setiap indikator per domain, menerima nilai baru beserta alasan wajib, dan meminta konfirmasi sebelum menyimpan. Setiap perubahan menjadi versi target baru; versi sebelumnya tetap tampil pada riwayat bersama pelaku, waktu, nilai lama–baru, dan alasannya. Periode baru dapat ditambahkan dengan menyalin target periode terakhir sebagai versi awal. Target gabungan KM-23 seperti `9/1M` hanya menerima format gabungan `jumlah/nilaiM`; nilainya tetap tidak dibandingkan sebagai satu angka.
- Target awal periode 2026 berasal dari workbook KM 2026. Workbook KM 2026 hanya memuat satu kolom `TARGET 2026`; kolom `TW 1` sampai `TW 4` berada di bawah tajuk `Realisasi 2026` dan merupakan catatan realisasi triwulan, bukan target triwulan. Karena itu Monitoring tidak menampilkan target per triwulan dalam bentuk apa pun—membaginya menjadi empat adalah tafsiran yang tidak dimiliki sumbernya.
- `/nexus/monitoring/[domain]/[indikator]` tetap menjadi alamat yang sah untuk setiap indikator terpantau dan tetap membawa identitas indikator yang tepat. Halaman memuat target tahunan, realisasi, selisih, persentase capaian, sebaran triwulan, cara perhitungan, dan rekam pembentuk. Definisi dan persyaratan eviden ditempatkan pada bagian yang dapat dibuka. Antarmuka operasional menggunakan istilah periode evaluasi dan target tahunan; workbook hanya merupakan sumber migrasi awal, bukan sumber kerja yang harus dipelihara pengguna. Navigasi indikator sebelumnya/berikutnya mengikuti urutan dalam domain dan mengembalikan filter ke keadaan awal. Alamat indikator yang tidak berada pada domain tersebut, atau yang belum mempunyai metadata evaluasi, tetap menampilkan keadaan tidak ditemukan dan tidak pernah membuka indikator lain.
- Ikhtisar domain dan rincian indikator memakai pengukuran kanonis yang sama. Judul rekam dan tombol Rincian pada kolom Aksi membuka panel baca-saja yang memuat metadata rekam menurut rumah datanya, kaitan KM, eviden, asal data, dan tinjauan yang tercatat. Bidang metadatanya mengikuti rumah data asal, sehingga Publikasi menampilkan penulis, wadah terbit, dan kuartil, sedangkan Kekayaan Intelektual menampilkan jenis perlindungan, pencipta, dan nomor pencatatan. Tautan eviden hanya ditawarkan jika sumber publiknya tersedia; eviden internal tidak diberi URL rekaan. Tautan rumah Data Resmi membuka daftar rumah terkait, bukan menjanjikan direct-link rekam yang belum didukung tujuan.
- Indikator dihitung ketika capaiannya benar-benar dapat dibandingkan dengan target. Indikator yang belum bertarget, yang targetnya gabungan seperti `9/1M`, atau yang nilainya memang bukan jumlah rekam seperti kapasitas magang KM-30, dinyatakan belum dapat dihitung beserta alasannya di bawah tabel indikator—bukan dipaksakan menjadi angka.
- Target, satuan, definisi, dan cara perhitungan berasal dari workbook KM 2026 beserta letak barisnya. Realisasi dihitung dari rekam Data Resmi yang sudah lolos Tinjauan dan memiliki kaitan indikator KM eksplisit pada periode evaluasi yang sama.
- Nilai realisasi dan catatan triwulan dari workbook tidak ditampilkan sebagai pembanding operasional dan tidak dipakai sebagai realisasi BHT Nexus. Jejak sumber migrasi tetap tersedia pada provenance rekam; realisasi operasional berasal dari Data Resmi. Versi definisi indikator (rumus dan ketentuan) belum dapat diubah dari UI; yang berversi saat ini adalah target per periode.
- Rekam resmi yang tertaut ke sebuah indikator tidak otomatis menjadi realisasinya. Kaitan KM menyatakan rekam itu dilaporkan pada indikator tersebut; ketentuan perhitungan menyatakan apakah rekam itu memang memenuhi syarat indikatornya. Monitoring membedakan tiga keadaan: **Dihitung**, **Belum dihitung** (terbukti di luar periode atau tidak memenuhi ketentuan), dan **Perlu verifikasi** (bidang penentunya belum tercatat sehingga ketentuannya belum dapat diperiksa). Keadaan ketiga tidak pernah dihitung sebagai realisasi.
- Kelengkapan metadata dan syarat perhitungan indikator dinilai terpisah. Sebuah rekam dapat berstatus `Lengkap` tetapi belum dihitung, dan sebaliknya; keduanya tidak pernah dipakai sebagai pengganti satu sama lain.
- Setiap rekam dihitung satu kali menurut pengenal resminya. Angka realisasi pada kartu metrik selalu sama dengan jumlah rekam berstatus Dihitung; daftar Data Pembentuk Realisasi memuat seluruh rekam tertaut beserta alasan tiap rekam yang belum dihitung, sehingga selisih antara keduanya selalu dapat dijelaskan.
- Syarat perhitungan per indikator diturunkan dari kolom `Perhitungan Indikator` pada worksheet `List KM` dan dari worksheet rinciannya. Indikator yang sumbernya tidak memuat syarat baris tambahan tidak diberi syarat buatan: cakupan nasional atau internasional, bentuk kegiatan, dan jenjang akademik dibawa oleh worksheet tempat baris itu berada, yaitu oleh kaitan KM-nya sendiri.
- KM-15 dan KM-16 memakai kalimat perhitungan yang sama pada `List KM`—keduanya dihitung setelah memperoleh nomor registrasi—tetapi worksheet rinciannya berbeda: `no.16` memuat kolom `No. Paten`, sedangkan `no.15` tidak memuat kolom nomor registrasi sama sekali. Perbedaan ketersediaan itu dinyatakan apa adanya, dan rekam HKI tanpa nomor pencatatan berstatus perlu verifikasi, bukan dinyatakan gagal memenuhi syarat.
- Status indikator bersifat objektif: tercapai, belum tercapai, belum ada realisasi, belum dapat dihitung, atau target belum tersedia. Ambang laju seperti *on track* tidak dipakai karena workbook tidak menetapkannya. Persentase capaian indikator yang melampaui target ditampilkan apa adanya, termasuk nilai di atas 100%.
- Keanggotaan periode sebuah rekam ditentukan berurutan menurut ketelitian sumbernya: tanggal peristiwa lebih menentukan daripada tahun rekam, dan tahun rekam lebih menentukan daripada kolom periode evaluasi tempat rekam itu dicatat. Rekam yang tahunnya diketahui berbeda dari periode tidak pernah ikut terhitung walaupun kolom periode evaluasinya menyebut periode berjalan. Rekam yang sumbernya tidak mencatat tanggal maupun tahun tetap dapat masuk periode melalui kolom periode evaluasinya, dan keadaan itu dibedakan dari rekam yang tanggalnya bertentangan.
- Sebagian sumber hanya mencatat bulan terbitnya—kolomnya memang berformat bulan-tahun—sehingga tanggal bisnisnya disimpan sampai bulan saja dan ditampilkan sebagai nama bulan beserta tahunnya. Triwulan tetap dapat ditentukan karena TW hanya membutuhkan bulan; hari yang tidak dicatat sumbernya tidak pernah dikarang.
- Rekam Kontrak & Proposal memakai tanggal bisnis sesuai bentuknya: proposal diukur dari tanggal pengajuannya, kontrak dari tanggal mulainya. Sebuah proposal belum mempunyai kontrak yang dimulai, sehingga tanggal mulai kontrak tidak pernah dipakai sebagai dasar triwulan indikator pengajuan proposal.
- Triwulan dibaca dari tanggal bisnis rekam—tanggal kegiatan, tanggal terbit, tanggal pengajuan, atau tanggal mulai kontrak—bukan dari waktu pembaruan, waktu tinjauan, maupun waktu pengambilan sumber. Tanggal yang belum tercatat atau berada di luar tahun evaluasi tidak dimasukkan ke TW1–TW4. Rekam tersebut tetap berada pada daftar tahunan dan dijelaskan sebagai belum terpetakan; jika seluruh tanggal tidak dapat digunakan, sebaran dinyatakan belum tersedia beserta alasannya.
- Kuartil jurnal Q1–Q4 adalah pemeringkatan reputasi jurnal dan tidak pernah disamakan dengan triwulan evaluasi TW1–TW4.
- Sebaran analitik ditempatkan menurut cakupannya: ikhtisar domain memuat sebaran lintas indikator—bentuk rekam pembentuk dan kesiapan perhitungan—sedangkan rincian indikator memuat sebaran khusus indikator itu sendiri. Setiap sebaran menyebut populasinya dan seluruh irisannya berjumlah sama dengan populasi tersebut; nilai yang belum terklasifikasi muncul sebagai irisan tersendiri, tidak dihilangkan.
- Sebaran hanya dibangun ketika bidangnya memang kosakata tertutup pada rekam resmi. Karena itu tidak ada sebaran SINTA 1–4 (model publikasi tidak memuat peringkat SINTA per baris), tidak ada sebaran jenjang atau program studi (tidak ada bidang jenjang; program studi berupa teks bebas), tidak ada sebaran skema, pemberi dana, atau mitra (seluruhnya teks bebas), dan tidak ada sebaran nilai dana. Kolom TW pada workbook juga tidak dipakai sebagai dasar triwulan karena kolom itu merupakan penetapan pelapor, bukan tanggal peristiwanya.
- Monitoring KM tercatat pada katalog izin frontend kanonis sebagai modul `monitoring` dengan tindakan `view` (termasuk unduhan), `update` (koreksi rekam), dan `manage` (periode dan target). Peran Pimpinan dan Auditor mendapat ketiganya secara bawaan. Penegakan akses tetap milik server; frontend hanya menyajikan keadaannya.
- Monitoring tidak menyalin rekam resmi menjadi koleksi kedua dan tidak menghitung skor gabungan kategori. Angkanya dihitung dari rekam resmi sesi yang sama dengan rumah Data Resmi, sehingga kandidat yang disetujui di Tinjauan, pelengkapan metadata, dan koreksi langsung ikut membentuk realisasi.
- Rincian rekam pembentuk menyediakan **Koreksi data** bagi akun yang berwenang. Koreksi mengubah langsung bidang penentu perhitungan—tanggal bisnis, tahun, triwulan dilaporkan, bentuk karya dan kuartil, bentuk perlindungan dan nomor pencatatan, serta kaitan KM yang dibatasi pada indikator rumah data tersebut—tanpa berpindah halaman dan tanpa kembali ke Tinjauan. Alasan wajib diisi; riwayat koreksi menampilkan pelaku, waktu, dan perubahan sebelum–sesudah. Nilai yang dikoreksi langsung terlihat pada rumah Data Resmi.
- Triwulan rekam ditentukan tanggal bisnisnya. Bila tanggal belum tercatat, dipakai triwulan dilaporkan yang diisi pengaju pada form Ajukan, dikoreksi auditor, atau dibawa workbook (kolom tanpa judul `no.11!I`, `no.13!K`, `no.14!K` yang mencatat triwulan pelapor sebagai "Q1"/"Q2"; kuartil jurnal tetap dibaca dari kolom `Level Jurnal`). Label triwulan menyebut asalnya, misalnya "TW2 · dilaporkan".
- Unduh Excel menghasilkan workbook XLSX per periode dengan kolom yang mengikuti worksheet `Evaluasi`: target, TW1–TW4, belum terpetakan, realisasi, capaian, status, dan keterangan. Pada rincian indikator, workbook berisi sheet ringkasan dan rekam pembentuk beserta alasan dihitung atau tidaknya dan metadata sumber. Sel angka dan tanggal bertipe sesuai nilainya; baris judul dibekukan, filter tersedia, tautan eviden aktif, dan teks masukan tidak dijalankan sebagai rumus.
- Metadata evaluasi sudah tersedia untuk 28 indikator pada lima domain: Riset (KM-9–KM-18), Bisnis (KM-19–KM-21), Pengabdian Masyarakat (KM-22–KM-27), Akademik (KM-28–KM-33), dan Proposal (KM-37–KM-39). Domain lain menampilkan keadaan sedang disiapkan sampai target dan definisinya dimodelkan.

### Broadcast / Newsletter

- `Broadcast / Newsletter` menjadi butir navigasi pada kelompok Utama setelah Monitoring KM. Sesuai Meeting Minggu 12, penyusunnya adalah pengurus dan Ketua Klaster belum termasuk. Katalog izin kanonis mencatatnya sebagai modul `broadcast` dengan tindakan `view` (membuka halaman) dan `manage` (menyusun dan meninjau pengiriman); bawaannya hanya diberikan kepada Administrator dan peran lain dapat dinyalakan dari halaman peran. Akun yang hanya dapat melihat menerima ringkasan penerima dan riwayat tanpa penyusun.
- Penyusun mengikuti pola menulis email: baris Dari, Kepada, dan Judul di atas, lalu editor isi pesan dengan perkakas bergrup seperti editor isi LMS—gaya teks (Teks biasa, Judul besar, Subjudul), tebal, miring, daftar berpoin dan bernomor, tautan, gambar, hapus format, urungkan, dan ulangi. Penulis tidak pernah melihat sintaks. Perkakas memakai satu urutan Tab dengan perpindahan panah, Home, dan End, serta pintasan Ctrl/⌘ + B, I, K, Z, dan Y.
- Kertas tulis adalah kartu email itu sendiri: pita BHT Nexus, judul email, isi pesan, dan catatan kaki otomatis, dengan lebar 600 px, padding 32 px, dan huruf Arial 14 px seperti templat email server. Baris teks, ukuran gambar, dan posisi gambar di editor sama dengan email yang diterima.
- Gambar dipilih atau diseret ke dialog maupun langsung ke editor. Formatnya JPG atau PNG, maksimal 1 MB, sesuai batas unggah server, dan deskripsinya wajib diisi sebelum disisipkan dari dialog. Gambar yang dilepas atau ditempel tanpa deskripsi diberi penanda **Tambahkan deskripsi**.
- Gambar dapat diletakkan di kiri atau kanan dengan teks mengalir di sampingnya, atau di tengah. Ukurannya dipilih dari Kecil, Sedang, Besar, dan Penuh, atau ditarik lewat pegangan di sisinya. Gambar samping dibatasi 60% lebar isi agar kolom teksnya tetap terbaca; ukuran di atasnya memindahkan gambar ke tengah. Dua gambar kecil yang sama-sama di kiri berjajar. Pada layar selebar 600 px atau kurang gambar samping tampil selebar isi, dan editor menjelaskannya ketika kertasnya sempit.
- Judul memulai bagian baru di bawah gambar samping, dan daftar di samping gambar menempati kolomnya sendiri agar tanda butirnya tidak tertutup gambar. Mengetik ketika gambar terpilih melanjutkan tulisan di bawah gambar, gambar baru disisipkan setelah gambar yang terpilih, dan gambar yang dilepas di tengah paragraf ditempatkan di batas paragraf terdekat, bukan memotong kalimat.
- Tautan hanya menerima alamat web http atau https dengan nama host lengkap. Alamat tanpa skema dilengkapi `https://`, dan penulis melihat alamat yang akan dipakai sebelum menyimpan. Tempelan dari dokumen lain diselaraskan dengan dua gaya judul, sedangkan gambar dari tempelan halaman web tidak ikut masuk.
- Penerima dihitung dari direktori Anggota kanonis melalui `NexusMemberSessionProvider`: anggota aktif dengan email institusi, atau email alternatif bila email institusi belum tercatat. Alamat yang sama hanya menerima satu email, sedangkan anggota cuti atau nonaktif tidak menerima. Data awal belum mencatat email anggota, sehingga halaman menyatakan 0 penerima dan menyediakan tautan **Lengkapi** ke profil anggota di halaman Anggota. Email yang dilengkapi di sana langsung mengubah jumlah penerima.
- Checklist & Validasi memeriksa lima syarat: judul email, isi pesan, tautan, deskripsi gambar, dan ketersediaan penerima. Setiap syarat yang belum terpenuhi menyediakan tindakan langsung menuju bagian yang perlu diperbaiki. Tampilan email untuk Desktop dan Ponsel dirender dari model dokumen yang sama dengan Markdown yang akan dikirim. Tidak ada cuplikan email kedua di samping penyusun karena kertas tulis dan Tampilan email sudah memperlihatkan email yang sama.
- Tinjau pengiriman membuka ringkasan judul, jumlah alamat penerima, pengirim, dan isi pesan. Layanan pengiriman email belum tersedia, sehingga tombol Kirim broadcast nonaktif dan halaman menyatakannya apa adanya; tidak ada pengiriman, status terkirim, maupun riwayat rekaan. Riwayat broadcast menampilkan keadaan kosong sampai layanan server mencatat pengiriman.
- Draf hanya berada di memori halaman dan tidak disimpan ke penyimpanan browser. Meninggalkan halaman dengan draf memakai penjaga perubahan bersama, dan Kosongkan draf meminta konfirmasi.

### Pengumpulan

- Menerima profil publik SINTA atau Google Scholar.
- Memvalidasi nama, protokol HTTPS, dan host sesuai sumber.
- Menampilkan perjalanan pekerjaan dari antrean hingga hasil tersedia.
- Menampilkan alasan kegagalan dan tindakan coba lagi tanpa mengarang hasil ketika layanan pengumpulan belum tersedia.
- Hasil pengumpulan selalu menjadi kandidat dan tidak pernah langsung mengubah data resmi. Satu pekerjaan yang menemukan enam karya menghasilkan enam rekam kandidat individual; pekerjaan hanya menjadi jejak sumbernya.
- Rekam hasil mempertahankan identitas pekerjaan, sumber, profil peneliti, pengaju, dan kandidat saat dibuka di Tinjauan pada sesi yang sama. Hubungan ke anggota hanya dipertahankan selama nama konteks, jenis sumber, dan pengenal orang pada URL profil masih sama dengan identitas akademik asal; perubahan salah satu unsur mengubah pekerjaan menjadi pengumpulan umum tanpa `memberId`.
- Riwayat pengumpulan menyediakan pencarian serta filter sumber dan status, memakai kontrol yang sama dengan Pustaka dokumen, sehingga tetap terpakai ketika jumlah pekerjaan bertambah.

### Tinjauan

- Menggunakan satu antrean keputusan untuk seluruh kandidat CoE BHT.
- Tab sumber dan opsi periode dibentuk dari data antrean yang tersedia. Contoh berbasis workbook mencakup publikasi, HKI, paten, kontrak, bimbingan, buku, dan proposal KM 2026.
- Filter tambahan mencakup status, jenis data, periode, dan urutan antrean.
- Jenis data mengikuti enam kelompok kerja: publikasi dan konferensi; riset dan bisnis; pengabdian masyarakat; HKI, paten, dan inovasi; akademik dan SDM; serta aktivitas dan tata kelola.
- Rincian kandidat menampilkan metadata sesuai jenis data, pemilik, pihak terkait, sumber, bukti, konteks evaluasi, dan riwayat audit.
- Satu pembanding dapat langsung menjadi target perbandingan. Jika pembanding lebih dari satu, tidak ada target yang dipilih otomatis; reviewer wajib menentukan rekam yang hendak dibandingkan.
- Identifier yang sama mencegah kandidat diterima sebagai data baru, tetapi tidak mengambil keputusan secara otomatis.
- Tindakan keputusan menyesuaikan tujuan kandidat: data baru, pembaruan rekam, atau pelengkapan metadata. Menghubungkan ke rekam resmi, menerima data baru ketika aman, menyetujui perubahan, menyetujui pelengkapan, meminta perbaikan, dan menolak tidak ditampilkan sebagai satu daftar generik.
- Rincian sumber menyediakan asal-usul data saat tersedia: pekerjaan, percobaan, pengolah, waktu pengambilan, kunci sumber, dan sidik respons. Nilai teknis yang belum dihasilkan layanan server ditampilkan sebagai belum tersedia, bukan dibuat-buat oleh frontend.
- Sistem sumber, pengaju manusia, penerima koreksi, pemilik, dan pihak utama dicatat terpisah. Permintaan perbaikan hanya dapat diarahkan kepada pengguna manusia ber-ID; akun layanan tetap menjadi jejak asal dan tidak menerima tugas koreksi.
- Identitas dan label KM-1 sampai KM-46 berada pada satu kamus yang diturunkan dari worksheet `List KM` workbook stakeholder. Rekam hanya merujuk indikator dari kamus tersebut dan dapat memiliki nol, satu, atau beberapa kaitan tanpa menggandakan data. Definisi, cara perhitungan, satuan, periode, target, dan realisasi dimodelkan pada Monitoring KM dan sudah dihitung untuk 28 indikator pada lima domain; angkanya dibaca melalui ikhtisar tiap domain. Kandidat yang klasifikasinya belum didukung bukti ditampilkan sebagai belum dikaitkan dengan indikator evaluasi.
- Bukti boleh memiliki rekam dan referensi tanpa URL. Dalam keadaan itu antarmuka menyatakan bahwa tautan bukti belum tersedia dan tidak mengarahkannya ke halaman umum yang bukan sumber bukti.
- Setiap keputusan membutuhkan alasan dan tahap konfirmasi sebelum disimpan pada state frontend. Riwayat menyimpan ID pelaku, jenis keputusan, sasaran rekam, bidang yang diminta untuk diperbaiki, alasan, versi, perubahan sebelum–sesudah, serta instant ISO yang baru diformat ke WIB ketika ditampilkan.
- Aktor manusia pada Tinjauan berasal dari Account sesi yang sama dengan Header dan Profil Saya. ID aktor tetap ID Account yang stabil, sedangkan label pada keputusan atau riwayat baru disimpan sebagai snapshot presentasi saat tindakan dibuat. Perubahan Profil tidak menulis ulang label historis dan tidak membentuk identitas manusia kedua.
- Kemampuan meninjau dan mengirim koreksi disediakan melalui kontrak sesi serta dihitung per rekam. Identitas pelaku yang tidak diketahui menutup tindakan secara aman; nama tampilan tidak pernah dipakai sebagai identitas otorisasi. Karena tim CoE BHT saat ini dijalankan satu sampai dua auditor, pengirim boleh memutuskan kandidatnya sendiri; panel keputusan menyatakannya dan keputusan tercatat sebagai persetujuan mandiri pada riwayat. Kebijakan ini satu pengaturan sehingga dapat dikembalikan ke dua pemeriksa berbeda. Koreksi hanya dapat dikirim oleh penerima ber-ID yang ditetapkan. Otorisasi sebenarnya tetap menjadi tanggung jawab layanan server.
- Versi hasil pencocokan dicatat terpisah dari versi kandidat. Setelah koreksi dikirim sebagai V2, hasil V1 tidak pernah dipakai ulang; adapter menghitung ulang pembanding dari seluruh registry Data Resmi dan mengikat hasil baru pada versi kandidat yang sama. Promosi tetap terkunci bila hasil pencocokan terbaru belum tersedia, sedangkan riwayat koreksi tetap dipertahankan.
- Persetujuan pelengkapan metadata langsung tercermin pada rumah data resmi selama sesi frontend. Status penyelesaian membedakan tersedia, memang tidak tersedia, tidak berlaku, dan belum selesai. Kandidat manual, workbook, dokumen, SINTA, atau Google Scholar yang diterima sebagai data baru, diperbarui, atau dihubungkan diproyeksikan ke rumah Data Resmi yang sesuai bersama sumber dan jejak keputusan. Untuk rekam multi-orang, reviewer memilih orang kandidat yang mewakili anggota dan memetakan setiap orang kandidat ke ID orang resmi atau menyatakannya sebagai orang baru; pembaruan tidak menebak relasi dari nama maupun urutan dan mempertahankan ID serta `memberId` coauthor lain. Status KM `undetermined` mempertahankan kaitan lama, sedangkan `removed` menghapusnya secara eksplisit. Internal ID proyeksi memakai domain, sumber, dan ID kandidat lengkap agar dua kandidat dengan suffix yang sama tidak bertabrakan. Layanan server nantinya mengganti adapter sesi ini sebagai sumber otoritatif.
- Usulan pelengkapan yang sudah terminal tidak menutup pekerjaan berikutnya. Jika proyeksi keputusan masih menyisakan bidang wajib—misalnya kuartil setelah jenis berubah menjadi artikel jurnal—pengguna dapat membuat usulan lanjutan khusus untuk bidang tersisa tanpa menghapus riwayat usulan sebelumnya.
- Tautan rekam sesi yang sudah tidak tersedia menampilkan penjelasan dan jalan kembali ke antrean, bukan halaman kosong atau drawer tanpa isi.
- Drawer rincian dimuat ketika diperlukan agar halaman antrean tetap ringan.

### Pengajuan manual lintas-domain

- Setiap rumah Data Resmi menyediakan aksi kontekstual `Ajukan …` yang membuka halaman form penuh, bukan drawer, untuk Publikasi, Kekayaan Intelektual, Kontrak & Proposal, Akademik, serta Kegiatan & Pengabdian.
- Kelima route memakai satu model dan presentasi bersama. Jenis rekam mengubah metadata yang relevan tanpa membuat implementasi form terpisah per domain. Bidang subtype mengikuti worksheet KM terkait; kontrak, proposal, jurnal, kegiatan, paten, dan magang tidak memakai skema generik yang sama.
- Struktur halaman mengikuti empat seksi bernomor—informasi, pelaku dan keterlibatan BHT, sumber dan bukti, serta keterkaitan evaluasi—dengan ringkasan kelengkapan di kanan dan action bar tetap di bawah. Pada layar sempit seluruh isi menjadi satu kolom tanpa gulir horizontal.
- Bukti utama dimasukkan sebagai tautan Drive, DOI, repositori, atau laman resmi yang dapat dibuka reviewer. Form ini tidak membuat unggahan baru ketika tautan sudah memadai.
- Pengaju memilih jenis rekam dan metadata, bukan indikator KM. Sistem dapat menyarankan nol atau satu indikator berdasarkan metadata; saran selalu diberi label menunggu verifikasi reviewer dan ketiadaan saran tidak menghalangi pengiriman. Untuk setiap kandidat non-metadata-completion, baik dari pengajuan manual, workbook, maupun dokumen, reviewer wajib mengonfirmasi, mengubah, menghapus, atau menandai keterkaitannya belum dapat ditentukan sebelum menerima kandidat. Hasil verifikasi reviewer dapat berisi nol, satu, atau beberapa indikator KM; pilihan yang ditawarkan adalah indikator yang realisasinya dibentuk dari rumah data kandidat serta indikator yang belum dipantau, karena kaitan lintas rumah data tidak pernah dapat dihitung. Form juga menyediakan bidang opsional Triwulan dilaporkan untuk rekam yang tanggalnya belum diketahui; kontrak riset nasional dan internasional kini dapat mencatat tanggal mulai kontrak, dan tanggal publikasi jurnal nasional terbawa ke tanggal terbit rekam resmi.
- Kandidat manual masuk ke sesi Tinjauan yang sama, membawa URL bukti, provenance manual, saran KM bila tersedia, serta hasil pencocokan terhadap Data Resmi. DOI, nomor pencatatan, ISSN, nomor kontrak, dan pengenal stabil lain diperiksa sebelum kemiripan judul. NIM tidak diperlakukan sebagai bukti duplikat karena seorang mahasiswa dapat memiliki lebih dari satu kegiatan; kecocokan tetap berupa sinyal awal dan tidak mengambil keputusan otomatis.
- Setelah pengiriman, halaman menampilkan receipt yang dapat disalin atau di-screenshot: kode dan waktu pengajuan, tiga tahap tindak lanjut, serta ringkasan judul, jenis, periode, pengaju, bukti HTTPS, dan saran KM. Pencarian Tinjauan menerima judul maupun kode pengajuan.
- Isian disimpan otomatis per rumah data pada penyimpanan sesi browser dan dipulihkan setelah muat ulang pada tab yang sama; `Simpan draft` tetap tersedia untuk menyimpan seketika. Mengganti subtype hanya mempertahankan bidang yang nama dan tipe semantiknya sama, sedangkan perubahan yang belum sempat tersimpan tetap dilindungi ketika tab ditutup.
- Setelah koreksi dikirim ulang, pencocokan dihitung ulang terhadap kandidat Data Resmi yang tersedia sehingga skor versi lama tidak menjadi jalan buntu. Rekam manual yang baru disetujui juga ikut menjadi pembanding pada pengajuan berikutnya dalam sesi yang sama.

### Publikasi

- Memuat seluruh publikasi resmi CoE BHT tanpa diseleksi lebih dulu. Indikator KM dan kuartil dipakai untuk pelaporan, bukan sebagai syarat sebuah karya tercatat sebagai data resmi.
- Kaitan indikator KM bersifat nol sampai banyak. Publikasi tetap sah walaupun belum dikaitkan dengan indikator mana pun.
- Jenis karya merupakan metadata bibliografis tersendiri dan tidak diturunkan dari indikator KM. Karya yang bentuknya belum dapat dipastikan dari sumbernya ditandai belum diklasifikasikan dan dihitung sebagai metadata yang belum selesai.
- Kuartil hanya berlaku untuk artikel jurnal. Nilai yang tercatat pada sumber untuk bentuk karya lain tetap disimpan apa adanya dan dinyatakan sebagai nilai sumber, bukan kuartil jurnal yang sudah terverifikasi.
- Tahun terbit dipisahkan dari periode evaluasi KM. Sumber yang tidak mencatat tahun terbit dibiarkan kosong dan masuk sebagai pekerjaan pelengkapan.
- Penulis dicatat sebagai daftar penulis, bukan sebagai pemilik data. Kepemilikan data ditetapkan oleh pengaturan peran di server.
- Asal-usul data menunjuk baris sumbernya secara persis, misalnya sel dan rentang pada worksheet workbook. Beberapa baris sumber yang setelah pemeriksaan dinilai sebagai karya yang sama menghasilkan satu rekam resmi dengan seluruh jejak sumbernya tetap tersimpan, termasuk catatan perbedaannya.
- Nilai sumber yang saling bertentangan atau tautannya meragukan tidak dinaikkan menjadi bukti kanonis; perbedaannya dicatat agar dapat diperiksa manusia.
- Sitasi diperlakukan sebagai metrik luar yang terpisah dari sumber pembentuk metadata, boleh kosong, dan tidak menentukan kelengkapan metadata.
- Bidang resmi yang masih kosong dapat menerima usulan nilai, pernyataan tidak tersedia, atau pernyataan tidak berlaku. Judul, tahun terbit, jenis karya, dan kuartil yang memang sedang diperiksa pada artikel jurnal tidak menyediakan pilihan tidak berlaku. Perubahan jenis menjadi Artikel Jurnal menghitung ulang kebutuhan kuartil sebelum rekam dapat dinyatakan lengkap.
- Usulan tidak langsung mengubah rekam resmi dan selalu diteruskan ke Tinjauan beserta kaitan indikator KM-nya.
- Setelah dikirim, usulan tersedia sebagai kandidat pelengkapan metadata pada Tinjauan di sesi yang sama.
- Status usulan pada halaman asal mengikuti keputusan sesi Tinjauan yang sama, sehingga permintaan perbaikan atau hasil akhir tidak kembali ditampilkan sebagai masih menunggu.

### Kekayaan Intelektual

- Rumah data resmi untuk hak cipta dan paten yang sudah lolos Tinjauan (KM-15 dan KM-16).
- Bentuk perlindungan merupakan metadata rekam tersendiri dan tidak diturunkan dari indikator KM, karena paten juga termasuk kekayaan intelektual.
- Nomor pencatatan ditandai sebagai bidang yang belum selesai ketika sumber belum mencatatnya, sesuai definisi indikator yang baru menghitung pengajuan setelah memperoleh nomor registrasi.
- Dokumen pendaftaran membedakan tiga keadaan: tersedia publik, tersimpan pada penyimpanan internal, dan belum tercatat. Dokumen internal bukan metadata yang hilang sehingga tidak ditandai perlu dilengkapi.
- Baris sumber yang menduplikasi rekam yang sama digabungkan menjadi satu data resmi dengan seluruh jejak sumbernya tetap tersimpan, agar satu pengajuan tidak terhitung dua kali.
- Periode evaluasi disimpan terpisah dari tahun atau tanggal HKI. Tanggal penuh wajib untuk paten; HKI non-paten dapat memakai tahun pencatatan ketika tanggal persis tidak tersedia. Form mencegah tahun/tanggal yang bertentangan dengan periode evaluasi.
- Usulan pelengkapan memakai alur yang sama dengan Publikasi dan selalu diteruskan ke Tinjauan beserta kaitan indikator KM-nya.

### Kontrak & Proposal

- Rumah data resmi menggabungkan pencarian kontrak dan proposal tanpa mencampur maknanya: proposal tetap berstatus pengajuan, sedangkan kontrak menyatakan hubungan yang sudah terbentuk.
- Cakupan indikator saat ini adalah kontrak riset nasional, kontrak riset internasional, kontrak bisnis komersialisasi, proposal riset nasional, proposal riset internasional, dan proposal non-riset (KM-17–KM-19 serta KM-37–KM-39).
- Bidang mengikuti kebutuhan workbook per jenis rekam. Kontrak riset KM-17/KM-18 memakai judul, nama atau unit terkait, skema, dan bukti; proposal riset KM-37/KM-38 memakai pengusul, skema/program hibah, mitra, instansi pemberi hibah, dan bukti submit. Kontrak bisnis KM-19 memakai pihak kontrak dan masa berlaku, sedangkan KM-39 memakai skema proposal non-riset minimal yang tidak memaksa instansi pemberi hibah ketika belum ditentukan.
- Contoh operasional memakai identitas netral dan tidak memasukkan judul, mitra, pihak kontrak, atau tautan penyimpanan privat dari workbook internal ke repository publik.
- Bukti internal dibedakan dari bukti yang belum tercatat. Pelengkapan bidang yang benar-benar kosong diteruskan ke antrean Tinjauan pada kategori Riset & bisnis.

### Akademik

- Rumah data resmi untuk bimbingan doktor, bimbingan magister, magang mahasiswa, riset tugas akhir, dan kompetisi mahasiswa yang sudah lolos Tinjauan (KM-28 sampai KM-32).
- Bentuk kegiatan merupakan metadata rekam tersendiri dan tidak diturunkan dari indikator KM. Buku (KM-33) berkategori Akademik pada kamus KM, tetapi rekamnya tetap berada di Publikasi karena bentuknya karya terbit.
- Baris bimbingan dengan promotor dan ko-promotor untuk mahasiswa serta topik yang sama digabungkan menjadi satu kegiatan resmi, agar satu bimbingan tidak terhitung dua kali.
- Data pengembangan memakai penanda mahasiswa, pembimbing, dan topik yang netral. Identitas lengkap nantinya mengikuti hak akses serta payload dari layanan server, bukan ditanamkan di frontend publik.
- Bukti membedakan keadaan tersimpan internal dan belum tercatat. URL penyimpanan privat tidak dimasukkan ke repository; bukti yang benar-benar belum tercatat tetap menjadi pekerjaan pelengkapan.
- Kartu Indikator Terisi menyatakan berapa indikator akademik yang sudah mempunyai rekam, sehingga indikator yang belum mempunyai satu pun baris kegiatan tidak hilang dari pandangan.
- Baris magang diperlakukan sebagai bukti operasional peserta. Nilai KM-30 tetap bermakna kapasitas atau daya tampung magang dan tidak dihitung dari jumlah peserta aktif pada adapter frontend.
- Tahun dan lama kegiatan hanya menjadi bidang wajib pada rekam magang; bimbingan doktor dan magister mengikuti kolom sumber tanpa mengarang kekosongan tahun.
- Usulan pelengkapan memakai alur yang sama dengan Publikasi dan diteruskan ke Tinjauan pada kategori Akademik & SDM.

### Kegiatan & Pengabdian

- Rumah data resmi untuk pembicara dan kunjungan internasional (KM-9–KM-10), keterlibatan unit bisnis, pembinaan UMKM atau komunitas, pengelolaan konferensi internasional, kontrak non-riset, community services, proposal pengabdian, kegiatan pengabdian, dan pengelolaan jurnal nasional (KM-20–KM-27).
- Setiap indikator mempertahankan bentuk kegiatan serta bidangnya sendiri. Rekam bisnis, komunitas, konferensi, layanan non-riset, pengabdian, proposal, dan jurnal tidak dilebur menjadi satu skema kegiatan generik.
- Bidang mengikuti kebutuhan worksheet sumber: pihak utama, unit bisnis atau komunitas, tanggal dan tempat acara, skema, tim pelaksana, masyarakat sasaran, dana, serta metadata jurnal sesuai jenis rekamnya.
- Contoh operasional memakai identitas, judul, organisasi, dan nilai dana yang netral. Keberadaan bukti internal boleh dicatat, tetapi URL penyimpanan privat dan rincian operasional stakeholder tidak dimasukkan ke repository publik.
- Bukti internal dibedakan dari bukti yang belum tercatat. Bidang yang benar-benar kosong dapat dilengkapi melalui formulir bersama dan diteruskan ke Tinjauan pada kategori Bisnis atau Pengabdian masyarakat tanpa langsung mengubah data resmi.
- Tabel desktop berubah menjadi kartu dua kolom pada layar tablet dan satu kolom pada ponsel agar label, metadata, status, serta aksi tetap terbaca tanpa gulir horizontal.

### Dokumen

- Pustaka menerima PDF atau DOCX hingga 25 MB pada sesi frontend.
- Pustaka membedakan antrean, pemrosesan, selesai, dan gagal; rekam gagal menampilkan alasan serta tindakan coba lagi.
- Dokumen dipisahkan dari job pemrosesan dan daftar percobaannya. Tindakan `Ajukan proses baru` membuat job, correlation ID, waktu pengajuan, dan percobaan awal baru, sementara job gagal sebelumnya tetap berada dalam riwayat.
- Tanya jawab hanya menampilkan jawaban ketika bukti dan kutipan tersedia.
- Pustaka membawa identitas dokumen melalui URL saat pengguna berpindah ke Tanya jawab atau Ekstraksi; hanya dokumen selesai diproses dengan kemampuan yang sesuai yang dapat dipakai.
- Tanya jawab menerapkan cakupan dokumen yang dipilih dan hanya mengutip sumber yang mendukung pertanyaan. Riwayat awal juga mengikuti dokumen pada URL sehingga pertanyaan dari dokumen lain tidak muncul dalam cakupan khusus.
- Ekstraksi memperlihatkan kandidat per bidang dan memakai satu profil yang benar-benar tersedia. Render, hitungan, kesiapan kirim, kandidat, dan bukti semuanya berasal dari `fieldIds` profil yang sama. Parameter dokumen yang tidak valid ditolak secara jelas dan tidak diam-diam diganti dengan dokumen lain.
- Ekstraksi tanpa parameter dokumen tidak memilih dokumen mana pun. Halaman menampilkan keadaan awal beserta pemilih dokumen, sedangkan jalur dari tombol `Ekstrak` di Pustaka tetap langsung membuka dokumen tersebut.
- Setelah kandidat dikirim, pengguna dapat memilih tetap berada di Ekstraksi atau langsung membuka Tinjauan. Pilihan tersebut diingat, dan kandidat selalu masuk antrean Tinjauan pada kedua pilihan.
- Seluruh bidang pada profil aktif harus diputuskan dan minimal satu bidang harus disertakan sebelum hasil beserta kutipannya dibuat sebagai rekam Tinjauan. Identitas kandidat diturunkan dari dokumen, profil, versi profil, dan extraction run sehingga pengiriman ulang hasil yang sama membuka kandidat lama dan tidak membuat duplikat.
- Pustaka, Tanya jawab, dan Ekstraksi tetap berada dalam satu ruang kerja Dokumen.

### Anggota

- Direktori menempatkan penambahan anggota, pencarian, filter status, filter penugasan CoE, daftar anggota, pagination, dan rincian profil dalam satu alur master–detail. Anggota baru dicatat melalui drawer pada halaman yang sama dan langsung menjadi profil terpilih; direktori yang benar-benar kosong tetap menyediakan tindakan penambahan pertama tanpa mencoba membuka profil yang tidak ada. Saat pencarian atau filter mengeluarkan profil terpilih dari hasil, rincian mengikuti hasil pertama sehingga daftar dan detail tidak pernah menunjuk dua konteks berbeda. Pada ponsel, daftar dan rincian menjadi dua keadaan berurutan dengan tindakan kembali yang jelas. Tombol, bidang form, select, drawer, dan pagination memakai komponen workspace bersama yang sama dengan alur Nexus lain.
- Rincian memisahkan profil, keanggotaan CoE, identitas akademik, data terkait, dan hubungan akun BHT Nexus. Atribut yang belum mempunyai sumber resmi dinyatakan belum tercatat dan tidak diisi dengan identitas personal rekaan.
- Data yang telah dipublikasikan pada halaman institusional dipakai kembali sebagai sumber presentasi. Foto dan identitas nyata tidak digunakan untuk skenario keanggotaan nonaktif atau keadaan privat yang belum dapat diverifikasi.
- Identitas anggota awal berasal dari satu definisi kanonis yang menulis ID secara eksplisit. Sumber konten publik, direktori Anggota, dan alias adapter memakai definisi yang sama; perubahan gelar atau nama tampilan tidak membentuk ID baru, sedangkan pencocokan alias tidak dipakai sebagai keputusan relasi runtime.
- Penambahan serta perubahan identitas, status keanggotaan, penugasan CoE, unit, dan visibilitas diterapkan pada state frontend selama halaman aktif. Form tambah dan ubah memakai editor bersama, menerima anggota tanpa email, menampilkan kesalahan tepat pada bidangnya, meminta konfirmasi sebelum perubahan yang belum disimpan dibuang, serta memvalidasi dan mencegah duplikasi SINTA ID, ORCID iD, Google Scholar, Scopus Author ID, dan ResearcherID. Foto profil dapat dipilih atau diseret ke area unggah, lalu diposisikan melalui editor khusus dengan seret, zoom, putar, dan pratinjau lingkaran. Foto sumber disimpan terpisah dari hasil potong agar penyuntingan berikutnya selalu dapat dimulai kembali dari gambar asli; avatar inisial tetap menjadi fallback. Bentuk data anggota dipisahkan dari presentasi agar layanan server dapat menggantinya tanpa mengubah struktur halaman.
- Anggota, akun login, serta role/permission merupakan tiga konsep terpisah. Anggota boleh belum mempunyai akun, sedangkan akun operator, administrator, reviewer, atau intern boleh ada tanpa menjadi anggota dan tidak otomatis muncul di direktori. Proyeksi akses membedakan `NONE`, `LINKED`, dan `CONFLICT`; konflik tidak disebut tidak memiliki akses dan tidak menawarkan undangan baru. Pemberian akses dimulai dari profil yang dipilih lalu membuka satu alur undangan milik Administrasi dengan ID anggota sudah terisi; halaman Anggota tidak membuat akun kedua atau menebak hubungan dari email. Profil yang sudah mempunyai akun menyediakan tindakan Kelola akun yang membuka rincian akun yang tepat di Administrasi, sedangkan konflik membuka salah satu akun terkait untuk ditinjau tanpa memilih hubungan yang dianggap benar.
- Tombol Pengumpulan pada Identitas Akademik membawa ID anggota, nama, sumber, URL profil, dan pengenal orang eksternal ke halaman Pengumpulan. Binding pekerjaan hanya aktif selama seluruh identitas sumber tersebut masih sesuai. Kandidat multi-orang membawa relasi eksplisit ke satu person ID kandidat; correction yang mengubah daftar atau urutan orang membatalkan relasi lama dan mewajibkan pilihan ulang pada Tinjauan. Penulis, pencipta, serta pembimbing mempunyai ID rekam masing-masing dan `memberId` opsional; nama tidak dipakai sebagai keputusan identitas sistem.
- Jalur Data Terkait membuka lima rumah data resmi dengan parameter ID anggota. Publikasi, Kekayaan Intelektual, Kontrak & Proposal, Akademik, serta Kegiatan & Pengabdian membaca parameter tersebut, menampilkan konteks anggota, dan memfilter relasi kanonis alih-alih membuka seluruh katalog.

- Direktori Anggota masih memakai data contoh adapter frontend. Karena ID anggota contoh bukan ID layanan, tindakan pemberian dan pengelolaan akun dari halaman Anggota dimatikan sampai layanan Anggota dihubungkan; pengelolaan akun dilakukan dari Administrasi.

### Profil Saya

- `/nexus/profil` menampilkan akun yang benar-benar sedang masuk, dibaca dari layanan server. Halaman ini tidak mempunyai butir navigasi utama dan dibuka dari menu pengguna di kanan atas.
- Informasi pribadi—nama lengkap, nomor HP, dan ringkasan profil—milik akun dan disimpan ke layanan melalui pop-up Ubah informasi pribadi. Setelah tersimpan, header dan halaman memuat ulang identitas dari layanan.
- Email masuk, peran, status akun, verifikasi email, dan hubungan anggota hanya dibaca; keempatnya dikelola melalui Administrasi. Akun tanpa peran, dan akun yang perannya belum membuka halaman kerja apa pun, mendapat pemberitahuan yang menjelaskan keadaannya beserta pihak yang dapat membantu.
- Ketika akun terhubung ke anggota, halaman menampilkan kartu Keanggotaan & Klaster (nama anggota, status keanggotaan, klaster riset, bergabung sejak, dan visibilitas profil publik) serta Identitas Akademik. SINTA ID, Scopus Author ID, dan Google Scholar ID disimpan pada rekam anggota tersebut; SINTA dan Scopus hanya berisi angka, dan Google Scholar ID ditampilkan sebagai tautan profil publiknya. Akun tanpa anggota tidak menerima bagian anggota kosong.
- Kartu Keamanan menyediakan Ubah kata sandi: kata sandi saat ini, kata sandi baru minimal 8 karakter, dan konfirmasinya. Penggantian yang berhasil mengakhiri sesi pada perangkat lain dan tetap mempertahankan sesi di perangkat yang sedang dipakai.
- Kelengkapan profil mensyaratkan nama lengkap dan nomor HP; pemberitahuan menyebut bidang yang belum diisi beserta tindakan untuk melengkapinya.
- Formulir menampilkan kesalahan tepat pada bidangnya, dan pop-up yang masih memuat perubahan belum tersimpan dijaga dari muat ulang atau perpindahan halaman. Batal atau Escape menutup pop-up tanpa menyimpan.
- Foto profil, nama panggilan, email alternatif, dan bidang keahlian belum dapat diubah dari Profil Saya karena unggah media dan kontrak penyimpanan bidang tersebut belum tersedia. MFA, daftar perangkat, dan penghapusan akun sendiri juga belum tersedia.

### Administrasi — Accounts & Access

- `/nexus/administrasi` membaca daftar akun, peran yang dapat ditetapkan, dan profil anggota yang dapat ditautkan dari layanan server. Tiga metrik—total akun, akun aktif, dan akun yang menunggu aktivasi—dihitung dari daftar tersebut. Pencarian nama atau email, filter status, peran, dan hubungan anggota, daftar desktop, kartu mobile, pagination, serta rincian akun tetap berada pada satu route.
- Undangan akun memakai empat langkah: email dan nama tampilan opsional, pilihan eksplisit apakah akun terhubung ke anggota, peran, serta tinjauan akhir. Admin tidak menetapkan kata sandi. Layanan membuat akun berstatus Menunggu aktivasi dan mengirim email sambutan yang mengarahkan pemiliknya ke Aktifkan akun. Email yang sudah dipakai ditolak sebelum dikirim, dan penolakan dari server tetap ditampilkan pada langkah tinjauan tanpa menutup drawer.
- Rincian akun memisahkan informasi akun (email baca-saja, waktu dibuat, status aktivasi), ringkasan profil yang dikelola pemiliknya, hubungan anggota, dan peran. Hubungan anggota dapat ditautkan ke satu profil anggota yang belum mempunyai akun atau ditetapkan sebagai akun non-anggota. Peran baru menggantikan peran sebelumnya.
- Status akun memakai tiga nilai layanan: Aktif, Menunggu aktivasi, dan Ditangguhkan. Menangguhkan akses meminta konfirmasi dan langsung mengakhiri seluruh sesi akun tersebut; akun yang ditangguhkan tidak dapat masuk sampai dipulihkan.
- Akun milik pengguna yang sedang masuk tidak menawarkan perubahan peran maupun status. Server juga menolak perubahan peran akun sendiri dan pencabutan peran dari akun terakhir yang masih dapat mengelola peran.
- Setiap tindakan menunggu jawaban server sebelum daftar dimuat ulang. Konflik, ketiadaan izin, akun yang tidak ditemukan, data yang ditolak, batas percobaan, dan layanan yang tidak dapat dihubungi mempunyai pesan sendiri; halaman yang gagal dimuat menyediakan Coba lagi.
- Pembatalan atau pembaruan undangan, keadaan hubungan yang belum diputuskan atau bertentangan, serta log audit belum tersedia karena layanan belum menyediakan kontraknya.

### Peran, hak akses, dan akses khusus

- Halaman Peran (`/nexus/administrasi/peran`) dan Akses Khusus (`/nexus/administrasi/akses`) masih merupakan rancangan kebijakan akses dengan data contoh. Keduanya menampilkan pemberitahuan tersebut di bagian atas, tidak memuat akun nyata, dan tidak mengubah akses siapa pun. Akses efektif akun nyata dibaca dari layanan server.
- Satu kebijakan akses kanonis berada di `nexus-access-policy`. Modul tersebut memiliki katalog izin, direktori peran, hak akses bawaan tiap peran, serta penyesuaian akses per akun; `NexusAccessPolicySessionProvider` membagikannya ke Administrasi, Anggota, halaman peran, dan halaman akses khusus sehingga tidak ada daftar peran atau daftar izin kedua.
- Katalog izin disusun dari modul ruang kerja yang benar-benar ada dan dari kosakata izin pada REQ-FUNC-019: lihat, tambah, ubah, tinjau, setujui, dan kelola. Kombinasi modul dan tindakan yang tidak berlaku ditandai tidak tersedia, bukan izin nonaktif, supaya tidak ada kendali yang bisa dinyalakan tanpa fungsi yang mendasarinya. Izin ekspor belum dimasukkan karena ruang kerja belum mempunyai fungsi ekspor.
- Hak akses bawaan tiap peran bersifat konservatif dan dapat disetel administrator. Peran bawaan BHT Nexus dapat dipulihkan ke bawaannya, tidak dapat dihapus, dan hanya nama tampilan, deskripsi, serta hak aksesnya yang dapat diubah. Peran kustom dapat dibuat, disalin, diubah, dinonaktifkan ketika tidak lagi dipakai akun mana pun, lalu diaktifkan kembali.
- Halaman `/nexus/administrasi/peran` menempatkan daftar peran, pencarian peran, matriks hak akses, daftar akun pemakai peran, dan informasi peran pada satu ruang kerja. Menyimpan perubahan izin pada peran yang sedang dipakai meminta konfirmasi yang menyebut jumlah akun terdampak, lalu melaporkan jumlah izin yang ditambahkan dan dicabut. Memulihkan peran bawaan juga menyebut jumlah akun yang memakainya ketika memang ada, tanpa menambah kalimat kosong saat peran belum dipakai siapa pun; penyesuaian khusus akun serta perubahan nama dan deskripsi yang belum disimpan tetap dipertahankan. Pengelolaan siklus peran dan penyetelan hak aksesnya merupakan dua kemampuan terpisah, dan salah satunya sudah cukup untuk membuka halaman ini—baik melalui pintu masuk di Administrasi maupun melalui alamatnya langsung.
- Halaman `/nexus/administrasi/akses` mengelola penyesuaian satu akun. Penyesuaian memakai tiga keadaan eksplisit: mengikuti peran, tambahan, dan dibatasi. Setiap izin ditulis pada satu baris berisi hak akses bawaan peran, kendali penyesuaian, dan hasil akhirnya sehingga administrator tidak perlu menghitung sendiri. Ringkasan akses, saringan Semua/Penyesuaian/Aktif/Nonaktif, dan bagian modul yang dapat dibuka-tutup menjaga daftar tetap ringkas, sedangkan baris aksi menempel di bawah layar. Penyesuaian melekat pada akun, bukan pada profil anggota, sehingga akun non-anggota pun dapat memilikinya.
- Mengubah peran akun tidak menghapus penyesuaian yang sudah ada; editor akses menyatakan bahwa penyesuaian tetap tersimpan dan dihitung ulang terhadap peran baru. Peran yang tidak dikenali, belum ditetapkan, atau sudah nonaktif tidak menjadi dasar izin efektif. Dalam keadaan tersebut penyesuaian tetap terlihat tetapi tidak dapat diubah, hasil akhir ditandai belum dapat dihitung, dan administrator diarahkan untuk menetapkan peran aktif lebih dahulu. Tindakan pada halaman ini mengikuti kewenangan yang benar-benar dimiliki: ajakan menetapkan peran hanya muncul bagi pengelola akun, dan tautan ke hak akses peran hanya muncul ketika halaman peran memang dapat dibuka. Ketika salah satunya tidak tersedia, identitas peran serta penjelasan keadaannya tetap ditampilkan dan diganti keterangan yang menyebut siapa yang dapat menindaklanjuti.
- Matriks hak akses hanya menggambarkan peran dan tindakan. Izin terhadap data tertentu, penegakan otorisasi, penyimpanan, dan audit tetap menjadi tanggung jawab layanan server.

- Direktori akun contoh untuk halaman rancangan tersebut bersifat netral dan tidak menghubungkan akun, email masuk, peran, status, hubungan, atau riwayat akses privat rekaan ke identitas anggota publik. Perubahan pada halaman rancangan ditolak dengan pesan bahwa rancangan tidak mengubah akun sebenarnya. Perubahan yang belum disimpan pada matriks peran, akses khusus, form peran, editor peran akun, draf undangan, dan editor hubungan anggota memakai satu penjaga bersama: navigasi yang dikendalikan ruang kerja meminta konfirmasi produk, sedangkan muat ulang atau penutupan tab memakai mekanisme standar browser. Drawer tetap memakai dialog lokalnya sendiri untuk tombol tutup, Batal, backdrop, dan Escape sehingga tidak pernah muncul dua konfirmasi untuk satu tindakan.

## Route utama

| Route | Cakupan |
|---|---|
| `/` dan `/en` | Landing page Indonesia dan Inggris |
| `/anggota` dan `/en/members` | Profil ketua dan tim pengurus |
| `/nexus/masuk` dan `/en/nexus/sign-in` | Masuk dengan layanan server, termasuk verifikasi email |
| `/nexus/aktivasi` dan `/en/nexus/activate` | Aktivasi akun undangan: kode verifikasi lalu kata sandi baru |
| `/nexus/lupa-kata-sandi` dan `/en/nexus/forgot-password` | Pemulihan kata sandi dengan kode verifikasi |
| `/nexus/dashboard` | Dashboard ruang kerja; tidak ditampilkan pada navigasi sampai isinya matang |
| `/nexus/monitoring` | Kategori indikator KM dan keadaan pemantauannya |
| `/nexus/monitoring/[domain]` | Monitoring KM dengan satu domain aktif sejak awal |
| `/nexus/monitoring/[domain]/[indikator]` | Rincian indikator, target dan realisasi, TW1–TW4, rumus, serta rekam dan eviden pembentuk |
| `/nexus/broadcast` | Penyusunan broadcast email untuk anggota aktif, penerima, checklist, dan tampilan email |
| `/nexus/pengumpulan` | Pengumpulan sumber publik |
| `/nexus/tinjauan` | Tinjauan kandidat sebelum menjadi data resmi |
| `/nexus/ajukan/[domain]` | Form pengajuan manual penuh untuk lima rumah Data Resmi |
| `/nexus/publikasi` | Daftar dan rincian publikasi resmi |
| `/nexus/kekayaan-intelektual` | Daftar dan rincian hak cipta serta paten resmi |
| `/nexus/kontrak-proposal` | Daftar dan rincian kontrak serta proposal resmi |
| `/nexus/akademik` | Daftar dan rincian bimbingan serta magang mahasiswa resmi |
| `/nexus/kegiatan` | Daftar dan rincian kegiatan, bisnis, serta pengabdian masyarakat resmi |
| `/nexus/anggota` | Direktori dan rincian identitas anggota CoE BHT |
| `/nexus/profil` | Profil pribadi akun yang sedang masuk |
| `/nexus/administrasi` | Accounts & Access untuk akun, hubungan anggota opsional, peran, undangan, dan status akses |
| `/nexus/administrasi/peran` | Rancangan peran, hak akses bawaan, akun pemakai peran, dan informasi peran (data contoh) |
| `/nexus/administrasi/akses` | Rancangan akses khusus satu akun terhadap hak akses bawaan perannya (data contoh) |
| `/nexus/dokumen` | Pustaka dokumen |
| `/nexus/tanya-dokumen` | Tanya jawab bersitasi |
| `/nexus/ekstraksi` | Ekstraksi kandidat dari dokumen |
| `/en/nexus/coming-soon` | Status pembangunan seluruh ruang kerja Inggris |
| `/nexus` dan `/en/nexus` | Pengarah ke halaman kerja pertama yang diizinkan akun, atau ke halaman masuk bila belum masuk |
| `/nexus/pencarian` dan `/nexus/kandidat` | Alamat lama; diarahkan ke Pengumpulan atau Tinjauan yang sesuai |

Route workspace Inggris yang pernah tersedia tetap dipertahankan sebagai pengarah ke halaman status tersebut agar tautan lama tidak buntu dan tidak menampilkan alur terjemahan yang baru selesai sebagian.

## Batas implementasi

Hal-hal berikut belum menjadi kemampuan produksi pada repository web:

- MFA/2FA;
- penyimpanan keputusan dan audit permanen untuk modul selain akun;
- unggahan permanen, termasuk foto profil;
- pekerjaan pengumpulan dan pemrosesan dokumen di server;
- indeks pencarian dokumen;
- promosi kandidat menjadi data resmi;
- agregasi, snapshot, dan penjadwalan perhitungan indikator di server;
- pengiriman email broadcast, unggah gambarnya, dan riwayat pengiriman;
- data klaster pada modul kerja (Monitoring, Tinjauan, Data Resmi) untuk Ketua Klaster;
- integrasi layanan server untuk Anggota, Tinjauan, Data Resmi, Monitoring, Pengumpulan, Dokumen, dan Broadcast;
- deployment produksi final.

Adapter akses frontend menjadi satu sumber untuk navigasi, pencarian, direct-route state, dan kemampuan Tinjauan, dan kini diisi izin efektif akun dari layanan server. Pemeriksaan di browser hanya membentuk perilaku antarmuka; penegakan keamanan tetap milik server. Aktor keputusan baru di Tinjauan adalah akun yang sedang masuk, sedangkan riwayat contoh pada antrean memakai pemeriksa contoh yang netral.

Memuat ulang penuh layout ruang kerja akan mengembalikan kandidat, keputusan, dan proyeksi Data Resmi lokal ke kondisi awal. Draft pengajuan manual tetap dipulihkan dari penyimpanan sesi pada tab yang sama sampai berhasil dikirim atau sesi browser berakhir. Bentuk data dan komponen sudah dipisahkan agar integrasi server dapat dilakukan melalui adapter tanpa membongkar presentasi utama.

## Prioritas lanjutan

- melengkapi dan mengonfirmasi daftar mitra;
- menyempurnakan berita, kegiatan, tautan, dan bagian landing page lanjutan;
- menghubungkan sumber data server untuk modul berikutnya secara bertahap, dimulai dari Anggota;
- menyimpan pekerjaan, keputusan, koreksi, versi, dan audit secara permanen;
- menjaga pemeriksaan aksesibilitas, responsivitas, kontras, dan regresi pada setiap pengembangan fitur.

Rincian pola antarmuka tersedia di [panduan desain](design-guide.md), sedangkan kontrak penggantian data frontend tersedia di [batas data frontend](preview-data.md).
