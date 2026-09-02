# Batas Data Frontend BHT Nexus

Dokumen ini mencatat sumber data antarmuka dan kontrak penggantinya. Data di repository ini dipakai untuk mengembangkan presentasi serta perilaku frontend; data tersebut bukan laporan resmi CoE BHT.

## Adapter data saat ini

| Area | Adapter frontend | Perilaku lokal |
|---|---|---|
| Shell workspace | `getNexusDashboardShellPreviewContent` | navigasi, notifikasi, fallback identitas dari current Account, dan tautan bantuan dengan pesan awal tanpa identitas personal statis |
| Dashboard | folder `nexus-dashboard-*` | metrik, aktivitas, program, dan pengumuman |
| Publikasi | `getNexusPublicationsContent` | daftar seluruh rekam resmi, filter indikator KM, kuartil, tahun terbit, kelengkapan, rincian, sitasi, dan pengajuan pelengkapan |
| Kekayaan Intelektual | `getNexusIntellectualPropertyContent` | daftar rekam resmi, filter indikator KM, jenis perlindungan, kelengkapan, rincian, dan pengajuan pelengkapan |
| Kontrak & Proposal | `getNexusContractProposalContent` | daftar rekam resmi, pemisahan kontrak dan proposal, filter indikator KM, rincian, jejak sumber, dan pengajuan pelengkapan |
| Akademik | `getNexusAcademicContent` | daftar rekam resmi, filter indikator KM, bentuk kegiatan, kelengkapan, rincian, dan pengajuan pelengkapan |
| Kegiatan & Pengabdian | `getNexusActivitiesContent` | daftar rekam resmi KM-9, KM-10, dan KM-20 sampai KM-27, filter indikator dan kelompok kegiatan, metadata adaptif per jenis, rincian, jejak sumber, dan pengajuan pelengkapan |
| Monitoring KM | `getNexusMonitoringRecords`, `measureIndicator`, `summarizeRiset`, `getNexusMonitoringCategories`, `nexusMonitoringIndicatorProgress`, dan `nexusMonitoringUpdates` | membaca ulang rumah Data Resmi yang sama tanpa menyalinnya, menghitung realisasi indikator Riset dari kaitan KM eksplisit, menyusun sebaran per rumpun data, menghitung kemajuan indikator per domain, mengurutkan pembaruan rekam resmi terbaru, dan menyiapkan data pembentuk realisasi |
| Anggota | `getNexusMemberDirectory` dan `getNexusMembersContent` | direktori master–detail, tambah dan ubah profil, pencarian, filter status dan bidang, keanggotaan, identitas akademik, jalur data terkait, serta hubungan akun opsional |
| Administrasi | `getNexusAdministrationContent` | daftar dan rincian akun, pencarian, filter status/role/hubungan anggota, satu alur undangan bertahap, editor hubungan, role tingkat tinggi, serta tindakan akses sesuai status |
| Pengajuan manual Data Resmi | `manualSubmissionDefinitions`, `createManualSubmissionReviewRecord`, dan route `/nexus/ajukan/[domain]` | form penuh untuk lima domain, bidang subtype berdasarkan workbook, periode evaluasi yang terpisah dari tahun/tanggal entitas, validasi metadata/tanggal/angka/URL, saran KM berbasis aturan, pencocokan pengenal dan judul termasuk rekam yang telah disetujui, draft sesi browser otomatis, serta pengiriman kandidat manual ke Tinjauan |
| Pengumpulan | `getNexusScraperSearchContent` dan `nexus-collection-identity` | validasi host serta pengenal orang pada profil publik, binding anggota yang dilepas ketika identitas sumber berubah, status pekerjaan, daftar kandidat individual, serta pengiriman kandidat ke sesi Tinjauan Indonesia |
| Tinjauan Indonesia | `getNexusAuditReviewContent` | satu antrean lintas-domain termasuk impor lembar kerja, filter sumber dan jenis data, metadata adaptif, pembanding, bukti, keputusan, status koreksi, versi, dan riwayat |
| Workspace Inggris | route `/en/nexus/coming-soon` | satu halaman status sampai seluruh alur Indonesia selesai; route workspace Inggris lama mengarah ke sini |
| Metadata dokumen | `getNexusDocumentRecords` | satu status dan kemampuan dokumen untuk Pustaka, Tanya jawab, serta Ekstraksi |
| Pustaka dokumen | `getNexusRagLibraryContent` | validasi PDF/DOCX hingga 25 MB, antrean pemrosesan, dan perpindahan dengan identitas dokumen |
| Tanya jawab | `getNexusRagQaContent` | jawaban menurut cakupan dokumen, kutipan yang sesuai, dan penolakan tanpa bukti |
| Ekstraksi | `getNexusRagExtractionContent` | identitas dokumen, keputusan per bidang, pencegahan kandidat kosong, serta pengiriman kandidat unik ke Tinjauan Indonesia |
| State Tinjauan lintas halaman | `NexusCurrentUserReviewSessionProvider`, `NexusReviewSessionProvider`, dan factory rekam di `nexus-review-session` | aktor pemeriksa dari current Account/Profile, kemampuan presentasi, serta kandidat dari Pengumpulan, Ekstraksi, dan pelengkapan seluruh rumah data resmi selama sesi frontend Indonesia |
| State anggota lintas halaman | `NexusMemberSessionProvider` | satu sumber profil anggota kanonis untuk Anggota serta pilihan hubungan pada Administrasi selama layout workspace aktif |
| State akun lintas halaman | `NexusAccountSessionProvider` | satu sumber akun, role, status, hubungan anggota, current Account, dan proyeksi current Profile untuk seluruh layout workspace aktif |
| Proyeksi keputusan ke Data Resmi | `projectOfficialMetadataRecords` dan `nexus-manual-submission-projection` | menerapkan pelengkapan, data baru, pembaruan, atau penggabungan dari pengajuan manual, workbook, dokumen, SINTA, maupun Google Scholar ke rumah data tujuan selama sesi frontend; ID internal dibentuk dari domain, sumber, dan ID kandidat lengkap, relasi multi-orang memakai pemetaan person ID eksplisit, serta `undetermined` tidak menghapus kaitan KM existing |

