# Panduan Desain Ruang Kerja BHT Nexus

Panduan ini menjelaskan pola antarmuka yang sudah dipakai pada ruang kerja BHT Nexus. Tujuannya adalah menjaga alur baru tetap konsisten, dapat diakses, dan mudah dihubungkan ke layanan server tanpa mengubah mental model pengguna.

## Mental model produk

Ruang kerja mengikuti alur berikut:

1. **Pengumpulan** menerima sumber publik dan membuat pekerjaan asinkron.
2. Setiap hasil bisnis dari pekerjaan menjadi **kandidat individual**, bukan data resmi. Identitas pekerjaan hanya menjadi provenance untuk seluruh hasilnya.
3. **Tinjauan** adalah satu-satunya antrean keputusan manusia.
4. Kandidat yang diterima atau dihubungkan baru dapat dipromosikan oleh layanan server menjadi data resmi.
5. Rumah **Data Resmi** menampilkan rekam yang sudah lolos dan mengajukan pelengkapan metadata kembali ke Tinjauan.
6. **Dokumen** mengelola pustaka, pencarian bersitasi, dan ekstraksi kandidat. Hasil ekstraksi juga berakhir di Tinjauan.

Worker pengumpulan, pemrosesan dokumen, dan ekstraksi tidak boleh menulis langsung ke tabel resmi.

## Navigasi

Navigasi Indonesia dikelompokkan mengikuti perjalanan datanya:

- **Utama** — Dashboard dan Monitoring KM.
- **Alur Data** — Pengumpulan, Dokumen, dan Tinjauan. Ketiganya adalah jalur kandidat sebelum menjadi data resmi.
- **Data Resmi** — Publikasi, Kekayaan Intelektual, Kontrak & Proposal, Akademik, serta Kegiatan & Pengabdian sebagai rumah data resmi yang sudah tersedia.
- **Administrasi** — Anggota untuk identitas organisasi dan Administrasi untuk Accounts & Access. Keduanya tersedia pada ruang kerja Indonesia dan tetap dipisahkan agar profil anggota tidak berubah menjadi akun login atau role.

Tujuan yang belum dibangun tetap terlihat sebagai penanda arah, dinyatakan belum tersedia, dan tidak dapat diklik. Pendekatan ini dipilih agar keputusan di Tinjauan selalu mempunyai tujuan yang jelas tanpa membuat halaman kosong.

Dokumen mempunyai navigasi lokal Pustaka, Tanya jawab, dan Ekstraksi. Ketiganya tidak menjadi tiga kategori teknologi terpisah di sidebar.

Monitoring KM juga memakai satu butir sidebar. Domain dipilih di dalam halaman, dan indikator KM-9 sampai KM-18 mempunyai route sendiri di bawah `/nexus/monitoring/riset`. Empat puluh enam indikator tidak dipindahkan ke sidebar hanya karena masing-masing punya halaman.

Pemilih domain pada Ringkasan berbentuk satu baris chip: ikon berwarna, nama domain, lalu jumlah indikatornya. Barisnya tidak memakai batang gulir karena batang abu-abu memotong tampilan kartu; penggeserannya disediakan langsung pada kartunya—diseret dengan tetikus, roda tetikus mendatar, sentuh, atau panah papan ketik—dan bayangan tipis di tepi menandakan masih ada domain di arah tersebut. Kunci pointer baru dipasang setelah kursor benar-benar bergeser; menguncinya sejak tombol ditekan membuat event klik pindah dari chip ke barisnya sehingga domain tidak pernah terpilih.

Berpindah domain tidak berpindah halaman. Domain yang belum punya halaman pemantauan menampilkan keadaan sedang disiapkan pada panel yang sama, lengkap dengan jumlah indikator, jumlah rekam resmi terkait, jalan kembali ke Ringkasan, dan pintasan ke rumah Data Resmi bila memang ada. Keadaan itu bukan halaman kosong dan bukan capaian nol.

