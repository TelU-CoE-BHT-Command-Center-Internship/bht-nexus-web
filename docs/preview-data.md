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
| Monitoring KM | `useNexusMonitoringData` yang menggabungkan `useNexusOfficialRecords`, `nexusMonitoringRecordsFrom`, dan versi target periode, lalu `getNexusMonitoringLandingData`, `buildIndicatorView`, serta `nexusMonitoringPeriodWorkbook` | menghitung realisasi di klien dari rekam resmi sesi yang sama dengan rumah Data Resmi, sehingga persetujuan Tinjauan dan koreksi langsung ikut membentuk angka; periode dibawa `?periode=`; target per periode berversi; unduhan XLSX per periode dan per indikator |
| Periode dan target | `NexusMonitoringSessionProvider`, `nexusWorkbookPeriods`, dan `nexusWorkbookTargetVersions` | periode 2026 dan target versi 1 dari workbook; periode baru dan versi target berikutnya ditambahkan pengelola selama layout workspace aktif |
| Rekam resmi kanonis | `nexus-official-records` (`projectNexusOfficialRecordSet`, `useNexusOfficialRecords`, `useNexusOfficialHomeRecords`) | satu jalur proyeksi untuk kelima rumah data dan Monitoring: pelengkapan metadata, keputusan Tinjauan, lalu koreksi Monitoring |
| Broadcast / Newsletter | `NexusBroadcastStudio`, `summarizeBroadcastRecipients`, `serializeBroadcastMarkdown`, dan `nexusBroadcastDelivery` | draf judul, isi, dan gambar lokal hanya di memori halaman; penerima dihitung dari `NexusMemberSessionProvider`; checklist dan tampilan email dibentuk dari model dokumen yang sama dengan Markdown; pengiriman berstatus `UNAVAILABLE` sehingga alur berhenti pada peninjauan |
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

Model Publikasi memisahkan bentuk karya, klasifikasi pelaporan, dan metrik luar. `type` adalah metadata bibliografis dan tidak pernah diturunkan dari indikator KM; `kmLinks` boleh kosong; `quartile` hanya terisi untuk artikel jurnal, sedangkan nilai kolom sumber untuk bentuk karya lain disimpan pada `sourceReportedQuartile` tanpa pernah diklaim sebagai kuartil terverifikasi. `year` adalah tahun terbit dan terpisah dari `evaluationPeriod`. `publishedOn` hanya terisi untuk rekam yang worksheet asalnya memang memuat kolom tanggal publikasi; nilainya ditulis `YYYY-MM` ketika sumber hanya mencatat bulannya, sehingga hari yang tidak dicatat tidak pernah dikarang dan rekam dari worksheet tanpa kolom tanggal tetap tidak bertanggal. Setiap entri asal-usul data menyimpan rentang baris sumbernya, dan perbedaan antarbaris disimpan sebagai catatan, bukan dihapus. Rekam yang bentuk karyanya belum dapat dipastikan tidak dinyatakan lengkap.

Model Kekayaan Intelektual memisahkan bentuk perlindungan, klasifikasi pelaporan, dan keberadaan dokumen. `protection` adalah metadata rekam dan tidak diturunkan dari indikator KM; `kmLinks` boleh kosong; `documentAccess` membedakan dokumen publik, dokumen yang tersimpan internal, dan dokumen yang belum tercatat sehingga penyimpanan internal tidak dihitung sebagai metadata yang hilang. Judul, pencipta, nomor registrasi, dan referensi sumber pada adapter frontend bersifat netral; URL penyimpanan internal tidak dimasukkan ke repository.

