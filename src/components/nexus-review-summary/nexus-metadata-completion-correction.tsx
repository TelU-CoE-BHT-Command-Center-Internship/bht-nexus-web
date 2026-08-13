"use client";

import { type FormEvent, useMemo, useState } from "react";
import {
  areMetadataCompletionResolutionsEqual,
  createEmptyMetadataCompletionResolution,
  metadataCompletionFieldConfigs,
  metadataCompletionResolutionLabels,
  metadataCompletionResolutionOptions,
  normalizeMetadataCompletionResolution,
} from "@/components/nexus-metadata-completion/nexus-metadata-completion-model";
import styles from "@/components/nexus-review-summary/nexus-metadata-completion.module.css";
import type {
  ReviewCandidateRow,
  ReviewCompletionFieldKey,
  ReviewCompletionResolution,
  ReviewCompletionRevisionChange,
  ReviewMetadataCompletionProposal,
} from "@/components/nexus-review-summary/nexus-review-table-content";
import { reviewCompletionFieldLabels } from "@/components/nexus-review-summary/nexus-review-table-content";
import { NexusWorkspaceDrawer } from "@/components/nexus-workspace-ui/nexus-workspace-drawer";

type NexusMetadataCompletionCorrectionProps = {
  candidate: ReviewCandidateRow;
  onClose: () => void;
  onResubmit: (
    candidateId: string,
    resolutions: ReviewMetadataCompletionProposal["resolutions"],
    sourceNote: string,
    changes: readonly ReviewCompletionRevisionChange[],
  ) => void;
};

function getResolutionDisplay(resolution?: ReviewCompletionResolution) {
  if (!resolution) return "Belum ada usulan";
  if (resolution.status === "provided") {
    return resolution.value || "Belum diisi";
  }
  return `${metadataCompletionResolutionLabels[resolution.status]} · ${resolution.reason}`;
}

