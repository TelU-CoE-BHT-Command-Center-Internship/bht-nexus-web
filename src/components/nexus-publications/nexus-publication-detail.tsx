"use client";

import Image from "next/image";
import Link from "next/link";
import {
  type NexusMetadataCompletenessItem,
  NexusMetadataCompletenessList,
} from "@/components/nexus-metadata-completion/nexus-metadata-completeness-list";
import { NexusMetadataCompletionForm } from "@/components/nexus-metadata-completion/nexus-metadata-completion-form";
import {
  isMetadataCompletionFieldKey,
  metadataCompletionFieldState,
  metadataCompletionResolvedValue,
} from "@/components/nexus-metadata-completion/nexus-metadata-completion-model";
import styles from "@/components/nexus-publications/nexus-publication-detail.module.css";
import {
  type OfficialPublication,
  type PublicationCompletionFieldKey,
  type PublicationCompletionResolutions,
  type PublicationMetadataProposal,
  publicationAuthorNames,
  publicationCompletionFieldLabels,
  publicationDisplayTitle,
  publicationQuartileLabel,
} from "@/components/nexus-publications/nexus-publications-content";
import { NexusPublicationsIcon } from "@/components/nexus-publications/nexus-publications-icons";
import { getPublicationSourceId } from "@/components/nexus-publications/nexus-publications-utils";
import badgeStyles from "@/components/nexus-workspace-ui/nexus-workspace-badges.module.css";
import detail from "@/components/nexus-workspace-ui/nexus-workspace-detail.module.css";
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

