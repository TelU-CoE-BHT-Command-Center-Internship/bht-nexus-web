"use client";

import Image from "next/image";
import Link from "next/link";
import badgeStyles from "@/components/nexus-publications/nexus-publication-badges.module.css";
import { NexusPublicationCompletionForm } from "@/components/nexus-publications/nexus-publication-completion-form";
import styles from "@/components/nexus-publications/nexus-publication-detail.module.css";
import type {
  OfficialPublication,
  PublicationCompletionFieldKey,
  PublicationCompletionResolutions,
  PublicationMetadataProposal,
} from "@/components/nexus-publications/nexus-publications-content";
import { publicationCompletionFieldLabels } from "@/components/nexus-publications/nexus-publications-content";
import { NexusPublicationsIcon } from "@/components/nexus-publications/nexus-publications-icons";
import { getPublicationSourceId } from "@/components/nexus-publications/nexus-publications-utils";
import { NexusWorkspaceDrawer } from "@/components/nexus-workspace-ui/nexus-workspace-drawer";

type NexusPublicationDetailProps = {
  onClose: () => void;
  onSubmitCompletionProposal: (
    publicationId: string,
    resolutions: PublicationCompletionResolutions,
    note: string,
  ) => void;
  proposal?: PublicationMetadataProposal;
  publication: OfficialPublication;
};

function ArrowIcon() {
  return (
    <svg aria-hidden="true" fill="none" viewBox="0 0 16 16">
      <path d="M3 8h10M9 4l4 4-4 4" />
    </svg>
  );
}