export function NexusMetadataCompletionCorrection({
  candidate,
  onClose,
  onResubmit,
}: NexusMetadataCompletionCorrectionProps) {
  const proposal = candidate.completionProposal;
  const requestedFields =
    candidate.requestedCompletionFields?.length && proposal
      ? candidate.requestedCompletionFields
      : (proposal?.affectedFields ?? []);
  const [resolutions, setResolutions] = useState<
    ReviewMetadataCompletionProposal["resolutions"]
  >(() =>
    proposal
      ? Object.fromEntries(
          proposal.affectedFields.map((fieldKey) => [
            fieldKey,
            {
              ...(proposal.resolutions[fieldKey] ??
                createEmptyMetadataCompletionResolution()),
            },
          ]),
        )
      : {},
  );
  const [sourceNote, setSourceNote] = useState(proposal?.sourceNote ?? "");
  const [showConfirmation, setShowConfirmation] = useState(false);

  const normalizedResolutions = useMemo(
    () =>
      proposal
        ? (Object.fromEntries(
            proposal.affectedFields.map((fieldKey) => [
              fieldKey,
              normalizeMetadataCompletionResolution(resolutions[fieldKey]),
            ]),
          ) as ReviewMetadataCompletionProposal["resolutions"])
        : {},
    [proposal, resolutions],
  );
  const changes = useMemo(
    () =>
      proposal
        ? requestedFields.flatMap<ReviewCompletionRevisionChange>(
            (fieldKey) => {
              const previousResolution = normalizeMetadataCompletionResolution(
                proposal.resolutions[fieldKey],
              );
              const currentResolution = normalizeMetadataCompletionResolution(
                normalizedResolutions[fieldKey],
              );

              return areMetadataCompletionResolutionsEqual(
                previousResolution,
                currentResolution,
              )
                ? []
                : [
                    {
                      currentResolution,
                      key: fieldKey,
                      previousResolution,
                    },
                  ];
            },
          )
        : [],
    [normalizedResolutions, proposal, requestedFields],
  );

  if (!proposal) return null;

  const referenceFields = proposal.affectedFields.filter(
    (fieldKey) => !requestedFields.includes(fieldKey),
  );
  const normalizedSourceNote = sourceNote.trim();
  const sourceChanged = normalizedSourceNote !== proposal.sourceNote.trim();
  const allRequestedFieldsResolved = requestedFields.every((fieldKey) => {
    const resolution = normalizedResolutions[fieldKey];

    if (!resolution) return false;
    if (resolution.status === "provided") return resolution.value.length > 0;
    return resolution.reason.length >= 8;
  });
  const canPrepareResubmission =
    allRequestedFieldsResolved &&
    normalizedSourceNote.length >= 8 &&
    (changes.length > 0 || sourceChanged);

  const updateResolution = (
    fieldKey: ReviewCompletionFieldKey,
    update: Partial<ReviewCompletionResolution>,
  ) => {
    setResolutions((currentResolutions) => ({
      ...currentResolutions,
      [fieldKey]: {
        ...(currentResolutions[fieldKey] ??
          createEmptyMetadataCompletionResolution()),
        ...update,
      },
    }));
    setShowConfirmation(false);
  };

  const prepareResubmission = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canPrepareResubmission) return;
    setShowConfirmation(true);
  };

  const confirmResubmission = () => {
    if (!canPrepareResubmission) return;
    onResubmit(
      candidate.id,
      normalizedResolutions,
      normalizedSourceNote,
      changes,
    );
    onClose();
  };

  return (
    <NexusWorkspaceDrawer
      closeLabel="Tutup perbaikan usulan pelengkapan"
      description="Perbaiki hanya bagian yang dikembalikan pemeriksa, lalu kirim revisi untuk ditinjau kembali."
      eyebrow={`${proposal.id} · ${candidate.version} · ${proposal.publicationId}`}
      onClose={onClose}
      steps={[
        { active: true, complete: true, label: "Permintaan", number: 1 },
        { active: true, complete: false, label: "Perbaikan", number: 2 },
        {
          active: showConfirmation,
          complete: false,
          label: "Kirim ulang",
          number: 3,
        },
      ]}
      title="Perbaiki usulan pelengkapan"
    >
      <section className={styles.returnRequest}>
        <span className={styles.returnRequestLabel}>Permintaan pemeriksa</span>
        <h3>Usulan perlu diperbaiki sebelum keputusan dapat diberikan</h3>
        <p>{candidate.reviewerNote}</p>
        <small>
          Publikasi {proposal.publicationId} · Usulan {proposal.id}
        </small>
        <ul>
          {requestedFields.map((fieldKey) => (
            <li key={fieldKey}>{reviewCompletionFieldLabels[fieldKey]}</li>
          ))}
        </ul>
      </section>

      <section className={styles.section}>
        <header className={styles.sectionHeading}>
          <div>
            <span>01</span>
            <h3>Usulan yang dikembalikan</h3>
          </div>
          <p>Ini revisi, bukan usulan baru</p>
        </header>
        <p className={styles.sectionIntro}>
          Nilai sebelumnya tetap terlihat. Hanya bagian yang dipilih pemeriksa
          yang dapat diubah pada revisi ini.
        </p>
        <div className={styles.returnedProposalSummary}>
          {proposal.affectedFields.map((fieldKey) => (
            <article
              data-requested={requestedFields.includes(fieldKey) || undefined}
              key={fieldKey}
            >
              <div>
                <strong>{reviewCompletionFieldLabels[fieldKey]}</strong>
                <span className={styles.returnedProposalState}>
                  {requestedFields.includes(fieldKey)
                    ? "Perlu diperbaiki"
                    : "Tidak diminta berubah"}
                </span>
              </div>
              <p>{getResolutionDisplay(proposal.resolutions[fieldKey])}</p>
            </article>
          ))}
        </div>
      </section>

      <form className={styles.correctionForm} onSubmit={prepareResubmission}>
        <section className={styles.section}>
          <header className={styles.sectionHeading}>
            <div>
              <span>02</span>
              <h3>Perbaiki bagian yang diminta</h3>
            </div>
            <p>{requestedFields.length} bagian dapat diubah</p>
          </header>

          <div className={styles.correctionFields}>
            {requestedFields.map((fieldKey) => {
              const fieldConfig = metadataCompletionFieldConfigs[fieldKey];
              const resolution =
                resolutions[fieldKey] ??
                createEmptyMetadataCompletionResolution();
              const fieldId = `${candidate.id}-${fieldKey}-proposal-correction`;
              const helpId = `${fieldId}-help`;
              const reasonId = `${fieldId}-reason`;

              return (
                <fieldset key={fieldKey}>
                  <legend>{reviewCompletionFieldLabels[fieldKey]}</legend>
                  <p className={styles.previousProposalValue}>
                    <span className={styles.previousProposalLabel}>
                      Usulan sebelumnya
                    </span>
                    {getResolutionDisplay(proposal.resolutions[fieldKey])}
                  </p>

                  <div className={styles.correctionResolutionOptions}>
                    {metadataCompletionResolutionOptions.map((option) => (
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
                            updateResolution(fieldKey, {
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
                    ))}
                  </div>

                  {resolution.status === "provided" ? (
                    <label className={styles.correctionValueField}>
                      <span className={styles.correctionFieldLabel}>
                        Nilai setelah diperbaiki
                      </span>
                      <input
                        aria-describedby={helpId}
                        autoComplete="off"
                        id={fieldId}
                        maxLength={fieldKey === "publisherUrl" ? 500 : 180}
                        onChange={(event) =>
                          updateResolution(fieldKey, {
                            value: event.currentTarget.value,
                          })
                        }
                        placeholder={fieldConfig.placeholder}
                        required
                        type={fieldConfig.type}
                        value={resolution.value}
                      />
                      <small id={helpId}>{fieldConfig.help}</small>
                    </label>
                  ) : (
                    <label className={styles.correctionValueField}>
                      <span className={styles.correctionFieldLabel}>
                        Alasan pengecualian setelah diperbaiki
                      </span>
                      <textarea
                        id={reasonId}
                        maxLength={320}
                        minLength={8}
                        onChange={(event) =>
                          updateResolution(fieldKey, {
                            reason: event.currentTarget.value,
                          })
                        }
                        placeholder={
                          resolution.status === "not-available"
                            ? "Jelaskan sumber yang diperiksa dan mengapa nilai memang tidak tersedia."
                            : "Jelaskan mengapa bagian ini tidak berlaku untuk karya tersebut."
                        }
                        required
                        rows={3}
                        value={resolution.reason}
                      />
                      <small>
                        “Belum ditemukan” belum cukup. Cantumkan alasan yang
                        dapat diperiksa.
                      </small>
                    </label>
                  )}
                </fieldset>
              );
            })}
          </div>

          {referenceFields.length > 0 ? (
            <div className={styles.unchangedProposalFields}>
              <strong>Bagian lain tetap seperti usulan sebelumnya</strong>
              <dl>
                {referenceFields.map((fieldKey) => (
                  <div key={fieldKey}>
                    <dt>{reviewCompletionFieldLabels[fieldKey]}</dt>
                    <dd>
                      {getResolutionDisplay(proposal.resolutions[fieldKey])}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          ) : null}

          <label className={styles.correctionSourceField}>
            <span className={styles.correctionFieldLabel}>
              Sumber atau dasar revisi
            </span>
            <textarea
              maxLength={600}
              minLength={8}
              onChange={(event) => {
                setSourceNote(event.currentTarget.value);
                setShowConfirmation(false);
              }}
              placeholder="Cantumkan tautan, nama dokumen, atau dasar revisi yang dapat diperiksa."
              required
              rows={4}
              value={sourceNote}
            />
            <small>{sourceNote.length} / 600 karakter</small>
          </label>
        </section>

        <section className={styles.section}>
          <header className={styles.sectionHeading}>
            <div>
              <span>03</span>
              <h3>Periksa perubahan</h3>
            </div>
            <p>Sebelum dikirim ulang</p>
          </header>

          {showConfirmation ? (
            <div className={styles.resubmissionConfirmation}>
              <div className={styles.correctionChangeSummary}>
                {changes.map((change) => (
                  <article key={change.key}>
                    <h4>{reviewCompletionFieldLabels[change.key]}</h4>
                    <dl>
                      <div>
                        <dt>Sebelumnya</dt>
                        <dd>
                          {getResolutionDisplay(change.previousResolution)}
                        </dd>
                      </div>
                      <div>
                        <dt>Setelah diperbaiki</dt>
                        <dd>
                          {getResolutionDisplay(change.currentResolution)}
                        </dd>
                      </div>
                    </dl>
                  </article>
                ))}
                {sourceChanged ? (
                  <article>
                    <h4>Sumber atau dasar</h4>
                    <dl>
                      <div>
                        <dt>Sebelumnya</dt>
                        <dd>{proposal.sourceNote}</dd>
                      </div>
                      <div>
                        <dt>Setelah diperbaiki</dt>
                        <dd>{normalizedSourceNote}</dd>
                      </div>
                    </dl>
                  </article>
                ) : null}
              </div>
              <div className={styles.resubmissionActions}>
                <div>
                  <strong>Kirim ulang revisi ini?</strong>
                  <p>
                    Proposal yang sama kembali ke Menunggu Tinjauan sebagai{" "}
                    {`v${Number.parseInt(candidate.version.replace(/^v/, ""), 10) + 1 || 2}`}
                    . Data resmi belum berubah.
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
                    onClick={confirmResubmission}
                    type="button"
                  >
                    Ya, kirim ulang
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className={styles.resubmissionReady}>
              <p>
                Nilai lama, hasil revisi, dan sumber akan ditampilkan kepada
                pemeriksa. Data resmi tetap aman sampai revisi disetujui.
              </p>
              <button
                className={styles.primaryButton}
                disabled={!canPrepareResubmission}
                type="submit"
              >
                Periksa sebelum kirim
              </button>
            </div>
          )}
        </section>
      </form>
    </NexusWorkspaceDrawer>
  );
}