Model evaluasi KM memisahkan empat hal: identitas indikator pada registry KM, keterangan indikator menurut workbook KM 2026, target milik satu periode evaluasi, dan hasil hitung dari data resmi. Target tidak lagi menjadi bagian dari definisi indikator: `NexusIndicatorTargetVersion` menyimpan nilai, versi, asal (`workbook`, `copied`, `manual`), alasan, pelaku, dan waktu per indikator per periode, dan perubahan selalu menambah versi baru. Realisasi hanya dibentuk oleh rekam Data Resmi dengan kaitan KM eksplisit pada periode yang sama, dideduplikasi menurut pengenal resmi, dan selalu sama dengan jumlah baris data pembentuk yang ditampilkan. Nilai realisasi 2025 serta total triwulan pada worksheet `Evaluasi 2026` tidak pernah dipakai sebagai realisasi. Triwulan rekam ditentukan tanggal bisnisnya; bila tanggal belum tercatat, dipakai `reportedQuarter` (triwulan dilaporkan pengaju, auditor, atau kolom tanpa judul `no.11!I`, `no.13!K`, `no.14!K` pada workbook yang berisi "Q1"/"Q2" sebagai penanda triwulan pelapor). Waktu pembaruan, waktu tinjauan, dan waktu pengambilan sumber tidak pernah dipakai untuk triwulan.

Koreksi Monitoring (`OfficialRecordCorrection`) adalah daftar bertambah per `publicId` yang menulis bidang penentu perhitungan—tanggal bisnis sesuai rumah data, tahun, triwulan dilaporkan, bentuk karya, kuartil, bentuk perlindungan, nomor pencatatan, dan kaitan KM—langsung ke rekam resmi, beserta perubahan sebelum–sesudah, alasan, pelaku, dan waktu. Koreksi diterapkan setelah keputusan Tinjauan; keputusan Tinjauan yang datang kemudian pada bidang yang sama tetap ditimpa koreksi yang lebih awal sampai urutan waktu disediakan layanan server.

Model Akademik memisahkan bentuk kegiatan, klasifikasi pelaporan, dan bukti. Cakupannya adalah KM-28 sampai KM-32. Kegiatan dengan beberapa pembimbing tetap menjadi satu rekam dan dapat mempertahankan beberapa jejak sumber. Magang memakai NIM, mahasiswa, fakultas, program studi, program MBKM, penyelenggara, pembimbing, durasi, tahun, dan bukti; kompetisi tidak dipaksa memakai bidang magang. Topik, pembimbing, mahasiswa, serta referensi sumber pada adapter frontend bersifat netral.

Model Kegiatan & Pengabdian memisahkan pembicara dan kunjungan internasional (KM-9–KM-10) serta delapan bentuk rekam pada KM-20–KM-27. Unit bisnis, komunitas, konferensi, program pengabdian, proposal, dan jurnal hanya menampilkan bidang worksheet masing-masing. Pihak, program, komunitas, nilai dana, serta referensi sumber pada adapter frontend bersifat netral.

Model Anggota mengikuti kebutuhan identitas pada SRS: profil, status aktif/cuti/nonaktif, visibilitas publik, unit, bidang keahlian, dan pengenal eksternal dipisahkan dari akun login serta role/permission. Adapter menggunakan kembali nama, foto, penugasan, serta deskripsi yang sudah dipublikasikan pada halaman institusional. Satu definisi identitas kanonis menulis ID awal secara eksplisit dan dipakai bersama oleh konten publik, direktori, serta alias fixture; nama tampilan dapat berubah tanpa mengubah ID. Tanggal bergabung, kontak personal, dan pengenal akademik yang belum tersedia dibiarkan kosong; alamat email umum CoE tidak disalin sebagai email personal setiap anggota, dan penugasan organisasi tidak diduplikasi sebagai bidang keahlian. Anggota baru dapat dicatat tanpa email atau foto; avatar inisial menjadi fallback dan visibilitas publik tidak aktif secara bawaan. Form tambah dan ubah memakai bentuk data serta validasi yang sama, termasuk normalisasi, format, dan keunikan lima pengenal akademik selama halaman aktif. Editor foto menyimpan sumber asli dan hasil crop sebagai dua nilai berbeda sehingga avatar dapat diatur ulang tanpa kehilangan komposisi awal. `NexusMemberSessionProvider` memiliki perubahan profil selama layout aktif tanpa mencampurkan data akun ke rekam anggota. Anggota boleh belum mempunyai akun; state akses `NONE`, `LINKED`, atau `CONFLICT` selalu diproyeksikan dari state akun workspace. Pemberian akses hanya tersedia pada `NONE`, akun sah dapat dibuka kembali di Administrasi, dan konflik diarahkan untuk ditinjau tanpa dipresentasikan sebagai tidak memiliki akses.

