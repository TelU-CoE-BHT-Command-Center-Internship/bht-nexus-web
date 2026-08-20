import type {
  AuditOfficialMatch,
  AuditReviewField,
  AuditReviewRecord,
} from "@/components/nexus-audit-review/nexus-audit-review-content";
import drawerStyles from "@/components/nexus-audit-review/nexus-audit-review-drawer.module.css";
import {
  type AuditRuntimeState,
  auditCurrentValue,
  auditEffectiveSubtitle,
  auditEffectiveTitle,
  auditEvaluationPeriodLabel,
  auditSourceTone,
  auditStatusLabel,
  auditStatusTone,
  type ReviewSectionIndexes,
} from "@/components/nexus-audit-review/nexus-audit-review-drawer-model";
import { auditMatchingIsCurrent } from "@/components/nexus-review-session/nexus-review-session";
import { NexusWorkspaceNotice } from "@/components/nexus-workspace-ui/nexus-workspace-elements";
import {
  formatAuditTimestamp,
  personInitials,
} from "@/components/nexus-workspace-ui/nexus-workspace-format";
import { NexusWorkspaceTableBadge } from "@/components/nexus-workspace-ui/nexus-workspace-records";

type AuditCandidateDetailsProps = {
  indexes: ReviewSectionIndexes;
  onSelectMatch: (matchId: string) => void;
  record: AuditReviewRecord;
  selectedMatch?: AuditOfficialMatch;
  state: AuditRuntimeState;
};

type SectionHeadingProps = {
  id: string;
  index: string;
  meta?: string;
  title: string;
};

const preferredWideMetadataFieldIds = new Set([
  "abstract",
  "activity_title",
  "authors",
  "description",
  "keywords",
  "summary",
  "title",
]);

function layoutMetadataFields(fields: AuditReviewField[]) {
  const layout: Array<{ field: AuditReviewField; isWide: boolean }> = [];
  let unmatchedField: (typeof layout)[number] | null = null;

  for (const field of fields) {
    const prefersWide = preferredWideMetadataFieldIds.has(field.id);

    if (prefersWide) {
      if (unmatchedField) {
        unmatchedField.isWide = true;
        unmatchedField = null;
      }

      layout.push({ field, isWide: true });
      continue;
    }

    const item = { field, isWide: false };
    layout.push(item);
    unmatchedField = unmatchedField ? null : item;
  }

  if (unmatchedField) {
    unmatchedField.isWide = true;
  }

  return layout;
}

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

