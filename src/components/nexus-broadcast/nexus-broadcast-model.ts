import type { JSONContent } from "@tiptap/react";
import {
  type BroadcastDocument,
  broadcastDocumentIsEmpty,
  serializeBroadcastMarkdown,
  summarizeBroadcastDocument,
} from "@/components/nexus-broadcast/nexus-broadcast-content";
import type {
  NexusMemberRecord,
  NexusMemberStatus,
} from "@/components/nexus-members/nexus-members-content";
import { nexusValidEmail } from "@/components/nexus-members/nexus-members-model";

/**
 * Batas presentasi judul email. Server belum menetapkan batasnya; 150
 * karakter cukup untuk subjek yang tetap terbaca di kotak masuk.
 */
export const BROADCAST_SUBJECT_MAX_LENGTH = 150;

export const BROADCAST_IMAGE_ALT_MAX_LENGTH = 250;

/**
 * Jenis dan ukuran gambar mengikuti aturan unggah `bht-nexus-server`
 * (`FILE_TYPE_LIMITS_MB`: png, jpg, dan jpeg maksimal 1 MB). Keduanya juga
 * dapat ditampilkan oleh aplikasi email pada umumnya.
 */
export const BROADCAST_IMAGE_MAX_BYTES = 1024 * 1024;

export const BROADCAST_IMAGE_TYPES = [
  { extensions: ["jpg", "jpeg"], label: "JPG", mimeType: "image/jpeg" },
  { extensions: ["png"], label: "PNG", mimeType: "image/png" },
] as const;

export const BROADCAST_IMAGE_ACCEPT = BROADCAST_IMAGE_TYPES.map(
  (type) => type.mimeType,
).join(",");

/** Satu-satunya mode penerima yang disepakati pada Meeting Minggu 12. */
export type BroadcastRecipientMode = "ACTIVE_MEMBERS_WITH_EMAIL";

/**
 * Berkas yang dipilih penulis dan hanya hidup di memori halaman. `objectUrl`
 * dipakai untuk menampilkan gambar di editor dan tampilan email, tidak pernah
 * disimpan, dan tidak sama dengan alamat gambar setelah diunggah.
 */
export type BroadcastLocalImage = {
  file: File;
  height: number;
  id: string;
  name: string;
  objectUrl: string;
  size: number;
  width: number;
};

export type BroadcastImageRegistry = Readonly<
  Record<string, BroadcastLocalImage>
>;

/**
 * Satu draf broadcast. Dokumen editor, gambar lokal, dan judul menjadi satu
 * sumber untuk validasi, tampilan email, status perubahan, serta permintaan
 * kirim.
 */
export type BroadcastDraft = {
  content: JSONContent | null;
  images: BroadcastImageRegistry;
  recipientMode: BroadcastRecipientMode;
  subject: string;
};

export function createEmptyBroadcastDraft(): BroadcastDraft {
  return {
    content: null,
    images: {},
    recipientMode: "ACTIVE_MEMBERS_WITH_EMAIL",
    subject: "",
  };
}

export function broadcastDraftIsDirty(
  draft: BroadcastDraft,
  document: BroadcastDocument,
) {
  return draft.subject.trim() !== "" || !broadcastDocumentIsEmpty(document);
}

export function createBroadcastImageId() {
  return `broadcast-image-${crypto.randomUUID()}`;
}

/**
 * Memastikan berkas benar-benar dapat dibaca sebagai gambar sebelum dipakai.
 * Alamat sementara dicabut lagi bila gambar gagal dibaca.
 */
export async function loadBroadcastImage(
  file: File,
): Promise<BroadcastLocalImage | null> {
  const objectUrl = URL.createObjectURL(file);
  try {
    const element = new window.Image();
    element.src = objectUrl;
    await element.decode();
    return {
      file,
      height: element.naturalHeight,
      id: createBroadcastImageId(),
      name: file.name,
      objectUrl,
      size: file.size,
      width: element.naturalWidth,
    };
  } catch {
    URL.revokeObjectURL(objectUrl);
    return null;
  }
}

export function revokeBroadcastImages(images: BroadcastImageRegistry) {
  for (const image of Object.values(images)) {
    URL.revokeObjectURL(image.objectUrl);
  }
}

