# Batas Data Frontend BHT Nexus

Dokumen ini mencatat sumber data antarmuka dan kontrak penggantinya. Data di repository ini dipakai untuk mengembangkan presentasi serta perilaku frontend; data tersebut bukan laporan resmi CoE BHT.

## Adapter data saat ini

| Area | Adapter frontend | Perilaku lokal |
|---|---|---|
| Shell workspace | `getNexusDashboardShellPreviewContent` | navigasi, notifikasi, identitas tampilan, dan tautan bantuan |
| Dashboard | folder `nexus-dashboard-*` | metrik, aktivitas, program, dan pengumuman |
| Publikasi | `getNexusPublicationsContent` | daftar seluruh rekam resmi, filter indikator KM, kuartil, tahun terbit, kelengkapan, rincian, sitasi, dan pengajuan pelengkapan |
| Kekayaan Intelektual | `getNexusIntellectualPropertyContent` | daftar rekam resmi, filter indikator KM, jenis perlindungan, kelengkapan, rincian, dan pengajuan pelengkapan |
| Kontrak & Proposal | `getNexusContractProposalContent` | daftar rekam resmi, pemisahan kontrak dan proposal, filter indikator KM, rincian, jejak sumber, dan pengajuan pelengkapan |
| Akademik | `getNexusAcademicContent` | daftar rekam resmi, filter indikator KM, bentuk kegiatan, kelengkapan, rincian, dan pengajuan pelengkapan |
| Kegiatan & Pengabdian | `getNexusActivitiesContent` | daftar rekam resmi KM-20 sampai KM-27, filter indikator dan kelompok kegiatan, metadata adaptif per jenis, rincian, jejak sumber, dan pengajuan pelengkapan |
| Pengumpulan | `getNexusScraperSearchContent` | validasi host publik, status pekerjaan, daftar kandidat individual, dan pengiriman seluruh kandidat ke sesi Tinjauan |
| Tinjauan Indonesia | `getNexusAuditReviewContent` | satu antrean lintas-domain termasuk impor lembar kerja, filter sumber dan jenis data, metadata adaptif, pembanding, bukti, keputusan, status koreksi, versi, dan riwayat |
| Tinjauan Inggris | route `/en/nexus/reviews` | pemberitahuan bahwa terjemahan belum tersedia; tidak menjalankan alur lama yang berbeda |
| Pustaka dokumen | `getNexusRagLibraryContent` | validasi PDF/DOCX hingga 25 MB dan antrean pemrosesan |
| Tanya jawab | `getNexusRagQaContent` | jawaban berbasis istilah yang didukung, kutipan, dan penolakan tanpa bukti |
| Ekstraksi | `getNexusRagExtractionContent` | keputusan per bidang dan pengiriman kandidat ke Tinjauan |
| State Tinjauan lintas halaman | `NexusReviewSessionProvider` dan factory rekam di `nexus-review-session` | identitas pemeriksa, kemampuan presentasi, serta kandidat dari Pengumpulan, Ekstraksi, dan pelengkapan seluruh rumah data resmi selama sesi frontend |

Transisi lokal sengaja deterministik agar loading, success, failure, empty, filter, dan keputusan dapat diperiksa tanpa layanan eksternal. State lintas halaman memakai provider pada layout ruang kerja; memuat ulang penuh tetap mengembalikan keadaan awal. Pengajuan pekerjaan baru tidak mengarang hasil pengumpulan ketika scraper belum terhubung.

Model Publikasi memisahkan bentuk karya, klasifikasi pelaporan, dan metrik luar. `type` adalah metadata bibliografis dan tidak pernah diturunkan dari indikator KM; `kmLinks` boleh kosong; `quartile` hanya terisi untuk artikel jurnal, sedangkan nilai kolom sumber untuk bentuk karya lain disimpan pada `sourceReportedQuartile` tanpa pernah diklaim sebagai kuartil terverifikasi. `year` adalah tahun terbit dan terpisah dari `evaluationPeriod`. Setiap entri asal-usul data menyimpan rentang baris sumbernya, dan perbedaan antarbaris disimpan sebagai catatan, bukan dihapus. Rekam yang bentuk karyanya belum dapat dipastikan tidak dinyatakan lengkap.

Model Kekayaan Intelektual memisahkan bentuk perlindungan, klasifikasi pelaporan, dan keberadaan dokumen. `protection` adalah metadata rekam dan tidak diturunkan dari indikator KM; `kmLinks` boleh kosong; `documentAccess` membedakan dokumen publik, dokumen yang tersimpan internal, dan dokumen yang belum tercatat sehingga penyimpanan internal tidak dihitung sebagai metadata yang hilang. Judul, pencipta, nomor registrasi, dan referensi sumber pada adapter frontend bersifat netral; URL penyimpanan internal tidak dimasukkan ke repository.

Model Akademik memisahkan bentuk kegiatan, klasifikasi pelaporan, dan bukti. Cakupan tahap ini adalah KM-28 sampai KM-30. Kegiatan dengan beberapa pembimbing tetap menjadi satu rekam dan dapat mempertahankan beberapa jejak sumber. Topik, pembimbing, mahasiswa, serta referensi sumber pada adapter frontend bersifat netral; bukti internal dicatat keberadaannya tanpa mempublikasikan URL.

Model Kegiatan & Pengabdian memisahkan delapan bentuk rekam pada KM-20 sampai KM-27 dan hanya menampilkan bidang yang sesuai untuk setiap jenis. Pihak, program, komunitas, nilai dana, serta referensi sumber pada adapter frontend bersifat netral; bukti internal dicatat keberadaannya tanpa mempublikasikan URL. Usulan bidang yang belum lengkap memakai kontrak formulir dan rekam Tinjauan yang sama dengan rumah data resmi lain.

Form pelengkapan metadata dipakai bersama oleh seluruh rumah data resmi melalui `NexusMetadataCompletionForm`. Kosakata bidang, aturan pengecualian, dan validasinya berada pada satu model sehingga alur usulan tidak bercabang per domain.

Model Tinjauan sudah memisahkan `candidateKind`, `submittedBy`, pemilik, dan pihak utama. Identitas serta label KM-1 sampai KM-46 hanya berasal dari `src/content/nexus-km-indicators.ts`, berdasarkan worksheet `List KM` pada workbook KM 2026; metadata Monitoring/Evaluasi KM yang belum dipakai tidak dimodelkan lebih awal. Kaitan indikator, URL bukti, dan bidang provenance boleh kosong; ketiadaan data tidak diisi dengan tautan umum, DOI, fingerprint, atau klasifikasi buatan. Contoh publikasi atau buku dapat memakai identitas nyata jika sumber penerbitnya publik, sedangkan kontrak, bimbingan, proposal internal, HKI, paten, dan bukti privat memakai identitas netral. Status perbandingan memakai nilai mesin yang stabil dan waktu aksi interaktif dibuat saat aksi terjadi. Kemampuan `canReview` serta `canSubmitCorrection` adalah bentuk data dari batas server; nilainya saat ini hanya mengatur presentasi frontend dan bukan pengamanan browser.

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
- isi dokumen, data personal, catatan administratif, dan nilai sensitif tidak boleh dimasukkan sebagai data frontend publik;
- identitas nyata hanya dipakai ketika baris sumbernya dapat diverifikasi; skenario sintetis wajib memakai identitas netral dan tidak memakai foto anggota;
- karya nyata yang tautan buktinya tidak dapat diverifikasi tidak dipertahankan sebagai data pengembangan publik, dan tautan sumber yang terbukti menunjuk karya lain tidak dipakai sebagai bukti;
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