function ReviewPerson({
  descriptor,
  name,
}: {
  descriptor: string;
  name: string;
}) {
  return (
    <li>
      <span aria-hidden="true" className={drawerStyles.reviewPersonFallback}>
        {personInitials(name)}
      </span>
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
      <h3 id="audit-candidate-overview-title">
        {auditEffectiveTitle(record, state)}
      </h3>
      <p>{auditEffectiveSubtitle(record, state)}</p>

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
          <dt>Periode evaluasi</dt>
          <dd>{auditEvaluationPeriodLabel(record)}</dd>
        </div>
        <div>
          <dt>Kelompok evaluasi</dt>
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
  const metadataLayout = layoutMetadataFields(fields);

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
        Bidang mengikuti jenis data dan kebutuhan evaluasinya. Ketiadaan rekam
        pembanding tidak menghilangkan kewajiban memeriksa metadata kandidat.
      </p>
      <dl className={drawerStyles.reviewMetadataGrid}>
        {metadataLayout.map(({ field: item, isWide }) => {
          const isAvailable =
            item.value.trim().length > 0 && item.value !== "—";

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

function MatchAssessment({ state }: Pick<AuditCandidateDetailsProps, "state">) {
  const leadingMatch = state.matches.toSorted(
    (first, second) => second.score - first.score,
  )[0];
  if (!leadingMatch) return null;
  if (!auditMatchingIsCurrent(state)) {
    return (
      <section className={drawerStyles.reviewAssessment} data-tone="possible">
        <div>
          <strong>V{state.version}</strong>
          <span>versi terbaru</span>
        </div>
        <div>
          <span>Pencocokan perlu diperbarui</span>
          <h3>Skor lama tidak dipakai untuk memutuskan versi terbaru</h3>
          <p>
            Perubahan kandidat sudah tercatat. Layanan pencocokan perlu
            menghitung ulang skor dan perbandingan sebelum data dihubungkan.
          </p>
        </div>
      </section>
    );
  }
  const exactIdentifier = leadingMatch.verdict === "same_identifier";

  return (
    <section
      className={drawerStyles.reviewAssessment}
      data-tone={leadingMatch.verdict}
    >
      <div>
        <strong>{leadingMatch.score}%</strong>
        <span>skor tertinggi</span>
      </div>
      <div>
        <span>{leadingMatch.verdictLabel}</span>
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
  onSelectMatch,
  record,
  selectedMatch,
  state,
}: Pick<
  AuditCandidateDetailsProps,
  "indexes" | "onSelectMatch" | "record" | "selectedMatch" | "state"
>) {
  return (
    <section
      aria-labelledby="audit-official-match-title"
      className={drawerStyles.reviewSection}
    >
      <AuditReviewSectionHeading
        id="audit-official-match-title"
        index={indexes.match}
        meta={
          state.matches.length > 0
            ? `${state.matches.length} rekam untuk diperiksa`
            : "Belum ada pembanding"
        }
        title="Rekam resmi terkait"
      />
      {state.matches.length > 0 ? (
        <div className={drawerStyles.reviewMatchList}>
          {state.matches.map((match, index) => {
            const isSelected = selectedMatch?.id === match.id;
            const exactIdentifier = match.verdict === "same_identifier";

            return (
              <label
                className={drawerStyles.reviewMatchCard}
                data-selected={isSelected || undefined}
                key={match.id}
              >
                <input
                  checked={isSelected}
                  name="audit-official-match"
                  onChange={() => onSelectMatch(match.id)}
                  type="radio"
                />
                <span className={drawerStyles.reviewRadio} />
                <span className={drawerStyles.reviewMatchRank}>
                  {index + 1}
                </span>
                <span className={drawerStyles.reviewMatchCopy}>
                  <strong>{match.title}</strong>
                  <small>
                    {match.id} · {auditEvaluationPeriodLabel(record)} · rekam
                    resmi
                  </small>
                  <em>
                    {exactIdentifier
                      ? "Pengenal identik; beberapa metadata perlu diperiksa."
                      : "Kemiripan metadata perlu diverifikasi oleh pemeriksa."}
                  </em>
                  <b>{record.sourceLabel} + BHT Nexus</b>
                </span>
                <span className={drawerStyles.reviewMatchScore}>
                  <strong>
                    {auditMatchingIsCurrent(state) ? `${match.score}%` : "—"}
                  </strong>
                  <small>
                    {auditMatchingIsCurrent(state)
                      ? match.verdictLabel
                      : "Perlu dihitung ulang"}
                  </small>
                </span>
              </label>
            );
          })}
        </div>
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
  selectedMatch,
  state,
}: AuditCandidateDetailsProps) {
  if (!selectedMatch) {
    if (state.matches.length < 2) return null;

    return (
      <section
        aria-labelledby="audit-comparison-title"
        className={drawerStyles.reviewSection}
      >
        <AuditReviewSectionHeading
          id="audit-comparison-title"
          index={indexes.comparison}
          meta="Belum ada target terpilih"
          title="Bandingkan setiap bidang"
        />
        <NexusWorkspaceNotice>
          Pilih satu rekam resmi pada bagian sebelumnya. Perbandingan bidang dan
          tindakan untuk menghubungkan data baru aktif setelah reviewer
          menentukan targetnya sendiri.
        </NexusWorkspaceNotice>
      </section>
    );
  }
  const comparisons = selectedMatch.comparisons.map((comparison) => {
    const currentValue = auditCurrentValue(record, state, comparison.fieldId);
    const normalizedCurrent = currentValue.trim().toLocaleLowerCase("id-ID");
    const normalizedOfficial = comparison.officialValue
      .trim()
      .toLocaleLowerCase("id-ID");
    const changed =
      state.correction?.fieldIds.includes(comparison.fieldId) ?? false;

    if (!normalizedCurrent) {
      return {
        ...comparison,
        candidateValue: currentValue,
        status: "missing" as const,
        statusLabel: "Belum tersedia",
      };
    }
    if (normalizedCurrent === normalizedOfficial) {
      return {
        ...comparison,
        candidateValue: currentValue,
        status: "same" as const,
        statusLabel: "Sama",
      };
    }
    if (changed) {
      return {
        ...comparison,
        candidateValue: currentValue,
        status: "different" as const,
        statusLabel: "Perlu dihitung ulang",
      };
    }
    return { ...comparison, candidateValue: currentValue };
  });
  const differentCount = comparisons.filter(
    (item) => item.status !== "same",
  ).length;
  const sameCount = comparisons.length - differentCount;

  return (
    <section
      aria-labelledby="audit-comparison-title"
      className={drawerStyles.reviewSection}
    >
      <AuditReviewSectionHeading
        id="audit-comparison-title"
        index={indexes.comparison}
        meta={`Kandidat masuk vs ${selectedMatch.id}`}
        title="Bandingkan setiap bidang"
      />
      <div className={drawerStyles.reviewComparisonSummary}>
        <strong>{differentCount} bidang berbeda atau belum tersedia</strong>
        <span>{sameCount} sama</span>
      </div>
      <div className={drawerStyles.reviewComparisonList}>
        {comparisons.map((comparison) => {
          return (
            <article key={comparison.fieldId}>
              <header>
                <h4>{comparison.label}</h4>
                <span data-tone={comparison.status}>
                  {comparison.statusLabel}
                </span>
              </header>
              <div>
                <div>
                  <span>Kandidat masuk</span>
                  <p>{comparison.candidateValue || "Belum tersedia"}</p>
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
  selectedMatch,
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
            <div>
              <dt>Diajukan oleh</dt>
              <dd>{state.latestSubmittedBy}</dd>
            </div>
          </dl>
          <p>
            {record.typeLabel} · {record.categoryLabel}
          </p>
        </article>
        <article>
          <header>
            <strong>Rekam resmi</strong>
            <span>{selectedMatch ? "BHT Nexus" : "Belum tersedia"}</span>
          </header>
          <dl>
            <div>
              <dt>Kunci rekam</dt>
              <dd>{selectedMatch?.id ?? "Belum ada"}</dd>
            </div>
            <div>
              <dt>Status</dt>
              <dd>{selectedMatch ? "Pembanding tersedia" : "Data baru"}</dd>
            </div>
          </dl>
          <p>
            {selectedMatch
              ? "Rekam resmi tidak berubah sebelum keputusan disimpan."
              : "Belum ada rekam internal yang dapat dibandingkan."}
          </p>
        </article>
      </div>

      <div className={drawerStyles.reviewEvidenceBlock}>
        <strong>Bukti yang diperiksa</strong>
        {record.evidence.length > 0 ? (
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
                {item.href ? (
                  <a href={item.href} rel="noreferrer" target="_blank">
                    Buka bukti
                  </a>
                ) : (
                  <span className={drawerStyles.reviewEvidenceUnavailable}>
                    Belum ada tautan bukti
                  </span>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <NexusWorkspaceNotice>
            Belum ada bukti yang dilampirkan pada kandidat ini.
          </NexusWorkspaceNotice>
        )}
      </div>

      <div className={drawerStyles.reviewKpiLinks}>
        {record.kpiLinks.length > 0 ? (
          record.kpiLinks.map((link) => (
            <article
              className={drawerStyles.reviewKpiCallout}
              key={link.indicator.id}
            >
              <span>
                Keterkaitan evaluasi · {link.indicator.id} ·
                {link.indicator.category}
              </span>
              <strong>{link.indicator.label}</strong>
              <p>
                <b>Bukti minimum:</b> {link.evidenceRule}
              </p>
            </article>
          ))
        ) : (
          <NexusWorkspaceNotice>
            Belum dikaitkan dengan indikator evaluasi. Kandidat tetap dapat
            ditinjau tanpa menebak klasifikasi KM yang belum didukung bukti.
          </NexusWorkspaceNotice>
        )}
      </div>

      <details className={drawerStyles.reviewProvenance}>
        <summary>Detail teknis asal data</summary>
        <dl>
          <div>
            <dt>Pekerjaan</dt>
            <dd>{record.provenance.jobId ?? "Belum tersedia"}</dd>
          </div>
          <div>
            <dt>Percobaan</dt>
            <dd>{record.provenance.attempt ?? "Belum tersedia"}</dd>
          </div>
          <div>
            <dt>Pengolah</dt>
            <dd>{record.provenance.parser ?? "Belum tersedia"}</dd>
          </div>
          <div>
            <dt>Diambil</dt>
            <dd>{record.provenance.retrievedAt ?? "Belum tersedia"}</dd>
          </div>
          <div>
            <dt>Kunci sumber</dt>
            <dd>{record.provenance.sourceKey ?? "Belum tersedia"}</dd>
          </div>
          <div>
            <dt>Sidik respons</dt>
            <dd>{record.provenance.fingerprint ?? "Belum tersedia"}</dd>
          </div>
        </dl>
      </details>

      <details className={drawerStyles.reviewHistory}>
        <summary>Riwayat dan jejak audit ({state.history.length})</summary>
        <ol>
          {state.history.map((entry) => (
            <li key={entry.id}>
              <i />
              <div>
                <strong>{entry.label}</strong>
                <span>
                  {entry.actor} · {formatAuditTimestamp(entry.occurredAt)}
                </span>
                {entry.note ? <p>{entry.note}</p> : null}
                {entry.changes?.length ? (
                  <ul>
                    {entry.changes.map((change) => {
                      const field = record.fields.find(
                        (item) => item.id === change.fieldId,
                      );
                      return (
                        <li key={`${entry.id}-${change.fieldId}`}>
                          {field?.label ?? change.fieldId}:{" "}
                          {change.before || "—"}
                          {" → "}
                          {change.after || "—"}
                        </li>
                      );
                    })}
                  </ul>
                ) : null}
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
  onSelectMatch,
  record,
  selectedMatch,
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
      <MetadataSection
        indexes={indexes}
        onSelectMatch={onSelectMatch}
        record={record}
        selectedMatch={selectedMatch}
        state={state}
      />
      <MatchAssessment state={state} />
      <OfficialMatchSection
        indexes={indexes}
        onSelectMatch={onSelectMatch}
        record={record}
        selectedMatch={selectedMatch}
        state={state}
      />
      <ComparisonSection
        indexes={indexes}
        onSelectMatch={onSelectMatch}
        record={record}
        selectedMatch={selectedMatch}
        state={state}
      />
      <RevisionSection record={record} state={state} />
      <SourceEvidenceSection
        indexes={indexes}
        onSelectMatch={onSelectMatch}
        record={record}
        selectedMatch={selectedMatch}
        state={state}
      />
    </>
  );
}