Transisi lokal sengaja deterministik agar loading, success, failure, empty, filter, dan keputusan dapat diperiksa tanpa layanan eksternal. State kandidat, keputusan, dan proyeksi Data Resmi memakai provider pada layout ruang kerja serta kembali ke keadaan awal ketika layout dimuat ulang penuh. Draft pengajuan manual merupakan pengecualian yang disengaja: nilainya disimpan pada `sessionStorage` per rumah data dan dipulihkan pada tab yang sama sampai pengajuan berhasil dikirim atau sesi browser berakhir. Pengajuan pekerjaan baru tidak mengarang hasil pengumpulan ketika scraper belum terhubung.

Model pengajuan manual membentuk kandidat baru, bukan rekam resmi. Definisi domain dan subtype menentukan bidang workbook yang ditampilkan serta aturan saran KM; pengaju tidak pernah mengirim pilihan indikator sebagai keputusan. `kpiLinksSuggested` membedakan saran sistem dari kaitan yang sudah diverifikasi. Reviewer mengonfirmasi, mengubah, menghapus, menambahkan beberapa kaitan, atau menandai kaitan belum dapat ditentukan sebelum kandidat diterima. Koreksi subtype memperbarui payload terstruktur, koreksi metadata menghitung ulang saran KM, dan kontrol koreksi memakai tipe serta validator yang sama dengan form asal. Jika metadata belum mendukung saran yang aman, `kpiLinks` tetap kosong dan kandidat masih dapat dikirim. Bukti eksternal memakai URL HTTPS yang dinormalisasi; berkas Excel hanya dapat dirujuk melalui tautan berbagi HTTPS, bukan path lokal atau protokol aplikasi. Pencocokan memakai pengenal stabil yang tersedia sebelum kemiripan judul dan tahun; NIM tidak digunakan sebagai sinyal duplikat lintas-kegiatan, dan keputusan duplikat tetap memerlukan reviewer.

