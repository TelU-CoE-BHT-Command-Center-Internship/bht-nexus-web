"use client";

import Image from "next/image";
import Link from "next/link";
import badgeStyles from "@/components/nexus-publications/nexus-publication-badges.module.css";
import styles from "@/components/nexus-publications/nexus-publication-detail.module.css";
import type { OfficialPublication } from "@/components/nexus-publications/nexus-publications-content";
import { NexusPublicationsIcon } from "@/components/nexus-publications/nexus-publications-icons";
import { getPublicationSourceId } from "@/components/nexus-publications/nexus-publications-utils";
import { NexusWorkspaceDrawer } from "@/components/nexus-workspace-ui/nexus-workspace-drawer";

type NexusPublicationDetailProps = {
  onClose: () => void;
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

export function NexusPublicationDetail({
  onClose,
  publication,
}: NexusPublicationDetailProps) {
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
              Bidang yang belum tersedia: {publication.missingFields.join(", ")}
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
        <dl className={styles.metadataGrid}>
          <div>
            <dt>ID publikasi</dt>
            <dd>{publication.publicId}</dd>
          </div>
          <div>
            <dt>Sitasi tercatat</dt>
            <dd>{publication.citations}</dd>
          </div>
          <div className={styles.wideMetadata}>
            <dt>Jurnal / prosiding / penerbit</dt>
            <dd>{publication.venue}</dd>
          </div>
          <div>
            <dt>Kelengkapan</dt>
            <dd>{publication.quality}</dd>
          </div>
        </dl>
      </section>

      <section
        aria-labelledby="publication-members-title"
        className={styles.detailSection}
      >
        <div className={styles.sectionHeading}>
          <div>
            <span className={styles.sectionIndex}>02</span>
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
            <span className={styles.sectionIndex}>03</span>
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
            <span className={styles.sectionIndex}>04</span>
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
          href="/nexus/kandidat"
          prefetch={false}
        >
          Buka antrean Tinjauan <ArrowIcon />
        </Link>
      </section>
    </NexusWorkspaceDrawer>
  );
}