Ruang kerja Inggris ditahan pada satu halaman status sampai alur Indonesia selesai. Route Inggris lama diarahkan ke halaman tersebut dan tidak boleh menampilkan fitur parsial sebagai kemampuan yang sudah siap.

## Tipografi

Antarmuka memakai Inter Variable 100–900 dari Google Fonts melalui paket `@fontsource-variable/inter`. Subset Latin dimuat sekali lewat `next/font/local` di `src/app/fonts.ts`, sehingga bentuk huruf tetap konsisten tanpa permintaan jaringan ke Google saat development maupun ketika aplikasi digunakan.

## Struktur halaman

Gunakan komponen di `src/components/nexus-workspace-ui` untuk struktur lintas-fitur:

- `NexusWorkspacePage` untuk judul, deskripsi, metadata, dan aksi halaman;
- `NexusWorkspaceMetrics` untuk tiga kartu ringkasan yang mengikuti Publikasi dan Tinjauan;
- `NexusWorkspaceTabs` untuk tab domain atau sumber bergaris bawah;
- `NexusWorkspaceSearch` dan `NexusWorkspaceSelect` untuk kontrol filter yang seragam;
- `NexusWorkspaceTableSection` untuk judul, keterangan, dan batas tabel;
- `NexusWorkspaceRecordTable` untuk tabel desktop, kartu mobile, empty state, dan loading baris;
- `NexusTablePagination` untuk ringkasan rentang, nomor halaman, dan jumlah data per halaman;
- `NexusWorkspaceDrawer` untuk rincian dan keputusan yang tidak memecah konteks antrean;
- `NexusWorkspaceState` untuk keadaan sesi hilang atau batas kemampuan yang tetap memberi penjelasan dan jalan keluar;
- `NexusWorkspaceCard`, `NexusWorkspaceField`, `NexusWorkspaceButton`, dan `NexusWorkspaceNotice` untuk formulir serta umpan balik;
- `NexusWorkspaceLoading` untuk skeleton halaman penuh yang menyerupai struktur halaman akhir.

Form pengajuan manual Data Resmi merupakan perjalanan halaman penuh, bukan drawer. `NexusManualSubmissionPage` mempertahankan pola empat kartu bernomor, rail ringkasan, dan action bar bawah yang sama untuk lima domain. Variasi bidang dan saran KM berasal dari `nexus-manual-submission-model.ts`; jangan menyalin markup atau aturan KM ke halaman domain. Hanya pemilih jenis yang terlihat pada keadaan awal. Setelah dipilih, subtype menampilkan bidang worksheet terkait; pergantian subtype membersihkan nilai yang tidak kompatibel dan mempertahankan bidang bersama. Draft disimpan per rumah data pada penyimpanan sesi browser. Pada layar sampai 64 rem rail berpindah ke bawah form, dan pada layar ponsel bidang serta aksi menjadi satu kolom tanpa mengubah urutan baca.

Input, select, dan textarea lintas-form memakai `NexusWorkspaceFormField`. Kontrol ini mengadaptasi pola TailAdmin yang relevan ke CSS Modules BHT Nexus—elemen native dengan label yang terlihat, `appearance: none`, chevron absolut, ruang kanan yang aman, dan focus ring—tanpa membawa Tailwind atau sistem komponen kedua. Tombol dan tautan aksi tetap memakai `NexusWorkspaceButton` atau `NexusWorkspaceLinkButton`; komponen fitur hanya menambahkan ikon atau isi domain.

