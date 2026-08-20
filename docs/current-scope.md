# Cakupan Produk Saat Ini

Dokumen ini merangkum bagian BHT-Nexus Web yang sudah tersedia, batas implementasinya, dan pekerjaan yang masih berlanjut. Ringkasan ini diperbarui bersama perubahan produk agar README tetap ringkas dan mudah dipakai sebagai pintu masuk repository.

## Status pengembangan

BHT-Nexus Web masih berada dalam pengembangan aktif. Landing page, halaman institusional, serta ruang kerja BHT Nexus sudah mempunyai fondasi visual dan interaksi yang dapat ditinjau, tetapi belum dianggap sebagai versi akhir.

Data pada antarmuka ruang kerja masih disediakan oleh adapter frontend. Contoh publikasi dan buku hanya memakai identitas nyata ketika halaman penerbitnya tersedia secara publik. Skenario operasional seperti kontrak, bimbingan, proposal internal, HKI, dan paten memakai identitas netral sambil mempertahankan bentuk bidang dari workbook KM 2026. Autentikasi, hak akses, penyimpanan permanen, pekerjaan latar belakang, dan perubahan data resmi belum dihubungkan ke layanan server.

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
- Identitas pengguna, notifikasi, bantuan, dan menu profil sudah tersedia sebagai antarmuka. Pemindah bahasa tampil konsisten pada seluruh header workspace; pilihan Inggris menuju satu halaman status pembangunan sampai seluruh alur Indonesia selesai dan terjemahannya benar-benar setara.
- Dashboard menampilkan metrik, pengumuman, aktivitas riset, program unggulan, serta proyek terkini.
- Tabel dan kartu mempunyai perilaku responsif serta keadaan kosong dan loading yang konsisten.

### Pengumpulan

- Menerima profil publik SINTA atau Google Scholar.
- Memvalidasi nama, protokol HTTPS, dan host sesuai sumber.
- Menampilkan perjalanan pekerjaan dari antrean hingga hasil tersedia.
- Menampilkan alasan kegagalan dan tindakan coba lagi tanpa mengarang hasil ketika layanan pengumpulan belum tersedia.
- Hasil pengumpulan selalu menjadi kandidat dan tidak pernah langsung mengubah data resmi. Satu pekerjaan yang menemukan enam karya menghasilkan enam rekam kandidat individual; pekerjaan hanya menjadi jejak sumbernya.
- Rekam hasil mempertahankan identitas pekerjaan, sumber, profil peneliti, pengaju, dan kandidat saat dibuka di Tinjauan pada sesi yang sama.

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
- Identitas dan label KM-1 sampai KM-46 berada pada satu kamus yang diturunkan dari worksheet `List KM` workbook stakeholder. Rekam hanya merujuk indikator dari kamus tersebut dan dapat memiliki nol, satu, atau beberapa kaitan tanpa menggandakan data. Definisi, formula, unit, periode, target, dan realisasi baru akan dimodelkan bersama pekerjaan Monitoring/Evaluasi KM. Kandidat yang klasifikasinya belum didukung bukti ditampilkan sebagai belum dikaitkan dengan indikator evaluasi.
- Bukti boleh memiliki rekam dan referensi tanpa URL. Dalam keadaan itu antarmuka menyatakan bahwa tautan bukti belum tersedia dan tidak mengarahkannya ke halaman umum yang bukan sumber bukti.
- Setiap keputusan membutuhkan alasan dan tahap konfirmasi sebelum disimpan pada state frontend. Riwayat menyimpan ID pelaku, jenis keputusan, sasaran rekam, bidang yang diminta untuk diperbaiki, alasan, versi, perubahan sebelum–sesudah, serta instant ISO yang baru diformat ke WIB ketika ditampilkan.
- Kemampuan meninjau dan mengirim koreksi disediakan melalui kontrak sesi serta dihitung per rekam. Identitas pelaku yang tidak diketahui menutup tindakan secara aman; nama tampilan tidak pernah dipakai sebagai identitas otorisasi. Pengirim versi terbaru tidak dapat menyetujui kandidatnya sendiri dan koreksi hanya dapat dikirim oleh penerima ber-ID yang ditetapkan. Otorisasi sebenarnya tetap menjadi tanggung jawab layanan server.
- Versi hasil pencocokan dicatat terpisah dari versi kandidat. Setelah V2 dikirim, hasil V1 menjadi kedaluwarsa dan keputusan promosi terkunci sampai layanan pencocokan mengembalikan hasil untuk versi yang sama; riwayat koreksi tetap dipertahankan.
- Persetujuan pelengkapan metadata langsung tercermin pada rumah data resmi selama sesi frontend. Status penyelesaian membedakan tersedia, memang tidak tersedia, tidak berlaku, dan belum selesai. Keputusan tinjauannya dicatat sebagai pelengkapan metadata, bukan sebagai penggabungan rekam. Keputusan menerima data baru, memperbarui, atau menghubungkan kandidat hanya dicatat sampai layanan server mengonfirmasi transaksi resminya.
- Usulan pelengkapan yang sudah terminal tidak menutup pekerjaan berikutnya. Jika proyeksi keputusan masih menyisakan bidang wajib—misalnya kuartil setelah jenis berubah menjadi artikel jurnal—pengguna dapat membuat usulan lanjutan khusus untuk bidang tersisa tanpa menghapus riwayat usulan sebelumnya.
- Tautan rekam sesi yang sudah tidak tersedia menampilkan penjelasan dan jalan kembali ke antrean, bukan halaman kosong atau drawer tanpa isi.
- Drawer rincian dimuat ketika diperlukan agar halaman antrean tetap ringan.

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
- Tahun pengajuan yang berada di luar periode evaluasi berjalan dipertahankan apa adanya dan ditandai sebagai perbedaan yang perlu dikonfirmasi.
- Usulan pelengkapan memakai alur yang sama dengan Publikasi dan selalu diteruskan ke Tinjauan beserta kaitan indikator KM-nya.

