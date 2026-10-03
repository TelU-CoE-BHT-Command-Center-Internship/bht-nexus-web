# Batas Data Frontend BHT Nexus

Dokumen ini mencatat dari mana setiap bagian antarmuka mengambil datanya: sebagian besar ruang kerja kini membaca dan menulis ke `bht-nexus-server`, sedangkan sisanya masih memakai data pratinjau di frontend. Data pratinjau dipakai untuk mengembangkan presentasi serta perilaku antarmuka; data tersebut bukan laporan resmi CoE BHT.

## Adapter server yang sudah terpasang

Setiap adapter menerjemahkan jawaban API ke bentuk data yang sudah dipakai komponen, sehingga tampilan tidak berubah ketika sumber datanya berpindah. Klien API berada di `src/lib/api-*.ts`; seluruh permintaan memakai cookie sesi HTTP-only dan token CSRF dari server, tanpa menyimpan token di browser.

| Area | Adapter | Endpoint server |
|---|---|---|
| Sesi dan identitas | `src/lib/api-server.ts`, `nexus-workspace-session.ts` | `GET /profile/me` (identitas, peran, izin efektif), cadangan `GET /auth/me` bila profil belum boleh dibaca |
| Masuk dan keluar | `src/lib/api-auth.ts` | `POST /auth/sign-in/email`, `POST /auth/sign-in/email-otp`, `POST /auth/two-factor/verify-totp/challenge`, `POST /auth/sign-out` |
| Menu dan kemampuan | `nexus-workspace-access.ts` | izin efektif dari `GET /profile/me`. Bila izin belum dijawab, web memakai cermin izin bawaan tiap peran; bila peran pun belum terbaca, seluruh menu tampil dan setiap halaman mengikuti jawaban server |
| Anggota | `nexus-member-server.ts` | `GET /members`, `GET /members/:id` |
| Publikasi | `nexus-publication-server.ts` | `GET /publications`, `GET /publications/:id` |
| Kegiatan & Pengabdian | `nexus-activity-server.ts` | `GET /activities`, `GET /activities/:id` |
| Kekayaan Intelektual, Kontrak & Proposal, Akademik | `api-house-records.ts`, `nexus-house-records.ts`, dan penerjemah `*-server.ts` tiap rumah | `GET /intellectual-properties`, `GET /contracts-proposals`, `GET /academics` (dengan `memberPublicId` untuk saringan anggota), rinciannya pada `/:id`, serta `POST /:id/completion-request` |
| Jejak rekam resmi | `api-record-trail.ts`, `nexus-record-trail.ts` | `GET /publications/:id/trail`, `GET /activities/:id/trail`, `GET /intellectual-properties/:id/trail`, `GET /contracts-proposals/:id/trail`, `GET /academics/:id/trail` untuk sumber pembentuk dan keputusan tinjauan pada rincian rekam |
| Dashboard | `nexus-dashboard-overview-server.ts` | `GET /dashboard/overview`, `GET /dashboard/announcements` |
| Monitoring KM | `nexus-official-records-hooks.ts` | membaca seluruh rekam resmi kelima rumah data lalu menghitung realisasi di klien |
| Pengumpulan | `nexus-scraper-search.tsx` | `GET /jobs`, `POST /jobs`, `GET /jobs/:id`, `GET /jobs/:id/attempts`, `POST /jobs/:id/retry`, `POST /reviews/cases/sync-from-job/:id` |
| Tinjauan | `nexus-review-server.ts` | `GET /reviews/cases`, rincian (termasuk rekam tujuan `targetEntityPublicId`), pembanding, `PATCH` kandidat dengan catatan bukti `reason`, keputusan dengan rekam tujuan opsional `linkTargetPublicId`, dan pemulihan pada `/reviews/cases/:id` |
| Pengajuan manual | `nexus-manual-submission-server.ts` | `POST /submissions/manual` untuk kelima rumah Data Resmi |
| Administrasi | `nexus-administration-server.tsx`, `nexus-account-server.ts` | `GET /admin/accounts`, `POST /admin/accounts/invite`, `PATCH /admin/accounts/:id/role`, `DELETE /users/:id/roles/:roleId`, `PATCH /admin/accounts/:id/status`, `PATCH /admin/accounts/:id/link-member` |
| Akses khusus | `nexus-user-access-server.tsx`, `nexus-account-special-access.ts` | `GET /admin/accounts/:id/permissions`, `PUT /admin/accounts/:id/permissions/override` |
| Peran & Hak Akses | `nexus-role-server.ts` | `GET/POST /roles`, `PATCH/DELETE /roles/:id`, `GET/POST /roles/:id/permissions`, `DELETE /roles/:id/permissions/:permissionId`, `POST /roles/:id/reset`, `GET /permissions` |
| Penolakan Akses | `nexus-audit-denials.tsx` | `GET /audit/permission-denials` |
| Profil Saya | `nexus-profile-server.ts` | `GET /profile/me`, `PATCH /profile/me`, `PATCH /profile/me/academic-identifiers` |

