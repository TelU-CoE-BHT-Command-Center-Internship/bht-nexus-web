"use client";

import Link from "next/link";
import {
  type AcademicCompletionFieldKey,
  type AcademicProposal,
  academicDisplayTitle,
  academicEvidenceLabel,
  academicFieldLabels,
  academicMentorNames,
  type OfficialAcademicRecord,
} from "@/components/nexus-academic/nexus-academic-content";
import { NexusAcademicIcon } from "@/components/nexus-academic/nexus-academic-icons";
import { NexusMetadataCompletionForm } from "@/components/nexus-metadata-completion/nexus-metadata-completion-form";
import type { MetadataCompletionResolutions } from "@/components/nexus-metadata-completion/nexus-metadata-completion-model";
import badgeStyles from "@/components/nexus-workspace-ui/nexus-workspace-badges.module.css";
import detail from "@/components/nexus-workspace-ui/nexus-workspace-detail.module.css";
import { NexusWorkspaceDrawer } from "@/components/nexus-workspace-ui/nexus-workspace-drawer";

type NexusAcademicDetailProps = {
  onClose: () => void;
  onSubmitProposal: (
    recordId: string,
    resolutions: MetadataCompletionResolutions,
    note: string,
  ) => void;
  proposal?: AcademicProposal;
  record: OfficialAcademicRecord;
};

type MetadataItem = {
  href?: string;
  key: string;
  label: string;
  missingFieldKey?: AcademicCompletionFieldKey;
  value: string;
  wide?: boolean;
};

function ArrowIcon() {
  return (
    <svg aria-hidden="true" fill="none" viewBox="0 0 16 16">
      <path d="M3 8h10M9 4l4 4-4 4" />
    </svg>
  );
}

function getMetadataItems(record: OfficialAcademicRecord): MetadataItem[] {
  const isMissing = (key: AcademicCompletionFieldKey) =>
    record.missingFields.includes(key);

  return [
    {
      key: "title",
      label: "Topik riset / nama kegiatan",
      missingFieldKey: isMissing("title") ? "title" : undefined,
      value: record.title || "Belum tercatat pada sumber",
      wide: true,
    },
    {
      key: "mentors",
      label: "Pembimbing",
      value: academicMentorNames(record),
      wide: true,
    },
    {
      key: "activity",
      label: "Bentuk kegiatan",
      value: record.activity,
    },
    {
      key: "participantCode",
      label: "Penanda mahasiswa",
      value: record.participantCode,
    },
    {
      key: "programStudy",
      label: "Program studi",
      missingFieldKey: isMissing("programStudy") ? "programStudy" : undefined,
      value: record.programStudy ?? "Belum tercatat",
    },
    {
      key: "year",
      label: "Tahun kegiatan",
      missingFieldKey: isMissing("year") ? "year" : undefined,
      value: record.year ? String(record.year) : "Belum tercatat",
    },
    {
      key: "duration",
      label: "Lama kegiatan",
      value: record.duration ?? "Tidak dicatat untuk bentuk kegiatan ini",
    },
    {
      key: "evaluationPeriod",
      label: "Periode evaluasi KM",
      value: record.evaluationPeriod,
    },
    // Bidang lebar diletakkan terakhir supaya enam bidang sempit di atasnya
    // membentuk tiga baris penuh dan tidak ada baris yang menggantung separuh.
    {
      href: record.evidenceUrl,
      key: "evidenceUrl",
      label: "Bukti kegiatan",
      missingFieldKey: isMissing("evidenceUrl") ? "evidenceUrl" : undefined,
      value: record.evidenceUrl ?? academicEvidenceLabel(record),
      wide: true,
    },
  ];
}

function resolutionSummary(
  proposal: AcademicProposal | undefined,
  key: AcademicCompletionFieldKey,
) {
  const resolution = proposal?.resolutions[key];

  if (!resolution) return null;
  if (resolution.status === "provided") return resolution.value;
  if (resolution.status === "not-available") {
    return `Diajukan sebagai memang tidak tersedia · ${resolution.reason}`;
  }
  return `Diajukan sebagai tidak berlaku · ${resolution.reason}`;
}

