"use client";

import type {
  AcademicCompletionFieldKey,
  NexusAcademicView,
} from "@/components/nexus-academic/nexus-academic-content";
import {
  useNexusHouseCatalog,
  useNexusHouseDetail,
} from "@/components/nexus-official-records/nexus-house-records";
import {
  kmLinksFromCodes,
  metadataText,
  recordYear,
} from "@/components/nexus-official-records/nexus-record-metadata";
import {
  formatAuditTimestamp,
  personInitials,
} from "@/components/nexus-workspace-ui/nexus-workspace-format";
import type { ActivityDetail, ActivitySummary } from "@/lib/api-activities";

/**
 * Satu-satunya penerjemah kegiatan akademik server ke bentuk halamannya.
 * Bentuk kegiatan mengikuti indikator KM yang tercatat; tanpa indikator,
 * magang mengikuti tipe kegiatan dan lainnya masuk kegiatan akademik lain.
 * Hanya peserta berperan pembimbing yang ditampilkan sebagai pembimbing;
 * identitas mahasiswa tidak ditampilkan dan diganti penanda netral.
 */

type Activity = NexusAcademicView["activity"];

const activityByIndicator: Record<string, Activity> = {
  "KM-28": "Bimbingan Doktor",
  "KM-29": "Bimbingan Magister",
  "KM-30": "Magang Mahasiswa",
  "KM-31": "Riset Tugas Akhir",
  "KM-32": "Kompetisi Mahasiswa",
};

const evidenceNotes = {
  internal:
    "Dokumen sumber tersimpan secara internal dan hanya dapat dibuka oleh pengguna yang berwenang.",
  public: "Dokumen sumber dapat dibuka melalui tautan yang tercatat.",
  unrecorded:
    "Sumber belum mencatat tautan atau lokasi dokumen untuk rekam ini.",
} as const;

const mentorRole = /pembimbing|mentor|supervisor|promotor/i;

export function nexusAcademicFromServer(
  summary: ActivitySummary,
  detail?: ActivityDetail,
  names: ReadonlyMap<string, string> = new Map(),
): NexusAcademicView {
  const metadata = summary.metadata ?? {};
  const kmLinks = kmLinksFromCodes(summary.kmIndicators);
  const indicatorId = kmLinks.find(
    (link) => activityByIndicator[link.indicator.id],
  )?.indicator.id;
  const activity: Activity =
    (indicatorId ? activityByIndicator[indicatorId] : undefined) ??
    (summary.type === "internship"
      ? "Magang Mahasiswa"
      : "Kegiatan Akademik Lainnya");
  const isInternship = activity === "Magang Mahasiswa";
  const year = recordYear(summary.periodStart);
  const title = summary.title.trim();
  const programStudy = metadataText(metadata, "programStudy");
  const duration = metadataText(metadata, "duration");
  const evidenceUrl =
    metadataText(metadata, "evidenceUrl") ??
    metadataText(metadata, "documentUrl");
  const evidenceStatus = !evidenceUrl
    ? "unrecorded"
    : metadataText(metadata, "evidenceAccess") === "internal"
      ? "internal"
      : "public";
  const mentors = (detail?.participants ?? []).flatMap((participant, index) => {
    const name = participant.memberPublicId
      ? names.get(participant.memberPublicId)
      : undefined;
    return name && mentorRole.test(participant.roleInActivity)
      ? [
          {
            id: `${summary.publicId}-mentor-${index + 1}`,
            initials: personInitials(name),
            memberId: participant.memberPublicId ?? undefined,
            name,
          },
        ]
      : [];
  });
  const missingFields: AcademicCompletionFieldKey[] = [
    ...(title ? [] : (["title"] as const)),
    ...(programStudy ? [] : (["programStudy"] as const)),
    ...(isInternship && !duration ? (["duration"] as const) : []),
    ...(isInternship && year === undefined ? (["year"] as const) : []),
    ...(evidenceStatus === "unrecorded" ? (["evidenceUrl"] as const) : []),
  ];

  return {
    activity,
    duration,
    evaluationPeriod: year ? String(year) : "",
    evidenceNote: evidenceNotes[evidenceStatus],
    evidenceStatus,
    evidenceUrl,
    id: summary.publicId,
    kmLinks,
    mentors,
    mentorsKnown: detail !== undefined,
    missingFields,
    participantCode: `MHS-${summary.publicId.slice(0, 4).toUpperCase()}`,
    programStudy,
    provenance: [],
    publicId: summary.publicId,
    quality: missingFields.length > 0 ? "Perlu dilengkapi" : "Lengkap",
    title: summary.title,
    updatedAt: formatAuditTimestamp(summary.createdAt),
    year,
  };
}

function fromSummary(summary: ActivitySummary) {
  return nexusAcademicFromServer(summary);
}

function fromDetail(
  detail: ActivityDetail,
  names: ReadonlyMap<string, string>,
) {
  return nexusAcademicFromServer(detail, detail, names);
}

const catalogError = "Kegiatan akademik resmi belum dapat dimuat.";
const detailError = "Rincian kegiatan akademik belum dapat dimuat.";

export function useNexusAcademicCatalog() {
  return useNexusHouseCatalog("academics", fromSummary, catalogError);
}

export function useNexusAcademicDetail(publicId: string | null) {
  return useNexusHouseDetail("academics", publicId, fromDetail, detailError);
}
