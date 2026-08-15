# Batas Data Frontend BHT Nexus

Dokumen ini mencatat sumber data antarmuka dan kontrak penggantinya. Data di repository ini dipakai untuk mengembangkan presentasi serta perilaku frontend; data tersebut bukan laporan resmi CoE BHT.

## Adapter data saat ini

| Area | Adapter frontend | Perilaku lokal |
|---|---|---|
| Shell workspace | `getNexusDashboardShellPreviewContent` | navigasi, notifikasi, identitas tampilan, dan tautan bantuan |
| Dashboard | folder `nexus-dashboard-*` | metrik, aktivitas, program, dan pengumuman |
| Publikasi | `getNexusPublicationsContent` | filter, rincian, sitasi, dan pengajuan pelengkapan |
| Pengumpulan | `getNexusScraperSearchContent` | validasi host publik, status pekerjaan, daftar kandidat individual, dan pengiriman seluruh kandidat ke sesi Tinjauan |
| Tinjauan Indonesia | `getNexusAuditReviewContent` | satu antrean lintas-domain termasuk impor lembar kerja, filter sumber dan jenis data, metadata adaptif, pembanding, bukti, keputusan, status koreksi, versi, dan riwayat |
| Tinjauan Inggris | route `/en/nexus/reviews` | pemberitahuan bahwa terjemahan belum tersedia; tidak menjalankan alur lama yang berbeda |
| Pustaka dokumen | `getNexusRagLibraryContent` | validasi PDF/DOCX hingga 25 MB dan antrean pemrosesan |
| Tanya jawab | `getNexusRagQaContent` | jawaban berbasis istilah yang didukung, kutipan, dan penolakan tanpa bukti |
| Ekstraksi | `getNexusRagExtractionContent` | keputusan per bidang dan pengiriman kandidat ke Tinjauan |
| State Tinjauan lintas halaman | `NexusReviewSessionProvider` dan factory rekam di `nexus-review-session` | identitas pemeriksa, kemampuan presentasi, serta kandidat dari Pengumpulan, Ekstraksi, dan pelengkapan Publikasi selama sesi frontend |

Transisi lokal sengaja deterministik agar loading, success, failure, empty, filter, dan keputusan dapat diuji tanpa layanan eksternal. State lintas halaman memakai provider pada layout ruang kerja; memuat ulang penuh tetap mengembalikan keadaan awal.

Model Tinjauan sudah memisahkan `candidateKind`, `submittedBy`, pemilik, dan pihak utama. Kaitan KPI memakai identitas, nomor, label, kategori, dan aturan bukti yang eksplisit. Status perbandingan memakai nilai mesin yang stabil dan waktu aksi interaktif dibuat saat aksi terjadi. Kemampuan `canReview` serta `canSubmitCorrection` adalah bentuk data dari batas server; nilainya saat ini hanya mengatur presentasi pratinjau dan bukan pengamanan browser.

## Kemampuan server yang dibutuhkan

Integrasi tidak boleh mengubah kontrak visual utama. Server perlu menyediakan kemampuan berikut:

1. sesi terautentikasi dan izin per peran;
2. daftar serta rincian rekam resmi;
3. pembuatan pekerjaan pengumpulan dengan status queued, running, retrying, succeeded, failed, atau failed permanently;
4. staging kandidat individual yang mempertahankan pengaju, pemilik, sumber, waktu, dan jejak pekerjaan;
5. pencarian pembanding terhadap seluruh rekam resmi yang relevan;
6. keputusan manusia dengan alasan, target hubungan, dan audit;
7. permintaan perbaikan, bidang yang boleh diubah, versi baru, serta sebelum–sesudah;
8. unggahan dokumen tervalidasi, pemindaian keamanan, dan status pemrosesan;
9. pengambilan jawaban hanya dari dokumen yang diizinkan, beserta kutipan halaman;
10. profil ekstraksi berversi dan kandidat per bidang;
11. promosi kandidat melalui transaksi server setelah keputusan yang sah;
12. ekspor dan audit sesuai izin.

Jangan menambahkan URL API spekulatif ke komponen. Tempatkan pemanggilan jaringan pada adapter server yang menggantikan fungsi konten saat kontrak sudah disepakati.

## Aturan keamanan

- browser tidak menyimpan token rahasia di source code;
- URL sumber eksternal harus HTTPS dan host-nya divalidasi;
- worker tidak menerima kewenangan menulis data resmi;
- kutipan hanya berasal dari dokumen yang diizinkan bagi pengguna;
- jawaban tanpa bukti dikembalikan sebagai tidak didukung;
- isi dokumen, data personal, catatan administratif, dan nilai sensitif tidak boleh dimasukkan sebagai fixture publik;
- nama serta foto yang dipakai pada situs publik harus berasal dari materi publik yang memang disetujui;
- audit permanen dibuat di server, bukan dipercaya dari state browser.

## Urutan migrasi

1. Ganti sesi tampilan dengan sesi server dan halaman no-access yang nyata.
2. Ganti daftar pekerjaan serta kandidat individual dengan query server.
3. Pertahankan status dan bentuk keputusan yang sudah dipakai komponen.
4. Ganti provider sesi lintas halaman dengan endpoint staging dan kemampuan server tanpa mengubah model presentasi.
5. Hubungkan unggahan dan polling status dokumen.
6. Hubungkan tanya jawab ke retriever yang mengembalikan kutipan terstruktur.
7. Hubungkan ekstraksi ke profil berversi dan staging kandidat.
8. Simpan keputusan, koreksi, dan audit melalui server.
9. Tambahkan pengujian kontrak serta pengujian end-to-end terhadap layanan nyata.
