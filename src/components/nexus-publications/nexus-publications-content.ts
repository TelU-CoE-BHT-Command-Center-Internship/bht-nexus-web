import type { ImageProps } from "next/image";
import ditaPuspitasariPhoto from "@/assets/members/dita-puspitasari.webp";
import fathurRahmanPhoto from "@/assets/members/fathur-rahman.webp";
import hestySusantiPhoto from "@/assets/members/hesty-susanti.png";
import lailyAdeOktavianaPhoto from "@/assets/members/laily-ade-oktaviana.webp";
import miftadiSudjaiPhoto from "@/assets/members/miftadi-sudjai.webp";
import salsabilaAurelliaPhoto from "@/assets/members/salsabila-aurellia.webp";
import suksmandhiraHarimurtiPhoto from "@/assets/members/suksmandhira-harimurti.webp";
import type { MetadataCompletionProposal } from "@/components/nexus-metadata-completion/nexus-metadata-completion-form";
import {
  type MetadataCompletionFieldKey,
  type MetadataCompletionResolutions,
  metadataCompletionFieldLabels,
} from "@/components/nexus-metadata-completion/nexus-metadata-completion-model";
import { personInitials } from "@/components/nexus-workspace-ui/nexus-workspace-format";
import {
  kmIndicator,
  type NexusKmIndicator,
} from "@/content/nexus-km-indicators";

/**
 * Bentuk karya menurut metadata bibliografis (SRS REQ-FUNC-022 `tipe karya`).
 * Sengaja TIDAK diturunkan dari indikator KM: KM adalah klasifikasi pelaporan,
 * sedangkan tipe adalah sifat karyanya sendiri. Workbook membuktikan keduanya
 * bisa berbeda — definisi KM-13 mencakup book chapter, dan ada baris KM-13
 * yang wadah terbitnya justru prosiding konferensi.
 */
type PublicationType =
  | "Artikel Jurnal"
  | "Belum diklasifikasikan"
  | "Buku / Book Chapter"
  | "Makalah Konferensi";

/**
 * Indikator KM yang luarannya berupa karya publikasi. Dipakai untuk membatasi
 * seed workbook agar salah tulis indikator menjadi kesalahan tipe, bukan diam-diam
 * jatuh ke jenis publikasi default. `OfficialPublication.kmLinks` tetap 0..N dan
 * boleh memuat indikator lain jika kelak memang relevan.
 */
export type PublicationIndicatorId =
  | "KM-11"
  | "KM-12"
  | "KM-13"
  | "KM-14"
  | "KM-33";

type PublicationQuartile = "Q1" | "Q2" | "Q3" | "Q4";

type PublicationQuality = "Lengkap" | "Perlu dilengkapi";

export type PublicationCompletionFieldKey = MetadataCompletionFieldKey;
export type PublicationCompletionResolutions = MetadataCompletionResolutions;

export const publicationCompletionFieldLabels: Record<
  PublicationCompletionFieldKey,
  string
> = metadataCompletionFieldLabels;

export type PublicationMetadataProposal = MetadataCompletionProposal;

export const publicationSourceNames = [
  "Workbook KM 2026",
  "SINTA",
  "Google Scholar",
  "Manual",
] as const;

export type PublicationSourceName = (typeof publicationSourceNames)[number];

type PublicationCitationProvider = "Google Scholar" | "SINTA";

type PublicationAuthor = {
  avatarSrc?: ImageProps["src"];
  id: string;
  initials: string;
  name: string;
};

/**
 * REQ-FUNC-022: pengenal sumber disimpan bersama URL dan waktu pengambilan.
 *
 * - `identifier` menunjuk lokasi persis pada sumbernya, misalnya `no.14!A6:J6`.
 * - `sourceUrl` hanya diisi bila sumbernya memang punya alamat yang dapat
 *   diverifikasi; impor workbook tidak punya, jadi dibiarkan kosong.
 * - `note` merekam ketidakcocokan antar-sumber supaya asal data tetap jujur
 *   setelah beberapa baris direkonsiliasi menjadi satu rekam resmi.
 */
type PublicationProvenance = {
  /** Nama kolom penulis pada sumber, yang belum tentu sama dengan label kanonis. */
  authorColumn?: string;
  capturedAt: string;
  identifier: string;
  note?: string;
  source: PublicationSourceName;
  sourceUrl?: string;
};

/**
 * Keterkaitan rekam resmi dengan indikator KM. Panjangnya boleh nol: sebuah
 * publikasi tetap sah sebagai data resmi walaupun belum dikaitkan dengan
 * indikator mana pun. Klasifikasi KM tidak menentukan keberadaan publikasi.
 */
type PublicationKmLink = {
  indicator: NexusKmIndicator;
  note: string;
};

