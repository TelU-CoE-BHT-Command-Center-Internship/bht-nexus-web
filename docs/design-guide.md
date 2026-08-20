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

- **Utama** — Dashboard.
- **Alur Data** — Pengumpulan, Dokumen, dan Tinjauan. Ketiganya adalah jalur kandidat sebelum menjadi data resmi.
- **Data Resmi** — Publikasi, Kekayaan Intelektual, Kontrak & Proposal, Akademik, serta Kegiatan & Pengabdian sebagai rumah data resmi yang sudah tersedia.
- **Administrasi** — Anggota dan Administrasi, keduanya belum tersedia.

Tujuan yang belum dibangun tetap terlihat sebagai penanda arah, dinyatakan belum tersedia, dan tidak dapat diklik. Pendekatan ini dipilih agar keputusan di Tinjauan selalu mempunyai tujuan yang jelas tanpa membuat halaman kosong.

Dokumen mempunyai navigasi lokal Pustaka, Tanya jawab, dan Ekstraksi. Ketiganya tidak menjadi tiga kategori teknologi terpisah di sidebar.

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

Rumah data resmi memakai satu bahasa desain rincian bersama, bukan salinan per halaman:

- `nexus-workspace-detail.module.css` untuk kerangka drawer, yaitu ringkasan atas, seksi bernomor, daftar kelengkapan metadata, jejak sumber, dan keputusan tinjauan;
- `nexus-workspace-badges.module.css` untuk penanda rekam resmi, kelengkapan, dan sumber pembentuk;
- `nexus-workspace-icons.tsx` untuk ikon kerangka drawer yang bentuknya harus sama di semua domain. Ikon khas satu domain tetap tinggal di komponen ikon domain tersebut.

Nilai pada berkas tersebut mengikuti Publikasi sebagai rujukan, sehingga rumah data resmi berikutnya tampil seragam tanpa menulis ulang gaya.

### Lebar tabel dan kolom

Lebar tabel serta lebar kolom pada `nexus-workspace-records.module.css` ditulis dengan `:where()` sehingga spesifisitasnya nol. Tanpa itu aturan bersama dan aturan halaman mempunyai spesifisitas sama, dan yang dimuat belakangan menang secara kebetulan; akibatnya setiap penyetelan kolom di halaman gagal tanpa pesan apa pun.

Kolom `primary` sengaja tidak diberi lebar. Dengan `table-layout: fixed`, kolom tanpa lebar menyerap sisa ruang, sehingga judul tidak pernah tergencet ketika kolom lain bertambah. Kolom lain diberi lebar sesuai isi terpanjangnya yang diukur di peramban, bukan diperkirakan.

Badge di dalam sel dibatasi `max-width: 100%` dan boleh membungkus. Badge yang tidak boleh membungkus akan keluar dari selnya dan menabrak kolom sebelah, sedangkan memotongnya dengan elipsis justru menyembunyikan status. Lebar kolom filter mengikuti aturan yang sama: lantainya diukur dari kontrol terpanjang, lalu turun ke tiga kolom sebelum menjadi satu kolom.

Logika fitur, isi, dan CSS yang hanya berlaku pada satu domain tetap berada di folder fitur tersebut. Untuk Publikasi yang tersisa hanya panel kuartil, metrik sitasi, dan kartu anggota.

Tinjauan Indonesia memakai satu antrean untuk seluruh kandidat. Tab memfilter sumber, sedangkan status, jenis data, periode, dan urutan berada pada kontrol filter. Perbedaan domain mengubah metadata, bukti minimum, serta konteks evaluasi di dalam drawer; perbedaan tersebut tidak membuat antrean atau pola keputusan baru.

Rincian Tinjauan yang baru diperlukan setelah tindakan pengguna dimuat sebagai bagian terpisah. Pemisahan ini menjaga halaman antrean tetap ringan tanpa memecah alur kandidat, bukti, dan keputusan menjadi beberapa layar. Drawer menggunakan lebar yang cukup untuk perbandingan dua kolom pada laptop, menjadi satu kolom pada layar sempit, dan mempertahankan jarak antarkartu agar hierarki tidak tampak menempel.

Kandidat dengan beberapa pembanding harus menyediakan pilihan eksplisit. Mengganti pembanding memperbarui skor, perbandingan bidang, sumber, dan akibat keputusan sebagai satu state terkendali. Status perbandingan disimpan sebagai nilai mesin `same`, `similar`, `different`, atau `missing`; label yang dilihat pengguna dipisahkan dari nilai tersebut. Input pilihan tetap menjadi elemen form asli yang dapat diklik dan dioperasikan dengan keyboard; elemen transparan tidak boleh memutus event perubahan React.

Publikasi dan Tinjauan pada `main` adalah acuan visual. Fitur hasil integrasi tidak boleh membawa sistem panel, tabel, dropdown, pagination, token warna, atau loading indicator alternatif. Perbedaan domain boleh mengubah isi dan tindakan, tetapi tidak membuat bahasa visual kedua.

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

Komponen interaktif saat ini memakai adapter data frontend. State hanya bertahan selama halaman dibuka. Autentikasi, otorisasi, penyimpanan, worker, indeks dokumen, audit permanen, dan promosi data resmi adalah tanggung jawab layanan server.
