"use client";

import Link from "next/link";
import {
  type IntellectualPropertyCompletionFieldKey,
  type IntellectualPropertyProposal,
  intellectualPropertyCreatorNames,
  intellectualPropertyFieldLabels,
  type OfficialIntellectualProperty,
} from "@/components/nexus-intellectual-property/nexus-intellectual-property-content";
import { NexusIntellectualPropertyIcon } from "@/components/nexus-intellectual-property/nexus-intellectual-property-icons";
import { NexusMetadataCompletionForm } from "@/components/nexus-metadata-completion/nexus-metadata-completion-form";
import type { MetadataCompletionResolutions } from "@/components/nexus-metadata-completion/nexus-metadata-completion-model";
import badgeStyles from "@/components/nexus-workspace-ui/nexus-workspace-badges.module.css";
import detail from "@/components/nexus-workspace-ui/nexus-workspace-detail.module.css";
import { NexusWorkspaceDrawer } from "@/components/nexus-workspace-ui/nexus-workspace-drawer";

type NexusIntellectualPropertyDetailProps = {
  onClose: () => void;
  onSubmitProposal: (
    recordId: string,
    resolutions: MetadataCompletionResolutions,
    note: string,
  ) => void;
  proposal?: IntellectualPropertyProposal;
  record: OfficialIntellectualProperty;
};

