"use client";

import Link from "next/link";
import {
  type ActivityCompletionFieldKey,
  type ActivityProposal,
  activityDisplayTitle,
  activityEvidenceLabel,
  activityFieldLabels,
  activityKmLabel,
  type OfficialActivityRecord,
} from "@/components/nexus-activities/nexus-activities-content";
import { NexusActivitiesIcon } from "@/components/nexus-activities/nexus-activities-icons";
import { NexusMetadataCompletionForm } from "@/components/nexus-metadata-completion/nexus-metadata-completion-form";
import {
  type MetadataCompletionResolutions,
  metadataCompletionResolvedValue,
} from "@/components/nexus-metadata-completion/nexus-metadata-completion-model";
import badgeStyles from "@/components/nexus-workspace-ui/nexus-workspace-badges.module.css";
import detail from "@/components/nexus-workspace-ui/nexus-workspace-detail.module.css";
import { NexusWorkspaceDrawer } from "@/components/nexus-workspace-ui/nexus-workspace-drawer";

type NexusActivityDetailProps = {
  onClose: () => void;
  onSubmitProposal: (
    recordId: string,
    resolutions: MetadataCompletionResolutions,
    note: string,
  ) => void;
  proposal?: ActivityProposal;
  record: OfficialActivityRecord;
};

type MetadataItem = {
  href?: string;
  key: string;
  label: string;
  missingFieldKey?: ActivityCompletionFieldKey;
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

function formatDate(value: string) {
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    timeZone: "UTC",
    year: "numeric",
  }).format(new Date(`${value}T00:00:00Z`));
}

function getMetadataItems(record: OfficialActivityRecord): MetadataItem[] {
  const isMissing = (key: ActivityCompletionFieldKey) =>
    record.missingFields.includes(key);
  const resolved = (key: ActivityCompletionFieldKey, fallback: string) =>
    metadataCompletionResolvedValue(record.resolvedMetadata, key, fallback);
  const field = (
    key: ActivityCompletionFieldKey,
    label: string,
    value?: string,
    wide = false,
  ): MetadataItem => ({
    key,
    label,
    missingFieldKey: isMissing(key) ? key : undefined,
    value: resolved(key, value || "Belum tercatat pada sumber"),
    wide,
  });
  const items: MetadataItem[] = [
    { key: "kind", label: "Jenis rekam", value: record.kind },
  ];

  if (record.kind === "Keterlibatan Unit Bisnis") {
    items.push(
      field("primaryParty", "Nama dosen", record.primaryParty),
      field("role", "Keterlibatan", record.role),
      field("organization", "Unit bisnis", record.organization),
    );
  } else if (record.kind === "Pembinaan UMKM / Komunitas") {
    items.push(
      field("primaryParty", "Nama dosen", record.primaryParty),
      field("organization", "UMKM / komunitas", record.organization, true),
    );
  } else if (record.kind === "Pengelolaan Konferensi Internasional") {
    items.push(
      field("title", "Nama acara internasional", record.title, true),
      field(
        "eventDate",
        "Tanggal kegiatan",
        record.eventDate ? formatDate(record.eventDate) : undefined,
      ),
      field("location", "Tempat", record.location),
    );
  } else if (record.kind === "Pengelolaan Jurnal Ilmiah") {
    items.push(
      field("title", "Nama jurnal nasional terakreditasi", record.title, true),
      field("journalVolume", "Nomor volume", record.journalVolume),
      field("issn", "ISSN", record.issn),
      field(
        "publicationFrequency",
        "Frekuensi terbit",
        record.publicationFrequency,
      ),
    );
  } else {
    items.push(
      field("scheme", "Skema", record.scheme),
      field("team", "Nama dosen dan tim pelaksana", record.team, true),
      field("title", "Judul kegiatan", record.title, true),
      field(
        "targetGroup",
        "Masyarakat / mitra sasaran",
        record.targetGroup,
        true,
      ),
      field("funding", "Dana", record.funding),
    );
  }

  items.push(
    {
      href: record.evidenceStatus === "public" ? record.evidenceUrl : undefined,
      key: "evidenceUrl",
      label: "Dokumen bukti",
      missingFieldKey: isMissing("evidenceUrl") ? "evidenceUrl" : undefined,
      value: resolved("evidenceUrl", activityEvidenceLabel(record)),
      wide: true,
    },
    {
      key: "evaluationPeriod",
      label: "Periode evaluasi KM",
      value: record.evaluationPeriod,
    },
  );

  return items;
}

function resolutionSummary(
  proposal: ActivityProposal | undefined,
  key: ActivityCompletionFieldKey,
) {
  const resolution = proposal?.resolutions[key];

  if (!resolution) return null;
  if (resolution.status === "provided") return resolution.value;
  if (resolution.status === "not-available") {
    return `Diajukan sebagai memang tidak tersedia · ${resolution.reason}`;
  }
  return `Diajukan sebagai tidak berlaku · ${resolution.reason}`;
}

