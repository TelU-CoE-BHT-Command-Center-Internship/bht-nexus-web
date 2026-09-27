import {
  academicDisplayTitle,
  academicMentorNames,
  getNexusAcademicContent,
} from "@/components/nexus-academic/nexus-academic-content";
import {
  activityContextLabel,
  activityDisplayTitle,
  getNexusActivitiesContent,
} from "@/components/nexus-activities/nexus-activities-content";
import type { AuditReviewRecord } from "@/components/nexus-audit-review/nexus-audit-review-content";
import {
  contractProposalDisplayTitle,
  contractProposalPrimaryParty,
  getNexusContractProposalContent,
} from "@/components/nexus-contract-proposals/nexus-contract-proposals-content";
import {
  getNexusIntellectualPropertyContent,
  intellectualPropertyCreatorNames,
} from "@/components/nexus-intellectual-property/nexus-intellectual-property-content";
import type {
  ManualRecordComparisonCandidate,
  ManualSubmissionDomain,
} from "@/components/nexus-manual-submission/nexus-manual-submission-model";
import type { NexusOfficialRecordSet } from "@/components/nexus-official-records/nexus-official-records";
import {
  getNexusPublicationsContent,
  publicationAuthorNames,
  publicationDisplayTitle,
} from "@/components/nexus-publications/nexus-publications-content";

export function manualDomainForReviewRecord(
  record: AuditReviewRecord,
): ManualSubmissionDomain {
  if (record.manualSubmission) return record.manualSubmission.domain;
  if (record.kpiLinks[0]?.indicator.id === "KM-33") return "publication";
  if (record.category === "academic_hr") return "academic";
  if (
    record.category === "activity_governance" ||
    record.category === "community_service"
  ) {
    return "activity";
  }
  if (record.category === "innovation_ip") return "intellectual-property";
  if (record.category === "publication_conference") return "publication";
  return "contract";
}

/**
 * Rekam resmi yang menjadi pembanding duplikat. Tanpa set rekam, pembanding
 * memakai data awal rumah data; Tinjauan meneruskan set rekam sesi berjalan
 * sehingga rekam yang baru disetujui ikut dicocokkan.
 */
export function getManualComparisonCandidates(
  domain: ManualSubmissionDomain,
  set?: NexusOfficialRecordSet,
): ManualRecordComparisonCandidate[] {
  switch (domain) {
    case "publication":
      return (set?.publications ?? getNexusPublicationsContent().records).map(
        (record) => ({
          id: record.id,
          identifiers: [record.doi, record.identifier].filter(
            (value): value is string => Boolean(value),
          ),
          people: record.authors.map((author) => ({
            fieldId: "authors",
            id: author.id,
            memberId: author.memberId,
            name: author.name,
          })),
          recordType:
            record.type === "Buku / Book Chapter"
              ? "book"
              : record.type === "Makalah Konferensi"
                ? "international-conference"
                : record.type === "Artikel Jurnal"
                  ? record.quartileApplies && record.quartile
                    ? "international-journal"
                    : "national-journal"
                  : "other-publication",
          subtitle: publicationAuthorNames(record),
          title: publicationDisplayTitle(record),
          year: record.year,
        }),
      );
    case "intellectual-property":
      return (
        set?.intellectualProperty ??
        getNexusIntellectualPropertyContent().records
      ).map((record) => ({
        id: record.id,
        identifiers: record.registrationNumber
          ? [record.registrationNumber]
          : [],
        people: record.creators.map((creator) => ({
          fieldId: "creators",
          id: creator.id,
          memberId: creator.memberId,
          name: creator.name,
        })),
        recordType:
          record.protection === "Paten"
            ? "patent"
            : record.protection === "Hak Cipta"
              ? "copyright"
              : record.protection === "Desain Industri"
                ? "industrial-design"
                : record.protection === "Merek"
                  ? "trademark"
                  : "other-ip",
        subtitle: intellectualPropertyCreatorNames(record),
        title: record.title,
        year: record.year,
      }));
    case "contract":
      return (set?.contracts ?? getNexusContractProposalContent().records).map(
        (record) => ({
          id: record.id,
          identifiers: record.referenceNumber ? [record.referenceNumber] : [],
          recordType:
            record.kind === "Kontrak Riset Nasional"
              ? "national-research-contract"
              : record.kind === "Kontrak Riset Internasional"
                ? "international-research-contract"
                : record.kind === "Kontrak Bisnis Komersialisasi"
                  ? "commercial-contract"
                  : record.kind === "Proposal Riset Nasional"
                    ? "national-research-proposal"
                    : record.kind === "Proposal Riset Internasional"
                      ? "international-research-proposal"
                      : "non-research-proposal",
          subtitle: contractProposalPrimaryParty(record),
          title: contractProposalDisplayTitle(record),
          year: Number(record.evaluationPeriod),
        }),
      );
    case "academic":
      return (set?.academic ?? getNexusAcademicContent().records).map(
        (record) => ({
          id: record.id,
          identifiers: [],
          people: record.mentors.map((mentor) => ({
            fieldId: "mentors",
            id: mentor.id,
            memberId: mentor.memberId,
            name: mentor.name,
          })),
          recordType:
            record.activity === "Bimbingan Doktor"
              ? "doctoral-mentoring"
              : record.activity === "Bimbingan Magister"
                ? "master-mentoring"
                : record.activity === "Magang Mahasiswa"
                  ? "student-internship"
                  : record.activity === "Riset Tugas Akhir"
                    ? "final-project"
                    : record.activity === "Kompetisi Mahasiswa"
                      ? "student-competition"
                      : "other-academic",
          subtitle: academicMentorNames(record),
          title: academicDisplayTitle(record),
          year: record.year,
        }),
      );
    case "activity":
      return (set?.activities ?? getNexusActivitiesContent().records).map(
        (record) => ({
          id: record.id,
          identifiers: [record.issn, record.referenceNumber].filter(
            (value): value is string => Boolean(value),
          ),
          recordType:
            record.kind === "Pembicara Undangan Internasional"
              ? "invited-speaker"
              : record.kind === "Kunjungan Lembaga Internasional"
                ? "international-institution-visit"
                : record.kind === "Keterlibatan Unit Bisnis"
                  ? "business-unit"
                  : record.kind === "Pembinaan UMKM / Komunitas"
                    ? "community-coaching"
                    : record.kind === "Pengelolaan Konferensi Internasional"
                      ? "international-conference-management"
                      : record.kind === "Kontrak Non-Riset"
                        ? "non-research-service"
                        : record.kind === "Community Services"
                          ? "community-service"
                          : record.kind === "Proposal Abdimas DRTPM"
                            ? "drtpm-proposal"
                            : record.kind === "Proposal Abdimas SDGs"
                              ? "sdg-proposal"
                              : record.kind === "Pengelolaan Jurnal Ilmiah"
                                ? "journal-accreditation"
                                : "other-activity",
          subtitle: activityContextLabel(record),
          title: activityDisplayTitle(record),
          year: Number(record.evaluationPeriod),
        }),
      );
  }
}