Model Administrasi memisahkan identitas akun, hubungan anggota, role tingkat tinggi, dan status akses. `NexusAccountSessionProvider` menjadi satu pemilik mutasi akun selama layout workspace aktif; Administrasi mengelolanya dan Anggota hanya memproyeksikan hasilnya. Nama manusia, avatar, pencarian, dan kelengkapan memakai `resolveNexusProfile`, sedangkan `displayName` Account tetap menjadi alias/fallback dan tidak disinkronkan melalui salinan. Pilihan serta referensi anggota selalu diturunkan dari `NexusMemberSessionProvider` melalui ID, nama publik, dan penugasan kanonis. Relasi memakai union eksplisit `LINKED`, `NON_MEMBER`, `UNLINKED`, dan `CONFLICT`; hubungan ganda ke satu anggota dinormalisasi sebagai konflik dan kemiripan nama atau email tidak pernah menjadi keputusan identitas. Perubahan hubungan tidak menyalin atau menghapus data pribadi. Informasi pribadi Account tetap tersimpan tetapi tidak aktif selama `LINKED`, lalu dipakai kembali ketika Account menjadi non-anggota. Fixture akun operasional dan current Account memakai identitas netral dan tidak menautkan keadaan privat rekaan ke nama anggota publik. `ACTIVE`, `INVITED`, serta `SUSPENDED` merupakan nilai mesin dan memakai satu label Indonesia bersama. Konsep `accountKind` dihapus karena belum memiliki kontrak berwenang. Role hanya membawa label, deskripsi, dan ringkasan tinggi yang konservatif; resolusi `KNOWN`, `UNASSIGNED`, dan `UNKNOWN` mencegah role stale tampil sebagai belum ditetapkan atau bocor sebagai key mesin. Permission, data scope, email, token undangan, autentikasi, transaksi status, serta audit harus datang dari dan ditegakkan layanan server. Seluruh perubahan kembali ke fixture setelah muat ulang penuh dan tidak disimpan sebagai database browser.

Tautan Administrasi menuju Anggota membawa `?member=<memberId>`; parameter yang tidak dikenal menampilkan keadaan profil tidak ditemukan dan tidak pernah membuka orang lain secara diam-diam. Tautan Anggota menuju Administrasi membawa `?inviteMember=<memberId>` untuk alur undangan atau `?account=<accountId>` untuk akun yang sudah terhubung. `account` yang hadir memiliki prioritas: nilai sah membuka akun dan nilai tidak dikenal menampilkan keadaan akun tidak ditemukan; hanya ketika parameter itu tidak hadir barulah `inviteMember` dapat membuka undangan. Bila pengguna membatalkan undangan yang sedang dirujuk `account`, antarmuka membersihkan parameter itu dan kembali ke daftar akun alih-alih menandai tautannya tidak ditemukan. ID anggota undangan yang tidak dikenal juga gagal aman dan tidak membuka formulir generik. Loading dan error memakai file convention route Next.js, sedangkan no-access mengikuti kontrak kemampuan workspace. Dialog konfirmasi bersama menjaga fokus dan dipakai untuk draft yang belum disimpan, perubahan hubungan, serta tindakan status yang memerlukan konfirmasi.