export type OfficialPublication = {
  authors: PublicationAuthor[];
  citationProvider?: PublicationCitationProvider;
  citationUpdatedAt?: string;
  citations: number | null;
  doi?: string;
  /** Periode evaluasi KM tempat rekam ini tercatat, bukan tahun terbit. */
  evaluationPeriod: string;
  id: string;
  issue?: string;
  kmLinks: PublicationKmLink[];
  missingFields: PublicationCompletionFieldKey[];
  pages?: string;
  provenance: PublicationProvenance[];
  publicId: string;
  publisherUrl?: string;
  quality: PublicationQuality;
  /**
   * Kuartil jurnal kanonis. Hanya terisi untuk artikel jurnal; nilai sumber
   * pada bentuk karya lain tidak dinaikkan menjadi kuartil kanonis.
   */
  quartile?: PublicationQuartile;
  /** `true` hanya untuk artikel jurnal. */
  quartileApplies: boolean;
  /**
   * Nilai kolom Level Jurnal apa adanya. Tetap disimpan walaupun bentuk
   * karyanya bukan artikel jurnal, supaya data sumber tidak hilang tanpa
   * pernah diklaim sebagai kuartil jurnal yang terverifikasi.
   */
  sourceReportedQuartile?: PublicationQuartile;
  quartileSource?: string;
  review: {
    candidateId: string;
    decision: "Dihubungkan ke rekam resmi" | "Disetujui sebagai data baru";
    note: string;
    reviewedAt: string;
    reviewer: string;
  };
  /** Kosong ketika sumber belum mencatat judul karyanya. */
  title: string;
  type: PublicationType;
  updatedAt: string;
  venue: string;
  /** `undefined` ketika sumber belum mencatat tahun terbit karyanya. */
  year?: number;
};

export type NexusPublicationsContent = {
  description: string;
  officialNote: string;
  records: OfficialPublication[];
  title: string;
  updatedAt: string;
};

const workbookSource: PublicationSourceName = "Workbook KM 2026";
const workbookReviewer = "Pemeriksa Audit KM";
const workbookCapturedAt = "14 Agu 2026";

/**
 * Label ringkas untuk kontrol filter. Label KM resmi yang panjang tetap
 * dipakai pada rincian publikasi supaya rujukannya tidak berubah.
 */
export const publicationIndicatorShortLabels: Record<
  PublicationIndicatorId,
  string
> = {
  "KM-11": "Makalah konferensi internasional",
  "KM-12": "Jurnal nasional S1-S4",
  "KM-13": "Jurnal internasional selain Q1/Q2",
  "KM-14": "Jurnal internasional Q1/Q2",
  "KM-33": "Buku / book chapter",
};

const kmLinkNotes: Record<PublicationIndicatorId, string> = {
  "KM-11": "Prosiding internasional terindeks pada periode berjalan.",
  "KM-12": "Jurnal nasional terakreditasi Sinta 1 sampai Sinta 4.",
  "KM-13":
    "Jurnal internasional bereputasi selain Q1/Q2, termasuk book chapter.",
  "KM-14": "Jurnal internasional bereputasi setara Q1/Q2.",
  "KM-33": "Buku, book chapter, monograf, atau referensi.",
};

/**
 * Nama kolom penulis berbeda-beda antar sheet workbook. Vocabulary sumber ini
 * ditampilkan pada bagian provenance saja; label kanonis di UI tetap `Penulis`.
 */
const workbookAuthorColumns: Record<PublicationIndicatorId, string> = {
  "KM-11": "Tim Penulis",
  "KM-12": "Nama Dosen",
  "KM-13": "Tim Penulis Dosen",
  "KM-14": "Tim Penulis Dosen",
  "KM-33": "Penulis",
};

/**
 * Seed mengikuti workbook KM 2026 apa adanya:
 * `[publicId, indikator KM, rentang sumber, tipe karya, judul, penulis, jurnal/prosiding, kuartil, tahun terbit, tautan penerbit]`.
 *
 * `sourceRange` menunjuk baris persis pada workbook sehingga pertanyaan
 * "rekam ini berasal dari baris mana?" dapat dijawab tanpa membuka file.
 *
 * Nilai kosong berarti sumber memang belum mencatatnya — bukan nilai yang
 * boleh ditebak oleh frontend. Sheet `no.11` tidak memiliki kolom tahun dan
 * sheet `no. 12` tidak memiliki kolom judul, sehingga keduanya masuk sebagai
 * pekerjaan pelengkapan metadata yang nyata.
 */
type PublicationSeed = readonly [
  publicId: string,
  indicatorId: PublicationIndicatorId,
  sourceRange: string,
  type: PublicationType,
  title: string,
  authors: string,
  venue: string,
  quartile: PublicationQuartile | "",
  year: number | 0,
  publisherUrl: string,
];