Tombol `Ajukan …` berada pada header rumah Data Resmi sebagai tautan ke route khusus. Drawer tetap dipakai untuk rincian atau keputusan yang menjaga konteks daftar, tetapi tidak untuk pekerjaan input panjang. Bukti pengajuan manual memakai URL HTTPS yang dapat diaudit; jangan mengganti area sumber dengan unggahan jika Drive, DOI, repositori, atau laman resmi sudah memenuhi kebutuhan reviewer. Berkas Excel yang dibagikan tetap harus memakai tautan HTTPS. Pengaju tidak memilih indikator KM. Antarmuka hanya menampilkan saran sistem yang belum terverifikasi, dan kandidat harus tetap dapat dikirim ketika saran tidak tersedia. Pada Tinjauan, reviewer harus mengonfirmasi, mengubah, menghapus, atau menandai saran belum dapat ditentukan. Pilihan ubah mendukung satu atau beberapa indikator karena satu kandidat dapat memenuhi lebih dari satu KM. Keputusan menerima kemudian diproyeksikan ke rumah Data Resmi tujuan beserta metadata khusus jenisnya.

Rumah data resmi memakai satu bahasa desain rincian bersama, bukan salinan per halaman:

- `nexus-workspace-detail.module.css` untuk kerangka drawer, yaitu ringkasan atas, seksi bernomor, daftar kelengkapan metadata, jejak sumber, dan keputusan tinjauan;
- `nexus-workspace-badges.module.css` untuk penanda rekam resmi, kelengkapan, dan sumber pembentuk;
- `nexus-workspace-icons.tsx` untuk ikon yang bentuknya harus sama di semua domain, termasuk ikon kartu metrik dan kerangka drawer. Ikon khas satu domain tetap tinggal di komponen ikon domain tersebut.

Nilai pada berkas tersebut mengikuti Publikasi sebagai rujukan, sehingga rumah data resmi berikutnya tampil seragam tanpa menulis ulang gaya.

### Kartu analitik Monitoring KM

Halaman Monitoring memakai kisi 12 kolom dengan jarak 24 px pada layar lebar dan 16 px pada layar sempit. Susunannya mengadaptasi dashboard TailAdmin: dua kartu metrik dan satu grafik utama pada kolom 7, kartu capaian berbentuk busur pada kolom 5, satu grafik lebar penuh, lalu sebaran sumber pada kolom 5 dan ringkasan indikator pada kolom 7. Warna, tipografi, ikon, penanda status, fokus, dan bahasa produk tetap milik BHT Nexus.

Kartu analitik memakai sudut 16 px, garis tepi `--color-nexus-border`, dan padding 20 px yang menjadi 24 px pada layar ≥40 rem. Kartu metrik menempatkan kotak ikon 48 px di atas, lalu label, angka besar, dan penanda status pada satu baris dasar. Kartu capaian memakai bingkai luar abu dengan panel putih di dalamnya dan baris ringkasan tiga nilai di bawahnya.

Grafik memakai `apexcharts` dan `react-apexcharts` yang dimuat khusus di sisi peramban, sehingga halaman lain tidak ikut membawa berkasnya. Pustaka ini dipakai karena ruang kerja belum mempunyai primitif grafik dan komposisi TailAdmin yang menjadi rujukan memakai pustaka yang sama; tidak ada bagian lain dari template tersebut yang ikut dibawa. Grafik tidak pernah menjadi satu-satunya cara membaca angka penting: setiap grafik mempunyai judul, keterangan, nama aksesibel, dan tabel nilai yang dapat dibuka di bawahnya.

Kendali pilihan pada kartu analitik memakai `NexusWorkspaceSelect` yang sama dengan filter rumah data resmi. Menunya mengukur posisinya terhadap viewport ketika dibuka dan saat ukuran jendela berubah, lalu bergeser secukupnya agar tetap berjarak minimal 16 px dari tepi layar; tidak ada bagian menu yang terpotong dan tidak ada gulir horizontal yang muncul karenanya. Pilihan yang mempunyai keterangan tambahan—misalnya periode evaluasi dengan rentang bulannya—ditulis dua baris, nama di atas dan keterangan di bawah, sehingga tinggi tombol tetap sama untuk pilihan tahunan maupun triwulan.

