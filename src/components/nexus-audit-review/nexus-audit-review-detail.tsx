import Image from "next/image";
import type { AuditReviewRecord } from "@/components/nexus-audit-review/nexus-audit-review-content";
import drawerStyles from "@/components/nexus-audit-review/nexus-audit-review-drawer.module.css";
import {
  type AuditRuntimeState,
  auditCurrentValue,
  auditSourceTone,
  auditStatusLabel,
  auditStatusTone,
  type ReviewSectionIndexes,
} from "@/components/nexus-audit-review/nexus-audit-review-drawer-model";
import { nexusReviewOwnerPortraits } from "@/components/nexus-review-summary/nexus-review-owner-portraits";
import { NexusWorkspaceNotice } from "@/components/nexus-workspace-ui/nexus-workspace-elements";
import { NexusWorkspaceTableBadge } from "@/components/nexus-workspace-ui/nexus-workspace-records";

type AuditCandidateDetailsProps = {
  indexes: ReviewSectionIndexes;
  record: AuditReviewRecord;
  state: AuditRuntimeState;
};

type SectionHeadingProps = {
  id: string;
  index: string;
  meta?: string;
  title: string;
};

const portraitKeyByName: Record<
  string,
  keyof typeof nexusReviewOwnerPortraits
> = {
  "Dita Puspitasari": "dita",
  "Fathur Rahman": "fathur",
  "Hesty Susanti": "hesty",
  "Laily Ade Oktaviana": "laily",
  "Muhammad Ammar Asyraf": "ammar",
  "Salsabila Aurellia": "salsabila",
  "Suksmandhira Harimurti": "suksmandhira",
};

export function AuditReviewSectionHeading({
  id,
  index,
  meta,
  title,
}: SectionHeadingProps) {
  return (
    <div className={drawerStyles.reviewSectionHeading}>
      <div>
        <span className={drawerStyles.reviewSectionIndex}>{index}</span>
        <h3 id={id}>{title}</h3>
      </div>
      {meta ? <p>{meta}</p> : null}
    </div>
  );
}

function PersonIcon() {
  return (
    <svg aria-hidden="true" fill="none" viewBox="0 0 20 20">
      <circle cx="10" cy="6.5" r="3" />
      <path d="M4.5 16.5c.5-3 2.4-4.7 5.5-4.7s5 1.7 5.5 4.7" />
    </svg>
  );
}

function ReviewPerson({
  descriptor,
  name,
}: {
  descriptor: string;
  name: string;
}) {
  const portraitKey = portraitKeyByName[name];

  return (
    <li>
      {portraitKey ? (
        <Image
          alt={`Foto ${name}`}
          className={drawerStyles.reviewPersonPortrait}
          height={32}
          sizes="2rem"
          src={nexusReviewOwnerPortraits[portraitKey]}
          width={32}
        />
      ) : (
        <span
          aria-label={`Foto ${name} belum tersedia`}
          className={drawerStyles.reviewPersonFallback}
          role="img"
        >
          <PersonIcon />
        </span>
      )}
      <div>
        <b>{name}</b>
        <small>{descriptor}</small>
      </div>
    </li>
  );
}

function EvidenceIcon() {
  return (
    <svg aria-hidden="true" fill="none" viewBox="0 0 20 20">
      <path d="M6 2.8h5.5L16 7.3v9.9H6z" />
      <path d="M11.5 2.8v4.5H16M8.5 11h5M8.5 14h3.5" />
    </svg>
  );
}

