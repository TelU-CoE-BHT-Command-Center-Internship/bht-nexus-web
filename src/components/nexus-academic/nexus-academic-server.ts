"use client";

import type {
  AcademicCompletionFieldKey,
  NexusAcademicView,
} from "@/components/nexus-academic/nexus-academic-content";
import {
  useNexusHouseCatalog,
  useNexusHouseDetail,
} from "@/components/nexus-official-records/nexus-house-records";
import { kmLinksFromCodes } from "@/components/nexus-official-records/nexus-record-metadata";
import {
  formatAuditTimestamp,
  personInitials,
} from "@/components/nexus-workspace-ui/nexus-workspace-format";
import type { AcademicDetail, AcademicSummary } from "@/lib/api-house-records";

/**
 * Satu-satunya penerjemah kegiatan akademik server ke bentuk halamannya.
 * Server menyajikan jenis kegiatan, kode peserta, program studi, durasi,
 * tahun, tautan bukti, dan pembimbing sebagai bidang tersendiri. Identitas
 * mahasiswa tidak ditampilkan dan diganti kode peserta dari server.
 */

type Activity = NexusAcademicView["activity"];

const activityLabels: Record<AcademicSummary["activityType"], Activity> = {
  doctoral_supervision: "Bimbingan Doktor",
  masters_supervision: "Bimbingan Magister",
  other_academic_activity: "Kegiatan Akademik Lainnya",
  student_competition: "Kompetisi Mahasiswa",
  student_internship: "Magang Mahasiswa",
  thesis_research: "Riset Tugas Akhir",
};

const indicatorByActivity: Partial<
  Record<AcademicSummary["activityType"], string>
> = {
  doctoral_supervision: "KM-28",
  masters_supervision: "KM-29",
  student_competition: "KM-32",
  student_internship: "KM-30",
  thesis_research: "KM-31",
};

const evidenceNotes = {
  public: "Dokumen sumber dapat dibuka melalui tautan yang tercatat.",
  unrecorded:
    "Sumber belum mencatat tautan atau lokasi dokumen untuk rekam ini.",
} as const;

export function nexusAcademicFromServer(
  summary: AcademicSummary,
  detail?: AcademicDetail,
): NexusAcademicView {
  const activity = activityLabels[summary.activityType];
  const isInternship = activity === "Magang Mahasiswa";
  /* Kompetisi mahasiswa dicatat per tim tanpa program studi tunggal. */
  const programStudyApplies = activity !== "Kompetisi Mahasiswa";
  const year = summary.year ?? undefined;
  const title = summary.title.trim();
  const programStudy = summary.programStudy ?? undefined;
  const duration = summary.duration ?? undefined;
  const evidenceUrl = summary.evidenceUrl ?? undefined;
  const evidenceStatus = evidenceUrl ? "public" : "unrecorded";
  const mentors = [...(detail?.mentors ?? [])]
    .sort((a, b) => a.mentorOrder - b.mentorOrder)
    .map((mentor) => ({
      id: `${summary.publicId}-mentor-${mentor.mentorOrder}`,
      initials: personInitials(mentor.mentorNameRaw),
      memberId: mentor.memberPublicId ?? undefined,
      name: mentor.mentorNameRaw,
    }));
  const missingFields: AcademicCompletionFieldKey[] = [
    ...(title ? [] : (["title"] as const)),
    ...(programStudyApplies && !programStudy
      ? (["programStudy"] as const)
      : []),
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
    kmLinks: kmLinksFromCodes(
      summary.kmIndicators.length > 0
        ? summary.kmIndicators
        : [indicatorByActivity[summary.activityType] ?? ""],
    ),
    mentors,
    mentorsKnown: detail !== undefined,
    missingFields,
    participantCode: summary.participantCode,
    programStudy,
    provenance: [],
    publicId: summary.publicId,
    reportedQuarter: summary.reportedQuarter ?? undefined,
    quality: missingFields.length > 0 ? "Perlu dilengkapi" : "Lengkap",
    title: summary.title,
    updatedAt: formatAuditTimestamp(summary.createdAt),
    year,
  };
}

function fromSummary(summary: AcademicSummary) {
  return nexusAcademicFromServer(summary);
}

function fromDetail(detail: AcademicDetail) {
  return nexusAcademicFromServer(detail, detail);
}

const catalogError = "Kegiatan akademik resmi belum dapat dimuat.";
const detailError = "Rincian kegiatan akademik belum dapat dimuat.";

export function useNexusAcademicCatalog(memberPublicId?: string) {
  return useNexusHouseCatalog(
    "academics",
    fromSummary,
    catalogError,
    memberPublicId,
  );
}

export function useNexusAcademicDetail(publicId: string | null) {
  return useNexusHouseDetail("academics", publicId, fromDetail, detailError);
}