Bacaan pelengkap yang boleh ditolak server, misalnya direktori Anggota bagi akun yang tidak berwenang membacanya, diperlakukan sebagai tidak tersedia alih-alih kosong: nama anggota diambil dari akun yang tertaut dan jumlah yang tidak dapat dibaca tidak ditampilkan sebagai nol.

## Adapter data pratinjau

Bagian yang sudah tersambung ke server tidak lagi mengambil datanya dari adapter di bawah ini. Bentuk data dan komponennya tetap dipakai bersama, sedangkan target periode Monitoring KM dan Dokumen masih berjalan di atas adapter ini. Broadcast memakai layanan server sebagaimana dijelaskan pada [alur broadcast](broadcast-email.md).

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
| Broadcast / Newsletter | `NexusBroadcastStudio`, `api-broadcasts`, dan dokumen terstruktur | draf/gambar/penerima/antrean/hasil disimpan dan dibaca dari server; editor dibangun kembali dari isi tersimpan; checklist dan tampilan email memakai dokumen yang sama; pengiriman menampilkan hasil nyata per alamat |
| Anggota | `getNexusMemberDirectory` dan `getNexusMembersContent` | direktori master–detail, tambah dan ubah profil, pencarian, filter status dan bidang, keanggotaan, identitas akademik, jalur data terkait, serta hubungan akun opsional |
| Administrasi | `getNexusAdministrationContent` | daftar dan rincian akun, pencarian, filter status/role/hubungan anggota, satu alur undangan bertahap, editor hubungan, role tingkat tinggi, serta tindakan akses sesuai status |
| Pengajuan manual Data Resmi | `manualSubmissionDefinitions`, `createManualSubmissionReviewRecord`, dan route `/nexus/ajukan/[domain]` | form penuh untuk lima domain, bidang subtype berdasarkan workbook, periode evaluasi yang terpisah dari tahun/tanggal entitas, validasi metadata/tanggal/angka/URL, saran KM berbasis aturan, pencocokan pengenal dan judul termasuk rekam yang telah disetujui, draft sesi browser otomatis, serta pengiriman kandidat manual ke Tinjauan |
| Pengumpulan | `getNexusScraperSearchContent` dan `nexus-collection-identity` | validasi host serta pengenal orang pada profil publik, binding anggota yang dilepas ketika identitas sumber berubah, status pekerjaan, daftar kandidat individual, serta pengiriman kandidat ke sesi Tinjauan Indonesia |
| Tinjauan Indonesia | `getNexusAuditReviewContent` | satu antrean lintas-domain, filter sumber dan jenis data, metadata adaptif, pembanding, bukti, keputusan, status koreksi, versi, dan riwayat |
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

Impor Spreadsheet telah dihapus dari layanan server dan web. Tidak ada adapter impor, menu, templat, atau aksi unggah CSV/XLSX. Pengajuan manual dan kandidat hasil pengumpulan/ekstraksi tetap memakai jalur Tinjauan. Label asal spreadsheet pada rekam historis tetap menjadi catatan sumber; label tersebut tidak membuka kembali fitur impor.

Arah hubungannya satu jalur: halaman yang dibuka pengguna berada di `bht-nexus-web`, sedangkan login, aturan bisnis, pemrosesan, dan pengelolaan data berada di `bht-nexus-server` beserta basis data dan layanan pendukungnya.

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
14. pengiriman broadcast email sudah memakai unggah gambar, penerima, antrean, riwayat serta audit server; pengujian kotak masuk sungguhan membutuhkan konfigurasi penyedia/domain pengirim yang telah dimiliki.

Per 1 Oktober 2026 web sudah memakai butir 1 sampai 7, 11, dan 13, ditambah catatan penolakan akses dari butir 12. Integrasi broadcast kini memakai butir 14 dari layanan server pasangan; pengujian kotak masuk sungguhan masih memerlukan konfigurasi pengirim.

### Kontrak integrasi Anggota

Kontrak yang dipakai web pada `bht-nexus-server` branch `dev` (commit `4f10226`, 1 Oktober 2026):