export function NexusActivityDetail({
  onClose,
  onSubmitProposal,
  proposal,
  record,
}: NexusActivityDetailProps) {
  const metadataItems = getMetadataItems(record);
  const displayTitle = activityDisplayTitle(record);

  return (
    <NexusWorkspaceDrawer
      closeLabel="Tutup rincian kegiatan dan pengabdian"
      description="Telusuri bentuk kegiatan, pihak terkait, klasifikasi KM, kelengkapan bukti, sumber pembentuk, dan keputusan tinjauannya."
      eyebrow={record.publicId}
      onClose={onClose}
      steps={[
        { active: true, complete: true, label: "Metadata", number: 1 },
        { active: true, complete: true, label: "Sumber", number: 2 },
        { active: true, label: "Tinjauan", number: 3 },
      ]}
      title="Rincian kegiatan & pengabdian"
    >
      <section
        aria-labelledby="activity-overview-title"
        className={detail.overview}
      >
        <div className={detail.overviewTop}>
          <div>
            <span className={badgeStyles.officialBadge}>
              <NexusActivitiesIcon name="check" />
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
        <h3 id="activity-overview-title">{displayTitle}</h3>
        <p>
          {record.primaryParty} · {record.group}
        </p>

        <dl className={detail.metaGrid}>
          <div className={detail.metaItem}>
            <dt>Kelompok</dt>
            <dd>{record.group}</dd>
          </div>
          <div className={detail.metaItem}>
            <dt>Status rekam</dt>
            <dd>{record.recordStatus}</dd>
          </div>
          <div className={detail.metaItem}>
            <dt>Jenis</dt>
            <dd>{record.kind}</dd>
          </div>
          <div className={detail.metaItem}>
            <dt>Indikator KM</dt>
            <dd>{activityKmLabel(record)}</dd>
          </div>
        </dl>
      </section>

      {record.missingFields.length > 0 ? (
        <aside className={detail.completenessNotice}>
          <NexusActivitiesIcon name="alert" />
          <div>
            <strong>Metadata resmi masih perlu dilengkapi</strong>
            <p>
              Bidang yang belum selesai:{" "}
              {record.missingFields
                .map((field) => activityFieldLabels[field])
                .join(", ")}
              .
            </p>
          </div>
        </aside>
      ) : null}

      <section
        aria-labelledby="activity-metadata-title"
        className={detail.detailSection}
      >
        <div className={detail.sectionHeading}>
          <div>
            <span className={detail.sectionIndex}>01</span>
            <h3 id="activity-metadata-title">Metadata rekam</h3>
          </div>
          <p>Bidang menyesuaikan jenis kegiatan</p>
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
        <p className={detail.explanationTrailing}>{record.evidenceNote}</p>
      </section>

      <section
        aria-labelledby="activity-classification-title"
        className={detail.detailSection}
      >
        <div className={detail.sectionHeading}>
          <div>
            <span className={detail.sectionIndex}>02</span>
            <h3 id="activity-classification-title">Klasifikasi pelaporan</h3>
          </div>
          <p>Keterkaitan indikator KM</p>
        </div>
        <p className={detail.explanation}>
          Jenis kegiatan menentukan bidang yang wajib diperiksa. Peran pada unit
          bisnis, sasaran pengabdian, pengajuan proposal, dan pengelolaan jurnal
          tidak dapat saling menggantikan walaupun berada pada satu rumah data.
        </p>
        <ul className={detail.kmLinkList}>
          {record.kmLinks.length === 0 ? (
            <li data-empty="true">
              <strong>Belum dikaitkan dengan indikator KM</strong>
              <small>
                Rekam tetap resmi. Keterkaitan dapat ditetapkan melalui Tinjauan
                setelah klasifikasinya dipastikan.
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
        aria-labelledby="activity-completeness-title"
        className={detail.detailSection}
      >
        <div className={detail.sectionHeading}>
          <div>
            <span className={detail.sectionIndex}>03</span>
            <h3 id="activity-completeness-title">Kelengkapan metadata</h3>
          </div>
          <p>
            {record.missingFields.length > 0
              ? `${record.missingFields.length} bidang belum selesai`
              : "Semua bidang pada pemeriksaan ini selesai"}
          </p>
        </div>
        <p className={detail.explanation}>
          Bukti yang tersimpan internal tidak dianggap hilang. Rekam baru perlu
          dilengkapi ketika nilai atau lokasi buktinya memang belum tercatat.
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
        aria-labelledby="activity-sources-title"
        className={detail.detailSection}
      >
        <div className={detail.sectionHeading}>
          <div>
            <span className={detail.sectionIndex}>04</span>
            <h3 id="activity-sources-title">Sumber dan jejak data</h3>
          </div>
          <p>Asal-usul rekam tetap dapat diaudit</p>
        </div>
        <div className={detail.provenanceGrid}>
          {record.provenance.map((source) => (
            <article className={detail.provenanceCard} key={source.identifier}>
              <header>
                <span className={detail.sourceIcon}>
                  <NexusActivitiesIcon name="database" />
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
        aria-labelledby="activity-review-title"
        className={detail.reviewSection}
      >
        <div className={detail.sectionHeading}>
          <div>
            <span className={detail.sectionIndex}>05</span>
            <h3 id="activity-review-title">Keputusan tinjauan</h3>
          </div>
          <p>Riwayat keputusan tersimpan</p>
        </div>
        <div className={detail.reviewDecision}>
          <span className={detail.reviewCheck}>
            <NexusActivitiesIcon name="check" />
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
