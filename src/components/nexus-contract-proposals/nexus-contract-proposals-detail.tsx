"use client";

import Link from "next/link";
import {
  type ContractProposalCompletionFieldKey,
  type ContractProposalProposal,
  contractProposalDisplayTitle,
  contractProposalEvidenceLabel,
  contractProposalFieldLabels,
  contractProposalPrimaryParty,
  formatContractProposalDate,
  type OfficialContractProposalRecord,
} from "@/components/nexus-contract-proposals/nexus-contract-proposals-content";
import { NexusContractProposalIcon } from "@/components/nexus-contract-proposals/nexus-contract-proposals-icons";
import {
  type NexusMetadataCompletenessItem,
  NexusMetadataCompletenessList,
} from "@/components/nexus-metadata-completion/nexus-metadata-completeness-list";
import { NexusMetadataCompletionForm } from "@/components/nexus-metadata-completion/nexus-metadata-completion-form";
import {
  isMetadataCompletionFieldKey,
  type MetadataCompletionResolutions,
  metadataCompletionFieldState,
  metadataCompletionResolvedValue,
} from "@/components/nexus-metadata-completion/nexus-metadata-completion-model";
import badgeStyles from "@/components/nexus-workspace-ui/nexus-workspace-badges.module.css";
import detail from "@/components/nexus-workspace-ui/nexus-workspace-detail.module.css";
import { NexusWorkspaceDrawer } from "@/components/nexus-workspace-ui/nexus-workspace-drawer";

type NexusContractProposalDetailProps = {
  onClose: () => void;
  onSubmitProposal: (
    recordId: string,
    resolutions: MetadataCompletionResolutions,
    note: string,
  ) => void;
  proposal?: ContractProposalProposal;
  record: OfficialContractProposalRecord;
};