const seeds: readonly PublicationSeed[] = [
  // Sheet no.14 — Publikasi jurnal internasional bereputasi setara Q1/Q2.
  [
    "PUB-2026-0001",
    "KM-14",
    "no.14!A4:J4",
    "Artikel Jurnal",
    "Integrating IoT-Enabled Automated Impressed Current Cathodic Protection Systems With Metal Potential Monitoring: A Digital Technology Approach to Address Corrosion for Promoting Environmental Ecosystem Conservation",
    "Faisal Budiman / Dien Rahmawati",
    "Measurement: Journal of the International Measurement Confederation",
    "Q1",
    2026,
    "https://www.sciencedirect.com/science/article/abs/pii/S0263224125025266",
  ],
  [
    "PUB-2026-0002",
    "KM-14",
    "no.14!A5:J5",
    "Artikel Jurnal",
    "Towards Energy-Efficient 5G Networks: Coordination Solutions for Macro and Pico Cells",
    "Hasanah Putri / Rendy Munadi / Sofia Naning Hertiana / Alfin Hikmaturokhman",
    "Bulletin of Electrical Engineering and Informatics",
    "Q1",
    2026,
    "https://www.beei.org/index.php/EEI/article/view/10410",
  ],
  [
    "PUB-2026-0003",
    "KM-14",
    "no.14!A6:J6",
    "Artikel Jurnal",
    "Artificial Intelligence in Glaucoma Detection System Based on Fundus Images",
    "Sofia Saidah / Achmad Rizal / Inung Wijayanto",
    "PeerJ Computer Science",
    "Q1",
    2026,
    "https://peerj.com/articles/cs-3705/",
  ],
  [
    "PUB-2026-0004",
    "KM-14",
    "no.14!A7:J7",
    "Artikel Jurnal",
    "A Multi-Representation Hybrid CNN Feature Extraction Framework for Cervical Pre-Cancer Image Classification",
    "Hilman Fauzi Tresna Sania Putra / Salsabila Aurellia / Fenty Alia",
    "International Journal of Online and Biomedical Engineering",
    "Q1",
    2026,
    "https://online-journals.org/index.php/i-joe/article/view/59729",
  ],
  [
    "PUB-2026-0005",
    "KM-14",
    "no.14!A8:J8",
    "Artikel Jurnal",
    "Broadband Temperature and Airflow Sensing Based on CSSR-Thermistor-Loaded Transmission Line Design",
    "Ashif Aminulloh Fathnan / Muhammad Zakiyullah Romdlony / Willy Anugrah Cahyadi",
    "IEEE Access",
    "Q1",
    2026,
    "https://ieeexplore.ieee.org/document/11424404",
  ],
  [
    "PUB-2026-0006",
    "KM-14",
    "no.14!A9:J9",
    "Artikel Jurnal",
    "ToxCML: A Hybrid MFCoQ-RASAR-Based Platform Integrating Consensus QSAR and Read-Across for Comprehensive Multi-Endpoint Toxicity Assessment",
    "R Yunendah Nur Fu'adah",
    "Journal of Chemical Information and Modeling",
    "Q1",
    2026,
    "https://pubs.acs.org/doi/10.1021/acs.jcim.6c00357",
  ],
  [
    "PUB-2026-0008",
    "KM-14",
    "no.14!A10:J10",
    "Artikel Jurnal",
    "High-Low Pace Optimization: A New Metaheuristic With Long and Short Steps Using Iteration as Controller",
    "Purba Daru Kusuma / Tito Waluyo Purboyo",
    "International Journal of Intelligent Engineering and Systems",
    "Q2",
    2026,
    "https://inass.org/wp-content/uploads/2025/09/2026013144-2.pdf",
  ],
  [
    "PUB-2026-0009",
    "KM-14",
    "no.14!A11:J11",
    "Artikel Jurnal",
    "Stacking Ensemble Machine Learning for Cardiac Safety Assessment Using hiPSC-CM MEA Data",
    "R Yunendah Nur Fu'adah",
    "Annals of Biomedical Engineering",
    "Q2",
    2026,
    "https://link.springer.com/article/10.1007/s10439-026-03978-1",
  ],
  [
    "PUB-2026-0010",
    "KM-14",
    "no.14!A12:J12",
    "Artikel Jurnal",
    "Improving in Silico Cardiac Safety Prediction by Consensus Averaging of Transmural Ventricular Cell Models",
    "R Yunendah Nur Fu'adah",
    "Annals of Biomedical Engineering",
    "Q2",
    2026,
    "https://link.springer.com/article/10.1007/s10439-026-04028-6",
  ],
  [
    "PUB-2026-0011",
    "KM-14",
    "no.14!A13:J13",
    "Artikel Jurnal",
    "Towards Greener Telecom: Energy-Efficient Hybrid Solar–Grid Systems for Remote Base Station Operations",
    "Hasanah Putri / Rendy Munadi / Sofia Naning Hertiana / Alfin Hikmaturokhman",
    "Indonesian Journal of Electrical Engineering and Computer Science",
    "Q2",
    2026,
    "https://ijeecs.iaescore.com/index.php/IJEECS/article/view/45004",
  ],
  [
    "PUB-2026-0012",
    "KM-14",
    "no.14!A14:J14",
    "Artikel Jurnal",
    "Robust UAV Localization of Ground Sensors in Urban Environments via Path Loss Refinement and Geometric Selection",
    "Ida Wahidah Hamzah",
    "IAES International Journal of Artificial Intelligence",
    "Q2",
    2026,
    "https://ijai.iaescore.com/index.php/IJAI/article/view/31186",
  ],
  [
    "PUB-2026-0013",
    "KM-14",
    "no.14!A15:J15",
    "Artikel Jurnal",
    "Interpretable Multi-Modality Consensus QSAR Framework: Integrating Machine and Deep Learning for Enhanced Multi-Endpoint Toxicity Assessment",
    "R Yunendah Nur Fu'adah",
    "Toxicology Mechanisms and Methods",
    "Q2",
    2026,
    "https://www.tandfonline.com/doi/full/10.1080/15376516.2026.2643659",
  ],
  [
    "PUB-2026-0014",
    "KM-14",
    "no.14!A16:J16",
    "Artikel Jurnal",
    "Exploration of Integration Strategies of Variational Mode Decomposition (VMD) and Metaheuristic Optimization Approaches for Arrhythmia Detection in ECG Signals",
    "Tito Waluyo Purboyo / Annisa Humairani / Dziban Naufal",
    "International Journal of Applied Science and Engineering",
    "Q2",
    2026,
    "https://gigvvy.com/journals/ijase/articles/ijase-202606-23-2-004",
  ],
  [
    "PUB-2026-0015",
    "KM-14",
    "no.14!A17:J17",
    "Artikel Jurnal",
    "Incorporating Inter-Individual Variability to Improve the Reliability of Predicted Outcomes in in Silico Cardiac Safety Assessment",
    "R Yunendah Nur Fu'adah",
    "Toxicology and Applied Pharmacology",
    "Q2",
    2026,
    "https://www.sciencedirect.com/science/article/pii/S0041008X26001274",
  ],
  [
    "PUB-2026-0016",
    "KM-14",
    "no.14!A19:J19",
    "Artikel Jurnal",
    "Drug Induced TdP Risks Classification Assay Using Electro-Mechanical Models of Human Ventricle Based on CIPA Framework",
    "IGA Narendra Pramawijaya / R Yunendah Nur Fu'adah",
    "Toxicological Research",
    "Q2",
    2026,
    "https://www.scopus.com/pages/publications/105022650266",
  ],
  // Sheet no.13 — Publikasi jurnal internasional bereputasi selain Q1/Q2.
  [
    "PUB-2026-0017",
    "KM-13",
    "no.13!A4:J4",
    "Artikel Jurnal",
    "Real-Time Hand Gesture-Based Virtual Mouse System Using ESP32-CAM and OpenCV",
    "Sugondo Hadiyoso / Indrarini Dyah Irawati / Achmad Rizal",
    "Jurnal RESTI",
    "Q3",
    2026,
    "https://jurnal.iaii.or.id/index.php/RESTI/article/view/6609",
  ],
  [
    "PUB-2026-0018",
    "KM-13",
    "no.13!A5:J5",
    "Artikel Jurnal",
    "Optimizing Data Pipeline for Deep Learning Classification of Used Integrated Circuit Components",
    "Achmad Rizal / Willy Anugrah Cahyadi",
    "Ingénierie des Systèmes d'Information",
    "Q3",
    2026,
    "https://iieta.org/journals/isi/paper/10.18280/isi.310322",
  ],
  [
    "PUB-2026-0019",
    "KM-13",
    "no.13!A6:J6",
    "Artikel Jurnal",
    "Machine Learning-Based Classification of Anxiety-Related Physiological Arousal Using ECG, EDA, and Respiration Signals",
    "Rita Magdalena / Achmad Rizal",
    "Ingénierie des Systèmes d'Information",
    "Q3",
    2026,
    "https://iieta.org/journals/isi/paper/10.18280/isi.310412",
  ],
  [
    "PUB-2026-0020",
    "KM-13",
    "no.13!A7:J7",
    "Artikel Jurnal",
    "Comparative Deep Learning Models for Indonesian Gold Price Forecasting",
    "Achmad Rizal / Favian Dewanta / Anggunmeka Luhur Prasasti",
    "Advance Sustainable Science, Engineering and Technology",
    "Q3",
    2026,
    "https://journal2.upgris.ac.id/index.php/asset/article/view/2608",
  ],
  [
    "PUB-2026-0021",
    "KM-13",
    "no.13!A8:J8",
    "Artikel Jurnal",
    "Non-Contact Heart Rate Detection Using FMCW Radar Based on 1-D Convolutional Neural Networks",
    "Diyah Widiyasari / Istiqomah / Fiky Yosef Suratman / Suto Setiyadi",
    "Journal of Electronics, Electromedical Engineering, and Medical Informatics",
    "Q3",
    2026,
    "https://jeeemi.org/index.php/jeeemi/article/view/1547/386",
  ],
  [
    "PUB-2026-0022",
    "KM-13",
    "no.13!A9:J9",
    "Artikel Jurnal",
    "Design of a Real-Time User Feedback for Mitigating Spurious SpO2 Readings in Pulse Oximetry for Outpatient Monitoring",
    "Husneni Mukhtar / Dien Rahmawati / Suto Setiyadi / Istiqomah / Reza Ahmad Madani",
    "Kinetik: Game Technology, Information System, Computer Network, Computing, Electronics, and Control",
    "Q3",
    2026,
    "https://kinetik.umm.ac.id/index.php/kinetik/article/view/2371",
  ],
  [
    "PUB-2026-0023",
    "KM-13",
    "no.13!A10:J10",
    "Artikel Jurnal",
    "The Degradation Test of IBS (Injectable Bone Substitutes) Paste Scaffold Using EIS (Electrical Impedance Spectroscopy) Methods",
    "Hesty Susanti",
    "Jurnal Teknologi",
    "Q3",
    2026,
    "https://www.scopus.com/pages/publications/105028310320",
  ],
  [
    "PUB-2026-0024",
    "KM-13",
    "no.13!A11:J11",
    "Belum diklasifikasikan",
    "Evaluation of CNN (ResNet50), SVM, and KNN Methods for Classification of Anomalous Kicks in Taekwondo",
    "Achmad Rizal",
    "Lecture Notes in Networks and Systems",
    "Q3",
    2026,
    "https://www.scopus.com/pages/publications/105020253509",
  ],
  [
    "PUB-2026-0025",
    "KM-13",
    "no.13!A12:J12",
    "Belum diklasifikasikan",
    "Enhancing Electrical Grid Stability: A Local Stability Analysis of the 4-Node Star System Using Decentralized Smart Grid Control",
    "Achmad Rizal",
    "Connected Objects, Artificial Intelligence, Telecommunications and Electronics Engineering",
    "Q4",
    2026,
    "https://www.scopus.com/pages/publications/105020254516",
  ],
  [
    "PUB-2026-0026",
    "KM-13",
    "no.13!A14:J14",
    "Belum diklasifikasikan",
    "Individual Identification Based on Gait Using Gyroscope Sensor and Hidden Markov Model Algorithm",
    "Achmad Rizal",
    "Connected Objects, Artificial Intelligence, Telecommunications and Electronics Engineering",
    "Q4",
    2026,
    "https://www.scopus.com/pages/publications/105020261693",
  ],
  [
    "PUB-2026-0027",
    "KM-13",
    "no.13!A15:J15",
    "Makalah Konferensi",
    "Classification of Basic Taekwondo Kicks Using Frequency Domain Analysis and Machine Learning Algorithms",
    "Achmad Rizal",
    "Proceedings of the 5th International Conference on Electronics, Biomedical Engineering, and Health Informatics",
    "Q4",
    2026,
    "https://www.scopus.com/pages/publications/105040645723",
  ],
  // Sheet no.11 — Makalah konferensi internasional terindeks.
  // Sheet ini tidak mempunyai kolom tahun terbit.
  [
    "PUB-2026-0028",
    "KM-11",
    "no.11!A4:G4",
    "Makalah Konferensi",
    "Implementation Design of Solar Powered Sycler (System of Cycling for NPK Fertilizer)",
    "I Gede Putu Oka Indra Wijaya / Ekki Kurniawan / Suto Setiyadi",
    "IOP Conference Series: Earth and Environmental Science",
    "",
    0,
    "https://iopscience.iop.org/article/10.1088/1755-1315/1598/1/012032",
  ],
  [
    "PUB-2026-0029",
    "KM-11",
    "no.11!A5:G5",
    "Makalah Konferensi",
    "Comparative Analysis of EMG Signals in Biceps Brachii and Deltoid Medialis Muscles for Post-Stroke Hemiparesis Assessment: A Signal Processing Approach",
    "Muhammad Hablul Barri / Achmad Rizal",
    "Engineering and Sciences International Conference (ESIC)",
    "",
    0,
    "https://iopscience.iop.org/article/10.1088/1742-6596/3188/1/012002",
  ],
  [
    "PUB-2026-0030",
    "KM-11",
    "no.11!A6:G6",
    "Makalah Konferensi",
    "Smart Plate Design Based on FSR Sensors for Food Weight Monitoring",
    "Muhammad Hablul Barri / Hilman Fauzi Tresna Sania Putra",
    "Engineering and Sciences International Conference (ESIC)",
    "",
    0,
    "https://iopscience.iop.org/article/10.1088/1742-6596/3188/1/012010",
  ],
  [
    "PUB-2026-0031",
    "KM-11",
    "no.11!A7:G7",
    "Makalah Konferensi",
    "Design of Wearable Device for Elderly Fall Detection Using Ensemble Learning",
    "Muhammad Hablul Barri / Achmad Rizal",
    "Engineering and Sciences International Conference (ESIC)",
    "",
    0,
    "https://iopscience.iop.org/article/10.1088/1742-6596/3188/1/012016",
  ],
  [
    "PUB-2026-0032",
    "KM-11",
    "no.11!A8:G8",
    "Makalah Konferensi",
    "Effect of Graphite Addition Variations on the Electrical Properties of Graphite Oxide-Based Conductive Inks for Low-Cost Medical Electrodes",
    "Fathur Rahman",
    "Engineering and Sciences International Conference (ESIC)",
    "",
    0,
    "https://iopscience.iop.org/article/10.1088/1742-6596/3188/1/012005",
  ],
  [
    "PUB-2026-0033",
    "KM-11",
    "no.11!A9:G9",
    "Makalah Konferensi",
    "Design of an Integrated Early Warning Score (EWS) Application System Using Supervised Learning Model",
    "Indra Wahyudhin Fathona / Hilman Fauzi Tresna Sania Putra",
    "Engineering and Sciences International Conference (ESIC)",
    "",
    0,
    "https://iopscience.iop.org/article/10.1088/1742-6596/3188/1/012011",
  ],
  [
    "PUB-2026-0034",
    "KM-11",
    "no.11!A11:G11",
    "Makalah Konferensi",
    "Design of Electrochemical Biosensor Output Reader Through Modelling the Electrochemical Cell System and Designing a 90nm CMOS Transimpedance Amplifier With Self-Biasing",
    "Suksmandhira Harimurti / M Rivaldi Ali Septian / Khilda Afifah / Estananto",
    "International Symposium on Intelligent Signal Processing and Communication Systems (ISPACS)",
    "",
    0,
    "https://ieeexplore.ieee.org/abstract/document/11382699",
  ],
  [
    "PUB-2026-0035",
    "KM-11",
    "no.11!A14:G14",
    "Makalah Konferensi",
    "Development of a Colposcope Prototype With Enhanced Image Quality for Cervical Cancer Early Detection Screening Using Raspberry Pi 4",
    "Muhammad Hablul Barri / Hilman Fauzi Tresna Sania Putra",
    "International Conference on Converging Technology in Electrical and Information Engineering (ICCTEIE)",
    "",
    0,
    "https://ieeexplore.ieee.org/document/11341799",
  ],
  [
    "PUB-2026-0036",
    "KM-11",
    "no.11!A22:G22",
    "Makalah Konferensi",
    "Correlation Between Porosity and Water Absorption of Commercial Foam Wound Dressings",
    "Dita Puspitasari / Fathur Rahman",
    "International Biomedical Instrumentation and Technology Conference (IBITeC)",
    "",
    0,
    "https://ieeexplore.ieee.org/document/11472892",
  ],
  [
    "PUB-2026-0037",
    "KM-11",
    "no.11!A27:G27",
    "Makalah Konferensi",
    "Design and Construction of a Fall-Mitigation Device for the Elderly",
    "Willy Anugrah Cahyadi / Husneni Mukhtar / Suto Setiyadi",
    "International Symposium on Intelligent Signal Processing and Communication Systems (ISPACS)",
    "",
    0,
    "https://ieeexplore.ieee.org/document/11383420",
  ],
  [
    "PUB-2026-0038",
    "KM-11",
    "no.11!A17:G17",
    "Makalah Konferensi",
    "Enhanced PCG Classification Using Wavelet Denoising and Feature Optimization of EMD and PSD",
    "Achmad Rizal / Muhammad Hablul Barri",
    "International Conference on Converging Technology in Electrical and Information Engineering (ICCTEIE)",
    "",
    0,
    "https://ieeexplore.ieee.org/document/11341759",
  ],
  [
    "PUB-2026-0039",
    "KM-11",
    "no.11!A21:G21",
    "Makalah Konferensi",
    "Comparative Analysis of Hybrid Wavelet Transformation and Filter Bank for Efficient Arrhythmia Detection in ECG Signals",
    "Annisa Humairani / Tito Waluyo Purboyo / Dziban Naufal",
    "International Conference on Electronics, Biomedical Engineering, and Health Informatics (ICEBEHI)",
    "",
    0,
    "https://teknokes.org/index.php/teknokes/article/view/154",
  ],
  [
    "PUB-2026-0040",
    "KM-11",
    "no.11!A31:G31",
    "Makalah Konferensi",
    "Template Subtraction-Based Extraction of Fetal Electrocardiogram and Analysis of Heart Rate Variability",
    "Afin Muhammad Nurtsani / Dziban Naufal",
    "International Symposium on Intelligent Signal Processing and Communication Systems (ISPACS)",
    "",
    0,
    "https://ieeexplore.ieee.org/abstract/document/11382988",
  ],
  [
    "PUB-2026-0041",
    "KM-11",
    "no.11!A33:G33",
    "Makalah Konferensi",
    "Identification of Stable EEG Channel Subsets for Longitudinal Epilepsy Monitoring Using the TUEP Dataset",
    "Achmad Rizal / Inung Wijayanto",
    "International Seminar on Intelligent Business and Edge-Computing Research (ISIBER)",
    "",
    0,
    "https://ieeexplore.ieee.org/document/11470506",
  ],
  // Sheet no. 12 — Jurnal nasional S1–S4. Sheet ini tidak mempunyai kolom judul.
  [
    "PUB-2026-0042",
    "KM-12",
    "no. 12!A2:F2",
    "Artikel Jurnal",
    "",
    "Liana Nafisa Saftari / Hesty Susanti",
    "Indonesian Journal of Electronics, Electromedical Engineering, and Medical Informatics",
    "",
    2026,
    "https://ijeeemi.org/index.php/ijeeemi/article/view/297",
  ],
  [
    "PUB-2026-0043",
    "KM-12",
    "no. 12!A3:F3",
    "Artikel Jurnal",
    "",
    "Miftadi Sudjai / Rina Pudji Astuti",
    "Eduvest — Journal of Universal Studies",
    "",
    2026,
    "https://eduvest.greenvest.co.id/index.php/edv/article/view/52080",
  ],
  [
    "PUB-2026-0044",
    "KM-12",
    "no. 12!A4:F4",
    "Artikel Jurnal",
    "",
    "M Rivaldi Ali Septian / Suksmandhira Harimurti / Wahmisari Priharti / Iswahyudi Hidayat / Mohamad Ramdhani",
    "ELKOMIKA: Jurnal Teknik Energi Elektrik, Teknik Telekomunikasi, & Teknik Elektronika",
    "",
    2026,
    "https://ejurnal.itenas.ac.id/index.php/elkomika/article/view/14817",
  ],
  [
    "PUB-2026-0045",
    "KM-12",
    "no. 12!A5:F5",
    "Artikel Jurnal",
    "",
    "Dita Puspitasari / Liana Nafisa Saftari / Fathur Rahman",
    "Jurnal Abdimas Kesehatan (JAK)",
    "",
    2026,
    "https://jak.ubr.ac.id/index.php/jak/article/view/961",
  ],
  [
    "PUB-2026-0046",
    "KM-12",
    "no. 12!A6:F6",
    "Artikel Jurnal",
    "",
    "Shinta Romadhona / Eko Fajar Cahyadi / Linahtadiya Andiani",
    "El-Mujtama: Jurnal Pengabdian Masyarakat",
    "",
    2026,
    "https://journal-laaroiba.com/ojs/index.php/elmujtama/article/view/11138",
  ],
  // Sheet no.33 — Buku, book chapter, monograf, dan referensi.
  [
    "PUB-2026-0047",
    "KM-33",
    "no.33!A4:F4",
    "Buku / Book Chapter",
    "Reduced Keratin for Biomedical Application",
    "M.S. Rijal / M.Z.L. Yee / Dita Puspitasari / M.I. Setyawati / A. Wibowo / L.A.T.W. Asri / K.W. Ng",
    "Comprehensive Materials Processing (ScienceDirect Reference Work)",
    "",
    2026,
    "https://www.sciencedirect.com/science/chapter/referencework/abs/pii/B9780443301513000115",
  ],
];