ID anggota menjadi kunci lintas-alur pada state frontend. Pengumpulan yang dimulai dari profil anggota membuat binding dari `memberId`, sumber, pengenal orang eksternal, dan profil akademik; binding dilepas ketika nama konteks, sumber, atau identitas URL berubah. Kandidat multi-orang menyimpan `memberId` bersama ID orang kandidat tertentu, bukan hanya pada level rekam. Pada Tinjauan, correction yang mengubah identitas orang membatalkan binding lama dan reviewer memilih ulang orang yang tepat. Pembaruan atau merge ke Data Resmi memakai pemetaan eksplisit dari ID orang kandidat ke ID orang resmi sehingga relasi coauthor existing tidak hilang atau berpindah. Penulis publikasi, pencipta kekayaan intelektual, dan pembimbing akademik menyimpan ID rekam pihak serta `memberId` opsional sebagai dua hal berbeda. Filter Data Terkait membaca `?member=...` pada kelima rumah data resmi. Hubungan dari server harus selalu mengirim ID anggota, ID orang sumber, dan pemetaan person secara eksplisit; kemiripan nama tidak menjadi kontrak identitas.

Visibilitas profil publik pada state internal belum mengubah `/anggota` secara lintas-route karena halaman publik masih memakai sumber konten institusional statis. Kontrolnya adalah kontrak presentasi untuk layanan anggota, bukan klaim bahwa perubahan lokal sudah tersimpan atau langsung terbit.

Form pelengkapan metadata dipakai bersama oleh seluruh rumah data resmi melalui `NexusMetadataCompletionForm`. Kosakata bidang, aturan pengecualian, normalisasi DOI, hubungan tanggal kontrak, dan validasinya berada pada satu model sehingga alur usulan tidak bercabang per domain. Koreksi pada Tinjauan memakai aturan nilai yang sama; nilai atau pengecualian yang disetujui ditampilkan kembali pada halaman asal selama sesi. Usulan terminal yang ditolak atau masih meninggalkan bidang wajib dapat dilanjutkan tanpa menghapus rekam tinjauan sebelumnya.

Model Tinjauan sudah memisahkan `candidateKind`, sistem sumber, pengaju manusia, penerima koreksi, pemilik, dan pihak utama. Identitas serta label KM-1 sampai KM-46 hanya berasal dari `src/content/nexus-km-indicators.ts`, berdasarkan worksheet `List KM` pada workbook KM 2026; metadata Monitoring/Evaluasi KM yang belum dipakai tidak dimodelkan lebih awal. Kaitan indikator, URL bukti, dan bidang provenance boleh kosong; ketiadaan data tidak diisi dengan tautan umum, DOI, fingerprint, atau klasifikasi buatan. Contoh publikasi atau buku dapat memakai identitas nyata jika sumber penerbitnya publik, sedangkan kontrak, bimbingan, proposal internal, HKI, paten, dan bukti privat memakai identitas netral. Setiap pengaju atau penerima tugas manusia memiliki ID pengguna stabil; akun layanan hanya menjadi provenance dan tidak menerima tugas koreksi. Current reviewer memakai ID current Account yang sama dengan tindakan akun. Label event baru memakai proyeksi Profile pada waktu tindakan, sedangkan label event lama tetap menjadi snapshot dan tidak ditulis ulang setelah Profil berubah. Identitas yang tidak diketahui menutup hak review dan koreksi secara aman. Hasil pencocokan membawa versi dan status tersendiri, sehingga hasil V1 tidak dapat dipakai untuk memutuskan V2. Keputusan merge atau pembaruan menyimpan ID rekam tujuan, person binding kandidat, serta pemetaan person ke rekam resmi. `confirmed` dan `changed` menetapkan kaitan KM, `removed` menghapusnya, sedangkan `undetermined` mempertahankan kaitan existing pada update atau merge. Event audit menyimpan instant ISO dan baru diformat ke WIB ketika dirender. Riwayat koreksi bersifat bertambah, mempertahankan versi serta perubahan sebelum–sesudah. Kemampuan per rekam seperti `canApprove`, `canRequestChanges`, `canReject`, dan `canSubmitCorrection` adalah bentuk data dari batas server; nilainya saat ini hanya mengatur presentasi frontend dan bukan pengamanan browser. `NEXUS_REVIEW_POLICY.allowSelfReview` mengizinkan pengaju memutuskan kirimannya sendiri karena tim saat ini satu sampai dua auditor; keputusan itu diberi penanda `selfReview` dan tampil sebagai persetujuan mandiri pada riwayat. Pilihan KM reviewer dibatasi pada indikator yang realisasinya dibentuk dari rumah data kandidat, ditambah indikator yang belum dipantau.

