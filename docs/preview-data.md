# Data Contoh BHT-Nexus Web

Daftar seluruh data contoh yang dipakai antarmuka, berkas tempat data itu
berada, dan endpoint yang akan menggantikannya. Satu baris dihapus ketika
endpointnya sudah tersedia.

Seluruh waktu disimpan sebagai ISO lokal (`2026-08-11T08:52`) dan ditampilkan
lewat `formatTimestamp` sebagai `HH:MM DD-MM-YY`.

## Yang termasuk data contoh

Setiap berkas `*-content.ts` memuat dua hal berbeda.

- **Rekaman**: larik objek yang meniru isi basis data, misalnya daftar dokumen
  atau kandidat. Bagian ini diganti oleh adapter server.
- **Teks antarmuka**: judul, label kolom, dan teks tombol untuk `id` dan `en`.
  Bagian ini tetap ada setelah endpoint tersedia.

Halaman publik (`landing-hero`, `members`, `news-highlights`, `latest-events`,
`partners`, `research-focus`, `location-map`, `site-header`, `site-footer`, dan
`src/content/coe-bht.ts`) memuat data institusi yang sebenarnya, bukan data
contoh, dan tidak termasuk daftar ini.

## Ruang kerja RAG

| Rekaman | Berkas | Simbol | Jumlah | Halaman |
|---|---|---|---|---|
| Dokumen terindeks | `nexus-rag-library/nexus-rag-library-content.ts` | `documentSeeds` | 6 | `/nexus/dokumen` |
| Riwayat pertanyaan dan sitasi | `nexus-rag-qa/nexus-rag-qa-content.ts` | `exchanges` | 3 per bahasa | `/nexus/tanya-dokumen` |
| Dokumen yang diekstraksi | `nexus-rag-extraction/nexus-rag-extraction-content.ts` | `documentTitle`, `documentMeta` | 1 per bahasa | `/nexus/ekstraksi` |
| Kandidat isian | `nexus-rag-extraction/nexus-rag-extraction-content.ts` | `fields` | 6 per bahasa | `/nexus/ekstraksi` |
| Daftar profil ekstraksi | `nexus-rag-extraction/nexus-rag-extraction-content.ts` | `profileOptions` | 4 per bahasa | `/nexus/ekstraksi` |

## Ruang kerja Scraper

| Rekaman | Berkas | Simbol | Jumlah | Halaman |
|---|---|---|---|---|
| Pencarian terkini (nama, tautan SINTA, tautan Scholar) | `nexus-scraper-search/nexus-scraper-search-content.ts` | `submissionSeeds` | 4 | `/nexus/pencarian-peneliti` |
| Ringkasan job | `nexus-scraper-jobs/nexus-scraper-jobs-content.ts` | `job` | 1 per bahasa | `/nexus/status-job` |
| Log percobaan | `nexus-scraper-jobs/nexus-scraper-jobs-content.ts` | `attempts` | 4 per bahasa | `/nexus/status-job` |
| Kandidat hasil | `nexus-scraper-results/nexus-scraper-results-content.ts` | `candidates` | 3 per bahasa | `/nexus/hasil-pengumpulan` |

## Dashboard dan kerangka ruang kerja

Data berikut sudah ada sebelum halaman RAG dan Scraper dibuat.

| Rekaman | Berkas | Simbol | Jumlah | Halaman |
|---|---|---|---|---|
| Identitas dan izin pengguna | `nexus-dashboard-shell/nexus-dashboard-shell-content.ts` | `previewSession` | 1 | seluruh ruang kerja |
| Notifikasi | `nexus-dashboard-shell/nexus-dashboard-shell-content.ts` | `notifications` | 1 per bahasa | seluruh ruang kerja |
| Metrik | `nexus-dashboard-overview/nexus-dashboard-overview-content.ts` | `metrics` | 4 | `/nexus/dashboard` |
| Grafik aktivitas | `nexus-dashboard-overview/nexus-dashboard-overview-content.ts` | `activitySeries` | 3 | `/nexus/dashboard` |
| Pengumuman | `nexus-dashboard-overview/nexus-dashboard-overview-content.ts` | `announcements` | 3 | `/nexus/dashboard` |
| Aktivitas terkini | `nexus-dashboard-overview/nexus-dashboard-overview-content.ts` | `recentActivities` | 6 | `/nexus/dashboard` |
| Proyek terkini | `nexus-dashboard-overview/nexus-dashboard-overview-content.ts` | `recentProjects` | 5 | `/nexus/dashboard` |
| Program unggulan | `nexus-dashboard-overview/nexus-dashboard-overview-content.ts` | `featuredPrograms` | 2 | `/nexus/dashboard` |