/**
 * Baris workbook tambahan yang setelah pemeriksaan dinilai sebagai karya yang
 * sama dengan rekam resmi, sehingga tidak menghasilkan publikasi kedua.
 *
 * Sumber yang kalah TIDAK dibuang: jejaknya tetap tersimpan lengkap dengan
 * catatan perbedaannya, karena justru di sinilah nilai Tinjauan terlihat —
 * dua baris spreadsheet yang berbeda diselesaikan menjadi satu rekam resmi
 * tanpa menghilangkan asal datanya.
 */
const reconciledSources: Partial<
  Record<string, { note: string; range: string; sourceUrl?: string }[]>
> = {
  "PUB-2026-0003": [
    {
      note: "Baris ini mencatat karya yang sama dengan dua penulis, kolom Nama Jurnal/Prosiding kosong, dan Level Jurnal Q4. Metadata resmi mengikuti no.14!A6:J6 yang menyebut penerbit PeerJ Computer Science dan Level Jurnal Q1. Tautan pada baris ini tidak dipakai sebagai bukti karena alamatnya sama persis dengan tautan no.13!A14:J14 yang merujuk karya berbeda.",
      range: "no.13!A13:J13",
    },
  ],
};

/**
 * Ketidakcocokan di dalam satu baris workbook. Nilai kuartil tetap mengikuti
 * kolom `Level Jurnal` karena itu kolom khusus kuartil, tetapi selisihnya
 * dicatat agar pemeriksa tahu ada yang perlu dikonfirmasi.
 */