function MetaItem({ label, value }: { label: string; value: string }) {
  return (
    <div className={styles.metaItem}>
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}

type PublicationMetadataItem = {
  key: string;
  label: string;
  missingFieldKey?: PublicationCompletionFieldKey;
  value: string;
  wide?: boolean;
};

const completionFieldOrder: readonly PublicationCompletionFieldKey[] = [
  "issue",
  "pages",
  "doi",
  "publisherUrl",
];

function getPublicationMetadataItems(
  publication: OfficialPublication,
): PublicationMetadataItem[] {
  const completionValues: Record<PublicationCompletionFieldKey, string> = {
    doi: publication.doi ?? "",
    issue: publication.issue ?? "",
    pages: publication.pages ?? "",
    publisherUrl: publication.publisherUrl ?? "",
  };
  const optionalItems = completionFieldOrder.flatMap<PublicationMetadataItem>(
    (key) => {
      const value = completionValues[key];

      if (!value && !publication.missingFields.includes(key)) return [];

      return [
        {
          key,
          label: publicationCompletionFieldLabels[key],
          missingFieldKey: publication.missingFields.includes(key)
            ? key
            : undefined,
          value: value || "Belum tersedia",
        },
      ];
    },
  );

  return [
    {
      key: "title",
      label: "Judul",
      value: publication.title,
      wide: true,
    },
    {
      key: "authors",
      label: "Penulis",
      value: publication.authors.join("; "),
      wide: true,
    },
    { key: "type", label: "Jenis publikasi", value: publication.type },
    { key: "year", label: "Tahun", value: String(publication.year) },
    {
      key: "venue",
      label: "Jurnal / prosiding / penerbit",
      value: publication.venue,
    },
    ...optionalItems,
    { key: "owner", label: "Pemilik", value: publication.owner.name },
    {
      key: "sources",
      label: "Sumber pembentuk",
      value: publication.provenance.map((source) => source.source).join(" + "),
    },
  ];
}

function getResolutionSummary(
  proposal: PublicationMetadataProposal | undefined,
  key: PublicationCompletionFieldKey,
) {
  const resolution = proposal?.resolutions[key];

  if (!resolution) return null;
  if (resolution.status === "provided") return resolution.value;
  if (resolution.status === "not-available") {
    return `Diajukan sebagai memang tidak tersedia · ${resolution.reason}`;
  }
  return `Diajukan sebagai tidak berlaku · ${resolution.reason}`;
}

export function NexusPublicationDetail({
  onClose,
  onSubmitCompletionProposal,
  proposal,
  publication,
}: NexusPublicationDetailProps) {
  const metadataItems = getPublicationMetadataItems(publication);

  return (
    <NexusWorkspaceDrawer
      closeLabel="Tutup rincian publikasi"
      description="Telusuri metadata resmi, sumber pembentuk, dan keputusan tinjauannya."
      eyebrow={publication.publicId}
      onClose={onClose}
      steps={[
        { active: true, complete: true, label: "Metadata", number: 1 },
        { active: true, complete: true, label: "Sumber", number: 2 },
        { active: true, label: "Tinjauan", number: 3 },
      ]}
      title="Rincian publikasi"
    >
      <section
        aria-labelledby="publication-overview-title"
        className={styles.overview}
      >
        <div className={styles.overviewTop}>
          <div>
            <span className={badgeStyles.officialBadge}>
              <NexusPublicationsIcon name="check" />
              Data resmi
            </span>
            <span
              className={badgeStyles.qualityBadge}
              data-quality={publication.quality}
            >
              {publication.quality}
            </span>
          </div>
          <time>Diperbarui {publication.updatedAt}</time>
        </div>
        <h3 id="publication-overview-title">{publication.title}</h3>
        <p>{publication.authors.join("; ")}</p>

        <dl className={styles.metaGrid}>
          <MetaItem label="Jenis" value={publication.type} />
          <MetaItem label="Tahun" value={String(publication.year)} />
          <MetaItem label="Pemilik" value={publication.owner.name} />
          <MetaItem label="DOI" value={publication.doi ?? "Belum tersedia"} />
        </dl>
      </section>

      {publication.missingFields.length > 0 ? (
        <aside className={styles.completenessNotice}>
          <NexusPublicationsIcon name="alert" />
          <div>
            <strong>Metadata resmi masih perlu dilengkapi</strong>
            <p>
              Bidang yang belum tersedia:{" "}
              {publication.missingFields
                .map((field) => publicationCompletionFieldLabels[field])
                .join(", ")}
              .
            </p>
          </div>
        </aside>
      ) : null}

      <section
        aria-labelledby="publication-metadata-title"
        className={styles.detailSection}
      >
        <div className={styles.sectionHeading}>
          <div>
            <span className={styles.sectionIndex}>01</span>
            <h3 id="publication-metadata-title">Metadata utama</h3>
          </div>
          <p>Identitas rekam resmi yang ditampilkan</p>
        </div>
        <dl
          aria-label="Ringkasan rekam resmi"
          className={styles.metadataSummary}
        >
          <div className={styles.metadataId}>
            <dt>ID publikasi</dt>
            <dd>{publication.publicId}</dd>
          </div>
          <div
            className={styles.metadataQuality}
            data-quality={publication.quality}
          >
            <dt>Kelengkapan</dt>
            <dd>{publication.quality}</dd>
          </div>
        </dl>
        <dl
          aria-label="Detail metadata resmi"
          className={styles.metadataDetails}
        >
          {metadataItems.map((item) => (
            <div
              className={item.wide ? styles.wideMetadata : undefined}
              data-missing={item.missingFieldKey ? "true" : undefined}
              key={item.key}
            >
              <dt>{item.label}</dt>
              <dd>
                {item.key === "publisherUrl" &&
                item.value !== "Belum tersedia" ? (
                  <a href={item.value} rel="noreferrer" target="_blank">
                    {item.value}
                  </a>
                ) : (
                  item.value
                )}
              </dd>
            </div>
          ))}
        </dl>
        <aside
          aria-label="Metrik sitasi publikasi"
          className={styles.citationMetric}
          data-available={publication.citations !== null}
        >
          <div className={styles.citationValue}>
            <span>Metrik tambahan</span>
            <strong>{publication.citations ?? "—"}</strong>
            <small>
              {publication.citations === null
                ? "Belum tersinkron"
                : "sitasi tercatat"}
            </small>
          </div>
          <dl className={styles.citationProvenance}>
            <div>
              <dt>Sumber angka</dt>
              <dd>{publication.citationSource ?? "Belum tercatat"}</dd>
            </div>
            <div>
              <dt>Diperbarui</dt>
              <dd>
                {publication.citationUpdatedAt ?? "Belum pernah disinkronkan"}
              </dd>
            </div>
          </dl>
          <p>
            Sitasi adalah informasi berkala dari sumber tertentu, bukan angka
            real-time dan bukan penentu kelengkapan metadata.
          </p>
        </aside>
      </section>

      <section
        aria-labelledby="publication-completeness-title"
        className={styles.detailSection}
      >
        <div className={styles.sectionHeading}>
          <div>
            <span className={styles.sectionIndex}>02</span>
            <h3 id="publication-completeness-title">Kelengkapan metadata</h3>
          </div>
          <p>
            {publication.missingFields.length > 0
              ? `${publication.missingFields.length} bidang belum selesai`
              : "Semua bidang pada pemeriksaan ini selesai"}
          </p>
        </div>

        <p className={styles.completenessExplanation}>
          Status Lengkap hanya dapat diberikan setelah setiap bidang yang perlu
          diperiksa telah berisi nilai, atau pengecualian “tidak tersedia” /
          “tidak berlaku” telah disetujui. “Belum ditemukan” tetap berarti belum
          selesai.
        </p>

        <ul className={styles.completenessList}>
          {metadataItems.map((item) => {
            const isPending = Boolean(item.missingFieldKey && proposal);
            const status = item.missingFieldKey
              ? isPending
                ? "pending"
                : "missing"
              : "available";
            const resolutionSummary = item.missingFieldKey
              ? getResolutionSummary(proposal, item.missingFieldKey)
              : null;

            return (
              <li data-status={status} key={item.key}>
                <span className={styles.completenessMarker} aria-hidden="true">
                  {status === "available"
                    ? "✓"
                    : status === "pending"
                      ? "↗"
                      : "?"}
                </span>
                <span className={styles.completenessCopy}>
                  <strong>{item.label}</strong>
                  <small>{resolutionSummary ?? item.value}</small>
                </span>
                <span className={styles.completenessStatus}>
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
        aria-labelledby="publication-members-title"
        className={styles.detailSection}
      >
        <div className={styles.sectionHeading}>
          <div>
            <span className={styles.sectionIndex}>03</span>
            <h3 id="publication-members-title">Anggota BHT terkait</h3>
          </div>
          <p>{publication.bhtMembers.length} anggota terhubung</p>
        </div>
        <div className={styles.memberGrid}>
          {publication.bhtMembers.map((member) => (
            <article className={styles.memberCard} key={member.id}>
              <Image
                alt={`Foto ${member.name}`}
                height={40}
                sizes="2.5rem"
                src={member.avatarSrc}
                width={40}
              />
              <div>
                <strong>{member.name}</strong>
                <span>{member.role}</span>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section
        aria-labelledby="publication-sources-title"
        className={styles.detailSection}
      >
        <div className={styles.sectionHeading}>
          <div>
            <span className={styles.sectionIndex}>04</span>
            <h3 id="publication-sources-title">Sumber dan jejak data</h3>
          </div>
          <p>Asal-usul rekam tetap dapat diaudit</p>
        </div>
        <div className={styles.provenanceGrid}>
          {publication.provenance.map((source) => (
            <article
              className={styles.provenanceCard}
              key={`${source.source}-${source.identifier}`}
            >
              <header>
                <span className={styles.sourceIcon}>
                  <NexusPublicationsIcon name="database" />
                </span>
                <div>
                  <strong>{source.source}</strong>
                  <span
                    className={badgeStyles.sourceBadge}
                    data-source={getPublicationSourceId(source.source)}
                  >
                    Sumber pembentuk
                  </span>
                </div>
              </header>
              <dl>
                <div>
                  <dt>Kunci sumber</dt>
                  <dd>{source.identifier}</dd>
                </div>
                <div>
                  <dt>Diambil</dt>
                  <dd>{source.capturedAt}</dd>
                </div>
              </dl>
            </article>
          ))}
        </div>
      </section>

      <section
        aria-labelledby="publication-review-title"
        className={styles.reviewSection}
      >
        <div className={styles.sectionHeading}>
          <div>
            <span className={styles.sectionIndex}>05</span>
            <h3 id="publication-review-title">Keputusan tinjauan</h3>
          </div>
          <p>Riwayat keputusan tersimpan</p>
        </div>
        <div className={styles.reviewDecision}>
          <span className={styles.reviewCheck}>
            <NexusPublicationsIcon name="check" />
          </span>
          <div>
            <strong>{publication.review.decision}</strong>
            <p>{publication.review.note}</p>
            <small>
              {publication.review.reviewer} · {publication.review.reviewedAt} ·{" "}
              {publication.review.candidateId}
            </small>
          </div>
        </div>
        <Link
          className={styles.reviewLink}
          href="/nexus/tinjauan"
          prefetch={false}
        >
          Buka antrean Tinjauan <ArrowIcon />
        </Link>
      </section>

      {publication.missingFields.length > 0 ? (
        <NexusPublicationCompletionForm
          onClose={onClose}
          onSubmitProposal={onSubmitCompletionProposal}
          proposal={proposal}
          publication={publication}
        />
      ) : null}
    </NexusWorkspaceDrawer>
  );
}
