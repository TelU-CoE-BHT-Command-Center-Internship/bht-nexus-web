"use client";

import Link from "next/link";
import { type FormEvent, useMemo, useState } from "react";
import {
  createEmptyMetadataCompletionResolution,
  metadataCompletionFieldConfigs,
  metadataCompletionResolutionChoices,
  metadataCompletionValueError,
} from "@/components/nexus-metadata-completion/nexus-metadata-completion-model";
import styles from "@/components/nexus-publications/nexus-publication-completion-form.module.css";
import type {
  OfficialPublication,
  PublicationCompletionFieldKey,
  PublicationCompletionResolution,
  PublicationCompletionResolutions,
  PublicationMetadataProposal,
} from "@/components/nexus-publications/nexus-publications-content";
import { publicationCompletionFieldLabels } from "@/components/nexus-publications/nexus-publications-content";

type NexusPublicationCompletionFormProps = {
  onClose: () => void;
  onSubmitProposal: (
    publicationId: string,
    resolutions: PublicationCompletionResolutions,
    note: string,
  ) => void;
  proposal?: PublicationMetadataProposal;
  publication: OfficialPublication;
};

function getResolutionResult(resolution: PublicationCompletionResolution) {
  if (resolution.status === "provided") return resolution.value;
  if (resolution.status === "not-available") {
    return `Memang tidak tersedia · ${resolution.reason}`;
  }
  return `Tidak berlaku · ${resolution.reason}`;
}

function SuccessIcon() {
  return (
    <svg aria-hidden="true" fill="none" viewBox="0 0 24 24">
      <path d="m5 12.5 4.2 4L19 7" />
    </svg>
  );
}

export function NexusPublicationCompletionForm({
  onClose,
  onSubmitProposal,
  proposal,
  publication,
}: NexusPublicationCompletionFormProps) {
  const [resolutions, setResolutions] =
    useState<PublicationCompletionResolutions>(
      () =>
        Object.fromEntries(
          publication.missingFields.map((key) => [
            key,
            createEmptyMetadataCompletionResolution(),
          ]),
        ) as PublicationCompletionResolutions,
    );
  const [sourceNote, setSourceNote] = useState("");
  const [showConfirmation, setShowConfirmation] = useState(false);
  const fields = publication.missingFields.map(
    (key) => metadataCompletionFieldConfigs[key],
  );
  const normalizedResolutions = useMemo(
    () =>
      Object.fromEntries(
        publication.missingFields.map((key) => [
          key,
          {
            reason: resolutions[key]?.reason.trim() ?? "",
            status: resolutions[key]?.status ?? "provided",
            value: resolutions[key]?.value.trim() ?? "",
          },
        ]),
      ) as PublicationCompletionResolutions,
    [publication.missingFields, resolutions],
  );
  /** Kesalahan per bidang, hanya untuk nilai yang benar-benar diisi. */
  const fieldErrors = Object.fromEntries(
    publication.missingFields.flatMap((key) => {
      const resolution = normalizedResolutions[key];

      if (!resolution || resolution.status !== "provided") return [];
      if (resolution.value.length === 0) return [];

      const error = metadataCompletionValueError(key, resolution.value);

      return error ? [[key, error] as const] : [];
    }),
  ) as Partial<Record<PublicationCompletionFieldKey, string>>;
  const allFieldsResolved = publication.missingFields.every((key) => {
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
    allFieldsResolved && sourceNote.trim().length >= 8;

  const updateResolution = (
    key: PublicationCompletionFieldKey,
    update: Partial<PublicationCompletionResolution>,
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
    onSubmitProposal(publication.id, normalizedResolutions, sourceNote.trim());
  };

  if (proposal) {
    return (
      <section
        aria-labelledby="completion-proposal-result-title"
        className={styles.result}
      >
        <div className={styles.resultIcon}>
          <SuccessIcon />
        </div>
        <div className={styles.resultCopy}>
          <span className={styles.resultStatus}>Menunggu Tinjauan</span>
          <h3 id="completion-proposal-result-title">
            Usulan pelengkapan metadata sudah dikirim
          </h3>
          <p>
            Data resmi belum ditimpa. Status publikasi tetap Perlu dilengkapi
            sampai pemeriksa menyetujui usulan dan memastikan seluruh bidang
            yang perlu diperiksa sudah diselesaikan.
          </p>
          <dl>
            <div>
              <dt>ID usulan</dt>
              <dd>{proposal.id}</dd>
            </div>
            <div>
              <dt>Diajukan oleh</dt>
              <dd>{proposal.submittedBy}</dd>
            </div>
            {publication.missingFields.map((key) => (
              <div key={key}>
                <dt>{publicationCompletionFieldLabels[key]}</dt>
                <dd>
                  {proposal.resolutions[key]
                    ? getResolutionResult(proposal.resolutions[key])
                    : "Belum tersedia"}
                </dd>
              </div>
            ))}
            <div className={styles.resultNote}>
              <dt>Dasar perubahan</dt>
              <dd>{proposal.note}</dd>
            </div>
          </dl>
          <p className={styles.resultFinish}>
            Pekerjaan pengusul selesai untuk saat ini. Usulan tidak perlu
            dikirim kembali selama masih menunggu tinjauan.
          </p>
          <div className={styles.resultActions}>
            <Link
              href={`/nexus/tinjauan?record=${proposal.id}`}
              prefetch={false}
            >
              Buka di Tinjauan
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
          <span className={styles.headingIndex}>06</span>
          <h3 id="completion-proposal-title">Ajukan pelengkapan metadata</h3>
        </div>
        <p>{publication.missingFields.length} bidang perlu diselesaikan</p>
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
            const fieldId = `${publication.id}-${field.key}-completion`;
            const helpId = `${fieldId}-help`;
            const reasonId = `${fieldId}-reason`;
            const resolution =
              resolutions[field.key] ??
              createEmptyMetadataCompletionResolution();
            const fieldError = fieldErrors[field.key];

            return (
              <fieldset className={styles.resolutionField} key={field.key}>
                <legend>
                  {publicationCompletionFieldLabels[field.key]}{" "}
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
                          field.maxLength ??
                          (field.key === "publisherUrl" ? 500 : 300)
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
            placeholder="Contoh: Nilai diperiksa pada halaman penerbit berikut dan sesuai dengan PDF artikel: …"
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