Hasil pelengkapan metadata memakai empat state bersama: `available`, `not-available`, `not-applicable`, dan `unresolved`. Karena itu pengecualian yang sudah disetujui tidak pernah diberi label “Tersedia” pada daftar, kartu, filter, maupun rincian. Proyeksi Publikasi menghitung ulang hubungan jenis karya dan kuartil, sedangkan proyeksi HKI baru membentuk kaitan KM setelah klasifikasi dan nomor registrasi tersedia. Pustaka memisahkan dokumen dari job, correlation ID, attempt, dan riwayat proses. Tanya Dokumen memfilter riwayat awal berdasarkan dokumen pada URL. Ekstraksi memakai `fieldIds` profil yang sama untuk render, hitungan, kesiapan kirim, candidate payload, serta evidence, lalu memakai extraction run sebagai kunci idempotensi kandidat.

## Kemampuan server yang dibutuhkan

Arah hubungannya satu jalur: halaman yang dibuka pengguna berada di `bht-nexus-web`, sedangkan login, aturan bisnis, pemrosesan, dan pengelolaan data berada di `bht-nexus-server` beserta basis data dan layanan pendukungnya. Pada tahap ini hubungan tersebut masih menjadi arah pengembangan—web belum mengirim satu pun permintaan ke server.

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
13. direktori peran, katalog izin, hak akses bawaan tiap peran, dan penyesuaian izin per akun beserta efek memberi atau membatasi;
14. pengiriman broadcast email: unggah gambar ke penyimpanan publik, penentuan penerima di server menurut aturan penerima, pengiriman ke banyak penerima beserta hasil per penerima, serta riwayat broadcast dan auditnya.

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

### Kontrak integrasi Broadcast / Newsletter

Meeting Minggu 12 menyepakati broadcast disusun pengurus melalui editor seperti LMS, dikirim ke seluruh anggota, berisi teks, tautan, judul, dan gambar opsional, disimpan sebagai Markdown, dan pemicunya ditambahkan pada server. Audit terhadap `bht-nexus-server` branch `dev` pada commit `6d93a20b35e352630211c46c308d3b85641a611d` (24 September 2026) menemukan batas berikut:

- `EmailService` mengirim email transaksional ke satu penerima melalui Resend dengan alamat pengirim dari `SENDER_EMAIL`, paling banyak tiga percobaan dengan batas waktu 8 detik. Templatnya baru mencakup OTP, sambutan, status akun, dan keamanan;
- belum ada modul, endpoint, antrean, atau tabel riwayat broadcast, dan belum ada pengiriman ke banyak penerima;
- `baseEmailLayout` membungkus isi dengan pita BHT Nexus `#1e3a8a`, kartu 600 px, padding isi 32 px, Arial 14 px dengan tinggi baris 1,6, serta catatan kaki otomatis yang memakai `CONTACT_NAME`, `CONTACT_WHATSAPP`, dan `CONTACT_EMAIL`. Templat yang ada menaruh judul sebagai `<h1>` 20 px `#0f172a` dengan jarak bawah 16 px di awal isi;
- aturan unggah `FILE_TYPE_LIMITS_MB` membatasi png, jpg, dan jpeg sampai 1 MB.

Kertas tulis dan Tampilan email di halaman meniru tata letak tersebut. Nama kontak pada catatan kakinya ditulis umum karena nilainya berasal dari konfigurasi server.

Permintaan kirim yang disiapkan frontend adalah `BroadcastSendRequest`:

- `subject` berisi judul email yang sudah dipangkas; antarmuka membatasinya 150 karakter;
- `body` berisi `{ format: "markdown", markdown }`;
- `images` berisi gambar yang sudah diunggah, masing-masing dengan `imageId`, `alt`, dan `url` publik;
- `recipients` berisi `{ mode: "ACTIVE_MEMBERS_WITH_EMAIL" }`. Frontend mengirim aturan, bukan daftar alamat, dan server menentukan penerimanya sendiri: anggota berstatus aktif, email institusi atau email alternatif bila email institusi kosong, serta satu email untuk setiap alamat yang sama.

Gambar diunggah lebih dahulu melalui layanan penyimpanan server, lalu alamat publiknya dimasukkan ke Markdown. `nexusBroadcastDelivery` menjadi titik sambung `uploadImage` dan `send` ketika layanan tersedia; sampai saat itu statusnya `UNAVAILABLE` dan halaman tidak pernah menyatakan email terkirim.

Markdown dihasilkan `serializeBroadcastMarkdown` dalam dialek CommonMark dengan batasan berikut: tebal dan miring ditulis sebagai `<strong>` dan `<em>`; tautan ditulis `[teks](<url>)` dan hanya untuk http atau https; Judul besar menjadi `##` dan Subjudul menjadi `###`; pindah baris di dalam paragraf memakai garis miring terbalik di akhir baris; tanda baca Markdown pada teks penulis di-escape; dan gambar ditulis sebagai `<img src alt width data-align>` dengan `width` dalam piksel email—persentase dari lebar isi 536 px—serta `data-align` bernilai `left`, `center`, atau `right`. Server perlu merender Markdown dengan renderer yang sesuai CommonMark dan meneruskan HTML mentah tersebut, misalnya commonmark.js. `marked` berbeda pada satu kasus tepi: paragraf setelah gambar di dalam butir daftar kehilangan pembungkus paragrafnya. Hasil render kemudian disaring sehingga hanya `p`, `h2`, `h3`, `strong`, `em`, `br`, `ul`, `ol` dengan `start`, `li`, `a` dengan `href` http atau https, dan `img` dengan `src`, `alt`, `width`, serta `data-align` yang tersisa.

Aturan tampilan berikut dipakai kertas tulis dan Tampilan email, dan perlu diterapkan server agar hasil kirimnya sama:

- judul email menjadi `<h1>` pertama pada isi, mengikuti templat lain;
- `data-align="left"` atau `"right"` menjadi gambar mengapung dengan jarak `4px 16px 12px 0` atau `4px 0 12px 16px`. Atribut `align="left"` atau `"right"` sebaiknya ikut ditulis karena Outlook desktop tidak mengenal `float`; pada klien seperti itu gambar tampil di atas teks tanpa aliran di sampingnya dan isinya tetap terbaca;
- `data-align="center"` menjadi gambar blok di tengah dengan jarak bawah 16 px;
- `h2` dan `h3` memakai `clear: both`, sedangkan daftar memakai `overflow: hidden` agar tanda butirnya tidak menempel pada gambar;
- media query untuk layar selebar 600 px atau kurang mengubah gambar kiri dan kanan menjadi selebar isi tanpa mengapung.

Hasil pengiriman hanya ditampilkan bila berasal dari server: `SENDING`, `SENT`, `PARTIALLY_SENT`, atau `FAILED`, beserta jumlah penerima yang diminta, diterima, dan gagal, ringkasan kegagalan, serta instant ISO waktu kirim. Riwayat broadcast menampilkan judul, penyusun, jumlah penerima, waktu kirim, dan hasil dari data server yang sama.

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
- isi broadcast selalu disaring di server sebelum dikirim; frontend hanya menghasilkan kosakata Markdown yang tercantum pada kontrak Broadcast / Newsletter, dan kunci layanan email tetap berada di server;
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
8b. Hubungkan Broadcast / Newsletter ke unggah gambar, pengiriman email, dan riwayat pengiriman server.
9. Tambahkan pengujian kontrak serta pengujian end-to-end terhadap layanan nyata.