export function formatBroadcastFileSize(bytes: number) {
  if (bytes < 1024 * 1024) {
    return `${Math.max(1, Math.round(bytes / 1024)).toLocaleString("id-ID")} KB`;
  }
  return `${(bytes / (1024 * 1024)).toLocaleString("id-ID", {
    maximumFractionDigits: 1,
  })} MB`;
}

/**
 * Pemeriksaan berkas sebelum gambar ditampilkan. Jenis dicocokkan dari MIME
 * dan ekstensi sekaligus karena server menolak berdasarkan ekstensi nama berkas.
 */
export function validateBroadcastImageFile(file: File): string | null {
  const extension = file.name.split(".").pop()?.toLocaleLowerCase("id-ID");
  const type = BROADCAST_IMAGE_TYPES.find(
    (candidate) => candidate.mimeType === file.type,
  );
  const extensionMatches = type?.extensions.some(
    (candidate) => candidate === extension,
  );

  if (!type || !extensionMatches) {
    return "Gunakan gambar berformat JPG atau PNG.";
  }
  if (file.size === 0) {
    return "Berkas gambar kosong. Pilih berkas lain.";
  }
  if (file.size > BROADCAST_IMAGE_MAX_BYTES) {
    return `Ukuran gambar maksimal 1 MB, sedangkan berkas ini ${formatBroadcastFileSize(file.size)}.`;
  }
  return null;
}

/* ------------------------------------------------------------------ */
/* Penerima                                                            */
/* ------------------------------------------------------------------ */

export type BroadcastRecipientMember = {
  email?: string;
  memberId: string;
  name: string;
  status: NexusMemberStatus;
};

export type BroadcastRecipientSummary = {
  activeMembers: number;
  /** Alamat unik yang akan menerima satu email masing-masing. */
  addresses: readonly string[];
  eligibleMembers: readonly BroadcastRecipientMember[];
  /** Anggota berstatus cuti atau nonaktif tidak menerima broadcast. */
  excludedMembers: readonly BroadcastRecipientMember[];
  members: number;
  missingEmailMembers: readonly BroadcastRecipientMember[];
};

/**
 * Alamat broadcast seorang anggota: email institusi bila tercatat dan sah,
 * lalu email alternatif. Email akun masuk tidak dipakai karena Akun dan
 * Anggota adalah identitas yang berbeda.
 */
export function broadcastMemberEmail(member: NexusMemberRecord) {
  const candidates = [
    member.contact.institutionalEmail,
    member.contact.alternateEmail,
  ];
  return candidates
    .map((candidate) => candidate?.trim())
    .find((candidate): candidate is string =>
      Boolean(candidate && nexusValidEmail(candidate)),
    );
}

export function summarizeBroadcastRecipients(
  members: readonly NexusMemberRecord[],
): BroadcastRecipientSummary {
  const eligibleMembers: BroadcastRecipientMember[] = [];
  const excludedMembers: BroadcastRecipientMember[] = [];
  const missingEmailMembers: BroadcastRecipientMember[] = [];
  const addresses = new Set<string>();

  for (const member of members) {
    const status = member.membership.status;
    const email = broadcastMemberEmail(member);
    const recipient: BroadcastRecipientMember = {
      ...(email ? { email } : {}),
      memberId: member.id,
      name: member.name,
      status,
    };

    if (status !== "active") {
      excludedMembers.push(recipient);
    } else if (!email) {
      missingEmailMembers.push(recipient);
    } else {
      eligibleMembers.push(recipient);
      addresses.add(email.toLocaleLowerCase("id-ID"));
    }
  }

  return {
    activeMembers: eligibleMembers.length + missingEmailMembers.length,
    addresses: [...addresses],
    eligibleMembers,
    excludedMembers,
    members: members.length,
    missingEmailMembers,
  };
}

/* ------------------------------------------------------------------ */
/* Kesiapan                                                            */
/* ------------------------------------------------------------------ */

export type BroadcastCheckId =
  | "content"
  | "images"
  | "links"
  | "recipients"
  | "subject";

/**
 * `pending` berarti bagian itu belum dikerjakan, sedangkan `problem` berarti
 * ada isian yang perlu diperbaiki. Keduanya sama-sama menahan peninjauan.
 */