Model Publikasi memisahkan bentuk karya, klasifikasi pelaporan, dan metrik luar. `type` adalah metadata bibliografis dan tidak pernah diturunkan dari indikator KM; `kmLinks` boleh kosong; `quartile` hanya terisi untuk artikel jurnal, sedangkan nilai kolom sumber untuk bentuk karya lain disimpan pada `sourceReportedQuartile` tanpa pernah diklaim sebagai kuartil terverifikasi. `year` adalah tahun terbit dan terpisah dari `evaluationPeriod`. Setiap entri asal-usul data menyimpan rentang baris sumbernya, dan perbedaan antarbaris disimpan sebagai catatan, bukan dihapus. Rekam yang bentuk karyanya belum dapat dipastikan tidak dinyatakan lengkap.

Model Kekayaan Intelektual memisahkan bentuk perlindungan, klasifikasi pelaporan, dan keberadaan dokumen. `protection` adalah metadata rekam dan tidak diturunkan dari indikator KM; `kmLinks` boleh kosong; `documentAccess` membedakan dokumen publik, dokumen yang tersimpan internal, dan dokumen yang belum tercatat sehingga penyimpanan internal tidak dihitung sebagai metadata yang hilang. Judul, pencipta, nomor registrasi, dan referensi sumber pada adapter frontend bersifat netral; URL penyimpanan internal tidak dimasukkan ke repository.

Model evaluasi KM memisahkan empat hal: identitas indikator pada registry KM, keterangan indikator menurut workbook KM 2026, target milik satu periode evaluasi, dan hasil hitung dari data resmi. Target 2026 karena itu tidak melekat selamanya pada indikatornya. Realisasi hanya dibentuk oleh rekam Data Resmi dengan kaitan KM eksplisit pada periode yang sama, dideduplikasi menurut pengenal resmi, dan selalu sama dengan jumlah baris data pembentuk yang ditampilkan. Nilai realisasi 2025 serta catatan triwulan pada workbook disimpan sebagai rujukan sumber dan tidak pernah dipakai sebagai realisasi. Triwulan dihitung dari tanggal bisnis rekam; waktu pembaruan, waktu tinjauan, dan waktu pengambilan sumber tidak pernah dipakai untuk itu.

Model Akademik memisahkan bentuk kegiatan, klasifikasi pelaporan, dan bukti. Cakupannya adalah KM-28 sampai KM-32. Kegiatan dengan beberapa pembimbing tetap menjadi satu rekam dan dapat mempertahankan beberapa jejak sumber. Magang memakai NIM, mahasiswa, fakultas, program studi, program MBKM, penyelenggara, pembimbing, durasi, tahun, dan bukti; kompetisi tidak dipaksa memakai bidang magang. Topik, pembimbing, mahasiswa, serta referensi sumber pada adapter frontend bersifat netral.

Model Kegiatan & Pengabdian memisahkan pembicara dan kunjungan internasional (KM-9–KM-10) serta delapan bentuk rekam pada KM-20–KM-27. Unit bisnis, komunitas, konferensi, program pengabdian, proposal, dan jurnal hanya menampilkan bidang worksheet masing-masing. Pihak, program, komunitas, nilai dana, serta referensi sumber pada adapter frontend bersifat netral.