function CandidateOverview({
  record,
  state,
}: Pick<AuditCandidateDetailsProps, "record" | "state">) {
  return (
    <section
      aria-labelledby="audit-candidate-overview-title"
      className={drawerStyles.reviewOverview}
    >
      <div className={drawerStyles.reviewOverviewTop}>
        <div>
          <NexusWorkspaceTableBadge tone={auditSourceTone(record.source)}>
            {record.sourceLabel}
          </NexusWorkspaceTableBadge>
          <NexusWorkspaceTableBadge tone={auditStatusTone(state.status)}>
            {auditStatusLabel(state.status)}
          </NexusWorkspaceTableBadge>
        </div>
        <time dateTime={record.discoveredAt}>{record.discoveredAtLabel}</time>
      </div>
      <h3 id="audit-candidate-overview-title">{record.title}</h3>
      <p>{record.subtitle}</p>

      <dl className={drawerStyles.reviewOverviewMeta}>
        <div>
          <dt>Jenis data</dt>
          <dd>{record.typeLabel}</dd>
        </div>
        <div>
          <dt>Pemilik data</dt>
          <dd>{record.owner}</dd>
        </div>
        <div>
          <dt>Periode</dt>
          <dd>{record.periodLabel}</dd>
        </div>
        <div>
          <dt>Domain Excel</dt>
          <dd>{record.categoryLabel}</dd>
        </div>
      </dl>

      <div className={drawerStyles.reviewPeople}>
        <strong>Pihak terkait</strong>
        <ul>
          <ReviewPerson
            descriptor="Kandidat / pihak utama"
            name={record.primaryPerson}
          />
          <ReviewPerson descriptor="Pemilik data" name={record.owner} />
        </ul>
      </div>
    </section>
  );
}

function MetadataSection({
  indexes,
  record,
  state,
}: AuditCandidateDetailsProps) {
  const fields = record.fields.map((item) => ({
    ...item,
    value: auditCurrentValue(record, state, item.id),
  }));
  const availableCount = fields.filter(
    (item) => item.value.trim().length > 0 && item.value !== "—",
  ).length;

  return (
    <section
      aria-labelledby="audit-candidate-metadata-title"
      className={drawerStyles.reviewSection}
    >
      <AuditReviewSectionHeading
        id="audit-candidate-metadata-title"
        index={indexes.metadata}
        meta={`${availableCount} dari ${fields.length} bidang tersedia`}
        title="Metadata kandidat"
      />
      <p className={drawerStyles.reviewExplanation}>
        Bidang mengikuti jenis data pada workbook Minggu 7. Ketiadaan rekam
        pembanding tidak membuat metadata kandidat boleh dilewati.
      </p>
      <dl className={drawerStyles.reviewMetadataGrid}>
        {fields.map((item) => {
          const isAvailable =
            item.value.trim().length > 0 && item.value !== "—";
          const isWide =
            /judul|penulis|uraian|abstrak|keterangan|kegiatan|kontrak/i.test(
              item.label,
            );

          return (
            <div
              data-available={isAvailable || undefined}
              data-wide={isWide || undefined}
              key={item.id}
            >
              <dt>
                <span>{item.label}</span>
                <em>{isAvailable ? "Tersedia" : "Belum tersedia"}</em>
              </dt>
              <dd>
                {isAvailable ? item.value : "Belum tersedia dari kandidat"}
              </dd>
            </div>
          );
        })}
      </dl>
    </section>
  );
}

function MatchAssessment({
  record,
}: Pick<AuditCandidateDetailsProps, "record">) {
  if (!record.match) return null;
  const exactIdentifier = record.match.verdict === "same_identifier";

  return (
    <section
      className={drawerStyles.reviewAssessment}
      data-tone={record.match.verdict}
    >
      <div>
        <strong>{record.match.score}%</strong>
        <span>skor tertinggi</span>
      </div>
      <div>
        <span>{record.match.verdictLabel}</span>
        <h3>
          {exactIdentifier
            ? "Pengenal yang sama ditemukan pada rekam resmi"
            : "Kandidat memiliki rekam resmi yang perlu dibandingkan"}
        </h3>
        <p>
          {exactIdentifier
            ? "Periksa perbedaan metadata dan bukti sebelum menghubungkannya."
            : "Skor adalah sinyal awal; keputusan tetap berdasarkan identitas, periode, bidang, dan bukti."}
        </p>
      </div>
    </section>
  );
}