type MetadataItem = {
  href?: string;
  key: string;
  label: string;
  missingFieldKey?: IntellectualPropertyCompletionFieldKey;
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

function documentValue(record: OfficialIntellectualProperty) {
  if (record.documentAccess === "public" && record.documentUrl) {
    return record.documentUrl;
  }
  if (record.documentAccess === "internal") return "Penyimpanan internal CoE";
  return "Belum tercatat";
}

function getMetadataItems(
  record: OfficialIntellectualProperty,
): MetadataItem[] {
  const isMissing = (key: IntellectualPropertyCompletionFieldKey) =>
    record.missingFields.includes(key);

  return [
    {
      key: "title",
      label: "Judul karya",
      missingFieldKey: isMissing("title") ? "title" : undefined,
      value: record.title || "Belum tercatat pada sumber",
      wide: true,
    },
    {
      key: "creators",
      label: "Pencipta / inventor",
      value: intellectualPropertyCreatorNames(record),
      wide: true,
    },
    {
      key: "protectionType",
      label: "Jenis perlindungan",
      missingFieldKey: isMissing("protectionType")
        ? "protectionType"
        : undefined,
      value: record.protection,
    },
    {
      key: "registrationNumber",
      label: "Nomor pencatatan",
      missingFieldKey: isMissing("registrationNumber")
        ? "registrationNumber"
        : undefined,
      value: record.registrationNumber ?? "Belum tercatat",
    },
    {
      key: "year",
      label: "Tahun pengajuan",
      missingFieldKey: isMissing("year") ? "year" : undefined,
      value: record.year ? String(record.year) : "Belum tercatat",
    },
    {
      key: "filedOn",
      label: "Tanggal pengajuan",
      value: record.filedOn ?? "Belum tercatat",
    },
    {
      key: "registry",
      label: "Lembaga pencatatan",
      value: record.registry,
      wide: true,
    },
    {
      href: record.documentAccess === "public" ? record.documentUrl : undefined,
      key: "documentUrl",
      label: "Dokumen pendaftaran",
      missingFieldKey: isMissing("documentUrl") ? "documentUrl" : undefined,
      value: documentValue(record),
      wide: true,
    },
    {
      key: "evaluationPeriod",
      label: "Periode evaluasi KM",
      value: record.evaluationPeriod,
    },
  ];
}

function resolutionSummary(
  proposal: IntellectualPropertyProposal | undefined,
  key: IntellectualPropertyCompletionFieldKey,
) {
  const resolution = proposal?.resolutions[key];

  if (!resolution) return null;
  if (resolution.status === "provided") return resolution.value;
  if (resolution.status === "not-available") {
    return `Diajukan sebagai memang tidak tersedia · ${resolution.reason}`;
  }
  return `Diajukan sebagai tidak berlaku · ${resolution.reason}`;
}

export function NexusIntellectualPropertyDetail({
  onClose,
  onSubmitProposal,
  proposal,
  record,
}: NexusIntellectualPropertyDetailProps) {
  const metadataItems = getMetadataItems(record);

  return (
    <NexusWorkspaceDrawer
      closeLabel="Tutup rincian kekayaan intelektual"
      description="Telusuri metadata pengajuan, keterkaitan indikator KM, sumber pembentuk, dan keputusan tinjauannya."
      eyebrow={record.publicId}
      onClose={onClose}
      steps={[
        { active: true, complete: true, label: "Metadata", number: 1 },
        { active: true, complete: true, label: "Sumber", number: 2 },
        { active: true, label: "Tinjauan", number: 3 },
      ]}
      title="Rincian kekayaan intelektual"
    >
      <section
        aria-labelledby="intellectual-property-overview-title"
        className={detail.overview}
      >
        <div className={detail.overviewTop}>
          <div>
            <span className={badgeStyles.officialBadge}>
              <NexusIntellectualPropertyIcon name="check" />
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
        <h3 id="intellectual-property-overview-title">{record.title}</h3>
        <p>{intellectualPropertyCreatorNames(record)}</p>

        <dl className={detail.metaGrid}>
          <div className={detail.metaItem}>
            <dt>Perlindungan</dt>
            <dd>{record.protection}</dd>
          </div>
          <div className={detail.metaItem}>
            <dt>Nomor</dt>
            <dd>{record.registrationNumber ?? "Belum tercatat"}</dd>
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
          <NexusIntellectualPropertyIcon name="alert" />
          <div>
            <strong>Metadata resmi masih perlu dilengkapi</strong>
            <p>
              Bidang yang belum selesai:{" "}
              {record.missingFields
                .map((field) => intellectualPropertyFieldLabels[field])
                .join(", ")}
              .
            </p>
          </div>
        </aside>
      ) : null}

      <section
        aria-labelledby="intellectual-property-metadata-title"
        className={detail.detailSection}
      >
        <div className={detail.sectionHeading}>
          <div>
            <span className={detail.sectionIndex}>01</span>
            <h3 id="intellectual-property-metadata-title">
              Metadata pengajuan
            </h3>
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

        {record.documentNote ? (
          <p className={detail.explanationTrailing}>{record.documentNote}</p>
        ) : null}
      </section>

      <section
        aria-labelledby="intellectual-property-classification-title"
        className={detail.detailSection}
      >
        <div className={detail.sectionHeading}>
          <div>
            <span className={detail.sectionIndex}>02</span>
            <h3 id="intellectual-property-classification-title">
              Klasifikasi pelaporan
            </h3>
          </div>
          <p>Keterkaitan indikator KM</p>
        </div>

        <p className={detail.explanation}>
          Klasifikasi hanya menentukan bagaimana rekam dilaporkan. Rekam ini
          tetap menjadi data resmi walaupun belum dikaitkan dengan indikator KM
          mana pun.
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
        aria-labelledby="intellectual-property-completeness-title"
        className={detail.detailSection}
      >
        <div className={detail.sectionHeading}>
          <div>
            <span className={detail.sectionIndex}>03</span>
            <h3 id="intellectual-property-completeness-title">
              Kelengkapan metadata
            </h3>
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
          disetujui. Dokumen yang tersimpan internal bukan bidang yang hilang.
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
        aria-labelledby="intellectual-property-sources-title"
        className={detail.detailSection}
      >
        <div className={detail.sectionHeading}>
          <div>
            <span className={detail.sectionIndex}>04</span>
            <h3 id="intellectual-property-sources-title">
              Sumber dan jejak data
            </h3>
          </div>
          <p>Asal-usul rekam tetap dapat diaudit</p>
        </div>
        <div className={detail.provenanceGrid}>
          {record.provenance.map((source) => (
            <article className={detail.provenanceCard} key={source.identifier}>
              <header>
                <span className={detail.sourceIcon}>
                  <NexusIntellectualPropertyIcon name="database" />
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
        aria-labelledby="intellectual-property-review-title"
        className={detail.reviewSection}
      >
        <div className={detail.sectionHeading}>
          <div>
            <span className={detail.sectionIndex}>05</span>
            <h3 id="intellectual-property-review-title">Keputusan tinjauan</h3>
          </div>
          <p>Riwayat keputusan tersimpan</p>
        </div>
        <div className={detail.reviewDecision}>
          <span className={detail.reviewCheck}>
            <NexusIntellectualPropertyIcon name="check" />
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
