# Panduan Desain Ruang Kerja BHT Nexus

Panduan ini menjelaskan pola antarmuka yang sudah dipakai pada ruang kerja BHT Nexus. Tujuannya adalah menjaga alur baru tetap konsisten, dapat diakses, dan mudah dihubungkan ke layanan server tanpa mengubah mental model pengguna.

## Mental model produk

Ruang kerja mengikuti alur berikut:

1. **Pengumpulan** menerima sumber publik dan membuat pekerjaan asinkron.
2. Setiap hasil bisnis dari pekerjaan menjadi **kandidat individual**, bukan data resmi. Identitas pekerjaan hanya menjadi provenance untuk seluruh hasilnya.
3. **Tinjauan** adalah satu-satunya antrean keputusan manusia.
4. Kandidat yang diterima atau dihubungkan baru dapat dipromosikan oleh layanan server menjadi data resmi.
5. **Publikasi** menampilkan rekam resmi dan mengajukan pelengkapan metadata kembali ke Tinjauan.
6. **Dokumen** mengelola pustaka, pencarian bersitasi, dan ekstraksi kandidat. Hasil ekstraksi juga berakhir di Tinjauan.

Worker pengumpulan, pemrosesan dokumen, dan ekstraksi tidak boleh menulis langsung ke tabel resmi.

## Navigasi

Navigasi Indonesia memakai lima tujuan utama:

- Dashboard
- Pengumpulan
- Tinjauan
- Publikasi
- Dokumen

Dokumen mempunyai navigasi lokal Pustaka, Tanya jawab, dan Ekstraksi. Ketiganya tidak menjadi tiga kategori teknologi terpisah di sidebar.

Antarmuka Inggris menyediakan alur yang sudah mempunyai konten Inggris: Collection, Reviews, dan Documents. Halaman Inggris tidak menampilkan tujuan Indonesia yang belum diterjemahkan.

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

Logika fitur, isi, dan CSS yang hanya berlaku pada satu domain tetap berada di folder fitur tersebut.

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

Scrollbar tetap terlihat. Area tabel boleh bergulir horizontal pada layar sempit, sedangkan tabel operasional baru harus berubah menjadi baris bertumpuk pada lebar sekitar 42 rem.

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

Pemindah bahasa di header memakai bendera Indonesia dan Inggris dengan penanda aktif yang sama seperti landing page. Tautannya harus menuju padanan route terdekat yang memang tersedia; jangan menampilkan tujuan yang belum mempunyai halaman terjemahan. Karena Tinjauan Inggris belum setara, pemindah bahasa tidak ditampilkan pada Tinjauan dan route Inggrisnya memberi pemberitahuan yang jelas.

## Batas implementasi saat ini

Komponen interaktif saat ini memakai adapter data frontend. State hanya bertahan selama halaman dibuka. Autentikasi, otorisasi, penyimpanan, worker, indeks dokumen, audit permanen, dan promosi data resmi adalah tanggung jawab layanan server.