### Kontrak & Proposal

- Rumah data resmi menggabungkan pencarian kontrak dan proposal tanpa mencampur maknanya: proposal tetap berstatus pengajuan, sedangkan kontrak menyatakan hubungan yang sudah terbentuk.
- Cakupan indikator saat ini adalah kontrak riset nasional, kontrak riset internasional, kontrak bisnis komersialisasi, proposal riset nasional, proposal riset internasional, dan proposal non-riset (KM-17–KM-19 serta KM-37–KM-39).
- Bidang mengikuti kebutuhan workbook per jenis rekam. Kontrak dan proposal riset memakai pengusul serta skema; kontrak bisnis KM-19 memakai pihak kontrak dan masa berlaku tanpa mengarang kolom pengusul yang tidak tersedia pada worksheet sumber.
- Contoh operasional memakai identitas netral dan tidak memasukkan judul, mitra, pihak kontrak, atau tautan penyimpanan privat dari workbook internal ke repository publik.
- Bukti internal dibedakan dari bukti yang belum tercatat. Pelengkapan bidang yang benar-benar kosong diteruskan ke antrean Tinjauan pada kategori Riset & bisnis.

### Akademik

- Rumah data resmi untuk bimbingan doktor, bimbingan magister, dan magang mahasiswa yang sudah lolos Tinjauan (KM-28 sampai KM-30).
- Bentuk kegiatan merupakan metadata rekam tersendiri dan tidak diturunkan dari indikator KM. Buku (KM-33) berkategori Akademik pada kamus KM, tetapi rekamnya tetap berada di Publikasi karena bentuknya karya terbit.
- Baris bimbingan dengan promotor dan ko-promotor untuk mahasiswa serta topik yang sama digabungkan menjadi satu kegiatan resmi, agar satu bimbingan tidak terhitung dua kali.
- Data pengembangan memakai penanda mahasiswa, pembimbing, dan topik yang netral. Identitas lengkap nantinya mengikuti hak akses serta payload dari layanan server, bukan ditanamkan di frontend publik.
- Bukti membedakan keadaan tersimpan internal dan belum tercatat. URL penyimpanan privat tidak dimasukkan ke repository; bukti yang benar-benar belum tercatat tetap menjadi pekerjaan pelengkapan.
- Kartu Indikator Terisi menyatakan berapa indikator akademik yang sudah mempunyai rekam, sehingga indikator yang belum mempunyai satu pun baris kegiatan tidak hilang dari pandangan.
- Baris magang diperlakukan sebagai bukti operasional peserta. Nilai KM-30 tetap bermakna kapasitas atau daya tampung magang dan tidak dihitung dari jumlah peserta aktif pada adapter frontend.
- Tahun dan lama kegiatan hanya menjadi bidang wajib pada rekam magang; bimbingan doktor dan magister mengikuti kolom sumber tanpa mengarang kekosongan tahun.
- Usulan pelengkapan memakai alur yang sama dengan Publikasi dan diteruskan ke Tinjauan pada kategori Akademik & SDM.