function OfficialMatchSection({
  indexes,
  record,
}: Pick<AuditCandidateDetailsProps, "indexes" | "record">) {
  const exactIdentifier = record.match?.verdict === "same_identifier";

  return (
    <section
      aria-labelledby="audit-official-match-title"
      className={drawerStyles.reviewSection}
    >
      <AuditReviewSectionHeading
        id="audit-official-match-title"
        index={indexes.match}
        meta={record.match ? "1 rekam untuk diperiksa" : "Belum ada pembanding"}
        title="Rekam resmi terkait"
      />
      {record.match ? (
        <label className={drawerStyles.reviewMatchCard} data-selected="true">
          <input checked name="audit-official-match" readOnly type="radio" />
          <span className={drawerStyles.reviewRadio} />
          <span className={drawerStyles.reviewMatchRank}>1</span>
          <span className={drawerStyles.reviewMatchCopy}>
            <strong>{record.match.title}</strong>
            <small>
              {record.match.id} · {record.periodLabel} · data resmi terpilih
            </small>
            <em>
              {exactIdentifier
                ? "Pengenal identik; beberapa metadata perlu diperiksa."
                : "Kemiripan tinggi ditemukan pada metadata utama."}
            </em>
            <b>{record.sourceLabel} + BHT Nexus</b>
          </span>
          <span className={drawerStyles.reviewMatchScore}>
            <strong>{record.match.score}%</strong>
            <small>{record.match.verdictLabel}</small>
          </span>
        </label>
      ) : (
        <NexusWorkspaceNotice>
          Belum ada rekam resmi pembanding. Bukti, periode, kepemilikan, dan
          indikator tetap wajib diverifikasi sebelum kandidat diterima sebagai
          data baru.
        </NexusWorkspaceNotice>
      )}
    </section>
  );
}