- rekam `member` menyimpan nama, nama panggilan, kontak, unit, penugasan CoE, bidang keahlian, pengenal akademik (SINTA, Scopus, Google Scholar, ORCID, ResearcherID), foto, status keanggotaan, dan visibilitas publik. Anggota boleh belum mempunyai akun;
- membaca direktori dan rinciannya membutuhkan izin `member.read`. Menambah, mengubah, mengubah status, dan mengunggah foto anggota membutuhkan `iam.manage`. Pada izin bawaan server keduanya dipegang Auditor;
- hubungan akun ke anggota diatur dari Administrasi lewat `PATCH /admin/accounts/:id/link-member` dan bersifat satu akun untuk satu anggota. Kemiripan nama atau email tidak pernah dipakai untuk menebak hubungan. Dari rincian anggota, **Beri akses BHT Nexus** membuka undangan Administrasi dengan anggota itu sudah terpilih (`?inviteMember=`), dan **Kelola akun** membuka akun tertautnya (`?account=`).

### Kontrak integrasi Profil Saya

Profil pribadi tidak mempunyai sumber data tersendiri di web; halaman membaca `GET /profile/me` untuk akun yang sedang masuk. Jawabannya memuat identitas akun, peran, izin efektif, serta ringkasan anggota yang tertaut beserta pengenal akademiknya. Endpoint ini perlu dapat dibaca setiap pengguna yang masuk; pembukaan akses dan penambahan izin efektif diajukan sebagai perbaikan server yang menyertai integrasi ini.

- `PATCH /profile/me` menyimpan nama, nomor HP, ringkasan, dan gambar pada akun. Server menulis ulang keempat bidang sekaligus dan mengosongkan bidang yang tidak dikirim, sehingga web selalu mengirim ulang nilai yang tidak disunting.
- `PATCH /profile/me/academic-identifiers` menyimpan SINTA, Scopus, dan Google Scholar pada anggota yang tertaut, dengan aturan tulis ulang yang sama. Google Scholar disimpan sebagai pengenalnya saja, bukan tautan profil.
- Informasi pribadi pada rekam anggota, profil anggota, bidang keahlian, foto, ORCID, dan ResearcherID belum mempunyai jalur simpan mandiri. Bagian itu tetap tampil dengan penanda **Segera** atau sebagai bidang nonaktif beserta keterangannya.
- Penggantian kata sandi dari dalam ruang kerja, pencabutan sesi, dan penghapusan akun mandiri belum tersedia; kartu Keamanan mengarahkan pengguna ke Dukungan BHT Nexus.

Kelengkapan profil hanya mensyaratkan nama lengkap dan nomor HP. Hubungan akun dan anggota bersifat lossless: menautkan atau melepas tautan tidak menyalin, menggabungkan, atau menghapus data pada entitas lain.

### Kontrak integrasi Peran dan Hak Akses

- Izin server bernama `sumber_daya.tindakan`. Izin efektif satu akun adalah gabungan izin dari seluruh perannya, lalu disesuaikan penyesuaian khusus akun: tambahan, pembatasan, atau mengikuti peran.
- Pada izin bawaan server, peran Auditor memegang pengelolaan akun, peran, izin, dan penetapan peran, serta membaca direktori Anggota untuk menautkan akun, sedangkan Admin memegang data operasional serta pembacaan log. Rancangan antarmuka lama menempatkan pengelolaan akun pada Admin; pembagian ini masih menunggu keputusan tim.
- Rumah Data Resmi mengikuti izin bacanya masing-masing: Publikasi `publication.read`, Kekayaan Intelektual `intellectual_property.read`, Kontrak & Proposal `contract.read`, Akademik `academic.read`, serta Kegiatan & Pengabdian `activity.read`. Pengajuan ke setiap rumah data membutuhkan `job.create`.
- `PATCH /admin/accounts/:id/role` menambahkan peran, tidak mengganti. Web mengganti peran dengan menambah peran baru lebih dahulu, lalu mencabut peran lama lewat `DELETE /users/:id/roles/:roleId`. Server tidak menerima perubahan peran dan status untuk akun sendiri, dan menolak mencabut pemegang terakhir izin kelola peran akun.
- `DELETE /roles/:id` hanya berhasil untuk peran kustom yang tidak dipakai akun dan tidak lagi memegang izin; tidak ada pemulihan peran yang sudah dikeluarkan. `POST /roles/:id/reset` memulihkan hak akses peran bawaan dan membutuhkan `iam.manage`.
- Nama dan deskripsi peran disimpan dwibahasa. Deskripsi yang sudah tersimpan tidak dapat dikosongkan kembali, sehingga web meminta deskripsi pengganti.

### Kontrak integrasi Broadcast / Newsletter

`api-broadcasts` memanggil `GET /broadcasts`, `GET /broadcasts/recipients`, `GET /broadcasts/:public_id`, `POST /broadcasts`, `PATCH /broadcasts/:public_id`, serta endpoint gambar, percobaan, kirim dan coba lagi. Semua permintaan mengikuti cookie sesi, perlindungan CSRF dan izin efektif server. Menu memakai `broadcast.read`; perubahan serta pengiriman memakai `broadcast.manage`. Izin bawaan hanya diberikan kepada satu akun Pimpinan.