Model Anggota mengikuti kebutuhan identitas pada SRS: profil, status aktif/cuti/nonaktif, visibilitas publik, unit, bidang keahlian, dan pengenal eksternal dipisahkan dari akun login serta role/permission. Adapter menggunakan kembali nama, foto, penugasan, serta deskripsi yang sudah dipublikasikan pada halaman institusional. Satu definisi identitas kanonis menulis ID awal secara eksplisit dan dipakai bersama oleh konten publik, direktori, serta alias fixture; nama tampilan dapat berubah tanpa mengubah ID. Tanggal bergabung, kontak personal, dan pengenal akademik yang belum tersedia dibiarkan kosong; alamat email umum CoE tidak disalin sebagai email personal setiap anggota, dan penugasan organisasi tidak diduplikasi sebagai bidang keahlian. Anggota baru dapat dicatat tanpa email atau foto; avatar inisial menjadi fallback dan visibilitas publik tidak aktif secara bawaan. Form tambah dan ubah memakai bentuk data serta validasi yang sama, termasuk normalisasi, format, dan keunikan lima pengenal akademik selama halaman aktif. Editor foto menyimpan sumber asli dan hasil crop sebagai dua nilai berbeda sehingga avatar dapat diatur ulang tanpa kehilangan komposisi awal. `NexusMemberSessionProvider` memiliki perubahan profil selama layout aktif tanpa mencampurkan data akun ke rekam anggota. Anggota boleh belum mempunyai akun; state akses `NONE`, `LINKED`, atau `CONFLICT` selalu diproyeksikan dari state akun workspace. Pemberian akses hanya tersedia pada `NONE`, akun sah dapat dibuka kembali di Administrasi, dan konflik diarahkan untuk ditinjau tanpa dipresentasikan sebagai tidak memiliki akses.

Model Administrasi memisahkan identitas akun, hubungan anggota, role tingkat tinggi, dan status akses. `NexusAccountSessionProvider` menjadi satu pemilik mutasi akun selama layout workspace aktif; Administrasi mengelolanya dan Anggota hanya memproyeksikan hasilnya. Nama manusia, avatar, pencarian, dan kelengkapan memakai `resolveNexusProfile`, sedangkan `displayName` Account tetap menjadi alias/fallback dan tidak disinkronkan melalui salinan. Pilihan serta referensi anggota selalu diturunkan dari `NexusMemberSessionProvider` melalui ID, nama publik, dan penugasan kanonis. Relasi memakai union eksplisit `LINKED`, `NON_MEMBER`, `UNLINKED`, dan `CONFLICT`; hubungan ganda ke satu anggota dinormalisasi sebagai konflik dan kemiripan nama atau email tidak pernah menjadi keputusan identitas. Perubahan hubungan tidak menyalin atau menghapus data pribadi. Informasi pribadi Account tetap tersimpan tetapi tidak aktif selama `LINKED`, lalu dipakai kembali ketika Account menjadi non-anggota. Fixture akun operasional dan current Account memakai identitas netral dan tidak menautkan keadaan privat rekaan ke nama anggota publik. `ACTIVE`, `INVITED`, serta `SUSPENDED` merupakan nilai mesin dan memakai satu label Indonesia bersama. Konsep `accountKind` dihapus karena belum memiliki kontrak berwenang. Role hanya membawa label, deskripsi, dan ringkasan tinggi yang konservatif; resolusi `KNOWN`, `UNASSIGNED`, dan `UNKNOWN` mencegah role stale tampil sebagai belum ditetapkan atau bocor sebagai key mesin. Permission, data scope, email, token undangan, autentikasi, transaksi status, serta audit harus datang dari dan ditegakkan layanan server. Seluruh perubahan kembali ke fixture setelah muat ulang penuh dan tidak disimpan sebagai database browser.