Grafik pada Monitoring bersifat baca saja. Pemilihan area dengan seretan, zoom roda tetikus, pinch, dan toolbar zoom dimatikan supaya grafik tidak pernah terjebak pada keadaan zoom yang menuntut tombol reset. Sorotan, tooltip, legenda, dan animasi batang tetap berjalan seperti biasa.

Angka metrik berjalan menuju nilai akhirnya saat pertama kali tampil dan saat nilainya berganti, sedangkan pembaca layar menerima nilai akhirnya seketika. Grafik dan busur capaian memakai animasi bawaan pustaka grafik. Preferensi `prefers-reduced-motion: reduce` menampilkan seluruh angka dan grafik pada keadaan akhirnya tanpa animasi, dan halaman yang dimuat pada tab latar juga langsung menampilkan angka akhirnya.

### Ikon

Ikon digambar pada satu grid: sisi terpanjang sekitar 17 unit dari viewBox 24 dan terpusat pada titik (12, 12). Wadahnya sudah seragam, sehingga ukuran gambar yang berbeda-beda langsung terbaca sebagai kumpulan ikon yang tidak satu set. Ukuran dan titik pusat diukur dari `getBBox()` di peramban, bukan diperkirakan.

Satu konsep hanya boleh punya satu gambar. Ketika dua domain membutuhkan ikon yang sama, keduanya mengambil dari `nexus-workspace-icons.tsx`; menggambar ulang di komponen domain menghasilkan dua versi yang berbeda tipis dan sulit dirawat. Ikon pada satu kelompok navigasi juga harus berbeda siluet, bukan hanya berbeda detail kecil, agar tetap terbaca pada ukuran 20 px.

### Jarak antarblok

Bagian yang menumpuk beberapa blok memakai `gap` pada wadahnya, bukan margin pada masing-masing anak. Margin per anak membuat blok yang baru ditambahkan mudah terlewat sehingga menempel tanpa jarak, dan nilainya cenderung berbeda-beda antarblok.

### Lebar tabel dan kolom

Lebar tabel serta lebar kolom pada `nexus-workspace-records.module.css` ditulis dengan `:where()` sehingga spesifisitasnya nol. Tanpa itu aturan bersama dan aturan halaman mempunyai spesifisitas sama, dan yang dimuat belakangan menang secara kebetulan; akibatnya setiap penyetelan kolom di halaman gagal tanpa pesan apa pun.

Kolom `primary` sengaja tidak diberi lebar. Dengan `table-layout: fixed`, kolom tanpa lebar menyerap sisa ruang, sehingga judul tidak pernah tergencet ketika kolom lain bertambah. Kolom lain diberi lebar sesuai isi terpanjangnya yang diukur di peramban, bukan diperkirakan.

Sel tabel tidak boleh dijadikan wadah flex. Begitu sebuah `th` atau `td` diberi `display: flex`, sel tersebut keluar dari perhitungan tinggi baris, sehingga garis bawahnya digambar setinggi isinya sendiri dan tidak lagi sejajar dengan sel lain pada baris yang sama. Tata letak ikon dan teks di dalam sel diletakkan pada pembungkus di dalamnya, bukan pada selnya.

Badge di dalam sel dibatasi `max-width: 100%` dan boleh membungkus. Badge yang tidak boleh membungkus akan keluar dari selnya dan menabrak kolom sebelah, sedangkan memotongnya dengan elipsis justru menyembunyikan status. Lebar kolom filter mengikuti aturan yang sama: lantainya diukur dari kontrol terpanjang, lalu turun ke tiga kolom sebelum menjadi satu kolom.

Logika fitur, isi, dan CSS yang hanya berlaku pada satu domain tetap berada di folder fitur tersebut. Untuk Publikasi yang tersisa hanya panel kuartil, metrik sitasi, dan kartu anggota.