Draf berisi judul, dokumen terstruktur kanonis dan daftar gambar. Server memvalidasi dokumen, menghasilkan Markdown, HTML serta teks polos, lalu menyimpannya dengan versi. Editor dibangun kembali dari dokumen tersimpan; HTML mentah maupun JSON editor alternatif tidak dikirim sebagai sumber isi. Gambar PNG/JPG sampai 1 MB diunggah melalui server dan harus memakai alamat storage publik yang dikonfigurasi.

Peninjauan menahan versi draf dan hash daftar penerima. Pengiriman memeriksa keduanya kembali serta menentukan alamat dari anggota aktif yang mempunyai email institusi sah atau email alternatif. Alamat duplikat dihilangkan; anggota cuti/nonaktif tidak menerima. Percobaan memakai satu atau dua alamat yang diisi pengguna dan UUID permintaan tetap untuk mencegah kiriman ganda ketika mencoba permintaan yang sama setelah gangguan jaringan.

Server menyimpan salinan isi, pengirim, modus dan alamat penerima saat mengantre. Worker melanjutkan antrean pending setelah restart; hasil yang belum pasti tidak dikirim ulang otomatis. Riwayat serta hasil per alamat dibaca dari server. Konfirmasi layanan email memerlukan ID kiriman dan belum membuktikan pesan masuk ke kotak email; capture selalu ditampilkan sebagai penampung pemeriksaan lokal. Retry hanya mengantre ulang penolakan pasti.

Kertas tulis dan Tampilan email mempertahankan tata letak BHT Nexus. Gambar di kiri/kanan mengalir bersama teks pada desktop dan memenuhi lebar isi pada layar kecil. Rincian alur, penyimpanan draf dan arti hasil ada pada [Broadcast / Newsletter](broadcast-email.md).

## Aturan keamanan

- browser tidak menyimpan token rahasia di source code;
- URL sumber eksternal harus HTTPS dan host-nya divalidasi;
- worker tidak menerima kewenangan menulis data resmi;
- kutipan hanya berasal dari dokumen yang diizinkan bagi pengguna;
- jawaban tanpa bukti dikembalikan sebagai tidak didukung;
- isi dokumen, data personal, catatan administratif, dan nilai sensitif tidak boleh dimasukkan sebagai data frontend publik;
- identitas nyata hanya dipakai ketika baris sumbernya dapat diverifikasi; skenario sintetis wajib memakai identitas netral dan tidak memakai foto anggota;
- karya nyata yang tautan buktinya tidak dapat diverifikasi tidak dipertahankan sebagai data pengembangan publik, dan tautan sumber yang terbukti menunjuk karya lain tidak dipakai sebagai bukti;
- isi broadcast tervalidasi sebagai dokumen terstruktur di server; Markdown, HTML dan teks polos dihasilkan server dari dokumen yang sama, dan kunci layanan email tetap berada di server;
- audit permanen dibuat di server, bukan dipercaya dari state browser.

## Urutan migrasi

Langkah yang sudah selesai ditandai ✓.

1. ✓ Ganti sesi tampilan dengan sesi server dan halaman no-access yang nyata.
2. ✓ Ganti daftar pekerjaan serta kandidat individual dengan query server.
3. ✓ Pertahankan status dan bentuk keputusan yang sudah dipakai komponen.
4. ✓ Ganti provider sesi lintas halaman dengan endpoint staging dan kemampuan server tanpa mengubah model presentasi, untuk Anggota, Publikasi, Kegiatan & Pengabdian, Tinjauan, dan Administrasi.
4b. ✓ Ganti kebijakan akses tampilan dengan direktori peran, katalog izin, dan penyesuaian akun dari server.
4c. Sambungkan Kekayaan Intelektual, Kontrak & Proposal, Akademik, beserta pengajuannya ketika rumah datanya tersedia di server.
5. Hubungkan unggahan dan polling status dokumen.
6. Hubungkan tanya jawab ke retriever yang mengembalikan kutipan terstruktur.
7. Hubungkan ekstraksi ke profil berversi dan staging kandidat.
8. ✓ Simpan keputusan Tinjauan melalui server; koreksi Monitoring KM menyusul bersama data Monitoring dari server.
8b. Verifikasi Broadcast / Newsletter pada kotak masuk sungguhan setelah pengirim yang telah dimiliki dikonfigurasi.
9. Tambahkan pengujian kontrak serta pengujian end-to-end terhadap layanan nyata.