Tautan Administrasi menuju Anggota membawa `?member=<memberId>`; parameter yang tidak dikenal menampilkan keadaan profil tidak ditemukan dan tidak pernah membuka orang lain secara diam-diam. Tautan Anggota menuju Administrasi membawa `?inviteMember=<memberId>` untuk alur undangan atau `?account=<accountId>` untuk akun yang sudah terhubung. `account` yang hadir memiliki prioritas: nilai sah membuka akun dan nilai tidak dikenal menampilkan keadaan akun tidak ditemukan; hanya ketika parameter itu tidak hadir barulah `inviteMember` dapat membuka undangan. Bila pengguna membatalkan undangan yang sedang dirujuk `account`, antarmuka membersihkan parameter itu dan kembali ke daftar akun alih-alih menandai tautannya tidak ditemukan. ID anggota undangan yang tidak dikenal juga gagal aman dan tidak membuka formulir generik. Loading dan error memakai file convention route Next.js, sedangkan no-access mengikuti kontrak kemampuan workspace. Dialog konfirmasi bersama menjaga fokus dan dipakai untuk draft yang belum disimpan, perubahan hubungan, serta tindakan status yang memerlukan konfirmasi.

ID anggota menjadi kunci lintas-alur pada state frontend. Pengumpulan yang dimulai dari profil anggota membuat binding dari `memberId`, sumber, pengenal orang eksternal, dan profil akademik; binding dilepas ketika nama konteks, sumber, atau identitas URL berubah. Kandidat multi-orang menyimpan `memberId` bersama ID orang kandidat tertentu, bukan hanya pada level rekam. Pada Tinjauan, correction yang mengubah identitas orang membatalkan binding lama dan reviewer memilih ulang orang yang tepat. Pembaruan atau merge ke Data Resmi memakai pemetaan eksplisit dari ID orang kandidat ke ID orang resmi sehingga relasi coauthor existing tidak hilang atau berpindah. Penulis publikasi, pencipta kekayaan intelektual, dan pembimbing akademik menyimpan ID rekam pihak serta `memberId` opsional sebagai dua hal berbeda. Filter Data Terkait membaca `?member=...` pada kelima rumah data resmi. Hubungan dari server harus selalu mengirim ID anggota, ID orang sumber, dan pemetaan person secara eksplisit; kemiripan nama tidak menjadi kontrak identitas.

Visibilitas profil publik pada state internal belum mengubah `/anggota` secara lintas-route karena halaman publik masih memakai sumber konten institusional statis. Kontrolnya adalah kontrak presentasi untuk layanan anggota, bukan klaim bahwa perubahan lokal sudah tersimpan atau langsung terbit.

Form pelengkapan metadata dipakai bersama oleh seluruh rumah data resmi melalui `NexusMetadataCompletionForm`. Kosakata bidang, aturan pengecualian, normalisasi DOI, hubungan tanggal kontrak, dan validasinya berada pada satu model sehingga alur usulan tidak bercabang per domain. Koreksi pada Tinjauan memakai aturan nilai yang sama; nilai atau pengecualian yang disetujui ditampilkan kembali pada halaman asal selama sesi. Usulan terminal yang ditolak atau masih meninggalkan bidang wajib dapat dilanjutkan tanpa menghapus rekam tinjauan sebelumnya.

Model Tinjauan sudah memisahkan `candidateKind`, sistem sumber, pengaju manusia, penerima koreksi, pemilik, dan pihak utama. Identitas serta label KM-1 sampai KM-46 hanya berasal dari `src/content/nexus-km-indicators.ts`, berdasarkan worksheet `List KM` pada workbook KM 2026; metadata Monitoring/Evaluasi KM yang belum dipakai tidak dimodelkan lebih awal. Kaitan indikator, URL bukti, dan bidang provenance boleh kosong; ketiadaan data tidak diisi dengan tautan umum, DOI, fingerprint, atau klasifikasi buatan. Contoh publikasi atau buku dapat memakai identitas nyata jika sumber penerbitnya publik, sedangkan kontrak, bimbingan, proposal internal, HKI, paten, dan bukti privat memakai identitas netral. Setiap pengaju atau penerima tugas manusia memiliki ID pengguna stabil; akun layanan hanya menjadi provenance dan tidak menerima tugas koreksi. Current reviewer memakai ID current Account yang sama dengan tindakan akun. Label event baru memakai proyeksi Profile pada waktu tindakan, sedangkan label event lama tetap menjadi snapshot dan tidak ditulis ulang setelah Profil berubah. Identitas yang tidak diketahui menutup hak review dan koreksi secara aman. Hasil pencocokan membawa versi dan status tersendiri, sehingga hasil V1 tidak dapat dipakai untuk memutuskan V2. Keputusan merge atau pembaruan menyimpan ID rekam tujuan, person binding kandidat, serta pemetaan person ke rekam resmi. `confirmed` dan `changed` menetapkan kaitan KM, `removed` menghapusnya, sedangkan `undetermined` mempertahankan kaitan existing pada update atau merge. Event audit menyimpan instant ISO dan baru diformat ke WIB ketika dirender. Riwayat koreksi bersifat bertambah, mempertahankan versi serta perubahan sebelum–sesudah. Kemampuan per rekam seperti `canApprove`, `canRequestChanges`, `canReject`, dan `canSubmitCorrection` adalah bentuk data dari batas server; nilainya saat ini hanya mengatur presentasi frontend dan bukan pengamanan browser.