type MetadataItem = NexusMetadataCompletenessItem & {
  href?: string;
  key: string;
  label: string;
  missingFieldKey?: ContractProposalCompletionFieldKey;
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

function getMetadataItems(
  record: OfficialContractProposalRecord,
): MetadataItem[] {
  const isMissing = (key: ContractProposalCompletionFieldKey) =>
    record.missingFields.includes(key);
  const resolved = (
    key: ContractProposalCompletionFieldKey,
    fallback: string,
  ) => metadataCompletionResolvedValue(record.resolvedMetadata, key, fallback);
  const items: MetadataItem[] = [
    {
      key: "title",
      label: "Judul kontrak / proposal",
      missingFieldKey: isMissing("title") ? "title" : undefined,
      value: resolved("title", record.title || "Belum tercatat pada sumber"),
      wide: true,
    },
    {
      key: "kind",
      label: "Jenis rekam",
      value: record.kind,
    },
    {
      key: "partner",
      label: "Mitra",
      value: record.partner ?? "Tidak tercatat; bukan bidang wajib",
    },
  ];

  if (record.kind !== "Kontrak Bisnis Komersialisasi") {
    items.splice(2, 0, {
      key: "applicant",
      label: "Nama / unit terkait",
      missingFieldKey: isMissing("applicant") ? "applicant" : undefined,
      value: resolved("applicant", record.applicant || "Belum tercatat"),
    });
  }

  if (record.kind !== "Kontrak Bisnis Komersialisasi") {
    items.push({
      key: "scheme",
      label: "Skema / program",
      missingFieldKey: isMissing("scheme") ? "scheme" : undefined,
      value: resolved("scheme", record.scheme ?? "Belum tercatat"),
      wide: true,
    });
  }

  if (record.group === "Proposal") {
    items.push({
      key: "funder",
      label: "Instansi pemberi hibah",
      missingFieldKey: isMissing("funder") ? "funder" : undefined,
      value: resolved("funder", record.funder ?? "Belum tercatat"),
      wide: true,
    });
  }

  if (record.kind === "Kontrak Bisnis Komersialisasi") {
    items.push(
      {
        key: "contractStart",
        label: "Tanggal mulai kontrak",
        missingFieldKey: isMissing("contractStart")
          ? "contractStart"
          : undefined,
        value: resolved(
          "contractStart",
          formatContractProposalDate(record.contractStart),
        ),
      },
      {
        key: "contractEnd",
        label: "Tanggal selesai kontrak",
        missingFieldKey: isMissing("contractEnd") ? "contractEnd" : undefined,
        value: resolved(
          "contractEnd",
          formatContractProposalDate(record.contractEnd),
        ),
      },
    );
  }

  if (record.referenceNumber) {
    items.push({
      key: "referenceNumber",
      label: record.group === "Proposal" ? "Nomor proposal" : "Nomor kontrak",
      value: record.referenceNumber,
    });
  }

  if (record.group === "Proposal" && record.submittedOn) {
    items.push({
      key: "submittedOn",
      label: "Tanggal pengajuan",
      value: formatContractProposalDate(record.submittedOn),
    });
  }

  items.push(
    {
      href:
        record.evidenceStatus !== "internal" ? record.evidenceUrl : undefined,
      key: "evidenceUrl",
      label: "Dokumen bukti",
      missingFieldKey: isMissing("evidenceUrl") ? "evidenceUrl" : undefined,
      value: resolved("evidenceUrl", contractProposalEvidenceLabel(record)),
      wide: true,
    },
    {
      key: "evaluationPeriod",
      label: "Periode evaluasi KM",
      value: record.evaluationPeriod,
    },
  );

  items.push(
    ...(record.sourceMetadata ?? []).map((item) => ({
      ...item,
      key: `source-${item.key}`,
    })),
  );

  return items.map((item) => ({
    ...item,
    fieldState: isMetadataCompletionFieldKey(item.key)
      ? metadataCompletionFieldState(
          record.resolvedMetadata,
          item.key,
          isMissing(item.key as ContractProposalCompletionFieldKey),
        )
      : "available",
  }));
}

export function NexusContractProposalDetail({
  onClose,
  onSubmitProposal,
  proposal,
  record,
}: NexusContractProposalDetailProps) {
  const metadataItems = getMetadataItems(record);
  const displayTitle = contractProposalDisplayTitle(record);

  return (
    <NexusWorkspaceDrawer
      closeLabel="Tutup rincian kontrak atau proposal"
      description="Telusuri pihak terkait, klasifikasi KM, kelengkapan dokumen, sumber pembentuk, dan keputusan tinjauannya."
      eyebrow={record.publicId}
      onClose={onClose}
      steps={[
        { active: true, complete: true, label: "Metadata", number: 1 },
        { active: true, complete: true, label: "Sumber", number: 2 },
        { active: true, label: "Tinjauan", number: 3 },
      ]}
      title="Rincian kontrak & proposal"
    >
      <section
        aria-labelledby="contract-proposal-overview-title"
        className={detail.overview}
      >
        <div className={detail.overviewTop}>
          <div>
            <span className={badgeStyles.officialBadge}>
              <NexusContractProposalIcon name="check" />
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
        <h3 id="contract-proposal-overview-title">{displayTitle}</h3>
        <p>
          {contractProposalPrimaryParty(record)}
          {record.partner ? ` · ${record.partner}` : ""}
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
            <dd>
              {record.kmLinks.map((link) => link.indicator.id).join(", ")}
            </dd>
          </div>
        </dl>
      </section>

      {record.missingFields.length > 0 ? (
        <aside className={detail.completenessNotice}>
          <NexusContractProposalIcon name="alert" />
          <div>
            <strong>Metadata resmi masih perlu dilengkapi</strong>
            <p>
              Bidang yang belum selesai:{" "}
              {record.missingFields
                .map((field) => contractProposalFieldLabels[field])
                .join(", ")}
              .
            </p>
          </div>
        </aside>
      ) : null}

      <section
        aria-labelledby="contract-proposal-metadata-title"
        className={detail.detailSection}
      >
        <div className={detail.sectionHeading}>
          <div>
            <span className={detail.sectionIndex}>01</span>
            <h3 id="contract-proposal-metadata-title">Metadata rekam</h3>
          </div>
          <p>Bidang mengikuti jenis kontrak atau proposal</p>
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
        aria-labelledby="contract-proposal-classification-title"
        className={detail.detailSection}
      >
        <div className={detail.sectionHeading}>
          <div>
            <span className={detail.sectionIndex}>02</span>
            <h3 id="contract-proposal-classification-title">
              Klasifikasi pelaporan
            </h3>
          </div>
          <p>Keterkaitan indikator KM</p>
        </div>
        <p className={detail.explanation}>
          Proposal tetap dicatat sebagai pengajuan, sedangkan kontrak dicatat
          sebagai hubungan yang sudah terbentuk. Keduanya tidak saling
          menggantikan walaupun berasal dari program yang sama.
        </p>
        <ul className={detail.kmLinkList}>
          {record.kmLinks.map((link) => (
            <li key={link.indicator.id}>
              <strong>
                {link.indicator.id} · {link.indicator.label}
              </strong>
              <small>
                {link.indicator.category} — {link.note}
              </small>
            </li>
          ))}
        </ul>
      </section>

      <section
        aria-labelledby="contract-proposal-completeness-title"
        className={detail.detailSection}
      >
        <div className={detail.sectionHeading}>
          <div>
            <span className={detail.sectionIndex}>03</span>
            <h3 id="contract-proposal-completeness-title">
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
          Dokumen yang tersimpan internal bukan bidang yang hilang. Rekam baru
          dianggap perlu dilengkapi ketika nilai atau lokasi bukti memang belum
          tercatat pada sumber.
        </p>
        <NexusMetadataCompletenessList
          items={metadataItems}
          proposal={proposal}
        />
      </section>

      <section
        aria-labelledby="contract-proposal-sources-title"
        className={detail.detailSection}
      >
        <div className={detail.sectionHeading}>
          <div>
            <span className={detail.sectionIndex}>04</span>
            <h3 id="contract-proposal-sources-title">Sumber dan jejak data</h3>
          </div>
          <p>Asal-usul rekam tetap dapat diaudit</p>
        </div>
        <div className={detail.provenanceGrid}>
          {record.provenance.map((source) => (
            <article className={detail.provenanceCard} key={source.identifier}>
              <header>
                <span className={detail.sourceIcon}>
                  <NexusContractProposalIcon name="database" />
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
        aria-labelledby="contract-proposal-review-title"
        className={detail.reviewSection}
      >
        <div className={detail.sectionHeading}>
          <div>
            <span className={detail.sectionIndex}>05</span>
            <h3 id="contract-proposal-review-title">Keputusan tinjauan</h3>
          </div>
          <p>Riwayat keputusan tersimpan</p>
        </div>
        <div className={detail.reviewDecision}>
          <span className={detail.reviewCheck}>
            <NexusContractProposalIcon name="check" />
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