type PublicationMetadataItem = NexusMetadataCompletenessItem & {
  href?: string;
  key: string;
  label: string;
  missingFieldKey?: PublicationCompletionFieldKey;
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

function MetaItem({ label, value }: { label: string; value: string }) {
  return (
    <div className={detail.metaItem}>
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}

function kmLinkLabel(publication: OfficialPublication) {
  if (publication.kmLinks.length === 0) return "Belum dikaitkan";
  return publication.kmLinks.map((link) => link.indicator.id).join(", ");
}

/**
 * Bidang opsional hanya tampil ketika nilainya ada atau ketika bidang tersebut
 * memang ditandai belum selesai, agar rincian tidak dipenuhi baris kosong.
 */
const optionalFieldOrder: readonly PublicationCompletionFieldKey[] = [
  "doi",
  "issue",
  "pages",
];

function getMetadataItems(
  publication: OfficialPublication,
): PublicationMetadataItem[] {
  const isMissing = (key: PublicationCompletionFieldKey) =>
    publication.missingFields.includes(key);
  const resolved = (key: PublicationCompletionFieldKey, fallback: string) =>
    metadataCompletionResolvedValue(
      publication.resolvedMetadata,
      key,
      fallback,
    );
  const optionalValues: Partial<Record<PublicationCompletionFieldKey, string>> =
    {
      doi: publication.doi,
      issue: publication.issue,
      pages: publication.pages,
    };
  const optionalItems = optionalFieldOrder.flatMap<PublicationMetadataItem>(
    (key) => {
      const value = optionalValues[key];

      if (!value && !isMissing(key) && !publication.resolvedMetadata?.[key]) {
        return [];
      }

      return [
        {
          key,
          label: publicationCompletionFieldLabels[key],
          missingFieldKey: isMissing(key) ? key : undefined,
          value: resolved(key, value || "Belum tersedia"),
        },
      ];
    },
  );

  const items: PublicationMetadataItem[] = [
    {
      key: "title",
      label: "Judul",
      missingFieldKey: isMissing("title") ? "title" : undefined,
      value: resolved(
        "title",
        publication.title || "Belum tercatat pada sumber",
      ),
      wide: true,
    },
    {
      key: "authors",
      label: "Penulis",
      value: publicationAuthorNames(publication),
      wide: true,
    },
    {
      key: "venue",
      label: "Nama jurnal / prosiding",
      value: publication.venue,
      wide: true,
    },
    {
      key: "type",
      label: "Jenis publikasi",
      missingFieldKey: isMissing("type") ? "type" : undefined,
      value: resolved("type", publication.type),
    },
    {
      key: "year",
      label: "Tahun terbit",
      missingFieldKey: isMissing("year") ? "year" : undefined,
      value: resolved(
        "year",
        publication.year ? String(publication.year) : "Belum tercatat",
      ),
    },
    ...optionalItems,
    {
      key: "quartile",
      label: "Kuartil jurnal",
      missingFieldKey: isMissing("quartile") ? "quartile" : undefined,
      value: resolved("quartile", publicationQuartileLabel(publication)),
    },
    {
      key: "evaluationPeriod",
      label: "Periode evaluasi KM",
      value: publication.evaluationPeriod,
    },
    {
      href: publication.publisherUrl,
      key: "publisherUrl",
      label: "Tautan penerbit",
      missingFieldKey: isMissing("publisherUrl") ? "publisherUrl" : undefined,
      value: resolved(
        "publisherUrl",
        publication.publisherUrl ?? "Belum tersedia",
      ),
      wide: true,
    },
  ];

  return items.map((item) => ({
    ...item,
    fieldState: isMetadataCompletionFieldKey(item.key)
      ? metadataCompletionFieldState(
          publication.resolvedMetadata,
          item.key,
          isMissing(item.key as PublicationCompletionFieldKey),
        )
      : "available",
  }));
}

export function NexusPublicationDetail({
  onClose,
  onSubmitCompletionProposal,
  proposal,
  publication,
}: NexusPublicationDetailProps) {
  const metadataItems = getMetadataItems(publication);
  const displayTitle = publicationDisplayTitle(publication);
  const isTopQuartile =
    publication.quartile === "Q1" || publication.quartile === "Q2";

  return (
    <NexusWorkspaceDrawer
      closeLabel="Tutup rincian publikasi"
      description="Telusuri metadata karya, klasifikasi KM, sumber pembentuk, dan keputusan tinjauannya."
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
        className={detail.overview}
      >
        <div className={detail.overviewTop}>
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
        <h3 id="publication-overview-title">{displayTitle}</h3>
        <p>{publicationAuthorNames(publication)}</p>

        <dl className={detail.metaGrid}>
          <MetaItem label="Jenis" value={publication.type} />
          <MetaItem
            label="Tahun terbit"
            value={
              publication.year ? String(publication.year) : "Belum tercatat"
            }
          />
          <MetaItem
            label="Kuartil"
            value={publicationQuartileLabel(publication)}
          />
          <MetaItem label="Indikator KM" value={kmLinkLabel(publication)} />
        </dl>
      </section>

      {publication.missingFields.length > 0 ? (
        <aside className={detail.completenessNotice}>
          <NexusPublicationsIcon name="alert" />
          <div>
            <strong>Metadata resmi masih perlu dilengkapi</strong>
            <p>
              Bidang yang belum selesai:{" "}
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
        className={detail.detailSection}
      >
        <div className={detail.sectionHeading}>
          <div>
            <span className={detail.sectionIndex}>01</span>
            <h3 id="publication-metadata-title">Metadata karya</h3>
          </div>
          <p>Identitas bibliografis rekam resmi</p>
        </div>
        <dl
          aria-label="Ringkasan rekam resmi"
          className={styles.metadataSummary}
        >
          <div>
            <dt>ID publikasi</dt>
            <dd>{publication.publicId}</dd>
          </div>
          <div data-quality={publication.quality}>
            <dt>Kelengkapan</dt>
            <dd>{publication.quality}</dd>
          </div>
        </dl>
        <dl
          aria-label="Detail metadata resmi"
          className={detail.metadataDetails}
        >
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
      </section>

      <section
        aria-labelledby="publication-classification-title"
        className={detail.detailSection}
      >
        <div className={detail.sectionHeading}>
          <div>
            <span className={detail.sectionIndex}>02</span>
            <h3 id="publication-classification-title">Klasifikasi pelaporan</h3>
          </div>
          <p>Kuartil dan keterkaitan indikator KM</p>
        </div>

        <p className={detail.explanation}>
          Klasifikasi hanya menentukan bagaimana publikasi dilaporkan. Rekam ini
          tetap menjadi data resmi walaupun belum dikaitkan dengan indikator KM
          mana pun.
        </p>

        <ul className={detail.kmLinkList}>
          {publication.kmLinks.length === 0 ? (
            <li data-empty="true">
              <strong>Belum dikaitkan dengan indikator KM</strong>
              <small>
                Keterkaitan indikator dapat ditetapkan melalui Tinjauan ketika
                klasifikasinya sudah dipastikan.
              </small>
            </li>
          ) : (
            publication.kmLinks.map((link) => (
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

        <aside
          aria-label="Kuartil jurnal"
          className={styles.quartilePanel}
          data-tone={
            !publication.quartileApplies
              ? "neutral"
              : publication.quartile
                ? isTopQuartile
                  ? "success"
                  : "info"
                : "missing"
          }
        >
          <div className={styles.quartileValue}>
            <span>Kuartil jurnal</span>
            <strong>
              {publication.quartileApplies
                ? (publication.quartile ?? "—")
                : "N/A"}
            </strong>
            <small>
              {publication.quartileApplies
                ? publication.quartile
                  ? isTopQuartile
                    ? "termasuk setara Q1/Q2"
                    : "termasuk selain Q1/Q2"
                  : "belum diverifikasi"
                : publication.type === "Belum diklasifikasikan"
                  ? "menunggu bentuk karya dipastikan"
                  : "tidak berlaku untuk jenis karya ini"}
            </small>
          </div>
          <dl className={styles.quartileProvenance}>
            <div>
              <dt>Sumber kuartil</dt>
              <dd>{publication.quartileSource ?? "Belum ditetapkan"}</dd>
            </div>
            <div>
              <dt>Nilai pada sumber</dt>
              <dd>{publication.sourceReportedQuartile ?? "Tidak tercatat"}</dd>
            </div>
          </dl>
          <p>
            Kuartil tidak tersedia di Google Scholar sehingga perlu diperiksa
            pada SCImago (SJR) atau Scopus. Nilainya dipakai saat pelaporan
            untuk memisahkan jurnal setara Q1/Q2 dari selain itu.
            {!publication.quartileApplies && publication.sourceReportedQuartile
              ? publication.type === "Belum diklasifikasikan"
                ? ` Sumber mencatat ${publication.sourceReportedQuartile} pada kolom Level Jurnal, tetapi nilai itu belum diperlakukan sebagai kuartil jurnal sampai bentuk karyanya diverifikasi.`
                : ` Sumber mencatat ${publication.sourceReportedQuartile} pada kolom Level Jurnal, tetapi kuartil jurnal tidak berlaku untuk ${publication.type.toLocaleLowerCase("id-ID")}.`
              : ""}
          </p>
        </aside>

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
                ? "Angka belum tersinkron"
                : "sitasi tercatat"}
            </small>
          </div>
          <dl className={styles.citationProvenance}>
            <div>
              <dt>Penyedia metrik</dt>
              <dd>{publication.citationProvider ?? "Belum ditetapkan"}</dd>
            </div>
            <div>
              <dt>Diperbarui</dt>
              <dd>{publication.citationUpdatedAt ?? "Belum ada pembaruan"}</dd>
            </div>
          </dl>
          <p>
            Penyedia metrik berbeda dari sumber pembentuk metadata publikasi.
            Sitasi diperbarui berkala, bukan real-time, dan tidak menentukan
            kelengkapan metadata.
          </p>
        </aside>
      </section>

      <section
        aria-labelledby="publication-completeness-title"
        className={detail.detailSection}
      >
        <div className={detail.sectionHeading}>
          <div>
            <span className={detail.sectionIndex}>03</span>
            <h3 id="publication-completeness-title">Kelengkapan metadata</h3>
          </div>
          <p>
            {publication.missingFields.length > 0
              ? `${publication.missingFields.length} bidang belum selesai`
              : "Semua bidang pada pemeriksaan ini selesai"}
          </p>
        </div>

        <p className={detail.explanation}>
          Status Lengkap hanya dapat diberikan setelah setiap bidang yang perlu
          diperiksa telah berisi nilai, atau pengecualian “tidak tersedia” /
          “tidak berlaku” telah disetujui. “Belum ditemukan” tetap berarti belum
          selesai.
        </p>

        <NexusMetadataCompletenessList
          items={metadataItems}
          proposal={proposal}
        />
      </section>

      <section
        aria-labelledby="publication-members-title"
        className={detail.detailSection}
      >
        <div className={detail.sectionHeading}>
          <div>
            <span className={detail.sectionIndex}>04</span>
            <h3 id="publication-members-title">Penulis</h3>
          </div>
          <p>{publication.authors.length} penulis tercatat</p>
        </div>
        <p className={detail.explanation}>
          Urutan penulis mengikuti pencatatan sumber. Kepemilikan data dan hak
          perbaikan rekam ditetapkan terpisah oleh pengaturan peran, bukan oleh
          urutan penulis. Nama kolom penulis pada sumbernya dicatat di bagian
          Sumber dan jejak data.
        </p>
        <div className={styles.memberGrid}>
          {publication.authors.map((author, index) => (
            <article className={styles.memberCard} key={author.id}>
              {author.avatarSrc ? (
                <Image
                  alt=""
                  height={40}
                  sizes="2.5rem"
                  src={author.avatarSrc}
                  width={40}
                />
              ) : (
                <span aria-hidden="true" className={styles.memberInitials}>
                  {author.initials}
                </span>
              )}
              <div>
                <strong>{author.name}</strong>
                <span>Penulis ke-{index + 1}</span>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section
        aria-labelledby="publication-sources-title"
        className={detail.detailSection}
      >
        <div className={detail.sectionHeading}>
          <div>
            <span className={detail.sectionIndex}>05</span>
            <h3 id="publication-sources-title">Sumber dan jejak data</h3>
          </div>
          <p>Asal-usul rekam tetap dapat diaudit</p>
        </div>
        <div className={detail.provenanceGrid}>
          {publication.provenance.map((source) => (
            <article
              className={detail.provenanceCard}
              key={`${source.source}-${source.identifier}`}
            >
              <header>
                <span className={detail.sourceIcon}>
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
                  <dt>Lokasi sumber</dt>
                  <dd>{source.identifier}</dd>
                </div>
                <div>
                  <dt>Diambil</dt>
                  <dd>{source.capturedAt}</dd>
                </div>
                {source.authorColumn ? (
                  <div>
                    <dt>Kolom penulis pada sumber</dt>
                    <dd>{source.authorColumn}</dd>
                  </div>
                ) : null}
                {source.sourceUrl ? (
                  <div>
                    <dt>URL sumber</dt>
                    <dd>
                      <a
                        href={source.sourceUrl}
                        rel="noreferrer"
                        target="_blank"
                      >
                        {source.sourceUrl}
                      </a>
                    </dd>
                  </div>
                ) : null}
              </dl>
              {source.note ? (
                <p className={detail.provenanceNote}>{source.note}</p>
              ) : null}
            </article>
          ))}
        </div>
      </section>

      <section
        aria-labelledby="publication-review-title"
        className={detail.reviewSection}
      >
        <div className={detail.sectionHeading}>
          <div>
            <span className={detail.sectionIndex}>06</span>
            <h3 id="publication-review-title">Keputusan tinjauan</h3>
          </div>
          <p>Riwayat keputusan tersimpan</p>
        </div>
        <div className={detail.reviewDecision}>
          <span className={detail.reviewCheck}>
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
          className={detail.reviewLink}
          href="/nexus/tinjauan"
          prefetch={false}
        >
          Buka antrean Tinjauan <ArrowIcon />
        </Link>
      </section>

      {publication.missingFields.length > 0 ? (
        <NexusMetadataCompletionForm
          missingFields={publication.missingFields}
          onClose={onClose}
          onSubmitProposal={onSubmitCompletionProposal}
          proposal={proposal}
          recordId={publication.id}
          sectionIndex="07"
        />
      ) : null}
    </NexusWorkspaceDrawer>
  );
}