Tinjauan Indonesia memakai satu antrean untuk seluruh kandidat. Tab memfilter sumber, sedangkan status, jenis data, periode, dan urutan berada pada kontrol filter. Perbedaan domain mengubah metadata, bukti minimum, serta konteks evaluasi di dalam drawer; perbedaan tersebut tidak membuat antrean atau pola keputusan baru.

Rincian Tinjauan yang baru diperlukan setelah tindakan pengguna dimuat sebagai bagian terpisah. Pemisahan ini menjaga halaman antrean tetap ringan tanpa memecah alur kandidat, bukti, dan keputusan menjadi beberapa layar. Drawer menggunakan lebar yang cukup untuk perbandingan dua kolom pada laptop, menjadi satu kolom pada layar sempit, dan mempertahankan jarak antarkartu agar hierarki tidak tampak menempel.

Kandidat dengan beberapa pembanding harus menyediakan pilihan eksplisit. Mengganti pembanding memperbarui skor, perbandingan bidang, sumber, dan akibat keputusan sebagai satu state terkendali. Status perbandingan disimpan sebagai nilai mesin `same`, `similar`, `different`, atau `missing`; label yang dilihat pengguna dipisahkan dari nilai tersebut. Input pilihan tetap menjadi elemen form asli yang dapat diklik dan dioperasikan dengan keyboard; elemen transparan tidak boleh memutus event perubahan React.

Publikasi dan Tinjauan pada `main` adalah acuan visual. Fitur hasil integrasi tidak boleh membawa sistem panel, tabel, dropdown, pagination, token warna, atau loading indicator alternatif. Perbedaan domain boleh mengubah isi dan tindakan, tetapi tidak membuat bahasa visual kedua.

Administrasi Accounts & Access memakai pola daftar desktop, kartu mobile, tiga metrik, filter, pagination, dan drawer yang sama. Drawer detail hanya merangkum informasi akun, hubungan anggota, peran, ringkasan akses khusus, serta tindakan sesuai status. Undangan memakai empat langkah—identitas, hubungan anggota eksplisit, peran, dan tinjauan—tanpa password atau penyimpanan keamanan di browser. Audit log, MFA, sesi, perangkat, dan policy enforcement tidak dipresentasikan sebagai kemampuan frontend.

Peran dan hak akses memakai dua halaman penuh di bawah Administrasi, bukan drawer sempit. `/nexus/administrasi/peran` memakai ruang kerja dua kolom: daftar peran yang dapat dicari di kiri, rincian peran dengan tab matriks, pengguna, dan informasi di kanan, lalu satu baris aksi di bawahnya. Keduanya memakai `NexusWorkspaceBreadcrumb` untuk jejak lokasi dan mengembalikan konteks melalui ID, bukan label.

`/nexus/administrasi/akses` menangani satu akun terhadap 32 izin, sehingga daftarnya tidak dibiarkan menjadi gulir panjang. Halaman dibuka dengan ringkasan akses berisi jumlah izin aktif, penyesuaian, tambahan, dan pembatasan, lalu menyediakan saringan Semua, Penyesuaian, Aktif, dan Nonaktif. Setiap modul menjadi bagian yang dapat dibuka-tutup dan hanya modul yang mempunyai penyesuaian yang terbuka lebih dahulu, sehingga pengecualian langsung terlihat tanpa menelusuri seluruh izin. Satu izin ditulis pada satu baris berisi hak akses bawaan peran, kendali penyesuaian, dan hasil akhirnya; baris yang disesuaikan diberi garis tepi hijau untuk tambahan dan merah untuk pembatasan. Baris aksi menempel di bawah layar agar Simpan dan Reset selalu terjangkau tanpa menggulir sampai akhir halaman.