/**
 * Sheet `no. 12` memberi judul kolom "Tanggal publikasi (Jan-Mar 2025) -
 * minimal sedang under review", tetapi nilai tanggal pada setiap barisnya
 * tersimpan sebagai tanggal tahun 2026. Tahun kanonis mengikuti nilai baris
 * yang lebih spesifik, sedangkan selisihnya tetap dicatat agar pemeriksa
 * tahu ada yang perlu dikonfirmasi dan tidak ada konflik yang hilang diam-diam.
 */
const no12RowDates: Record<string, string> = {
  "PUB-2026-0042": "1 Februari 2026",
  "PUB-2026-0043": "1 Januari 2026",
  "PUB-2026-0044": "1 April 2026",
  "PUB-2026-0045": "1 Januari 2026",
  "PUB-2026-0046": "1 April 2026",
};

const no12DateConflictNotes: Record<string, string> = Object.fromEntries(
  Object.entries(no12RowDates).map(([publicId, rowDate]) => [
    publicId,
    [
      `Judul kolom sheet menyebut periode Jan-Mar 2025, tetapi nilai tanggal pada baris ini tersimpan sebagai ${rowDate}.`,
      rowDate.includes("April")
        ? "Tanggal tersebut juga berada di luar rentang Jan-Mar yang disebut judul kolom."
        : "",
      "Tahun terbit kanonis mengikuti tanggal baris yang lebih spesifik; selisih dengan judul kolom masih perlu diverifikasi manusia.",
    ]
      .filter(Boolean)
      .join(" "),
  ]),
);