export type BroadcastCheckStatus = "complete" | "pending" | "problem";

export type BroadcastCheck = {
  detail: string;
  id: BroadcastCheckId;
  label: string;
  status: BroadcastCheckStatus;
};

export type BroadcastReadiness = {
  checks: readonly BroadcastCheck[];
  completeCount: number;
  isReady: boolean;
};

function countLabel(count: number, noun: string) {
  return `${count.toLocaleString("id-ID")} ${noun}`;
}

export function broadcastContentOverview(document: BroadcastDocument) {
  const summary = summarizeBroadcastDocument(document);
  return [
    summary.paragraphs ? countLabel(summary.paragraphs, "paragraf") : null,
    summary.headings ? countLabel(summary.headings, "judul") : null,
    summary.lists ? countLabel(summary.lists, "daftar") : null,
    summary.links ? countLabel(summary.links, "tautan") : null,
    summary.images.length ? countLabel(summary.images.length, "gambar") : null,
  ]
    .filter(Boolean)
    .join(" · ");
}

/**
 * Setiap butir hanya menyatakan hal yang benar-benar diketahui halaman ini.
 * Kesiapan pengiriman di sisi layanan email tidak termasuk di dalamnya.
 */
export function evaluateBroadcastReadiness({
  document,
  images,
  recipients,
  subject,
}: {
  document: BroadcastDocument;
  images: BroadcastImageRegistry;
  recipients: BroadcastRecipientSummary;
  subject: string;
}): BroadcastReadiness {
  const summary = summarizeBroadcastDocument(document);
  const subjectLength = subject.trim().length;
  const missingImages = summary.images.filter(
    (image) => !images[image.imageId],
  ).length;
  const imagesWithoutAlt = summary.images.filter((image) => !image.alt).length;

  const checks: BroadcastCheck[] = [
    subjectLength === 0
      ? {
          detail: "Judul tampil sebagai subjek email.",
          id: "subject",
          label: "Judul email belum diisi",
          status: "pending",
        }
      : subjectLength > BROADCAST_SUBJECT_MAX_LENGTH
        ? {
            detail: `Maksimal ${BROADCAST_SUBJECT_MAX_LENGTH} karakter, saat ini ${subjectLength}.`,
            id: "subject",
            label: "Judul email terlalu panjang",
            status: "problem",
          }
        : {
            detail: `${subjectLength} dari ${BROADCAST_SUBJECT_MAX_LENGTH} karakter.`,
            id: "subject",
            label: "Judul email sudah diisi",
            status: "complete",
          },
    broadcastDocumentIsEmpty(document)
      ? {
          detail: "Tulis pengumuman pada kolom Isi pesan.",
          id: "content",
          label: "Isi pesan belum ditulis",
          status: "pending",
        }
      : {
          detail: broadcastContentOverview(document),
          id: "content",
          label: "Isi pesan sudah ditulis",
          status: "complete",
        },
    summary.invalidLinks > 0
      ? {
          detail:
            "Gunakan alamat web lengkap yang diawali https:// atau http://.",
          id: "links",
          label: `${countLabel(summary.invalidLinks, "tautan")} perlu diperbaiki`,
          status: "problem",
        }
      : {
          detail:
            summary.links > 0
              ? `${countLabel(summary.links, "tautan")} memakai alamat web yang lengkap.`
              : "Belum ada tautan pada isi pesan.",
          id: "links",
          label: "Tidak ada tautan bermasalah",
          status: "complete",
        },
    missingImages > 0
      ? {
          detail: "Berkas gambar tidak lagi tersedia di halaman ini.",
          id: "images",
          label: `${countLabel(missingImages, "gambar")} perlu dipilih ulang`,
          status: "problem",
        }
      : imagesWithoutAlt > 0
        ? {
            detail: "Deskripsi dibaca penerima yang gambarnya tidak termuat.",
            id: "images",
            label: `${countLabel(imagesWithoutAlt, "gambar")} belum berdeskripsi`,
            status: "problem",
          }
        : {
            detail:
              summary.images.length > 0
                ? `${countLabel(summary.images.length, "gambar")} sudah berdeskripsi.`
                : "Gambar bersifat opsional.",
            id: "images",
            label: "Gambar (jika ada) sudah lengkap",
            status: "complete",
          },
    recipients.addresses.length > 0
      ? {
          detail: "Anggota aktif yang memiliki email.",
          id: "recipients",
          label: `${countLabel(recipients.addresses.length, "penerima")} tersedia`,
          status: "complete",
        }
      : {
          detail: "Belum ada anggota aktif yang memiliki email.",
          id: "recipients",
          label: "Penerima belum tersedia",
          status: "problem",
        },
  ];

  const completeCount = checks.filter(
    (check) => check.status === "complete",
  ).length;
  return {
    checks,
    completeCount,
    isReady: completeCount === checks.length,
  };
}