Kendali izin peran memakai sakelar dua keadaan berbasis checkbox dengan nama aksesibel spesifik seperti `Izinkan peran Auditor mengubah Publikasi`, sedangkan penyesuaian akun memakai kendali tiga keadaan berbasis radio: mengikuti peran, tambahan, dan dibatasi. Keadaan tidak pernah disampaikan hanya lewat warna; setiap kendali menyertakan label teks dan kombinasi yang tidak berlaku ditandai sebagai tidak tersedia, bukan sebagai izin nonaktif. Pada lebar tablet ke bawah, matriks dan perbandingan berubah menjadi kartu per modul agar tidak ada gulir horizontal halaman.

Matriks peran, akses khusus, dan seluruh drawer Administrasi yang menampung isian mendaftarkan perubahan bermakna pada satu penjaga navigasi ruang kerja. Tautan produk—termasuk sidebar, breadcrumb, pencarian, dan tindakan header—memakai dialog BHT Nexus sebelum membuang perubahan, sedangkan muat ulang atau penutupan tab memakai mekanisme standar browser. Drawer tetap memakai dialog lokalnya untuk tombol tutup, Batal, backdrop, dan Escape, sehingga satu tindakan tidak pernah meminta dua konfirmasi. Setelah perubahan disimpan atau dibuang, status perubahan belum disimpan dilepas agar navigasi berikutnya tidak menampilkan konfirmasi lama.

Profil pribadi memakai pola tersendiri. `/nexus/profil` menempatkan satu wadah luar berisi kartu-kartu bertepi dengan jarak yang sama: kartu utama menggabungkan foto, identitas, dan kisi label–nilai dalam satu kartu; kartu berikutnya menampung akun, keanggotaan, keahlian, identitas akademik, lalu keamanan. Struktur ini mengadaptasi susunan halaman profil TailAdmin ke token BHT Nexus—warna, tipografi, radius, tombol, dan status tetap milik BHT Nexus—tanpa membawa tautan sosial, alamat, atau Tax ID yang tidak dimiliki domain ini.

Penyuntingan profil milik pengguna sendiri memakai pop-up terpusat `NexusProfileModal`, bukan drawer rincian. Drawer tetap dipakai untuk meninjau data orang lain dari sebuah daftar; profil pribadi tidak berasal dari antrean sehingga tidak perlu mempertahankan konteks daftar di belakangnya. Pop-up memakai panel terpusat dengan latar redup, tombol tutup di kanan atas, judul dan keterangan pendukung, isi yang menggulir di dalam panel, serta baris aksi yang tetap terjangkau. Posisi gulir `main` ruang kerja di belakang panel tidak boleh berubah selama modal terbuka; isi panel menggulir secara mandiri dan posisi sebelumnya dipertahankan setelah modal ditutup. Aturan papan ketiknya sama dengan drawer: hanya lapisan teratas yang menerima Escape, fokus terperangkap di dalam panel, dan fokus dikembalikan ke pemicunya. Editor foto memakai dialog bawaan peramban sehingga ia memegang lapisan teratas selama terbuka.

Isolasi gulir tersebut berasal dari tiga hal yang saling melengkapi, bukan dari mengunci `body`. Pada ruang kerja, `main` adalah wadah gulir yang sebenarnya sedangkan `html` dan `body` memakai `overflow: clip`, sehingga mengunci `body` tidak menahan apa pun di sini dan hanya tersisa sebagai pengaman bila komponen dipakai di luar kerangka ruang kerja. Yang benar-benar menahan latar adalah lapisan modal yang memakai `position: fixed`—sehingga rantai gulir roda tetikus tidak pernah sampai ke `main`—dan isi panel yang memakai `overscroll-behavior: contain`, sehingga gulir tidak merambat keluar ketika isi panel sudah mencapai ujungnya. Ketiganya perlu dipertahankan bersama; melepas salah satunya akan membuat latar ikut bergulir tanpa pesan kesalahan apa pun.