### Kegiatan & Pengabdian

- Rumah data resmi untuk keterlibatan unit bisnis, pembinaan UMKM atau komunitas, pengelolaan konferensi internasional, kontrak non-riset, community services, proposal pengabdian, kegiatan pengabdian, dan pengelolaan jurnal nasional (KM-20 sampai KM-27).
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
- Seluruh bidang pada profil aktif harus diputuskan dan minimal satu bidang harus disertakan sebelum hasil beserta kutipannya dibuat sebagai rekam Tinjauan. Identitas kandidat diturunkan dari dokumen, profil, versi profil, dan extraction run sehingga pengiriman ulang hasil yang sama membuka kandidat lama dan tidak membuat duplikat.
- Pustaka, Tanya jawab, dan Ekstraksi tetap berada dalam satu ruang kerja Dokumen.

## Route utama

| Route | Cakupan |
|---|---|
| `/` dan `/en` | Landing page Indonesia dan Inggris |
| `/anggota` dan `/en/members` | Profil ketua dan tim pengurus |
| `/nexus/masuk` dan `/en/nexus/sign-in` | Antarmuka masuk |
| `/nexus/dashboard` | Dashboard ruang kerja |
| `/nexus/pengumpulan` | Pengumpulan sumber publik |
| `/nexus/tinjauan` | Tinjauan kandidat sebelum menjadi data resmi |
| `/nexus/publikasi` | Daftar dan rincian publikasi resmi |
| `/nexus/kekayaan-intelektual` | Daftar dan rincian hak cipta serta paten resmi |
| `/nexus/kontrak-proposal` | Daftar dan rincian kontrak serta proposal resmi |
| `/nexus/akademik` | Daftar dan rincian bimbingan serta magang mahasiswa resmi |
| `/nexus/kegiatan` | Daftar dan rincian kegiatan, bisnis, serta pengabdian masyarakat resmi |
| `/nexus/dokumen` | Pustaka dokumen |
| `/nexus/tanya-dokumen` | Tanya jawab bersitasi |
| `/nexus/ekstraksi` | Ekstraksi kandidat dari dokumen |
| `/en/nexus/coming-soon` | Status pembangunan seluruh ruang kerja Inggris |

Route workspace Inggris yang pernah tersedia tetap dipertahankan sebagai pengarah ke halaman status tersebut agar tautan lama tidak buntu dan tidak menampilkan alur terjemahan yang baru selesai sebagian.

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

Adapter akses frontend menjadi satu sumber untuk navigasi, pencarian, direct-route state, dan kemampuan Tinjauan. Penanggung jawab koreksi memakai identitas pengguna manusia yang terpisah dari sistem sumber. Pemetaan permission final, penugasan lintas pengguna, dan penegakan keamanan tetap perlu dikonfirmasi melalui layanan server; pemeriksaan di browser hanya membentuk perilaku antarmuka dan bukan pengamanan otoritatif.

Memuat ulang halaman interaktif akan mengembalikan state lokal ke kondisi awal. Bentuk data dan komponen sudah dipisahkan agar integrasi server dapat dilakukan melalui adapter tanpa membongkar presentasi utama.

## Prioritas lanjutan

- melengkapi dan mengonfirmasi daftar mitra;
- menyempurnakan berita, kegiatan, tautan, dan bagian landing page lanjutan;
- menghubungkan sesi, peran, dan sumber data server;
- menyimpan pekerjaan, keputusan, koreksi, versi, dan audit secara permanen;
- menjaga pemeriksaan aksesibilitas, responsivitas, kontras, dan regresi pada setiap pengembangan fitur.

Rincian pola antarmuka tersedia di [panduan desain](design-guide.md), sedangkan kontrak penggantian data frontend tersedia di [batas data frontend](preview-data.md).