/* ------------------------------------------------------------------ */
/* Kontrak pengiriman                                                  */
/* ------------------------------------------------------------------ */

/** Gambar yang harus diunggah lebih dahulu melalui layanan penyimpanan. */
export type BroadcastImageUpload = {
  alt: string;
  file: File;
  imageId: string;
};

/** Hasil unggah dari layanan penyimpanan; `url` adalah alamat publiknya. */
export type BroadcastUploadedImage = {
  alt: string;
  imageId: string;
  url: string;
};

/**
 * Permintaan kirim untuk layanan server. Penerima dikirim sebagai aturan,
 * bukan daftar alamat, karena server yang menentukan penerima sebenarnya.
 */
export type BroadcastSendRequest = {
  body: { format: "markdown"; markdown: string };
  images: readonly BroadcastUploadedImage[];
  recipients: { mode: BroadcastRecipientMode };
  subject: string;
};

export type BroadcastSendStatus =
  | "FAILED"
  | "PARTIALLY_SENT"
  | "SENDING"
  | "SENT";

/** Hanya ditampilkan bila berasal dari layanan pengiriman. */
export type BroadcastSendResult = {
  acceptedCount: number;
  failedCount: number;
  failureSummary?: string;
  requestedRecipientCount: number;
  /** Instant ISO dari server. */
  sentAt?: string;
  status: BroadcastSendStatus;
};

export type BroadcastHistoryEntry = {
  id: string;
  preparedBy: string;
  recipientCount: number;
  result: BroadcastSendResult;
  subject: string;
};

/**
 * Titik sambung pengiriman. Selama layanan email belum tersedia, halaman hanya
 * sampai pada peninjauan dan tidak pernah menyatakan email telah terkirim.
 */
export type BroadcastDeliveryAdapter =
  | { status: "UNAVAILABLE" }
  | {
      send: (request: BroadcastSendRequest) => Promise<BroadcastSendResult>;
      status: "AVAILABLE";
      uploadImage: (
        image: BroadcastImageUpload,
      ) => Promise<BroadcastUploadedImage>;
    };

export const nexusBroadcastDelivery: BroadcastDeliveryAdapter = {
  status: "UNAVAILABLE",
};

export function broadcastImagesToUpload(
  document: BroadcastDocument,
  images: BroadcastImageRegistry,
): BroadcastImageUpload[] {
  const seen = new Set<string>();
  const uploads: BroadcastImageUpload[] = [];

  for (const image of summarizeBroadcastDocument(document).images) {
    const local = images[image.imageId];
    if (!local || seen.has(image.imageId)) continue;
    seen.add(image.imageId);
    uploads.push({ alt: image.alt, file: local.file, imageId: image.imageId });
  }

  return uploads;
}

export function buildBroadcastSendRequest({
  document,
  recipientMode,
  subject,
  uploadedImages,
}: {
  document: BroadcastDocument;
  recipientMode: BroadcastRecipientMode;
  subject: string;
  uploadedImages: readonly BroadcastUploadedImage[];
}): BroadcastSendRequest {
  const urlByImageId = new Map(
    uploadedImages.map((image) => [image.imageId, image.url]),
  );

  return {
    body: {
      format: "markdown",
      markdown: serializeBroadcastMarkdown(document, (imageId) => {
        const url = urlByImageId.get(imageId);
        if (!url) throw new Error(`Gambar ${imageId} belum diunggah.`);
        return url;
      }),
    },
    images: uploadedImages,
    recipients: { mode: recipientMode },
    subject: subject.trim(),
  };
}