## Bukan data contoh

Tiga nilai berikut berada pada berkas yang sama tetapi merupakan konfigurasi,
bukan rekaman. Nilainya berpindah ke berkas konfigurasi atau ke respons
endpoint, tidak dihapus begitu saja.

| Nilai | Berkas | Isi |
|---|---|---|
| `sourceOptions` | `nexus-scraper-search-content.ts` | SINTA, Google Scholar |
| `navigationDefinitions` | `nexus-dashboard-shell-content.ts` | 11 butir navigasi beserta izinnya |

## Endpoint pengganti

Prefiks `/api/v1` ditetapkan REQ-INT-003. Nama sumber daya mengikuti folder
modul yang sudah ada di `nexus-server/src/modules/`. Bentuk rute mengikuti
`scraper/backend` yang sudah berjalan. Seluruh baris di bawah berstatus usulan:
`nexus-server` belum memiliki satu pun controller.

| Rekaman | Endpoint usulan | Sudah ada hari ini |
|---|---|---|
| Identitas dan izin pengguna | `GET /api/v1/sessions/me` | belum |
| Dokumen terindeks | `GET /api/v1/documents` | belum |
| Unggah dokumen | `POST /api/v1/documents` lalu `POST /api/v1/jobs` | belum |
| Riwayat pertanyaan dan sitasi | belum diputuskan | `POST /ask` pada `rag-api` |
| Daftar profil ekstraksi | `GET /api/v1/extraction-profiles` | `GET /profiles` pada `rag-api` |
| Kandidat isian | `GET /api/v1/reviews/candidates` | `POST /autofill` pada `rag-api` |
| Pencarian terkini | `GET /api/v1/jobs` | `POST /scraper-jobs` pada `scraper/backend` |
| Ringkasan job | `GET /api/v1/jobs/:id` | `GET /scraper-jobs/:id` |
| Log percobaan | `GET /api/v1/jobs/:id/attempts` | `GET /scraper-jobs/:id/attempts` |
| Kandidat hasil | `GET /api/v1/jobs/:id/candidates` | `GET /scraper-jobs/:id/candidates` |
| Keputusan tinjauan | `POST /api/v1/jobs/:id/candidates/:candidateId/decision` | rute yang sama pada `scraper/backend` |
| Metrik dan grafik aktivitas | `GET /api/v1/kpis` | belum |
| Aktivitas terkini | `GET /api/v1/audit-log` | belum |

Empat rekaman belum memiliki modul di `nexus-server`: notifikasi, pengumuman,
proyek terkini, dan program unggulan. Modul untuk keempatnya perlu ditetapkan
sebelum endpointnya dapat dinamai.

Jalur RAG untuk riwayat pertanyaan masih terbuka. `rag/docs/NEXUS_HANDOFF.md`
mencatat bahwa `rag_query` belum diputuskan akan memakai pembungkus job atau
endpoint sinkron, dengan latensi terukur 3m40.7s dingin dan 20.0s hangat.

## Cara mengganti satu rekaman

1. Ganti isi fungsi `get*Content(locale)` pada berkas terkait agar memanggil
   endpointnya, sisakan bagian teks antarmuka apa adanya.
2. Hapus larik seed dan tipe `*Seed` yang menyertainya.
3. Hapus baris rekaman tersebut dari dokumen ini.
4. Pengurutan kolom berjalan di peramban lewat `useTableSort`. Pindahkan ke
   parameter kueri endpoint bila jumlah baris melampaui satu halaman.