Kartu profil membawa satu tindakan ubah. Pada layar sempit tindakan tersebut menjadi ikon di pojok kanan atas kartunya, bukan tombol selebar kartu, karena tombol lebar mendorong isi kartu dan membuat halaman terbaca sebagai daftar tombol. Teks tombolnya tetap ada sebagai nama aksesibel yang menyebut bagian yang disunting, sehingga ikon tidak pernah menjadi satu-satunya keterangan.

Pengenal akademik memakai satu definisi alamat profil publik pada `nexus-member-academic.tsx`. Direktori Anggota dan Profil Saya memakai komponen yang sama sehingga SINTA, ORCID, Google Scholar, Scopus, dan ResearcherID selalu tampil sebagai tautan bertanda garis bawah yang dibuka pada tab baru, bukan tautan di satu halaman dan teks biasa di halaman lain.

Kendali foto profil `NexusMemberProfilePhoto` beserta editor potongnya dipakai bersama oleh direktori Anggota dan Profil Saya. Hanya sebutan orangnya yang menyesuaikan permukaan; aturan format, batas ukuran, pengaturan posisi, penggantian, penghapusan, dan fallback inisial tidak boleh disalin ulang menjadi pengunggah kedua.

Identitas pengguna di kanan atas terdiri atas foto, satu nama, dan tanda buka menu. Menunya berisi nama lengkap, email masuk, tautan Profil Saya, lalu Keluar yang dipisahkan garis. Menu menutup ketika pemicu dipilih kembali, pengguna berinteraksi di luar, menekan Escape, memilih Profil Saya, membuka notifikasi, atau berpindah route; Escape mengembalikan fokus ke pemicu. `aria-expanded` selalu mengikuti state panel. Menu ini hanya memuat tindakan yang benar-benar dimiliki produk; entri bantuan, penagihan, atau preferensi tampilan tidak ditambahkan hanya karena ada pada template rujukan. Profil Saya tidak menjadi butir navigasi utama karena ia merupakan konteks personal, bukan modul ruang kerja.

Tindakan yang mengantar pengguna ke permukaan lain hanya ditampilkan ketika kewenangan di tujuannya memang dimiliki. Antarmuka tidak menawarkan jalan keluar yang berakhir pada halaman tertutup; sebagai gantinya keadaan tetap dijelaskan apa adanya beserta keterangan siapa yang dapat menindaklanjuti.

### Perbatasan antarbagian

Dua bagian berwarna sama yang hanya bersentuhan di tepi akan menyisakan garis tipis pada sebagian layar. Tepi elemen jarang jatuh tepat pada piksel perangkat, dan peramban membulatkan tepi bawah bagian atas serta tepi atas bagian bawah secara terpisah; selisih kurang dari satu piksel itu cukup untuk memperlihatkan latar di belakangnya. Bagian yang seharusnya menyatu karena itu ditumpangkan satu piksel, bukan dirapatkan.

Bentuk lengkung pada perbatasan digambar selebar bagian yang ditutupinya dan menyentuh kedua sudut. Lengkungan yang dibuat lebih lebar lalu dipotong `overflow` hanya menutup bagian tengah, sehingga di kiri dan kanan tersisa tepi lurus yang terbaca sebagai garis horizontal.

## Warna dan kontras

Token ruang kerja berada di `src/app/globals.css`. Gunakan:

- `--color-nexus-text-strong`, `--color-nexus-text`, `--color-nexus-text-soft`, dan `--color-nexus-text-muted` untuk hierarki teks;
- `--color-nexus-surface` dan `--color-nexus-surface-subtle` untuk lapisan;
- `--color-nexus-border`, `--color-nexus-border-soft`, dan `--color-nexus-border-subtle` untuk batas;
- `--color-nexus-accent`, `--color-nexus-success`, dan `--color-nexus-danger` untuk aksen serta status;
- `--color-brand-navy` untuk aksi utama dan `--color-brand-gold` untuk fokus global.