const sourceConflictNotes: Partial<Record<string, string>> = {
  "PUB-2026-0024":
    "Kolom Jenis Publikasi menulis Q4 sedangkan kolom Level Jurnal menulis Q3. Bentuk karyanya juga belum dipastikan, sehingga nilai tersebut belum diperlakukan sebagai kuartil jurnal.",
  ...no12DateConflictNotes,
};

const memberPhotos: Record<string, ImageProps["src"]> = {
  "dita-puspitasari": ditaPuspitasariPhoto,
  "fathur-rahman": fathurRahmanPhoto,
  "hesty-susanti": hestySusantiPhoto,
  "laily-ade-oktaviana": lailyAdeOktavianaPhoto,
  "miftadi-sudjai": miftadiSudjaiPhoto,
  "salsabila-aurellia": salsabilaAurelliaPhoto,
  "suksmandhira-harimurti": suksmandhiraHarimurtiPhoto,
};

function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLocaleLowerCase("id-ID")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function toAuthor(name: string): PublicationAuthor {
  const id = slugify(name);

  return {
    avatarSrc: memberPhotos[id],
    id,
    initials: personInitials(name),
    name,
  };
}

/**
 * DOI hanya diambil ketika tautan penerbit memang memuatnya. Tautan yang tidak
 * memuat DOI tetap dibiarkan kosong agar tidak ada identifier karangan.
 */