function ComparisonSection({
  indexes,
  record,
  state,
}: AuditCandidateDetailsProps) {
  if (!record.match) return null;
  const differentCount = record.match.comparisons.filter(
    (item) => item.statusLabel !== "Sama",
  ).length;
  const sameCount = record.match.comparisons.length - differentCount;

  return (
    <section
      aria-labelledby="audit-comparison-title"
      className={drawerStyles.reviewSection}
    >
      <AuditReviewSectionHeading
        id="audit-comparison-title"
        index={indexes.comparison}
        meta={`Kandidat masuk vs ${record.match.id}`}
        title="Bandingkan setiap bidang"
      />
      <div className={drawerStyles.reviewComparisonSummary}>
        <strong>{differentCount} bidang berbeda atau belum tersedia</strong>
        <span>{sameCount} sama</span>
      </div>
      <div className={drawerStyles.reviewComparisonList}>
        {record.match.comparisons.map((comparison) => {
          const same = comparison.statusLabel === "Sama";

          return (
            <article key={comparison.fieldId}>
              <header>
                <h4>{comparison.label}</h4>
                <span data-tone={same ? "same" : "different"}>
                  {comparison.statusLabel}
                </span>
              </header>
              <div>
                <div>
                  <span>Kandidat masuk</span>
                  <p>{auditCurrentValue(record, state, comparison.fieldId)}</p>
                </div>
                <div>
                  <span>Rekam resmi terpilih</span>
                  <p>{comparison.officialValue}</p>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

function RevisionSection({
  record,
  state,
}: Pick<AuditCandidateDetailsProps, "record" | "state">) {
  if (!state.correction) return null;

  return (
    <section
      aria-labelledby="audit-revision-title"
      className={drawerStyles.reviewSection}
    >
      <AuditReviewSectionHeading
        id="audit-revision-title"
        index="↺"
        meta="Sebelum dan sesudah"
        title={`Jejak perubahan versi ${state.correction.version}`}
      />
      <div className={drawerStyles.reviewDiffList}>
        {state.correction.fieldIds.map((fieldId) => {
          const item = record.fields.find(
            (candidate) => candidate.id === fieldId,
          );
          if (!item) return null;

          return (
            <article key={fieldId}>
              <strong>{item.label}</strong>
              <div>
                <span>Sebelum</span>
                <p>{state.correction?.before[fieldId] || "Belum tersedia"}</p>
              </div>
              <div>
                <span>Sesudah</span>
                <p>{state.correction?.after[fieldId] || "Dikosongkan"}</p>
              </div>
            </article>
          );
        })}
        <p className={drawerStyles.reviewDiffNote}>
          <strong>Dasar perubahan</strong>
          {state.correction.evidenceNote}
        </p>
      </div>
    </section>
  );
}

function SourceEvidenceSection({
  indexes,
  record,
  state,
}: AuditCandidateDetailsProps) {
  return (
    <section
      aria-labelledby="audit-source-title"
      className={drawerStyles.reviewSection}
    >
      <AuditReviewSectionHeading
        id="audit-source-title"
        index={indexes.source}
        meta="Bukti, indikator, dan waktu dapat diaudit"
        title="Bukti, sumber, dan keterkaitan evaluasi"
      />
      <div className={drawerStyles.reviewSourceColumns}>
        <article>
          <header>
            <strong>Kandidat masuk</strong>
            <span>{record.sourceLabel}</span>
          </header>
          <dl>
            <div>
              <dt>Diterima</dt>
              <dd>{record.discoveredAtLabel}</dd>
            </div>
            <div>
              <dt>Versi kandidat</dt>
              <dd>V{state.version}</dd>
            </div>
          </dl>
          <p>
            {record.typeLabel} · {record.categoryLabel}
          </p>
        </article>
        <article>
          <header>
            <strong>Rekam resmi</strong>
            <span>{record.match ? "BHT Nexus" : "Belum tersedia"}</span>
          </header>
          <dl>
            <div>
              <dt>Kunci rekam</dt>
              <dd>{record.match?.id ?? "Belum ada"}</dd>
            </div>
            <div>
              <dt>Status</dt>
              <dd>{record.match ? "Pembanding tersedia" : "Data baru"}</dd>
            </div>
          </dl>
          <p>
            {record.match
              ? "Rekam resmi tidak berubah sebelum keputusan disimpan."
              : "Belum ada rekam internal yang dapat dibandingkan."}
          </p>
        </article>
      </div>

      <div className={drawerStyles.reviewEvidenceBlock}>
        <strong>Bukti yang diperiksa</strong>
        <ul>
          {record.evidence.map((item) => (
            <li key={item.id}>
              <span
                aria-hidden="true"
                className={drawerStyles.reviewEvidenceIcon}
              >
                <EvidenceIcon />
              </span>
              <div>
                <b>{item.label}</b>
                <small>
                  {item.sourceLabel} · {item.reference}
                </small>
              </div>
              <a href={item.href} rel="noreferrer" target="_blank">
                Buka bukti
              </a>
            </li>
          ))}
        </ul>
      </div>

      <div className={drawerStyles.reviewKpiCallout}>
        <span>Keterkaitan evaluasi · {record.kpiCategory}</span>
        <strong>{record.kpiIndicator}</strong>
        <p>
          <b>Bukti minimum:</b> {record.kpiEvidenceRule}
        </p>
      </div>

      <details className={drawerStyles.reviewHistory}>
        <summary>Riwayat dan jejak audit ({state.history.length})</summary>
        <ol>
          {state.history.map((entry) => (
            <li key={entry.id}>
              <i />
              <div>
                <strong>{entry.label}</strong>
                <span>
                  {entry.actor} · {entry.timeLabel}
                </span>
              </div>
            </li>
          ))}
        </ol>
      </details>
    </section>
  );
}

export function AuditCandidateDetails({
  indexes,
  record,
  state,
}: AuditCandidateDetailsProps) {
  return (
    <>
      <CandidateOverview record={record} state={state} />
      {state.correction ? (
        <section className={drawerStyles.reviewRevisionBanner}>
          <span aria-hidden="true">✓</span>
          <div>
            <strong>Versi {state.correction.version} dikirim ulang</strong>
            <p>
              Perubahan kandidat menunggu verifikasi reviewer. Nilai resmi belum
              berubah sampai keputusan dikonfirmasi.
            </p>
          </div>
        </section>
      ) : null}
      <MetadataSection indexes={indexes} record={record} state={state} />
      <MatchAssessment record={record} />
      <OfficialMatchSection indexes={indexes} record={record} />
      <ComparisonSection indexes={indexes} record={record} state={state} />
      <RevisionSection record={record} state={state} />
      <SourceEvidenceSection indexes={indexes} record={record} state={state} />
    </>
  );
}