Jangan menyampaikan status hanya dengan warna. Selalu sertakan label teks. Jalankan `npm run validate:contrast` setelah menambah atau mengubah pasangan token.

Scrollbar tetap terlihat. Tabel operasional berubah menjadi kartu dua kolom pada lebar tablet sampai 68 rem dan satu kolom sampai 48 rem. Pola ini menjaga judul, metadata, status, dan aksi tetap terbaca tanpa gulir horizontal; tabel desktop tetap dipakai pada ruang yang cukup.

## Interaksi dan keadaan

Setiap fitur harus mempunyai keadaan yang dapat diverifikasi:

- **loading**: route workspace memakai `loading.tsx` dengan judul, kartu metrik, tab, filter, dan baris skeleton; indikator putar generik tidak dipakai sebagai seluruh isi halaman;
- **empty**: pencarian dan filter memperlihatkan pesan serta aksi reset bila relevan;
- **success**: unggahan lokal, pengajuan pekerjaan, kirim ekstraksi, koreksi, dan keputusan memberi umpan balik;
- **failure**: validasi berkas, URL, atau pertanyaan menggunakan pesan yang terhubung ke kontrol; kegagalan render route memakai `error.tsx` dengan keterangan aman dan tindakan coba lagi;
- **no access**: kelak berasal dari keputusan server; jangan mengarang hak akses di browser.

Aturan aksi:

- tombol harus mengubah state, menavigasi, membuka tautan, atau mengirim formulir;
- keputusan Tinjauan wajib mempunyai alasan;
- minta perbaikan harus mencatat bidang serta alasan; pengisian koreksi hanya tersedia bagi kemampuan yang diberikan server, sedangkan pemeriksa tanpa kemampuan tersebut melihat status baca-saja;
- pertanyaan tanpa bukti harus ditolak dengan jelas;
- data resmi tidak boleh tampak berubah sebelum keputusan manusia dan konfirmasi server.

## Aksesibilitas

Target minimum:

- dapat dipakai mulai lebar 360 px;
- seluruh aksi dapat dijangkau dan dijalankan dengan keyboard;
- label form terlihat atau mempunyai nama aksesibel yang setara;
- fokus terlihat memakai token global;
- panel, tabel, caption, heading, dan live region memakai semantik HTML;
- nama aksesibel drawer berasal dari ID unik per instance, bukan teks judul yang mungkin berulang;
- animasi menghormati `prefers-reduced-motion`;
- teks normal memenuhi WCAG 2.2 AA 4,5:1 dan batas kontrol penting memenuhi 3:1.

## Bahasa

Jangan mencampur konten Indonesia ke halaman Inggris kecuali judul dokumen atau kutipan sumber memang berasal dari dokumen berbahasa Indonesia. Jalur bahasa harus mempertahankan bahasa ketika pengguna berpindah di dalam workspace.

Pemindah bahasa di header memakai bendera Indonesia dan Inggris dengan penanda aktif yang sama seperti landing page dan selalu tampil pada seluruh route workspace. Selama ruang kerja Inggris belum lengkap, pilihan Inggris menuju satu halaman status pembangunan; pilihan Indonesia dari halaman tersebut kembali ke Dashboard. Dengan demikian pola header tetap konsisten tanpa mengarang padanan fitur yang belum tersedia.

## Batas implementasi saat ini

Komponen interaktif saat ini memakai adapter data frontend pada layout ruang kerja. Kandidat, keputusan, dan proyeksi Data Resmi bertahan selama sesi layout tersebut; draft pengajuan manual disimpan terpisah per rumah data pada `sessionStorage` dan dapat dipulihkan setelah navigasi atau muat ulang pada tab yang sama. Autentikasi, otorisasi, penyimpanan permanen, worker, indeks dokumen, audit permanen, dan promosi lintas perangkat tetap menjadi tanggung jawab layanan server.