Hasil pelengkapan metadata memakai empat state bersama: `available`, `not-available`, `not-applicable`, dan `unresolved`. Karena itu pengecualian yang sudah disetujui tidak pernah diberi label “Tersedia” pada daftar, kartu, filter, maupun rincian. Proyeksi Publikasi menghitung ulang hubungan jenis karya dan kuartil, sedangkan proyeksi HKI baru membentuk kaitan KM setelah klasifikasi dan nomor registrasi tersedia. Pustaka memisahkan dokumen dari job, correlation ID, attempt, dan riwayat proses. Tanya Dokumen memfilter riwayat awal berdasarkan dokumen pada URL. Ekstraksi memakai `fieldIds` profil yang sama untuk render, hitungan, kesiapan kirim, candidate payload, serta evidence, lalu memakai extraction run sebagai kunci idempotensi kandidat.

## Kemampuan server yang dibutuhkan

Integrasi tidak boleh mengubah kontrak visual utama. Server perlu menyediakan kemampuan berikut:

1. sesi terautentikasi dan izin per peran;
2. daftar serta rincian rekam resmi;
3. pembuatan pekerjaan pengumpulan dengan status queued, running, retrying, succeeded, failed, atau failed permanently;
4. staging kandidat individual yang mempertahankan pengaju, pemilik, sumber, waktu, dan jejak pekerjaan;
5. pencarian pembanding terhadap seluruh rekam resmi yang relevan, beserta versi kandidat dan status hasil pencocokan;
6. keputusan manusia dengan ID pelaku, alasan, target hubungan, instant ISO, dan audit;
7. permintaan perbaikan, bidang yang boleh diubah, versi baru, serta sebelum–sesudah;
8. unggahan dokumen tervalidasi, pemindaian keamanan, dan status pemrosesan;
9. pengambilan jawaban hanya dari dokumen yang diizinkan, beserta kutipan halaman;
10. profil ekstraksi berversi dan kandidat per bidang;
11. promosi kandidat melalui transaksi server setelah keputusan yang sah;
12. ekspor dan audit sesuai izin;
13. direktori peran, katalog izin, hak akses bawaan tiap peran, dan penyesuaian izin per akun beserta efek memberi atau membatasi.

### Kontrak integrasi Anggota

Audit terhadap `bht-nexus-server` branch `main` pada commit `87e0f0fe1ec06ea1d0f2b5001d1293e05b63bc7f` menemukan batas berikut:

- tabel `member` baru menyimpan `user_id`, status keanggotaan, visibilitas publik, dan tanggal bergabung;
- `user_id` wajib, unik, dan terhubung ke `user`, sehingga anggota tanpa akun belum dapat disimpan, sedangkan akun tanpa anggota sudah dimungkinkan;
- nama, email, dan foto masih berada pada entitas `user`; unit, bidang keahlian, penugasan CoE, serta pengenal SINTA, ORCID, Google Scholar, Scopus, dan ResearcherID belum mempunyai kontrak penyimpanan anggota;
- `AppModule` belum memasang modul atau endpoint CRUD Anggota;
- autentikasi menyediakan registrasi email mandiri, tetapi belum menyediakan undangan admin yang membuat akun lalu menautkannya secara eksplisit ke ID anggota;
- role, permission, dan penugasan role sudah dimodelkan terpisah dari `member`, sejalan dengan batas halaman ini bahwa profil anggota tidak menjadi tempat mengubah hak akses.

