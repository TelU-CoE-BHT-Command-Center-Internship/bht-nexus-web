"use client";

import Link from "next/link";
import { type FormEvent, useMemo, useState } from "react";
import styles from "@/components/nexus-metadata-completion/nexus-metadata-completion-form.module.css";
import {
  createEmptyMetadataCompletionResolution,
  type MetadataCompletionFieldKey,
  type MetadataCompletionProposal,
  type MetadataCompletionResolution,
  type MetadataCompletionResolutions,
  metadataCompletionFieldConfigs,
  metadataCompletionFieldLabels,
  metadataCompletionResolutionChoices,
  metadataCompletionResolutionSetErrors,
  metadataCompletionValueError,
  normalizeMetadataCompletionResolution,
} from "@/components/nexus-metadata-completion/nexus-metadata-completion-model";
import {
  initialAuditRuntimeState,
  useOptionalNexusReviewSession,
} from "@/components/nexus-review-session/nexus-review-session";

type NexusMetadataCompletionFormProps = {
  /** Nomor urut seksi pada drawer tempat form ini dipasang. */
  sectionIndex: string;
  missingFields: readonly MetadataCompletionFieldKey[];
  onClose: () => void;
  onSubmitProposal: (
    recordId: string,
    resolutions: MetadataCompletionResolutions,
    note: string,
  ) => void;
  proposal?: MetadataCompletionProposal;
  recordId: string;
};

function getResolutionResult(resolution: MetadataCompletionResolution) {
  if (resolution.status === "provided") return resolution.value;
  if (resolution.status === "not-available") {
    return `Memang tidak tersedia · ${resolution.reason}`;
  }
  return `Tidak berlaku · ${resolution.reason}`;
}

function getEffectiveResolutionResult(
  proposal: MetadataCompletionProposal,
  key: MetadataCompletionFieldKey,
  correctedResolutions?: MetadataCompletionResolutions,
) {
  const correctedResolution = correctedResolutions?.[key];
  if (correctedResolution) return getResolutionResult(correctedResolution);

  const resolution = proposal.resolutions[key];
  return resolution ? getResolutionResult(resolution) : "Belum tersedia";
}

function SuccessIcon() {
  return (
    <svg aria-hidden="true" fill="none" viewBox="0 0 24 24">
      <path d="m5 12.5 4.2 4L19 7" />
    </svg>
  );
}