export function NexusAcademicDetail({
  onClose,
  onSubmitProposal,
  proposal,
  record,
}: NexusAcademicDetailProps) {
  const metadataItems = getMetadataItems(record);
  const displayTitle = academicDisplayTitle(record);

  return (
    <NexusWorkspaceDrawer
      closeLabel="Tutup rincian kegiatan akademik"
      description="Telusuri metadata kegiatan, keterkaitan indikator KM, sumber pembentuk, dan keputusan tinjauannya."
      eyebrow={record.publicId}
      onClose={onClose}
      steps={[
        { active: true, complete: true, label: "Metadata", number: 1 },
        { active: true, complete: true, label: "Sumber", number: 2 },
        { active: true, label: "Tinjauan", number: 3 },
      ]}
      title="Rincian kegiatan akademik"
    >
      <section
        aria-labelledby="academic-overview-title"
        className={detail.overview}
      >
        <div className={detail.overviewTop}>
          <div>
            <span className={badgeStyles.officialBadge}>
              <NexusAcademicIcon name="check" />
              Data resmi
            </span>
            <span
              className={badgeStyles.qualityBadge}
              data-quality={record.quality}
            >
              {record.quality}
            </span>
          </div>
          <time>Diperbarui {record.updatedAt}</time>
        </div>
        <h3 id="academic-overview-title">{displayTitle}</h3>
        <p>{academicMentorNames(record)}</p>

        <dl className={detail.metaGrid}>
          <div className={detail.metaItem}>
            <dt>Kegiatan</dt>
            <dd>{record.activity}</dd>
          </div>
          <div className={detail.metaItem}>
            <dt>Mahasiswa</dt>
            <dd>{record.participantCode}</dd>
          </div>
          <div className={detail.metaItem}>
            <dt>Tahun</dt>
            <dd>{record.year ?? "Belum tercatat"}</dd>
          </div>
          <div className={detail.metaItem}>
            <dt>Indikator KM</dt>
            <dd>
              {record.kmLinks.length === 0
                ? "Belum dikaitkan"
                : record.kmLinks.map((link) => link.indicator.id).join(", ")}
            </dd>
          </div>
        </dl>
      </section>

      {record.missingFields.length > 0 ? (
        <aside className={detail.completenessNotice}>
          <NexusAcademicIcon name="alert" />
          <div>
            <strong>Metadata resmi masih perlu dilengkapi</strong>
            <p>
              Bidang yang belum selesai:{" "}
              {record.missingFields
                .map((field) => academicFieldLabels[field])
                .join(", ")}
              .
            </p>
          </div>
        </aside>
      ) : null}

      <section
        aria-labelledby="academic-metadata-title"
        className={detail.detailSection}
      >
        <div className={detail.sectionHeading}>
          <div>
            <span className={detail.sectionIndex}>01</span>
            <h3 id="academic-metadata-title">Metadata kegiatan</h3>
          </div>
          <p>Identitas rekam resmi</p>
        </div>
        <dl className={detail.metadataDetails}>
          {metadataItems.map((item) => (
            <div
              className={item.wide ? detail.wideMetadata : undefined}
              data-missing={item.missingFieldKey ? "true" : undefined}
              key={item.key}
            >
              <dt>{item.label}</dt>
              <dd>
                {item.href ? (
                  <a href={item.href} rel="noreferrer" target="_blank">
                    {item.value}
                  </a>
                ) : (
                  item.value
                )}
              </dd>
            </div>
          ))}
        </dl>

        <p className={detail.explanationTrailing}>
          Identitas mahasiswa ditampilkan sebagai penanda rekam. Identitas
          lengkap dan akses bukti mengikuti hak akses yang nanti diberikan
          layanan server. {record.evidenceNote}
        </p>
      </section>

      <section
        aria-labelledby="academic-classification-title"
        className={detail.detailSection}
      >
        <div className={detail.sectionHeading}>
          <div>
            <span className={detail.sectionIndex}>02</span>
            <h3 id="academic-classification-title">Klasifikasi pelaporan</h3>
          </div>
          <p>Keterkaitan indikator KM</p>
        </div>

        <p className={detail.explanation}>
          Klasifikasi hanya menentukan bagaimana rekam dilaporkan. Rekam ini
          tetap menjadi data resmi walaupun belum dikaitkan dengan indikator KM
          mana pun. Buku (KM-33) juga berkategori Akademik, tetapi rekamnya
          tersimpan di Publikasi karena bentuknya karya terbit.
        </p>

        <ul className={detail.kmLinkList}>
          {record.kmLinks.length === 0 ? (
            <li data-empty="true">
              <strong>Belum dikaitkan dengan indikator KM</strong>
              <small>
                Keterkaitan indikator dapat ditetapkan melalui Tinjauan ketika
                klasifikasinya sudah dipastikan.
              </small>
            </li>
          ) : (
            record.kmLinks.map((link) => (
              <li key={link.indicator.id}>
                <strong>
                  {link.indicator.id} · {link.indicator.label}
                </strong>
                <small>
                  {link.indicator.category} — {link.note}
                </small>
              </li>
            ))
          )}
        </ul>
      </section>

      <section
        aria-labelledby="academic-completeness-title"
        className={detail.detailSection}
      >
        <div className={detail.sectionHeading}>
          <div>
            <span className={detail.sectionIndex}>03</span>
            <h3 id="academic-completeness-title">Kelengkapan metadata</h3>
          </div>
          <p>
            {record.missingFields.length > 0
              ? `${record.missingFields.length} bidang belum selesai`
              : "Semua bidang pada pemeriksaan ini selesai"}
          </p>
        </div>

        <p className={detail.explanation}>
          Status Lengkap hanya dapat diberikan setelah setiap bidang yang perlu
          diperiksa berisi nilai, atau pengecualian yang diajukan telah
          disetujui. Lama kegiatan tidak diperiksa karena hanya dicatat untuk
          magang.
        </p>

        <ul className={detail.completenessList}>
          {metadataItems.map((item) => {
            const isPending = Boolean(item.missingFieldKey && proposal);
            const status = item.missingFieldKey
              ? isPending
                ? "pending"
                : "missing"
              : "available";
            const summary = item.missingFieldKey
              ? resolutionSummary(proposal, item.missingFieldKey)
              : null;

            return (
              <li data-status={status} key={item.key}>
                <span aria-hidden="true" className={detail.completenessMarker}>
                  {status === "available"
                    ? "✓"
                    : status === "pending"
                      ? "↗"
                      : "?"}
                </span>
                <span className={detail.completenessCopy}>
                  <strong>{item.label}</strong>
                  <small>{summary ?? item.value}</small>
                </span>
                <span className={detail.completenessStatus}>
                  {status === "available"
                    ? "Tersedia"
                    : status === "pending"
                      ? "Menunggu Tinjauan"
                      : "Belum diselesaikan"}
                </span>
              </li>
            );
          })}
        </ul>
      </section>

      <section
        aria-labelledby="academic-sources-title"
        className={detail.detailSection}
      >
        <div className={detail.sectionHeading}>
          <div>
            <span className={detail.sectionIndex}>04</span>
            <h3 id="academic-sources-title">Sumber dan jejak data</h3>
          </div>
          <p>Asal-usul rekam tetap dapat diaudit</p>
        </div>
        <div className={detail.provenanceGrid}>
          {record.provenance.map((source) => (
            <article className={detail.provenanceCard} key={source.identifier}>
              <header>
                <span className={detail.sourceIcon}>
                  <NexusAcademicIcon name="database" />
                </span>
                <div>
                  <strong>{source.source}</strong>
                  <span className={badgeStyles.sourceBadge}>
                    Sumber pembentuk
                  </span>
                </div>
              </header>
              <dl>
                <div>
                  <dt>Lokasi sumber</dt>
                  <dd>{source.identifier}</dd>
                </div>
                <div>
                  <dt>Diambil</dt>
                  <dd>{source.capturedAt}</dd>
                </div>
              </dl>
              {source.note ? (
                <p className={detail.provenanceNote}>{source.note}</p>
              ) : null}
            </article>
          ))}
        </div>
      </section>

      <section
        aria-labelledby="academic-review-title"
        className={detail.reviewSection}
      >
        <div className={detail.sectionHeading}>
          <div>
            <span className={detail.sectionIndex}>05</span>
            <h3 id="academic-review-title">Keputusan tinjauan</h3>
          </div>
          <p>Riwayat keputusan tersimpan</p>
        </div>
        <div className={detail.reviewDecision}>
          <span className={detail.reviewCheck}>
            <NexusAcademicIcon name="check" />
          </span>
          <div>
            <strong>{record.review.decision}</strong>
            <p>{record.review.note}</p>
            <small>
              {record.review.reviewer} · {record.review.reviewedAt} ·{" "}
              {record.review.candidateId}
            </small>
          </div>
        </div>
        <Link
          className={detail.reviewLink}
          href="/nexus/tinjauan"
          prefetch={false}
        >
          Buka antrean Tinjauan <ArrowIcon />
        </Link>
      </section>

      {record.missingFields.length > 0 ? (
        <NexusMetadataCompletionForm
          missingFields={record.missingFields}
          onClose={onClose}
          onSubmitProposal={onSubmitProposal}
          proposal={proposal}
          recordId={record.id}
          sectionIndex="06"
        />
      ) : null}
    </NexusWorkspaceDrawer>
  );
}