Sebelum adapter frontend dihubungkan, kontrak server perlu memungkinkan profil anggota dibuat tanpa akun, menyediakan hubungan akun-ke-anggota yang eksplisit dan opsional, menyediakan CRUD/pencarian/filter/nonaktif sesuai izin beserta audit, menerapkan keunikan pengenal eksternal, dan menyediakan alur undangan akun administratif. Bentuk tabel akhirnya merupakan keputusan tim backend; frontend hanya mensyaratkan perilaku tersebut dan tidak menebak hubungan identitas dari email.

### Kontrak integrasi Profil Saya

Profil pribadi tidak memiliki sumber data tersendiri. `resolveNexusProfile` memproyeksikan satu akun menjadi tampilan profil dan menandai asal informasinya: `MEMBER` ketika akun terhubung ke anggota, dan `ACCOUNT` untuk akun non-anggota, akun yang hubungannya belum ditentukan, serta akun yang hubungannya perlu diperiksa. Penyimpanan mengikuti tanda yang sama, sehingga penyuntingan dari Profil Saya mendarat pada rekam anggota kanonis atau pada informasi pribadi milik akun, tidak pernah pada salinan kedua. Identitas header, aktor tindakan baru, serta seluruh presentasi manusia dan kelengkapan di Administrasi memakai penyelesai yang sama. Kelengkapan hanya mensyaratkan nama lengkap dan nomor HP; optional field tidak mengubah hasilnya.

Transisi hubungan memakai aturan lossless: data Account boleh tetap tersimpan ketika Member aktif sebagai sumber, tetapi tidak disalin ke Member, tidak digabung berdasarkan kemiripan, dan tidak dihapus. `LINKED` selalu membaca bidang pribadi yang beririsan dari Member. Bila hubungan kembali menjadi non-anggota, data Account yang sebelumnya tersimpan menjadi aktif kembali.

Karena seluruh anggota pada direktori awal merupakan orang nyata, tidak ada satu pun fixture akun yang ditautkan ke mereka. Akibatnya keadaan `LINKED`—kartu keanggotaan pada Profil Saya dan tab akses akun pada Anggota—tidak dapat dilihat pada data awal, meskipun jalurnya tetap dijalankan dan diperiksa memakai data sintetis sementara yang tidak ikut disimpan. Contoh `LINKED` yang permanen baru layak ditambahkan bila layanan anggota sudah menyediakan hubungan akun yang sah, atau bila tersedia anggota fiktif yang memang disepakati untuk data contoh.

Akun yang sedang diwakili ruang kerja ditentukan `NEXUS_CURRENT_ACCOUNT_ID` pada direktori akun. Nilai ini merupakan pemilihan sementara sampai sesi masuk yang sebenarnya tersedia; ia tidak boleh diganti dengan pemilihan implisit seperti baris pertama daftar akun.

Audit terhadap `bht-nexus-server` branch `main` menemukan batas berikut untuk profil pribadi:

- entitas `user` menyimpan nama, email, status verifikasi email, gambar, dan waktu penggantian kata sandi terakhir; nomor HP, nama panggilan, ringkasan profil, dan email alternatif belum mempunyai kontrak penyimpanan;
- tabel `account` merupakan catatan kredensial penyedia autentikasi, bukan konsep Akun BHT Nexus pada antarmuka; keduanya tidak boleh disamakan ketika adapter dibuat;
- `AuthController` menyediakan registrasi, masuk, verifikasi email dengan OTP, permintaan dan pelaksanaan reset kata sandi dengan OTP, keluar, serta pembacaan sesi aktif;
- belum ada tindakan penggantian kata sandi untuk pengguna yang sudah masuk, belum ada endpoint pencabutan seluruh sesi, dan belum ada penghapusan akun mandiri. Karena itu kartu Keamanan hanya menyatakan bahwa penggantian kata sandi belum dapat dilakukan dari ruang kerja dan mengarahkan pengguna ke Dukungan BHT Nexus; antarmuka tidak menyimpan kata sandi dalam bentuk apa pun dan tidak menyatakan keberhasilan yang tidak dapat dipastikan;
- MFA tidak dimodelkan pada server maupun antarmuka.

Sebelum adapter dihubungkan, kontrak server perlu menyediakan pembacaan profil pengguna yang sedang masuk, penyimpanan bidang pribadi di atas beserta auditnya, dan—bila penggantian kata sandi mandiri memang diinginkan—satu tindakan terautentikasi yang memverifikasi kata sandi saat ini.

### Kontrak integrasi Peran dan Hak Akses

Audit terhadap `bht-nexus-server` branch `main` menemukan batas berikut untuk kebijakan akses:

- entitas `role` menyimpan `public_id`, nama mesin dengan pola `^[a-z][a-z0-9_.]*$`, nama tampilan serta deskripsi dwibahasa, tipe `system` atau `custom`, kategori, dan prioritas; nama mesin terpisah dari nama tampilan, sejalan dengan pengenal peran frontend yang tidak diturunkan dari label;
- peran sistem tidak dapat dihapus dan hanya dapat mengubah nama tampilan serta deskripsi, sedangkan peran lain dinonaktifkan melalui penghapusan lunak yang ditolak ketika peran masih dipakai; kedua aturan tersebut sudah tercermin pada tindakan halaman peran;
- entitas `permission` memakai nama datar `sumber_daya.tindakan`, dan `role_permission` hanya mencatat pemberian izin; belum ada kolom efek, sehingga larangan eksplisit belum mempunyai kontrak penyimpanan;
- belum ada tabel penyesuaian izin per pengguna. Akses khusus akun karena itu merupakan konsep produk yang masih menunggu kontrak server, termasuk penyimpanan, penegakan, dan auditnya;
- `user_role` memungkinkan satu pengguna memegang beberapa peran dengan masa berlaku opsional, sedangkan antarmuka saat ini masih menetapkan satu peran utama per akun;
- katalog izin server saat ini baru mencakup area IAM, pekerjaan, dan tinjauan; nama izin untuk modul data resmi, dokumen, pengumpulan, anggota, dan administrasi belum disepakati, begitu pula izin ekspor yang belum dipakai antarmuka;
- izin terhadap data tertentu pada REQ-FUNC-019 berada di luar matriks modul dan tindakan ini dan tetap perlu kontrak tersendiri.

Sebelum adapter dihubungkan, kontrak server perlu menyepakati nama izin per modul, cara menyimpan penyesuaian per akun beserta efeknya, serta cara membaca akses efektif satu akun. Bentuk tabel akhirnya merupakan keputusan tim backend; frontend hanya mensyaratkan perilaku tersebut.

Karena endpoint tersebut belum ada, komponen tidak memuat URL API spekulatif. Pemanggilan jaringan nantinya ditempatkan pada adapter server yang menggantikan fungsi konten tanpa mengubah kontrak visual utama.


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
4b. Ganti kebijakan akses tampilan dengan direktori peran, katalog izin, dan penyesuaian akun dari server.
5. Hubungkan unggahan dan polling status dokumen.
6. Hubungkan tanya jawab ke retriever yang mengembalikan kutipan terstruktur.
7. Hubungkan ekstraksi ke profil berversi dan staging kandidat.
8. Simpan keputusan, koreksi, dan audit melalui server.
9. Tambahkan pengujian kontrak serta pengujian end-to-end terhadap layanan nyata.