export function NexusMetadataCompletionForm({
  sectionIndex,
  missingFields,
  onClose,
  onSubmitProposal,
  proposal,
  recordId,
}: NexusMetadataCompletionFormProps) {
  const reviewSession = useOptionalNexusReviewSession();
  const [resolutions, setResolutions] = useState<MetadataCompletionResolutions>(
    () =>
      Object.fromEntries(
        missingFields.map((key) => [
          key,
          createEmptyMetadataCompletionResolution(),
        ]),
      ) as MetadataCompletionResolutions,
  );
  const [sourceNote, setSourceNote] = useState("");
  const [showConfirmation, setShowConfirmation] = useState(false);
  const fields = missingFields.map(
    (key) => metadataCompletionFieldConfigs[key],
  );
  const normalizedResolutions = useMemo(
    () =>
      Object.fromEntries(
        missingFields.map((key) => [
          key,
          normalizeMetadataCompletionResolution(key, resolutions[key]),
        ]),
      ) as MetadataCompletionResolutions,
    [missingFields, resolutions],
  );
  /** Kesalahan per bidang, hanya untuk nilai yang benar-benar diisi. */
  const fieldErrors = Object.fromEntries(
    missingFields.flatMap((key) => {
      const resolution = normalizedResolutions[key];

      if (!resolution || resolution.status !== "provided") return [];
      if (resolution.value.length === 0) return [];

      const error = metadataCompletionValueError(key, resolution.value);

      return error ? [[key, error] as const] : [];
    }),
  ) as Partial<Record<MetadataCompletionFieldKey, string>>;
  Object.assign(
    fieldErrors,
    metadataCompletionResolutionSetErrors(normalizedResolutions),
  );
  const allFieldsResolved = missingFields.every((key) => {
    const resolution = normalizedResolutions[key];

    if (!resolution) return false;
    if (resolution.status === "provided") {
      return (
        resolution.value.length > 0 &&
        metadataCompletionValueError(key, resolution.value) === null
      );
    }
    return resolution.reason.length >= 8;
  });
  const canPrepareSubmission =
    allFieldsResolved &&
    !Object.values(fieldErrors).some(Boolean) &&
    sourceNote.trim().length >= 8;
  const reviewRecord = proposal
    ? reviewSession?.records.find((record) => record.id === proposal.id)
    : undefined;
  const reviewState = reviewRecord
    ? (reviewSession?.runtimeByRecordId[reviewRecord.id] ??
      initialAuditRuntimeState(reviewRecord))
    : undefined;

  const updateResolution = (
    key: MetadataCompletionFieldKey,
    update: Partial<MetadataCompletionResolution>,
  ) => {
    setResolutions((currentResolutions) => ({
      ...currentResolutions,
      [key]: {
        ...(currentResolutions[key] ??
          createEmptyMetadataCompletionResolution()),
        ...update,
      },
    }));
    setShowConfirmation(false);
  };

  const prepareSubmission = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canPrepareSubmission) return;
    setShowConfirmation(true);
  };

  const confirmSubmission = () => {
    if (!canPrepareSubmission) return;
    onSubmitProposal(recordId, normalizedResolutions, sourceNote.trim());
  };

  const beginReplacementProposal = () => {
    if (!reviewSession) return;
    setResolutions(
      Object.fromEntries(
        missingFields.map((key) => [
          key,
          createEmptyMetadataCompletionResolution(),
        ]),
      ) as MetadataCompletionResolutions,
    );
    setSourceNote("");
    setShowConfirmation(false);
    reviewSession.clearCompletionProposal(recordId);
  };

  if (proposal) {
    const resultStatus =
      reviewState?.status === "completed"
        ? "Selesai Ditinjau"
        : reviewState?.status === "needs_fix"
          ? "Perlu Perbaikan"
          : "Menunggu Tinjauan";
    const resultTitle =
      reviewState?.status === "completed"
        ? "Usulan pelengkapan metadata selesai ditinjau"
        : reviewState?.status === "needs_fix"
          ? "Usulan pelengkapan metadata perlu diperbaiki"
          : "Usulan pelengkapan metadata sudah dikirim";
    const resultDescription =
      reviewState?.status === "completed"
        ? "Keputusan pemeriksa sudah tercatat pada sesi ini. Riwayat, sumber, dan versi usulan tetap dapat dilihat di Tinjauan."
        : reviewState?.status === "needs_fix"
          ? "Pemeriksa meminta perbaikan. Data resmi belum berubah dan rincian bidang yang perlu diperbaiki tersedia di Tinjauan."
          : "Data resmi belum ditimpa. Status rekam tetap Perlu dilengkapi sampai pemeriksa menyetujui usulan dan memastikan seluruh bidang yang perlu diperiksa sudah diselesaikan.";
    const canCreateReplacement = Boolean(
      reviewSession &&
        reviewState?.status === "completed" &&
        reviewState.decision?.kind === "rejected",
    );

    return (
      <section
        aria-labelledby="completion-proposal-result-title"
        className={styles.result}
      >
        <div className={styles.resultIcon}>
          <SuccessIcon />
        </div>
        <div className={styles.resultCopy}>
          <span className={styles.resultStatus}>{resultStatus}</span>
          <h3 id="completion-proposal-result-title">{resultTitle}</h3>
          <p>{resultDescription}</p>
          <dl>
            <div>
              <dt>ID usulan</dt>
              <dd>{proposal.id}</dd>
            </div>
            <div>
              <dt>Diajukan oleh</dt>
              <dd>{proposal.submittedBy}</dd>
            </div>
            {missingFields.map((key) => (
              <div key={key}>
                <dt>{metadataCompletionFieldLabels[key]}</dt>
                <dd>
                  {getEffectiveResolutionResult(
                    proposal,
                    key,
                    reviewState?.correction?.resolutions,
                  )}
                </dd>
              </div>
            ))}
            <div className={styles.resultNote}>
              <dt>
                {reviewState?.correction
                  ? "Dasar perubahan terbaru"
                  : "Dasar perubahan"}
              </dt>
              <dd>{reviewState?.correction?.evidenceNote ?? proposal.note}</dd>
            </div>
            {reviewState?.decision ? (
              <div className={styles.resultNote}>
                <dt>Keputusan pemeriksa</dt>
                <dd>
                  {reviewState.decision.label} · {reviewState.decision.note}
                </dd>
              </div>
            ) : null}
            {reviewState?.fixRequest ? (
              <div className={styles.resultNote}>
                <dt>Permintaan perbaikan</dt>
                <dd>{reviewState.fixRequest.reason}</dd>
              </div>
            ) : null}
          </dl>
          <p className={styles.resultFinish}>
            {reviewState?.status === "waiting" || !reviewState
              ? "Pekerjaan pengusul selesai untuk saat ini. Usulan tidak perlu dikirim kembali selama masih menunggu tinjauan."
              : "Buka rincian Tinjauan untuk melihat keputusan, bidang terkait, dan jejak pemeriksaannya."}
          </p>
          <div className={styles.resultActions}>
            {canCreateReplacement ? (
              <button onClick={beginReplacementProposal} type="button">
                Buat usulan baru
              </button>
            ) : null}
            <Link
              href={`/nexus/tinjauan?record=${proposal.id}`}
              prefetch={false}
            >
              {reviewState?.status === "waiting" || !reviewState
                ? "Buka di Tinjauan"
                : "Lihat status di Tinjauan"}
            </Link>
            <button onClick={onClose} type="button">
              Tutup rincian
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      aria-labelledby="completion-proposal-title"
      className={styles.section}
    >
      <header className={styles.heading}>
        <div>
          <span className={styles.headingIndex}>{sectionIndex}</span>
          <h3 id="completion-proposal-title">Ajukan pelengkapan metadata</h3>
        </div>
        <p>{missingFields.length} bidang perlu diselesaikan</p>
      </header>

      <div className={styles.explanation}>
        <strong>Perubahan tidak langsung menjadi data resmi</strong>
        <p>
          Isi nilai berdasarkan sumber yang dapat diperiksa. Jika nilai memang
          tidak tersedia atau bidang tidak berlaku, ajukan pengecualian beserta
          alasan dan sumbernya. Keduanya tetap harus ditinjau sebelum rekam
          resmi dinyatakan lengkap.
        </p>
      </div>

      <form className={styles.form} onSubmit={prepareSubmission}>
        <div className={styles.fieldGrid}>
          {fields.map((field) => {
            const fieldId = `${recordId}-${field.key}-completion`;
            const helpId = `${fieldId}-help`;
            const reasonId = `${fieldId}-reason`;
            const resolution =
              resolutions[field.key] ??
              createEmptyMetadataCompletionResolution();
            const fieldError = fieldErrors[field.key];

            return (
              <fieldset className={styles.resolutionField} key={field.key}>
                <legend>
                  {metadataCompletionFieldLabels[field.key]}{" "}
                  <em>perlu diselesaikan</em>
                </legend>

                <div className={styles.resolutionOptions}>
                  {metadataCompletionResolutionChoices(field.key).map(
                    (option) => (
                      <label
                        data-selected={
                          resolution.status === option.status || undefined
                        }
                        key={option.status}
                      >
                        <input
                          checked={resolution.status === option.status}
                          name={`${fieldId}-status`}
                          onChange={() =>
                            updateResolution(field.key, {
                              reason: "",
                              status: option.status,
                              value: "",
                            })
                          }
                          type="radio"
                          value={option.status}
                        />
                        <span>
                          <strong>{option.label}</strong>
                          <small>{option.description}</small>
                        </span>
                      </label>
                    ),
                  )}
                </div>

                {resolution.status === "provided" ? (
                  <label className={styles.valueField} htmlFor={fieldId}>
                    <span>Nilai yang diajukan</span>
                    {field.type === "choice" ? (
                      <select
                        aria-describedby={helpId}
                        id={fieldId}
                        onChange={(event) =>
                          updateResolution(field.key, {
                            value: event.currentTarget.value,
                          })
                        }
                        required
                        value={resolution.value}
                      >
                        <option value="">{field.placeholder}</option>
                        {field.choices?.map((choice) => (
                          <option key={choice} value={choice}>
                            {choice}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        aria-describedby={
                          fieldError ? `${fieldId}-error` : helpId
                        }
                        aria-invalid={fieldError ? true : undefined}
                        autoComplete="off"
                        id={fieldId}
                        inputMode={field.inputMode}
                        maxLength={
                          field.maxLength ?? (field.type === "url" ? 500 : 300)
                        }
                        onChange={(event) =>
                          updateResolution(field.key, {
                            value: event.currentTarget.value,
                          })
                        }
                        placeholder={field.placeholder}
                        required
                        type={field.type}
                        value={resolution.value}
                      />
                    )}
                    {fieldError ? (
                      <small
                        className={styles.fieldError}
                        id={`${fieldId}-error`}
                        role="alert"
                      >
                        {fieldError}
                      </small>
                    ) : (
                      <small id={helpId}>{field.help}</small>
                    )}
                  </label>
                ) : (
                  <label className={styles.valueField} htmlFor={reasonId}>
                    <span>Alasan pengecualian</span>
                    <textarea
                      id={reasonId}
                      maxLength={320}
                      minLength={8}
                      onChange={(event) =>
                        updateResolution(field.key, {
                          reason: event.currentTarget.value,
                        })
                      }
                      placeholder={
                        resolution.status === "not-available"
                          ? "Jelaskan sumber yang sudah diperiksa dan mengapa nilai memang tidak tersedia."
                          : "Jelaskan mengapa bidang ini tidak berlaku untuk karya tersebut."
                      }
                      required
                      rows={3}
                      value={resolution.reason}
                    />
                    <small>
                      “Belum ditemukan” belum cukup untuk pengecualian. Jelaskan
                      bukti yang menunjukkan nilai memang tidak tersedia atau
                      bidang tidak berlaku.
                    </small>
                  </label>
                )}
              </fieldset>
            );
          })}
        </div>

        <label className={styles.sourceField}>
          <span className={styles.fieldLabel}>
            Sumber atau dasar perubahan <em>wajib</em>
          </span>
          <textarea
            maxLength={600}
            minLength={8}
            onChange={(event) => {
              setSourceNote(event.currentTarget.value);
              setShowConfirmation(false);
            }}
            placeholder="Contoh: Nilai diperiksa pada dokumen sumber berikut dan sesuai dengan berkas aslinya: …"
            required
            rows={4}
            value={sourceNote}
          />
          <small>
            Cantumkan tautan, nama dokumen, atau alasan yang dapat diperiksa ·{" "}
            {sourceNote.length} / 600 karakter
          </small>
        </label>

        {showConfirmation ? (
          <div aria-live="polite" className={styles.confirmation}>
            <div>
              <strong>Kirim usulan pelengkapan metadata?</strong>
              <p>
                Usulan akan menunggu pemeriksa. Nilai atau pengecualian yang
                diajukan belum mengubah data resmi maupun status kelengkapannya.
              </p>
            </div>
            <div>
              <button
                className={styles.secondaryButton}
                onClick={() => setShowConfirmation(false)}
                type="button"
              >
                Kembali periksa
              </button>
              <button
                className={styles.primaryButton}
                onClick={confirmSubmission}
                type="button"
              >
                Ya, kirim usulan
              </button>
            </div>
          </div>
        ) : (
          <div className={styles.submitRow}>
            <p>
              Semua nilai dan dasar perubahan akan ditampilkan kepada pemeriksa
              sebelum keputusan.
            </p>
            <button
              className={styles.primaryButton}
              disabled={!canPrepareSubmission}
              type="submit"
            >
              Periksa sebelum kirim
            </button>
          </div>
        )}
      </form>
    </section>
  );
}