function extractDoi(url: string) {
  const match = url.match(/10\.\d{4,9}\/[^\s?#]+/);

  return match?.[0].replace(/\/(?:meta|full|abstract)$/, "");
}

function createPublication(seed: PublicationSeed): OfficialPublication {
  const [
    publicId,
    indicatorId,
    sourceRange,
    type,
    title,
    authorList,
    venue,
    quartile,
    year,
    url,
  ] = seed;
  const authors = authorList.split(" / ").map(toAuthor);
  /**
   * Kuartil adalah metrik tingkat jurnal, jadi hanya berlaku untuk artikel
   * jurnal. Makalah konferensi, buku, dan karya yang bentuknya belum
   * dipastikan tidak boleh ditampilkan seolah punya kuartil jurnal walaupun
   * kolom Level Jurnal pada workbook terisi.
   */
  const quartileApplies = type === "Artikel Jurnal";
  const canonicalQuartile = quartileApplies ? quartile || undefined : undefined;
  const sourceReportedQuartile = quartile || undefined;
  const mergedSources = reconciledSources[publicId] ?? [];
  const doi = url ? extractDoi(url) : undefined;
  /**
   * Hanya menandai bidang yang sumbernya memang gagal mencatat. DOI, nomor
   * terbit, dan halaman tetap dapat diusulkan lewat form pelengkapan, tetapi
   * belum ditandai wajib karena SRS belum menetapkan bidang wajib per jenis
   * karya. Aturan wajib ditetapkan di server, bukan dikarang di frontend.
   */
  const missingFields: PublicationCompletionFieldKey[] = [
    ...(title.length === 0 ? (["title"] as const) : []),
    // Bentuk karya yang belum dipastikan adalah metadata yang belum selesai,
    // bukan rekam yang lengkap.
    ...(type === "Belum diklasifikasikan" ? (["type"] as const) : []),
    ...(year === 0 ? (["year"] as const) : []),
    ...(quartileApplies && !canonicalQuartile ? (["quartile"] as const) : []),
    ...(url.length === 0 ? (["publisherUrl"] as const) : []),
  ];

  return {
    authors,
    citationProvider: undefined,
    citationUpdatedAt: undefined,
    citations: null,
    doi,
    evaluationPeriod: "2026",
    id: publicId.toLocaleLowerCase("id-ID"),
    kmLinks: [
      {
        indicator: kmIndicator(indicatorId),
        note: kmLinkNotes[indicatorId],
      },
    ],
    missingFields,
    provenance: [
      {
        authorColumn: workbookAuthorColumns[indicatorId],
        capturedAt: workbookCapturedAt,
        identifier: sourceRange,
        note: sourceConflictNotes[publicId],
        source: workbookSource,
      },
      ...mergedSources.map((merged) => ({
        authorColumn: workbookAuthorColumns["KM-13"],
        capturedAt: workbookCapturedAt,
        identifier: merged.range,
        note: merged.note,
        source: workbookSource,
        sourceUrl: merged.sourceUrl,
      })),
    ],
    publicId,
    publisherUrl: url || undefined,
    quality: missingFields.length > 0 ? "Perlu dilengkapi" : "Lengkap",
    quartile: canonicalQuartile,
    quartileApplies,
    quartileSource: canonicalQuartile
      ? `Kolom Level Jurnal pada ${sourceRange}`
      : undefined,
    sourceReportedQuartile,
    review: {
      candidateId: `WB-${indicatorId.replace("-", "")}-${publicId.slice(-4)}`,
      decision:
        mergedSources.length > 0
          ? "Dihubungkan ke rekam resmi"
          : "Disetujui sebagai data baru",
      note:
        mergedSources.length > 0
          ? `Dua baris workbook mencatat karya yang sama. Pemeriksa menetapkan satu rekam resmi dan mempertahankan ${mergedSources.length + 1} jejak sumber beserta perbedaannya.`
          : "Identitas karya, daftar penulis, dan wadah terbit diperiksa terhadap workbook KM 2026 sebelum menjadi data resmi.",
      reviewedAt: workbookCapturedAt,
      reviewer: workbookReviewer,
    },
    title,
    type,
    updatedAt: workbookCapturedAt,
    venue,
    year: year === 0 ? undefined : year,
  };
}

const records: OfficialPublication[] = seeds.map(createPublication);

/** Judul tampilan untuk rekam yang judulnya belum tercatat di sumber. */
export function publicationDisplayTitle(publication: OfficialPublication) {
  return publication.title || `Judul belum tercatat · ${publication.venue}`;
}

/**
 * Label kuartil yang dipakai tabel desktop, kartu mobile, dan rincian agar
 * ketiganya tidak pernah menyebut keadaan yang sama dengan istilah berbeda.
 */
export function publicationQuartileLabel(publication: OfficialPublication) {
  if (publication.quartileApplies) {
    return publication.quartile ?? "Belum diverifikasi";
  }
  return publication.type === "Belum diklasifikasikan"
    ? "Belum dapat dinilai"
    : "Tidak berlaku";
}

export function publicationAuthorNames(publication: OfficialPublication) {
  return publication.authors.map((author) => author.name).join("; ");
}

/**
 * Structured presentation fixtures for the official-publication workflow.
 * A server adapter can replace this function without changing the page API.
 */
export function getNexusPublicationsContent(): NexusPublicationsContent {
  return {
    description:
      "Seluruh publikasi resmi CoE BHT yang sudah lolos Tinjauan. Semua publikasi masuk tanpa diseleksi lebih dulu; indikator KM dan kuartil adalah klasifikasi untuk pelaporan, bukan syarat sebuah karya tercatat sebagai data resmi.",
    officialNote:
      "Daftar ini hanya memuat rekam resmi. Kandidat yang belum selesai diperiksa tetap berada di Tinjauan.",
    records,
    title: "Publikasi",
    updatedAt: "Diperbarui 16 Agustus 2026 · 09.30 WIB",
  };
}
